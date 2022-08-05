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
will receive an IP address from a VPN pool, allowing full access to the 
network.

*************
Configuration
*************

SSL Certificates
================

We need to generate the certificate which authenticates users who attempt to
access the network resource through the SSL VPN tunnels. The following commands
will create a self signed certificates and will be stored in configuration:

.. code-block:: none

  run generate pki ca install <CA name>
  run generate pki certificate sign <CA name> install <Server name>
 
We can also create the certificates using Cerbort which is an easy-to-use 
client that fetches a certificate from Let's Encrypt an open certificate 
authority launched by the EFF, Mozilla, and others and deploys it to a web 
server.

.. code-block:: none

  sudo certbot certonly --standalone --preferred-challenges http -d <domain name>

Server Configuration
====================

.. code-block:: none

  set vpn openconnect authentication local-users username <user> password <pass>
  set vpn openconnect authentication mode <local password|radius>
  set vpn openconnect network-settings client-ip-settings subnet <subnet>
  set vpn openconnect network-settings name-server <address>
  set vpn openconnect network-settings name-server <address>
  set vpn openconnect ssl ca-certificate <pki-ca-name>
  set vpn openconnect ssl certificate <pki-cert-name>
  set vpn openconnect ssl passphrase <pki-password>

2FA OTP support 
====================

Instead of password only authentication, 2FA password 
authentication + OTP key can be used. Alternatively, OTP authentication only,
without a password, can be used.
To do this, an OTP configuration must be added to the configuration above:

.. code-block:: none

  set vpn openconnect authentication mode local <password-otp|otp>
  set vpn openconnect authentication local-users username <user> otp <key>
  set vpn openconnect authentication local-users username <user> interval <interval (optional)>
  set vpn openconnect authentication local-users username <user> otp-length <otp-length (optional)>
  set vpn openconnect authentication local-users username <user> token-type <token-type (optional)>

For generating an OTP key in VyOS, you can use the CLI command 
(operational mode):

.. code-block:: none

  generate openconnect username <user> otp-key hotp-time

************
Verification
************

.. code-block:: none


  vyos@vyos:~$ sh openconnect-server sessions
  interface    username    ip             remote IP    RX       TX         state      uptime
  -----------  ----------  -------------  -----------  -------  ---------  ---------  --------
  sslvpn0      tst         172.20.20.198  192.168.6.1  0 bytes  152 bytes  connected  3s

.. note:: It is compatible with Cisco (R) AnyConnect (R) clients.

*******
Example
*******

SSL Certificates generation
===========================

Follow the instructions to generate CA cert (in configuration mode):

.. code-block:: none

  vyos@vyos# run generate pki ca install ca-ocserv
  Enter private key type: [rsa, dsa, ec] (Default: rsa)
  Enter private key bits: (Default: 2048)
  Enter country code: (Default: GB) US
  Enter state: (Default: Some-State) Delaware
  Enter locality: (Default: Some-City) Mycity
  Enter organization name: (Default: VyOS) MyORG
  Enter common name: (Default: vyos.io) oc-ca
  Enter how many days certificate will be valid: (Default: 1825) 3650
  Note: If you plan to use the generated key on this router, do not encrypt the private key.
  Do you want to encrypt the private key with a passphrase? [y/N] N
  2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
  [edit]

Follow the instructions to generate server cert (in configuration mode):

.. code-block:: none

  vyos@vyos# run generate pki certificate sign ca-ocserv install srv-ocserv
  Do you already have a certificate request? [y/N] N
  Enter private key type: [rsa, dsa, ec] (Default: rsa)
  Enter private key bits: (Default: 2048)
  Enter country code: (Default: GB) US
  Enter state: (Default: Some-State) Delaware
  Enter locality: (Default: Some-City) Mycity
  Enter organization name: (Default: VyOS) MyORG
  Enter common name: (Default: vyos.io) oc-srv
  Do you want to configure Subject Alternative Names? [y/N] N
  Enter how many days certificate will be valid: (Default: 365) 1830
  Enter certificate type: (client, server) (Default: server)
  Note: If you plan to use the generated key on this router, do not encrypt the private key.
  Do you want to encrypt the private key with a passphrase? [y/N] N
  2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
  [edit]

Each of the install command should be applied to the configuration and commited
before using under the openconnect configuration:

.. code-block:: none

  vyos@vyos# commit
  [edit]
  vyos@vyos# save
  Saving configuration to '/config/config.boot'...
  Done
  [edit]

Openconnect Configuration
=========================

Simple setup with one user added and password authentication:

.. code-block:: none

  set vpn openconnect authentication local-users username tst password 'OC_bad_Secret'
  set vpn openconnect authentication mode local password
  set vpn openconnect network-settings client-ip-settings subnet '172.20.20.0/24'
  set vpn openconnect network-settings name-server '10.1.1.1'
  set vpn openconnect network-settings name-server '10.1.1.2'
  set vpn openconnect ssl ca-certificate 'ca-ocserv'
  set vpn openconnect ssl certificate 'srv-ocserv'

Adding a 2FA with an OTP-key
============================

First the OTP keys must be generated and sent to the user and to the 
configuration:

.. code-block:: none

  vyos@vyos:~$ generate openconnect username tst otp-key hotp-time
  # You can share it with the user, he just needs to scan the QR in his OTP app
  # username:  tst
  # OTP KEY:  5PA4SGYTQSGOBO3H3EQSSNCUNZAYAPH2
  # OTP URL:  otpauth://totp/tst@vyos?secret=5PA4SGYTQSGOBO3H3EQSSNCUNZAYAPH2&digits=6&period=30
  █████████████████████████████████████████
  █████████████████████████████████████████
  ████ ▄▄▄▄▄ █▀ ██▄▀ ▄█▄▀▀▄▄▄▄██ ▄▄▄▄▄ ████
  ████ █   █ █▀ █▄▄▀▀▀▄█  ▄▄▀▄ █ █   █ ████
  ████ █▄▄▄█ █▀█▀▄▄▀  ▄▀ █▀ ▀▄██ █▄▄▄█ ████
  ████▄▄▄▄▄▄▄█▄█▄▀ ▀▄█ ▀ ▀ ▀ █▄█▄▄▄▄▄▄▄████
  ████  ▄▄▄▀▄▄  ▄███▀▄▀█▄██▀ ▀▄ ▀▄█ ▀ ▀████
  ████ ▀▀ ▀ ▄█▄ ▀ ▀▄ ▄█▀ ▄█ ▄▀▀▄██    █████
  ████▄ █▄▀▀▄█▀ ▀█▄█▄▄▄▄ ▄▀█▀▀█ ▀ ▄ ▀█▀████
  █████  ▀█▀▄▄ █ ▀▄▄  ▄█▄    ▀█▀▀ █▀ ▄█████
  ████▀██▀█▄▄ ▀▀▀▀█▄▀ ▀█▄▄▀▀▀ ▀ ▀█▄██▀▀████
  ████▄ ▄ ▄▀▄██▀█ ▄ ▀▄██ ▄▄  ▀▀▄█▄██ ▄█████
  ████▀▀ ▄▀ ▄ ▀█▀█▀█  █▀█▄▄▀█▀█▄██▄▄█ ▀████
  ████ █ ▀█▄▄█▄ ▀ ▄▄▀▀  ▀ █▄█▀████ █▀ ▀████
  ████▄██▄██▄█▀ ▄▀ ▄▄▀▄  ▄▀█ ▄ ▄▄▄ ▀█▄ ████
  ████ ▄▄▄▄▄ █▄  ▀█▄█ ▄ ▀ ▄ ▄  █▄█ ▄▀▄█████
  ████ █   █ █ ▀▄██▄▄▀█▄▀▄██▄▀  ▄  ▀██▀████
  ████ █▄▄▄█ █ ██▀▄▄  ▀▄▄▀█▀ ▀█ ▄▀█ ▀██████
  ████▄▄▄▄▄▄▄█▄███▄███▄█▄▄▄▄█▄▄█▄██▄█▄█████
  █████████████████████████████████████████
  █████████████████████████████████████████
  # To add this OTP key to configuration, run the following commands:
  set vpn openconnect authentication local-users username tst otp key 'ebc1c91b13848ce0bb67d9212934546e41803cfa'

Next it is necessary to configure 2FA for OpenConnect:

.. code-block:: none

  set vpn openconnect authentication mode local password-otp
  set vpn openconnect authentication local-users username tst otp key 'ebc1c91b13848ce0bb67d9212934546e41803cfa'

Now when connecting the user will first be asked for the password 
and then the OTP key.

.. warning:: When using Time-based one-time password (TOTP) (OTP HOTP-time),
  be sure that the time on the server and the 
  OTP token generator are synchronized by NTP

To display the configured OTP user settings, use the command:

.. code-block:: none

  show openconnect-server user <username> otp <full|key-b32|key-hex|qrcode|uri>
