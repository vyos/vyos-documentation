# LLM Documentation Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make VyOS documentation consumable by LLMs via curated `llms.txt`, auto-generated `llms-full.txt`, updated `robots.txt`, and sitemap generation.

**Architecture:** Add two Sphinx extensions (`sphinx-llms-txt`, `sphinx-sitemap`) to the build pipeline, create a hand-maintained `llms.txt` entry point served at site root, and replace `robots.txt` with explicit AI bot allowances. All changes are additive — no existing RST files or custom extensions are modified.

**Tech Stack:** Sphinx 7.2.6, sphinx-llms-txt 0.7.1, sphinx-sitemap 2.9.0, ReadTheDocs hosting

**Spec:** `docs/superpowers/specs/2026-03-29-llm-documentation-adaptation-design.md`

---

### Task 1: Add dependencies to requirements.txt

**Files:**
- Modify: `requirements.txt`

- [ ] **Step 1: Add sphinx-llms-txt and sphinx-sitemap**

Append to `requirements.txt`:

```
sphinx-llms-txt==0.7.1
sphinx-sitemap==2.9.0
```

The full file should be:

```
urllib3==2.6.3
Sphinx==7.2.6
sphinx-rtd-theme==2.0.0
sphinx-autobuild==2021.3.14
sphinx-notfound-page==1.0.0
lxml==5.1.0
myst-parser==2.0.0
sphinx_design==0.5.0
sphinx-llms-txt==0.7.1
sphinx-sitemap==2.9.0
```

- [ ] **Step 2: Install locally and verify**

Run: `pip3 install -r requirements.txt`

Expected: Both packages install without errors.

- [ ] **Step 3: Commit**

```bash
git add requirements.txt
git commit -m "feat: add sphinx-llms-txt and sphinx-sitemap dependencies"
```

---

### Task 2: Register extensions and set html_baseurl in conf.py

**Files:**
- Modify: `docs/conf.py`

- [ ] **Step 1: Add extensions to the extensions list**

In `docs/conf.py`, add `'sphinx_llms_txt'` and `'sphinx_sitemap'` to the `extensions` list. The updated list:

```python
extensions = ['sphinx.ext.intersphinx',
              'sphinx.ext.todo',
              'sphinx.ext.ifconfig',
              'sphinx.ext.graphviz',
              'notfound.extension',
              'autosectionlabel',
              'myst_parser',
              'sphinx_design',
              'vyos',
              'sphinx_llms_txt',
              'sphinx_sitemap',
]
```

- [ ] **Step 2: Add html_baseurl**

Add immediately after `html_extra_path = ['_html_extra']` (line 112):

```python
html_baseurl = 'https://docs.vyos.io/en/latest/'
```

- [ ] **Step 3: Commit**

```bash
git add docs/conf.py
git commit -m "feat: register sphinx-llms-txt and sphinx-sitemap extensions"
```

---

### Task 3: Create curated llms.txt

**Files:**
- Create: `docs/_html_extra/llms.txt`

- [ ] **Step 1: Create the file**

Create `docs/_html_extra/llms.txt` with the following content (served at site root via the existing `html_extra_path` mechanism):

```markdown
# VyOS

> VyOS is a free, open-source network operating system based on Debian GNU/Linux.
> It provides routing, firewall, and VPN functionality via a unified CLI using
> `set`/`delete`/`show` command hierarchy. Current rolling release is 1.5.x (circinus).

VyOS configuration follows a tree structure. All configuration commands start with
`set` (to add/change) or `delete` (to remove). Changes are staged and applied with
`commit`. The CLI hierarchy maps directly to the documentation structure.

## Quick Start

- [Quick Start Guide](https://docs.vyos.io/en/latest/quick-start.html): Minimal setup walkthrough
- [CLI Overview](https://docs.vyos.io/en/latest/cli.html): Command-line interface usage

## Configuration

- [Firewall](https://docs.vyos.io/en/latest/configuration/firewall/index.html): Zone-based firewall, rules, groups
- [Interfaces](https://docs.vyos.io/en/latest/configuration/interfaces/index.html): Ethernet, bonding, bridge, VLAN, tunnel, wireless
- [Protocols](https://docs.vyos.io/en/latest/configuration/protocols/index.html): BGP, OSPF, IS-IS, static routing, MPLS
- [VPN](https://docs.vyos.io/en/latest/configuration/vpn/index.html): IPsec, OpenVPN, WireGuard, L2TP, PPTP
- [NAT](https://docs.vyos.io/en/latest/configuration/nat/index.html): Source NAT, destination NAT, NAT66
- [System](https://docs.vyos.io/en/latest/configuration/system/index.html): DNS, NTP, syslog, users, task scheduler
- [High Availability](https://docs.vyos.io/en/latest/configuration/highavailability/index.html): VRRP
- [Load Balancing](https://docs.vyos.io/en/latest/configuration/loadbalancing/index.html): WAN and reverse proxy
- [Containers](https://docs.vyos.io/en/latest/configuration/container/index.html): Podman-based container support
- [PKI](https://docs.vyos.io/en/latest/configuration/pki/index.html): Certificate management
- [Policy](https://docs.vyos.io/en/latest/configuration/policy/index.html): Route maps, prefix lists, access lists
- [Traffic Policy](https://docs.vyos.io/en/latest/configuration/trafficpolicy/index.html): QoS and shaping
- [Service](https://docs.vyos.io/en/latest/configuration/service/index.html): DHCP, DNS forwarding, SNMP, SSH, HTTPS API
- [VRF](https://docs.vyos.io/en/latest/configuration/vrf/index.html): Virtual routing and forwarding

## Operations

- [Operational Commands](https://docs.vyos.io/en/latest/operation/index.html): Show, monitor, restart commands

## Installation

- [Installation Guide](https://docs.vyos.io/en/latest/installation/index.html): Bare metal, virtual, cloud deployments

## Automation

- [Automation](https://docs.vyos.io/en/latest/automation/index.html): Ansible, Terraform, HTTP API, NETCONF

## Configuration Examples

- [Blueprints](https://docs.vyos.io/en/latest/configexamples/index.html): Real-world topology examples

## Optional

- [Contributing](https://docs.vyos.io/en/latest/contributing/index.html): Development workflow
- [VPP](https://docs.vyos.io/en/latest/vpp/index.html): Vector Packet Processing integration
```

- [ ] **Step 2: Commit**

```bash
git add docs/_html_extra/llms.txt
git commit -m "feat: add curated llms.txt for LLM discovery"
```

---

### Task 4: Replace robots.txt with AI bot allowances

**Files:**
- Modify: `docs/_html_extra/robots.txt`

- [ ] **Step 1: Replace robots.txt content**

Replace the entire contents of `docs/_html_extra/robots.txt` with:

```
User-agent: *
Allow: /

# AI Training Crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: PerplexityBot
Allow: /

# AI Search/Retrieval
User-agent: ChatGPT-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Perplexity-User
Allow: /

Sitemap: https://docs.vyos.io/sitemap.xml
```

- [ ] **Step 2: Commit**

```bash
git add docs/_html_extra/robots.txt
git commit -m "feat: update robots.txt with explicit AI bot allowances"
```

---

### Task 5: Build verification

**Files:** None (read-only verification)

- [ ] **Step 1: Run Sphinx build**

Run from repo root:

```bash
docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos/vyos-documentation make html
```

If Docker is unavailable, run locally:

```bash
cd docs && make html
```

Expected: Build completes without errors. Warnings about missing `vyos-1x` submodule content are expected and can be ignored.

- [ ] **Step 2: Verify llms.txt is served at root**

```bash
ls -la docs/_build/html/llms.txt
cat docs/_build/html/llms.txt | head -5
```

Expected: File exists and starts with `# VyOS`.

- [ ] **Step 3: Verify llms-full.txt is generated**

```bash
ls -la docs/_build/html/llms-full.txt
wc -l docs/_build/html/llms-full.txt
```

Expected: File exists and contains the full concatenated documentation (large file, thousands of lines).

- [ ] **Step 4: Verify robots.txt is served at root**

```bash
cat docs/_build/html/robots.txt | head -5
```

Expected: Starts with `User-agent: *` followed by `Allow: /`.

- [ ] **Step 5: Verify sitemap.xml is generated**

```bash
ls -la docs/_build/html/sitemap.xml
head -10 docs/_build/html/sitemap.xml
```

Expected: Valid XML sitemap with `<urlset>` root element and URLs prefixed with `https://docs.vyos.io/en/latest/`.

- [ ] **Step 6: Spot-check sitemap URLs**

```bash
grep -c '<url>' docs/_build/html/sitemap.xml
```

Expected: Count roughly matches the number of documentation pages (~258 RST files).
