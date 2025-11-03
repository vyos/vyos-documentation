.. _image-mgmt:

################
Image Management
################

The VyOS image-based installation is implemented by creating a directory for
each image on the storage device selected during the install process.

The directory structure of the boot device:

.. code-block:: none

  /
  /boot
  /boot/grub
  /boot/2025.07.16-0020-rolling.squashfs

The image directory contains the system kernel, a compressed image of the root
filesystem for the OS, and a directory for persistent storage, such as
configuration. On boot, the system will extract the OS image into memory and
mount the appropriate live-rw sub-directories to provide persistent storage
system configuration.

This process allows for a system to always boot to a known working state, as
the OS image is fixed and non-persistent. It also allows for multiple releases
of VyOS to be installed on the same storage device. The image can be selected
manually at boot if needed, but the system will otherwise boot the image
configured to be the default.

.. opcmd:: show system image

   List all available system images which can be booted on the current system.

   .. code-block:: none

     vyos@vyos:~$ show system image
     Name                     Default boot    Running
     -----------------------  --------------  ---------
     2025.07.16-0020-rolling  Yes             Yes
     1.4.1
     1.4.0


.. opcmd:: delete system image [image-name]

   Delete no longer needed images from the system. You can specify an optional
   image name to delete, the image name can be retrieved via a list of available
   images can be shown using the :opcmd:`show system image`.

   .. code-block:: none

      vyos@vyos:~$ delete system image
      The following images are installed:
              1: 2025.07.16-0020-rolling (running) (default boot)
              2: 1.4.1
              3: 1.4.0
      Select an image to delete: 3
      Do you really want to delete the image 1.4.0? [y/N] y
      The image "1.4.0" was successfully deleted

.. opcmd:: show version

   Show current system image version.

   .. code-block:: none

      vyos@vyos:~$ show version
      Version:          VyOS 2025.07.16-0020-rolling
      Release train:    current
      Release flavor:   generic

      Built by:         autobuild@vyos.net
      Built on:         Wed 16 Jul 2025 00:21 UTC
      Build UUID:       20d432ee-6d55-4ebc-8462-46fe836246c9
      Build Commit ID:  f7ce0d8a692f2d

      Architecture:     x86_64
      Boot via:         installed image
      System type:      KVM guest
      Secure Boot:      n/a (BIOS)

      Hardware vendor:  QEMU
      Hardware model:   Standard PC (i440FX + PIIX, 1996)
      Hardware S/N:     
      Hardware UUID:    b9831d42-c1fe-b2bd-7d3d-49db9418f5c9

      Copyright:        VyOS maintainers and contributors




System rollback
===============

If you need to rollback to a previous image, you can easily do so. First
check the available images through the :opcmd:`show system image`
command and then select your image with the following command:

.. opcmd:: set system image default-boot [image-name]

   Select the default boot image which will be started on the next boot
   of the system.

Then reboot the system.

.. note:: VyOS automatically associates the configuration to the image,
   so you don't need to worry about that. Each image has a unique copy
   of its configuration.

If you have access to the console, there is a another way to select
your booting image: reboot and use the GRUB menu at startup.
