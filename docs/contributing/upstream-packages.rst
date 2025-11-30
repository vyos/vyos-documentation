:lastproofread: 2025-11-30

.. _upstream_packages:

#################
Upstream Packages
#################

Many base system packages are pulled straight from Debian's ``main`` and
``contrib`` repositories, but there are exceptions.

This page lists those exceptions and briefly describes changes made to
these packages. If you only want to build a fresh ISO image, you can skip
this section. This information may be useful for a deeper dive into VyOS.

``vyos-netplug``
----------------

VyOS uses a modified version because the upstream release sometimes causes
network interfaces to go down.

Source: https://github.com/vyos/vyos-netplug.

VyOS may switch to ``systemd`` in the future. Building the package does not
require a special procedure.

``keepalived``
--------------

``keepalived`` is not updated to newer feature releases between Debian releases.
VyoS builds it from source.

Debian maintains the package in git, but the upstream tarball was imported
without its original commit history. To allow merging new tags, we maintain
a fork with packaging files imported from
Debian: https://github.com/vyos/keepalived-upstream.

``strongswan``
--------------

VyOS's StrongSWAN build differs from upstream:

- We disable the ``strongswan-nm`` package build because VyOS does not use
  NetworkManager.
- We merged patches for DMVPN.

Source: https://github.com/vyos/vyos-strongswan

DMVPN patches were added in this commit:
https://github.com/vyos/vyos-strongswan/commit/1cf12b0f2f921bfc51affa3b81226

VyOS's op-mode scripts use the ``python-vici`` module, which is not included
in Debian's build and is difficult to integrate. VyOS debianizes the module
manually:

1. Install ``stdeb`` from PyPI (for example: ``pip3 install stdeb``).
2. ``cd vyos-strongswan``
3. ``./configure --enable-python-eggs``
4. ``cd src/libcharon/plugins/vici/python``
5. ``make``
6. ``python3 setup.py --command-packages=stdeb.command bdist_deb``

The package is created in the ``deb_dist`` directory.

``mdns-repeater``
-----------------

This package does not exist in Debian. VyOS maintains a debianized fork at
https://github.com/vyos/mdns-repeater.

No special build procedure is required.

``udp-broadcast-relay``
-----------------------

This package does not exist in Debian. VyOS maintain a debianized fork at
https://github.com/vyos/udp-broadcast-relay.

No special build procedure is required.

``hvinfo``
----------

A fork with packaging changes for VyOS is available
at https://github.com/vyos/hvinfo.

The original repository is at https://github.com/dmbaturin/hvinfo.

It is an Ada program and requires GNAT and ``gprbuild``. Dependencies are
properly specified; follow the suggestions from ``debuild``.
