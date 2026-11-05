---
myst:
  html_meta:
    description: |
      IPv4 rule sets: the packet flow through the processing points of the IP
      layer, base and custom rule sets, rules, last-used tracking, disabling
      connection tracking, matching criteria, actions, synproxy, default
      actions, logging, descriptions, disabling rules, packet modifications,
      and operational commands.
    keywords: firewall, ipv4, rule set, matching criteria, synproxy, logging
---

(firewall-ipv4-configuration)=

# IPv4 layer

## Packet flow

The firewall processes IPv4 packets at different processing points of the IP
layer, depending on whether the router **forwards** the packet, the packet is
**addressed to the router**, or the router **generates the packet**.

### Forwarded packets

When the router receives a packet on an interface that is **not** a bridge
member interface, or the bridge layer passes a packet on to the IP layer, the
firewall first processes the packet at the `prerouting` processing point. At
this processing point, the firewall applies the `prerouting raw` rules, source
validation, policy routing, and destination
{abbr}`NAT (Network Address Translation)`.

If the destination of the packet is not the router, the router routes the
packet, and the firewall then processes the packet at the `forward` processing
point. At this processing point, the firewall applies the global state policy
first and then the `forward filter` rules.

You can configure the rules for the `prerouting` processing point under
`set firewall ipv4 prerouting raw ...` and the rules for the `forward`
processing point under `set firewall ipv4 forward filter ...`.

You can configure source validation under
`set firewall global-options source-validation ...`, the global state policy
under `set firewall global-options state-policy ...`, the `policy route` rules
under `set policy route ...`, and the destination NAT rules under
`set nat destination ...`.

:::{figure} /_static/images/firewall-fwd-packet-flow.webp
:::

### Packets delivered to the router

When an IPv4 packet that the router receives on an interface that is **not** a
bridge member interface, or that the bridge layer passes on to the IP layer, is
addressed to the router, the firewall processes the packet at the `input`
processing point after the `prerouting` processing point. At this processing
point, the firewall applies the global state policy first and then the
`input filter` rules.

You can configure the rules for the `input` processing point under
`set firewall ipv4 input filter ...` and the global state policy
under `set firewall global-options state-policy ...`.

:::{figure} /_static/images/firewall-input-packet-flow.webp
:::

### Packets the router generates

When the router generates an IPv4 packet, the firewall processes the packet at
the `output` processing point. At this processing point, the firewall first
applies the `output raw` rules and then the global state policy and the
`output filter` rules.

You can configure the rules for the `output` processing point under
`set firewall ipv4 output raw ...` and `set firewall ipv4 output filter ...`.
You can configure the global state policy under
`set firewall global-options state-policy ...`.

## Rule sets

The firewall uses **rule sets** to process packets. A rule set includes
**numbered rules** and a **default action**, and is either **base** or
**custom**:

- A **base rule set** is named after the processing point at which the firewall
  applies the rule set to packets and its type: `prerouting raw`,
  `forward filter`, `input filter`, `output raw`, or `output filter`. A `raw`
  rule set applies before connection tracking and a `filter` rule set after it.
- A **custom rule set** is configured with a name that you choose. The firewall
  applies the custom rule set to the packets that a base rule set sends to it
  with the `jump` action, directly or through other custom rule sets, and to the
  packets that the zone-based firewall sends to it. The firewall applies it at
  the processing point of that base rule set or of that zone policy. If neither
  sends packets to the custom rule set, the firewall does not apply it.

## Configuration

### Rules

A **rule** has a **number** from 1 to 999999, an **action**, and, optionally,
one or more **matching criteria**, such as the source address, the protocol and
destination port, or the connection tracking state. When the packet meets all
criteria in a rule, the firewall applies the rule's action. If a rule has no
criteria, the firewall applies the rule's action unconditionally.

The firewall applies the rules to a packet in order, from lowest to highest.
Depending on the action, the firewall then continues with another rule, for
example, after `continue`, `jump`, `offload`, or `notrack`, or stops applying
rules to the packet, for example, after `accept`, `drop`, or `queue`.

### Track when a rule was last used

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> last-used
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> last-used
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> last-used

**Record the time at which the firewall last applied the rule's action to a
packet.**

The `detail` forms of the `show firewall ipv4` commands display the time in the
`Last Used` field.
```

Example:

```none
set firewall ipv4 forward filter rule 10 last-used
```

### Disable connection tracking

You can disable connection tracking only in the `forward filter`,
`input filter`, and `output filter` rule sets. In the `raw` rule sets, use the
`notrack` action to exempt packets from connection tracking.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter disable-conntrack

**Disable connection tracking for the forwarded packets, the packets addressed
to the router, or the generated packets, depending on the rule set.**

The firewall exempts these packets from connection tracking before it applies
the `prerouting raw` and `output raw` rules. A rule in a rule set with disabled
connection tracking cannot match the connection tracking state. Otherwise, the
commit fails.

If you disable connection tracking in either `input filter` or `output filter`,
rules in both rule sets cannot match the connection tracking state. Otherwise,
the commit fails.
```

Example:

```none
set firewall ipv4 forward filter disable-conntrack
```

### Matching criteria

#### Addresses

To select the packets by their source address, a rule can use only one of
`source address`, `source fqdn`, `source geoip`, `source group address-group`,
`source group network-group`, `source group domain-group`, and
`source group remote-group`. The same applies to the destination address and the
`destination` forms of these commands. Otherwise, the commit fails.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] address \<ipv4-address | ipv4-prefix | ipv4-range\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] address \<ipv4-address | ipv4-prefix | ipv4-range\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] address \<ipv4-address | ipv4-prefix | ipv4-range\>

**Apply the rule's action to the packets whose source or destination address is
the specified IPv4 address, belongs to the specified network, or is in the
specified address range.**

Enter an address, a network in {abbr}`CIDR (Classless Inter-Domain Routing)`
notation, or a range such as `192.0.2.10-192.0.2.20`. Prepend `!` to apply the
rule's action to all other addresses.
```

Example:

```none
set firewall ipv4 forward filter rule 10 source address 192.0.2.10
set firewall ipv4 forward filter rule 11 source address '!203.0.113.0/24'
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] address-mask \<ipv4-address\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] address-mask \<ipv4-address\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] address-mask \<ipv4-address\>

**Configure the mask that selects which bits of the source or destination
address of a packet the firewall compares with the rule's address or with the
members of the rule's address group.**

The firewall compares only the bits that the mask selects. The
`source address-mask` applies only to `source address` and
`source group address-group`, and the `destination address-mask` applies only to
`destination address` and `destination group address-group`.

For example, to apply the rule's action to the packets whose destination address
has `11` as the second octet and `13` as the fourth octet, configure the address
`0.11.0.13` and the mask `0.255.0.255`.
```

Example:

```none
set firewall ipv4 forward filter rule 10 destination address 0.11.0.13
set firewall ipv4 forward filter rule 10 destination address-mask 0.255.0.255
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] fqdn \<fqdn\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] fqdn \<fqdn\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] fqdn \<fqdn\>

**Apply the rule's action to the packets whose source or destination address is
an IPv4 address of the specified domain name.**

A domain name must start with a letter or a digit and can contain letters,
digits, hyphens, and dots.

The router updates the addresses of the domain name at the interval that
`resolver-interval` configures.
```

Example:

```none
set firewall ipv4 forward filter rule 10 source fqdn example.com
```

#### GeoIP

To use GeoIP criteria, the router needs the GeoIP databases. You can configure
the download under `set firewall global-options geoip ...` and update the
databases with `update geoip`.

To select the packets by the country or {abbr}`ASN (Autonomous System Number)`
of their source address, a rule can use only one of `source geoip country-code`
and `source geoip asn`. The same applies to the destination address and the
`destination` forms of these commands. Otherwise, the commit fails.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] geoip country-code \<country-code\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] geoip country-code \<country-code\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] geoip country-code \<country-code\>

**Apply the rule's action to the packets whose source or destination address
belongs to the specified country.**

Enter a two-letter country code in lowercase, for example `de`. Repeat the
command to add more countries.
```

Example:

```none
set firewall ipv4 forward filter rule 10 source geoip country-code de
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] geoip asn \<1-4294967294\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] geoip asn \<1-4294967294\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] geoip asn \<1-4294967294\>

**Apply the rule's action to the packets whose source or destination address the
GeoIP databases map to the specified ASN.**

Repeat the command to add more ASNs.
```

Example:

```none
set firewall ipv4 forward filter rule 10 destination geoip asn 64496
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] geoip inverse-match
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] geoip inverse-match
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] geoip inverse-match

**Apply the rule's action to the packets whose source or destination address the
GeoIP databases do not map to any of the rule's countries or ASNs.**

The `source geoip inverse-match` applies to `source geoip country-code` and
`source geoip asn`, and the `destination geoip inverse-match` applies to
`destination geoip country-code` and `destination geoip asn`.
```

Example:

```none
set firewall ipv4 forward filter rule 10 source geoip country-code de
set firewall ipv4 forward filter rule 10 source geoip inverse-match
```

#### Ports

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] port \<port | port-range | service-name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] port \<port | port-range | service-name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] port \<port | port-range | service-name\>

**Apply the rule's action to the packets whose source or destination port is the
specified port.**

Enter a port number from 1 to 65535, a range such as `1001-1005`, or a service
name that `/etc/services` defines, such as `http`. Enter several ports and
ranges as a comma-separated list. Prepend `!` to a port or a range to apply the
rule's action to all other ports.

The rule must set `protocol` to `tcp`, `udp`, or `tcp_udp`. A rule cannot use
`source port` together with `source group port-group`, or `destination port`
together with `destination group port-group`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 destination port 'http,443,1001-1005'
```

#### MAC addresses

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] mac-address \<mac-address\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] mac-address \<mac-address\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] mac-address \<mac-address\>

**Apply the rule's action to the packets whose source or destination
{abbr}`MAC (Media Access Control)` address is the specified MAC address.**

Prepend `!` to apply the rule's action to all other MAC addresses.
```

Example:

```none
set firewall ipv4 input filter rule 10 source mac-address 00:00:5e:00:53:01
set firewall ipv4 input filter rule 11 source mac-address '!00:00:5e:00:53:02'
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] mac-address-mask \<mac-address\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] mac-address-mask \<mac-address\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] mac-address-mask \<mac-address\>

**Configure the mask that selects which bits of the source or destination MAC
address of a packet the firewall compares with the rule's MAC address.**

The firewall compares only the bits that the mask selects. The
`source mac-address-mask` requires `source mac-address`, and the
`destination mac-address-mask` requires `destination mac-address`. Otherwise,
the commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 source mac-address 00:00:5e:00:53:00
set firewall ipv4 input filter rule 10 source mac-address-mask ff:ff:ff:ff:ff:00
```

#### Interfaces

```{cfgcmd} set firewall ipv4 [forward | input] filter rule \<1-999999\> inbound-interface name \<interface-name\>
```

```{cfgcmd} set firewall ipv4 prerouting raw rule \<1-999999\> inbound-interface name \<interface-name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> inbound-interface name \<interface-name\>

**Apply the rule's action to the packets that the router receives on the
specified interface.**

End the name with `*` to apply the rule's action to all interfaces whose names
begin with the specified text, for example `eth2*`. Prepend `!` to apply the
rule's action to all other interfaces.

For a packet that the router receives on a bridge member interface and the
bridge passes to the IP layer, the receiving interface is the bridge interface.

If an interface belongs to a {abbr}`VRF (Virtual Routing and Forwarding)`, enter
the name of the VRF.

You cannot use `inbound-interface name` and `inbound-interface group` in the
same rule. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 inbound-interface name 'eth2*'
set firewall ipv4 forward filter rule 11 inbound-interface name MGMT
```

```{cfgcmd} set firewall ipv4 [forward | input] filter rule \<1-999999\> inbound-interface group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 prerouting raw rule \<1-999999\> inbound-interface group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> inbound-interface group \<name | !name\>

**Apply the rule's action to the packets that the router receives on an
interface that is a member of the specified interface group.**

Define the group with `set firewall group interface-group`. Prepend `!` to the
group name to apply the rule's action to the packets that the router receives on
an interface that is not a member of the group.

You cannot use `inbound-interface name` and `inbound-interface group` in the
same rule. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 inbound-interface group LAN
```

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> outbound-interface name \<interface-name\>
```

```{cfgcmd} set firewall ipv4 output raw rule \<1-999999\> outbound-interface name \<interface-name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> outbound-interface name \<interface-name\>

**Apply the rule's action to the packets that the router sends out through the
specified interface.**

End the name with `*` to apply the rule's action to all interfaces whose names
begin with the specified text, for example `eth2*`. Prepend `!` to apply the
rule's action to all other interfaces.

For a packet that the router sends out through a bridge and the IP layer passes
to the bridge, the outgoing interface is the bridge interface.

You cannot use `outbound-interface name` and `outbound-interface group` in the
same rule. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 outbound-interface name eth0
```

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> outbound-interface group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 output raw rule \<1-999999\> outbound-interface group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> outbound-interface group \<name | !name\>

**Apply the rule's action to the packets that the router sends out through an
interface that is a member of the specified interface group.**

Define the group with `set firewall group interface-group`. Prepend `!` to the
group name to apply the rule's action to the packets that the router sends out
through an interface that is not a member of the group.

You cannot use `outbound-interface name` and `outbound-interface group` in the
same rule. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 outbound-interface group WAN
```

#### Groups

You can reference a group in the matching criteria for addresses, networks, MAC
addresses, ports, domain names, and interfaces. The
{doc}`firewall groups </configuration/firewall/groups>` page describes how to
define groups. A rule that refers to an address, network, domain, remote, port,
or interface group requires that group to exist. Otherwise, the commit fails.

To select the packets by the membership of their source address in a group, a
rule can use only one of `source group address-group`,
`source group network-group`, `source group domain-group`, and
`source group remote-group`. A rule cannot use any of them together with
`source address`, `source fqdn`, or `source geoip`.

The same applies to the destination address and the `destination` forms of these
commands. Otherwise, the commit fails.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] group address-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] group address-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] group address-group \<name | !name\>

**Apply the rule's action to the packets whose source or destination address is
a member of the specified address group.**

Prepend `!` to the group name to apply the rule's action to the packets whose
address is not a member of the group.
```

Example:

```none
set firewall ipv4 forward filter rule 10 source group address-group SERVERS
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] group network-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] group network-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] group network-group \<name | !name\>

**Apply the rule's action to the packets whose source or destination address
belongs to a network of the specified network group.**

Prepend `!` to the group name to apply the rule's action to the packets whose
address does not belong to any network of the group.
```

Example:

```none
set firewall ipv4 forward filter rule 10 source group network-group LAN4
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] group domain-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] group domain-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] group domain-group \<name | !name\>

**Apply the rule's action to the packets whose source or destination address is
an IPv4 address of a domain name in the specified domain group.**

Prepend `!` to the group name to apply the rule's action to the packets whose
address is not an IPv4 address of a domain name in the group.
```

Example:

```none
set firewall ipv4 forward filter rule 10 destination group domain-group UPDATES
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] group remote-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] group remote-group \<name | !name\>

**Apply the rule's action to the packets whose source or destination address is
in the address list of the specified remote group.**

Prepend `!` to the group name to apply the rule's action to the packets whose
address is not in the address list of the group.
```

Example:

```none
set firewall ipv4 forward filter rule 10 source group remote-group BLOCKLIST
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] group dynamic-address-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] group dynamic-address-group \<name | !name\>

**Apply the rule's action to the packets whose source or destination address is
a member of the specified dynamic address group.**

Prepend `!` to the group name to apply the rule's action to the packets whose
address is not a member of the group.
```

Example:

```none
set firewall ipv4 input filter rule 10 source group dynamic-address-group ALLOWED
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] group port-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] group port-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] group port-group \<name | !name\>

**Apply the rule's action to the packets whose source or destination port is a
member of the specified port group.**

Prepend `!` to the group name to apply the rule's action to the packets whose
port is not a member of the group.

The rule must set `protocol` to `tcp`, `udp`, or `tcp_udp`. A rule cannot use
`source port` together with `source group port-group`, or `destination port`
together with `destination group port-group`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 protocol tcp
set firewall ipv4 forward filter rule 10 destination group port-group WEB
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> [source | destination] group mac-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> [source | destination] group mac-group \<name | !name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> [source | destination] group mac-group \<name | !name\>

**Apply the rule's action to the packets whose source or destination MAC address
is a member of the specified MAC group.**

Prepend `!` to the group name to apply the rule's action to the packets whose
MAC address is not a member of the group.
```

Example:

```none
set firewall ipv4 input filter rule 10 source group mac-group OFFICE
```

#### Protocols

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> protocol \<protocol-name | protocol-number | all | tcp_udp\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> protocol \<protocol-name | protocol-number | all | tcp_udp\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> protocol \<protocol-name | protocol-number | all | tcp_udp\>

**Apply the rule's action to the packets with the specified protocol.**

- `all`: Packets of all protocols.
- `tcp_udp`: TCP and UDP packets.
- `protocol-name`: The name of a protocol, such as `tcp`.
- `protocol-number`: The number of a protocol, from 0 to 255, such as `6` for
  TCP.

Prepend `!` to the protocol name to apply the rule's action to the packets of
all other protocols.
```

Example:

```none
set firewall ipv4 forward filter rule 10 protocol tcp_udp
set firewall ipv4 forward filter rule 11 protocol '!tcp_udp'
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> icmp type-name \<type-name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> icmp type-name \<type-name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> icmp type-name \<type-name\>

**Apply the rule's action to the
{abbr}`ICMP (Internet Control Message Protocol)` packets with the specified type
name.**

The type names are `echo-reply`, `destination-unreachable`, `source-quench`,
`redirect`, `echo-request`, `router-advertisement`, `router-solicitation`,
`time-exceeded`, `parameter-problem`, `timestamp-request`, `timestamp-reply`,
`info-request`, `info-reply`, `address-mask-request`, and `address-mask-reply`.

If a rule has `icmp type-name`, the firewall ignores `icmp type` and `icmp code`
in that rule.
```

Example:

```none
set firewall ipv4 input filter rule 10 icmp type-name echo-request
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> icmp type \<0-255\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> icmp type \<0-255\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> icmp type \<0-255\>

**Apply the rule's action to the ICMP packets with the specified type number.**

If the rule has `icmp type-name`, the firewall ignores `icmp type`.
```

Example:

```none
set firewall ipv4 input filter rule 10 icmp type 8
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> icmp code \<0-255\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> icmp code \<0-255\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> icmp code \<0-255\>

**Apply the rule's action to the ICMP packets with the specified code number.**

If the rule has `icmp type-name`, the firewall ignores `icmp code`.
```

Example:

```none
set firewall ipv4 input filter rule 10 icmp code 1
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> tcp flags [syn | ack | fin | rst | urg | psh | ecn | cwr]
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> tcp flags [syn | ack | fin | rst | urg | psh | ecn | cwr]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> tcp flags [syn | ack | fin | rst | urg | psh | ecn | cwr]

**Apply the rule's action to the TCP packets in which the specified flags are
set.**

Repeat the command to require more flags.

The rule must set `protocol` to `tcp`, and it cannot have the same flag in both
`tcp flags` and `tcp flags not`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 tcp flags syn
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> tcp flags not [syn | ack | fin | rst | urg | psh | ecn | cwr]
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> tcp flags not [syn | ack | fin | rst | urg | psh | ecn | cwr]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> tcp flags not [syn | ack | fin | rst | urg | psh | ecn | cwr]

**Apply the rule's action to the TCP packets in which the specified flags are
not set.**

Repeat the command to require more flags to be unset.

The rule must set `protocol` to `tcp`, and it cannot have the same flag in both
`tcp flags` and `tcp flags not`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 tcp flags syn
set firewall ipv4 input filter rule 10 tcp flags not ack
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> tcp mss \<1-16384 | min-max\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> tcp mss \<1-16384 | min-max\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> tcp mss \<1-16384 | min-max\>

**Apply the rule's action to the TCP packets whose
{abbr}`MSS (Maximum Segment Size)` option has the specified value.**

Enter a value or a range such as `500-1460`.
```

Example:

```none
set firewall ipv4 forward filter rule 10 tcp mss 1460
```

#### GRE

The GRE criteria apply to GRE packets. A rule with a GRE criterion must set
`protocol` to `gre`. Otherwise, the commit fails.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> gre flags [checksum | key | sequence]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> gre flags [checksum | key | sequence]

**Apply the rule's action to the GRE packets whose header includes the specified
optional field.**

- `checksum`: The header includes the checksum field.
- `key`: The header includes the key field.
- `sequence`: The header includes the sequence number field.

Repeat the command to require more fields.
```

Example:

```none
set firewall ipv4 forward filter rule 10 gre flags sequence
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> gre flags [checksum | key | sequence] unset
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> gre flags [checksum | key | sequence] unset

**Apply the rule's action to the GRE packets whose header does not include the
specified optional field.**

- `checksum`: The header does not include the checksum field.
- `key`: The header does not include the key field.
- `sequence`: The header does not include the sequence number field.

Repeat the command to require more fields to be absent.
```

Example:

```none
set firewall ipv4 forward filter rule 10 gre flags checksum unset
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> gre key \<0-4294967295\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> gre key \<0-4294967295\>

**Apply the rule's action to the GRE packets with the specified tunnel key.**

The rule applies only to the packets whose header includes the key field.

The rule must set `protocol` to `gre` and must have `gre flags checksum` or
`gre flags checksum unset`, because the position of the key in the header
depends on the checksum field. The rule cannot have `gre flags key unset` or
`gre version pptp`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 gre key 100
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> gre inner-proto \<ethertype\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> gre inner-proto \<ethertype\>

**Apply the rule's action to the GRE packets that encapsulate a packet of the
specified Ethernet type.**

- `ip`: IPv4 packets.
- `ip6`: IPv6 packets.
- `arp`: {abbr}`ARP (Address Resolution Protocol)` packets.
- `802.1q`: Packets with a customer
  {abbr}`VLAN (Virtual Local Area Network)` tag.
- `802.1ad`: Packets with a service VLAN tag.
- `gretap`: Ethernet frames.
- An Ethernet type from `0` to `65535`, or from `0x0` to `0xffff` in hexadecimal
  notation.

The rule must set `protocol` to `gre`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 gre inner-proto ip
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> gre version [gre | pptp]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> gre version [gre | pptp]

**Apply the rule's action to the standard GRE packets (`gre`) or to the
{abbr}`PPTP (Point-to-Point Tunneling Protocol)` packets (`pptp`).**

The rule must set `protocol` to `gre`, and a rule with `gre key` cannot use
`pptp`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 gre version pptp
```

#### Packet properties

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> dscp \<0-63 | start-end\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> dscp \<0-63 | start-end\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> dscp \<0-63 | start-end\>

**Apply the rule's action to the packets with the specified
{abbr}`DSCP (Differentiated Services Code Point)` value.**

Enter a value or a range such as `10-20`.

Repeat the command to add more values.
```

Example:

```none
set firewall ipv4 forward filter rule 10 dscp 46
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> dscp-exclude \<0-63 | start-end\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> dscp-exclude \<0-63 | start-end\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> dscp-exclude \<0-63 | start-end\>

**Apply the rule's action to the packets whose DSCP value is not the specified
value.**

Enter a value or a range such as `10-20`.

Repeat the command to add more values.
```

Example:

```none
set firewall ipv4 forward filter rule 10 dscp-exclude 0
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> ttl [eq | gt | lt] \<0-255\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> ttl [eq | gt | lt] \<0-255\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> ttl [eq | gt | lt] \<0-255\>

**Apply the rule's action to the packets whose {abbr}`TTL (Time to Live)` meets
the specified comparison.**

- `eq`: The TTL is equal to the value.
- `gt`: The TTL is greater than the value.
- `lt`: The TTL is less than the value.
```

Example:

```none
set firewall ipv4 forward filter rule 10 ttl lt 5
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> packet-length \<1-65535 | start-end\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> packet-length \<1-65535 | start-end\>

**Apply the rule's action to the packets with the specified length in bytes,
including the IP header and the data.**

Enter a length or a range such as `100-200`.

Repeat the command to add more values.
```

Example:

```none
set firewall ipv4 forward filter rule 10 packet-length 1500
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> packet-length-exclude \<1-65535 | start-end\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> packet-length-exclude \<1-65535 | start-end\>

**Apply the rule's action to the packets whose length in bytes is not the
specified length.**

Enter a length or a range such as `100-200`.

Repeat the command to add more values.
```

Example:

```none
set firewall ipv4 forward filter rule 10 packet-length-exclude 100-200
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> packet-type [broadcast | host | multicast | other]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> packet-type [broadcast | host | multicast | other]

**Apply the rule's action to the packets of the specified type.**

The router determines the type of a received packet from the destination MAC
address of the packet:

- `host`: Packets whose destination MAC address is the address of the receiving
  interface. This includes the packets that the router forwards.
- `broadcast`: Packets whose destination MAC address is the broadcast address.
- `multicast`: Packets whose destination MAC address is a multicast address
  other than the broadcast address.
- `other`: Packets whose destination MAC address is a unicast address other than
  the address of the receiving interface. The router drops received packets of
  this type before the firewall processes them at the IP layer, so an IPv4 rule
  with this value does not match them.
```

Example:

```none
set firewall ipv4 input filter rule 10 packet-type multicast
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> fragment [match-frag | match-non-frag]
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> fragment [match-frag | match-non-frag]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> fragment [match-frag | match-non-frag]

**Apply the rule's action to the packets according to whether they arrived
fragmented.**

- `match-frag`: Packets that arrived in fragments and that the router
  reassembled.
- `match-non-frag`: Packets that arrived unfragmented.

A rule cannot have both values. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 fragment match-frag
```

```{cfgcmd} set firewall ipv4 [forward | input] filter rule \<1-999999\> ipsec [match-ipsec-in | match-none-in]
```

```{cfgcmd} set firewall ipv4 prerouting raw rule \<1-999999\> ipsec [match-ipsec-in | match-none-in]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> ipsec [match-ipsec-in | match-none-in]

**Apply the rule's action to packets according to whether the router
decapsulates them from IPsec.**

- `match-ipsec-in`: Packets that the router has decapsulated from IPsec. The
  firewall processes a decapsulated packet again, starting at the `prerouting`
  processing point.
- `match-none-in`: All other packets, including an IPsec packet before the
  router decapsulates it.

A rule cannot have both values. A custom rule set with these criteria cannot be
reached by a `jump` action from a base rule set of the `output` processing
point, directly or through other custom rule sets. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 ipsec match-ipsec-in
```

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> ipsec [match-ipsec-out | match-none-out]
```

```{cfgcmd} set firewall ipv4 output raw rule \<1-999999\> ipsec [match-ipsec-out | match-none-out]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> ipsec [match-ipsec-out | match-none-out]

**Apply the rule's action to packets according to whether the router
encapsulates them with IPsec.**

- `match-ipsec-out`: Packets that the router encapsulates with IPsec.
- `match-none-out`: Packets that the router does not encapsulate with IPsec.

A rule cannot have both values. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 ipsec match-none-out
```

#### Connection tracking

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> state [established | invalid | new | related]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> state [established | invalid | new | related]

**Apply the rule's action to the packets whose connection has the specified
connection tracking state.**

- `established`: Packets of an established connection, in either direction.
- `related`: Packets that start a connection related to an existing connection,
  and ICMP error messages about a connection.
- `invalid`: Packets that connection tracking cannot associate with a
  connection.
- `new`: Packets that start a new connection.

Repeat the command to apply the rule's action to the packets in more states.

A rule cannot have `state` in the `forward filter` rule set when connection
tracking is disabled there, or in the `input filter` or `output filter` rule set
when connection tracking is disabled in either of them. A rule with the
`synproxy` action cannot have `state`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 state established
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> connection-status nat [destination | source]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> connection-status nat [destination | source]

**Apply the rule's action to the packets of the connections with the specified
NAT translation.**

- `destination`: The connection has a destination NAT translation.
- `source`: The connection has a source NAT translation.
```

Example:

```none
set firewall ipv4 forward filter rule 10 connection-status nat destination
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> connection-mark \<0-2147483647\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> connection-mark \<0-2147483647\>

**Apply the rule's action to the packets whose connection has the specified
connection mark.**

Repeat the command to add more marks.

You can set the connection mark with `set connection-mark` in the
`forward filter`, `output filter`, and `output raw` rule sets and in custom rule
sets.
```

Example:

```none
set firewall ipv4 forward filter rule 10 connection-mark 123
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> mark \<0-2147483647 | start-end\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> mark \<0-2147483647 | start-end\>

**Apply the rule's action to the packets with the specified packet mark.**

Enter a mark or a range such as `100-200`. Prepend `!` to apply the rule's
action to all other marks.

You can set the packet mark with `set mark` in the `forward filter`,
`output filter`, `output raw`, and `prerouting raw` rule sets and in custom rule
sets.
```

Example:

```none
set firewall ipv4 forward filter rule 10 mark 100
set firewall ipv4 forward filter rule 11 mark '!100-200'
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> conntrack-helper [ftp | h323 | nfs | pptp | rtsp | sip | sqlnet | tftp]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> conntrack-helper [ftp | h323 | nfs | pptp | rtsp | sip | sqlnet | tftp]

**Apply the rule's action to related traffic identified by the specified
connection tracking helper.**

Repeat the command to add more helpers.
```

Example:

```none
set firewall ipv4 forward filter rule 10 conntrack-helper ftp
```

#### Rate limits

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> limit rate \<integer/unit\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> limit rate \<integer/unit\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> limit rate \<integer/unit\>

**Apply the rule's action to packets arriving at or below the specified rate.**

Enter an integer and the unit `second`, `minute`, `hour`, or `day`. For example,
with `5/minute`, the rule's action applies to five packets per minute on average
and not to the packets above that rate.

The integer cannot be less than 1. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 limit rate 5/minute
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> limit burst \<1-4294967295\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> limit burst \<1-4294967295\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> limit burst \<1-4294967295\>

**Configure the number of packets above the rate to which the rule's action
still applies.**

When no value is configured, the firewall applies the rule's action to 5
packets above the rate.

Use `limit burst` together with `limit rate` in the same rule.
```

Example:

```none
set firewall ipv4 input filter rule 10 limit burst 10
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> recent count \<1-255\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> recent count \<1-255\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> recent count \<1-255\>
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> recent time [second | minute | hour]
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> recent time [second | minute | hour]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> recent time [second | minute | hour]

**Apply the rule's action to the packets whose source address sent more than the
specified number of packets in the specified period.**

- `recent count`: The number of packets.
- `recent time`: The period of time: `second`, `minute`, or `hour`.

Configure both `recent count` and `recent time` in the rule. Otherwise, the
commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 recent count 10
set firewall ipv4 input filter rule 10 recent time minute
```

#### Rule schedule

You can limit the period in which the rule's action applies by date with
`startdate` and `stopdate`, by time of day with `starttime` and `stoptime`, and
by day of the week with `weekdays`. The firewall combines `startdate` with
`starttime`, and `stopdate` with `stoptime`, into specific moments. A
`starttime` without `startdate`, or a `stoptime` without `stopdate`, sets the
start or the end of a time window that repeats every day. When the window has
no start, it starts at `00:00`. When it has no end, it ends at `23:59:59`.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> time startdate \<yyyy-mm-dd\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> time startdate \<yyyy-mm-dd\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> time startdate \<yyyy-mm-dd\>

**Apply the rule's action to the packets from the specified date onward.**
```

Example:

```none
set firewall ipv4 input filter rule 10 time startdate 2026-01-01
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> time stopdate \<yyyy-mm-dd\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> time stopdate \<yyyy-mm-dd\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> time stopdate \<yyyy-mm-dd\>

**Apply the rule's action to the packets before the specified date.**
```

Example:

```none
set firewall ipv4 input filter rule 10 time stopdate 2026-12-31
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> time starttime \<hh:mm[:ss]\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> time starttime \<hh:mm[:ss]\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> time starttime \<hh:mm[:ss]\>

**Apply the rule's action to the packets from the specified time onward.**
```

Example:

```none
set firewall ipv4 input filter rule 10 time starttime 08:00
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> time stoptime \<hh:mm[:ss]\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> time stoptime \<hh:mm[:ss]\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> time stoptime \<hh:mm[:ss]\>

**Apply the rule's action to the packets until the specified time.**
```

Example:

```none
set firewall ipv4 input filter rule 10 time stoptime 18:00
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> time weekdays \<weekday\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> time weekdays \<weekday\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> time weekdays \<weekday\>

**Apply the rule's action to the packets on the specified days of the week.**

Enter the names of the days, such as `Monday` or `mon`, or the numbers of the
days from `0` (Sunday) to `6` (Saturday), separated by commas.
```

Example:

```none
set firewall ipv4 input filter rule 10 time weekdays Mon,Tue,Wed,Thu,Fri
```

#### FIB lookup

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> fib lookup [source-address | destination-address]
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> fib lookup [source-address | destination-address]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> fib lookup [source-address | destination-address]

**Apply the rule's action to the packets according to the result of a
{abbr}`FIB (Forwarding Information Base)` lookup.**

- `source-address`: The firewall looks up the route using the source address of
  the packet.
- `destination-address`: The firewall looks up the route using the destination
  address of the packet.

A rule cannot have both `fib lookup source-address` and
`fib lookup destination-address`. A rule with `fib lookup` must have
`fib match route-type`, and a rule with `fib match route-type` must have
`fib lookup`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 prerouting raw rule 1 fib lookup destination-address
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> fib match route-type \<route-type | !route-type\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> fib match route-type \<route-type | !route-type\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> fib match route-type \<route-type | !route-type\>

**Apply the rule's action to the packets whose address, selected by
`fib lookup`, has the specified route type.**

- `local`: The address has a route to the router itself.
- `unicast`: The address has a route directly or through a gateway.
- `broadcast`: The address has a broadcast route.
- `multicast`: The address has a multicast route.
- `anycast`: The address has an anycast route.
- `blackhole`: The address has a route that drops the packets.
- `unreachable`: The address has a route that reports the destination as
  unreachable.
- `prohibit`: The address has a route that prohibits the packets
  administratively.

Prepend `!` to apply the rule's action to all other route types. Configure
`fib lookup` in the same rule. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 prerouting raw rule 1 fib match route-type local
```

#### Dynamic address groups

When a rule's action applies to a packet, you can add the source or destination
address of the packet to a dynamic address group. The
{doc}`firewall groups </configuration/firewall/groups>` page describes how to
define dynamic address groups and how to use them in rules.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> add-address-to-group [source-address | destination-address] address-group \<name\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> add-address-to-group [source-address | destination-address] address-group \<name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> add-address-to-group [source-address | destination-address] address-group \<name\>

**Add the source address or the destination address of a packet to the specified
dynamic address group when the rule's action applies to the packet.**

The dynamic address group must exist. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 add-address-to-group source-address address-group ALLOWED
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> add-address-to-group [source-address | destination-address] timeout \<number+suffix\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> add-address-to-group [source-address | destination-address] timeout \<number+suffix\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> add-address-to-group [source-address | destination-address] timeout \<number+suffix\>

**Configure how long an address remains in the dynamic address group after the
rule adds it.**

Specify the timeout as a number followed by `s` (seconds), `m` (minutes), `h`
(hours), or `d` (days). Each time the rule adds the address again, the timeout
starts over. When no timeout is configured, the address remains in the group
until the router applies the firewall configuration.

Configure `timeout` together with `address-group` for the same address.
Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 input filter rule 10 add-address-to-group source-address timeout 2m
```

### Actions

A rule's action applies to a packet that meets all rule criteria, if the rule
has any. An action takes effect at the processing point at which the firewall
applies the rule set. Two actions are exceptions to this. The `notrack` action
marks the packet as untracked, and connection tracking ignores the packet at all
subsequent processing points as well. The `offload` action offloads a connection
to a flowtable. The firewall does not process the subsequent packets of that
connection at any processing point of the IP layer.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> action [accept | continue | drop | jump | offload | queue | reject | return | synproxy]
```

```{cfgcmd} set firewall ipv4 prerouting raw rule \<1-999999\> action [accept | continue | drop | jump | notrack | queue | reject | return]
```

```{cfgcmd} set firewall ipv4 output raw rule \<1-999999\> action [accept | continue | drop | notrack | queue | reject | return]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> action [accept | continue | drop | jump | offload | queue | reject | return | synproxy]

**Configure the action that the firewall applies to a packet.**

- `accept`: The firewall accepts the packet and stops applying rules to the
  packet at the processing point. Rules at subsequent processing points can
  still drop the packet.
- `drop`: The firewall drops the packet.
- `reject`: The firewall drops the packet and, for packets that were not sent to
  a broadcast or multicast address, sends a response to the sender.
- `queue`: The firewall sends the packet to an application through a queue. The
  application returns a verdict for the packet: accept or drop.
- `continue`: The firewall continues with the next rule.
- `jump`: The firewall sends the packet to the custom rule set that
  `jump-target` specifies and applies the rules of that rule set to the packet.
  Among the `raw` rule sets, only `prerouting raw` accepts this action.
- `return`: In a custom rule set, the firewall returns to the rule set that sent
  the packet to the custom rule set and continues there. In a base rule set, the
  firewall accepts the packet without applying the default action.
- `offload`: The firewall offloads the connection of the packet to the flowtable
  that `offload-target` specifies and continues with the next rule. Only rules
  that the firewall applies at the `forward` processing point accept this
  action.
- `synproxy`: The firewall answers the client's TCP connection request on the
  service's behalf and opens the connection to the service only after the client
  completes the handshake. Only rules that the firewall applies at the `input`
  and `forward` processing points accept this action.
- `notrack`: The firewall marks the packet as untracked and continues with the
  next rule. Only rules in the `prerouting raw` and `output raw` rule sets
  accept this action.

Every rule requires an action. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 action accept
```

:::{note}
You can also exempt packets from connection tracking with the rules under
`set system conntrack ignore ipv4 ...`. These rules apply to received and
generated packets. However, the preferred method is the `notrack` action in the
`prerouting raw` and `output raw` rule sets.
:::

#### Jump to a custom rule set

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> jump-target \<text\>
```

```{cfgcmd} set firewall ipv4 prerouting raw rule \<1-999999\> jump-target \<text\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> jump-target \<text\>

**Configure the custom rule set to which the `jump` action sends the packet.**

If a `jump` from a base rule set leads through more than eight custom rule sets,
the commit prints a warning.

A rule with the `jump` action requires `jump-target`, and a rule with
`jump-target` requires the `jump` action. The custom rule set that `jump-target`
specifies must exist, and the custom rule sets must not jump to each other in a
loop. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 jump-target CUSTOM
```

#### Send packets to a queue

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> queue \<0-65535\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> queue \<0-65535\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> queue \<0-65535\>

**Configure the queue to which the `queue` action sends the packet.**

Enter a queue number, or a range of queue numbers such as `0-3`. When no queue
is configured, the `queue` action sends the packet to queue 0.

The rule must have the `queue` action. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 queue 5
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> queue-options bypass

**Let packets continue through the firewall when no application can receive them
from the queue, instead of dropping them.**

The rule must have the `queue` action. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 queue-options bypass
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> queue-options fanout
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> queue-options fanout
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> queue-options fanout

**Configure the firewall to assign a packet to a queue according to the
{abbr}`CPU (Central Processing Unit)` on which the firewall applies the rule.**

For example, with `queue 4-7`, packets on CPU 0 go to queue 4, on CPU 1 to queue
5, on CPU 2 to queue 6, and on CPU 3 to queue 7. If CPUs outnumber queues, the
assignment repeats: packets on CPU 4 go to queue 4 again.

Without `fanout`, the firewall chooses the queue from the range based on the
packet fields: the source address, destination address, and protocol.

The rule must have the `queue` action and a range in `queue`. Otherwise, the
commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 queue-options fanout
```

#### Offload to a flowtable

```{cfgcmd} set firewall ipv4 forward filter rule \<1-999999\> offload-target \<name\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> offload-target \<name\>

**Configure the flowtable to which the `offload` action offloads the
connection.**

A rule with the `offload` action requires `offload-target`, and the flowtable
must exist. Otherwise, the commit fails. If a rule has `offload-target` but not
the `offload` action, the commit prints a warning.

The {doc}`flowtables </configuration/firewall/flowtables>` page describes how to
define a flowtable.
```

Example:

```none
set firewall ipv4 forward filter rule 10 offload-target FT01
```

#### Synproxy

When a client's TCP connection request meets the criteria of a rule with the
`synproxy` action, the firewall answers the request on the service's behalf and
opens the connection to the service only after the client completes the
handshake. This protects a TCP service from clients that start a connection but
do not complete it. The firewall applies the `synproxy` action only to the
packets in the `invalid` and `untracked` states.

The commands in this section configure the TCP options that the firewall
announces to the client in its answer.

A rule with the `synproxy` action requires `protocol tcp` and at least one
`synproxy tcp` option. It cannot have `state`, because the firewall already
matches the `invalid` and `untracked` states in that rule. The `synproxy`
options require the `synproxy` action. Otherwise, the commit fails.

For the `synproxy` action to work, ensure that:

- The router receives both the client's packets and the service's replies.
- The connection tracking option `tcp loose` is disabled
  (`set system conntrack tcp loose disable`). Otherwise, connection tracking
  accepts the final packet of the client's handshake as part of a tracked
  connection, and the action no longer applies to it.
- A rule with the `notrack` action in the `prerouting raw` rule set exempts the
  client's connection request from connection tracking. The rule must match only
  that request, for example with `protocol tcp`, `tcp flags syn`, and the
  service's destination port. Without such a rule, connection tracking
  classifies the request as `new`, and the `synproxy` action does not apply to
  the request.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> synproxy tcp mss \<501-65535\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> synproxy tcp mss \<501-65535\>

**Configure the MSS that the firewall announces to the client in its answer to
the connection request.**

The rule must have the `synproxy` action. Otherwise, the commit fails.
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> synproxy tcp window-scale \<1-14\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> synproxy tcp window-scale \<1-14\>

**Configure the window scale factor that the firewall announces to the client in
its answer to the connection request.**

With `window-scale`, the firewall also announces TCP timestamps and selective
acknowledgment.

The rule must have the `synproxy` action. Otherwise, the commit fails.
```

In the following example, the firewall protects a service on TCP port 8080 that
runs on the router:

```none
set system sysctl parameter net.ipv4.tcp_timestamps value 1
set system conntrack tcp loose disable
set firewall global-options syn-cookies enable
set firewall ipv4 prerouting raw rule 10 action notrack
set firewall ipv4 prerouting raw rule 10 protocol tcp
set firewall ipv4 prerouting raw rule 10 destination port 8080
set firewall ipv4 prerouting raw rule 10 tcp flags syn
set firewall ipv4 input filter rule 10 action synproxy
set firewall ipv4 input filter rule 10 destination port 8080
set firewall ipv4 input filter rule 10 inbound-interface name eth1
set firewall ipv4 input filter rule 10 protocol tcp
set firewall ipv4 input filter rule 10 synproxy tcp mss 1460
set firewall ipv4 input filter rule 10 synproxy tcp window-scale 7
set firewall ipv4 input filter rule 1000 action drop
set firewall ipv4 input filter rule 1000 state invalid
```

### Default actions

The default action applies to a packet that still requires processing after all
rules of the rule set have been applied. If you do not configure the default
action, the firewall uses `accept` in a base rule set and `drop` in a custom
rule set.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter default-action [accept | drop]
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw default-action [accept | drop]
```

```{cfgcmd} set firewall ipv4 name \<name\> default-action [accept | continue | drop | jump | reject | return]

**Configure the default action that the firewall applies to a packet.**

- `accept`: The firewall accepts the packet and stops applying rules to the
  packet at the processing point. Rules at subsequent processing points can
  still drop the packet.
- `drop`: The firewall drops the packet.
- `continue`: Available only in a custom rule set. The firewall returns to the
  rule set that sent the packet to the custom rule set and continues there.
- `return`: Available only in a custom rule set. Works the same as `continue`.
- `jump`: Available only in a custom rule set. The firewall sends the packet to
  the custom rule set that `default-jump-target` specifies and applies the rules
  of that rule set to the packet.
- `reject`: Available only in a custom rule set. The firewall drops the packet
  and, for packets that were not sent to a broadcast or multicast address, sends
  a response to the sender.

A custom rule set with the default action `jump` requires `default-jump-target`.
Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter default-action drop
set firewall ipv4 name CUSTOM default-action return
```

```{cfgcmd} set firewall ipv4 name \<name\> default-jump-target \<text\>

**Configure the target custom rule set of the `jump` default action.**

A custom rule set with `default-jump-target` requires the default action `jump`,
and the target must be another existing custom rule set. Otherwise, the commit
fails.
```

Example:

```none
set firewall ipv4 name CUSTOM default-jump-target NEXT
```

### Logging

Use `log` to log the packets to which a rule's action applies, and `default-log`
to log the packets to which the default action applies. For each logged packet,
the firewall writes a log message to the system log at the `warn` level. Log
messages produced with `log` begin with the prefix
`[ipv4-<point>-<name>-<rule>-<action>]`, and log messages produced with
`default-log` begin with the prefix `[ipv4-<point>-<name>-default-<action>]`,
where:

- `<point>` is `PRE` for the `prerouting`, `FWD` for the `forward`, `INP` for
  the `input`, and `OUT` for the `output` processing point. For a custom rule
  set, `<point>` is `NAM`.
- `<name>` is `filter` or `raw` for a base rule set, or the name of the custom
  rule set.
- `<rule>` is the rule number.
- `<action>` is the first letter of the action in uppercase, for example `A` for
  `accept` and `D` for `drop`.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> log
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> log
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> log

**Log the packets to which the firewall applies the action of the specified
rule.**
```

Example:

```none
set firewall ipv4 forward filter rule 10 log
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter default-log
```

```{cfgcmd} set firewall ipv4 output raw default-log
```

```{cfgcmd} set firewall ipv4 name \<name\> default-log

**Log a packet to which the firewall applies the default action of the specified
rule set.**
```

Example:

```none
set firewall ipv4 forward filter default-log
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]

**Write an additional log message for the packet at the specified severity
level.**

The additional message has no prefix, and the level of the log message produced
with `log` does not change.

Also configure `log` for the rule. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 log-options level notice
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> log-options group \<0-65535\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> log-options group \<0-65535\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> log-options group \<0-65535\>

**Send an additional log message about the packet to the specified log group.**

The additional message has no prefix.

Also configure `log` for the rule. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 log-options group 10
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> log-options snapshot-length \<0-9000\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> log-options snapshot-length \<0-9000\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> log-options snapshot-length \<0-9000\>

**Configure the number of bytes of the packet that the firewall includes in the
message to the log group.**

Also configure `log` and `log-options group`. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 log-options snapshot-length 128
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> log-options queue-threshold \<0-65535\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> log-options queue-threshold \<0-65535\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> log-options queue-threshold \<0-65535\>

**Configure the number of messages that the firewall queues before it sends them
to the log group.**

Also configure `log` and `log-options group`. Otherwise, the commit fails.

The setting has an effect only if the value is greater than 0 and less than the
log group's queue threshold, which is 100 unless the application that reads the
group changes it.
```

Example:

```none
set firewall ipv4 forward filter rule 10 log-options queue-threshold 20
```

### Descriptions

Add a description to a rule set or to a rule to explain its purpose. The
description of a rule set appears in the output of `show firewall summary`, and
the description of a rule appears in the output of the `detail` forms of the
`show firewall ipv4` commands.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter description \<text\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw description \<text\>
```

```{cfgcmd} set firewall ipv4 name \<name\> description \<text\>

**Configure a description for the rule set.**

The description can contain up to 255 characters. Descriptions that contain
spaces can be entered in single or double quotes.
```

Example:

```none
set firewall ipv4 forward filter description 'Forwarded traffic'
```

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> description \<text\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> description \<text\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> description \<text\>

**Configure a description for the rule.**

The description can contain up to 255 characters. Descriptions that contain
spaces can be entered in single or double quotes.
```

Example:

```none
set firewall ipv4 forward filter rule 10 description 'Bad networks'
```

### Disable a rule

You can disable a rule instead of deleting it. A disabled rule stays in the
configuration, and you can enable it again by deleting `disable`.

```{cfgcmd} set firewall ipv4 [forward | input | output] filter rule \<1-999999\> disable
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> disable
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> disable

**Disable the rule.**

The firewall does not apply a disabled rule, and the `show firewall` commands do
not list it.

The commit checks a disabled rule in the same way as any other rule, so a
disabled rule must be valid. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 disable
```

### Packet modifications

Rules can modify packets that meet their criteria. The firewall applies the
modifications before it applies the rule's action, so subsequent rules and
processing points work with the modified packet.

Packet modifications are available in the `forward filter`, `output filter`,
`output raw`, and `prerouting raw` base rule sets, and in custom rule sets. Of
these, only the `forward filter`, `output filter`, and `output raw` base rule
sets and custom rule sets can set the connection mark.

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> set dscp \<0-63\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> set dscp \<0-63\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> set dscp \<0-63\>

**Configure the DSCP value that the firewall sets in the packets.**
```

Example:

```none
set firewall ipv4 forward filter rule 10 set dscp 46
```

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> set mark \<1-2147483647\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> set mark \<1-2147483647\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> set mark \<1-2147483647\>

**Configure the packet mark that the firewall sets on the packets.**

The packet mark is a number that stays with the packet while the router
processes it. Rules can use it in the `mark` criterion.
```

Example:

```none
set firewall ipv4 forward filter rule 10 set mark 100
```

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> set tcp-mss \<500-1460\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> set tcp-mss \<500-1460\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> set tcp-mss \<500-1460\>

**Configure the MSS value that the firewall sets in the TCP packets that carry
the MSS option.**
```

Example:

```none
set firewall ipv4 forward filter rule 10 set tcp-mss 1400
```

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> set ttl \<0-255\>
```

```{cfgcmd} set firewall ipv4 [output | prerouting] raw rule \<1-999999\> set ttl \<0-255\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> set ttl \<0-255\>

**Configure the TTL value that the firewall sets in the packets.**
```

Example:

```none
set firewall ipv4 forward filter rule 10 set ttl 128
```

```{cfgcmd} set firewall ipv4 [forward | output] filter rule \<1-999999\> set connection-mark \<0-2147483647\>
```

```{cfgcmd} set firewall ipv4 output raw rule \<1-999999\> set connection-mark \<0-2147483647\>
```

```{cfgcmd} set firewall ipv4 name \<name\> rule \<1-999999\> set connection-mark \<0-2147483647\>

**Configure the connection mark that the firewall sets on the connection of the
packet.**

The connection mark is a number that stays with the connection in connection
tracking. Rules can use it in the `connection-mark` criterion.
```

Example:

```none
set firewall ipv4 forward filter rule 10 set connection-mark 123
```

## Operation

### Rule sets

The `show firewall`, `show firewall summary`, `show firewall statistics`, and
`show firewall statistics detail` commands show information about IPv4, IPv6,
and bridge rule sets together. The
{doc}`Bridge layer </configuration/firewall/bridge>` page describes them.

Use the following commands to show information about IPv4 rule sets and their
rules.

```{opcmd} show firewall ipv4

**Show the rules of all IPv4 rule sets with the packet and byte counters of each
rule, and the states of the global state policy with their packet and byte
counters.**
```

```{opcmd} show firewall ipv4 [forward | input | output] filter
```

```{opcmd} show firewall ipv4 prerouting raw

**Show the rules of the specified base rule set with their packet and byte
counters.**

There is no command for the `output raw` rule set alone. The
`show firewall ipv4` command includes it.
```

```{opcmd} show firewall ipv4 [forward | input | output] filter detail
```

```{opcmd} show firewall ipv4 prerouting raw detail

**Show the rules of the specified base rule set with their packet and byte
counters.**

In addition to the fields shown without `detail`, the output includes each
rule's description and the time it was last used.
```

```{opcmd} show firewall ipv4 [forward | input | output] filter rule \<rule\>
```

```{opcmd} show firewall ipv4 prerouting raw rule \<rule\>

**Show the specified rule of the base rule set with its packet and byte
counters.**
```

```{opcmd} show firewall ipv4 [forward | input | output] filter rule \<rule\> detail
```

```{opcmd} show firewall ipv4 prerouting raw rule \<rule\> detail

**Show the specified rule of the base rule set with its packet and byte
counters.**

In addition to the fields shown without `detail`, the output includes the
description of the rule and the time it was last used.
```

```{opcmd} show firewall ipv4 name \<name\>

**Show the rules of the specified custom rule set with their packet and byte
counters.**
```

```{opcmd} show firewall ipv4 name \<name\> detail

**Show the rules of the specified custom rule set with their packet and byte
counters.**

In addition to the fields shown without `detail`, the output includes each
rule's description and the time it was last used.
```

```{opcmd} show firewall ipv4 name \<name\> rule \<rule\>

**Show the specified rule of the custom rule set with its packet and byte
counters.**
```

```{opcmd} show firewall ipv4 name \<name\> rule \<rule\> detail

**Show the specified rule of the custom rule set with its packet and byte
counters.**

In addition to the fields shown without `detail`, the output includes the
description of the rule and the time it was last used.
```

### Logs

The `show log firewall` command shows the log messages of IPv4, IPv6, and bridge
rule sets and of the global state policy together. The
{doc}`Bridge layer </configuration/firewall/bridge>` page describes it.

```{opcmd} show log firewall ipv4

**Show the log messages of all IPv4 rule sets.**

The command does not show the log messages of the `prerouting raw` rule set. To
show them, use `show log firewall ipv4 prerouting`.
```

```{opcmd} show log firewall ipv4 [forward | input | output | prerouting]

**Show the log messages of the base rule sets at the specified processing
point.**
```

```{opcmd} show log firewall ipv4 [forward | input | output] filter
```

```{opcmd} show log firewall ipv4 prerouting raw

**Show the log messages of the specified base rule set.**

There is no command for the `output raw` rule set alone. To show its messages,
use `show log firewall ipv4 output`, which shows the messages of both `output`
rule sets.
```

```{opcmd} show log firewall ipv4 [forward | input | output] filter rule \<rule\>
```

```{opcmd} show log firewall ipv4 prerouting raw rule \<rule\>

**Show the log messages of the specified rule in the base rule set.**

The command does not show the messages of the rules with the `queue`,
`synproxy`, and `notrack` actions.
```

```{opcmd} show log firewall ipv4 name \<name\>

**Show the log messages of the specified custom rule set.**
```

```{opcmd} show log firewall ipv4 name \<name\> rule \<rule\>

**Show the log messages of the specified rule in the custom rule set.**

The command does not show the messages of the rules with the `offload`, `queue`,
and `synproxy` actions.
```

### GeoIP

```{opcmd} update geoip

**Update the GeoIP databases and the IP address ranges that the GeoIP criteria
use.**
```

## Example

In the following example, the firewall drops the traffic that the router
forwards from `BAD-NETWORKS`, except the traffic from `GOOD-NETWORKS`, which is
a part of a bad network. The firewall applies rule 5 before rule 10, so rule 5
accepts the traffic from `GOOD-NETWORKS` first. The firewall lets all other
forwarded traffic through.

```none
set firewall group network-group BAD-NETWORKS network 198.51.100.0/24
set firewall group network-group BAD-NETWORKS network 203.0.113.0/24
set firewall group network-group GOOD-NETWORKS network 198.51.100.128/25
set firewall ipv4 forward filter default-action accept
set firewall ipv4 forward filter rule 5 action accept
set firewall ipv4 forward filter rule 5 source group network-group GOOD-NETWORKS
set firewall ipv4 forward filter rule 10 action drop
set firewall ipv4 forward filter rule 10 description 'Bad Networks'
set firewall ipv4 forward filter rule 10 source group network-group BAD-NETWORKS
```

To view the rules of the `forward filter` rule set with their counters, use:

```none
show firewall ipv4 forward filter
```
