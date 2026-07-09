import { describe, it, expect } from "vitest";
import { loadManifest, buildDispatch } from "../src/manifest";
// The workers pool has no real filesystem (node:fs readFileSync is an unimplemented
// stub — see @cloudflare/vitest-pool-workers/dist/worker/lib/node/fs.mjs); import the
// config as a Vite `?raw` asset instead so the file content is inlined at bundle time.
// eslint-disable-next-line import/no-unresolved
import wranglerJsonc from "../wrangler.jsonc?raw";

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

it("every versions.json binding exists in BOTH apex wrangler envs (§3.4 gate a)", () => {
  const raw = wranglerJsonc.replace(/\/\/.*$/gm, ""); // strip line comments
  const cfg = JSON.parse(raw);
  const bindings = new Set(buildDispatch(loadManifest()).values());
  for (const envName of ["canary", "production"]) {
    const services = new Set((cfg.env[envName].services as { binding: string }[]).map((s) => s.binding));
    for (const b of bindings) expect(services, `${envName} missing ${b}`).toContain(b);
  }
});
