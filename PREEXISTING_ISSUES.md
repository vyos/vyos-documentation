# Pre-existing Issues

Issues that existed before the RST-to-MyST migration or are out-of-scope
for the current migration PR. Process separately.

---

## 1. RST `.. include::` in `.txt` template files

**Files:**
- `docs/_include/interface-vlan-8021ad.txt:164`
- `docs/_include/interface-vlan-8021q.txt:131`

**Issue:** Both files end with `.. include:: /_include/common-references.txt` (RST
syntax). These files are rendered via `cmdincludemd` (MyST context), so the RST
`.. include::` directive is silently ignored. `common-references.txt` contains
markdown link definitions (e.g., `[802.1q]: url`) that are not injected.

The template bodies also use RST-style inline reference syntax (`802.1q_`) which
won't render as hyperlinks in MyST context.

**Impact:** Potential broken/unlinked references in VLAN interface pages
(ethernet, bonding, bridge, wireless, virtual-ethernet, pseudo-ethernet).

**Fix:** Replace `.. include::` with `{include}` MyST directive or inline the
link definitions. Convert `word_` RST references to `[word]` MyST syntax.

---

## 2. Consecutive `cfgcmd`/`opcmd` blocks with no blank line between them

**Count:** 186 instances across 34 files

**Top affected files:**
```
 23  docs/configuration/protocols/ospf.md
 18  docs/configuration/interfaces/openvpn.md
 15  docs/configuration/policy/route-map.md
 14  docs/configuration/service/ssh.md
 13  docs/configuration/firewall/bridge.md
 10  docs/configuration/firewall/ipv4.md
  8  docs/configuration/firewall/ipv6.md
  7  docs/configuration/container/index.md
  7  docs/configuration/service/dhcp-server.md
  7  docs/configuration/service/ipoe-server.md
  7  docs/configuration/service/webproxy.md
  5  docs/configuration/system/syslog.md
  4  docs/configuration/system/ipv6.md
  4  docs/configuration/policy/as-path-list.md
  4  docs/configuration/policy/community-list.md
  4  docs/configuration/policy/extcommunity-list.md
  4  docs/configuration/policy/large-community-list.md
  4  docs/configuration/interfaces/bonding.md
  3  docs/configuration/system/proxy.md
  3  docs/configuration/system/sflow.md
  (14 more files with 1-2 instances each)
```

**Issue:** In the original RST, consecutive `.. cfgcmd::` / `.. opcmd::`
directives were separated by blank lines. The MyST converter omitted these blank
lines between consecutive backtick-fenced directive blocks. In MyST-parser,
block-level directives should be separated by blank lines. Depending on the
Sphinx/MyST-parser version, this may cause the second directive to be parsed
incorrectly or merged with the first.

**Impact:** Uncertain — may cause visual rendering differences. Needs Playwright
diff verification to confirm impact before fixing 186 cases.

**Fix:** Insert a blank line between each consecutive ```` ``` ```` close and the
next ```` ```{cfgcmd}```/```` ```{opcmd} ```` open. Can be automated with a
simple script.

**Script outline:**
```python
import re
# For each .md file, insert blank line between:
# line matching r'^`{3,}\s*$' (cfgcmd/opcmd close)
# followed by line matching r'^`{3,}\{(cfgcmd|opcmd)' (next cmd open)
# at top-level (not inside another fence)
```

---

## 3. RST-style backtick references in `.txt` include templates

**File:** `docs/_include/interface-vlan-8021q.txt` (lines 1, 7)

**Issue:** Uses RST anonymous hyperlink targets (`802.1q_`) which are not valid
MyST syntax. These won't render as hyperlinks when the template is processed via
`cmdincludemd`.

**Fix:** Convert to MyST inline link syntax `[802.1q]` with corresponding link
definitions.

---

## 4. Toctree pages with minor cosmetic diffs

**Observed:** `configuration/index.md` had ~5.4% visual diff in Playwright scan.

**Issue:** The page content matches the RST original exactly. The diff is likely
from stylesheet or rendering engine differences between the reference
(docs.vyos.io/en/latest) and the preview build, not from content errors.

**Fix:** None needed — cosmetic difference only.
