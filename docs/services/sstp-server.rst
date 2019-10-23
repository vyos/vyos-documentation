
SSTP server
------------

VyOS utilizes accel-ppp_ to provide SSTP server functionality. It can be
used with local authentication or a connected RADIUS server.

.. note:: **Please be aware, due to an upstream bug, config changes/commits
   will restart the ppp daemon and will reset existing PPPoE connections from
   connected users, in order to become effective.**

Configuration
^^^^^^^^^^^^^

The `Secure Socket Tunneling Protocol`_ (SSTP), provides ppp via a SSL/TLS channel.
Using publically signed certificates as well a by private PKI, is fully supported.
All certificates should be stored on VyOS under ``/config/user-data/sstp``.


Self Signed CA and server certificates
======================================

To generate the CA, the server private key and certificates the following commands can be used.

.. code-block:: sh

  vyos@vyos:~$ conf
  [edit]
  vyos@vyos# mkdir -p /config/user-data/sstp && cd /config/user-data/sstp
  [edit]
  openssl req -newkey rsa:4096 -new -nodes -x509 -days 3650 -keyout server.key -out server.crt

  Generating a 4096 bit RSA private key
  .........................++
  ...............................................................++
  writing new private key to 'server.key'
  [...]
  Country Name (2 letter code) [AU]:
  State or Province Name (full name) [Some-State]:
  Locality Name (eg, city) []:
  Organization Name (eg, company) [Internet Widgits Pty Ltd]:
  Organizational Unit Name (eg, section) []:
  Common Name (e.g. server FQDN or YOUR name) []:
  Email Address []:

  vyos@vyos# openssl req -new -x509 -key server.key -out ca.crt
  [...]
  Country Name (2 letter code) [AU]:
  State or Province Name (full name) [Some-State]:
  Locality Name (eg, city) []:
  Organization Name (eg, company) [Internet Widgits Pty Ltd]:
  Organizational Unit Name (eg, section) []:
  Common Name (e.g. server FQDN or YOUR name) []:
  Email Address []:
  [edit]
  vyos@vyos# 


The example below will answer configuration request for the user user ``foo``.

Use <tab> to setup the ``set sstp-settings ssl-certs ...``, it automatically looks for all files and directories in ``/config/user-data/sstp``. 

.. code-block:: sh

  edit service sstp-server
  set authentication local-users username foo password 'bar'
  set authentication mode 'local'
  set network-settings client-ip-settings gateway-address '10.100.100.1'
  set network-settings client-ip-settings subnet '192.168.0.0/24'
  set network-settings dns-server primary-dns '10.100.100.1'
  set network-settings dns-server secondary-dns '10.200.100.1'
  set sstp-settings ssl-certs ca 'ca.crt'
  set sstp-settings ssl-certs server-cert 'server.crt'
  set sstp-settings ssl-certs server-key 'server.key'


.. include:: references.rst
