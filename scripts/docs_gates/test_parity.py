import json
import sys
import urllib.error
import urllib.request

import pytest

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


# --- CF Access credentials come from the ENVIRONMENT ONLY. The --access-id/--access-secret
# flags were REMOVED: an argv-passed secret is readable from the process table and captured
# by `set -x` traces. Access stays OPTIONAL here — the sitemap host may be public — but HALF
# a service token is never usable, so an id/secret mismatch is rejected outright. ---

def _parity_argv(monkeypatch, tmp_path, *extra):
    monkeypatch.setattr(sys, "argv", ["parity", "--sitemap-host", "s.invalid",
                                      "--probe-host", "p.invalid", "--slugs", "rolling",
                                      "--report", str(tmp_path / "r.json"), *extra])


def test_access_credentials_default_from_environment(monkeypatch, tmp_path):
    _parity_argv(monkeypatch, tmp_path)
    monkeypatch.setenv("CF_ACCESS_CLIENT_ID", "env-id")
    monkeypatch.setenv("CF_ACCESS_CLIENT_SECRET", "env-secret")
    seen: list[parity.Access | None] = []

    def _probe(host, path, access, method="HEAD"):
        seen.append(access)
        return 200, None

    monkeypatch.setattr(parity, "fetch", _probe)
    monkeypatch.setattr(parity._OPENER, "open",
                        lambda *a, **k: _sitemap_response("<urlset></urlset>"))
    parity.main()
    # scoped to --probe-host, which is the only host the token may ever be presented to
    assert parity.Access("p.invalid", "env-id", "env-secret") in seen


def test_half_a_service_token_is_rejected(monkeypatch, tmp_path, capsys):
    _parity_argv(monkeypatch, tmp_path)
    monkeypatch.setenv("CF_ACCESS_CLIENT_ID", "only-an-id")
    monkeypatch.delenv("CF_ACCESS_CLIENT_SECRET", raising=False)
    monkeypatch.setattr(parity, "fetch", lambda *a, **k: (_ for _ in ()).throw(
        AssertionError("must not probe with half a token")))
    assert parity.main() == 2
    assert "CF_ACCESS_CLIENT_SECRET" in capsys.readouterr().err


def test_secret_bearing_flags_are_rejected_not_silently_ignored(monkeypatch, tmp_path):
    # The flags are GONE, not deprecated. argparse must reject them outright so an operator
    # reaching for the old muscle-memory invocation gets an error instead of a run that
    # silently ignores the credential they passed and then 403s on every probe.
    for flag, value in (("--access-id", "an-id"), ("--access-secret", "a-secret")):
        _parity_argv(monkeypatch, tmp_path, flag, value)
        monkeypatch.setenv("CF_ACCESS_CLIENT_ID", "env-id")
        monkeypatch.setenv("CF_ACCESS_CLIENT_SECRET", "env-secret")
        with pytest.raises(SystemExit) as exc:
            parity.main()
        assert exc.value.code == 2


# --- The sitemap used to be fetched TWICE per slug (a status probe via fetch(), then the
# body via a second GET) and the body fetch hard-coded "https://", ignoring _SCHEME. ---

class _CountingSitemap:
    """Records the Request objects the opener is handed, so a test can assert both the URL
    (once per slug, honouring _SCHEME) and the CF Access headers actually attached to it."""

    def __init__(self, status: int = 200) -> None:
        self.requests: list[urllib.request.Request] = []
        self.status = status

    @property
    def urls(self) -> list[str]:
        return [r.full_url for r in self.requests]

    def __call__(self, req, *a, **k):
        self.requests.append(req)
        return _sitemap_response(
            '<urlset><url><loc>http://h/en/rolling/a.html</loc></url></urlset>',
            status=self.status)


def _sitemap_response(body: str, status: int = 200):
    class _R:
        def __init__(self):
            self.status = status

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


_ACCESS_HEADERS = ("Cf-access-client-id", "Cf-access-client-secret")  # urllib capitalises


def test_sitemap_host_that_is_not_the_probe_host_gets_NO_access_headers(monkeypatch, tmp_path):
    # THE credential-scoping assertion, and the inverse of what this test used to demand.
    # Pre-cutover the two flags name different parties: --sitemap-host is docs.vyos.io,
    # still served by ReadTheDocs, while --probe-host is our Access-gated canary. Crediting
    # every outbound request "because the run holds a token" handed our CF Access service
    # token to a host we do not control, once every night.
    _parity_argv(monkeypatch, tmp_path)
    monkeypatch.setenv("CF_ACCESS_CLIENT_ID", "env-id")
    monkeypatch.setenv("CF_ACCESS_CLIENT_SECRET", "env-secret")
    counter = _CountingSitemap()
    monkeypatch.setattr(parity._OPENER, "open", counter)
    monkeypatch.setattr(parity, "fetch", lambda *a, **k: (200, None))
    parity.main()
    assert len(counter.requests) == 1
    req = counter.requests[0]
    assert req.full_url.startswith("https://s.invalid/")      # the third-party host
    for header in _ACCESS_HEADERS:
        assert req.get_header(header) is None


def test_sitemap_host_equal_to_the_probe_host_IS_credentialed(monkeypatch, tmp_path):
    # The other direction, and the reason the scoping lives inside build_request() rather
    # than at each call site: post-cutover both flags name the same Access-gated host and
    # that sitemap fetch must still carry the token. A bare Request here (the shape before
    # round 2) 403'd every sitemap, and the sweep then reported an empty corpus as a pass.
    monkeypatch.setattr(sys, "argv", ["parity", "--sitemap-host", "p.invalid",
                                      "--probe-host", "p.invalid", "--slugs", "rolling",
                                      "--report", str(tmp_path / "r.json")])
    monkeypatch.setenv("CF_ACCESS_CLIENT_ID", "env-id")
    monkeypatch.setenv("CF_ACCESS_CLIENT_SECRET", "env-secret")
    counter = _CountingSitemap()
    monkeypatch.setattr(parity._OPENER, "open", counter)
    monkeypatch.setattr(parity, "fetch", lambda *a, **k: (200, None))
    parity.main()
    req = counter.requests[0]
    assert req.get_header("Cf-access-client-id") == "env-id"
    assert req.get_header("Cf-access-client-secret") == "env-secret"


def test_build_request_attaches_the_token_to_its_own_host_and_to_nothing_else():
    # build_request() in isolation: one Access object, many destinations.
    access = parity.Access("p.invalid", "an-id", "a-secret")
    own = parity.build_request("https://P.Invalid/en/rolling/", access)   # case-insensitive
    assert own.get_header("Cf-access-client-id") == "an-id"
    assert own.get_header("Cf-access-client-secret") == "a-secret"
    for other in ("https://s.invalid/en/rolling/",          # a different host entirely
                  "https://p.invalid.evil.example/en/",     # suffix-extended lookalike
                  "https://notp.invalid/en/",               # prefix-extended lookalike
                  "https://p.invalid:8443/en/rolling/"):    # same name, different authority
        for header in _ACCESS_HEADERS:
            assert parity.build_request(other, access).get_header(header) is None
    for header in _ACCESS_HEADERS:                          # no token configured at all
        assert parity.build_request("https://p.invalid/", None).get_header(header) is None


def test_non_200_sitemap_is_a_failure_not_an_empty_corpus(monkeypatch, tmp_path):
    # _OPENER only raises for non-2xx. A sitemap answering 204 (or any other 2xx) returned
    # normally with an empty/irrelevant body, so the corpus came back empty and the parity
    # gate PASSED having probed nothing at all — the exact silent-degrade the discarded
    # exact-200 pre-check existed to prevent.
    _parity_argv(monkeypatch, tmp_path)
    monkeypatch.delenv("CF_ACCESS_CLIENT_ID", raising=False)
    monkeypatch.delenv("CF_ACCESS_CLIENT_SECRET", raising=False)
    report = tmp_path / "r.json"
    monkeypatch.setattr(parity._OPENER, "open", _CountingSitemap(status=204))
    monkeypatch.setattr(parity, "fetch", lambda *a, **k: (200, None))
    assert parity.main() == 1
    data = json.loads(report.read_text())
    assert any(f["reason"] == "sitemap status 204" for f in data["failures"])
