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

ppp
^^^

Properly renaming PPTP and L2TP interfaces to pptpX and l2tpX from generic and
non-informative pppX requires a patch that is neither in the upstream nor in
Debian.

We keep a fork of Debian's repo at https://github.com/vyos/ppp-debian

The patches for pre-up renaming are:

* https://github.com/vyos/ppp-debian/commit/e728180026a051d2a96396276e7e4ae
* https://github.com/vyos/ppp-debian/commit/f29ba8d9ebb043335a096d70bcd07e9

Additionally, there's a patch for reopening the log file to better support
logging to files, even though it's less essential:
https://github.com/vyos/ppp-debian/commit/dd2ebd5cdcddb40230dc4cc43d374055f

The patches were written by Stephen Hemminger back in the Vyatta times.

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

Linux kernel
^^^^^^^^^^^^

In the past a fork of the Kernel source code was kept at the well-known
location of https://github.com/vyos/vyos-kernel - where it is kept for history.

Nowadays the Kernel we use is the upstream source code which is patched
with two additional patches from the good old Vyatta times which never made it
into the mainstream Kernel. The patches can be found here:
https://github.com/vyos/vyos-build-kernel/tree/master/patches/kernel and are
automatically applied to the Kernel by the Jenkins Pipeline which is used to
generate the Kernel binaries.

The Pipeline script not only builds the Kernel with the configuration named
``x86_64_vyos_defconfig`` which is located in the vyos-build-kernel repository,
too - but in addition also builds some Intel out-of-tree drivers, WireGuard
(as long it is not upstreamed) and Accel-PPP.

The ``Jenkinsfile`` tries to be as verbose as possible on each individual build
step.

Linux Firmware
^^^^^^^^^^^^^^

More and more hardware cards require an additional firmware which is not open
source. The Kernel community hosts a special linux-firmware Git repository
with all available binary files which can be loaded by the Kernel.

The ``vyos-build`` repository fetches a specific commit of the linux-firmware
repository and embeds those binaries into the resulting ISO image. This step is
done in the ``data/live-build-config/hooks/live/40-linux-firmware.chroot`` file.

If the firmware needs to be updated it is sufficient to just exchange the Git
commit id we reference in our build.

Intel NIC drivers
^^^^^^^^^^^^^^^^^

We do not make use of the building Intel NIC drivers except for e1000e. Main
reason is that the out of tree Intel drivers seem be perform a bit better,
e.q. have proper receive-side-scaling and multi-queue support.

Drivers are build as part of the Kernel Pipeline - read above.

Accel-PPP
^^^^^^^^^

Accel-PPP used to be an upstream fork for quite some time but now has been
converted to make use of the upstream source code and build system.

It is build as part of the Kernel Pipeline - read above.

hvinfo
^^^^^^

A fork with packaging changes for VyOS is kept at https://github.com/vyos/hvinfo

The original repo is at https://github.com/dmbaturin/hvinfo

It's an Ada program and requires GNAT and gprbuild for building, dependencies
are properly specified so just follow debuild's suggestions.
