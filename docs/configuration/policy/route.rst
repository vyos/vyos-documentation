############
Route Policy
############

Route and IPv6 route policies are defined in this section. This route policies
can then be associated to interfaces.

*************
Configuration
*************

Route
=====

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

.. cfgcmd:: set policy route <text> rule <1-9999> destination address
   <match_criteria>

   Set match criteria based on destination address, where <match_criteria>
   could be:

   * <x.x.x.x>: IP address to match.
   * <x.x.x.x/x>: Subnet to match.
   * <x.x.x.x>-<x.x.x.x>: IP range to match.
   * !<x.x.x.x>: Match everything except the specified address.
   * !<x.x.x.x/x>: Match everything except the specified subnet.
   * !<x.x.x.x>-<x.x.x.x>: Match everything except the specified range.

.. cfgcmd:: set policy route <text> rule <1-9999> destination group
   <address-group|network-group|port-group> <text>

   Set destination match criteria based on groups, where <text> would be the
   group name/identifier.

.. cfgcmd:: set policy route <text> rule <1-9999> destination port
   <match_criteria>

   Set match criteria based on destination port, where <match_criteria> could
   be:

   * <port name>: Named port (any name in /etc/services, e.g., http).
   * <1-65535>: Numbered port.
   * <start>-<end>: Numbered port range (e.g., 1001-1005).

   Multiple destination ports can be specified as a comma-separated list. The
   whole list can also be "negated" using '!'. For example:
   '!22,telnet,http,123,1001-1005'

.. cfgcmd:: set policy route <text> rule <1-9999> disable

   Option to disable rule.

.. cfgcmd:: set policy route <text> rule <1-9999> fragment
   <match-grag|match-non-frag>

   Set IP fragment match, where:

   * match-frag: Second and further fragments of fragmented packets.
   * match-non-frag: Head fragments or unfragmented packets.

.. cfgcmd:: set policy route <text> rule <1-9999> icmp <code|type|type-name>

   Set ICMP match criterias, based on code and/or types. Types could be
   referenced by number or by name.

.. cfgcmd:: set policy route <text> rule <1-9999> ipsec
   <match-ipsec|match-none>

   Set IPSec inbound match criterias, where:

   * match-ipsec: match inbound IPsec packets.
   * match-none: match inbound non-IPsec packets.

.. cfgcmd:: set policy route <text> rule <1-9999> limit burst <0-4294967295>

   Set maximum number of packets to alow in excess of rate

.. cfgcmd:: set policy route <text> rule <1-9999> limit rate <text>

   Set maximum average matching rate. Format for rate: integer/time_unit, where
   time_unit could be any one of second, minute, hour or day.For example
   1/second implies rule to be matched at an average of once per second.

.. cfgcmd:: set policy route <text> rule <1-9999> log <enable|disable>

   Option to enable or disable log matching rule.

.. cfgcmd:: set policy route <text> rule <1-9999> log <text>

   Option to log matching rule.

.. cfgcmd:: set policy route <text> rule <1-9999> protocol
   <text|0-255|tcp_udp|all|!protocol>

   Set protocol to match. Protocol name in /etc/protocols or protocol number,
   or "tcp_udp" or "all". Also, protocol could be denied by using !.

.. cfgcmd:: set policy route <text> rule <1-9999> recent <count|time>
   <1-255|0-4294967295>

   Set parameters for matching recently seen sources. This match could be used
   by seeting count (source address seen more than <1-255> times) and/or time
   (source address seen in the last <0-4294967295> seconds).

.. cfgcmd:: set policy route <text> rule <1-9999> set dscp <0-63>

   Set packet modifications: Packet Differentiated Services Codepoint (DSCP)

.. cfgcmd:: set policy route <text> rule <1-9999> set mark <1-2147483647>

   Set packet modifications: Packet marking

.. cfgcmd:: set policy route <text> rule <1-9999> set table <main|1-200>

   Set packet modifications: Routing table to forward packet with.

.. cfgcmd:: set policy route <text> rule <1-9999> set tcp-mss <500-1460>

   Set packet modifications: Explicitly set TCP Maximum segment size value.

.. cfgcmd:: set policy route <text> rule <1-9999> source address
   <match_criteria>

   Set match criteria based on source address, where <match_criteria> could be:

   * <x.x.x.x>: IP address to match.
   * <x.x.x.x/x>: Subnet to match.
   * <x.x.x.x>-<x.x.x.x>: IP range to match.
   * !<x.x.x.x>: Match everything except the specified address.
   * !<x.x.x.x/x>: Match everything except the specified subnet.
   * !<x.x.x.x>-<x.x.x.x>: Match everything except the specified range.

.. cfgcmd:: set policy route <text> rule <1-9999> source group
   <address-group|network-group|port-group> <text>

   Set source match criteria based on groups, where <text> would be the group
   name/identifier.

.. cfgcmd:: set policy route <text> rule <1-9999> source port <match_criteria>

   Set match criteria based on source port, where <match_criteria> could be:

   * <port name>: Named port (any name in /etc/services, e.g., http).
   * <1-65535>: Numbered port.
   * <start>-<end>: Numbered port range (e.g., 1001-1005).

   Multiple source ports can be specified as a comma-separated list. The whole
   list can also be "negated" using '!'. For example:
   '!22,telnet,http,123,1001-1005'

.. cfgcmd:: set policy route <text> rule <1-9999> state
   <established|invalid|new|related> <disable|enable>

   Set match criteria based on session state.

.. cfgcmd:: set policy route <text> rule <1-9999> tcp flags <text>

   Set match criteria based on tcp flags. Allowed values for TCP flags: SYN ACK
   FIN RST URG PSH ALL. When specifying more than one flag, flags should be
   comma-separated. For example : value of 'SYN,!ACK,!FIN,!RST' will only match
   packets with the SYN flag set, and the ACK, FIN and RST flags unset.

.. cfgcmd:: set policy route <text> rule <1-9999> time monthdays <text>

   Set monthdays to match rule on. Format for monthdays: 2,12,21.
   To negate add ! at the front eg. !2,12,21

.. cfgcmd:: set policy route <text> rule <1-9999> time startdate <text>

   Set date to start matching rule. Format for date: yyyy-mm-dd. To specify
   time of date with startdate, append 'T' to date followed by time in 24 hour
   notation hh:mm:ss. For eg startdate value of 2009-01-21T13:30:00 refers to
   21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy route <text> rule <1-9999> time starttime <text>

   Set time of day to start matching rule. Format of time: hh:mm:ss using 24
   hours notation.

.. cfgcmd:: set policy route <text> rule <1-9999> time stopdate <text>

   Set date to stop matching rule. Format for date: yyyy-mm-dd. To specify time
   of date with stopdate, append 'T' to date followed by time in 24 hour
   notation hh:mm:ss. For eg startdate value of 2009-01-21T13:30:00 refers to
   21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy route <text> rule <1-9999> time stoptime <text>

   Set time of day to stop matching rule. Format of time: hh:mm:ss using 24
   hours notation.

.. cfgcmd:: set policy route <text> rule <1-9999> time utc

   Interpret times for startdate, stopdate, starttime and stoptime to be UTC.

.. cfgcmd:: set policy route <text> rule <1-9999> time weekdays

   Weekdays to match rule on. Format for weekdays: Mon,Thu,Sat. To negate add !
   at the front eg. !Mon,Thu,Sat.


IPv6 Route
==========

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

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> destination address
   <match_criteria>

   Set match criteria based on destination IPv6 address, where <match_criteria>
   could be:

   * <h:h:h:h:h:h:h:h>: IPv6 address to match.
   * <h:h:h:h:h:h:h:h/x>: IPv6 prefix to match.
   * <h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: IPv6 range to match.
   * !<h:h:h:h:h:h:h:h>: Match everything except the specified address.
   * !<h:h:h:h:h:h:h:h/x>: Match everything except the specified prefix.
   * !<h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: Match everything except the
     specified range.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> destination port
   <match_criteria>

   Set match criteria based on destination port, where <match_criteria> could
   be:

   * <port name>: Named port (any name in /etc/services, e.g., http).
   * <1-65535>: Numbered port.
   * <start>-<end>: Numbered port range (e.g., 1001-1005).

   Multiple destination ports can be specified as a comma-separated list. The
   whole list can also be "negated" using '!'. For example:
   '!22,telnet,http,123,1001-1005'.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> disable

   Option to disable rule.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> icmpv6 type <icmpv6_typ>

   Set ICMPv6 match criterias, based on ICMPv6 type/code name.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> ipsec
   <match-ipsec|match-none>

   Set IPSec inbound match criterias, where:

   * match-ipsec: match inbound IPsec packets.
   * match-none: match inbound non-IPsec packets.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> limit burst
   <0-4294967295>

   Set maximum number of packets to alow in excess of rate

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> limit rate <text>

   Set maximum average matching rate. Format for rate: integer/time_unit, where
   time_unit could be any one of second, minute, hour or day.For example
   1/second implies rule to be matched at an average of once per second.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> log <enable|disable>

   Option to enable or disable log matching rule.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> log <text>

   Option to log matching rule.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> protocol
   <text|0-255|tcp_udp|all|!protocol>

   Set IPv6 protocol to match. IPv6 protocol name from /etc/protocols or
   protocol number, or "tcp_udp" or "all". Also, protocol could be denied by
   using !.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> recent <count|time>
   <1-255|0-4294967295>

   Set parameters for matching recently seen sources. This match could be used
   by seeting count (source address seen more than <1-255> times) and/or time
   (source address seen in the last <0-4294967295> seconds).

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set dscp <0-63>

   Set packet modifications: Packet Differentiated Services Codepoint (DSCP)

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set mark <1-2147483647>

   Set packet modifications: Packet marking.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set table <main|1-200>

   Set packet modifications: Routing table to forward packet with.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> set tcp-mss
   <pmtu|500-1460>

   Set packet modifications: pmtu option automatically set to Path Maximum
   Transfer Unit minus 60 bytes. Otherwise, expliicitly set TCP MSS value from
   500 to 1460.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> source address
   <match_criteria>

   Set match criteria based on IPv6 source address, where <match_criteria>
   could be:

   * <h:h:h:h:h:h:h:h>: IPv6 address to match
   * <h:h:h:h:h:h:h:h/x>: IPv6 prefix to match
   * <h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: IPv6 range to match
   * !<h:h:h:h:h:h:h:h>: Match everything except the specified address
   * !<h:h:h:h:h:h:h:h/x>: Match everything except the specified prefix
   * !<h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>: Match everything except the
     specified range

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> source mac-address
   <MAC_address|!MAC_address>

   Set source match criteria based on MAC address. Declare specific MAC address
   to match, or match everything except the specified MAC.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> source port
   <match_criteria>

   Set match criteria based on source port, where <match_criteria> could be:

   * <port name>: Named port (any name in /etc/services, e.g., http).
   * <1-65535>: Numbered port.
   * <start>-<end>: Numbered port range (e.g., 1001-1005).

   Multiple source ports can be specified as a comma-separated list. The whole
   list can also be "negated" using '!'. For example:
   '!22,telnet,http,123,1001-1005'.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> state
   <established|invalid|new|related> <disable|enable>

   Set match criteria based on session state.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> tcp flags <text>

   Set match criteria based on tcp flags. Allowed values for TCP flags: SYN ACK
   FIN RST URG PSH ALL. When specifying more than one flag, flags should be
   comma-separated. For example : value of 'SYN,!ACK,!FIN,!RST' will only match
   packets with the SYN flag set, and the ACK, FIN and RST flags unset.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time monthdays <text>

   Set monthdays to match rule on. Format for monthdays: 2,12,21.
   To negate add ! at the front eg. !2,12,21

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time startdate <text>

   Set date to start matching rule. Format for date: yyyy-mm-dd. To specify
   time of date with startdate, append 'T' to date followed by time in 24 hour
   notation hh:mm:ss. For eg startdate value of 2009-01-21T13:30:00 refers to
   21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time starttime <text>

   Set time of day to start matching rule. Format of time: hh:mm:ss using 24
   hours notation.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time stopdate <text>

   Set date to stop matching rule. Format for date: yyyy-mm-dd. To specify time
   of date with stopdate, append 'T' to date followed by time in 24 hour
   notation hh:mm:ss. For eg startdate value of 2009-01-21T13:30:00 refers to
   21st Jan 2009 with time 13:30:00.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time stoptime <text>

   Set time of day to stop matching rule. Format of time: hh:mm:ss using 24
   hours notation.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time utc

   Interpret times for startdate, stopdate, starttime and stoptime to be UTC.

.. cfgcmd:: set policy ipv6-route <text> rule <1-9999> time weekdays

   Weekdays to match rule on. Format for weekdays: Mon,Thu,Sat. To negate add !
   at the front eg. !Mon,Thu,Sat.


********
Examples
********

Examples would be uploaded soon.