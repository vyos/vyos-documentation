import { describe, it, expect } from "vitest";
import worker from "../src/index";

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
    expect(await (await get("/kb/article", env)).text()).toBe("kb!");
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
  it("/llms.txt with missing default binding → 503, never 404", async () => {
    const env = makeEnv({ DOCS_ROLLING: undefined });
    expect((await get("/llms.txt", env)).status).toBe(503);
  });
});
