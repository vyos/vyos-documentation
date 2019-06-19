.. _installation:

Installation
============

The latest ISO image for VyOS can be downloaded at https://www.vyos.net.

The recommended system requirements are 512 MiB RAM and 2 GiB storage.

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
  Linux vyos 4.18.11-amd64-vyos #23 SMP Mon Oct 1 17:29:22 CEST 2018 x86_64 GNU/Linux

Unlike general purpose Linux distributions, VyOS uses "image installation"
that mimics the user experience of traditional hardware routers and allows
you to keep multiple VyOS versions on the same machine and switch to a previous
version if something breaks after upgrade. Every version is contained in its
own squashfs image that is mounted in a union filesystem together with a
directory for mutable data (configs etc.).

.. note:: Older versions used to support non-image installation (`install system` command). 
   Support for this is removed from VyOS 1.2 (crux) and newer releases

   This installation method has been deprecated since the time image installation
   was introduced (long before the fork), and does not provide any version
   management capabilities. You **should not** use it for new installations
   even if it's still available in new versions. You should not worry about
   older systems installed that way though, they can be upgraded with ``add
   system image``. 

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


Verify digital signatures
-------------------------

First you need to install GPG or another PGP implementation.
On most Linux distributions it's installed by default because package managers use it to verify package signatures.
On other systems you may need to find and install the package.

You nee to import the key.

``gpg --import maintainers.key``

| get the key from here: https://pgp.mit.edu/pks/lookup?op=vindex&search=0xFD220285A0FE6D7E
| or alternatively, you can import it by hand:

.. code-block:: sh

  -----BEGIN PGP PUBLIC KEY BLOCK-----
  Version: GnuPG v1.4.12 (GNU/Linux)

  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
  8vzPzaWHhkOkU8/J/Ci7+vNtUOZb
  =Ld8S
  -----END PGP PUBLIC KEY BLOCK-----



.. code-block:: sh

  $ gpg --list-keys
  ...
  pub   rsa4096 2015-08-12 [SC]
      0694A9230F5139BF834BA458FD220285A0FE6D7E
  uid           [ unknown] VyOS Maintainers (VyOS Release) <maintainers@vyos.net>
  sub   rsa4096 2015-08-12 [E]

Now you can verify signatures:

.. code-block:: sh

  $ gpg2 --verify vyos-1.2.1-amd64.iso.asc  vyos-1.2.1-amd64.iso
  gpg: Signature made So 14 Apr 12:58:07 2019 CEST
  gpg:                using RSA key FD220285A0FE6D7E
  gpg: Good signature from "VyOS Maintainers (VyOS Release) <maintainers@vyos.net>" [unknown]
  Primary key fingerprint: 0694 A923 0F51 39BF 834B  A458 FD22 0285 A0FE 6D7E
