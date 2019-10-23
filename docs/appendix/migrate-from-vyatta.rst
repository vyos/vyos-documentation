.. _migrate_from_vyatta:

Migrate from Vyatta Core
========================

VyOS 1.x.x line aims to preserve backward compatibility and provide a safe upgrade
ath for existing Vyatta Core users. You may think of 1.0.0 as VC7.0.

Vyatta release compatiblity
---------------------------
Vyatta Core releases from **6.5** to **6.6** should be 100% compatible.

Vyatta Core **6.4** and earlier may have incompatibilities. In **6.5** the "modify"
firewall was removed and replaced with ``set policy route`` command family, and
old config cannot be automatically converted. You will have to adapt it to
post-6.5 syntax manually.

.. note:: Also, in **6.5** remote access VPN interfaces were renamed from pppX
   to l2tpX and pptpX, so if you are using zone-policy in pre-6.5 versions, make
   sure to change interface names in rules for remote access VPN.

Upgrade procedure
-----------------
You just use ``add system image``, as if it was a new VC release. The only thing
is that is you want to verify image digital signature, you will have to add the
public key.

.. code-block:: sh

  vyatta@vyatta:~$ '''wget http://wiki.vyos.net/so3group_maintainers.key'''
  Connecting to vyos.net (x.x.x.x:80)
  so3group_maintainers 100% |******************************|  3125  --:--:-- ETA
  vyatta@vyatta:~$ '''sudo apt-key add so3group_maintainers.key'''
  OK
  vyatta@vyatta:~$

Next, we can add the VyOS image.


.. note:: Vyatta doesn't support HTTP redirects for ``add system image`` and
   http://mirror.vyos.net HTTP load-balancer links will not work. Instead,
   choose one of the `mirrors <https://wiki.vyos.net/wiki/Mirrors>`_ and get
   a direct link.

This example uses 1.0.0 image, however, it's better to install the latest release.

.. code-block:: sh

  vyatta@vyatta:~$ show system image
  The system currently has the following image(s) installed:
    1: VC6.6R1 (default boot) (running image)

  vyatta@vyatta:~$ add system image http://0.uk.mirrors.vyos.net/iso/release/1.0.0/vyos-1.0.0-amd64.iso
   Trying to fetch ISO file from http://0.uk.mirrors.vyos.net/iso/release/1.0.0/vyos-1.0.0-amd64.iso
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
   What would you like to name this image? [1.0.0]: '''[return]'''
   OK.  This image will be named: 1.0.0
   Installing "1.0.0" image.
   Copying new release files...
   Would you like to save the current configuration
   directory and config file? (Yes/No) [Yes]: '''[return]'''
   Copying current configuration...
   Would you like to save the SSH host keys from your
   current configuration? (Yes/No) [Yes]: '''[return]'''
   Copying SSH keys...
   Setting up grub configuration...
   Done.
   vyatta@vyatta:~$ '''show system image'''
   The system currently has the following image(s) installed:

      1: 1.0.0 (default boot)
      2: VC6.6R1 (running image)

   vyatta@vyatta:~$

Upon reboot, you should have a working installation of VyOS.

You can go back to your Vyatta install using the ``set system image default-boot``
command and selecting the your previous Vyatta image.

.. note:: Future releases of VyOS will break the direct upgrade path from Vyatta
   core. Please upgrade through an intermediate VyOS version e.g. VyOS 1.2.x.


