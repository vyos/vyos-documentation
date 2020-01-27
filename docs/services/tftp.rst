.. _tftp-server:

###########
TFTP Server
###########

:abbr:`TFTP (Trivial File Transfer Protocol)` is a simple, lockstep file
transfer protocol which allows a client to get a file from or put a file onto
a remote host. One of its primary uses is in the early stages of nodes booting
from a local area network. TFTP has been used for this application because it
is very simple to implement.

Configuration
=============

.. cfgcmd:: set service tftp-server directory <directory>

Enable TFTP service by specifying the `<directory>` which will be used to serve
files.

.. hint:: Choose your ``directory`` location carefully or you will loose the
   content on image upgrades. Any directory under ``/config`` is save at this
   will be migrated.

.. cfgcmd:: set service tftp-server listen-address <address>

Configure the IPv4 or IPv6 listen address of the TFTP server. Multiple IPv4 and
IPv6 addresses can be given. There will be one TFTP server instances listening
on each IP address.

.. note:: Configuring a listen-address is essential for the service to work.

.. cfgcmd:: set service tftp-server allow-upload

Optional, if you want to enable uploads, else TFTP server will act as read-only
server.

Example
-------

Provide TFTP server listening on both IPv4 and IPv6 addresses ``192.0.2.1`` and
``2001:db8::1`` serving the content from ``/config/tftpboot``. Uploading via
TFTP to this server is not allowed!

The resulting configuration will look like:

.. code-block:: none

  vyos@vyos# show service
   tftp-server {
      directory /config/tftpboot
      listen-address 2001:db8::1
      listen-address 192.0.2.1
   }
