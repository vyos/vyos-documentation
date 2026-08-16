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
    function r2Env(
      objects: Record<string, { body: string; etag?: string }>,
      overrides: Record<string, unknown> = {},
    ) {
      return makeEnv({
        DOCS_PDFS: {
          get: async (key: string, options?: { onlyIf?: Headers; range?: Headers }) => {
            const hit = objects[key];
            if (!hit) return null;
            const etag = hit.etag ?? ETAG;
            const size = hit.body.length;

            // R2 returns a body-less R2Object whenever an onlyIf precondition FAILS, and it
            // never says which one did — that ambiguity is exactly what index.ts has to
            // resolve from the request's own headers (304 family vs 412 family).
            const ifNoneMatch = options?.onlyIf?.get?.("if-none-match");
            if (ifNoneMatch && ifNoneMatch === etag) {
              return { httpEtag: etag, size }; // If-None-Match matched → "not modified"
            }
            const ifMatch = options?.onlyIf?.get?.("if-match");
            if (ifMatch && ifMatch !== etag) {
              return { httpEtag: etag, size }; // If-Match failed → precondition failed
            }

            // The whole-object result. R2 returns this shape for a plain un-ranged get AND
            // — critically — for every Range header it declines to honour. Both verified
            // against a real R2 binding under @cloudflare/vitest-pool-workers.
            const whole = {
              httpEtag: etag, size, body: hit.body, range: { offset: 0, length: size },
            };

            const rangeHeader = options?.range?.get?.("range");
            if (!rangeHeader) return whole;

            const closed = /^bytes=(\d+)-(\d+)$/.exec(rangeHeader);
            if (closed) {
              const offset = Number(closed[1]);
              const last = Number(closed[2]);
              // Observed R2: an int-range with first-pos >= size, or an invalid spec with
              // last < first, is IGNORED — R2 hands back the complete object rather than
              // throwing or returning a zero-length range. (`bytes=10-20` and `bytes=5-2`
              // on a 10-byte object both returned `{offset: 0, length: 10}` + the full body.)
              if (offset >= size || last < offset) return whole;
              const length = Math.min(last, size - 1) - offset + 1; // last-pos clamps to EOF
              return {
                httpEtag: etag,
                size,
                body: hit.body.slice(offset, offset + length),
                range: { offset, length },
              };
            }
            // Suffix form. R2Range is a three-shape union and this arm deliberately returns
            // the RAW `{suffix}` shape rather than pre-normalizing to `{offset, length}` —
            // that is what exercises index.ts's resolveRange(). (workerd itself normalizes,
            // but the type admits this shape, so the Worker must cope with it.)
            const suffix = /^bytes=-(\d+)$/.exec(rangeHeader);
            if (suffix) {
              const n = Math.min(Number(suffix[1]), size);
              if (n === 0) return whole; // observed R2: `bytes=-0` is ignored, not rejected
              return { httpEtag: etag, size, body: hit.body.slice(size - n), range: { suffix: n } };
            }

            // Open-ended (`bytes=5-`), multi-range, malformed or unknown-unit. Observed R2
            // ignores every one of these that it cannot satisfy and returns the whole object.
            const open = /^bytes=(\d+)-$/.exec(rangeHeader);
            if (open) {
              const offset = Number(open[1]);
              if (offset >= size) return whole; // unsatisfiable → ignored
              return {
                httpEtag: etag,
                size,
                body: hit.body.slice(offset),
                range: { offset, length: size - offset },
              };
            }
            return whole;
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
    it("single satisfiable byte ranges → single", () => {
      for (const h of ["bytes=0-", "bytes=5-", "bytes=0-0", "bytes=-3", "bytes=0-9",
                       "bytes=5-99", "bytes=9-"]) {
        expect(classifyRangeHeader(h, 10), h).toBe("single");
      }
    });

    it("unsatisfiable ranges → unsatisfiable", () => {
      expect(classifyRangeHeader("bytes=10-", 10)).toBe("unsatisfiable"); // first-pos == length
      expect(classifyRangeHeader("bytes=99-", 10)).toBe("unsatisfiable");
      expect(classifyRangeHeader("bytes=10-20", 10)).toBe("unsatisfiable");
      expect(classifyRangeHeader("bytes=-0", 10)).toBe("unsatisfiable"); // suffix-length 0
    });

    it("multi-range, malformed and unknown-unit → ignored (§14.1.2: an invalid spec is ignored)", () => {
      for (const h of ["bytes=0-1,4-5", "bytes=abc", "bytes=-", "items=0-5", "bytes=5-2", ""]) {
        expect(classifyRangeHeader(h, 10), h).toBe("ignored");
      }
    });

    it("tolerates the case and whitespace variation R2 itself accepts", () => {
      // R2 honours all three of these, so misreading them as "ignored" would downgrade a
      // legitimate 206 to a 200.
      expect(classifyRangeHeader("BYTES=0-5", 10)).toBe("single");
      expect(classifyRangeHeader("bytes = 0-5", 10)).toBe("single");
      expect(classifyRangeHeader("bytes=0-5 ", 10)).toBe("single");
    });

    it("zero-length representation: only a non-zero suffix-range is satisfiable", () => {
      // §14.1.2 states this case explicitly. `bytes=0-` fails first-pos < length (0 < 0).
      expect(classifyRangeHeader("bytes=0-", 0)).toBe("unsatisfiable");
      expect(classifyRangeHeader("bytes=-5", 0)).toBe("single");
    });
  });
});
