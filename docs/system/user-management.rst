.. _user_management:

###############
User Management
###############

The default VyOS user account (`vyos`), as well as newly created user accounts,
have all capabilities to configure the system. All accounts have sudo
capabilities and therefore can operate as root on the system.

Both local administered and remote administered :abbr:`RADIUS (Remote
Authentication Dial-In User Service)` accounts are supported.

Local
=====

.. cfgcmd:: set system login user <name> full-name "<string>"

   Create new system user with username `<name>` and real-name specified by
   `<string>`.

.. cfgcmd:: set system login user <name> authentication plaintext-password <password>

   Specify the plaintext password user by user `<name>` on this system. The
   plaintext password will be automatically transferred into a secure hashed
   password and not saved anywhere in plaintext.

.. cfgcmd:: set system login user <name> authentication encrypted-password <password>

   Setup encrypted password for given username. This is useful for
   transferring a hashed password from system to system.

.. _ssh_key_based_authentication:

Key Based Authentication
------------------------

It is highly recommended to use SSH key authentication. By default there is
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

.. cfgcmd:: set system login user <username> authentication public-keys <identifier> key <key>

   Assign the SSH public key portion `<key>` identified by per-key
   `<identifier>` to the local user `<username>`.

.. cfgcmd:: set system login user <username> authentication public-keys <identifier> type <type>

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

.. cfgcmd:: loadkey <username> <location>

   SSH keys can not only be specified on the command-line but also loaded for
   a given user with `<username>` from a file pointed to by `<location>.` Keys
   can be either loaded from local filesystem or any given remote location
   using one of the following :abbr:`URIs (Uniform Resource Identifier)`:

   * ``<file>`` - Load from file on local filesystem path
   * ``scp://<user>@<host>/<file>`` - Load via SCP from remote machine
   * ``sftp://<user>@<host>/<file>`` - Load via SFTP from remote machine
   * ``ftp://<user>@<host>/<file>`` - Load via FTP from remote machine
   * ``http://<host>/<file>`` - Load via HTTP from remote machine
   * ``tftp://<host>/<file>`` - Load via TFTP from remote machine

Example
-------

In the following example, both `User1` and `User2` will be able to SSH into
VyOS as user ``vyos`` using their very own keys.

.. code-block:: none

  set system login user vyos authentication public-keys 'User1' key "AAAAB3Nz...KwEW"
  set system login user vyos authentication public-keys 'User1' type ssh-rsa
  set system login user vyos authentication public-keys 'User2' key "AAAAQ39x...fbV3"
  set system login user vyos authentication public-keys 'User2' type ssh-rsa


RADIUS
======

In large deployments it is not reasonable to configure each user individually
on every system. VyOS supports using :abbr:`RADIUS (Remote Authentication
Dial-In User Service)` servers as backend for user authentication.

Configuration
-------------

.. cfgcmd:: set system login radius server <address> secret <secret>

   Specify the `<address>` of the RADIUS server user with the pre-shared-secret
   given in `<secret>`. Multiple servers can be specified.

.. cfgcmd:: set system login radius server <address> port <port>

   Configure the discrete port under which the RADIUS server can be reached.
   This defaults to 1812.

.. cfgcmd:: set system login radius server <address> timeout <timeout>

   Setup the `<timeout>` in seconds when querying the RADIUS server.

.. cfgcmd:: set system login radius server <address> disable

   Temporary disable this RADIUS server. It won't be queried.

.. cfgcmd:: set system login radius source-address <address>

   RADIUS servers could be hardened by only allowing certain IP addresses to
   connect. As of this the source address of each RADIUS query can be
   configured. If this is not set, incoming connections to the RADIUS server
   will use the nearest interface address pointing towards the server - making
   it error prone on e.g. OSPF networks when a link fails and a backup route is
   taken.

.. hint:: If you want to have admin users to authenticate via RADIUS it is
   essential to sent the ``Cisco-AV-Pair shell:priv-lvl=15`` attribute. Without
   the attribute you will only get regular, non privilegued, system users.



Login Banner
============

You are able to set post-login or pre-login banner messages to display certain
information for this system.

.. cfgcmd:: set system login banner pre-login <message>

   Configure `<message>` which is shown during SSH connect and before a user is
   logged in.

.. cfgcmd:: set system login banner post-login <message>

   Configure `<message>` which is shown after user has logged in to the system.

.. note:: To create a new line in your login message you need to escape the new
   line character by using ``\\n``.
