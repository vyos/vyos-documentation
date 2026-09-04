---
myst:
  html_meta:
    description: |
      NTP is a protocol that synchronizes a computer's clock to
      Coordinated Universal Time by obtaining the time from time sources
      over a network. A VyOS router can function as both an NTP client
      and an NTP server.
    keywords: ntp, utc, time synchronization, leap second, hardware timestamping
---

(ntp)=

# NTP

{abbr}`NTP (Network Time Protocol)` synchronizes a computer's clock to
Coordinated Universal Time (UTC) by obtaining the time from time sources
over a network.

NTP arranges time sources in a hierarchy. Top servers obtain time directly
from highly accurate hardware reference clocks, such as GPS receivers.
Lower-level servers synchronize with those above, and clients reside at the
bottom of the hierarchy.

A client usually synchronizes with multiple servers, regularly exchanging
time messages over {abbr}`UDP (User Datagram Protocol)` on port 123. Both
sides timestamp each exchange, allowing the client to distinguish network
delay from the actual clock difference. Typical accuracy is within a few
milliseconds over the Internet and tens of microseconds on a LAN.

A VyOS router can function as both an NTP client, synchronizing its clock
with upstream servers, and an NTP server, providing time synchronization to
clients.

```{note}
Since VyOS 1.4, the router responds to NTP client requests only from
addresses explicitly permitted with the `allow-client` directive.
Configurations upgraded from earlier releases continue accepting requests
from any client and operate as before. For new setups, if clients use a
VyOS installation as an NTP server, configure `allow-client`.
```

## Configuration

```{cfgcmd} set service ntp server \<address\>

**Configure an NTP server to use as a time source.**

The address can be specified as an IPv4 or IPv6 address, or as an
{abbr}`FQDN (Fully Qualified Domain Name)`.

Repeat the command to configure multiple servers.

By default, the system is preconfigured with three upstream NTP servers,
`time1.vyos.net`, `time2.vyos.net`, and `time3.vyos.net`, which can be
deleted and replaced with your own.
```

Example:

```none
set service ntp server time1.vyos.net
set service ntp server 192.0.2.1
```

```{cfgcmd} set service ntp server \<address\> \<noselect | nts | pool | prefer | ptp | interleave\>

**Configure per-server options for the specified NTP server:**

- `noselect`: Marks the server as unused. It is never selected for
  synchronization.
- `nts`: Authenticates time messages from the server using
  {abbr}`NTS (Network Time Security)` ({rfc}`8915`), so the router can
  detect replies that were forged or altered in transit. The keys are
  established automatically over TLS, so no shared key file is needed, and
  the server must support NTS.
- `pool`: Treats the configured name as a pool of NTP servers rather than
  a single server, using four of them as time sources, or fewer if fewer
  respond.
- `prefer`: Prefers this server over other selectable servers configured
  without the `prefer` option.
- `ptp`: Exchanges NTP packets encapsulated in
  {abbr}`PTP (Precision Time Protocol)` packets with this server (see
  {ref}`ptp-transport`). NTP over PTP must also be enabled for the NTP
  service on the router. Otherwise, the commit fails.
- `interleave`: Enables the NTP interleaved mode ({rfc}`9769`) for the
  server, which lets the server respond with more accurate transmit
  timestamps and can improve synchronization accuracy and stability when
  supported by both parties.
```

```{note}
Use an FQDN with the `pool` option. Resolving the name returns the
addresses of several servers, and the set behind the name may differ each
time it is resolved, as operators add and remove machines. An IP address
is also accepted, but it yields a single server, making the option
pointless.
```

Example:

```none
set service ntp server ntp.example.com nts
set service ntp server pool.example.com pool
```

```{cfgcmd} set service ntp listen-address \<address\>

**Configure a local IPv4 or IPv6 address on which the router listens for
incoming NTP requests.**

You can configure at most one IPv4 and one IPv6 address, using a separate
command for each. Configuring more than one address per address family
causes the commit to fail.

When unset, the router accepts incoming NTP requests on any local IP
address.
```

Example:

```none
set service ntp listen-address 192.0.2.1
set service ntp listen-address 2001:db8::1
```

```{cfgcmd} set service ntp interface \<interface\>

**Configure the interface on which the router listens for incoming NTP
requests.**

Only one interface can be configured. The router then accepts NTP requests
only on that interface, regardless of which local address they are sent to,
and this can be combined with `listen-address`.

The interface must either be configured in VyOS or detected by the kernel.
If a VRF is configured, the interface must belong to that VRF. Otherwise,
the commit fails.

When unset, the router accepts incoming NTP requests on any interface.
```

Example:

```none
set service ntp interface eth0
```

```{cfgcmd} set service ntp allow-client address \<address\>

**Permit the specified IPv4 or IPv6 address or prefix to use this router as
an NTP server.**

Repeat the command to permit multiple addresses or prefixes.

NTP requests from any address that is not permitted are not answered. When
no addresses are permitted, the router does not serve time to anyone and
acts purely as an NTP client.

The default configuration permits clients from the loopback, link-local,
and private (RFC 1918 and IPv6 unique-local) ranges, so devices on directly
attached private networks can use the router as their NTP server out of the
box. To serve clients outside these ranges, permit them explicitly.
```

Example:

```none
set service ntp allow-client address 192.0.2.0/24
set service ntp allow-client address 2001:db8::/32
```

```{cfgcmd} set service ntp source-address \<address\>

**Configure the local IPv4 or IPv6 address used as the source for outgoing
NTP requests.**

You can configure at most one IPv4 and one IPv6 address, using a separate
command for each. Configuring more than one address per address family
causes the commit to fail.

The address must already be assigned to an interface, otherwise the commit
fails. If a VRF is configured, the address must be assigned within that
VRF.

When unset, the source address is chosen by the routing table for each
request.
```

Example:

```none
set service ntp source-address 192.0.2.1
set service ntp source-address 2001:db8::1
```

```{cfgcmd} set service ntp source-interface \<interface\>

**Configure the interface used to send outgoing NTP requests.**

Only one interface can be configured. This binds the outgoing requests to
the interface itself rather than to an address.

The interface must either be configured in VyOS or detected by the kernel.
If a VRF is configured, the interface must belong to that VRF. Otherwise,
the commit fails.
```

Example:

```none
set service ntp source-interface eth1
```

```{cfgcmd} set service ntp vrf \<name\>

**Bind the NTP service to the specified
{abbr}`VRF (Virtual Routing and Forwarding)` instance.**

All NTP traffic (both synchronization with upstream servers and replies to
clients) is then sent and received within that VRF, so the upstream servers
must be reachable inside it.

The VRF must already be configured under `set vrf name <name>`.
```

Example:

```none
set service ntp vrf mgmt
```

```{cfgcmd} set service ntp leap-second \<ignore | smear | system | timezone\>

**Configure how the router handles leap seconds.**

A leap second is a one-second adjustment occasionally applied to UTC to
keep it close to mean solar time. Because a computer clock counts seconds
without a slot for the extra 23:59:60, it skips the leap second and is then
one second ahead of UTC. This setting determines how the router corrects
that one-second difference:

- `ignore`: No correction is applied when the leap second occurs. The clock
  is left one second ahead and corrected afterward through normal
  measurements.
- `smear`: The served time deliberately deviates from UTC while the
  one-second change is spread over approximately 17 hours. At any moment,
  the deviation shrinks too slowly for clients to notice a jump, and when
  the adjustment finishes, the served time matches UTC again. The router's
  own clock is also corrected gradually. If clients use multiple servers,
  all must smear the leap second identically, or their times disagree.
- `system`: The correction is applied at once, stepping the clock one
  second back at 00:00:00 UTC when a leap second is inserted, or one second
  forward at 23:59:59 UTC when one is deleted.
- `timezone`: The router obtains leap-second information from the system
  timezone database rather than relying solely on upstream servers. This
  provides correct leap information even when servers announce leap seconds
  late or not at all. The clock is corrected as in `system` mode. Do not
  use this mode with upstream servers that smear leap seconds.

The default is `timezone`.
```

Example:

```none
set service ntp leap-second smear
```

```{cfgcmd} set service ntp local-stratum \<1-15\>

**Enable local reference mode.**

In this mode, the router appears synchronized to its clients even when it
has never synchronized with an upstream server or has lost contact with all
its upstream servers.

The value is the stratum the router reports while the mode is active. The
stratum is the number of steps down the hierarchy from a reference clock,
so a higher value means a greater distance from real time. Set it higher
than the highest stratum expected in the network, so that clients prefer a
real time source whenever one is available.

When unset, the router reports itself as unsynchronized until it
synchronizes with an upstream server.
```

Example:

```none
set service ntp local-stratum 12
```

## Hardware timestamping of NTP packets

The router can leverage {abbr}`NIC (Network Interface Card)` capabilities
to timestamp packets as they are sent and received. This avoids the
packet-processing and queuing delays that affect software timestamps,
especially under heavy load.

When timestamping is enabled on an interface, the router by default
attempts the following options in the order they are specified and uses the
first one that the NIC supports:

- Timestamps only received NTP packets: supported by NICs that can
  timestamp NTP packets specifically.
- Timestamps all received packets: supported by NICs that can timestamp all
  packets but cannot filter NTP packets specifically.
- Timestamps only transmitted packets: supported by NICs that cannot
  timestamp received NTP packets or all received packets, including NICs
  that can timestamp only PTP packets.

You can override this default with the `receive-filter` option described
below.

```{cfgcmd} set service ntp timestamp interface \<interface\>

**Enable hardware timestamping of NTP packets on the specified
interface.**

Repeat the command to enable timestamping on multiple interfaces.

The special value `all` enables timestamping on all interfaces that support
it.

The NIC must support hardware timestamping. Run `ethtool -T <interface>` to
check: the reported capabilities should include `hardware-raw-clock`,
`hardware-transmit`, and `hardware-receive`. If the NIC cannot timestamp
received packets, the router falls back to kernel timestamps for them.

The interface must either be configured in VyOS or detected by the kernel.
Otherwise, the commit fails.
```

Example:

```none
set service ntp timestamp interface eth0
```

```{cfgcmd} set service ntp timestamp interface \<interface\> receive-filter \<all | ntp | ptp | none\>

**Configure which incoming packets the NIC timestamps on the specified
interface:**

- `all`: All received packets are timestamped.
- `ntp`: Only received NTP packets are timestamped.
- `ptp`: Only received PTP packets and NTP packets encapsulated in PTP
  packets are timestamped. This lets NICs that support only the `ptp`
  filter timestamp NTP traffic when NTP over PTP is used.
- `none`: No received packets are timestamped. Transmitted packets are
  still timestamped if the NIC supports it.

Except for `none`, the selected filter must be supported by the NIC.
Otherwise, the commit fails.

With interface `all`, at least one interface must support the selected
filter.
```

Example:

```none
set service ntp timestamp interface eth0 receive-filter all
```

(ptp-transport)=

## NTP over PTP

The Precision Time Protocol (PTP, IEEE 1588) enables high-precision time
synchronization on local networks using hardware clocks in NICs and other
network elements.

VyOS does not currently support PTP. To timestamp NTP traffic on NICs that
timestamp only PTP packets, NTP packets can be encapsulated in PTP packets,
a technique known as NTP over PTP. It combines the hardware timestamping
accuracy of such NICs with the configuration flexibility and fault
tolerance of NTP.

For NTP over PTP to work, both ends of an NTP exchange must be configured
for it.

```{cfgcmd} set service ntp ptp

**Enable sending and receiving NTP packets encapsulated in PTP packets (NTP
over PTP).**

The router sends and receives encapsulated NTP packets on the configured
UDP port. Enabling the `ptp` option on an upstream server requires this
option to be set first. Otherwise, the commit fails.
```

Example:

```none
set service ntp ptp
```

```{cfgcmd} set service ntp ptp port \<1-65535\>

**Configure the UDP port used for sending and receiving encapsulated NTP
packets.**

The default is 319, the port NICs use to recognize PTP traffic.
```

Example:

```none
set service ntp ptp port 10319
```
