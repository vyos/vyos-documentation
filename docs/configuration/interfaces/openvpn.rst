:lastproofread: 2021-07-05

.. _openvpn:

#######
OpenVPN
#######

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

************
Site-to-Site
************

.. figure:: /_static/images/openvpn_site2site_diagram.jpg

OpenVPN is popular for client-server setups, but its site-to-site mode
remains a relatively obscure feature, and many router appliances
still don't support it. However, it's very useful for quickly setting up
tunnels between routers.

As of VyOS 1.4, OpenVPN site-to-site mode can use either pre-shared keys or x.509 certificates.

The pre-shared key mode is deprecated and will be removed from future OpenVPN versions,
so VyOS will have to remove support for that option as well. The reason is that using pre-shared keys
is significantly less secure than using TLS.

We'll configure OpenVPN using self-signed certificates, and then discuss the legacy
pre-shared key mode.

In both cases, we will use the following settings:

* The public IP address of the local side of the VPN will be 198.51.100.10.
* The public IP address of the remote side of the VPN will be 203.0.113.11.
* The tunnel will use 10.255.1.1 for the local IP and 10.255.1.2 for the remote.
* The local site will have a subnet of 10.0.0.0/16.
* The remote site will have a subnet of 10.1.0.0/16.
* The official port for OpenVPN is 1194, which we reserve for client VPN; we
  will use 1195 for site-to-site VPN.
* The ``persistent-tunnel`` directive will allow us to configure tunnel-related
  attributes, such as firewall policy as we would on any normal network
  interface.
* If known, the IP of the remote router can be configured using the
  ``remote-host`` directive; if unknown, it can be omitted. We will assume a
  dynamic IP for our remote router.

Setting up certificates
=======================

Setting up a full-blown PKI with a CA certificate would arguably defeat the purpose
of site-to-site OpenVPN, since its main goal is supposed to be configuration simplicity,
compared to server setups that need to support multiple clients.

However, since VyOS 1.4, it is possible to verify self-signed certificates using
certificate fingerprints.

On both sides, you need to generate a self-signed certificate, preferrably using the "ec" (elliptic curve) type.
You can generate them by executing command ``run generate pki certificate self-signed install <name>`` in the configuration mode.
Once the command is complete, it will add the certificate to the configuration session, to the ``pki`` subtree.
You can then review the proposed changes and commit them.

.. code-block:: none

  vyos@vyos# run generate pki certificate self-signed install openvpn-local
  Enter private key type: [rsa, dsa, ec] (Default: rsa) ec
  Enter private key bits: (Default: 256) 
  Enter country code: (Default: GB) 
  Enter state: (Default: Some-State) 
  Enter locality: (Default: Some-City) 
  Enter organization name: (Default: VyOS) 
  Enter common name: (Default: vyos.io) 
  Do you want to configure Subject Alternative Names? [y/N] 
  Enter how many days certificate will be valid: (Default: 365) 
  Enter certificate type: (client, server) (Default: server) 
  Note: If you plan to use the generated key on this router, do not encrypt the private key.
  Do you want to encrypt the private key with a passphrase? [y/N] 
  2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
  [edit]

  vyos@vyos# compare 
  [pki]
  + certificate openvpn-local {
  +     certificate "MIICJTCCAcugAwIBAgIUMXLfRNJ5iOjk/    uAZqUe4phW8MdgwCgYIKoZIzj0EAwIwVzELMAkGA1UEBhMCR0IxEzARBgNVBAgMClNvbWUtU3RhdGUxEjAQBgNVBAcMCVNvbWUtQ2l0eTENMAsGA1UECgwEVnlPUzEQMA4GA1UEAwwHdnlvcy5pbzAeFw0yMzA5MDcyMTQzMTNaFw0yNDA5MDYyMTQzMTNaMFcxCzAJBgNVBAYTAkdCMRMwEQYDVQQIDApTb21lLVN0YXRlMRIwEAYDVQQHDAlTb21lLUNpdHkxDTALBgNVBAoMBFZ5T1MxEDAOBgNVBAMMB3Z5b3MuaW8wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASp7D0vE3SKSAWAzr/lw9Eq9Q89r247AJR6ec/GT26AIcVA1bsongV1YaWvRwzTPC/yi5pkzV/PcT/WU7JQIyMWo3UwczAMBgNVHRMBAf8EAjAAMA4GA1UdDwEB/wQEAwIHgDATBgNVHSUEDDAKBggrBgEFBQcDATAdBgNVHQ4EFgQUBrAxRdFppdG/UBRdo7qNyHutaTQwHwYDVR0jBBgwFoAUBrAxRdFppdG/UBRdo7qNyHutaTQwCgYIKoZIzj0EAwIDSAAwRQIhAI2+8C92z9wTcTWkQ/goRxs10EBC+h78O+vgo9k97z5iAiBSeqfaVr5taQTS31+McGTAK3cYWNTg0DlOBI8aKO2oRg=="
  +     private {
  +         key "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgtOeEb0dMb5P/2Exi09WWvk6Cvz0oOBoDuP68ZimS2LShRANCAASp7D0vE3SKSAWAzr/lw9Eq9Q89r247AJR6ec/GT26AIcVA1bsongV1YaWvRwzTPC/yi5pkzV/PcT/WU7JQIyMW"
  +     }
  + }

  [edit]

  vyos@vyos# commit

You do **not** need to copy the certificate to the other router. Instead, you need to retrieve its SHA-256 fingerprint.
OpenVPN only supports SHA-256 fingerprints at the moment, so you need to use the following command:

.. code-block:: none

  vyos@vyos# run show pki certificate openvpn-local fingerprint sha256 
  5C:B8:09:64:8B:59:51:DC:F4:DF:2C:12:5C:B7:03:D1:68:94:D7:5B:62:C2:E1:83:79:F1:F0:68:B2:81:26:79

Note: certificate names don't matter, we use 'openvpn-local' and 'openvpn-remote' but they can be arbitrary.

Repeat the procedure on the other router.

Setting up OpenVPN
==================

Local Configuration:

.. code-block:: none

  Configure the tunnel:

  set interfaces openvpn vtun1 mode site-to-site
  set interfaces openvpn vtun1 protocol udp
  set interfaces openvpn vtun1 persistent-tunnel
  set interfaces openvpn vtun1 remote-host '203.0.113.11'                         # Public IP of the other side
  set interfaces openvpn vtun1 local-port '1195'
  set interfaces openvpn vtun1 remote-port '1195'
  set interfaces openvpn vtun1 local-address '10.255.1.1'                         # Local IP of vtun interface
  set interfaces openvpn vtun1 remote-address '10.255.1.2'                        # Remote IP of vtun interface
  set interfaces openvpn vtun1 tls certificate 'openvpn-local'                    # The self-signed certificate
  set interfaces openvpn vtun1 tls peer-fingerprint <remote cert fingerprint>     # The output of 'run show pki certificate <name> fingerprint sha256
                                                                                    on the remote rout

Remote Configuration:

.. code-block:: none

  set interfaces openvpn vtun1 mode site-to-site
  set interfaces openvpn vtun1 protocol udp
  set interfaces openvpn vtun1 persistent-tunnel
  set interfaces openvpn vtun1 remote-host '198.51.100.10'                         # Pub IP of other site
  set interfaces openvpn vtun1 local-port '1195'
  set interfaces openvpn vtun1 remote-port '1195'
  set interfaces openvpn vtun1 local-address '10.255.1.2'                          # Local IP of vtun interface
  set interfaces openvpn vtun1 remote-address '10.255.1.1'                         # Remote IP of vtun interface
  set interfaces openvpn vtun1 tls certificate 'openvpn-remote'                    # The self-signed certificate
  set interfaces openvpn vtun1 tls peer-fingerprint <local cert fingerprint>       # The output of 'run show pki certificate <name> fingerprint sha256
                                                                                    on the local router

Pre-shared keys
===============

Until VyOS 1.4, the only option for site-to-site OpenVPN without PKI was to use pre-shared keys.
That option is still available but it is deprecated and will be removed in the future.
However, if you need to set up a tunnel to an older VyOS version or a system with older OpenVPN,
you need to still need to know how to use it.

First, you need to generate a key by running ``run generate pki openvpn shared-secret install <name>`` from configuration mode.
You can use any name, we will use ``s2s``.

.. code-block:: none

  vyos@local# run generate pki openvpn shared-secret install s2s
  2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
  [edit]
  vyos@local# compare
  [pki openvpn shared-secret]
  + s2s {
  +     key   "7c73046a9da91e874d31c7ad894a32688cda054bde157c64270f28eceebc0bb2f44dbb70335fad45148b0456aaa78cb34a34c0958eeed4f75e75fd99ff519ef940f7029a316c436d2366a2b0fb8ea1d1c792a65f67d10a461af83ef4530adc25d1c872de6d9c7d5f338223d1f3b66dc3311bbbddc0e05228c47b91c817c721aadc7ed18f0662df52ad14f898904372679e3d9697d062b0869d12de47ceb2e626fa12e1926a3119be37dd29c9b0ad81997230f4038926900d5edb78522d2940cfe207f8e2b948e0d459fa137ebb18064ac5982b28dd1899020b4f2b082a20d5d4eb65710fbb1e62b5e061df39620267eab429d3eedd9a1ae85957457c8e4655f3"
  +     version "1"
  + }

  [edit]

  vyos@local# commit
  [edit]

Then you need to install the key on the remote router:

.. code-block:: none

  vyos@remote# set pki openvpn shared-secret s2s key <generated key string>

Then you need to set the key in your OpenVPN interface settings:

.. code-block:: none

  set interfaces openvpn vtun1 shared-secret-key s2s

Firewall Exceptions
===================

For the OpenVPN traffic to pass through the WAN interface, you must create a
firewall exception.

.. code-block:: none

    set firewall name OUTSIDE_LOCAL rule 10 action accept
    set firewall name OUTSIDE_LOCAL rule 10 description 'Allow established/related'
    set firewall name OUTSIDE_LOCAL rule 10 state established enable
    set firewall name OUTSIDE_LOCAL rule 10 state related enable
    set firewall name OUTSIDE_LOCAL rule 20 action accept
    set firewall name OUTSIDE_LOCAL rule 20 description OpenVPN_IN
    set firewall name OUTSIDE_LOCAL rule 20 destination port 1195
    set firewall name OUTSIDE_LOCAL rule 20 log enable
    set firewall name OUTSIDE_LOCAL rule 20 protocol udp
    set firewall name OUTSIDE_LOCAL rule 20 source

You should also ensure that the OUTISDE_LOCAL firewall group is applied to the
WAN interface and a direction (local).

.. code-block:: none

    set firewall interface eth0 local name 'OUTSIDE-LOCAL'


Static Routing:

Static routes can be configured referencing the tunnel interface; for example,
the local router will use a network of 10.0.0.0/16, while the remote has a
network of 10.1.0.0/16:

Local Configuration:

.. code-block:: none

  set protocols static route 10.1.0.0/16 interface vtun1

Remote Configuration:

.. code-block:: none

  set protocols static route 10.0.0.0/16 interface vtun1

The configurations above will default to using 256-bit AES in GCM mode
for encryption (if both sides support NCP) and SHA-1 for HMAC authentication.
SHA-1 is considered weak, but other hashing algorithms are available, as are
encryption algorithms:

For Encryption:

This sets the cipher when NCP (Negotiable Crypto Parameters) is disabled or
OpenVPN version < 2.4.0.

.. code-block:: none

  vyos@vyos# set interfaces openvpn vtun1 encryption cipher
  Possible completions:
    des          DES algorithm
    3des         DES algorithm with triple encryption
    bf128        Blowfish algorithm with 128-bit key
    bf256        Blowfish algorithm with 256-bit key
    aes128       AES algorithm with 128-bit key CBC
    aes128gcm    AES algorithm with 128-bit key GCM
    aes192       AES algorithm with 192-bit key CBC
    aes192gcm    AES algorithm with 192-bit key GCM
    aes256       AES algorithm with 256-bit key CBC
    aes256gcm    AES algorithm with 256-bit key GCM

This sets the accepted ciphers to use when version => 2.4.0 and NCP is
enabled (which is the default). Default NCP cipher for versions >= 2.4.0 is
aes256gcm. The first cipher in this list is what server pushes to clients.

.. code-block:: none

  vyos@vyos# set int open vtun0 encryption ncp-ciphers
  Possible completions:
    des          DES algorithm
    3des         DES algorithm with triple encryption
    aes128       AES algorithm with 128-bit key CBC
    aes128gcm    AES algorithm with 128-bit key GCM
    aes192       AES algorithm with 192-bit key CBC
    aes192gcm    AES algorithm with 192-bit key GCM
    aes256       AES algorithm with 256-bit key CBC
    aes256gcm    AES algorithm with 256-bit key GCM

For Hashing:

.. code-block:: none

  vyos@vyos# set interfaces openvpn vtun1 hash
  Possible completions:
    md5          MD5 algorithm
    sha1         SHA-1 algorithm
    sha256       SHA-256 algorithm
    sha512       SHA-512 algorithm

If you change the default encryption and hashing algorithms, be sure that the
local and remote ends have matching configurations, otherwise the tunnel will
not come up.


Firewall policy can also be applied to the tunnel interface for `local`, `in`,
and `out` directions and functions identically to ethernet interfaces.

If making use of multiple tunnels, OpenVPN must have a way to distinguish
between different tunnels aside from the pre-shared-key. This is either by
referencing IP address or port number. One option is to dedicate a public IP
to each tunnel. Another option is to dedicate a port number to each tunnel
(e.g. 1195,1196,1197...).

OpenVPN status can be verified using the `show openvpn` operational commands.
See the built-in help for a complete list of options.

******
Server
******

Multi-client server is the most popular OpenVPN mode on routers. It always uses
x.509 authentication and therefore requires a PKI setup. Refer this topic
:ref:`configuration/pki/index:pki` to generate a CA certificate,
a server certificate and key, a certificate revocation list, a Diffie-Hellman
key exchange parameters file. You do not need client certificates and keys for
the server setup.

In this example we will use the most complicated case: a setup where each
client is a router that has its own subnet (think HQ and branch offices), since
simpler setups are subsets of it.

Suppose you want to use 10.23.1.0/24 network for client tunnel endpoints and
all client subnets belong to 10.23.0.0/20. All clients need access to the
192.168.0.0/16 network.

First we need to specify the basic settings. 1194/UDP is the default. The
``persistent-tunnel`` option is recommended, it prevents the TUN/TAP device from
closing on connection resets or daemon reloads.

.. note:: Using **openvpn-option -reneg-sec** can be tricky. This option is
   used to renegotiate data channel after n seconds. When used at both server
   and client, the lower value will trigger the renegotiation. If you set it to
   0 on one side of the connection (to disable it), the chosen value on the
   other side will determine when the renegotiation will occur.

.. code-block:: none

  set interfaces openvpn vtun10 mode server
  set interfaces openvpn vtun10 local-port 1194
  set interfaces openvpn vtun10 persistent-tunnel
  set interfaces openvpn vtun10 protocol udp

Then we need to generate, add and specify the names of the cryptographic materials.
Each of the install command should be applied to the configuration and commited
before using under the openvpn interface configuration.

.. code-block:: none

  run generate pki ca install ca-1                                # Follow the instructions to generate CA cert.
  Configure mode commands to install:
  set pki ca ca-1 certificate 'generated_cert_string'
  set pki ca ca-1 private key 'generated_private_key'

  run generate pki certificate sign ca-1 install srv-1            # Follow the instructions to generate server cert.
  Configure mode commands to install:
  set pki certificate srv-1 certificate 'generated_server_cert'
  set pki certificate srv-1 private key 'generated_private_key'

  run generate pki dh install dh-1                                # Follow the instructions to generate set of
                                                                    Diffie-Hellman parameters.
  Generating parameters...
  Configure mode commands to install DH parameters:
  set pki dh dh-1 parameters 'generated_dh_params_set'

  set interfaces openvpn vtun10 tls ca-certificate ca-1
  set interfaces openvpn vtun10 tls certificate srv-1
  set interfaces openvpn vtun10 tls dh-params dh-1

Now we need to specify the server network settings. In all cases we need to
specify the subnet for client tunnel endpoints. Since we want clients to access
a specific network behind our router, we will use a push-route option for
installing that route on clients.

.. code-block:: none

  set interfaces openvpn vtun10 server push-route 192.168.0.0/16
  set interfaces openvpn vtun10 server subnet 10.23.1.0/24

Since it's a HQ and branch offices setup, we will want all clients to have
fixed addresses and we will route traffic to specific subnets through them. We
need configuration for each client to achieve this.

.. note:: Clients are identified by the CN field of their x.509 certificates,
   in this example the CN is ``client0``:

.. code-block:: none

  set interfaces openvpn vtun10 server client client0 ip 10.23.1.10
  set interfaces openvpn vtun10 server client client0 subnet 10.23.2.0/25

OpenVPN **will not** automatically create routes in the kernel for client
subnets when they connect and will only use client-subnet association
internally, so we need to create a route to the 10.23.0.0/20 network ourselves:

.. code-block:: none

  set protocols static route 10.23.0.0/20 interface vtun10

Additionally, each client needs a copy of ca cert and its own client key and
cert files. The files are plaintext so they may be copied either manually from the CLI.
Client key and cert files should be signed with the proper ca cert and generated on the
server side.

HQ's router requires the following steps to generate crypto materials for the Branch 1:

.. code-block:: none

  run generate pki certificate sign ca-1 install branch-1            # Follow the instructions to generate client
                                                                       cert for Branch 1
  Configure mode commands to install:

Branch 1's router might have the following lines:

.. code-block:: none

  set pki ca ca-1 certificate 'generated_cert_string'                # CA cert generated on HQ router
  set pki certificate branch-1 certificate 'generated_branch_cert'   # Client cert generated and signed on HQ router
  set pki certificate branch-1 private key 'generated_private_key'   # Client cert key generated on HQ router

  set interfaces openvpn vtun10 tls ca-cert ca-1
  set interfaces openvpn vtun10 tls certificate branch-1


Client Authentication
=====================

LDAP
----

Enterprise installations usually ship a kind of directory service which is used
to have a single password store for all employees. VyOS and OpenVPN support
using LDAP/AD as single user backend.

Authentication is done by using the ``openvpn-auth-ldap.so`` plugin which is
shipped with every VyOS installation. A dedicated configuration file is
required. It is best practise to store it in ``/config`` to survive image
updates

.. code-block:: none

  set interfaces openvpn vtun0 openvpn-option "--plugin /usr/lib/openvpn/openvpn-auth-ldap.so /config/auth/ldap-auth.config"

The required config file may look like this:

.. code-block:: none

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
^^^^^^^^^^^^^^^^

Despite the fact that AD is a superset of LDAP

.. code-block:: none

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

.. code-block:: none

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

A complete LDAP auth OpenVPN configuration could look like the following
example:

.. code-block:: none

  vyos@vyos# show interfaces openvpn
   openvpn vtun0 {
       mode server
       openvpn-option "--tun-mtu 1500 --fragment 1300 --mssfix"
       openvpn-option "--plugin /usr/lib/openvpn/openvpn-auth-ldap.so /config/auth/ldap-auth.config"
       openvpn-option "--push redirect-gateway"
       openvpn-option --duplicate-cn
       openvpn-option "--verify-client-cert none"
       openvpn-option --comp-lzo
       openvpn-option --persist-key
       openvpn-option --persist-tun
       server {
           domain-name example.com
           max-connections 5
           name-server 203.0.113.0.10
           name-server 198.51.100.3
           subnet 172.18.100.128/29
       }
       tls {
           ca-certificate ca.crt
           certificate server.crt
           dh-params dh1024.pem
       }
   }


******
Client
******

VyOS can not only act as an OpenVPN site-to-site or server for multiple clients.
You can indeed also configure any VyOS OpenVPN interface as an OpenVPN client
connecting to a VyOS OpenVPN server or any other OpenVPN server.

Given the following example we have one VyOS router acting as OpenVPN server
and another VyOS router acting as OpenVPN client. The server also pushes a
static client IP address to the OpenVPN client. Remember, clients are identified
using their CN attribute in the SSL certificate.

.. _openvpn:client_server:

Configuration
=============

Server Side
-----------

.. code-block:: none

  set interfaces openvpn vtun10 encryption cipher 'aes256'
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
  set interfaces openvpn vtun10 tls ca-cert ca-1
  set interfaces openvpn vtun10 tls certificate srv-1
  set interfaces openvpn vtun10 tls crypt-key srv-1
  set interfaces openvpn vtun10 tls dh-params dh-1
  set interfaces openvpn vtun10 use-lzo-compression

.. _openvpn:client_client:

Client Side
-----------

.. code-block:: none

  set interfaces openvpn vtun10 encryption cipher 'aes256'
  set interfaces openvpn vtun10 hash 'sha512'
  set interfaces openvpn vtun10 mode 'client'
  set interfaces openvpn vtun10 persistent-tunnel
  set interfaces openvpn vtun10 protocol 'udp'
  set interfaces openvpn vtun10 remote-host '172.18.201.10'
  set interfaces openvpn vtun10 remote-port '1194'
  set interfaces openvpn vtun10 tls ca-cert ca-1
  set interfaces openvpn vtun10 tls certificate client-1
  set interfaces openvpn vtun10 tls crypt-key client-1
  set interfaces openvpn vtun10 use-lzo-compression

Options
=======

We do not have CLI nodes for every single OpenVPN option. If an option is
missing, a feature request should be opened at Phabricator_ so all users can
benefit from it (see :ref:`issues_features`).

If you are a hacker or want to try on your own we support passing raw OpenVPN
options to OpenVPN.

.. cfgcmd:: set interfaces openvpn vtun10 openvpn-option 'persistent-key'

Will add ``persistent-key`` at the end of the generated OpenVPN configuration.
Please use this only as last resort - things might break and OpenVPN won't start
if you pass invalid options/syntax.

.. cfgcmd:: set interfaces openvpn vtun10 openvpn-option
   'push &quot;keepalive 1 10&quot;'

Will add ``push "keepalive 1 10"`` to the generated OpenVPN config file.

.. note:: Sometimes option lines in the generated OpenVPN configuration require
   quotes. This is done through a hack on our config generator. You can pass
   quotes using the ``&quot;`` statement.

Server bridge
=============

In Ethernet bridging configurations, OpenVPN's server mode can be set as a
'bridge' where the VPN tunnel encapsulates entire Ethernet frames 
(up to 1514 bytes) instead of just IP packets (up to 1500 bytes). This setup 
allows clients to transmit Layer 2 frames through the OpenVPN tunnel. Below,
we outline a basic configuration to achieve this:


Server Side:

.. code-block:: none

  set interfaces bridge br10 member interface eth1.10
  set interfaces bridge br10 member interface vtun10
  set interfaces openvpn vtun10 device-type 'tap'
  set interfaces openvpn vtun10 encryption data-ciphers 'aes192'
  set interfaces openvpn vtun10 hash 'sha256''
  set interfaces openvpn vtun10 local-host '172.18.201.10'
  set interfaces openvpn vtun10 local-port '1194'
  set interfaces openvpn vtun10 mode 'server'
  set interfaces openvpn vtun10 server bridge gateway '10.10.0.1'
  set interfaces openvpn vtun10 server bridge start '10.10.0.100'
  set interfaces openvpn vtun10 server bridge stop '10.10.0.200'
  set interfaces openvpn vtun10 server bridge subnet-mask '255.255.255.0'
  set interfaces openvpn vtun10 server topology 'subnet'
  set interfaces openvpn vtun10 tls ca-certificate 'ca-1'
  set interfaces openvpn vtun10 tls certificate 'srv-1'
  set interfaces openvpn vtun10 tls dh-params 'srv-1'

Client Side :

.. code-block:: none

  set interfaces openvpn vtun10 device-type 'tap'
  set interfaces openvpn vtun10 encryption data-ciphers 'aes192'
  set interfaces openvpn vtun10 hash 'sha256''
  set interfaces openvpn vtun10 mode 'client'
  set interfaces openvpn vtun10 protocol 'udp'
  set interfaces openvpn vtun10 remote-host '172.18.201.10'
  set interfaces openvpn vtun10 remote-port '1194'
  set interfaces openvpn vtun10 tls ca-certificate 'ca-1'
  set interfaces openvpn vtun10 tls certificate 'client-1'

***************************
Multi-factor Authentication
***************************

VyOS supports multi-factor authentication (MFA) or two-factor authentication 
using Time-based One-Time Password (TOTP). Compatible with Google Authenticator
software token, other software tokens.

MFA TOTP options
================

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp challenge <enable | disable>

  If set to enable, openvpn-otp will expect password as result of challenge/
  response protocol.

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp digits <1-65535>    

  Configure number of digits to use for totp hash (default: 6)
    
.. cfgcmd:: set interfaces openvpn <interface> server mfa totp drift <1-65535>

  Configure time drift in seconds (default: 0)

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp slop <1-65535>

  Configure maximum allowed clock slop in seconds (default: 180)

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp step <1-65535>

  Configure step value for totp in seconds (default: 30)

Example
=======

.. code-block:: none

  set interfaces openvpn vtun20 encryption cipher 'aes256'
  set interfaces openvpn vtun20 hash 'sha512'
  set interfaces openvpn vtun20 mode 'server'
  set interfaces openvpn vtun20 persistent-tunnel
  set interfaces openvpn vtun20 server client user1
  set interfaces openvpn vtun20 server mfa totp challenge 'disable'
  set interfaces openvpn vtun20 server subnet '10.10.2.0/24'
  set interfaces openvpn vtun20 server topology 'subnet'
  set interfaces openvpn vtun20 tls ca-certificate 'openvpn_vtun20'
  set interfaces openvpn vtun20 tls certificate 'openvpn_vtun20'
  set interfaces openvpn vtun20 tls dh-params 'dh-pem'

For every client in the openvpn server configuration a totp secret is created.
To display the authentication information, use the command:

.. cfgcmd:: show interfaces openvpn <interface> user <username> mfa <qrcode|secret|uri>

An example:

.. code-block:: none

   vyos@vyos:~$ sh interfaces openvpn vtun20 user user1 mfa qrcode
   █████████████████████████████████████
   █████████████████████████████████████
   ████ ▄▄▄▄▄ █▀▄▀ ▀▀▄▀ ▀▀▄ █ ▄▄▄▄▄ ████
   ████ █   █ █▀▀▄ █▀▀▀█▀██ █ █   █ ████
   ████ █▄▄▄█ █▀█ ▄ █▀▀ █▄▄▄█ █▄▄▄█ ████
   ████▄▄▄▄▄▄▄█▄█ █ █ ▀ █▄▀▄█▄▄▄▄▄▄▄████
   ████▄▄ ▄ █▄▄ ▄▀▄█▄ ▄▀▄█ ▄▄▀ ▀▄█ ▀████
   ████ ▀██▄▄▄█▄ ██ █▄▄▄▄ █▄▀█ █ █▀█████
   ████ ▄█▀▀▄▄  ▄█▀  ▀▄ ▄▄▀▄█▀▀▀ ▄▄▀████
   ████▄█ ▀▄▄▄▀  ▀ ▄█ ▄ █▄█▀ █▀  █▀█████
   ████▀█▀ ▀ ▄█▀▄▀▀█▄██▄█▀▀  ▀ ▀ ▄█▀████
   ████ ██▄▄▀▄▄█ ██ ▀█ ▄█ ▀▄█  █▀██▀████
   ████▄███▄█▄█ ▀█▄ ██▄▄▄█▀ ▄▄▄ █ ▀ ████
   ████ ▄▄▄▄▄ █▄█▀▄ ▀▄ ▀█▀  █▄█ ██▀█████
   ████ █   █ █ ▄█▀█▀▀▄ ▄▀▀▄▄▄▄▄▄   ████
   ████ █▄▄▄█ █ ▄ ▀ █▄▄▄██▄▀█▄▀▄█▄ █████
   ████▄▄▄▄▄▄▄█▄██▄█▄▄▄▄▄█▄█▄█▄██▄██████
   █████████████████████████████████████
   █████████████████████████████████████

Use the QR code to add the user account in Google authenticator application and
on client side, use the OTP number as password.


**********************************
OpenVPN Data Channel Offload (DCO)
**********************************

OpenVPN Data Channel Offload (DCO) enables significant performance enhancement
in encrypted OpenVPN data processing. By minimizing context switching for each
packet, DCO effectively reduces overhead. This optimization is achieved by
keeping most data handling tasks within the kernel, avoiding frequent switches
between kernel and user space for encryption and packet handling.

As a result, the processing of each packet becomes more efficient, potentially
leveraging hardware encryption offloading support available in the kernel.

.. note:: OpenVPN DCO is not full OpenVPN features supported , is currently
   considered experimental. Furthermore, there are certain OpenVPN features and
   use cases that remain incompatible with DCO. To get a comprehensive
   understanding of the limitations associated with DCO, refer to the list of
   known limitations in the documentation.

   https://community.openvpn.net/openvpn/wiki/DataChannelOffload/Features


Enabling OpenVPN DCO
====================

DCO support is a per-tunnel option and it is not automatically enabled by 
default for new or upgraded tunnels. Existing tunnels will continue to function 
as they have in the past.

DCO can be enabled for both new and existing tunnels,VyOS adds an option in each 
tunnel configuration where we can enable this function  .The current best 
practice is to create a new tunnel with DCO to minimize the chance of problems 
with existing clients.

.. cfgcmd:: set interfaces openvpn <name> offload dco

  Enable OpenVPN Data Channel Offload feature by loading the appropriate kernel
  module.

  Disabled by default - no kernel module loaded.

  .. note:: Enable this feature causes an interface reset.


Troubleshooting
===============

VyOS provides some operational commands on OpenVPN.

Check status
------------

The following commands let you check tunnel status.

.. opcmd:: show openvpn client

   Use this command to check the tunnel status for OpenVPN client interfaces.

.. opcmd:: show openvpn server

   Use this command to check the tunnel status for OpenVPN server interfaces.

.. opcmd:: show openvpn site-to-site

   Use this command to check the tunnel status for OpenVPN site-to-site
   interfaces.


Reset OpenVPN
-------------

The following commands let you reset OpenVPN.

.. opcmd:: reset openvpn client <text>

   Use this command to reset the specified OpenVPN client.

.. opcmd:: reset openvpn interface <interface>

   Use this command to reset the OpenVPN process on a specific interface.



.. include:: /_include/common-references.txt
