.. _bgp:

###
BGP
###

:abbr:`BGP (Border Gateway Protocol) is one of the Exterior Gateway Protocols
and the de facto standard interdomain routing protocol. The latest BGP version
is 4. BGP-4 is described in :rfc:`1771` and updated by :rfc:`4271`. :rfc:`2858`
adds multiprotocol support to BGP.

VyOS makes use of :abbr:`FRR (Free Range Routing)` and we would like to thank
them for their effort!

Basic Concepts
==============

.. _bgp-autonomous-systems:

Autonomous Systems
------------------

From :rfc:`1930`:

   An AS is a connected group of one or more IP prefixes run by one or more
   network operators which has a SINGLE and CLEARLY DEFINED routing policy.

Each AS has an identifying number associated with it called an :abbr:`ASN
(Autonomous System Number)`. This is a two octet value ranging in value from 1
to 65535. The AS numbers 64512 through 65535 are defined as private AS numbers.
Private AS numbers must not be advertised on the global Internet.

The :abbr:`ASN (Autonomous System Number)` is one of the essential elements of
BGP. BGP is a distance vector routing protocol, and the AS-Path framework
provides distance vector metric and loop detection to BGP.

.. _bgp-address-families:

Address Families
----------------

Multiprotocol extensions enable BGP to carry routing information for multiple
network layer protocols. BGP supports an Address Family Identifier (AFI) for
IPv4 and IPv6.

.. _bgp-route-selection:

Route Selection
---------------

The route selection process used by FRR's BGP implementation uses the following
decision criterion, starting at the top of the list and going towards the
bottom until one of the factors can be used.

1. **Weight check**

   Prefer higher local weight routes to lower routes.

2. **Local preference check**

   Prefer higher local preference routes to lower.

3. **Local route check**

   Prefer local routes (statics, aggregates, redistributed) to received routes.

4. **AS path length check**

   Prefer shortest hop-count AS_PATHs.

5. **Origin check**

   Prefer the lowest origin type route. That is, prefer IGP origin routes to
   EGP, to Incomplete routes.

6. **MED check**

   Where routes with a MED were received from the same AS, prefer the route
   with the lowest MED. :ref:`bgp-med`.

7. **External check**

   Prefer the route received from an external, eBGP peer over routes received
   from other types of peers.

8. **IGP cost check**

   Prefer the route with the lower IGP cost.

9. **Multi-path check**

   If multi-pathing is enabled, then check whether the routes not yet
   distinguished in preference may be considered equal. If
   :cfgcmd:`bgp bestpath as-path multipath-relax` is set, all such routes are
   considered equal, otherwise routes received via iBGP with identical AS_PATHs
   or routes received from eBGP neighbours in the same AS are considered equal.

10. **Already-selected external check**

    Where both routes were received from eBGP peers, then prefer the route
    which is already selected. Note that this check is not applied if
    :cfgcmd:`bgp bestpath compare-routerid` is configured. This check can
    prevent some cases of oscillation.

11. **Router-ID check**

    Prefer the route with the lowest `router-ID`. If the route has an
    `ORIGINATOR_ID` attribute, through iBGP reflection, then that router ID is
    used, otherwise the `router-ID` of the peer the route was received from is
    used.

12. **Cluster-List length check**

    The route with the shortest cluster-list length is used. The cluster-list
    reflects the iBGP reflection path the route has taken.

13. **Peer address**

    Prefer the route received from the peer with the higher transport layer
    address, as a last-resort tie-breaker.

.. _bgp-capability-negotiation:

Capability Negotiation
----------------------

When adding IPv6 routing information exchange feature to BGP. There were some
proposals. :abbr:`IETF (Internet Engineering Task Force)`
:abbr:`IDR (Inter Domain Routing)` adopted a proposal called Multiprotocol
Extension for BGP. The specification is described in :rfc:`2283`. The protocol
does not define new protocols. It defines new attributes to existing BGP. When
it is used exchanging IPv6 routing information it is called BGP-4+. When it is
used for exchanging multicast routing information it is called MBGP.

*bgpd* supports Multiprotocol Extension for BGP. So if a remote peer supports
the protocol, *bgpd* can exchange IPv6 and/or multicast routing information.

Traditional BGP did not have the feature to detect a remote peer's
capabilities, e.g. whether it can handle prefix types other than IPv4 unicast
routes. This was a big problem using Multiprotocol Extension for BGP in an
operational network. :rfc:`2842` adopted a feature called Capability
Negotiation. *bgpd* use this Capability Negotiation to detect the remote peer's
capabilities. If a peer is only configured as an IPv4 unicast neighbor, *bgpd*
does not send these Capability Negotiation packets (at least not unless other
optional BGP features require capability negotiation).

By default, FRR will bring up peering with minimal common capability for the
both sides. For example, if the local router has unicast and multicast
capabilities and the remote router only has unicast capability the local router
will establish the connection with unicast only capability. When there are no
common capabilities, FRR sends Unsupported Capability error and then resets the
connection.

.. _bgp-router-configuration:

BGP Router Configuration
========================

ASN and Router ID
-----------------

.. cfgcmd:: set protocols bgp <asn>

   First of all you must configure BGP router with the :abbr:`ASN (Autonomous
   System Number)`. The AS number is an identifier for the autonomous system.
   The BGP protocol uses the AS number for detecting whether the BGP connection
   is internal or external.

.. cfgcmd:: set protocols bgp <asn> parameters router-id

   This command specifies the router-ID. If router ID is not specified it will
   use the highest interface IP address.

Route Selection
---------------

.. cfgcmd:: set protocols bgp <asn> parameters bestpath as-path confed

   This command specifies that the length of confederation path sets and
   sequences should should be taken into account during the BGP best path
   decision process.

.. cfgcmd:: set protocols bgp <asn> parameters bestpath as-path multipath-relax

   This command specifies that BGP decision process should consider paths
   of equal AS_PATH length candidates for multipath computation. Without
   the knob, the entire AS_PATH must match for multipath computation.

.. cfgcmd:: set protocols bgp <asn> parameters bestpath as-path ignore

   Ignore AS_PATH length when selecting a route

IPv4
^^^^

A simple eBGP configuration:

**Node 1:**

.. code-block:: none

  set protocols bgp 65534 neighbor 192.168.0.2 ebgp-multihop '2'
  set protocols bgp 65534 neighbor 192.168.0.2 remote-as '65535'
  set protocols bgp 65534 neighbor 192.168.0.2 update-source '192.168.0.1'
  set protocols bgp 65534 address-family ipv4-unicast network '172.16.0.0/16'
  set protocols bgp 65534 parameters router-id '192.168.0.1'

**Node 2:**

.. code-block:: none

  set protocols bgp 65535 neighbor 192.168.0.1 ebgp-multihop '2'
  set protocols bgp 65535 neighbor 192.168.0.1 remote-as '65534'
  set protocols bgp 65535 neighbor 192.168.0.1 update-source '192.168.0.2'
  set protocols bgp 65535 address-family ipv4-unicast network '172.17.0.0/16'
  set protocols bgp 65535 parameters router-id '192.168.0.2'


Don't forget, the CIDR declared in the network statement MUST **exist in your
routing table (dynamic or static), the best way to make sure that is true is
creating a static route:**

**Node 1:**

.. code-block:: none

  set protocols static route 172.16.0.0/16 blackhole distance '254'

**Node 2:**

.. code-block:: none

  set protocols static route 172.17.0.0/16 blackhole distance '254'


IPv6
^^^^

A simple BGP configuration via IPv6.

**Node 1:**

.. code-block:: none

  set protocols bgp 65534 neighbor 2001:db8::2 ebgp-multihop '2'
  set protocols bgp 65534 neighbor 2001:db8::2 remote-as '65535'
  set protocols bgp 65534 neighbor 2001:db8::2 update-source '2001:db8::1'
  set protocols bgp 65534 neighbor 2001:db8::2 address-family ipv6-unicast
  set protocols bgp 65534 address-family ipv6-unicast network '2001:db8:1::/48'
  set protocols bgp 65534 parameters router-id '10.1.1.1'

**Node 2:**

.. code-block:: none

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

.. code-block:: none

  set protocols static route6 2001:db8:1::/48 blackhole distance '254'

**Node 2:**

.. code-block:: none

  set protocols static route6 2001:db8:2::/48 blackhole distance '254'

Route Filter
^^^^^^^^^^^^

Route filter can be applied using a route-map:

**Node1:**

.. code-block:: none

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

.. code-block:: none

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
