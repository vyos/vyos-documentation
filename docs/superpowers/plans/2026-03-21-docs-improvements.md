# VyOS Documentation Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix documentation quality issues across 4 work streams: mechanical fixes, content quality, structural reorganization, and RTD platform cleanup.

**Architecture:** 3 separate git branches each producing one PR, plus direct RTD API calls. Each PR is independent — PR 1 and PR 2 can run in parallel; PR 3 should follow PR 1 to avoid merge conflicts.

**Tech Stack:** RST (reStructuredText), Sphinx, Read the Docs API v3, curl, git

**Spec:** `docs/superpowers/specs/2026-03-21-docs-improvements-design.md`

---

## PR 1: Mechanical Fixes (`fix/docs-mechanical-cleanup`)

### Task 1: Create branch and fix heading hierarchy — `=` files (23 files)

**Files:** All under `docs/` prefix.
- Modify: `automation/command-scripting.rst`, `automation/terraform/terraformAWS.rst`, `automation/terraform/terraformAZ.rst`, `automation/terraform/terraformGoogle.rst`, `automation/terraform/terraformvSphere.rst`, `automation/terraform/terraformvyos.rst`, `automation/vyos-ansible.rst`, `automation/vyos-govyos.rst`, `automation/vyos-napalm.rst`, `automation/vyos-netmiko.rst`, `automation/vyos-pyvyos.rst`, `automation/vyos-salt.rst`, `configexamples/firewall.rst`, `configexamples/index.rst`, `configexamples/wan-load-balancing.rst`, `configuration/highavailability/index.rst`, `configuration/interfaces/openvpn-examples.rst`, `configuration/interfaces/tunnel.rst`, `configuration/loadbalancing/wan.rst`, `configuration/service/mdns.rst`, `configuration/vpn/ipsec/remoteaccess_ipsec.rst`, `installation/update.rst`, `vpp/configuration/ipfix.rst`

These files use `====` underline-only for their first heading. The fix is to add an overline of `#` characters repeated to match the title length and replace the `====` underline with `#` characters repeated to that same length.

**Pattern — before:**
```rst
Command Scripting
=================
```

**Pattern — after:**
```rst
#################
Command Scripting
#################
```

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b fix/docs-mechanical-cleanup current
```

- [ ] **Step 2: Fix all 23 `=` heading files**

For each file: read the first heading, add a `#` overline of the same length as the title, replace the `=` underline with `#` of the same length. Preserve any `:lastproofread:` or `.. _label:` lines above the heading.

- [ ] **Step 3: Verify no RST syntax errors**

```bash
cd docs
python3 -c "
import subprocess, sys
result = subprocess.run(['python3', '-m', 'sphinx', '-b', 'html', '-W', '--keep-going', '.', '_build/verify'], capture_output=True, text=True, timeout=300)
print(result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout)
print(result.stderr[-2000:] if len(result.stderr) > 2000 else result.stderr)
sys.exit(result.returncode)
"
```

If Sphinx is not installed locally, verify manually by checking each file's first 5 lines have the pattern: overline `####`, title text, underline `####`.

- [ ] **Step 4: Commit**

```bash
git add -A docs/
git commit -m "fix: correct heading hierarchy in 23 files using = as first heading

Replace underline-only = headings with proper ##### overline+underline
format per project convention."
```

### Task 2: Fix heading hierarchy — `-` files (7 files)

**Files:** All under `docs/` prefix.
- Modify: `configexamples/azure-vpn-bgp.rst`, `configexamples/azure-vpn-dual-bgp.rst`, `configexamples/fwall-and-bridge.rst`, `configexamples/fwall-and-vrf.rst`, `configexamples/policy-based-ipsec-and-firewall.rst`, `configexamples/site-2-site-cisco.rst`, `configexamples/zone-policy.rst`

These files use `----` underline-only for their first heading. Same fix pattern: add `####` overline, replace `----` underline with `####`.

**Pattern — before:**
```rst
Route-Based Site-to-Site VPN to Azure (BGP over IKEv2/IPsec)
------------------------------------------------------------
```

**Pattern — after:**
```rst
##############################################################
Route-Based Site-to-Site VPN to Azure (BGP over IKEv2/IPsec)
##############################################################
```

- [ ] **Step 1: Fix all 7 `-` heading files**

Same approach as Task 1 Step 2.

- [ ] **Step 2: Commit**

```bash
git add -A docs/configexamples/
git commit -m "fix: correct heading hierarchy in 7 files using - as first heading"
```

### Task 3: Fix heading hierarchy — `*` files (5 files)

**Files:** All under `docs/` prefix.
- Modify: `configuration/system/lcd.rst`, `installation/virtual/docker.rst`, `installation/virtual/libvirt.rst`, `installation/virtual/proxmox.rst`, `operation/information.rst`

These files use `****` overline+underline. Replace both `*` lines with `#` of the same length.

**Pattern — before:**
```rst
********************
System Display (LCD)
********************
```

**Pattern — after:**
```rst
####################
System Display (LCD)
####################
```

- [ ] **Step 1: Fix all 5 `*` heading files**

Replace `*` with `#` on both overline and underline.

- [ ] **Step 2: Commit**

```bash
git add -A docs/
git commit -m "fix: correct heading hierarchy in 5 files using * as first heading"
```

### Task 4: Replace tab characters (13 files)

**Files:** All under `docs/` prefix.
- Modify: `configuration/trafficpolicy/index.rst`, `configuration/service/eventhandler.rst`, `configuration/interfaces/wireless.rst`, `cli.rst`, `installation/install.rst`, `automation/terraform/terraformGoogle.rst`, `automation/terraform/terraformAWS.rst`, `automation/terraform/terraformAZ.rst`, `automation/terraform/terraformvSphere.rst`, `configexamples/nmp.rst`, `configexamples/ansible.rst`, `configexamples/qos.rst`, `configexamples/l3vpn-hub-and-spoke.rst`

- [ ] **Step 1: Replace tabs with spaces in all 13 files**

For each file, read it, identify tab characters, and replace with appropriate spacing. Tabs inside code blocks (``.. code-block::``) should be replaced with the equivalent visual spacing (typically 2 or 3 spaces depending on context). Tabs in RST structural content should be replaced with 2 spaces.

**Important:** Be careful with tabs inside table markup or code blocks — preserve visual alignment.

- [ ] **Step 2: Verify no tabs remain**

```bash
grep -r $'\t' docs/ --include='*.rst' -l
```

Expected: no output (no files with tabs).

- [ ] **Step 3: Commit**

```bash
git add -A docs/
git commit -m "fix: replace tab characters with spaces in 13 RST files"
```

### Task 5: Fix typos and metadata formatting (3 files)

**Files:** All under `docs/` prefix.
- Modify: `configuration/index.rst`, `configuration/system/sysctl.rst`, `configuration/policy/index.rst`

- [ ] **Step 1: Fix typo in `configuration/index.rst`**

Line 5: change `respresent` to `represent`.

- [ ] **Step 2: Fix typo in `configuration/system/sysctl.rst`**

Line 7: change `chapeter` to `chapter`.

- [ ] **Step 3: Fix metadata formatting in `configuration/policy/index.rst`**

Line 1: change `:lastproofread:2021-07-12` to `:lastproofread: 2021-07-12` (add space after colon).

- [ ] **Step 4: Commit**

```bash
git add docs/configuration/index.rst docs/configuration/system/sysctl.rst docs/configuration/policy/index.rst
git commit -m "fix: correct typos and metadata formatting in 3 files"
```

### Task 6: Create PR for mechanical fixes

- [ ] **Step 1: Push branch and create PR**

```bash
git push -u origin fix/docs-mechanical-cleanup
gh pr create --title "Fix heading hierarchy, tabs, and typos across docs" --body "$(cat <<'EOF'
## Summary
- Fix first-heading hierarchy in 35 RST files (must use `#####` overline+underline)
- Replace tab characters with spaces in 13 RST files
- Fix typos: "respresent" → "represent", "chapeter" → "chapter"
- Fix `:lastproofread:` metadata formatting in policy/index.rst

## Test plan
- [ ] Verify Sphinx build succeeds without warnings
- [ ] Spot-check heading rendering in built HTML
- [ ] Verify no tab characters remain: `grep -rP '\t' docs/ --include='*.rst'`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR 2: Content Quality (`fix/docs-content-quality`)

### Task 7: Create branch and add TODO comments (12 files)

**Files:** All under `docs/` prefix.
- Modify: `configuration/vpn/ipsec/remoteaccess_ipsec.rst`, `configuration/vpn/ipsec/troubleshooting_ipsec.rst`, `configuration/vpn/rsa-keys.rst`, `configuration/vpn/openconnect.rst`, `configuration/nat/nat64.rst`, `configuration/nat/nat66.rst`, `configuration/loadbalancing/wan.rst`, `configuration/firewall/index.rst`, `configuration/service/snmp.rst`, `configuration/policy/examples.rst`, `configuration/interfaces/vti.rst`, `configuration/interfaces/openvpn-examples.rst`

- [ ] **Step 1: Create feature branch**

```bash
git checkout current
git checkout -b fix/docs-content-quality current
```

- [ ] **Step 2: Add TODO comment to each of the 12 files**

For each file, add the following line after the first heading block (after the heading underline — which may be `====`, `----`, `****`, or `####` depending on whether PR 1 has been merged — and any blank line):

```rst
.. TODO:: Convert raw command blocks in this file to cfgcmd/opcmd
   directives for command coverage tracking.
```

Read each file first to find the correct insertion point — it should go right after the title heading and any introductory label/metadata, before the first content paragraph.

- [ ] **Step 3: Commit**

```bash
git add -A docs/
git commit -m "chore: add TODO markers for 12 files needing cfgcmd/opcmd conversion"
```

### Task 8: Fill TBD placeholders (2 files)

**Files:** All under `docs/` prefix.
- Modify: `configuration/system/flow-accounting.rst`, `configuration/protocols/static.rst`

- [ ] **Step 1: Fill TBD in `flow-accounting.rst`**

At line 87, replace `TBD` with:

```rst
   Configure the syslog facility used for flow-accounting log messages.
   Available facilities follow standard syslog conventions (e.g.,
   ``daemon``, ``local0`` through ``local7``).
```

(This sits under the `.. cfgcmd::` directive at line 85, so it must be indented with 3 spaces to be part of the directive body.)

- [ ] **Step 2: Fill TBD in `static.rst`**

At line 274, replace the standalone `TBD` with nothing — the explanation already follows on line 276-277. Just remove the `TBD` line so the text flows naturally from the heading into the existing content:

```rst
************************
Alternate Routing Tables
************************

Alternate routing tables are used with policy based routing by utilizing
:ref:`vrf`.
```

- [ ] **Step 3: Commit**

```bash
git add docs/configuration/system/flow-accounting.rst docs/configuration/protocols/static.rst
git commit -m "fix: fill TBD placeholder in flow-accounting, remove TBD in static routes"
```

### Task 9: Add stub admonitions (3 files)

**Files:** All under `docs/` prefix.
- Modify: `installation/virtual/eve-ng.rst`, `installation/cloud/oracle.rst`, `configuration/system/sysctl.rst`

- [ ] **Step 1: Add stub note to `eve-ng.rst`**

After line 5 (the `######` underline), add a blank line then:

```rst
.. note:: This page is a stub and needs expansion. Contributions
   welcome via the `VyOS documentation repository
   <https://github.com/vyos/vyos-documentation>`_.
```

- [ ] **Step 2: Add stub note to `oracle.rst`**

After line 5 (the `######` underline), add a blank line then the same note.

- [ ] **Step 3: Add stub note to `sysctl.rst`**

After line 5 (the `######` underline), add a blank line then the same note.

- [ ] **Step 4: Commit**

```bash
git add docs/installation/virtual/eve-ng.rst docs/installation/cloud/oracle.rst docs/configuration/system/sysctl.rst
git commit -m "docs: add stub admonitions to 3 minimal pages"
```

### Task 10: Create PR for content quality

- [ ] **Step 1: Push branch and create PR**

```bash
git push -u origin fix/docs-content-quality
gh pr create --title "Add TODO markers, fill placeholders, mark stub pages" --body "$(cat <<'EOF'
## Summary
- Add TODO comments to 12 files that use raw command blocks instead of cfgcmd/opcmd directives
- Fill TBD placeholder in flow-accounting.rst with syslog-facility description
- Remove orphan TBD in static.rst (content already follows the heading)
- Add stub admonitions to 3 minimal pages (eve-ng, oracle, sysctl)

## Test plan
- [ ] Verify Sphinx build succeeds
- [ ] Verify TODO directives render as expected
- [ ] Verify stub notes render correctly

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR 3: Structural Reorganization (`fix/docs-structural-reorg`)

### Task 11: Create branch and split troubleshooting page

**Files:** All under `docs/troubleshooting/` prefix.
- Modify: `index.rst`
- Create: `connectivity.rst`, `interfaces.rst`, `monitoring.rst`, `terminal.rst`, `system.rst`

- [ ] **Step 1: Create feature branch**

```bash
git checkout current
git checkout -b fix/docs-structural-reorg current
```

- [ ] **Step 2: Read `troubleshooting/index.rst` completely**

Read the full 460-line file to understand exact content boundaries.

- [ ] **Step 3: Create `troubleshooting/connectivity.rst`**

Extract lines 12–158 (Connectivity Tests section). Add proper heading:

```rst
##################
Connectivity Tests
##################
```

Keep all `.. opcmd::` directives and code blocks. Promote internal headings:
- `Basic Connectivity Tests` (was `=====`) → use `*****`
- `Advanced Connectivity Tests` (was `=====`) → use `*****`
- `IPv6 Topology Discovery` (was `=====`) → use `*****`
- `Router Discovery` (was `-----`) → use `=====`
- `Neighbor Discovery` (was `-----`) → use `=====`

- [ ] **Step 4: Create `troubleshooting/interfaces.rst`**

Extract lines 160–199 (Interface names section):

```rst
###############
Interface Names
###############

If you find the names of your interfaces have changed...
```

No sub-headings in this section.

- [ ] **Step 5: Create `troubleshooting/monitoring.rst`**

Extract lines 201–358 (Monitoring section):

```rst
##########
Monitoring
##########

VyOS features several monitoring tools.
```

Promote internal headings:
- `Traffic Dumps` (was `=====`) → use `*****`
- `Interface Bandwidth Usage` (was `=====`) → use `*****`
- `Interface Performance` (was `=====`) → use `*****`
- `Monitor command` (was `=====`) → use `*****`

- [ ] **Step 6: Create `troubleshooting/terminal.rst`**

Extract lines 360–401 (Terminal/Console section). Lines 402–403 are blank separators and can be dropped.

```rst
################
Terminal/Console
################

Sometimes you need to clear counters or statistics...
```

No sub-headings to promote.

- [ ] **Step 7: Create `troubleshooting/system.rst`**

Extract lines 404–460 (System Information section). This MUST include:
- Lines 404–448: the System Information content and Boot Steps
- Lines 449–460: `.. stop_vyoslinter`, all `.. _link:` reference definitions, AND `.. start_vyoslinter` on the final line

The `.. stop_vyoslinter` / `.. start_vyoslinter` pair must stay balanced — both must be in this file since the reference link definitions between them use bare URLs that would otherwise trigger linter warnings.

```rst
##################
System Information
##################
```

Promote internal headings:
- `Boot Steps` (was `=====`) → use `*****`

Keep the `.. _boot-steps:` label. Keep the `.. stop_vyoslinter` / `.. start_vyoslinter` directives and all `.. _link:` references at the bottom.

- [ ] **Step 8: Rewrite `troubleshooting/index.rst`**

Replace the entire file with:

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

- [ ] **Step 9: Commit**

```bash
git add docs/troubleshooting/
git commit -m "refactor: split troubleshooting into 5 focused sub-pages

Split monolithic 460-line troubleshooting/index.rst into:
- connectivity.rst (ping, traceroute, mtr, IPv6 discovery)
- interfaces.rst (interface naming, MAC addresses)
- monitoring.rst (traffic dumps, bandwidth, iperf)
- terminal.rst (console clearing, counter resets)
- system.rst (boot steps, system information)"
```

### Task 12: Create `contributing/index.rst` and update root index

**Files:**
- Create: `docs/contributing/index.rst`
- Modify: `docs/index.rst`

- [ ] **Step 1: Create `contributing/index.rst`**

```rst
############
Contributing
############

.. toctree::
   :maxdepth: 1

   build-vyos
   development
   cla
   issues-features
   upstream-packages
   debugging
   testing
```

- [ ] **Step 2: Update root `index.rst`**

Replace the "Development" toctree section (lines 85–97):

**Before:**
```rst
.. toctree::
   :maxdepth: 2
   :hidden:
   :caption: Development

   contributing/build-vyos
   contributing/development
   contributing/cla
   contributing/issues-features
   contributing/upstream-packages
   contributing/debugging
   contributing/testing
```

**After:**
```rst
.. toctree::
   :maxdepth: 2
   :hidden:
   :caption: Development

   contributing/index
```

- [ ] **Step 3: Commit**

```bash
git add docs/contributing/index.rst docs/index.rst
git commit -m "refactor: create contributing/index.rst, simplify root toctree"
```

### Task 13: Clean up VPN "pages to sort"

**Files:** All under `docs/configuration/vpn/` prefix.
- Modify: `index.rst`, `ipsec/index.rst`

- [ ] **Step 1: Fix `configuration/vpn/index.rst`**

Replace the entire file content with:

```rst
###
VPN
###


.. toctree::
   :maxdepth: 1
   :includehidden:

   dmvpn
   ipsec/index
   l2tp
   openconnect
   pptp
   rsa-keys
   sstp
```

This integrates `dmvpn` into the main toctree (sorted alphabetically) and removes the "pages to sort" text and second toctree.

- [ ] **Step 2: Fix `configuration/vpn/ipsec/index.rst`**

Replace the entire file content with:

```rst
#####
IPsec
#####


.. toctree::
   :maxdepth: 1
   :includehidden:

   ipsec_general
   site2site_ipsec
   remoteaccess_ipsec
   troubleshooting_ipsec
```

This removes the "pages to sort" text and empty second toctree.

- [ ] **Step 3: Commit**

```bash
git add docs/configuration/vpn/index.rst docs/configuration/vpn/ipsec/index.rst
git commit -m "fix: remove 'pages to sort' placeholders from VPN section"
```

### Task 14: Create PR for structural reorganization

- [ ] **Step 1: Push branch and create PR**

```bash
git push -u origin fix/docs-structural-reorg
gh pr create --title "Split troubleshooting, add contributing index, clean VPN structure" --body "$(cat <<'EOF'
## Summary
- Split `troubleshooting/index.rst` (460 lines) into 5 focused sub-pages: connectivity, interfaces, monitoring, terminal, system
- Create `contributing/index.rst` with toctree, simplify root index.rst
- Remove "pages to sort" placeholders from VPN and IPsec index files, integrate dmvpn into main toctree

## Test plan
- [ ] Verify Sphinx build succeeds without warnings
- [ ] Verify troubleshooting sub-pages render correctly and navigation works
- [ ] Verify contributing section appears correctly in sidebar
- [ ] Verify VPN section navigation is clean
- [ ] Verify `.. _boot-steps:` and `.. _troubleshooting:` cross-references still work

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## RTD Platform Cleanup (Direct API Actions)

### Task 15: Capture RTD state and hide inactive versions

**No files modified — API actions only.**

RTD API base: `https://app.readthedocs.org/api/v3/projects/vyos`
Auth header: `Authorization: Token $RTD_TOKEN` (token: `$RTD_TOKEN`)

- [ ] **Step 1: Capture current version state for rollback**

```bash
curl -s -H "Authorization: Token $RTD_TOKEN" \
  "https://app.readthedocs.org/api/v3/projects/vyos/versions/?limit=100" \
  > /tmp/rtd-versions-backup-$(date +%Y%m%d).json
```

- [ ] **Step 2: Hide 16 inactive versions**

Run PATCH for each version slug to set `hidden: true`:

```bash
for slug in \
  revert-1544-t6652-current \
  mergify-bp-sagitta-pr-1533 \
  vpp-next \
  1.4.3 1.4.0 \
  1.3.8 1.3.7 1.3.6 1.3.5 1.3.4 1.3.3-epa1 1.3.3 1.3.2 \
  1.2.9-s1 \
  vyos_1.2-2019q4 \
  stable; do
  echo "Hiding $slug..."
  curl -s -X PATCH \
    -H "Authorization: Token $RTD_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"hidden": true}' \
    "https://app.readthedocs.org/api/v3/projects/vyos/versions/$slug/"
  echo ""
done
```

Expected: each call returns 200 OK with JSON body showing the updated version.

- [ ] **Step 3: Verify versions are hidden**

```bash
curl -s -H "Authorization: Token $RTD_TOKEN" \
  "https://app.readthedocs.org/api/v3/projects/vyos/versions/?limit=100" \
  | python3 -c "import json,sys; versions=json.load(sys.stdin)['results']; [print(f'{v[\"slug\"]:40s} active={v[\"active\"]}  hidden={v[\"hidden\"]}') for v in versions]"
```

Expected: 16 slugs show `hidden=True`, 4 active versions show `hidden=False`.

### Task 16: Delete disabled redirects

- [ ] **Step 1: List redirects to get IDs**

```bash
curl -s -H "Authorization: Token $RTD_TOKEN" \
  "https://app.readthedocs.org/api/v3/projects/vyos/redirects/" \
  | python3 -m json.tool
```

Find the `pk` values for the two disabled redirects:
- `changelog.html` → `changelog/$(version).html`
- `installation/vyos-on-baremetal.html` → `installation/bare-metal.html`

- [ ] **Step 2: Delete the two disabled redirects**

```bash
# Replace <ID1> and <ID2> with actual pk values from step 1
curl -s -X DELETE \
  -H "Authorization: Token $RTD_TOKEN" \
  "https://app.readthedocs.org/api/v3/projects/vyos/redirects/<ID1>/"

curl -s -X DELETE \
  -H "Authorization: Token $RTD_TOKEN" \
  "https://app.readthedocs.org/api/v3/projects/vyos/redirects/<ID2>/"
```

Expected: 204 No Content for each.

- [ ] **Step 3: Verify redirects are cleaned up**

```bash
curl -s -H "Authorization: Token $RTD_TOKEN" \
  "https://app.readthedocs.org/api/v3/projects/vyos/redirects/" \
  | python3 -m json.tool
```

Expected: 5 remaining redirects (all enabled).
