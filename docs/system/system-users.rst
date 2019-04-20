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

  set system login radius server 192.168.1.2 key 's3cr3t0815'
  set system login radius server 192.168.1.2 timeout '5'
  set system login radius server 192.168.1.2 port '1812'
  set system login radius server 192.168.1.3 key 's3cr3t0816'

This configuration results in:

.. code-block:: sh

  show system login radius
   server 192.168.1.2 {
       key s3cr3t0815
       timeout 5
       port 1812
   }
   server 192.168.1.3 {
       key s3cr3t0816
   }

RADIUS Source Address
*********************

If you are using e.g. OSPF as IGP always the nearest interface facing the RADIUS
server is used. With VyOS 1.2 you can bind all outgoing RADIUS requests to a
single source IP e.g. the loopback interface.

.. code-block:: sh

  set system login radius source-address 3.3.3.3

Above command will use `3.3.3.3` as source IPv4 address for all queries originating
from this NAS.
