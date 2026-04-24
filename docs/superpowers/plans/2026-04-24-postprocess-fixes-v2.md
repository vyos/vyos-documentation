# Postprocess Fixes V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6 new fix functions and 1 regex patch to `scripts/postprocess.py` to close all known post-conversion gaps in the RST→MyST pipeline.

**Architecture:** All changes are in `scripts/postprocess.py` using the existing `@register` decorator + `ORDERED_FIXES` list pattern. Each fix is a pure function `(str) → (str, int)`. Helper utilities from `scripts/fix_utils.py` (`find_fenced_blocks`, `classify_line`) are used for scope-aware fixes. One test file per fix function in `scripts/tests/`.

**Tech Stack:** Python 3.11+, pytest, regex. No new dependencies.

**Spec:** `~/.claude/projects/-Users-syncer-GitHub-vyos-documentation/docs/2026-04-24-postprocess-fixes-v2-spec.md`

**Working directory:** `/Users/syncer/GitHub/vyos-documentation` (worktree for `yuriy/rst-to-myst-pipeline-impl`)

**Run tests with:** `cd /Users/syncer/GitHub/vyos-documentation && PYTHONPATH=. python -m pytest scripts/tests/ -v`

---

### Task 1: Fix `ANGLE_BRACKET_RE` to match colon patterns

**Files:**
- Modify: `scripts/postprocess.py` — `ANGLE_BRACKET_RE` constant
- Modify: `scripts/tests/test_postprocess_angle_brackets.py` — add new tests

- [ ] **Step 1: Write the failing tests**

Add to `scripts/tests/test_postprocess_angle_brackets.py`:

```python
def test_escapes_ipv6_placeholder():
    src = "```{cfgcmd} set foo <h:h:h:h:h:h:h:h>\n"
    out, n = fix_angle_brackets(src)
    assert r"\<h:h:h:h:h:h:h:h\>" in out
    assert n == 1


def test_escapes_asn_notation():
    src = "```{cfgcmd} set foo <asn:nn>\n"
    out, n = fix_angle_brackets(src)
    assert r"\<asn:nn\>" in out
    assert n == 1


def test_escapes_port_range_with_colon():
    src = "```{cfgcmd} set foo <0-65535:0-65535>\n"
    out, n = fix_angle_brackets(src)
    assert r"\<0-65535:0-65535\>" in out
    assert n == 1


def test_escapes_ldp_community():
    src = "```{cfgcmd} set foo <GA:LDP1:LDP2>\n"
    out, n = fix_angle_brackets(src)
    assert r"\<GA:LDP1:LDP2\>" in out
    assert n == 1
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_angle_brackets.py -v -k "colon or ipv6 or asn or port_range or ldp"`

Expected: 4 FAIL (patterns not matched by current regex)

- [ ] **Step 3: Fix the regex**

In `scripts/postprocess.py`, change `ANGLE_BRACKET_RE`:

```python
ANGLE_BRACKET_RE = re.compile(
    r"(?<!\\)<\s*([A-Za-z0-9][\w\-./:]*?)(\s*\|[^>]*)?\s*>"
)
```

Two changes: add `:` to the character class `[\w\-./:` and add `?` (non-greedy) after `*`.

- [ ] **Step 4: Run ALL angle bracket tests**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_angle_brackets.py -v`

Expected: ALL pass (existing + 4 new)

- [ ] **Step 5: Run full test suite to check for regressions**

Run: `PYTHONPATH=. python -m pytest scripts/tests/ -v`

Expected: All 207+ tests pass

- [ ] **Step 6: Commit**

```bash
git add scripts/postprocess.py scripts/tests/test_postprocess_angle_brackets.py
git commit -m "fix(pipeline): add colon to ANGLE_BRACKET_RE for IPv6/ASN patterns"
```

---

### Task 2: `fix_blockquoted_fences`

**Files:**
- Modify: `scripts/postprocess.py` — add function + register + insert in ORDERED_FIXES
- Create: `scripts/tests/test_postprocess_blockquoted_fences.py`

- [ ] **Step 1: Write the test file**

Create `scripts/tests/test_postprocess_blockquoted_fences.py`:

```python
from scripts.postprocess import fix_blockquoted_fences


def test_unwraps_simple_blockquoted_fence():
    src = (
        "> ```none\n"
        "> interfaces {\n"
        ">     bonding bond10 {\n"
        "> ```\n"
    )
    out, n = fix_blockquoted_fences(src)
    assert out == (
        "```none\n"
        "interfaces {\n"
        "    bonding bond10 {\n"
        "```\n"
    )
    assert n == 1


def test_unwraps_blockquoted_fence_no_info_string():
    src = "> ```\n> code\n> ```\n"
    out, n = fix_blockquoted_fences(src)
    assert out == "```\ncode\n```\n"
    assert n == 1


def test_does_not_unwrap_blockquoted_directive():
    src = "> ```{note}\n> Body\n> ```\n"
    out, n = fix_blockquoted_fences(src)
    assert out == src
    assert n == 0


def test_multiple_blockquoted_fences():
    src = (
        "text before\n"
        "> ```none\n"
        "> block 1\n"
        "> ```\n"
        "text between\n"
        "> ```bash\n"
        "> block 2\n"
        "> ```\n"
        "text after\n"
    )
    out, n = fix_blockquoted_fences(src)
    assert "> " not in out
    assert "```none\nblock 1\n```" in out
    assert "```bash\nblock 2\n```" in out
    assert n == 2


def test_noop_no_blockquoted_fences():
    src = "```none\nnormal code\n```\n"
    out, n = fix_blockquoted_fences(src)
    assert out == src
    assert n == 0


def test_handles_bare_blockquote_prefix():
    """Lines with `>` but no trailing space."""
    src = ">```none\n>code\n>```\n"
    out, n = fix_blockquoted_fences(src)
    assert out == "```none\ncode\n```\n"
    assert n == 1
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_blockquoted_fences.py -v`

Expected: ImportError (function doesn't exist yet)

- [ ] **Step 3: Implement the function**

Add to `scripts/postprocess.py`, after `fix_artifact_blanks` and before `fix_inline_roles`:

```python
_BQ_FENCE_OPEN_RE = re.compile(r"^>\s?(`{3,})\s*(\S*)$")


@register("fix_blockquoted_fences")
def fix_blockquoted_fences(text: str) -> Tuple[str, int]:
    lines = text.splitlines(keepends=True)
    out: List[str] = []
    count = 0
    i = 0
    while i < len(lines):
        m = _BQ_FENCE_OPEN_RE.match(lines[i].rstrip("\n"))
        if m and "{" not in m.group(2):
            fence_marker = m.group(1)
            close_re = re.compile(rf"^>\s?{re.escape(fence_marker)}\s*$")
            block = [lines[i]]
            j = i + 1
            while j < len(lines):
                block.append(lines[j])
                if close_re.match(lines[j].rstrip("\n")):
                    break
                j += 1
            for bline in block:
                stripped = bline
                if stripped.startswith("> "):
                    stripped = stripped[2:]
                elif stripped.startswith(">"):
                    stripped = stripped[1:]
                out.append(stripped)
            count += 1
            i = j + 1
        else:
            out.append(lines[i])
            i += 1
    return "".join(out), count
```

- [ ] **Step 4: Add to ORDERED_FIXES**

In `scripts/postprocess.py`, update `ORDERED_FIXES` — insert `"fix_blockquoted_fences"` after `"fix_artifact_blanks"` and before `"fix_inline_roles"`:

```python
ORDERED_FIXES = [
    "fix_cmdinclude_rename",
    "fix_angle_brackets",
    "fix_header_body_blanks",
    "fix_artifact_blanks",
    "fix_blockquoted_fences",       # NEW
    "fix_inline_roles",
    # ... rest unchanged
]
```

- [ ] **Step 5: Run tests**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_blockquoted_fences.py -v`

Expected: ALL pass

- [ ] **Step 6: Run full test suite**

Run: `PYTHONPATH=. python -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add scripts/postprocess.py scripts/tests/test_postprocess_blockquoted_fences.py
git commit -m "feat(pipeline): add fix_blockquoted_fences to unwrap > ``` blocks"
```

---

### Task 3: `fix_eval_rst_roles`

**Files:**
- Modify: `scripts/postprocess.py` — add function + register + insert in ORDERED_FIXES
- Create: `scripts/tests/test_postprocess_eval_rst_roles.py`

- [ ] **Step 1: Write the test file**

Create `scripts/tests/test_postprocess_eval_rst_roles.py`:

```python
from scripts.postprocess import fix_eval_rst_roles


def test_reverts_ref_inside_eval_rst():
    src = (
        "```{eval-rst}\n"
        "See {ref}`some label <target>` for details.\n"
        "```\n"
    )
    out, n = fix_eval_rst_roles(src)
    assert ":ref:`some label <target>`" in out
    assert "{ref}" not in out
    assert n == 1


def test_reverts_multiple_roles_inside_eval_rst():
    src = (
        "```{eval-rst}\n"
        "See {ref}`label1` and {doc}`label2`.\n"
        "```\n"
    )
    out, n = fix_eval_rst_roles(src)
    assert ":ref:`label1`" in out
    assert ":doc:`label2`" in out
    assert n == 2


def test_does_not_touch_roles_outside_eval_rst():
    src = (
        "Normal text with {ref}`label`.\n"
        "```{eval-rst}\n"
        "Inside {ref}`inner`.\n"
        "```\n"
        "After with {ref}`outer`.\n"
    )
    out, n = fix_eval_rst_roles(src)
    assert "{ref}`label`" in out.splitlines()[0]
    assert ":ref:`inner`" in out
    assert "{ref}`outer`" in out.splitlines()[-1]
    assert n == 1


def test_handles_multiple_eval_rst_blocks():
    src = (
        "```{eval-rst}\n"
        "{ref}`a`\n"
        "```\n"
        "gap\n"
        "```{eval-rst}\n"
        "{ref}`b`\n"
        "```\n"
    )
    out, n = fix_eval_rst_roles(src)
    assert ":ref:`a`" in out
    assert ":ref:`b`" in out
    assert n == 2


def test_noop_no_eval_rst():
    src = "Normal text with {ref}`label`.\n"
    out, n = fix_eval_rst_roles(src)
    assert out == src
    assert n == 0


def test_reverts_all_supported_roles():
    roles = ["ref", "doc", "rfc", "abbr", "vytask", "cfgcmd", "opcmd"]
    for role in roles:
        src = f"```{{eval-rst}}\n{{{role}}}`text`\n```\n"
        out, n = fix_eval_rst_roles(src)
        assert f":{role}:`text`" in out, f"Failed for role: {role}"
        assert n == 1
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_eval_rst_roles.py -v`

Expected: ImportError

- [ ] **Step 3: Implement the function**

Add to `scripts/postprocess.py`, after `fix_inline_roles`:

```python
_MYST_ROLE_RE = re.compile(r"\{(ref|doc|rfc|abbr|vytask|cfgcmd|opcmd)\}`")


@register("fix_eval_rst_roles")
def fix_eval_rst_roles(text: str) -> Tuple[str, int]:
    lines = text.splitlines(keepends=True)
    bare = [l.rstrip("\n") for l in lines]
    blocks = find_fenced_blocks(bare)
    eval_rst_ranges: set[int] = set()
    for start, end, kind, info in blocks:
        if kind == "directive" and info.startswith("eval-rst"):
            for k in range(start + 1, end):
                eval_rst_ranges.add(k)
    count = 0
    for i in eval_rst_ranges:
        def repl(m: re.Match) -> str:
            nonlocal count
            count += 1
            return f":{m.group(1)}:`"
        lines[i] = _MYST_ROLE_RE.sub(repl, lines[i])
    return "".join(lines), count
```

- [ ] **Step 4: Add to ORDERED_FIXES**

Insert `"fix_eval_rst_roles"` after `"fix_inline_roles"`:

```python
    "fix_inline_roles",
    "fix_eval_rst_roles",           # NEW — must follow fix_inline_roles
```

- [ ] **Step 5: Run tests**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_eval_rst_roles.py -v`

Expected: ALL pass

- [ ] **Step 6: Run full test suite**

Run: `PYTHONPATH=. python -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add scripts/postprocess.py scripts/tests/test_postprocess_eval_rst_roles.py
git commit -m "feat(pipeline): add fix_eval_rst_roles to revert MyST roles inside eval-rst"
```

---

### Task 4: `fix_cmd_body_roles`

**Files:**
- Modify: `scripts/postprocess.py` — add function + register + insert in ORDERED_FIXES
- Create: `scripts/tests/test_postprocess_cmd_body_roles.py`

- [ ] **Step 1: Write the test file**

Create `scripts/tests/test_postprocess_cmd_body_roles.py`:

```python
from scripts.postprocess import fix_cmd_body_roles


def test_strips_ref_with_display_and_target():
    src = (
        "```{cfgcmd} set firewall\n"
        "\n"
        "See {ref}`Firewall Groups <firewall-groups>` for details.\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert "See Firewall Groups for details." in out
    assert "{ref}" not in out
    assert n == 1


def test_strips_doc_with_display_and_path():
    src = (
        "```{cfgcmd} set firewall\n"
        "\n"
        "See {doc}`Bridge </configuration/firewall/bridge>` info.\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert "See Bridge info." in out
    assert "{doc}" not in out
    assert n == 1


def test_strips_ref_bare_target():
    src = (
        "```{cfgcmd} set foo\n"
        "\n"
        "See {ref}`firewall-groups` for details.\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert "See firewall-groups for details." in out
    assert n == 1


def test_strips_markdown_link():
    src = (
        "```{cfgcmd} set foo\n"
        "\n"
        "See [Bridge Config](bridge.md) for details.\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert "See Bridge Config for details." in out
    assert "[" not in out.split("\n")[2]
    assert n == 1


def test_does_not_touch_title():
    src = (
        "```{cfgcmd} set {ref}`foo` bar\n"
        "\n"
        "Body text.\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert "{ref}`foo`" in out.splitlines()[0]
    assert n == 0


def test_does_not_touch_body_less_block():
    src = (
        "```{cfgcmd} set foo\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert out == src
    assert n == 0


def test_does_not_touch_non_cmd_directive():
    src = (
        "```{note}\n"
        "\n"
        "See {ref}`label <target>` here.\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert out == src
    assert n == 0


def test_handles_opcmd():
    src = (
        "```{opcmd} show foo\n"
        "\n"
        "See {ref}`bar <baz>` here.\n"
        "```\n"
    )
    out, n = fix_cmd_body_roles(src)
    assert "See bar here." in out
    assert n == 1
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_cmd_body_roles.py -v`

Expected: ImportError

- [ ] **Step 3: Implement the function**

Add to `scripts/postprocess.py`, after `fix_eval_rst_roles`:

```python
_REF_DISPLAY_TARGET_RE = re.compile(r"\{(?:ref|doc)\}`([^`<>]+?)\s*<[^`>]+>`")
_REF_BARE_RE = re.compile(r"\{(?:ref|doc)\}`([^`<>]+)`")
_MD_LINK_RE = re.compile(r"\[([^\]]+)\]\([^)]+\)")


@register("fix_cmd_body_roles")
def fix_cmd_body_roles(text: str) -> Tuple[str, int]:
    lines = text.splitlines(keepends=True)
    bare = [l.rstrip("\n") for l in lines]
    blocks = list(find_fenced_blocks(bare))
    count = 0
    for start, end, kind, info in blocks:
        first = info.split()[:1]
        if not first or first[0] not in {"cfgcmd", "opcmd"}:
            continue
        body_start = None
        for k in range(start + 1, end):
            if bare[k] == "":
                body_start = k + 1
                break
        if body_start is None:
            continue
        for k in range(body_start, end):
            line = lines[k]
            for pat in (_REF_DISPLAY_TARGET_RE, _REF_BARE_RE, _MD_LINK_RE):
                matches = pat.findall(line)
                if matches:
                    count += len(matches)
                    line = pat.sub(r"\1", line)
            lines[k] = line
    return "".join(lines), count
```

- [ ] **Step 4: Add to ORDERED_FIXES**

Insert `"fix_cmd_body_roles"` after `"fix_eval_rst_roles"`:

```python
    "fix_eval_rst_roles",
    "fix_cmd_body_roles",           # NEW — must follow fix_inline_roles
```

- [ ] **Step 5: Run tests**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_cmd_body_roles.py -v`

Expected: ALL pass

- [ ] **Step 6: Run full test suite**

Run: `PYTHONPATH=. python -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add scripts/postprocess.py scripts/tests/test_postprocess_cmd_body_roles.py
git commit -m "feat(pipeline): add fix_cmd_body_roles to strip xrefs from cfgcmd bodies"
```

---

### Task 5: `fix_line_block_metadata`

**Files:**
- Modify: `scripts/postprocess.py` — add function + register + insert in ORDERED_FIXES
- Create: `scripts/tests/test_postprocess_line_block_metadata.py`

- [ ] **Step 1: Write the test file**

Create `scripts/tests/test_postprocess_line_block_metadata.py`:

```python
from scripts.postprocess import fix_line_block_metadata


def test_converts_testdate_and_version_with_backslash():
    src = (
        "# Title\n"
        "\n"
        "Testdate: 2023-05-11\\\n"
        "Version: 1.4-rolling-202305100734\n"
        "\n"
        "Body text.\n"
    )
    out, n = fix_line_block_metadata(src)
    assert "- Testdate: 2023-05-11\n" in out
    assert "- Version: 1.4-rolling-202305100734\n" in out
    assert n == 2


def test_converts_both_with_backslash():
    src = (
        "# Title\n"
        "\n"
        "Testdate: 2023-05-11\\\n"
        "Version: 1.4-rolling\\\n"
        "\n"
    )
    out, n = fix_line_block_metadata(src)
    assert "- Testdate: 2023-05-11\n" in out
    assert "- Version: 1.4-rolling\n" in out
    assert n == 2


def test_does_not_touch_metadata_after_line_10():
    src = "\n" * 15 + "Testdate: 2023-05-11\\\nVersion: 1.4\n"
    out, n = fix_line_block_metadata(src)
    assert out == src
    assert n == 0


def test_noop_no_metadata():
    src = "# Title\n\nJust a normal document.\n"
    out, n = fix_line_block_metadata(src)
    assert out == src
    assert n == 0


def test_does_not_touch_testdate_without_backslash_if_no_pair():
    src = "# Title\n\nTestdate: 2023-05-11\n\nBody.\n"
    out, n = fix_line_block_metadata(src)
    assert out == src
    assert n == 0
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_line_block_metadata.py -v`

Expected: ImportError

- [ ] **Step 3: Implement the function**

Add to `scripts/postprocess.py`, after `fix_cmd_body_roles`:

```python
_LINE_BLOCK_META_RE = re.compile(r"^(Testdate|Version): .+\\$")


@register("fix_line_block_metadata")
def fix_line_block_metadata(text: str) -> Tuple[str, int]:
    lines = text.splitlines(keepends=True)
    count = 0
    limit = min(10, len(lines))
    prev_converted = False
    for i in range(limit):
        stripped = lines[i].rstrip("\n")
        if _LINE_BLOCK_META_RE.match(stripped):
            lines[i] = "- " + stripped.rstrip("\\").rstrip() + "\n"
            count += 1
            prev_converted = True
        elif prev_converted and stripped.startswith("Version: "):
            lines[i] = "- " + stripped + "\n"
            count += 1
            prev_converted = False
        else:
            prev_converted = False
    return "".join(lines), count
```

- [ ] **Step 4: Add to ORDERED_FIXES**

Insert `"fix_line_block_metadata"` after `"fix_cmd_body_roles"`:

```python
    "fix_cmd_body_roles",
    "fix_line_block_metadata",      # NEW
```

- [ ] **Step 5: Run tests**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_line_block_metadata.py -v`

Expected: ALL pass

- [ ] **Step 6: Run full test suite**

Run: `PYTHONPATH=. python -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add scripts/postprocess.py scripts/tests/test_postprocess_line_block_metadata.py
git commit -m "feat(pipeline): add fix_line_block_metadata for autotest Testdate/Version"
```

---

### Task 6: `fix_url_underscores`

**Files:**
- Modify: `scripts/postprocess.py` — add function + register + insert in ORDERED_FIXES
- Create: `scripts/tests/test_postprocess_url_underscores.py`

- [ ] **Step 1: Write the test file**

Create `scripts/tests/test_postprocess_url_underscores.py`:

```python
from scripts.postprocess import fix_url_underscores


def test_wraps_inline_link_with_underscore():
    src = "[file](https://github.com/vyos/repo/blob/main/Vsphere_terraform/file.txt)\n"
    out, n = fix_url_underscores(src)
    assert out == "[file](<https://github.com/vyos/repo/blob/main/Vsphere_terraform/file.txt>)\n"
    assert n == 1


def test_wraps_reference_style_with_underscore():
    src = "[vyos-auto]: https://github.com/vyos/repo/tree/main/Vsphere_terraform\n"
    out, n = fix_url_underscores(src)
    assert out == "[vyos-auto]: <https://github.com/vyos/repo/tree/main/Vsphere_terraform>\n"
    assert n == 1


def test_skips_already_wrapped():
    src = "[file](<https://github.com/vyos/repo/blob/main/Vsphere_terraform/file.txt>)\n"
    out, n = fix_url_underscores(src)
    assert out == src
    assert n == 0


def test_skips_url_without_underscore():
    src = "[file](https://github.com/vyos/repo/blob/main/terraform/file.txt)\n"
    out, n = fix_url_underscores(src)
    assert out == src
    assert n == 0


def test_noop_no_links():
    src = "Just some text without any links.\n"
    out, n = fix_url_underscores(src)
    assert out == src
    assert n == 0
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_url_underscores.py -v`

Expected: ImportError

- [ ] **Step 3: Implement the function**

Add to `scripts/postprocess.py`, after `fix_linter_markers`:

```python
_INLINE_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)<>]+_[^)<>]*)\)")
_REF_LINK_DEF_RE = re.compile(r"^(\[[^\]]+\]):\s+(https?://\S*_\S*)$", re.MULTILINE)


@register("fix_url_underscores")
def fix_url_underscores(text: str) -> Tuple[str, int]:
    count = 0

    def _inline_repl(m: re.Match) -> str:
        nonlocal count
        count += 1
        return f"[{m.group(1)}](<{m.group(2)}>)"

    out = _INLINE_LINK_RE.sub(_inline_repl, text)

    def _ref_repl(m: re.Match) -> str:
        nonlocal count
        count += 1
        return f"{m.group(1)}: <{m.group(2)}>"

    out = _REF_LINK_DEF_RE.sub(_ref_repl, out)
    return out, count
```

- [ ] **Step 4: Add to ORDERED_FIXES**

Insert `"fix_url_underscores"` after `"fix_linter_markers"`:

```python
    "fix_linter_markers",
    "fix_url_underscores",          # NEW
```

- [ ] **Step 5: Run tests**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_url_underscores.py -v`

Expected: ALL pass

- [ ] **Step 6: Run full test suite**

Run: `PYTHONPATH=. python -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add scripts/postprocess.py scripts/tests/test_postprocess_url_underscores.py
git commit -m "feat(pipeline): add fix_url_underscores to wrap underscore URLs in <>"
```

---

### Task 7: `fix_bare_urls`

**Files:**
- Modify: `scripts/postprocess.py` — add function + register + insert in ORDERED_FIXES
- Create: `scripts/tests/test_postprocess_bare_urls.py`

- [ ] **Step 1: Write the test file**

Create `scripts/tests/test_postprocess_bare_urls.py`:

```python
from scripts.postprocess import fix_bare_urls


def test_wraps_bare_url_on_own_line():
    src = "text before\nhttps://example.com/path\ntext after\n"
    out, n = fix_bare_urls(src)
    assert "<https://example.com/path>" in out
    assert n == 1


def test_skips_url_inside_fenced_block():
    src = "```none\nhttps://example.com/path\n```\n"
    out, n = fix_bare_urls(src)
    assert out == src
    assert n == 0


def test_skips_already_wrapped():
    src = "<https://example.com/path>\n"
    out, n = fix_bare_urls(src)
    assert out == src
    assert n == 0


def test_skips_url_in_markdown_link():
    src = "[link](https://example.com/path)\n"
    out, n = fix_bare_urls(src)
    assert out == src
    assert n == 0


def test_skips_url_not_alone_on_line():
    src = "Visit https://example.com/path for more.\n"
    out, n = fix_bare_urls(src)
    assert out == src
    assert n == 0


def test_noop_no_urls():
    src = "Just text.\n"
    out, n = fix_bare_urls(src)
    assert out == src
    assert n == 0


def test_multiple_bare_urls():
    src = "https://a.com\ntext\nhttps://b.com\n"
    out, n = fix_bare_urls(src)
    assert "<https://a.com>" in out
    assert "<https://b.com>" in out
    assert n == 2
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_bare_urls.py -v`

Expected: ImportError

- [ ] **Step 3: Implement the function**

Add to `scripts/postprocess.py`, after `fix_url_underscores`:

```python
_BARE_URL_RE = re.compile(r"^(https?://\S+)$")


@register("fix_bare_urls")
def fix_bare_urls(text: str) -> Tuple[str, int]:
    lines = text.splitlines(keepends=True)
    bare = [l.rstrip("\n") for l in lines]
    blocks = list(find_fenced_blocks(bare))
    in_block: set[int] = set()
    for start, end, _kind, _info in blocks:
        for k in range(start, end + 1):
            in_block.add(k)
    count = 0
    for i, line in enumerate(lines):
        if i in in_block:
            continue
        stripped = line.rstrip("\n")
        m = _BARE_URL_RE.match(stripped)
        if m and not stripped.startswith("<"):
            lines[i] = f"<{m.group(1)}>\n"
            count += 1
    return "".join(lines), count
```

- [ ] **Step 4: Add to ORDERED_FIXES**

Insert `"fix_bare_urls"` after `"fix_url_underscores"`:

```python
    "fix_url_underscores",
    "fix_bare_urls",                # NEW
]
```

- [ ] **Step 5: Run tests**

Run: `PYTHONPATH=. python -m pytest scripts/tests/test_postprocess_bare_urls.py -v`

Expected: ALL pass

- [ ] **Step 6: Run full test suite**

Run: `PYTHONPATH=. python -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add scripts/postprocess.py scripts/tests/test_postprocess_bare_urls.py
git commit -m "feat(pipeline): add fix_bare_urls to wrap standalone URLs in <>"
```

---

### Task 8: Final verification — run postprocess on sagitta

**Files:**
- No files modified — verification only

- [ ] **Step 1: Re-run postprocess on sagitta**

```bash
WDIR=/Users/syncer/GitHub/vyos-documentation/.worktrees/myst-sagitta-wip
cd "$WDIR" && PATH="$WDIR/.docs-venv/bin:$PATH" PYTHONPATH="$WDIR" "$WDIR/.docs-venv/bin/python" scripts/pipeline.py --stage postprocess
```

- [ ] **Step 2: Verify blockquoted fences**

```bash
grep -rn "^> \`\`\`" /Users/syncer/GitHub/vyos-documentation/.worktrees/myst-sagitta-wip/docs/ | wc -l
```

Expected: 0 (was 74)

- [ ] **Step 3: Verify angle brackets with colons**

```bash
grep -rn "```{cfgcmd}\|```{opcmd}" /Users/syncer/GitHub/vyos-documentation/.worktrees/myst-sagitta-wip/docs/ | grep "<[^>]*:[^>]*>" | grep -v "\\\\<" | wc -l
```

Expected: 0

- [ ] **Step 4: Verify autotest metadata**

```bash
grep -rn "^Testdate:.*\\\\$" /Users/syncer/GitHub/vyos-documentation/.worktrees/myst-sagitta-wip/docs/configexamples/autotest/ | wc -l
```

Expected: 0

- [ ] **Step 5: Report results**

Document the before/after counts for each fix category.
