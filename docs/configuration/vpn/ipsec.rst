.. _ipsec:

#####
IPsec
#####

:abbr:`GRE (Generic Routing Encapsulation)`, GRE/IPsec (or IPIP/IPsec,
SIT/IPsec, or any other stateless tunnel protocol over IPsec) is the usual way
to protect the traffic inside a tunnel.

An advantage of this scheme is that you get a real interface with its own
address, which makes it easier to setup static routes or use dynamic routing
protocols without having to modify IPsec policies. The other advantage is that
it greatly simplifies router to router communication, which can be tricky with
plain IPsec because the external outgoing address of the router usually doesn't
match the IPsec policy of typical site-to-site setup and you need to add special
configuration for it, or adjust the source address for outgoing traffic of your
applications. GRE/IPsec has no such problem and is completely transparent for
the applications.

GRE/IPIP/SIT and IPsec are widely accepted standards, which make this scheme
easy to implement between VyOS and virtually any other router.

For simplicity we'll assume that the protocol is GRE, it's not hard to guess
what needs to be changed to make it work with a different protocol. We assume
that IPsec will use pre-shared secret authentication and will use AES128/SHA1
for the cipher and hash. Adjust this as necessary.

.. NOTE:: VMware users should ensure that a VMXNET3 adapter is used. E1000
  adapters have known issues with GRE processing.

**************************************
IKE (Internet Key Exchange) Attributes
**************************************

IKE performs mutual authentication between two parties and establishes
an IKE security association (SA) that includes shared secret information
that can be used to efficiently establish SAs for Encapsulating Security
Payload (ESP) or Authentication Header (AH) and a set of cryptographic
algorithms to be used by the SAs to protect the traffic that they carry.
https://datatracker.ietf.org/doc/html/rfc5996

In VyOS, IKE attributes are specified through IKE groups.
Multiple proposals can be specified in a single group.

VyOS IKE group has the next options:

* ``close-action`` defines the action to take if the remote peer unexpectedly
  closes a CHILD_SA:

 * ``none`` set action to none (default);

 * ``trap`` installs a trap policy for the CHILD_SA;

 * ``start`` tries to immediately re-create the CHILD_SA;

* ``dead-peer-detection`` controls the use of the Dead Peer Detection protocol
  (DPD, RFC 3706) where R_U_THERE notification messages (IKEv1) or empty
  INFORMATIONAL messages (IKEv2) are periodically sent in order to check the
  liveliness of the IPsec peer:

 * ``action`` keep-alive failure action:

  * ``trap``  installs a trap policy, which will catch matching traffic
    and tries to re-negotiate the tunnel on-demand;

  * ``clear`` closes the CHILD_SA and does not take further action (default);

  * ``restart`` immediately tries to re-negotiate the CHILD_SA
    under a fresh IKE_SA;

 * ``interval`` keep-alive interval in seconds <2-86400> (default 30);

 * ``timeout`` keep-alive timeout in seconds <2-86400> (default 120) IKEv1 only

* ``ikev2-reauth`` whether rekeying of an IKE_SA should also reauthenticate
  the peer. In IKEv1, reauthentication is always done.
  Setting this parameter enables remote host re-authentication during an IKE
  rekey.

* ``key-exchange`` which protocol should be used to initialize the connection
  If not set both protocols are handled and connections will use IKEv2 when
  initiating, but accept any protocol version when responding:

 * ``ikev1`` use IKEv1 for Key Exchange;

 * ``ikev2`` use IKEv2 for Key Exchange;

* ``lifetime`` IKE lifetime in seconds <0-86400> (default 28800);

* ``disable-mobike`` disables MOBIKE Support. MOBIKE is only available for IKEv2
  and enabled by default.

* ``mode`` IKEv1 Phase 1 Mode Selection:

 * ``main`` use Main mode for Key Exchanges in the IKEv1 Protocol
   (Recommended Default);

 * ``aggressive`` use Aggressive mode for Key Exchanges in the IKEv1 protocol
   aggressive mode is much more insecure compared to Main mode;

* ``proposal`` the list of proposals and their parameters:

 * ``dh-group`` dh-group;

 * ``encryption`` encryption algorithm;

 * ``hash`` hash algorithm.

 * ``prf`` pseudo-random function.

***********************************************
ESP (Encapsulating Security Payload) Attributes
***********************************************

ESP is used to provide confidentiality, data origin authentication,
connectionless integrity, an anti-replay service (a form of partial sequence
integrity), and limited traffic flow confidentiality.
https://datatracker.ietf.org/doc/html/rfc4303

In VyOS, ESP attributes are specified through ESP groups.
Multiple proposals can be specified in a single group.

VyOS ESP group has the next options:

* ``compression``  Enables the  IPComp(IP Payload Compression) protocol which
  allows compressing the content of IP packets.

* ``life-bytes`` ESP life in bytes <1024-26843545600000>.
  Number of bytes transmitted over an IPsec SA before it expires;

* ``life-packets`` ESP life in packets <1000-26843545600000>.
  Number of packets transmitted over an IPsec SA before it expires;

* ``lifetime`` ESP lifetime in seconds <30-86400> (default 3600).
  How long a particular instance of a connection (a set of
  encryption/authentication keys for user packets) should last,
  from successful negotiation to expiry;

* ``mode`` the type of the connection:

 * ``tunnel`` tunnel mode (default);

 * ``transport`` transport mode;

* ``pfs`` whether Perfect Forward Secrecy of keys is desired on the
  connection's keying channel and defines a Diffie-Hellman group for PFS:

 * ``enable`` Inherit Diffie-Hellman group from IKE group (default);

 * ``disable`` Disable PFS;

 * ``< dh-group >`` defines a Diffie-Hellman group for PFS;

* ``proposal`` ESP-group proposal with number <1-65535>:

 * ``encryption`` encryption algorithm (default 128 bit AES-CBC);

 * ``hash`` hash algorithm (default sha1).

***********************************************
Options (Global IPsec settings) Attributes
***********************************************

* ``options``

 * ``disable-route-autoinstall`` Do not automatically install routes to remote networks;

 * ``flexvpn`` Allows FlexVPN vendor ID payload (IKEv2 only). Send the Cisco FlexVPN vendor ID payload (IKEv2 only), which is required in order to make Cisco brand devices allow negotiating a local traffic selector (from strongSwan's point of view) that is not the assigned virtual IP address if such an address is requested by strongSwan. Sending the Cisco FlexVPN vendor ID prevents the peer from narrowing the initiator's local traffic selector and allows it to e.g. negotiate a TS of 0.0.0.0/0 == 0.0.0.0/0 instead. This has been tested with a "tunnel mode ipsec ipv4" Cisco template but should also work for GRE encapsulation;

 * ``interface`` Interface Name to use. The name of the interface on which virtual IP addresses should be installed. If not specified the addresses will be installed on the outbound interface;

 * ``virtual-ip`` Allows to install virtual-ip addresses. Comma separated list of virtual IPs to request in IKEv2 configuration payloads or IKEv1 Mode Config. The wildcard addresses 0.0.0.0 and :: request an arbitrary address, specific addresses may be defined. The responder may return a different address, though, or none at all. Define the ``virtual-address`` option to configure the IP address in site-to-site hierarchy.

*************************
IPsec policy matching GRE
*************************

The first and arguably cleaner option is to make your IPsec policy match GRE
packets between external addresses of your routers. This is the best option if
both routers have static external addresses.

Suppose the LEFT router has external address 192.0.2.10 on its eth0 interface,
and the RIGHT router is 203.0.113.45

On the LEFT:

.. code-block:: none

  # GRE tunnel
  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 source-address 192.0.2.10
  set interfaces tunnel tun0 remote 203.0.113.45
  set interfaces tunnel tun0 address 10.10.10.1/30

  ## IPsec
  set vpn ipsec interface eth0

  # Pre-shared-secret
  set vpn ipsec authentication psk vyos id 192.0.2.10
  set vpn ipsec authentication psk vyos id 203.0.113.45
  set vpn ipsec authentication psk vyos secret MYSECRETKEY

  # IKE group
  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group '2'
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption 'aes128'
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash 'sha1'

  # ESP group
  set vpn ipsec esp-group MyESPGroup proposal 1 encryption 'aes128'
  set vpn ipsec esp-group MyESPGroup proposal 1 hash 'sha1'

  # IPsec tunnel
  set vpn ipsec site-to-site peer right authentication mode pre-shared-secret
  set vpn ipsec site-to-site peer right authentication remote-id 203.0.113.45

  set vpn ipsec site-to-site peer right ike-group MyIKEGroup
  set vpn ipsec site-to-site peer right default-esp-group MyESPGroup

  set vpn ipsec site-to-site peer right local-address 192.0.2.10
  set vpn ipsec site-to-site peer right remote-address 203.0.113.45

  # This will match all GRE traffic to the peer
  set vpn ipsec site-to-site peer right tunnel 1 protocol gre

On the RIGHT, setup by analogy and swap local and remote addresses.


Source tunnel from dummy interface
==================================

The scheme above doesn't work when one of the routers has a dynamic external
address though. The classic workaround for this is to setup an address on a
loopback interface and use it as a source address for the GRE tunnel, then setup
an IPsec policy to match those loopback addresses.

We assume that the LEFT router has static 192.0.2.10 address on eth0, and the
RIGHT router has a dynamic address on eth0.

The peer names RIGHT and LEFT are used as informational text.

**Setting up the GRE tunnel**

On the LEFT:

.. code-block:: none

  set interfaces dummy dum0 address 192.168.99.1/32

  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 address 10.10.10.1/30
  set interfaces tunnel tun0 source-address 192.168.99.1
  set interfaces tunnel tun0 remote 192.168.99.2

On the RIGHT:

.. code-block:: none

  set interfaces dummy dum0 address 192.168.99.2/32

  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 address 10.10.10.2/30
  set interfaces tunnel tun0 source-address 192.168.99.2
  set interfaces tunnel tun0 remote 192.168.99.1

**Setting up IPSec**

However, now you need to make IPsec work with dynamic address on one side. The
tricky part is that pre-shared secret authentication doesn't work with dynamic
address, so we'll have to use RSA keys.

First, on both routers run the operational command "generate pki key-pair
install <key-pair name>". You may choose different length than 2048 of course.

.. code-block:: none

  vyos@left# run generate pki key-pair install ipsec-LEFT
  Enter private key type: [rsa, dsa, ec] (Default: rsa)
  Enter private key bits: (Default: 2048)
  Note: If you plan to use the generated key on this router, do not encrypt the private key.
  Do you want to encrypt the private key with a passphrase? [y/N] N
  Configure mode commands to install key pair:
  Do you want to install the public key? [Y/n] Y
  set pki key-pair ipsec-LEFT public key 'MIIBIjANBgkqh...'
  Do you want to install the private key? [Y/n] Y
  set pki key-pair ipsec-LEFT private key 'MIIEvgIBADAN...'
  [edit]

Configuration commands for the private and public key will be displayed on the
screen which needs to be set on the router first.
Note the command with the public key
(set pki key-pair ipsec-LEFT public key 'MIIBIjANBgkqh...').
Then do the same on the opposite router:

.. code-block:: none

  vyos@left# run generate pki key-pair install ipsec-RIGHT

Note the command with the public key
(set pki key-pair ipsec-RIGHT public key 'FAAOCAQ8AMII...').

Now the noted public keys should be entered on the opposite routers.

On the LEFT:

.. code-block:: none

  set pki key-pair ipsec-RIGHT public key 'FAAOCAQ8AMII...'

On the RIGHT:

.. code-block:: none

  set pki key-pair ipsec-LEFT public key 'MIIBIjANBgkqh...'

Now you are ready to setup IPsec. You'll need to use an ID instead of address
for the peer.

On the LEFT (static address):

.. code-block:: none

  set vpn ipsec interface eth0

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer RIGHT authentication local-id LEFT
  set vpn ipsec site-to-site peer RIGHT authentication mode rsa
  set vpn ipsec site-to-site peer RIGHT authentication rsa local-key ipsec-LEFT
  set vpn ipsec site-to-site peer RIGHT authentication rsa remote-key ipsec-RIGHT
  set vpn ipsec site-to-site peer RIGHT authentication remote-id RIGHT
  set vpn ipsec site-to-site peer RIGHT default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer RIGHT ike-group MyIKEGroup
  set vpn ipsec site-to-site peer RIGHT local-address 192.0.2.10
  set vpn ipsec site-to-site peer RIGHT connection-type respond
  set vpn ipsec site-to-site peer RIGHT tunnel 1 local prefix 192.168.99.1/32  # Additional loopback address on the local
  set vpn ipsec site-to-site peer RIGHT tunnel 1 remote prefix 192.168.99.2/32 # Additional loopback address on the remote

On the RIGHT (dynamic address):

.. code-block:: none

  set vpn ipsec interface eth0

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer LEFT authentication local-id RIGHT
  set vpn ipsec site-to-site peer LEFT authentication mode rsa
  set vpn ipsec site-to-site peer LEFT authentication rsa local-key ipsec-RIGHT
  set vpn ipsec site-to-site peer LEFT authentication rsa remote-key ipsec-LEFT
  set vpn ipsec site-to-site peer LEFT authentication remote-id LEFT
  set vpn ipsec site-to-site peer LEFT connection-type initiate
  set vpn ipsec site-to-site peer LEFT default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer LEFT ike-group MyIKEGroup
  set vpn ipsec site-to-site peer LEFT local-address any
  set vpn ipsec site-to-site peer LEFT remote-address 192.0.2.10
  set vpn ipsec site-to-site peer LEFT tunnel 1 local prefix 192.168.99.2/32  # Additional loopback address on the local
  set vpn ipsec site-to-site peer LEFT tunnel 1 remote prefix 192.168.99.1/32 # Additional loopback address on the remote


*******************************************
IKEv2 IPSec road-warriors remote-access VPN
*******************************************

Internet Key Exchange version 2, IKEv2 for short, is a request/response
protocol developed by both Cisco and Microsoft. It is used to establish
and secure IPv4/IPv6 connections, be it a site-to-site VPN or from a
road-warrior connecting to a hub site. IKEv2, when run in point-to-multipoint,
or remote-access/road-warrior mode, secures the server-side with another layer
by using an x509 signed server certificate.

Key exchange and payload encryption is still done using IKE and ESP proposals
as known from IKEv1 but the connections are faster to establish, more reliable,
and also support roaming from IP to IP (called MOBIKE which makes sure your
connection does not drop when changing networks from e.g. WIFI to LTE and back).

This feature closely works together with :ref:`pki` subsystem as you required
a x509 certificate.

Example
=======

This example uses CACert as certificate authority.

.. code-block::

  set pki ca CAcert_Class_3_Root certificate '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'
  set pki ca CAcert_Signing_Authority certificate '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'

After you obtained your server certificate you can import it from a file
on the local filesystem, or paste it into the CLI. Please note that
when entering the certificate manually you need to strip the
``-----BEGIN KEY-----`` and ``-----END KEY-----`` tags. Also, the certificate
or key needs to be presented in a single line without line breaks (``\n``).

To import it from the filesystem use:

.. code-block::

  import pki certificate <name> file /path/to/cert.pem

In our example the certificate name is called vyos:

.. code-block::

  set pki certificate vyos certificate 'MIIE45s...'
  set pki certificate vyos private key 'MIIEvgI...'

After the PKI certs are all set up we can start configuring our IPSec/IKE
proposals used for key-exchange end data encryption. The used encryption
ciphers and integrity algorithms vary from operating system to operating
system. The ones used in this post are validated to work on both Windows 10
and iOS/iPadOS 14 to 17.

.. code-block::

  set vpn ipsec esp-group ESP-RW compression 'disable'
  set vpn ipsec esp-group ESP-RW lifetime '3600'
  set vpn ipsec esp-group ESP-RW pfs 'disable'
  set vpn ipsec esp-group ESP-RW proposal 10 encryption 'aes128gcm128'
  set vpn ipsec esp-group ESP-RW proposal 10 hash 'sha256'

  set vpn ipsec ike-group IKE-RW key-exchange 'ikev2'
  set vpn ipsec ike-group IKE-RW lifetime '7200'
  set vpn ipsec ike-group IKE-RW mobike 'enable'
  set vpn ipsec ike-group IKE-RW proposal 10 dh-group '14'
  set vpn ipsec ike-group IKE-RW proposal 10 encryption 'aes128gcm128'
  set vpn ipsec ike-group IKE-RW proposal 10 hash 'sha256'

Every connection/remote-access pool we configure also needs a pool where
we can draw our client IP addresses from. We provide one IPv4 and IPv6 pool.
Authorized clients will receive an IPv4 address from the 192.0.2.128/25 prefix
and an IPv6 address from the 2001:db8:2000::/64 prefix. We can also send some
DNS nameservers down to our clients used on their connection.

.. code-block::

  set vpn ipsec remote-access pool ra-rw-ipv4 name-server '192.0.2.1'
  set vpn ipsec remote-access pool ra-rw-ipv4 prefix '192.0.2.128/25'
  set vpn ipsec remote-access pool ra-rw-ipv6 name-server '2001:db8:1000::1'
  set vpn ipsec remote-access pool ra-rw-ipv6 prefix '2001:db8:2000::/64'

VyOS supports multiple IKEv2 remote-access connections. Every connection can
have its dedicated IKE/ESP ciphers, certificates or local listen address for
e.g. inbound load balancing.

We configure a new connection named ``rw`` for road-warrior, that identifies
itself as ``192.0.2.1`` to the clients and uses the ``vyos`` certificate
signed by the `CAcert_Class3_Root`` intermediate CA. We select our previously
specified IKE/ESP groups and also link the IP address pool to draw addresses
from.

.. code-block::

  set vpn ipsec remote-access connection rw authentication id '192.0.2.1'
  set vpn ipsec remote-access connection rw authentication server-mode 'x509'
  set vpn ipsec remote-access connection rw authentication x509 ca-certificate 'CAcert_Class_3_Root'
  set vpn ipsec remote-access connection rw authentication x509 certificate 'vyos'
  set vpn ipsec remote-access connection rw esp-group 'ESP-RW'
  set vpn ipsec remote-access connection rw ike-group 'IKE-RW'
  set vpn ipsec remote-access connection rw local-address '192.0.2.1'
  set vpn ipsec remote-access connection rw pool 'ra-rw-ipv4'
  set vpn ipsec remote-access connection rw pool 'ra-rw-ipv6'

VyOS also supports (currently) two different modes of authentication, local and
RADIUS. To create a new local user named ``vyos`` with password ``vyos`` use the
following commands.

.. code-block::

  set vpn ipsec remote-access connection rw authentication client-mode 'eap-mschapv2'
  set vpn ipsec remote-access connection rw authentication local-users username vyos password 'vyos'

If you feel better forwarding all authentication requests to your enterprises
RADIUS server, use the commands below.

.. code-block::

  set vpn ipsec remote-access connection rw authentication client-mode 'eap-radius'
  set vpn ipsec remote-access radius server 192.0.2.2 key 'secret'

Client Configuration
====================

Configuring VyOS to act as your IPSec access concentrator is one thing, but
you probably need to setup your client connecting to the server so they can
talk to the IPSec gateway.

Microsoft Windows (10+)
-----------------------

Windows 10 does not allow a user to choose the integrity and encryption ciphers
using the GUI and it uses some older proposals by default. A user can only
change the proposals on the client side by configuring the IPSec connection
profile via PowerShell.

We generate a connection profile used by Windows clients that will connect to
the "rw" connection on our VyOS server on the VPN servers IP address/fqdn
`vpn.vyos.net`.

.. note:: Microsoft Windows expects the server name to be also used in the
  server's certificate common name, so it's best to use this DNS name for
  your VPN connection.

.. code-block::

  vyos@vyos:~$ generate ipsec profile windows-remote-access rw remote vpn.vyos.net

   ==== <snip> ====
   Add-VpnConnection -Name "VyOS IKEv2 VPN" -ServerAddress "vpn.vyos.net" -TunnelType "Ikev2"
   Set-VpnConnectionIPsecConfiguration -ConnectionName "VyOS IKEv2 VPN" -AuthenticationTransformConstants GCMAES128 -CipherTransformConstants GCMAES128 -EncryptionMethod GCMAES128 -IntegrityCheckMethod SHA256128 -PfsGroup None -DHGroup "Group14" -PassThru -Force
   ==== </snip> ====

As both Microsoft Windows and Apple iOS/iPadOS only support a certain set of
encryption ciphers and integrity algorithms we will validate the configured
IKE/ESP proposals and only list the compatible ones to the user — if multiple
are defined. If there are no matching proposals found — we can not generate a
profile for you.

When first connecting to the new VPN the user is prompted to enter proper
credentials.

Apple iOS/iPadOS (14.2+)
------------------------

Like on Microsoft Windows, Apple iOS/iPadOS out of the box does not expose
all available VPN options via the device GUI.

If you want, need, and should use more advanced encryption ciphers (default
is still 3DES) you need to provision your device using a so-called "Device
Profile". A profile is a simple text file containing XML nodes with a
``.mobileconfig`` file extension that can be sent and opened on any device
from an E-Mail.

Profile generation happens from the operational level and is as simple as
issuing the following command to create a profile to connect to the IKEv2
access server at ``vpn.vyos.net`` with the configuration for the ``rw``
remote-access connection group.

.. note:: Apple iOS/iPadOS expects the server name to be also used in the
  server's certificate common name, so it's best to use this DNS name for
  your VPN connection.

.. code-block::

  vyos@vyos:~$ generate ipsec profile ios-remote-access rw remote vpn.vyos.net

  ==== <snip> ====
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  ...
  </plist>
  ==== </snip> ====

In the end, an XML structure is generated which can be saved as
``vyos.mobileconfig`` and sent to the device by E-Mail where it later can
be imported.

During profile import, the user is asked to enter its IPSec credentials
(username and password) which is stored on the mobile.
