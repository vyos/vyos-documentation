---
lastproofread: '2026-09-30'
---

(documentation)=

# Write Documentation

Help us improve the VyOS documentation by correcting existing pages or
adding useful information. This guide summarizes the current workflow.
See the repository-root `README.md` for build setup and `AGENTS.md` for
detailed source conventions.

:::{warning}
Before your contribution can be merged, each commit author must sign the
{doc}`Contributor License Agreement<contributing/cla>`.
:::

You do not need to open a Phabricator task before submitting a documentation
pull request.

## Source format

The documentation migration to MyST Markdown is complete. Canonical pages
are `.md` files under `docs/`; edit those files when updating a page. Do not
edit the archived reStructuredText files under `docs/_rst_legacy/`.

When adding a page, create a `.md` file and add it to the relevant
`index.md` table of contents so readers can find it. Do not add an
`index.rst` file or an `md-` prefix to the filename.

Shared snippets under `docs/_include/*.txt` remain reStructuredText. They
are parsed as RST when included into MyST pages.

## Build and check your changes

The recommended build uses the repository Docker image, which includes the
pinned Sphinx and MyST dependencies. Follow the Docker instructions in the
repository-root `README.md` to build the image and render the HTML
documentation. The generated site is in `docs/_build/html/`.

CI runs `scripts/doc-linter.py` on changed documentation files under `docs/`.
The linter checks line length and rejects disallowed IP addresses anywhere
in eligible changed files. Build the docs locally and review the rendered
page and build output before submitting your pull request.

## Writing conventions

- Use American English and keep lines to 80 characters where practical.
- Indent with two spaces and leave blank lines around headings.
- Use single backticks for inline code in MyST Markdown.
- Follow the style of nearby pages and keep examples readable.
- Use the documentation address ranges listed in the repository-root
  `AGENTS.md`. Suppress the linter only for necessary exceptions, using
  paired markers appropriate to the surrounding syntax.

## Documenting CLI commands

Use the VyOS Sphinx directives so command documentation appears in coverage
tracking. In MyST pages, write commands as fenced directives:

````markdown
```{cfgcmd} set system host-name <hostname>
Configure the system host name.
```
````

Use `{opcmd}` for operational commands and `{cmdincludemd}` to include
shared command snippets in MyST pages. The shared `.txt` snippets use the
RST forms `.. cfgcmd::`, `.. opcmd::`, and `.. cmdinclude::`.

Configuration pages should explain the feature and when to use it, document
its configuration options, provide practical examples, and describe known
issues and debugging steps where applicable.

## Submit a contribution

1. Fork `vyos/vyos-documentation` on GitHub and clone your fork.
2. Create a descriptive branch from `rolling`, the default branch for new
   documentation contributions.
3. Edit the MyST source and build the HTML documentation to review it.
4. Commit your changes and push the branch to your fork.
5. Open a pull request against `vyos/vyos-documentation:rolling`.
6. Complete any CLA bot instructions and address CI and reviewer feedback.

After a change is merged, backports to release branches can be requested in
a PR comment with `@Mergifyio backport <branch>`. Only Maintainers can run
Mergify backport commands; see the repository-root `AGENTS.md` for details.
