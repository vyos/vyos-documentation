"""
parse_xml_definitions.py
Turns a resolved VyOS interface-definition XML file (see
fetch_vyos_xml_definition.py) into a draft argspec-shaped YAML
skeleton -- the XML sibling of parse_node_defs.py, and the preferred
source when it's available: XML gives structured <defaultValue> and
<completionHelp> tags that node.def only ever buried in prose help
text, and it needs no device access at all.
Usage:
    python3 fetch_vyos_xml_definition.py vpn_ipsec > vpn_ipsec.xml
    python3 parse_xml_definitions.py vpn_ipsec.xml > draft.yaml
What it extracts per node:
    - <node>          -> plain dict container (has children, no identity)
    - <tagNode>       -> list[dict] (named collection; the FIRST child
                         leafNode/tagNode found becomes the suggested
                         identity field, same "first declared option"
                         convention used elsewhere in this workflow)
    - <leafNode>       -> scalar or list, depending on <multi/>
    - <help>           -> description
    - <defaultValue>   -> noted in the description (Ansible argspec
                         defaults are a design decision, not something
                         to copy mechanically -- see note below)
    - <completionHelp><list>...</list></completionHelp> -> choices,
      same MAX_CHOICES size heuristic as parse_node_defs.py (and the
      same caveat: it's a heuristic, not a replacement for judgment)
What it deliberately does NOT do:
    - Decide the module split, or which subtree maps to which module
    - Decide identity fields with certainty (flags its guess, doesn't
      assert it)
    - Copy <defaultValue> into the argspec's own `default:` mechanically
      -- a VyOS CLI default and an Ansible argspec default serve
      different purposes (the device applies its own default whether or
      not Ansible sets one; adding `default:` in argspec changes
      "merged" idempotency behavior for that field). This script surfaces
      the value for you to decide, it doesn't wire it in.
    - Resolve <completionHelp><script>...</script></completionHelp> or
      <completionHelp><path>...</path></completionHelp> entries (dynamic
      completions -- interface name lists, PKI object references, etc.)
      into choices. Only literal <list> completions are considered.
"""

from __future__ import annotations

import argparse
import re
import sys
import xml.etree.ElementTree as ET

import yaml


def yaml_safe_choice_list(choices) -> str:
    """Render a list of choice values as a comma-joined, YAML-safe
    flow-sequence body -- quoting any value YAML's implicit resolver
    would otherwise misinterpret. Confirmed real bug this fixes:
    site-to-site's `ikev2_reauth` choices are the literal strings
    "yes"/"no"/"inherit", but rendering them as bare unquoted text
    (choices: [yes, no, inherit]) meant any later `yaml.safe_load` of
    this file silently turned them into the Python booleans
    True/False -- YAML 1.1's "Norway problem" (bare yes/no/true/false/
    on/off resolve to booleans). Using yaml.safe_dump per-value rather
    than a fixed blocklist keeps this correct for whatever YAML's own
    rules are, not a guess at which specific words are risky.
    """
    rendered = []
    for c in choices:
        dumped = yaml.safe_dump(c).strip()
        if dumped.endswith("\n..."):
            dumped = dumped[: -len("\n...")]
        if dumped == "...":
            dumped = "null"
        rendered.append(dumped)
    return ", ".join(rendered)


MAX_CHOICES = 15


def node_description(node) -> str:
    props = node.find("properties")
    if props is None:
        return "TODO: description"
    help_el = props.find("help")
    text = help_el.text.strip() if help_el is not None and help_el.text else "TODO: description"
    default_el = node.find("defaultValue")
    if default_el is not None and default_el.text:
        text += f" (CLI default: {default_el.text.strip()}, not copied into argspec -- see script notes)"
    return text


def is_integer_type(node) -> bool:
    """True if this node's own <valueHelp><format> entries all signal a
    genuinely numeric CLI value. Two distinct patterns confirmed in the
    real vpn_ipsec definition, both handled here:
      1. A "uNN" or "uNN:range" prefix (u32:1-65535, u32:0, u64:1024-...
         -- note the width varies, u64 is real, not just u32).
      2. A bare literal digit per valueHelp entry -- used for small
         enumerated numeric fields where each valid value gets its own
         valueHelp/description pair (e.g. `level`'s 0/1/2, `dh-group`'s
         1/2/5/14/...). A single "0" or "1" doesn't match a "uNN"
         prefix at all, so this needed its own check -- missing it
         mistyped several real fields as `str` even after the uNN fix.
    Checks EVERY valueHelp on the node and only calls it integer if
    every one of them matches one of the two patterns above -- a mixed
    field (numeric range alongside a genuinely non-numeric named value)
    falls back to str, which is always safe even if occasionally
    conservative.
    """
    props = node.find("properties")
    if props is None:
        return False
    formats = [vh.findtext("format") for vh in props.findall("valueHelp")]
    formats = [f.strip() for f in formats if f]
    if not formats:
        return False

    def _is_numeric_format(fmt: str) -> bool:
        if re.match(r"^u\d+(:.*)?$", fmt):
            return True
        return fmt.isdigit()

    return all(_is_numeric_format(f) for f in formats)


def node_choices(node):
    props = node.find("properties")
    if props is None:
        return None
    completion = props.find("completionHelp")
    if completion is None:
        return None
    # A <script> or <path> sibling means part of the valid value space
    # is dynamic (e.g. "any" as a literal plus a script listing real
    # local IP addresses) -- the <list> alone is NOT the complete,
    # closed set of valid values in that case, so don't propose choices
    # at all. Confirmed real case: vpn_ipsec's site-to-site
    # `local-address` field has completionHelp <list>any</list> PLUS a
    # <script> completion for actual IPs -- treating <list> in
    # isolation there produced a misleading choices: [any] that would
    # incorrectly reject every real IP address value.
    if completion.find("script") is not None or completion.find("path") is not None:
        return None
    list_el = completion.find("list")
    if list_el is None or not list_el.text:
        return None
    values = list_el.text.split()
    if 0 < len(values) <= MAX_CHOICES:
        return values
    return None


def is_multi(node) -> bool:
    props = node.find("properties")
    return props is not None and props.find("multi") is not None


def merge_duplicate_siblings(children):
    """VyOS's XML occasionally has two sibling nodes with the SAME
    name+tag, where the second is a deliberate partial patch onto the
    first. Two patterns observed in practice, both handled here:
      1. A later leafNode with the same name adds/overrides just a
         <defaultValue> onto an earlier, fully-defined leafNode (e.g. a
         shared `port` fragment patched with a service-specific
         default).
      2. A later <node> with the same name has its OWN <children> that
         must be merged with the earlier node's <children> -- not
         replaced wholesale. This matters because the merged children
         can themselves contain a further same-named duplicate one
         level down (observed case: two separate `radius` nodes each
         define their own `server` tagNode, which must in turn be
         merged with each other, or the RADIUS `key`/`port` fields from
         the first `server` silently vanish when the second `server`
         replaces it).
    This is NOT a mistake in the source -- it's VyOS's own convention
    for composing a field from multiple reusable fragments. Silently
    keeping only the last occurrence (a naive dict-by-name approach)
    would quietly drop real fields; that's worse than the duplicate-key
    output this function replaces.
    """
    merged = {}
    order = []
    for child in children:
        key = (child.tag, child.get("name"))
        if key not in merged:
            merged[key] = child
            order.append(key)
            continue
        base = merged[key]
        for sub in child:
            if sub.tag == "properties":
                existing_props = base.find("properties")
                if existing_props is None:
                    base.append(sub)
                    continue
                for prop_child in sub:
                    dup = existing_props.find(prop_child.tag)
                    if dup is not None:
                        existing_props.remove(dup)
                    existing_props.append(prop_child)
            elif sub.tag == "children":
                existing_children = base.find("children")
                if existing_children is None:
                    base.append(sub)
                    continue
                # Recursively merge, don't replace: union both sides'
                # children, then re-apply this same merge in case that
                # union itself introduced a new same-named duplicate.
                combined = list(existing_children) + list(sub)
                remerged = merge_duplicate_siblings(combined)
                for c in list(existing_children):
                    existing_children.remove(c)
                for c in remerged:
                    existing_children.append(c)
            else:
                existing = base.find(sub.tag)
                if existing is not None:
                    base.remove(existing)
                base.append(sub)
    return [merged[k] for k in order]


def render(children, indent: int = 0) -> list[str]:
    lines = []
    pad = "  " * indent
    children = merge_duplicate_siblings(children)
    for child in children:
        name = child.get("name", "unknown").replace("-", "_")
        desc = node_description(child)
        lines.append(f"{pad}{name}:")
        lines.append(f'{pad}  description: "{desc}"')
        if child.tag == "tagNode":
            lines.append(f"{pad}  type: list")
            lines.append(f"{pad}  elements: dict")
            lines.append(f"{pad}  suboptions:")
            # The identity of a tagNode is the CLI tag argument itself
            # (e.g. `set vpn ipsec authentication psk <name>`), never
            # one of its child leafNodes -- always synthesize it, don't
            # guess from the first child (that produced a real duplicate
            # -key bug when a tagNode's first child happened to share a
            # name with an actual leaf field, e.g. authentication/psk's
            # dhcp-interface fragment).
            #
            # Its TYPE, though, is genuinely determinable: the tagNode's
            # own <properties><valueHelp><format> describes the tag
            # value itself (not a child field). A format starting with
            # "u32" means the tag argument is numeric (confirmed
            # consistent across esp_group/ike_group's `proposal`
            # tagNodes -- format "u32:1-65535" -- and site-to-site's
            # `tunnel` tagNode -- format "u32"). Defaulting every
            # identity to `str` would be wrong for these; a numbered
            # tag genuinely needs `type: int` in the argspec.
            identity_type = "int" if is_integer_type(child) else "str"
            lines.append(f"{pad}    name:")
            lines.append(
                f'{pad}      description: "TODO: confirm this is really the tag name'
                f" (and rename from the generic 'name' to something more specific,"
                f" e.g. proposal_id/tunnel_id, if it's numeric)\"",
            )
            lines.append(f"{pad}      type: {identity_type}")
            lines.append(f"{pad}      required: true")
            grandchildren = (
                list(child.find("children")) if child.find("children") is not None else []
            )
            lines.extend(render(grandchildren, indent + 2))
        elif child.tag == "node":
            grandchildren = (
                list(child.find("children")) if child.find("children") is not None else []
            )
            if grandchildren:
                lines.append(f"{pad}  type: dict")
                lines.append(f"{pad}  suboptions:")
                lines.extend(render(grandchildren, indent + 2))
            else:
                lines.append(f"{pad}  type: bool")
        elif child.tag == "leafNode":
            choices = node_choices(child)
            if is_multi(child):
                lines.append(f"{pad}  type: list")
                lines.append(f"{pad}  elements: {'int' if is_integer_type(child) else 'str'}")
            else:
                props = child.find("properties")
                valueless = props is not None and props.find("valueless") is not None
                if valueless:
                    lines.append(f"{pad}  type: bool")
                elif is_integer_type(child):
                    lines.append(f"{pad}  type: int")
                else:
                    lines.append(f"{pad}  type: str")
            if choices:
                lines.append(f"{pad}  choices: [{yaml_safe_choice_list(choices)}]")
    return lines


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "xml_file", help="Resolved interface-definition XML (see fetch_vyos_xml_definition.py)"
    )
    args = parser.parse_args()
    try:
        tree = ET.parse(args.xml_file)
    except ET.ParseError as e:
        print(f"Not valid XML -- did you resolve #include directives first? ({e})", file=sys.stderr)
        sys.exit(1)
    root = tree.getroot()
    print("# DRAFT -- generated by parse_xml_definitions.py, review before use")
    print("# Identity fields, module split, and choices are TODOs to confirm.")
    print("# CLI defaults are noted in descriptions, not wired into the argspec --")
    print("# decide deliberately whether/how to reflect them (see script notes).")
    for line in render(list(root)):
        print(line)


if __name__ == "__main__":
    main()
