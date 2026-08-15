import { describe, it, expect, vi } from "vitest";
import worker, { resolveRange } from "../src/index";

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

            const rangeHeader = options?.range?.get?.("range");
            const closed = rangeHeader ? /^bytes=(\d+)-(\d+)$/.exec(rangeHeader) : null;
            if (closed) {
              const offset = Number(closed[1]);
              const length = Number(closed[2]) - offset + 1;
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
            const suffix = rangeHeader ? /^bytes=-(\d+)$/.exec(rangeHeader) : null;
            if (suffix) {
              const n = Math.min(Number(suffix[1]), size);
              return { httpEtag: etag, size, body: hit.body.slice(size - n), range: { suffix: n } };
            }

            // NO Range header. Mirrors workerd's real R2 binding, which still reports a
            // whole-object `range` on a plain get (verified locally against a real R2
            // binding under @cloudflare/vitest-pool-workers: `{offset: 0, length: size}`).
            // This is what made the apex PDF path answer 206 to un-ranged GETs.
            return { httpEtag: etag, size, body: hit.body, range: { offset: 0, length: size } };
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
  });
});
