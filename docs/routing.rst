.. _routing:

Routing
=======

VyOS is a "router first" network operating system. It supports static routing,
policy routing, and dynamic routing using standard protocols (RIP, OSPF, and
BGP).

Static
------

Static routes are manually configured network routes.

A typical use for a static route is a static default route for systems that do
not make use of DHCP or dynamic routing protocols:

.. code-block:: sh

  set protocols static route 0.0.0.0/0 next-hop 10.1.1.1 distance '1'

Another common use of static routes is to blackhole (drop) traffic. In the
example below, RFC 1918 private IP networks are set as blackhole routes. This
does not prevent networks within these segments from being used, since the
most specific route is always used. It does, however, prevent traffic to
unknown private networks from leaving the router. Commonly refereed to as
leaking.

.. code-block:: sh

  set protocols static route 10.0.0.0/8 blackhole distance '254'
  set protocols static route 172.16.0.0/12 blackhole distance '254'
  set protocols static route 192.168.0.0/16 blackhole distance '254'

.. note:: Routes with a distance of 255 are effectively disabled and not
   installed into the kernel.

RIP
---

Simple RIP configuration using 2 nodes and redistributing connected interfaces.

**Node 1:**

.. code-block:: sh

  set interfaces loopback address 10.1.1.1/32
  set protocols rip network 192.168.0.0/24
  set protocols rip redistribute connected

**Node 2:**

.. code-block:: sh

  set interfaces loopback address 10.2.2.2/32
  set protocols rip network 192.168.0.0/24
  set protocols rip redistribute connected

OSPF
----

IPv4
^^^^

A typical configuration using 2 nodes, redistribute loopback address and the
node 1 sending the default route:

**Node 1:**

.. code-block:: sh

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

**Node 2:**

.. code-block:: sh

  set interfaces loopback lo address 10.2.2.2/32
  set protocols ospf area 0 network 192.168.0.0/24
  set protocols ospf log-adjacency-changes
  set protocols ospf parameters router-id 10.2.2.2
  set protocols ospf redistribute connected metric-type 2
  set protocols ospf redistribute connected route-map CONNECT

  set policy route-map CONNECT rule 10 action permit
  set policy route-map CONNECT rule 10 match interface lo

IPv6
^^^^

A typical configuration using 2 nodes.

**Node 1:**

.. code-block:: sh

  set protocols ospfv3 area 0.0.0.0 interface eth1
  set protocols ospfv3 area 0.0.0.0 range 2001:db8:1::/64
  set protocols ospfv3 parameters router-id 192.168.1.1
  set protocols ospfv3 redistribute connected

**Node 2:**

.. code-block:: sh

  set protocols ospfv3 area 0.0.0.0 interface eth1
  set protocols ospfv3 area 0.0.0.0 range 2001:db8:2::/64
  set protocols ospfv3 parameters router-id 192.168.2.1
  set protocols ospfv3 redistribute connected

BGP
---

IPv4
^^^^

A simple eBGP configuration:

**Node 1:**

.. code-block:: sh

  set protocols bgp 65534 neighbor 192.168.0.2 ebgp-multihop '2'
  set protocols bgp 65534 neighbor 192.168.0.2 remote-as '65535'
  set protocols bgp 65534 neighbor 192.168.0.2 update-source '192.168.0.1'
  set protocols bgp 65534 network '172.16.0.0/16'
  set protocols bgp 65534 parameters router-id '192.168.0.1'

**Node 2:**

.. code-block:: sh

  set protocols bgp 65535 neighbor 192.168.0.1 ebgp-multihop '2'
  set protocols bgp 65535 neighbor 192.168.0.1 remote-as '65534'
  set protocols bgp 65535 neighbor 192.168.0.1 update-source '192.168.0.2'
  set protocols bgp 65535 network '172.17.0.0/16'
  set protocols bgp 65535 parameters router-id '192.168.0.2'


Don't forget, the CIDR declared in the network statement MUST **exist in your
routing table (dynamic or static), the best way to make sure that is true is
creating a static route:**

**Node 1:**

.. code-block:: sh

  set protocols static route 1.0.0.0/16 blackhole distance '254'

**Node 2:**

.. code-block:: sh

  set protocols static route 2.0.0.0/16 blackhole distance '254'


IPv6
^^^^

A simple BGP configuration via IPv6.

**Node 1:**

.. code-block:: sh

  set protocols bgp 65534 neighbor 2001:db8::2 ebgp-multihop '2'
  set protocols bgp 65534 neighbor 2001:db8::2 remote-as '65535'
  set protocols bgp 65534 neighbor 2001:db8::2 update-source '2001:db8::1'
  set protocols bgp 65534 neighbor 2001:db8::2 address-family ipv6-unicast
  set protocols bgp 65534 address-family ipv6-unicast network '2001:db8:1::/48'
  set protocols bgp 65534 parameters router-id '10.1.1.1'

**Node 2:**

.. code-block:: sh

  set protocols bgp 65535 neighbor 2001:db8::1 ebgp-multihop '2'
  set protocols bgp 65535 neighbor 2001:db8::1 remote-as '65534'
  set protocols bgp 65535 neighbor 2001:db8::1 update-source '2001:db8::2'
  set protocols bgp 65535 neighbor 2001:db8::1 address-family ipv6-unicast
  set protocols bgp 65535 address-family ipv6-unicast network '2001:db8:2::/48'
  set protocols bgp 65535 parameters router-id '10.1.1.2'

Don't forget, the CIDR declared in the network statement **MUST exist in your
routing table (dynamic or static), the best way to make sure that is true is
creating a static route:**

**Node 1:**

.. code-block:: sh

  set protocols static route6 2a001:100:1::/48 blackhole distance '254'

**Node 2:**

.. code-block:: sh

  set protocols static route6 2001:db8:2::/48 blackhole distance '254'

Route Filter
^^^^^^^^^^^^

Route filter can be applied using a route-map:

**Node1:**

.. code-block:: sh

  set policy prefix-list AS65535-IN rule 10 action 'permit'
  set policy prefix-list AS65535-IN rule 10 prefix '172.16.0.0/16'
  set policy prefix-list AS65535-OUT rule 10 action 'deny'
  set policy prefix-list AS65535-OUT rule 10 prefix '172.16.0.0/16'
  set policy prefix-list6 AS65535-IN rule 10 action 'permit'
  set policy prefix-list6 AS65535-IN rule 10 prefix '2001:db8:2::/48'
  set policy prefix-list6 AS65535-OUT rule 10 action 'deny'
  set policy prefix-list6 AS65535-OUT rule 10 prefix '2001:db8:2::/48'
  set policy route-map AS65535-IN rule 10 action 'permit'
  set policy route-map AS65535-IN rule 10 match ip address prefix-list 'AS65535-IN'
  set policy route-map AS65535-IN rule 10 match ipv6 address prefix-list 'AS65535-IN'
  set policy route-map AS65535-IN rule 20 action 'deny'
  set policy route-map AS65535-OUT rule 10 action 'deny'
  set policy route-map AS65535-OUT rule 10 match ip address prefix-list 'AS65535-OUT'
  set policy route-map AS65535-OUT rule 10 match ipv6 address prefix-list 'AS65535-OUT'
  set policy route-map AS65535-OUT rule 20 action 'permit'
  set protocols bgp 65534 neighbor 2001:db8::2 route-map export 'AS65535-OUT'
  set protocols bgp 65534 neighbor 2001:db8::2 route-map import 'AS65535-IN'

**Node2:**

.. code-block:: sh

  set policy prefix-list AS65534-IN rule 10 action 'permit'
  set policy prefix-list AS65534-IN rule 10 prefix '172.17.0.0/16'
  set policy prefix-list AS65534-OUT rule 10 action 'deny'
  set policy prefix-list AS65534-OUT rule 10 prefix '172.17.0.0/16'
  set policy prefix-list6 AS65534-IN rule 10 action 'permit'
  set policy prefix-list6 AS65534-IN rule 10 prefix '2001:db8:1::/48'
  set policy prefix-list6 AS65534-OUT rule 10 action 'deny'
  set policy prefix-list6 AS65534-OUT rule 10 prefix '2001:db8:1::/48'
  set policy route-map AS65534-IN rule 10 action 'permit'
  set policy route-map AS65534-IN rule 10 match ip address prefix-list 'AS65534-IN'
  set policy route-map AS65534-IN rule 10 match ipv6 address prefix-list 'AS65534-IN'
  set policy route-map AS65534-IN rule 20 action 'deny'
  set policy route-map AS65534-OUT rule 10 action 'deny'
  set policy route-map AS65534-OUT rule 10 match ip address prefix-list 'AS65534-OUT'
  set policy route-map AS65534-OUT rule 10 match ipv6 address prefix-list 'AS65534-OUT'
  set policy route-map AS65534-OUT rule 20 action 'permit'
  set protocols bgp 65535 neighbor 2001:db8::1 route-map export 'AS65534-OUT'
  set protocols bgp 65535 neighbor 2001:db8::1 route-map import 'AS65534-IN'

We could expand on this and also deny link local and multicast in the rule 20
action deny.

Policy Routing
==============

VyOS supports Policy Routing, allowing traffic to be assigned to a different
routing table. Traffic can be matched using standard 5-tuple matching (source
address, destination address, protocol, source port, destination port).

The following example will show how VyOS can be used to redirect web traffic to
an external transparent proxy:

.. code-block:: sh

  set policy route FILTER-WEB rule 1000 destination port 80
  set policy route FILTER-WEB rule 1000 protocol tcp
  set policy route FILTER-WEB rule 1000 set table 100

This creates a route policy called FILTER-WEB with one rule to set the routing
table for matching traffic (TCP port 80) to table ID 100 instead of the
default routing table.

To create routing table 100 and add a new default gateway to be used by
traffic matching our route policy:

.. code-block:: sh

  set protocols static table 100 route 0.0.0.0/0 next-hop 10.255.0.2

This can be confirmed using the show ip route table 100 operational command.

Finally, to apply the policy route to ingress traffic on our LAN interface,
we use:

.. code-block:: sh

  set interfaces ethernet eth1 policy route FILTER-WEB

The route policy functionality in VyOS can also be used to rewrite TCP MSS
using the set policy route <name> rule <rule> `set tcp-mss <value>` directive,
modify DSCP value using `set dscp <value>`, or mark the traffic with an
internal ID using `set mark <value>` for further processing (e.g. QOS) on a
per-rule basis for matching traffic.

In addition to 5-tuple matching, additional options such as time-based rules,
are available. See the built-in help for a complete list of options.
