# Route and Route6 Policy

IPv4 route and IPv6 route policies are defined in this section. These route
policies can then be associated to interfaces.

## Rule-Sets

A rule-set is a named collection of rules that can be applied to an interface.
Each rule is numbered, has an action to apply if the rule is matched, and the
ability to specify the criteria to match. Data packets go through the rules
from 1 - 999999, at the first match the action of the rule will be executed.

```{eval-rst}
.. cfgcmd:: set policy route <name> description <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> description <text>

   Provide a rule-set description.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> default-log
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> default-log

   Option to log packets hitting default-action.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> description <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> description <text>

   Provide a description for each rule.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> log <enable|disable>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> log <enable|disable>

   Option to enable or disable log matching rule.
```

### Matching criteria

There are a lot of matching criteria options available, both for
`policy route` and `policy route6`. These options are listed
in this section.

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> connection-mark <1-2147483647>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> connection-mark <1-2147483647>

  Set match criteria based on connection mark.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> source address
   <match_criteria>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> destination address
   <match_criteria>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> source address
   <match_criteria>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> destination address
   <match_criteria>

   Set match criteria based on source or destination ipv4|ipv6 address, where
   <match_criteria> could be:
```

For ipv4:
: - \<x.x.x.x>: IP address to match.
  - \<x.x.x.x/x>: Subnet to match.
  - \<x.x.x.x>-\<x.x.x.x>: IP range to match.
  - !\<x.x.x.x>: Match everything except the specified address.
  - !\<x.x.x.x/x>: Match everything except the specified subnet.
  - !\<x.x.x.x>-\<x.x.x.x>: Match everything except the specified range.

And for ipv6:
: - \<h:h:h:h:h:h:h:h>: IPv6 address to match.
  - \<h:h:h:h:h:h:h:h/x>: IPv6 prefix to match.
  - \<h:h:h:h:h:h:h:h>-\<h:h:h:h:h:h:h:h>: IPv6 range to match.
  - !\<h:h:h:h:h:h:h:h>: Match everything except the specified address.
  - !\<h:h:h:h:h:h:h:h/x>: Match everything except the specified prefix.
  - !\<h:h:h:h:h:h:h:h>-\<h:h:h:h:h:h:h:h>: Match everything except the
    specified range.

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> source group
   <address-group|domain-group|mac-group|network-group|port-group> <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> destination group
   <address-group|domain-group|mac-group|network-group|port-group> <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> source group
   <address-group|domain-group|mac-group|network-group|port-group> <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> destination group
   <address-group|domain-group|mac-group|network-group|port-group> <text>

   Set match criteria based on source or destination groups, where <text>
   would be the group name/identifier. Prepend character '!' for inverted
   matching criteria.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> destination port <match_criteria>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> destination port <match_criteria>

   Set match criteria based on destination port, where <match_criteria> could
   be:

   * <port name>: Named port (any name in /etc/services, e.g., http).
   * <1-65535>: Numbered port.
   * <start>-<end>: Numbered port range (e.g., 1001-1005).

   Multiple destination ports can be specified as a comma-separated list. The
   whole list can also be "negated" using '!'. For example:
   '!22,telnet,http,123,1001-1005'
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> disable
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> disable

   Option to disable rule.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> dscp <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> dscp <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> dscp-exclude <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> dscp-exclude <text>

   Match based on dscp value criteria. Multiple values from 0 to 63
   and ranges are supported.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> fragment
   <match-grag|match-non-frag>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> fragment
   <match-grag|match-non-frag>

   Set IP fragment match, where:

   * match-frag: Second and further fragments of fragmented packets.
   * match-non-frag: Head fragments or unfragmented packets.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> icmp <code | type>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> icmpv6 <code | type>

   Match based on icmp|icmpv6 code and type.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> icmp type-name <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> icmpv6 type-name <text>

   Match based on icmp|icmpv6 type-name criteria. Use tab for information
   about what type-name criteria are supported.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> ipsec
   <match-ipsec|match-none>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> ipsec
   <match-ipsec|match-none>

   Set IPSec inbound match criterias, where:

   * match-ipsec: match inbound IPsec packets.
   * match-none: match inbound non-IPsec packets.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> limit burst <0-4294967295>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> limit burst <0-4294967295>

   Set maximum number of packets to alow in excess of rate.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> limit rate <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> limit rate <text>

   Set maximum average matching rate. Format for rate: integer/time_unit, where
   time_unit could be any one of second, minute, hour or day.For example
   1/second implies rule to be matched at an average of once per second.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> protocol
   <text | 0-255 | tcp_udp | all >
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> protocol
   <text | 0-255 | tcp_udp | all >

   Match a protocol criteria. A protocol number or a name which is defined in:
   ``/etc/protocols``. Special names are ``all`` for all protocols and
   ``tcp_udp`` for tcp and udp based packets. The ``!`` negates the selected
   protocol.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> packet-length <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> packet-length <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> packet-length-exclude <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> packet-length-exclude <text>

   Match based on packet length criteria. Multiple values from 1 to 65535
   and ranges are supported.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> packet-type [broadcast | host
   | multicast | other]
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> packet-type [broadcast | host
   | multicast | other]

   Match based on packet type criteria.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> recent count <1-255>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> recent count <1-255>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> recent time <1-4294967295>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> recent time <1-4294967295>

   Set parameters for matching recently seen sources. This match could be used
   by seeting count (source address seen more than <1-255> times) and/or time
   (source address seen in the last <0-4294967295> seconds).
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> state
   <established | invalid | new | related>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> state
   <established | invalid | new | related>

   Set match criteria based on session state.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> tcp flags <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> tcp flags <text>

   Set match criteria based on tcp flags. Allowed values for TCP flags: SYN ACK
   FIN RST URG PSH ALL. When specifying more than one flag, flags should be
   comma-separated. For example : value of 'SYN,!ACK,!FIN,!RST' will only match
   packets with the SYN flag set, and the ACK, FIN and RST flags unset.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> time monthdays <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> time monthdays <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> time startdate <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> time startdate <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> time starttime <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> time starttime <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> time stopdate <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> time stopdate <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> time stoptime <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> time stoptime <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> time weekdays <text>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> time weekdays <text>
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> time utc
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> time utc

   Time to match the defined rule.
```

```{eval-rst}
.. cfgcmd:: set policy route rule <n> ttl <eq | gt | lt> <0-255>

   Match time to live parameter, where 'eq' stands for 'equal'; 'gt' stands for
   'greater than', and 'lt' stands for 'less than'.
```

```{eval-rst}
.. cfgcmd:: set policy route6 rule <n> hop-limit <eq | gt | lt> <0-255>

   Match hop-limit parameter, where 'eq' stands for 'equal'; 'gt' stands for
   'greater than', and 'lt' stands for 'less than'.
```

### Actions

When mathcing all patterns defined in a rule, then different actions can
be made. This includes droping the packet, modifying certain data, or
setting a different routing table.

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> action drop
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> action drop

   Set rule action to drop.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> set connection-mark
   <1-2147483647>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> set connection-mark
   <1-2147483647>

   Set a specific connection mark.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> set dscp <0-63>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> set dscp <0-63>

   Set packet modifications: Packet Differentiated Services Codepoint (DSCP)
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> set mark <1-2147483647>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> set mark <1-2147483647>

   Set a specific packet mark.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> set table <main | 1-200>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> set table <main | 1-200>

   Set the routing table to forward packet with.
```

```{eval-rst}
.. cfgcmd:: set policy route <name> rule <n> set tcp-mss <500-1460>
```

```{eval-rst}
.. cfgcmd:: set policy route6 <name> rule <n> set tcp-mss <500-1460>

   Set packet modifications: Explicitly set TCP Maximum segment size value.
```
