.. _bgp:

###
BGP
###

:abbr:`BGP (Border Gateway Protocol)` is one of the Exterior Gateway Protocols
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
   with the lowest MED.

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

.. cfgcmd:: set protocols bgp <asn> parameters always-compare-med

   This command provides to compare the MED on routes, even when they were 
   received from different neighbouring ASes. Setting this option makes the 
   order of preference of routes more defined, and should eliminate MED 
   induced oscillations.

.. cfgcmd:: set protocols bgp <asn> parameters bestpath as-path confed

   This command specifies that the length of confederation path sets and
   sequences should be taken into account during the BGP best path
   decision process.

.. cfgcmd:: set protocols bgp <asn> parameters bestpath as-path multipath-relax

   This command specifies that BGP decision process should consider paths
   of equal AS_PATH length candidates for multipath computation. Without
   the knob, the entire AS_PATH must match for multipath computation.

.. cfgcmd:: set protocols bgp <asn> parameters bestpath as-path ignore

   Ignore AS_PATH length when selecting a route

.. cfgcmd:: set protocols bgp <asn> parameters bestpath compare-routerid

   Ensure that when comparing routes where both are equal on most metrics, 
   including local-pref, AS_PATH length, IGP cost, MED, that the tie is 
   broken based on router-ID.

   If this option is enabled, then the already-selected check, where 
   already selected eBGP routes are preferred, is skipped.

   If a route has an ORIGINATOR_ID attribute because it has been reflected, 
   that ORIGINATOR_ID will be used. Otherwise, the router-ID of the peer 
   the route was received from will be used.

   The advantage of this is that the route-selection (at this point) will 
   be more deterministic. The disadvantage is that a few or even one lowest-ID 
   router may attract all traffic to otherwise-equal paths because of this 
   check. It may increase the possibility of MED or IGP oscillation, unless 
   other measures were taken to avoid these. The exact behaviour will be 
   sensitive to the iBGP and reflection topology.

.. cfgcmd:: set protocols bgp <asn> parameters bestpath med confed
   
   This command specifies that BGP considers the MED when comparing routes 
   originated from different sub-ASs within the confederation to which this 
   BGP speaker belongs. The default state, where the MED attribute is not 
   considered.

.. cfgcmd:: set protocols bgp <asn> parameters bestpath med missing-as-worst

   This command specifies that a route with a MED is always considered to be 
   better than a route without a MED by causing the missing MED attribute to 
   have a value of infinity. The default state, where the missing MED 
   attribute is considered to have a value of zero.

.. cfgcmd:: set protocols bgp <asn> parameters default local-pref <local-pref value>

   This command specifies the default local preference value. The local 
   preference range is 0 to 4294967295.
   
.. cfgcmd:: set protocols bgp <asn> parameters deterministic-med

   This command provides to compare different MED values that advertised by 
   neighbours in the same AS for routes selection. When this command is enabled, 
   routes from the same autonomous system are grouped together, and the best 
   entries of each group are compared.

Administrative Distance
-----------------------

.. cfgcmd:: set protocols bgp <asn> parameters distance global <external|internal|local> <distance>

   This command change distance value of BGP. The arguments are the distance 
   values for external routes, internal routes and local routes respectively.
   The distance range is 1 to 255.

.. cfgcmd:: set protocols bgp <asn> parameters distance prefix <subnet> distance <distance>

   This command sets the administrative distance for a particular route. The 
   distance range is 1 to 255.
   
   .. note:: Routes with a distance of 255 are effectively disabled and not
      installed into the kernel.

Network Advertisement
---------------------

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> network <prefix>

   This command is used for advertising IPv4 or IPv6 networks.
   
   .. note:: By default, the BGP prefix is advertised even if it's not present in
      the routing table. This behaviour differs from the implementation of some vendors.
   
.. cfgcmd::  set protocols bgp <asn> parameters network-import-check

   This configuration modifies the behavior of the network statement.
   If you have this configured the underlying network must exist in the 
   routing table.

Route Aggregation
-----------------

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> aggregate-address <prefix>

   This command specifies an aggregate address. The router will also 
   announce longer-prefixes inside of the aggregate address.

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> aggregate-address <prefix> as-set

   This command specifies an aggregate address with a mathematical set of 
   autonomous systems. This command summarizes the AS_PATH attributes of 
   all the individual routes. 

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> aggregate-address <prefix> summary-only

   This command specifies an aggregate address and provides that 
   longer-prefixes inside of the aggregate address are suppressed 
   before sending BGP updates out to peers.

Redistribution
--------------

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> redistribute connected

   Redistribute connected routes to BGP process.

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> redistribute kernel

   Redistribute kernel routes to BGP process.

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> redistribute ospf

   Redistribute OSPF routes to BGP process.

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> redistribute rip

   Redistribute RIP routes to BGP process.

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> redistribute static

   Redistribute static routes to BGP process.

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> redistribute <route source> metric <number>

   This command specifies metric (MED) for redistributed routes. The 
   metric range is 0 to 4294967295.

.. cfgcmd:: set protocols bgp <asn> address-family <ipv4-unicast|ipv6-unicast> redistribute <route source> route-map <name>

   This command allows to use route map to filter redistributed routes.

Peers
-----

Defining Peers
^^^^^^^^^^^^^^

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> remote-as <nasn>

   This command creates a new neighbor whose remote-as is NASN. The neighbor 
   address can be an IPv4 address or an IPv6 address or an interface to use 
   for the connection. The command it applicable for peer and peer group.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> remote-as internal

   Create a peer as you would when you specify an ASN, except that if the 
   peers ASN is different than mine as specified under the :cfgcmd:`protocols 
   bgp <asn>` command the connection will be denied.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> remote-as external

   Create a peer as you would when you specify an ASN, except that if the 
   peers ASN is the same as mine as specified under the :cfgcmd:`protocols 
   bgp <asn>` command the connection will be denied.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> shutdown
   
   This command disable the peer or peer group. To reenable the peer use 
   the delete form of this command.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> description <text>

   Set description of the peer or peer group.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> update-source <address|interface>

   Specify the IPv4 source address to use for the BGP session to this neighbour,
   may be specified as either an IPv4 address directly or as an interface name.

Capability Negotiation
^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> capability dynamic

   This command would allow the dynamic update of capabilities over an 
   established BGP session.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> capability extended-nexthop

   Allow bgp to negotiate the extended-nexthop capability with it’s peer. 
   If you are peering over a IPv6 Link-Local address then this capability 
   is turned on automatically. If you are peering over a IPv6 Global Address 
   then turning on this command will allow BGP to install IPv4 routes with 
   IPv6 nexthops if you do not have IPv4 configured on interfaces.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> disable-capability-negotiation

   Suppress sending Capability Negotiation as OPEN message optional 
   parameter to the peer. This command only affects the peer is 
   configured other than IPv4 unicast configuration.

   When remote peer does not have capability negotiation feature, 
   remote peer will not send any capabilities at all. In that case,
   bgp configures the peer with configured capabilities.

   You may prefer locally configured capabilities more than the negotiated 
   capabilities even though remote peer sends capabilities. If the peer is 
   configured by :cfgcmd:`override-capability`, VyOS ignores received capabilities 
   then override negotiated capabilities with configured values.

   Additionally you should keep in mind that this feature fundamentally 
   disables the ability to use widely deployed BGP features. BGP unnumbered,
   hostname support, AS4, Addpath, Route Refresh, ORF, Dynamic Capabilities,
   and graceful restart.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> override-capability

   This command allow override the result of Capability Negotiation with 
   local configuration. Ignore remote peer’s capability value.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> strict-capability-match

   This command forces strictly compare remote capabilities and local 
   capabilities. If capabilities are different, send Unsupported Capability
   error then reset connection.

   You may want to disable sending Capability Negotiation OPEN message 
   optional parameter to the peer when remote peer does not implement 
   Capability Negotiation. Please use :cfgcmd:`disable-capability-negotiation` 
   command to disable the feature.

Peer Parameters
^^^^^^^^^^^^^^^

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> address-family <ipv4-unicast|ipv6-unicast> allowas-in number <number>

   This command accept incoming routes with AS path containing AS 
   number with the same value as the current system AS. This is 
   used when you want to use the same AS number in your sites,
   but you can’t connect them directly.

   The number parameter (1-10) configures the amount of accepted 
   occurences of the system AS number in AS path.

   This command is only allowed for eBGP peers. It is not applicable 
   for peer groups.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> address-family <ipv4-unicast|ipv6-unicast> as-override

   This command override AS number of the originating router with 
   the local AS number.

   Usually this configuration is used in PEs (Provider Edge) to 
   replace the incoming customer AS number so the connected CE (
   Customer Edge) can use the same AS number as the other customer 
   sites. This allows customers of the provider network to use the 
   same AS number across their sites.

   This command is only allowed for eBGP peers.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> address-family <ipv4-unicast|ipv6-unicast> attribute-unchanged <as-path|med|next-hop>

   This command specifies attributes to be left unchanged for 
   advertisements sent to a peer or peer group.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> address-family <ipv4-unicast|ipv6-unicast> maximum-prefix <number>

   This command specifies a maximum number of prefixes we can receive 
   from a given peer. If this number is exceeded, the BGP session 
   will be destroyed. The number range is 1 to 4294967295.
   
.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> address-family <ipv4-unicast|ipv6-unicast> nexthop-self

   This command forces the BGP speaker to report itself as the 
   next hop for an advertised route it advertised to a neighbor.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> address-family <ipv4-unicast|ipv6-unicast> remove-private-as

   This command removes the private ASN of routes that are advertised 
   to the configured peer. It removes only private ASNs on routes 
   advertised to EBGP peers.
   
   If the AS-Path for the route has only private ASNs, the private 
   ASNs are removed. 
   
   If the AS-Path for the route has a private ASN between public 
   ASNs, it is assumed that this is a design choice, and the 
   private ASN is not removed.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> address-family <ipv4-unicast|ipv6-unicast> weight <number>

   This command specifies a default weight value for the neighbor’s 
   routes. The number range is 1 to 65535.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> advertisement-interval <seconds>

   This command specifies the minimum route advertisement interval for 
   the peer. This number is between 0 and 600 seconds, with the default 
   advertisement interval being 0.
   
.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> disable-connected-check

   This command allows peerings between directly connected eBGP peers 
   using loopback addresses without adjusting the default TTL of 1.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> ebgp-multihop <number>

   This command allows sessions to be established with eBGP neighbors 
   when they are multiple hops away. When the neighbor is not directly 
   connected and this knob is not enabled, the session will not establish.
   The number of hops range is 1 to 255.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> local-as <asn> [no-prepend] [replace-as]

   Specify an alternate AS for this BGP process when interacting with 
   the specified peer or peer group. With no modifiers, the specified 
   local-as is prepended to the received AS_PATH when receiving routing 
   updates from the peer, and prepended to the outgoing AS_PATH (after 
   the process local AS) when transmitting local routes to the peer.

   If the :cfgcmd:`no-prepend` attribute is specified, then the supplied 
   local-as is not prepended to the received AS_PATH.

   If the :cfgcmd:`replace-as` attribute is specified, then only the supplied 
   local-as is prepended to the AS_PATH when transmitting local-route 
   updates to this peer.

   Note that replace-as can only be specified if no-prepend is.
   This command is only allowed for eBGP peers.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> passive

   Configures the BGP speaker so that it only accepts inbound connections 
   from, but does not initiate outbound connections to the peer or peer group.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> ttl-security hops <number>

   This command enforces Generalized TTL Security Mechanism (GTSM), 
   as specified in :rfc:`5082`. With this command, only neighbors 
   that are the specified number of hops away will be allowed to 
   become neighbors. The number of hops range is 1 to 254.This 
   command is mutually exclusive with :cfgcmd:`ebgp-multihop`.   

Peer Groups
^^^^^^^^^^^

Peer groups are used to help improve scaling by generating the same update 
information to all members of a peer group. Note that this means that the 
routes generated by a member of a peer group will be sent back to that 
originating peer with the originator identifier attribute set to indicated 
the originating peer. All peers not associated with a specific peer group 
are treated as belonging to a default peer group, and will share updates.

.. cfgcmd:: set protocols bgp <asn> peer-group <name>

   This command defines a new peer group. You can specify to the group 
   the same parameters that you can specify for specific neighbors.

.. cfgcmd:: set protocols bgp <asn> neighbor <address|interface> peer-group <name>

   This command bind specific peer to peer group with a given name.

General configuration
---------------------

.. cfgcmd:: set protocols bgp <asn> maximum-paths <ebgp|ibgp> <number>

   This command defines the maximum number of parallel routes that 
   the BGP can support. In order for BGP to use the second path, the 
   following attributes have to match: Weight, Local Preference, AS
   Path (both AS number and AS path length), Origin code, MED, IGP 
   metric. Also, the next hop address for each path must be different. 

.. cfgcmd:: set protocols bgp <asn> parameters default no-ipv4-unicast

   This command allows the user to specify that IPv4 peering is turned off by 
   default.

.. cfgcmd:: set protocols bgp <asn> parameters log-neighbor-changes

   Tis command enable logging neighbor up/down changes and reset reason.

.. cfgcmd:: set protocols bgp <asn> parameters no-client-to-client-reflection

   Tis command disables route reflection between route reflector clients.
   By default, the clients of a route reflector are not required to be 
   fully meshed and the routes from a client are reflected to other clients. 
   However, if the clients are fully meshed, route reflection is not required. 
   In this case, use the :cfgcmd:`no-client-to-client-reflection` command 
   to disable client-to-client reflection.

.. cfgcmd:: set protocols bgp <asn> parameters no-fast-external-failover
   
   Disable immediate sesison reset if peer's connected link goes down.

Timers
^^^^^^

.. cfgcmd:: set protocols bgp <asn> timers holdtime <seconds>

   This command specifies hold-time in seconds. The timer can 
   range from 4 to 65535.The default value is 180 second. If
   you set value to 0 VyOS will not hold routes.
   
.. cfgcmd:: set protocols bgp <asn> timers keepalive <seconds>

   This command specifies keep-alive time in seconds. The timer 
   can range from 4 to 65535.The default value is 60 second.

Configuration Examples
----------------------

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
  set protocols bgp 65534 neighbor 2001:db8::2 address-family ipv4-unicast route-map export 'AS65535-OUT'
  set protocols bgp 65534 neighbor 2001:db8::2 address-family ipv4-unicast route-map import 'AS65535-IN'
  set protocols bgp 65534 neighbor 2001:db8::2 address-family ipv6-unicast route-map export 'AS65535-OUT'
  set protocols bgp 65534 neighbor 2001:db8::2 address-family ipv6-unicast route-map import 'AS65535-IN'

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
  set protocols bgp 65535 neighbor 2001:db8::1 address-family ipv4-unicast route-map export 'AS65534-OUT'
  set protocols bgp 65535 neighbor 2001:db8::1 address-family ipv4-unicast route-map import 'AS65534-IN'
  set protocols bgp 65535 neighbor 2001:db8::1 address-family ipv6-unicast route-map export 'AS65534-OUT'
  set protocols bgp 65535 neighbor 2001:db8::1 address-family ipv6-unicast route-map import 'AS65534-IN'

We could expand on this and also deny link local and multicast in the rule 20
action deny.
