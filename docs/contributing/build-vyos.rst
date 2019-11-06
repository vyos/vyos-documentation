.. _build:

Building VyOS
=============

This will guide you though the process of building a VyOS ISO yourself using
Docker_ and works best on a fresh installation of Debain 8 (Jessie).

.. note:: Starting with VyOS 1.2 the developers have decided to change their
   release model. VyOS is now **free as in speech, but not as in beer**, meaning
   that while VyOS is still an open source project, the release ISO's are no
   longer free and can only be obtained via subscription, or by contributing to
   the community. Since the source code is still public you can build your own
   ISO using the process described here.

Installing Docker_ and it's prerequisites

.. code-block:: sh

  $ apt-get update
  $ apt-get install -y apt-transport-https ca-certificates curl \
        gnupg2 software-properties-common
  $ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
  $ add-apt-repository "deb [arch=amd64] \
        https://download.docker.com/linux/debian $(lsb_release -cs) stable"
  $ apt-get update
  $ apt-get install -y docker-ce

To be able to use Docker_ you need to add your current system user to the
``docker`` group by calling: ``usermod -aG docker yourusername``

.. note:: It is recommended to use a non-root user from here on out.

.. note:: The build process needs to be built on a local file system, building
          on SMB or NFS shares is not supported!


Generate the container
----------------------

You can either build the container yourself or fetch a pre-build one from
Dockerhub. Our Dockerhub organisation (https://hub.docker.com/u/vyos) will
ensure that the container is always up2date. A rebuild is triggered once the
container changes (please note this will take 2-3 hours after pushing to
the vyos-build repository).

If you waer fancy pants you can - of course - always build the container
yourself directly from the source:

.. code-block:: sh

  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build
  $ docker build -t vyos/vyos-build docker

.. note: The container is automatically downloaded from Dockerhub if it is not
   found on your local machine when the below command is executed - so no
   worries.

Build iso inside container
--------------------------

After generating the container - or fetching it pre-build from Dockerhub you
are all set to invoke yourself a fresh build of a VyOS ISO.

.. code-block:: sh

  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build bash
  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 \
                               --build-by "your@email.tld" \
                               --build-type release --version 1.2.0
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

You may use these options to customize you ISO. You can list yourself all
options by calling ``./configure --help``:

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

Your freshly built ISO should now be in the build directory. Good luck!*

.. note: The process does not differ when building a ``crux`` ISO or ``rolling``
   one. Only make sure you are using the proper Docker container from the branch
   you are trying to build.

.. _Docker: https://www.docker.com
