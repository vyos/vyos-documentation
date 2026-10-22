(contributing-ansible-collections)=

# Ansible collections

VyOS is automated with Ansible through three collections. Each has its own
repository, issue tracker label and release cycle; this section explains how to
contribute to them.

- [vyos.vyos](https://github.com/vyos/vyos.vyos) manages VyOS over SSH, using
  the CLI (`network_cli`). It provides resource modules such as
  `vyos_interfaces`, `vyos_bgp_global` or `vyos_vpn_ipsec`, plus generic
  modules such as `vyos_config` and `vyos_command`.
- [vyos.blueprints](https://github.com/vyos/vyos.blueprints) builds on
  vyos.vyos: Ansible roles that implement the configuration blueprints of this
  documentation, plus operational roles for backups and upgrades.

For using the collections, see {ref}`vyos-ansible`. The pages below are for
contributors.

```{toctree}
:maxdepth: 1

vyos-vyos-modules
tools
```

## Where to start

- Each repository's `CONTRIBUTING.md` describes its pull request conventions:
  the contributor licence agreement, commit message format and changelog
  fragments.
- Report bugs and feature requests in the repository's GitHub issues, or on
  [vyos.dev](https://vyos.dev) with the collection's project tag.
- Resource modules are built from the same XML interface definitions that
  generate the VyOS CLI, described in {ref}`development` under
  "XML for CLI definitions". Reading that part first makes the module guides
  easier to follow.
