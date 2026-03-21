# VyOS Documentation Improvements — Design Spec

**Date:** 2026-03-21
**Scope:** Documentation quality, consistency, structure, and RTD platform cleanup
**Delivery:** 3 separate PRs + direct RTD API actions

---

## PR 1: Mechanical Fixes (`fix/docs-mechanical-cleanup`)

### Heading Hierarchy (35 files)

Every RST file must use `#` as the adornment character for its first heading, with both an overline and an underline of `#` characters that are at least as long as the heading text. Fix 35 files that currently use `=`, `*`, or `-` as the first heading adornment instead.

**Affected files:**

Using `=` as first heading (23 files):
- `automation/command-scripting.rst`
- `automation/terraform/terraformAWS.rst`
- `automation/terraform/terraformAZ.rst`
- `automation/terraform/terraformGoogle.rst`
- `automation/terraform/terraformvSphere.rst`
- `automation/terraform/terraformvyos.rst`
- `automation/vyos-ansible.rst`
- `automation/vyos-govyos.rst`
- `automation/vyos-napalm.rst`
- `automation/vyos-netmiko.rst`
- `automation/vyos-pyvyos.rst`
- `automation/vyos-salt.rst`
- `configexamples/firewall.rst`
- `configexamples/index.rst`
- `configexamples/wan-load-balancing.rst`
- `configuration/highavailability/index.rst`
- `configuration/interfaces/openvpn-examples.rst`
- `configuration/interfaces/tunnel.rst`
- `configuration/loadbalancing/wan.rst`
- `configuration/service/mdns.rst`
- `configuration/vpn/ipsec/remoteaccess_ipsec.rst`
- `installation/update.rst`
- `vpp/configuration/ipfix.rst`

Using `-` as first heading (7 files):
- `configexamples/azure-vpn-bgp.rst`
- `configexamples/azure-vpn-dual-bgp.rst`
- `configexamples/fwall-and-bridge.rst`
- `configexamples/fwall-and-vrf.rst`
- `configexamples/policy-based-ipsec-and-firewall.rst`
- `configexamples/site-2-site-cisco.rst`
- `configexamples/zone-policy.rst`

Using `*` as first heading (5 files):
- `configuration/system/lcd.rst`
- `installation/virtual/docker.rst`
- `installation/virtual/libvirt.rst`
- `installation/virtual/proxmox.rst`
- `operation/information.rst`

**Approach:** For each file, replace the first heading underline/overline character with `#`, keeping the same length. Adjust subsequent heading levels downward if needed to maintain proper hierarchy.

### Tab Indentation (13 files)

Replace tab characters with appropriate space indentation in RST files:

- `configuration/trafficpolicy/index.rst`
- `configuration/service/eventhandler.rst`
- `configuration/interfaces/wireless.rst`
- `cli.rst`
- `installation/install.rst`
- `automation/terraform/terraformGoogle.rst`
- `automation/terraform/terraformAWS.rst`
- `automation/terraform/terraformAZ.rst`
- `automation/terraform/terraformvSphere.rst`
- `configexamples/nmp.rst`
- `configexamples/ansible.rst`
- `configexamples/qos.rst`
- `configexamples/l3vpn-hub-and-spoke.rst`

### Typos (2 files)

- `configuration/index.rst`: "respresent" → "represent"
- `configuration/system/sysctl.rst` line 7: "chapeter" → "chapter"

### Metadata Formatting (1 file)

- `configuration/policy/index.rst` line 1: `:lastproofread:2021-07-12` → `:lastproofread: 2021-07-12` (add missing space)

---

## PR 2: Content Quality (`fix/docs-content-quality`)

### TODO Comments for Raw Command Blocks (12 files)

Add `.. TODO:: Convert raw command blocks to cfgcmd/opcmd directives` near the top of these files:

- `configuration/vpn/ipsec/remoteaccess_ipsec.rst`
- `configuration/vpn/ipsec/troubleshooting_ipsec.rst`
- `configuration/vpn/rsa-keys.rst`
- `configuration/vpn/openconnect.rst`
- `configuration/nat/nat64.rst`
- `configuration/nat/nat66.rst`
- `configuration/loadbalancing/wan.rst`
- `configuration/firewall/index.rst`
- `configuration/service/snmp.rst`
- `configuration/policy/examples.rst`
- `configuration/interfaces/vti.rst`
- `configuration/interfaces/openvpn-examples.rst`

### Fill TBD Placeholders (2 files)

- `configuration/system/flow-accounting.rst` line 87: Replace `TBD` with description of the `syslog-facility` parameter (controls which syslog facility flow-accounting messages are sent to).
- `configuration/protocols/static.rst` line 274: Replace `TBD` with brief content about alternate routing tables (VRF-based routing table selection for static routes).

### Stub Page Admonitions (3 files)

Add `.. note:: This page is a stub and needs expansion. Contributions welcome.` to:

- `installation/virtual/eve-ng.rst`
- `installation/cloud/oracle.rst`
- `configuration/system/sysctl.rst`

---

## PR 3: Structural Reorganization (`fix/docs-structural-reorg`)

### Split `troubleshooting/index.rst`

Current file: 460 lines covering 5 distinct topics. Split into:

| New File | Content | Source Lines |
|---|---|---|
| `troubleshooting/index.rst` | Intro + toctree only | Lines 1–9 (rewritten) |
| `troubleshooting/connectivity.rst` | Ping, traceroute, mtr, IPv6 discovery | Lines 12–158 |
| `troubleshooting/interfaces.rst` | Interface names, MAC address issues | Lines 160–199 |
| `troubleshooting/monitoring.rst` | Traffic dumps, bandwidth, iperf, monitor command | Lines 201–358 |
| `troubleshooting/terminal.rst` | Console clearing, counter resets | Lines 360–401 |
| `troubleshooting/system.rst` | Boot steps, system information | Lines 404–460 |

**Heading levels in sub-pages:** Each sub-page starts with `#####` as its title. Internal sections are promoted accordingly: current `*****` sections become `*****` (unchanged if already second-level) or promoted to match. Current `=====` sub-sections become `*****`, and `-----` become `=====`. The goal is each sub-page has a self-contained heading hierarchy starting from `#####`.

New `troubleshooting/index.rst` content:

```rst
.. _troubleshooting:

###############
Troubleshooting
###############

Sometimes things break or don't work as expected. This section describes
several troubleshooting tools provided by VyOS that can help when something
goes wrong.

.. toctree::
   :maxdepth: 1

   connectivity
   interfaces
   monitoring
   terminal
   system
```

Each sub-page gets a proper `#####` title heading.

### Create `contributing/index.rst`

Create `contributing/index.rst` with title and toctree listing the 7 existing contributing pages. Update root `index.rst` "Development" toctree to reference `contributing/index` instead of listing individual pages. Note: `documentation.rst` stays in the "Misc" toctree — it is a general writing guide, not a contributing-specific page.

### Clean up VPN "pages to sort"

- `configuration/vpn/index.rst`: Remove "pages to sort" text, integrate `dmvpn` into the main toctree
- `configuration/vpn/ipsec/index.rst`: Remove empty second toctree

---

## RTD Platform Cleanup (Direct API Actions)

### Hide Inactive Versions (16 versions)

Set `hidden: true` via PATCH on these inactive version slugs:

- `revert-1544-t6652-current`
- `mergify-bp-sagitta-pr-1533`
- `vpp-next`
- `1.4.3`, `1.4.0`
- `1.3.8`, `1.3.7`, `1.3.6`, `1.3.5`, `1.3.4`, `1.3.3-epa1`, `1.3.3`, `1.3.2`
- `1.2.9-s1`
- `vyos_1.2-2019q4`
- `stable`

Note: `current` is NOT hidden — it is the primary branch (`current` tracks VyOS 1.5.x rolling). The `latest` slug already points to this branch and is the active version; `current` is already inactive but should not be hidden in case it is referenced by external links.

**Verification before applying:** Capture current state of all versions via `GET /api/v3/projects/vyos/versions/?limit=100` and save the response locally before making any PATCH calls. This provides a rollback reference.

### Delete Disabled Redirects (2 redirects)

Delete redirect IDs for:
- `changelog.html` → `changelog/$(version).html` (disabled, broken)
- `installation/vyos-on-baremetal.html` → `installation/bare-metal.html` (disabled, obsolete)

### No Action Items

- **Translations:** Locale directories kept as-is for future use
- **PDF for 1.2:** Left as-is (EOL version)

---

## Execution Order

1. **PR 1** (mechanical fixes) — no dependencies, merge first
2. **PR 2** (content quality) — no dependencies on PR 1, can be parallel
3. **PR 3** (structural reorg) — should go after PR 1 to avoid merge conflicts on shared files
4. **RTD cleanup** — independent, can run anytime

## Success Criteria

- All 35 heading hierarchy violations fixed
- Zero tab characters in RST files (13 files cleaned)
- Zero typos in the identified files
- 12 files flagged with TODO for directive conversion
- Zero TBD placeholders remaining
- 3 stub pages clearly marked
- `troubleshooting/` split into 5 focused sub-pages
- `contributing/` has proper index page
- VPN section has no "pages to sort" placeholders
- RTD: 16 stale inactive versions hidden from version selector
- No disabled redirects remain
