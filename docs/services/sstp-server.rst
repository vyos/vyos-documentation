.. _sstp_server:

###########
SSTP Server
###########

:abbr:`SSTP (Secure Socket Tunneling Protocol)` is a form of :abbr:`VPN
(Virtual Private Network)` tunnel that provides a mechanism to transport PPP
traffic through an SSL/TLS channel. SSL/TLS provides transport-level security
with key negotiation, encryption and traffic integrity checking. The use of
SSL/TLS over TCP port 443 allows SSTP to pass through virtually all firewalls
and proxy servers except for authenticated web proxies.

SSTP is available for Linux, BSD, and Windows.

VyOS utilizes accel-ppp_ to provide SSTP server functionality. We support both
local and RADIUS authentication.

As SSTP provides PPP via a SSL/TLS channel the use of either publically signed
certificates as well as a private PKI is required.

.. note:: All certificates should be stored on VyOS under
  ``/config/user-data/sstp``. If certificates are not stored unt ``/config``
  they will not be migrated during a software update.

Self Signed CA and Certificates
===============================

To generate the CA, the server private key and certificates the following
commands can be used.

.. code-block:: none


  vyos@vyos:~$ mkdir -p /config/user-data/sstp
  vyos@vyos:~$ openssl req -newkey rsa:4096 -new -nodes -x509 -days 3650 -keyout /config/user-data/sstp/server.key -out /config/user-data/sstp/server.crt

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

  vyos@vyos:~$ openssl req -new -x509 -key /config/user-data/sstp/server.key -out /config/user-data/sstp/ca.crt
  [...]
  Country Name (2 letter code) [AU]:
  State or Province Name (full name) [Some-State]:
  Locality Name (eg, city) []:
  Organization Name (eg, company) [Internet Widgits Pty Ltd]:
  Organizational Unit Name (eg, section) []:
  Common Name (e.g. server FQDN or YOUR name) []:
  Email Address []:


Configuration
=============

.. cfgcmd:: set service sstp-server authentication local-users username <user> password <pass>

  Create `<user>` for local authentication on this system. The users password
  will be set to `<pass>`.

.. cfgcmd:: set service sstp-server authentication protocols <pap | chap | mschap | mschap-v2>

  Require the peer to authenticate itself using one of the following protocols:
  pap, chap, mschap, mschap-v2.

.. cfgcmd:: set service sstp-server authentication mode <local | radius>

  Set authentication backend. The configured authentication backend is used
  for all queries.

  * **radius**: All authentication queries are handled by a configured RADIUS
    server.
  * **local**: All authentication queries are handled locally.


.. cfgcmd:: set service sstp-server network-settings client-ip-settings gateway-address <gateway>

  Specifies single `<gateway>` IP address to be used as local address of PPP
  interfaces.


.. cfgcmd:: set service sstp-server network-settings client-ip-settings subnet <subnet>

  Use `<subnet>` as the IP pool for all connecting clients.


.. cfgcmd:: set service sstp-server network-settings dns-server primary-dns <address>

  Connected client should use `<address>` as their primary DNS server.


.. cfgcmd:: set service sstp-server network-settings dns-server secondary-dns <address>

  Connected client should use `<address>` as their secondary DNS server.

SSL Certificates
----------------

.. cfgcmd:: set service sstp-server sstp-settings ssl-certs ca <file>

  Path to `<file>` pointing to the certificate authority certificate.

.. cfgcmd:: set service sstp-server sstp-settings ssl-certs server-cert <file>

  Path to `<file>` pointing to the servers certificate (public portion).

.. cfgcmd:: set service sstp-server sstp-settings ssl-certs server-key <file>

  Path to `<file>` pointing to the servers certificate (private portion).

PPP Settings
------------

.. cfgcmd:: set service sstp-server ppp-settings lcp-echo-failure <number>

  Defines the maximum `<number>` of unanswered echo requests. Upon reaching the
  value `<number>`, the session will be reset.

.. cfgcmd:: set service sstp-server ppp-settings lcp-echo-interval <interval>

  If this option is specified and is greater than 0, then the PPP module will
  send LCP pings of the echo request every `<interval>` seconds.

.. cfgcmd:: set service sstp-server ppp-settings lcp-echo-timeout

  Specifies timeout in seconds to wait for any peer activity. If this option
  specified it turns on adaptive lcp echo functionality and "lcp-echo-failure"
  is not used.

.. cfgcmd:: set service sstp-server ppp-settings mppe <require | prefer | deny>

  Specifies :abbr:`MPPE (Microsoft Point-to-Point Encryption)` negotioation
  preference.

  * **require** - ask client for mppe, if it rejects drop connection
  * **prefer** - ask client for mppe, if it rejects don't fail
  * **deny** - deny mppe

  Default behavior - don't ask client for mppe, but allow it if client wants.
  Please note that RADIUS may override this option by MS-MPPE-Encryption-Policy
  attribute.


RADIUS
------

Server
^^^^^^

.. cfgcmd:: set service sstp-server authentication radius-server <server> secret <secret>

  Configure RADIUS `<server>` and its required shared `<secret>` for
  communicating with the RADIUS server.

.. cfgcmd:: set service sstp-server authentication radius-server <server> secret <secret>

  Configure RADIUS `<server>` and its required shared `<secret>` for
  communicating with the RADIUS server.

.. cfgcmd:: set service sstp-server authentication radius-server <server> fail-time <time>

  Mark RADIUS server as offline for this given `<time>` in seconds.

.. cfgcmd:: set service sstp-server authentication radius-server <server> req-limit <limit>

  Maximum number of simultaneous requests to RADIUS server, default is
  unlimited.

Options
^^^^^^^

.. cfgcmd:: set service sstp-server authentication radius-settings acct-timeout

  Timeout to wait reply for Interim-Update packets. (default 3 seconds)


.. cfgcmd:: set service sstp-server authentication radius-settings dae-server ip-address <address>

  Specifies IP address for Dynamic Authorization Extension server (DM/CoA)


.. cfgcmd:: set service sstp-server authentication radius-settings dae-server port <port>

  Port for Dynamic Authorization Extension server (DM/CoA)


.. cfgcmd:: set service sstp-server authentication radius-settings dae-server secret <secret>

  Secret for Dynamic Authorization Extension server (DM/CoA)


.. cfgcmd:: set service sstp-server authentication radius-settings max-try <number>

  Maximum number of tries to send Access-Request/Accounting-Request queries


.. cfgcmd:: set service sstp-server authentication radius-settings timeout <timeout>

  Timeout to wait response from server (seconds)


.. cfgcmd:: set service sstp-server authentication radius-settings nas-identifier <identifier>

  Value to send to RADIUS server in NAS-Identifier attribute and to be matched
  in DM/CoA requests.


.. cfgcmd:: set service sstp-server authentication radius-settings nas-ip-address <address>

  Value to send to RADIUS server in NAS-IP-Address attribute and to be matched
  in DM/CoA requests. Also DM/CoA server will bind to that address.


.. cfgcmd:: set service sstp-server authentication radius-settings rate-limit attribute <attribute>

  Specifies which RADIUS server attribute contains the rate limit information.
  The default attribute is `Filter-Id`.


.. cfgcmd:: set service sstp-server authentication radius-settings rate-limit enable

  Enables bandwidth shaping via RADIUS.


.. cfgcmd:: set service sstp-server authentication radius-settings rate-limit vendor

  Specifies the vendor dictionary, dictionary needs to be in
  /usr/share/accel-ppp/radius.



Example
=======

* Use local user `foo` with password `bar`
* Client IP addresses will be provided from pool `192.0.2.0/24`

Use <tab> to setup the ``set sstp-settings ssl-certs ...``, it automatically
looks for all files and directories in ``/config/user-data/sstp``.

.. code-block:: none

  set service sstp-server authentication local-users username foo password 'bar'
  set service sstp-server authentication mode 'local'
  set service sstp-server network-settings client-ip-settings gateway-address '192.0.2.0'
  set service sstp-server network-settings client-ip-settings subnet '192.0.2.0/24'
  set service sstp-server network-settings dns-server primary-dns '10.100.100.1'
  set service sstp-server network-settings dns-server secondary-dns '10.200.100.1'
  set service sstp-server sstp-settings ssl-certs ca 'ca.crt'
  set service sstp-server sstp-settings ssl-certs server-cert 'server.crt'
  set service sstp-server sstp-settings ssl-certs server-key 'server.key'

.. include:: ../common-references.rst
