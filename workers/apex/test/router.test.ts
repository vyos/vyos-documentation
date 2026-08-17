import { describe, it, expect, vi } from "vitest";
import worker, { resolveRange, classifyRangeHeader } from "../src/index";

function makeEnv(overrides: Record<string, unknown> = {}) {
  const html = (body: string, status = 200) =>
    new Response(body, { status, headers: { "content-type": "text/html", "X-Docs-Build": "sha-content" } });
  const fetcher = (tag: string) => ({
    fetch: async (req: Request) => {
      const p = new URL(req.url).pathname;
      if (p.endsWith("/missing.html")) return html("nope", 404);
      return html(`${tag}:${p}`);
    },
  });
  return {
    DOCS_ROLLING: fetcher("rolling"), DOCS_V15: fetcher("v15"),
    DOCS_V14: fetcher("v14"), DOCS_LEGACY: fetcher("legacy"),
    ASSETS: { fetch: async () => new Response("<h1>404</h1>", { status: 200, headers: { "content-type": "text/html" } }) },
    APEX_BUILD_SHA: "apex-sha", DOCS_ENV: "canary",
    ...overrides,
  } as never;
}
const get = (path: string, env = makeEnv(), ua = "vitest") =>
  worker.fetch(new Request(`https://docs-next.vyos.io${path}`, { headers: { "user-agent": ua } }), env);

describe("apex router (§3.2 order)", () => {
  it("/ → 301 default version", async () => {
    const r = await get("/");
    expect(r.status).toBe(301);
    expect(r.headers.get("Location")).toBe("/en/rolling/");
    expect(r.headers.get("X-Apex-Build")).toBe("apex-sha");
  });
  it("/ redirect preserves the query string (like alias redirects)", async () => {
    const r = await get("/?ref=email");
    expect(r.status).toBe(301);
    expect(r.headers.get("Location")).toBe("/en/rolling/?ref=email");
  });
  it("/versions.json served from manifest with X-Apex-Build", async () => {
    const r = await get("/versions.json");
    expect(r.status).toBe(200);
    const body = await r.json() as { schema_version: number };
    expect(body.schema_version).toBe(2);
    expect(r.headers.get("X-Apex-Build")).toBe("apex-sha");
  });
  it("dispatches /en/rolling/x to the binding with original path", async () => {
    const r = await get("/en/rolling/cli/index.html");
    expect(await r.text()).toBe("rolling:/en/rolling/cli/index.html");
    expect(r.headers.get("X-Docs-Build")).toBe("sha-content");
  });
  it("content responses get apex security headers, content-owned headers untouched (§3.3)", async () => {
    const r = await get("/en/rolling/cli/index.html");
    expect(r.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(r.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(r.headers.get("X-Docs-Build")).toBe("sha-content"); // not overwritten
    expect(r.headers.get("X-Apex-Build")).toBeNull();          // apex build header is apex-paths-only
  });
  it("alias 301 before dispatch", async () => {
    const r = await get("/en/latest/cli/");
    expect(r.status).toBe(301);
    expect(r.headers.get("Location")).toBe("/en/rolling/cli/");
  });
  it("binding 404 → themed 404 with real 404 status (§3.2.7)", async () => {
    const r = await get("/en/rolling/missing.html");
    expect(r.status).toBe(404);
    expect(r.headers.get("X-Apex-Build")).toBe("apex-sha");
  });
  it("missing binding degrades to themed 503, not a crash", async () => {
    const env = makeEnv({ DOCS_ROLLING: undefined });
    const r = await get("/en/rolling/", env);
    expect(r.status).toBe(503);
  });
  it("/kb/* → themed 404 while seam unbound; dispatches when DOCS_KB present", async () => {
    expect((await get("/kb/article")).status).toBe(404);
    const env = makeEnv({ DOCS_KB: { fetch: async () => new Response("kb!") } });
    const r = await get("/kb/article", env);
    expect(await r.text()).toBe("kb!");
    // /kb passthrough gets the same security headers as any other content response.
    expect(r.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(r.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
  it("unknown path → themed 404 + security headers", async () => {
    const r = await get("/nope");
    expect(r.status).toBe(404);
    expect(r.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(r.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
  it("UA gate blocks only in production env", async () => {
    const prodEnv = makeEnv({ DOCS_ENV: "production" });
    // policy.block is empty at launch → craft env-independent check via log class:
    const r = await get("/en/rolling/", prodEnv, "GPTBot/1.0");
    expect(r.status).toBe(200); // log-only, not blocked
  });
  it("apex responses carry §3.3 cache headers (no-store canary; revalidate production)", async () => {
    expect((await get("/versions.json")).headers.get("Cache-Control")).toBe("no-store");
    const prod = await get("/versions.json", makeEnv({ DOCS_ENV: "production" }));
    expect(prod.headers.get("Cache-Control")).toBe("public, max-age=0, s-maxage=300, must-revalidate");
  });
  it("error responses stay no-store in production — cache key excludes UA, so a cached 4xx/5xx would poison the edge for everyone", async () => {
    const prodEnv = makeEnv({ DOCS_ENV: "production" });

    // themed 404 (unknown path)
    const notFound = await get("/nope", prodEnv);
    expect(notFound.status).toBe(404);
    expect(notFound.headers.get("Cache-Control")).toBe("no-store");

    // themed 503 (missing runtime binding)
    const svcUnavailable = await get("/en/rolling/", makeEnv({ DOCS_ENV: "production", DOCS_ROLLING: undefined }));
    expect(svcUnavailable.status).toBe(503);
    expect(svcUnavailable.headers.get("Cache-Control")).toBe("no-store");

    // UA-block 403 — force a block entry via a policy override, since the shipped
    // ua-policy.json block list is empty at launch.
    vi.resetModules();
    vi.doMock("../ua-policy.json", () => ({
      default: { allow: [], log: [], block: ["EvilScraper"] },
    }));
    try {
      const { default: freshWorker } = await import("../src/index");
      const blocked = await freshWorker.fetch(
        new Request("https://docs-next.vyos.io/en/rolling/", { headers: { "user-agent": "EvilScraper/1.0" } }),
        prodEnv,
      );
      expect(blocked.status).toBe(403);
      expect(blocked.headers.get("Cache-Control")).toBe("no-store");
    } finally {
      vi.doUnmock("../ua-policy.json");
      vi.resetModules();
    }
  });
  it("/sitemap.xml index entries use the REQUEST origin, not a hard-coded docs.vyos.io", async () => {
    // This Worker serves the canary origin too. A canary sitemap index pointing at production
    // would send any checker that follows it to docs.vyos.io, so a candidate tree with broken
    // per-version sitemaps would pass by silently grading production instead of itself.
    const canary = await get("/sitemap.xml");
    const canaryBody = await canary.text();
    expect(canaryBody).toContain("<loc>https://docs-next.vyos.io/en/rolling/sitemap.xml</loc>");
    expect(canaryBody).not.toContain("docs.vyos.io");

    const prod = await worker.fetch(
      new Request("https://docs.vyos.io/sitemap.xml", { headers: { "user-agent": "vitest" } }),
      makeEnv({ DOCS_ENV: "production" }),
    );
    expect(await prod.text()).toContain("<loc>https://docs.vyos.io/en/1.5/sitemap.xml</loc>");
  });
  it("/llms.txt with missing default binding → 503, never 404", async () => {
    const env = makeEnv({ DOCS_ROLLING: undefined });
    expect((await get("/llms.txt", env)).status).toBe(503);
  });
  it("/llms.txt forwards the ORIGINAL request (method + conditional-GET headers preserved)", async () => {
    let seenMethod: string | null = null;
    let seenIfNoneMatch: string | null = null;
    const env = makeEnv({
      DOCS_ROLLING: {
        fetch: async (req: Request) => {
          seenMethod = req.method;
          seenIfNoneMatch = req.headers.get("if-none-match");
          return new Response("llms body", { headers: { "content-type": "text/plain" } });
        },
      },
    });
    const r = await worker.fetch(
      new Request("https://docs-next.vyos.io/llms.txt", {
        method: "HEAD",
        headers: { "user-agent": "vitest", "if-none-match": '"xyz"' },
      }),
      env,
    );
    expect(r.status).toBe(200);
    expect(seenMethod).toBe("HEAD");
    expect(seenIfNoneMatch).toBe('"xyz"');
  });
  it("robots.txt passthrough forwards the ORIGINAL request (conditional-GET headers preserved)", async () => {
    let seenIfNoneMatch: string | null = null;
    const env = makeEnv({
      ASSETS: {
        fetch: async (req: Request) => {
          seenIfNoneMatch = req.headers.get("if-none-match");
          return new Response("User-agent: *", { headers: { "content-type": "text/plain" } });
        },
      },
    });
    const r = await worker.fetch(
      new Request("https://docs-next.vyos.io/robots.txt", {
        headers: { "user-agent": "vitest", "if-none-match": '"abc123"' },
      }),
      env,
    );
    expect(r.status).toBe(200);
    expect(seenIfNoneMatch).toBe('"abc123"');
  });

  it("UA gate in production tolerates a missing User-Agent header (no crash, fail-open)", async () => {
    const prodEnv = makeEnv({ DOCS_ENV: "production" });
    const r = await worker.fetch(
      new Request("https://docs-next.vyos.io/en/rolling/", { headers: {} }),
      prodEnv,
    );
    expect(r.status).toBe(200);
  });

  describe("legacy PDF R2 fallback (spec §5) — runs before version dispatch", () => {
    // Fake R2Bucket mock following the preview-worker precedent (apex/preview/test/preview.test.ts).
    // Simulates R2's onlyIf (If-None-Match → body-less R2Object) + range (echoes the
    // satisfied byte range on `.range`) behavior closely enough to exercise index.ts's
    // handling of both without needing the real R2 binding.
    const ETAG = '"pdf-etag-1"';
    const UPLOADED = new Date("2026-01-15T10:00:00Z");
    const BEFORE_UPLOAD = "Wed, 14 Jan 2026 10:00:00 GMT";
    const AFTER_UPLOAD = "Fri, 16 Jan 2026 10:00:00 GMT";
    // R2 hands back a ReadableStream, not a string, and the difference is exactly what makes
    // an abandoned body observable: a stream the Worker neither sends nor cancels stays open
    // holding its connection. A string-bodied mock cannot see that class of bug at all, so
    // bodies here are real streams that record their own cancellation. `highWaterMark: 0`
    // keeps `pull` from running until something actually reads, so a stream cancelled before
    // any read still reaches its `cancel()` algorithm rather than being already closed.
    function bodyStream(text: string, sink?: { cancelled: string[] }) {
      return new ReadableStream({
        pull(c) {
          c.enqueue(new TextEncoder().encode(text));
          c.close();
        },
        cancel() {
          sink?.cancelled.push(text);
        },
      }, { highWaterMark: 0 });
    }

    function r2Env(
      objects: Record<string, { body: string; etag?: string; uploaded?: Date }>,
      overrides: Record<string, unknown> = {},
      sink?: { cancelled: string[] },
    ) {
      return makeEnv({
        DOCS_PDFS: {
          get: async (key: string, options?: { onlyIf?: Headers; range?: Headers }) => {
            const hit = objects[key];
            if (!hit) return null;
            const etag = hit.etag ?? ETAG;
            const size = hit.body.length;

            const uploaded = hit.uploaded ?? UPLOADED;
            const secs = (d: number) => Math.floor(d / 1000); // R2 compares at seconds granularity

            // R2 returns a body-less R2Object whenever an onlyIf precondition FAILS, and it
            // never says which one did — that ambiguity is exactly what index.ts has to
            // resolve by re-evaluating the request's conditionals against these validators.
            // R2 ANDs every validator it is handed and knows nothing about the request
            // METHOD; index.ts is what filters the set down to the ones RFC 9110 §13.2.2
            // says apply, so this mock deliberately evaluates whatever it is given.
            const bodyless = { httpEtag: etag, size, uploaded };
            const ifNoneMatch = options?.onlyIf?.get?.("if-none-match");
            if (ifNoneMatch && (ifNoneMatch === "*" || ifNoneMatch.split(",").some(
              (t) => t.trim().replace(/^W\//, "") === etag.replace(/^W\//, "")))) {
              return bodyless; // If-None-Match matched → "not modified"
            }
            const ifMatch = options?.onlyIf?.get?.("if-match");
            if (ifMatch && ifMatch !== "*" && !ifMatch.split(",").some(
              (t) => t.trim() === etag)) {
              return bodyless; // If-Match failed → precondition failed
            }
            const ifUnmodifiedSince = options?.onlyIf?.get?.("if-unmodified-since");
            if (ifUnmodifiedSince && secs(uploaded.getTime()) > secs(Date.parse(ifUnmodifiedSince))) {
              return bodyless; // object is newer than the client's copy
            }
            const ifModifiedSince = options?.onlyIf?.get?.("if-modified-since");
            if (ifModifiedSince && secs(uploaded.getTime()) <= secs(Date.parse(ifModifiedSince))) {
              return bodyless; // not modified since the client's copy
            }

            // The whole-object result. R2 returns this shape for a plain un-ranged get AND
            // — critically — for every Range header it declines to honour. Both verified
            // against a real R2 binding under @cloudflare/vitest-pool-workers.
            const whole = {
              httpEtag: etag, size, uploaded, body: bodyStream(hit.body, sink),
              range: { offset: 0, length: size },
            };

            const rangeHeader = options?.range?.get?.("range");
            if (!rangeHeader) return whole;

            // Range parsing mirrors R2's OWN grammar rather than being merely "strict":
            // miniflare src/workers/shared/range.ts uses /^ *bytes *=/i for the prefix and
            // /^ *(\d+)? *- *(\d+)? *$/ per comma-separated spec — ASCII SPACE ONLY, never
            // \s. index.ts's classifier accepts \s, so the two grammars genuinely disagree
            // on a tab. Reproducing R2's grammar here is what makes the tab-separated-Range
            // test a real divergence rather than an artefact of a lazily-strict mock.
            const prefix = / *bytes *=/i.exec(rangeHeader);
            if (!prefix || prefix.index !== 0) return whole; // unknown unit → ignored
            const specs = rangeHeader.substring(prefix[0].length).split(",");
            if (specs.length !== 1) return whole; // multi-range → ignored
            const m = /^ *(\d+)? *- *(\d+)? *$/.exec(specs[0]);
            if (!m) return whole; // unparseable (a tab lands here, exactly as in R2)
            const [, startRaw, endRaw] = m;

            if (startRaw !== undefined && endRaw !== undefined) {
              const offset = Number(startRaw);
              const last = Number(endRaw);
              // Observed R2: an int-range with first-pos >= size, or an invalid spec with
              // last < first, is IGNORED — R2 hands back the complete object rather than
              // throwing or returning a zero-length range. (`bytes=10-20` and `bytes=5-2`
              // on a 10-byte object both returned `{offset: 0, length: 10}` + the full body.)
              if (offset >= size || last < offset) return whole;
              const length = Math.min(last, size - 1) - offset + 1; // last-pos clamps to EOF
              return {
                httpEtag: etag, size, uploaded,
                body: bodyStream(hit.body.slice(offset, offset + length), sink),
                range: { offset, length },
              };
            }
            if (startRaw !== undefined) { // open-ended `bytes=5-`
              const offset = Number(startRaw);
              if (offset >= size) return whole; // unsatisfiable → ignored
              return {
                httpEtag: etag, size, uploaded,
                body: bodyStream(hit.body.slice(offset), sink),
                range: { offset, length: size - offset },
              };
            }
            if (endRaw !== undefined) {
              // Suffix form. R2Range is a three-shape union and this arm deliberately
              // returns the RAW `{suffix}` shape rather than pre-normalizing to
              // `{offset, length}` — that is what exercises index.ts's resolveRange().
              // (workerd itself normalizes, but the type admits this shape.)
              const n = Number(endRaw);
              // miniflare: a suffix >= length yields no ranges, and `bytes=-0` is skipped —
              // both leave R2 serving the complete object rather than rejecting.
              if (n === 0 || n >= size) return whole;
              return {
                httpEtag: etag, size, uploaded,
                body: bodyStream(hit.body.slice(size - n), sink),
                range: { suffix: n },
              };
            }
            return whole; // bare `bytes=-`
          },
        } as unknown as R2Bucket,
        ...overrides,
      });
    }

    it("served-from-R2 200: content-type application/pdf, PDF cache class, X-Apex-Build present, etag + accept-ranges", async () => {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      const r = await get("/en/1.3/vyos-documentation.pdf", env);
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("PDF-BYTES");
      expect(r.headers.get("content-type")).toBe("application/pdf");
      expect(r.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=600, must-revalidate");
      expect(r.headers.get("X-Apex-Build")).toBe("apex-sha");
      expect(r.headers.get("etag")).toBe(ETAG);
      expect(r.headers.get("accept-ranges")).toBe("bytes");
      expect(r.headers.get("content-length")).toBe("9");
    });

    it("If-None-Match matching R2's etag → 304, no body, etag present, PDF cache class", async () => {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", "if-none-match": ETAG },
        }),
        env,
      );
      expect(r.status).toBe(304);
      expect(await r.text()).toBe("");
      expect(r.headers.get("etag")).toBe(ETAG);
      expect(r.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=600, must-revalidate");
      expect(r.headers.get("content-type")).toBeNull();
    });

    it("Range: bytes=0-3 → 206 + Content-Range + partial body, PDF cache class", async () => {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } }, // length 9
        { DOCS_ENV: "production" },
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: "bytes=0-3" },
        }),
        env,
      );
      expect(r.status).toBe(206);
      expect(await r.text()).toBe("PDF-");
      expect(r.headers.get("content-range")).toBe("bytes 0-3/9");
      expect(r.headers.get("content-length")).toBe("4");
      expect(r.headers.get("etag")).toBe(ETAG);
      expect(r.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=600, must-revalidate");
    });

    it("canary env still forces no-store on the PDF response (canary rule wins)", async () => {
      const env = r2Env({ "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } }); // default DOCS_ENV: canary
      const r = await get("/en/1.3/vyos-documentation.pdf", env);
      expect(r.status).toBe(200);
      expect(r.headers.get("Cache-Control")).toBe("no-store");
    });

    it("R2 miss → themed 404, no-store, never falls through to DOCS_LEGACY dispatch", async () => {
      const env = r2Env({}, { DOCS_ENV: "production" }); // bucket present but empty
      const r = await get("/en/1.3/vyos-documentation.pdf", env);
      expect(r.status).toBe(404);
      expect(r.headers.get("Cache-Control")).toBe("no-store");
      expect(await r.text()).not.toContain("legacy:"); // not the DOCS_LEGACY fetcher's echoed tag
    });

    it("R2 get() throwing → themed 503, no-store", async () => {
      const env = makeEnv({
        DOCS_ENV: "production",
        DOCS_PDFS: { get: async () => { throw new Error("R2 unavailable"); } } as unknown as R2Bucket,
      });
      const r = await get("/en/1.3/vyos-documentation.pdf", env);
      expect(r.status).toBe(503);
      expect(r.headers.get("Cache-Control")).toBe("no-store");
    });

    it("DOCS_PDFS binding missing → themed 503, not a crash", async () => {
      const env = makeEnv({ DOCS_ENV: "production" }); // no DOCS_PDFS at all
      const r = await get("/en/1.3/vyos-documentation.pdf", env);
      expect(r.status).toBe(503);
    });

    it("other versions' PDF paths never touch DOCS_PDFS — fall through to normal dispatch", async () => {
      // env carries a DOCS_PDFS bucket that would 500 if queried at all, proving the
      // rolling/1.5/1.4 PDF paths (no pdf_r2_key on those manifest entries) skip it entirely.
      const env = r2Env(
        {},
        {
          DOCS_ENV: "production",
          DOCS_PDFS: { get: async () => { throw new Error("must not be called for non-1.3 PDFs"); } } as unknown as R2Bucket,
        },
      );
      const r = await get("/en/rolling/vyos-documentation.pdf", env);
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("rolling:/en/rolling/vyos-documentation.pdf");
    });

    it("1.2 (pdf: null, no pdf_r2_key) falls through to normal dispatch unaffected", async () => {
      const env = r2Env({}, { DOCS_ENV: "production" });
      const r = await get("/en/1.2/vyos-documentation.pdf", env);
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("legacy:/en/1.2/vyos-documentation.pdf");
    });

    // --- Regression: a plain GET must never answer 206. R2 reports a whole-object `range`
    // on un-ranged gets, so keying the 206 off `obj.range` alone made EVERY plain GET of the
    // 1.3 PDF a 206 with a Content-Range — which is what the nightly canary sweep observed
    // ("/en/1.3/vyos-documentation.pdf: status=206") and what RFC 9110 §15.3.7 forbids. ---

    it("plain GET (no Range header) → 200, never 206, even though R2 echoes a whole-object range", async () => {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      const r = await get("/en/1.3/vyos-documentation.pdf", env);
      expect(r.status).toBe(200);
      expect(r.headers.get("content-range")).toBeNull();
      expect(r.headers.get("content-length")).toBe("9");
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("suffix Range (bytes=-4) → 206 with the last 4 bytes and a matching Content-Range/Length", async () => {
      // The `{suffix}` R2Range shape used to miss the `"offset" in range` guard entirely and
      // fall through to the 200 branch, where content-length claimed the WHOLE object size
      // while the body held only the tail — a corrupt download for any resumed fetch.
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } }, // length 9
        { DOCS_ENV: "production" },
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: "bytes=-4" },
        }),
        env,
      );
      expect(r.status).toBe(206);
      expect(await r.text()).toBe("YTES");
      expect(r.headers.get("content-range")).toBe("bytes 5-8/9");
      expect(r.headers.get("content-length")).toBe("4");
    });

    it("failed If-Match → 412, not 304 (a 304 would tell the client its stale copy is current)", async () => {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", "if-match": '"some-other-etag"' },
        }),
        env,
      );
      expect(r.status).toBe(412);
      expect(await r.text()).toBe("");
      // 412 is an error response, so the §3.3 precedence forces no-store over the PDF class.
      expect(r.headers.get("Cache-Control")).toBe("no-store");
    });

    // --- RFC 9110 §13.2.2 precondition PRECEDENCE. R2 reports THAT an onlyIf precondition
    // failed, never WHICH one, so index.ts re-derives it from the request's own headers.
    // Testing the not-modified family first got the ordering backwards. ---

    async function conditional(headers: Record<string, string>, method = "GET") {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      return worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          method,
          headers: { "user-agent": "vitest", ...headers },
        }),
        env,
      );
    }

    it("If-None-Match alone (matching) → 304", async () => {
      expect((await conditional({ "if-none-match": '"pdf-etag-1"' })).status).toBe(304);
    });

    it("If-Match + If-None-Match together → 412: If-Match takes strict precedence", async () => {
      // The failing precondition here is If-Match. Answering 304 (because If-None-Match is
      // also present) would tell the client its stale copy is still current, when the
      // higher-precedence check it asked for actually failed. §13.2.2 steps 1 and 3.
      const r = await conditional({
        "if-match": '"stale-etag"',
        "if-none-match": '"pdf-etag-1"',
      });
      expect(r.status).toBe(412);
      expect(r.headers.get("Cache-Control")).toBe("no-store");
    });

    it("If-Unmodified-Since → 412, never 304 (§13.2.2 step 2 outranks the 304 family)", async () => {
      const r = await conditional({
        "if-unmodified-since": "Wed, 01 Jan 2020 00:00:00 GMT",
        "if-none-match": '"pdf-etag-1"',
      });
      expect(r.status).toBe(412);
    });

    it("a failed If-None-Match on a non-GET/HEAD method → 412, not 304", async () => {
      // §13.1.2: on a false If-None-Match the origin MUST answer "304 ... if the request
      // method is GET or HEAD or 412 ... for all other request methods". Nothing upstream
      // restricts the method, so this path is reachable and 304 would be an invalid answer.
      const r = await conditional({ "if-none-match": '"pdf-etag-1"' }, "POST");
      expect(r.status).toBe(412);
    });

    it("HEAD keeps the 304 (it is one of the two methods §13.1.2 allows it for)", async () => {
      expect((await conditional({ "if-none-match": '"pdf-etag-1"' }, "HEAD")).status).toBe(304);
    });

    // --- RFC 9110 §14.1.2 / §15.5.17 range satisfiability. R2 signals "I ignored your
    // Range" by returning the WHOLE object — the same shape as a satisfied whole-object
    // range — so index.ts re-derives intent from the client's own header. ---

    async function ranged(rangeHeader: string, body = "PDF-BYTES") {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body } },
        { DOCS_ENV: "production" },
      );
      return worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: rangeHeader },
        }),
        env,
      );
    }

    it("Range past EOF → 416 + Content-Range: bytes */size, NOT a 206 serving the whole body", async () => {
      // The pre-fix path trusted obj.range, and R2 answers an unsatisfiable range with the
      // complete object — so this returned `206 Content-Range: bytes 0-8/9` plus all 9
      // bytes. A client resuming at byte 99 would have appended bytes 0-8 to its partial
      // file and silently corrupted the download.
      const r = await ranged("bytes=99-"); // body is 9 bytes
      expect(r.status).toBe(416);
      expect(r.headers.get("content-range")).toBe("bytes */9");
      expect(await r.text()).toBe("");
      expect(r.headers.get("Cache-Control")).toBe("no-store"); // 416 >= 400
    });

    it("Range starting exactly at EOF → 416 (§14.1.2: satisfiable iff first-pos < length)", async () => {
      const r = await ranged("bytes=9-");
      expect(r.status).toBe(416);
      expect(r.headers.get("content-range")).toBe("bytes */9");
    });

    it("closed Range wholly past EOF → 416", async () => {
      const r = await ranged("bytes=20-30");
      expect(r.status).toBe(416);
    });

    it("suffix-length 0 → 416 (§14.1.2 names it unsatisfiable)", async () => {
      const r = await ranged("bytes=-0");
      expect(r.status).toBe(416);
      expect(r.headers.get("content-range")).toBe("bytes */9");
    });

    it("multi-range → 200 with the complete body, not a single-range 206 that misdescribes it", async () => {
      // R2 ignores multi-ranges and returns the whole object. Stamping
      // `Content-Range: bytes 0-8/9` on it would claim a single partial covering
      // everything, in answer to a request for two disjoint sub-ranges.
      const r = await ranged("bytes=0-1,4-5");
      expect(r.status).toBe(200);
      expect(r.headers.get("content-range")).toBeNull();
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("malformed Range → 200 with the complete body (§14.1.2: invalid spec is ignored)", async () => {
      for (const bad of ["bytes=abc", "bytes=-", "bytes=5-2", "items=0-5"]) {
        const r = await ranged(bad);
        expect(r.status, `Range: ${bad}`).toBe(200);
        expect(r.headers.get("content-range"), `Range: ${bad}`).toBeNull();
      }
    });

    it("a satisfiable whole-object Range still gets a real 206", async () => {
      // The 416/200 guards must not swallow the legitimate case: `bytes=0-` IS satisfiable
      // (first-pos 0 < 9), so it keeps its 206 even though the payload is the whole object.
      const r = await ranged("bytes=0-");
      expect(r.status).toBe(206);
      expect(r.headers.get("content-range")).toBe("bytes 0-8/9");
      expect(await r.text()).toBe("PDF-BYTES");
    });

    // --- The classifier's grammar and R2's grammar are NOT the same grammar, and the
    // Worker no longer assumes they are: it checks the bounds it derived against the bytes
    // R2 actually returned before promising a 206. ---

    it("tab-separated Range → 200 with the whole body, never a 206 for bytes nobody sliced", async () => {
      // R2 parses ranges with ASCII space only (/^ *bytes *=/i + /^ *(\d+)? *- *(\d+)? *$/);
      // the classifier's \s also accepts a tab. So this header says "single, bytes 2-4"
      // here and "unparseable, serve everything" to R2 — and trusting the classifier alone
      // shipped `206 Content-Range: bytes 0-8/9` carrying all 9 bytes in answer to a
      // request for 3. Same lying-206 class as the unsatisfiable case above.
      const r = await ranged("bytes=2\t-\t4");
      expect(r.status).toBe(200);
      expect(r.headers.get("content-range")).toBeNull();
      expect(r.headers.get("content-length")).toBe("9");
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("LEADING whitespace is stripped before either parser sees it, so only INNER whitespace diverges", async () => {
      // Worth pinning because it bounds the divergence surface. `Headers` strips the
      // optional whitespace around a field value (RFC 9110 §5.5), so "\tbytes=2-4" arrives
      // as "bytes=2-4" and both grammars accept it — the 206 here is correct, not a
      // regression. Only whitespace INSIDE the value (the test above) can reach the two
      // parsers intact and be read differently by them.
      const r = await ranged("\tbytes=2-4");
      expect(r.status).toBe(206);
      expect(r.headers.get("content-range")).toBe("bytes 2-4/9");
    });

    it("space-separated Range stays a 206 — R2 accepts spaces, so the bounds still agree", async () => {
      // The degrade must be driven by actual disagreement, not by giving up on whitespace.
      const r = await ranged("bytes = 2-4");
      expect(r.status).toBe(206);
      expect(r.headers.get("content-range")).toBe("bytes 2-4/9");
      expect(await r.text()).toBe("F-B");
    });

    it("positions above 2^53: an invalid spec is ignored (200), not read as unsatisfiable (416)", async () => {
      // Number() rounds 9007199254740993 down to ...992, so `last < first` read as false and
      // this invalid spec was promoted to "unsatisfiable" → 416. §14.1.2 says ignore it.
      const r = await ranged("bytes=9007199254740993-9007199254740992");
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("a partial body the Worker did not ask for is a 503, never a 206 for bytes nobody requested", async () => {
      // Belt and braces for a future R2 whose grammar accepts something this classifier
      // calls "ignored". The body in hand is a slice of bounds the request never named:
      // a 200 would ship Content-Length: 9 over 3 bytes, and a 206 would carry
      // `Content-Range: bytes 2-4/9` in answer to `bytes=0-1,4-5` — a selected range the
      // client did not select, which §14.4 does not permit. Neither is honest, so the
      // divergence is surfaced as a failure (plus the r2-range-divergence log line) rather
      // than dressed up as a success. Unreachable under today's workerd, which ignores
      // multi-range and returns the whole object.
      const env = makeEnv({
        DOCS_ENV: "production",
        DOCS_PDFS: {
          get: async () => ({
            httpEtag: ETAG, size: 9, uploaded: UPLOADED,
            body: "F-B", range: { offset: 2, length: 3 },
          }),
        } as unknown as R2Bucket,
      });
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: "bytes=0-1,4-5" }, // classifier: ignored
        }),
        env,
      );
      expect(r.status).toBe(503);
      expect(r.headers.get("content-range")).toBeNull();
    });

    // --- §14.2: "GET is the only method for which range handling is defined." ---

    it("HEAD + Range → 200, no Content-Range: Range is ignored on every method but GET", async () => {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          method: "HEAD",
          headers: { "user-agent": "vitest", range: "bytes=0-3" },
        }),
        env,
      );
      expect(r.status).toBe(200);
      expect(r.headers.get("content-range")).toBeNull();
      expect(r.headers.get("content-length")).toBe("9");
    });

    it("POST + an unsatisfiable Range → 200, not 416: the header is ignored, not judged", async () => {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          method: "POST",
          headers: { "user-agent": "vitest", range: "bytes=99-" },
        }),
        env,
      );
      expect(r.status).toBe(200);
      expect(r.headers.get("content-range")).toBeNull();
    });

    // --- §13.2.1: "a server MUST ignore the conditional request header fields defined by
    // this specification when received with a request method that does not involve the
    // selection or modification of a selected representation, such as CONNECT, OPTIONS, or
    // TRACE." Only OPTIONS is testable through worker.fetch() — TRACE and CONNECT are
    // forbidden methods in the fetch spec and `new Request` refuses to construct them. ---

    it("OPTIONS ignores conditionals entirely: neither a failing nor a matching one is judged", async () => {
      // A stale If-Match reached R2 as an onlyIf, came back body-less, and this Worker had
      // no reading of that but 412 — so an OPTIONS carrying a conditional a client had left
      // lying around was refused where the same request without it succeeded.
      const options = (headers: Record<string, string>) => worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          method: "OPTIONS",
          headers: { "user-agent": "vitest", ...headers },
        }),
        r2Env({ "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
              { DOCS_ENV: "production" }),
      );
      expect((await options({ "if-match": '"stale-etag"' })).status).toBe(200);           // not 412
      expect((await options({ "if-unmodified-since": BEFORE_UPLOAD })).status).toBe(200); // not 412
      expect((await options({ "if-none-match": ETAG })).status).toBe(200);                // not 304/412
    });

    // --- RFC 9110 §13.1.5 If-Range. R2's R2Conditional carries only etagMatches /
    // etagDoesNotMatch / uploadedBefore / uploadedAfter, so an If-Range in the forwarded
    // Headers is silently DROPPED and the range applied unconditionally. ---

    async function withIfRange(ifRange: string, rangeHeader: string) {
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" },
      );
      return worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: rangeHeader, "if-range": ifRange },
        }),
        env,
      );
    }

    // --- Abandoned body streams. R2 hands back a body on paths whose response carries
    // none; a stream that is neither sent nor cancelled holds its connection until GC. ---

    it("an unsatisfiable Range cancels the whole-object body it answers 416 without", async () => {
      // The largest abandoned stream on any path here: R2 answers an unsatisfiable Range
      // with the COMPLETE object, which for the 1.3 PDF is 29.2 MiB, and the 416 sends none
      // of it. Cancelling aborts the transfer rather than draining or leaking it.
      const sink = { cancelled: [] as string[] };
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" }, sink,
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: "bytes=99-" },
        }),
        env,
      );
      expect(r.status).toBe(416);
      expect(sink.cancelled).toEqual(["PDF-BYTES"]);
    });

    it("a stale If-Range cancels the sliced body it discards before re-reading", async () => {
      const sink = { cancelled: [] as string[] };
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" }, sink,
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: "bytes=4-", "if-range": '"stale-etag"' },
        }),
        env,
      );
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("PDF-BYTES");
      expect(sink.cancelled).toEqual(["BYTES"]); // the abandoned slice, not the served body
    });

    it("a served body is NEVER cancelled — the cleanup must not reach the response path", async () => {
      const sink = { cancelled: [] as string[] };
      const env = r2Env(
        { "legacy/1.3/vyos-documentation.pdf": { body: "PDF-BYTES" } },
        { DOCS_ENV: "production" }, sink,
      );
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: { "user-agent": "vitest", range: "bytes=4-" }, // satisfiable, honoured
        }),
        env,
      );
      expect(r.status).toBe(206);
      expect(await r.text()).toBe("BYTES");
      expect(sink.cancelled).toEqual([]);
    });

    it("If-Range matching the current ETag → the range is honoured, 206", async () => {
      const r = await withIfRange(ETAG, "bytes=4-");
      expect(r.status).toBe(206);
      expect(r.headers.get("content-range")).toBe("bytes 4-8/9");
      expect(await r.text()).toBe("BYTES");
    });

    it("If-Range naming a STALE ETag → 200 with the complete new representation", async () => {
      // The corruption case. R2 cannot evaluate If-Range, so it applied the range anyway and
      // this returned bytes 4+ of the NEW object under a 206 — a resuming downloader then
      // appends the new tail to its old prefix and silently produces a broken PDF. §13.1.5
      // requires the failed validator to yield the complete representation instead.
      const r = await withIfRange('"stale-etag"', "bytes=4-");
      expect(r.status).toBe(200);
      expect(r.headers.get("content-range")).toBeNull();
      expect(r.headers.get("content-length")).toBe("9");
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("a stale If-Range wins over an unsatisfiable spec → 200, not 416", async () => {
      // Ordering matters: a Range being ignored entirely (§13.1.5) is decided before
      // satisfiability (§14.1.2) is ever judged, so no 416 may escape here.
      const r = await withIfRange('"stale-etag"', "bytes=99-");
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("a WEAK If-Range validator never matches (§13.1.5 requires a strong one)", async () => {
      const r = await withIfRange('W/"pdf-etag-1"', "bytes=4-");
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("an HTTP-date If-Range never matches — this Worker emits no Last-Modified to compare against", async () => {
      const r = await withIfRange(AFTER_UPLOAD, "bytes=4-");
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("an object rewritten between the two If-Range reads is still judged against the request's preconditions", async () => {
      // §13.2.1 requires preconditions to hold for the representation ULTIMATELY SELECTED.
      // The re-read after a stale If-Range was a BARE get(), dropping every other
      // precondition the request carried, so: If-Match passes on read 1, the key is
      // rewritten, and the bare read 2 then answered 200 with the very representation the
      // client's If-Match excluded. The key does get rewritten — `force_pdf_refresh: true`
      // in the legacy snapshot repo's deploy workflow re-uploads it.
      const KEY = "legacy/1.3/vyos-documentation.pdf";
      const objects: Record<string, { body: string; etag?: string }> = {
        [KEY]: { body: "PDF-BYTES", etag: ETAG },
      };
      // Borrow the shared mock, then wrap it so the object changes BETWEEN the two reads.
      type Bucket = { get: (key: string, options?: unknown) => Promise<unknown> };
      const inner = (r2Env(objects) as unknown as { DOCS_PDFS: Bucket }).DOCS_PDFS;
      let reads = 0;
      const env = r2Env(objects, {
        DOCS_ENV: "production",
        DOCS_PDFS: {
          get: async (key: string, options?: unknown) => {
            const result = await inner.get(key, options);
            if (++reads === 1) objects[key].etag = '"pdf-etag-2"'; // rewritten mid-flight
            return result;
          },
        },
      });
      const r = await worker.fetch(
        new Request("https://docs-next.vyos.io/en/1.3/vyos-documentation.pdf", {
          headers: {
            "user-agent": "vitest",
            range: "bytes=4-",
            "if-range": '"stale-etag"', // fails → forces the whole-object re-read
            "if-match": ETAG,           // satisfied on read 1, violated by read 2's object
          },
        }),
        env,
      );
      expect(reads).toBe(2);
      expect(r.status).toBe(412);
      expect(await r.text()).toBe("");
      // The validator reported is the one belonging to the object the verdict was reached on.
      expect(r.headers.get("etag")).toBe('"pdf-etag-2"');
      expect(r.headers.get("content-type")).not.toBe("application/pdf");
    });

    // --- §13.2.2 preconditions, decided by EVALUATING the validators rather than by
    // guessing from which headers are present. ---

    it("If-Match satisfied + If-None-Match satisfied on a GET → 304, not 412", async () => {
      // The inverse of the If-Match-fails case above, and the one presence-inference got
      // wrong: If-Match matches (so step 1 passes) while If-None-Match also matches (so
      // step 3 FAILS) — §13.1.2 owes a 304. Seeing an If-Match header at all returned 412.
      const r = await conditional({
        "if-match": '"pdf-etag-1"',
        "if-none-match": '"pdf-etag-1"',
      });
      expect(r.status).toBe(304);
      expect(await r.text()).toBe("");
    });

    it("If-Modified-Since alone on a non-GET/HEAD → 200: §13.2.2 step 4 never evaluates it", async () => {
      // R2 ANDs every validator it is handed and knows nothing about the method, so
      // forwarding the raw headers made it fail the request on a validator the RFC says to
      // ignore — and the only answer left was a 412. Filtering the conditionals down to the
      // applicable set means the request simply proceeds.
      const r = await conditional({ "if-modified-since": AFTER_UPLOAD }, "POST");
      expect(r.status).toBe(200);
      expect(await r.text()).toBe("PDF-BYTES");
    });

    it("If-Modified-Since alone on a GET IS evaluated → 304", async () => {
      // The other side of the filter: dropping the header for non-GET must not drop it here.
      expect((await conditional({ "if-modified-since": AFTER_UPLOAD })).status).toBe(304);
    });

    it("a satisfied If-Unmodified-Since serves the object; a failed one is 412", async () => {
      expect((await conditional({ "if-unmodified-since": AFTER_UPLOAD })).status).toBe(200);
      expect((await conditional({ "if-unmodified-since": BEFORE_UPLOAD })).status).toBe(412);
    });

    it("If-Match: * matches any existing representation (§13.1.1)", async () => {
      expect((await conditional({ "if-match": "*" })).status).toBe(200);
    });

    it("If-None-Match: * on an existing representation fails → 304 on a GET", async () => {
      expect((await conditional({ "if-none-match": "*" })).status).toBe(304);
    });

    it("If-None-Match matches WEAKLY (§13.1.2 mandates the weak comparison)", async () => {
      // A weak tag from the client must still match a strong stored tag, or every
      // revalidation from a cache that weakened the tag re-downloads 29.2 MiB.
      expect((await conditional({ "if-none-match": 'W/"pdf-etag-1"' })).status).toBe(304);
    });

    it("If-None-Match honours a comma-separated tag list", async () => {
      const r = await conditional({ "if-none-match": '"other", "pdf-etag-1"' });
      expect(r.status).toBe(304);
    });

    it("If-Match compares STRONGLY: a weak tag from the client never satisfies it", async () => {
      expect((await conditional({ "if-match": 'W/"pdf-etag-1"' })).status).toBe(412);
    });
  });

  describe("resolveRange (R2Range is a three-shape union)", () => {
    it("resolves offset+length, length-only, and suffix forms, clamped to the object size", () => {
      expect(resolveRange({ offset: 2, length: 3 }, 10)).toEqual({ start: 2, length: 3 });
      expect(resolveRange({ offset: 4 }, 10)).toEqual({ start: 4, length: 6 });   // to end of object
      expect(resolveRange({ length: 4 }, 10)).toEqual({ start: 0, length: 4 });   // offset defaults to 0
      expect(resolveRange({ suffix: 3 }, 10)).toEqual({ start: 7, length: 3 });   // trailing bytes
      expect(resolveRange({ suffix: 99 }, 10)).toEqual({ start: 0, length: 10 }); // suffix past start clamps
      expect(resolveRange({ offset: 8, length: 99 }, 10)).toEqual({ start: 8, length: 2 }); // length clamps
    });

    it("never returns a negative length, so Content-Length can never go negative", () => {
      // A real R2 binding cannot produce these, but resolveRange is exported and its
      // contract says "clamped to the object size" — that must hold for every input the
      // R2Range type admits, not just the ones observed in practice.
      expect(resolveRange({ offset: 0, length: -5 }, 10)).toEqual({ start: 0, length: 0 });
      expect(resolveRange({ offset: 10, length: 5 }, 10)).toEqual({ start: 10, length: 0 });
      expect(resolveRange({ offset: 99 }, 10)).toEqual({ start: 10, length: 0 });
      expect(resolveRange({ suffix: -3 }, 10)).toEqual({ start: 10, length: 0 });
      expect(resolveRange({ offset: 0, length: 0 }, 0)).toEqual({ start: 0, length: 0 });
    });
  });

  describe("classifyRangeHeader (§14.1.2 satisfiability, re-derived from the client's header)", () => {
    // R2 cannot tell us: it answers unsatisfiable, malformed, multi-range and unknown-unit
    // Range headers identically — with the complete object — which is also exactly what a
    // satisfied whole-object range looks like. Verified against a real R2 binding.
    it("single satisfiable byte ranges → single, with the concrete bounds they select", () => {
      // The bounds are the point: they are what the Worker compares against the bytes R2
      // actually returned before it will promise a 206.
      const cases: Array<[string, number, number]> = [
        ["bytes=0-", 0, 10], ["bytes=5-", 5, 5], ["bytes=0-0", 0, 1],
        ["bytes=-3", 7, 3], ["bytes=0-9", 0, 10],
        ["bytes=5-99", 5, 5],   // last-pos clamps to EOF
        ["bytes=9-", 9, 1],
        ["bytes=-99", 0, 10],   // suffix past the start is the whole object
      ];
      for (const [h, start, length] of cases) {
        expect(classifyRangeHeader(h, 10), h).toEqual({ kind: "single", start, length });
      }
    });

    it("unsatisfiable ranges → unsatisfiable", () => {
      for (const h of ["bytes=10-", "bytes=99-", "bytes=10-20", "bytes=-0"]) {
        // first-pos >= length, or suffix-length 0
        expect(classifyRangeHeader(h, 10), h).toEqual({ kind: "unsatisfiable" });
      }
    });

    it("multi-range, malformed and unknown-unit → ignored (§14.1.2: an invalid spec is ignored)", () => {
      for (const h of ["bytes=0-1,4-5", "bytes=abc", "bytes=-", "items=0-5", "bytes=5-2", ""]) {
        expect(classifyRangeHeader(h, 10), h).toEqual({ kind: "ignored" });
      }
    });

    it("tolerates the case and whitespace variation R2 itself accepts", () => {
      // R2 honours all three of these, so misreading them as "ignored" would downgrade a
      // legitimate 206 to a 200.
      expect(classifyRangeHeader("BYTES=0-5", 10)).toEqual({ kind: "single", start: 0, length: 6 });
      expect(classifyRangeHeader("bytes = 0-5", 10)).toEqual({ kind: "single", start: 0, length: 6 });
      expect(classifyRangeHeader("bytes=0-5 ", 10)).toEqual({ kind: "single", start: 0, length: 6 });
    });

    it("zero-length representation: only a non-zero suffix-range is satisfiable", () => {
      // §14.1.2 states this case explicitly. `bytes=0-` fails first-pos < length (0 < 0).
      expect(classifyRangeHeader("bytes=0-", 0)).toEqual({ kind: "unsatisfiable" });
      // Satisfiable, but it selects zero bytes — no Content-Range can describe an empty
      // selection (§14.4), so the caller's `length > 0` guard sends it to a 200.
      expect(classifyRangeHeader("bytes=-5", 0)).toEqual({ kind: "single", start: 0, length: 0 });
    });

    it("positions above 2^53 compare exactly — an invalid spec stays ignored, not 416", () => {
      // Number() rounds both of these to 9007199254740992, so `last < first` read as false
      // and the spec was promoted from "invalid, ignore it" (§14.1.2 → 200) to
      // "unsatisfiable" (→ 416). Digit-string comparison is exact at any magnitude.
      expect(classifyRangeHeader("bytes=9007199254740993-9007199254740992", 10))
        .toEqual({ kind: "ignored" });
      // ...while a genuinely huge first-pos is still unsatisfiable.
      expect(classifyRangeHeader("bytes=9007199254740993-", 10)).toEqual({ kind: "unsatisfiable" });
      // Leading zeros normalise rather than inflating the digit count.
      expect(classifyRangeHeader("bytes=00000005-00000002", 10)).toEqual({ kind: "ignored" });
      expect(classifyRangeHeader("bytes=0000000002-0000000005", 10))
        .toEqual({ kind: "single", start: 2, length: 4 });
    });

    it("accepts whitespace R2's own parser rejects — the divergence the bounds check absorbs", () => {
      // R2 parses ranges with `/^ *bytes *=/i` + `/^ *(\d+)? *- *(\d+)? *$/` (ASCII space
      // only; miniflare src/workers/shared/range.ts). This classifier's `\s` accepts a tab
      // too, so the two grammars genuinely disagree here. That is tolerated by design: the
      // Worker checks these bounds against the bytes R2 returned, so a spec R2 declined
      // degrades to a 200 rather than to a 206 describing a body nobody asked for. The
      // end-to-end proof is the "tab-separated Range" test below.
      expect(classifyRangeHeader("bytes=2\t-\t4", 10)).toEqual({ kind: "single", start: 2, length: 3 });
      expect(classifyRangeHeader("\tbytes=2-4", 10)).toEqual({ kind: "single", start: 2, length: 3 });
    });
  });
});
