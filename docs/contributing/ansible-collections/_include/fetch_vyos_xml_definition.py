"""
fetch_vyos_xml_definition.py
Fetches a single VyOS CLI interface-definition (.xml.in) straight from
the vyos-1x GitHub repo over plain HTTP and resolves its #include
fragments -- no `git clone`, no `gh` CLI, no build system. This is the
"no device access needed" alternative to capturing node.def files from
a live VyOS box (see parse_node_defs.py for that path).
Reimplements vyos-1x's own scripts/transclude-template logic (it's a
tiny, dependency-free script -- GPLv2+, same license as this repo it's
adapted from) against fetched content instead of local files.
Usage:
    python3 fetch_vyos_xml_definition.py vpn_ipsec > vpn_ipsec.xml
    python3 fetch_vyos_xml_definition.py vpn_ipsec --branch rolling > vpn_ipsec.xml
Then feed the result into parse_xml_definitions.py to get a draft
docstring skeleton, same idea as parse_node_defs.py but from this
richer, structured source.
Known limitation: vyos-1x's real transclude-template supports glob
patterns in #include lines (matching multiple files). This fetcher
only handles a single literal filename per #include, which is what
every interface-definition file observed so far actually uses in
practice -- but if a future file uses a glob include, this will not
resolve it, and there's no local directory to glob against over plain
HTTP anyway (that would need the GitHub API's tree endpoint instead).
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.request


RAW_BASE = "https://raw.githubusercontent.com/vyos/vyos-1x"
INCLUDE_RE = re.compile(r"^\s*#include <(.+)>\s*$")


def fetch(url: str) -> str:
    with urllib.request.urlopen(url) as resp:
        return resp.read().decode("utf-8")


def resolve(text: str, base_path: str, branch: str, chain: tuple) -> str:
    """Replace every #include <path> line with the fetched, recursively
    resolved content of that file. `base_path` is the directory the
    ROOT file lives in (interface-definitions/) -- matching
    transclude-template's behaviour of resolving all includes relative
    to the top-level file's directory, not the including file's own
    location.
    `chain` is the tuple of paths in the CURRENT inclusion branch (root
    -> ... -> here), used only to detect genuine circular includes. The
    same fragment legitimately gets included from multiple *different*
    branches of one document (e.g. the same cipher-list fragment used
    by both an ESP proposal and an IKE proposal) -- that's normal reuse,
    not circularity, so a single global "seen" set is the wrong check;
    it must be scoped per-branch.
    """
    out_lines = []
    for line in text.splitlines(keepends=True):
        m = INCLUDE_RE.match(line)
        if not m:
            out_lines.append(line)
            continue
        rel_path = m.group(1)
        full_path = f"{base_path}/{rel_path}"
        if full_path in chain:
            raise RuntimeError(f"circular include detected: {' -> '.join(chain + (full_path,))}")
        url = f"{RAW_BASE}/{branch}/{full_path}"
        included_text = fetch(url)
        out_lines.append(resolve(included_text, base_path, branch, chain + (full_path,)))
    return "".join(out_lines)


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("name", help="Definition file name without .xml.in, e.g. vpn_ipsec")
    parser.add_argument("--branch", default="rolling", help="vyos-1x branch/tag (default: rolling)")
    args = parser.parse_args()
    base_path = "interface-definitions"
    root_rel = f"{args.name}.xml.in"
    root_url = f"{RAW_BASE}/{args.branch}/{base_path}/{root_rel}"
    try:
        root_text = fetch(root_url)
    except Exception as e:
        print(f"Failed to fetch {root_url}: {e}", file=sys.stderr)
        sys.exit(1)
    root_full_path = f"{base_path}/{root_rel}"
    resolved = resolve(root_text, base_path, args.branch, (root_full_path,))
    print(resolved)


if __name__ == "__main__":
    main()
