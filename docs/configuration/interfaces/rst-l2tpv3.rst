:lastproofread: 2023-01-20

.. include:: /_include/need_improvement.txt

.. _l2tpv3-interface:

######
L2TPv3
######

Layer 2 Tunnelling Protocol Version 3 is an IETF standard related to L2TP that
can be used as an alternative protocol to :ref:`mpls` for encapsulation of
multiprotocol Layer 2 communications traffic over IP networks. Like L2TP,
L2TPv3 provides a pseudo-wire service but is scaled to fit carrier requirements.

L2TPv3 can be regarded as being to MPLS what IP is to ATM: a simplified version
of the same concept, with much of the same benefit achieved at a fraction of the
effort, at the cost of losing some technical features considered less important
in the market.

In the case of L2TPv3, the features lost are teletraffic engineering features
considered important in MPLS. However, there is no reason these features could
not be re-engineered in or on top of L2TPv3 in later products.

The protocol overhead of L2TPv3 is also significantly bigger than MPLS.

L2TPv3 is described in :rfc:`3931`.

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-common-without-dhcp.txt
   :var0: l2tpv3
   :var1: l2tpeth0

L2TPv3 options
==============

.. cfgcmd:: set interfaces l2tpv3 <interface> encapsulation <udp | ip>

  Set the encapsulation type of the tunnel. Valid values for encapsulation are:
  udp, ip.

  This defaults to UDP

.. cfgcmd:: set interfaces l2tpv3 <interface> source-address <address>

  Set the IP address of the local interface to be used for the tunnel.

  This address must be the address of a local interface. It may be specified as
  an IPv4 address or an IPv6 address.

.. cfgcmd:: set interfaces l2tpv3 <interface> remote <address>

  Set the IP address of the remote peer. It may be specified as
  an IPv4 address or an IPv6 address.

.. cfgcmd:: set interfaces l2tpv3 <interface> session-id <id>

  Set the session id, which is a 32-bit integer value. Uniquely identifies the
  session being created. The value used must match the peer_session_id value
  being used at the peer.

.. cfgcmd:: set interfaces l2tpv3 <interface> peer-session-id <id>

  Set the peer-session-id, which is a 32-bit integer value assigned to the
  session by the peer. The value used must match the session_id value being
  used at the peer.

.. cfgcmd:: set interfaces l2tpv3 <interface> tunnel-id <id>

  Set the tunnel id, which is a 32-bit integer value. Uniquely identifies the
  tunnel into which the session will be created.

.. cfgcmd:: set interfaces l2tpv3 <interface> peer-tunnel-id <id>

  Set the tunnel id, which is a 32-bit integer value. Uniquely identifies the
  tunnel into which the session will be created.

*******
Example
*******

Over IP
=======

.. code-block:: none

  # show interfaces l2tpv3
  l2tpv3 l2tpeth10 {
      address 192.168.37.1/27
      encapsulation ip
      source-address 192.0.2.1
      peer-session-id 100
      peer-tunnel-id 200
      remote 203.0.113.24
      session-id 100
      tunnel-id 200
  }

The inverse configuration has to be applied to the remote side.

Over UDP
========

UDP mode works better with NAT:

* Set source-address to your local IP (LAN).
* Add a forwarding rule matching UDP port on your internet router.

.. code-block:: none

  # show interfaces l2tpv3
  l2tpv3 l2tpeth10 {
      address 192.168.37.1/27
      destination-port 9001
      encapsulation udp
      source-address 192.0.2.1
      peer-session-id 100
      peer-tunnel-id 200
      remote 203.0.113.24
      session-id 100
      source-port 9000
      tunnel-id 200
  }

To create more than one tunnel, use distinct UDP ports.


Over IPSec, L2 VPN (bridge)
===========================

This is the LAN extension use case. The eth0 port of the distant VPN peers
will be directly connected like if there was a switch between them.

IPSec:

.. code-block:: none

  set vpn ipsec authentication psk <pre-shared-name> id '%any'
  set vpn ipsec authentication psk <pre-shared-name> secret <pre-shared-key>
  set vpn ipsec interface <VPN-interface>
  set vpn ipsec esp-group test-ESP-1 lifetime '3600'
  set vpn ipsec esp-group test-ESP-1 mode 'transport'
  set vpn ipsec esp-group test-ESP-1 pfs 'enable'
  set vpn ipsec esp-group test-ESP-1 proposal 1 encryption 'aes128'
  set vpn ipsec esp-group test-ESP-1 proposal 1 hash 'sha1'
  set vpn ipsec ike-group test-IKE-1 key-exchange 'ikev1'
  set vpn ipsec ike-group test-IKE-1 lifetime '3600'
  set vpn ipsec ike-group test-IKE-1 proposal 1 dh-group '5'
  set vpn ipsec ike-group test-IKE-1 proposal 1 encryption 'aes128'
  set vpn ipsec ike-group test-IKE-1 proposal 1 hash 'sha1'
  set vpn ipsec site-to-site peer <connection-name> authentication mode 'pre-shared-secret'
  set vpn ipsec site-to-site peer <connection-name> connection-type 'initiate'
  set vpn ipsec site-to-site peer <connection-name> ike-group 'test-IKE-1'
  set vpn ipsec site-to-site peer <connection-name> ikev2-reauth 'inherit'
  set vpn ipsec site-to-site peer <connection-name> local-address <local-ip>
  set vpn ipsec site-to-site peer <connection-name> tunnel 1 esp-group 'test-ESP-1'
  set vpn ipsec site-to-site peer <connection-name> tunnel 1 protocol 'l2tp'

Bridge:

.. code-block:: none

  set interfaces bridge br0 description 'L2 VPN Bridge'
  # remote side in this example:
  # set interfaces bridge br0 address '172.16.30.18/30'
  set interfaces bridge br0 address '172.16.30.17/30'
  set interfaces bridge br0 member interface eth0
  set interfaces ethernet eth0 description 'L2 VPN Physical port'

L2TPv3:

.. code-block:: none

  set interfaces bridge br0 member interface 'l2tpeth0'
  set interfaces l2tpv3 l2tpeth0 description 'L2 VPN Tunnel'
  set interfaces l2tpv3 l2tpeth0 destination-port '5000'
  set interfaces l2tpv3 l2tpeth0 encapsulation 'ip'
  set interfaces l2tpv3 l2tpeth0 source-address <local-ip>
  set interfaces l2tpv3 l2tpeth0 mtu '1500'
  set interfaces l2tpv3 l2tpeth0 peer-session-id '110'
  set interfaces l2tpv3 l2tpeth0 peer-tunnel-id '10'
  set interfaces l2tpv3 l2tpeth0 remote <peer-ip>
  set interfaces l2tpv3 l2tpeth0 session-id '110'
  set interfaces l2tpv3 l2tpeth0 source-port '5000'
  set interfaces l2tpv3 l2tpeth0 tunnel-id '10'
