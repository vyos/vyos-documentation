(contributing-vyos-vyos-modules)=

# Building a vyos.vyos resource module

This guide walks through adding a resource module to the
[vyos.vyos](https://github.com/vyos/vyos.vyos) collection: design, code,
unit tests, integration tests, sanity checks and testing against a real VyOS
device. It is based on building `vyos_vpn_ipsec` and `vyos_vpn_ipsec_s2s` end
to end, including the mistakes made along the way.

Read the concepts and the module anatomy before writing code. The walkthrough
follows the order in which the steps depend on each other. The reference at the
end is for when something looks wrong.

## Concepts

Skip this part if you already know Ansible network resource modules.

Resource module
: An Ansible module that manages one resource of a network device, such as
  NTP, VRFs or IPsec. You describe the configuration you want; the module
  works out which commands make the device match.

want and have
: `want` is what the playbook asks for (its `config:`). `have` is what is
  configured on the device now, read live. The module computes the
  difference and sends the minimal set of `set` and `delete` commands that
  turns `have` into `want`.

Idempotent
: Running the same task twice in a row must produce no commands the second
  time. This is the most important property of a resource module, and most of
  the testing exists to prove it.

PARSER
: Over the connection this collection uses, VyOS reads and writes plain text:
  `show configuration commands` and `set`/`delete` commands. A PARSER is one
  entry in a list that handles one field in both directions: a regular
  expression that recognises a line of device output (`getval`) and a
  template that renders the matching command (`setval`).

argspec
: The machine-checkable description of every parameter the module accepts:
  names, types, lists or single values, allowed values, secrets. Ansible
  validates the playbook against it before any module code runs.

facts
: Turning the device's text into the data structure the argspec describes.
  `state: gathered` and the internal "read the current `have`" step both use
  it.

Every resource module supports the same states:

`merged`
: Add or update what is in `want`. Never removes anything not mentioned.

`replaced`
: Fully reconcile the items named in `want`: attributes missing from a named
  item are removed. Items not named at all are left alone.

`overridden`
: Like `replaced`, and also removes every item on the device that is not
  named in `want`.

`deleted`
: Without `config:`, remove everything this module manages. With `config:`,
  remove only what is named.

`gathered`
: Read-only: report the current configuration.

`rendered`
: Offline: produce the commands for `config:` as if the device were empty.

`parsed`
: Offline: turn device configuration text (`running_config:`) into the same
  structure `gathered` returns.

The difference between `replaced` and `overridden` is the one most often got
wrong; see {ref}`vyos-modules-replaced-overridden` in the reference.

### Tools

Most of the process can be automated, and the walkthrough relies on that.
The helper scripts are on {ref}`contributing-ansible-collections-tools`,
embedded in full and to download. The commands below assume you saved them
in your working directory.

```{image} /_static/images/ansible-vyos-module-toolchain.webp
:alt: node.def files, parse_node_defs.py, reviewed docstring, cli_rm_builder
:align: center
```

The diagram shows the route from `node.def` files on a device. The preferred
route starts from the XML definitions instead (`fetch_vyos_xml_definition.py`
and `parse_xml_definitions.py`) and leads to the same reviewed docstring. Of
what `cli_rm_builder` generates, only `argspec.py` is kept (see step 4).

`fetch_vyos_xml_definition.py`, `resolve_vyos_xml.sh`
: Fetch a VyOS XML interface definition from GitHub and resolve its
  `#include` fragments, without a local clone. Python or plain bash.

`parse_xml_definitions.py`
: Turns resolved XML into a draft docstring skeleton: types, lists,
  defaults, small sets of choices.

`wrap_docstring.py`
: Wraps one subtree of that draft into a complete `DOCUMENTATION` block and
  flags likely secrets for review.

`parse_node_defs.py`
: The same as `parse_xml_definitions.py`, from `node.def` files on a device.
  A fallback when the XML is not available.

`cli_rm_builder`
: Generates `argspec.py` from the reviewed docstring. The other files it
  generates are not used (see step 4).

`check_parsers_against_fixture.py`
: Checks that every line of a real device fixture matches exactly one
  PARSER.

`pre-commit`
: Runs the repository's formatters and regenerates the module documentation
  on every commit.

None of the tools decides the module split, the names of identity fields or
anything that depends on how two modules relate. Those stay human decisions.

### pre-commit

Install the hook once, right after cloning:

```none
$ pip install pre-commit
$ pre-commit install
```

From then on, every `git commit` runs the checks in `.pre-commit-config.yaml`.
When a hook changes a file, for example by reformatting it or regenerating
documentation, the commit stops so you can review and add the changes again.
That is expected.

Two hooks matter most:

- `update-docs`, from `ansible-network/collection_prep`, regenerates the
  module documentation from each module's `DOCUMENTATION` block. Do not edit
  the generated `docs/*.rst` files by hand.
- `black`, `isort`, `flake8`, `prettier` and the whitespace hooks fix
  formatting and import order before `ansible-test sanity` sees them.

`pre-commit run --all-files` runs the whole chain on demand, for example after
pulling someone else's changes.

## Module anatomy

A resource module is a small family of files, each responsible for one part
of the job.

```{image} /_static/images/ansible-vyos-module-anatomy.webp
:alt: plugins/ (modules, module_utils) and tests/ (unit, integration)
:align: center
```

With `vpn_ipsec` as the example, under `plugins/`:

- `modules/vyos_vpn_ipsec.py`: the module itself, with `DOCUMENTATION`,
  `EXAMPLES`, `RETURN` and `main()`.
- `module_utils/network/vyos/argspec/vpn_ipsec/vpn_ipsec.py`: the generated
  parameter specification.
- `module_utils/network/vyos/facts/facts.py`: the shared list of all
  resources. Every module registers itself here, by hand.
- `module_utils/network/vyos/facts/vpn_ipsec/vpn_ipsec.py`: reads the device
  text and turns it into structured data.
- `module_utils/network/vyos/config/vpn_ipsec/vpn_ipsec.py`: compares `want`
  and `have` and generates the commands.
- `module_utils/network/vyos/rm_templates/vpn_ipsec.py`: the PARSERS, one
  entry per CLI field, used by both facts and config.

Under `tests/`:

- `unit/modules/network/vyos/test_vyos_vpn_ipsec.py`: unit tests against a
  mocked device.
- `unit/modules/network/vyos/fixtures/vyos_vpn_ipsec_config.cfg`: the device
  output the unit tests read.
- `integration/targets/vyos_vpn_ipsec/`: `tasks/main.yaml` and
  `tasks/cli.yaml` (copied from another module), `vars/main.yaml` (expected
  commands and results per scenario), `tests/cli/*.yaml` (one file per
  scenario), `defaults/` and `meta/` (boilerplate).

How the files depend on each other:

```{image} /_static/images/ansible-vyos-module-relations.webp
:alt: How DOCUMENTATION, argspec, facts, config and rm_templates relate
:align: center
```

Adding a field touches four places: `DOCUMENTATION` (describe it), the
argspec (regenerate it from the docstring), the PARSERS (parse and render the
field) and the facts and config code (usually a couple of lines each, in the
existing loops). Missing one of them is the most common way to end up with a
field that looks configured in the playbook but never reaches the device.

## Walkthrough

### Step 0: design

Before writing anything:

- Write down the issue reference and one sentence on what the module
  manages.
- Name the module. Leave out generic container words such as `protocols`,
  `service` or `vpn`, unless the bare name is ambiguous in the collection.
  This is the maintainers' call: `vyos_vpn_ipsec` and `vyos_vpn_ipsec_s2s`
  keep `vpn` on purpose, for consistency.
- Split modules by the shape of the CLI tree, by identity and lifecycle, not
  by how the documentation happens to group headings. A flat profile layer
  that other configuration refers to by name is a different module from a
  nested layer of connections with their own lifecycle.
- Look for a similar module in this collection first. `vyos_ha`, `vyos_nat`
  and `vyos_logging_global` are good references for different shapes.

### Step 1: schema and real device data

These two parts are independent; do them in either order.

**The schema**, without a device. Fetch and resolve the XML definition:

```none
$ python3 fetch_vyos_xml_definition.py vpn_ipsec > vpn_ipsec.xml
$ # or, without Python:
$ bash resolve_vyos_xml.sh vpn_ipsec > vpn_ipsec.xml
$ python3 parse_xml_definitions.py vpn_ipsec.xml > draft.yaml
```

Since VyOS 1.4, `node.def` files are generated at build time from the XML
interface definitions in vyos-1x (see {ref}`development`, "XML for CLI
definitions"). The XML is the better source: it has explicit default values,
and separates completion help from validation. The fetch scripts also resolve
the `#include` fragments that a plain download of one file would miss.

If you cannot reach GitHub, read `node.def` files from a lab device instead:

```none
$ find /opt/vyatta/share/vyatta-cfg/templates/<path> -name node.def \
    -exec sh -c 'echo "=== {} ==="; cat {}' \; > node_def_dump.txt
$ python3 parse_node_defs.py --dump node_def_dump.txt > draft.yaml
```

**A real fixture**, on a device. Configure every field you plan to support,
in one session, commit, and capture the result:

```none
vyos@vyos:~$ show configuration commands | match "<your CLI root>"
```

Do it in one complete pass: a second capture later means checking everything
built against the first one again.

Test unclear CLI behaviour directly instead of inferring it from the schema.
Set a leaf twice with different values to see whether both stay (a
multi-value leaf). Commit a deliberately minimal configuration to discover
requirements between fields that only appear at commit time (see
{ref}`vyos-modules-device-constraints`).

### Step 2: review the draft

The tools leave these decisions to you on purpose:

- **Identity fields.** The tools mark a tag node's identity as a TODO
  instead of naming it. A numbered tag (its `valueHelp` format is `u32`)
  should get a name such as `tunnel_id` or `proposal_id`, not a generic
  `name`.
- **Choices.** Keep small, stable sets such as `mode: [tunnel, transport]`.
  Leave large sets that change between VyOS versions, such as encryption
  algorithms, as plain strings: the device validates them anyway, and a
  stale list in Ansible rejects values a newer VyOS accepts.
- **Secrets.** The tools flag likely secrets by name (`passphrase`,
  `secret`, `password`). Confirm each one: the name of a PKI key pair is an
  identifier, not key material.
- **Relations between modules.** A site-to-site peer with
  `mode: pre-shared-secret` needs no secret field of its own: it uses the
  secret with the matching ID from the profile module's PSK list. No schema
  tells you this.

### Step 3: write the docstring

```none
$ python3 wrap_docstring.py draft.yaml vpn.ipsec.site_to_site \
    --module vyos_vpn_ipsec_s2s \
    --author "Your Name (@yourhandle)" \
    --version-added "6.3.0" > docstring.yaml
```

The dotted path names only the fields; the draft's `suboptions` levels in
between are followed automatically. Then edit `docstring.yaml` with the
decisions from step 2: rename identity fields, write the module description,
and add the CLI root to the `running_config` example.

Do not add `no_log` here: `ansible-test sanity` rejects it in
`DOCUMENTATION`. It belongs in the argspec, in the next step.

### Step 4: generate argspec.py, and only that

`cli_rm_builder` also generates `facts.py`, `config.py`, `rm_templates.py`
and a module shell. Discard all four. The generated `facts.py` assumes a flat,
single-level resource; for a resource whose argspec does not mirror the CLI
nesting one to one, it fails with a `TypeError` on real data. The other stubs
do not encode the states' behaviour at all.

Install it:

```none
$ ansible-galaxy collection install \
    git+https://github.com/ansible-network/cli_rm_builder.git
```

Write a small playbook to run it:

```yaml
# run.yml
---
- hosts: localhost
  gather_facts: true
  roles:
    - ansible_network.cli_rm_builder.run
```

Current ansible-core needs two small changes to the installed collection:

- in `roles/run/vars/main.yml`, replace `requirements: [black==19.3b0]` with
  `requirements: []`;
- in `roles/scaffold_resource_module/tasks/main.yml`, replace
  `include: template.yml` with `include_tasks: template.yml`, and
  `with_items:` with `loop:`.

Run it into a scratch directory, never into the repository:

```none
$ ansible-playbook -e rm_dest=/tmp/scaffold_out \
    -e collection_org=vyos -e collection_name=vyos -e network_os=vyos \
    -e docstring=docstring.yaml -e resource=vpn_ipsec_s2s run.yml
```

Copy only `argspec.py` into the repository. Then add `"no_log": True` to the
fields confirmed as secrets in step 2, with a comment, since it has to be
added again whenever the file is regenerated. Register the resource in
`facts/facts.py` (`FACT_RESOURCE_SUBSETS`) and in the subset choices of
`argspec/facts/facts.py`.

To change the argspec later, edit the docstring, run the scaffold again and
copy `argspec.py` again. Do not edit `argspec.py` independently of the
docstring.

### Step 5: write the rest by hand

Write the module shell, `facts.py`, `config.py` and `rm_templates.py` by
hand, starting from a working module in this collection rather than from the
generated stubs.

**The module shell** starts with `#!/usr/bin/python` as its very first line,
then `DOCUMENTATION`, `EXAMPLES` and `RETURN`, and a `main()` with
`AnsibleModule(argument_spec=..., mutually_exclusive=[["config",
"running_config"]], required_if=[...], supports_check_mode=True)`.

**The PARSERS** are written against the real fixture from step 1. Then check
them:

```none
$ python3 check_parsers_against_fixture.py \
    rm_templates/vpn_ipsec_s2s.py fixture.cfg
```

Every fixture line must match exactly one parser. Four problems that check
cannot find:

- `setval` must use the flat variable names that `config.py` passes in. A
  nested or dotted reference does not raise an error; it renders nothing,
  and the command is silently dropped.
- The template class must override the negation prefix. The default is
  `no`, as on Cisco-style devices; VyOS uses `delete`:

  ```python
  class Vpn_ipsec_s2sTemplate(NetworkTemplate):
      def __init__(self, lines=None, module=None):
          prefix = {"set": "set", "remove": "delete"}
          super(Vpn_ipsec_s2sTemplate, self).__init__(
              lines=lines, tmplt=self, module=module, prefix=prefix,
          )
  ```

  Without it, every negated command comes out as `no vpn ipsec ...`.
- Every parser of a named item must set the item's identity field
  (`"name": "{{ name }}"`), not only the parser for the bare tag line. VyOS
  omits the bare tag line as soon as the item has any field set, so in real
  output it practically never appears.
- A documented field can have no parser at all, if the fixture never
  contained it. Compare the docstring's fields with the parser names from
  time to time.

**facts.py** has an explicit `process_facts()` per field, as in
`vyos_logging_global` and `vyos_ha`. If the parsers' results are nested under
a CLI wrapper that the argspec's `config` does not have, `process_facts()`
strips it. `gathered` and `parsed` both use this path.

**config.py** branches explicitly per state, as in `vyos_ha` and `vyos_nat`.
See the reference for `replaced` and `overridden`, `dict_merge`, booleans and
multi-value lists. Before moving on, test all states: idempotency in every
state, creating items from scratch, `replaced` touching only named items,
`overridden` removing unnamed items, and `deleted` with and without
`config:`.

### Step 6: unit tests

Use one test file and as few fixtures as possible: vary `want`, and select a
fixture with a `filename=` override instead of one fixture per scenario.
Cover every state, adding and removing elements of a multi-value list, at
least one boolean field, and a test that creates a new item with a nested
field from scratch, not only tests that change an item already in the
fixture (see {ref}`vyos-modules-tested-code-path`).

### Step 7: integration tests

Mirror the structure of an existing module's tests. Compute the expected
`commands` and `after` values by running your `config.py` logic in a scratch
script; do not derive them by hand. If the module depends on configuration
owned by another module, such as a shared profile name or an interface that
must exist, create and remove it in the target's own `_populate.yaml` and
`_remove_config.yaml`, instead of relying on another test run.

### Step 8: sanity, pre-commit and a real device

All four checks find different problems; none replaces another:

- `pre-commit`, on every commit: formatting, import order, whitespace,
  regenerated documentation.
- `ansible-test sanity`: argspec and docstring drift, missing descriptions,
  `no_log` in the wrong place, undocumented parameters, missing
  `__init__.py` files.
- Unit tests: the logic, against a mocked device.
- Integration tests, against a real or containerised device: the actual
  commands, the facts format and commit behaviour, including requirements no
  schema describes.

Passing `pre-commit` does not mean `ansible-test sanity` passes. Test on a
real device even when everything else passes: it finds bugs that unit tests
miss, and requirements between fields that only appear at commit time.

## Reference: things that go wrong

(vyos-modules-replaced-overridden)=

### replaced and overridden

When an attribute is missing inside a named item, both `replaced` and
`overridden` remove or reset it. When a whole item is missing from `want`,
`replaced` leaves it alone and `overridden` removes it. Getting this
backwards means a `replaced` task that names one item can delete unrelated
configuration.

Global scalar fields, such as a single on/off flag, have no named item to
scope by, so both `replaced` and `overridden` reset them when they are
omitted.

### dict_merge ordering

For `merged`, convert lists to dictionaries keyed by name before calling
`dict_merge(have, want)`. `dict_merge` concatenates plain lists, duplicating
entries; it only merges matching items once both sides are dictionaries.

### Boolean fields

A field set to `False` in `want` is not the same as a field that is not
mentioned. Under `merged`, enforce an explicit `False` and leave an omitted
field alone. Check `field in want`, not `want.get(field)`.

### Multi-value fields

A list of IDs or interface names needs one command per added or removed
element, the set difference between `want` and `have`, never one command
with the whole list as a value.

### deleted, with and without config

Without `config:`, delete everything the module manages. With `config:`,
delete only what is named, down to a single element of a multi-value list.
This needs its own code path in `config.py`; it does not follow from the
`replaced` and `overridden` logic.

(vyos-modules-tested-code-path)=

### A field in a test is not a tested code path

A bug that silently dropped two commands passed 20 unit tests, because every
test touching the parent item either omitted the broken field or deleted the
whole item, never rendering the field on its own. For each nested field, at
least one test must create the parent item from scratch with that field set.

### List ordering

Multi-value lists have no guaranteed order between runs. Sort both sides
before comparing in unit tests; use Jinja's `sort` filters in integration
tests. If a failure comes and goes, run the suite several times to tell a
real failure from an ordering effect.

### no_log in test output

A field with `no_log: True` comes back from `gathered` and facts as the
string `VALUE_SPECIFIED_IN_NO_LOG_PARAMETER`, also from your own lab device.
A plain equality check on a structure containing a secret therefore fails.
Compare secret fields with that string, and the rest field by field.

### Sanity errors and their usual causes

`doc-choices-do-not-match-spec`
: The docstring and the argspec have drifted apart; one was edited without
  regenerating the other.

`invalid-documentation`
: A nested `dict` suboption without a description, or `no_log` in
  `DOCUMENTATION`.

`parameter-type-not-in-doc`, `undocumented-parameter`
: `running_config` is missing from the docstring.

`pep8` line length
: A long, unwrapped description in `DOCUMENTATION`, or a reformatted literal
  over the limit.

### black, flake8 and sanity disagree

`black` leaves a line break inside a literal alone, as an intentional
choice, even when `flake8` then reports a continuation indent (E122). The
repository's `flake8` configuration ignores line length (E501) and `black`
uses 120 characters, while the `pep8` check in `ansible-test sanity` enforces
160 characters. Passing one does not mean passing the other. Check against
the repository's own configuration (`.flake8`, `pyproject.toml`) and run the
real checks, not the tools with their defaults.

### Verify review comments

Treat review comments, human or automated, like any other claim:

- **Still valid**: for example a missing parser, or a missing `__init__.py`
  in a new directory. Python's namespace packages can make a missing
  `__init__.py` seem to work; follow the collection's convention anyway.
- **Valid when written, fixed since**: automated reviews can repeat comments
  that a later commit already addressed. Check the current file.
- **Wrong about the mechanism**: a claim such as "a missing entry in
  `self.parsers` causes lookup failures" can be checked in the
  `ResourceModule` source. The observation can be right while the claimed
  consequence is not; check the mechanism instead of going by the severity
  label.

(vyos-modules-device-constraints)=

### Device-only constraints

Some validation exists only at commit time, in no XML or `node.def` file. A
site-to-site peer, for example, needs at least authentication, a real
`remote-address`, a `local-address` (or `dhcp-interface`) and a tunnel or
VTI; each missing one fails the commit with a clear error, but only if you
try a configuration minimal enough to miss it. Test minimal configurations
on purpose for resources with several required parts.

### Prototype names left behind

If you prototype under a different collection name, search every file for
it before submitting. A leftover import of the prototype collection fails on
the real device with "unable to locate collection", which has nothing to do
with the module's logic.

## Tool details

### Fetching and resolving a definition

`fetch_vyos_xml_definition.py` (Python) and `resolve_vyos_xml.sh` (bash and
`curl`) both fetch a definition from GitHub and resolve its `#include`
lines, giving the same result as vyos-1x's own `scripts/transclude-template`.
An optional second argument selects the branch:

```none
$ python3 fetch_vyos_xml_definition.py vpn_ipsec --branch rolling
$ bash resolve_vyos_xml.sh vpn_ipsec rolling
```

Neither resolves `#include` lines with glob patterns, which vyos-1x supports
but no definition used so far. For those, clone vyos-1x and use
`scripts/transclude-template`.

### parse_xml_definitions.py

Turns a resolved definition into a draft docstring. It handles these VyOS
XML conventions:

- A tag node's identity is the tag argument itself, never one of its
  children. The script always adds an explicit identity field.
- Two sibling nodes with the same name are merged recursively: the second is
  a deliberate partial override of the first (for example a shared `port`
  fragment with a RADIUS-specific default).
- A `<list>` completion next to a `<script>` or `<path>` completion is not
  the complete set of values: `local-address` completes `any` and the local
  IP addresses. No `choices` are generated in that case.
- A `valueHelp` format starting with `u32` or `u64`, or a bare digit per
  value, makes a field an integer, for tag identities and ordinary leaves.
- Numeric range constraints, such as `--range 0-2`, do not become `choices`.
  Whether a narrow range deserves them is a review decision.
- Choice values are written through YAML's own quoting, so values such as
  `yes`, `no` or `on` stay strings instead of turning into booleans.

### wrap_docstring.py

Wraps one subtree of the draft into a complete `DOCUMENTATION` block,
including the `running_config` and `state` options every module has. It
flags fields whose name or description contains `passphrase`, `secret` or
`password`, in the description and on standard error, but does not add
`no_log`: that decision, and the move into `argspec.py`, are yours.

### parse_node_defs.py

The `node.def` counterpart of `parse_xml_definitions.py`, for a directory or
a `find ... -exec cat` dump. Review its output in the same way: it guesses
identity fields, and uses a simple value count to decide on `choices`.

### check_parsers_against_fixture.py

Checks that every fixture line matches exactly one PARSER, with no misses
and no overlaps. It works on the plain `rm_templates` file, without a full
Ansible environment, and exits non-zero on problems, so it can run in CI. It
also lists parsers that matched nothing, which may just mean the fixture
lacks an optional field.
