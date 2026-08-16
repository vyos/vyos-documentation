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

// A single `bytes=` range-spec. Anything with a comma is a multi-range and deliberately
// fails to match. The whitespace class is `\s`, which is DELIBERATELY wider than the ` `
// (ASCII space) that R2's own parser accepts — see classifyRangeHeader's contract note on
// why the two grammars are allowed to disagree.
const SINGLE_BYTE_RANGE = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i;

/**
 * Numeric comparison of two non-empty digit strings, without going through Number().
 *
 * A range-spec's positions are unbounded digit strings, and Number() silently rounds
 * anything above 2^53: `Number("9007199254740993") === Number("9007199254740992")`, which
 * collapsed `bytes=9007199254740993-9007199254740992` — an invalid spec (last < first)
 * that §14.1.2 says to IGNORE, so 200 — into an apparently-valid one that then read as
 * unsatisfiable and answered 416. Comparing normalised digit strings by length and then
 * lexically is exact at every magnitude.
 */
function cmpDigits(a: string, b: string): number {
  const x = a.replace(/^0+(?=\d)/, "");
  const y = b.replace(/^0+(?=\d)/, "");
  if (x.length !== y.length) return x.length - y.length;
  return x < y ? -1 : x > y ? 1 : 0;
}

export type RangeIntent =
  | { kind: "ignored" }
  | { kind: "unsatisfiable" }
  | { kind: "single"; start: number; length: number };

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
 *
 * The `single` verdict carries the CONCRETE byte bounds the client asked for, clamped the
 * way §14.1.2 clamps them. That is what makes this classifier safe to disagree with R2's
 * parser. The two grammars are not identical and cannot be kept identical: R2's accepts
 * only ASCII space around the tokens (miniflare's `/^ *(\d+)? *- *(\d+)? *$/`) while this
 * one accepts `\s`, so `Range: bytes=2<TAB>-<TAB>4` parses here and is ignored there. When
 * a caller compares these bounds against the bytes R2 actually handed back, any such
 * divergence — this one, or the next one a parser change introduces — degrades to a plain
 * 200 instead of a 206 whose Content-Range describes a body the client did not ask for.
 * Chasing byte-for-byte grammar parity would put the guarantee back in the hands of two
 * regexes staying in sync, which is the coupling that produced the bug.
 */
export function classifyRangeHeader(header: string, size: number): RangeIntent {
  const m = SINGLE_BYTE_RANGE.exec(header);
  if (!m) return { kind: "ignored" }; // multi-range, unknown unit, or unparseable
  const [, firstRaw, lastRaw] = m;
  if (firstRaw === "") {
    if (lastRaw === "") return { kind: "ignored" }; // bare "bytes=-" is malformed
    // §14.1.2: suffix-length 0 is unsatisfiable; a suffix past the start is the whole object.
    if (cmpDigits(lastRaw, "0") <= 0) return { kind: "unsatisfiable" };
    const suffix = Math.min(Number(lastRaw), size);
    return { kind: "single", start: size - suffix, length: suffix };
  }
  // §14.1.2: an invalid spec (last-pos < first-pos) is ignored, not rejected.
  if (lastRaw !== "" && cmpDigits(lastRaw, firstRaw) < 0) return { kind: "ignored" };
  if (cmpDigits(firstRaw, String(size)) >= 0) return { kind: "unsatisfiable" };
  const first = Number(firstRaw); // < size, so within safe-integer range
  const last = lastRaw === "" ? size - 1 : Math.min(Number(lastRaw), size - 1);
  return { kind: "single", start: first, length: last - first + 1 };
}

/** A quoted entity-tag list (`"a", W/"b"`) or `*`, compared per RFC 9110 §8.8.3.2. */
function etagListMatches(list: string, etag: string, compare: "strong" | "weak"): boolean {
  const items = list.split(",").map((s) => s.trim()).filter((s) => s !== "");
  if (items.includes("*")) return true; // "*" matches iff a representation exists — one does
  const weaken = (t: string) => t.replace(/^W\//, "");
  // Strong comparison: neither side may be weak (§8.8.3.2).
  if (compare === "strong" && etag.startsWith("W/")) return false;
  return items.some((t) =>
    compare === "strong" ? t === etag : weaken(t) === weaken(etag),
  );
}

/**
 * `uploaded <= <HTTP-date>`, at seconds granularity, or null when the date is unparseable
 * (§13.1.3: an invalid date MUST be ignored, which callers map to "precondition passes").
 * Seconds granularity matches R2's own comparison, which the Headers form of `onlyIf`
 * selects — evaluating at millisecond precision here would disagree with the binding that
 * produced the failure we are trying to name.
 */
function uploadedAtOrBefore(uploaded: Date | undefined, httpDate: string): boolean | null {
  const at = Date.parse(httpDate);
  if (Number.isNaN(at) || !uploaded) return null;
  return Math.floor(uploaded.getTime() / 1000) <= Math.floor(at / 1000);
}

/**
 * The conditional headers R2 is allowed to see, filtered to those RFC 9110 §13.2.2 says
 * actually apply to THIS request.
 *
 * R2 ANDs together every validator it is handed; §13.2.2 instead defines a precedence in
 * which a lower-ranked validator is not evaluated at all. Forwarding `request.headers`
 * wholesale therefore let R2 fail a request on a validator the RFC says to ignore — most
 * visibly `If-Modified-Since` on a non-GET/HEAD method, which §13.2.2 step 4 does not
 * evaluate, but which R2 evaluated anyway and answered with a body-less object that this
 * Worker could only turn into a 412. Filtering at the source means a body-less result now
 * always corresponds to a precondition that genuinely applies.
 */
function applicablePreconditions(h: Headers, isGetOrHead: boolean): Headers {
  const out = new Headers();
  const ifMatch = h.get("if-match");
  const ifNoneMatch = h.get("if-none-match");
  if (ifMatch !== null) out.set("if-match", ifMatch);
  else {
    const ius = h.get("if-unmodified-since"); // §13.2.2 step 2: only when If-Match is absent
    if (ius !== null) out.set("if-unmodified-since", ius);
  }
  if (ifNoneMatch !== null) out.set("if-none-match", ifNoneMatch);
  else if (isGetOrHead) {
    const ims = h.get("if-modified-since"); // step 4: only when If-None-Match is absent, GET/HEAD only
    if (ims !== null) out.set("if-modified-since", ims);
  }
  return out;
}

/**
 * Which status a FAILED `onlyIf` owes the client, decided by re-evaluating the request's
 * conditionals against the object's own validators in RFC 9110 §13.2.2 order.
 *
 * R2 reports THAT a precondition failed and never WHICH one. Inferring from header
 * PRESENCE cannot be right in both directions, which is how `If-Match: "x"` +
 * `If-None-Match: "x"` on a matching object — If-Match satisfied, If-None-Match failed,
 * so §13.1.2 owes a 304 — came back 412 purely because an If-Match header was present.
 * Evaluating the validators removes the guess: presence selects which check runs, the
 * comparison decides the answer.
 */
export function preconditionStatus(
  h: Headers, isGetOrHead: boolean, etag: string, uploaded: Date | undefined,
): 304 | 412 {
  const ifMatch = h.get("if-match");
  if (ifMatch !== null) {
    if (!etagListMatches(ifMatch, etag, "strong")) return 412; // §13.2.2 step 1
  } else {
    const ius = h.get("if-unmodified-since"); // step 2
    if (ius !== null && uploadedAtOrBefore(uploaded, ius) === false) return 412;
  }
  const ifNoneMatch = h.get("if-none-match");
  if (ifNoneMatch !== null) {
    // §13.1.2: a failed If-None-Match is 304 for GET/HEAD and 412 for every other method.
    if (etagListMatches(ifNoneMatch, etag, "weak")) return isGetOrHead ? 304 : 412;
  } else if (isGetOrHead) {
    const ims = h.get("if-modified-since"); // step 4
    if (ims !== null && uploadedAtOrBefore(uploaded, ims) === true) return 304;
  }
  // R2 refused for a reason this evaluation could not reproduce (a validator comparison
  // that differs at the margins, say). 412 is the safe answer: a 304 would assert a cache
  // validity we have not established.
  return 412;
}

/**
 * RFC 9110 §13.1.5 If-Range: does the client's validator still describe this object?
 *
 * R2 cannot answer this — its `R2Conditional` carries only etagMatches /
 * etagDoesNotMatch / uploadedBefore / uploadedAfter, so an `If-Range` in the forwarded
 * Headers is silently dropped and the range is applied unconditionally. For an object
 * whose ETag has moved on, that answered `Range: bytes=100-` + `If-Range: "old"` with
 * bytes 100+ of the NEW representation under a 206 — a resuming downloader then appends
 * the new tail to its old prefix and silently corrupts the file, which is the precise
 * failure this range forwarding exists to avoid.
 *
 * §13.1.5 requires a STRONG validator, so a weak entity-tag never matches. The date form
 * likewise never matches here: it must compare against Last-Modified, and this Worker
 * does not emit one, so no client can hold a date validator for this resource that we
 * could honour — treating it as a mismatch (serve the complete representation) is both
 * correct and the safe direction.
 */
function ifRangeMatches(value: string, etag: string): boolean {
  const v = value.trim();
  if (!v.startsWith('"')) return false; // weak tag or HTTP-date → not a strong match
  return etagListMatches(v, etag, "strong");
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
      const method = request.method.toUpperCase();
      const isGetOrHead = method === "GET" || method === "HEAD";
      // §14.2: "GET is the only method for which range handling is defined" — a Range on
      // any other method MUST be ignored. Reading it as null here suppresses the whole
      // partial-content path in one place: R2 is never asked to slice, and the 206/416
      // branches below are unreachable. Gating only the R2 forward would leave the
      // response side still seeing a Range header and answering a HEAD or a POST with a
      // 416 or a Content-Range.
      const rangeHeader = method === "GET" ? request.headers.get("range") : null;
      const onlyIf = applicablePreconditions(request.headers, isGetOrHead);

      let raw: R2ObjectBody | R2Object | null;
      try {
        // Forward Range + the APPLICABLE conditionals so a resumed download or a client
        // with a fresh cached copy doesn't have to re-pull the full 29.2 MiB object.
        raw = await bucket.get(pdfVersion.pdf_r2_key!, {
          ...(rangeHeader !== null ? { range: request.headers } : {}),
          onlyIf,
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
      // validators, no content — and never says which validator failed. Because `onlyIf`
      // was filtered to the conditionals §13.2.2 actually applies to this request, a
      // body-less result here always means a precondition that genuinely applies failed;
      // preconditionStatus() re-evaluates them against the object's own validators, in
      // §13.2.2 order, to decide between 304 and 412.
      if (!("body" in raw) || !raw.body) {
        const status = preconditionStatus(
          request.headers, isGetOrHead, raw.httpEtag, raw.uploaded);
        return apexHeaders(new Response(null, { status, headers: pdfHeaders }), env, pdfCacheClass);
      }
      let obj = raw as R2ObjectBody;
      pdfHeaders["content-type"] = "application/pdf";

      // §13.1.5 If-Range, which R2 cannot evaluate (see ifRangeMatches). A failed validator
      // means the client's partial copy is stale, so the Range is ignored ENTIRELY and the
      // complete representation is served — including for a spec that would otherwise be
      // unsatisfiable, since the 416 branch below must not fire on a range we have decided
      // not to honour. R2 has already applied the range at this point, so the whole object
      // has to be re-read; that costs one extra R2 read on the rare stale-resume path and
      // nothing at all on the common one. The re-get is deliberately bare: the preconditions
      // passed on the first call, and re-sending them would only add a body-less outcome
      // that this path has no sensible answer for.
      const ifRange = rangeHeader !== null ? request.headers.get("if-range") : null;
      let rangeApplies = rangeHeader !== null;
      if (ifRange !== null && !ifRangeMatches(ifRange, obj.httpEtag)) {
        rangeApplies = false;
        let full: R2ObjectBody | R2Object | null;
        try {
          full = await bucket.get(pdfVersion.pdf_r2_key!);
        } catch (e) {
          console.log(JSON.stringify({ event: "binding-error", binding: "DOCS_PDFS", error: String(e) }));
          return themed(env, 503);
        }
        if (!full) return themed(env, 404); // deleted between the two reads
        if (!("body" in full) || !full.body) return themed(env, 503); // no onlyIf was sent
        obj = full as R2ObjectBody;
        pdfHeaders.etag = obj.httpEtag;
      }

      // A satisfied Range request. R2 echoes the actually-served byte range on `obj.range` —
      // but it does so for FULL gets too: against a real R2 binding under workerd, a get()
      // whose forwarded Headers carry NO Range header still comes back with
      // `range = {offset: 0, length: obj.size}`. Keying the 206 off `obj.range` alone therefore
      // turned every plain GET of the 1.3 PDF into a 206 — which is exactly what the nightly
      // canary sweep observed (`/en/1.3/vyos-documentation.pdf: status=206`) — and RFC 9110
      // §15.3.7 only permits a 206 in answer to a request that actually carried a Range header.
      // So: gate on the REQUEST first, then normalize whatever shape R2 handed back — and
      // then CHECK that the two agree before promising a 206, because "R2 sliced it" and
      // "R2 handed back everything" are the same shape on the wire.
      //
      // What R2 actually handed back, as concrete bounds. `obj.range` is absent only if a
      // binding declines to report one, in which case the body is the complete object.
      const actual = obj.range
        ? resolveRange(obj.range, obj.size)
        : { start: 0, length: obj.size };
      const servedWhole = actual.start === 0 && actual.length === obj.size;

      if (rangeApplies && rangeHeader !== null) {
        const intent = classifyRangeHeader(rangeHeader, obj.size);
        if (intent.kind === "unsatisfiable") {
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
        // A 206 is owed only when the bytes R2 selected are the bytes the client asked for.
        // `length === 0` means a zero-length representation (the only way R2 yields it) —
        // e.g. a non-zero suffix-range, which §14.1.2 calls satisfiable, against an empty
        // object. No valid Content-Range exists for an empty selection (§14.4 forbids a
        // last-pos below the first-pos), so a 206 is unrepresentable. Fall through to the
        // 200: §15.5.17's own note records that servers are free to ignore Range and answer
        // with the complete representation, which for an empty object is exactly this body.
        if (intent.kind === "single" && intent.length > 0 &&
            actual.start === intent.start && actual.length === intent.length) {
          pdfHeaders["content-range"] =
            `bytes ${intent.start}-${intent.start + intent.length - 1}/${obj.size}`;
          pdfHeaders["content-length"] = String(intent.length);
          return apexHeaders(new Response(obj.body, { status: 206, headers: pdfHeaders }), env, pdfCacheClass);
        }
        // Otherwise no 206 is owed: either the spec was one §14.1.2 says to ignore
        // (multi-range / malformed / unknown unit), or R2 declined a spec that this parser
        // accepted — the grammar divergence classifyRangeHeader documents. Both leave R2
        // having returned the complete object, so fall through to the 200 below.
      }

      // Serve what R2 actually handed back, described truthfully. `servedWhole` is the
      // normal case and the only one a 200 can describe; a partial body under a 200 would
      // ship a Content-Length that contradicts it. A partial body reaching here at all
      // would mean R2 honoured a range this Worker did not ask it to, so it gets a 206
      // carrying the bounds R2 reported — a Content-Range that matches the bytes present,
      // never one invented from the request — plus a log line, since it would indicate the
      // binding's range semantics had moved.
      if (!servedWhole) {
        console.log(JSON.stringify({
          event: "r2-range-divergence", path: url.pathname, size: obj.size,
          served: `${actual.start}+${actual.length}`, requested: rangeHeader ?? null,
        }));
        pdfHeaders["content-range"] =
          `bytes ${actual.start}-${actual.start + actual.length - 1}/${obj.size}`;
        pdfHeaders["content-length"] = String(actual.length);
        return apexHeaders(new Response(obj.body, { status: 206, headers: pdfHeaders }), env, pdfCacheClass);
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
