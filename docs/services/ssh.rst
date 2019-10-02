SSH
---

Secure Shell (SSH_) is a cryptographic network protocol for operating network
services securely over an unsecured network.[1] The standard TCP port for SSH
is 22. The best known example application is for remote login to computer
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
^^^^^^^^^^^^^

Enabling SSH only requires you to add ``service ssh port NN``, where 'NN' is
the port you want SSH to listen on. By default, SSH runs on port 22.

.. code-block:: sh

  set service ssh port 22

Options
*******

* Listening address - Specify the IPv4/IPv6 listening address for connection
  requests. Multiple ``listen-address`` nodes can be defined.

  :code:`set service ssh listen-address <address>`

* Allow ``root`` login, this can be set to allow ``root`` logins on SSH
  connections, however it is not advisable to use this setting as this bears
  serious security risks. The default system user possesses all required
  privileges.

  :code:`set service ssh allow-root`

* Allowed ciphers - A number of allowed ciphers can be specified, use multiple
  occurrences to allow multiple ciphers.

  :code:`set service ssh ciphers <cipher>`

  Available ciphers:

 * `3des-cbc`
 * `aes128-cbc`
 * `aes192-cbc`
 * `aes256-cbc`
 * `aes128-ctr`
 * `aes192-ctr`
 * `aes256-ctr`
 * `arcfour128`
 * `arcfour256`
 * `arcfour`
 * `blowfish-cbc`
 * `cast128-cbc`

* Disable password authentication - If SSH key authentication is set up,
  password-based user authentication can be disabled. This hardens security!

  :code:`set service ssh disable-password-authentication`

* Disable host validation - Disable the host validation through reverse DNS
  lookups.

  :code:`set service ssh disable-host-validation`

* MAC algorithms - Specifies the available MAC (message authentication code)
  algorithms. The MAC algorithm is used in protocol version 2 for data
  integrity protection. Multiple algorithms can be entered.

  :code:`set service ssh macs <macs>`

  Supported MACs:

 * `hmac-md5`
 * `hmac-md5-96`
 * `hmac-ripemd160`
 * `hmac-sha1`
 * `hmac-sha1-96`
 * `hmac-sha2-256`
 * `hmac-sha2-512`
 * `umac-64@openssh.com`
 * `umac-128@openssh.com`
 * `hmac-md5-etm@openssh.com`
 * `hmac-md5-96-etm@openssh.com`
 * `hmac-ripemd160-etm@openssh.com`
 * `hmac-sha1-etm@openssh.com`
 * `hmac-sha1-96-etm@openssh.com`
 * `hmac-sha2-256-etm@openssh.com`
 * `hmac-sha2-512-etm@openssh.com`
 * `umac-64-etm@openssh.com`
 * `umac-128-etm@openssh.com`


Key Authentication
##################

It is highly recommended to use SSH Key authentication. By default there is
only one user (``vyos``), and you can assign any number of keys to that user.
You can generate a ssh key with the ``ssh-keygen`` command on your local
machine, which will (by default) save it as ``~/.ssh/id_rsa.pub`` which is in
three parts:

 ``ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAA...VByBD5lKwEWB username@host.example.com``

Only the type (``ssh-rsa``) and the key (``AAAB3N...``) are used. Note that
the key will usually be several hundred characters long, and you will need to
copy and paste it. Some terminal emulators may accidentally split this over
several lines. Be attentive when you paste it that it only pastes as a single
line. The third part is simply an identifier, and is for your own reference.


**Assign SSH Key to user**

Under the user (in this example, ``vyos``), add the public key and the type.
The `identifier` is simply a string that is relevant to you.

.. code-block:: sh

  set system login user vyos authentication public-keys 'identifier' key "AAAAB3Nz...."
  set system login user vyos authentication public-keys 'identifier' type ssh-rsa"

You can assign multiple keys to the same user by changing the identifier. In
the following example, both Unicron and xrobau will be able to SSH into VyOS
as the ``vyos`` user using their own keys.

.. code-block:: sh

  set system login user vyos authentication public-keys 'Unicron' key "AAAAB3Nz...."
  set system login user vyos authentication public-keys 'Unicron' type ssh-rsa
  set system login user vyos authentication public-keys 'xrobau' key "AAAAQ39x...."
  set system login user vyos authentication public-keys 'xrobau' type ssh-rsa



