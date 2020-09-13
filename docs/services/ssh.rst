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

.. cfgcmd:: set service ssh port <port>

Enabling SSH only requires you to specify the port ``<port>`` you want SSH to
listen on. By default, SSH runs on port 22.

.. cfgcmd:: set service ssh listen-address <address>

Specify IPv4/IPv6 listen address of SSH server. Multiple addresses can be
defined.

.. cfgcmd:: set service ssh ciphers <cipher>

Define allowed ciphers used for the SSH connection. A number of allowed ciphers
can be specified, use multiple occurrences to allow multiple ciphers. You can
choose from the following ciphers: ``3des-cbc``, ``aes128-cbc``, ``aes192-cbc``,
``aes256-cbc``, ``aes128-ctr``, ``aes192-ctr``, ``aes256-ctr``, ``arcfour128``,
``arcfour256``, ``arcfour``, ``blowfish-cbc``, ``cast128-cbc``

.. cfgcmd:: set service ssh disable-password-authentication

Disable password based authentication. Login via SSH keys only. This hardens
security!

.. cfgcmd:: set service ssh disable-host-validation

Disable the host validation through reverse DNS lookups - can speedup login
time when reverse lookup is not possible.

.. cfgcmd:: set service ssh macs <mac>

Specifies the available :abbr:`MAC (Message Authentication Code)` algorithms.
The MAC algorithm is used in protocol version 2 for data integrity protection.
Multiple algorithms can be provided. Supported MACs: ``hmac-md5``,
``hmac-md5-96``, ``hmac-ripemd160``, ``hmac-sha1``, ``hmac-sha1-96``,
``hmac-sha2-256``, ``hmac-sha2-512``, ``umac-64@openssh.com``,
``umac-128@openssh.com``, ``hmac-md5-etm@openssh.com``,
``hmac-md5-96-etm@openssh.com``, ``hmac-ripemd160-etm@openssh.com``,
``hmac-sha1-etm@openssh.com``, ``hmac-sha1-96-etm@openssh.com``,
``hmac-sha2-256-etm@openssh.com``, ``hmac-sha2-512-etm@openssh.com``,
``umac-64-etm@openssh.com``, ``umac-128-etm@openssh.com``

.. note:: VyOS 1.1 supported login as user ``root``. This has been removed due
   to tighter security in VyOS 1.2.

.. cfgcmd:: set service ssh access-control <allow | deny> <group | user> <name>

Add access-control directive to allow or deny users and groups. Directives are
processed in the following order of precedence: ``deny-users``, ``allow-users``,
``deny-groups`` and ``allow-groups``.

.. cfgcmd:: set service ssh client-keepalive-interval <interval>

Specify timeout interval for keepalive message in seconds.

.. cfgcmd:: set service ssh key-exchange <kex>

Specify allowed :abbr:`KEX (Key Exchange)` algorithms.
Supported algorithms: ``diffie-hellman-group1-sha1``,
``diffie-hellman-group14-sha1``, ``diffie-hellman-group14-sha256``,
``diffie-hellman-group16-sha512``, ``diffie-hellman-group18-sha512``,
``diffie-hellman-group-exchange-sha1``,
``diffie-hellman-group-exchange-sha256``, ``ecdh-sha2-nistp256``,
``ecdh-sha2-nistp384``, ``ecdh-sha2-nistp521``, ``curve25519-sha256`` and
``curve25519-sha256@libssh.org``.

.. cfgcmd:: set service ssh loglevel <quiet | fatal | error | info | verbose>

Set the ``sshd`` log level. The default is ``info``.

.. cfgcmd:: set service ssh vrf <name>

Specify name of the :abbr:`VRF (Virtual Routing and Forwarding)` instance.

.. seealso:: SSH :ref:`ssh_key_based_authentication`
