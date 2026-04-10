---
applyTo: "**/*.rst"
---

## RST Linter Rules

Every pull request is automatically linted by `doc-linter.py` (from the `vyos/.github` repository). It checks **only changed files** for two things: IP address usage and line length.

### IP Address Rules

The linter rejects public IP addresses that are not reserved for documentation.

**Use these documentation-reserved addresses (no suppression needed):**

| Type | Range | RFC |
|------|-------|-----|
| IPv4 | `192.0.2.0/24` (TEST-NET-1) | RFC 5737 |
| IPv4 | `198.51.100.0/24` (TEST-NET-2) | RFC 5737 |
| IPv4 | `203.0.113.0/24` (TEST-NET-3) | RFC 5737 |
| IPv6 | `2001:db8::/32` | RFC 3849 |

**These are allowed without suppression (not flagged by linter):**

| Type | Range | Why |
|------|-------|-----|
| RFC 1918 private | `10.0.0.0/8` | Private address space |
| RFC 1918 private | `172.16.0.0/12` | Private address space |
| RFC 1918 private | `192.168.0.0/16` | Private address space |
| Loopback | `127.0.0.0/8` | Loopback range |
| Link-local | `169.254.0.0/16` | Link-local |

**These require `stop/start_vyoslinter` suppression:**

| Example | Why suppression is needed |
|---------|--------------------------|
| `8.8.8.8` (Google DNS) | Real public IP, not documentation-reserved |
| `64:ff9b::/96` (NAT64) | Well-known prefix, not in doc ranges |
| Real provider IPs in examples | Authenticity matters for the example |

### Line Length Rules

Maximum 80 characters per line. Lines inside `.. code-block::` directives are **exempt** from the line length limit (they render with `<pre>` tags and preserve source formatting).

### Suppression Syntax

When real public IPs or long lines are unavoidable, wrap the block:

```rst
.. stop_vyoslinter

.. code-block:: none

   set system name-server '8.8.8.8'

.. start_vyoslinter
```

**Rules for suppression markers:**

- Place `.. stop_vyoslinter` on its own line, immediately before the content
- Place `.. start_vyoslinter` on its own line, immediately after the content
- Always re-enable the linter — never leave it stopped for the rest of the file
- Suppress the smallest possible region
- Do NOT use suppression for content that can use documentation-reserved addresses instead

### Common Mistakes

- Removing `stop/start_vyoslinter` markers without fixing the underlying issue (exposes the line to the linter and fails CI)
- Using real public IPs when documentation addresses would work just as well
- Adding suppression markers around content that only has private (RFC 1918) addresses or `0.0.0.0/0` — these are allowed and don't need suppression
