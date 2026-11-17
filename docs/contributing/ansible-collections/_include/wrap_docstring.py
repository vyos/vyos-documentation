"""
wrap_docstring.py
Takes the raw draft from parse_xml_definitions.py and mechanically wraps
one named subtree of it into a full DOCUMENTATION-shaped docstring --
module/short_description/author/notes/options/running_config/state --
so the remaining human work is only the genuine judgment calls (identity
naming, choices worth keeping, cross-module architectural decisions),
not retyping boilerplate.
Usage:
    python3 fetch_vyos_xml_definition.py vpn_ipsec > vpn_ipsec.xml
    python3 parse_xml_definitions.py vpn_ipsec.xml > draft.yaml
    python3 wrap_docstring.py draft.yaml vpn.ipsec.site_to_site \\
        --module vyos_vpn_ipsec_s2s \\
        --author "Your Name (@yourhandle)" > docstring.yaml
The dotted path (e.g. "vpn.ipsec.site_to_site") is walked through the
draft's nested `suboptions`, matching how parse_xml_definitions.py
mirrors the XML's own absolute path from its root node. The NAMED
node's own `suboptions` become `config`'s `suboptions` directly (the
path segment itself isn't nested an extra level inside `config` --
matching how every docstring in this collection is actually shaped).
What this automates (mechanical, no judgment involved):
    - The DOCUMENTATION wrapper itself (module/short_description/
      author/notes/options)
    - short_description, derived from the named node's own <help> text
    - The running_config/state boilerplate block
    - Flagging (not silently deciding) no_log candidates -- any leaf
      field whose name or description contains "passphrase", "secret",
      or "password" gets an inline marker in its description, since
      that survives a plain YAML round-trip without needing a
      comment-preserving parser
What this deliberately does NOT do (left as TODOs, or simply absent):
    - Rename generic identity fields (name -> tunnel_id, etc.) --
      still your call, same as parse_xml_definitions.py itself
    - Decide module/version_added/author for you beyond what you pass
      on the command line
    - Judge whether a field found by the no_log heuristic actually
      needs no_log, or whether the module needs one that the heuristic
      missed -- it's a flag to review, not a decision
    - Understand cross-module architecture (e.g. that a field
      referencing another module's data by ID match doesn't need its
      own inline secret) -- that's exactly the kind of thing Appendix D
      already warns can't be derived from one XML file in isolation
"""

from __future__ import annotations

import argparse
import re
import sys

import yaml


NO_LOG_PATTERN = re.compile(r"passphrase|secret|password", re.IGNORECASE)


def walk_path(tree: dict, dotted_path: str) -> dict:
    """Walk a dotted path through the draft's nesting. Each level in
    the draft wraps its children under an explicit `suboptions` key
    (e.g. vpn -> vpn['suboptions']['ipsec'] -> ...), not directly by
    name -- the dotted path given on the command line names only the
    field segments, so `suboptions` needs to be descended through
    implicitly between each one, not treated as part of the path
    itself.
    """
    node = tree
    for i, segment in enumerate(dotted_path.split(".")):
        if segment not in node:
            available = list(node.keys())
            raise KeyError(
                f"'{segment}' not found at this level. Available here: {available}",
            )
        node = node[segment]
        start = i + 1
        remaining = dotted_path.split(".")[start:]
        if remaining:
            if "suboptions" not in node:
                raise KeyError(
                    f"'{segment}' has no suboptions to descend into "
                    f"(tried to continue to '{remaining[0]}')",
                )
            node = node["suboptions"]
    return node


def flag_no_log_candidates(node, path=""):
    """Recursively scan for leaf fields that look like secrets, and
    append a review marker to their description. Returns the list of
    flagged paths for a summary printed to stderr, so this doesn't
    silently pass without telling you what it found.
    """
    flagged = []
    if not isinstance(node, dict):
        return flagged
    subopts = node.get("suboptions")
    if subopts:
        for key, sub in subopts.items():
            flagged.extend(flag_no_log_candidates(sub, f"{path}.{key}" if path else key))
    else:
        name = path.rsplit(".", 1)[-1] if path else ""
        desc = node.get("description", "")
        if NO_LOG_PATTERN.search(name) or NO_LOG_PATTERN.search(desc):
            marker = " [NO_LOG CANDIDATE -- review, then add no_log: True in argspec.py, NOT here]"
            if marker not in desc:
                node["description"] = desc + marker
            flagged.append(path)
    return flagged


def build_docstring(config_node: dict, module: str, author: str, version_added: str) -> dict:
    short_description = config_node.get(
        "description",
        f"Manages {module.replace('vyos_', '').replace('_', ' ')} on VyOS network devices.",
    )
    doc = {
        "module": module,
        "short_description": short_description.rstrip(".") + " on VyOS network devices.",
        "description": "TODO: expand into a full paragraph -- what does this module manage, "
        "what does it explicitly NOT manage (e.g. other modules it cross-references)?",
        "version_added": version_added,
        "author": author,
        "notes": [
            "Tested against VyOS 1.4 and 1.5.",
            "Source of truth: vyos-1x's interface-definitions XML, resolved and drafted via "
            "this collection's fetch_vyos_xml_definition.py / parse_xml_definitions.py helper "
            "scripts, then hand-reviewed.",
        ],
        "options": {
            "config": {
                "description": short_description,
                "type": "dict",
                "suboptions": config_node.get("suboptions", {}),
            },
            "running_config": {
                "description": [
                    "This option is used only with state I(parsed).",
                    "The value of this option should be the output received from the VyOS "
                    "device by executing the command B(show configuration commands | match "
                    '"TODO: your CLI root").',
                    "The state I(parsed) reads the configuration from the C(running_config) "
                    "option and transforms it into Ansible structured data as per the resource "
                    "module's argspec, returned in the I(parsed) key within the result.",
                ],
                "type": "str",
            },
            "state": {
                "description": "The state the configuration should be left in.",
                "type": "str",
                "choices": [
                    "merged",
                    "replaced",
                    "overridden",
                    "deleted",
                    "gathered",
                    "rendered",
                    "parsed",
                ],
                "default": "merged",
            },
        },
    }
    return doc


class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("draft_file", help="Output of parse_xml_definitions.py")
    parser.add_argument(
        "path", help="Dotted path to the subtree to wrap, e.g. vpn.ipsec.site_to_site"
    )
    parser.add_argument("--module", required=True, help="Module name, e.g. vyos_vpn_ipsec_s2s")
    parser.add_argument("--author", default="TODO (@yourhandle)")
    parser.add_argument("--version-added", default="TODO")
    args = parser.parse_args()
    with open(args.draft_file) as f:
        tree = yaml.safe_load(f)
    try:
        config_node = walk_path(tree, args.path)
    except KeyError as e:
        print(f"Path error: {e}", file=sys.stderr)
        sys.exit(1)
    flagged = flag_no_log_candidates(config_node)
    doc = build_docstring(config_node, args.module, args.author, args.version_added)
    print(yaml.dump(doc, Dumper=NoAliasDumper, sort_keys=False, default_flow_style=False, width=88))
    if flagged:
        print(
            f"\n# {len(flagged)} no_log candidate(s) flagged in descriptions -- review:",
            file=sys.stderr,
        )
        for p in flagged:
            print(f"#   {p}", file=sys.stderr)
    print(
        "\n# Remember: still TODO by hand -- module/short_description wording, "
        "version_added, author, identity field naming/typing, choices worth keeping, "
        "running_config's CLI root example, and the no_log candidates flagged above "
        "(move them into argspec.py, not the docstring).",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
