# Internationalization (i18n) — Implementation Plan

**Date:** 2026-04-13
**Design spec:** `specs/2026-04-13-internationalization-design.md`
**Depends on:** Cloudflare Hosting Migration complete
**Languages:** es, ja, de, pt, zh_CN (Simplified Chinese)
**Target version:** 1.5 LTS (circinus). Rolling release (1.6) stays English-only.

---

## Step 1: Sphinx Configuration & POT Generation

**Branch:** `feat/docs-i18n-infrastructure`

### Tasks

1. Update `docs/conf.py`:
   - Set `gettext_uuid = True` (currently `False`)
   - Add `gettext_additional_targets = ['literal-block']`
   - Verify `locale_dirs = ['_locale/']` and `gettext_compact = True` unchanged

2. Generate initial POT files:
   ```bash
   cd docs
   sphinx-build -b gettext . _build/gettext
   ```

3. Generate initial PO files for all 4 languages:
   ```bash
   for lang in es ja de pt zh_CN; do
     sphinx-intl update -p _build/gettext -l $lang
   done
   ```

4. Verify PO file structure:
   ```
   docs/_locale/{es,ja,de,pt,zh_CN}/LC_MESSAGES/*.po
   ```
   Each language should have one PO file per top-level doc directory (gettext_compact mode).

5. Test a translated build locally:
   ```bash
   # Add a test translation to one string in es
   sphinx-build -b html -D language=es . _build/html-es
   ```
   Verify the test string appears translated, all other strings fall back to English.

6. Commit PO files and conf.py changes.

**PR:** Open against `current`. Merge before proceeding.

---

## Step 2: Weblate Setup

**No branch needed — platform configuration.**

### Tasks

1. Create Weblate project "VyOS Documentation" on hosted Libre instance (or self-hosted if preferred).

2. Configure repository connection:
   - Repository URL: `https://github.com/vyos/vyos-documentation.git`
   - Branch: `current`
   - Push branch: `weblate`
   - File mask: `docs/_locale/*/LC_MESSAGES/*.po`
   - Source language: English
   - File format: gettext PO

3. Add components — one per PO file (auto-discovered from file mask).

4. Configure machine translation:
   - Enable DeepL as suggestion engine (requires API key in Weblate settings)
   - Set to "suggest only" — not auto-fill

5. Create VyOS glossary with do-not-translate terms:
   - VyOS, CLI, configure mode, operational mode
   - All CLI verbs: `set`, `delete`, `show`, `commit`, `save`, `compare`, `discard`
   - Interface types, protocol names, daemon names
   - All configuration path fragments

6. Configure review workflow:
   - Translation states: Untranslated → Suggested → Needs Review → Approved
   - Minimum 1 reviewer before "Approved" state
   - Enable glossary enforcement (warn on glossary term violations)

7. Add language teams — invite initial translators or open for community sign-up.

8. Verify Weblate can push to the `weblate` branch and open PRs against `current`.

**Acceptance:** Weblate shows all PO components, translators can submit suggestions, glossary flags violations.

---

## Step 3: Update Build & Deploy Workflow

**Branch:** `feat/docs-i18n-deploy`

### Tasks

1. Update `.github/workflows/deploy-docs.yml`:

   - Add language matrix to the build job:
     ```yaml
     strategy:
       matrix:
         lang: [en, es, ja, de, pt, zh]
     ```

   - Add language-specific build step:
     - `en`: existing `make html` command
     - Others: `sphinx-build -b html -D language=$LANG . _build/html-$LANG`

   - Update stage step to place output in `dist/{lang}/{version}/`

   - Build Pagefind index per language:
     ```bash
     npx pagefind --site dist/$LANG/$VERSION --output-path dist/$LANG/$VERSION/pagefind
     ```

   - PDF/EPUB: English only (unchanged)

   - Update verification step to check all language paths return 200

2. Update `.github/workflows/update-translations.yml`:
   - Trigger on push to `current` when `docs/**/*.rst` or `docs/**/*.md` change (excluding `docs/_locale/**`)
   - Generate POT files
   - Run `sphinx-intl update` for all 4 languages
   - Commit and push updated PO files

3. Update `_redirects`:
   - Add language shortcuts: `/es/*` → `/es/1.5/:splat`, `/zh/*` → `/zh/1.5/:splat`, etc.
   - Root `/` stays `/en/1.5/`

4. Update `_headers`:
   - Generalize cache patterns from `/en/*` to `/*/*` to cover all languages

5. Verify CF Pages file count stays under 20,000:
   ```bash
   find dist -type f | wc -l
   ```

**PR:** Open against `current`. Merge after testing on staging domain.

---

## Step 4: Language Switcher & Translation Banner

**Branch:** `feat/docs-i18n-ui`

### Tasks

1. Add language switcher to Sphinx template:
   - File: `docs/_templates/layout.html` (Jinja2 override)
   - Position: sidebar or header, near version switcher
   - Behavior: detect current `/{lang}/{version}/` from URL, show dropdown with all languages, link to same page in target language with HEAD-request fallback to language root

2. Add translation completeness banner:
   - File: `docs/_templates/layout.html`
   - Logic: if current language ≠ `en`, check translation coverage (from PO file stats baked into build, or a generated JSON manifest)
   - If coverage < 50%: show info banner "This page is partially translated. [View in English →]"
   - Banner links to equivalent English page

3. Add `lang` attribute to `<html>` tag per language build (accessibility/SEO):
   ```html
   <html lang="es">
   ```

4. Add `hreflang` link tags to `<head>` for SEO:
   ```html
   <link rel="alternate" hreflang="en" href="https://docs.vyos.io/en/1.5/{page}" />
   <link rel="alternate" hreflang="es" href="https://docs.vyos.io/es/1.5/{page}" />
   ...
   <link rel="alternate" hreflang="x-default" href="https://docs.vyos.io/en/1.5/{page}" />
   ```

5. Test:
   - Switcher shows all languages
   - Clicking a language navigates to correct URL
   - Missing translated pages fall back to language root
   - Banner shows on pages with low translation coverage
   - Banner hidden on fully translated pages and all English pages

**PR:** Open against `current`.

---

## Step 5: Seed Translations

**No branch needed — Weblate work.**

### Tasks

1. Prioritize high-traffic pages for initial translation:
   - `quick-start.rst`
   - `installation/install.rst`
   - `cli.rst`
   - `configuration/interfaces/ethernet.rst`
   - `configuration/firewall/index.rst`
   - `configuration/vpn/wireguard.rst`
   - `configuration/service/ssh.rst`

2. Use Weblate's "auto-suggest" with DeepL to generate machine translation suggestions for the priority pages.

3. Recruit reviewers per language to approve/refine machine suggestions.

4. For non-priority pages: leave untranslated (English fallback). Community contributes over time.

**Acceptance:** Priority pages have reviewed translations in at least 2 of 5 languages.

---

## Step 6: Validate & Deploy

### Tasks

1. Deploy to staging (`vyos-docs.pages.dev`):
   - All 6 language paths render for version 1.5 LTS
   - English 1.6 rolling and older versions (1.4, 1.3, 1.2) still work
   - Pagefind search returns results in correct language
   - Language switcher works
   - Translation banner appears where expected
   - `hreflang` tags present in page source
   - `_redirects` language shortcuts work

2. Verify CF Pages file count:
   - Must be under 20,000
   - Log exact count for monitoring baseline

3. Verify Weblate → Git → Deploy pipeline:
   - Approve a translation in Weblate
   - Weblate pushes to `weblate` branch
   - PR opened against `current`
   - After merge, GHA rebuilds and deploys
   - Translated string appears on staging

4. DNS cutover: no action needed (already on Cloudflare from hosting migration).

5. Submit updated sitemaps per language to search engines.

**Acceptance:** All languages live at `docs.vyos.io/{lang}/1.5/` (LTS), end-to-end translation pipeline verified.

---

## Execution Order

| Step | Depends on | Estimated effort |
|---|---|---|
| 1. Sphinx config & POT | Cloudflare migration complete | 1 day |
| 2. Weblate setup | Step 1 merged | 1-2 days |
| 3. Build & deploy workflow | Step 1 merged | 2-3 days |
| 4. Language switcher & banner | Step 3 merged | 1-2 days |
| 5. Seed translations | Step 2 complete | Ongoing (community) |
| 6. Validate & deploy | Steps 3 + 4 merged | 1 day |

Steps 2 and 3 can run in parallel after Step 1.
Steps 4 and 5 can overlap.

---

## Future Enhancements (Out of Scope)

- **Accept-Language auto-detection:** CF Worker redirects `/` based on browser language header
- **Translate rolling release:** Add 1.6 translations once LTS translations are stable
- **Translate older versions:** Add PO files for 1.4, 1.3 per language demand
- **PDF per language:** `sphinx-build -b latex -D language=es` for translated PDFs
- **Translation coverage dashboard:** Weblate badges on contributing page
- **Additional languages:** fr, ko, ru — add to matrix and Weblate when community interest exists
