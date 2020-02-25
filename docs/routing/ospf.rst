.. include:: ../_include/need_improvement.txt

.. _routing-ospf:

OSPF
----

:abbr:`OSPF (Open Shortest Path First)` is a routing protocol for Internet
Protocol (IP) networks. It uses a link state routing (LSR) algorithm and falls
into the group of interior gateway protocols (IGPs), operating within a single
autonomous system (AS). It is defined as OSPF Version 2 in :rfc:`2328` (1998)
for IPv4. Updates for IPv6 are specified as OSPF Version 3 in :rfc:`5340`
(2008). OSPF supports the :abbr:`CIDR (Classless Inter-Domain Routing)`
addressing model.

OSPF is a widely used IGP in large enterprise networks.

OSPFv2 (IPv4)
^^^^^^^^^^^^^

In order to have a VyOS system exchanging routes with OSPF neighbors, you will
at least need to configure an OSPF area and some network.

.. code-block:: none

  set protocols ospf area 0 network 192.168.0.0/24

That is the minimum configuration you will need.
It is a good practice to define the router ID too.

.. code-block:: none

  set protocols ospf parameters router-id 10.1.1.1


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
^^^^^^^^^^^^^

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

.. note:: You can not easily redistribute IPv6 routes via OSPFv3 on a WireGuard
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

