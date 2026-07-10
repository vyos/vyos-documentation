from scripts.docs_gates import parity


def test_sitemap_url_extraction():
    xml = ('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
           "<url><loc>https://docs.vyos.io/en/1.5/a.html</loc></url>"
           "<url><loc>https://docs.vyos.io/en/1.5/b/</loc></url></urlset>")
    assert parity.urls_from_sitemap(xml) == ["/en/1.5/a.html", "/en/1.5/b/"]


def test_alias_corpus_includes_pdf_and_alias_rows():
    rows = parity.alias_corpus()
    assert ("/en/latest/", 301, "/en/rolling/") in rows
    assert ("/_/downloads/en/1.5/pdf/", 301, "/en/1.5/vyos-documentation.pdf") in rows


def test_fetch_never_follows_redirects():
    # the opener's redirect handler must refuse to build a follow-up request,
    # so a 301 surfaces as (301, Location) instead of the post-redirect 200
    handler = parity._NoRedirect()
    assert handler.redirect_request(None, None, 301, "Moved", {}, "https://x/") is None
