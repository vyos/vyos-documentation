# Dual-Build Visual Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build tooling to run RST and MyST Sphinx builds side-by-side, visually compare every page with Playwright, and phase out RST files after verification.

**Architecture:** Two new Python scripts (`compare_local.py`, `phase_out.py`) and two Sphinx conf overrides (`_confrst/conf.py`, `_confmyst/conf.py`). `compare_local.py` runs two Sphinx builds, enumerates HTML pages, invokes the existing `playwright-compare.mjs` on `file://` URLs, classifies results, and writes a JSON report. `phase_out.py` reads the report and deletes verified `.rst` files.

**Tech Stack:** Python 3.9+, Sphinx 7.x (with myst-parser already in conf.py), Node.js + Playwright + pixelmatch (already in `scripts/package.json`).

**Spec:** `docs/superpowers/specs/2026-04-24-dual-build-visual-comparison-design.md`

**Working directory:** The branch being compared (e.g., a worktree from `sagitta` with `.md` files copied alongside `.rst` files).

**Run tests with:** `PYTHONPATH=. python3 -m pytest scripts/tests/ -v`

---

### Task 1: Create `_confrst/conf.py` and `_confmyst/conf.py`

**Files:**
- Create: `docs/_confrst/conf.py`
- Create: `docs/_confmyst/conf.py`

- [ ] **Step 1: Create the RST conf override**

Create `docs/_confrst/conf.py`:

```python
import os, sys
_docs_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_docs_dir, "_ext"))
os.chdir(_docs_dir)
exec(open(os.path.join(_docs_dir, "conf.py")).read())
exclude_patterns.extend(["**/*.md", "_confrst", "_confmyst"])
```

- [ ] **Step 2: Create the MyST conf override**

Create `docs/_confmyst/conf.py`:

```python
import os, sys
_docs_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_docs_dir, "_ext"))
os.chdir(_docs_dir)
exec(open(os.path.join(_docs_dir, "conf.py")).read())
exclude_patterns = ["**/*.rst", "_build", "Thumbs.db", ".DS_Store",
                    "_include/vyos-1x", "_confrst", "_confmyst"]
source_suffix = {".md": "markdown"}
```

Note: `myst_parser` is already in the base `conf.py` extensions list for all three branches — no need to add it.

- [ ] **Step 3: Verify RST build works**

```bash
cd docs && sphinx-build -b html -c _confrst . _build/html-rst 2>&1 | tail -5
```

Expected: "build succeeded" — only `.rst` files processed.

- [ ] **Step 4: Verify MyST build works**

Requires `.md` files to exist. If running on POC worktree:

```bash
cd docs && sphinx-build -b html -c _confmyst . _build/html-myst 2>&1 | tail -5
```

Expected: "build succeeded" — only `.md` files processed.

- [ ] **Step 5: Commit**

```bash
git add docs/_confrst/conf.py docs/_confmyst/conf.py
git commit -m "build: add dual conf overrides for RST/MyST comparison builds"
```

---

### Task 2: `compare_local.py` — Sphinx build runner and page enumerator

**Files:**
- Create: `scripts/compare_local.py`
- Create: `scripts/tests/test_compare_local.py`

- [ ] **Step 1: Write tests for the build and enumeration helpers**

Create `scripts/tests/test_compare_local.py`:

```python
import json
from pathlib import Path
from scripts.compare_local import (
    enumerate_pages,
    classify_status,
    format_report,
)


def test_enumerate_pages_finds_common(tmp_path):
    rst_dir = tmp_path / "html-rst"
    myst_dir = tmp_path / "html-myst"
    rst_dir.mkdir()
    myst_dir.mkdir()
    (rst_dir / "quick-start.html").write_text("<html/>")
    (rst_dir / "index.html").write_text("<html/>")
    (myst_dir / "quick-start.html").write_text("<html/>")
    (myst_dir / "index.html").write_text("<html/>")
    (myst_dir / "extra.html").write_text("<html/>")
    common, rst_only, myst_only = enumerate_pages(rst_dir, myst_dir)
    assert "quick-start.html" in common
    assert "index.html" in common
    assert "extra.html" in myst_only
    assert len(rst_only) == 0


def test_enumerate_pages_skips_non_html(tmp_path):
    rst_dir = tmp_path / "html-rst"
    myst_dir = tmp_path / "html-myst"
    rst_dir.mkdir()
    myst_dir.mkdir()
    (rst_dir / "genindex.html").write_text("<html/>")
    (myst_dir / "genindex.html").write_text("<html/>")
    (rst_dir / "searchindex.js").write_text("var x;")
    common, _, _ = enumerate_pages(rst_dir, myst_dir)
    assert "genindex.html" in common
    assert "searchindex.js" not in common


def test_enumerate_pages_recurses_subdirs(tmp_path):
    rst_dir = tmp_path / "html-rst"
    myst_dir = tmp_path / "html-myst"
    sub_rst = rst_dir / "configuration"
    sub_myst = myst_dir / "configuration"
    sub_rst.mkdir(parents=True)
    sub_myst.mkdir(parents=True)
    (sub_rst / "firewall.html").write_text("<html/>")
    (sub_myst / "firewall.html").write_text("<html/>")
    common, _, _ = enumerate_pages(rst_dir, myst_dir)
    assert "configuration/firewall.html" in common


def test_classify_status():
    assert classify_status(0.5) == "match"
    assert classify_status(2.0) == "match"
    assert classify_status(2.1) == "minor"
    assert classify_status(5.0) == "minor"
    assert classify_status(5.1) == "investigate"
    assert classify_status(50.0) == "investigate"


def test_format_report():
    results = {
        "pages": {
            "a": {"diff_pct": 0.5, "status": "match"},
            "b": {"diff_pct": 3.0, "status": "minor"},
            "c": {"diff_pct": 10.0, "status": "investigate"},
        },
        "summary": {"total": 3, "match": 1, "minor": 1, "investigate": 1},
    }
    report = format_report(results)
    assert "MATCH" in report
    assert "MINOR" in report
    assert "INVESTIGATE" in report
    assert "3" in report
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python3 -m pytest scripts/tests/test_compare_local.py -v`

Expected: ImportError (module doesn't exist)

- [ ] **Step 3: Implement `compare_local.py`**

Create `scripts/compare_local.py`:

```python
"""Dual-build visual comparison: RST vs MyST Sphinx output."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Set, Tuple

SKIP_FILES = {"genindex.html", "search.html", "404.html", "objects.inv"}
SKIP_PREFIXES = ("_", ".")


def enumerate_pages(
    rst_dir: Path, myst_dir: Path
) -> Tuple[Set[str], Set[str], Set[str]]:
    def _collect(root: Path) -> Set[str]:
        pages = set()
        for p in root.rglob("*.html"):
            rel = str(p.relative_to(root))
            if p.name in SKIP_FILES:
                continue
            parts = p.relative_to(root).parts
            if any(part.startswith(tuple(SKIP_PREFIXES)) for part in parts[:-1]):
                continue
            pages.add(rel)
        return pages

    rst_pages = _collect(rst_dir)
    myst_pages = _collect(myst_dir)
    common = rst_pages & myst_pages
    return common, rst_pages - myst_pages, myst_pages - rst_pages


def classify_status(diff_pct: float) -> str:
    if diff_pct <= 2.0:
        return "match"
    if diff_pct <= 5.0:
        return "minor"
    return "investigate"


def format_report(results: Dict) -> str:
    s = results["summary"]
    lines = [
        "=== Visual Comparison Report ===",
        f"Total pages: {s['total']}",
        f"  MATCH (≤2%):       {s['match']}",
        f"  MINOR (2-5%):      {s['minor']}",
        f"  INVESTIGATE (>5%): {s['investigate']}",
    ]
    investigate = [
        (name, p["diff_pct"])
        for name, p in results["pages"].items()
        if p["status"] == "investigate"
    ]
    if investigate:
        lines.append("")
        lines.append("Top investigate pages:")
        for name, pct in sorted(investigate, key=lambda x: -x[1])[:10]:
            lines.append(f"  {name:50s} {pct:.1f}%")
    errors = [
        (name, p.get("error", ""))
        for name, p in results["pages"].items()
        if p.get("error")
    ]
    if errors:
        lines.append("")
        lines.append(f"Errors: {len(errors)}")
        for name, err in errors[:5]:
            lines.append(f"  {name}: {err}")
    return "\n".join(lines)


def run_sphinx(docs_dir: Path, conf_dir: str, output_dir: str) -> int:
    build_dir = docs_dir / "_build" / output_dir
    cmd = [
        sys.executable, "-m", "sphinx",
        "-b", "html",
        "-c", str(docs_dir / conf_dir),
        str(docs_dir),
        str(build_dir),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"[{conf_dir}] Sphinx build failed:", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
    return result.returncode


def run_playwright(
    pages: List[Dict], scripts_dir: Path
) -> List[Dict]:
    worker = scripts_dir / "playwright-compare.mjs"
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False
    ) as f:
        json.dump(pages, f)
        tmp_path = f.name
    try:
        timeout = max(300, 30 * len(pages))
        result = subprocess.run(
            ["node", str(worker), tmp_path],
            capture_output=True, text=True, cwd=str(scripts_dir),
            timeout=timeout,
        )
        if result.returncode != 0:
            print(f"Playwright failed: {result.stderr}", file=sys.stderr)
            return []
        return json.loads(result.stdout)
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="compare_local.py")
    parser.add_argument("--files", help="glob filter for pages to compare")
    args = parser.parse_args(argv)

    repo_root = Path.cwd()
    docs_dir = repo_root / "docs"
    scripts_dir = repo_root / "scripts"

    print("Building RST...")
    if run_sphinx(docs_dir, "_confrst", "html-rst") != 0:
        return 1
    print("Building MyST...")
    if run_sphinx(docs_dir, "_confmyst", "html-myst") != 0:
        return 1

    rst_dir = docs_dir / "_build" / "html-rst"
    myst_dir = docs_dir / "_build" / "html-myst"

    common, rst_only, myst_only = enumerate_pages(rst_dir, myst_dir)

    if rst_only:
        print(f"\nWARNING: {len(rst_only)} pages in RST only:", file=sys.stderr)
        for p in sorted(rst_only)[:10]:
            print(f"  {p}", file=sys.stderr)
    if myst_only:
        print(f"\nWARNING: {len(myst_only)} pages in MyST only:", file=sys.stderr)
        for p in sorted(myst_only)[:10]:
            print(f"  {p}", file=sys.stderr)

    if args.files:
        import fnmatch
        common = {p for p in common if fnmatch.fnmatch(p, args.files)}

    if not common:
        print("No common pages to compare.")
        return 0

    print(f"\nComparing {len(common)} pages...")
    page_list = []
    for page in sorted(common):
        page_list.append({
            "file": page,
            "refUrl": (rst_dir / page).as_uri(),
            "testUrl": (myst_dir / page).as_uri(),
        })

    pw_results = run_playwright(page_list, scripts_dir)

    pages_data = {}
    counts = {"match": 0, "minor": 0, "investigate": 0}
    for r in pw_results:
        pct = r.get("diff_pct")
        status = classify_status(pct) if pct is not None else "investigate"
        pages_data[r["file"]] = {
            "rst_html": str(rst_dir / r["file"]),
            "myst_html": str(myst_dir / r["file"]),
            "diff_pct": pct,
            "status": status,
        }
        if r.get("error"):
            pages_data[r["file"]]["error"] = r["error"]
        counts[status] = counts.get(status, 0) + 1

    results = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "pages": pages_data,
        "summary": {"total": len(pw_results), **counts},
    }

    out_path = scripts_dir / "comparison-results.json"
    out_path.write_text(json.dumps(results, indent=2))

    print(format_report(results))
    print(f"\nResults written to {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run tests**

Run: `PYTHONPATH=. python3 -m pytest scripts/tests/test_compare_local.py -v`

Expected: ALL pass

- [ ] **Step 5: Run full test suite**

Run: `PYTHONPATH=. python3 -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add scripts/compare_local.py scripts/tests/test_compare_local.py
git commit -m "feat: add compare_local.py for dual-build visual comparison"
```

---

### Task 3: `phase_out.py` — RST removal script

**Files:**
- Create: `scripts/phase_out.py`
- Create: `scripts/tests/test_phase_out.py`

- [ ] **Step 1: Write tests**

Create `scripts/tests/test_phase_out.py`:

```python
import json
from pathlib import Path
from scripts.phase_out import collect_files_to_delete


def _write_results(path, pages):
    data = {"pages": pages, "summary": {}}
    path.write_text(json.dumps(data))


def test_collects_match_by_default(tmp_path):
    results_path = tmp_path / "comparison-results.json"
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir()
    (docs_dir / "a.rst").write_text("RST")
    (docs_dir / "a.md").write_text("MD")
    _write_results(results_path, {
        "a.html": {"status": "match", "diff_pct": 0.5},
        "b.html": {"status": "investigate", "diff_pct": 10.0},
    })
    to_delete = collect_files_to_delete(
        results_path, docs_dir, statuses={"match"}, force=False
    )
    assert any("a.rst" in str(p) for p in to_delete)
    assert not any("b" in str(p) for p in to_delete)


def test_skips_investigate_without_force(tmp_path):
    results_path = tmp_path / "comparison-results.json"
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir()
    (docs_dir / "c.rst").write_text("RST")
    _write_results(results_path, {
        "c.html": {"status": "investigate", "diff_pct": 10.0},
    })
    to_delete = collect_files_to_delete(
        results_path, docs_dir, statuses={"investigate"}, force=False
    )
    assert len(to_delete) == 0


def test_includes_investigate_with_force(tmp_path):
    results_path = tmp_path / "comparison-results.json"
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir()
    (docs_dir / "c.rst").write_text("RST")
    _write_results(results_path, {
        "c.html": {"status": "investigate", "diff_pct": 10.0},
    })
    to_delete = collect_files_to_delete(
        results_path, docs_dir, statuses={"investigate"}, force=True
    )
    assert any("c.rst" in str(p) for p in to_delete)


def test_skips_if_rst_not_found(tmp_path):
    results_path = tmp_path / "comparison-results.json"
    docs_dir = tmp_path / "docs"
    docs_dir.mkdir()
    _write_results(results_path, {
        "missing.html": {"status": "match", "diff_pct": 0.1},
    })
    to_delete = collect_files_to_delete(
        results_path, docs_dir, statuses={"match"}, force=False
    )
    assert len(to_delete) == 0


def test_handles_nested_paths(tmp_path):
    results_path = tmp_path / "comparison-results.json"
    docs_dir = tmp_path / "docs"
    sub = docs_dir / "configuration" / "firewall"
    sub.mkdir(parents=True)
    (sub / "index.rst").write_text("RST")
    _write_results(results_path, {
        "configuration/firewall/index.html": {"status": "match", "diff_pct": 0.2},
    })
    to_delete = collect_files_to_delete(
        results_path, docs_dir, statuses={"match"}, force=False
    )
    assert any("index.rst" in str(p) for p in to_delete)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `PYTHONPATH=. python3 -m pytest scripts/tests/test_phase_out.py -v`

Expected: ImportError

- [ ] **Step 3: Implement `phase_out.py`**

Create `scripts/phase_out.py`:

```python
"""Phase out verified RST files after visual comparison."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List, Set


def collect_files_to_delete(
    results_path: Path,
    docs_dir: Path,
    *,
    statuses: Set[str],
    force: bool,
) -> List[Path]:
    data = json.loads(results_path.read_text())
    to_delete = []
    for page_name, info in data["pages"].items():
        status = info.get("status", "")
        if status not in statuses:
            continue
        if status == "investigate" and not force:
            continue
        rst_name = page_name.replace(".html", ".rst")
        rst_path = docs_dir / rst_name
        if rst_path.exists():
            to_delete.append(rst_path)
    return to_delete


def main(argv: List[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="phase_out.py")
    parser.add_argument(
        "--status", action="append", default=[],
        help="statuses to delete (repeat for multiple, default: match)",
    )
    parser.add_argument("--force", action="store_true",
                        help="allow deleting investigate pages")
    parser.add_argument("--dry-run", action="store_true",
                        help="list files without deleting")
    parser.add_argument("--results", default="scripts/comparison-results.json",
                        help="path to comparison results JSON")
    args = parser.parse_args(argv)

    statuses = set(args.status) if args.status else {"match"}
    repo_root = Path.cwd()
    results_path = repo_root / args.results
    docs_dir = repo_root / "docs"

    if not results_path.exists():
        print(f"error: {results_path} not found", file=sys.stderr)
        return 1

    to_delete = collect_files_to_delete(
        results_path, docs_dir, statuses=statuses, force=args.force,
    )

    if not to_delete:
        print("No RST files to delete for the given statuses.")
        return 0

    for p in sorted(to_delete):
        rel = p.relative_to(repo_root)
        if args.dry_run:
            print(f"would delete: {rel}")
        else:
            p.unlink()
            print(f"deleted: {rel}")

    action = "would delete" if args.dry_run else "deleted"
    print(f"\n{action.title()} {len(to_delete)} RST files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run tests**

Run: `PYTHONPATH=. python3 -m pytest scripts/tests/test_phase_out.py -v`

Expected: ALL pass

- [ ] **Step 5: Run full test suite**

Run: `PYTHONPATH=. python3 -m pytest scripts/tests/ -v`

Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add scripts/phase_out.py scripts/tests/test_phase_out.py
git commit -m "feat: add phase_out.py to delete verified RST files"
```

---

### Task 4: End-to-end test on POC worktree

**Files:**
- No files modified — verification only

This task validates the full workflow on the existing POC worktree at `.worktrees/poc-dual` which has `quick-start.rst` + `quick-start.md` + `index.md`.

- [ ] **Step 1: Copy scripts and conf dirs to POC worktree**

```bash
cp scripts/compare_local.py .worktrees/poc-dual/scripts/
cp scripts/phase_out.py .worktrees/poc-dual/scripts/
mkdir -p .worktrees/poc-dual/docs/_confrst .worktrees/poc-dual/docs/_confmyst
cp docs/_confrst/conf.py .worktrees/poc-dual/docs/_confrst/
cp docs/_confmyst/conf.py .worktrees/poc-dual/docs/_confmyst/
```

- [ ] **Step 2: Run `compare_local.py`**

```bash
cd .worktrees/poc-dual && PYTHONPATH=. .venv/bin/python scripts/compare_local.py
```

Expected: Both builds succeed, pages compared, report printed, `comparison-results.json` written.

- [ ] **Step 3: Check comparison results**

```bash
cat .worktrees/poc-dual/scripts/comparison-results.json | python3 -m json.tool | head -20
```

Expected: `quick-start` page with a `diff_pct` value and `status` field.

- [ ] **Step 4: Test dry-run phase out**

```bash
cd .worktrees/poc-dual && PYTHONPATH=. .venv/bin/python scripts/phase_out.py --dry-run
```

Expected: Lists `quick-start.rst` as "would delete" (if status is match/minor).

- [ ] **Step 5: Report results**

Document the diff_pct for the quick-start page and whether the workflow completes without errors.
