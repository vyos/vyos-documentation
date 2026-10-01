---
myst:
  html_meta:
    description: |
      The `system ipv6` subtree provides IPv6 settings that apply to the
      whole router, such as packet forwarding, the neighbor cache,
      Duplicate Address Detection, and ECMP multipath hashing. It also
      controls route installation filtering and next hop tracking.
    keywords: ipv6, neighbor cache, dad, ecmp, multipath, next hop tracking
---

(ipv6)=

# IPv6

The `system ipv6` subtree provides IPv6 settings that apply to the whole router.

To configure IPv6 settings for an individual interface, use
`set interfaces <type> <name> ipv6`.

## Configuration

### Forwarding

```{cfgcmd} set system ipv6 disable-forwarding

**Disable IPv6 forwarding between the router's interfaces.**

By default, the router forwards IPv6 packets between interfaces.
```

Example:

```none
set system ipv6 disable-forwarding
```

### Neighbor cache

The neighbor cache stores mappings between each neighbor's IPv6 and
link-layer addresses, together with the neighbor's reachability state.
The router learns these entries dynamically as it communicates with
neighbors.

```{cfgcmd} set system ipv6 neighbor table-size \<1024 | 2048 | 4096 | 8192 | 16384 | 32768\>

**Configure the maximum number of dynamically learned entries in the
neighbor cache.**

The default is 8192.

This limit counts only the entries that the router learns dynamically.
It does not count entries added manually as permanent, nor entries
that another subsystem installs and maintains.

The router derives two more thresholds from this number. Once the
neighbor cache reaches half of this number, the router removes
entries older than 5 seconds. While the neighbor cache holds fewer
than one eighth of this number, the router does not remove entries
to reclaim space.

The command also sets the following kernel parameters:

- `net.ipv6.neigh.default.gc_thresh3`: Takes the value of the configured
  maximum number.
- `net.ipv6.neigh.default.gc_thresh2`: Takes half of that number.
- `net.ipv6.neigh.default.gc_thresh1`: Takes one eighth of that number.

If `system sysctl parameter` sets any of these parameters, the `system
sysctl` values take precedence.
```

Example:

```none
set system ipv6 neighbor table-size 16384
```

### Duplicate address detection

```{cfgcmd} set system ipv6 strict-dad

**Disable IPv6 on any interface where {abbr}`DAD (Duplicate Address
Detection)` detects a duplicate of the interface's MAC-based link-local
address.**

Without this command, a duplicate MAC-based link-local address does not
disable IPv6 on the interface.

When the router disables IPv6 on an interface this way, the router does
not re-enable IPv6 on that interface automatically.
```

Example:

```none
set system ipv6 strict-dad
```

### Multipath routing

```{cfgcmd} set system ipv6 multipath layer4-hashing

**Include Layer 4 information in the
{abbr}`ECMP (Equal-Cost Multi-Path)` hash.**

By default, the router hashes the source and destination addresses, the
protocol number, and the flow label.

With this command, the router hashes the source and destination addresses,
the protocol number, and the source and destination port numbers instead,
so it distributes the flows between two hosts by port rather than by flow
label.
```

Example:

```none
set system ipv6 multipath layer4-hashing
```

### Route installation filtering

The router can apply a `route-map` to filter a routing protocol's
routes before installing them in the router's {abbr}`FIB (Forwarding
Information Base)`.

```{cfgcmd} set system ipv6 protocol \<any | babel | bgp | isis | ospfv3 | ripng | static\> route-map \<name\>

**Filter the routes of the specified protocol before the router installs
them in the FIB.**

The router evaluates the `route-map` for each next hop of a route and
does not install a next hop that the `route-map` denies.

A `route-map` configured for a specific protocol applies to that
protocol instead of the `route-map` configured under `protocol any`. The
router never applies both.

This command applies to the default {abbr}`VRF (Virtual Routing and
Forwarding)`. Use `vrf name <name> ipv6 protocol <protocol> route-map
<name>` for another VRF.

The `route-map` must exist under `policy route-map`. Otherwise, the
commit fails.
```

Example:

```none
set system ipv6 protocol ospfv3 route-map OSPFV3-SRC
```

### Next hop tracking

Next hop tracking lets a routing protocol, such as BGP, learn whether a
route's next hop is reachable through the router's {abbr}`RIB (Routing
Information Base)`.

```{cfgcmd} set system ipv6 nht no-resolve-via-default

**Prevent IPv6 next hop tracking from resolving next hops through the
default route.**

By default, next hop tracking considers a next hop reachable when only
the default route covers it. This command makes next hop tracking
require a more specific route.

The default applies to the `traditional` profile of `system frr
profile`, which is the default profile. With the `datacenter` profile,
next hop tracking does not resolve next hops through the default route,
so this command has no effect under that profile.

This command applies to the default VRF. Use `vrf name <name> ipv6 nht
no-resolve-via-default` for another VRF.
```

Example:

```none
set system ipv6 nht no-resolve-via-default
```

## Operation

### Show

```{opcmd} show ipv6 forwarding

**Show the router's IPv6 forwarding status.**
```

```{opcmd} show ipv6 groups

**Show the router's active IPv6 network connections and its IPv6
multicast group memberships per interface.**
```

```{opcmd} show ipv6 multicast group

**Show the IPv6 multicast group memberships of the router's
interfaces, as a table sorted by interface.**
```

```{opcmd} show ipv6 multicast group interface \<interface\>

**Show the IPv6 multicast group memberships of the specified interface.**
```

```{opcmd} show ipv6 neighbors

**Show the router's neighbor cache.**
```

```{opcmd} show ipv6 neighbors interface \<interface\>

**Show the neighbor cache entries on the specified interface.**
```

```{opcmd} show ipv6 neighbors state \<reachable | stale | failed | permanent\>

**Show the neighbor cache entries in the specified state.**
```

```{opcmd} show ipv6 nht

**Show the IPv6 next hop tracking table.**
```

```{opcmd} show ipv6 nht vrf \<name | default | all\>

**Show the IPv6 next hop tracking table for the specified VRF, or for
all VRFs.**
```

```{opcmd} show ipv6 route

**Show the IPv6 routes in the router's RIB.**
```

```{opcmd} show ipv6 route \<kernel | connected | static | ripng | ospfv3 | isis | bgp | openfabric\>

**Show only the IPv6 routes from the given source.**
```

```{opcmd} show ipv6 route \<address | prefix\>

**Show the IPv6 routes in the RIB for the specified address or prefix.**

For an address, the router shows the routes for the most specific prefix
that covers the address. For a prefix, the router shows only the routes
for exactly that prefix.
```

```{opcmd} show ipv6 route \<prefix\> longer-prefixes

**Show the IPv6 routes for the specified prefix and for all more specific
prefixes within it.**
```

```{opcmd} show ipv6 route forward

**Show the IPv6 routes in the kernel's main routing table.**
```

```{opcmd} show ipv6 route forward \<address | prefix\>

**Show the IPv6 routes in the kernel's main routing table that exactly
match the specified address or prefix.**
```

```{opcmd} show ipv6 route summary

**Show the number of IPv6 routes from each source.**

For each source, the output shows the number of routes in the RIB and
the number of those routes installed in the FIB. BGP routes are counted
separately for eBGP and iBGP.
```

```{opcmd} show ipv6 route summary table \<tableid\>

**Show the number of IPv6 routes from each source in the specified
routing table.**
```

```{opcmd} show ipv6 route table \<tableid\>

**Show the IPv6 routes in the specified routing table.**
```

```{opcmd} show ipv6 route tag \<tag\>

**Show the IPv6 routes with the specified tag.**
```

```{opcmd} show ipv6 route vrf \<name | all\>

**Show the IPv6 routes in the RIB of the specified VRF, or of all VRFs.**
```

```{opcmd} show ipv6 route vrf \<name | all\> \<connected | static | kernel | bgp | ospfv3 | ripng | isis\>

**Show the IPv6 routes from the given source in the specified VRF, or
in all VRFs.**
```

```{opcmd} show ipv6 route vrf \<name | all\> \<address | prefix\>

**Show the IPv6 routes for the given address or prefix in the
specified VRF, or in all VRFs.**
```

```{opcmd} show ipv6 route vrf \<name | all\> \<prefix\> longer-prefixes

**Show the IPv6 routes for the specified prefix and for all more
specific prefixes within it in the specified VRF, or in all VRFs.**
```

```{opcmd} show ipv6 route vrf \<name | all\> summary

**Show the number of IPv6 routes from each source in the specified
VRF, or in all VRFs.**

For each source, the output shows the number of routes in the RIB and
the number of those routes installed in the FIB. BGP routes are counted
separately for eBGP and iBGP.
```

```{opcmd} show ipv6 route vrf \<name | all\> tag \<tag\>

**Show the IPv6 routes with the specified tag in the specified VRF, or
in all VRFs.**
```

```{opcmd} show ipv6 prefix-list

**Show all IPv6 prefix lists configured on the router.**
```

```{opcmd} show ipv6 prefix-list \<name\>

**Show the specified IPv6 prefix list.**
```

```{opcmd} show ipv6 prefix-list detail

**Show all IPv6 prefix lists configured on the router, with details
for each list and each entry.**
```

```{opcmd} show ipv6 prefix-list detail \<name\>

**Show the specified IPv6 prefix list, with details for the list and
each entry.**
```

```{opcmd} show ipv6 prefix-list summary

**Show all IPv6 prefix lists configured on the router, with the entry
count and sequence range of each list but without the entries.**
```

```{opcmd} show ipv6 prefix-list summary \<name\>

**Show the specified IPv6 prefix list, with its entry count and
sequence range but without the entries.**
```

```{opcmd} show ipv6 prefix-list \<name\> \<prefix\>

**Show the entry of the specified IPv6 prefix list that matches the
specified prefix.**
```

```{opcmd} show ipv6 prefix-list \<name\> \<prefix\> first-match

**Show the first entry of the specified IPv6 prefix list that matches
the specified prefix.**
```

```{opcmd} show ipv6 prefix-list \<name\> \<prefix\> longer

**Show the entries of the specified IPv6 prefix list whose prefix is
equal to or more specific than the specified prefix.**
```

```{opcmd} show ipv6 prefix-list \<name\> seq \<number\>

**Show the entry with the given sequence number in the specified IPv6
prefix list.**
```

```{opcmd} show ipv6 access-list

**Show all IPv6 access lists configured on the router.**
```

```{opcmd} show ipv6 access-list \<name\>

**Show the specified IPv6 access list.**
```

### Reset

```{opcmd} reset ipv6 neighbors address \<address\>

**Reset the neighbor cache entry for the specified IPv6 address.**
```

```{opcmd} reset ipv6 neighbors interface \<interface\>

**Reset the neighbor cache entries on the specified interface.**
```

```{opcmd} reset ipv6 route cache

**Reset the entire IPv6 kernel route cache.**
```

```{opcmd} reset ipv6 route cache \<address | prefix\>

**Reset the IPv6 kernel route cache entries for the specified address
or prefix.**
```

### Clear

```{opcmd} clear ipv6 prefix-list

**Reset the hit counts of all entries in all IPv6 prefix lists.**
```

```{opcmd} clear ipv6 prefix-list \<name\>

**Reset the hit counts of all entries in the specified IPv6 prefix
list.**
```

```{opcmd} clear ipv6 prefix-list \<name\> \<prefix\>

**Reset the hit counts of the entries in the specified IPv6 prefix list
whose prefix is equal to or less specific than the specified prefix.**
```
