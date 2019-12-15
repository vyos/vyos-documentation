.. _ssh:

###
SSH
###

:abbr:`SSH (Secure Shell)` is a cryptographic network protocol for operating
network services securely over an unsecured network. The standard TCP port for
SSH is 22. The best known example application is for remote login to computer
systems by users.

SSH provides a secure channel over an unsecured network in a client-server
architecture, connecting an SSH client application with an SSH server. Common
applications include remote command-line login and remote command execution,
but any network service can be secured with SSH. The protocol specification
distinguishes between two major versions, referred to as SSH-1 and SSH-2.

The most visible application of the protocol is for access to shell accounts
on Unix-like operating systems, but it sees some limited use on Windows as
well. In 2015, Microsoft announced that they would include native support for
SSH in a future release.

SSH was designed as a replacement for Telnet and for unsecured remote shell
protocols such as the Berkeley rlogin, rsh, and rexec protocols.
Those protocols send information, notably passwords, in plaintext,
rendering them susceptible to interception and disclosure using packet
analysis. The encryption used by SSH is intended to provide confidentiality
and integrity of data over an unsecured network, such as the Internet.

Configuration
=============

.. cfgcmd:: set service ssh port '<number>'

Enabling SSH only requires you to specify the port ``<number>`` you want SSH to
listen on. By default, SSH runs on port 22.

.. cfgcmd:: set service ssh listen-address '<address>'

Specify IPv4/IPv6 listen address of SSH server. Multiple addresses can be
defined.

.. cfgcmd:: set service ssh ciphers '<cipher>'

Define allowed ciphers used for the SSH connection. A number of allowed ciphers
can be specified, use multiple occurrences to allow multiple ciphers.

* ``3des-cbc``
* ``aes128-cbc``
* ``aes192-cbc``
* ``aes256-cbc``
* ``aes128-ctr``
* ``aes192-ctr``
* ``aes256-ctr``
* ``arcfour128``
* ``arcfour256``
* ``arcfour``
* ``blowfish-cbc``
* ``cast128-cbc``

This could be used to harden security.

.. cfgcmd:: set service ssh disable-password-authentication

Disable password based authentication. Login via SSH keys only. This hardens
security!


.. cfgcmd: set service ssh disable-host-validation

Disable the host validation through reverse DNS lookups - can speedup login
time when reverse lookup is not possible.

.. cfgcmd:: set service ssh macs '<mac>'

Specifies the available :abbr:`MAC (Message Authentication Code)` algorithms.
The MAC algorithm is used in protocol version 2 for data integrity protection.
Multiple algorithms can be provided. Supported MACs:

* ``hmac-md5``
* ``hmac-md5-96``
* ``hmac-ripemd160``
* ``hmac-sha1``
* ``hmac-sha1-96``
* ``hmac-sha2-256``
* ``hmac-sha2-512``
* ``umac-64@openssh.com``
* ``umac-128@openssh.com``
* ``hmac-md5-etm@openssh.com``
* ``hmac-md5-96-etm@openssh.com``
* ``hmac-ripemd160-etm@openssh.com``
* ``hmac-sha1-etm@openssh.com``
* ``hmac-sha1-96-etm@openssh.com``
* ``hmac-sha2-256-etm@openssh.com``
* ``hmac-sha2-512-etm@openssh.com``
* ``umac-64-etm@openssh.com``
* ``umac-128-etm@openssh.com``

This could be used to harden security.

.. note:: VyOS 1.1 supported login as user ``root``. This has been removed due
   to tighter security in VyOS 1.2.

Key Based Authentication
========================

It is highly recommended to use SSH Key authentication. By default there is
only one user (``vyos``), and you can assign any number of keys to that user.
You can generate a ssh key with the ``ssh-keygen`` command on your local
machine, which will (by default) save it as ``~/.ssh/id_rsa.pub``.

Every SSH key comes in three parts:

``ssh-rsa AAAAB3NzaC1yc2EAAAABAA...VBD5lKwEWB username@host.example.com``

Only the type (``ssh-rsa``) and the key (``AAAB3N...``) are used. Note that the
key will usually be several hundred characters long, and you will need to copy
and paste it. Some terminal emulators may accidentally split this over several
lines. Be attentive when you paste it that it only pastes as a single line.
The third part is simply an identifier, and is for your own reference.

.. cfgcmd:: set system login user '<username>' authentication public-keys '<identifier>' key '<key>'

Assign the SSH public key portion `<key>` identified by per-key `<identifier>`
to the local user `<username>`.

.. cfgcmd:: set system login user '<username>' authentication public-keys '<identifier>' type '<type>'

Every SSH public key portion referenced by `<identifier>` requires the
configuration of the `<type>` of public-key used. This type can be any of:

* ``ecdsa-sha2-nistp256``
* ``ecdsa-sha2-nistp384``
* ``ecdsa-sha2-nistp521``
* ``ssh-dss``
* ``ssh-ed25519``
* ``ssh-rsa``

.. note:: You can assign multiple keys to the same user by using a unique
   identifier per SSH key.

Example
-------

In the following example, both User1 and User2 will be able to SSH into VyOS
as the ``vyos`` user using their own keys.

.. code-block:: none

  set system login user vyos authentication public-keys 'User1' key "AAAAB3Nz...KwEW"
  set system login user vyos authentication public-keys 'User1' type ssh-rsa
  set system login user vyos authentication public-keys 'User2' key "AAAAQ39x...fbV3"
  set system login user vyos authentication public-keys 'User2' type ssh-rsa
