## VyOS Documentation Project

This is VyOS user documentation written in reStructuredText (RST) and built with Sphinx.

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

Maximum 80 characters per line. Exception: content inside `.. code-block::` directives is exempt because it renders with `<pre>` tags.

### VyOS Directives

- `.. cfgcmd::` for configuration mode commands
- `.. opcmd::` for operational mode commands
- Do not convert these to plain `.. code-block::` — they are tracked for command coverage.

### Page Structure

Configuration pages follow this order: Theory, Configuration (cfgcmd), Examples, Known Issues, Debugging.
