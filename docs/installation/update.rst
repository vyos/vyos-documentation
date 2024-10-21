.. _update_vyos:

Update VyOS
===========

New system images can be added using the :opcmd:`add system image`
command. The command will extract the chosen image and will prompt you
to use the current system configuration and SSH security keys, allowing
for the new image to boot using the current configuration.

.. note:: Only LTS releases are PGP-signed.

.. opcmd:: add system image <url | path> | [latest] [vrf name]
   [username user [password pass]]

   Use this command to install a new system image. You can reach the
   image from the web (``http://``, ``https://``) or from your local system,
   e.g.  /tmp/vyos-1.2.3-amd64.iso.

   The `add system image` command also supports installing new versions
   of VyOS through an optional given VRF. Also if URL in question requires
   authentication, you can specify an optional username and password via
   the commandline which will be passed as "Basic-Auth" to the server.

If there is not enough **free disk space available**, the installation
will be canceled. To delete images use the :opcmd:`delete system image`
command.

VyOS configuration is associated to each image, and **each image has a
unique copy of its configuration**. This is different than a traditional
network router where the configuration is shared across all images.

.. note:: If you have any personal files, like some scripts you created,
   and you don't want them to be lost during the upgrade, make sure
   those files are stored in ``/config`` as this directory is always copied
   to newer installed images.

You can access files from a previous installation and copy them to your
current image if they were located in the ``/config`` directory. This
can be done using the :opcmd:`copy` command. So, for instance, in order
to copy ``/config/config.boot`` from VyOS 1.2.1 image, you would use the
following command:

.. code::

   copy file 1.2.1://config/config.boot to /tmp/config.boot.1.2.1


Example
"""""""

.. code-block:: none

     vyos@vyos:~$ add system image https://s3.amazonaws.com/s3-us.vyos.io/rolling/current/vyos-1.4-rolling-202201120317-amd64.iso
     Trying to fetch ISO file from https://s3.amazonaws.com/s3-us.vyos.io/rolling/current/vyos-1.4-rolling-202201120317-amd64.iso
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

You can use ``latest`` option. It loads the latest available Rolling release.

.. code-block:: none

     vyos@vyos:~$ add system image latest

.. note:: To use the `latest` option the "system update-check url" must be configured 
   appropriately for the installed release. 

   For updates to the Rolling Release for AMD64, the following URL may be used:

   https://raw.githubusercontent.com/vyos/vyos-nightly-build/refs/heads/current/version.json

.. hint:: The most up-do-date Rolling Release for AMD64 can be accessed using
   the following URL from a web browser:
   
   https://vyos.net/get/nightly-builds/

After reboot you might want to verify the version you are running with
the :opcmd:`show version` command.
