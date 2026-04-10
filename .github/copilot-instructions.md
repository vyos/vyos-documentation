## VyOS Documentation Project

This is VyOS user documentation written in reStructuredText (RST) and built with Sphinx.

### Review Scope

When reviewing pull requests, only flag issues **introduced by the PR's changes**. Do not flag pre-existing issues in unchanged lines. Compare against the base branch to determine what was actually changed.

### RST Heading Hierarchy

All files must use this heading order:

```
##### (Title — one per file, with overline)
***** (Chapters)
===== (Sections)
----- (Subsections)
^^^^^ (Subsubsections)
""""" (Paragraphs)
```

### Line Length

Maximum 80 characters per line. Exception: content inside `.. code-block::` directives is **exempt** — they render with `<pre>` tags and preserve source formatting. Do not flag long lines inside code blocks.

### Linter Suppression Markers

`.. stop_vyoslinter` and `.. start_vyoslinter` are RST comments used to suppress CI linter checks. Key conventions:

- When used **inside an indented directive** (`.. cfgcmd::`, `.. opcmd::`, list items), markers should match the surrounding indentation to stay within the block.
- When used **at top level** (outside any directive), markers are placed at column 0.
- Both patterns exist in this repo. Do not flag either placement as incorrect.
- They must always appear in pairs (stop then start). A missing `start_vyoslinter` is a real issue.
- A `stop_vyoslinter` that covers a large section is acceptable when the content requires it (e.g., files full of real debug output with production IPs).

### IP Address Rules

The CI linter checks IP addresses. These are **allowed without suppression** — do not flag them:

- RFC 5737 documentation addresses: `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`
- RFC 3849 documentation IPv6: `2001:db8::/32`
- RFC 1918 private ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- Loopback (`127.0.0.0/8`), link-local (`169.254.0.0/16`), `0.0.0.0/0`

Real public IPs (e.g., `8.8.8.8`) require `stop/start_vyoslinter` suppression. Do not suggest replacing them with documentation addresses if the example intentionally uses real IPs.

### TODO Markers

`.. TODO::` directives serve two purposes in this repo:

1. **Tracking markers** on pages that need `cfgcmd`/`opcmd` conversion (these are intentionally added).
2. **Stale markers** on pages that already have full content (these should be removed).

A PR that removes some TODOs and adds others is not contradictory — the intent matters.

### VyOS Directives

- `.. cfgcmd::` for configuration mode commands
- `.. opcmd::` for operational mode commands
- Do not convert these to plain `.. code-block::` — they are tracked for command coverage.

### YAML in Code Blocks

Ansible playbook examples in `.. code-block::` use RST indentation (typically 4 spaces from the directive). The YAML indentation within the block may differ from standalone YAML files. Verify carefully before flagging YAML as invalid — count spaces from the code-block's own indentation base, not from column 0.

### Page Structure

Configuration pages follow this order: Theory, Configuration (cfgcmd), Examples, Known Issues, Debugging.
