---
lastproofread: '2023-11-13'
---

(igmp-proxy)=

# IGMP Proxy

{abbr}`IGMP (Internet Group Management Protocol)` proxy sends IGMP host messages
on behalf of a connected client. The configuration must define one, and only one
upstream interface, and one or more downstream interfaces.

## Configuration

```{cfgcmd} set protocols igmp-proxy interface \<interface\> role \<upstream | downstream\>

* **upstream:** The upstream network interface is the outgoing interface
which is responsible for communicating to available multicast data sources.
There can only be one upstream interface.

* **downstream:** Downstream network interfaces are the distribution
interfaces to the destination networks, where multicast clients can join
groups and receive multicast data. One or more downstream interfaces must
be configured.
```

```{cfgcmd} set protocols igmp-proxy interface \<interface\> alt-subnet \<network\>

Defines alternate sources for multicasting and IGMP data. The network address
must be on the following format 'a.b.c.d/n'. By default, the router will
accept data from sources on the same network as configured on an interface.
If the multicast source lies on a remote network, one must define from where
traffic should be accepted.

This is especially useful for the upstream interface, since the source for
multicast traffic is often from a remote location.

<<<<<<< HEAD
This option can be supplied multiple times.
=======
You can configure multiple remote subnets for an **upstream** IGMP proxy
interface.

Upstream interfaces frequently require this configuration because multicast
sources typically reside on external subnets. ISPs frequently send IPTV
streams from remote private subnets. The set of source subnets can change
without notice.
```

Example:

```none
set protocols igmp-proxy interface eth0 alt-subnet 10.0.0.0/8
```

```{cfgcmd} set protocols igmp-proxy interface \<interface\> whitelist \<network\>

**Configure a permitted destination network for multicast traffic requests
on the specified IGMP proxy interface.**

By default, the IGMP proxy accepts requests for all multicast destination
networks. When you define a whitelist, the IGMP proxy forwards requests only
for the specified multicast networks.

You can configure multiple whitelist entries per **downstream** IGMP proxy
interface.
```

Example:

```none
set protocols igmp-proxy interface eth1 whitelist 239.0.0.0/8
```

```{cfgcmd} set protocols igmp-proxy interface \<interface\> threshold \<1-255\>

**Configure the Time-to-Live (TTL) threshold for the specified IGMP proxy
interface.**

The IGMP proxy drops any multicast packet with a TTL value lower than the
configured threshold.
```

Example:

```none
set protocols igmp-proxy interface eth0 threshold 5
>>>>>>> dad76493 (docs: igmp-proxy: document firewall requirements and operational commands (#2174))
```

```{cfgcmd} set protocols igmp-proxy disable-quickleave

Disables quickleave mode. In this mode the daemon will not send a Leave IGMP
message upstream as soon as it receives a Leave message for any downstream
interface. The daemon will not ask for Membership reports on the downstream
interfaces, and if a report is received the group is not joined again the
upstream.

If it's vital that the daemon should act exactly like a real multicast client
on the upstream interface, this function should be enabled.

Enabling this function increases the risk of bandwidth saturation.
```

```{cfgcmd} set protocols igmp-proxy disable

Disable this service.
```

(igmp-proxy-example)=

### Example

Interface eth1 LAN is behind NAT. In order to subscribe 10.0.0.0/23 subnet
multicast which is in eth0 WAN we need to configure igmp-proxy.

```none
set protocols igmp-proxy interface eth0 role upstream
set protocols igmp-proxy interface eth0 alt-subnet 10.0.0.0/23
set protocols igmp-proxy interface eth1 role downstream
```


## Operation

```{opcmd} restart igmp-proxy

Restart the IGMP proxy process.
<<<<<<< HEAD
```
=======
```

```{opcmd} show ip multicast interface

Display per-interface multicast packet and byte counters.

~~~none
vyos@vyos:~$ show ip multicast interface
Interface      PktsIn    PktsOut  BytesIn    BytesOut    Local
-----------  --------  ---------  ---------  ----------  --------------
eth0         11528936          0  14.54 GB   0 B         10.222.175.251
eth1                0   11528936  0 B        14.54 GB    192.168.0.1
~~~

On a healthy proxy, the upstream and downstream counters increase
together. If the proxy replicates traffic to multiple downstream
interfaces, the output counters can exceed the input counters. If the
upstream counters increase but the downstream counters do not, the
router receives the streams but does not forward them. A missing
``forward`` firewall rule or the absence of downstream membership
causes this condition.
```

```{opcmd} show log igmp-proxy

Display the log messages of the IGMP proxy process. Common messages:

- ``No interfaces found for source 0.0.0.0``: This message is harmless.
  General membership queries use an unspecified source address.
- ``Too many origins for route 239.192.0.2; replacing 10.237.1.165
  with 10.237.1.168``: This message is harmless. The multicast source
  uses more origin servers than the IGMP proxy tracks for one route.
  The IGMP proxy replaces the oldest entry and does not interrupt the
  stream.
```

## Firewall considerations

The IGMP proxy joins the requested multicast groups. The router
therefore receives the IGMP signaling and the multicast streams
locally. Multicast traffic traverses the ``input`` hook, not only the
``forward`` hook. A firewall with a default-drop ``input`` chain must
accept this traffic:

- IGMP (protocol ``igmp``) on the upstream interface and on each
  downstream interface, in the ``input`` hook. Downstream clients
  address membership reports to multicast groups, not to the router.
  The proxy must receive these reports to learn which streams to join.
- Traffic to multicast destinations (``224.0.0.0/4``) that arrives on
  the upstream interface, in the ``input`` hook.
- Traffic to multicast destinations (``224.0.0.0/4``) from the
  upstream interface to the downstream networks, in the ``forward``
  hook.

## Example

In this example, the local LAN on interface eth1 operates behind NAT. To allow
local clients to receive multicast traffic originating from the 198.51.100.0/24
source network on the WAN interface (eth0), configure the IGMP proxy as
follows:

```none
set protocols igmp-proxy interface eth0 role upstream
set protocols igmp-proxy interface eth0 alt-subnet 198.51.100.0/24
set protocols igmp-proxy interface eth1 role downstream
```

>>>>>>> dad76493 (docs: igmp-proxy: document firewall requirements and operational commands (#2174))
