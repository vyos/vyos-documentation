.. _installation:

############
Installation
############

Requirements
============

The recommended system requirements are 512 MiB RAM and 2 GiB storage.
Depending on your use you might need additional RAM and CPU resources e.g.
when having multiple BGP full tables in your system.

Download
========

Registered Subscribers
----------------------

Registered subscribers can log into https://support.vyos.io/ to have access to
a variety of different downloads via the "Downloads" link. These downloads
include LTS (Long-Term-Support) and associated hot-fix releases, early public
access releases, pre-built VM images, as well as device specific installation
ISOs.

.. figure:: /_static/images/vyos-downloads.png

Building from source
----------------------

Non-subscribers can always get the LTS release by building it from source.
Instruction can be found in the :ref:`build` section of this manual. VyOS
source code repository is available for everyone at
https://github.com/vyos/vyos-build.

Rolling Release
---------------

Everyone can download bleeding-edge VyOS rolling images from:
https://downloads.vyos.io/

.. note:: Rolling releases contain all the latest enhancements and fixes. This
   means that there will be new bugs of course. If you think you hit a bug
   please follow the guide at :ref:`bug_report`. To improve VyOS we depend on
   your feedback!

The following link will always fetch the most recent VyOS build for AMD64
systems from the current branch:
https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso


Download Verification
---------------------

This subsection and the following one applies to downloaded LTS images, for
other versions please jump to :ref:`Install`.

LTS images are signed by VyOS lead package-maintainer private key. With the
official public key, the authenticity of the package can be verified.
:abbr:`GPG (GNU Privacy Guard)` is used for verification.

First, install GPG or another OpenPGP implementation. On most GNU+Linux
distributions it is installed by default as package managers use it to verify
package signatures. If not pre-installed, it will need to be downloaded and
installed.

The official VyOS public key can be retrieved in a number of ways. Skip to
:ref:`gpg-verification` if the key is already present.

It can also be retrieved directly from a key server:

``gpg --recv-keys FD220285A0FE6D7E``

Or it can be accessed from a key server via a web browser:

https://pgp.mit.edu/pks/lookup?op=get&search=0xFD220285A0FE6D7E

Or from the following block:

.. code-block:: none

  -----BEGIN PGP PUBLIC KEY BLOCK-----
  Version: GnuPG v1.4.12 (GNU/Linux)

  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
  8vzPzaWHhkOkU8/J/Ci7+vNtUOZb
  =Ld8S
  -----END PGP PUBLIC KEY BLOCK-----

Store the key in a new text file and import it into GPG via: ``gpg --import
file_with_the_public_key``

The import can be verified with:

.. code-block:: none

  $ gpg --list-keys
  ...
  pub   rsa4096 2015-08-12 [SC]
      0694A9230F5139BF834BA458FD220285A0FE6D7E
  uid           [ unknown] VyOS Maintainers (VyOS Release) <maintainers@vyos.net>
  sub   rsa4096 2015-08-12 [E]

.. _gpg-verification:

GPG
---

With the public key imported, the signature for the desired image needs to be
downloaded.

.. note:: The signature can be downloaded by appending `.asc` to the URL of the
   downloaded VyOS image. That small *.asc* file is the signature for the
   associated image.

Finally, verify the authenticity of the downloaded image:

.. code-block:: none

  $ gpg2 --verify vyos-1.2.1-amd64.iso.asc  vyos-1.2.1-amd64.iso
  gpg: Signature made So 14 Apr 12:58:07 2019 CEST
  gpg:                using RSA key FD220285A0FE6D7E
  gpg: Good signature from "VyOS Maintainers (VyOS Release) <maintainers@vyos.net>" [unknown]
  Primary key fingerprint: 0694 A923 0F51 39BF 834B  A458 FD22 0285 A0FE 6D7E

.. _Install:

Installation
============

VyOS ISO is a live CD and will boot into a full functional VyOS system.

.. hint:: The default username and password for the live system is ``vyos``.

.. code-block:: none

  The programs included with the Debian GNU/Linux system are free software;
  the exact distribution terms for each program are described in the
  individual files in /usr/share/doc/*/copyright.

  Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
  permitted by applicable law.
  vyos@vyos:~$

Unlike general purpose Linux distributions, VyOS uses "image installation" that
mimics the user experience of traditional hardware routers and allows keeping
multiple VyOS versions installed simultaneously. This makes it possible to
switch to a previous version if something breaks or miss-behaves after an image
upgrade.

Every version is contained in its own squashfs image that is mounted in a union
filesystem together with a directory for mutable data such as configurations,
keys, or custom scripts.

.. note:: Older versions (prior to VyOS 1.1) used to support non-image
   installation (``install system`` command). Support for this has been removed
   from VyOS 1.2 and newer releases. Older releases can still be upgraded via
   the general ``add system image <image_path>`` upgrade command (consult
   :ref:`image-mgmt` for further information).

To install VyOS, run ``install image`` after logging into the live system with
the provided default credentials.

.. code-block:: none

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

After the installation is complete, remove the live CD and reboot the system:

.. code-block:: none

  vyos@vyos:~$ reboot
  Proceed with reboot? (Yes/No) [No] Yes

PXE Boot
--------

VyOS can also be installed through PXE. This is a more complex installation
method which allows deploying VyOS through the network.

**Requirements**

* :ref:`dhcp-server`
* :ref:`tftp-server`
* Webserver (HTTP) - optional, but we will use it to speed up installation
* VyOS ISO image to be installed (do not use images prior to VyOS 1.2.3)
* ``pxelinux.0``, ``ldlinux.c32`` from SYSLINUX_
  (https://mirrors.edge.kernel.org/pub/linux/utils/boot/syslinux/)


Configuration
^^^^^^^^^^^^^

DHCP
""""

Configure DHCP server to provide the client with:

* An IP address
* The TFTP server address (DHCP option 66). Sometimes referred as *boot server*
* The *bootfile name* (DHCP option 67), which is ``pxelinux.0``

In this example we configured an existent VyOS as the DHCP server:

.. code-block:: none

  vyos@vyos# show service dhcp-server
   shared-network-name mydhcp {
       subnet 192.168.1.0/24 {
           bootfile-name pxelinux.0
           bootfile-server 192.168.1.50
           default-router 192.168.1.50
           range 0 {
               start 192.168.1.70
               stop 192.168.1.100
           }
       }
   }

.. _install_from_tftp:

TFTP
""""

Configure a TFTP server so that it serves the following:

* ``pxelinux.0`` from the Syslinux distribution
* ``ldlinux.c32`` from the Syslinux distribution
* The kernel of the VyOS software you want to deploy. That is the ``vmlinuz``
  file inside the ``/live`` directory of the extracted contents from the ISO
  file
* The initial ramdisk of the VyOS ISO you want to deploy. That is the
  ``initrd.img`` file inside the ``/live`` directory of the extracted contents
  from the ISO file. Do not use an empty (0 bytes) initrd.img file you might
  find, the correct file may have a longer name.
* A directory named pxelinux.cfg which must contain the configuration file:
  We will use the configuration_ file shown below, which we named default_

.. _configuration: https://wiki.syslinux.org/wiki/index.php?title=Config
.. _default: https://wiki.syslinux.org/wiki/index.php?title=PXELINUX#Configuration

In the example we configured our existent VyOS as the TFTP server too:

.. code-block:: none

  vyos@vyos# show service tftp-server
   directory /config/tftpboot
   listen-address 192.168.1.50

Example of the contents of the TFTP server:

.. code-block:: none

  vyos@vyos# ls -hal /config/tftpboot/
  total 29M
  drwxr-sr-x 3 tftp tftp      4.0K Oct 14 00:23 .
  drwxrwsr-x 9 root vyattacfg 4.0K Oct 18 00:05 ..
  -r--r--r-- 1 root vyattacfg  25M Oct 13 23:24 initrd.img-4.19.54-amd64-vyos
  -rwxr-xr-x 1 root vyattacfg 120K Oct 13 23:44 ldlinux.c32
  -rw-r--r-- 1 root vyattacfg  46K Oct 13 23:24 pxelinux.0
  drwxr-xr-x 2 root vyattacfg 4.0K Oct 14 01:10 pxelinux.cfg
  -r--r--r-- 1 root vyattacfg 3.7M Oct 13 23:24 vmlinuz

  vyos@vyos# ls -hal /config/tftpboot/pxelinux.cfg
  total 12K
  drwxr-xr-x 2 root vyattacfg 4.0K Oct 14 01:10 .
  drwxr-sr-x 3 tftp tftp      4.0K Oct 14 00:23 ..
  -rw-r--r-- 1 root root       191 Oct 14 01:10 default

Example of simple (no menu) configuration file:

.. code-block:: none

  vyos@vyos# cat /config/tftpboot/pxelinux.cfg/default
  DEFAULT VyOS123

  LABEL VyOS123
   KERNEL vmlinuz
   APPEND initrd=initrd.img-4.19.54-amd64-vyos boot=live nopersistence \
          noautologin nonetworking fetch=http://address:8000/filesystem.squashfs

HTTP
""""

As you read in the configuration file, we are sending ``filesystem.squashfs``
through HTTP. As that is a heavy file, we choose HTTP to speed up the transfer
over TFTP. Run a web server - you can use a simple one like
`Python's SimpleHTTPServer`_ and start serving the ``filesystem.squashfs``
file. The file can be found inside the ``/live`` directory of the extracted
contents of the ISO file.

Edit the configuration file at the :ref:`install_from_tftp` so that it shows
the correct URL at ``fetch=http://address/filesystem.squashfs``. Then restart
the TFTP service. If you are using VyOS as your TFTP Server, you can restart
the service with ``sudo service tftpd-hpa restart``.

.. note::  Make sure the available directories and files in both TFTP and HTTP
   server have the right permissions to be accessed from the booting clients.

.. _`Python's SimpleHTTPServer`: https://docs.python.org/2/library/simplehttpserver.html

Client Boot
"""""""""""

Turn on your PXE-enabled client or clients. They will automatically get an IP
address from the DHCP server and start booting into VyOS live from the files
automatically taken from the TFTP and HTTP servers.

Once finished you will be able to proceed with the ``install image`` command as
in a regular VyOS installation.

Known Issues
------------

This is a list of known issues that can arise during installation.

Black screen on install
^^^^^^^^^^^^^^^^^^^^^^^

GRUB attempts to redirect all output to a serial port for ease of installation on headless hosts.
This appears to cause an hard lockup on some hardware that lacks a serial port, with the result being a 
black screen after selecting the `Live system` option from the installation image.

The workaround is to type `e` when the boot menu appears and edit the GRUB boot options.  Specifically, remove the:

`console=ttyS0,115200` 

option, and type CTRL-X to boot. 

Installation can then continue as outlined above.

.. _SYSLINUX: http://www.syslinux.org/
