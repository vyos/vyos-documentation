---
lastproofread: '2026-09-30'
---

(testing)=

# Testing

VyOS uses automated tests to check CLI behavior, generated service
configuration, and configuration migration. The image build repository runs
these tests in QEMU against an installed VyOS image. The two main suites are
smoketests and config tests.

## Smoketests

Smoketests apply VyOS CLI configuration and check system behavior, such as
whether a service is running or its configuration was rendered as expected.
They are installed by the `vyos-1x-smoketest` package. Include that package in
a custom image build with the `--custom-package vyos-1x-smoketest` option.

In the `vyos-build` repository, `make test` installs the built ISO in a QEMU
virtual machine and runs the smoketest suite. The default ISO path is
`build/live-image-<architecture>.hybrid.iso`. See the [VyOS build
guide](build-vyos) for image build setup and requirements.

To run all installed smoketests on a VyOS system, use:

```bash
/usr/bin/vyos-smoketest
```

To run an individual test, execute its script. For example:

```bash
/usr/libexec/vyos/tests/smoke/cli/test_protocols_bgp.py
```

Python's `-k` option selects matching test names when supported by the test
script:

```bash
/usr/libexec/vyos/tests/smoke/cli/test_protocols_bgp.py -k test_bgp_02_neighbors
```

### Interface tests

Some interface tests use all available interfaces by default. Tests that
support the `TEST_ETH` environment variable can be restricted to named
interfaces. For example:

```bash
TEST_ETH="eth1 eth2" /usr/libexec/vyos/tests/smoke/cli/test_interfaces_bonding.py
```

The variable is honored only by tests that explicitly read it. Check the test
script before relying on it to limit which interfaces a test changes.

## Configuration and migration tests

Config tests load sample configurations, run configuration migration, commit
the result, and check that expected configuration commands are present. The
test inputs are installed under
`/usr/libexec/vyos/tests/configs/`; corresponding expected command lists are
under `/usr/libexec/vyos/tests/configs/assert/`. Each input needs a matching
assert file. The checks require listed commands to appear in the resulting
configuration; they do not require an exact match of every generated command.

In `vyos-build`, `make testc` runs these tests in QEMU against the built ISO.
To run the suite directly on a VyOS system, use:

```bash
/usr/bin/vyos-configtest
```

The configuration files may require prerequisites, such as generated PKI
objects. The QEMU test harness prepares test material before running the suite.
When running tests directly, check the relevant configuration and test setup
first.

## Test environment

Smoketests and config tests make configuration changes and may disrupt network
connectivity. Run them in the QEMU test environment or on a disposable lab
system. Do not run them on a production router or a system whose management
connection must remain available.

For implementation details, see the [VyOS smoketest sources][smoketest-sources]
and the [`vyos-build` test targets][build-test-targets].

[smoketest-sources]: https://github.com/vyos/vyos-1x/tree/rolling/smoketest
[build-test-targets]: https://github.com/vyos/vyos-build/blob/rolling/Makefile
