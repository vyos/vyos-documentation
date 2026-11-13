r"""
parse_node_defs.py
Walks a directory of VyOS `node.def` files (the actual vyatta-cfg CLI
templates, e.g. /opt/vyatta/share/vyatta-cfg/templates/vpn/ipsec/) and
produces a draft argspec-shaped YAML skeleton -- the starting point for
a module's DOCUMENTATION, not a finished product. It saves the tedious,
error-prone part (walking dozens of node.def files by hand and copying
type/choices/help text) so a human can focus on the actual design
decisions (identity fields, module split, which choices to keep).
Usage:
    python3 parse_node_defs.py /path/to/templates/vpn/ipsec > draft.yaml
Or against a pre-captured find+cat dump (same format as what you'd get
running this on the device):
    find /opt/vyatta/share/vyatta-cfg/templates/vpn/ipsec -name node.def \
        -exec sh -c 'echo "=== {} ==="; cat {}' \; > dump.txt
    python3 parse_node_defs.py --dump dump.txt > draft.yaml
What it extracts per node.def:
    - type: (txt/u32/etc -> mapped to str/int/float)
    - multi: presence -> list vs scalar
    - tag: presence -> this path is a named collection (list[dict]),
      the next path segment is `node.tag` (the per-item options)
    - help: -> description
    - allowed: "echo '...'" with a short, fixed value set -> choices
      (skipped automatically if the value set looks like a large
      algorithm/cipher list -- see MAX_CHOICES below; these are exactly
      the ones the workflow doc says to drop)
What it deliberately does NOT do:
    - Decide identity fields for list[dict] nodes (you still choose
      which suboption goes first)
    - Decide the module split (which subtree becomes which module)
    - Perfectly replicate human judgment on `choices` -- the
      MAX_CHOICES count is a blunt heuristic. A field with, say, 13
      hash-algorithm names will keep its `choices` here even though a
      human reviewer (aware that crypto algorithm lists gain new
      entries over time regardless of today's count) might drop it
      anyway. Always sanity-check the choices decision per field, not
      just per count.
    - Produce a finished DOCUMENTATION block -- always human-review the
      output before using it. In particular the top of the tree mirrors
      the *absolute* CLI path (e.g. `vpn -> ipsec -> ...`); you'll need
      to extract just the subtree relevant to your module's own
      `config:` root, not paste the whole thing verbatim.
"""

from __future__ import annotations

import argparse
import re
import sys

from pathlib import Path


# Above this many allowed values, treat it as a version-fragile
# enumeration (cipher/algorithm names etc.) and skip `choices` --
# matches the workflow doc's judgment call.
MAX_CHOICES = 15
TYPE_MAP = {
    "txt": "str",
    "u32": "int",
    "bool": "bool",
}


def snake(name: str) -> str:
    return name.replace("-", "_")


def parse_node_def_text(text: str) -> dict:
    """Parse the content of a single node.def file into a small dict."""
    result = {
        "multi": False,
        "tag": False,
        "type": None,
        "help": None,
        "choices": None,
    }
    help_lines = []
    for line in text.splitlines():
        line = line.rstrip()
        if not line:
            continue
        if line.startswith("multi:"):
            result["multi"] = True
        elif line.startswith("tag:"):
            result["tag"] = True
        elif line.startswith("type:"):
            result["type"] = line.split(":", 1)[1].strip()
        elif line.startswith("help:"):
            help_lines.append(line.split(":", 1)[1].strip())
        elif help_lines and not re.match(r"^[a-z_-]+:", line) and line.startswith(("\t", " ")):
            # continuation of a wrapped help: line
            help_lines.append(line.strip())
        elif line.startswith("allowed:") and 'echo "' in line:
            m = re.search(r'echo "([^"]*)"', line)
            if m:
                values = m.group(1).split()
                if 0 < len(values) <= MAX_CHOICES:
                    result["choices"] = values
    if help_lines:
        result["help"] = " ".join(help_lines)
    return result


def build_tree(node_defs: dict) -> dict:
    """
    node_defs: mapping of dotted-slash path (e.g. 'esp-group/node.tag/proposal')
    to the parsed node.def dict for that path.
    Returns a nested dict shaped like an argspec 'options'/'suboptions' tree.
    """
    tree = {}

    def ensure(path_parts):
        node = tree
        for part in path_parts:
            node = node.setdefault(part, {"_children": {}})["_children"]
        return node

    # sort so parents are created before children
    for path in sorted(node_defs, key=lambda p: p.count("/")):
        info = node_defs[path]
        parts = [p for p in path.split("/") if p != "node.tag"]
        parts = [snake(p) for p in parts]
        if not parts:
            continue
        parent_parts, leaf = parts[:-1], parts[-1]
        parent = ensure(parent_parts)
        entry = parent.setdefault(leaf, {"_children": {}})
        entry["_info"] = info
    return tree


def render_yaml(tree: dict, indent: int = 0) -> list[str]:
    lines = []
    pad = "  " * indent
    for key, node in tree.items():
        info = node.get("_info", {})
        children = node.get("_children", {})
        lines.append(f"{pad}{key}:")
        help_text = info.get("help") or "TODO: description"
        lines.append(f'{pad}  description: "{help_text}"')
        if children:
            # has children -> either a list[dict] (tag) or a plain dict container
            if info.get("tag"):
                lines.append(f"{pad}  type: list")
                lines.append(f"{pad}  elements: dict")
                lines.append(f"{pad}  suboptions:")
                lines.append(f"{pad}    name:")
                lines.append(
                    f'{pad}      description: "TODO: identity field -- confirm this is really the tag name"'
                )
                lines.append(f"{pad}      type: str")
                lines.append(f"{pad}      required: true")
                lines.extend(render_yaml(children, indent + 2))
            else:
                lines.append(f"{pad}  type: dict")
                lines.append(f"{pad}  suboptions:")
                lines.extend(render_yaml(children, indent + 2))
        else:
            py_type = TYPE_MAP.get(info.get("type"), "str") if info.get("type") else "bool"
            if info.get("multi"):
                lines.append(f"{pad}  type: list")
                lines.append(f"{pad}  elements: {py_type}")
            else:
                lines.append(f"{pad}  type: {py_type}")
            if info.get("choices"):
                choices = ", ".join(info["choices"])
                lines.append(f"{pad}  choices: [{choices}]")
    return lines


def load_from_dump(dump_path: str) -> dict:
    """Parse the `find ... -exec cat` style dump format:
    === /path/to/x/node.def ===
    <content>
    === /path/to/y/node.def ===
    <content>
    """
    text = Path(dump_path).read_text()
    node_defs = {}
    blocks = re.split(r"^=== (.+?) ===\s*$", text, flags=re.MULTILINE)
    # blocks[0] is anything before the first marker (usually empty)
    for i in range(1, len(blocks), 2):
        path = blocks[i].strip()
        content = blocks[i + 1] if i + 1 < len(blocks) else ""
        rel = path.split("templates/", 1)[-1]
        rel = rel.rsplit("/node.def", 1)[0]
        node_defs[rel] = parse_node_def_text(content)
    return node_defs


def load_from_directory(root: str) -> dict:
    node_defs = {}
    root_path = Path(root)
    for node_def_file in root_path.rglob("node.def"):
        rel = str(node_def_file.relative_to(root_path).parent)
        if rel == ".":
            continue
        node_defs[rel] = parse_node_def_text(node_def_file.read_text())
    return node_defs


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("path", nargs="?", help="Directory containing node.def files")
    parser.add_argument("--dump", help="Path to a find+cat text dump instead of a live directory")
    args = parser.parse_args()
    if args.dump:
        node_defs = load_from_dump(args.dump)
    elif args.path:
        node_defs = load_from_directory(args.path)
    else:
        parser.print_help()
        sys.exit(1)
    tree = build_tree(node_defs)
    print("# DRAFT -- generated by parse_node_defs.py, review before use")
    print("# Identity fields, module split, and choices are TODOs to confirm.")
    for line in render_yaml(tree):
        print(line)


if __name__ == "__main__":
    main()
