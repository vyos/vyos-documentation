.. _tftp-server:

TFTP
----

Trivial File Transfer Protocol (TFTP_) is a simple lockstep File Transfer
Protocol which allows a client to get a file from or put a file onto a remote
host. One of its primary uses is in the early stages of nodes booting from a
local area network. TFTP has been used for this application because it is very
simple to implement.

Example
^^^^^^^

.. code-block:: none

  # If you want to enable uploads, else TFTP server will act as read-only (optional)
  set service tftp-server allow-upload

  # Directory for TFTP server content
  set service tftp-server directory '/config/tftpboot'

  # On which addresses we want to listen for incoming TFTP connections? (mandatory)
  set service tftp-server listen-address '2001:db8:ffee::1'
  set service tftp-server listen-address '10.10.1.1'

.. note:: Choose your ``directory`` location carefully or you will loose the
   content on image upgrades. Any directory under ``/config`` is save at this
   will be migrated.

.. note:: Configuring a listen-address is essential for the service to work.

The resulting configuration will look like:

.. code-block:: none

  vyos@vyos# show service
   tftp-server {
      allow-upload
      directory /config/tftpboot
      listen-address 2001:db8:ffee::1
      listen-address 10.10.1.1
   }

