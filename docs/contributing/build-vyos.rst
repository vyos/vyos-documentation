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

.. code-block:: none

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
   VirtualBox Drive Share is also not an option as block device operations
   are not implemented and the drive is always mounted as "nodev"

Build Docker Container
----------------------

The container can built by hand or by fetching the pre-built one from DockerHub.
Using the pre-built VyOS DockerHub organisation (https://hub.docker.com/u/vyos)
will ensure that the container is always up-to-date. A rebuild is triggered once
the container changes (please note this will take 2-3 hours after pushing to
the vyos-build repository).

The container can always be built directly from source:

.. code-block:: none

  $ git clone -b current --single-branch https://github.com/vyos/vyos-build
  $ cd vyos-build
  $ docker build -t vyos/vyos-build docker

.. note:: The container is automatically downloaded from Dockerhub if it is not
   found on your local machine when the below command is executed.

.. note:: We require one container per build branch, this means that the used
   container in ``crux`` and ``current`` can and will differ once VyOS makes
   the move towards Debian (10) Buster.

.. _build_iso:

Build ISO
---------

After the container is generated either manually or fetched from DockerHub,
a fresh build of the VyOS ISO can begin.

.. code-block:: none

  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build bash
  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 \
                               --build-by "your@email.tld" \
                               --build-type release --version 1.2.0
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

.. note:: Attempting to use the docker build image on MacOS or Windows will fail
   as docker does not expose all the filesystem feature required to the container.
   Building within a VirtualBox server on Mac or Windows is however possible.

To select the container you want to run, you need to specify the branch you are
interested in, this can be easily done by selecting the appropriate container
image:

* VyOS 1.2 (crux) use ``vyos/vyos-build:crux``
* VyOS rolling release you should use ``vyos/vyos-build`` which will always
  refer to the latest image.

Customisation
^^^^^^^^^^^^^

This ISO can be customized with the following list of configure options.
The full and current list can be generated with ``./configure --help``:

.. code-block:: none

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

Development
^^^^^^^^^^^

If you are brave enough to build yourself an ISO image containing any modified
package from our GitHub organisation - this is the place to be.

Building an ISO with a customized package is in no way different then building
a regular (customized or not) ISO image. Simply place your modified `*.deb`
package inside the `packages` folder within `vyos-build`. You may need to create
the folder in advance.

Troubleshooting
^^^^^^^^^^^^^^^

Debian APT is not very verbose when it comes to errors. If your ISO build breaks
for whatever reason and you supect its a problem with APT dependencies or
installation you can add this small patch which increases the APT verbosity
during ISO build.

.. code-block:: Python

  diff --git i/scripts/live-build-config w/scripts/live-build-config
  index 1b3b454..3696e4e 100755
  --- i/scripts/live-build-config
  +++ w/scripts/live-build-config
  @@ -57,7 +57,8 @@ lb config noauto \
           --firmware-binary false \
           --updates true \
           --security true \
  -        --apt-options "--yes -oAcquire::Check-Valid-Until=false" \
  +        --apt-options "--yes -oAcquire::Check-Valid-Until=false -oDebug::BuildDeps=true -oDebug::pkgDepCache::AutoInstall=true \
  +                             -oDebug::pkgDepCache::Marker=true -oDebug::pkgProblemResolver=true -oDebug::Acquire::gpgv=true" \
           --apt-indices false
           "${@}"
   """


.. _build_packages:

Build packages
--------------

VyOS requires a bunch of packages which are VyOS specific and thus can not be
found in any Debian Upstream mirrror. Those packages can be found at the VyOS
GitHub project (https://github.com/vyos) and there is a nice helper script
available to build and list those individual packages.

`scripts/build-packages` provides an easy interface to automate the process
of building all VyOS related packages that are not part of the upstream Debian
version. Execute it in the root of the `vyos-build` directory to start
compilation.

.. code-block:: none

  $  scripts/build-packages -h
  usage: build-packages [-h] [-c | -k | -f] [-v] [-l] [-b BUILD [BUILD ...]]
                        [-p] [--blacklist BLACKLIST [BLACKLIST ...]]

  optional arguments:
    -h, --help            show this help message and exit
    -c, --clean           Re-clone required Git repositories
    -k, --keep            Keep modified Git repositories
    -f, --fetch           Fetch sources only, no build
    -v, --verbose         Increase logging verbosity for each occurance
    -l, --list-packages   List all packages to build
    -b BUILD [BUILD ...], --build BUILD [BUILD ...]
                          Whitespace separated list of packages to build
    -p, --parallel        Build on all CPUs
    --blacklist BLACKLIST [BLACKLIST ...]
                          Do not build/report packages when calling --list

Git repositoriers are automatically fetched and build on demand. If you want to
work offline you can fetch all source code first with the `-f` option.

The easiest way to compile is with the above mentioned Docker
container, it includes all dependencies for compiling supported packages.

.. code-block:: none

  $ docker run --rm -it -v $(pwd):/vyos -w /vyos \
               --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
               vyos-builder scripts/build-packages

.. note:: `--sysctl net.ipv6.conf.lo.disable_ipv6=0` is required to build the
   `vyos-strongswan` package

.. note::  Prior to executing this script you need to create or build the Docker
   container and checkout all packages you want to compile.

Building single package(s)
^^^^^^^^^^^^^^^^^^^^^^^^^^

To build a single package use the same script as above but specify packages with
`-b`:

Executed from the root of `vyos-build`

.. code-block:: none

  $ docker run --rm -it -v $(pwd):/vyos -w /vyos/packages/PACKAGENAME \
               --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
               vyos-builder scripts/build-packages -b <package>

.. note:: `--sysctl net.ipv6.conf.lo.disable_ipv6=0` is only needed when
   building `vyos-strongswan` and can be ignored on other packages.

.. note:: `vyos-strongswan` will only compile on a Linux system, running on
   macOS or Windows might result in a unittest deadlock (it never exits).

Building single packages from your own repositories
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can also build packages that are not from the default git repositories,
for example from your own forks of the official vyos repositories.

First create a directory "packages" at the top level of the vyos-build
repository and clone your package into it (creating a subdirectory with the
package contents). Then checkout the correct branch or commit you want to build
before building the package.

Example using `git@github.com:myname/vyos-1x.git` repository to build vyos-1x:

.. code-block:: none

  $ mkdir packages
  $ cd packages
  $ git clone git@github.com:myname/vyos-1x.git
  $ cd ..
  $ docker run --rm -it -v $(pwd):/vyos -w /vyos/packages/PACKAGENAME \
               --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
               vyos-builder scripts/build-packages -b vyos-1x

.. note:: You need to git pull manually after you commit to the remote and
   before rebuilding, the local repository won't be updated automatically.

.. warning:: Any packages in the packages directory will be added to the iso
   during build, replacing the upstream ones. Make sure you delete them (both
   the source directories and built deb packages) if you want to build an iso
   from purely upstream packages.


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

Per-file modifications
^^^^^^^^^^^^^^^^^^^^^^

vyos-replace package replaces the upstream dhclient-script with a modified
version that is aware of the VyOS config.

.. _Docker: https://www.docker.com
