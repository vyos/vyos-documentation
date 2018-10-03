Installation
============

The latest ISO image for VyOS can be downloaded at https://www.vyos.net.

The recommended system requirements are 512MB RAM and 2GB storage.

The VyOS ISO is a Live CD and will boot to a functional VyOS image. To login
to the system, use the default username ``vyos`` with password ``vyos``.

.. code-block:: sh

  The programs included with the Debian GNU/Linux system are free software;
  the exact distribution terms for each program are described in the
  individual files in /usr/share/doc/*/copyright.

  Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
  permitted by applicable law.
  vyos@vyos:~$

  vyos@vyos:~$ uname -a
  Linux vyos 4.18.8-amd64-vyos #22 SMP Wed Sep 19 18:24:39 CEST 2018 x86_64 GNU/Linux

Unlike general purpose Linux distributions, VyOS uses "image installation"
that mimics the user experience of traditional hardware routers and allows
you to keep multiple VyOS versions on the same machine and switch to a previous
version if something breaks after upgrade. Every version is contained in its
own squashfs image that is mounted in a union filesystem together with a
directory for mutable data (configs etc.).

**NOTE:** older versions used to support non-image installation (`install
system` command). It's been deprecated since the time image installation was
introduced (long before the fork), and does not provide any version management
capabilities. You **should not** use it for new installations even if it's still
available in new versions. You should not worry about older systems installed
that way though, they can be upgraded with "add system image".

To install VyOS, run ``install image``.

.. code-block:: sh

  vyos@vyos:~$ install image
  Welcome to the VyOS install program.  This script
  will walk you through the process of installing the
  VyOS image to a local hard drive.
  Would you like to continue? (Yes/No) [Yes]: Yes
  Probing drives: OK
  Looking for pre-existing RAID groups...none found.
  The VyOS image will require a minimum 2000MB root.
  Would you like me to try to partition a drive automatically
  or would you rather partition it manually with parted?  If
  you have already setup your partitions, you may skip this step

  Partition (Auto/Parted/Skip) [Auto]:

  I found the following drives on your system:
   sda    4294MB

  Install the image on? [sda]:

  This will destroy all data on /dev/sda.
  Continue? (Yes/No) [No]: Yes

  How big of a root partition should I create? (2000MB - 4294MB) [4294]MB:

  Creating filesystem on /dev/sda1: OK
  Done!
  Mounting /dev/sda1...
  What would you like to name this image? [1.2.0-rolling+201809210337]:
  OK.  This image will be named: 1.2.0-rolling+201809210337
  Copying squashfs image...
  Copying kernel and initrd images...
  Done!
  I found the following configuration files:
      /opt/vyatta/etc/config.boot.default
  Which one should I copy to sda? [/opt/vyatta/etc/config.boot.default]:

  Copying /opt/vyatta/etc/config.boot.default to sda.
  Enter password for administrator account
  Enter password for user 'vyos':
  Retype password for user 'vyos':
  I need to install the GRUB boot loader.
  I found the following drives on your system:
   sda    4294MB

  Which drive should GRUB modify the boot partition on? [sda]:

  Setting up grub: OK
  Done!
  vyos@vyos:~$

After the installation is complete, remove the Live CD and reboot the system:

.. code-block:: sh

  vyos@vyos:~$ reboot
  Proceed with reboot? (Yes/No) [No] Yes
