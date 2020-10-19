.. _mpls:

####
MPLS
####

:abbr:`MPLS (Multi-Protocol Label Switching)` is a packet forwarding paradigm
which differs from regular IP forwarding. Instead of IP addresses being used to
make the decision on finding the exit interface, a router will instead use an
exact match on a 32 bit/4 byte header called the MPLS label. This label is
inserted between the ethernet (layer 2) header and the IP (layer 3) header.
One can statically or dynamically assign label allocations, but we will focus
on dynamic allocation of labels using some sort of label distribution protocol
(such as the aptly named Label Distribution Protocol / LDP, Resource Reservation
Protocol / RSVP, or Segment Routing through OSPF/ISIS). These protocols allow
for the creation of a unidirectional/unicast path called a labeled switched
path (initialized as LSP) throughout the network that operates very much like
a tunnel through the network. An easy way of thinking about how an MPLS LSP
actually forwards traffic throughout a network is to think of a GRE tunnel.
They are not the same in how they operate, but they are the same in how they
handle the tunneled packet. It would be good to think of MPLS as a tunneling
technology that can be used to transport many different types of packets, to
aid in traffic engineering by allowing one to specify paths throughout the
network (using RSVP or SR), and to generally allow for easier intra/inter
network transport of data packets.

For more information on how MPLS label switching works, please go visit
`Wikipedia (MPLS)`_.

.. note:: MPLS support in VyOS is not finished yet, and therefore its
   functionality is limited. Currently there is no support for MPLS enabled VPN
   services such as L3VPNs, L2VPNs, and mVPNs. RSVP support is also not present
   as the underlying routing stack (FRR) does not implement it. Currently VyOS
   can be configured as a label switched router (MPLS P router), in both
   penultimate and ultimate hop popping operations.

Label Distribution Protocol
===========================

The :abbr:`MPLS (Multi-Protocol Label Switching)` architecture does not assume
a single protocol to create MPLS paths. VyOS supports the Label Distribution
Protocol (LDP) as implemented by FRR, based on :rfc:`5036`.

:abbr:`LDP (Label Distribution Protocol)` is a TCP based MPLS signaling protocol
that distributes labels creating MPLS label switched paths in a dynamic manner.
LDP is not a routing protocol, as it relies on other routing protocols for
forwarding decisions. LDP cannot bootstrap itself, and therefore relies on said
routing protocols for communication with other routers that use LDP.

In order to allow for LDP on the local router to exchange label advertisements
with other routers, a TCP session will be established between automatically
discovered and statically assigned routers. LDP will try to establish a TCP
session to the **transport address** of other routers. Therefore for LDP to
function properly please make sure the transport address is shown in the
routing table and reachable to traffic at all times.

It is highly recommended to use the same address for both the LDP router-id and
the discovery transport address, but for VyOS MPLS LDP to work both parameters
must be explicitly set in the configuration.

Configuration Options
=====================

Use this command to enable LDP, and enable MPLS processing on the interface you
define.

.. cfgcmd:: set protocols mpls ldp interface <interface>

  Use this command to configure the IP address used as the LDP router-id of the
  local device.

.. cfgcmd:: set protocols mpls ldp router-id <address>

  Use this command to set the IPv4 or IPv6 transport-address used by LDP.

.. cfgcmd:: set protocols mpls ldp discovery transport-ipv4-address <IPv4 address>
.. cfgcmd:: set protocols mpls ldp discovery transport-ipv6-address <IPv6 address>

  Use this command to configure authentication for LDP peers. Set the
  IP address of the LDP peer and a password that should be shared in
  order to become neighbors.

.. cfgcmd:: set protocols mpls ldp neighbor <IPv4 address> password <password>

  Use this command if you would like to set the discovery hello and hold time
  parameters.

.. cfgcmd:: set protocols mpls ldp discovery hello-interval <seconds>
.. cfgcmd:: set protocols mpls ldp discovery hello-holdtime <seconds>

Use this command if you would like to set the TCP session hold time intervals.

.. cfgcmd:: set protocols mpls ldp discovery session-ipv4-holdtime <seconds>
.. cfgcmd:: set protocols mpls ldp discovery session-ipv6-holdtime <seconds>

Use this command if you would like for the router to advertise FECs with a label
of 0 for explicit null operations.

.. cfgcmd:: set protocols mpls ldp export ipv4 explicit-null
.. cfgcmd:: set protocols mpls ldp export ipv6 explicit-null


Sample configuration to setup LDP on VyOS
-----------------------------------------

.. code-block:: none

  set protocols ospf area 0 network '192.168.255.252/32'                      <--- Routing for loopback
  set protocols ospf area 0 network '192.168.0.5/32'                          <--- Routing for an interface connecting to the network
  set protocols ospf parameters router-id '192.168.255.252'                   <--- Router ID setting for OSPF
  set protocols mpls ldp discovery transport-ipv4-address '192.168.255.252'   <--- Transport address for LDP for TCP sessions to connect to
  set protocols mpls ldp interface 'eth1'                                     <--- Enable MPLS and LDP for an interface connecting to network
  set protocols mpls ldp interface 'lo'                                       <--- Enable MPLS and LDP on loopback for future services connectivity
  set protocols mpls ldp router-id '192.168.255.252'                          <--- Router ID setting for LDP
  set interfaces ethernet eth1 address '192.168.0.5/31'                       <--- Interface IP for connecting to network
  set interfaces loopback lo address '192.168.255.252/32'                     <--- Interface loopback IP for router ID and other uses


Operational Mode Commands
=========================

When LDP is working, you will be able to see label information in the outcome
of ``show ip route``. Besides that information, there are also specific *show*
commands for LDP:

Show
----

.. opcmd:: show mpls ldp binding

  Use this command to see the Label Information Base.

.. opcmd:: show mpls ldp discovery

  Use this command to see discovery hello information

.. opcmd:: show mpls ldp interface

  Use this command to see LDP interface information

.. opcmd:: show mpls ldp neighbor

  Use this command to see LDP neighbor information

.. opcmd:: show mpls ldp neighbor detail

  Use this command to see detailed LDP neighbor information

Reset
-----

.. opcmd:: reset mpls ldp neighbor <IPv4 or IPv6 address>

  Use this command to reset an LDP neighbor/TCP session that is established


.. _`Wikipedia (MPLS)`: https://en.wikipedia.org/wiki/Multiprotocol_Label_Switching
