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

.. note:: VyOS 1.1 supported login as user ``root``. This has been removed due
   to tighter security in VyOS 1.2.

.. seealso:: SSH :ref:`ssh_key_based_authentication`

Configuration
=============

.. cfgcmd:: set service ssh port <port>

  Enabling SSH only requires you to specify the port ``<port>`` you want SSH to
  listen on. By default, SSH runs on port 22.

.. cfgcmd:: set service ssh listen-address <address>

  Specify IPv4/IPv6 listen address of SSH server. Multiple addresses can be
  defined.

.. cfgcmd:: set service ssh ciphers <cipher>

  Define allowed ciphers used for the SSH connection. A number of allowed
  ciphers can be specified, use multiple occurrences to allow multiple ciphers.

  List of supported ciphers: ``3des-cbc``, ``aes128-cbc``, ``aes192-cbc``,
  ``aes256-cbc``, ``aes128-ctr``, ``aes192-ctr``, ``aes256-ctr``,
  ``arcfour128``, ``arcfour256``, ``arcfour``, ``blowfish-cbc``, ``cast128-cbc``

.. cfgcmd:: set service ssh disable-password-authentication

  Disable password based authentication. Login via SSH keys only. This hardens
  security!

.. cfgcmd:: set service ssh disable-host-validation

  Disable the host validation through reverse DNS lookups - can speedup login
  time when reverse lookup is not possible.

.. cfgcmd:: set service ssh mac <mac>

  Specifies the available :abbr:`MAC (Message Authentication Code)` algorithms.
  The MAC algorithm is used in protocol version 2 for data integrity protection.
  Multiple algorithms can be provided by using multiple commands, defining
  one algorithm per command.

  List of supported MACs: ``hmac-md5``, ``hmac-md5-96``, ``hmac-ripemd160``,
  ``hmac-sha1``, ``hmac-sha1-96``, ``hmac-sha2-256``, ``hmac-sha2-512``,
  ``umac-64@openssh.com``, ``umac-128@openssh.com``,
  ``hmac-md5-etm@openssh.com``, ``hmac-md5-96-etm@openssh.com``,
  ``hmac-ripemd160-etm@openssh.com``, ``hmac-sha1-etm@openssh.com``,
  ``hmac-sha1-96-etm@openssh.com``, ``hmac-sha2-256-etm@openssh.com``,
  ``hmac-sha2-512-etm@openssh.com``, ``umac-64-etm@openssh.com``,
  ``umac-128-etm@openssh.com``

.. cfgcmd:: set service ssh access-control <allow | deny> <group | user> <name>

  Add access-control directive to allow or deny users and groups. Directives
  are processed in the following order of precedence: ``deny-users``,
  ``allow-users``, ``deny-groups`` and ``allow-groups``.

.. cfgcmd:: set service ssh client-keepalive-interval <interval>

  Specify timeout interval for keepalive message in seconds.

.. cfgcmd:: set service ssh key-exchange <kex>

  Specify allowed :abbr:`KEX (Key Exchange)` algorithms.

  List of supported algorithms: ``diffie-hellman-group1-sha1``,
  ``diffie-hellman-group14-sha1``, ``diffie-hellman-group14-sha256``,
  ``diffie-hellman-group16-sha512``, ``diffie-hellman-group18-sha512``,
  ``diffie-hellman-group-exchange-sha1``,
  ``diffie-hellman-group-exchange-sha256``,
  ``ecdh-sha2-nistp256``, ``ecdh-sha2-nistp384``, ``ecdh-sha2-nistp521``,
  ``curve25519-sha256`` and ``curve25519-sha256@libssh.org``.

.. cfgcmd:: set service ssh loglevel <quiet | fatal | error | info | verbose>

  Set the ``sshd`` log level. The default is ``info``.

.. cfgcmd:: set service ssh vrf <name>

  Specify name of the :abbr:`VRF (Virtual Routing and Forwarding)` instance.

.. cfgcmd:: set service ssh pubkey-accepted-algorithm <name>

  Specifies the signature algorithms that will be accepted for public key
  authentication

  List of supported algorithms: ``ssh-ed25519``,
  ``ssh-ed25519-cert-v01@openssh.com``, ``sk-ssh-ed25519@openssh.com``,
  ``sk-ssh-ed25519-cert-v01@openssh.com``, ``ecdsa-sha2-nistp256``,
  ``ecdsa-sha2-nistp256-cert-v01@openssh.com``, ``ecdsa-sha2-nistp384``,
  ``ecdsa-sha2-nistp384-cert-v01@openssh.com``, ``ecdsa-sha2-nistp521``,
  ``ecdsa-sha2-nistp521-cert-v01@openssh.com``,
  ``sk-ecdsa-sha2-nistp256@openssh.com``,
  ``sk-ecdsa-sha2-nistp256-cert-v01@openssh.com``,
  ``webauthn-sk-ecdsa-sha2-nistp256@openssh.com``,
  ``ssh-dss``, ``ssh-dss-cert-v01@openssh.com``, ``ssh-rsa``,
  ``ssh-rsa-cert-v01@openssh.com``, ``rsa-sha2-256``,
  ``rsa-sha2-256-cert-v01@openssh.com``, ``rsa-sha2-512``,
  ``rsa-sha2-512-cert-v01@openssh.com``

Dynamic-protection
==================
Protects host from brute-force attacks against
SSH. Log messages are parsed, line-by-line, for recognized patterns. If an
attack, such as several login failures within a few seconds, is detected, the
offending IP is blocked. Offenders are unblocked after a set interval.

.. cfgcmd:: set service ssh dynamic-protection

  Allow ``ssh`` dynamic-protection.

.. cfgcmd:: set service ssh dynamic-protection allow-from <address | prefix>

  Whitelist of addresses and networks. Always allow inbound connections from
  these systems.

.. cfgcmd:: set service ssh dynamic-protection block-time <sec>

  Block source IP in seconds. Subsequent blocks increase by a factor of 1.5
  The default is 120.

.. cfgcmd:: set service ssh dynamic-protection detect-time <sec>

  Remember source IP in seconds before reset their score. The default is 1800.

.. cfgcmd:: set service ssh dynamic-protection threshold <sec>

  Block source IP when their cumulative attack score exceeds threshold. The
  default is 30.

.. _ssh_operation:

Operation
=========

.. opcmd:: restart ssh

  Restart the SSH daemon process, the current session is not affected, only the
  background daemon is restarted.

.. opcmd:: generate ssh server-key

  Re-generated the public/private keyportion which SSH uses to secure
  connections.

  .. note:: Already learned known_hosts files of clients need an update as the
     public key will change.

.. opcmd:: generate ssh client-key /path/to/private_key

  Re-generated a known pub/private keyfile which can be used to connect to
  other services (e.g. RPKI cache).

  Example:

  .. code-block:: none

    vyos@vyos:~$ generate ssh client-key /config/auth/id_rsa_rpki
    Generating public/private rsa key pair.
    Your identification has been saved in /config/auth/id_rsa_rpki.
    Your public key has been saved in /config/auth/id_rsa_rpki.pub.
    The key fingerprint is:
    SHA256:XGv2PpdOzVCzpmEzJZga8hTRq7B/ZYL3fXaioLFLS5Q vyos@vyos
    The key's randomart image is:
    +---[RSA 2048]----+
    |         oo      |
    |          ..o    |
    |       . o.o.. o.|
    |       o+ooo  o.o|
    |        Eo*  =.o |
    |       o = +.o*+ |
    |        = o *.o.o|
    |       o * +.o+.+|
    |        =.. o=.oo|
    +----[SHA256]-----+

  Two new files ``/config/auth/id_rsa_rpki`` and
  ``/config/auth/id_rsa_rpki.pub``
  will be created.

.. opcmd:: generate public-key-command user <username> path <location>

   Generate the configuration mode commands to add a public key for
   :ref:`ssh_key_based_authentication`.
   ``<location>`` can be a local path or a URL pointing at a remote file.

   Supported remote protocols are FTP, FTPS, HTTP, HTTPS, SCP/SFTP and TFTP.

  Example:

  .. code-block:: none

    alyssa@vyos:~$ generate public-key-command user alyssa path sftp://example.net/home/alyssa/.ssh/id_rsa.pub
    # To add this key as an embedded key, run the following commands:
    configure
    set system login user alyssa authentication public-keys alyssa@example.net key AAA...
    set system login user alyssa authentication public-keys alyssa@example.net type ssh-rsa
    commit
    save
    exit

    ben@vyos:~$ generate public-key-command user ben path ~/.ssh/id_rsa.pub
    # To add this key as an embedded key, run the following commands:
    configure
    set system login user ben authentication public-keys ben@vyos key AAA...
    set system login user ben authentication public-keys ben@vyos type ssh-dss
    commit
    save
    exit

.. opcmd:: show log ssh

  Show SSH server log.

.. opcmd:: monitor log ssh

  Follow the SSH server log.

.. opcmd:: show log ssh dynamic-protection

  Show SSH dynamic-protection log.

.. opcmd:: monitor log ssh dynamic-protection

  Follow the SSH dynamic-protection log.

.. opcmd:: show ssh dynamic-protection

  Show list of IPs currently blocked by SSH dynamic-protection.

.. opcmd:: show ssh fingerprints

  Show SSH server public key fingerprints.

.. opcmd:: show ssh fingerprints ascii

  Show SSH server public key fingerprints, including a visual ASCII art representation.
