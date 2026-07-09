import raw from "../../versions.json";

export interface VersionEntry {
  slug: string; label: string;
  status: "dev" | "lts" | "eol";
  binding: string; aliases: string[];
  pdf: string | null;
}
export interface Manifest {
  schema_version: number;
  default_lang: string; default_version: string;
  languages: { code: string; label: string }[];
  versions: VersionEntry[];
}

export function loadManifest(): Manifest {
  const m = raw as Manifest;
  if (m.schema_version !== 2) throw new Error(`versions.json schema_version ${m.schema_version} != 2`);
  for (const v of m.versions) {
    if (!/^DOCS_[A-Z0-9_]+$/.test(v.binding)) throw new Error(`bad binding for ${v.slug}`);
    if (!["dev", "lts", "eol"].includes(v.status)) throw new Error(`bad status for ${v.slug}`);
  }
  if (!m.versions.some((v) => v.slug === m.default_version))
    throw new Error(`default_version ${m.default_version} not in versions[]`);
  return m;
}

export function buildDispatch(m: Manifest): Map<string, string> {
  return new Map(m.versions.map((v) => [v.slug, v.binding]));
}
