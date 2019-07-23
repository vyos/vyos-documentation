.. _development:

Upstream packages
=================

Many base system packages are pulled straight from Debian's main and contrib repositories, but there are exceptions.

vyos-netplug
------------

Due to issues in the upstream version that sometimes set interfaces down, a modified version is used.

The source is at https://github.com/vyos/vyos-netplug

In the future, we may switch to using systemd infrastructure instead.

Building it doesn't require a special procedure.

keepalived
----------

Keepalived normally isn't updated to newer feature releases between Debian versions, so we are building it from source.

Debian does keep their package in git, but it's upstream tarball imported into git without its original commit history.
To be able to merge new tags in, we keep a fork of the upstream repository with packaging files imported from Debian
at http://github.com/vyos/keepalived-upstream

strongswan
----------

Our StrongSWAN build differs from the upstream:

- strongswan-nm package build is disabled since we don't use NetworkManager
- Patches for DMVPN are merged in

The source is at https://github.com/vyos/vyos-strongswan

DMVPN patches are added by this commit: https://github.com/vyos/vyos-strongswan/commit/1cf12b0f2f921bfc51affa3b81226d4a3e9138e7

Our op mode scripts use the python-vici module, which is not included in Debian's build,
and isn't quite easy to integrate in that build. For this reason we debianize that module by hand now,
using this procedure:

0. Install https://pypi.org/project/stdeb/
1. `cd vyos-strongswan`
2. `./configure --enable-python-eggs`
3. `cd src/libcharon/plugins/vici/python`
4. `make`
5. `python3 setup.py --command-packages=stdeb.command bdist_deb`

The package ends up in deb_dist dir.

ppp
---

Properly renaming PPTP and L2TP interfaces to pptpX and l2tpX from generic and non-informative pppX requires a patch
that is neither in the upstream nor in Debian.

We keep a fork of Debian's repo at https://github.com/vyos/ppp-debian

The patches for pre-up renaming are:

* https://github.com/vyos/ppp-debian/commit/e728180026a051d2a96396276e7e4ae022899e2d
* https://github.com/vyos/ppp-debian/commit/f29ba8d9ebb043335a096d70bcd07e9635bba2e3

Additionally, there's a patch for reopening the log file to better support logging to files, even though it's less essential:
https://github.com/vyos/ppp-debian/commit/dd2ebd5cdcddb40230dc4cc43d374055ff374711

The patches were written by Stephen Hemminger back in the Vyatta times.

mdns-repeater
-------------

This package doesn't exist in Debian. A debianized fork is kept at https://github.com/vyos/mdns-repeater

No special build procedure is required.

udp-broadcast-relay
-------------------

This package doesn't exist in Debian. A debianized fork is kept at https://github.com/vyos/udp-broadcast-relay

No special build procedure is required.

Linux kernel
------------

TBD

Linux firmware
--------------

TBD

Intel drivers
-------------

TBD

accel-ppp
---------

accel-ppp has been packaged for the use with vyos, due to the kernel dependencies for its modules.

* https://github.com/vyos/vyos-accel-ppp

Build instructions are being kept up to date on the repos Readme.

hvinfo
------

A fork with packaging changes for VyOS is kept at https://github.com/vyos/hvinfo

The original repo is at https://github.com/dmbaturin/hvinfo

It's an Ada program and requires GNAT and gprbuild for building, dependencies are properly specified
so just follow debuild's suggestions.

Per-file modifications
------------------------

vyos-replace package replaces the upstream dhclient-script with a modified version that is aware of the VyOS config.
