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
      let obj: R2ObjectBody | null;
      try {
        obj = await bucket.get(pdfVersion.pdf_r2_key!);
      } catch (e) {
        console.log(JSON.stringify({ event: "binding-error", binding: "DOCS_PDFS", error: String(e) }));
        return themed(env, 503);
      }
      if (!obj) return themed(env, 404);
      const pdfResp = new Response(obj.body, { headers: { "content-type": "application/pdf" } });
      // Distinct (longer) cache class from apex's default control-response class — this
      // is effectively content, just not content the legacy content Worker can serve.
      return apexHeaders(pdfResp, env, "public, max-age=300, s-maxage=600, must-revalidate");
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
