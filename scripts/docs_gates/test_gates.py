import json
from pathlib import Path
import pytest
from scripts.docs_gates import gates


@pytest.fixture()
def artifact(tmp_path: Path) -> Path:
    root = tmp_path / "en" / "rolling"
    root.mkdir(parents=True)
    for i in range(50):
        (root / f"p{i}.html").write_text(
            f'<html><head><link rel="canonical" href="https://docs.vyos.io/en/rolling/p{i}.html"/></head><body>x</body></html>'
        )
    (root / "index.html").write_text(
        '<html><head><link rel="canonical" href="https://docs.vyos.io/en/rolling/index.html"/></head></html>'
    )
    (root / "vyos-documentation.pdf").write_bytes(b"%PDF-1.4 fake")
    (root / "pagefind").mkdir()
    (root / "pagefind" / "pagefind.js").write_text("// index")
    (root / "installation").mkdir()
    (root / "installation" / "index.html").write_text(
        '<html><head><link rel="canonical" href="https://docs.vyos.io/en/rolling/installation/index.html"/></head></html>'
    )
    return tmp_path


def versions_arg() -> str:
    return str(Path("workers/versions.json"))


def test_pass_on_good_artifact(artifact: Path):
    rc = gates.run(artifact=artifact, slug="rolling", versions=Path("workers/versions.json"),
                   previous_meta=None, critical=["index.html", "installation/index.html"])
    assert rc == 0


def test_fail_on_missing_critical_page(artifact: Path):
    (artifact / "en/rolling/installation/index.html").unlink()
    rc = gates.run(artifact=artifact, slug="rolling", versions=Path("workers/versions.json"),
                   previous_meta=None, critical=["index.html", "installation/index.html"])
    assert rc == 1


def test_fail_on_count_collapse(artifact: Path, tmp_path: Path):
    meta = tmp_path / "meta.json"
    meta.write_text(json.dumps({"sha": "old", "page_count": 5000}))  # previous build 100x bigger
    rc = gates.run(artifact=artifact, slug="rolling", versions=Path("workers/versions.json"),
                   previous_meta=meta, critical=["index.html"])
    assert rc == 1


def test_fail_on_alias_canonical(artifact: Path):
    (artifact / "en/rolling/bad.html").write_text(
        '<html><head><link rel="canonical" href="https://docs.vyos.io/en/latest/bad.html"/></head></html>'
    )
    rc = gates.run(artifact=artifact, slug="rolling", versions=Path("workers/versions.json"),
                   previous_meta=None, critical=["index.html"])
    assert rc == 1


def test_fail_on_oversize_file(artifact: Path):
    big = artifact / "en/rolling/huge.bin"
    big.write_bytes(b"\0" * (26 * 1024 * 1024))  # > 25 MiB
    rc = gates.run(artifact=artifact, slug="rolling", versions=Path("workers/versions.json"),
                   previous_meta=None, critical=["index.html"])
    assert rc == 1


def test_fail_when_declared_pdf_missing(artifact: Path):
    (artifact / "en/rolling/vyos-documentation.pdf").unlink()
    rc = gates.run(artifact=artifact, slug="rolling", versions=Path("workers/versions.json"),
                   previous_meta=None, critical=["index.html"])
    assert rc == 1
