import { describe, it, expect } from "vitest";
// The workers pool has no real filesystem (node:fs readFileSync is an unimplemented
// stub — see @cloudflare/vitest-pool-workers/dist/worker/lib/node/fs.mjs, and confirmed
// empirically here: "readFileSync() is not yet implemented in Workers"). Same constraint
// documented in picker.test.ts and apex/test/manifest.test.ts; import as Vite `?raw` asset
// instead so content is inlined at bundle time — no runtime filesystem access needed.
// eslint-disable-next-line import/no-unresolved
import src from "../../docs/_static/js/pagefind-wrapper.js?raw";

const ns: Record<string, unknown> = {};
new Function("window", src)(ns as never);
const W = (ns as never as { VyOSSearch: Record<string, CallableFunction> }).VyOSSearch;

describe("basePathFor (§9)", () => {
  it("production/canary version path", () => {
    expect(W.basePathFor("/en/rolling/search.html"))
      .toEqual({ base: "/en/rolling/", prefix: "" });
  });
  it("PR preview path keeps /pr-<n>/ prefix and reports it", () => {
    expect(W.basePathFor("/pr-42/en/1.5/search.html"))
      .toEqual({ base: "/pr-42/en/1.5/", prefix: "/pr-42" });
  });
  it("prefixes result URLs in previews", () => {
    expect(W.prefixResultUrl("/en/1.5/cli/index.html", "/pr-42")).toBe("/pr-42/en/1.5/cli/index.html");
    expect(W.prefixResultUrl("/en/1.5/cli/index.html", "")).toBe("/en/1.5/cli/index.html");
  });
});
