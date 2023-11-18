:lastproofread: 2023-01-26

.. _vxlan-interface:

#####
VXLAN
#####

:abbr:`VXLAN (Virtual Extensible LAN)` is a network virtualization technology
that attempts to address the scalability problems associated with large cloud
computing deployments. It uses a VLAN-like encapsulation technique to
encapsulate OSI layer 2 Ethernet frames within layer 4 UDP datagrams, using
4789 as the default IANA-assigned destination UDP port number. VXLAN
endpoints, which terminate VXLAN tunnels and may be either virtual or physical
switch ports, are known as :abbr:`VTEPs (VXLAN tunnel endpoints)`.

VXLAN is an evolution of efforts to standardize an overlay encapsulation
protocol. It increases the scalability up to 16 million logical networks and
allows for layer 2 adjacency across IP networks. Multicast or unicast with
head-end replication (HER) is used to flood broadcast, unknown unicast,
and multicast (BUM) traffic.

The VXLAN specification was originally created by VMware, Arista Networks
and Cisco. Other backers of the VXLAN technology include Huawei, Broadcom,
Citrix, Pica8, Big Switch Networks, Cumulus Networks, Dell EMC, Ericsson,
Mellanox, FreeBSD, OpenBSD, Red Hat, Joyent, and Juniper Networks.

VXLAN was officially documented by the IETF in :rfc:`7348`.

If configuring VXLAN in a VyOS virtual machine, ensure that MAC spoofing
(Hyper-V) or Forged Transmits (ESX) are permitted, otherwise forwarded frames
may be blocked by the hypervisor.

.. note:: As VyOS is based on Linux and there was no official IANA port assigned
   for VXLAN, VyOS uses a default port of 8472. You can change the port on a
   per VXLAN interface basis to get it working across multiple vendors.

Configuration
=============

Common interface configuration
------------------------------

.. cmdinclude:: /_include/interface-common-without-dhcp.txt
  :var0: vxlan
  :var1: vxlan0

VXLAN specific options
-----------------------

.. cfgcmd:: set interfaces vxlan <interface> vni <number>

  Each VXLAN segment is identified through a 24-bit segment ID, termed the
  :abbr:`VNI (VXLAN Network Identifier (or VXLAN Segment ID))`, This allows
  up to 16M VXLAN segments to coexist within the same administrative domain.

.. cfgcmd:: set interfaces vxlan <interface> port <port>

  Configure port number of remote VXLAN endpoint.

  .. note:: As VyOS is Linux based the default port used is not using 4789
     as the default IANA-assigned destination UDP port number. Instead VyOS
     uses the Linux default port of 8472.

.. cfgcmd:: set interfaces vxlan <interface> source-address <interface>

  Source IP address used for VXLAN underlay. This is mandatory when using VXLAN
  via L2VPN/EVPN.

.. cfgcmd:: set interfaces vxlan <interface> gpe

  Enables the Generic Protocol extension (VXLAN-GPE). Currently, this is only
  supported together with the external keyword.

.. cfgcmd:: set interfaces vxlan <interface> parameters external

  Specifies whether an external control plane (e.g. BGP L2VPN/EVPN) or the
  internal FDB should be used.

.. cfgcmd:: set interfaces vxlan <interface> parameters neighbor-suppress

  In order to minimize the flooding of ARP and ND messages in the VXLAN network,
  EVPN includes provisions :rfc:`7432#section-10` that allow participating VTEPs
  to suppress such messages in case they know the MAC-IP binding and can reply
  on behalf of the remote host.

.. cfgcmd:: set interfaces vxlan <interface> parameters nolearning

   Specifies if unknown source link layer addresses and IP addresses are entered
   into the VXLAN device forwarding database.

.. cfgcmd:: set interfaces vxlan <interface> parameters vni-filter

   Specifies whether the VXLAN device is capable of vni filtering.

   Only works with a VXLAN device with external flag set.

   .. note::  The device can only receive packets with VNIs configured in
      the VNI filtering table.

Unicast
^^^^^^^

.. cfgcmd:: set interfaces vxlan <interface> remote <address>

  IPv4/IPv6 remote address of the VXLAN tunnel. Alternative to multicast, the
  remote IPv4/IPv6 address can set directly.

Multicast
^^^^^^^^^

.. cfgcmd:: set interfaces vxlan <interface> source-interface <interface>

  Interface used for VXLAN underlay. This is mandatory when using VXLAN via
  a multicast network. VXLAN traffic will always enter and exit this interface.


.. cfgcmd:: set interfaces vxlan <interface> group <address>

  Multicast group address for VXLAN interface. VXLAN tunnels can be built
  either via Multicast or via Unicast.

  Both IPv4 and IPv6 multicast is possible.

Multicast VXLAN
===============

Topology: PC4 - Leaf2 - Spine1 - Leaf3 - PC5

PC4 has IP 10.0.0.4/24 and PC5 has IP 10.0.0.5/24, so they believe they are in
the same broadcast domain.

Let's assume PC4 on Leaf2 wants to ping PC5 on Leaf3. Instead of setting Leaf3
as our remote end manually, Leaf2 encapsulates the packet into a UDP-packet and
sends it to its designated multicast-address via Spine1. When Spine1 receives
this packet it forwards it to all other leaves who has joined the same
multicast-group, in this case Leaf3. When Leaf3 receives the packet it forwards
it, while at the same time learning that PC4 is reachable behind Leaf2, because
the encapsulated packet had Leaf2's IP address set as source IP.

PC5 receives the ping echo, responds with an echo reply that Leaf3 receives and
this time forwards to Leaf2's unicast address directly because it learned the
location of PC4 above. When Leaf2 receives the echo reply from PC5 it sees that
it came from Leaf3 and so remembers that PC5 is reachable via Leaf3.

Thanks to this discovery, any subsequent traffic between PC4 and PC5 will not
be using the multicast-address between the leaves as they both know behind which
Leaf the PCs are connected. This saves traffic as less multicast packets sent
reduces the load on the network, which improves scalability when more leaves are
added.

For optimal scalability, Multicast shouldn't be used at all, but instead use BGP
to signal all connected devices between leaves. Unfortunately, VyOS does not yet
support this.

Single VXLAN device (SVD)
=========================

FRR supports a new way of configuring VLAN-to-VNI mappings for EVPN-VXLAN, when
working with the Linux kernel. In this new way, the mapping of a VLAN to a
:abbr:`VNI (VXLAN Network Identifier (or VXLAN Segment ID))` is configured
against a container VXLAN interface which is referred to as a
:abbr:`SVD (Single VXLAN device)`.

Multiple VLAN to VNI mappings can be configured against the same SVD. This
allows for a significant scaling of the number of VNIs since a separate VXLAN
interface is no longer required for each VNI.

.. cfgcmd:: set interfaces vxlan <interface> vlan-to-vni <vlan> vni <vni>

   Maps the VNI to the specified VLAN id. The VLAN can then be consumed by
   a bridge.

   Sample configuration of SVD with VLAN to VNI mappings is shown below.

   .. code-block:: none

    set interfaces bridge br0 member interface vxlan0
    set interfaces vxlan vxlan0 parameters external
    set interfaces vxlan vxlan0 source-interface 'dum0'
    set interfaces vxlan vxlan0 vlan-to-vni 10 vni '10010'
    set interfaces vxlan vxlan0 vlan-to-vni 11 vni '10011'
    set interfaces vxlan vxlan0 vlan-to-vni 30 vni '10030'
    set interfaces vxlan vxlan0 vlan-to-vni 31 vni '10031'

Example
-------

The setup is this: Leaf2 - Spine1 - Leaf3

Spine1 is a Cisco IOS router running version 15.4, Leaf2 and Leaf3 is each a
VyOS router running 1.2.

This topology was built using GNS3.

Topology:

.. code-block:: none

  Spine1:
  fa0/2 towards Leaf2, IP-address: 10.1.2.1/24
  fa0/3 towards Leaf3, IP-address: 10.1.3.1/24

  Leaf2:
  Eth0 towards Spine1, IP-address: 10.1.2.2/24
  Eth1 towards a vlan-aware switch

  Leaf3:
  Eth0 towards Spine1, IP-address 10.1.3.3/24
  Eth1 towards a vlan-aware switch

**Spine1 Configuration:**

.. code-block:: none

  conf t
  ip multicast-routing
  !
  interface fastethernet0/2
   ip address 10.1.2.1 255.255.255.0
   ip pim sparse-dense-mode
  !
  interface fastethernet0/3
   ip address 10.1.3.1 255.255.255.0
   ip pim sparse-dense-mode
  !
  router ospf 1
   network 10.0.0.0 0.255.255.255 area 0

Multicast-routing is required for the leaves to forward traffic between each
other in a more scalable way. This also requires PIM to be enabled towards the
leaves so that the Spine can learn what multicast groups each Leaf expects
traffic from.

**Leaf2 configuration:**

.. code-block:: none

  set interfaces ethernet eth0 address '10.1.2.2/24'
  set protocols ospf area 0 network '10.0.0.0/8'

  ! Our first vxlan interface
  set interfaces bridge br241 address '172.16.241.1/24'
  set interfaces bridge br241 member interface 'eth1.241'
  set interfaces bridge br241 member interface 'vxlan241'

  set interfaces vxlan vxlan241 group '239.0.0.241'
  set interfaces vxlan vxlan241 source-interface 'eth0'
  set interfaces vxlan vxlan241 vni '241'

  ! Our seconds vxlan interface
  set interfaces bridge br242 address '172.16.242.1/24'
  set interfaces bridge br242 member interface 'eth1.242'
  set interfaces bridge br242 member interface 'vxlan242'

  set interfaces vxlan vxlan242 group '239.0.0.242'
  set interfaces vxlan vxlan242 source-interface 'eth0'
  set interfaces vxlan vxlan242 vni '242'

**Leaf3 configuration:**

.. code-block:: none

  set interfaces ethernet eth0 address '10.1.3.3/24'
  set protocols ospf area 0 network '10.0.0.0/8'

  ! Our first vxlan interface
  set interfaces bridge br241 address '172.16.241.1/24'
  set interfaces bridge br241 member interface 'eth1.241'
  set interfaces bridge br241 member interface 'vxlan241'

  set interfaces vxlan vxlan241 group '239.0.0.241'
  set interfaces vxlan vxlan241 source-interface 'eth0'
  set interfaces vxlan vxlan241 vni '241'

  ! Our seconds vxlan interface
  set interfaces bridge br242 address '172.16.242.1/24'
  set interfaces bridge br242 member interface 'eth1.242'
  set interfaces bridge br242 member interface 'vxlan242'

  set interfaces vxlan vxlan242 group '239.0.0.242'
  set interfaces vxlan vxlan242 source-interface 'eth0'
  set interfaces vxlan vxlan242 vni '242'

As you can see, Leaf2 and Leaf3 configuration is almost identical. There are
lots of commands above, I'll try to into more detail below, command
descriptions are placed under the command boxes:

.. code-block:: none

  set interfaces bridge br241 address '172.16.241.1/24'

This commands creates a bridge that is used to bind traffic on eth1 vlan 241
with the vxlan241-interface. The IP address is not required. It may however be
used as a default gateway for each Leaf which allows devices on the vlan to
reach other subnets. This requires that the subnets are redistributed by OSPF
so that the Spine will learn how to reach it. To do this you need to change the
OSPF network from '10.0.0.0/8' to '0.0.0.0/0' to allow 172.16/12-networks to be
advertised.

.. code-block:: none

  set interfaces bridge br241 member interface 'eth1.241'
  set interfaces bridge br241 member interface 'vxlan241'

Binds eth1.241 and vxlan241 to each other by making them both member
interfaces of the same bridge.

.. code-block:: none

  set interfaces vxlan vxlan241 group '239.0.0.241'

The multicast-group used by all leaves for this vlan extension. Has to be the
same on all leaves that has this interface.

.. code-block:: none

  set interfaces vxlan vxlan241 source-interface 'eth0'

Sets the interface to listen for multicast packets on. Could be a loopback, not
yet tested.

.. code-block:: none

  set interfaces vxlan vxlan241 vni '241'

Sets the unique id for this vxlan-interface. Not sure how it correlates with
multicast-address.

.. code-block:: none

  set interfaces vxlan vxlan241 port 12345

The destination port used for creating a VXLAN interface in Linux defaults to
its pre-standard value of 8472 to preserve backward compatibility. A
configuration directive to support a user-specified destination port to override
that behavior is available using the above command.

Unicast VXLAN
=============

Alternative to multicast, the remote IPv4 address of the VXLAN tunnel can be
set directly. Let's change the Multicast example from above:

.. code-block:: none

  # leaf2 and leaf3
  delete interfaces vxlan vxlan241 group '239.0.0.241'
  delete interfaces vxlan vxlan241 source-interface 'eth0'

  # leaf2
  set interface vxlan vxlan241 remote 10.1.3.3

  # leaf3
  set interface vxlan vxlan241 remote 10.1.2.2

The default port udp is set to 8472.
It can be changed with ``set interface vxlan <vxlanN> port <port>``
