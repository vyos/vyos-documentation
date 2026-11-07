(contributing-vyos-rest-modules)=

# Building a vyos.rest module

This guide is for adding a module to the vyos.rest collection
([repository](https://github.com/vyos/rest.vyos)), which manages VyOS through
its REST API. It is based on the modules already in the collection
(`vyos_system`, `vyos_snmp_server`, `vyos_interfaces`) and on the mistakes
made while building and reviewing them.

Read the concepts and the module anatomy before writing code. The walkthrough
follows. The reference at the end is for when something looks wrong.

If you know the CLI collection, vyos.vyos (see
{ref}`contributing-vyos-vyos-modules`): the ideas are the same, but the
mechanics are much simpler. There is no text parsing and there are no
`rm_templates`. A module is one file, and its argspec drives the conversion
between Ansible parameters and the device's JSON tree.

## Concepts

### How the collection talks to VyOS

Modules never connect over SSH. They use the `httpapi` connection plugin,
which calls the VyOS REST API over HTTPS (see {ref}`vyosapi`). Two calls
matter for resource modules:

`/retrieve` with `op: showConfig`
: Reads the current configuration of a path as a JSON tree.

`/configure` with a list of `{op: set|delete, path: [...]}`
: Applies changes, in one batch per module run.

The API is generic: it has no endpoints per resource, and its OpenAPI
document (`/openapi.json`, `/docs`) only describes `op`, `path` and `value`.
Everything about what a "system" or "interfaces" resource looks like lives in
the module, not in the API.

```{image} /_static/images/ansible-rest-module-run.webp
:alt: One module run - retrieve, compute commands, configure, save, report
:align: center
```

One module run reads the current tree, works out the commands locally, applies
them in one batch, then saves and reports.

### want and have

`want` is what the playbook asks for; `have` is the device's current tree for
the module's base path. The module converts both to the same device-shaped
dictionary, compares them, and emits the minimal set of `set` and `delete`
commands.

### Device shape and argspec shape

They differ in a few predictable ways:

- Device keys are kebab-case (`host-name`); argspec keys are snake_case
  (`host_name`).
- A value-less leaf on the device is `{}`, a presence flag such as
  `disable`; in the argspec it is a boolean.
- A tag node on the device is a dictionary keyed by identifier
  (`vif: {"200": {...}}`); in the argspec it is a list of dictionaries with a
  key field (`vifs: [{vlan_id: 200}]`).
- A multi-value leaf may come back as a bare string when it has one value;
  in the argspec it is a list.
- Every device value is a string; argspec values are typed (`int`, `bool`).

### States

`merged`
: Add or update what is in `want`; never remove anything.

`replaced`
: Reconcile the entries named in `want`: fields missing from a named entry
  are removed; entries not named are left alone.

`overridden`
: Like `replaced`, and also remove entries that exist on the device but are
  not in `want`.

`deleted`
: Without `config:`, remove everything this module manages. With `config:`,
  remove only what is named.

`gathered`
: Read-only; return the current configuration in argspec shape.

`rendered` and `parsed` are not supported in this collection. In the CLI
collection they translate CLI text, which does not apply to REST.

### dict_op

`dict_op` is the shared diff engine in `plugins/module_utils/vyos.py`. Given
`want`, `have` and a base path, it returns command tuples:

`set`
: In `want` but not in `have`. Used in every state.

`delete`
: In `want` and in `have`. Used by `state: absent`-style modules.

`purge`
: In `have` but not in `want`. Used by `replaced`, `overridden` and
  `deleted`.

It normalises `-` and `_` itself, so keys do not need converting before the
comparison, but it cannot fix a real rename (`vifs` and `vif`).

### Idempotent

A second identical run must produce no commands and `changed: false`. Most of
the testing exists to prove this.

## Module anatomy

A module is one Python file, plus its tests, a changelog fragment and a
generated documentation page. It reuses shared helpers instead of carrying
its own transport code.

```{image} /_static/images/ansible-rest-module-anatomy.webp
:alt: The module file, its tests and fragment, shared helpers, generated docs
:align: center
```

Blue boxes are the files you write, grey ones the shared code you reuse, and
green ones are generated or checked by tooling.

The files, with `<name>` as the resource:

- `plugins/modules/vyos_<name>.py`: the module.
- `tests/unit/modules/test_vyos_<name>.py`: the unit tests.
- `tests/unit/fixtures/<name>_running.json`: the test fixture.
- `tests/unit/modules/base.py`: the fixture loader (exists already).
- `tests/integration/targets/vyos_<name>/`: the integration target, with
  `tasks/httpapi.yaml` and `tests/httpapi/*.yaml`.
- `changelogs/fragments/<name>.yml`: the changelog fragment.
- `docs/vyos.rest.vyos_<name>_module.rst`: the generated documentation page.
- `plugins/module_utils/vyos.py`, `plugins/module_utils/vyos_rest.py`: the
  shared helpers.
- `plugins/httpapi/vyos.py`: transport and authentication.

Inside the module, both sides are converted to the same device-shaped
dictionary, guided by `ARGUMENT_SPEC`, and compared by `dict_op` inside
`build_commands`:

```{image} /_static/images/ansible-rest-data-flow.webp
:alt: want and have both converted via ARGUMENT_SPEC, then compared by dict_op
:align: center
```

The module is deliberately thin. Anything that can be derived from
`ARGUMENT_SPEC` is derived from it, so adding a field is normally an edit to
the argspec and its documentation, nothing more.

Three existing modules show the three shapes you will meet:

`vyos_system`
: Flat scalars and lists under one path. Read it for the minimum: `dict_op`
  called directly, `owned_config` for before and after.

`vyos_snmp_server`
: Nested dictionaries and keyed lists. Read it for the generic walker
  (`_spec_to_device`, `_device_to_spec`), `_DEVICE_RENAMES`, the keyed-list
  helpers and write-only credentials.

`vyos_interfaces`
: A keyed list whose entries are shared with another module. Read it for the
  scoped purge, the `enabled`/`disable` inversion and key field handling.

## Walkthrough

### Step 0: design

- **Scope.** Decide which configuration paths the module owns. Check whether
  another module already writes into the same device node. If it does, you
  share a container; read {ref}`vyos-rest-shared-containers` before
  designing.
- **Name.** Leave out generic container words such as `protocols` or
  `service`, unless the bare name is ambiguous. Check the existing module
  names first.
- **Template.** Pick the closest existing module from the three above and
  copy its structure instead of starting blank.

### Step 1: find the node in the schema, then capture real data

The authoritative description of the configuration tree is the XML interface
definitions in vyos-1x (see {ref}`development`, "XML for CLI definitions").
Look the path up with `schema_lookup.py` (see
{ref}`vyos-rest-schema-lookup`):

```none
$ git clone https://github.com/vyos/vyos-1x   # the branch for your VyOS version
$ python3 schema_lookup.py vyos-1x system --only host-name,domain-name --yaml
```

It prints each child's kind (leaf, tag node, node), whether it is multi-value
or a presence flag, defaults and constraints, and a draft argspec fragment.
Treat the output as a lookup, not a design: the schema does not say which
fields your module should own.

Then capture real device JSON for the same path; it becomes the test fixture.
The request has the same shape the `httpapi` plugin sends:

```none
$ curl -sk -X POST https://<device>/retrieve \
    --data-urlencode 'data={"op":"showConfig","path":["system"]}' \
    --data-urlencode "key=$VYOS_API_KEY"
```

Configure every field you plan to support on a lab device first, so the
capture is complete. A second capture later means checking everything built
against the first one again.

### Step 2: write ARGUMENT_SPEC and DOCUMENTATION together

Define `ARGUMENT_SPEC` as one complete literal block, and take any nested
`options` dictionaries you need from it afterwards, not the other way round.
`DOCUMENTATION` must match it exactly (types, choices, defaults, required);
the `validate-modules` sanity test enforces this.

Rules that keep the rest of the module simple:

- A keyed list marks exactly one suboption `required: true`. That field is
  the entry's identity, and the code derives it from the argspec.
- Do not copy schema defaults into the argspec for optional fields. A
  default makes the field part of `want` on every run, which changes what
  `replaced` removes. The usual exception is a boolean such as `enabled`.
- Keep `choices` for small, stable value sets. For large or growing sets,
  such as `speed`, compare with the schema from time to time: on the rolling
  branch, the schema's `speed` values go up to 100000, while the
  `vyos_interfaces` choices stop at 10000.
- Mark secrets `no_log: true`.

### Step 3: device mapping

Most fields need nothing. Declare only what the structure cannot infer, in a
small map near the top of the file:

```python
_DEVICE_RENAMES = {"vifs": "vif"}     # argspec name -> device name
```

Two special cases recur:

- **Inverted flags.** The argspec has `enabled` (default `true`); the device
  has a value-less `disable` leaf that exists only when disabled. Handle this
  explicitly in both directions.
- **Tag nodes.** A keyed list becomes a dictionary keyed by the identity
  field, with the key as a string. When reading, cast the key back to the
  argspec type, for example `int` for `vlan_id`.

### Step 4: build_commands()

Keep command building in one function that takes `(config, raw_have, state)`
and returns a list of `("set" | "delete", path)` tuples. No device access
inside it, so unit tests can call it directly.

`merged`
: `dict_op(..., "set")`.

`replaced`
: For each named entry: purge, then set.

`overridden`
: Purge entries not in `want`, then as `replaced` for the rest.

`deleted`
: Purge the named entries, or all of them without `config:`.

`merged` also needs one purge-style step: removing a stale `disable` leaf
when the task says `enabled: true`. Restrict that step to entries the task
actually lists (see {ref}`vyos-rest-merged-unlisted`).

```{image} /_static/images/ansible-rest-build-commands.webp
:alt: The steps build_commands runs for each state
:align: center
```

Every purge removes leaves only, never a container another module also
writes into.

### Step 5: main()

Keep `main()` short. The logic lives in the functions above it, so unit tests
can call them without a device. The control flow is fixed:

```{image} /_static/images/ansible-rest-main-flow.webp
:alt: Control flow of main()
:align: center
```

Apart from `gathered`, every exit path returns `before`, so check-mode and
no-change runs report the same shape as a real change.

### Step 6: documentation block layout

The order matters to the sanity tests: the licence header comment,
`from __future__` and `__metaclass__`, then `DOCUMENTATION`, `EXAMPLES` and
`RETURN`, and only then the other imports. Do not add `docs/*.rst` by hand;
the `update-docs` pre-commit hook generates them.

### Step 7: unit tests

Use one test file and one realistic fixture,
`tests/unit/fixtures/<name>_running.json`, loaded with `load_fixture`. Do not
add a second loader or helper.

- Realistic tests use the fixture: parsing it into argspec shape, and the
  idempotency check for each state (`build_commands(have, fixture, state)`
  returns `[]` for `merged`, `replaced` and `overridden`).
- Narrow tests of single functions use small inline dictionaries.

Cover every state, idempotency, the conversion helpers in both directions,
and each edge case from the reference that applies to your module. Run
`ansible-test units --docker --python 3.12`.

### Step 8: integration tests

Follow an existing target. Provide `merged`, `replaced`, `overridden`,
`deleted`, `gathered` and `rtt`. Each state test applies a configuration,
asserts `changed`, repeats the same task, and asserts `changed == false` and
`commands == []`. Use YAML anchors to repeat the task exactly.

Run them with
`ansible-test network-integration --inventory <inv> vyos_<name>`. Read
{ref}`vyos-rest-destructive-tests` before writing any cleanup.

### Step 9: sanity, lint and changelog

Run `ansible-test sanity` (pylint, validate-modules, pep8, yamllint and
others). CI also runs ansible-lint, a changelog check and a collection build
and import.

Add `changelogs/fragments/<name>.yml`, for example:

```yaml
minor_changes:
  - vyos_<name> - new module to manage <what> using the REST API.
```

### Step 10: test against a real device

Do it even when everything above passes. Two bugs in this collection, a
`name` field emitted as a device command and VIFs re-enabled by `merged`,
got past unit tests that only checked that the expected commands were
present. Make tests also assert that unexpected commands are absent
(`assertFalse(any("name" in c[1] for c in cmds))`), and compare the device's
`gathered` output with what you configured.

## Reference: things that go wrong

(vyos-rest-shared-containers)=

### Shared containers

Some device nodes hold fields owned by two modules. A VIF has `description`
and `mtu`, owned by `vyos_interfaces`, and `address`, owned by
`vyos_l3_interfaces`, in the same node. A generic purge that finds the whole
container missing from `want` emits one `delete` for the container, which
also removes the other module's fields.

```{image} /_static/images/ansible-rest-shared-containers.webp
:alt: Deleting a shared VIF removes both modules' fields; purging does not
:align: center
```

Never delete a container your module only partly owns; purge its leaves one
by one. The pattern in `vyos_interfaces` adds an empty placeholder to `want`
for every entry present in `have`, so `dict_op` recurses down to the leaves.
Unit tests must use a fixture where the foreign field (`address`) is
present, and assert that no command deletes the container.

(vyos-rest-merged-unlisted)=

### merged must not touch unlisted entries

An early version re-enabled every disabled VIF on the device, including ones
the task never mentioned. Restrict any purge-style step inside `merged` to
entries named in `want`.

### Identity fields are not device leaves

The field that identifies an entry (`name`, `vlan_id`) is part of the path.
If the conversion walker treats it as an ordinary field, it emits a bogus
`delete .../name`. Strip the identity field before converting an entry.

### gathered omits enabled when true

`enabled` only appears, as `false`, when the device has a `disable` leaf.
Ansible does not apply argspec defaults to returned data, so read it with a
default in playbooks and integration tests:
`map(attribute='enabled', default=true)`.

### Tag-node keys are data, not field names

A key such as a user name can contain an underscore. `dict_op` turns unknown
keys from snake_case into kebab-case when creating them, so `admin_user`
would become `admin-user`. Seed the key into `have` first, as
`_seed_tag_node_placeholders` in `vyos_snmp_server` does.

### Write-only credentials

The device never returns plaintext secrets. A `replaced` run that omits the
secret would purge it, and the device may reject the commit. Carry the
existing credential into `want` when the task does not supply a new one.

### The device collapses single values

One child of a tag node may come back as a bare string, several as a list.
Normalise with `to_tag_dict` before comparing.

### Schema defaults and argspec defaults

The schema may say `duplex` defaults to `auto`. Do not put that in the
argspec: it would make the field part of every run. Document the device
default in the option's description instead.

(vyos-rest-destructive-tests)=

### Integration tests are destructive

Tests run against a real device, often the one the connection uses. A
cleanup with `state: deleted` and no `config:` removes the managed fields of
every interface, and for the L3 module their IP addresses, including the
management interface. The connection then fails, and the task waits until it
times out. Always scope setup and cleanup to the objects the test created.
An `overridden` task also purges every interface it does not list, so either
list the management interface in its `config`, or run the test against a
device where it does not matter.

### Sanity errors seen in this collection

`import-before-documentation`
: Imports placed above `DOCUMENTATION`.

`missing-gplv3-license`
: No licence header in the first 20 lines.

`invalid-documentation` about `name`
: The wrong top-level key: modules use `module:`, `httpapi` plugins use
  `name:`.

doc and argspec mismatch
: `DOCUMENTATION` edited without the argspec, or the reverse.

`arguments-renamed` (pylint)
: A base-class method overridden with different parameter names.

`unnecessary-lambda` (pylint)
: `lambda x: d.get(x)` instead of `d.get`.

`replace-urlopen`
: Use `ansible.module_utils.urls.open_url`, not `urlopen`.

### Git and the generated documentation

`docs/*.rst` are generated, so any branch that touches modules conflicts on
them during a rebase. Resolve by taking `main`'s version of each file and let
the pre-commit hook regenerate them; do not merge them by hand. Keep the pull
request to the files you actually changed.

### Check that you are testing the file you edited

`ansible-test` runs against the collection checkout in its own
`ansible_collections/...` path. After an edit, confirm with `grep` that the
change is in the file under that path before trusting a result.

(vyos-rest-schema-lookup)=

## schema_lookup.py

```none
$ python3 schema_lookup.py VYOS1X_DIR PATH... [--only a,b,c] [--yaml]
```

Looks a configuration path up in a vyos-1x checkout and prints each child's
kind, suggested argspec type, default and constraints. `--yaml` adds a draft
argspec fragment. It expands the XML `#include` lines itself, so nothing
needs building. For the four fields `vyos_system` manages:

```none
child          kind      suggest default  constraints / notes
domain-name    leafNode  str     -        validators=fqdn
domain-search  leafNode  list    -        validators=fqdn; elements: str
host-name      leafNode  str     -
name-server    leafNode  list    -        validators=ip-address,interface-exists;
                                          elements: str; several constraints
                                          -- check by hand
```

It does not decide module scope, identity fields, renames, which fields
another module already owns, or whether to keep `choices`. Those are the
design decisions of step 0.

{download}`Download <_include/schema_lookup.py>`

```{literalinclude} _include/schema_lookup.py
:language: python
```

## Checklist before opening a pull request

- Argspec and `DOCUMENTATION` match: `validate-modules` passes.
- All five states are handled, and unit tests cover each.
- Idempotent: the unit and integration idempotency tests pass.
- Shared containers checked: foreign fields present in a fixture, and no
  container delete asserted.
- Unlisted entries are untouched under `merged`: a unit test asserts it.
- Integration cleanup is scoped: no unscoped `deleted` in `always:`.
- A changelog fragment is added, so the CI changelog check passes.
- Real device run: `gathered` after apply matches what you configured.
