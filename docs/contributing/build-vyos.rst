.. _build:

##########
Build VyOS
##########

*************
Prerequisites
*************

There are different ways you can build VyOS.

Building using a :ref:`build_docker` container, although not the only way, is the
easiest way as all dependencies are managed for you. However, you can also
set up your own build machine and run a :ref:`build_native`.

.. note:: Starting with VyOS 1.2 the release model of VyOS has changed. VyOS
   is now **free as in speech, but not as in beer**. This means that while
   VyOS is still an open source project, the release ISOs are no longer free
   and can only be obtained via subscription, or by contributing to the
   community.

   The source code remains public and an ISO can be built using the process
   outlined in this chapter.

This will guide you though the process of building a VyOS ISO using Docker_.
This process has been tested on clean installs of Debian Jessie, Stretch, and
Buster.

.. _build_docker:

Docker
======

Installing Docker_ and prerequisites:

.. code-block:: none

  $ sudo apt-get update
  $ sudo apt-get install -y apt-transport-https ca-certificates curl gnupg2 software-properties-common
  $ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
  $ sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
  $ sudo apt-get update
  $ sudo apt-get install -y docker-ce

To be able to use Docker_ without ``sudo``, the current non-root user must be
added to the ``docker`` group by calling: ``sudo usermod -aG docker
yourusername``.

.. hint:: Doing so grants privileges equivalent to the ``root`` user! It is
   recommended to remove the non-root user from the ``docker`` group after
   building the VyOS ISO. See also `Docker as non-root`_.

.. note:: The build process needs to be built on a local file system, building
   on SMB or NFS shares will result in the container failing to build properly!
   VirtualBox Drive Share is also not an option as block device operations
   are not implemented and the drive is always mounted as "nodev"

Build Container
---------------

The container can built by hand or by fetching the pre-built one from DockerHub.
Using the pre-built containers from the `VyOS DockerHub organisation`_ will
ensure that the container is always up-to-date. A rebuild is triggered once the
container changes (please note this will take 2-3 hours after pushing to the
vyos-build repository).

.. note: If you are using the pre-built container, it will be automatically
   downloaded from DockerHub if it is not found on your local machine when
   you build the ISO.

Dockerhub
^^^^^^^^^

To manually download the container from DockerHub, run:

.. code-block:: none

  $ docker pull vyos/vyos-build:crux     # For VyOS 1.2
  $ docker pull vyos/vyos-build:current  # For rolling release

Build from source
^^^^^^^^^^^^^^^^^

The container can also be built directly from source:

.. code-block:: none

  # For VyOS 1.2 (crux)
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build
  # For VyOS 1.3 (equuleus, current)
  $ git clone -b current --single-branch https://github.com/vyos/vyos-build

  $ cd vyos-build
  $ docker build -t vyos/vyos-build:crux docker # For VyOS 1.2
  $ docker build -t vyos/vyos-build docker      # For rolling release

.. note:: Since VyOS has switched to Debian (10) Buster in its ``current`` branch,
   you will require individual container for `current` and `crux` builds.

Tips and Tricks
---------------

You can create yourself some handy Bash aliases to always launch the latest -
per release train (`current` or `crux`) - container. Add the following to your
``.bash_aliases`` file:

.. code-block:: none

  alias vybld='docker pull vyos/vyos-build:current && docker run --rm -it \
      -v "$(pwd)":/vyos \
      -v "$HOME/.gitconfig":/etc/gitconfig \
      -v "$HOME/.bash_aliases":/home/vyos_bld/.bash_aliases \
      -v "$HOME/.bashrc":/home/vyos_bld/.bashrc \
      -w /vyos --privileged --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
      -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
      vyos/vyos-build:current bash'

  alias vybld_crux='docker pull vyos/vyos-build:crux && docker run --rm -it \
      -v "$(pwd)":/vyos \
      -v "$HOME/.gitconfig":/etc/gitconfig \
      -v "$HOME/.bash_aliases":/home/vyos_bld/.bash_aliases \
      -v "$HOME/.bashrc":/home/vyos_bld/.bashrc \
      -w /vyos --privileged --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
      -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
      vyos/vyos-build:crux bash'

Now you are prepared with two new aliases ``vybld`` and ``vybld_crux`` to spwan
your development containers in your current working directory.

.. _build_native:

Native Build
============

To build VyOS natively you require a properly configured build host with the
following Debian versions installed:

- Debian Jessie for VyOS 1.2 (crux)
- Debian Buster for VyOS 1.3 (equuleus, current) - aka the rolling release

To start, clone the repository to your local machine:

.. code-block:: none

  # For VyOS 1.2 (crux)
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build

  # For VyOS 1.3 (equuleus, current)
  $ git clone -b current --single-branch https://github.com/vyos/vyos-build

For the packages required, you can refer to the ``docker/Dockerfile`` file
in the repository_. The ``./configure`` script will also warn you if any
dependencies are missing.

Once you have the required dependencies installed, you may proceed with the
steps described in :ref:`build_iso`.


.. _build_iso:

*********
Build ISO
*********

Now as you are aware of the prerequisites we can continue and build our own
ISO from source. For this we have to fetch the latest source code from GitHub.
Please note as this will differ for both `current` and `crux`.

.. code-block:: none

  # For VyOS 1.2 (crux)
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build

  # For VyOS 1.3 (equuleus, current)
  $ git clone -b current --single-branch https://github.com/vyos/vyos-build

Now a fresh build of the VyOS ISO can begin. Change directory to the ``vyos-build`` directory and run:

.. code-block:: none

  $ cd vyos-build
  # For VyOS 1.2 (crux)
  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:crux bash

  # For VyOS 1.3 (equuleus, current)
  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build bash

Start the build:

.. code-block:: none

  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 --build-by "j.randomhacker@vyos.io"
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

When the build is successful, the resulting iso can be found inside the ``build``
directory as ``live-image-[architecture].hybrid.iso``.

Good luck!

.. hint:: Attempting to use the Docker build image on MacOS will fail as
   Docker does not expose all the filesystem feature required to the container.
   Building within a VirtualBox server on Mac however possible.

.. hint:: Building VyOS on Windows WSL2 with Docker integrated into WSL2 will work
   like a charm. No problems are known so far!

.. _build source:


.. _customize:

Customize
=========

This ISO can be customized with the following list of configure options.
The full and current list can be generated with ``./configure --help``:

.. code-block:: none

  $ ./configure --help
  usage: configure [-h] [--architecture ARCHITECTURE] [--build-by BUILD_BY]
                   [--debian-mirror DEBIAN_MIRROR]
                   [--debian-security-mirror DEBIAN_SECURITY_MIRROR]
                   [--pbuilder-debian-mirror PBUILDER_DEBIAN_MIRROR]
                   [--vyos-mirror VYOS_MIRROR] [--build-type BUILD_TYPE]
                   [--version VERSION] [--build-comment BUILD_COMMENT] [--debug]
                   [--custom-apt-entry CUSTOM_APT_ENTRY]
                   [--custom-apt-key CUSTOM_APT_KEY]
                   [--custom-package CUSTOM_PACKAGE]

  optional arguments:
    -h, --help            show this help message and exit
    --architecture ARCHITECTURE
                          Image target architecture (amd64 or i386 or armhf)
    --build-by BUILD_BY   Builder identifier (e.g. jrandomhacker@example.net)
    --debian-mirror DEBIAN_MIRROR
                          Debian repository mirror for ISO build
    --debian-security-mirror DEBIAN_SECURITY_MIRROR
                          Debian security updates mirror
    --pbuilder-debian-mirror PBUILDER_DEBIAN_MIRROR
                          Debian repository mirror for pbuilder env bootstrap
    --vyos-mirror VYOS_MIRROR
                          VyOS package mirror
    --build-type BUILD_TYPE
                          Build type, release or development
    --version VERSION     Version number (release builds only)
    --build-comment BUILD_COMMENT
                          Optional build comment
    --debug               Enable debug output
    --custom-apt-entry CUSTOM_APT_ENTRY
                          Custom APT entry
    --custom-apt-key CUSTOM_APT_KEY
                          Custom APT key file
    --custom-package CUSTOM_PACKAGE
                          Custom package to install from repositories

.. _build_custom_packages:

Packages
========

If you are brave enough to build yourself an ISO image containing any modified
package from our GitHub organisation - this is the place to be.

Any "modified" package may refer to an altered version of e.g. vyos-1x package
that you would like to test before filing a PullRequest on GitHub.

Building an ISO with any customized package is in no way different then
building a regular (customized or not) ISO image. Simply place your modified
`*.deb` package inside the `packages` folder within `vyos-build`. The build
process will then pickup your custom package and integrate it into your ISO.

Troubleshooting
===============

Debian APT is not very verbose when it comes to errors. If your ISO build breaks
for whatever reason and you supect its a problem with APT dependencies or
installation you can add this small patch which increases the APT verbosity
during ISO build.

.. code-block:: diff

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


Virtualization Platforms
========================

QEMU
----

Run following command after building the ISO image.

.. code-block:: none

  $ make qemu

VMware
------

Run following command after building the QEMU image.

.. code-block:: none

  $ make vmware

.. _build_packages:

********
Packages
********

VyOS itself comes with a bunch of packages which are specific to our system and
thus can not be found in any Debian mirrror. Those packages can be found at the
`VyOS GitHub project`_ in their source format can can easily be compiled into
a custom Debian (`*.deb`) package.

The easiest way to compile your package is with the above mentioned
:ref:`build_docker` container, it includes all required dependencies for
all VyOS related packages.

Assume we want to build the vyos-1x package on our own and modify it to our
needs. We first need to clone the repository from GitHub.

.. code-block:: none

  $ git clone https://github.com/vyos/vyos-1x

Build
=====

Launch Docker container and build package

.. code-block:: none

  # For VyOS 1.3 (equuleus, current)
  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build bash

  # Change to source directory
  $ cd vyos-1x

  # Build DEB
  $ dpkg-buildpackage -uc -us -tc -b

After a minute or two you will find the generated DEB packages next to the vyos-1x
source directory:

.. code-block:: none

  # ls -al ../vyos-1x*.deb
  -rw-r--r-- 1 vyos_bld vyos_bld 567420 Aug  3 12:01 ../vyos-1x_1.3dev0-1847-gb6dcb0a8_all.deb
  -rw-r--r-- 1 vyos_bld vyos_bld   3808 Aug  3 12:01 ../vyos-1x-vmware_1.3dev0-1847-gb6dcb0a8_amd64.deb

Install
=======

To take your newly created package on a test drive you can simply SCP it to a
running VyOS instance and install the new `*.deb` package over the current
running one.

Just install using the following commands:

.. code-block:: none

  vyos@vyos:~$ dpkg --install /tmp/vyos-1x_1.3dev0-1847-gb6dcb0a8_all.deb
  (Reading database ... 58209 files and directories currently installed.)
  Preparing to unpack .../vyos-1x_1.3dev0-1847-gb6dcb0a8_all.deb ...
  Unpacking vyos-1x (1.3dev0-1847-gb6dcb0a8) over (1.3dev0-1847-gb6dcb0a8) ...
  Setting up vyos-1x (1.3dev0-1847-gb6dcb0a8) ...
  Processing triggers for rsyslog (8.1901.0-1) ...

You can also place the generated `*.deb` into your ISO build environment to
include it in a custom iso, see :ref:`build_custom_packages` for more
information.

.. warning:: Any packages in the packages directory will be added to the iso
   during build, replacing the upstream ones. Make sure you delete them (both
   the source directories and built deb packages) if you want to build an iso
   from purely upstream packages.

.. _Docker: https://www.docker.com
.. _`Docker as non-root`: https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user
.. _VyOS DockerHub organisation: https://hub.docker.com/u/vyos
.. _repository: https://github.com/vyos/vyos-build
.. _VyOS GitHub project: https://github.com/vyos
