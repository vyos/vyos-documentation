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
  /boot/1.2.0-rolling+201810021347

The image directory contains the system kernel, a compressed image of the root
filesystem for the OS, and a directory for persistent storage, such as
configuration. On boot, the system will extract the OS image into memory and
mount the appropriate live-rw sub-directories to provide persistent storage
system configuration.

This process allows for a system to always boot to a known working state, as
the OS image is fixed and non-persistent. It also allows for multiple releases
of VyOS to be installed on the same storage device. The image can be selected
manually at boot if needed, but the system will otherwise boot the image
configured to be the default (:opcmd:`set system image default-boot`).

.. opcmd:: show system image

   List all available system images which can be bootet on the current system.

   .. code-block:: none

     vyos@vyos:~$ show system image
     The system currently has the following image(s) installed:

        1: 1.2.0-rolling+201810021347 (default boot)
        2: 1.2.0-rolling+201810021217
        3: 1.2.0-rolling+201809252218

.. opcmd:: set system image default-boot

   Select the default boot image which will be started on the next boot of the
   System. A list of available images can be shown using the :opcmd:`show
   system image`


.. opcmd:: delete system image

   Delete no longer needed images from the system.

   .. code-block:: none

      vyos@vyos:~$ delete system image
      The following image(s) can be deleted:

         1: 1.3-rolling-201912181733 (default boot) (running image)
         2: 1.3-rolling-201912180242
         3: 1.2.2
         4: 1.2.1

      Select the image to delete: 2

      Are you sure you want to delete the
      "1.3-rolling-201912180242" image? (Yes/No) [No]: y
      Deleting the "1.3-rolling-201912180242" image...
      Done

.. opcmd:: show version

   Show current system image version.

   .. code-block:: none

      vyos@vyos:~$ show version
      Version:          VyOS 1.3-rolling-201912181733
      Built by:         autobuild@vyos.net
      Built on:         Wed 18 Dec 2019 17:33 UTC
      Build UUID:       bccde2c3-261c-49cc-b421-9b257204e06c
      Build Commit ID:  f7ce0d8a692f2d

      Architecture:     x86_64
      Boot via:         installed image
      System type:      bare metal

      Hardware vendor:  VMware, Inc.
      Hardware model:   VMware Virtual Platform
      Hardware S/N:     VMware-42 1d 83 b9 fe c1 bd b2-7d 3d 49 db 94 18 f5 c9
      Hardware UUID:    b9831d42-c1fe-b2bd-7d3d-49db9418f5c9

      Copyright:        VyOS maintainers and contributors


.. _update_vyos:

Update VyOS
===========

Finally, new system images can be added using the :opcmd:`add system image`
command. The add image command will extract the image from the release ISO
(either on the local filesystem or remotely if a URL is provided). The image
install process will prompt you to use the current system configuration and SSH
security keys, allowing for the new image to boot using the current
configuration.

.. opcmd:: add system image <url | path>

   New system images can be either installed from an URL (http://, https://) or
   any location pointed to by a file path, e.g. /tmp/vyos-1.2.3-amd64.iso.
   If there is not enough free diskspace available installation will be
   canceled. To delete images use the :opcmd:`delete system image` command.


   .. code-block:: none

     vyos@vyos:~$ add system image https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
     Trying to fetch ISO file from https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
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

     What would you like to name this image? [vyos-1.3-rolling-201912201452]:

     OK.  This image will be named: vyos-1.3-rolling-201912201452

   .. note:: Rolling releases are not GPG signed, only the real release build
      will have a proper GPG signature.

   .. note:: VyOS configuration is associated to each image, and each image has
      a unique copy of its configuration. This is different than a traditional
      network router where the configuration is shared across all images.

   After reboot you might want to verify the version you are running with the
   :opcmd:`show version` command.

.. hint:: You can always access files from a previous installation any copy
   them to your current image. This can be done using the :opcmd:`copy`
   command. To copy ``/config/config.boot`` from VyOS 1.2.1 image use ``copy
   file 1.2.1://config/config.boot to /tmp/config.boot.1.2.1``.

