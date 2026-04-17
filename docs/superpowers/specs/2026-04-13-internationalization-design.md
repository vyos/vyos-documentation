# Internationalization (i18n) — Design Spec

**Date:** 2026-04-13
**Status:** Draft
**Depends on:** Cloudflare Hosting Migration (must complete before deployment)
**Related:** RST → MyST Migration (source format doesn't affect i18n — Sphinx gettext works with both), Mobile Performance (translated pages inherit optimizations)
**Execution:** Phase 4 — after Cloudflare Migration completes

## Goal

Add multi-language support to VyOS documentation. First round: Spanish (es), Japanese (ja), German (de), Portuguese (pt), Simplified Chinese (zh_CN). Architecture supports adding languages without code changes.

## Current State

Sphinx i18n infrastructure is partially in place:

- `locale_dirs = ['_locale/']` in `conf.py`
- `gettext_compact = True` — one PO file per top-level directory
- `gettext_uuid = False`
- `update-translations.yml` workflow exists (generates POT/PO files)
- No translations have been contributed

## Architecture

### URL Structure

Extends the Cloudflare Pages URL scheme from the hosting migration spec:

```
docs.vyos.io/en/1.5/          ← English 1.5 LTS (circinus)
docs.vyos.io/en/1.6/          ← English 1.6 rolling
docs.vyos.io/es/1.5/          ← Spanish 1.5 LTS
docs.vyos.io/ja/1.5/          ← Japanese 1.5 LTS
docs.vyos.io/de/1.5/          ← German 1.5 LTS
docs.vyos.io/pt/1.5/          ← Portuguese 1.5 LTS
docs.vyos.io/zh/1.5/          ← Simplified Chinese 1.5 LTS
```

Each language × version combination is a separate Sphinx build output, deployed to its own subdirectory on Cloudflare Pages.

### Directory Layout (Build Output)

```
dist/
├── en/
│   ├── 1.6/
│   ├── 1.5/
│   ├── 1.4/
│   ├── 1.3/
│   └── 1.2/
├── es/
│   └── 1.5/
├── ja/
│   └── 1.5/
├── de/
│   └── 1.5/
├── pt/
│   └── 1.5/
├── zh/
│   └── 1.5/
├── _redirects
├── _headers
└── 404.html
```

Initial round: translations for the 1.5 LTS branch only. The 1.6 rolling release and older versions remain English-only. Adding translations for other versions is a future decision per language. Targeting LTS first ensures translation stability — LTS content changes less frequently than rolling.

### Source Layout

```
docs/
├── _locale/
│   ├── es/
│   │   └── LC_MESSAGES/
│   │       ├── automation.po
│   │       ├── cli.po
│   │       ├── configuration.po
│   │       ├── ...
│   │       └── quick-start.po
│   ├── ja/
│   │   └── LC_MESSAGES/
│   │       └── ...
│   ├── de/
│   │   └── LC_MESSAGES/
│   │       └── ...
│   ├── pt/
│   │   └── LC_MESSAGES/
│   │       └── ...
│   └── zh_CN/
│       └── LC_MESSAGES/
│           └── ...
```

PO files are committed to the repository. Weblate syncs bidirectionally with Git.

## Translation Platform: Weblate

**Selection rationale:**

| Criterion | Weblate | Crowdin | Transifex |
|---|---|---|---|
| Open source | Yes (GPLv3) | No | No |
| Self-hostable | Yes | No | No |
| Git-native sync | Yes (bidirectional) | Webhook-based | API-based |
| Free for OSS | Hosted Libre plan | Free plan (limited) | Free plan (limited) |
| Translation memory | Yes | Yes | Yes |
| Machine translation | DeepL, Google, LibreTranslate | DeepL, Google | Google |
| Glossary | Yes | Yes | Yes |
| Review workflow | Yes (suggest → review → approve) | Yes | Yes |
| Gettext PO support | Native | Yes | Yes |

Weblate's Git-native integration avoids sync complexity. PO files live in the repo; Weblate commits directly to a dedicated branch and opens PRs.

### Weblate Configuration

- **Project:** VyOS Documentation
- **Components:** One per top-level directory (matches `gettext_compact = True` output)
- **Source language:** English
- **File mask:** `docs/_locale/*/LC_MESSAGES/*.po` (includes `zh_CN`)
- **Repository:** `vyos/vyos-documentation` (branch: `current`)
- **Push branch:** `weblate` (auto-created, PRs opened against `current`)
- **Translation memory:** Shared across all components
- **Machine translation:** DeepL as suggestion engine (not auto-applied)
- **Glossary:** VyOS-specific terms (see below)

### VyOS Glossary (Do Not Translate)

Terms that must remain in English across all languages:

- VyOS, VyOS CLI, configure mode, operational mode
- `set`, `delete`, `show`, `commit`, `save`, `compare`, `discard`
- Interface types: `ethernet`, `bonding`, `bridge`, `tunnel`, `wireguard`, `vxlan`, `pppoe`, `wwan`
- Protocol names: BGP, OSPF, ISIS, MPLS, VRRP, DHCP, DHCPv6
- Daemon names: FRR, StrongSwan, OpenVPN, WireGuard, Kea, PowerDNS
- Configuration paths (anything after `set`/`delete`)
- `cfgcmd`, `opcmd` directive content (CLI commands are English-only)

Code blocks, CLI examples, and command output are never translated.

## Sphinx Build Changes

### conf.py Updates

```python
# Existing (unchanged)
locale_dirs = ['_locale/']
gettext_compact = True

# New
gettext_uuid = True          # Stable msgid references across source edits
gettext_additional_targets = [
    'literal-block',         # Don't translate code blocks (safety net)
]
```

Setting `gettext_uuid = True` (currently `False`) adds UUID comments to PO entries, preventing string drift when source paragraphs are reordered.

### Build Command per Language

```bash
# English (unchanged)
sphinx-build -b html docs docs/_build/html

# Spanish
sphinx-build -b html -D language=es docs docs/_build/html-es

# Japanese
sphinx-build -b html -D language=ja docs docs/_build/html-ja

# German
sphinx-build -b html -D language=de docs docs/_build/html-de

# Portuguese
sphinx-build -b html -D language=pt docs docs/_build/html-pt
```

### POT Generation

```bash
sphinx-build -b gettext docs docs/_build/gettext
```

Generates `.pot` template files. Weblate uses these to create/update `.po` files per language.

## GitHub Actions Workflow Changes

### Updated `deploy-docs.yml`

The existing workflow builds English only. Add a language matrix:

```yaml
strategy:
  matrix:
    lang: [en, es, ja, de, pt, zh]

steps:
  - name: Build HTML (${{ matrix.lang }})
    run: |
      if [ "${{ matrix.lang }}" = "en" ]; then
        docker run --rm -v "$PWD":/vyos -w /vyos/docs \
          vyos/vyos-documentation make html
      elif [ "${{ matrix.lang }}" = "zh" ]; then
        docker run --rm -v "$PWD":/vyos -w /vyos/docs \
          vyos/vyos-documentation sphinx-build -b html \
          -D language=zh_CN . _build/html-zh
      else
        docker run --rm -v "$PWD":/vyos -w /vyos/docs \
          vyos/vyos-documentation sphinx-build -b html \
          -D language=${{ matrix.lang }} . _build/html-${{ matrix.lang }}
      fi

  - name: Stage output
    run: |
      mkdir -p dist/${{ matrix.lang }}/${{ env.VERSION }}
      if [ "${{ matrix.lang }}" = "en" ]; then
        cp -r docs/_build/html/. dist/en/${{ env.VERSION }}/
      else
        cp -r docs/_build/html-${{ matrix.lang }}/. \
          dist/${{ matrix.lang }}/${{ env.VERSION }}/
      fi
```

PDF/EPUB generation remains English-only initially.

### Updated `update-translations.yml`

```yaml
name: Update Translation Sources
on:
  push:
    branches: [current]
    paths:
      - 'docs/**/*.rst'
      - 'docs/**/*.md'
      - '!docs/_locale/**'
  workflow_dispatch:

jobs:
  update-pot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Generate POT files
        run: |
          docker run --rm -v "$PWD":/vyos -w /vyos/docs \
            vyos/vyos-documentation sphinx-build -b gettext . _build/gettext

      - name: Update PO files
        run: |
          for lang in es ja de pt zh_CN; do
            docker run --rm -v "$PWD":/vyos -w /vyos/docs \
              vyos/vyos-documentation sphinx-intl update \
              -p _build/gettext -l $lang
          done

      - name: Commit updated PO files
        run: |
          git add docs/_locale/
          git diff --cached --quiet || \
            git commit -m "i18n: update translation source files"
          git push
```

Triggers when English source files change. Updates PO files with new/changed strings. Weblate picks up changes via Git sync.

## Cloudflare Pages Changes

### Updated `_redirects`

```
/                      /en/1.6/             302
/en/latest/*           /en/1.6/:splat       302
/en/stable/*           /en/1.5/:splat       302
/en/current/*          /en/1.6/:splat       302
/en/sagitta/*          /en/1.4/:splat       301
/en/equuleus/*         /en/1.3/:splat       301
/en/crux/*             /en/1.2/:splat       301

# Language shortcuts (default to LTS version)
/es/*                  /es/1.5/:splat       302
/ja/*                  /ja/1.5/:splat       302
/de/*                  /de/1.5/:splat       302
/pt/*                  /pt/1.5/:splat       302
/zh/*                  /zh/1.5/:splat       302
```

Root redirect goes to `/en/1.6/` (rolling). Language shortcuts default to 1.5 LTS (the translated version). Language detection via browser Accept-Language is a future enhancement (CF Worker).

### Updated `_headers`

Same cache rules apply to all language paths. The existing `/en/*` patterns become `/*` or language-specific:

```
# Versioned static assets — immutable
/*/*/_static/*
  Cache-Control: public, max-age=31536000, immutable

# HTML pages
/*/*/*.html
  Cache-Control: public, max-age=3600, s-maxage=86400
```

### File Count Impact

Current: ~10,000 files (5 versions × ~2,000 files, including 1.6 rolling).
With 5 translations of 1.5 LTS only: ~10,000 + (5 × ~2,000) = ~20,000 files.
CF Pages free tier limit: 20,000. At the limit. May need to drop English-only old versions (1.2, 1.3) or upgrade to CF Pages Pro if adding more languages or translating additional versions.

## Language Switcher

JS snippet in Sphinx template, similar to the version switcher from the Cloudflare migration spec:

```javascript
// Detect current language and version from URL
const [, lang, version] = location.pathname.match(/^\/(\w{2})\/([^/]+)\//) || [];

// Build language selector
const languages = {en: 'English', es: 'Español', ja: '日本語', de: 'Deutsch', pt: 'Português', zh: '简体中文'};
const currentPage = location.pathname.replace(`/${lang}/${version}/`, '');

for (const [code, name] of Object.entries(languages)) {
  // HEAD request to check if translated page exists
  // Fallback to language root if not
}
```

Placed in the sidebar or header alongside the version switcher.

## Translation Completeness Handling

Untranslated strings fall back to English automatically (Sphinx default behavior). Additionally:

- Pages with <50% translation show a banner: "This page is partially translated. [View in English]"
- Banner implemented as a Sphinx template override checking translation coverage
- Translation coverage percentage available from Weblate API or PO file statistics

## Search

Pagefind indexes are built per language. Each `/{lang}/{version}/` has its own `pagefind/` directory. Search scoped to current language automatically.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| CF Pages file limit (20,000) | Cannot deploy all languages × versions | Translate only 1.5 LTS initially; may need to drop old English versions or upgrade plan |
| Stale translations after source changes | Outdated translated content | Weblate flags fuzzy strings; banner on incomplete pages |
| Low community contribution | Translations stay machine-suggested | DeepL baseline is usable; prioritize high-traffic pages |
| Glossary violations | CLI commands get translated | Weblate glossary enforcement; CI check on PO files |
| Build time increase | 5× HTML builds per deploy | Matrix parallelization in GHA; only rebuild changed languages |

## Success Criteria

- 5 languages deployed at `/{lang}/1.5/` (LTS)
- Language switcher functional on all pages
- Weblate project active with glossary enforced
- POT files auto-update when English source changes
- Untranslated pages show English fallback with banner
- Pagefind search works per language
- CF Pages file count stays under 20,000
