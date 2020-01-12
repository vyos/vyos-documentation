.. _migrate_from_vyatta:

Migrate from Vyatta Core
========================

VyOS 1.x line aims to preserve backward compatibility and provide a safe
upgrade path for existing Vyatta Core users. You may think of VyOS 1.0.0 as
VC7.0.

Vyatta release compatibility
----------------------------

Vyatta Core releases from 6.5 to 6.6 should be 100% compatible.

Vyatta Core 6.4 and earlier may have incompatibilities. In Vyatta 6.5 the
"modify" firewall was removed and replaced with the ``set policy route``
command family, old configs can not be automatically converted. You will have
to adapt it to post-6.5 Vyatta syntax manually.

.. note:: Also, in Vyatta Core 6.5 remote access VPN interfaces have been
   renamed from ``pppX``  to ``l2tpX`` and ``pptpX``. If you are using
   zone based firewalling in Vyatta Core pre-6.5 versions, make sure to change
   interface names in rules for remote access VPN.

Upgrade procedure
-----------------

You just use ``add system image``, as if it was a new VC release (see
:ref:`update_vyos` for additional information). The only thing you want to do
is to verify the new images digital signature. You will have to add the public
key manually once as it is not shipped the first time.

.. code-block:: none

  vyatta@vyatta:~$ wget http://wiki.vyos.net/so3group_maintainers.key
  Connecting to vyos.net (x.x.x.x:80)
  so3group_maintainers 100% |*************************|  3125  --:--:-- ETA
  vyatta@vyatta:~$ sudo apt-key add so3group_maintainers.key
  OK
  vyatta@vyatta:~$

For completion the key below corresponds to the key listed in the URL above.

.. code-block:: none

  -----BEGIN PGP PUBLIC KEY BLOCK-----
  Version: GnuPG v1.4.12 (GNU/Linux)

  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
  Pr6fWpIruuc7Gg9rUF0L
  =VQTr
  -----END PGP PUBLIC KEY BLOCK-----

Next add the VyOS image.

This example uses VyOS 1.0.0, however, it's better to install the latest
release.

.. code-block:: none

  vyatta@vyatta:~$ show system image
  The system currently has the following image(s) installed:
    1: VC6.6R1 (default boot) (running image)

  vyatta@vyatta:~$ add system image https://downloads.vyos.io/release/legacy/1.0.0/vyos-1.0.0-amd64.iso
   Trying to fetch ISO file from https://downloads.vyos.io/release/legacy/1.0.0/vyos-1.0.0-amd64.iso
     % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                    Dload  Upload   Total   Spent    Left  Speed
   100  223M  100  223M    0     0   960k      0  0:03:57  0:03:57 --:--:--  657k
   ISO download succeeded.
   Checking for digital signature file...
     % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                    Dload  Upload   Total   Spent    Left  Speed
   100   836  100   836    0     0   4197      0 --:--:-- --:--:-- --:--:--  4287
   Found it.  Checking digital signature...
   gpg: directory `/root/.gnupg' created
   gpg: new configuration file `/root/.gnupg/gpg.conf' created
   gpg: WARNING: options in `/root/.gnupg/gpg.conf' are not yet active during this run
   gpg: keyring `/root/.gnupg/pubring.gpg' created
   gpg: Signature made Sun Dec 22 16:51:42 2013 GMT using RSA key ID A442E6E9
   gpg: /root/.gnupg/trustdb.gpg: trustdb created
   gpg: Good signature from "SO3 Group Maintainers <maintainers@so3group.net>"
   gpg: WARNING: This key is not certified with a trusted signature!
   gpg:          There is no indication that the signature belongs to the owner.
   Primary key fingerprint: DD5B B405 35E7 F6E3 4278  1ABF B744 E25A A442 E6E9
   Digital signature is valid.
   Checking MD5 checksums of files on the ISO image...OK.
   Done!

   What would you like to name this image? [1.0.0]: [return]
   OK.  This image will be named: 1.0.0
   Installing "1.0.0" image.
   Copying new release files...

   Would you like to save the current configuration
   directory and config file? (Yes/No) [Yes]: [return]
   Copying current configuration...

   Would you like to save the SSH host keys from your
   current configuration? (Yes/No) [Yes]: [return]
   Copying SSH keys...
   Setting up grub configuration...
   Done.

   vyatta@vyatta:~$ show system image
   The system currently has the following image(s) installed:

      1: 1.0.0 (default boot)
      2: VC6.6R1 (running image)

Upon reboot, you should have a working installation of VyOS.

You can go back to your Vyatta install using the ``set system image
default-boot`` command and selecting the your previous Vyatta Core image.

.. note:: Future releases of VyOS will break the direct upgrade path from
   Vyatta core. Please upgrade through an intermediate VyOS version e.g. VyOS
   1.2. After this you can continue upgrading to newer releases once you bootet
   into VyOS 1.2 once.
