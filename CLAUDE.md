# VyOS Documentation

RST documentation for VyOS, built with Sphinx and hosted on Read the Docs.

## Build

```bash
# Docker (recommended)
docker build -t vyos/vyos-documentation docker
docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs \
  -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
  vyos/vyos-documentation make html

# Local
pip install -r requirements.txt
cd docs && make html
```

Output goes to `docs/_build/html/`.

## RST Conventions

### Heading Hierarchy

```rst
#####
Title
#####

********
Chapters
********

Sections
========

Subsections
-----------

Subsubsections
^^^^^^^^^^^^^^

Paragraphs
""""""""""
```

The first heading in every RST file must use `#` overline+underline. Files may have field lists (e.g., `:lastproofread:`) or labels before the heading.

### Formatting Rules

- 80 character line limit (except inside `.. code-block::`)
- American English
- Indent with 2 spaces
- Leave a blank line before and after headers
- Use double backticks for inline code: ``` ``command`` ```
- Use `.. code-block:: none` for command/output blocks

### Address Space

See `docs/documentation.rst` for canonical rules. Per RFC 5737, RFC 3849, RFC 5389, and RFC 7042:

The linter enforces documentation-reserved addresses. Use only:

- IPv4: `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`
- IPv6: `2001:db8::/32`
- ASN: `64496-64511` (16-bit), `65536-65551` (32-bit)
- MAC: `00-53-00` to `00-53-FF` (unicast), `90-10-00` to `90-10-FF` (multicast)

**Allowed without suppression:**
- RFC 1918 private ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- Link-local, loopback, and other non-public ranges

**Requires `stop/start_vyoslinter`:**
- Real public IPs when needed for authenticity (e.g., `8.8.8.8` in DNS examples)
- NAT64 well-known prefix `64:ff9b::/96`
- Long URLs or certificate fingerprints that exceed 80 chars

### Linter Suppression

```rst
.. stop_vyoslinter

.. code-block:: none

   content with real IPs or long lines here

.. start_vyoslinter
```

Place markers immediately before/after the block they suppress. Always re-enable with `start_vyoslinter`.

### VyOS-Specific Directives

- `.. cfgcmd::` — configuration mode commands
- `.. opcmd::` — operational mode commands
- `.. cmdinclude::` — include command definitions from XML

### Page Structure

Each configuration page should contain:

1. **Theory** — what it is, when to use it, relevant RFCs
2. **Configuration** — all CLI options with `.. cfgcmd::` directives
3. **Examples** — practical configurations with topology diagrams
4. **Known issues** — problems and workarounds
5. **Debugging** — log collection, `show` commands, state indicators

## CI

- **Linter** (`doc-linter.py` from `vyos/.github`): checks line length and IP addresses on changed files only
- **Sphinx build**: runs on Read the Docs for each PR
- **CLA check**: contributors must sign the CLA

## Git Workflow

- Base branch: `current`
- Branch naming: `fix/docs-*`, `feat/docs-*`
- PRs target `current` branch

## RST-to-MyST Migration (active — branch `feat/rst-to-myst-migration`, PR #1838)

This worktree IS the migration branch. All 254 RST files have been converted to MyST Markdown.

### Critical syntax rules (do NOT break these):

**cfgcmd/opcmd bodies are parsed by the MyST renderer** (not RST nested_parse).
In `.md` files, `self.state` is MockState whose `nested_parse()` routes to
`nested_render_text()` — the MyST renderer. RST directives do NOT render.

- **In `.md` files** — use MyST colon-fence syntax inside cfgcmd/opcmd bodies:
  - `:::{code-block} none` … `:::` (NOT `.. code-block:: none`)
  - `:::{note}` … `:::` (NOT `.. note::`)
  - `` ``text`` `` double-backtick inline code is fine (renders in both)
  - `% stop_vyoslinter` (NOT `.. stop_vyoslinter`)
  - Do NOT use `` ```none `` backtick fences inside `` ```{cfgcmd} `` bodies —
    same backtick depth closes the outer directive prematurely

- **In `_include/*.txt` templates** — templates use `::::` colon-fence cfgcmd/opcmd
  directives, so backtick fences (different depth) work fine inside them:
  - `` ```none `` … ` ``` ` inside colon-fence cfgcmd/opcmd bodies ✓
  - `:::{note}` … `:::` inside colon-fence cfgcmd/opcmd bodies ✓
  - Do NOT use `.. code-block:: none` or `.. note::` — they render as literal text

- Angle brackets in directive arguments: `\<param\>` (escaped)
- `cmdincludemd` (not `cmdinclude`) in .md files and aggregator templates

### Session routine (follow in order):
1. Fix files → push
2. Check Copilot PR review for new inline comments → address each (fix or reply with technical pushback) → resolve each comment thread → push fixes
3. Repeat step 2 until no unresolved Copilot comments remain
4. Wait for ReadTheDocs rebuild: https://vyos--1838.org.readthedocs.build/en/1838/
5. Run 10 parallel Playwright scan agents (25 pages each, N=0,25,50,...,225)
6. Analyze: separate pending-rebuild pages from genuine new issues

### Current state (commit c1d36181, Apr 16 2026):
Full state in `~/.claude/projects/-Users-syncer-GitHub-vyos-documentation/memory/project_rst_myst_migration.md`

**Playwright scan complete** (RTD build confirmed, all diffs stable post marker removal).
All 30 Copilot comments addressed. Lint CI passing.
Removed all 206 `% stop/start_vyoslinter` markers from 49 `.md` files (8edab482) — zero regressions.

**Known remaining diffs (explained, not regressions):**
- `operation/information` 111.7%: MyST opcmd panels with embedded code blocks render taller than RST (CSS/styling, not content error). Code blocks ARE inside panels (fix c3a980b0 applied).
- `configuration/protocols/static` 19.5%: per-directive rendering size difference.
- `configuration/service/eventhandler` 251.4%: IMPROVED (RST was broken, MyST renders correctly).
- 8 pages at 2-6%: minor stable differences.
- coverage 4.7%: improved from 8.8%.

**Next**: PR is ready for review. Mark as ready (remove draft status).
