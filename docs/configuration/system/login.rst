:lastproofread: 2022-10-15

.. _user_management:

#####################
Login/User Management
#####################

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

.. cfgcmd:: set system login user <name> authentication plaintext-password
   <password>

   Specify the plaintext password user by user `<name>` on this system. The
   plaintext password will be automatically transferred into a secure hashed
   password and not saved anywhere in plaintext.

.. cfgcmd:: set system login user <name> authentication encrypted-password
   <password>

   Setup encrypted password for given username. This is useful for
   transferring a hashed password from system to system.

.. cfgcmd:: set system login user <name> disable

   Disable (lock) account. User will not be able to log in.

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

.. seealso:: SSH :ref:`ssh_operation`

.. cfgcmd:: set system login user <username> authentication public-keys
   <identifier> key <key>

   Assign the SSH public key portion `<key>` identified by per-key
   `<identifier>` to the local user `<username>`.

.. cfgcmd:: set system login user <username> authentication public-keys
   <identifier> type <type>

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

.. cfgcmd:: set system login user <username> authentication public-keys
   <identifier> options <options>

   Set the options for this public key. See the ssh ``authorized_keys`` man
   page for details of what you can specify here. To place a ``"``
   character in the options field, use ``&quot;``, for example
   ``from=&quot;10.0.0.0/24&quot;`` to restrict where the user
   may connect from when using this key.

MFA/2FA authentication using OTP (one time passwords)
-----------------------------------------------------

It is possible to enhance authentication security by using the :abbr:`2FA
(Two-factor authentication)`/:abbr:`MFA (Multi-factor authentication)` feature
together with :abbr:`OTP (One-Time-Pad)` on VyOS. :abbr:`2FA (Two-factor
authentication)`/:abbr:`MFA (Multi-factor authentication)` is configured
independently per each user. If an OTP key is configured for a user, 2FA/MFA
is automatically enabled for that particular user. If a user does not have an
OTP key configured, there is no 2FA/MFA check for that user.

.. cfgcmd:: set system login user <username> authentication otp key <key>

   Enable OTP 2FA for user `username` with default settings, using the BASE32
   encoded 2FA/MFA key specified by `<key>`.

Optional/default settings
^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set system login user <username> authentication otp rate-limit <limit>
   :defaultvalue:

   Limit logins to `<limit>` per every ``rate-time`` seconds. Rate limit
   must be between 1 and 10 attempts.

.. cfgcmd:: set system login user <username> authentication otp rate-time <seconds>
   :defaultvalue:

   Limit logins to ``rate-limit`` attemps per every `<seconds>`. Rate time must
   be between 15 and 600 seconds.

.. cfgcmd:: set system login user <username> authentication otp window-size <size>
   :defaultvalue:

   Set window of concurrently valid codes.

   By default, a new token is generated every 30 seconds by the mobile
   application. In order to compensate for possible time-skew between
   the client and the server, an extra token before and after the current
   time is allowed. This allows for a time skew of up to 30 seconds
   between authentication server and client.

   For example, if problems with poor time synchronization are experienced,
   the window can be increased from its default size of 3 permitted codes
   (one previous code, the current code, the next code) to 17 permitted codes
   (the 8 previous codes, the current code, and the 8 next codes). This will
   permit for a time skew of up to 4 minutes between client and server.

   The window size must be between 1 and 21.

OTP-key generation
^^^^^^^^^^^^^^^^^^

The following command can be used to generate the OTP key as well
as the CLI commands to configure them:

.. cfgcmd:: generate system login username <username> otp-key hotp-time
   rate-limit <1-10> rate-time <15-600> window-size <1-21>

An example of key generation:

.. code-block:: none

   vyos@vyos:~$ generate system login username otptester otp-key hotp-time rate-limit 2 rate-time 20 window-size 5
   # You can share it with the user, he just needs to scan the QR in his OTP app
   # username:  otptester
   # OTP KEY:  J5A64ERPMGJOZXY6FMHHLKXKANNI6TCY
   # OTP URL:  otpauth://totp/otptester@vyos?secret=J5A64ERPMGJOZXY6FMHHLKXKANNI6TCY&digits=6&period=30
   █████████████████████████████████████████████
   █████████████████████████████████████████████
   ████ ▄▄▄▄▄ █▀█ █▄   ▀▄▀▄█▀▄  ▀█▀ █ ▄▄▄▄▄ ████
   ████ █   █ █▀▀▀█ ▄▀ █▄▀ ▀▄ ▄ ▀  ▄█ █   █ ████
   ████ █▄▄▄█ █▀ █▀▀██▄▄ █ █ ██ ▀▄▀ █ █▄▄▄█ ████
   ████▄▄▄▄▄▄▄█▄▀ ▀▄█ █ ▀ █ █ █ █▄█▄█▄▄▄▄▄▄▄████
   ████ ▄   █▄ ▄ ▀▄▀▀▀▀▄▀▄▀▄▄▄▀▀▄▄▄  █ █▄█ █████
   ████▄▄ ██▀▄▄▄▀▀█▀ ▄ ▄▄▄ ▄▀ ▀ █ ▄ ▄ ██▄█  ████
   █████▄  ██▄▄▀█▄█▄█▄ ▀█▄▀▄ ▀█▀▄ █▄▄▄ ▄   ▄████
   ████▀▀▄   ▄█▀▄▀ ▄█▀█▀▄▄▄▀█▄ ██▄▄▄  ▀█ █  ████
   ████ ▄▀▄█▀▄▄█▀▀▄▀▀▀▀█ ▄▀▄▀ ▄█ ▀▄  ▄ ▄▀ █▄████
   ████▄ ██ ▀▄▀▀ ▄█▀ ▄ ██ ▀█▄█ ▄█ ▄ ▀▄   ▄▄ ████
   ████▄█▀▀▄ ▄▄ █▄█▄█▄ █▄▄▀▄▄▀▀▄▄██▀ ▄▀▄▄ ▀▄████
   ████▀▄▀ ▄ ▄▀█ ▄ ▄█▀ █  ▀▄▄  ▄█▀ ▄▄   ▀▄▄ ████
   ████  ▀███▄ █▄█▄▀▀▀▀▄ ▄█▄▄▀ ▀███ ▄▄█▄▄  ▄████
   ████ ███▀ ▄▄▀▀██▀ ▄▀▄█▄▄▄ ██▄▄▀▄▀  ███▄ ▄████
   ████▄████▄▄▄▀▄ █▄█▄▀▄▄▄▄██▀ ▄▀ ▄ ▄▄▄ █▄▄█████
   ████ ▄▄▄▄▄ █▄▄▄ ▄█▀█▀▀▀▀█▀█▀ █▄█ █▄█ ▄█  ████
   ████ █   █ █ ██▄▀▀▀▀▄▄▄▀ ▄▄▄  ▀ ▄    ▄ ▄▄████
   ████ █▄▄▄█ █ ▀▀█▀ ▄▄█ █▄▄██▀▀█▀ █▄▀▄██▄█ ████
   ████▄▄▄▄▄▄▄█▄█▄█▄█▄▄▄▄▄█▄▄▄█▄██████▄██▄▄▄████
   █████████████████████████████████████████████
   █████████████████████████████████████████████
   # To add this OTP key to configuration, run the following commands:
   set system login user otptester authentication otp key 'J5A64ERPMGJOZXY6FMHHLKXKANNI6TCY'
   set system login user otptester authentication otp rate-limit '2'
   set system login user otptester authentication otp rate-time '20'
   set system login user otptester authentication otp window-size '5'

Display OTP key for user
^^^^^^^^^^^^^^^^^^^^^^^^

To display the configured OTP user key, use the command:

.. cfgcmd:: sh system login authentication user <username> otp
   <full|key-b32|qrcode|uri>

An example:

.. code-block:: none

   vyos@vyos:~$ sh system login authentication user otptester otp full
   # You can share it with the user, he just needs to scan the QR in his OTP app
   # username: otptester
   # OTP KEY: J5A64ERPMGJOZXY6FMHHLKXKANNI6TCY
   # OTP URL: otpauth://totp/otptester@vyos?secret=J5A64ERPMGJOZXY6FMHHLKXKANNI6TCY&digits=6&period=30
   █████████████████████████████████████████████
   █████████████████████████████████████████████
   ████ ▄▄▄▄▄ █▀█ █▄   ▀▄▀▄█▀▄  ▀█▀ █ ▄▄▄▄▄ ████
   ████ █   █ █▀▀▀█ ▄▀ █▄▀ ▀▄ ▄ ▀  ▄█ █   █ ████
   ████ █▄▄▄█ █▀ █▀▀██▄▄ █ █ ██ ▀▄▀ █ █▄▄▄█ ████
   ████▄▄▄▄▄▄▄█▄▀ ▀▄█ █ ▀ █ █ █ █▄█▄█▄▄▄▄▄▄▄████
   ████ ▄   █▄ ▄ ▀▄▀▀▀▀▄▀▄▀▄▄▄▀▀▄▄▄  █ █▄█ █████
   ████▄▄ ██▀▄▄▄▀▀█▀ ▄ ▄▄▄ ▄▀ ▀ █ ▄ ▄ ██▄█  ████
   █████▄  ██▄▄▀█▄█▄█▄ ▀█▄▀▄ ▀█▀▄ █▄▄▄ ▄   ▄████
   ████▀▀▄   ▄█▀▄▀ ▄█▀█▀▄▄▄▀█▄ ██▄▄▄  ▀█ █  ████
   ████ ▄▀▄█▀▄▄█▀▀▄▀▀▀▀█ ▄▀▄▀ ▄█ ▀▄  ▄ ▄▀ █▄████
   ████▄ ██ ▀▄▀▀ ▄█▀ ▄ ██ ▀█▄█ ▄█ ▄ ▀▄   ▄▄ ████
   ████▄█▀▀▄ ▄▄ █▄█▄█▄ █▄▄▀▄▄▀▀▄▄██▀ ▄▀▄▄ ▀▄████
   ████▀▄▀ ▄ ▄▀█ ▄ ▄█▀ █  ▀▄▄  ▄█▀ ▄▄   ▀▄▄ ████
   ████  ▀███▄ █▄█▄▀▀▀▀▄ ▄█▄▄▀ ▀███ ▄▄█▄▄  ▄████
   ████ ███▀ ▄▄▀▀██▀ ▄▀▄█▄▄▄ ██▄▄▀▄▀  ███▄ ▄████
   ████▄████▄▄▄▀▄ █▄█▄▀▄▄▄▄██▀ ▄▀ ▄ ▄▄▄ █▄▄█████
   ████ ▄▄▄▄▄ █▄▄▄ ▄█▀█▀▀▀▀█▀█▀ █▄█ █▄█ ▄█  ████
   ████ █   █ █ ██▄▀▀▀▀▄▄▄▀ ▄▄▄  ▀ ▄    ▄ ▄▄████
   ████ █▄▄▄█ █ ▀▀█▀ ▄▄█ █▄▄██▀▀█▀ █▄▀▄██▄█ ████
   ████▄▄▄▄▄▄▄█▄█▄█▄█▄▄▄▄▄█▄▄▄█▄██████▄██▄▄▄████
   █████████████████████████████████████████████
   █████████████████████████████████████████████
   # To add this OTP key to configuration, run the following commands:
   set system login user otptester authentication otp key 'J5A64ERPMGJOZXY6FMHHLKXKANNI6TCY'
   set system login user otptester authentication otp rate-limit '2'
   set system login user otptester authentication otp rate-time '20'
   set system login user otptester authentication otp window-size '5'

Once a user has 2FA/OTP configured against their account, they must login
using their password with the OTP code appended to it.
For example: If the users password is vyosrocks and the OTP code is 817454
then they would enter their password as vyosrocks817454


RADIUS
======

In large deployments it is not reasonable to configure each user individually
on every system. VyOS supports using :abbr:`RADIUS (Remote Authentication
Dial-In User Service)` servers as backend for user authentication.

Configuration
-------------

.. cfgcmd:: set system login radius server <address> key <secret>

   Specify the IP `<address>` of the RADIUS server user with the pre-shared-secret
   given in `<secret>`.

   Multiple servers can be specified.

.. cfgcmd:: set system login radius server <address> port <port>

   Configure the discrete port under which the RADIUS server can be reached.

   This defaults to 1812.

.. cfgcmd:: set system login radius server <address> disable

   Temporary disable this RADIUS server. It won't be queried.

.. cfgcmd:: set system login radius server <address> timeout <timeout>

   Setup the `<timeout>` in seconds when querying the RADIUS server.

.. cfgcmd:: set system login radius source-address <address>

   RADIUS servers could be hardened by only allowing certain IP addresses to
   connect. As of this the source address of each RADIUS query can be
   configured.

   If unset, incoming connections to the RADIUS server will use the nearest
   interface address pointing towards the server - making it error prone on
   e.g. OSPF networks when a link fails and a backup route is taken.

.. cfgcmd:: set system login radius vrf <name>

   Source all connections to the RADIUS servers from given VRF `<name>`.

Configuration Example
---------------------

.. code-block:: none

  set system login radius server 192.168.0.2 key 'test-vyos'
  set system login radius server 192.168.0.2 port '1812'
  set system login radius server 192.168.0.2 timeout '5'
  set system login radius source-address '192.168.0.1'


   If there is no communication between VyOS and RADIUS server users can 
   authenticate from local user accounts. During authentication from the local
   accounts users can observe some timeouts. Timeout in seconds depends on
   the configured timeout option.

.. hint:: If you want to have admin users to authenticate via RADIUS it is
   essential to sent the ``Cisco-AV-Pair shell:priv-lvl=15`` attribute. Without
   the attribute you will only get regular, non privilegued, system users.

TACACS+
=======

In addition to :abbr:`RADIUS (Remote Authentication Dial-In User Service)`,
:abbr:`TACACS (Terminal Access Controller Access Control System)` can also be
found in large deployments.

TACACS is defined in :rfc:`8907`.

.. _TACACS Configuration:

Configuration
-------------

.. cfgcmd:: set system login tacas server <address> key <secret>

   Specify the IP `<address>` of the TACACS server user with the pre-shared-secret
   given in `<secret>`.

   Multiple servers can be specified.

.. cfgcmd:: set system login tacas server <address> port <port>

   Configure the discrete port under which the TACACS server can be reached.

   This defaults to 49.

.. cfgcmd:: set system login tacas server <address> disable

   Temporary disable this TACACS server. It won't be queried.

.. cfgcmd:: set system login tacas server <address> timeout <timeout>

   Setup the `<timeout>` in seconds when querying the TACACS server.

.. cfgcmd:: set system login tacas source-address <address>

   TACACS servers could be hardened by only allowing certain IP addresses to
   connect. As of this the source address of each TACACS query can be
   configured.

   If unset, incoming connections to the TACACS server will use the nearest
   interface address pointing towards the server - making it error prone on
   e.g. OSPF networks when a link fails and a backup route is taken.

.. cfgcmd:: set system login tacas vrf <name>

   Source all connections to the TACACS servers from given VRF `<name>`.

.. _login:tacacs_example:

Configuration Example
---------------------

.. code-block:: none

  set system login tacacs server 192.168.0.2 key 'test-vyos'
  set system login tacacs server 192.168.0.2 port '49'
  set system login tacacs source-address '192.168.0.1'


   If there is no communication between VyOS and TACACS server users can 
   authenticate from local user accounts.

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

Limits
======

Login limits

.. cfgcmd:: set system login max-login-session <number>

   Set a limit on the maximum number of concurrent logged-in users on
   the system.

   This option must be used with ``timeout`` option.

.. cfgcmd:: set system login timeout <timeout>

   Configure session timeout after which the user will be logged out.

Example
=======

In the following example, both `User1` and `User2` will be able to SSH into
VyOS as user ``vyos`` using their very own keys. `User1` is restricted to only
be able to connect from a single IP address. In addition if password base login
is wanted for the ``vyos`` user a 2FA/MFA keycode is required in addition to
the password.

.. code-block:: none

  set system login user vyos authentication public-keys 'User1' key "AAAAB3Nz...KwEW"
  set system login user vyos authentication public-keys 'User1' type ssh-rsa
  set system login user vyos authentication public-keys 'User1' options "from=&quot;192.168.0.100&quot;"

  set system login user vyos authentication public-keys 'User2' key "AAAAQ39x...fbV3"
  set system login user vyos authentication public-keys 'User2' type ssh-rsa

  set system login user vyos authentication otp key OHZ3OJ7U2N25BK4G7SOFFJTZDTCFUUE2
  set system login user vyos authentication plaintext-password vyos

TACACS Example
--------------

We use a vontainer providing the TACACS serve rin this example.

Load the container image in op-mode.

.. code-block:: none

   add container image lfkeitel/tacacs_plus:latest

.. code-block:: none

   set container network tac-test prefix '100.64.0.0/24'

   set container name tacacs1 image 'lfkeitel/tacacs_plus:latest'
   set container name tacacs1 network tac-test address '100.64.0.11'

   set container name tacacs2 image 'lfkeitel/tacacs_plus:latest'
   set container name tacacs2 network tac-test address '100.64.0.12'

   set system login tacacs server 100.64.0.11 key 'tac_plus_key'
   set system login tacacs server 100.64.0.12 key 'tac_plus_key'

   commit

You can now SSH into your system using admin/admin as a default user supplied
from the ``lfkeitel/tacacs_plus:latest`` container.
