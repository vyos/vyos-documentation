.. _build:

Building VyOS using Docker
==========================

This will guide you though the process of building a VyOS ISO yourself using
Docker and works best on a fresh installation of Debain 8 (Jessie).

.. note:: Starting with VyOS 1.2 the developers have decided to change their
   release model. VyOS is now **free as in speech, but not as in beer**, meaning
   that while VyOS is still an open source project, the release ISO's are no
   longer free and can only be obtained via subscription, or by contributing to
   the community. Since the source code is still public you can build your own
   ISO using the process described here.

Installing Docker and it's prerequisites

.. code-block:: sh

  root@build:~$ apt update
  root@build:~$ apt install apt-transport-https ca-certificates curl gnupg2 software-properties-common
  root@build:~$ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
  root@build:~$ add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
  root@build:~$ apt update
  root@build:~$ apt install docker-ce

Adding you user to the docker group to be able to execute the ``docker`` command
without sudo.

.. code-block:: sh

  root@build:~$ usermod -aG docker user

.. note:: It is recommended to use a non-root user from here on out.

.. note:: The build process needs to be built on a local file system, building
          on SMB or NFS shares is not supported!

Cloning the vyos-build crux branch and creating the docker container

.. code-block:: sh

  user@build:~$ git clone -b crux --single-branch https://github.com/vyos/vyos-build.git
  user@build:~$ cd vyos-build
  user@build:~/vyos-build$ docker build -t vyos-builder docker

Running the container and building the ISO

.. code-block:: sh

  user@build:~$ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos-builder bash
  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 --build-by "your@email.tld" --build-type release --version 1.2.0
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

You may use these options to customize you ISO
code-block:: sh

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

*Your freshly built ISO should now be in the build directory. Good luck!*
