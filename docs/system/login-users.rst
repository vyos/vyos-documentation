.. _systemusers:

Login
-----

The default VyOS user account (`vyos`), as well as newly created user accounts,
have all capabilities to configure the system. All accounts have sudo capabilities
and therefore can operate as root on the system. Setting the level to admin is
optional, all accounts on the system will have admin privileges.

Both local administered and remote administered RADIUS (Remote Authentication
Dial-In User Service) accounts are supported.

Local
^^^^^

Create user account `jsmith` and the password `mypassword`.

.. code-block:: sh

  set system login user jsmith full-name "Johan Smith"
  set system login user jsmith authentication plaintext-password mypassword

The command:

.. code-block:: sh

  show system login

will show the contents of :code:`system login` configuration node:

.. code-block:: sh

  user jsmith {
      authentication {
          encrypted-password $6$0OQHjuQ8M$AYXVn7jufdfqPrSk4/XXsDBw99JBtNsETkQKDgVLptXogHA2bU9BWlvViOFPBoFxIi.iqjqrvsQdQ./cfiiPT.
          plaintext-password ""
      }
      full-name "Johan Smith"
      level admin
  }

SSH with Public Keys
********************

The following command will load the public key `dev.pub` for user `jsmith`

.. code-block:: sh

  loadkey jsmith dev.pub

.. note:: This requires uploading the `dev.pub` public key to the VyOS router
   first. As an alternative you can also load the SSH public key directly
   from a remote system:

.. code-block:: sh

  loadkey jsmith scp://devuser@dev001.vyos.net/home/devuser/.ssh/dev.pub

In addition SSH public keys can be fully added using the CLI. Each key can be
given a unique identifier, `calypso` is used oin the example below to id an SSH
key.

.. code-block:: sh

  set system login user jsmith authentication public-keys callisto key 'AAAAB3Hso...Q=='
  set system login user jsmith authentication public-keys callisto type 'ssh-rsa'

RADIUS
^^^^^^

VyOS supports using one or more RADIUS servers as backend for user authentication.

The following command sets up two servers for RADIUS authentication, one with a
discrete timeout of `5` seconds and a discrete port of `1812` and the other using
a default timeout and port.

.. code-block:: sh

  set system login radius-server 192.168.1.2 secret 's3cr3t0815'
  set system login radius-server 192.168.1.2 timeout '5'
  set system login radius-server 192.168.1.2 port '1812'
  set system login radius-server 192.168.1.3 secret 's3cr3t0816'

This configuration results in:

.. code-block:: sh

  show system login
   radius-server 192.168.1.2 {
       secret s3cr3t0815
       timeout 5
       port 1812
   }
   radius-server 192.168.1.3 {
       secret s3cr3t0816
   }

.. note:: If you wan't to have admin users to authenticate via RADIUS it is
   essential to sent the ``Cisco-AV-Pair shell:priv-lvl=15`` attribute. Without
   the attribute you will only get regular, non privilegued, system users.

Source Address
**************

RADIUS servers could be hardened by only allowing certain IP addresses to connect.
As of this the source address of each RADIUS query can be configured. If this is
not set incoming connections to the RADIUS server will use the nearest interface
address pointing towards the RADIUS server - making it error prone on e.g. OSPF
networks when a link fails.

.. code-block:: sh

  set system login radius-source-address 192.168.1.254

Login Banner
^^^^^^^^^^^^

You are able to set post-login or pre-login messages with the following lines:

.. code-block:: sh

  set system login banner pre-login "UNAUTHORIZED USE OF THIS SYSTEM IS PROHIBITED\n"
  set system login banner post-login "Welcome to VyOS"

the **\\n** create a newline.



