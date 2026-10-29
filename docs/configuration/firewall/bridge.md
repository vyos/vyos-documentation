---
myst:
  html_meta:
    description: |
      Bridge layer rule sets: the packet flow through the Bridge layer,
      base and custom rule sets, rules, matching criteria, actions,
      default actions, logging, descriptions, packet modifications,
      and operational commands.
    keywords: firewall, bridge layer, rule set, ethernet-type, vlan, logging
---

(firewall-configuration)=

# Bridge layer

## Packet flow

The firewall processes packets that pass through a bridge at different
processing points, depending on whether the bridge forwards the packet, delivers
the packet to the router, or the router sends the packet out through the bridge.

### Forwarded packets

When a router receives a packet on a bridge member interface, the firewall first
processes it at the `prerouting` processing point, before the bridge makes a
forwarding decision. If the bridge forwards the packet between its member
interfaces, the firewall then processes it at the `forward` processing point.

You configure the rules for these processing points under
`set firewall bridge prerouting filter ...` and
`set firewall bridge forward filter ...`.

:::{figure} /_static/images/firewall-bridge-forward.webp
:::

### Packets delivered to the router

When the bridge delivers a packet that the router receives on a bridge member
interface to the router, the firewall first processes the packet at the
`prerouting` processing point and then at the `input` processing point. The
Bridge layer passes an IPv4 or IPv6 packet that it does not drop to the IP
layer, which then processes the packet starting at the `prerouting` processing
point.

You configure the rules for the `input` processing point under
`set firewall bridge input filter ...`.

:::{figure} /_static/images/firewall-bridge-input.webp
:::

### Packets the router sends out through a bridge

When the router sends a packet out through a bridge, the firewall processes the
packet at the `output` processing point. The packet can be a routed packet or a
packet that the router generates.

You configure the rules for the `output` processing point under
`set firewall bridge output filter ...`.

:::{figure} /_static/images/firewall-bridge-output.webp
:::

## Bridge rule sets

The firewall uses rule sets to process packets. A rule set includes numbered
rules and a default action, and is either base or custom:

- A **base rule set** is named after a processing point: `prerouting`, `input`,
  `forward`, or `output`. The firewall applies it to the packets at that
  processing point.
- A **custom rule set** is configured with a name that you choose. The firewall
  applies the custom rule set to the packets that a base rule set sends to it
  with the `jump` action, directly or through other custom rule sets. The
  firewall applies it at the processing point of that base rule set. If no base
  rule set sends packets to the custom rule set, the firewall does not apply it.

## Configuration

### Rules

A rule has a number from 1 to 999999, an action, and, optionally, one or more
matching criteria, such as the source address, the protocol and destination
port, the Ethernet type, or the {abbr}`VLAN (Virtual Local Area Network)` ID.
When the packet meets all criteria in a rule, the firewall applies the rule's
action. If a rule has no criteria, the firewall applies the rule's action to
every packet that reaches the rule.

The firewall applies the rules to a packet in order, from lowest to highest.
Depending on the action, the firewall then continues with another rule, for
example, after `continue`, `jump`, or `notrack`, or stops applying rules to the
packet, for example, after `accept`, `drop`, or `queue`.

(firewall-bridge-matching-criteria)=

### Matching criteria

This section describes the matching criteria that are available only in Bridge
layer rules. The {doc}`IPv4 </configuration/firewall/ipv4>` and
{doc}`IPv6 </configuration/firewall/ipv6>` pages describe the criteria that
Bridge layer rules share with IPv4 and IPv6 rules:

- Addresses: `[source | destination] address`,
  `[source | destination] address-mask`, `[source | destination] mac-address`,
  and `[source | destination] mac-address-mask`.
- Ports: `[source | destination] port`.
- Protocols: `protocol`, `icmp`, `icmpv6`, and `tcp`.
- Packet fields: `dscp`, `dscp-exclude`, `ttl`, `hop-limit`, `fragment`,
  `packet-length`, `packet-length-exclude`, `packet-type`, and `ipsec`.
- Rate and time: `limit` and `time`.
- Marks and connection state: `mark`, `state`, `connection-mark`, and
  `connection-status`.
- Interfaces: `inbound-interface` and `outbound-interface`.

To configure a shared criterion in a Bridge layer rule, replace `ipv4` or `ipv6`
in the command with `bridge`. For example,
`set firewall bridge forward filter rule 10 source address 192.0.2.2`.

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]

**Apply the rule to the packets with the specified Ethernet type.**

- `802.1q`: Packets with a customer VLAN tag.
- `802.1ad`: Packets with a service VLAN tag.
- `arp`: {abbr}`ARP (Address Resolution Protocol)` packets.
- `ipv4`: IPv4 packets.
- `ipv6`: IPv6 packets.

Prepend `!` to the value to apply the rule to all other Ethernet types, for
example `ethernet-type !arp`.
```

Example:

```none
set firewall bridge forward filter rule 10 ethernet-type arp
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> vlan ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> vlan ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]

**Apply the rule to the VLAN-tagged packets whose VLAN tag carries the specified
Ethernet type.**

The values are the same as for `ethernet-type`. Prepend `!` to the value to
apply the rule to all other Ethernet types.
```

Example:

```none
set firewall bridge forward filter rule 10 vlan ethernet-type ipv4
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> vlan id \<0-4095\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> vlan id \<0-4095\>

**Apply the rule to the packets with the specified VLAN ID.**

Enter a VLAN ID from 0 to 4095, or a range such as `100-200`.
```

Example:

```none
set firewall bridge forward filter rule 10 vlan id 22
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> vlan priority \<0-7\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> vlan priority \<0-7\>

**Apply the rule to the packets with the specified VLAN priority, which is the
{abbr}`PCP (Priority Code Point)` of the VLAN tag.**

Enter a priority from 0 to 7, or a range such as `4-7`.
```

Example:

```none
set firewall bridge forward filter rule 10 vlan priority 5
```

### Reference a group in a criterion

You can reference a group in the matching criteria for addresses, networks,
{abbr}`MAC (Media Access Control)` addresses, ports, and interfaces. A group
that a criterion refers to must exist when you commit the configuration.
Otherwise, the commit fails.

#### IPv4 address group

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> [source | destination] group ipv4-address-group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> [source | destination] group ipv4-address-group \<name | !name\>

**Apply the rule to the packets whose source or destination IPv4 address is a
member of the specified group.**

Define the group with `set firewall group address-group`. Prepend `!` to the
group name to apply the rule to the packets whose IPv4 address is not a member
of the group.
```

Example:

```none
set firewall bridge forward filter rule 10 source group ipv4-address-group SERVERS
```

#### IPv6 address group

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> [source | destination] group ipv6-address-group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> [source | destination] group ipv6-address-group \<name | !name\>

**Apply the rule to the packets whose source or destination IPv6 address is a
member of the specified group.**

Define the group with `set firewall group ipv6-address-group`. Prepend `!` to
the group name to apply the rule to the packets whose IPv6 address is not a
member of the group.
```

Example:

```none
set firewall bridge forward filter rule 10 destination group ipv6-address-group SERVERS6
```

#### IPv4 network group

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> [source | destination] group ipv4-network-group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> [source | destination] group ipv4-network-group \<name | !name\>

**Apply the rule to the packets whose source or destination IPv4 address belongs
to a network of the specified group.**

Define the group with `set firewall group network-group`. Prepend `!` to the
group name to apply the rule to the packets whose IPv4 address does not belong
to any network of the group.
```

Example:

```none
set firewall bridge forward filter rule 10 source group ipv4-network-group LAN4
```

#### IPv6 network group

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> [source | destination] group ipv6-network-group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> [source | destination] group ipv6-network-group \<name | !name\>

**Apply the rule to the packets whose source or destination IPv6 address belongs
to a network of the specified group.**

Define the group with `set firewall group ipv6-network-group`. Prepend `!` to
the group name to apply the rule to the packets whose IPv6 address does not
belong to any network of the group.
```

Example:

```none
set firewall bridge forward filter rule 10 source group ipv6-network-group LAN6
```

#### MAC group

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> [source | destination] group mac-group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> [source | destination] group mac-group \<name | !name\>

**Apply the rule to the packets whose source or destination MAC address is a
member of the specified group.**

Define the group with `set firewall group mac-group`. Prepend `!` to the group
name to apply the rule to the packets whose MAC address is not a member of the
group.
```

Example:

```none
set firewall bridge forward filter rule 10 source group mac-group OFFICE
```

#### Port group

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> [source | destination] group port-group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> [source | destination] group port-group \<name | !name\>

**Apply the rule to the packets whose source or destination port is a member of
the specified group.**

Define the group with `set firewall group port-group`. Prepend `!` to the group
name to apply the rule to the packets whose port is not a member of the group.

Use this criterion together with `protocol tcp`, `protocol udp`, or
`protocol tcp_udp` in the same rule. A rule cannot have both `source port` and
`source group port-group`, or both `destination port` and
`destination group port-group`. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 destination group port-group WEB
```

#### Inbound interface group

```{cfgcmd} set firewall bridge [forward | input | prerouting] filter rule \<1-999999\> inbound-interface group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> inbound-interface group \<name | !name\>

**Apply the rule to the packets that the router receives on an interface that is
a member of the specified group.**

Define the group with `set firewall group interface-group`. Prepend `!` to the
group name to apply the rule to the packets that the router receives on an
interface that is not a member of the group.

You cannot use `inbound-interface name` and `inbound-interface group` in the
same rule. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 inbound-interface group LAN
```

#### Outbound interface group

```{cfgcmd} set firewall bridge [forward | output] filter rule \<1-999999\> outbound-interface group \<name | !name\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> outbound-interface group \<name | !name\>

**Apply the rule to the packets that the router sends out through an interface
that is a member of the specified group.**

Define the group with `set firewall group interface-group`. Prepend `!` to the
group name to apply the rule to the packets that the router sends out through an
interface that is not a member of the group.

You cannot use `outbound-interface name` and `outbound-interface group` in the
same rule. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 outbound-interface group WAN
```

### Actions

A rule's action applies to a packet that reaches the rule and meets all of its
criteria, if the rule has any. An action takes effect at the processing point at
which the firewall applies the rule set. The `notrack` action is the exception:
it marks the packet as untracked, and connection tracking ignores the packet at
the following processing points as well.

```{cfgcmd} set firewall bridge [forward | input | output] filter rule \<1-999999\> action [accept | continue | drop | jump | queue | return]
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> action [accept | continue | drop | jump | notrack | queue | reject | return]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> action [accept | continue | drop | jump | queue | return]

**Configure the action that the firewall applies to a packet.**

- `accept`: The firewall accepts the packet and stops applying rules to the
  packet at the processing point. Rules at the following processing points can
  still drop it.
- `drop`: The firewall drops the packet.
- `queue`: The firewall sends the packet to an application through a queue and
  stops applying rules to the packet at the processing point. The application
  decides whether the packet continues.
- `reject`: The firewall drops the packet and, for IPv4 and IPv6 packets that
  were not sent to a broadcast or multicast address, sends a response to the
  sender. Only rules in the `prerouting` base rule set accept this action.
- `continue`: The firewall continues with the next rule.
- `jump`: The firewall sends the packet to the custom rule set that
  `jump-target` specifies and applies the rules of that rule set to the packet.
- `return`: In a custom rule set, the firewall returns to the rule set that sent
  the packet to the custom rule set and continues there. In a base rule set, the
  firewall accepts the packet without applying the default action.
- `notrack`: The firewall marks the packet as untracked and continues with the
  next rule. Only rules in the `prerouting` base rule set accept this action.

Every rule requires an action. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 action accept
```

#### Jump to a custom rule set

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> jump-target \<text\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> jump-target \<text\>

**Configure the custom rule set to which the `jump` action sends the packet.**

A rule with the `jump` action requires `jump-target`, and `jump-target` requires
the `jump` action. The custom rule set that `jump-target` specifies must exist.
Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 jump-target BR-CUSTOM
```

#### Send packets to a queue

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> queue \<0-65535\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> queue \<0-65535\>

**Configure the queue to which the `queue` action sends the packet.**

Enter a queue number from 0 to 65535, or a range of queue numbers such as `0-3`.
When no queue is configured, the `queue` action sends the packet to queue 0.

The rule must have the `queue` action. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 queue 5
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> queue-options bypass

**Let packets continue through the firewall when no application can receive them
from the queue, instead of dropping them.**

The rule must have the `queue` action. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 queue-options bypass
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> queue-options fanout
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> queue-options fanout

**Configure the firewall to assign a packet to a queue according to the
{abbr}`CPU (Central Processing Unit)` on which the firewall applies the rule.**

For example, with `queue 4-7`, packets on CPU 0 go to queue 4, on CPU 1 to queue
5, on CPU 2 to queue 6, and on CPU 3 to queue 7. If CPUs outnumber queues, the
assignment repeats: packets on CPU 4 go to queue 4 again.

Without `fanout`, the firewall chooses the queue from the range based on the
packet fields, for example, the source address, destination address, and
protocol.

The rule must have the `queue` action and a range in `queue`. Otherwise, the
commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 queue-options fanout
```

### Default actions

The default action applies to a packet that still requires processing after all
rules of the rule set have been applied. If you do not configure the default
action, the firewall uses `accept` in a base rule set and `drop` in a custom
rule set.

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter default-action [accept | drop]
```

```{cfgcmd} set firewall bridge name \<name\> default-action [accept | continue | drop | jump | reject | return]

**Configure the default action that the firewall applies to a packet.**

- `accept`: The firewall accepts the packet and stops applying rules to the
  packet at the processing point. Rules at the following processing points can
  still drop the packet.
- `drop`: The firewall drops the packet.
- `continue`: Available only in a custom rule set. The firewall returns to the
  rule set that sent the packet to the custom rule set and continues there.
- `return`: Available only in a custom rule set. Works the same as `continue`.
- `jump`: Available only in a custom rule set. The firewall sends the packet to
  the custom rule set that `default-jump-target` specifies and applies the rules
  of that rule set to the packet.
- `reject`: Available only in a custom rule set. The firewall drops the packet
  and, for IPv4 and IPv6 packets that were not sent to a broadcast or multicast
  address, sends a response to the sender. Only the `prerouting` and `input`
  base rule sets can send packets to a custom rule set with this default action.
  Otherwise, the commit fails.

A custom rule set with the default action `jump` requires `default-jump-target`.
Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter default-action drop
set firewall bridge name BR-CUSTOM default-action return
```

```{cfgcmd} set firewall bridge name \<name\> default-jump-target \<text\>

**Configure the target custom rule set of the `jump` default action.**

The default action of the sending custom rule set must be `jump`, and the target
must be another existing custom rule set. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge name BR-CUSTOM default-jump-target BR-NEXT
```

### Logging

Use `log` to log the packets to which a rule's action applies, and `default-log`
to log the packets to which the default action applies. For each logged packet,
the firewall writes a log message to the system log at the `warn` level. Log
messages produced with `log` begin with the prefix
`[bri-<point>-<name>-<rule>-<action>]`, and log messages produced with
`default-log` begin with the prefix `[bri-<point>-<name>-default-<action>]`,
where:

- `<point>` is `PRE` for the `prerouting`, `FWD` for the `forward`, `INP` for
  the `input`, and `OUT` for the `output` processing point. For a custom rule
  set, `<point>` is `NAM`.
- `<name>` is `filter` for a base rule set, or the name of the custom rule set.
- `<rule>` is the rule number.
- `<action>` is the first letter of the action in uppercase, for example `A` for
  `accept` and `D` for `drop`.

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> log
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log

**Log the packets to which the firewall applies the action of the specified
rule.**
```

Example:

```none
set firewall bridge forward filter rule 10 log
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter default-log
```

```{cfgcmd} set firewall bridge name \<name\> default-log

**Log a packet to which the firewall applies the default action of the specified
rule set.**
```

Example:

```none
set firewall bridge forward filter default-log
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]

**Write an additional log message for the packet at the specified severity
level.**

The additional message has no prefix, and the level of the log message produced
with `log` does not change.

Also configure `log` for the rule. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 log-options level notice
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> log-options group \<0-65535\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options group \<0-65535\>

**Send an additional message about the packet to the specified log group.**

The additional message has no prefix.

Also configure `log` for the rule. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 log-options group 10
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> log-options snapshot-length \<0-9000\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options snapshot-length \<0-9000\>

**Configure the number of bytes of the packet that the firewall includes in the
message to the log group.**

Also configure `log` and `log-options group`. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 log-options snapshot-length 128
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> log-options queue-threshold \<0-65535\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options queue-threshold \<0-65535\>

**Configure the number of messages that the firewall queues before it sends them
to the log group.**

Also configure `log` and `log-options group`. Otherwise, the commit fails.

The setting has an effect only if the value is greater than 0 and less than the
log group's queue threshold, which is 100 unless the application that reads the
group changes it.
```

Example:

```none
set firewall bridge forward filter rule 10 log-options queue-threshold 20
```

### Descriptions

Add a description to a rule set or to a rule to explain its purpose. The
description of a rule set appears in the output of `show firewall summary`, and
the description of a rule appears in the output of
`show firewall bridge [forward | input | output | prerouting] filter detail` and
`show firewall bridge name <name> detail`.

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter description \<text\>
```

```{cfgcmd} set firewall bridge name \<name\> description \<text\>

**Configure a description for the rule set.**

The description can contain up to 255 characters. Enclose a description that
contains spaces in single quotes.
```

Example:

```none
set firewall bridge forward filter description 'Forwarded bridge traffic'
```

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> description \<text\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> description \<text\>

**Configure a description for the rule.**

The description can contain up to 255 characters. Enclose a description that
contains spaces in single quotes.
```

Example:

```none
set firewall bridge forward filter rule 10 description 'Accept guest VLAN'
```

### Disable a rule

You can disable a rule instead of deleting it. A disabled rule stays in the
configuration, and you can enable it again by deleting `disable`.

```{cfgcmd} set firewall bridge [forward | input | output | prerouting] filter rule \<1-999999\> disable
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> disable

**Disable the rule.**

The firewall does not apply a disabled rule, and the `show firewall` commands do
not list it.

The commit checks a disabled rule in the same way as any other rule, so a
disabled rule must be valid. Otherwise, the commit fails.
```

Example:

```none
set firewall bridge forward filter rule 10 disable
```

### Packet modifications

Beginning with VyOS-1.5-rolling-202410060007, a rule can modify the packets that
meet its criteria. The firewall applies the modifications before it applies the
action of the rule, so the following rules and the following processing points
work with the modified packet.

Packet modifications are available only in the base rule sets of the
`prerouting`, `forward`, and `output` processing points. Of these, only the
`forward` and `output` base rule sets can set the connection mark.

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set dscp \<0-63\>

**Configure the {abbr}`DSCP (Differentiated Services Code Point)` value that the
firewall sets in the IPv4 packets.**
```

Example:

```none
set firewall bridge forward filter rule 10 set dscp 46
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set mark \<1-2147483647\>

**Configure the packet mark that the firewall sets on the packets.**

The packet mark is a number that stays with the packet while the router
processes it. Rules can use it in the `mark` criterion.
```

Example:

```none
set firewall bridge forward filter rule 10 set mark 100
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set tcp-mss \<500-1460\>

**Configure the {abbr}`MSS (Maximum Segment Size)` value that the firewall sets
in the TCP packets that carry the MSS option.**
```

Example:

```none
set firewall bridge forward filter rule 10 set tcp-mss 1400
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set ttl \<0-255\>

**Configure the {abbr}`TTL (Time to Live)` value that the firewall sets in the
IPv4 packets.**
```

Example:

```none
set firewall bridge forward filter rule 10 set ttl 128
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set hop-limit \<0-255\>

**Configure the hop limit that the firewall sets in the IPv6 packets.**
```

Example:

```none
set firewall bridge forward filter rule 10 set hop-limit 64
```

```{cfgcmd} set firewall bridge [forward | output] filter rule \<1-999999\> set connection-mark \<0-2147483647\>

**Configure the connection mark that the firewall sets on the connection of the
packet.**

The connection mark is a number that stays with the connection in connection
tracking. Rules can use it in the `connection-mark` criterion.
```

Example:

```none
set firewall bridge forward filter rule 10 set connection-mark 123
```

## Operation

### Rule sets

Use the following commands to show information about rule sets, their rules, the
states of the global state policy, and firewall groups.

```{opcmd} show firewall

**Show the rules of all IPv4, IPv6, and Bridge rule sets with the action,
protocol, conditions, and packet and byte counters of each rule, and the states
of the global state policy at the IP layer with their packet and byte
counters.**
```

```{opcmd} show firewall summary

**Show a summary of the configured firewall rule sets and firewall groups.**
```

```{opcmd} show firewall statistics

**Show the rules of all IPv4, IPv6, and Bridge rule sets with the action,
source, destination, interfaces, and packet and byte counters of each rule, and
the states of the global state policy at the IP layer with their packet and byte
counters.**
```

```{opcmd} show firewall statistics detail

**Show the rules of all IPv4, IPv6, and Bridge rule sets with the description,
action, source, destination, interfaces, and packet and byte counters of each
rule, and the states of the global state policy at the IP layer with their
packet and byte counters, in a vertical list.**
```

```{opcmd} show firewall bridge

**Show the rules of all Bridge rule sets with the action, protocol, conditions,
and packet and byte counters of each rule.**
```

```{opcmd} show firewall bridge [forward | input | output | prerouting] filter

**Show the rules of the specified base rule set with the action, protocol,
conditions, and packet and byte counters of each rule.**
```

```{opcmd} show firewall bridge [forward | input | output | prerouting] filter detail

**Show the rules of the specified base rule set with the description, action,
protocol, conditions, and packet and byte counters of each rule, in a vertical
list.**
```

```{opcmd} show firewall bridge [forward | input | output | prerouting] filter rule \<rule\>

**Show the specified rule of the base rule set with the action, protocol,
conditions, and packet and byte counters.**
```

```{opcmd} show firewall bridge [forward | input | output | prerouting] filter rule \<rule\> detail

**Show the specified rule of the base rule set with the description, action,
protocol, conditions, and packet and byte counters, in a vertical list.**
```

```{opcmd} show firewall bridge name \<name\>

**Show the rules of the specified custom rule set with the action, protocol,
conditions, and packet and byte counters of each rule.**
```

```{opcmd} show firewall bridge name \<name\> detail

**Show the rules of the specified custom rule set with the description, action,
protocol, conditions, and packet and byte counters of each rule, in a vertical
list.**
```

```{opcmd} show firewall bridge name \<name\> rule \<rule\>

**Show the specified rule of the custom rule set with the action, protocol,
conditions, and packet and byte counters.**
```

```{opcmd} show firewall bridge name \<name\> rule \<rule\> detail

**Show the specified rule of the custom rule set with the description, action,
protocol, conditions, and packet and byte counters, in a vertical list.**
```

### Logs

```{opcmd} show log firewall

**Show the log messages of all IPv4, IPv6, and Bridge rule sets and of the
global state policy.**

The command does not show the messages of the `prerouting` base rule sets.
```

```{opcmd} show log firewall bridge

**Show the log messages of all Bridge rule sets.**

The command does not show the messages of the `prerouting` base rule set. To
show them, use `show log firewall bridge prerouting`.
```

```{opcmd} show log firewall bridge [forward | input | output | prerouting]
```

```{opcmd} show log firewall bridge [forward | input | output | prerouting] filter

**Show the log messages of the specified base rule set.**
```

```{opcmd} show log firewall bridge [forward | input | output | prerouting] filter rule \<rule\>

**Show the log messages of the specified rule of the base rule set.**

The command does not show the messages of the rules with the `queue` and
`notrack` actions.
```

```{opcmd} show log firewall bridge name \<name\>

**Show the log messages of the specified custom rule set.**
```

```{opcmd} show log firewall bridge name \<name\> rule \<rule\>

**Show the log messages of the specified rule of the custom rule set.**

The command does not show the messages of the rules with the `queue` action.
```

## Example

The following example defines an interface group, the rules at the `forward`
processing point, and a custom rule set that rule 30 sends packets to. The
default action of the `forward` base rule set drops and logs the packets that no
rule has accepted.

```none
set firewall group interface-group TRUNK-RIGHT interface 'eth3'

set firewall bridge forward filter default-action 'drop'
set firewall bridge forward filter default-log
set firewall bridge forward filter rule 10 action 'continue'
set firewall bridge forward filter rule 10 inbound-interface name 'eth2'
set firewall bridge forward filter rule 10 vlan id '22'
set firewall bridge forward filter rule 20 action 'drop'
set firewall bridge forward filter rule 20 inbound-interface group 'TRUNK-RIGHT'
set firewall bridge forward filter rule 20 vlan id '60'
set firewall bridge forward filter rule 30 action 'jump'
set firewall bridge forward filter rule 30 jump-target 'TEST'
set firewall bridge forward filter rule 30 outbound-interface name '!eth1'
set firewall bridge forward filter rule 35 action 'accept'
set firewall bridge forward filter rule 35 vlan id '11'
set firewall bridge forward filter rule 40 action 'continue'
set firewall bridge forward filter rule 40 destination mac-address '00:00:5e:00:53:02'
set firewall bridge forward filter rule 40 source mac-address '00:00:5e:00:53:01'
set firewall bridge name TEST default-action 'accept'
set firewall bridge name TEST default-log
set firewall bridge name TEST rule 10 action 'continue'
set firewall bridge name TEST rule 10 log
set firewall bridge name TEST rule 10 vlan priority '0'
```

To view the rules of the `forward` base rule set and of the custom rule set
`TEST` with their counters, use:

```none
show firewall bridge
```

To view the log messages of the `forward` base rule set and of the custom rule
set `TEST`, use:

```none
show log firewall bridge
```
