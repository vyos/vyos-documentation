.. _openvpn:

OpenVPN
-------

Traditionally hardware routers implement IPsec exclusively due to relative
ease of implementing it in hardware and insufficient CPU power for doing
encryption in software. Since VyOS is a software router, this is less of a
concern. OpenVPN has been widely used on UNIX platform for a long time and is
a popular option for remote access VPN, though it's also capable of
site-to-site connections.

Advantages of OpenVPN are:

* It uses a single TCP or UDP connection and does not rely on packet source
  addresses, so it will work even through a double NAT: perfect for public
  hotspots and such

* It's easy to setup and offers very flexible split tunneling

* There's a variety of client GUI frontends for any platform

Disadvantages are:

* It's slower than IPsec due to higher protocol overhead and the fact it runs
  in user mode while IPsec, on Linux, is in kernel mode

* None of the operating systems have client software installed by default

In the VyOS CLI, a key point often overlooked is that rather than being
configured using the `set vpn` stanza, OpenVPN is configured as a network
interface using `set interfaces openvpn`.

OpenVPN Site-To-Site
^^^^^^^^^^^^^^^^^^^^

While many are aware of OpenVPN as a Client VPN solution, it is often
overlooked as a site-to-site VPN solution due to lack of support for this mode
in many router platforms.

Site-to-site mode supports x.509 but doesn't require it and can also work with
static keys, which is simpler in many cases. In this example, we'll configure
a simple site-to-site OpenVPN tunnel using a 2048-bit pre-shared key.

First, one one of the systems generate the key using the operational command
`generate openvpn key <filename>`. This will generate a key with the name
provided in the `/config/auth/` directory. Once generated, you will need to
copy this key to the remote router.

In our example, we used the filename `openvpn-1.key` which we will reference
in our configuration.

* The public IP address of the local side of the VPN will be 198.51.100.10
* The remote will be 203.0.113.11
* The tunnel will use 10.255.1.1 for the local IP and 10.255.1.2 for the remote.
* OpenVPN allows for either TCP or UDP. UDP will provide the lowest latency,
  while TCP will work better for lossy connections; generally UDP is preferred
  when possible.
* The official port for OpenVPN is 1194, which we reserve for client VPN; we
  will use 1195 for site-to-site VPN.
* The `persistent-tunnel` directive will allow us to configure tunnel-related
  attributes, such as firewall policy as we would on any normal network
  interface.
* If known, the IP of the remote router can be configured using the
  `remote-host` directive; if unknown, it can be omitted. We will assume a
  dynamic IP for our remote router.

Local Configuration:

.. code-block:: sh

  set interfaces openvpn vtun1 mode site-to-site
  set interfaces openvpn vtun1 protocol udp
  set interfaces openvpn vtun1 persistent-tunnel
  set interfaces openvpn vtun1 local-host '198.51.100.10'
  set interfaces openvpn vtun1 local-port '1195'
  set interfaces openvpn vtun1 remote-port '1195'
  set interfaces openvpn vtun1 shared-secret-key-file '/config/auth/openvpn-1.key'
  set interfaces openvpn vtun1 local-address '10.255.1.1'
  set interfaces openvpn vtun1 remote-address '10.255.1.2'

Remote Configuration:

.. code-block:: sh

  set interfaces openvpn vtun1 mode site-to-site
  set interfaces openvpn vtun1 protocol udp
  set interfaces openvpn vtun1 persistent-tunnel
  set interfaces openvpn vtun1 remote-host '198.51.100.10'
  set interfaces openvpn vtun1 local-port '1195'
  set interfaces openvpn vtun1 remote-port '1195'
  set interfaces openvpn vtun1 shared-secret-key-file '/config/auth/openvpn-1.key'
  set interfaces openvpn vtun1 local-address '10.255.1.2'
  set interfaces openvpn vtun1 remote-address '10.255.1.1'

The configurations above will default to using 128-bit Blowfish in CBC mode
for encryption and SHA-1 for HMAC authentication. These are both considered
weak, but a number of other encryption and hashing algorithms are available:

For Encryption:

.. code-block:: sh

  vyos@vyos# set interfaces openvpn vtun1 encryption
  Possible completions:
    des          DES algorithm
    3des         DES algorithm with triple encryption
    bf128        Blowfish algorithm with 128-bit key
    bf256        Blowfish algorithm with 256-bit key
    aes128       AES algorithm with 128-bit key
    aes192       AES algorithm with 192-bit key
    aes256       AES algorithm with 256-bit key

For Hashing:

.. code-block:: sh

  vyos@vyos# set interfaces openvpn vtun1 hash
  Possible completions:
    md5          MD5 algorithm
    sha1         SHA-1 algorithm
    sha256       SHA-256 algorithm
    sha512       SHA-512 algorithm

If you change the default encryption and hashing algorithms, be sure that the
local and remote ends have matching configurations, otherwise the tunnel will
not come up.

Static routes can be configured referencing the tunnel interface; for example,
the local router will use a network of 10.0.0.0/16, while the remote has a
network of 10.1.0.0/16:

Local Configuration:

.. code-block:: sh

  set protocols static interface-route 10.1.0.0/16 next-hop-interface vtun1

Remote Configuration:

.. code-block:: sh

  set protocols static interface-route 10.0.0.0/16 next-hop-interface vtun1

Firewall policy can also be applied to the tunnel interface for `local`, `in`,
and `out` directions and function identically to ethernet interfaces.

If making use of multiple tunnels, OpenVPN must have a way to distinguish
between different tunnels aside from the pre-shared-key. This is either by
referencing IP address or port number. One option is to dedicate a public IP
to each tunnel. Another option is to dedicate a port number to each tunnel
(e.g. 1195,1196,1197...).

OpenVPN status can be verified using the `show openvpn` operational commands.
See the built-in help for a complete list of options.

OpenVPN Server
^^^^^^^^^^^^^^

Multi-client server is the most popular OpenVPN mode on routers. It always uses
x.509 authentication and therefore requires a PKI setup. This guide assumes you
have already setup a PKI and have a CA certificate, a server certificate and
key, a certificate revocation list, a Diffie-Hellman key exchange parameters
file. You do not need client certificates and keys for the server setup.

In this example we will use the most complicated case: a setup where each
client is a router that has its own subnet (think HQ and branch offices), since
simpler setups are subsets of it.

Suppose you want to use 10.23.1.0/24 network for client tunnel endpoints and
all client subnets belong to 10.23.0.0/20. All clients need access to the
192.168.0.0/16 network.

First we need to specify the basic settings. 1194/UDP is the default. The
`persistent-tunnel` option is recommended, it prevents the TUN/TAP device from
closing on connection resets or daemon reloads.


.. note:: Using **openvpn-option -reneg-sec** can be tricky. This option is used to renegotiate data channel after n seconds. When used at both server and client, the lower value will trigger the renegotiation. If you set it to 0 on one side of the connection (to disable it), the chosen value on the other side will determine when the renegotiation will occur.


.. code-block:: sh

  set interfaces openvpn vtun10 mode server
  set interfaces openvpn vtun10 local-port 1194
  set interfaces openvpn vtun10 persistent-tunnel
  set interfaces openvpn vtun10 protocol udp

Then we need to specify the location of the cryptographic materials. Suppose
you keep the files in `/config/auth/openvpn`

.. code-block:: sh

  set interfaces openvpn vtun10 tls ca-cert-file /config/auth/openvpn/ca.crt
  set interfaces openvpn vtun10 tls cert-file /config/auth/openvpn/server.crt
  set interfaces openvpn vtun10 tls key-file /config/auth/openvpn/server.key
  set interfaces openvpn vtun10 tls crl-file /config/auth/openvpn/crl.pem
  set interfaces openvpn vtun10 tls dh-file /config/auth/openvpn/dh2048.pem

Now we need to specify the server network settings. In all cases we need to
specify the subnet for client tunnel endpoints. Since we want clients to access
a specific network behind out router, we will use a push-route option for
installing that route on clients.

.. code-block:: sh

  set interfaces openvpn vtun10 server push-route 192.168.0.0/16
  set interfaces openvpn vtun10 server subnet 10.23.1.0/24

Since it's a HQ and branch offices setup, we will want all clients to have
fixed addresses and we will route traffic to specific subnets through them. We
need configuration for each client to achieve this.

.. note:: Clients are identified by the CN field of their x.509 certificates,
   in this example the CN is ``client0``:

.. code-block:: sh

  set interfaces openvpn vtun10 server client client0 ip 10.23.1.10
  set interfaces openvpn vtun10 server client client0 subnet 10.23.2.0/25

OpenVPN **will not** automatically create routes in the kernel for client
subnets when they connect and will only use client-subnet association
internally, so we need to create a route to the 10.23.0.0/20 network ourselves:

.. code-block:: sh

  set protocols static interface-route 10.23.0.0/20 next-hop-interface vtun10


Client Authentication
*********************

OpenLDAP
========

Enterprise installations usually ship a kind of directory service which is used
to have a single password store for all employees. VyOS and OpenVPN support using
LDAP/AD as single user backend.

Authentication is done by using the ``openvpn-auth-ldap.so`` plugin which is
shipped with every VyOS installation. A dedicated configuration file is required.
It is best practise to store it in ``/config`` to survive image updates

.. code-block:: sh

  set interfaces openvpn vtun0 openvpn-option "--plugin /usr/lib/openvpn/openvpn-auth-ldap.so /config/auth/ldap-auth.config"

The required config file may look like:

.. code-block:: sh

  <LDAP>
  # LDAP server URL
  URL             ldap://ldap.example.com
  # Bind DN (If your LDAP server doesn't support anonymous binds)
  BindDN          cn=LDAPUser,dc=example,dc=com
  # Bind Password password
  Password        S3cr3t
  # Network timeout (in seconds)
  Timeout         15
  </LDAP>

  <Authorization>
  # Base DN
  BaseDN          "ou=people,dc=example,dc=com"
  # User Search Filter
  SearchFilter    "(&(uid=%u)(objectClass=shadowAccount))"
  # Require Group Membership - allow all users
  RequireGroup    false
  </Authorization>

Active Directory
================

Despite the fact that AD is a superset of LDAP

.. code-block:: sh

  <LDAP>
    # LDAP server URL
    URL ldap://dc01.example.com
    # Bind DN (If your LDAP server doesn’t support anonymous binds)
    BindDN CN=LDAPUser,DC=example,DC=com
    # Bind Password
    Password mysecretpassword
    # Network timeout (in seconds)
    Timeout  15
    # Enable Start TLS
    TLSEnable no
    # Follow LDAP Referrals (anonymously)
    FollowReferrals no
  </LDAP>

  <Authorization>
    # Base DN
    BaseDN        "DC=example,DC=com"
    # User Search Filter, user must be a member of the VPN AD group
    SearchFilter  "(&(sAMAccountName=%u)(memberOf=CN=VPN,OU=Groups,DC=example,DC=com))"
    # Require Group Membership
    RequireGroup    false # already handled by SearchFilter
    <Group>
      BaseDN        "OU=Groups,DC=example,DC=com"
      SearchFilter  "(|(cn=VPN))"
      MemberAttribute  memberOf
    </Group>
  </Authorization>

If you only want to check if the user account is enabled and can authenticate
(against the primary group) the following snipped is sufficient:

.. code-block:: sh

  <LDAP>
    URL ldap://dc01.example.com
    BindDN CN=SA_OPENVPN,OU=ServiceAccounts,DC=example,DC=com
    Password ThisIsTopSecret
    Timeout  15
    TLSEnable no
    FollowReferrals no
  </LDAP>

  <Authorization>
    BaseDN          "DC=example,DC=com"
    SearchFilter    "sAMAccountName=%u"
    RequireGroup    false
  </Authorization>

A complete LDAP auth OpenVPN configuration could look like the following example:

.. code-block:: sh

  vyos@vyos# show interfaces openvpn
   openvpn vtun0 {
       mode server
       openvpn-option "--tun-mtu 1500 --fragment 1300 --mssfix"
       openvpn-option "--plugin /usr/lib/openvpn/openvpn-auth-ldap.so /config/auth/ldap-auth.config"
       openvpn-option "--push redirect-gateway"
       openvpn-option --duplicate-cn
       openvpn-option --client-cert-not-required
       openvpn-option --comp-lzo
       openvpn-option --persist-key
       openvpn-option --persist-tun
       server {
           domain-name example.com
           max-connections 5
           name-server 1.1.1.1
           name-server 9.9.9.9
           subnet 172.18.100.128/29
       }
       tls {
           ca-cert-file /config/auth/ca.crt
           cert-file /config/auth/server.crt
           dh-file /config/auth/dh1024.pem
           key-file /config/auth/server.key
       }
   }

OpenVPN Client
^^^^^^^^^^^^^^

VyOS can not only act as an OpenVPN site-to-site or Server for multiple clients.
You can indeed also configure any VyOS OpenVPN interface as an OpenVPN client
connecting to a VyOS OpenVPN server or any other OpenVPN server.

Given the following example we have one VyOS router acting as OpenVPN server
and another VyOS router acting as OpenVPN client. The Server also pushes a
static client IP address to the OpenVPN client. Remember, clients are identified
using their CN attribute in the SSL certificate.


Server
******

.. code-block:: sh

  set interfaces openvpn vtun10 encryption 'aes256'
  set interfaces openvpn vtun10 hash 'sha512'
  set interfaces openvpn vtun10 local-host '172.18.201.10'
  set interfaces openvpn vtun10 local-port '1194'
  set interfaces openvpn vtun10 mode 'server'
  set interfaces openvpn vtun10 persistent-tunnel
  set interfaces openvpn vtun10 protocol 'udp'
  set interfaces openvpn vtun10 server client client1 ip '10.10.0.10'
  set interfaces openvpn vtun10 server domain-name 'vyos.net'
  set interfaces openvpn vtun10 server max-connections '250'
  set interfaces openvpn vtun10 server name-server '172.16.254.30'
  set interfaces openvpn vtun10 server subnet '10.10.0.0/24'
  set interfaces openvpn vtun10 server topology 'subnet'
  set interfaces openvpn vtun10 tls ca-cert-file '/config/auth/ca.crt'
  set interfaces openvpn vtun10 tls cert-file '/config/auth/server.crt'
  set interfaces openvpn vtun10 tls dh-file '/config/auth/dh.pem'
  set interfaces openvpn vtun10 tls key-file '/config/auth/server.key'
  set interfaces openvpn vtun10 use-lzo-compression

Client
******

.. code-block:: sh

  set interfaces openvpn vtun10 encryption 'aes256'
  set interfaces openvpn vtun10 hash 'sha512'
  set interfaces openvpn vtun10 mode 'client'
  set interfaces openvpn vtun10 persistent-tunnel
  set interfaces openvpn vtun10 protocol 'udp'
  set interfaces openvpn vtun10 remote-host '172.18.201.10'
  set interfaces openvpn vtun10 remote-port '1194'
  set interfaces openvpn vtun10 tls ca-cert-file '/config/auth/ca.crt'
  set interfaces openvpn vtun10 tls cert-file '/config/auth/client1.crt'
  set interfaces openvpn vtun10 tls key-file '/config/auth/client1.key'
  set interfaces openvpn vtun10 use-lzo-compression

Options
^^^^^^^

We do not have CLI nodes for every single OpenVPN options. If an option is
missing, a feature request should be opened at https://phabricator.vyos.net so
all users can benefit from it.

If you are a hacker or want to try on your own we support passing raw OpenVPN
options to OpenVPN.

.. code-block:: sh

  set interfaces openvpn vtun10 openvpn-option 'persistent-key'

Will add `persistent-key` at the end of the generated OpenVPN configuration.
Please use this only as last resort - things might break and OpenVPN won't start
if you pass invalid options/syntax.
