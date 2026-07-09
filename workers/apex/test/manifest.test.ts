import { describe, it, expect } from "vitest";
import { loadManifest, buildDispatch } from "../src/manifest";

describe("versions.json v2 manifest (§3.4)", () => {
  it("loads and validates schema_version 2 with 5 versions", () => {
    const m = loadManifest();
    expect(m.schema_version).toBe(2);
    expect(m.versions).toHaveLength(5);
    expect(m.default_version).toBe("rolling");
  });
  it("every version carries a binding; statuses in dev|lts|eol", () => {
    const m = loadManifest();
    for (const v of m.versions) {
      expect(v.binding).toMatch(/^DOCS_[A-Z0-9_]+$/);
      expect(["dev", "lts", "eol"]).toContain(v.status);
    }
  });
  it("dispatch map: slugs + shared legacy binding", () => {
    const d = buildDispatch(loadManifest());
    expect(d.get("rolling")).toBe("DOCS_ROLLING");
    expect(d.get("1.3")).toBe("DOCS_LEGACY");
    expect(d.get("1.2")).toBe("DOCS_LEGACY");
  });
});
