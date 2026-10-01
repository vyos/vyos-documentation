---
lastproofread: '2026-09-30'
---

# Route Map Policy

Route maps are ordered rules used to filter routes and change route attributes.
Each rule has a sequence number and a `permit` or `deny` action. A rule without
match conditions matches every route. If no rule matches, the route map denies
the route by default. A matching `permit` rule applies its `set` actions and
ends processing unless its exit action continues to another rule. A matching
`deny` rule rejects the route. The optional `call` action invokes another
route map; a deny result from that map rejects the route. See the
[FRR Route Maps manual](https://docs.frrouting.org/en/stable-10.6/routemap.html)
for route-map evaluation semantics.

## Configuration

### Route Map

```{cfgcmd} set policy route-map \<text\>

Create a route-map policy identified by its name.
```


```{cfgcmd} set policy route-map \<text\> description \<text\>

Set description for the route-map policy.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> action \<permit|deny\>

Set action for the route-map policy.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> call \<text\>

Call another route map after this rule matches. If the called route map denies
the route, processing ends and the route is denied.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> continue \<1-65535\>

Jump to a different rule in this route-map on a match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> description \<text\>

Set description for the rule in the route-map policy.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match as-path \<text\>

BGP as-path list to match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match community community-list \<text\>

BGP community-list to match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match community exact-match

Set BGP community-list to exactly match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match extcommunity \<text\>

BGP extended community to match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match evpn default-route

Match an EVPN type-5 default route.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match evpn rd \<ASN:NN_OR_IP-ADDRESS:NN\>

Match the EVPN route distinguisher.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match evpn route-type \<1|2|3|4|5|ead|macip|multicast|es|prefix\>

Match the EVPN route type.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match interface \<text\>

First hop interface of a route to match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip address access-list \<1-99|100-199|1300-1999|2000-2699\>

Match the route prefix against an IPv4 access list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip address prefix-list \<text\>

IP address of route to match, based on prefix-list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip address prefix-len \<0-32\>

Match the prefix length of a kernel route. Do not use this match for routes
learned from dynamic routing protocols.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip nexthop access-list \<1-99|100-199|1300-1999|2000-2699\>

Match the IPv4 next hop against an access list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip nexthop address \<x.x.x.x\>

IP next-hop of route to match, based on ip address.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip nexthop prefix-len \<0-32\>

IP next-hop of route to match, based on prefix length.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip nexthop prefix-list \<text\>

IP next-hop of route to match, based on prefix-list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip nexthop type \<blackhole\>

IP next-hop of route to match, based on type.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip route-source access-list \<1-99|100-199|1300-1999|2000-2699\>

Match the route's advertising source address against an IPv4 access list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ip route-source prefix-list \<text\>

IP route source of route to match, based on prefix-list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ipv6 address access-list \<text\>

IPv6 address of route to match, based on IPv6 access-list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ipv6 address prefix-list \<text\>

IPv6 address of route to match, based on IPv6 prefix-list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ipv6 address prefix-len \<0-128\>

Match the prefix length of a kernel route. Do not use this match for routes
learned from dynamic routing protocols.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ipv6 nexthop address \<h:h:h:h:h:h:h:h\>

Match the IPv6 next hop by address.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ipv6 nexthop access-list \<text\>

Match the IPv6 next hop against an IPv6 access list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ipv6 nexthop prefix-list \<text\>

Match the IPv6 next hop against an IPv6 prefix list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match ipv6 nexthop type \<blackhole\>

Match an IPv6 blackhole next hop.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match large-community large-community-list \<text\>

Match BGP large communities.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match local-preference \<0-4294967295\>

Match local preference.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match metric \<1-65535\>

Match route metric.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match origin \<egp|igp|incomplete\>

Border Gateway Protocol (BGP) origin code to match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match peer \<ipv4|ipv6\>

Match the peer's IPv4 or IPv6 address.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match source-peer \<peer\>

Match the BGP source peer by address, interface name, or peer-group name.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match protocol \<protocol\>

Match the protocol through which the route was learned. Supported values are
`babel`, `bgp`, `connected`, `isis`, `kernel`, `ospf`, `ospfv3`, `rip`,
`ripng`, `static`, `table`, and `vnc`.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match rpki \<invalid|notfound|valid\>

Match RPKI validation result.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match rpki-extcommunity \<invalid|notfound|valid\>

Match the RPKI origin-validation state carried in the route's extended
community.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match source-vrf \<text\>

Source VRF to match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> match tag \<1-65535\>

Route tag to match.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> on-match goto \<1-65535\>

On a match, continue at the first rule whose sequence number is greater than or
equal to the specified number.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> on-match next

On a match, continue at the next rule in sequence.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set aggregator \<as|ip\> \<1-4294967295|x.x.x.x\>

BGP aggregator attribute: AS number or IP address of an aggregation.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set as-path exclude \<1-4294967295 | all\>

Remove the specified AS number from the BGP AS path.

Use `all` to remove every AS number from the AS path.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set as-path prepend \<1-4294967295\>

Prepend the given string of AS numbers to the AS_PATH of the BGP path's NLRI.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set as-path prepend-last-as \<n\>

Prepend the last AS number in the AS_PATH the specified number of times
(1 to 10).
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set atomic-aggregate

BGP atomic aggregate attribute.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set community \<add|replace\> \<community\>

Add or replace BGP community attribute in format ``<0-65535:0-65535>``
or from well-known community list
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set community none

Delete all BGP communities
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set community delete \<text\>

Delete BGP communities matching the community-list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set large-community \<add|replace\> \<GA:LD1:LD2\>

Add or replace BGP large-community values in `GA:LD1:LD2` format, with each
field ranging from 0 to 4294967295.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set large-community none

Delete all BGP large-communities
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set large-community delete \<text\>

Delete BGP large communities that match the large-community list.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set extcommunity bandwidth \<1-25600|cumulative|num-multipaths\>

Set extcommunity bandwidth
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set extcommunity bandwidth-non-transitive

The link bandwidth extended community is encoded as non-transitive
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set extcommunity rt \<text\>

Set route target value in format ``<0-65535:0-4294967295>`` or ``<IP:0-65535>``.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set extcommunity soo \<text\>

Set site of origin value in format ``<0-65535:0-4294967295>`` or ``<IP:0-65535>``.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set extcommunity none

Clear all BGP extcommunities.
```


```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set distance \<0-255\>

Locally significant administrative distance.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set evpn gateway \<ipv4|ipv6\> \<address\>

Set the gateway address for an EVPN prefix advertisement route.
```

```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set ip-next-hop \<x.x.x.x\>

Nexthop IP address.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set ip-next-hop unchanged

Set the next-hop as unchanged. Pass through the route-map without
changing its value
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set ip-next-hop peer-address

Set the BGP nexthop address to the address of the peer. For an incoming
route-map this means the ip address of our peer is used. For an
outgoing route-map this means the ip address of our self is used to
establish the peering with our neighbor.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set ipv6-next-hop \<global|local\> \<h:h:h:h:h:h:h:h\>

Nexthop IPv6 address.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set ipv6-next-hop peer-address

Set the BGP nexthop address to the address of the peer. For an incoming
route-map this means the ip address of our peer is used. For an
outgoing route-map this means the ip address of our self is used to
establish the peering with our neighbor.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set ipv6-next-hop prefer-global

For incoming or import route maps, prefer the global IPv6 address when a route
has both a global and a link-local next hop.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set local-preference \<0-4294967295\>

Set BGP local preference attribute.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set metric \<+/-metric|0-4294967295|rtt|+rtt|-rtt\>

Set the route metric. When used with BGP, set the BGP attribute MED
to a specific value. Use ``+/-`` to add or subtract the specified value
to/from the existing/MED. Use ``rtt`` to set the MED to the round trip
time or ``+rtt/-rtt`` to add/subtract the round trip time to/from the MED.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set metric-type \<type-1|type-2\>

Set OSPF external metric-type.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set origin \<igp|egp|incomplete\>

Set BGP origin code.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set originator-id \<x.x.x.x\>

Set BGP originator ID attribute.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set src \<x.x.x.x|h:h:h:h:h:h:h:h\>

Set source IP/IPv6 address for route.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set table \<1-4294967295\>

Set the routing table for the matched routes.
```

```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set l3vpn-nexthop encapsulation gre

Accept L3VPN traffic over GRE encapsulation. This option is for BGP route maps.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set tag \<1-65535\>

Set tag value for routing protocol.
```
```{cfgcmd} set policy route-map \<text\> rule \<1-65535\> set weight \<0-4294967295\>

Set the BGP weight attribute.
```

### List of well-known communities

- `local-as`: `NO_EXPORT_SUBCONFED` (`0xFFFFFF03`)
- `no-advertise`: `NO_ADVERTISE` (`0xFFFFFF02`)
- `no-export`: `NO_EXPORT` (`0xFFFFFF01`)
- `graceful-shutdown`: `GRACEFUL_SHUTDOWN` (`0xFFFF0000`)
- `accept-own`: `ACCEPT_OWN` (`0xFFFF0001`)
- `route-filter-translated-v4`: `ROUTE_FILTER_TRANSLATED_v4` (`0xFFFF0002`)
- `route-filter-v4`: `ROUTE_FILTER_v4` (`0xFFFF0003`)
- `route-filter-translated-v6`: `ROUTE_FILTER_TRANSLATED_v6` (`0xFFFF0004`)
- `route-filter-v6`: `ROUTE_FILTER_v6` (`0xFFFF0005`)
- `llgr-stale`: `LLGR_STALE` (`0xFFFF0006`)
- `no-llgr`: `NO_LLGR` (`0xFFFF0007`)
- `accept-own-nexthop`: `accept-own-nexthop` (`0xFFFF0008`)
- `blackhole`: `BLACKHOLE` (`0xFFFF029A`)
- `no-peer`: `NOPEER` (`0xFFFFFF04`)
