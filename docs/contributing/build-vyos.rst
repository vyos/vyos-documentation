.. _build:

Building VyOS
=============

There are different ways you can build VyOS.

Building using a :ref:`Docker<build docker>` container, although not the only way, is the
easiest way as all dependencies are managed for you. It also allows you to
build ARM images on a x86 host.

However, you can also set up your own build machine and :ref:`build from source<build source>`.

.. note:: Starting with VyOS 1.2 the release model of VyOS has changed. 
   VyOS is now **free as in speech, but not as in beer**. This means
   that while VyOS is still an open source project, the release ISOs are no
   longer free and can only be obtained via subscription, or by contributing
   to the community. 
   
   The source code remains public and an ISO can be built
   using the process outlined here.

.. _build docker:

Docker
------

This will guide you though the process of building a VyOS ISO using
Docker_. This process has been tested on clean installs of Debian
Jessie, Stretch, and Buster.

Installing Docker_ and prerequisites
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

  $ sudo apt-get update
  $ sudo apt-get install -y apt-transport-https ca-certificates curl gnupg2 \
        software-properties-common
  $ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
  $ sudo add-apt-repository "deb [arch=amd64] \
        https://download.docker.com/linux/debian $(lsb_release -cs) stable"
  $ sudo apt-get update
  $ sudo apt-get install -y docker-ce

To be able to use Docker_, the current non-root user should be added to the
``docker`` group by calling: ``usermod -aG docker yourusername``

.. note:: It is recommended to use that non-root user for the remaining steps.

.. note:: The build process needs to be built on a local file system, building
          on SMB or NFS shares will result in the container failing to build properly!


Build Docker Container
^^^^^^^^^^^^^^^^^^^^^^

The container can built by hand or by fetching the pre-built one from
DockerHub. Using the pre-built containers from the `VyOS DockerHub organisation`_
will ensure that the container is always up-to-date. A rebuild is triggered
once the container changes (please note this will take 2-3 hours after pushing
to the vyos-build repository).

.. note: If you are using the pre-built container, it will be automatically
   downloaded from DockerHub if it is not found on your local machine when
   you build the ISO.

To manually download the container, run:

.. code-block:: none

  $ docker pull vyos/vyos-build:crux

The container can always be built directly from source:

.. code-block:: none

  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build # For VyOS 1.2
  $ git clone -b master --single-branch https://github.com/vyos/vyos-build # For rolling release
  $ cd vyos-build
  $ docker build -t vyos/vyos-build:crux docker # For VyOS 1.2
  $ docker build -t vyos/vyos-build docker # For rolling release

.. Note: We require one container per build branch, this means that the used
   container in ``crux`` and ``master`` can and will differ once VyOS makes the 
   move towards Debian (10) Buster.


Build ISO
^^^^^^^^^

If you have not build your own Docker image, you need to clone the repository to your local machine:

.. code-block:: none

  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build # For VyOS 1.2
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build # For rolling release

Now a fresh build of the VyOS ISO can begin. Change directory to the ``vyos-build`` directory and run:

.. code-block:: none

  $ cd vyos-build
  $ docker run --rm -it --privileged -v $(pwd)/vyos-build:/vyos -w /vyos vyos/vyos-build:crux bash # For VyOS 1.2
  $ docker run --rm -it --privileged -v $(pwd)/vyos-build:/vyos -w /vyos vyos/vyos-build bash # For rolling release
  vyos_bld@d4220bb519a0:/vyos# ./configure --architecture amd64 \
                               --build-by "your@email.tld" \
                               --build-type release --version 1.2.0
  vyos_bld@d4220bb519a0:/vyos# sudo make iso

The successfully built ISO should now be in the ``build/`` directory as
``live-image-[architecture].hybrid.iso``.

Good luck!

.. note: Make sure to choose the matching container for the version of VyOS
   that is being built, ``vyos/vyos-build:crux`` for VyOS 1.2 (crux) and 
   ``vyos/vyos-build`` for rolling release.

.. _build source:

From source
-----------

To build from source, you will need:

- Debian Buster for VyOS 1.2
- Debian Stretch for the rolling releases

To start, clone the repository to your local machine:

.. code-block:: none

  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build # For VyOS 1.2
  $ git clone -b crux --single-branch https://github.com/vyos/vyos-build # For rolling release

For the packages required, you can refer to the ``docker/Dockerfile`` file
in the repository_. The ``./configure`` script will also warn you if any
dependencies are missing.

Once you have the required dependencies, you may configure the build by
running ``./configure`` with your options. For details, refer to
:ref:`Customizing the build<customize>`.

Once you have configured your build, build the ISO by running:

.. code-block:: none

  $ sudo make iso

The successfully built ISO should now be in the ``build/`` directory as
``live-image-[architecture].hybrid.iso``.

.. _customize:

Customizing the build
---------------------

The build can be customized with the following list of configure options. 
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

.. _Docker: https://www.docker.com

.. _VyOS DockerHub organisation: https://hub.docker.com/u/vyos

.. _repository: https://github.com/vyos/vyos-build
