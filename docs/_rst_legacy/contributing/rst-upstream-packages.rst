.. _upstream_packages:

Upstream packages
-----------------

Many base system packages are pulled straight from Debian's main and contrib
repositories, but there are exceptions.

This chapter lists those exceptions and gives you a brief overview what we
have done on those packages. If you only want to build yourself a fresh ISO
you can completely skip this chapter. It may become interesting once you have
a VyOS deep dive.

vyos-netplug
^^^^^^^^^^^^

Due to issues in the upstream version that sometimes set interfaces down, a
modified version is used.

The source is located at https://github.com/vyos/vyos-netplug

In the future, we may switch to using systemd infrastructure instead. Building
it doesn't require a special procedure.

keepalived
^^^^^^^^^^

Keepalived normally isn't updated to newer feature releases between Debian
versions, so we are building it from source.

Debian does keep their package in git, but it's upstream tarball imported into
git without its original commit history. To be able to merge new tags in, we
keep a fork of the upstream repository with packaging files imported from
Debian at https://github.com/vyos/keepalived-upstream

strongswan
^^^^^^^^^^

Our StrongSWAN build differs from the upstream:

- strongswan-nm package build is disabled since we don't use NetworkManager
- Patches for DMVPN are merged in

The source is at https://github.com/vyos/vyos-strongswan

DMVPN patches are added by this commit:
https://github.com/vyos/vyos-strongswan/commit/1cf12b0f2f921bfc51affa3b81226

Our op mode scripts use the python-vici module, which is not included in
Debian's build, and isn't quite easy to integrate in that build. For this
reason we debianize that module by hand now, using this procedure:

0. Install https://pypi.org/project/stdeb/
1. `cd vyos-strongswan`
2. `./configure --enable-python-eggs`
3. `cd src/libcharon/plugins/vici/python`
4. `make`
5. `python3 setup.py --command-packages=stdeb.command bdist_deb`

The package ends up in deb_dist dir.

mdns-repeater
^^^^^^^^^^^^^

This package doesn't exist in Debian. A debianized fork is kept at
https://github.com/vyos/mdns-repeater

No special build procedure is required.

udp-broadcast-relay
^^^^^^^^^^^^^^^^^^^

This package doesn't exist in Debian. A debianized fork is kept at
https://github.com/vyos/udp-broadcast-relay

No special build procedure is required.

hvinfo
^^^^^^

A fork with packaging changes for VyOS is kept at https://github.com/vyos/hvinfo

The original repo is at https://github.com/dmbaturin/hvinfo

It's an Ada program and requires GNAT and gprbuild for building, dependencies
are properly specified so just follow debuild's suggestions.
