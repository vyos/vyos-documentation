# Postprocess Fixes V2 — Spec

Date: 2026-04-24

## Summary

Add 6 new fix functions and 1 regex patch to `scripts/postprocess.py` in the RST→MyST conversion pipeline. These address gaps identified by cataloging all manual post-conversion fixes applied across three branches (`pr-1838`, `yuriy/automated-rst-to-myst`, `feat/rst-to-myst-migration`).

Reference: `~/.claude/projects/-Users-syncer-GitHub-vyos-documentation/docs/2026-04-24-post-conversion-fix-catalog.md`

## Target branch

`yuriy/rst-to-myst-pipeline-impl` — the pipeline implementation branch.

## Changes

### 1. Fix `ANGLE_BRACKET_RE` regex (existing function)

**File**: `scripts/postprocess.py`, `ANGLE_BRACKET_RE` constant.

**Change**: Add `:` to the character class.

Before:
```python
ANGLE_BRACKET_RE = re.compile(
    r"(?<!\\)<\s*([A-Za-z0-9][\w\-./]*)(\s*\|[^>]*)?\s*>"
)
```

After:
```python
ANGLE_BRACKET_RE = re.compile(
    r"(?<!\\)<\s*([A-Za-z0-9][\w\-./:]*?)(\s*\|[^>]*)?\s*>"
)
```

**Rationale**: Patterns like `<h:h:h:h:h:h:h:h>` (IPv6), `<asn:nn>`, `<GA:LDP1:LDP2>`, `<0-65535:0-65535>` contain colons. The current regex misses 4 pattern families. Adding `:` to `[\w\-./]` fixes all of them. The `?` (non-greedy) on the first group prevents overcapture when `|` alternatives follow.

### 2. `fix_blockquoted_fences` (new function)

**Purpose**: Unwrap blockquote-prefixed fenced code blocks that rst-to-myst produces from RST blockquote-indented code blocks.

**Input pattern**:
```markdown
> ```none
> interfaces {
>     bonding bond10 {
> ```
```

**Output**:
```markdown
```none
interfaces {
    bonding bond10 {
```
```

**Algorithm**:
1. Scan lines for `^> ```` ` (blockquote prefix + fence opener with optional info string, NOT a directive `{name}`)
2. Collect lines until matching `^> ```` ` close
3. Strip `> ` (or `>`) prefix from each line in the block (opener, body, closer)
4. Return modified text and count of unwrapped blocks

**Guard**: Only unwrap when the fence is a plain code fence (info string is a language name or empty). Do NOT unwrap `> ```{note}` — that's a blockquoted directive, not a code block.

### 3. `fix_eval_rst_roles` (new function)

**Purpose**: Revert MyST-style roles back to RST-style roles inside `{eval-rst}` fenced blocks. Content inside eval-rst is parsed by the RST parser, which doesn't understand MyST `{role}` syntax.

**Input pattern** (inside an eval-rst block):
```
{ref}`some label <target>`
```

**Output**:
```
:ref:`some label <target>`
```

**Algorithm**:
1. Use `find_fenced_blocks()` to locate all `{eval-rst}` blocks
2. Within those line ranges, apply regex: `\{(ref|doc|rfc|abbr|vytask|cfgcmd|opcmd)\}` `\`` → `:\1:` `\``
3. Leave content outside eval-rst blocks untouched

**Ordering constraint**: MUST run after `fix_inline_roles` (which converts `:ref:` → `{ref}` globally). This function reverses that conversion specifically inside eval-rst blocks.

### 4. `fix_cmd_body_roles` (new function)

**Purpose**: Remove cross-reference roles and Markdown links from cfgcmd/opcmd directive bodies. The CmdDirective uses `nested_parse()` on body content; `{ref}`, `{doc}`, and `[text](file.md)` links all create `pending_xref` nodes that crash during HTML write because they're in a custom node tree.

**Input patterns** (inside cfgcmd/opcmd body — after the blank-line separator):
```
For detailed information, see {ref}`Firewall Groups <firewall-groups>`.
For detailed information, see {doc}`Bridge Configuration </configuration/firewall/bridge>`.
For detailed information, see [Bridge Configuration](bridge.md).
```

**Output** (all cases):
```
For detailed information, see Firewall Groups.
For detailed information, see Bridge Configuration.
For detailed information, see Bridge Configuration.
```

**Algorithm**:
1. Use `find_fenced_blocks()` to locate cfgcmd/opcmd blocks
2. Find the blank-line separator within each block to identify body lines
3. Within body lines only (not the command title):
   - Replace `{ref}`\`display text <target>\`` with `display text`
   - Replace `{doc}`\`display text </path>\`` with `display text`
   - Replace `{ref}`\`bare-target\`` with `bare-target`
   - Replace `[display text](url)` with `display text`
4. Leave the title portion (before blank separator) untouched

**Ordering constraint**: MUST run after `fix_inline_roles`.

### 5. `fix_line_block_metadata` (new function)

**Purpose**: Convert RST line-block trailing-backslash metadata to Markdown bullet lists in autotest files.

**Input pattern** (first 10 lines of file):
```
Testdate: 2023-05-11\
Version: 1.4-rolling-202305100734
```

**Output**:
```
- Testdate: 2023-05-11
- Version: 1.4-rolling-202305100734
```

**Algorithm**:
1. Only examine the first 10 lines of the file
2. For each line in that range:
   - If it matches `^(Testdate|Version): .+\\$`: strip trailing `\`, prepend `- `
   - Else if it matches `^Version: .+$` (no trailing `\`) AND the previous line was a `Testdate:` line that was just converted: prepend `- `
3. Leave all other lines untouched

### 6. `fix_url_underscores` (new function)

**Purpose**: Wrap Markdown link URLs containing underscores in angle brackets to prevent MyST/CommonMark from percent-encoding `_` as `%5F`.

**Input patterns**:
```markdown
[file](https://github.com/vyos/vyos-automation/blob/main/TerraformCloud/Vsphere_terraform_ansible_single_vyos_instance-main/terraform.tfvars)
[vyos-automation]: https://github.com/vyos/vyos-automation/tree/main/TerraformCloud/Vsphere_terraform_ansible_single_vyos_instance-main
```

**Output**:
```markdown
[file](<https://github.com/vyos/vyos-automation/blob/main/TerraformCloud/Vsphere_terraform_ansible_single_vyos_instance-main/terraform.tfvars>)
[vyos-automation]: <https://github.com/vyos/vyos-automation/tree/main/TerraformCloud/Vsphere_terraform_ansible_single_vyos_instance-main>
```

**Algorithm**:
1. Match inline links: `\[text\](url)` where `url` starts with `https?://` and contains `_`
2. Match reference-style definitions: `\[label\]: url` where `url` starts with `https?://` and contains `_`
3. Skip if URL is already wrapped in `<>`
4. Wrap the URL portion in `<>`

### 7. `fix_bare_urls` (new function)

**Purpose**: Wrap standalone bare URLs in angle brackets for proper link rendering in MyST.

**Input pattern**:
```
https://raw.githubusercontent.com/vyos/vyos-nightly-build/refs/heads/current/version.json
```

**Output**:
```
<https://raw.githubusercontent.com/vyos/vyos-nightly-build/refs/heads/current/version.json>
```

**Algorithm**:
1. Use `find_fenced_blocks()` to build a set of line indices inside fenced blocks
2. For lines NOT inside fenced blocks, match `^(https?://\S+)$` (entire line is a URL)
3. Skip if already wrapped in `<>`
4. Wrap as `<url>`

## Execution Order

```python
ORDERED_FIXES = [
    "fix_cmdinclude_rename",        # 1  (existing)
    "fix_angle_brackets",           # 2  (existing — regex patched)
    "fix_header_body_blanks",       # 3  (existing)
    "fix_artifact_blanks",          # 4  (existing)
    "fix_blockquoted_fences",       # 5  NEW
    "fix_inline_roles",             # 6  (existing)
    "fix_eval_rst_roles",           # 7  NEW — must follow fix_inline_roles
    "fix_cmd_body_roles",           # 8  NEW — must follow fix_inline_roles
    "fix_line_block_metadata",      # 9  NEW
    # fix_label_hyphens is invoked separately (cross-file)
    "fix_split_admonitions",        # 10 (existing)
    "fix_structural_blanks",        # 11 (existing)
    "fix_linter_markers",           # 12 (existing)
    "fix_url_underscores",          # 13 NEW
    "fix_bare_urls",                # 14 NEW
    # fix_pandoc_artifacts runs as conditional pre-pass (unchanged)
]
```

Ordering constraints:
- `fix_blockquoted_fences` (#5) before `fix_structural_blanks` (#11) — unwrapped fences need blank-line insertion
- `fix_eval_rst_roles` (#7) after `fix_inline_roles` (#6) — reverting what inline_roles converted inside eval-rst
- `fix_cmd_body_roles` (#8) after `fix_inline_roles` (#6) — same dependency
- `fix_url_underscores` (#13) and `fix_bare_urls` (#14) last — all other text transforms complete before URL wrapping

## Testing

Each new/changed function gets unit tests in `scripts/tests/`, following the existing pattern (pure-function tests: string in → string + count out).

### Test cases per function

**fix_angle_brackets (regex patch)**:
- `<h:h:h:h:h:h:h:h>` on a cfgcmd line → escaped
- `<asn:nn>` → escaped
- `<0-65535:0-65535>` → escaped
- Already-escaped `\<asn:nn\>` → unchanged
- `<http://url>` → unchanged (URL guard)

**fix_blockquoted_fences**:
- `> ```none` block → unwrapped, count = 1
- `> ```{note}` (directive) → untouched, count = 0
- Multiple blockquoted fences in one file → all unwrapped
- Non-blockquoted fence → untouched
- File with no blockquoted fences → no-op

**fix_eval_rst_roles**:
- `{ref}` inside eval-rst → `:ref:`, count = 1
- `{ref}` outside eval-rst → untouched
- Multiple eval-rst blocks → all processed
- File with no eval-rst blocks → no-op, count = 0

**fix_cmd_body_roles**:
- `{ref}` in cfgcmd body → stripped to display text
- `{doc}` in cfgcmd body → stripped to display text
- `[text](file.md)` in cfgcmd body → stripped to `text`
- `{ref}` in cfgcmd title (before blank separator) → untouched
- cfgcmd with no body → no-op

**fix_line_block_metadata**:
- `Testdate: 2023-05-11\` + `Version: 1.4\` at top → both converted to `- ` prefixed
- Same pattern at line 50 → untouched
- File without metadata → no-op

**fix_url_underscores**:
- Inline link with underscored URL → wrapped
- Reference-style definition with underscored URL → wrapped
- URL already in `<>` → skip
- URL without underscores → skip

**fix_bare_urls**:
- Bare URL on own line → wrapped
- Bare URL inside fenced block → skip
- URL already in `<>` → skip
- URL as part of `[text](url)` → skip

## Files modified

- `scripts/postprocess.py` — regex fix + 6 new functions + updated `ORDERED_FIXES`
- `scripts/tests/test_postprocess.py` (or per-function test files, following existing pattern) — new test cases

## Verification

After implementation, re-run the pipeline on the freshly-converted sagitta branch to confirm:
1. Blockquoted fences reduced from 74 to 0
2. All angle bracket patterns with colons are escaped
3. No `{ref}/{doc}` inside eval-rst blocks (applicable on circinus)
4. No `{ref}/{doc}` or markdown links inside cfgcmd/opcmd bodies
5. Autotest metadata lines converted to bullet lists
6. Underscore URLs wrapped
7. Bare URLs wrapped
