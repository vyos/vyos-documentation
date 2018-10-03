System
======

System Users
------------

VyOS supports two levels of users: admin and operator.

The operator level restricts a user to operational commands and prevents
changes to system configuration. This is useful for gathering information
about the state of the system (dhcp leases, vpn connections, routing tables,
etc...) and for manipulating state of the system, such as resetting
connections, clearing counters and bringing up and taking down connection
oriented interfaces.

The admin level has all of the capabilities of the operator level, plus the
ability to change system configuration. The admin level also enables a user
to use the sudo command, which essentially means the user has root access to
the system.

Creating Login User Accounts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Create user account `jsmith`, with `admin` level access and the password
`mypassword`

.. code-block:: sh

  set system login user jsmith full-name "Johan Smith"
  set system login user jsmith authentication plaintext-password mypassword
  set system login user jsmith level admin

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

SSH Access using Shared Public Keys
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The following command will load the public key `dev.pub` for user `jsmith`

.. code-block:: sh

  loadkey jsmith dev.pub

**NOTE:** This requires uploading the `dev.pub` public key to the VyOS router
first. As an alternative you can also load the SSH public key directly from a
remote system:

.. code-block:: sh

  loadkey jsmith scp://devuser@dev001.vyos.net/home/devuser/.ssh/dev.pub

