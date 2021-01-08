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

General configuration
---------------------

.. cfgcmd:: set protocols ospf area <number>

   This command is udes to enable the OSPF process. The area number can be 
   specified in decimal notation in the range from 0 to 4294967295. Or it
   can be specified in dotted decimal notation similar to ip address.

.. cfgcmd:: set protocols ospf area <number> network <A.B.C.D/M>

   This command specifies the OSPF enabled interface(s). If the interface has 
   an address from defined range then the command enables OSPF on this 
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
   IP address of the router, but need not be – it can be any arbitrary 32bit number.
   However it MUST be unique within the entire OSPF domain to the OSPF speaker – bad
   things will happen if multiple OSPF speakers are configured with the same router-ID!
   
.. cfgcmd:: set protocols ospf parameters abr-type <cisco|ibm|shortcut|standard>

   This command selects ABR model. OSPF router supports four ABR models:

   "cisco" – a router will be considered as ABR if it has several configured links to 
   the networks in different areas one of which is a backbone area. Moreover, the link 
   to the backbone area should be active (working).
   "ibm" – identical to "cisco" model but in this case a backbone area link may not be active.
   "standard" – router has several active links to different areas.
   "shortcut" – identical to "standard" but in this model a router is allowed to use a 
   connected areas topology without involving a backbone area for inter-area connections.

   Detailed information about "cisco" and "ibm" models differences can be found in :rfc:`3509`. 
   A "shortcut" model allows ABR to create routes between areas based on the topology of the 
   areas connected to this router but not using a backbone area in case if non-backbone route 
   will be cheaper. For more information about "shortcut" model, see :t:`ospf-shortcut-abr-02.txt`

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

.. cfgcmd:: set protocols ospf refresh timers <seconds>

   The router automatically updates link-state information with its neighbors. Only an obsolete
   information is updated which age has exceeded a specific threshold. This parameter changes
   a threshold value, which by default is 1800 seconds (half an hour). The value is applied
   to the whole OSPF router. The timer range is 10 to 1800.


Areas configuration
-------------------

.. cfgcmd:: set protocols ospf area <number> area-type stub

   This command specifies the area to be a Stub Area. That is, an area where no router 
   originates routes external to OSPF and hence an area where all external routes are 
   via the ABR(s). Hence, ABRs for such an area do not need to pass AS-External LSAs 
   (type-5) or ASBR-Summary LSAs (type-4) into the area. They need only pass 
   Network-Summary (type-3) LSAs into such an area, along with a default-route summary.

.. cfgcmd:: set protocols ospf area <number> area-type stub no-summary

   This command specifies the area to be a Totally Stub Area. In addition to stub area
   limitations this area type prevents an ABR from injecting Network-Summary (type-3)
   LSAs into the specified stub area. Only default summary route is allowed.

.. cfgcmd:: set protocols ospf area <number> area-type stub default-cost <number>

   This command sets the cost of default-summary LSAs announced to stubby areas.
   The cost range is 0 to 16777215.

.. cfgcmd:: set protocols ospf area <number> area-type nssa

   This command specifies the area to be a Not So Stubby Area. External routing information
   is imported into an NSSA in Type-7 LSAs. Type-7 LSAs are similar to Type-5 AS-external
   LSAs, except that they can only be flooded into the NSSA. In order to further propagate 
   the NSSA external information, the Type-7 LSA must be translated to a Type-5 
   AS-external-LSA by the NSSA ABR.

.. cfgcmd:: set protocols ospf area <number> area-type nssa no-summary

   This command specifies the area to be a NSSA Totally Stub Area. ABRs for such an area do
   not need to pass Network-Summary (type-3) LSAs (except the default summary route),
   ASBR-Summary LSAs (type-4) and AS-External LSAs (type-5) into the area. But Type-7 LSAs 
   that convert to Type-5 at the NSSA ABR are allowed.

.. cfgcmd:: set protocols ospf area <number> area-type nssa default-cost <number>

   This command sets the default cost of LSAs announced to NSSA areas.
   The cost range is 0 to 16777215.
   
.. cfgcmd:: set protocols ospf area <number> area-type nssa translate <always|candidate|never>

   Specifies whether this NSSA border router will unconditionally translate Type-7 LSAs into 
   Type-5 LSAs. When role is Always, Type-7 LSAs are translated into Type-5 LSAs regardless 
   of the translator state of other NSSA border routers. When role is Candidate, this router 
   participates in the translator election to determine if it will perform the translations 
   duties. When role is Never, this router will never translate Type-7 LSAs into Type-5 LSAs.

.. cfgcmd:: set protocols ospf area <number> authentication plaintext-password

   This command specifies that simple password authentication should be used for the given 
   area. The password must also be configured on a per-interface basis.

.. cfgcmd:: set protocols ospf area <number> authentication md5

   This command specify that OSPF packets must be authenticated with MD5 HMACs within the 
   given area. Keying material must also be configured on a per-interface basis.

.. cfgcmd:: set protocols ospf area <number> shortcut <default|disable|enable>

   This parameter allows to "shortcut" routes (non-backbone) for inter-area routes. There 
   are three modes available for routes shortcutting:

   "default" –  this area will be used for shortcutting only if ABR does not have a link 
   to the backbone area or this link was lost.
   "enable" – the area will be used for shortcutting every time the route that goes through 
   it is cheaper.
   "disable" – this area is never used by ABR for routes shortcutting.
   
.. cfgcmd:: set protocols ospf area <number> virtual-link <A.B.C.D>

   Provides a backbone area coherence by virtual link establishment.

   In general, OSPF protocol requires a backbone area (area 0) to be coherent and fully 
   connected. I.e. any backbone area router must have a route to any other backbone area 
   router. Moreover, every ABR must have a link to backbone area. However, it is not always 
   possible to have a physical link to a backbone area. In this case between two ABR (one 
   of them has a link to the backbone area) in the area (not stub area) a virtual link is organized.

   <number> – area identifier through which a virtual link goes.
   <A.B.C.D> – ABR router-id with which a virtual link is established. Virtual link must be 
   configured on both routers.

   Formally, a virtual link looks like a point-to-point network connecting two ABR from one 
   area one of which physically connected to a backbone area. This pseudo-network is considered
   to belong to a backbone area.


Interfaces configuration
------------------------

.. cfgcmd:: set interfaces <inttype> <intname> ip ospf authentication plaintext-password <text>

   This command sets OSPF authentication key to a simple password. After setting, all OSPF 
   packets are authenticated. Key has length up to 8 chars.

   Simple text password authentication is insecure and deprecated in favour of MD5 HMAC 
   authentication.

.. cfgcmd:: set interfaces <inttype> <intname> ip ospf authentication md5 key-id <id> md5-key <text>

   This command specifys that MD5 HMAC authentication must be used on this interface. It sets 
   OSPF authentication key to a cryptographic password. Key-id identifies secret key used to 
   create the message digest. This ID is part of the protocol and must be consistent across 
   routers on a link. The key can be long up to 16 chars (larger strings will be truncated), 
   and is associated with the given key-id.

.. cfgcmd:: set interfaces <inttype> <intname> ip ospf bandwidth <number>

   This command sets the interface bandwidth for cost calculations, where 
   bandwidth can be in range from 1 to 100000, specified in Mbits/s.
   
.. cfgcmd:: set interfaces <inttype> <intname> ip ospf cost <number>

   This command sets link cost for the specified interface. The cost value is set to
   router-LSA’s metric field and used for SPF calculation. The cost range is 1 to 65535.

.. cfgcmd:: set interfaces <inttype> <intname> ip ospf dead-interval <number>

   Set number of seconds for router Dead Interval timer value used for Wait Timer and 
   Inactivity Timer. This value must be the same for all routers attached to a common 
   network. The default value is 40 seconds. The interval range is 1 to 65535.

.. cfgcmd:: set interfaces <inttype> <intname> ip ospf hello-interval <number>

   Set number of seconds for Hello Interval timer value. Setting this value, Hello 
   packet will be sent every timer value seconds on the specified interface. This 
   value must be the same for all routers attached to a common network. The default 
   value is 10 seconds. The interval range is 1 to 65535.

.. cfgcmd:: set interfaces <inttype> <intname> ip ospf mtu-ignore

   This command disables check of the MTU value in the OSPF DBD packets. Thus, use 
   of this command allows the OSPF adjacency to reach the FULL state even though 
   there is an interface MTU mismatch between two OSPF routers.
   
.. cfgcmd:: set interfaces <inttype> <intname> ip ospf network <type>

   This command allows to specify the distribution type for the network connected 
   to this interface:

   "broadcast" – broadcast IP addresses distribution.
   "non-broadcast" – address distribution in NBMA networks topology.
   "point-to-multipoint" – address distribution in point-to-multipoint networks.
   "point-to-point" – address distribution in point-to-point networks.

.. cfgcmd:: set interfaces <inttype> <intname> ip ospf priority <number>

   This command sets Router Priority integer value. The router with the highest 
   priority will be more eligible to become Designated Router. Setting the value 
   to 0, makes the router ineligible to become Designated Router. The default value 
   is 1. The interval range is 0 to 255.
   
.. cfgcmd:: set interfaces <inttype> <intname> ip ospf retransmit-interval <number>

   This command sets number of seconds for RxmtInterval timer value. This value is used
   when retransmitting Database Description and Link State Request packets if acknowledge
   was not received. The default value is 5 seconds. The interval range is 3 to 65535.
   
.. cfgcmd:: set interfaces <inttype> <intname> ip ospf transmit-delay <number>

   This command sets number of seconds for InfTransDelay value. It allows to set and adjust
   for each interface the delay interval before starting the synchronizing process of the
   router's database with all neighbors. The default value is 1 seconds. The interval range
   is 3 to 65535.


Redistribution configuration
----------------------------

.. cfgcmd:: set protocols ospf redistribute bgp

   Redistribute BGP routes to OSPF process.

.. cfgcmd:: set protocols ospf redistribute connected

   Redistribute connected routes to OSPF process.

.. cfgcmd:: set protocols ospf redistribute kernel

   Redistribute kernel routes to OSPF process.

.. cfgcmd:: set protocols ospf redistribute rip

   Redistribute RIP routes to OSPF process.

.. cfgcmd:: set protocols ospf redistribute static

   Redistribute static routes to OSPF process.
   
.. cfgcmd:: set protocols ospf default-metric <number>
   
   This command specifies the default metric value of redistributed routes.
   The metric range is 0 to 16777214.

.. cfgcmd:: set protocols ospf redistribute <route source> metric <number>

   This command specifies metric for redistributed routes from given route source. There 
   are five modes available for route source: bgp, connected, kernel, rip, static. The 
   metric range is 1 to 16.

.. cfgcmd:: set protocols ospf redistribute <route source> metric-type <1|2>

   This command specifies metric type for redistributed routes. Difference between two metric
   types that metric type 1 is a metric which is "commensurable" with inner OSPF links. When 
   calculating a metric to the external destination, the full path metric is calculated as a 
   metric sum path of a router which had advertised this link plus the link metric. Thus, a 
   route with the least summary metric will be selected. If external link is advertised with 
   metric type 2 the path is selected which lies through the router which advertised this link
   with the least metric despite of the fact that internal path to this router is longer (with
   more cost). However, if two routers advertised an external link and with metric type 2 the
   preference is given to the path which lies through the router with a shorter internal path.
   If two different routers advertised two links to the same external destimation but with
   different metric type, metric type 1 is preferred. If type of a metric left undefined the
   router will consider these external links to have a default metric type 2.

.. cfgcmd:: set protocols ospf redistribute <route source> route-map <name>

   This command allows to use route map to filter redistributed routes from given route source.
   There are five modes available for route source: bgp, connected, kernel, rip, static.


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

