:lastproofread:2021-07-12

.. include:: /_include/need_improvement.txt

######
Policy
######

Policies are used for filtering and traffic management. With policies, network administrators could filter and treat traffic
according to their needs.

There could be a wide range of routing policies. Some examples are listed below:

* Filter traffic based on source/destination address.
* Set some metric to routes learned from a particular neighbor.
* Set some attributes (like AS PATH or Community value) to advertised routes to neighbors.
* Prefer a specific routing protocol routes over another routing protocol running on the same router.

Policies, in VyOS, are implemented using FRR filtering and route maps. Detailed information of FRR could be found in http://docs.frrouting.org/

*************
Configuration
*************

.. _policy-filter:

Filter
======

Filtering is used for both input and output of the routing information. Once filtering is defined, it can be applied in
any direction.
VyOS makes filtering possible using acls and prefix lists.

policy access-list
------------------

Basic filtering could be done by access-list.

.. cfgcmd:: set policy access-list <acl_number>

This command creates the new access list policy, where <acl_number> must be a number from 1 to 2699.

.. cfgcmd:: set policy access-list <acl_number> description <text>

Set description for the access list.

.. cfgcmd:: set policy access-list <acl_number> rule <1-65535> action <permit|deny>

This command creates a new rule in the access list and defines an action.

.. cfgcmd:: set policy access-list <acl_number> rule <1-65535> <destination|source> <any|host|inverse-mask|network>

This command defines matching parameters for access list rule. Matching criteria could be applied to destinarion or source
parameters:

* any: any IP address to match.
* host: single host IP address to match.
* inverse-match: network/netmask to match (requires network be defined).
* network: network/netmask to match (requires inverse-match be defined).

policy access-list6
-------------------

Basic filtering could also be applied to IPv6 traffic.

.. cfgcmd:: set policy access-list6 <text>

This command creates the new IPv6 access list, identified by <text>

.. cfgcmd:: set policy access-list6 <text> description <text>

Set description for the IPv6 access list.

.. cfgcmd:: set policy access-list6 <text> rule <1-65535> action <permit|deny>

This command creates a new rule in the IPv6 access list and defines an action.

.. cfgcmd:: set policy access-list6 <text> rule <1-65535> source <any|exact-match|network>

This command defines matching parameters for IPv6 access list rule. Matching criteria could be applied to source parameters:

* any: any IPv6 address to match.
* exact-match: exact match of the network prefixes.
* network: network/netmask to match (requires inverse-match be defined) BUG, NO inver-match option in access-list6

policy prefix-list
------------------

Prefix lists provides the most powerful prefix based filtering mechanism. In addition to access-list functionality,
ip prefix-list has prefix length range specification.

If no ip prefix list is specified, it acts as permit. If ip prefix list is defined, and no match is found,
default deny is applied.

.. cfgcmd:: set policy prefix-list <text>

This command creates the new prefix-list policy, identified by <text>.

.. cfgcmd:: set policy prefix-list <text> description <text>

Set description for the prefix-list policy.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> action <permit|deny>

This command creates a new rule in the prefix-list and defines an action.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> description <text>

Set description for rule in the prefix-list.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> prefix <x.x.x.x/x>

Prefix to match against.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> ge <0-32>

Netmask greater than length.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> le <0-32>

Netmask less than lenght

policy prefix-list6
-------------------

Prefix list filtering could also be applied to IPv6 traffic.

.. cfgcmd:: set policy prefix-list6 <text>

This command creates the new IPv6 prefix-list policy, identified by <text>.

.. cfgcmd:: set policy prefix-list6 <text> description <text>

Set description for the IPv6 prefix-list policy.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> action <permit|deny>

This command creates a new rule in the IPv6 prefix-list and defines an action.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> description <text>

Set description for rule in IPv6 prefix-list.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> prefix <h:h:h:h:h:h:h:h/x>

IPv6 prefix.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> ge <0-128>

Netmask greater than length.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> le <0-128>

Netmask less than lenght

Route
======

Route policies are defined in this section. This route policies can then be associated to interfaces.

policy route
------------

.. cfgcmd:: set policy route <text>

This command creates a new route policy, identified by <text>.

.. cfgcmd:: set policy route <text> description <text>

Set description for the route policy.

.. cfgcmd:: set policy route <text> enable-default-log

Option to log packets hitting default-action.

.. cfgcmd:: set policy route <text> rule <1-9999> description <text>

Set description for rule in route policy.

.. cfgcmd:: set policy route <text> rule <1-9999> action drop

Set rule action to drop.

.. cfgcmd:: set policy route <text> rule <1-9999> destination address <match_criteria>

Set match criteria based on destination address, where <match_criteria> could be:

* <x.x.x.x>: IP address to match.
* <x.x.x.x/x>: Subnet to match.
* <x.x.x.x>-<x.x.x.x>: IP range to match.
* !<x.x.x.x>: Match everything except the specified address.
* !<x.x.x.x/x>: Match everything except the specified subnet.
* !<x.x.x.x>-<x.x.x.x>: Match everything except the specified range.

.. cfgcmd:: set policy route <text> rule <1-9999> destination group <address-group|network-group|port-group> <text>

Set destination match criteria based on groups, where <text> would be the group name/identifier.

.. cfgcmd:: set policy route <text> rule <1-9999> destination port <match_criteria>

Set match criteria based on destination port, where <match_criteria> could be:

* <port name>: Named port (any name in /etc/services, e.g., http).
* <1-65535>: Numbered port.
* <start>-<end>: Numbered port range (e.g., 1001-1005).

Multiple destination ports can be specified as a comma-separated list. The whole list can also be "negated" using '!'.
For example: '!22,telnet,http,123,1001-1005'

.. cfgcmd:: set policy route <text> rule <1-9999> disable

Option to disable rule.

.. cfgcmd:: set policy route <text> rule <1-9999> fragment <match-grag|match-non-frag>

Set IP fragment match, where:

* match-frag: Second and further fragments of fragmented packets.
* match-non-frag: Head fragments or unfragmented packets.

.. cfgcmd:: set policy route <text> rule <1-9999> icmp <code|type|type-name>

Set ICMP match criterias, based on code and/or types. Types could be referenced by number or by name.

.. cfgcmd:: set policy route <text> rule <1-9999> ipsec <match-ipsec|match-none>

Set IPSec inbound match criterias, where:

* match-ipsec: match inbound IPsec packets.
* match-none: match inbound non-IPsec packets.

.. cfgcmd:: set policy route <text> rule <1-9999> limit burst <0-4294967295>

Set maximum number of packets to alow in excess of rate

.. cfgcmd:: set policy route <text> rule <1-9999> limit rate <text>

Set maximum average matching rate. Format for rate: integer/time_unit, where time_unit could be any one of second, minute,
hour or day.For example 1/second implies rule to be matched at an average of once per second.

.. cfgcmd:: set policy route <text> rule <1-9999> log <enable|disable>

Option to enable or disable log matching rule.

.. cfgcmd:: set policy route <text> rule <1-9999> log <text>

Option to log matching rule.

.. cfgcmd:: set policy route <text> rule <1-9999> protocol <text|0-255|tcp_udp|all|!protocol>

Set protocol to match. Protocol name in /etc/protocols or protocol number, or "tcp_udp" or "all".
Also, protocol could be denied by using !.

.. cfgcmd:: set policy route <text> rule <1-9999> recent <count|time> <1-255|0-4294967295>

Set parameters for matching recently seen sources. This match could be used by seeting count (source address seen more than
<1-255> times) and/or time (source address seen in the last <0-4294967295> seconds).

.. cfgcmd:: set policy route <text> rule <1-9999> set dscp <0-63>

Set packet modifications: Packet Differentiated Services Codepoint (DSCP)

.. cfgcmd:: set policy route <text> rule <1-9999> set mark <1-2147483647>

Set packet modifications: Packet marking

.. cfgcmd:: set policy route <text> rule <1-9999> set table <main|1-200>

Set packet modifications: Routing table to forward packet with.

.. cfgcmd:: set policy route <text> rule <1-9999> set tcp-mss <500-1460>

Set packet modifications: Explicitly set TCP Maximum segment size value.

.. cfgcmd:: set policy route <text> rule <1-9999> source address <match_criteria>

Set match criteria based on source address, where <match_criteria> could be:

* <x.x.x.x>: IP address to match.
* <x.x.x.x/x>: Subnet to match.
* <x.x.x.x>-<x.x.x.x>: IP range to match.
* !<x.x.x.x>: Match everything except the specified address.
* !<x.x.x.x/x>: Match everything except the specified subnet.
* !<x.x.x.x>-<x.x.x.x>: Match everything except the specified range.

.. cfgcmd:: set policy route <text> rule <1-9999> source group <address-group|network-group|port-group> <text>

Set source match criteria based on groups, where <text> would be the group name/identifier.

.. cfgcmd:: set policy route <text> rule <1-9999> source port <match_criteria>

Set match criteria based on source port, where <match_criteria> could be:

* <port name>: Named port (any name in /etc/services, e.g., http).
* <1-65535>: Numbered port.
* <start>-<end>: Numbered port range (e.g., 1001-1005).

Multiple source ports can be specified as a comma-separated list. The whole list can also be "negated" using '!'.
For example: '!22,telnet,http,123,1001-1005'

.. cfgcmd:: set policy route <text> rule <1-9999> state <established|invalid|new|related> <disable|enable>

Set match criteria based on session state.

.. cfgcmd:: set policy route <text> rule <1-9999> tcp flags <text>

Set match criteria based on tcp flags. Allowed values for TCP flags: SYN ACK FIN RST URG PSH ALL
When specifying more than one flag, flags should be comma-separated.
For example : value of 'SYN,!ACK,!FIN,!RST' will only match packets with the SYN flag set, and the ACK, FIN and RST flags unset.

.. cfgcmd:: set policy route <text> rule <1-9999> time monthdays <text>

Set monthdays to match rule on. Format for monthdays: 2,12,21.
To negate add ! at the front eg. !2,12,21

.. cfgcmd:: set policy route <text> rule <1-9999> time startdate <text>

Set date to start matching rule. Format for date: yyyy-mm-dd. To specify time of date with startdate, append
'T' to date followed by time in 24 hour notation hh:mm:ss. For eg startdate
value of 2009-01-21T13:30:00 refers to 21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy route <text> rule <1-9999> time starttime <text>

Set time of day to start matching rule. Format of time: hh:mm:ss using 24 hours notation.

.. cfgcmd:: set policy route <text> rule <1-9999> time stopdate <text>

Set date to stop matching rule. Format for date: yyyy-mm-dd. To specify time of date with stopdate, append
'T' to date followed by time in 24 hour notation hh:mm:ss. For eg startdate
value of 2009-01-21T13:30:00 refers to 21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy route <text> rule <1-9999> time stoptime <text>

Set time of day to stop matching rule. Format of time: hh:mm:ss using 24 hours notation.

.. cfgcmd:: set policy route <text> rule <1-9999> time utc

Interpret times for startdate, stopdate, starttime and stoptime to be UTC.

.. cfgcmd:: set policy route <text> rule <1-9999> time weekdays

Weekdays to match rule on. Format for weekdays: Mon,Thu,Sat. To negate add ! at the front eg. !Mon,Thu,Sat.


policy ipv6-route
-----------------

IPv6 route policies are defined in this section. This route policies can then be associated to interfaces.

.. cfgcmd:: set policy ipv6-route <text>

This command creates a new IPv6 route policy, identified by <text>.

.. cfgcmd:: set policy ipv6-route <text> description <text>

Set description for the IPv6 route policy.

.. cfgcmd:: set policy ipv6-route <text> enable-default-log

Option to log packets hitting default-action.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> action drop

Set rule action to drop.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> description <text>

Set description for rule in IPv6 route policy.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> destination address <match_criteria>

Set match criteria based on destination IPv6 address, where <match_criteria> could be:

* <h:h:h:h:h:h:h:h>: IPv6 address to match.
* <h:h:h:h:h:h:h:h/x>: IPv6 prefix to match.
* <h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: IPv6 range to match.
* !<h:h:h:h:h:h:h:h>: Match everything except the specified address.
* !<h:h:h:h:h:h:h:h/x>: Match everything except the specified prefix.
* !<h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: Match everything except the specified range.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> destination port <match_criteria>

Set match criteria based on destination port, where <match_criteria> could be:

* <port name>: Named port (any name in /etc/services, e.g., http).
* <1-65535>: Numbered port.
* <start>-<end>: Numbered port range (e.g., 1001-1005).

Multiple destination ports can be specified as a comma-separated list. The whole list can also be "negated" using '!'.
For example: '!22,telnet,http,123,1001-1005'

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> disable

Option to disable rule.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> icmpv6 type <icmpv6_typ>

Set ICMPv6 match criterias, based on ICMPv6 type/code name.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> ipsec <match-ipsec|match-none>

Set IPSec inbound match criterias, where:

* match-ipsec: match inbound IPsec packets.
* match-none: match inbound non-IPsec packets.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> limit burst <0-4294967295>

Set maximum number of packets to alow in excess of rate

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> limit rate <text>

Set maximum average matching rate. Format for rate: integer/time_unit, where time_unit could be any one of second, minute,
hour or day.For example 1/second implies rule to be matched at an average of once per second.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> log <enable|disable>

Option to enable or disable log matching rule.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> log <text>

Option to log matching rule.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> protocol <text|0-255|tcp_udp|all|!protocol>

Set IPv6 protocol to match. IPv6 protocol name from /etc/protocols or protocol number, or "tcp_udp" or "all".
Also, protocol could be denied by using !.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> recent <count|time> <1-255|0-4294967295>

Set parameters for matching recently seen sources. This match could be used by seeting count (source address seen more than
<1-255> times) and/or time (source address seen in the last <0-4294967295> seconds).

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set dscp <0-63>

Set packet modifications: Packet Differentiated Services Codepoint (DSCP)

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set mark <1-2147483647>

Set packet modifications: Packet marking.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set table <main|1-200>

Set packet modifications: Routing table to forward packet with.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set tcp-mss <pmtu|500-1460>

Set packet modifications: pmtu option automatically set to Path Maximum Transfer Unit minus 60 bytes. Otherwise, expliicitly
set TCP MSS value from 500 to 1460

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> source address <match_criteria>

Set match criteria based on IPv6 source address, where <match_criteria> could be:

* <h:h:h:h:h:h:h:h>: IPv6 address to match
* <h:h:h:h:h:h:h:h/x>: IPv6 prefix to match
* <h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: IPv6 range to match
* !<h:h:h:h:h:h:h:h>: Match everything except the specified address
* !<h:h:h:h:h:h:h:h/x>: Match everything except the specified prefix
* !<h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: Match everything except the specified range

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> source mac-address <MAC_address|!MAC_address>

Set source match criteria based on MAC address. Declare specific MAC address to match, or match everything except the specified MAC.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> source port <match_criteria>

Set match criteria based on source port, where <match_criteria> could be:

* <port name>: Named port (any name in /etc/services, e.g., http).
* <1-65535>: Numbered port.
* <start>-<end>: Numbered port range (e.g., 1001-1005).

Multiple source ports can be specified as a comma-separated list. The whole list can also be "negated" using '!'.
For example: '!22,telnet,http,123,1001-1005'

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> state <established|invalid|new|related> <disable|enable>

Set match criteria based on session state.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> tcp flags <text>

Set match criteria based on tcp flags. Allowed values for TCP flags: SYN ACK FIN RST URG PSH ALL
When specifying more than one flag, flags should be comma-separated.
For example : value of 'SYN,!ACK,!FIN,!RST' will only match packets with the SYN flag set, and the ACK, FIN and RST flags unset.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time monthdays <text>

Set monthdays to match rule on. Format for monthdays: 2,12,21.
To negate add ! at the front eg. !2,12,21

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time startdate <text>

Set date to start matching rule. Format for date: yyyy-mm-dd. To specify time of date with startdate, append
'T' to date followed by time in 24 hour notation hh:mm:ss. For eg startdate
value of 2009-01-21T13:30:00 refers to 21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time starttime <text>

Set time of day to start matching rule. Format of time: hh:mm:ss using 24 hours notation.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time stopdate <text>

Set date to stop matching rule. Format for date: yyyy-mm-dd. To specify time of date with stopdate, append
'T' to date followed by time in 24 hour notation hh:mm:ss. For eg startdate
value of 2009-01-21T13:30:00 refers to 21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time stoptime <text>

Set time of day to stop matching rule. Format of time: hh:mm:ss using 24 hours notation.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time utc

Interpret times for startdate, stopdate, starttime and stoptime to be UTC.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time weekdays

Weekdays to match rule on. Format for weekdays: Mon,Thu,Sat. To negate add ! at the front eg. !Mon,Thu,Sat.



Route Map
=========

Route map is a powerfull command, that gives network administrators a very useful and flexible tool for traffic manipulation.

policy route-map
----------------

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

.. cfgcmd:: set policy route-map <text> rule <1-65535> match community community-list <text>

BGP community-list to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match community exact-match

Set BGP community-list to exactly match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match extcommunity <text>

BGP extended community to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match interface <text>

First hop interface of a route to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip address access-list <1-2699>

IP address of route to match, based on access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip address prefix-list <text>

IP address of route to match, based on prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip nexthop access-list <1-2699>

IP next-hop of route to match, based on access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip nexthop prefix-list <text>

IP next-hop of route to match, based on prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip route-source access-list <1-2699>

IP route source of route to match, based on access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ip route-source prefix-list <text>

IP route source of route to match, based on prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ipv6 address access-list <text>

IPv6 address of route to match, based on IPv6 access-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ipv6 address prefix-list <text>

IPv6 address of route to match, based on IPv6 prefix-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match ipv6 nexthop <h:h:h:h:h:h:h:h>

Nexthop IPv6 address to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match large-community large-community-list <text>

Match BGP large communities.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match local-preference <0-4294967295>

Match local preference.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match metric <1-65535>

Match route metric.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match origin <egp|igp|incomplete>

Boarder Gateway Protocol (BGP) origin code to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match peer <x.x.x.x>

Peer IP address to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match rpki <invalid|notfound|valid>

Match RPKI validation result.

.. cfgcmd:: set policy route-map <text> rule <1-65535> match tag <1-65535>

Route tag to match.

.. cfgcmd:: set policy route-map <text> rule <1-65535> on-match goto <1-65535>

Exit policy on match: go to rule <1-65535>

.. cfgcmd:: set policy route-map <text> rule <1-65535> on-match next

Exit policy on match: go to next sequence number.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set aggregator <as|ip> <1-4294967295|x.x.x.x>

BGP aggregator attribute: AS number or IP address of an aggregation.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set as-path-exclude <text>

Remove ASN(s) from a BGP AS-path attribute. For example "456 64500 45001".

.. cfgcmd:: set policy route-map <text> rule <1-65535> set as-path-prepend <text>

Prepend string for a BGP AS-path attribute. For example "64501 64501".

.. cfgcmd:: set policy route-map <text> rule <1-65535> set atomic-aggregate

BGP atomic aggregate attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set bgp-extcommunity-rt <aa:nn>

Set route target value. ExtCommunity in format: asn:value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set comm-list comm-list <text>

BGP communities with a community-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set comm-list delete

Delete BGP communities matching the community-list.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set community <aa:bb|local-AS|no-advertise|no-export|internet|additive|none>

Set BGP community attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set distance <0-255>

Locally significant administrative distance.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set extcommunity-rt <text>

Set route target value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set extcommunity-soo <text>

Set site of origin value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set ip-next-hop <x.x.x.x>

Nexthop IP address.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set ipv6-next-hop <global|local> <h:h:h:h:h:h:h:h>

Nexthop IPv6 address.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set large-community <text>

Set BGP large community value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set local-preference <0-4294967295>

Set BGP local preference attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set metric <+/-metric|0-4294967295>

Set destination routing protocol metric. Add or subtract metric, or set metric value.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set metric-type <type-1|type-2>

Set OSPF external metric-type.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set origin <igp|egp|incomplete>

Set BGP origin code.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set originator-id <x.x.x.x>

Set BGP originator ID attribute.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set src <x.x.x.x|h:h:h:h:h:h:h:h>

Set source IP/IPv6 address for route.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set table <1-200>

Set prefixes to table.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set tag <1-65535>

Set tag value for routing protocol.

.. cfgcmd:: set policy route-map <text> rule <1-65535> set weight <0-4294967295>

Set BGP weight attribute



BGP filters
===========

With policies, BGP filters can be created.

policy as-path-list
-------------------

.. cfgcmd:: set policy as-path-list <text>

Create as-path-policy identified by name <text>.

.. cfgcmd:: set policy as-path-list <text> description <text>

Set description for as-path-list policy.

.. cfgcmd:: set policy as-path-list <text> rule <1-65535> action <permit|deny>

Set action to take on entries matching this rule.

.. cfgcmd:: set policy as-path-list <text> rule <1-65535> description <text>

Set description for rule.

.. cfgcmd:: set policy as-path-list <text> rule <1-65535> regex <text>

Regular expression to match against an AS path. For example "64501 64502".


policy community-list
---------------------

.. cfgcmd:: set policy community-list <text>

Creat community-list policy identified by name <text>.

.. cfgcmd:: set policy community-list <text> description <text>

Set description for community-list policy.

.. cfgcmd:: set policy community-list <text> rule <1-65535> action <permit|deny>

Set action to take on entries matching this rule.

.. cfgcmd:: set policy community-list <text> rule <1-65535> description <text>

Set description for rule.

.. cfgcmd:: set policy community-list <text> rule <1-65535> regex <aa:nn|local-AS|no-advertise|no-export|internet|additive>

Regular expression to match against a community-list.


policy extcommunity-list
------------------------

.. cfgcmd:: set policy extcommunity-list <text>

Creat extcommunity-list policy identified by name <text>.

.. cfgcmd:: set policy extcommunity-list <text> description <text>

Set description for extcommunity-list policy.

.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> action <permit|deny>

Set action to take on entries matching this rule.

.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> description <text>

Set description for rule.

.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> regex <text>

Regular expression to match against an extended community list, where text could be:

* <aa:nn:nn>: Extended community list regular expression.
* <rt aa:nn:nn>: Route Target regular expression.
* <soo aa:nn:nn>: Site of Origin regular expression.


policy large-community-list
---------------------------

.. cfgcmd:: set policy large-community-list <text>

Creat large-community-list policy identified by name <text>.

.. cfgcmd:: set policy large-community-list <text> description <text>

Set description for large-community-list policy.

.. cfgcmd:: set policy large-community-list <text> rule <1-65535> action <permit|deny>

Set action to take on entries matching this rule.

.. cfgcmd:: set policy large-community-list <text> rule <1-65535> description <text>

Set description for rule.

.. cfgcmd:: set policy large-community-list <text> rule <1-65535> regex <aa:nn:nn>

Regular expression to match against a large community list.



Local Route
===========

Policies for local traffic are defined in this section.

policy local-route
------------------

.. cfgcmd:: set policy local-route rule <1-32765> set table <1-200|main>

Set routing table to forward packet to.

.. cfgcmd:: set policy local-route rule <1-32765> source <x.x.x.x|x.x.x.x/x>

Set source address or prefix to match.









*************
Examples
*************


Example
=======

**Policy definition:**

.. code-block:: none

  # Create policy
  set policy route-map setmet rule 2 action 'permit'
  set policy route-map setmet rule 2 set as-path-prepend '2 2 2'

  # Apply policy to BGP
  set protocols bgp local-as 1
  set protocols bgp neighbor 203.0.113.2 address-family ipv4-unicast route-map import 'setmet'
  set protocols bgp neighbor 203.0.113.2 address-family ipv4-unicast soft-reconfiguration 'inbound'

Using 'soft-reconfiguration' we get the policy update without bouncing the
neighbor.

**Routes learned before routing policy applied:**

.. code-block:: none

  vyos@vos1:~$ show ip bgp
  BGP table version is 0, local router ID is 192.168.56.101
  Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
                r RIB-failure, S Stale, R Removed
  Origin codes: i - IGP, e - EGP, ? - incomplete

     Network          Next Hop            Metric LocPrf Weight Path
  *> 198.51.100.3/32   203.0.113.2           1             0 2 i  < Path

  Total number of prefixes 1

**Routes learned after routing policy applied:**

.. code-block:: none

  vyos@vos1:~$ show ip bgp
  BGP table version is 0, local router ID is 192.168.56.101
  Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
                r RIB-failure, S Stale, R Removed
  Origin codes: i - IGP, e - EGP, ? - incomplete

     Network          Next Hop            Metric LocPrf Weight Path
  *> 198.51.100.3/32   203.0.113.2           1             0 2 2 2 2 i

  Total number of prefixes 1
  vyos@vos1:~$

You now see the longer AS path.



.. _routing-pbr:

###
PBR
###

:abbr:`PBR (Policy-Based Routing)` allowing traffic to be assigned to
different routing tables. Traffic can be matched using standard 5-tuple
matching (source address, destination address, protocol, source port,
destination port).

Transparent Proxy
=================

The following example will show how VyOS can be used to redirect web
traffic to an external transparent proxy:

.. code-block:: none

  set policy route FILTER-WEB rule 1000 destination port 80
  set policy route FILTER-WEB rule 1000 protocol tcp
  set policy route FILTER-WEB rule 1000 set table 100

This creates a route policy called FILTER-WEB with one rule to set the
routing table for matching traffic (TCP port 80) to table ID 100
instead of the default routing table.

To create routing table 100 and add a new default gateway to be used by
traffic matching our route policy:

.. code-block:: none

  set protocols static table 100 route 0.0.0.0/0 next-hop 10.255.0.2

This can be confirmed using the ``show ip route table 100`` operational
command.

Finally, to apply the policy route to ingress traffic on our LAN
interface, we use:

.. code-block:: none

  set interfaces ethernet eth1 policy route FILTER-WEB


Multiple Uplinks
================

VyOS Policy-Based Routing (PBR) works by matching source IP address
ranges and forwarding the traffic using different routing tables.

Routing tables that will be used in this example are:

* ``table 10`` Routing table used for VLAN 10 (192.168.188.0/24)
* ``table 11`` Routing table used for VLAN 11 (192.168.189.0/24)
* ``main`` Routing table used by VyOS and other interfaces not
  participating in PBR

.. figure:: /_static/images/pbr_example_1.png
   :scale: 80 %
   :alt: PBR multiple uplinks

   Policy-Based Routing with multiple ISP uplinks
   (source ./draw.io/pbr_example_1.drawio)

Add default routes for routing ``table 10`` and ``table 11``

.. code-block:: none

  set protocols static table 10 route 0.0.0.0/0 next-hop 192.0.2.1
  set protocols static table 11 route 0.0.0.0/0 next-hop 192.0.2.2

Add policy route matching VLAN source addresses

.. code-block:: none

  set policy route PBR rule 20 set table '10'
  set policy route PBR rule 20 description 'Route VLAN10 traffic to table 10'
  set policy route PBR rule 20 source address '192.168.188.0/24'

  set policy route PBR rule 30 set table '11'
  set policy route PBR rule 30 description 'Route VLAN11 traffic to table 11'
  set policy route PBR rule 30 source address '192.168.189.0/24'

Apply routing policy to **inbound** direction of out VLAN interfaces

.. code-block:: none

  set interfaces ethernet eth0 vif 10 policy route 'PBR'
  set interfaces ethernet eth0 vif 11 policy route 'PBR'


**OPTIONAL:** Exclude Inter-VLAN traffic (between VLAN10 and VLAN11)
from PBR

.. code-block:: none

  set policy route PBR rule 10 description 'VLAN10 <-> VLAN11 shortcut'
  set policy route PBR rule 10 destination address '192.168.188.0/24'
  set policy route PBR rule 10 destination address '192.168.189.0/24'
  set policy route PBR rule 10 set table 'main'

These commands allow the VLAN10 and VLAN20 hosts to communicate with
each other using the main routing table.

Local route
===========

The following example allows VyOS to use :abbr:`PBR (Policy-Based Routing)`
for traffic, which originated from the router itself. That solution for multiple
ISP's and VyOS router will respond from the same interface that the packet was
received. Also, it used, if we want that one VPN tunnel to be through one
provider, and the second through another.

* ``203.0.113.254`` IP addreess on VyOS eth1 from ISP1
* ``192.168.2.254`` IP addreess on VyOS eth2 from ISP2
* ``table 10`` Routing table used for ISP1
* ``table 11`` Routing table used for ISP2


.. code-block:: none

  set policy local-route rule 101 set table '10'
  set policy local-route rule 101 source '203.0.113.254'
  set policy local-route rule 102 set table '11'
  set policy local-route rule 102 source '192.0.2.254'
  set protocols static table 10 route 0.0.0.0/0 next-hop '203.0.113.1'
  set protocols static table 11 route 0.0.0.0/0 next-hop '192.0.2.2'

Add multiple source IP in one rule with same priority

.. code-block:: none

  set policy local-route rule 101 set table '10'
  set policy local-route rule 101 source '203.0.113.254'
  set policy local-route rule 101 source '203.0.113.253'
  set policy local-route rule 101 source '198.51.100.0/24'

