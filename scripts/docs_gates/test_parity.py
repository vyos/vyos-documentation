import json
import sys
import urllib.error

from scripts.docs_gates import parity
from scripts.docs_gates.conftest import REDIRECT_LOCATION, REDIRECT_PATH


def test_sitemap_url_extraction():
    xml = ('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
           "<url><loc>https://docs.vyos.io/en/1.5/a.html</loc></url>"
           "<url><loc>https://docs.vyos.io/en/1.5/b/</loc></url></urlset>")
    assert parity.urls_from_sitemap(xml) == ["/en/1.5/a.html", "/en/1.5/b/"]


def test_alias_corpus_includes_pdf_and_alias_rows():
    rows = parity.alias_corpus()
    assert ("/en/latest/", 301, "/en/rolling/") in rows
    assert ("/_/downloads/en/1.5/pdf/", 301, "/en/1.5/vyos-documentation.pdf") in rows


def test_fetch_never_follows_redirects_unit():
    # unit-level sanity check on the handler class in isolation (kept alongside the
    # end-to-end test below, which is what actually proves the opener is wired up)
    handler = parity._NoRedirect()
    assert handler.redirect_request(None, None, 301, "Moved", {}, "https://x/") is None


def test_fetch_never_follows_redirects(redirect_http_server, monkeypatch):
    # End-to-end: real local HTTP server returns a 301, exercised through the PUBLIC
    # fetch() entrypoint (not just the handler class) — proves _OPENER is actually
    # wired into fetch() and surfaces (301, Location) instead of following it.
    monkeypatch.setattr(parity, "_SCHEME", "http")
    status, location = parity.fetch(redirect_http_server, REDIRECT_PATH, None, "GET")
    assert status == 301
    assert location == REDIRECT_LOCATION


def test_default_slugs_scoped_to_cf_built_versions():
    # 1.3/1.2 have NO RTD sitemaps (spec §15a.5); legacy parity belongs to the
    # snapshot repo's crawl-inventory job, not this sweep
    assert parity.DEFAULT_SLUGS == "rolling,1.5,1.4"


def test_fetch_records_transport_error_as_status_zero(monkeypatch):
    # a DNS blip / timeout must fail the single probe, not abort the whole run
    class _Boom:
        def open(self, req, timeout=None):
            raise urllib.error.URLError("dns blip")

    monkeypatch.setattr(parity, "_OPENER", _Boom())
    assert parity.fetch("host.invalid", "/en/rolling/", None) == (0, None)


def test_main_always_writes_report_on_transport_errors(tmp_path, monkeypatch):
    # sitemap status probe says 200, but the body fetch raises mid-sweep:
    # the run must record per-slug failures, keep going, and STILL write the report
    report = tmp_path / "parity-report.json"
    monkeypatch.setattr(parity, "fetch", lambda *a, **k: (200, None))

    def _boom(*a, **k):
        raise urllib.error.URLError("timed out")

    monkeypatch.setattr(parity._OPENER, "open", _boom)
    monkeypatch.setattr(sys, "argv", ["parity", "--sitemap-host", "sitemap.invalid",
                                      "--probe-host", "probe.invalid",
                                      "--report", str(report)])
    rc = parity.main()
    assert rc == 1
    data = json.loads(report.read_text())
    assert data["failures"]  # report written despite transport errors
    assert any("sitemap" in f["reason"] for f in data["failures"])


# --- CF Access credentials: env by default (argv publishes secrets to the process table),
# flags as a manual fallback. Access stays OPTIONAL here — the sitemap host may be public —
# but HALF a service token is never usable, so an id/secret mismatch is rejected outright. ---

def _parity_argv(monkeypatch, tmp_path, *extra):
    monkeypatch.setattr(sys, "argv", ["parity", "--sitemap-host", "s.invalid",
                                      "--probe-host", "p.invalid", "--slugs", "rolling",
                                      "--report", str(tmp_path / "r.json"), *extra])


def test_access_credentials_default_from_environment(monkeypatch, tmp_path):
    _parity_argv(monkeypatch, tmp_path)
    monkeypatch.setenv("CF_ACCESS_CLIENT_ID", "env-id")
    monkeypatch.setenv("CF_ACCESS_CLIENT_SECRET", "env-secret")
    seen: list[tuple[str, str] | None] = []

    def _probe(host, path, access, method="HEAD"):
        seen.append(access)
        return 200, None

    monkeypatch.setattr(parity, "fetch", _probe)
    monkeypatch.setattr(parity._OPENER, "open",
                        lambda *a, **k: _sitemap_response("<urlset></urlset>"))
    parity.main()
    assert ("env-id", "env-secret") in seen


def test_half_a_service_token_is_rejected(monkeypatch, tmp_path, capsys):
    _parity_argv(monkeypatch, tmp_path, "--access-id", "only-an-id")
    monkeypatch.delenv("CF_ACCESS_CLIENT_SECRET", raising=False)
    monkeypatch.setattr(parity, "fetch", lambda *a, **k: (_ for _ in ()).throw(
        AssertionError("must not probe with half a token")))
    assert parity.main() == 2
    assert "CF_ACCESS_CLIENT_SECRET" in capsys.readouterr().err


# --- The sitemap used to be fetched TWICE per slug (a status probe via fetch(), then the
# body via a second GET) and the body fetch hard-coded "https://", ignoring _SCHEME. ---

class _CountingSitemap:
    def __init__(self) -> None:
        self.urls: list[str] = []

    def __call__(self, url, *a, **k):
        self.urls.append(url)
        return _sitemap_response(
            '<urlset><url><loc>http://h/en/rolling/a.html</loc></url></urlset>')


def _sitemap_response(body: str):
    class _R:
        def read(self):
            return body.encode()

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False
    return _R()


def test_sitemap_fetched_once_per_slug_and_honours_the_scheme_override(monkeypatch, tmp_path):
    _parity_argv(monkeypatch, tmp_path)
    monkeypatch.delenv("CF_ACCESS_CLIENT_ID", raising=False)
    monkeypatch.delenv("CF_ACCESS_CLIENT_SECRET", raising=False)
    monkeypatch.setattr(parity, "_SCHEME", "http")
    counter = _CountingSitemap()
    monkeypatch.setattr(parity._OPENER, "open", counter)
    monkeypatch.setattr(parity, "fetch", lambda *a, **k: (200, None))
    parity.main()
    assert counter.urls == ["http://s.invalid/en/rolling/sitemap.xml"]  # once, and NOT https
