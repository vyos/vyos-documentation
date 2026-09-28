---
myst:
  html_meta:
    description: |
      The `system ip` subtree configures IPv4 settings that apply to the
      whole router, such as packet forwarding, the ARP cache, ECMP
      multipath hashing, and TCP MSS probing. It also controls
      routing-table import, route installation filtering, and next hop
      tracking.
    keywords: ipv4, arp, ecmp, multipath, tcp mss, next hop tracking
---

(ip)=

# IP

The `system ip` subtree provides IPv4 settings that apply to the whole
router.

To configure IPv4 settings for an individual interface, use
`set interfaces <type> <name> ip`.

## Configuration

### Forwarding

```{cfgcmd} set system ip disable-forwarding

**Disable IPv4 forwarding between the router's interfaces.**

By default, the router forwards IPv4 packets between interfaces.
```

Example:

```none
set system ip disable-forwarding
```

### ARP cache

```{cfgcmd} set system ip arp table-size \<1024 | 2048 | 4096 | 8192 | 16384 | 32768\>

**Configure the maximum number of entries in the ARP cache.**

The default is 8192. Entries from `set protocols static arp` are not
subject to this limit.

The router derives two more thresholds from this number. When the ARP
cache holds more than half of this number, the router removes entries
older than 5 seconds. While the ARP cache holds fewer than one eighth of
this number, the router does not remove any entries.

The command also sets the following kernel parameters:

- `net.ipv4.neigh.default.gc_thresh3`: Takes the value of the configured
  maximum number.
- `net.ipv4.neigh.default.gc_thresh2`: Takes half of that number.
- `net.ipv4.neigh.default.gc_thresh1`: Takes one eighth of that number.

If `system sysctl parameter` sets any of these parameters, the `system
sysctl` values take precedence.
```

Example:

```none
set system ip arp table-size 16384
```

### Multipath routing

The following commands control how the router distributes IPv4 traffic
across the next hops of an {abbr}`ECMP (Equal-Cost Multi-Path)` route.

```{cfgcmd} set system ip multipath layer4-hashing

**Include Layer 4 information in the ECMP hash.**

By default, the router hashes only the source and destination addresses,
so all traffic between the same two hosts follows one path.

This command adds the IP protocol number and the source and destination
port numbers to the hash, so flows between the same two hosts can take
different paths.
```

Example:

```none
set system ip multipath layer4-hashing
```

```{cfgcmd} set system ip multipath ignore-unreachable-nexthops

**Skip next hops that the ARP cache marks as unreachable when the router
selects a path for an ECMP route.**

By default, the router selects among all next hops of an ECMP route
without checking the ARP cache, so the router can send packets to a
failed next hop. With this command, the router skips a next hop whose
ARP cache entry is incomplete or failed. A next hop without an ARP cache
entry stays eligible.

This command affects only ECMP routes that are installed without a
next-hop group. Routes from routing protocols and static routes use
next-hop groups. For these routes, the router skips such next hops
regardless of this command.
```

Example:

```none
set system ip multipath ignore-unreachable-nexthops
```

### TCP segment size probing

TCP {abbr}`MSS (Maximum Segment Size)` probing adjusts the segment size
of TCP connections that the router itself opens or accepts. Instead of
relying on ICMP messages, the router sends probe segments and uses the
peer's acknowledgments to find a segment size the path can carry. This
helps on paths that drop packets that are too large without returning an
ICMP message. Such a path is an ICMP black hole.

The following commands do not affect TCP connections that the router
forwards. To change the MSS of forwarded connections, use `set
interfaces <type> <name> ip adjust-mss`.

```{cfgcmd} set system ip tcp mss probing \<on-icmp-black-hole | force\>

**Enable TCP MSS probing.**

By default, TCP MSS probing is disabled.

- `on-icmp-black-hole`: The router probes an established connection only
  after detecting an ICMP black hole, indicated by repeated
  retransmission timeouts.
- `force`: The router probes every connection from the start.
```

Example:

```none
set system ip tcp mss probing on-icmp-black-hole
```

```{cfgcmd} set system ip tcp mss base \<48-1460\>

**Configure the MSS from which TCP MSS probing starts.**

The default is 1024.

With `force`, every connection starts with an MSS of at most this value.
With `on-icmp-black-hole`, the router reduces the MSS of a connection to
at most this value when it detects an ICMP black hole on that
connection.
```

Example:

```none
set system ip tcp mss base 1200
```

```{cfgcmd} set system ip tcp mss floor \<48-1460\>

**Configure the smallest MSS that TCP MSS probing reduces a connection
to.**

Once TCP MSS probing is active on a connection, each further ICMP black
hole halves that connection's MSS. TCP MSS probing does not reduce the
MSS below this value.

The default is 48.
```

Example:

```none
set system ip tcp mss floor 512
```

### Routing table import

```{cfgcmd} set system ip import-table \<1-252\>

**Import the routes of the specified table into the router's main
{abbr}`RIB (Routing Information Base)`.**

The router keeps the imported routes in sync with the specified table.
When a route is added to or deleted from that table, the router makes the
same change in the RIB.
```

Example:

```none
set system ip import-table 100
```

```{cfgcmd} set system ip import-table \<1-252\> distance \<1-255\>

**Configure the administrative distance of the routes that the router
imports from the specified routing table.**

By default, imported routes have a distance of 15. The distance controls
how the router weighs imported routes against routes for the same prefix
from other sources (the lowest distance is preferred).

A distance of 255 prevents the router from ever selecting an imported
route.
```

Example:

```none
set system ip import-table 100 distance 130
```

```{cfgcmd} set system ip import-table \<1-252\> route-map \<name\>

**Filter the routes that the router imports from the specified routing
table.**

The router imports only the routes that the `route-map` permits.

The `route-map` must exist under `policy route-map`. Otherwise, the
commit fails.
```

Example:

```none
set system ip import-table 100 route-map TABLE-100
```

### Route installation filtering

The router can apply a `route-map` to filter a routing protocol's routes before
installing them in the router's {abbr}`FIB (Forwarding Information Base)`.

```{cfgcmd} set system ip protocol \<any | babel | bgp | eigrp | isis | ospf | rip | static\> route-map \<name\>

**Filter the routes of the specified protocol before the router installs
them in the FIB.**

The router evaluates the `route-map` for each next hop of a route and
does not install a next hop that the `route-map` denies.

A `route-map` configured for a specific protocol applies to that
protocol instead of the `route-map` configured under `protocol any`. The
router never applies both.

This command applies to the default {abbr}`VRF (Virtual Routing and
Forwarding)`. Use `vrf name <name> ip protocol <protocol> route-map
<name>` for another VRF.

The `route-map` must exist under `policy route-map`. Otherwise, the
commit fails.
```

Example:

```none
set system ip protocol ospf route-map OSPF-SRC
```

### Next hop tracking

Next hop tracking lets a routing protocol, such as BGP, learn whether a
route's next hop is reachable through the router's RIB.

```{cfgcmd} set system ip nht no-resolve-via-default

**Prevent IPv4 next hop tracking from resolving next hops through the
default route.**

By default, next hop tracking considers a next hop reachable when only
the default route covers it. This command makes next hop tracking
require a more specific route.

The default applies to the `traditional` profile of `system frr
profile`, which is the default profile. With the `datacenter` profile,
next hop tracking does not resolve next hops through the default route,
so this command has no effect under that profile.

This command applies to the default VRF. Use `vrf name <name> ip nht
no-resolve-via-default` for another VRF.
```

Example:

```none
set system ip nht no-resolve-via-default
```

## Operation

### Show

```{opcmd} show ip forwarding

**Show the router's IPv4 forwarding status.**
```

```{opcmd} show ip neighbors

**Show the router's ARP cache.**
```

```{opcmd} show ip neighbors interface \<interface\>

**Show the ARP cache entries on the specified interface.**
```

```{opcmd} show ip neighbors state \<state\>

**Show the ARP cache entries in the specified state.**
```

```{opcmd} show ip nht

**Show the IPv4 next hop tracking table.**
```

```{opcmd} show ip nht vrf \<name\>

**Show the IPv4 next hop tracking table for the specified VRF.**
```

```{opcmd} show ip ports

**Show the IP ports that the router's services are listening on.**
```

```{opcmd} show ip protocol

**Show the `route-map` applied to each routing protocol before route
installation.**
```

```{opcmd} show ip route

**Show the IPv4 routes in the router's RIB.**
```

```{opcmd} show ip route \<connected | static | kernel | bgp | ospf | rip | isis | openfabric\>

**Show only the IPv4 routes from the given source.**
```

```{opcmd} show ip route supernets-only

**Show only the IPv4 supernet (aggregate) routes.**
```

```{opcmd} show ip route \<subnet\>

**Show the IPv4 routes that match the specified address or prefix.**
```

```{opcmd} show ip route \<subnet\> longer-prefixes

**Show the IPv4 routes more specific than the specified prefix.**
```

```{opcmd} show ip route forward

**Show the entire kernel forwarding table.**
```

```{opcmd} show ip route forward \<subnet\>

**Show the kernel forwarding entry for the specified route.**
```

```{opcmd} show ip route summary

**Show the number of IPv4 routes in the RIB, grouped by source.**

The source is the route type that provided each route.
```

```{opcmd} show ip route summary table \<tableid\>

**Show the number of IPv4 routes in the specified routing table, grouped by
source.**
```

```{opcmd} show ip route table \<tableid\>

**Show the IPv4 routes in the specified routing table.**
```

```{opcmd} show ip route tag \<tag\>

**Show the IPv4 routes with the specified tag.**
```

```{opcmd} show ip route vrf \<name\>

**Show the IPv4 routes in the RIB of the specified VRF.**
```

### Reset

```{opcmd} reset ip arp address \<address\>

**Reset the ARP cache entry for the specified IPv4 address.**
```

```{opcmd} reset ip arp interface \<interface\>

**Reset the ARP cache entries on the specified interface.**
```

```{opcmd} reset ip arp table

**Reset the entire IPv4 ARP cache by removing all entries.**
```

```{opcmd} reset ip route cache

**Reset the entire kernel route cache.**
```

```{opcmd} reset ip route cache \<subnet\>

**Reset the kernel route cache for the specified route.**
```
