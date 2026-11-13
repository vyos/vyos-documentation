---
myst:
  html_meta:
    description: |
      The zone-based firewall groups interfaces into zones and controls which
      packets the router forwards between and within zones, which packets the
      router receives, and which packets the router generates.
    keywords: firewall, zone-based firewall, zone, local zone, rule set
---

(firewall-zone-configuration)=

# Zone-based firewall

The **zone-based firewall** controls which packets the router forwards between
and within network segments such as LAN, WAN, or DMZ, which packets the router
receives, and which packets the router generates.

The firewall groups the interfaces or
{abbr}`VRF (Virtual Routing and Forwarding)` instances that belong to the
segments into **zones**. The firewall applies a **rule set**, a
**default rule set**, or a **default action** to each direction between zones
and the **intra-zone filtering** to packets within a zone. A direction goes
from the **source zone** to the **destination zone** of a packet.

The firewall treats the router itself as a zone, called the **local zone**. The
local zone covers the packets that the router receives and generates on any of
its interfaces. The local zone contains no interfaces or VRF instances, and each
router's interface or VRF instance belongs to one zone or does not belong to any
zone. The firewall applies a **rule set**, a **default rule set**, or a
**default action** to each direction between the local zone and the other zones.

The firewall determines the source zone by the receiving interface and the
destination zone by the outgoing interface. The local zone is the destination
zone of the packets that the router receives and the source zone of the packets
that the router generates.

:::{warning}
The firewall applies the local zone's default action, which is `drop` unless you
change it, to any packet that the router receives or generates and that no rule
set or default rule set covers, including SSH sessions. Before you commit the
local zone, configure rule sets or default rule sets that accept management
traffic in both directions.
:::

## Packet processing

The zone-based firewall processes a packet according to the first criterion that
the packet meets:

1. If the router receives or sends the packet on the loopback interface, the
   firewall accepts the packet.
2. If the source zone and the destination zone are the same, the firewall
   applies the intra-zone filtering of that zone. Without intra-zone filtering,
   the firewall accepts the packet.
3. If the direction from the source zone to the destination zone has a rule set,
   the firewall applies that rule set.
4. If the destination zone has a default rule set, the firewall applies it.
5. Otherwise, the firewall applies the **default action** of the destination
   zone. For a generated packet, the firewall applies the default action of the
   local zone.

The zone-based firewall does not process a forwarded packet whose outgoing
interface does not belong to any zone. The firewall applies the default rule set
or the default action of the destination zone to a packet whose receiving
interface does not belong to any zone. The firewall applies the default action
of the local zone to a generated packet whose outgoing interface does not belong
to any zone.

After the firewall offloads a connection to a flowtable, the packets of that
connection bypass the zones. The
{doc}`Flowtables </configuration/firewall/flowtables>` page describes connection
offload in the zone-based firewall.

## Configuration

### Define a zone

A zone name must begin with a letter or a digit and can contain letters, digits,
underscores, hyphens, and dots. A zone that is not the local zone requires at
least one member interface or VRF. Otherwise, the commit fails.

```{cfgcmd} set firewall zone \<name\> member interface \<interface\>

**Add an interface to the specified zone.**

End the name with `*` to add all interfaces whose names begin with the specified
text, for example `eth3*`. Repeat the command to add more interfaces.

An interface can be a member of only one zone. Otherwise, the commit fails.

If the interface belongs to a VRF, the commit prints a warning, because the zone
might not work as expected. To add a VRF with all its interfaces, use
`member vrf`.
```

Example:

```none
set firewall zone LAN member interface eth1
set firewall zone LAN member interface eth2
set firewall zone WAN member interface 'eth3*'
```

```{cfgcmd} set firewall zone \<name\> member vrf \<vrf\>

**Add a VRF to the specified zone.**

The zone then includes all interfaces that belong to the VRF. Repeat the command
to add more VRFs.

A VRF can be a member of only one zone, and the VRF must contain at least one
interface. Otherwise, the commit fails.
```

Example:

```none
set firewall zone LAN member vrf BLUE
```

```{cfgcmd} set firewall zone \<name\> local-zone

**Define the specified zone as the local zone, which represents the router
itself.**

The commit fails if the configuration has more than one local zone, or if you
add interfaces or VRF instances to the local zone or configure intra-zone
filtering for it.
```

Example:

```none
set firewall zone LOCAL local-zone
```

```{cfgcmd} set firewall zone \<name\> default-action [drop | reject]

**Configure the default action of the specified zone.**

The firewall applies the default rule set to a packet that no earlier criterion
covers.

- `drop`: The firewall drops the packet.
- `reject`: The firewall drops the packet and, for packets that were not sent to
  a broadcast or multicast address, sends a response to the sender.

The default is `drop`.
```

Example:

```none
set firewall zone WAN default-action reject
```

```{cfgcmd} set firewall zone \<name\> default-log

**Log the packets to which the default action of the specified zone applies.**

The log message prefix contains `zone_<name>-default-<action>`, where:

- `<name>` is the name of the zone. The firewall cuts `zone_<name>` at 19
  characters, so the name keeps at most 14 characters.
- `<action>` is the first letter of the default action in uppercase, for
  example, `D` for `drop` and `R` for `reject`.
```

Example:

```none
set firewall zone WAN default-log
```

```{cfgcmd} set firewall zone \<name\> description \<text\>

**Configure a description for the specified zone.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall zone WAN description 'Internet uplinks'
```

### Define the rule sets

A rule set of the zone-based firewall is a custom rule set. Create it with
`set firewall ipv4 name <name> ...` for IPv4 and
`set firewall ipv6 name <name> ...` for IPv6. The
{doc}`IPv4 layer </configuration/firewall/ipv4>` and
{doc}`IPv6 layer </configuration/firewall/ipv6>` pages describe the commands.

To identify the rule sets easily, name them in the format
`<Source Zone>-<Destination Zone>-<v4 | v6>`.

A rule set that contains a rule with the `offload` action cannot be used for the
local zone or as a default rule set. Otherwise, the commit fails.

(firewall-zone-apply-rule-sets)=

### Apply the rule sets to the zones

```{cfgcmd} set firewall zone \<destination-zone\> from \<source-zone\> firewall name \<ipv4-rule-set\>
```

```{cfgcmd} set firewall zone \<destination-zone\> from \<source-zone\> firewall ipv6-name \<ipv6-rule-set\>

**Apply a rule set to the direction from the source zone to the destination
zone.**

The source zone and the rule set must exist. Otherwise, the commit fails.

A rule set that contains a rule with the `offload` action cannot be used for a
direction to or from the local zone. Otherwise, the commit fails. The
{doc}`Flowtables </configuration/firewall/flowtables>` page describes
offloading.
```

Example:

```none
set firewall zone DMZ from LAN firewall name LAN-DMZ-v4
```

```{cfgcmd} set firewall zone \<destination-zone\> default-firewall name \<ipv4-rule-set\>
```

```{cfgcmd} set firewall zone \<destination-zone\> default-firewall ipv6-name \<ipv6-rule-set\>

**Apply a default rule set to the destination zone.**

The firewall applies the default rule set to a packet that no earlier criterion
covers.

The rule sets must exist and must not contain a rule with the `offload` action.
Otherwise, the commit fails.
```

Example:

```none
set firewall zone WAN default-firewall name DEFAULT-WAN-v4
```

```{cfgcmd} set firewall zone \<name\> intra-zone-filtering action [accept | drop]

**Configure the action that the firewall applies to the packets within the
specified zone.**

- `accept`: The firewall accepts the packets.
- `drop`: The firewall drops the packets.

When no intra-zone filtering is configured, the firewall accepts the packets.
The commit fails if the zone also has `intra-zone-filtering firewall`
configured.
```

Example:

```none
set firewall zone WAN intra-zone-filtering action drop
```

```{cfgcmd} set firewall zone \<name\> intra-zone-filtering firewall name \<ipv4-rule-set\>
```

```{cfgcmd} set firewall zone \<name\> intra-zone-filtering firewall ipv6-name \<ipv6-rule-set\>

**Apply a rule set to the packets within the specified zone.**

The firewall accepts a packet that the rule set does not drop or reject.

The commit fails if a rule set does not exist or if the zone also has
`intra-zone-filtering action` configured.
```

Example:

```none
set firewall zone LAN intra-zone-filtering firewall name LAN-LAN-v4
```

## Operation

```{opcmd} show firewall zone-policy

**Show the zones with their interfaces and VRF instances, the source zones
that have a rule set, and the names of these rule sets.**
```

```{opcmd} show firewall zone-policy zone \<zone\>

**Show the specified zone with its interfaces and VRF instances, the source
zones that have a rule set, and the names of these rule sets.**
```

## Example

In the following example, the zone `LAN` has the interface `eth1`, and the zone
`DMZ` has the interface `eth2`. The firewall accepts the TCP connections from
`LAN` to port 443 of `DMZ` and the replies of these connections. The default
action of each rule set drops all other traffic between the two zones.

```none
set firewall zone LAN member interface eth1
set firewall zone DMZ member interface eth2
set firewall ipv4 name LAN-DMZ-v4 default-action drop
set firewall ipv4 name LAN-DMZ-v4 rule 10 action accept
set firewall ipv4 name LAN-DMZ-v4 rule 10 destination port 443
set firewall ipv4 name LAN-DMZ-v4 rule 10 protocol tcp
set firewall ipv4 name DMZ-LAN-v4 default-action drop
set firewall ipv4 name DMZ-LAN-v4 rule 10 action accept
set firewall ipv4 name DMZ-LAN-v4 rule 10 state established
set firewall ipv4 name DMZ-LAN-v4 rule 10 state related
set firewall zone DMZ from LAN firewall name LAN-DMZ-v4
set firewall zone LAN from DMZ firewall name DMZ-LAN-v4
```
