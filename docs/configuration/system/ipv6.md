---
lastproofread: '2026-10-01'
---

# IPv6

## System configuration commands

```{cfgcmd} set system ipv6 disable-forwarding

Disable IPv6 forwarding on all interfaces.
```

```{cfgcmd} set system ipv6 neighbor table-size <number>

Set the maximum number of entries in the IPv6 neighbor cache. Supported
values are 1024, 2048, 4096, 8192, 16384, and 32768. The default is 8192.
```

```{cfgcmd} set system ipv6 strict-dad

Enable strict Duplicate Address Detection (DAD). If DAD detects a duplicate
link-local address, IPv6 is disabled on that interface.
```

```{cfgcmd} set system ipv6 multipath layer4-hashing

Include Layer 4 information in the hash used to select a path for IPv6
equal-cost multipath (ECMP) routes.
```

### Zebra and kernel route filtering

Zebra can apply a route map to routes it receives from routing protocols.
The route map can filter which routes Zebra installs in the kernel.

```{cfgcmd} set system ipv6 protocol <protocol> route-map <route-map>

Apply a route map to routes received from the specified protocol. Supported
protocols are `any`, `babel`, `bgp`, `isis`, `ospfv3`, `ripng`, and `static`.
Use `any` to apply the route map to routes from all protocols.
```

### Nexthop tracking

By default, FRR nexthop tracking does not resolve nexthops through the default
route. Enabling resolution through the default route can allow, for example,
BGP peers to be reached through that route.

```{cfgcmd} set system ipv6 nht no-resolve-via-default

Explicitly prevent IPv6 nexthop tracking from resolving nexthops through the
default route. This setting is per VRF and is also available under the VRF
configuration node.
```

## Operational commands

### Show commands

```{opcmd} show ipv6 neighbors

Show the IPv6 neighbor table.
```

```{opcmd} show ipv6 groups

Show IPv6 multicast group membership.
```

```{opcmd} show ipv6 forwarding

Show IPv6 forwarding status.
```

```{opcmd} show ipv6 route

Show IPv6 routes. The command accepts a prefix or address and supports
protocol, table, tag, summary, and VRF filters. Use CLI completion to see the
available options.
```

```{opcmd} show ipv6 prefix-list

Show IPv6 prefix lists. Specify a list name to show one list, or use the
`detail` or `summary` options for additional information.
```

```{opcmd} show ipv6 access-list

Show IPv6 access lists. Specify a list name to show one list.
```

```{opcmd} show ipv6 ospfv3

Show OSPFv3 information, including areas, border routers, the link-state
database, interfaces, neighbors, redistributed routes, and routes.
```

```{opcmd} show ipv6 ripng

Show information about the RIPng protocol.
```

```{opcmd} show ipv6 ripng status

Show RIPng protocol status.
```

### Reset commands

```{opcmd} reset bgp ipv6 <address>

Use the neighbor address to select a BGP peer in the IPv6 address family.
Options include clearing all peers, external peers, or peers by AS number,
and resetting inbound or outbound routes or message statistics.
```

```{opcmd} reset ipv6 neighbors <address | interface>

Flush IPv6 neighbor entries for the specified address or interface.
```

```{opcmd} reset ipv6 route cache

Flush the kernel IPv6 route cache. You can specify an address or prefix to
flush the cache for that route.
```
