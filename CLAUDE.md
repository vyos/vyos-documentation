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
