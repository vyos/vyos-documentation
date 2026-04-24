# Post-Conversion Fix Catalog

Analysis of all manual fixes applied after RST→MyST pipeline conversion, across three branches:
- `feat/rst-to-myst-migration` → `pr-1838` (current, manual + pipeline hybrid)
- `yuriy/automated-rst-to-myst` (circinus, pipeline-based)
- `myst/sagitta-wip` (sagitta, pipeline-based, freshly converted 2026-04-24)

## Key Finding

The `feat/rst-to-myst-migration` branch was converted **before** the pipeline existed (manual conversion ~April 2026). The pipeline's postprocess.py was built **after** that branch, based on lessons from it. Most `pr-1838` fixes are already handled by existing postprocess.py functions — they were needed only because the pre-pipeline conversion never ran postprocess.

However, several fix categories are **not** in postprocess.py and reproduce in new conversions (confirmed in the fresh sagitta conversion).

## Gap Analysis

### Already automated — working correctly

| Fix pattern | postprocess.py function | Evidence |
|---|---|---|
| Angle brackets `<text>` → `\<text\>` on cfgcmd/opcmd lines | `fix_angle_brackets` | pr-1838 bbc8649f (pre-pipeline branch) |
| Missing blank line between cfgcmd/opcmd opening and body | `fix_header_body_blanks` | pr-1838 a18fe0d8, 44319664, 167909b5 (pre-pipeline branch) |
| Double blank lines inside cfgcmd/opcmd bodies | `fix_artifact_blanks` | feat/rst-to-myst 111e0c25 (pre-pipeline branch, 161 files) |
| RST inline roles `:ref:` → `{ref}` | `fix_inline_roles` | Already converted |
| Split admonitions (same-kind note/note → merged) | `fix_split_admonitions` | Already handled |
| Missing blank lines around headings/directives/tables | `fix_structural_blanks` | Already handled |
| Linter markers (`stop/start_vyoslinter`) removal | `fix_linter_markers` | Already handled |
| Pandoc artifacts (anchors, interpreted-text, colon fences) | `fix_pandoc_artifacts` | Already handled |
| Label hyphen→underscore rename | `fix_label_hyphens_across` | Already handled (cross-file pass) |

### Already automated — regex gap

| Fix pattern | postprocess.py function | Gap | Impact |
|---|---|---|---|
| Angle brackets with colons: `<h:h:h:h:h:h:h:h>`, `<GA:LDP1:LDP2>`, `<asn:nn>`, `<0-65535:0-65535>` | `fix_angle_brackets` | Regex `[\w\-./]*` doesn't include `:` character | 4 patterns missed per file containing IPv6 or ASN notation |

**Fix**: Change `ANGLE_BRACKET_RE` character class from `[\w\-./]*` to `[\w\-./:]* ` (add colon).

### NOT automated — should add to postprocess.py

#### 1. Blockquoted fenced code blocks (`> ```none`)

- **Source**: circinus d3b56d3f (13 files), **confirmed in sagitta: 74 occurrences**
- **Root cause**: rst-to-myst converts RST blockquote-indented code blocks into Markdown blockquotes containing fenced code (`> ```none ... > ````) instead of plain code blocks
- **Fix**: Strip `> ` prefix from lines inside blockquote-wrapped fences
- **Automation**: Regex-feasible. Detect `^> ``` ` pattern, unwrap all lines until matching `> ``` ` close
- **Priority**: HIGH — affects 74 code blocks in sagitta, confirmed rendering regression

#### 2. RST line-block backslash → Markdown list

- **Source**: feat/rst-to-myst f7740bfa (3 autotest files), **confirmed in sagitta: 5 occurrences**
- **Root cause**: rst-to-myst converts RST `| line` blocks to `text\` (trailing backslash = hard line break), but the autotest metadata (Testdate/Version) should be a bullet list
- **Pattern**: `^Testdate: YYYY-MM-DD\` and `^Version: text\` at start of autotest files
- **Fix**: Replace `text\` with `- text` for these metadata lines
- **Automation**: Regex-feasible. Match `^(Testdate|Version):.*\\$` → prepend `- `, strip `\`
- **Priority**: MEDIUM — only affects autotest files (5 files)

#### 3. `{ref}`/`{doc}` inside `{eval-rst}` blocks must stay as `:ref:`/`:doc:`

- **Source**: circinus 7ab367ed (42 replacements, 12 files)
- **Root cause**: `fix_inline_roles` converts `:ref:` → `{ref}` globally, including inside `{eval-rst}` blocks where content is parsed as RST. MyST `{ref}` syntax is literal text to the RST parser.
- **Fix**: `fix_inline_roles` must skip content inside `{eval-rst}` fenced blocks
- **Automation**: Feasible — use `find_fenced_blocks()` to identify eval-rst regions, exclude them from the regex substitution
- **Priority**: HIGH for circinus/current (42 instances); N/A for sagitta (no eval-rst blocks)
- **Note**: Sagitta has 0 eval-rst blocks so this doesn't affect it currently

#### 4. `{ref}`/`{doc}` inside cfgcmd/opcmd bodies → pending_xref crash

- **Source**: feat/rst-to-myst e0c6e59e (8 files), 7baf7a51 (1 file)
- **Root cause**: The CmdDirective uses `nested_parse()` on body content. `{ref}` and `{doc}` create pending_xref nodes that crash during HTML write because they're in a custom node tree, not a standard document tree.
- **Fix**: Replace `{ref}`/`{doc}` with plain text or `[text](file.md)` links inside cfgcmd/opcmd bodies. BUT even Markdown links inside cfgcmd bodies also crash (per e0c6e59e commit message).
- **Automation**: Partially feasible — can detect `{ref}`/`{doc}` inside cfgcmd/opcmd fenced blocks and strip to plain text. Need `find_fenced_blocks()` for scope detection.
- **Priority**: HIGH — build-breaking if present. **Sagitta: 0 instances** (may be branch-specific to current/circinus content)

#### 5. URLs with underscores → angle-bracket wrapping

- **Source**: pr-1838 57133f8a (1 file, 2 links)
- **Root cause**: MyST/CommonMark percent-encodes underscores in URLs as `%5F`, breaking GitHub file links
- **Pattern**: `[text](https://...path_with_underscores...)` → `[text](<https://...path_with_underscores...>)`
- **Automation**: Regex-feasible. Detect Markdown links where URL contains `_`, wrap in `<>`.
- **Priority**: LOW — only affects links to GitHub paths with underscores
- **Sagitta**: 10+ URLs with underscores in wiki.nftables.org links (may or may not render incorrectly — needs verification since `_` in URLs is valid CommonMark)

### NOT automated — manual-only (cannot reliably automate)

| Fix pattern | Source | Why manual |
|---|---|---|
| Duplicate note admonition (wrong content copied) | pr-1838 6069dff0 | Requires RST source comparison — conversion bug produced duplicate content. Detect via content hash? |
| Missing section anchors | pr-1838 5ca9625c | Requires knowing which anchors external pages reference. Could trigger from `validate_refs` orphan target output. |
| Code block content preservation (leading spaces, indentation) | feat/rst-to-myst 25b8187b, 3290fb92, 4fcf7824 | Upstream rst-to-myst bugs altering whitespace inside code blocks. Track via `detect_manual_review` flags. |
| Footnote symbol conversion (`[^footnote-1]` → `:sup:\*`) | feat/rst-to-myst 3b84d55a | Requires semantic understanding of RST footnote intent |
| Code blocks after list items unindent | feat/rst-to-myst 581615bf (4 terraform files) | Structural RST→MD mismatch: RST list-adjacent blocks render outside list, MyST puts them inside. Hard to distinguish from intentional nesting. |
| CmdInclude phantom newlines | circinus 5c5e7ffc | Already fixed in vyos.py (rstrip newlines). Infrastructure fix, not postprocess. |
| Template files must stay RST | circinus e6ddcb65 | Pipeline already handles via `--stage templates` skip. Infrastructure decision, not postprocess. |
| `need_improvement.txt` / `common-references.txt` conversion | circinus 77f43e7f | One-off file-specific fixes. Not generalizable. |

## Recommendations

### Immediate (add to postprocess.py)

1. **`fix_blockquoted_fences`** — unwrap `> ```lang` blocks. 74 instances confirmed in sagitta.
2. **Fix `ANGLE_BRACKET_RE`** — add `:` to character class. 4 patterns missed.
3. **`fix_eval_rst_roles`** — revert `{ref}`/`{doc}` to `:ref:`/`:doc:` inside `{eval-rst}` blocks. 42 instances in circinus.
4. **`fix_cmd_body_roles`** — strip `{ref}`/`{doc}` from cfgcmd/opcmd bodies to prevent pending_xref crash.

### Low priority (add when convenient)

5. **`fix_line_block_metadata`** — convert `Testdate: ...\` to `- Testdate: ...` in autotest files.
6. **`fix_url_underscores`** — wrap underscore-containing URLs in angle brackets.
7. **`fix_bare_urls`** — wrap standalone bare URLs in `<>` for proper link rendering.

### Not automatable — improve detection instead

8. Add `detect_manual_review` flags for: duplicate content blocks, code block whitespace drift, unresolved section anchors.
9. Integrate `validate_refs` orphan targets as input for missing-anchor detection.
