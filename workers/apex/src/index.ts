import { loadManifest, buildDispatch } from "./manifest";
import { resolveVersion, bindingGuard } from "./dispatch";
import { redirectFor } from "./redirects";
import { specialPathFor } from "./special";
import { uaVerdict } from "./uagate";
import policy from "../ua-policy.json";

export interface ApexEnv extends Record<string, unknown> {
  ASSETS: Fetcher;
  APEX_BUILD_SHA: string;
  DOCS_ENV: "production" | "canary";
  DOCS_KB?: Fetcher;
  // §5 apex PDF fallback — R2 bucket holding oversized legacy PDFs excluded from the
  // content Worker's own asset tree (currently just the 1.3 PDF). Optional so the
  // binding-guard path (503, not a crash) exercises on envs that omit it.
  DOCS_PDFS?: R2Bucket;
}

const manifest = loadManifest();
const dispatch = buildDispatch(manifest);

// Security headers only — safe on content pass-through (never touches
// Cache-Control or X-Docs-Build, which the content Worker owns).
function securityHeaders(resp: Response): Response {
  const out = new Response(resp.body, resp);
  out.headers.set("X-Content-Type-Options", "nosniff");
  out.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  out.headers.set("Content-Security-Policy-Report-Only", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'");
  return out;
}

const DEFAULT_CACHE_CLASS = "public, max-age=0, s-maxage=300, must-revalidate";

function apexHeaders(resp: Response, env: ApexEnv, cacheClass: string = DEFAULT_CACHE_CLASS): Response {
  const out = securityHeaders(resp);
  out.headers.set("X-Apex-Build", env.APEX_BUILD_SHA);
  // §3.3 cache contract applies to apex-owned responses too. Error responses (4xx/5xx)
  // must never carry the s-maxage cache class — the cache key excludes User-Agent, so a
  // cached UA-gate 403 or themed 404/503 would poison the edge for every visitor for the
  // full s-maxage window. Mirrors the branch worker's withDocsHeaders() precedence.
  // `cacheClass` lets a specific caller (e.g. the §5 PDF R2 fallback) apply a
  // differently-classed success cache-control; canary/error still always win.
  out.headers.set(
    "Cache-Control",
    env.DOCS_ENV === "canary" || out.status >= 400 ? "no-store" : cacheClass,
  );
  return out;
}

// R2's `R2Range` is a three-shape union — `{offset, length?}`, `{length}` (offset implicitly 0)
// and `{suffix}` (the trailing N bytes) — so `"offset" in range` is NOT a safe way to read it:
// the two offset-less shapes would fall through to the full-object 200 branch and be served
// with a Content-Length claiming the whole object while the body held only a slice. workerd is
// observed to normalize every shape to `{offset, length}` before it reaches us, but the type
// admits the others, so resolve all three to concrete byte bounds, clamped to the object size.
// Exported for direct unit testing.
export function resolveRange(
  range: { offset?: number; length?: number; suffix?: number },
  size: number,
): { start: number; length: number } {
  if (typeof range.suffix === "number") {
    const suffix = Math.min(Math.max(range.suffix, 0), size); // a suffix past the start is the whole object
    return { start: size - suffix, length: suffix };
  }
  const start = Math.min(Math.max(range.offset ?? 0, 0), size);
  // The trailing Math.max(_, 0) keeps the documented "clamped to the object size" contract
  // total: without it a negative `range.length` would pass straight through Math.min and
  // yield a negative length (and so a negative Content-Length). A real R2 binding cannot
  // produce that — see classifyRangeHeader's note on observed R2 behaviour — but this
  // function is exported and unit-tested as a standalone utility over the R2Range union, so
  // it should not have a documented invariant its own signature can violate. Deliberately
  // NOT guarding non-finite inputs: NaN bounds are unreachable from the binding and the
  // guard would be untestable-in-anger dead weight.
  const length = Math.max(Math.min(range.length ?? size - start, size - start), 0);
  return { start, length };
}

// A single `bytes=` range-spec, tolerating the case/whitespace variation R2 itself tolerates
// (verified: "BYTES=0-5" and "bytes = 0-5" are both honoured). Anything with a comma is a
// multi-range and deliberately fails to match.
const SINGLE_BYTE_RANGE = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i;

export type RangeIntent = "unsatisfiable" | "single" | "ignored";

/**
 * What the client's Range header ASKS FOR, judged against the representation length.
 *
 * This exists because R2 does not tell us. Probed against a real R2 binding under
 * vitest-pool-workers, `get(key, {range: <Headers>})` signals "I ignored your Range" by
 * returning the WHOLE object with `range = {offset: 0, length: size}` — the byte-for-byte
 * same shape it returns for a legitimately-satisfied whole-object range like `bytes=0-`.
 * It does this for every unsatisfiable spec (`bytes=10-` / `bytes=99-` / `bytes=-0` on a
 * 10-byte object), every malformed one (`bytes=abc`, `bytes=-`, `bytes=5-2`), multi-ranges
 * (`bytes=0-1,4-5`) and unknown units (`items=0-5`). It does NOT throw for any of them and
 * it never returns a zero/negative length except for a genuinely zero-length object.
 * (The object-literal form `get(key, {range: {offset: 99}})` DOES throw
 * "The requested range is not satisfiable (10039)" — but this Worker passes Headers, so
 * that path is unreachable here.)
 *
 * Trusting `obj.range` alone therefore answered `Range: bytes=99-` with
 * `206 + Content-Range: bytes 0-9/10` and the FULL body — a 206 that does not correspond to
 * the request (RFC 9110 §15.3.7). That is actively dangerous for the resuming downloader
 * this range forwarding exists to serve: a client resuming at byte 99 would append bytes
 * 0-9 to its partial file and silently corrupt it. Re-deriving intent from the client's own
 * header is the only way to separate the three cases.
 *
 * Satisfiability follows RFC 9110 §14.1.2 verbatim: an int-range is satisfiable iff
 * first-pos < length; a suffix-range iff suffix-length is non-zero (so on a zero-length
 * representation, a non-zero suffix-range is the ONLY satisfiable form). An invalid spec
 * (last-pos < first-pos) MUST be ignored rather than rejected, hence "ignored", not
 * "unsatisfiable".
 */
export function classifyRangeHeader(header: string, size: number): RangeIntent {
  const m = SINGLE_BYTE_RANGE.exec(header);
  if (!m) return "ignored"; // multi-range, unknown unit, or unparseable — R2 ignored it
  const [, firstRaw, lastRaw] = m;
  if (firstRaw === "") {
    if (lastRaw === "") return "ignored"; // bare "bytes=-" is malformed, not a suffix-range
    return Number(lastRaw) > 0 ? "single" : "unsatisfiable"; // §14.1.2: suffix-length 0 is unsatisfiable
  }
  const first = Number(firstRaw);
  if (lastRaw !== "" && Number(lastRaw) < first) return "ignored"; // §14.1.2: invalid spec → ignore Range
  return first < size ? "single" : "unsatisfiable";
}

async function themed(env: ApexEnv, status: 404 | 503): Promise<Response> {
  const page = await env.ASSETS.fetch(new Request(`https://apex.internal/${status}.html`));
  return apexHeaders(new Response(page.body, { status, headers: { "content-type": "text/html; charset=utf-8" } }), env);
}

export default {
  async fetch(request: Request, env: ApexEnv): Promise<Response> {
    const url = new URL(request.url);

    // 1. UA gate — production only (§3.2.1)
    if (env.DOCS_ENV === "production") {
      const v = uaVerdict(request.headers.get("user-agent") ?? "", policy);
      if (v === "block") return apexHeaders(new Response("Forbidden", { status: 403 }), env);
      if (v === "log") console.log(JSON.stringify({ event: "ua-log", ua: request.headers.get("user-agent"), path: url.pathname }));
    }

    // 2. Special paths (§3.2.2)
    const special = await specialPathFor(request, manifest, env as never);
    if (special) return apexHeaders(special, env);

    // 2b. Legacy PDF R2 fallback (spec §5) — the 1.3 PDF (29.2 MiB) exceeds the 25 MiB
    // static-asset cap and is excluded from the content Worker's own build. MUST run
    // before version dispatch (step 6): the legacy Worker's asset tree lacks this file,
    // so unconditional dispatch would 404 on the exact path the PDF 301 (§3.2.4) targets.
    const pdfVersion = manifest.versions.find((v) => v.pdf_r2_key && v.pdf === url.pathname);
    if (pdfVersion) {
      const bucket = env.DOCS_PDFS;
      if (!bucket) {
        console.log(JSON.stringify({ event: "binding-missing", binding: "DOCS_PDFS" }));
        return themed(env, 503);
      }
      let raw: R2ObjectBody | R2Object | null;
      try {
        // Forward Range + conditional (If-None-Match/If-Match/If-Modified-Since) headers
        // straight through to R2 so a resumed download or a client with a fresh cached
        // copy doesn't have to re-pull the full 29.2 MiB object.
        raw = await bucket.get(pdfVersion.pdf_r2_key!, {
          range: request.headers,
          onlyIf: request.headers,
        });
      } catch (e) {
        console.log(JSON.stringify({ event: "binding-error", binding: "DOCS_PDFS", error: String(e) }));
        return themed(env, 503);
      }
      if (!raw) return themed(env, 404);

      // Distinct (longer) cache class from apex's default control-response class — this
      // is effectively content, just not content the legacy content Worker can serve.
      // 304/206 are both <400 so apexHeaders() still applies this class, not "no-store".
      const pdfCacheClass = "public, max-age=300, s-maxage=600, must-revalidate";
      const pdfHeaders: Record<string, string> = {
        etag: raw.httpEtag,
        "accept-ranges": "bytes",
      };

      // A FAILED onlyIf precondition makes R2 hand back a body-less R2Object — just the
      // validators, no content. R2 reports THAT a precondition failed, never WHICH one, so
      // map back from the request's own conditional headers, following RFC 9110 §13.2.2's
      // MUST-ordered precedence exactly: If-Match, then If-Unmodified-Since, then
      // If-None-Match, then If-Modified-Since. Order is load-bearing, not cosmetic — testing
      // the not-modified family first answered `If-Match: "old"` + `If-None-Match: "new"`
      // with a 304, telling the client its stale copy was still current when the
      // higher-precedence If-Match had in fact failed and owed it a 412.
      if (!("body" in raw) || !raw.body) {
        // §13.2.2 steps 3/4 make 304 conditional on the METHOD: a failed If-None-Match is
        // "304 if the request method is GET or HEAD or 412 for all other request methods"
        // (§13.1.2), and If-Modified-Since is only evaluated for GET/HEAD at all. Nothing
        // upstream restricts the method, so a POST/PUT to this path with a conditional
        // header reaches here and must never be answered 304.
        const method = request.method.toUpperCase();
        const isGetOrHead = method === "GET" || method === "HEAD";
        let status: 304 | 412;
        if (request.headers.has("if-match") || request.headers.has("if-unmodified-since")) {
          status = 412; // §13.2.2 steps 1-2 — strict precedence over the not-modified family
        } else if (
          request.headers.has("if-none-match") || request.headers.has("if-modified-since")
        ) {
          status = isGetOrHead ? 304 : 412; // §13.2.2 steps 3-4
        } else {
          // Unreachable in practice: with no conditional header R2 always returns a body.
          // 412 is the safe answer — a 304 asserts a cache validity we never established.
          status = 412;
        }
        return apexHeaders(new Response(null, { status, headers: pdfHeaders }), env, pdfCacheClass);
      }
      const obj = raw as R2ObjectBody;
      pdfHeaders["content-type"] = "application/pdf";

      // A satisfied Range request. R2 echoes the actually-served byte range on `obj.range` —
      // but it does so for FULL gets too: against a real R2 binding under workerd, a get()
      // whose forwarded Headers carry NO Range header still comes back with
      // `range = {offset: 0, length: obj.size}`. Keying the 206 off `obj.range` alone therefore
      // turned every plain GET of the 1.3 PDF into a 206 — which is exactly what the nightly
      // canary sweep observed (`/en/1.3/vyos-documentation.pdf: status=206`) — and RFC 9110
      // §15.3.7 only permits a 206 in answer to a request that actually carried a Range header.
      // So: gate on the REQUEST first, then normalize whatever shape R2 handed back.
      const range = obj.range;
      const rangeHeader = request.headers.get("range");
      if (range && rangeHeader !== null) {
        const intent = classifyRangeHeader(rangeHeader, obj.size);
        if (intent === "unsatisfiable") {
          // §14.2: "the server SHOULD send a 416"; §15.5.17: a 416 to a byte-range request
          // SHOULD carry `Content-Range: bytes */<complete-length>`. Deliberately no
          // content-type — there is no PDF payload on this response. 416 is >= 400 so
          // apexHeaders() forces no-store, which is right: the verdict depends on the
          // request's Range header and the cache key does not include it.
          return apexHeaders(
            new Response(null, {
              status: 416,
              headers: { etag: pdfHeaders.etag, "accept-ranges": "bytes",
                         "content-range": `bytes */${obj.size}` },
            }),
            env,
            pdfCacheClass,
          );
        }
        const { start, length } = resolveRange(range, obj.size);
        // `length === 0` means a zero-length representation (the only way R2 yields it) —
        // e.g. a non-zero suffix-range, which §14.1.2 calls satisfiable, against an empty
        // object. No valid Content-Range exists for an empty selection (§14.4 forbids a
        // last-pos below the first-pos), so a 206 is unrepresentable. Fall through to the
        // 200: §15.5.17's own note records that servers are free to ignore Range and answer
        // with the complete representation, which for an empty object is exactly this body.
        if (intent === "single" && length > 0) {
          pdfHeaders["content-range"] = `bytes ${start}-${start + length - 1}/${obj.size}`;
          pdfHeaders["content-length"] = String(length);
          return apexHeaders(new Response(obj.body, { status: 206, headers: pdfHeaders }), env, pdfCacheClass);
        }
        // intent === "ignored" (multi-range / malformed / unknown unit): R2 handed back the
        // complete object, so answer 200 with it rather than stamping a single-range 206
        // Content-Range onto a body that does not match the request.
      }

      pdfHeaders["content-length"] = String(obj.size);
      return apexHeaders(new Response(obj.body, { status: 200, headers: pdfHeaders }), env, pdfCacheClass);
    }

    // 3+4. Trailing-slash + alias/codename/PDF 301s (§3.2.3-4)
    const redir = redirectFor(url, manifest);
    if (redir) return apexHeaders(redir, env);

    // 5. /kb seam (§3.2.5)
    if (url.pathname.startsWith("/kb/") || url.pathname === "/kb") {
      if (env.DOCS_KB) return securityHeaders(await env.DOCS_KB.fetch(request));
      return themed(env, 404);
    }

    // 6. Version dispatch (§3.2.6)
    const hit = resolveVersion(url.pathname, dispatch);
    if (hit) {
      const fetcher = bindingGuard(env, hit.binding);
      if (!fetcher) { // 7. runtime binding guard (§3.2.7)
        console.log(JSON.stringify({ event: "binding-missing", binding: hit.binding }));
        return themed(env, 503);
      }
      try {
        const resp = await fetcher.fetch(request);
        if (resp.status === 404) return themed(env, 404);
        return securityHeaders(resp); // §3.3: security headers at apex; cache + X-Docs-Build stay content-owned
      } catch (e) {
        console.log(JSON.stringify({ event: "binding-error", binding: hit.binding, error: String(e) }));
        return themed(env, 503);
      }
    }

    // 7. Fallback
    return themed(env, 404);
  },
} satisfies ExportedHandler<ApexEnv>;
