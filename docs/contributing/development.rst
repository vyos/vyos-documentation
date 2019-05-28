.. _development:

Development
===========

The source code is hosted on GitHub under VyOS organization `github.com/vyos`_

The code is split into modules. VyOS is composed of multiple individual packages,
some of them are periodically synced with upstream, so keeping the whole source
under a single repository would be very inconvenient and slow. There is now an
ongoing effort to consolidate all VyOS-specific packages into vyos-1x package,
but the basic structure is going to stay the same, just with fewer submodules.

The repository that contains the ISO build script is vyos-build_. The README will
guide you to use the this toplevel repository.

.. _github.com/vyos: https://github.com/vyos
.. _vyos-build: https://github.com/vyos/vyos-build
