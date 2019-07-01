.. _image-mgmt:

System Image Management
=======================

The VyOS image-based installation is implemented by creating a directory for
each image on the storage device selected during the install process.

The directory structure of the boot device:

.. code-block:: sh

  /
  /boot
  /boot/grub
  /boot/1.2.0-rolling+201810021347

The image directory contains the system kernel, a compressed image of the root
filesystem for the OS, and a directory for persistent storage, such as
configuration.

On boot, the system will extract the OS image into memory and mount the
appropriate live-rw sub-directories to provide persistent storage system
configuration.

This process allows for a system to always boot to a known working state, as
the OS image is fixed and non-persistent. It also allows for multiple releases
of VyOS to be installed on the same storage device.

The image can be selected manually at boot if needed, but the system will
otherwise boot the image configured to be the default.

The default boot image can be set using the :code:`set system image
default-boot` command in operational mode.

A list of available images can be shown using the :code:`show system image`
command in operational mode.

.. code-block:: sh

  vyos@vyos:~$ show system image
  The system currently has the following image(s) installed:

     1: 1.2.0-rolling+201810021347 (default boot)
     2: 1.2.0-rolling+201810021217
     3: 1.2.0-rolling+201809280337
     4: 1.2.0-rolling+201809252218
     5: 1.2.0-rolling+201809192034
     6: 1.2.0-rolling+201809191744
     7: 1.2.0-rolling+201809150337
     8: 1.2.0-rolling+201809141130
     9: 1.2.0-rolling+201809140949
    10: 1.2.0-rolling+201809131722

  vyos@vyos:~$

Images no longer needed can be removed using the :code:`delete system image`
command.


Update VyOS Installation
------------------------

Finally, new system images can be added using the :code:`add system image` command.
The add image command will extract the image from the release ISO (either on
the local filesystem or remotely if a URL is provided). The image install
process will prompt you to use the current system configuration and SSH
security keys, allowing for the new image to boot using the current
configuration.

.. code-block:: sh

  vyos@vyos:~$ add system image https://downloads.vyos.io/rolling/current/amd64/vyos-1.2.0-rolling%2B201810030440-amd64.iso
  Trying to fetch ISO file from https://downloads.vyos.io/rolling/current/amd64/vyos-1.2.0-rolling%2B201810030440-amd64.iso
    % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                   Dload  Upload   Total   Spent    Left  Speed
  100  338M  100  338M    0     0  3837k      0  0:01:30  0:01:30 --:--:-- 3929k
  ISO download succeeded.
  Checking for digital signature file...
    % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                   Dload  Upload   Total   Spent    Left  Speed
    0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
  curl: (22) The requested URL returned error: 404 Not Found

  Unable to fetch digital signature file.
  Do you want to continue without signature check? (yes/no) [yes]
  Checking MD5 checksums of files on the ISO image...OK.
  Done!

  What would you like to name this image? [1.2.0-rolling+201810030440]:

  OK.  This image will be named: 1.2.0-rolling+201810030440
  We do not have enough disk space to install this image!
  We need 344880 KB, but we only have 17480 KB.
  Exiting...

.. note:: Rolling releases are not GPG signed, only the real release build
   will have a proper GPG signature.

.. note:: VyOS configuration is associated to each image, and each image has
   a unique copy of its configuration. This is different than a traditional
   network router where the configuration is shared across all images.

If you need some files from a previous images - take a look inside a
:code:`/live` directory.

After reboot you might want to verify the version you are running with :code:`show version`

.. code-block:: sh

  vyos@vyos:~$ show version
  Version:          VyOS 1.2.0-rolling+201810030440
  Built by:         autobuild@vyos.net
  Built on:         Mon 10 Mar 2018 03:37 UTC
  Build UUID:       2ed16684-875c-4a19-8a34-1b03099eed35
  Build Commit ID:  3305dca496d814

  Architecture:     x86_64
  Boot via:         installed image
  System type:      Microsoft Hyper-V guest

  Hardware vendor:  Microsoft Corporation
  Hardware model:   Virtual Machine
  Hardware S/N:     9705-6585-6578-0429-1204-0427-62
  Hardware UUID:    5260b1ce-4028-4d9c-bc5d-4f8425e5c056

  Copyright:        VyOS maintainers and contributors
