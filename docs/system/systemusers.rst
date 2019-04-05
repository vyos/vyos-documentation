.. _systemusers:

System Users
------------

The default vyos user account, as well as newly created user accounts, have all capabilities to configure the system.
All accounts have sudo capabilities and therefore can operate as root on the system.
Setting the level to admin is optional, all accounts on the system 
will have admin privileges.


Creating Login User Accounts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

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

SSH Access using Shared Public Keys
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The following command will load the public key `dev.pub` for user `jsmith`

.. code-block:: sh

  loadkey jsmith dev.pub

.. note:: This requires uploading the `dev.pub` public key to the VyOS router
   first. As an alternative you can also load the SSH public key directly
   from a remote system:

.. code-block:: sh

  loadkey jsmith scp://devuser@dev001.vyos.net/home/devuser/.ssh/dev.pub
