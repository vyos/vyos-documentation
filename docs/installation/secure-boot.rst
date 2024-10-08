.. _secure_boot:

###########
Secure Boot
###########

Initial UEFI secure boot support is available (:vytask:`T861`). We utilize
``shim`` from Debian 12 (Bookworm) which is properly signed by the UEFI
SecureBoot key from Microsoft.

.. note:: There is yet no signed version of ``shim`` for VyOS, thus we
   provide no signed image for secure boot yet. If you are interested in
   secure boot you can build an image on your own.

To generate a custom ISO with your own secure boot keys, run the following
commands prior to your ISO image build:

.. code-block:: bash

  cd vyos-build
  openssl req -new -x509 -newkey rsa:4096 \
    -keyout data/live-build-config/includes.chroot/var/lib/shim-signed/mok/MOK.key \
    -outform DER -out MOK.der -days 36500 -subj "/CN=MyMOK/" -nodes
  openssl x509 -inform der \
    -in data/live-build-config/includes.chroot/var/lib/shim-signed/mok/MOK.der \
    -out MOK.pem

************
Installation
************

As our version of ``shim`` is not signed by Microsoft we need to enroll the
previously generated :abbr:`MOK (Machine Owner Key)` to the system.

First of all you will need to disable UEFI secure boot for the installation.

.. figure:: /_static/images/uefi_secureboot_01.png
   :alt: Disable UEFI secure boot

Proceed with the regular VyOS :ref:`installation <permanent_installation>` on
your system, but instead of the final ``reboot`` we will enroll the
:abbr:`MOK (Machine Owner Key)`.

.. code-block:: none

  vyos@vyos:~$ install mok
  input password:
  input password again:

The requested ``input password`` can be user chosen and is only needed after
rebooting the system into MOK Manager to permanently install the keys.

With the next reboot, MOK Manager will automatically launch

.. figure:: /_static/images/uefi_secureboot_02.png
   :alt: Disable UEFI secure boot

Select ``Enroll MOK``

.. figure:: /_static/images/uefi_secureboot_03.png
   :alt: Disable UEFI secure boot

You can now view the key to be installed and ``continue`` with the Key installation

.. figure:: /_static/images/uefi_secureboot_04.png
   :alt: Disable UEFI secure boot

.. figure:: /_static/images/uefi_secureboot_05.png
   :alt: Disable UEFI secure boot

Now you will need the password previously defined

.. figure:: /_static/images/uefi_secureboot_06.png
   :alt: Disable UEFI secure boot

Now reboot and re-enable UEFI secure boot.

.. figure:: /_static/images/uefi_secureboot_07.png
   :alt: Disable UEFI secure boot

VyOS will now launch in UEFI secure boot mode. This can be double-checked by running
either one of the commands:

.. code-block:: none

  vyos@vyos:~$ show secure-boot
  SecureBoot enabled

.. code-block:: none

   vyos@vyos:~$ show log kernel | match Secure
   Oct 08 19:15:41 kernel: Secure boot enabled

.. code-block:: none

    vyos@vyos:~$    show version
    Version:          VyOS 1.5-secureboot
    Release train:    current
    Release flavor:   generic

    Built by:         autobuild@vyos.net
    Built on:         Tue 08 Oct 2024 18:00 UTC
    Build UUID:       5702ca38-e6f4-470f-b89e-ffc29baee474
    Build commit ID:  9eb61d3b6cf426

    Architecture:     x86_64
    Boot via:         installed image
    System type:      KVM guest
    Secure Boot:      enabled   <-- UEFI secure boot indicator

    Hardware vendor:  QEMU
    Hardware model:   Standard PC (i440FX + PIIX, 1996)
    Hardware S/N:
    Hardware UUID:    1f6e7f5c-fb52-4c33-96c9-782fbea36436

    Copyright:        VyOS maintainers and contributors
