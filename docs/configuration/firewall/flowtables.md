---
myst:
  html_meta:
    description: |
      Flowtables are firewall objects that speed up selected connections by
      letting the router forward their packets directly to the outgoing
      interface.
    keywords: firewall, flowtable, fast path, offload
---

(firewall-flowtables-configuration)=

# Flowtables

A **flowtable** speeds up selected connections by letting the router forward
their packets directly to the outgoing interface, bypassing firewall processing.

Flowtables apply to forwarded IPv4 and IPv6 traffic at the IP layer.

## Packet flow

The firewall processes the packets of a new connection through the IP layer.
After the router has forwarded a packet of the connection, the firewall can
record the connection in a flowtable when a later packet reaches the `forward`
processing point. Once the firewall records the connection, the router forwards
the subsequent packets of that connection directly to the outgoing interface,
bypassing firewall processing. This route is called the **fast path**.

:::{figure} /_static/images/firewall-flowtable-packet-flow.webp
:::

### Connection recording

The firewall records a connection in a flowtable in one of two ways:

- A rule at the `forward` processing point has the `offload` action, and a
  packet of the connection meets the criteria of the rule. The `offload-target`
  option of the rule selects the flowtable.
- The global state policy applies to all forwarded traffic. Configure it under
  `set firewall global-options state-policy offload offload-target <flowtable>`.

While a connection is recorded in a flowtable, the router decreases the
{abbr}`TTL (Time to Live)` (IPv4) or the hop limit (IPv6) of each packet by one
and keeps the connection tracked. The router removes the connection from the
flowtable when no packet of the connection passes through the flowtable for 30
seconds by default. The connection stays tracked after the removal. When another
packet of the connection arrives, the firewall processes the packet through the
IP layer as usual and can record the connection again.

### Connection requirements

When a packet meets the criteria of a rule with the `offload` action, or the
firewall applies the global state policy with an offload target to the packet,
the firewall records the connection in the flowtable if the connection fulfills
the following requirements:

- The connection uses TCP or UDP, or GRE version 0 without
  {abbr}`NAT (Network Address Translation)`.
- A TCP connection has completed the handshake, and the packet has neither the
  FIN nor the RST flag set.
- The router has already forwarded at least one packet of the connection.
- The connection does not use a connection tracking helper.
- The router has not decapsulated the packet from IPsec.
- An IPv4 packet carries no IP options.

A connection that does not meet these requirements stays outside the flowtable,
and the firewall processes its packets through the IP layer as usual.

The firewall also processes fragmented packets, IPv4 packets with options, and
packets larger than the {abbr}`MTU (Maximum Transmission Unit)` of the outgoing
interface through the IP layer as usual, even when the connection is recorded.

## Configuration

### Define a flowtable

A flowtable has a name, one or more interfaces, and an offload type. The name
must begin with a letter or a digit and can contain letters, digits,
underscores, hyphens, and dots.

```{cfgcmd} set firewall flowtable \<name\> description \<text\>

**Configure a description for the specified flowtable.**

The description can contain up to 255 characters. Descriptions that contain
spaces can be entered in single or double quotes.
```

Example:

```none
set firewall flowtable FT01 description 'Forwarded traffic between LAN and WAN'
```

```{cfgcmd} set firewall flowtable \<name\> interface \<interface\>

**Configure an interface for the specified flowtable.**

The router forwards the packets of a recorded connection along the fast path
only when it receives them on an interface that you configure with this command.
Otherwise, the router processes the packets through the IP layer as usual.

Repeat the command to add more interfaces. To use the fast path in both
directions of a connection, add every interface on which the router receives its
packets.

To offload connections whose packets the router receives on a bond, a
{abbr}`VLAN (Virtual Local Area Network)` sub-interface, a bridge, a tunnel, or
a PPPoE session, add the interface as follows:

- A bond: Use the bond interface (`bond0`).
- VLAN sub-interfaces: Use the parent interface (`bond1`) to offload the
  connections of all its VLAN sub-interfaces. Use a sub-interface (`bond1.10`)
  to offload only that VLAN's connections.
- A bridge: Use the bridge interface (`br0`).
- A tunnel or a WireGuard interface: Use the tunnel interface (`tun0`, `wg0`).
- PPPoE: Use the Ethernet interface that carries the session (`eth1`).

To find the interfaces to add, enable `log` on a rule at the `forward`
processing point whose action is not `offload`. The `IN` and `OUT` fields in
the output of `show log firewall` name the interfaces on which the router
receives and forwards the packets. For PPPoE, the fields name the PPPoE
interface, not the Ethernet interface to add.

A flowtable requires at least one interface, and every interface must exist. An
interface must belong to only one flowtable. Otherwise, the commit fails. If you
delete an Ethernet interface, or one of its VLAN sub-interfaces, while a
flowtable references it, the commit fails.
```

Example:

```none
set firewall flowtable FT01 interface eth0
set firewall flowtable FT01 interface eth1
```

```{cfgcmd} set firewall flowtable \<name\> offload [hardware | software]

**Configure the offload type of the specified flowtable.**

- `software`: The {abbr}`CPU (Central Processing Unit)` forwards the packets of
  a recorded connection along the fast path.
- `hardware`: The network interface controller forwards the packets of a
  recorded connection without involving the CPU. If the controller does not
  support an action that the connection requires, such as NAT or VLAN tagging,
  the CPU forwards the packets of that connection along the fast path.

The default is `software`.

With `hardware`, every interface of the flowtable must support hardware offload
and have it enabled with
`set interfaces ethernet <interface> offload hw-tc-offload`. Otherwise, the
commit fails.
```

Example:

```none
set firewall flowtable FT01 offload hardware
```

### Add connections to a flowtable

To add connections to a flowtable, use a rule with the `offload` action or the
global state policy. Configure the global state policy with
`set firewall global-options state-policy offload offload-target <name>`.

:::{note}
A packet that the global state policy accepts does not reach an `offload` rule,
because the firewall applies the policy before the rules. To offload the
connection that such a packet belongs to, use the global state policy.
:::

```{cfgcmd} set firewall [ipv4 | ipv6] forward filter rule \<1-999999\> action offload
```

```{cfgcmd} set firewall [ipv4 | ipv6] name \<name\> rule \<1-999999\> action offload

**Configure the rule's action to record the connection of a packet in a
flowtable.**

A rule with the `offload` action requires `offload-target`, and the flowtable
must exist. Otherwise, the commit fails.
```

Example:

```none
set firewall ipv4 forward filter rule 10 action offload
```

```{cfgcmd} set firewall [ipv4 | ipv6] forward filter rule \<1-999999\> offload-target \<name\>
```

```{cfgcmd} set firewall [ipv4 | ipv6] name \<name\> rule \<1-999999\> offload-target \<name\>

**Configure the flowtable to which the `offload` action adds the connection.**

A rule with the `offload` action requires `offload-target`, and the flowtable
must exist. Otherwise, the commit fails. If a rule has `offload-target` but not
the `offload` action, the commit prints a warning.
```

Example:

```none
set firewall ipv4 forward filter rule 10 offload-target FT01
```

### Zone-based firewall

In the zone-based firewall, a flowtable speeds up selected connections whose
packets the router forwards between zones or within a zone. For example, the
host `192.0.2.10` in the zone `LAN` opens a TCP connection to the server
`198.51.100.10` in the zone `WAN`. The router receives the packets of the host
on `eth1`, which belongs to `LAN`, and forwards them out of `eth0`, which
belongs to `WAN`. The router receives the packets of the server on `eth0` and
forwards them out of `eth1`.

Traffic from a zone to the local zone, and from the local zone to a zone, stays
outside flowtables. After the firewall offloads a connection, the router
forwards the packets of that connection directly to the outgoing interface,
bypassing firewall processing, including zone rules.

To offload connections whose packets the router forwards between zones, add a
rule with the `offload` action and the `offload-target` option to the rule set
that the firewall applies to traffic from the source zone to the destination
zone.

To offload connections whose packets the router forwards within a zone, add a
rule with the `offload` action and the `offload-target` option to the rule set
that the firewall applies to traffic between interfaces of that zone.

The rule set must meet the following requirements:

- No zone uses the rule set for traffic to or from the local zone.
- No zone uses the rule set as its `default-firewall`.

Otherwise, the commit fails.

The global state policy offloads connections in the zone-based firewall in the
same way as without zones. The
{doc}`Global options </configuration/firewall/global-options>` page describes
the global state policy.

## Examples

### Offload client-server TCP connections

The following example offloads the TCP connections that clients behind `eth0`
open to port 1122 of the server `192.0.2.100`. The router reaches the server
through `eth1` and forwards the packets of these connections between `eth0` and
`eth1` in both directions.

The flowtable `FT01` uses `eth0` and `eth1`. The rule set at the `forward`
processing point accepts new TCP connections from `eth0` to port 1122 of the
server, accepts the packets of established and related connections, and offloads
established connections to `FT01`. The firewall drops all other forwarded
traffic.

```none
set firewall flowtable FT01 interface eth0
set firewall flowtable FT01 interface eth1
set firewall ipv4 forward filter default-action drop
set firewall ipv4 forward filter rule 10 action offload
set firewall ipv4 forward filter rule 10 offload-target FT01
set firewall ipv4 forward filter rule 10 state established
set firewall ipv4 forward filter rule 20 action accept
set firewall ipv4 forward filter rule 20 state established
set firewall ipv4 forward filter rule 20 state related
set firewall ipv4 forward filter rule 110 action accept
set firewall ipv4 forward filter rule 110 destination address 192.0.2.100
set firewall ipv4 forward filter rule 110 destination port 1122
set firewall ipv4 forward filter rule 110 inbound-interface name eth0
set firewall ipv4 forward filter rule 110 protocol tcp
```

The firewall processes the packets of such a connection in the following order:

1. The router receives the connection request from the client on `eth0`. The
   connection state is `new`, so the packet does not meet the criteria of rules
   10 and 20. Rule 110 accepts the packet.
2. The router receives the reply from the server on `eth1`. The connection state
   is now `established`, so the packet meets the criteria of rule 10, but the
   TCP handshake is not complete yet, and the firewall does not offload the
   connection. Rule 20 accepts the packet.
3. The router receives the packet from the client that completes the handshake.
   Rule 10 offloads the connection to `FT01`, and the firewall continues with
   rule 20, which accepts the packet.
4. From then on, the router forwards the subsequent packets of the connection
   along the fast path in both directions.

### Offload VLAN-to-VLAN connections

The following example offloads the connections between VLAN 10 on `bond1` and
VLAN 20 on `bond2`. The flowtable `FT01` uses the parent interface `bond1`,
which covers all its VLAN sub-interfaces, and the sub-interface `bond2.20`,
which covers only VLAN 20. Rule 200 accepts the packets that arrive on any bond
interface, including VLAN sub-interfaces, and do not meet the criteria of rules
10 and 20.

```none
set firewall flowtable FT01 interface bond1
set firewall flowtable FT01 interface bond2.20
set firewall ipv4 forward filter default-action drop
set firewall ipv4 forward filter rule 10 action offload
set firewall ipv4 forward filter rule 10 offload-target FT01
set firewall ipv4 forward filter rule 10 state established
set firewall ipv4 forward filter rule 20 action accept
set firewall ipv4 forward filter rule 20 state established
set firewall ipv4 forward filter rule 20 state related
set firewall ipv4 forward filter rule 200 action accept
set firewall ipv4 forward filter rule 200 inbound-interface name 'bond*'
```

The firewall processes the packets of such a connection in the following order:

1. The router receives the connection request from the client on `bond1.10`. The
   connection state is `new`, so the packet does not meet the criteria of rules
   10 and 20. Rule 200 accepts the packet.
2. The router receives the reply from the server on `bond2.20`. The connection
   state is now `established`, so the packet meets the criteria of rule 10, but
   the TCP handshake is not complete yet, and the firewall does not offload the
   connection. Rule 20 accepts the packet.
3. The router receives the packet from the client that completes the handshake
   on `bond1.10`. Rule 10 offloads the connection to `FT01`, and the firewall
   continues with rule 20, which accepts the packet.
4. From then on, the router forwards the subsequent packets of the connection
   along the fast path in both directions.

## Verification

To verify that the firewall offloads a connection, generate traffic for the
connection and check the rule counters and the connection tracking table.

Run the following command to show the rule counters:

```none
vyos@FlowTables:~$ show firewall ipv4 forward filter
```

After the firewall offloads a connection, the counters of the rules stop
increasing for the packets of that connection, because the router forwards them
without applying the rules.

Run the following command to show the connection tracking table:

```none
vyos@FlowTables:~$ show conntrack table ipv4
```

The entry of an offloaded connection has `n/a` in the `Timeout` column and an
empty `State` column. When the router stops forwarding the connection along the
fast path, the entry shows the timeout and the state of connection tracking
again.

For IPv6, run `show firewall ipv6 forward filter` and
`show conntrack table ipv6`.
