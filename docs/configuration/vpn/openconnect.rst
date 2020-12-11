.. _vpn-openconnect:

###########
OpenConnect
###########

OpenConnect-compatible server feature is available from this release.
Openconnect VPN supports SSL connection and offers full network access. SSL VPN
network extension connects the end-user system to the corporate network with
access controls based only on network layer information, such as destination IP
address and port number. So, it provides safe communication for all types of
device traffic across public networks and private networks, also encrypts the
traffic with SSL protocol.

The remote user will use the openconnect client to connect to the router and
will receive an IP address from a VPN pool, allowing full access to the network.

.. note:: All certificates should be stored on VyOS under /config/auth. If
   certificates are not stored in the /config directory they will not be
   migrated during a software update.

*************
Configuration
*************

SSL Certificates
================

We need to generate the certificate which authenticates users who attempt to
access the network resource through the SSL VPN tunnels. The following command
will create a self signed certificates and will be stored in the file path
`/config/auth`.

.. code-block:: none

  openssl req -newkey rsa:4096 -new -nodes -x509 -days 3650 -keyout /config/auth/server.key -out /config/auth/server.crt
  openssl req -new -x509 -key /config/auth/server.key -out /config/auth/ca.crt

We can also create the certificates using Cerbort which is an easy-to-use client
that fetches a certificate from Let's Encrypt an open certificate authority
launched by the EFF, Mozilla, and others and deploys it to a web server.

.. code-block:: none

  sudo certbot certonly --standalone --preferred-challenges http -d <domain name>

Server Configuration
====================

.. code-block:: none

  set vpn openconnect authentication local-users username <user> password <pass>
  set vpn openconnect authentication mode <local|radius>
  set vpn opneconnect network-settings client-ip-settings subnet <subnet>
  set vpn openconnect network-settings name-server <address>
  set vpn openconnect network-settings name-server <address>
  set vpn openconnect ssl ca-cert-file <file>
  set vpn openconnect ssl cert-file <file>
  set vpn openconnect ssl key-file <file>


*******
Example
*******

Use local user name "user4" with password "SecretPassword"
Client IP addresses will be provided from pool 100.64.0.0/24
The Gateway IP Address must be in one of the router´s interfaces.

.. code-block:: none

  set vpn openconnect authentication local-users username user4 password 'SecretPassword'
  set vpn openconnect authentication mode 'local'
  set vpn openconnect network-settings client-ip-settings subnet '100.64.0.0/24'
  set vpn openconnect network-settings name-server '10.1.1.1'
  set vpn openconnect network-settings name-server '10.1.1.2'
  set vpn openconnect ssl ca-cert-file '/config/auth/fullchain.pem'
  set vpn openconnect ssl cert-file '/config/auth/cert.pem'
  set vpn openconnect ssl key-file '/config/auth/privkey.pem'


************
Verification
************

.. code-block:: none


  vyos@RTR1:~$ show openconnect-server sessions

  interface    username    ip            remote IP      RX        TX        state      uptime
  -----------  ----------  ------------  -------------  --------  --------  ---------  --------
  sslvpn0      user4       100.64.0.105  xx.xxx.49.253  127.3 KB  160.0 KB  connected  12m:28s

.. note:: It is compatible with Cisco (R) AnyConnect (R) clients.
