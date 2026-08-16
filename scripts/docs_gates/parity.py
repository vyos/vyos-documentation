"""URL-parity corpus + alias assertions (spec §11).

Modes:
  --sitemap-host X   pull per-version sitemaps from X (RTD pre-cutover)
  --probe-host Y     probe every URL on Y (canary via Access, or production)
Fails (exit 1) on any status mismatch (non-200 for corpus rows; wrong
Location for alias rows).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

SITEMAP_LOC = re.compile(r"<loc>([^<]+)</loc>")

# Sitemap sweep covers only the versions THIS repo builds on CF (rolling/1.5/1.4).
# 1.3/1.2 have NO RTD sitemaps (spec §15a.5) — their parity is the legacy snapshot
# repo's crawl-inventory job. Their alias/PDF redirect rows below stay in scope.
DEFAULT_SLUGS = "rolling,1.5,1.4"

ALIASES = [("latest", "rolling"), ("stable", "1.5"), ("lts", "1.5"),
           ("circinus", "1.5"), ("sagitta", "1.4"), ("equuleus", "1.3"), ("crux", "1.2")]


def urls_from_sitemap(xml: str) -> list[str]:
    out = []
    for loc in SITEMAP_LOC.findall(xml):
        path = re.sub(r"^https?://[^/]+", "", loc)
        if path.startswith("/en/"):
            out.append(path)
    return out


def alias_corpus() -> list[tuple[str, int, str]]:
    rows = [(f"/en/{a}/", 301, f"/en/{s}/") for a, s in ALIASES]
    # 1.2 excluded: never had an RTD PDF artifact (Phase-0 finding, spec §15a) — pdf: null
    rows += [(f"/_/downloads/en/{s}/pdf/", 301, f"/en/{s}/vyos-documentation.pdf")
             for s in ["rolling", "1.5", "1.4", "1.3"]]
    rows.append(("/_/downloads/en/latest/pdf/", 301, "/en/rolling/vyos-documentation.pdf"))
    return rows


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    """The parity checker must SEE 301s, not follow them (alias assertions)."""

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: D401
        return None


_OPENER = urllib.request.build_opener(_NoRedirect)

# Overridable in tests (monkeypatched to "http") so fetch() can be exercised end-to-end
# against a real local http.server instead of requiring TLS for a unit test.
_SCHEME = "https"


def build_request(url: str, access: tuple[str, str] | None,
                  method: str = "HEAD") -> urllib.request.Request:
    """The ONE place that attaches CF Access credentials to a request.

    Every outbound request in this module goes through here. The sitemap fetch used to
    build its own bare Request, so pointing --sitemap-host at the Access-gated canary host
    made every sitemap 403 while the probe requests (which did send the headers) worked —
    a split-brain that is easy to reintroduce and hard to read off the code. Funnelling
    both callers through a single constructor makes that drift structurally impossible.
    """
    req = urllib.request.Request(url, method=method)
    if access:
        req.add_header("CF-Access-Client-Id", access[0])
        req.add_header("CF-Access-Client-Secret", access[1])
    return req


def fetch(host: str, path: str, access: tuple[str, str] | None, method: str = "HEAD"):
    req = build_request(f"{_SCHEME}://{host}{path}", access, method)
    try:
        with _OPENER.open(req, timeout=30) as r:
            return r.status, r.headers.get("Location")
    except urllib.error.HTTPError as e:  # 3xx land here with the no-redirect handler
        return e.code, e.headers.get("Location")
    except Exception:  # noqa: BLE001 — DNS blip/timeout fails THIS probe, not the run
        return 0, None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sitemap-host", required=True)
    ap.add_argument("--probe-host", required=True)
    ap.add_argument("--slugs", default=DEFAULT_SLUGS)
    ap.add_argument("--report", type=Path, default=Path("parity-report.json"))
    a = ap.parse_args()
    # CF Access service-token credentials are read ONLY from the environment. They were
    # also accepted as --access-id/--access-secret flags; that is removed rather than
    # merely discouraged, because a value passed in argv is readable from the process table
    # for the lifetime of the process and is captured verbatim by `set -x` traces, crash
    # dumps and CI process listings. No call site used the flags (both workflows export the
    # env vars), so there is nothing to migrate and no ergonomic loss worth the exposure.
    # Access itself stays OPTIONAL: the sitemap host may be a public origin needing no token.
    access_id = os.environ.get("CF_ACCESS_CLIENT_ID", "")
    access_secret = os.environ.get("CF_ACCESS_CLIENT_SECRET", "")
    if bool(access_id) != bool(access_secret):
        # Half a service token is never usable — every probe would 403 and the run would
        # report a wholly misleading "parity broken". Names only, never the values.
        print("CF Access needs BOTH an id and a secret, or neither "
              "(CF_ACCESS_CLIENT_ID, CF_ACCESS_CLIENT_SECRET)", file=sys.stderr)
        return 2
    access = (access_id, access_secret) if access_id else None
    failures: list[dict] = []
    checked = 0

    for slug in a.slugs.split(","):
        # ONE request per sitemap. This used to probe the status with fetch() and then fetch
        # the whole document a second time — two full GETs of a multi-thousand-URL sitemap per
        # slug — and the body fetch hard-coded "https://", so the _SCHEME override (the hook
        # the tests use to drive this path against a local plain-HTTP server) was ignored.
        # Two things the single-call rewrite must NOT lose:
        #   1. The discarded pre-check asserted status == 200 exactly. _OPENER raises
        #      HTTPError for non-2xx (3xx included — it refuses to follow redirects), but it
        #      RETURNS normally for any other 2xx, so a sitemap answering 204/206 would yield
        #      an empty corpus and the gate would pass having probed nothing. The explicit
        #      status check below restores that strictness.
        #   2. CF Access credentials. Building a bare Request here skipped them, so a
        #      --sitemap-host pointed at the Access-gated canary 403s on every sitemap;
        #      build_request() is now the single credential-attaching path.
        try:
            with _OPENER.open(build_request(
                    f"{_SCHEME}://{a.sitemap_host}/en/{slug}/sitemap.xml", access, "GET"),
                    timeout=30) as r:
                if r.status != 200:
                    failures.append({"path": f"/en/{slug}/sitemap.xml",
                                     "reason": f"sitemap status {r.status}"})
                    continue
                urls = urls_from_sitemap(r.read().decode())
        except Exception as e:  # noqa: BLE001 — record per-slug, keep sweeping; report ALWAYS written
            failures.append({"path": f"/en/{slug}/sitemap.xml",
                             "reason": f"sitemap fetch error: {e}"})
            continue
        for path in urls:
            checked += 1
            st, _ = fetch(a.probe_host, path, access)
            if st != 200:
                failures.append({"path": path, "reason": f"status {st}"})

    for path, want_status, want_loc in alias_corpus():
        checked += 1
        st, loc = fetch(a.probe_host, path, access)
        if st != want_status or (loc or "") != want_loc:
            failures.append({"path": path, "reason": f"got {st} → {loc}, want {want_status} → {want_loc}"})

    a.report.write_text(json.dumps({"checked": checked, "failures": failures}, indent=2))
    for f in failures:
        print(f"PARITY-FAIL {f['path']}: {f['reason']}", file=sys.stderr)
    print(f"checked={checked} failures={len(failures)}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
