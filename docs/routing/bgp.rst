.. _routing-bgp:

Border Gateway Protocol (BGP)
-----------------------------

IPv4
^^^^

A simple eBGP configuration:

**Node 1:**

.. code-block:: sh

  set protocols bgp 65534 neighbor 192.168.0.2 ebgp-multihop '2'
  set protocols bgp 65534 neighbor 192.168.0.2 remote-as '65535'
  set protocols bgp 65534 neighbor 192.168.0.2 update-source '192.168.0.1'
  set protocols bgp 65534 address-family ipv4-unicast network '172.16.0.0/16'
  set protocols bgp 65534 parameters router-id '192.168.0.1'

**Node 2:**

.. code-block:: sh

  set protocols bgp 65535 neighbor 192.168.0.1 ebgp-multihop '2'
  set protocols bgp 65535 neighbor 192.168.0.1 remote-as '65534'
  set protocols bgp 65535 neighbor 192.168.0.1 update-source '192.168.0.2'
  set protocols bgp 65535 address-family ipv4-unicast network '172.17.0.0/16'
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
