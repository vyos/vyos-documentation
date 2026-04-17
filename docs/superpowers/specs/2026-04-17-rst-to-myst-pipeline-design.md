# RST-to-MyST Conversion Pipeline — Design Spec

Reusable, staged conversion pipeline for migrating VyOS documentation branches
from RST to MyST Markdown. Designed for iterative use with a Claude session
in the loop for manual fixes and Playwright visual validation.

Derived from 117 fix commits on PR #1838 (`current` branch migration).
Target branches: `sagitta`, `circinus`, and any future branches.

---

## 1. Architecture

### 1.1 File Layout

```
scripts/
├── pipeline.py              # Runner: orchestrates stages, tracks state
├── convert.py               # Stage 1: RST→MyST conversion
├── postprocess.py           # Stage 2: Fix known rst-to-myst bugs
├── convert_templates.py     # Stage 3: _include/*.txt → MyST syntax
├── validate.py              # Stage 4: Build + Playwright + cross-ref audit
├── playwright-compare.mjs   # Playwright screenshot comparison
├── .rst2myst.yaml           # rst-to-myst directive configuration
├── requirements-convert.txt # Python dependencies (separate from docs)
└── state.json               # Pipeline state: per-file status, diff results
```

The pipeline lives in the conversion branch alongside converted files. It is
removed before final merge to the target branch.

### 1.2 Design Principles

- **Staged**: 4 stages, each runnable separately. Stages 1-3 (convert,
  postprocess, templates) are local operations. Stage 4 (validate) requires
  a pushed branch and RTD preview build — it is always run separately.
  `--stage all` runs stages 1-3 only; validate must be invoked explicitly.
- **Idempotent**: Every stage and fix function is safe to re-run.
- **Stateful**: `state.json` tracks per-file conversion status, tool used,
  diff percentages, manual review flags, and validation metadata across
  iterations.
- **Filterable**: Any stage can target a subset of files by path glob or
  status filter.
- **Claude-in-the-loop**: The pipeline provides conversion + validation.
  A Claude session interprets Playwright results, makes targeted fixes, and
  re-runs validation until all pages match or are explained.
- **Recoverable**: `.rst` files are deleted only after confirmed conversion.
  Infrastructure patches are applied atomically with rollback on failure.
  `state.json` allows resuming from any point after interruption.

### 1.3 State File

`state.json` tracks per-file progress and validation metadata:

```json
{
  "branch": "sagitta",
  "base_commit": "abc1234",
  "pr_number": null,
  "reference_url": "https://docs.vyos.io/en/sagitta",
  "preview_url": null,
  "validation": {
    "baseline_warnings": [],
    "last_warnings": [],
    "new_warnings": [],
    "unresolved_refs": [],
    "orphan_targets": [],
    "last_run": null
  },
  "files": {
    "docs/configuration/firewall/ipv4.md": {
      "rst_source": "docs/configuration/firewall/ipv4.rst",
      "converted_by": "rst-to-myst",
      "conversion_error": null,
      "postprocessed": true,
      "postprocess_counts": {
        "angle_brackets": 12,
        "header_body_blanks": 5,
        "artifact_blanks": 8
      },
      "postprocess_errors": [],
      "diff_pct": 1.2,
      "diff_status": "match",
      "diff_status_reason": null,
      "diff_page_url": "configuration/firewall/ipv4.html",
      "needs_manual_review": [],
      "last_validated": "2026-04-17T14:30:00Z"
    },
    "docs/vpn/openvpn.md": {
      "rst_source": "docs/vpn/openvpn.rst",
      "converted_by": "rst-to-myst",
      "conversion_error": null,
      "postprocessed": true,
      "postprocess_counts": {},
      "postprocess_errors": [],
      "diff_pct": 12.3,
      "diff_status": "investigate",
      "diff_status_reason": null,
      "diff_page_url": "vpn/openvpn.html",
      "needs_manual_review": ["paragraph_breaks", "code_block_blanks"],
      "last_validated": "2026-04-17T15:00:00Z"
    },
    "docs/configuration/protocols/static.md": {
      "rst_source": "docs/configuration/protocols/static.rst",
      "converted_by": "rst-to-myst",
      "conversion_error": null,
      "postprocessed": true,
      "postprocess_counts": {"angle_brackets": 18},
      "postprocess_errors": [],
      "diff_pct": 20.1,
      "diff_status": "improved",
      "diff_status_reason": "6 stop/start_vyoslinter blocks in RST eat cfgcmd body text. MyST renders all content correctly.",
      "diff_page_url": "configuration/protocols/static.html",
      "needs_manual_review": [],
      "last_validated": "2026-04-17T16:00:00Z"
    },
    "docs/troubleshooting/index.md": {
      "rst_source": "docs/troubleshooting/index.rst",
      "converted_by": "failed",
      "conversion_error": "rst-to-myst: heading underline inconsistency line 45; pandoc: unknown directive cfgcmdlist",
      "postprocessed": false,
      "postprocess_counts": {},
      "postprocess_errors": [],
      "diff_pct": null,
      "diff_status": "not_validated",
      "diff_status_reason": null,
      "diff_page_url": null,
      "needs_manual_review": [],
      "last_validated": null
    }
  },
  "templates": {
    "docs/_include/interface-address.txt": {
      "converted": true,
      "conversion_error": null,
      "is_aggregator": false,
      "shared_fixes_applied": true,
      "shared_fix_errors": []
    },
    "docs/_include/interface-common-with-dhcp.txt": {
      "converted": true,
      "conversion_error": null,
      "is_aggregator": true,
      "shared_fixes_applied": true,
      "shared_fix_errors": []
    }
  }
}
```

**Field reference:**

| Field | Type | Description |
|---|---|---|
| `branch` | string | Target branch being converted |
| `base_commit` | string | Commit the conversion branch was forked from |
| `pr_number` | int/null | PR number once created (used to derive preview URL) |
| `reference_url` | string | RST reference build URL for Playwright comparison |
| `preview_url` | string/null | RTD preview URL (derived from `pr_number`) |
| `validation.baseline_warnings` | list | Warning set from first build; each entry: `{"file": "...", "line": N, "message": "..."}`. Set once, never updated. |
| `validation.last_warnings` | list | Warning set from most recent build (same format) |
| `validation.new_warnings` | list | Warnings in `last_warnings` not in `baseline_warnings` (computed by matching file+line+message) |
| `validation.unresolved_refs` | list | `{ref}` references with no matching target |
| `validation.orphan_targets` | list | `(label)=` targets with no matching ref |
| `files.*.rst_source` | string | Original RST path (for `git show` comparison) |
| `files.*.converted_by` | enum | `rst-to-myst`, `pandoc`, or `failed` |
| `files.*.conversion_error` | string/null | Error message if conversion failed |
| `files.*.postprocess_counts` | object | Per-function change counts (for reporting) |
| `files.*.postprocess_errors` | list | Function names that failed on this file (section 7.3) |
| `files.*.diff_page_url` | string/null | HTML page path for Playwright URL construction |
| `files.*.diff_status_reason` | string/null | Rationale when Claude sets `improved` or overrides status |
| `files.*.needs_manual_review` | list | Categories: `paragraph_breaks`, `code_block_blanks` |
| `templates.*.converted` | bool | Whether RST→MyST conversion completed |
| `templates.*.conversion_error` | string/null | Error message if conversion failed |
| `templates.*.is_aggregator` | bool | Whether template includes other templates |
| `templates.*.shared_fixes_applied` | bool | Whether Stage 2 shared fixes have run |
| `templates.*.shared_fix_errors` | list | Stage 2 function names that failed on this template |

`diff_status` values (stored lowercase, displayed uppercase in reports):
`match` (0-2%), `minor` (2-5%), `investigate` (>5%),
`improved` (known RST rendering bug), `not_validated`.

---

## 2. Stage 1: `convert.py`

Converts `.rst` files to `.md` using rst-to-myst as the primary tool, with
Pandoc as fallback for files that fail.

### 2.1 Flow

```
For each .rst file in docs/:
  1. Try rst-to-myst
  2. If fails → try pandoc -f rst -t markdown_myst --wrap=preserve
  3. If both fail → log error, skip file, mark as "failed" in state.json
  4. Record converter used (rst-to-myst | pandoc | failed)
  5. Delete original .rst only after successful conversion
```

### 2.2 rst-to-myst Configuration

Ships `.rst2myst.yaml` with VyOS directive mappings:

```yaml
language: en
sphinx: true
extensions:
  - colon_fence
  - deflist
  - fieldlist
directive_data:
  cfgcmd:     { argument: null, body: parse_content, options: null }
  opcmd:      { argument: null, body: parse_content, options: null }
  cmdinclude: { argument: direct, body: null, options: null }
  cfgcmdlist: { argument: null, body: null, options: null }
  opcmdlist:  { argument: null, body: null, options: null }
```

### 2.3 Pandoc Fallback

Invoked when rst-to-myst fails (typically heading underline inconsistencies
or parse errors):

```bash
pandoc -f rst -t markdown_myst --wrap=preserve file.rst -o file.md
```

Files converted by Pandoc are tagged `converted_by: pandoc` in `state.json`.
Post-processing stage 2 runs Pandoc-specific artifact cleanup on these files.

### 2.4 Infrastructure Patches

On first run only (skipped if already applied), the script applies:

- **`docs/conf.py`**: `myst_enable_extensions`, `myst_fence_as_directive`,
  `source_suffix` flip to `['.md', '.rst']`
- **`docs/_ext/vyos.py`**: linter marker stripping in `CmdInclude.run()`
  (`cmdincludemd` directive)

Detection: checks if `myst_fence_as_directive` already exists in `conf.py`.

---

## 3. Stage 2: `postprocess.py`

Ten fix functions addressing known rst-to-myst bugs. Each function is
independently callable, idempotent, and returns a count of changes made.

### 3.1 Execution Order

Functions run in dependency order — some fixes depend on others being
applied first.

| # | Function | Category | Est. Count | Depends On |
|---|----------|----------|------------|------------|
| 1 | `fix_cmdinclude_rename` | cmdinclude → cmdincludemd | 73 + 48 aggregator | — |
| 2 | `fix_angle_brackets` | `<param>` → `\<param\>` in directive args | ~2,700 | — |
| 3 | `fix_header_body_blanks` | Insert blank line between cfgcmd header and body | ~2,200 | — |
| 4 | `fix_artifact_blanks` | Remove double blank lines inside bodies | ~3,300 | step 3 |
| 5 | `fix_inline_roles` | `:ref:` → `{ref}`, `:rfc:` → `{rfc}`, etc. | ~100 | — |
| 6 | `fix_label_hyphens` | `(label-name)=` → `(label_name)=` where refs use underscores | ~17 | step 5 |
| 7 | `fix_split_admonitions` | Rejoin split note/warning directives | ~74 | step 3 |
| 8 | `fix_structural_blanks` | Insert blanks before/after headings, fences, directives, tables | ~4,100 | step 4 |
| 9 | `fix_linter_markers` | Remove `% stop/start_vyoslinter` from `.md` files | ~200 | — |
| 10 | `fix_pandoc_artifacts` | Strip `{#heading-id}`, `{.interpreted-text}`, bare colon fences | varies | — |

Step 10 only runs on files where `state.json` says `converted_by: pandoc`.

### 3.2 Function Specifications

**`fix_cmdinclude_rename`**

Replaces `cmdinclude` with `cmdincludemd` in all `.md` files. Matches both
backtick-fence form (`` ```{cmdinclude} ``) and any remaining RST-style form.

**`fix_angle_brackets`**

Escapes `<param>` as `\<param\>` on cfgcmd/opcmd directive argument lines
only (lines starting with `` ```{cfgcmd} ``, `` ```{opcmd} ``, or
`::::{cfgcmd}`, `::::{opcmd}`).

Edge cases:
- `<address | dhcp | dhcpv6>` — pipe-separated alternatives, escape entire group
- `<0-65535>` — numeric ranges
- `<label-value>/<0-65535>/<no-php-flag>` — slash-separated compound params
- URLs like `<https://...>` — skip (MyST autolinks)
- Already-escaped `\<param\>` — skip
- HTML-like tags `<br>`, `<div>` — skip (not expected in directive args,
  but guard against false positives)
- `< throughput | latency >` — VyOS uses this form with leading space;
  handled by optional `\s*` after `<`

Regex pattern (covers words, hyphens, dots, digits, slashes, pipes):
```python
# Only apply to directive argument lines
if re.match(r'^(`{3,}\{(?:cfgcmd|opcmd)\}|:{4,}\{(?:cfgcmd|opcmd)\})', line):
    line = re.sub(
        r'(?<!\\)<\s*([\w][\w\-./]*)(\s*\|[^>]*)?\s*>',
        r'\\<\1\2\\>',
        line
    )
```

The regex:
- Requires first non-space character after `<` to be a word character,
  which excludes URLs (`<https://`) and HTML tags
- Allows optional whitespace after `<` and before `>` to handle
  `< throughput | latency >` forms
- Captures pipe-separated alternatives as a group
- Skips already-escaped `\<` via negative lookbehind

Edge cases not covered by the regex are caught during Playwright
validation and fixed by the Claude session.

**`fix_header_body_blanks`**

After a `` ```{cfgcmd} `` or `` ```{opcmd} `` line, if the next non-blank
line is not `` ``` `` (close fence), insert a blank line between the
directive line and body text. This ensures `CmdDirective.run()` correctly
splits title from body.

**`fix_artifact_blanks`**

Remove consecutive blank lines within fenced directive bodies. Single blank
lines between content blocks are preserved; double (or more) blank lines
are artifacts.

**`fix_inline_roles`**

Convert RST inline roles to MyST:

| RST | MyST |
|-----|------|
| `` :ref:`label` `` | `` {ref}`label` `` |
| `` :rfc:`1234` `` | `` {rfc}`1234` `` |
| `` :cfgcmd:`cmd` `` | `` {cfgcmd}`cmd` `` |
| `` :opcmd:`cmd` `` | `` {opcmd}`cmd` `` |
| `` :abbr:`FOO (Full)` `` | `` {abbr}`FOO (Full)` `` |

**`fix_label_hyphens`**

rst-to-myst converts `.. _label_name:` to `(label-name)=`, replacing
underscores with hyphens. This function:
1. Collects all `{ref}` references across all `.md` files
2. Collects all `(label)=` targets
3. Where a ref uses underscores and the target uses hyphens, renames the
   target back to underscores

**`fix_split_admonitions`**

Detects admonitions (note, warning, hint, tip, seealso) that have been split
into multiple directives or had content moved outside the directive. This is
a purely heuristic, local-only function — it does NOT consult RST originals.
It rejoins by looking for patterns like:
- `:::` close followed immediately by `:::{note}` open with related content
  (two consecutive same-type admonitions that were originally one)
- Content paragraph immediately after `:::` close that belongs inside the
  directive (detected by indentation and proximity)

Cases the heuristic cannot resolve are caught during Playwright validation
and fixed by the Claude session with RST comparison.

**`fix_structural_blanks`**

Inserts blank lines where MyST requires them:
- Before and after headings (`#`, `##`, etc.)
- Before and after code fences (`` ``` ``)
- Before and after directives (`:::`)
- Before and after pipe tables (`| ... |`)

Scans for violations (e.g., heading immediately followed by directive with
no blank line) and inserts the required blank line.

**`fix_linter_markers`**

Removes all `% stop_vyoslinter` and `% start_vyoslinter` lines from `.md`
files. The doc-linter only runs on `.rst` and `.txt` files — these markers
are dead code in `.md` files.

**`fix_pandoc_artifacts`**

Only runs on files tagged `converted_by: pandoc` in `state.json`. Removes:
- Heading anchor IDs: `## Heading {#heading-id}` → `## Heading`
- Interpreted-text roles: `[text]{.interpreted-text role="ref"}` → `` {ref}`text` ``
- Bare colon fences (`::: {.note}` → `:::{note}`)

### 3.3 Not Automated (Claude Session)

Two categories require RST original comparison and are flagged in `state.json`
by adding the category name to the `needs_manual_review` list (e.g.,
`["paragraph_breaks"]` or `["paragraph_breaks", "code_block_blanks"]`):

**False paragraph breaks** (~195 in `current`):
rst-to-myst inserts blank lines at sentence boundaries inside paragraphs.
Heuristic detection (sentence ends with period, next line starts with
capital) produces false positives. Requires comparison with RST original:
`git show origin/{branch}:docs/path.rst`.

**Code block internal blank lines** (~220 lines in `current`):
rst-to-myst strips ALL blank lines from inside code blocks. Restoring them
requires matching each code block between MD and RST sources. Files with
many code blocks are flagged.

---

## 4. Stage 3: `convert_templates.py`

Converts `_include/*.txt` template files from RST syntax to MyST syntax.

### 4.1 Conversion Rules

| RST pattern | MyST replacement |
|---|---|
| `.. cfgcmd:: command` | `::::{cfgcmd} command` |
| `.. opcmd:: command` | `::::{opcmd} command` |
| `.. code-block:: none` | `` ```none `` ... `` ``` `` |
| `.. note::` (inside cfgcmd) | `:::{note}` ... `:::` |
| `.. warning::` (inside cfgcmd) | `:::{warning}` ... `:::` |
| `.. seealso::` | `:::{seealso}` ... `:::` |
| Indented body (3-space RST) | 0-indent (MyST) |
| `<param>` in directive args | `\<param\>` |
| Implicit directive close (RST) | Explicit `::::` close fence |

### 4.2 Aggregator Template Detection

Templates that include other templates via `.. cmdinclude::` are identified
and converted to `cmdincludemd`:

```
# Before (RST)
.. cmdinclude:: /_include/interface-address.txt
   :var0: {{ var0 }}

# After (MyST)
` ``{cmdincludemd} /_include/interface-address.txt
:var0: {{ var0 }}
` ``
```

### 4.3 Preserved Patterns

- `.. stop/start_vyoslinter` markers OUTSIDE `::::` fences — these are
  stripped at runtime by `vyos.py` and must remain as RST comments
- Variable substitution syntax: `{{ var0 }}`, `{{ var1 }}`

### 4.4 Shared Fixes with Stage 2

Stage 3 handles its own conversion (RST directives → colon fences), but
some fix categories from Stage 2 also apply to templates:

| Stage 2 function | Applies to templates? | Notes |
|---|---|---|
| `fix_angle_brackets` | Yes | Same escaping needed in `::::` directive args |
| `fix_header_body_blanks` | Yes | Same blank line rule for `::::` directives |
| `fix_artifact_blanks` | Yes | Same double-blank-line cleanup |
| `fix_structural_blanks` | Yes | Same rules for headings/fences/directives |
| `fix_inline_roles` | No | Templates don't use inline roles |
| `fix_label_hyphens` | No | Templates don't define labels |
| `fix_split_admonitions` | Partially | Templates rarely have multi-paragraph admonitions |
| All others | No | `.md`-specific |

`convert_templates.py` calls the relevant Stage 2 functions directly
(imported from `postprocess.py`) after performing its RST→colon-fence
conversion. This avoids duplicating logic.

### 4.5 Discovery

Templates are discovered by scanning `_include/` rather than using a
hardcoded file list. 26 templates in `current`; older branches may differ.

---

## 5. Stage 4: `validate.py`

Three validation steps, run sequentially. Results written to `state.json`
and printed as a summary report.

**This stage is always run separately from stages 1-3.** It requires a
pushed branch and a completed RTD preview build. `--stage all` does NOT
include this stage.

### 5.1 Sphinx Build

```bash
cd docs && make html 2>&1
```

- Parses Sphinx stderr, extracts warnings as `{"file", "line", "message"}`
  objects
- On first run: stores warning set as `validation.baseline_warnings`
- On subsequent runs: computes `new_warnings` = warnings in current build
  not present in `baseline_warnings` (matched by file + line + message)
- Stores current warning set as `validation.last_warnings`
- Report shows: total count, baseline count, new count, new warning details
- Fails stage if build errors (not warnings) exist

### 5.2 Cross-Reference Audit

- Scans all `.md` files AND `_include/*.txt` templates for
  `` {ref}`label` `` references (templates are rendered into docs and
  can contain broken refs)
- Scans all `.md` files for `(label)=` targets
- Reports unresolved references (ref without matching target)
- Reports orphan targets (informational only)
- Stores results in `validation.unresolved_refs` and
  `validation.orphan_targets`

### 5.3 Playwright Visual Diff

**Prerequisites:**
- Branch pushed to remote
- PR created (PR number stored in `state.json` as `pr_number`)
- RTD preview build complete

**Reference URL derivation by branch:**

| Branch | Reference URL |
|--------|--------------|
| `current` | `https://docs.vyos.io/en/latest` |
| `sagitta` | `https://docs.vyos.io/en/sagitta` |
| `circinus` | `https://docs.vyos.io/en/circinus` |
| other | `https://docs.vyos.io/en/{branch}` |

Stored in `state.json` as `reference_url`. Set automatically from `branch`
field on first run; can be overridden via `--reference-url` CLI flag.

**Preview URL derivation:**

```
https://vyos--{pr_number}.org.readthedocs.build/en/{pr_number}/
```

Stored in `state.json` as `preview_url`. Derived from `pr_number`.

**RTD build polling:**

Before launching Playwright, the script confirms the preview build is
current using the ReadTheDocs API:

```
GET https://readthedocs.org/api/v3/projects/vyos/builds/?version={pr_number}&ordering=-date&limit=1
```

1. Fetch the latest build for the PR version
2. Check `build.commit` matches the local `HEAD` SHA (`git rev-parse HEAD`)
3. Check `build.state.code == "finished"` and `build.success == true`
4. If build is pending/building or commit doesn't match → wait 30 seconds,
   retry
5. If no build exists for this version → error with instructions to push
   and create PR first
6. Timeout after 10 minutes with error

If the RTD API is unavailable (auth required, rate limited), fall back to
HTTP polling:
1. Fetch `{preview_url}` with HTTP GET
2. If 404 or response contains "building" → wait 30 seconds, retry
3. Timeout after 10 minutes with error

The API approach is preferred because it gives a deterministic commit-SHA
match. The HTTP fallback only confirms the build exists, not that it
reflects the latest push.

**Page URL construction:**

The page list for Playwright is generated from `state.json`, not a
hardcoded file. `diff_page_url` is set during Stage 1 conversion using
these mapping rules:

| Source path | `diff_page_url` | Rule |
|---|---|---|
| `docs/configuration/firewall/ipv4.md` | `configuration/firewall/ipv4.html` | Strip `docs/` prefix, replace `.md` with `.html` |
| `docs/configuration/firewall/index.md` | `configuration/firewall/index.html` | Same rule — `index.md` maps to `index.html` |
| `docs/index.md` | `index.html` | Root index |
| `docs/coverage.md` | `coverage.html` | Top-level pages |

The mapping is: `diff_page_url = source_path.removeprefix("docs/").replace(".md", ".html")`

**Exclusions** (no `diff_page_url`, skipped by Playwright):
- Files with `converted_by: failed` (no `.md` to build from)
- Files that are not Sphinx pages (e.g., `_include/*.txt` templates —
  these are included into other pages, not rendered as standalone HTML)

**URL construction for Playwright:**
- Reference URL: `{reference_url}/{diff_page_url}`
- Test URL: `{preview_url}/{diff_page_url}`

When `--filter investigate` is used, only files with `diff_status: investigate`
are included in the Playwright run.

**Execution:**

- Runs `playwright-compare.mjs` in parallel (10 batches of 25 pages)
- Selector: `[itemprop="articleBody"]` — pure content, no nav/chrome
- Writes per-page `diff_pct` and `diff_status` back to `state.json`

**Classification:**

| Status | Diff Range | Action |
|--------|-----------|--------|
| MATCH | 0-2% | None |
| MINOR | 2-5% | Review, likely acceptable |
| INVESTIGATE | >5% | Claude session must investigate |
| IMPROVED | any % | Known RST rendering bug, diff is positive |

`IMPROVED` status is set manually by the Claude session after investigation
confirms the diff is a rendering improvement. The pipeline does not
auto-classify pages as IMPROVED.

### 5.4 Report Format

```
=== Validation Report ===
Build: OK (92 warnings total, 89 baseline, 3 new)
  NEW: docs/vpn/openvpn.md:45: duplicate label 'vpn_openvpn'
  NEW: docs/protocols/bgp.md:112: unknown role 'cfgcmd'
  NEW: docs/system/login.md:88: undefined label 'system-login'
Cross-refs: 3 unresolved
  - {ref}`missing_label` in docs/vpn/openvpn.md:45
  - {ref}`another_label` in docs/system/login.md:112
  - {ref}`third_label` in docs/protocols/bgp.md:203
Visual diff: 240 MATCH, 8 MINOR, 5 INVESTIGATE, 3 IMPROVED
Files needing attention:
  - docs/configuration/vpn/openvpn.md       (12.3% - INVESTIGATE)
  - docs/configuration/protocols/bgp.md     ( 3.1% - MINOR)
  - docs/configuration/protocols/static.md  (20.1% - IMPROVED)
Needs manual review: 32 files (code block blanks), 71 files (paragraph breaks)
```

---

## 6. Pipeline Runner: `pipeline.py`

### 6.1 CLI Interface

```bash
# Stages 1-3 (convert + postprocess + templates) — local operations
python scripts/pipeline.py --stage all

# Individual stages
python scripts/pipeline.py --stage convert
python scripts/pipeline.py --stage postprocess
python scripts/pipeline.py --stage templates

# Stage 4 — requires push + RTD build first; always run separately
python scripts/pipeline.py --stage validate

# Target specific files
python scripts/pipeline.py --stage postprocess --files "docs/configuration/vpn/*.md"

# Re-validate only files with INVESTIGATE status
python scripts/pipeline.py --stage validate --filter investigate

# Show current state summary
python scripts/pipeline.py --status
```

### 6.2 Status Output

```
=== Pipeline Status ===
Converted: 254/254 (rst-to-myst: 252, pandoc: 2)
Post-processed: 254/254
Templates: 26/26
Validation:
  MATCH:         240
  MINOR:           8
  INVESTIGATE:     5
  IMPROVED:        3
  Not validated:   1
Needs manual review: 32 (code block blanks), 71 (paragraph breaks)
```

### 6.3 Iteration Workflow (Claude Session)

```
 1. Claude runs: pipeline.py --stage all
    (runs stages 1-3: convert, postprocess, templates)
 2. Claude commits converted files, creates PR, pushes branch
 3. Claude sets pr_number in state.json
 4. Claude runs: pipeline.py --stage validate
    (builds locally, audits cross-refs, polls RTD, runs Playwright)
 5. Claude reads validation report
 6. For each INVESTIGATE page:
    - Reads the .md file
    - Compares against RST original (git show origin/{branch}:docs/path.rst)
    - Identifies issue category
    - Applies fix
 7. Claude commits fixes, pushes
 8. Claude runs: pipeline.py --stage validate --filter investigate
 9. Repeat 6-8 until no INVESTIGATE pages remain
10. Review MINOR pages, decide if acceptable
11. Final commit, remove scripts/ directory
```

---

## 7. Failure Modes and Recovery

### 7.1 Conversion Failure (Stage 1)

| Failure | Behavior |
|---------|----------|
| rst-to-myst fails on a file | Falls back to Pandoc automatically |
| Both rst-to-myst and Pandoc fail | File marked `converted_by: failed` with error in `conversion_error`; `.rst` file NOT deleted; pipeline continues with remaining files |
| All files fail | Pipeline aborts with summary of errors |

Failed files appear in `--status` output and validation report. The Claude
session can attempt manual conversion or investigate the error.

### 7.2 Infrastructure Patch Failure (Stage 1)

`conf.py` and `vyos.py` patches are applied atomically:

1. Read current file content
2. Check if patch already applied (idempotent guard)
3. If not applied: validate expected content exists (e.g., the line to
   patch after), apply patch, verify result
4. If expected content is missing (different branch version): abort with
   descriptive error, do NOT partially patch

**Partial patch detection:** On startup, `convert.py` checks for
inconsistent state (e.g., `myst_fence_as_directive` present but
`cmdincludemd` linter stripping missing). If detected, reports the
inconsistency and aborts.

### 7.3 Post-Processing Failure (Stage 2)

Each fix function is independent. If one fails on a specific file:
- Error logged with file path and traceback
- Failed function name added to `files.*.postprocess_errors` in `state.json`
- `files.*.postprocessed` remains `false` until all functions succeed
- Pipeline continues with remaining files and functions
- `--status` shows which files have incomplete post-processing

### 7.4 Template Conversion Failure (Stage 3)

Template conversion and shared fix application are tracked independently:

| Failure | Behavior |
|---------|----------|
| RST→colon-fence conversion fails | `templates.*.converted` stays `false`; error in `conversion_error`; pipeline continues |
| Shared Stage 2 fix fails on template | Fix function name added to `shared_fix_errors`; `shared_fixes_applied` stays `false`; pipeline continues |
| All templates fail | Pipeline reports summary; Claude session investigates |

Re-running `--stage templates` retries failed templates and re-applies
shared fixes where `shared_fixes_applied` is `false`. Successfully
converted templates are skipped (idempotent).

### 7.5 Validation Failure (Stage 4)

| Failure | Behavior |
|---------|----------|
| Sphinx build errors | Stage aborts; errors reported; no Playwright run |
| RTD build not ready after 10 min | Stage aborts with timeout error |
| Playwright fails on specific pages | Pages marked `not_validated`; others proceed |
| Reference URL returns 404 | Abort with error suggesting `--reference-url` override |

### 7.6 Dependency Checks

`pipeline.py` checks for required tools on startup:

```
rst-to-myst --version    → required for Stage 1
pandoc --version          → required for Stage 1 fallback (warn if missing)
npx playwright --version  → required for Stage 4 only
```

Pandoc version must be >= 2.19 (first version with `markdown_myst` output
format). If older, warn and skip Pandoc fallback.

---

## 8. Dependencies

Listed in `requirements-convert.txt` (separate from docs `requirements.txt`):

```
rst-to-myst[sphinx]>=0.4.0
```

System dependencies (not pip-installable):
- `pandoc` (system package)
- `playwright` (npm: `npx playwright install chromium`)
- Python 3.9+

---

## 9. Scope and Limitations

### 9.1 Automated (~87% of changes from PR #1838)

The 10 post-processing functions cover approximately 13,000 of the ~15,000
individual changes made during the `current` branch migration.

### 9.2 Claude Session (~13% of changes)

Two categories require human/AI judgment:
- False paragraph breaks: ~195 in `current`, requires RST comparison
- Code block internal blanks: ~220 lines in `current`, requires code block
  matching between sources

### 9.3 Branch Variation

Older branches may contain:
- Different files not present in `current`
- Additional RST patterns not encountered during the `current` migration
- Different heading hierarchies or directive usage

The pipeline handles this by:
- Discovering files dynamically (no hardcoded file lists)
- Pandoc fallback for files rst-to-myst cannot parse
- Validation step catches new issue patterns via Playwright diff
- `state.json` tracks everything for the Claude session to act on
