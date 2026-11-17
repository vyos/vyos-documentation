"""
check_parsers_against_fixture.py
Generic, reusable check: does every line in a real device fixture match
exactly one PARSER in an rm_templates module, and does none match zero
or more than one? This is the exact manual check that caught real bugs
throughout the vyos_vpn_ipsec build (missing parsers, overlapping
regexes) -- worth running for any module, not just that one.
This does NOT require a full Ansible/netcommon environment. It loads
the rm_templates module's PARSERS list directly by stubbing out the
one import it needs (NetworkTemplate), so it works standalone against
a plain .py file.
Usage:
    python3 check_parsers_against_fixture.py \\
        path/to/rm_templates/vpn_ipsec.py \\
        path/to/fixture.cfg
Exit code is 0 if every line matched exactly once, 1 otherwise (so this
is safe to wire into CI).
"""

from __future__ import annotations

import sys
import types


def load_parsers(rm_template_path: str):
    """Load a rm_templates module's PARSERS list without needing the
    real ansible_collections.ansible.netcommon package tree installed --
    stub out just the one base class it imports.
    """
    fake_netcommon_module = types.ModuleType("fake_netcommon")

    class NetworkTemplate:
        def __init__(self, *a, **kw):
            pass

    fake_netcommon_module.NetworkTemplate = NetworkTemplate
    stub_path = (
        "ansible_collections.ansible.netcommon.plugins.module_utils"
        ".network.common.rm_base.network_template"
    )
    sys.modules[stub_path] = fake_netcommon_module
    for parent in [
        "ansible_collections",
        "ansible_collections.ansible",
        "ansible_collections.ansible.netcommon",
        "ansible_collections.ansible.netcommon.plugins",
        "ansible_collections.ansible.netcommon.plugins.module_utils",
        "ansible_collections.ansible.netcommon.plugins.module_utils.network",
        "ansible_collections.ansible.netcommon.plugins.module_utils.network.common",
        "ansible_collections.ansible.netcommon.plugins.module_utils.network.common.rm_base",
    ]:
        sys.modules.setdefault(parent, types.ModuleType(parent))
    namespace = {}
    source = open(rm_template_path).read()
    exec(compile(source, rm_template_path, "exec"), namespace)
    template_classes = [
        v for v in namespace.values() if isinstance(v, type) and hasattr(v, "PARSERS")
    ]
    if not template_classes:
        raise SystemExit(f"No class with a PARSERS list found in {rm_template_path}")
    return template_classes[0].PARSERS


def check(parsers, fixture_lines):
    no_match = []
    multi_match = []
    matched_names = set()
    for line in fixture_lines:
        line = line.rstrip("\n")
        if not line.strip():
            continue
        matched = []
        for p in parsers:
            getval = p.get("getval")
            if getval is None:
                continue
            if getval.match(line):
                matched.append(p["name"])
        if not matched:
            no_match.append(line)
        elif len(matched) > 1:
            multi_match.append((line, matched))
        else:
            matched_names.add(matched[0])
    unused = [p["name"] for p in parsers if p["name"] not in matched_names]
    return no_match, multi_match, unused


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    rm_template_path, fixture_path = sys.argv[1], sys.argv[2]
    parsers = load_parsers(rm_template_path)
    fixture_lines = open(fixture_path).readlines()
    no_match, multi_match, unused = check(parsers, fixture_lines)
    print(f"Total PARSERS: {len(parsers)}")
    print(f"Fixture lines checked: {len([ln for ln in fixture_lines if ln.strip()])}")
    print()
    ok = True
    if no_match:
        ok = False
        print(f"NO MATCH ({len(no_match)} lines) -- these fixture lines matched no parser:")
        for line in no_match:
            print(f"  {line}")
        print()
    if multi_match:
        ok = False
        print(f"MULTIPLE MATCHES ({len(multi_match)} lines) -- ambiguous/overlapping parsers:")
        for line, names in multi_match:
            print(f"  {line}")
            print(f"    -> matched: {names}")
        print()
    if unused:
        # Not necessarily an error -- a parser may legitimately not
        # appear in this particular fixture (e.g. an optional field you
        # haven't captured yet) -- but worth a look.
        print(f"UNUSED PARSERS ({len(unused)}) -- defined but never matched by this fixture:")
        for name in unused:
            print(f"  {name}")
        print("  (this is only a problem if you expected this fixture to cover them)")
        print()
    if ok:
        print("All fixture lines matched exactly one parser. Clean.")
    else:
        print("Issues found -- see above.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
