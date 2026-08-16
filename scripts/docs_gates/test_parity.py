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


# --- The scoping test compares ORIGINS, not spellings. `p.invalid` and `p.invalid:443` are
# the same HTTPS origin, and so is the trailing-dot FQDN form; comparing (hostname, port)
# verbatim made all three distinct. The case that matters is post-cutover, where BOTH flags
# name the same host: write either one with an explicit `:443` and the sitemap fetch silently
# lost its token and 403'd — reverting the keeper case two tests up. ---

def test_equivalent_spellings_of_one_origin_all_get_the_token():
    for host, url in (("p.invalid", "https://p.invalid:443/en/rolling/"),   # default port explicit
                      ("p.invalid:443", "https://p.invalid/en/rolling/"),   # ...and the reverse
                      ("p.invalid:443", "https://p.invalid:443/en/"),       # explicit on both
                      ("p.invalid.", "https://p.invalid/en/rolling/"),      # trailing-dot FQDN
                      ("p.invalid", "https://p.invalid./en/rolling/"),      # ...and the reverse
                      ("P.INVALID.:443", "https://p.invalid/en/")):         # every axis at once
        req = parity.build_request(url, parity.Access(host, "an-id", "a-secret"))
        assert req.get_header("Cf-access-client-id") == "an-id", f"{host} vs {url}"
        assert req.get_header("Cf-access-client-secret") == "a-secret", f"{host} vs {url}"


def test_normalization_does_not_widen_the_scope_to_a_different_origin():
    # The inverse pin: normalizing the default port and the trailing dot must not smear the
    # comparison into matching anything else. A non-default port stays a distinct origin in
    # BOTH directions, and a trailing dot on a lookalike is still a lookalike.
    for host, url in (("p.invalid", "https://s.invalid:443/en/"),        # different host, :443
                      ("p.invalid:8443", "https://p.invalid/en/"),      # non-default on the cred
                      ("p.invalid", "https://p.invalid:8443/en/"),      # non-default on the URL
                      ("p.invalid.", "https://p.invalid.evil.example./en/")):  # dotted lookalike
        for header in _ACCESS_HEADERS:
            req = parity.build_request(url, parity.Access(host, "an-id", "a-secret"))
            assert req.get_header(header) is None, f"{host} vs {url}"


def test_the_default_port_that_normalizes_is_the_one_for_the_scheme_in_use(monkeypatch):
    # A bare `host[:port]` argument carries no scheme, so the default it is compared against
    # is the scheme every URL in this module is built with (_SCHEME) — not a hard-coded 443.
    # Under the http override the tests use, 80 is the default and 443 is a real distinct port.
    monkeypatch.setattr(parity, "_SCHEME", "http")
    token = parity.Access("p.invalid:80", "an-id", "a-secret")
    assert parity.build_request("http://p.invalid/en/", token).get_header(
        "Cf-access-client-id") == "an-id"
    assert parity.build_request("http://p.invalid:443/en/", token).get_header(
        "Cf-access-client-id") is None


def test_probe_host_written_with_an_explicit_port_still_credentials_its_own_sitemap(
        monkeypatch, tmp_path):
    # The end-to-end shape of the bug: post-cutover both flags name the same host, but one
    # of them spells the default port out. Before origin normalization the sitemap request
    # went out bare, 403'd behind Access, and the sweep reported an empty corpus as a pass.
    monkeypatch.setattr(sys, "argv", ["parity", "--sitemap-host", "p.invalid",
                                      "--probe-host", "p.invalid:443", "--slugs", "rolling",
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


def test_a_plaintext_http_url_never_gets_an_https_scoped_token():
    # An ORIGIN is scheme + host + port. Comparing only (host, port) left the transport out
    # of the credential's scope, so a token bound to an https host also applied to the
    # cleartext http URL of the same name — the choke point would have attached the service
    # token to a request that puts it on the wire in plaintext. `http://p.invalid:80/` is the
    # sharp case: 80 folds to None under http, so the authority-only comparison matched the
    # https-scoped ("p.invalid", None) exactly.
    access = parity.Access("p.invalid", "an-id", "a-secret")   # bare host → _SCHEME (https)
    for url in ("http://p.invalid/en/rolling/", "http://p.invalid:80/en/rolling/"):
        for header in _ACCESS_HEADERS:
            assert parity.build_request(url, access).get_header(header) is None, url
    # control, same test: its own scheme still gets the token
    assert parity.build_request("https://p.invalid/en/rolling/", access).get_header(
        "Cf-access-client-id") == "an-id"


def test_the_service_token_is_not_rendered_by_repr():
    # The default dataclass repr renders every field. A failed assertion, a debug print or an
    # exception that interpolates an Access would then put the token into CI output, which is
    # durable. str() delegates to __repr__, so it covers f-string interpolation too.
    access = parity.Access("p.invalid", "an-id", "sekrit-must-not-be-rendered")
    for rendered in (repr(access), str(access), f"{access}"):
        assert "sekrit-must-not-be-rendered" not in rendered
    assert access.client_secret == "sekrit-must-not-be-rendered"   # still readable as a field
    assert "an-id" in repr(access)   # the id is NOT the credential; keep it for diagnosis


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
