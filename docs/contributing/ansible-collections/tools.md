(contributing-ansible-collections-tools)=

# Helper scripts

These scripts automate the mechanical parts of building a vyos.vyos resource
module, as described in {ref}`contributing-vyos-vyos-modules`. Download them
into your working directory, or copy them from the listings below.

`parse_xml_definitions.py` and `wrap_docstring.py` need PyYAML
(`pip install pyyaml`). The other scripts need only the Python standard
library; `resolve_vyos_xml.sh` needs bash and `curl`.

The scripts make no decisions about the module design. They produce drafts
and checks for you to review; see "Review the draft" in the guide.

## Known limitations

The scripts are published as they were used to build `vyos_vpn_ipsec` and
`vyos_vpn_ipsec_s2s`. Known limitations:

- `resolve_vyos_xml.sh` does not detect circular includes, and does not
  notice a failed include fetch: the output can then be incomplete while the
  script still exits with status 0. `fetch_vyos_xml_definition.py` stops with
  an error in both cases, so prefer it when in doubt.
- `parse_xml_definitions.py` and `parse_node_defs.py` write descriptions
  without escaping. Help text containing `"` or `\` gives invalid YAML, which
  `wrap_docstring.py` then fails to load; fix the line in the draft by hand.
- `parse_node_defs.py` writes `choices` unquoted, so values such as `yes`,
  `no`, `on` or `off` become booleans when the draft is loaded.
  `parse_xml_definitions.py` quotes them. When a tag node's own `node.def` and
  its `node.tag/node.def` both set metadata, the later one wins, which can
  turn a list of dictionaries into a dictionary in the draft.
- `check_parsers_against_fixture.py` expects compiled `getval` patterns, as
  the collection's `rm_templates` use. It prints fixture lines that match no
  parser or several; do not run it on fixtures with real secrets where its
  output is logged.

## fetch_vyos_xml_definition.py

Fetches a VyOS XML interface definition from the vyos-1x repository on GitHub
and resolves its `#include` fragments, without a local clone.

```none
$ python3 fetch_vyos_xml_definition.py vpn_ipsec > vpn_ipsec.xml
$ python3 fetch_vyos_xml_definition.py vpn_ipsec --branch rolling > vpn_ipsec.xml
```

{download}`Download <_include/fetch_vyos_xml_definition.py>`

```{literalinclude} _include/fetch_vyos_xml_definition.py
:language: python
```

## resolve_vyos_xml.sh

An equivalent of `fetch_vyos_xml_definition.py` with bash and `curl` only,
without its circular-include detection (see the limitations below).

```none
$ bash resolve_vyos_xml.sh vpn_ipsec > vpn_ipsec.xml
$ bash resolve_vyos_xml.sh vpn_ipsec rolling > vpn_ipsec.xml
```

{download}`Download <_include/resolve_vyos_xml.sh>`

```{literalinclude} _include/resolve_vyos_xml.sh
:language: bash
```

## parse_xml_definitions.py

Turns a resolved definition into a draft docstring skeleton: types, lists,
defaults (noted, not copied) and small sets of choices.

```none
$ python3 parse_xml_definitions.py vpn_ipsec.xml > draft.yaml
```

{download}`Download <_include/parse_xml_definitions.py>`

```{literalinclude} _include/parse_xml_definitions.py
:language: python
```

## wrap_docstring.py

Wraps one subtree of the draft into a complete `DOCUMENTATION` block and
flags likely secrets for review.

```none
$ python3 wrap_docstring.py draft.yaml vpn.ipsec.site_to_site \
    --module vyos_vpn_ipsec_s2s \
    --author "Your Name (@yourhandle)" \
    --version-added "6.3.0" > docstring.yaml
```

{download}`Download <_include/wrap_docstring.py>`

```{literalinclude} _include/wrap_docstring.py
:language: python
```

## parse_node_defs.py

Builds the same kind of draft from `node.def` files on a VyOS device, for
when the XML definitions are not available.

```none
$ python3 parse_node_defs.py /opt/vyatta/share/vyatta-cfg/templates/vpn/ipsec > draft.yaml
$ python3 parse_node_defs.py --dump node_def_dump.txt > draft.yaml
```

{download}`Download <_include/parse_node_defs.py>`

```{literalinclude} _include/parse_node_defs.py
:language: python
```

## check_parsers_against_fixture.py

Checks that every line of a device fixture matches exactly one PARSER of an
`rm_templates` file. It runs without an Ansible installation and exits
non-zero when a line matches no parser or more than one.

```none
$ python3 check_parsers_against_fixture.py \
    plugins/module_utils/network/vyos/rm_templates/vpn_ipsec.py \
    tests/unit/modules/network/vyos/fixtures/vyos_vpn_ipsec_config.cfg
```

{download}`Download <_include/check_parsers_against_fixture.py>`

```{literalinclude} _include/check_parsers_against_fixture.py
:language: python
```
