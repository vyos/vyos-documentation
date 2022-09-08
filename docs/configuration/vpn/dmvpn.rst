.. _vpn-dmvpn:

#####
DMVPN
#####

:abbr:`DMVPN (Dynamic Multipoint Virtual Private Network)` is a dynamic
:abbr:`VPN (Virtual Private Network)` technology originally developed by Cisco.
While their implementation was somewhat proprietary, the underlying
technologies are actually standards based. The three technologies are:

* :abbr:`NHRP (Next Hop Resolution Protocol)` :rfc:`2332`
* :abbr:`mGRE (Multipoint Generic Routing Encapsulation)` :rfc:`1702`
* :abbr:`IPSec (IP Security)` - too many RFCs to list, but start with
  :rfc:`4301`

NHRP provides the dynamic tunnel endpoint discovery mechanism (endpoint
registration, and endpoint discovery/lookup), mGRE provides the tunnel
encapsulation itself, and the IPSec protocols handle the key exchange, and
crypto mechanism.

In short, DMVPN provides the capability for creating a dynamic-mesh VPN
network without having to pre-configure (static) all possible tunnel end-point
peers.

.. note:: DMVPN only automates the tunnel endpoint discovery and setup. A
   complete solution also incorporates the use of a routing protocol. BGP is
   particularly well suited for use with DMVPN.

.. figure:: /_static/images/vpn_dmvpn_topology01.png
   :scale: 40 %
   :alt: Baseline DMVPN topology

   Baseline DMVPN topology

*************
Configuration
*************

* Please refer to the :ref:`tunnel-interface` documentation for the individual
  tunnel related options.

* Please refer to the :ref:`ipsec` documentation for the individual IPSec
  related options.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> cisco-authentication <secret>

  Enables Cisco style authentication on NHRP packets. This embeds the secret
  plaintext password to the outgoing NHRP packets. Incoming NHRP packets on
  this interface are discarded unless the secret password is present. Maximum
  length of the secret is 8 characters.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> dynamic-map <address>
  nbma-domain-name <fqdn>

  Specifies that the :abbr:`NBMA (Non-broadcast multiple-access network)`
  addresses of the next hop servers are defined in the domain name
  nbma-domain-name. For each A record opennhrp creates a dynamic NHS entry.

  Each dynamic NHS will get a peer entry with the configured network address
  and the discovered NBMA address.

  The first registration request is sent to the protocol broadcast address, and
  the server's real protocol address is dynamically detected from the first
  registration reply.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> holding-time <timeout>

  Specifies the holding time for NHRP Registration Requests and Resolution
  Replies sent from this interface or shortcut-target. The holdtime is specified
  in seconds and defaults to two hours.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> map cisco

  If the statically mapped peer is running Cisco IOS, specify the cisco keyword.
  It is used to fix statically the Registration Request ID so that a matching
  Purge Request can be sent if NBMA address has changed. This is to work around
  broken IOS which requires Purge Request ID to match the original Registration
  Request ID.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> map nbma-address <address>

  Creates static peer mapping of protocol-address to :abbr:`NBMA (Non-broadcast
  multiple-access network)` address.

  If the IP prefix mask is present, it directs opennhrp to use this peer as a
  next hop server when sending Resolution Requests matching this subnet.

  This is also known as the HUBs IP address or FQDN.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> map register

  The optional parameter register specifies that Registration Request should be
  sent to this peer on startup.

  This option is required when running a DMVPN spoke.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> multicast <dynamic | nhs>

  Determines how opennhrp daemon should soft switch the multicast traffic.
  Currently, multicast traffic is captured by opennhrp daemon using a packet
  socket, and resent back to proper destinations. This means that multicast
  packet sending is CPU intensive.

  Specfying nhs makes all multicast packets to be repeated to each statically
  configured next hop.

  Synamic instructs to forward to all peers which we have a direct connection
  with. Alternatively, you can specify the directive multiple times for each
  protocol-address the multicast traffic should be sent to.

  .. warning:: It is very easy to misconfigure multicast repeating if you have
    multiple NHSes.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> non-caching

   Disables caching of peer information from forwarded NHRP Resolution Reply
   packets. This can be used to reduce memory consumption on big NBMA subnets.

  .. note:: Currently does not do much as caching is not implemented.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> redirect

  Enable sending of Cisco style NHRP Traffic Indication packets. If this is
  enabled and opennhrp detects a forwarded  packet, it will send a message to
  the original sender of the packet instructing it to create a direct connection
  with the destination. This is basically a protocol independent equivalent of
  ICMP redirect.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> shortcut

  Enable creation of shortcut routes.

  A received NHRP Traffic Indication will trigger the resolution and
  establishment of a shortcut route.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> shortcut-destination

  This instructs opennhrp to reply with authorative answers on NHRP Resolution
  Requests destinied to addresses in this interface (instead of forwarding the
  packets). This effectively allows the creation of shortcut routes to subnets
  located on the interface.

  When specified, this should be the only keyword for the interface.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> shortcut-target <address>

  Defines an off-NBMA network prefix for which the GRE interface will act as a
  gateway. This an alternative to defining local interfaces with
  shortcut-destination flag.

.. cfgcmd:: set protocols nhrp tunnel <tunnel> shortcut-target <address>
  holding-time <timeout>

  Specifies the holding time for NHRP Registration Requests and Resolution
  Replies sent from this interface or shortcut-target. The holdtime is specified
  in seconds and defaults to two hours.

*******
Example
*******


This blueprint uses VyOS as the DMVPN Hub and Cisco (7206VXR) and VyOS as
multiple spoke sites. The lab was build using :abbr:`EVE-NG (Emulated Virtual
Environment NG)`.

.. figure:: /_static/images/blueprint-dmvpn.png
   :alt: DMVPN network

   DMVPN example network

Each node (Hub and Spoke) uses an IP address from the network 172.16.253.128/29.

The below referenced IP address `192.0.2.1` is used as example address
representing a global unicast address under which the HUB can be contacted by
each and every individual spoke.

.. _dmvpn:example_configuration:

Configuration
=============

Hub
---

.. code-block:: none

  set interfaces ethernet eth0 address 192.0.2.1/24

  set interfaces tunnel tun100 address '172.16.253.134/29'
  set interfaces tunnel tun100 encapsulation 'gre'
  set interfaces tunnel tun100 local-ip '192.0.2.1'
  set interfaces tunnel tun100 multicast 'enable'
  set interfaces tunnel tun100 parameters ip key '1'

  set protocols nhrp tunnel tun100 cisco-authentication 'secret'
  set protocols nhrp tunnel tun100 holding-time '300'
  set protocols nhrp tunnel tun100 multicast 'dynamic'
  set protocols nhrp tunnel tun100 redirect
  set protocols nhrp tunnel tun100 shortcut

  set vpn ipsec esp-group ESP-HUB compression 'disable'
  set vpn ipsec esp-group ESP-HUB lifetime '1800'
  set vpn ipsec esp-group ESP-HUB mode 'transport'
  set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
  set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
  set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
  set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
  set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
  set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
  set vpn ipsec ike-group IKE-HUB key-exchange 'ikev1'
  set vpn ipsec ike-group IKE-HUB lifetime '3600'
  set vpn ipsec ike-group IKE-HUB proposal 1 dh-group '2'
  set vpn ipsec ike-group IKE-HUB proposal 1 encryption 'aes256'
  set vpn ipsec ike-group IKE-HUB proposal 1 hash 'sha1'
  set vpn ipsec ike-group IKE-HUB proposal 2 dh-group '2'
  set vpn ipsec ike-group IKE-HUB proposal 2 encryption 'aes128'
  set vpn ipsec ike-group IKE-HUB proposal 2 hash 'sha1'

  set vpn ipsec interface 'eth0'

  set vpn ipsec profile NHRPVPN authentication mode 'pre-shared-secret'
  set vpn ipsec profile NHRPVPN authentication pre-shared-secret 'secret'
  set vpn ipsec profile NHRPVPN bind tunnel 'tun100'
  set vpn ipsec profile NHRPVPN esp-group 'ESP-HUB'
  set vpn ipsec profile NHRPVPN ike-group 'IKE-HUB'

.. note:: Setting this up on AWS will require a "Custom Protocol Rule" for
  protocol number "47" (GRE) Allow Rule in TWO places. Firstly on the VPC
  Network ACL, and secondly on the security group network ACL attached to the
  EC2 instance. This has been tested as working for the official AMI image on
  the AWS Marketplace. (Locate the correct VPC and security group by navigating
  through the details pane below your EC2 instance in the AWS console).

Spoke
-----

The individual spoke configurations only differ in the local IP address on the
``tun10`` interface. See the above diagram for the individual IP addresses.

spoke01-spoke04
^^^^^^^^^^^^^^^

.. code-block:: none

  crypto keyring DMVPN
    pre-shared-key address 192.0.2.1 key secret
  !
  crypto isakmp policy 10
   encr aes 256
   authentication pre-share
   group 2
  crypto isakmp invalid-spi-recovery
  crypto isakmp keepalive 30 30 periodic
  crypto isakmp profile DMVPN
     keyring DMVPN
     match identity address 192.0.2.1 255.255.255.255
  !
  crypto ipsec transform-set DMVPN-AES256 esp-aes 256 esp-sha-hmac
   mode transport
  !
  crypto ipsec profile DMVPN
   set security-association idle-time 720
   set transform-set DMVPN-AES256
   set isakmp-profile DMVPN
  !
  interface Tunnel10
   ! individual spoke tunnel IP must change
   ip address 172.16.253.129 255.255.255.248
   no ip redirects
   ip nhrp authentication secret
   ip nhrp map 172.16.253.134 192.0.2.1
   ip nhrp map multicast 192.0.2.1
   ip nhrp network-id 1
   ip nhrp holdtime 600
   ip nhrp nhs 172.16.253.134
   ip nhrp registration timeout 75
   tunnel source FastEthernet0/0
   tunnel mode gre multipoint
   tunnel protection ipsec profile DMVPN
   tunnel key 1
  !
  interface FastEthernet0/0
   ip address dhcp
   duplex half


spoke05
^^^^^^^

VyOS can also run in DMVPN spoke mode.

.. code-block:: none

  set interfaces ethernet eth0 address 'dhcp'

  set interfaces tunnel tun100 address '172.16.253.133/29'
  set interfaces tunnel tun100 local-ip 0.0.0.0
  set interfaces tunnel tun100 encapsulation 'gre'
  set interfaces tunnel tun100 multicast 'enable'
  set interfaces tunnel tun100 parameters ip key '1'

  set protocols nhrp tunnel tun100 cisco-authentication 'secret'
  set protocols nhrp tunnel tun100 holding-time '300'
  set protocols nhrp tunnel tun100 map 172.16.253.134/29 nbma-address '192.0.2.1'
  set protocols nhrp tunnel tun100 map 172.16.253.134/29 register
  set protocols nhrp tunnel tun100 multicast 'nhs'
  set protocols nhrp tunnel tun100 redirect
  set protocols nhrp tunnel tun100 shortcut

  set vpn ipsec esp-group ESP-HUB compression 'disable'
  set vpn ipsec esp-group ESP-HUB lifetime '1800'
  set vpn ipsec esp-group ESP-HUB mode 'transport'
  set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
  set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
  set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
  set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
  set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
  set vpn ipsec ike-group IKE-HUB close-action 'none'
  set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
  set vpn ipsec ike-group IKE-HUB key-exchange 'ikev1'
  set vpn ipsec ike-group IKE-HUB lifetime '3600'
  set vpn ipsec ike-group IKE-HUB proposal 1 dh-group '2'
  set vpn ipsec ike-group IKE-HUB proposal 1 encryption 'aes256'
  set vpn ipsec ike-group IKE-HUB proposal 1 hash 'sha1'
  set vpn ipsec ike-group IKE-HUB proposal 2 dh-group '2'
  set vpn ipsec ike-group IKE-HUB proposal 2 encryption 'aes128'
  set vpn ipsec ike-group IKE-HUB proposal 2 hash 'sha1'

  set vpn ipsec interface 'eth0'

  set vpn ipsec profile NHRPVPN authentication mode 'pre-shared-secret'
  set vpn ipsec profile NHRPVPN authentication pre-shared-secret 'secret'
  set vpn ipsec profile NHRPVPN bind tunnel 'tun100'
  set vpn ipsec profile NHRPVPN esp-group 'ESP-HUB'
  set vpn ipsec profile NHRPVPN ike-group 'IKE-HUB'


