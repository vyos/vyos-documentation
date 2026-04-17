# RST-to-MyST Conversion Guide

Field reference from the `current` branch migration (PR #1838). Covers every
issue category encountered across 254 RST files, 26 templates, and 117 fix
commits. Intended for re-running the conversion on older branches (`sagitta`,
`circinus`, etc.) which may contain additional RST patterns not present in
`current`.

---

## 1. Infrastructure Changes (Apply Once)

These changes affect the Sphinx build system and must be merged before any
branch conversion. They are branch-independent.

### 1.1 `docs/conf.py`

```python
# Add after autosectionlabel_prefix_document = True

myst_enable_extensions = [
    "colon_fence",    # :::directive / :::: nesting
    "deflist",        # definition lists
    "fieldlist",      # :field: value
    "substitution",   # {{variable}}
]

# Prevents MyST from stripping <param> angle brackets as HTML tags.
# Without this, `\<param\>` in cfgcmd/opcmd arguments is parsed as HTML.
myst_fence_as_directive = [
    "cfgcmd",
    "opcmd",
    "cmdincludemd",
]
```

Flip source priority so `.md` wins when both exist:

```python
source_suffix = ['.md', '.rst']   # was ['.rst', '.md']
```

### 1.2 `docs/_ext/vyos.py`

Add linter marker stripping to `CmdInclude.run()` (the `cmdincludemd`
directive). Without this, `.. stop_vyoslinter` / `.. start_vyoslinter` lines
from templates render as literal text in the output:

```python
linter_markers = {'.. stop_vyoslinter', '.. start_vyoslinter'}
new_include_lines = []
for line in file_content:
    if line.rstrip() in linter_markers:
        continue
    # ... existing var substitution loop
```

### 1.3 Key Architectural Fact: MockState

In `.md` files, Sphinx's `self.state` is a `MockState` object whose
`nested_parse()` method routes through `nested_render_text()` — the **MyST
renderer**, not the RST parser. This means:

- cfgcmd/opcmd **bodies** in `.md` files are parsed as MyST, not RST
- `.. note::` and `.. code-block:: none` render as **literal text** (broken)
- `:::{note}` and `:::{code-block} none` are correct

This was discovered mid-migration after initial assumption that bodies used
RST `nested_parse()`. The early commits contain incorrect RST syntax in
cfgcmd bodies that was subsequently corrected. When re-running on older
branches, use MyST from the start.

---

## 2. Automated Conversion Pipeline

### 2.1 Tool: rst-to-myst

```bash
pip install "rst-to-myst[sphinx]"
```

Create `.rst2myst.yaml`:

```yaml
language: en
sphinx: true
extensions:
  - colon_fence
  - deflist
  - fieldlist
directive_data:
  cfgcmd:   { argument: null, body: parse_content, options: null }
  opcmd:    { argument: null, body: parse_content, options: null }
  cmdinclude: { argument: direct, body: null, options: null }
  cfgcmdlist: { argument: null, body: null, options: null }
  opcmdlist:  { argument: null, body: null, options: null }
```

Run:

```bash
rst2myst convert docs/**/*.rst
```

### 2.2 Fallback: pandoc

Two files in `current` failed rst-to-myst due to heading underline
inconsistencies: `cli.rst` and `openvpn-examples.rst`. Convert those with:

```bash
pandoc -f rst -t markdown_myst --wrap=preserve file.rst -o file.md
```

Pandoc produces different artifacts (see Section 5.6).

### 2.3 What the Tool Does Well

- Standard RST constructs: headings, lists, code blocks, inline markup
- Cross-reference labels: `.. _label:` → `(label)=`
- Admonitions: `.. note::` → `:::{note}`
- toctree, figure, image directives
- Definition lists, field lists

---

## 3. Systematic Post-Processing

These are the scripted fixes needed after automated conversion, ordered by
occurrence count. Each can be automated.

### 3.1 Angle Bracket Escaping — 2,691 occurrences + 19 templates

**Problem:** `<param>` in cfgcmd/opcmd directive arguments is parsed as HTML
by MyST. Even with `myst_fence_as_directive`, the angle brackets must be
escaped.

**Fix:** `\<param\>` in all directive argument lines.

**Script pattern:**
```python
# Match opening fence lines for cfgcmd/opcmd
# Replace <word> with \<word\> but NOT URLs, HTML tags, or code blocks
import re
line = re.sub(r'(?<!\\)<(\w[\w\-]*(?:\s*\|[^>]*)?)>',
              r'\\<\1\\>', line)
```

**Edge cases:**
- `<address | dhcp | dhcpv6>` — pipe-separated alternatives, escape entire group
- URLs like `<https://...>` — do NOT escape (MyST autolinks)
- Already-escaped `\<param\>` — skip

### 3.2 Blank Line Between cfgcmd Header and Body — 2,180 occurrences

**Problem:** The `CmdDirective.run()` method splits `self.content` on the
first blank line: lines before it become the command title, lines after become
the body. If there's no blank line, the entire body text is concatenated into
the title.

**Example — broken:**
```
```{cfgcmd} set system option reboot-on-panic
Automatically reboot system on kernel panic after 60 seconds.
```                                            ^-- merged into title
```

**Example — correct:**
```
```{cfgcmd} set system option reboot-on-panic

Automatically reboot system on kernel panic after 60 seconds.
```
```

**Script pattern:**
```python
# After a ```{cfgcmd} or ```{opcmd} line,
# if next non-blank line is NOT ``` (close),
# insert blank line between the directive line and body text.
```

### 3.3 Artifact Blank Lines in Bodies — 3,302 occurrences

**Problem:** rst-to-myst inserts extra blank lines inside cfgcmd/opcmd bodies
(before list items, between paragraphs, around code blocks). These create
unwanted spacing or paragraph breaks.

**Fix:** Remove consecutive blank lines within fenced directive bodies. Single
blank lines between content blocks are correct; double blank lines are
artifacts.

### 3.4 False Paragraph Breaks — 195 occurrences (71 files)

**Problem:** rst-to-myst sometimes inserts blank lines at sentence boundaries
inside paragraphs, splitting one paragraph into two. This happens when a
sentence ends with a period and the next line starts with a capital letter.

**Fix:** Compare against RST originals. If the RST has no blank line, remove
the inserted one. This cannot be reliably automated without the RST source as
reference.

**Script pattern:**
```python
# For each .md file, load corresponding .rst from origin/current
# Find paragraphs that were split: blank line in MD where RST has none
# Heuristic: line ends with period/colon, next line starts with capital
# Validate by checking RST original
```

### 3.5 `cmdinclude` → `cmdincludemd` — 73 occurrences (32 files)

**Problem:** The RST `cmdinclude` directive uses `state_machine.insert_input()`
which inserts raw RST. The MyST code path needs `cmdincludemd` which uses
`nested_render_text()` to parse templates through the MyST renderer.

**Fix:** Rename all `cmdinclude` to `cmdincludemd` in `.md` files.

Additionally, **aggregator templates** (`.txt` files that chain to other
templates) must also use `cmdincludemd`:

```
# RST aggregator (before)
.. cmdinclude:: /_include/interface-address.txt
  :var0: {{ var0 }}

# MyST aggregator (after)
```{cmdincludemd} /_include/interface-address.txt
:var0: {{ var0 }}
```
```

6 aggregator templates required 48 `cmdinclude` → `cmdincludemd` conversions.

### 3.6 Inline Role Conversion

RST inline roles → MyST inline roles:

| RST | MyST | Count |
|-----|------|-------|
| `` :ref:`label` `` | `` {ref}`label` `` | ~30 |
| `` :rfc:`1234` `` | `` {rfc}`1234` `` | ~10 |
| `` :cfgcmd:`cmd` `` | `` {cfgcmd}`cmd` `` | ~25 |
| `` :opcmd:`cmd` `` | `` {opcmd}`cmd` `` | ~15 |
| `` :abbr:`FOO (Full)` `` | `` {abbr}`FOO (Full)` `` | ~20 |

rst-to-myst handles most of these. Manual scan needed for any that remain
as `:role:` syntax.

### 3.7 Code Block Blank Line Restoration — ~220 lines (32 files)

**Problem:** rst-to-myst strips blank lines from inside code blocks. Many
code examples have intentional blank lines (separating config sections,
output groups, etc.).

**Fix:** Compare each code block against RST original. Restore missing
internal blank lines.

**This is one of the most tedious fixes.** It cannot be automated without
matching code blocks between MD and RST sources. The fix was done in two
passes across 32 files in `current`.

### 3.8 Structural Blank Line Restoration — 4,110 insertions (150 files)

**Problem:** rst-to-myst removes blank lines that are structurally required in
MyST:

- Before and after headings
- Before and after code fences
- Before and after directives (note, warning, seealso, etc.)
- Before and after tables

**Fix:** Insert blank lines per MyST spec. Can be partially automated by
scanning for patterns like `heading followed immediately by directive` or
`closing fence followed immediately by opening fence`.

### 3.9 Grid Tables → Pipe Tables

**Problem:** RST grid tables (`+----+----+`) don't convert cleanly.

**Fix:** Convert to pipe tables (`| x | y |`). rst-to-myst handles simple
cases; complex grid tables with multi-line cells need manual conversion to
`list-table` or `csv-table` directives.

Some `csv-table` directives also needed conversion to pipe tables (3 files).

### 3.10 Linter Marker Removal from `.md` Files

**Problem:** `% stop_vyoslinter` / `% start_vyoslinter` markers in `.md` files
are MyST comments — invisible in output. But `doc-linter.py` only runs on
`.rst` and `.txt` files, so the markers have no effect.

**Fix:** Remove all `% stop/start_vyoslinter` markers from `.md` files. They
are dead code. 206 markers removed from 49 files in `current`.

Do NOT add these markers to `.md` files in future.

---

## 4. Template Conversion Rules (`.txt` Files)

This is the section most likely to cause errors. The syntax rules differ
between `.md` files and `_include/*.txt` templates.

### 4.1 Template Structure

Templates are included via `cmdincludemd` which calls `nested_render_text()`.
This is a **MyST parser** — templates must use MyST syntax.

Templates use `::::` (4-colon) fences for cfgcmd/opcmd directives, allowing
backtick fences inside them:

```
.. stop_vyoslinter

::::{cfgcmd} set interfaces {{ var0 }} \<interface\> description \<description\>

**Configure a descriptive alias for the interface.**

Example:

```none
set interfaces {{ var0 }} {{ var1 }} description 'WAN uplink'
```

::::

.. start_vyoslinter
```

### 4.2 Syntax Decision Tree

```
Is this a .md file or a .txt template?

.md file:
  ├── cfgcmd/opcmd directive: ```{cfgcmd} command \<args\>
  ├── Code block INSIDE cfgcmd body: :::{code-block} none
  ├── Note INSIDE cfgcmd body: :::{note}
  ├── Code block OUTSIDE cfgcmd: ```none ... ```
  ├── Note OUTSIDE cfgcmd: :::{note}
  ├── Linter markers: NOT needed (linter doesn't run on .md)
  └── Inline roles: {ref}`label`, {rfc}`1234`, {cfgcmd}`cmd`

.txt template:
  ├── cfgcmd/opcmd directive: ::::{cfgcmd} command \<args\>
  ├── Code block INSIDE cfgcmd body: ```none ... ```
  ├── Note INSIDE cfgcmd body: :::{note}
  ├── Linter markers: .. stop/start_vyoslinter OUTSIDE :::: fences
  │   (stripped by vyos.py before rendering)
  └── Close directive: ::::
```

### 4.3 Common Mistakes

| Mistake | Result | Fix |
|---------|--------|-----|
| `.. note::` inside cfgcmd body in .md | Renders as literal text `.. note::` | Use `:::{note}` |
| `.. code-block:: none` inside cfgcmd body in .md | Renders as literal text | Use `:::{code-block} none` |
| Backtick fence inside backtick cfgcmd | Closes the outer directive | Use `:::{code-block}` (colon fence) |
| `% stop_vyoslinter` inside cfgcmd body | Works as MyST comment but linter doesn't run on .md | Remove entirely |
| `cmdinclude` instead of `cmdincludemd` in .md | RST insert_input fails silently | Rename to `cmdincludemd` |
| 3-space indent on cfgcmd body text | RST blockquote rendering | Remove indent (0-indent) |
| Missing blank line after cfgcmd header | Body text merged into title | Add blank line |
| `<url>` in MyST text | Autolink hyperlink (not plain text) | Remove angle brackets |

### 4.4 `common-references.txt`

This file was converted from RST link targets to Markdown link definitions:

```
# RST (before)
.. _`accel-ppp`: https://accel-ppp.org/

# Markdown (after)
[accel-ppp]: https://accel-ppp.org/
```

Long URLs must be split across lines per CommonMark spec (indent continuation):

```
[Secure Socket Tunneling Protocol]:
  https://en.wikipedia.org/wiki/Secure_Socket_Tunneling_Protocol
```

---

## 5. Known Tool Bugs (rst-to-myst and pandoc)

### 5.1 Label Underscore-to-Hyphen Conversion

**Severity: HIGH — silently breaks cross-references**

rst-to-myst converts `.. _label_name:` to `(label-name)=`, replacing
underscores with hyphens. But `{ref}` references throughout the docs still
use the original underscore form. Result: `{ref}` renders as raw text
instead of a clickable link.

**17 broken labels found in `current`.** Fix: change `(label-name)=` back to
`(label_name)=` to match the references.

**Detection:** grep for `{ref}` and check that every referenced label exists
as a `(label)=` target.

### 5.2 Heading Level Determination

**Severity: MEDIUM — affects toctree rendering**

RST heading levels are determined by the order of underline characters, not
by which character is used. rst-to-myst sometimes assigns incorrect Markdown
heading levels when:

- Files use non-standard underline characters
- Heading hierarchy is inconsistent in the RST source

**Example from `current`:** `vyos-pyvyos.rst` and `vyos-govyos.rst` used
dash (`-`) for h2 and caret (`^`) for h3. rst-to-myst converted some h2
headings to `###` (h3). One heading (`Configure, then Save File`) used dash
where its siblings used caret — an RST typo that rst-to-myst faithfully
reproduced at the wrong level.

**Detection:** Compare toctree entries on index pages between RST and MD
builds. Missing entries = wrong heading level.

### 5.3 Code Block Blank Line Stripping

**Severity: MEDIUM — changes code example appearance**

rst-to-myst strips ALL blank lines from inside code blocks. Configuration
examples that separate sections with blank lines lose their formatting.

**Fix:** Manual comparison with RST originals. ~220 lines restored across
32 files in `current`.

### 5.4 Paragraph Break Insertion

**Severity: MEDIUM — changes text layout**

rst-to-myst inserts blank lines at sentence boundaries inside paragraphs,
creating false paragraph breaks. The heuristic appears to trigger when a
line ends with a period and the next line starts with a capital letter.

**195 false breaks found in `current`.** Detected by diffing paragraph
structure between RST and MD.

### 5.5 Split Note/Warning Directives

**Severity: MEDIUM — breaks admonitions**

When a `.. note::` or `.. warning::` body spans multiple paragraphs,
rst-to-myst sometimes splits it into separate directives or moves content
outside the admonition.

**74 split directives repaired across 38 files in `current`.**

### 5.6 Pandoc-Specific Artifacts

Files converted with pandoc instead of rst-to-myst produce different artifacts:

- Heading anchor IDs: `{#heading-id}` appended to headings
- Interpreted-text roles rendered as `[text]{.interpreted-text role="ref"}`
- Bare colon fences without directive names
- Different handling of definition lists

These need manual cleanup.

---

## 6. VyOS-Specific Conversion Patterns

### 6.1 `stop/start_vyoslinter` and cfgcmd Interaction

**Severity: HIGH — causes silent content loss in RST**

`stop_vyoslinter` and `start_vyoslinter` are NOT registered Sphinx directives.
Sphinx treats them as unknown directives and **consumes their indented
content** (per Docutils behavior for unknown directives).

When the RST uses this pattern:

```rst
.. stop_vyoslinter

.. cfgcmd:: long command with <params>

.. start_vyoslinter

   Body text that describes the command.
```

The body text is consumed by `start_vyoslinter` and **never renders**. The
cfgcmd shows only the command title with no description.

This pattern appears in multiple RST files. In the MyST conversion, the body
text is correctly placed inside the cfgcmd fence, producing **improved
rendering** vs the RST original.

**Affected in `current`:**
- `protocols/static.rst`: 6 blocks — 4 cfgcmds lose body text, 3 code blocks
  lost. Our MyST version shows all content (20.1% visual diff = improvement).
- `service/eventhandler.rst`: cfgcmds 2-6 wrapped in `stop_vyoslinter` at
  indent 0 — directives don't render at all in RST. MyST renders all 6
  (251.4% diff = improvement).
- `operation/information.rst`: code blocks inside `stop_vyoslinter` render
  outside opcmd panels in RST. MyST places them correctly inside (111.7%
  diff = improvement).

**Guidance for older branches:** Expect similar patterns. When converting,
place all body text inside the cfgcmd/opcmd fence. The resulting output will
be more complete than the RST original.

### 6.2 Multi-Line cfgcmd Arguments

RST cfgcmd directives can split long commands across lines:

```rst
.. cfgcmd:: set protocols static route <subnet> interface
   <interface> distance <distance>
```

The `CmdDirective.run()` joins all lines before the first blank line with
spaces to form the title. In MyST, put the full command on the fence line:

```
```{cfgcmd} set protocols static route \<subnet\> interface \<interface\> distance \<distance\>
```

Or split across content lines (no blank line between them):

```
```{cfgcmd} set protocols static route \<subnet\> interface
\<interface\> distance \<distance\>

Body text here.
```
```

The first form (single line) is preferred for clarity.

### 6.3 `:defaultvalue:` Marker

Some cfgcmd directives contain `:defaultvalue:` in their title text. The
marker must be followed by a blank line, or the body description is
concatenated into the title.

```
```{cfgcmd} set system watchdog timeout :defaultvalue:

Configure the watchdog timeout period.
```
```

### 6.4 Hyperlinks Inside cfgcmd Bodies

`common-references.txt` link definitions (Markdown format) cannot be resolved
inside cfgcmd bodies because `nested_parse()` / `nested_render_text()` does
not have access to the parent document's link definitions.

**In `.txt` templates:** use inline links: `[text](url)`

**In `.md` files (if RST `nested_parse` is used):** use RST inline hyperlinks:
`` `Text <url>`_ ``

Note: This distinction may change if the body parsing changes in future
versions of the extension.

---

## 7. Validation Checklist

### 7.1 Build

```bash
cd docs && make html
```

- Zero new warnings (89 pre-existing warnings in `current`)
- All cmdincludemd template expansions render correctly
- All cross-references resolve

### 7.2 Lint CI

The doc-linter checks line length and IP addresses on changed files. It only
runs on `.rst` and `.txt` files — `.md` files are not linted.

- 101 line-too-long warnings pre-existing in `current` (all in `.txt` templates)
- Zero errors

### 7.3 Visual Diff (Playwright)

Compare rendered HTML between the RST reference and MyST build:

1. Push branch, wait for RTD preview build
2. Run Playwright screenshot comparison on `[itemprop="articleBody"]` selector
3. Compare pixel-level screenshot sizes (height-based diff percentage)

**Pages to spot-check first** (highest risk of conversion issues):
- Any page with `cmdincludemd` templates (interface pages)
- Pages with complex tables (bonding, firewall)
- Pages with code-heavy cfgcmd bodies (dhcp-server, protocols)
- Pages with deep nesting (multiple admonitions inside directives)

### 7.4 Cross-Reference Audit

```bash
# Find all {ref} references
grep -rn '{ref}' docs/ --include="*.md"

# Find all (label)= targets
grep -rn '^(.*)\s*=$' docs/ --include="*.md"

# Compare: every {ref}`label` must have a matching (label)= target
```

---

## 8. Pre-Existing Issues (Carry Forward)

These issues exist in the converted `current` branch and will likely appear
in older branches too.

### 8.1 Consecutive cfgcmd/opcmd Without Blank Lines

**186 instances across 34 files.** In MyST, block-level directives should be
separated by blank lines. Impact uncertain — may cause parsing issues in
some Sphinx/MyST-parser versions.

Top affected: `ospf.md` (23), `openvpn.md` (18), `route-map.md` (15),
`ssh.md` (14), `bridge.md` (13).

Fix: insert blank line between consecutive ```` ``` ```` close and next
```` ```{cfgcmd} ```` open.

### 8.2 RST `.. include::` in VLAN Templates

`interface-vlan-8021ad.txt` and `interface-vlan-8021q.txt` end with
`.. include:: /_include/common-references.txt` (RST syntax). This is silently
ignored in MyST context. The templates also use RST backtick reference syntax
(`802.1q_`) which doesn't render as hyperlinks.

Fix: replace `.. include::` with `{include}` and convert RST references to
Markdown link syntax.

### 8.3 Older Branches May Have Additional Patterns

The fix catalog above is derived from `current` (April 2026). Older branches
(`sagitta`, `circinus`, etc.) may contain:

- Different RST files not present in `current`
- Additional RST patterns not encountered during this migration
- Different heading hierarchies or directive usage

Run the full validation checklist (Section 7) on each branch independently.

---

## 9. Summary Statistics (PR #1838)

| Metric | Count |
|--------|-------|
| RST files converted | 254 |
| RST files remaining | 0 |
| Template files converted | 26 |
| Migration commits | 117 |
| Total lines changed | ~129,000 (64,850 ins / 64,043 del) |
| Angle brackets escaped | 2,691 + 19 templates |
| Header/body blank lines added | 2,180 |
| Artifact blank lines removed | 3,302 |
| False paragraph breaks removed | 195 |
| Split admonitions repaired | 74 |
| Code block blank lines restored | ~220 |
| Structural blank lines restored | ~4,110 |
| Broken {ref} labels fixed | 17 |
| cmdinclude → cmdincludemd | 73 + 48 aggregator |
| Inline role conversions | ~100 |
| Copilot review threads addressed | 100+ |
| Playwright-scanned pages | 253 |
| Pages with MATCH (0% diff) | 8 |
| Pages with <2% diff | ~40 |
| Pages with improved rendering | 3 (static, eventhandler, information) |
| Zero-regression pages | All 253 |
