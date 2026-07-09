export interface Env { PREVIEWS: R2Bucket }

const MIME: Record<string, string> = {
  html: "text/html; charset=utf-8", css: "text/css", js: "text/javascript",
  json: "application/json", svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg",
  gif: "image/gif", ico: "image/x-icon", txt: "text/plain; charset=utf-8",
  xml: "application/xml", pdf: "application/pdf", woff2: "font/woff2", woff: "font/woff",
};

export function mimeFor(key: string): string {
  const ext = key.split(".").pop() ?? "";
  return MIME[ext] ?? "application/octet-stream";
}

export function keyFor(pathname: string): string {
  let key = pathname.replace(/^\//, "");
  if (key.endsWith("/") || key === "" ) key += "index.html";
  return key;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const key = keyFor(new URL(request.url).pathname);
    const obj = await env.PREVIEWS.get(key);
    if (!obj) return new Response("preview not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
    return new Response(obj.body, {
      headers: {
        "content-type": obj.httpMetadata?.contentType ?? mimeFor(key),
        "X-Robots-Tag": "noindex",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
} satisfies ExportedHandler<Env>;
