export interface Env {
  ASSETS: Fetcher;                 // static assets binding
  DOCS_BUILD_SHA: string;          // injected at deploy
  DOCS_ENV: "production" | "canary";
}

export type CacheClass = "page" | "asset";

export function classifyPath(path: string): CacheClass {
  if (path.endsWith(".pdf") || path.includes("/_static/")) return "asset";
  return "page"; // HTML, versions.json, sitemaps, robots/llms, pagefind index
}

export function cacheHeaderFor(cls: CacheClass): string {
  return cls === "asset"
    ? "public, max-age=300, s-maxage=600, must-revalidate"
    : "public, max-age=0, s-maxage=300, must-revalidate";
}

export function withDocsHeaders(
  resp: Response,
  path: string,
  env: Pick<Env, "DOCS_BUILD_SHA" | "DOCS_ENV">,
): Response {
  const out = new Response(resp.body, resp);
  out.headers.set("X-Docs-Build", env.DOCS_BUILD_SHA);
  out.headers.set(
    "Cache-Control",
    env.DOCS_ENV === "canary" ? "no-store" : cacheHeaderFor(classifyPath(path)),
  );
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const resp = await env.ASSETS.fetch(request);
    return withDocsHeaders(resp, url.pathname, env);
  },
} satisfies ExportedHandler<Env>;
