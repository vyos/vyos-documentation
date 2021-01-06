.. include:: /_include/need_improvement.txt

.. _routing-ospf:

####
OSPF
####

:abbr:`OSPF (Open Shortest Path First)` is a routing protocol for Internet
Protocol (IP) networks. It uses a link state routing (LSR) algorithm and falls
into the group of interior gateway protocols (IGPs), operating within a single
autonomous system (AS). It is defined as OSPF Version 2 in :rfc:`2328` (1998)
for IPv4. Updates for IPv6 are specified as OSPF Version 3 in :rfc:`5340`
(2008). OSPF supports the :abbr:`CIDR (Classless Inter-Domain Routing)`
addressing model.

OSPF is a widely used IGP in large enterprise networks.

OSPFv2 (IPv4)
#############

.. cfgcmd:: set protocols ospf area <number>

   This command is udes to enable the OSPF process. The area number can be 
   specified in decimal notation in the range from 0 to 4294967295. Or it
   can be specified in dotted decimal notation similar to ip address.

.. cfgcmd:: set protocols ospf area <number> network A.B.C.D/M

   This command specifies the OSPF enabled interface(s). If the interface has 
   an address from defined range then the command enables ospf on this 
   interface so router can provide network information to the other ospf 
   routers via this interface.

.. cfgcmd:: set protocols ospf auto-cost reference-bandwidth <number>

   This command sets the reference bandwidth for cost calculations, where 
   bandwidth can be in range from 1 to 4294967, specified in Mbits/s. The 
   default is 100Mbit/s (i.e. a link of bandwidth 100Mbit/s or higher will 
   have a cost of 1. Cost of lower bandwidth links will be scaled with 
   reference to this cost).

.. cfgcmd:: set protocols ospf default-information originate [always] [metric <number>] [metric-type <1|2>] [route-map <name>]

   Originate an AS-External (type-5) LSA describing a default route into all 
   external-routing capable areas, of the specified metric and metric type. 
   If the :cfgcmd:`always` keyword is given then the default is always advertised, 
   even when there is no default present in the routing table. The argument
   :cfgcmd:`route-map` specifies to advertise the default route if the route map 
   is satisfied.

.. cfgcmd:: set protocols ospf default-metric <number>
   
   This command specifies the default metric value of redistributed routes.
   The metric range is 0 to 16777214.
   
.. cfgcmd:: set protocols ospf distance global <distance>

   This command change distance value of OSPF. The distance range is 1 to 255.

.. cfgcmd:: set protocols ospf distance ospf <external|inter-area|intra-area> <distance>

   This command change distance value of OSPF. The arguments are the distance 
   values for external routes, inter-area routes and intra-area routes 
   respectively. The distance range is 1 to 255.
   
   .. note:: Routes with a distance of 255 are effectively disabled and not
      installed into the kernel.

.. cfgcmd:: set protocols ospf parameters router-id <rid>
   
   This command sets the router-ID of the OSPF process. The router-ID may be an
   IP address of the router, but need not be - it can be any arbitrary 32bit number.
   However it MUST be unique within the entire OSPF domain to the OSPF speaker – bad
   things will happen if multiple OSPF speakers are configured with the same router-ID!
   
.. cfgcmd:: set protocols ospf parameters rfc1583-compatibility

   :rfc:`2328`, the successor to :rfc:`1583`, suggests according to section G.2 (changes)
   in section 16.4.1 a change to the path preference algorithm that prevents possible 
   routing loops that were possible in the old version of OSPFv2. More specifically it 
   demands that inter-area paths and intra-area backbone path are now of equal preference 
   but still both preferred to external paths.

   This command should NOT be set normally.

.. cfgcmd:: set protocols ospf passive-interface <interface>

   This command specifies interface as passive. Passive interface advertises its address, 
   but does not run the OSPF protocol (adjacencies are not formed and hello packets are 
   not generated).

.. cfgcmd:: set protocols ospf passive-interface default

   This command specifies all interfaces as passive by default. Because this command changes 
   the configuration logic to a default passive; therefore, interfaces where router adjacencies
   are expected need to be configured with the :cfgcmd:`passive-interface-exclude` command.

.. cfgcmd:: set protocols ospf passive-interface-exclude <interface>

   This command allows exclude interface from passive state. This command is used if the
   command :cfgcmd:`passive-interface default` was configured.

Configuration example
---------------------

Below you can see a typical configuration using 2 nodes, redistribute loopback
address and the node 1 sending the default route:

**Node 1**

.. code-block:: none

  set interfaces loopback lo address 10.1.1.1/32
  set protocols ospf area 0 network 192.168.0.0/24
  set protocols ospf default-information originate always
  set protocols ospf default-information originate metric 10
  set protocols ospf default-information originate metric-type 2
  set protocols ospf log-adjacency-changes
  set protocols ospf parameters router-id 10.1.1.1
  set protocols ospf redistribute connected metric-type 2
  set protocols ospf redistribute connected route-map CONNECT

  set policy route-map CONNECT rule 10 action permit
  set policy route-map CONNECT rule 10 match interface lo

**Node 2**

.. code-block:: none

  set interfaces loopback lo address 10.2.2.2/32
  set protocols ospf area 0 network 192.168.0.0/24
  set protocols ospf log-adjacency-changes
  set protocols ospf parameters router-id 10.2.2.2
  set protocols ospf redistribute connected metric-type 2
  set protocols ospf redistribute connected route-map CONNECT

  set policy route-map CONNECT rule 10 action permit
  set policy route-map CONNECT rule 10 match interface lo


OSPFv3 (IPv6)
#############

A typical configuration using 2 nodes.

**Node 1:**

.. code-block:: none

  set protocols ospfv3 area 0.0.0.0 interface eth1
  set protocols ospfv3 area 0.0.0.0 range 2001:db8:1::/64
  set protocols ospfv3 parameters router-id 192.168.1.1
  set protocols ospfv3 redistribute connected

**Node 2:**

.. code-block:: none

  set protocols ospfv3 area 0.0.0.0 interface eth1
  set protocols ospfv3 area 0.0.0.0 range 2001:db8:2::/64
  set protocols ospfv3 parameters router-id 192.168.2.1
  set protocols ospfv3 redistribute connected

**To see the redistributed routes:**

.. code-block:: none

  show ipv6 ospfv3 redistribute

.. note:: You cannot easily redistribute IPv6 routes via OSPFv3 on a WireGuard
   interface link. This requires you to configure link-local addresses manually
   on the WireGuard interfaces, see :vytask:`T1483`.

Example configuration for WireGuard interfaces:

**Node 1**

.. code-block:: none

  set interfaces wireguard wg01 address 'fe80::216:3eff:fe51:fd8c/64'
  set interfaces wireguard wg01 address '192.168.0.1/24'
  set interfaces wireguard wg01 peer ospf02 allowed-ips '::/0'
  set interfaces wireguard wg01 peer ospf02 allowed-ips '0.0.0.0/0'
  set interfaces wireguard wg01 peer ospf02 endpoint '10.1.1.101:12345'
  set interfaces wireguard wg01 peer ospf02 pubkey 'ie3...='
  set interfaces wireguard wg01 port '12345'
  set protocols ospfv3 parameters router-id 192.168.1.1
  set protocols ospfv3 area 0.0.0.0 interface 'wg01'
  set protocols ospfv3 area 0.0.0.0 interface 'lo'

**Node 2**

.. code-block:: none

  set interfaces wireguard wg01 address 'fe80::216:3eff:fe0a:7ada/64'
  set interfaces wireguard wg01 address '192.168.0.2/24'
  set interfaces wireguard wg01 peer ospf01 allowed-ips '::/0'
  set interfaces wireguard wg01 peer ospf01 allowed-ips '0.0.0.0/0'
  set interfaces wireguard wg01 peer ospf01 endpoint '10.1.1.100:12345'
  set interfaces wireguard wg01 peer ospf01 pubkey 'NHI...='
  set interfaces wireguard wg01 port '12345'
  set protocols ospfv3 parameters router-id 192.168.1.2
  set protocols ospfv3 area 0.0.0.0 interface 'wg01'
  set protocols ospfv3 area 0.0.0.0 interface 'lo'

**Status**

.. code-block:: none

  vyos@ospf01:~$ sh ipv6 ospfv3 neighbor
  Neighbor ID     Pri    DeadTime    State/IfState         Duration I/F[State]
  192.168.0.2       1    00:00:37     Full/PointToPoint    00:18:03 wg01[PointToPoint]

  vyos@ospf02# run sh ipv6 ospfv3 neighbor
  Neighbor ID     Pri    DeadTime    State/IfState         Duration I/F[State]
  192.168.0.1       1    00:00:39     Full/PointToPoint    00:19:44 wg01[PointToPoint]

