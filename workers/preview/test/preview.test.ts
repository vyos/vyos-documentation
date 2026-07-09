import { describe, it, expect } from "vitest";
import { mimeFor, keyFor } from "../src/index";

describe("preview worker helpers (§10)", () => {
  it("derives R2 key from path, defaulting directory to index.html", () => {
    expect(keyFor("/pr-42/en/rolling/")).toBe("pr-42/en/rolling/index.html");
    expect(keyFor("/pr-42/en/rolling/cli/index.html")).toBe("pr-42/en/rolling/cli/index.html");
  });
  it("extension→MIME fallback map (nosniff-safe)", () => {
    expect(mimeFor("a.html")).toBe("text/html; charset=utf-8");
    expect(mimeFor("a.css")).toBe("text/css");
    expect(mimeFor("a.js")).toBe("text/javascript");
    expect(mimeFor("a.json")).toBe("application/json");
    expect(mimeFor("a.svg")).toBe("image/svg+xml");
    expect(mimeFor("a.woff2")).toBe("font/woff2");
    expect(mimeFor("a.unknown")).toBe("application/octet-stream");
  });
});
