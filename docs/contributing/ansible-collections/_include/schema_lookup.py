"""schema_lookup.py -- look up a VyOS config path in the vyos-1x
interface definitions and print what the schema says about it, plus a
DRAFT argspec fragment to review by hand.
This is a lookup aid for module authors, not a module generator. It
answers "what children does this node have, what are their types and
constraints, which are lists / presence flags / keyed collections?" so
you don't have to read dozens of XML fragments. Module scope, identity
fields, renames and ownership are still your decisions (see the guide).
Usage:
    python3 schema_lookup.py VYOS1X_DIR PATH... [--only a,b,c] [--yaml]
Examples:
    python3 schema_lookup.py ~/src/vyos-1x system
    python3 schema_lookup.py ~/src/vyos-1x system --only host-name,domain-name --yaml
    python3 schema_lookup.py ~/src/vyos-1x interfaces ethernet --only description,mtu,vif --yaml
VYOS1X_DIR is a checkout of github.com/vyos/vyos-1x (branch matching the
VyOS version you target). Nothing is built or installed: the script
expands the "#include <...>" lines itself, the same way vyos-1x's own
scripts/transclude-template does.
"""

import argparse
import glob
import os
import re
import sys
import xml.etree.ElementTree as ET

INCLUDE_RE = re.compile(r"^ *#include <(.+)>$")


def transclude(filename, base_dir):
    out = []
    with open(filename) as fh:
        for line in fh:
            m = INCLUDE_RE.match(line.rstrip("\n"))
            if m:
                for inc in sorted(glob.glob(os.path.join(base_dir, m.group(1)))):
                    out.append(transclude(inc, base_dir))
            else:
                out.append(line)
    return "".join(out)


def load_roots(vyos1x_dir):
    idir = os.path.join(vyos1x_dir, "interface-definitions")
    roots = []
    for f in sorted(glob.glob(os.path.join(idir, "*.xml.in"))):
        try:
            roots.append(ET.fromstring(transclude(f, idir)))
        except ET.ParseError as exc:  # report, don't hide
            print("warning: could not parse %s: %s" % (os.path.basename(f), exc), file=sys.stderr)
    return roots


def kids(el):
    ch = el.find("children")
    return [] if ch is None else [c for c in ch if c.tag in ("node", "tagNode", "leafNode")]


def resolve(roots, path):
    """All elements matching the path across every definition file."""
    level = [r for r in roots]
    for name in path:
        nxt = []
        for el in level:
            for c in list(el) if el.tag == "interfaceDefinition" else kids(el):
                if c.get("name") == name:
                    nxt.append(c)
        level = nxt
    return level


def facts(el):
    p = el.find("properties")
    f = {
        "name": el.get("name"),
        "kind": el.tag,
        "help": "",
        "multi": False,
        "valueless": False,
        "default": None,
        "validators": [],
        "regexes": [],
    }
    d = el.find("defaultValue")
    if d is not None and d.text:
        f["default"] = d.text.strip()
    if p is None:
        return f
    h = p.find("help")
    f["help"] = (h.text or "").strip() if h is not None else ""
    f["multi"] = p.find("multi") is not None
    f["valueless"] = p.find("valueless") is not None
    for c in p.iter("constraint"):
        for v in c.iter("validator"):
            f["validators"].append(
                v.get("name") + (" " + v.get("argument") if v.get("argument") else "")
            )
        for r in c.iter("regex"):
            f["regexes"].append((r.text or "").strip())
    return f


def suggest(f):
    """(argspec type, choices, note) -- a suggestion, never a decision."""
    if f["kind"] == "tagNode":
        return "list", None, "keyed collection (elements: dict); key field must be required=True"
    if f["kind"] == "node":
        return "dict", None, "container; recurse into its children"
    if f["valueless"]:
        return "bool", None, "presence flag (value-less leaf)"
    typ, choices, note = "str", None, ""
    if any(v.startswith("numeric") for v in f["validators"]):
        typ = "int"  # the range itself is shown in the constraints column
    if not f["validators"]:
        # a regex that is just a list of literals is a closed value set; when a
        # validator is also present the regex is an ALTERNATIVE form, not choices
        for rx in f["regexes"]:
            m = re.fullmatch(r"\(?([A-Za-z0-9_.:-]+(?:\|[A-Za-z0-9_.:-]+)+)\)?", rx)
            if m:
                choices = m.group(1).split("|")
    if len(f["validators"]) + len(f["regexes"]) > 1 and not choices and typ != "int":
        note = "several constraints -- check by hand"
    if f["multi"]:
        return "list", choices, ("elements: " + typ + ("; " + note if note else ""))
    return typ, choices, note


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("vyos1x_dir")
    ap.add_argument("path", nargs="+")
    ap.add_argument("--only", help="comma separated child names to show")
    ap.add_argument("--yaml", action="store_true", help="also print a draft argspec fragment")
    a = ap.parse_args()
    roots = load_roots(a.vyos1x_dir)
    nodes = resolve(roots, a.path)
    if not nodes:
        sys.exit("path not found in the definitions: " + " ".join(a.path))
    wanted = set(a.only.split(",")) if a.only else None
    seen, rows = set(), []
    for n in nodes:
        for c in kids(n):
            name = c.get("name")
            if name in seen or (wanted and name not in wanted):
                continue
            seen.add(name)
            rows.append(facts(c))
    print("# %s  (%d matching definition fragment(s))" % (" ".join(a.path), len(nodes)))
    print(
        "%-24s %-9s %-7s %-12s %s" % ("child", "kind", "suggest", "default", "constraints / notes")
    )
    for f in rows:
        typ, choices, note = suggest(f)
        cons = []
        if choices:
            cons.append("choices=" + ",".join(choices))
        if f["validators"]:
            cons.append("validators=" + ",".join(f["validators"]))
        if note:
            cons.append(note)
        print(
            "%-24s %-9s %-7s %-12s %s"
            % (f["name"], f["kind"], typ, f["default"] or "-", "; ".join(cons))
        )
    if wanted and wanted - seen:
        print("\nnot found under this path: " + ", ".join(sorted(wanted - seen)))
    if a.yaml:
        print("\n# DRAFT argspec fragment -- review before use")
        for f in rows:
            typ, choices, note = suggest(f)
            print("%s:" % f["name"].replace("-", "_"))
            print("  description: %s" % (f["help"] or "TODO"))
            print("  type: %s" % typ)
            if typ == "list" and f["kind"] == "leafNode":
                el = "int" if any(v.startswith("numeric") for v in f["validators"]) else "str"
                print("  elements: %s" % el)
            if typ == "list" and f["kind"] == "tagNode":
                print("  elements: dict")
            if choices:
                print("  choices: [%s]" % ", ".join(choices))
            if f["default"]:
                print(
                    "  # schema default is %s -- usually do NOT copy into the argspec"
                    % f["default"]
                )
            if f["name"] != f["name"].replace("-", "_") or f["kind"] == "tagNode":
                print("  # device key: %s" % f["name"])


if __name__ == "__main__":
    main()
