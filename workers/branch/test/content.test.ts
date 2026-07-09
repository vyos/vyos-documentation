import { describe, it, expect } from "vitest";
import { classifyPath, cacheHeaderFor, withDocsHeaders } from "../src/index";

describe("cache classes (§3.3)", () => {
  it("HTML + config class → max-age=0, s-maxage=300", () => {
    for (const p of ["/en/rolling/index.html", "/en/rolling/versions.json",
                     "/en/rolling/sitemap.xml", "/en/rolling/pagefind/pagefind.js"]) {
      expect(cacheHeaderFor(classifyPath(p)))
        .toBe("public, max-age=0, s-maxage=300, must-revalidate");
    }
  });
  it("PDF + _static class → max-age=300, s-maxage=600", () => {
    for (const p of ["/en/rolling/vyos-documentation.pdf", "/en/rolling/_static/css/theme.css"]) {
      expect(cacheHeaderFor(classifyPath(p)))
        .toBe("public, max-age=300, s-maxage=600, must-revalidate");
    }
  });
});

describe("response headers", () => {
  it("adds X-Docs-Build and cache-control; canary forces no-store", () => {
    const base = new Response("ok", { headers: { "content-type": "text/html" } });
    const prod = withDocsHeaders(base, "/en/rolling/index.html",
      { DOCS_BUILD_SHA: "abc123", DOCS_ENV: "production" });
    expect(prod.headers.get("X-Docs-Build")).toBe("abc123");
    expect(prod.headers.get("Cache-Control")).toBe("public, max-age=0, s-maxage=300, must-revalidate");
    const canary = withDocsHeaders(base, "/en/rolling/index.html",
      { DOCS_BUILD_SHA: "abc123", DOCS_ENV: "canary" });
    expect(canary.headers.get("Cache-Control")).toBe("no-store");
  });
});
