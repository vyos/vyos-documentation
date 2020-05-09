.. _build:

Building VyOS
=============

This will guide you though the process of building a VyOS ISO using
Docker_.  This process has been tested on clean installs of Debian Jessie, Stretch, and Buster. 

.. note:: Starting with VyOS 1.2 the release model of VyOS has changed. 
   VyOS is now **free as in speech, but not as in beer**. This means
   that while VyOS is still an open source project, the release ISOs are no
   longer free and can only be obtained via subscription, or by contributing to
   the community. 
   
   The source code remains public and an ISO can be built
   using the process outlined here.

Installing Docker_ and prerequisites

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


Generating the container
----------------------

The container can built by hand or by fetching the pre-built one from
DockerHub. Using the pre-built VyOS DockerHub organisation (https://hub.docker.com/u/vyos) will
ensure that the container is always up-to-date. A rebuild is triggered once the
container changes (please note this will take 2-3 hours after pushing to
the vyos-build repository).

The container can always be built directly from source:

.. code-block:: none

  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build
  $ docker build -t vyos/vyos-build docker

.. note: The container is automatically downloaded from Dockerhub if it is not
   found on your local machine when the below command is executed.

.. note: We require one container per build branch, this means that the used
   container in ``crux`` and ``current`` can and will differ once VyOS makes the 
   move towards Debian (10) Buster.


Build ISO inside container
--------------------------

After the container is generated either manually or fetched from DockerHub,
a fresh build of the VyOS ISO can begin.

.. code-block:: none

  $ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build bash
  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 \
                               --build-by "your@email.tld" \
                               --build-type release --version 1.2.0
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

To select the container you want to run, you need to specify the branch you are
interested in, this can be easily done by selecting the appropriate container
image:

* For VyOS 1.2 (crux) use ``vyos/vyos-build:crux``
* For our VyOS rolling release you should use ``vyos/vyos-build`` which will
  always refer to the latest image.

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

.. note: The build process does not differentiate when building a ``crux`` ISO or ``rolling``
   image. Make sure to choose the matching container for the version of VyOS that is being built.

.. _Docker: https://www.docker.com
