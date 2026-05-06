# Static

Static routes are manually configured routes, which, in general, cannot be
updated dynamically from information VyOS learns about the network topology from
other routing protocols. However, if a link fails, the router will remove
routes, including static routes, from the `RIPB (Routing Information
Base)` that used this interface to reach the next hop. In general, static
routes should only be used for very simple network topologies, or to override
the behavior of a dynamic routing protocol for a small number of routes. The
collection of all routes the router has learned from its configuration or from
its dynamic routing protocols is stored in the RIB. Unicast routes are directly
used to determine the forwarding table used for unicast packet forwarding.

## IPv4 Unicast Routes

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\>

Configure next-hop <span class="title-ref">\<address\></span> for an IPv4 static route. Multiple static
routes can be created.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\> disable

Disable this IPv4 static route entry.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\>
distance \<distance\>

Defines next-hop distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

Range is 1 to 255, default is 1.

<div class="note">

<div class="title">

Note

</div>

Routes with a distance of 255 are effectively disabled and not
installed into the kernel.

</div>

</div>

### IPv4 Interface Routes

<div class="cfgcmd">

set protocols static route \<subnet\> interface
\<interface\>

Allows you to configure the next-hop interface for an interface-based IPv4
static route. <span class="title-ref">\<interface\></span> will be the next-hop interface where traffic is
routed for the given <span class="title-ref">\<subnet\></span>.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> interface
\<interface\> disable

Disables interface-based IPv4 static route.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> interface
\<interface\> distance \<distance\>

Defines next-hop distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

Range is 1 to 255, default is 1.

</div>

### IPv4 BFD

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\> bfd

Configure a static route for <span class="title-ref">\<subnet\></span> using gateway <span class="title-ref">\<address\></span> and use the
gateway address as BFD peer destination address.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\>
bfd profile \<profile\>

Configure a static route for <span class="title-ref">\<subnet\></span> using gateway <span class="title-ref">\<address\></span>
and use the gateway address as BFD peer destination address with
BFD profile <span class="title-ref">\<profile\></span>.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\> bfd multi-hop
source-address \<source-address\>

Configure a static route for <span class="title-ref">\<subnet\></span> using gateway <span class="title-ref">\<address\></span> and use the
gateway address as BFD peer destination address with source address
<span class="title-ref">\<source\></span> but initiate a multi-hop session.

</div>

### DHCP Interface Routes

<div class="cfgcmd">

set protocols static route \<subnet\> dhcp-interface \<interface\>

Defines route with DHCP interface supplying next-hop IP address.

</div>

### IPv4 Reject Routes

<div class="cfgcmd">

set protocol static route \<subnet\> reject

Defines route which emits an ICMP unreachable when matched.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> reject distance \<distance\>

Defines distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> reject tag \<tag\>

Sets a tag for this route.

</div>

<div class="cfgcmd">

set protocol static route6 \<subnet\> reject

Defines route which emits an ICMP unreachable when matched.

</div>

### IPv4 Blackhole Routes

<div class="cfgcmd">

set protocols static route \<subnet\> blackhole

Use this command to configure a "black-hole" route on the router. A
black-hole route is a route for which the system silently discard packets
that are matched. This prevents networks leaking out public interfaces, but
it does not prevent them from being used as a more specific route inside your
network.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> blackhole distance \<distance\>

Defines blackhole distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> blackhole tag \<tag\>

Sets a tag for this route.

</div>

## IPv6 Unicast Routes

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\>

Configure next-hop <span class="title-ref">\<address\></span> for an IPv6 static route. Multiple static
routes can be created.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\> disable

Disable this IPv6 static route entry.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\>
distance \<distance\>

Defines next-hop distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

Range is 1 to 255, default is 1.

<div class="note">

<div class="title">

Note

</div>

Routes with a distance of 255 are effectively disabled and not
installed into the kernel.

</div>

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\>
segments \<segments\>

It is possible to specify a static route for ipv6 prefixes using
an SRv6 segments instruction. The <span class="title-ref">/</span> separator can be used to
specify multiple segment instructions.

Example:

``` none
set protocols static route6 2001:db8:1000::/36 next-hop 2001:db8:201::ffff segments '2001:db8:aaaa::7/2002::4/2002::3/2002::2'
```

``` none
vyos@vyos:~$ show ipv6 route
Codes: K - kernel route, C - connected, S - static, R - RIPng,
      O - OSPFv3, I - IS-IS, B - BGP, N - NHRP, T - Table,
      v - VNC, V - VNC-Direct, A - Babel, F - PBR,
      f - OpenFabric,
      > - selected route, * - FIB route, q - queued, r - rejected, b - backup
      t - trapped, o - offload failure
C>* 2001:db8:201::/64 is directly connected, eth0.201, 00:00:46
S>* 2001:db8:1000::/36 [1/0] via 2001:db8:201::ffff, eth0.201, seg6 2001:db8:aaaa::7,2002::4,2002::3,2002::2, weight 1, 00:00:08
```

</div>

### IPv6 Interface Routes

<div class="cfgcmd">

set protocols static route6 \<subnet\> interface
\<interface\>

Allows you to configure the next-hop interface for an interface-based IPv6
static route. <span class="title-ref">\<interface\></span> will be the next-hop interface where traffic is
routed for the given <span class="title-ref">\<subnet\></span>.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> interface
\<interface\> disable

Disables interface-based IPv6 static route.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> interface
\<interface\> distance \<distance\>

Defines next-hop distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

Range is 1 to 255, default is 1.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> interface
\<interface\> segments \<segments\>

It is possible to specify a static route for ipv6 prefixes using
an SRv6 segments instruction. The <span class="title-ref">/</span> separator can be used to
specify multiple segment instructions.

Example:

``` none
set protocols static route6 2001:db8:1000::/36 interface eth0 segments '2001:db8:aaaa::7/2002::4/2002::3/2002::2'
```

</div>

### IPv6 BFD

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\> bfd

Configure a static route for <span class="title-ref">\<subnet\></span> using gateway <span class="title-ref">\<address\></span> and use the
gateway address as BFD peer destination address.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\>
bfd profile \<profile\>

Configure a static route for <span class="title-ref">\<subnet\></span> using gateway <span class="title-ref">\<address\></span>
and use the gateway address as BFD peer destination address with
BFD profile <span class="title-ref">\<profile\></span>.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\>
bfd multi-hop source-address \<source\>

Configure a static route for <span class="title-ref">\<subnet\></span> using gateway <span class="title-ref">\<address\></span> and use the
gateway address as BFD peer destination address with source address
<span class="title-ref">\<source\></span> but initiate a multi-hop session.

</div>

### IPv6 Reject Routes

<div class="cfgcmd">

set protocol static route6 \<subnet\> reject

Defines route which emits an ICMP unreachable when matched.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> reject distance \<distance\>

Defines distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> reject tag \<tag\>

Sets a tag for this route.

</div>

### IPv6 Blackhole Routes

<div class="cfgcmd">

set protocols static route6 \<subnet\> blackhole

Use this command to configure a "black-hole" route on the router. A
black-hole route is a route for which the system silently discard packets
that are matched. This prevents networks leaking out public interfaces, but
it does not prevent them from being used as a more specific route inside your
network.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> blackhole distance \<distance\>

Defines blackhole distance for this route, routes with smaller administrative
distance are elected prior to those with a higher distance.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> blackhole tag \<tag\>

Sets a tag for this route.

</div>

## Alternate Routing Tables

Alternate routing tables are used with policy based routing by utilizing
`vrf`.
