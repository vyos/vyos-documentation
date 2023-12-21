.. _build:

##########
Build VyOS
##########

*************
Prerequisites
*************

There are different ways you can build VyOS.

Building using a :ref:`build_docker` container, although not the only way,
is the easiest way as all dependencies are managed for you. However, you can
also set up your own build machine and run a :ref:`build_native`.

.. note:: Starting with VyOS 1.2 the release model of VyOS has changed. VyOS
   is now **free as in speech, but not as in beer**. This means that while
   VyOS is still an open source project, the release ISOs are no longer free
   and can only be obtained via subscription, or by contributing to the
   community.

   The source code remains public and an ISO can be built using the process
   outlined in this chapter.

   Due to some differences in the version update and construction process, 
   this page no longer includes content related to VyOS 1.4 and above.

This will guide you though the process of building a VyOS ISO using Docker_.
This process has been tested on clean installs of Debian Bullseye (11) and 
Bookworm (12).

.. _build_docker:

Docker
======

Installing Docker_ and prerequisites:

.. hint:: Due to the updated version of Docker, the following examples may 
   become invalid.

`On Debian`_

.. code-block:: bash

  # Add Docker's official GPG key:
  sudo apt-get update
  sudo apt-get install ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  # Add the repository to Apt sources:
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

`On Ubuntu`_

.. code-block:: bash

  # Add Docker's official GPG key:
  sudo apt-get update
  sudo apt-get install ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg

  # Add the repository to Apt sources:
  echo \
    "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io
    

`On Fedora`_

.. code-block:: bash

  sudo dnf -y install dnf-plugins-core
  sudo dnf config-manager \
      --add-repo \
      https://download.docker.com/linux/fedora/docker-ce.repo
  sudo dnf install -y docker-ce docker-ce-cli containerd.io

`On CentOS and similar`_

.. code-block:: bash

    sudo yum install -y yum-utils
    sudo yum-config-manager \
        --add-repo \
        https://download.docker.com/linux/centos/docker-ce.repo
    sudo yum install -y docker-ce docker-ce-cli containerd.io


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

.. note:: If you are using the pre-built container, it will be automatically
   downloaded from DockerHub if it is not found on your local machine when
   you build the ISO.

Dockerhub
^^^^^^^^^

To manually download the container from DockerHub, run:

.. code-block:: none

  $ docker pull vyos/vyos-build:crux       # For VyOS 1.2
  $ docker pull vyos/vyos-build:equuleus   # For VyOS 1.3

Build from source
^^^^^^^^^^^^^^^^^

The container can also be built directly from source:

.. code-block:: none

  # For VyOS 1.2 (crux)
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build
  # For VyOS 1.3 (equuleus)
  $ git clone -b equuleus --single-branch https://github.com/vyos/vyos-build

  $ cd vyos-build
  $ docker build -t vyos/vyos-build:crux docker      # For VyOS 1.2
  $ docker build -t vyos/vyos-build:equuleus docker  # For VyOS 1.3

.. note:: Since VyOS has switched to Debian (11) Bullseye in its ``current``
   branch, you will require individual container for `current`, `equuleus` and
   `crux` builds.

Tips and Tricks
---------------

You can create yourself some handy Bash aliases to always launch the latest -
per release train (`current`, `equuleus` or `crux`) - container. 
Add the following to your ``.bash_aliases`` file:

.. code-block:: none

  # latest release
  alias vybld='docker pull vyos/vyos-build:current && docker run --rm -it \
      -v "$(pwd)":/vyos \
      -v "$HOME/.gitconfig":/etc/gitconfig \
      -v "$HOME/.bash_aliases":/home/vyos_bld/.bash_aliases \
      -v "$HOME/.bashrc":/home/vyos_bld/.bashrc \
      -w /vyos --privileged --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
      -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
      vyos/vyos-build:current bash'

  # v1.3
  alias vybld_equuleus='docker pull vyos/vyos-build:equuleus && docker run --rm -it \
      -v "$(pwd)":/vyos \
      -v "$HOME/.gitconfig":/etc/gitconfig \
      -v "$HOME/.bash_aliases":/home/vyos_bld/.bash_aliases \
      -v "$HOME/.bashrc":/home/vyos_bld/.bashrc \
      -w /vyos --privileged --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
      -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
      vyos/vyos-build:equuleus bash'

  # v1.2
  alias vybld_crux='docker pull vyos/vyos-build:crux && docker run --rm -it \
      -v "$(pwd)":/vyos \
      -v "$HOME/.gitconfig":/etc/gitconfig \
      -v "$HOME/.bash_aliases":/home/vyos_bld/.bash_aliases \
      -v "$HOME/.bashrc":/home/vyos_bld/.bashrc \
      -w /vyos --privileged --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
      -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
      vyos/vyos-build:crux bash'

Now you are prepared with three new aliases ``vybld``, ``vybld_equuleus``, and 
``vybld_crux`` to spawn your development containers in your current working 
directory.

.. note:: Some VyOS packages (namely vyos-1x) come with build-time tests which
   verify some of the internal library calls that they work as expected. Those
   tests are carried out through the Python Unittest module. If you wan't to
   build the ``vyos-1x`` package (which is our main development package) 
   you need to start your Docker container using the following argument:
   ``--sysctl net.ipv6.conf.lo.disable_ipv6=0``, otherwise those tests 
   will fail.

.. _build_native:

Native Build
============

To build VyOS natively you require a properly configured build host with the
following Debian versions installed:

- Debian Jessie for VyOS 1.2 (crux)
- Debian Buster for VyOS 1.3 (equuleus)

To start, clone the repository to your local machine:

.. code-block:: none

  # For VyOS 1.2 (crux)
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build

  # For VyOS 1.3 (equuleus)
  $ git clone -b equuleus --single-branch https://github.com/vyos/vyos-build
  
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
Please note as this will differ for both `current` and `equuleus`.

.. code-block:: none

  # For VyOS 1.2 (crux)
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build

  # For VyOS 1.3 (equuleus)
  $ git clone -b equuleus --single-branch https://github.com/vyos/vyos-build
  
Now a fresh build of the VyOS ISO can begin. Change directory to the
``vyos-build`` directory and run:

.. code-block:: none

  $ cd vyos-build
  # For VyOS 1.2 (crux)
  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:crux bash

  # For VyOS 1.3 (equuleus)
  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:equuleus bash
  
Start the build:

.. code-block:: none

  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 --build-by "j.randomhacker@vyos.io"
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

When the build is successful, the resulting iso can be found inside the
``build`` directory as ``live-image-[architecture].hybrid.iso``.

Good luck!

.. hint:: Attempting to use the Docker build image on MacOS will fail as
   Docker does not expose all the filesystem feature required to the container.
   Building within a VirtualBox server on Mac however possible.

.. hint:: Building VyOS on Windows WSL2 with Docker integrated into WSL2 will
   work like a charm. No problems are known so far!

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

Linux Kernel
============

The Linux kernel used by VyOS is heavily tied to the ISO build process. The
file ``data/defaults.json`` hosts a JSON definition of the kernel version used
``kernel_version`` and the ``kernel_flavor`` of the kernel which represents the
kernel's LOCAL_VERSION. Both together form the kernel version variable in the
system:

.. code-block:: none

  vyos@vyos:~$ uname -r
  5.10.135-amd64-vyos

.. note::
   ``5.10.135-amd64-vyos`` represents the kernel version at the time the
   documentation was updated for VyOS 1.4 (Sagitta). It may not reflect the
   version used in the latest release. VyOS 1.3 (Equuleus) uses 5.4.x Linux
   kernels. https://phabricator.vyos.net/T3318 tracks Kernel changes for the
   current release.

Other packages (e.g. vyos-1x) add dependencies to the ISO build procedure on
e.g. the wireguard-modules package which itself adds a dependency on the kernel
version used due to the module it ships. This may change (for WireGuard) in
future kernel releases but as long as we have out-of-tree modules.

* WireGuard
* Accel-PPP
* Intel NIC drivers
* Inter QAT

Each of those modules holds a dependency on the kernel version and if you are
lucky enough to receive an ISO build error which sounds like:

.. code-block:: none

  I: Create initramfs if it does not exist.
  Extra argument '4.19.146-amd64-vyos'
  Usage: update-initramfs {-c|-d|-u} [-k version] [-v] [-b directory]
  Options:
   -k version     Specify kernel version or 'all'
   -c             Create a new initramfs
   -u             Update an existing initramfs
   -d             Remove an existing initramfs
   -b directory   Set alternate boot directory
   -v             Be verbose
  See update-initramfs(8) for further details.
  E: config/hooks/live/17-gen_initramfs.chroot failed (exit non-zero). You should check for errors.

The most obvious reasons could be:

* ``vyos-build`` repo is outdated, please ``git pull`` to update to the latest
  release kernel version from us.

* You have your own custom kernel `*.deb` packages in the `packages` folder but
  neglected to create all required out-of tree modules like Accel-PPP,
  WireGuard, Intel QAT, Intel NIC

Building The Kernel
-------------------

The kernel build is quite easy, most of the required steps can be found in the
``vyos-build/packages/linux-kernel/Jenkinsfile`` but we will walk you through
it.

Clone the kernel source to `vyos-build/packages/linux-kernel/`:

.. code-block:: none

  $ cd vyos-build/packages/linux-kernel/
  $ git clone https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git

Check out the required kernel version - see ``vyos-build/data/defaults.json``
file (example uses kernel 4.19.146):

.. code-block:: none

  $ cd vyos-build/packages/linux-kernel/linux
  $ git checkout v4.19.146
  Checking out files: 100% (61536/61536), done.
  Note: checking out 'v4.19.146'.

  You are in 'detached HEAD' state. You can look around, make experimental
  changes and commit them, and you can discard any commits you make in this
  state without impacting any branches by performing another checkout.

  If you want to create a new branch to retain commits you create, you may
  do so (now or later) by using -b with the checkout command again. Example:

    git checkout -b <new-branch-name>

  HEAD is now at 015e94d0e37b Linux 4.19.146

Now we can use the helper script ``build-kernel.sh`` which does all the
necessary voodoo by applying required patches from the
`vyos-build/packages/linux-kernel/patches` folder, copying our kernel
configuration ``x86_64_vyos_defconfig`` to the right location, and finally
building the Debian packages.

.. note:: Building the kernel will take some time depending on the speed and
   quantity of your CPU/cores and disk speed. Expect 20 minutes
   (or even longer) on lower end hardware.

.. code-block:: none

  (18:59) vyos_bld 412374ca36b8:/vyos/vyos-build/packages/linux-kernel [current] # ./build-kernel.sh
  I: Copy Kernel config (x86_64_vyos_defconfig) to Kernel Source
  I: Apply Kernel patch: /vyos/vyos-build/packages/linux-kernel/patches/kernel/0001-VyOS-Add-linkstate-IP-device-attribute.patch
  patching file Documentation/networking/ip-sysctl.txt
  patching file include/linux/inetdevice.h
  patching file include/linux/ipv6.h
  patching file include/uapi/linux/ip.h
  patching file include/uapi/linux/ipv6.h
  patching file net/ipv4/devinet.c
  Hunk #1 succeeded at 2319 (offset 1 line).
  patching file net/ipv6/addrconf.c
  patching file net/ipv6/route.c
  I: Apply Kernel patch: /vyos/vyos-build/packages/linux-kernel/patches/kernel/0002-VyOS-add-inotify-support-for-stackable-filesystems-o.patch
  patching file fs/notify/inotify/Kconfig
  patching file fs/notify/inotify/inotify_user.c
  patching file fs/overlayfs/super.c
  Hunk #2 succeeded at 1713 (offset 9 lines).
  Hunk #3 succeeded at 1739 (offset 9 lines).
  Hunk #4 succeeded at 1762 (offset 9 lines).
  patching file include/linux/inotify.h
  I: Apply Kernel patch: /vyos/vyos-build/packages/linux-kernel/patches/kernel/0003-RFC-builddeb-add-linux-tools-package-with-perf.patch
  patching file scripts/package/builddeb
  I: make x86_64_vyos_defconfig
    HOSTCC  scripts/basic/fixdep
    HOSTCC  scripts/kconfig/conf.o
    YACC    scripts/kconfig/zconf.tab.c
    LEX     scripts/kconfig/zconf.lex.c
    HOSTCC  scripts/kconfig/zconf.tab.o
    HOSTLD  scripts/kconfig/conf
  #
  # configuration written to .config
  #
  I: Generate environment file containing Kernel variable
  I: Build Debian Kernel package
    UPD     include/config/kernel.release
  /bin/sh ./scripts/package/mkdebian
  dpkg-buildpackage -r"fakeroot -u" -a$(cat debian/arch) -b -nc -uc
  dpkg-buildpackage: info: source package linux-4.19.146-amd64-vyos
  dpkg-buildpackage: info: source version 4.19.146-1
  dpkg-buildpackage: info: source distribution buster
  dpkg-buildpackage: info: source changed by vyos_bld <christian@poessinger.com>
  dpkg-buildpackage: info: host architecture amd64
  dpkg-buildpackage: warning: debian/rules is not executable; fixing that
   dpkg-source --before-build .
   debian/rules build
  make KERNELRELEASE=4.19.146-amd64-vyos ARCH=x86         KBUILD_BUILD_VERSION=1 KBUILD_SRC=
    SYSTBL  arch/x86/include/generated/asm/syscalls_32.h

  ...

  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: binaries to analyze should already be installed in their package's directory
  dpkg-shlibdeps: warning: package could avoid a useless dependency if /vyos/vyos-build/packages/linux-kernel/linux/debian/toolstmp/usr/bin/trace /vyos/vyos-build/packages/linux-kernel/linux/debian/toolstmp/usr/bin/perf were not linked against libcrypto.so.1.1 (they use none of the library's symbols)
  dpkg-shlibdeps: warning: package could avoid a useless dependency if /vyos/vyos-build/packages/linux-kernel/linux/debian/toolstmp/usr/bin/trace /vyos/vyos-build/packages/linux-kernel/linux/debian/toolstmp/usr/bin/perf were not linked against libcrypt.so.1 (they use none of the library's symbols)
  dpkg-deb: building package 'linux-tools-4.19.146-amd64-vyos' in '../linux-tools-4.19.146-amd64-vyos_4.19.146-1_amd64.deb'.
   dpkg-genbuildinfo --build=binary
   dpkg-genchanges --build=binary >../linux-4.19.146-amd64-vyos_4.19.146-1_amd64.changes
  dpkg-genchanges: warning: package linux-image-4.19.146-amd64-vyos-dbg in control file but not in files list
  dpkg-genchanges: info: binary-only upload (no source code included)
   dpkg-source --after-build .
  dpkg-buildpackage: info: binary-only upload (no source included)


In the end you will be presented with the kernel binary packages which you can
then use in your custom ISO build process, by placing all the `*.deb` files in
the vyos-build/packages folder where they will be used automatically when
building VyOS as documented above.

Firmware
^^^^^^^^

If you upgrade your kernel or include new drivers you may need new firmware.
Build a new ``vyos-linux-firmware`` package with the included helper scripts.

.. code-block:: none

  $ cd vyos-build/packages/linux-kernel
  $ git clone https://git.kernel.org/pub/scm/linux/kernel/git/firmware/linux-firmware.git
  $ ./build-linux-firmware.sh
  $ cp vyos-linux-firmware_*.deb ../

This tries to automatically detect which blobs are needed based on which drivers
were built. If it fails to find the correct files you can add them manually to
``vyos-build/packages/linux-kernel/build-linux-firmware.sh``:

.. code-block:: bash

  ADD_FW_FILES="iwlwifi* ath11k/QCA6390/*/*.bin"


Building Out-Of-Tree Modules
----------------------------

Building the kernel is one part, but now you also need to build the required
out-of-tree modules so everything is lined up and the ABIs match. To do so,
you can again take a look at ``vyos-build/packages/linux-kernel/Jenkinsfile``
to see all of the required modules and their selected versions. We will show
you how to build all the current required modules.

WireGuard
^^^^^^^^^

First, clone the source code and check out the appropriate version by running:

.. code-block:: none

  $ cd vyos-build/packages/linux-kernel
  $ git clone https://salsa.debian.org/debian/wireguard-linux-compat.git
  $ cd wireguard-linux-compat
  $ git checkout debian/1.0.20200712-1_bpo10+1

We again make use of a helper script and some patches to make the build work.
Just run the following command:

.. code-block:: none

  $ cd vyos-build/packages/linux-kernel
  $ ./build-wireguard-modules.sh
  I: Apply WireGuard patch: /vyos/packages/linux-kernel/patches/wireguard-linux-compat/0001-Debian-build-wireguard-modules-package.patch
  patching file debian/control
  patching file debian/rules
  I: Build Debian WireGuard package
  dpkg-buildpackage: info: source package wireguard-linux-compat
  dpkg-buildpackage: info: source version 1.0.20200712-1~bpo10+1
  dpkg-buildpackage: info: source distribution buster-backports
  dpkg-buildpackage: info: source changed by Unit 193 <unit193@debian.org>
  dpkg-buildpackage: info: host architecture amd64
   dpkg-source --before-build .
  dpkg-source: info: using patch list from debian/patches/series
  dpkg-source: info: applying 0001-Makefile-do-not-use-git-to-get-version-number.patch
  dpkg-source: info: applying 0002-Avoid-trying-to-compile-on-debian-5.5-kernels-Closes.patch

  ...

  dpkg-genchanges: info: binary-only upload (no source code included)
   debian/rules clean
  dh clean
     dh_clean
   dpkg-source --after-build .
  dpkg-source: info: unapplying 0002-Avoid-trying-to-compile-on-debian-5.5-kernels-Closes.patch
  dpkg-source: info: unapplying 0001-Makefile-do-not-use-git-to-get-version-number.patch
  dpkg-buildpackage: info: binary-only upload (no source included)

After compiling the packages you will find yourself the newly generated `*.deb`
binaries in ``vyos-build/packages/linux-kernel`` from which you can copy them
to the ``vyos-build/packages`` folder for inclusion during the ISO build.

Accel-PPP
^^^^^^^^^

First, clone the source code and check out the appropriate version by running:

.. code-block:: none

  $ cd vyos-build/packages/linux-kernel
  $ git clone https://github.com/accel-ppp/accel-ppp.git

We again make use of a helper script and some patches to make the build work.
Just run the following command:

.. code-block:: none

  $ ./build-accel-ppp.sh
  I: Build Accel-PPP Debian package
  CMake Deprecation Warning at CMakeLists.txt:3 (cmake_policy):
    The OLD behavior for policy CMP0003 will be removed from a future version
    of CMake.

    The cmake-policies(7) manual explains that the OLD behaviors of all
    policies are deprecated and that a policy should be set to OLD only under
    specific short-term circumstances.  Projects should be ported to the NEW
    behavior and not rely on setting a policy to OLD.

  -- The C compiler identification is GNU 8.3.0

  ...

  CPack: Create package using DEB
  CPack: Install projects
  CPack: - Run preinstall target for: accel-ppp
  CPack: - Install project: accel-ppp
  CPack: Create package
  CPack: - package: /vyos/vyos-build/packages/linux-kernel/accel-ppp/build/accel-ppp.deb generated.

After compiling the packages you will find yourself the newly generated `*.deb`
binaries in ``vyos-build/packages/linux-kernel`` from which you can copy them
to the ``vyos-build/packages`` folder for inclusion during the ISO build.

Intel NIC
^^^^^^^^^

The Intel NIC drivers do not come from a Git repository, instead we just fetch
the tarballs from our mirror and compile them.

Simply use our wrapper script to build all of the driver modules.

.. code-block:: none

  ./build-intel-drivers.sh
    % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                   Dload  Upload   Total   Spent    Left  Speed
  100  490k  100  490k    0     0   648k      0 --:--:-- --:--:-- --:--:--  648k
  I: Compile Kernel module for Intel ixgbe driver

  ...

  I: Building Debian package vyos-intel-iavf
  Doing `require 'backports'` is deprecated and will not load any backport in the next major release.
  Require just the needed backports instead, or 'backports/latest'.
  Debian packaging tools generally labels all files in /etc as config files, as mandated by policy, so fpm defaults to this behavior for deb packages. You can disable this default behavior with --deb-no-default-config-files flag {:level=>:warn}
  Created package {:path=>"vyos-intel-iavf_4.0.1-0_amd64.deb"}
  I: Cleanup iavf source

After compiling the packages you will find yourself the newly generated `*.deb`
binaries in ``vyos-build/packages/linux-kernel`` from which you can copy them
to the ``vyos-build/packages`` folder for inclusion during the ISO build.

Intel QAT
^^^^^^^^^
The Intel QAT (Quick Assist Technology) drivers do not come from a Git
repository, instead we just fetch the tarballs from 01.org, Intel's
open-source website.

Simply use our wrapper script to build all of the driver modules.

.. code-block:: none

  $ ./build-intel-qat.sh
    % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                   Dload  Upload   Total   Spent    Left  Speed
  100 5065k  100 5065k    0     0  1157k      0  0:00:04  0:00:04 --:--:-- 1157k
  I: Compile Kernel module for Intel qat driver
  checking for a BSD-compatible install... /usr/bin/install -c
  checking whether build environment is sane... yes
  checking for a thread-safe mkdir -p... /bin/mkdir -p
  checking for gawk... gawk
  checking whether make sets $(MAKE)... yes

  ...

  I: Building Debian package vyos-intel-qat
  Doing `require 'backports'` is deprecated and will not load any backport in the next major release.
  Require just the needed backports instead, or 'backports/latest'.
  Debian packaging tools generally labels all files in /etc as config files, as mandated by policy, so fpm defaults to this behavior for deb packages. You can disable this default behavior with --deb-no-default-config-files flag {:level=>:warn}
  Created package {:path=>"vyos-intel-qat_1.7.l.4.9.0-00008-0_amd64.deb"}
  I: Cleanup qat source


After compiling the packages you will find yourself the newly generated `*.deb`
binaries in ``vyos-build/packages/linux-kernel`` from which you can copy them
to the ``vyos-build/packages`` folder for inclusion during the ISO build.


Packages
========

If you are brave enough to build yourself an ISO image containing any modified
package from our GitHub organisation - this is the place to be.

Any "modified" package may refer to an altered version of e.g. vyos-1x package
that you would like to test before filing a pull request on GitHub.

Building an ISO with any customized package is in no way different then
building a regular (customized or not) ISO image. Simply place your modified
`*.deb` package inside the `packages` folder within `vyos-build`. The build
process will then pickup your custom package and integrate it into your ISO.

Troubleshooting
===============

Debian APT is not very verbose when it comes to errors. If your ISO build breaks
for whatever reason and you suspect it's a problem with APT dependencies or
installation you can add this small patch which increases the APT verbosity
during ISO build.

.. stop_vyoslinter

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

.. start_vyoslinter



Virtualization Platforms
========================

QEMU
----

Run following command after building the ISO image.

.. code-block:: none

  $ make qemu

VMware
------

Requires ovftool already installed.

Run following command after building the ISO image.

.. code-block:: none

  $ make vmware

.. _build_packages:

********
Packages
********

VyOS itself comes with a bunch of packages that are specific to our system and
thus cannot be found in any Debian mirror. Those packages can be found at the
`VyOS GitHub project`_ in their source format can easily be compiled into
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

  # For VyOS 1.3 (equuleus)
  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:equuleus bash

  # Change to source directory
  $ cd vyos-1x

  # Build DEB
  $ dpkg-buildpackage -uc -us -tc -b

After a minute or two you will find the generated DEB packages next to the
vyos-1x source directory:

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


.. stop_vyoslinter

.. _Docker: https://www.docker.com
.. _`Docker as non-root`: https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user
.. _VyOS DockerHub organisation: https://hub.docker.com/u/vyos
.. _repository: https://github.com/vyos/vyos-build
.. _VyOS GitHub project: https://github.com/vyos
.. _`On Debian`: https://docs.docker.com/engine/install/debian/
.. _`On Ubuntu`: https://docs.docker.com/engine/install/ubuntu/
.. _`On Fedora`: https://docs.docker.com/engine/install/fedora/
.. _`On CentOS and similar`: https://docs.docker.com/engine/install/centos/
.. start_vyoslinter

