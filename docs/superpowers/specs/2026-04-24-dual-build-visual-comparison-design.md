# Dual-Build Visual Comparison & RST Phase-Out

## Context

The RST→MyST conversion pipeline has converted all three documentation branches (sagitta: 212 files, circinus: 264, current: 254). Before replacing RST with MyST, we need visual verification that the converted pages render identically. Rather than using RTD preview PRs, we run both formats through Sphinx locally and compare the HTML output with Playwright pixel diffing.

## Goal

Merge converted `.md` files alongside existing `.rst` files, build both formats independently, visually compare every page, then delete `.rst` files for pages that pass verification.

## Architecture

### Dual-Build Approach

Both `.rst` and `.md` coexist in `docs/`. Two Sphinx builds run against the same source tree with different `conf.py` configurations:

- **RST build**: `exclude_patterns = ["**/*.md", ...]` → `_build/html-rst/`
- **MyST build**: `exclude_patterns = ["**/*.rst", ...]`, `myst_parser` enabled, `source_suffix = {".md": "markdown"}` → `_build/html-myst/`

Each build sees only one format per page, so `foo.rst` and `foo.md` never conflict.

### Conf.py Strategy

The RST build uses the existing `conf.py` with an added `**/*.md` exclusion. The MyST build uses a separate `_confmyst/conf.py` that:

1. Executes the main `conf.py` via `exec()` (inherits all settings)
2. Appends `myst_parser` to `extensions`
3. Overrides `exclude_patterns` to exclude `**/*.rst`
4. Sets `source_suffix = {".md": "markdown"}`

Verified in POC: this approach works with Sphinx 7.x.

### Index File

`index.rst` is the doctree root. The MyST build requires `index.md` — without it, Sphinx fails with "root file not found". Both `index.rst` and `index.md` must exist simultaneously. The conversion pipeline already produces `index.md`. The toctree entries in both must reference the same document names (Sphinx resolves documents without extension).

### File Merge Strategy

The converted `.md` files exist in worktrees (`myst-sagitta`, `myst-circinus`, `myst-current`) where the `.rst` files were deleted during conversion. To get both formats side-by-side:

1. On the target branch (e.g., `sagitta`), copy all `.md` files from the converted worktree
2. Also copy `_confmyst/conf.py`
3. Commit as "add MyST files alongside RST for visual comparison"

This is a file copy, not a git merge — the converted branches deleted `.rst` files which we need to keep.

## Components

### 1. `scripts/compare_local.py` — Orchestration CLI

Single CLI script that runs the full workflow:

```
python scripts/compare_local.py [--files GLOB] [--threshold FLOAT]
```

Steps:
1. Build RST-only Sphinx → `docs/_build/html-rst/`
2. Build MyST-only Sphinx → `docs/_build/html-myst/`
3. Enumerate HTML pages present in both builds
4. Write page list to temp JSON
5. Invoke `playwright-compare.mjs` with `file://` URLs
6. Classify results: match (≤2%), minor (≤5%), investigate (>5%)
7. Print report and write `scripts/comparison-results.json`

Optional `--files` glob filter to compare a subset.

If either Sphinx build fails (non-zero exit), the script prints the build errors and exits immediately — it does not proceed with missing pages.

#### Playwright Input Contract

`compare_local.py` writes a JSON array for `playwright-compare.mjs`:

```json
[
  {
    "file": "docs/quick-start.md",
    "refUrl": "file:///path/to/docs/_build/html-rst/quick-start.html",
    "testUrl": "file:///path/to/docs/_build/html-myst/quick-start.html"
  }
]
```

The worker returns `[{"file": "...", "diff_pct": 1.2}, ...]` on stdout.

### 2. Playwright Adaptation

The existing `playwright-compare.mjs` already works with `file://` URLs (verified in POC). No code changes needed — it accepts any URL scheme. The `waitUntil: 'networkidle'` setting works on local files (fires after a brief wait with no network activity).

The `[itemprop="articleBody"]` selector targets the page content area, excluding navigation and sidebar. This is important: nav differences between builds (due to different page counts during incremental work) would otherwise inflate diff percentages. With full-tree builds (all pages present in both), the nav is identical and this selector still works correctly.

### 3. `scripts/phase_out.py` — RST Removal

After comparison, a second script removes verified `.rst` files:

```
python scripts/phase_out.py [--status match] [--status minor] [--dry-run]
```

Reads `comparison-results.json`, deletes `.rst` files whose diff_status is in the approved set. Default: deletes only `match`. With `--status minor`: also deletes `minor`. Skips `investigate` unless `--force` is passed.

`--force` allows deleting `.rst` files for `investigate` pages that have been manually reviewed and accepted. Use after visual inspection confirms the diff is acceptable (e.g., intentional rendering improvements, whitespace-only differences).

`--dry-run` lists files that would be deleted without acting.

After all `.rst` files are removed:
- Remove `_confmyst/` directory
- Update `conf.py`: add `myst_parser` to extensions, set `source_suffix = {".md": "markdown"}`
- Remove both exclude patterns: `**/*.md` from the main `conf.py` (added for RST build) and `**/*.rst` from `_confmyst/conf.py` (no longer needed since `_confmyst/` is deleted)

## Workflow Per Branch

```
1. git checkout sagitta
2. Copy all .md files from myst-sagitta worktree
3. Add _confmyst/conf.py
4. git commit -m "add MyST files for visual comparison"
5. python scripts/compare_local.py
6. Review "investigate" pages:
   - If the .md rendering is wrong: fix the .md source, re-run compare_local.py
   - If the diff is acceptable (e.g., intentional improvement): proceed with --force
7. python scripts/phase_out.py --status match --status minor
8. For accepted investigate pages: python scripts/phase_out.py --status investigate --force
9. git commit -m "phase out verified RST files"
10. Repeat step 5-9 until all pages are phased out
11. Clean up: remove _confmyst/, update conf.py for MyST-only
12. git commit -m "complete RST→MyST migration"
```

Repeat for circinus, then current.

## Comparison Report Format

```
=== Visual Comparison Report ===
Total pages: 212
  MATCH (≤2%):       195
  MINOR (2-5%):       12
  INVESTIGATE (>5%):    5

Top investigate pages:
  docs/configuration/firewall/ipv4.md    12.3%
  docs/configexamples/ha.md               8.7%
  ...

Results written to scripts/comparison-results.json
```

`comparison-results.json` schema:

```json
{
  "branch": "sagitta",
  "timestamp": "2026-04-24T21:00:00Z",
  "pages": {
    "quick-start": {
      "rst_html": "docs/_build/html-rst/quick-start.html",
      "myst_html": "docs/_build/html-myst/quick-start.html",
      "diff_pct": 1.2,
      "status": "match"
    }
  },
  "summary": {
    "total": 212,
    "match": 195,
    "minor": 12,
    "investigate": 5
  }
}
```

## Dependencies

- Python 3.9+, Sphinx 7.x, myst-parser
- Node.js, Playwright (chromium), pixelmatch, pngjs
- All already available in the pipeline's `scripts/` directory

## Constraints

- All `.md` files must be present for a fair comparison. Partial copies produce inflated diffs due to missing sidebar/nav entries.
- `index.md` must exist for the MyST build to succeed.
- `_include/*.txt` template files are shared between both formats (RST directives work in both via the vyos.py extension).
- The `_confmyst/` directory must be in `exclude_patterns` for both builds to avoid Sphinx picking it up as content.

## Testing

- Run `compare_local.py` on sagitta first (smallest set, 212 files)
- Verify the quick-start page shows ≤2% diff (POC baseline)
- Spot-check 3-5 "match" pages visually in a browser
- Review all "investigate" pages manually
- After phase-out, run a clean MyST-only Sphinx build and verify no errors

## Open Questions

None — POC validated all mechanics.
