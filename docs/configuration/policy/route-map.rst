################
Route Map Policy
################

Route map is a powerfull command, that gives network administrators a very
useful and flexible tool for traffic manipulation.

*************
Configuration
*************

Route Map
=========

.. cfgcmd:: set policy route-map <text>

   This command creates a new route-map policy, identified by <text>.

.. cfgcmd:: set policy route-map <text> description <text>

   Set description for the route-map policy.

.. cfgcmd:: set policy route-map <text> rule <1-65535> action <permit|deny>

   Set action for the route-map policy.

.. cfgcmd:: set policy route-map <text> rule <1-65535> call <text>

   Call another route-map policy on match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> continue <1-65535>

   Jump to a different rule in this route-map on a match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> description <text>

   Set description for the rule in the route-map policy.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match as-path <text>

   BGP as-path list to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match community
   community-list <text>

   BGP community-list to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match community
   exact-match

   Set BGP community-list to exactly match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match extcommunity
   <text>

   BGP extended community to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match interface <text>

   First hop interface of a route to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip address
   access-list <1-2699>

   IP address of route to match, based on access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip address
   prefix-list <text>

   IP address of route to match, based on prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip nexthop
   access-list <1-2699>

   IP next-hop of route to match, based on access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip nexthop
   prefix-list <text>

   IP next-hop of route to match, based on prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip route-source
   access-list <1-2699>

   IP route source of route to match, based on access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip route-source
   prefix-list <text>

   IP route source of route to match, based on prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ipv6 address
   access-list <text>

   IPv6 address of route to match, based on IPv6 access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ipv6 address
   prefix-list <text>

   IPv6 address of route to match, based on IPv6 prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ipv6 nexthop
   <h:h:h:h:h:h:h:h>

   Nexthop IPv6 address to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match large-community
   large-community-list <text>

   Match BGP large communities.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match local-preference
   <0-4294967295>

   Match local preference.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match metric <1-65535>

   Match route metric.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match origin
   <egp|igp|incomplete>

   Boarder Gateway Protocol (BGP) origin code to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match peer <x.x.x.x>

   Peer IP address to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match rpki
   <invalid|notfound|valid>

   Match RPKI validation result.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match tag <1-65535>

   Route tag to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> on-match goto <1-65535>

   Exit policy on match: go to rule <1-65535>

.. cfgcmd:: set policy route-map <text> rule <1-65535> on-match next

   Exit policy on match: go to next sequence number.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set aggregator <as|ip>
   <1-4294967295|x.x.x.x>

   BGP aggregator attribute: AS number or IP address of an aggregation.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set as-path-exclude
   <text>

   Remove ASN(s) from a BGP AS-path attribute. For example "456 64500 45001".

.. cfgcmd:: set policy route-map <text> rule <1-65535> set as-path-prepend
   <text>

   Prepend string for a BGP AS-path attribute. For example "64501 64501".

.. cfgcmd:: set policy route-map <text> rule <1-65535> set atomic-aggregate

   BGP atomic aggregate attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set bgp-extcommunity-rt
   <aa:nn>

   Set route target value. ExtCommunity in format: asn:value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set comm-list comm-list
   <text>

   BGP communities with a community-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set comm-list delete

   Delete BGP communities matching the community-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set community
   <aa:bb|local-AS|no-advertise|no-export|internet|additive|none>

   Set BGP community attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set distance <0-255>

   Locally significant administrative distance.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set extcommunity-rt
   <text>

   Set route target value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set extcommunity-soo
   <text>

   Set site of origin value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set ip-next-hop
   <x.x.x.x>

   Nexthop IP address.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set ipv6-next-hop
   <global|local> <h:h:h:h:h:h:h:h>

   Nexthop IPv6 address.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set large-community
   <text>

   Set BGP large community value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set local-preference
   <0-4294967295>

   Set BGP local preference attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set metric
   <+/-metric|0-4294967295>

   Set destination routing protocol metric. Add or subtract metric, or set
   metric value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set metric-type
   <type-1|type-2>

   Set OSPF external metric-type.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set origin
   <igp|egp|incomplete>

   Set BGP origin code.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set originator-id
   <x.x.x.x>

   Set BGP originator ID attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set src
   <x.x.x.x|h:h:h:h:h:h:h:h>

   Set source IP/IPv6 address for route.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set table <1-200>

   Set prefixes to table.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set tag <1-65535>

   Set tag value for routing protocol.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set weight
   <0-4294967295>

   Set BGP weight attribute
