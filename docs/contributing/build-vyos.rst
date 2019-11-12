.. _build:

Building VyOS
=============

This will guide you though the process of building a VyOS ISO using Docker_.
This process has been tested on clean installs of Debian Jessie, Stretch, and
Buster.

.. note:: Starting with VyOS 1.2 the release model of VyOS has changed.
   VyOS is now **free as in speech, but not as in beer**. This means
   that while VyOS is still an open source project, the release ISOs are no
   longer free and can only be obtained via subscription, or by contributing to
   the community.

   The source code remains public and an ISO can be built
   using the process outlined here.

Installing Docker_ and prerequisites:

.. code-block:: sh

  $ apt-get update
  $ apt-get install -y apt-transport-https ca-certificates curl \
        gnupg2 software-properties-common
  $ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
  $ add-apt-repository "deb [arch=amd64] \
        https://download.docker.com/linux/debian $(lsb_release -cs) stable"
  $ apt-get update
  $ apt-get install -y docker-ce

To be able to use Docker_, the current non-root user should be added to the
``docker`` group by calling: ``usermod -aG docker yourusername``

.. note:: It is recommended to use that non-root user for the remaining steps.

.. note:: The build process needs to be built on a local file system, building
   on SMB or NFS shares will result in the container failing to build properly!

Build Docker Container
----------------------

The container can built by hand or by fetching the pre-built one from DockerHub.
Using the pre-built VyOS DockerHub organisation (https://hub.docker.com/u/vyos)
will ensure that the container is always up-to-date. A rebuild is triggered once
the container changes (please note this will take 2-3 hours after pushing to
the vyos-build repository).

The container can always be built directly from source:

.. code-block:: sh

  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build
  $ docker build -t vyos/vyos-build docker

.. note: The container is automatically downloaded from Dockerhub if it is not
   found on your local machine when the below command is executed.

.. note: We require one container per build branch, this means that the used
   container in ``crux`` and ``current`` can and will differ once VyOS makes
   the move towards Debian (10) Buster.

.. _build_iso:

Build ISO
---------

After the container is generated either manually or fetched from DockerHub,
a fresh build of the VyOS ISO can begin.

.. code-block:: sh

  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build bash
  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 \
                               --build-by "your@email.tld" \
                               --build-type release --version 1.2.0
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

To select the container you want to run, you need to specify the branch you are
interested in, this can be easily done by selecting the appropriate container
image:

* For VyOS 1.2 (crux) use ``vyos/vyos-build:crux``
* For VyOS 1.3 (equuleus) use ``vyos/vyos-build:crux``
* For our VyOS rolling release you should use ``vyos/vyos-build`` which will
  always refer to the latest image.

This ISO can be customized with the following list of configure options.
The full and current list can be generated with ``./configure --help``:

.. code-block:: sh

  -h, --help            show this help message and exit
  --architecture ARCHITECTURE
                        Image target architecture (amd64 or i586 or armhf)
  --build-by BUILD_BY   Builder identifier (e.g. jrandomhacker@example.net)
  --custom-package CUSTOM_PACKAGES
                        Custom packages to install from repositories
  --build-type BUILD_TYPE
                        Build type, release or development
  --debian-security-mirror DEBIAN_SECURITY_MIRROR
                        Debian security updated mirror
  --version VERSION     Version number (release builds only)
  --debian-mirror DEBIAN_MIRROR
                        Debian repository mirror for ISO build
  --vyos-mirror VYOS_MIRROR
                        VyOS package mirror
  --pbuilder-debian-mirror PBUILDER_DEBIAN_MIRROR
                        Debian repository mirror for pbuilder env bootstrap
  --debug               Enable debug output
  --custom-apt-entry CUSTOM_APT_ENTRY
                        Custom APT entry
  --custom-apt-key CUSTOM_APT_KEY
                        Custom APT key file

The successfully built ISO should now be in the `build/` directory.

Good luck!

.. note:: The build process does not differentiate when building a ``crux`` ISO
   or ``rolling`` image. Make sure to choose the matching container for the
   version of VyOS that is being built.



.. _upstream_packages:

Upstream packages
-----------------

Many base system packages are pulled straight from Debian's main and contrib
repositories, but there are exceptions.

This chapter lists those exceptions and gives you a brief overview what we
have done on those packages. If you only wan't to build yourself a fresh ISO
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
Debian at http://github.com/vyos/keepalived-upstream

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
https://github.com/vyos/vyos-build-kernel/tree/current/patches/kernel and are
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

Accel-PPP used to be an upstream fork for quiet some time but now has been
converted to make use of the upstream source code and build system.

It is build as part of the Kernel Pipeline - read above.

hvinfo
^^^^^^

A fork with packaging changes for VyOS is kept at https://github.com/vyos/hvinfo

The original repo is at https://github.com/dmbaturin/hvinfo

It's an Ada program and requires GNAT and gprbuild for building, dependencies
are properly specified so just follow debuild's suggestions.

Per-file modifications
^^^^^^^^^^^^^^^^^^^^^^

vyos-replace package replaces the upstream dhclient-script with a modified
version that is aware of the VyOS config.

.. _Docker: https://www.docker.com
