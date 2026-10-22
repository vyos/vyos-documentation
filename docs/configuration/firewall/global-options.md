---
myst:
  html_meta:
    description: |
      Firewall global options are firewall settings that apply
      system-wide, covering ICMP handling, directed broadcast forwarding,
      source routing, martian packet logging, source validation, TCP
      behavior, bridged traffic, the global state policy, connection
      tracking timeouts, and the GeoIP databases.
    keywords: firewall, global options, state policy, connection tracking
---

(firewall-global-options)=

# Firewall global options

Firewall global options are firewall settings that apply system-wide.
They let you configure ICMP echo and redirect handling, directed broadcast
forwarding, source routing, martian packet logging, source validation,
TCP behavior, bridged traffic processing, the global state policy,
connection tracking timeouts, domain name resolution, and the GeoIP
databases.

## Configuration

### ICMP echo requests

```{cfgcmd} set firewall global-options all-ping \<enable | disable\>

**Configure whether the router responds to IPv4 ICMP echo requests sent
to it.**

- `disable`: The router ignores all IPv4 ICMP echo requests, even if the
  firewall accepts them.
- `enable`: The router responds to IPv4 ICMP unicast echo requests,
  unless the firewall drops or rejects them first. The router responds to
  echo requests sent to it via a broadcast or multicast address only if
  `broadcast-ping` is also `enable`.

Forwarded echo requests and ICMPv6 echo requests are not affected.

The default is `enable`.
```

Example:

```none
set firewall global-options all-ping disable
```

```{cfgcmd} set firewall global-options broadcast-ping \<enable | disable\>

**Configure whether the router responds to IPv4 ICMP echo and timestamp
requests sent to it via a broadcast or multicast address.**

- `disable`: The router ignores echo and timestamp requests, even if the
  firewall accepts them.
- `enable`: The router responds to timestamp requests, unless the
  firewall drops or rejects them first. The router responds to echo
  requests only if `all-ping` is also `enable` and the firewall does not
  drop or reject them first.

Unicast requests, forwarded requests, and ICMPv6 requests are not
affected.

The default is `disable`.
```

Example:

```none
set firewall global-options broadcast-ping enable
```

### Directed broadcast

```{cfgcmd} set firewall global-options directed-broadcast \<enable | disable\>

**Configure whether the router forwards IPv4 directed broadcast
packets.**

A directed broadcast packet is an IPv4 packet addressed to all hosts of a
specific network ([RFC 2644](https://datatracker.ietf.org/doc/html/rfc2644)).

- `disable`: The router does not forward directed broadcast packets, even
  if the interface on which it receives them has
  `ip enable-directed-broadcast` set.
- `enable`: The router forwards directed broadcast packets only if the
  interface on which it receives them has `ip enable-directed-broadcast`
  set.

The default is `enable`.
```

Example:

```none
set firewall global-options directed-broadcast enable
```

### Bridged traffic

```{cfgcmd} set firewall global-options apply-to-bridged-traffic ipv4

**Evaluate IPv4 packets that a bridge forwards between its member
interfaces against the rules that apply to routed IPv4 traffic.**

These rules include the `firewall ipv4 prerouting` and
`firewall ipv4 forward` rules, and the NAT, policy route, and connection
tracking rules. When unset, the firewall does not evaluate these packets
against these rules.
```

Example:

```none
set firewall global-options apply-to-bridged-traffic ipv4
```

```{cfgcmd} set firewall global-options apply-to-bridged-traffic ipv6

**Evaluate IPv6 packets that a bridge forwards between its member
interfaces against the rules that apply to routed IPv6 traffic.**

These rules include the `firewall ipv6 prerouting` and
`firewall ipv6 forward` rules, and the NAT66, policy route6, and
connection tracking rules. When unset, the firewall does not evaluate
these packets against these rules.
```

Example:

```none
set firewall global-options apply-to-bridged-traffic ipv6
```

```{cfgcmd} set firewall global-options apply-to-bridged-traffic accept-invalid ethernet-type \<arp | dhcp | pppoe | 802.1q | 802.1ad | pppoe-discovery | wol\>

**Accept packets of the specified type that the router sends through a
bridge, even if connection tracking classifies them as invalid.**

The accepted packets are not evaluated by the global state policy or the
`firewall bridge output` rules.

Repeat the command to accept multiple packet types.

- `arp`: {abbr}`ARP (Address Resolution Protocol)` packets (Ethernet type
  0x0806).
- `dhcp`: DHCP packets, matched by UDP source port 67 and destination
  port 68.
- `pppoe`: {abbr}`PPPoE (Point-to-Point Protocol over Ethernet)` session
  packets (Ethernet type 0x8864).
- `pppoe-discovery`: PPPoE discovery packets (Ethernet type 0x8863).
- `802.1q`: packets with Ethernet type 0x8100.
- `802.1ad`: packets with Ethernet type 0x88A8.
- `wol`: Wake-on-LAN packets (Ethernet type 0x0842).

Packets that a bridge receives or forwards are not affected.
```

Example:

```none
set firewall global-options apply-to-bridged-traffic accept-invalid ethernet-type arp
set firewall global-options apply-to-bridged-traffic accept-invalid ethernet-type dhcp
```

### Source routing

```{cfgcmd} set firewall global-options ip-src-route \<enable | disable\>

**Configure whether the router accepts IPv4 packets that carry a source
route option.**

Source route options (Loose and Strict Source and Record Route) are
defined in
[RFC 791, §3.1](https://datatracker.ietf.org/doc/html/rfc791#section-3.1).

- `disable`: The router drops IPv4 packets that carry a source route
  option.
- `enable`: The router accepts these packets and processes the source
  route option.

When `log-martians` is also `enable`, the router logs the dropped packets
within its logging limit (see `log-martians`).

The default is `disable`.
```

Example:

```none
set firewall global-options ip-src-route enable
```

```{cfgcmd} set firewall global-options ipv6-src-route \<enable | disable\>

**Configure whether the router accepts IPv6 packets that carry a Type 2
Routing header.**

The Type 2 Routing header is used by Mobile IPv6
([RFC 6275, §6.4](https://datatracker.ietf.org/doc/html/rfc6275#section-6.4)).

- `disable`: The router rejects these packets.
- `enable`: The router accepts these packets and processes the header.

This applies to packets addressed to the router. IPv6 packets that carry
other Routing header types are not affected.

The default is `disable`.
```

Example:

```none
set firewall global-options ipv6-src-route enable
```

### ICMP redirects

```{cfgcmd} set firewall global-options receive-redirects \<enable | disable\>

**Configure whether the router accepts IPv4 ICMP Redirect messages.**

- `disable`: The router ignores ICMP Redirect messages.
- `enable`: The router accepts valid ICMP Redirect messages and uses the
  gateway that a message advises as the next hop for the destination.

When `log-martians` is also `enable`, the router logs rejected ICMP
Redirect messages within its logging limit (see `log-martians`).

The default is `disable`.
```

Example:

```none
set firewall global-options receive-redirects enable
```

```{cfgcmd} set firewall global-options ipv6-receive-redirects \<enable | disable\>

**Configure whether the router accepts ICMPv6 Redirect messages.**

- `disable`: The router ignores ICMPv6 Redirect messages.
- `enable`: The router accepts valid ICMPv6 Redirect messages only on
  interfaces where IPv6 forwarding is disabled, and uses the target that a
  message advises as the next hop for the destination.

The default is `disable`.
```

Example:

```none
set firewall global-options ipv6-receive-redirects enable
```

```{cfgcmd} set firewall global-options send-redirects \<enable | disable\>

**Configure whether the router sends IPv4 ICMP Redirect messages.**

- `disable`: The router does not send ICMP Redirect messages.
- `enable`: The router sends a packet's sender an ICMP Redirect when it routes
  the packet back out of the receiving interface to a next hop on the sender's
  subnet.

The router stops sending ICMP Redirect messages to a sender that keeps ignoring
them. When `log-martians` is also `enable`, the router logs a message when it
stops (see `log-martians`).

The default is `enable`.
```

Example:

```none
set firewall global-options send-redirects disable
```

### Martian packets

```{cfgcmd} set firewall global-options log-martians \<enable | disable\>

**Configure whether the router logs IPv4 packets with an impossible
source or destination address (martian packets), and related events.**

- `disable`: The router does not log these events.
- `enable`: The router logs a message for each of the following events:

  - A packet has an impossible IPv4 source or destination address.
  - A packet carries a source route option, and the router drops it (see
    `ip-src-route`).
  - An ICMP Redirect message arrives, and the router rejects it (see
    `receive-redirects`).
  - A host keeps ignoring the ICMP Redirect messages that the router sends
    (see `send-redirects`).

  If events occur faster than the router's logging limit, it discards the
  excess messages.

The default is `enable`.
```

Example:

```none
set firewall global-options log-martians disable
```

### Source validation

```{cfgcmd} set firewall global-options source-validation \<strict | loose | disable\>

**Configure whether the firewall drops IPv4 packets whose source address
fails a {abbr}`RPF (Reverse Path Forwarding)` check, as described in
[RFC 3704](https://datatracker.ietf.org/doc/html/rfc3704).**

- `strict`: Strict RPF
  ([RFC 3704, §2.2](https://datatracker.ietf.org/doc/html/rfc3704#section-2.2)).
  The firewall drops a packet unless a route to its source address points
  out of the interface on which the packet arrived.
- `loose`: Loose RPF
  ([RFC 3704, §2.4](https://datatracker.ietf.org/doc/html/rfc3704#section-2.4)).
  The firewall drops a packet if no route to its source address exists. A
  default route counts as a route.
- `disable`: The firewall does not validate source addresses.

In `strict` and `loose` mode, the firewall does not check:

- Packets that arrive on the loopback interface.
- Packets with source address 0.0.0.0 and with destination address either
  255.255.255.255 or a multicast address from 224.0.0.0 to 224.0.0.255.

For packets that arrive on an interface with its own `ip source-validation`
set to `strict` or `loose`, the firewall uses that mode instead.

The default is `disable`.
```

Example:

```none
set firewall global-options source-validation strict
```

```{cfgcmd} set firewall global-options ipv6-source-validation \<strict | loose | disable\>

**Configure whether the firewall drops IPv6 packets whose source address
fails an RPF check, as described in
[RFC 3704](https://datatracker.ietf.org/doc/html/rfc3704).**

- `strict`: Strict RPF
  ([RFC 3704, §2.2](https://datatracker.ietf.org/doc/html/rfc3704#section-2.2)).
  The firewall drops a packet unless a route to its source address points
  out of the interface on which the packet arrived.
- `loose`: Loose RPF
  ([RFC 3704, §2.4](https://datatracker.ietf.org/doc/html/rfc3704#section-2.4)).
  The firewall drops a packet if no route to its source address exists. A
  default route counts as a route.
- `disable`: The firewall does not validate source addresses.

In `strict` and `loose` mode, the firewall does not check:

- Packets that arrive on the loopback interface.
- ICMPv6 packets with source address :: and with destination address
  either a link-local unicast address or a multicast address with
  link-local scope.

For packets that arrive on an interface with its own
`ipv6 source-validation` set to `strict` or `loose`, the firewall uses
that mode instead.

The default is `disable`.
```

Example:

```none
set firewall global-options ipv6-source-validation strict
```

### TCP

```{cfgcmd} set firewall global-options syn-cookies \<enable | disable\>

**Configure how the router handles TCP connection requests that arrive
while the queue of pending requests of a service that listens on the
router is full.**

- `enable`: The router answers such requests with a SYN cookie and keeps
  no state for them.
- `disable`: The router drops such requests.

This option applies to connection requests over both IPv4 and IPv6.

The default is `enable`.
```

Example:

```none
set firewall global-options syn-cookies disable
```

```{cfgcmd} set firewall global-options twa-hazards-protection \<enable | disable\>

**Configure protection against {abbr}`TWA (TIME-WAIT Assassination)`, the
premature end of the TIME-WAIT state of a TCP connection by an RST
segment, as described in
[RFC 1337, §1](https://datatracker.ietf.org/doc/html/rfc1337#section-1).**

- `enable`: The router ignores an RST segment that arrives for a
  connection in the TIME-WAIT state.
- `disable`: The router ends the TIME-WAIT state of the connection when
  such an RST segment arrives.

The router acts only on an RST segment whose sequence number is the next
one it expects, and ignores other RST segments in both cases. This applies
to TCP over both IPv4 and IPv6.

The default is `disable`.
```

Example:

```none
set firewall global-options twa-hazards-protection enable
```

### Global state policy

The firewall applies the global state policy at the input, forward, and
output processing points of the IP layer and the Bridge layer, and at the
zone-based firewall's input, forward, and output processing points, before
the rules of those processing points. A packet that matches a state with
an `accept`, `drop`, or `reject` action is not evaluated by the rules of
that processing point.

If connection tracking is disabled with `disable-conntrack` while a global
state policy exists, the commit prints a warning.

```{cfgcmd} set firewall global-options state-policy \<established | invalid | related\> action \<accept | drop | reject\>

**Configure the action that the global state policy applies to packets in
the specified connection tracking state.**

- `accept`: The firewall accepts such packets.
- `drop`: The firewall drops such packets.
- `reject`: The firewall rejects such packets. At the Bridge layer, the
  firewall drops them instead.

The states are:

- `established`: Packets of an established connection, in either
  direction.
- `related`: Packets that start a connection related to an existing
  connection, and ICMP error messages about a connection.
- `invalid`: Packets that connection tracking cannot associate with a
  connection.
```

Example:

```none
set firewall global-options state-policy established action accept
set firewall global-options state-policy related action accept
set firewall global-options state-policy invalid action drop
```

```{cfgcmd} set firewall global-options state-policy \<established | invalid | related\> log

**Configure the firewall to log packets in the specified connection
tracking state that the global state policy processes.**

The firewall logs a message for each such packet. The message starts with
the prefix `[STATE-POLICY-<state>-<action>]`, where:

- `<state>` is `EST` for `established`, `INV` for `invalid`, or `REL` for
  `related`.
- `<action>` is `A` for `accept`, `D` for `drop`, or `R` for `reject`. At
  the Bridge layer, the firewall logs `reject` as `D`.

If no `action` is configured for the state, the firewall logs `A` as
`<action>`, but applies no action to the packet and continues processing
it.
```

Example:

```none
set firewall global-options state-policy invalid action drop
set firewall global-options state-policy invalid log
```

```{cfgcmd} set firewall global-options state-policy \<established | invalid | related\> log-level \<emerg | alert | crit | err | warn | notice | info | debug\>

**Configure the severity level of the log messages that the firewall
writes for packets in the specified connection tracking state.**

This option takes effect only if `log` is also configured for that state.
When no level is configured, the firewall logs the messages at the `warn`
level.
```

Example:

```none
set firewall global-options state-policy invalid action drop
set firewall global-options state-policy invalid log
set firewall global-options state-policy invalid log-level notice
```

```{cfgcmd} set firewall global-options state-policy offload offload-target \<name\>

**Configure the flowtable to which the firewall offloads forwarded
connections.**

When `offload-target` is configured, the firewall offloads a forwarded
connection at the `forward` processing point of the IP layer, before the
global state policy rules, once connection tracking classifies the
connection as established.

After a connection is offloaded, the firewall does not process the
subsequent packets of that connection at any processing point of the IP
layer.

The flowtable must be defined with `set firewall flowtable <name>`.
Otherwise, the commit fails.
```

Example:

```none
set firewall flowtable FT01 interface eth0
set firewall flowtable FT01 interface eth1
set firewall global-options state-policy offload offload-target FT01
```

### Connection tracking timeouts

Connection tracking tracks the state of each connection the router
receives, forwards, or generates, enabling the firewall to match packets
by the connection's current state. A connection stays tracked until it
times out after the router last receives or generates a packet of the
connection, in either direction.

The router applies a separate timeout to each protocol. For TCP and UDP,
it also applies a separate timeout to each tracked connection state.

The following commands configure connection tracking timeouts, in seconds.

```{cfgcmd} set firewall global-options timeout icmp \<1-21474836\>

**Configure the connection tracking timeout for IPv4 ICMP connections.**

This timeout does not apply to ICMPv6 connections.

The default is 30.
```

Example:

```none
set firewall global-options timeout icmp 60
```

```{cfgcmd} set firewall global-options timeout other \<1-21474836\>

**Configure the connection tracking timeout for connections of protocols
that have no timeout of their own.**

The default is 600.
```

Example:

```none
set firewall global-options timeout other 300
```

```{cfgcmd} set firewall global-options timeout tcp close \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
CLOSE state.**

The default is 10.
```

Example:

```none
set firewall global-options timeout tcp close 20
```

```{cfgcmd} set firewall global-options timeout tcp close-wait \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
CLOSE-WAIT state.**

The default is 60.
```

Example:

```none
set firewall global-options timeout tcp close-wait 30
```

```{cfgcmd} set firewall global-options timeout tcp established \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
ESTABLISHED state.**

The default is 432000 (5 days).
```

Example:

```none
set firewall global-options timeout tcp established 86400
```

```{cfgcmd} set firewall global-options timeout tcp fin-wait \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
FIN-WAIT state.**

The default is 120.
```

Example:

```none
set firewall global-options timeout tcp fin-wait 60
```

```{cfgcmd} set firewall global-options timeout tcp last-ack \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
LAST-ACK state.**

The default is 30.
```

Example:

```none
set firewall global-options timeout tcp last-ack 60
```

```{cfgcmd} set firewall global-options timeout tcp syn-recv \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
SYN-RECV state.**

The default is 60.
```

Example:

```none
set firewall global-options timeout tcp syn-recv 30
```

```{cfgcmd} set firewall global-options timeout tcp syn-sent \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
SYN-SENT state.**

The default is 120.
```

Example:

```none
set firewall global-options timeout tcp syn-sent 60
```

```{cfgcmd} set firewall global-options timeout tcp time-wait \<1-21474836\>

**Configure the connection tracking timeout for TCP connections in the
TIME-WAIT state.**

The default is 120.
```

Example:

```none
set firewall global-options timeout tcp time-wait 60
```

```{cfgcmd} set firewall global-options timeout udp other \<1-21474836\>

**Configure the connection tracking timeout for UDP connections with
traffic in one direction only.**

This timeout also applies to a connection with traffic in both directions
during the first two seconds of the connection.

The default is 30.
```

Example:

```none
set firewall global-options timeout udp other 60
```

```{cfgcmd} set firewall global-options timeout udp stream \<1-21474836\>

**Configure the connection tracking timeout for UDP connections with
traffic in both directions.**

This timeout applies once such a connection has been active for more than
two seconds. Until then, `timeout udp other` applies.

The default is 180.
```

Example:

```none
set firewall global-options timeout udp stream 300
```

### Domain name resolution

```{cfgcmd} set firewall global-options resolver-interval \<10-3600\>

**Configure the interval, in seconds, at which the router updates the IP
addresses of the domain names used in firewall rules, firewall domain groups,
and {abbr}`NAT (Network Address Translation)` rules.**

The router also uses this interval to update the address list of a firewall
remote group, unless the group has its own `interval` configured.
The default is 300.
```

Example:

```none
set firewall global-options resolver-interval 600
```

```{cfgcmd} set firewall global-options resolver-cache

**Retain the last successfully resolved addresses of a domain name if a later
attempt to resolve that domain name fails.**

The last successfully resolved addresses of each domain name are kept until the
router restarts or applies the firewall or NAT configuration.
This option applies to the domain names used in firewall rules, firewall domain
groups, and NAT rules.
Without this option, the router removes the addresses of a domain name that
fails to resolve from the rules and groups that use it until the name resolves
again.
```

Example:

```none
set firewall global-options resolver-cache
```

### GeoIP database

GeoIP databases map IP address ranges to country codes and
{abbr}`ASNs (Autonomous System Numbers)` for GeoIP matches. The router
downloads the databases every Monday at 04:30 and when `update geoip` is
run. The download fails unless a DNS server is configured with
`set system name-server`.

```{cfgcmd} set firewall global-options geoip provider \<db-ip | maxmind\>

**Configure the GeoIP database provider that supplies the IP address
ranges used for firewall GeoIP country-code and ASN matching.**

- `db-ip`: Uses the DB-IP Lite databases and requires no credentials.
- `maxmind`: Uses the MaxMind databases and requires both
  `maxmind-account-id` and `maxmind-license-key`. Otherwise, the commit
  fails.

The default is `db-ip`.
```

Example:

```none
set firewall global-options geoip provider maxmind
```

```{cfgcmd} set firewall global-options geoip maxmind-account-id \<id\>

**Configure the MaxMind account ID the router uses to authenticate when
downloading the MaxMind databases.**

Required when `provider` is `maxmind`. You must configure both
`maxmind-account-id` and `maxmind-license-key`. Otherwise, the commit
fails.
```

Example:

```none
set firewall global-options geoip maxmind-account-id 123456
```

```{cfgcmd} set firewall global-options geoip maxmind-license-key \<key\>

**Configure the MaxMind license key used to authenticate when downloading
the MaxMind databases.**

Required when `provider` is `maxmind`. You must configure both
`maxmind-account-id` and `maxmind-license-key`. Otherwise, the commit
fails.
```

Example:

```none
set firewall global-options geoip maxmind-license-key YOUR_LICENSE_KEY
```

```{cfgcmd} set firewall global-options geoip maxmind-lite

**Select the MaxMind GeoLite2 databases instead of the GeoIP2 databases as
the GeoIP data source.**

By default, the router downloads the GeoIP2 databases.

The command applies only when `provider` is `maxmind`. GeoLite2 still
requires `maxmind-account-id` and `maxmind-license-key`.
```

Example:

```none
set firewall global-options geoip maxmind-lite
```

```{cfgcmd} set firewall global-options geoip source-address \<address\>

**Configure the source address that the router uses to connect to the
GeoIP database provider when it downloads the GeoIP databases.**

The address can be IPv4 or IPv6 and must be assigned to a router
interface. Otherwise, the download fails.
```

Example:

```none
set firewall global-options geoip source-address 192.0.2.10
```

```{cfgcmd} set firewall global-options geoip vrf \<name\>

**Configure the {abbr}`VRF (Virtual Routing and Forwarding)` through which
the router downloads the GeoIP databases.**

The VRF must be configured. Otherwise, the download fails.
```

Example:

```none
set firewall global-options geoip vrf MGMT
```
