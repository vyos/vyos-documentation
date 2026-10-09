---
myst:
  html_meta:
    description: |
      The VyOS firewall filters the traffic that the router receives,
      forwards, or generates. It matches packets by their properties,
      provides groups for reuse in rules, and includes a zone-based
      firewall. It operates at an IP layer and a Bridge layer, and
      processes packets at the processing points of each layer.
    keywords: firewall, zone-based firewall, ip layer, bridge layer
---

(firewall)=

# Firewall

The VyOS firewall filters traffic that the router **receives**, **forwards**,
or **generates**. It matches packets by their addresses, ports, protocols,
connection state, and other properties; groups addresses, networks,
interfaces, and ports for reuse in rules; divides interfaces into zones;
and offloads forwarded connections to a flowtable.

The firewall operates at two processing layers. The layer at which the
firewall begins processing a packet depends on the interface that
received it:

- **IP layer**: Processes packets received on interfaces that are not bridge
  member interfaces.
- **Bridge layer**: Processes packets received on bridge member interfaces.

Packets that the router generates have no receiving interface. The
firewall begins processing them at the IP layer. The firewall can
continue processing a packet at another layer, for example, when the
router sends the packet out through a bridge.

At each layer, the firewall processes packets at specific processing
points. The points at which a packet is processed depend on its source
and destination. By default, firewall rules apply to matching packets on
any interface of their processing layer.

```{warning}
During boot, the router configures interfaces before it applies the
firewall rules. Until then, the firewall does not filter traffic that
arrives on interfaces, which poses a security risk.
```

## Packet flow

The following diagram shows how the router processes packets and the
paths that traffic can take.

```{figure} /_static/images/firewall-gral-packet-flow.webp
```

### IP layer

The IP layer processes packets received on interfaces that are not
**bridge member interfaces**, packets that the router generates, and packets
that the Bridge layer passes on. Depending on its source and
destination, the firewall processes a packet at different processing
points, as outlined in the following table:

```{list-table}
:header-rows: 1
:widths: 12 18 22 48

* - Processing point (hook)
  - Processing order
  - Packet source or destination
  - Configuration applied
* - prerouting
  - First processing point at the IP layer for received packets.
  - Received packets, regardless of their destination.
  - **Firewall prerouting raw**: Rules that match received packets and apply an
    action to them before connection tracking, such as dropping them or
    exempting\* them from connection tracking.\
    You define the rules under `set firewall [ipv4 | ipv6] prerouting raw ...`.

    **Source validation**: Drops received packets whose source address fails the
    reverse path check.\
    You set the check mode under
    `set firewall global-options source-validation ...` and
    `ipv6-source-validation ...`.

    **Policy route**: Rules that match packets received on the interfaces you
    **Policy route**: Rules that match packets received on the interfaces you
    specify and assign the matching packets to a routing table or
    {abbr}`VRF (Virtual Routing and Forwarding)`, or modify packet properties.\
    You define the rules under `set policy [route | route6] ...`.

    **Destination {abbr}`NAT (Network Address Translation)`**: Rules that match
    received packets and translate their destination address and port, or, for
    IPv4, redirect them to the router itself.\
    You define the rules under `set [nat | nat66] destination ...`.
* - input
  - After the prerouting processing point.
  - Packets whose destination is the router.
  - **Global state policy**: Accepts, drops, or rejects packets according to the
    state of their connection, before the input rules.\
    You define the policy under `set firewall global-options state-policy ...`.

    **Firewall input**: Rules that match received packets and apply an action to
    them, such as accepting or dropping them.\
    You define the rules under `set firewall [ipv4 | ipv6] input filter ...`.

    **Zone policy**: Rules that match packets according to the zone of the
    receiving interface and apply an action to them, such as accepting or
    dropping them, after the input rules.\
    You define the rules under `set firewall zone ...`.
* - forward
  - After the prerouting processing point.
  - Packets that the router routes through to another destination.
  - **Global state policy**: Accepts, drops, or rejects packets according to the
    state of their connection, before the forward rules.\
    You define the policy under `set firewall global-options state-policy ...`.

    **Firewall forward**: Rules that match received packets and apply an action
    to them, such as accepting or dropping them.\
    You define the rules under `set firewall [ipv4 | ipv6] forward filter ...`.

    **Zone policy**: Rules that match packets according to the zones of the
    receiving and outgoing interfaces and apply an action to them, such as
    accepting or dropping them, after the forward rules.\
    You define the rules under `set firewall zone ...`.
* - output
  - First processing point at the IP layer for packets that the router
    generates.
  - Packets that the router generates.
  - **Firewall output raw**: Rules that match generated packets and apply an
    action to them before connection tracking, such as dropping them or
    exempting\* them from connection tracking.\
    You define the rules under `set firewall [ipv4 | ipv6] output raw ...`.

    **Global state policy**: Accepts, drops, or rejects packets according to the
    state of their connection, before the output filter rules.\
    You define the policy under `set firewall global-options state-policy ...`.

    **Firewall output filter**: Rules that match generated packets and apply an
    action to them, such as accepting or dropping them.\
    You define the rules under `set firewall [ipv4 | ipv6] output filter ...`.

    **Zone policy**: Rules that match packets according to the zone of the
    outgoing interface and apply an action to them, such as accepting or
    dropping them, after the output filter rules.\
    You define the rules under `set firewall zone ...`.
* - \-
  - After the forward or output processing point.
  - Packets that the router sends out, both transit packets and packets
    that the router generates.
  - **Source NAT**: Rules that match packets and translate their source address
    and port.\
    You define the rules under `set [nat | nat66] source ...`.
```

\* To exempt packets from connection tracking, you can also define rules
under `set system conntrack ignore [ipv4 | ipv6] ...`. These rules apply
to both received and generated packets and are maintained for
compatibility. VyOS recommends rules with the `notrack` action under
`set firewall [ipv4 | ipv6] prerouting raw` and `set firewall [ipv4 |
ipv6] output raw` instead, as `conntrack ignore` rules are expected to
be removed in the future.

At the IP layer, the firewall has no processing point after the forward
or output processing point. Source NAT applies after these points and is
configured separately under `set nat source` and `set nat66 source`.

After source NAT, a packet that the router sends out through a bridge is
passed to the Bridge layer, which processes it at its output processing
point.

After the router offloads a connection to a flowtable, the firewall does
not process the subsequent packets of that connection at any processing
point of the IP layer.

### Bridge layer

The Bridge layer processes packets received on **bridge member interfaces**
and packets that the IP layer passes on to send out through a bridge.
Depending on its source and destination, the firewall processes a packet
at different processing points, as outlined in the following table:

```{list-table}
:header-rows: 1
:widths: 12 18 22 48

* - Processing point (hook)
  - Processing order
  - Packet source or destination
  - Configuration applied
* - prerouting
  - First processing point at the Bridge layer for received packets.
  - Received packets, regardless of their destination.
  - **Bridge firewall prerouting**: Rules that match received packets and apply
    an action to them, such as accepting or dropping them, or exempting them
    from connection tracking.\
    You define the rules under `set firewall bridge prerouting filter ...`.
* - input
  - After the prerouting processing point.
  - Packets whose destination is the bridge.
  - **Global state policy**: Accepts, drops, or rejects packets according to the
    state of their connection, before the input rules.\
    You define the policy under `set firewall global-options state-policy ...`.

    **Bridge firewall input**: Rules that match received packets and apply an
    action to them, such as accepting or dropping them.\
    You define the rules under `set firewall bridge input filter ...`.
* - forward
  - After the prerouting processing point.
  - Packets that the bridge forwards between its member interfaces.
  - **Global state policy**: Accepts, drops, or rejects packets according to the
    state of their connection, before the forward rules.\
    You define the policy under `set firewall global-options state-policy ...`.

    **Bridge firewall forward**: Rules that match received packets and apply an
    action to them, such as accepting or dropping them.\
    You define the rules under `set firewall bridge forward filter ...`.
* - output
  - First processing point at the Bridge layer for packets that the
    router sends out through a bridge.
  - Packets that the router sends out through a bridge, both routed
    packets and packets that the router generates.
  - **Global state policy**: Accepts, drops, or rejects packets according to the
    state of their connection, before the output rules.\
    You define the policy under `set firewall global-options state-policy ...`.

    **Bridge firewall output**: Rules that match outgoing packets and apply an
    action to them, such as accepting or dropping them.\
    You define the rules under `set firewall bridge output filter ...`.
```

After the bridge input processing point, the packets are passed to the
IP layer, which processes them starting at the prerouting processing
point.

## Zone-based firewall

The zone-based firewall is not a separate service. It is part of the
same firewall, and you can use it together with the other firewall
rules. It lets you group interfaces into zones and assign rules to
control traffic between them. The local zone represents the router
itself.

The zone-based firewall processes packets at the following processing
points of the IP layer:

```{list-table}
:header-rows: 1
:widths: 55 45

* - Traffic
  - Processing point
* - From one zone to another zone
  - forward
* - From a zone to the local zone
  - input
* - From the local zone to a zone
  - output
```

At each point, the firewall applies zone rules after the input, forward,
or output filter rules.

## Firewall configuration

For information on firewall configuration, see the following pages:

```{toctree}
:includehidden: true
:maxdepth: 1

global-options
groups
bridge
ipv4
ipv6
flowtables
zone
```
