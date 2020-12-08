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

