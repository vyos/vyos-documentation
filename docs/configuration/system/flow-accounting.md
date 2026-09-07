---
myst:
  html_meta:
    description: |
      VyOS can group IPv4 and IPv6 traffic into flows and export a record
      of each flow to one or more external collectors, using the NetFlow or
      IPFIX protocol.
    keywords: flow-accounting, netflow, ipfix, ipt_netflow, exporter, collector
---

(flow-accounting)=

# Flow accounting

A flow is a stream of packets that share key header fields, such as source and
destination IP addresses, ports, and protocol.

Flow accounting groups IPv4 and IPv6 traffic into flows and records how many
packets and bytes each flow carries. These records are then exported to one or
more external collectors, using the {abbr}`NetFlow (Cisco NetFlow)` or
{abbr}`IPFIX (IP Flow Information Export)` protocol.

Flow accounting is applied per interface. By default, only traffic entering an
interface (ingress) is accounted for. Traffic leaving an interface (egress) is
added with `enable-egress`.

The router also supports sFlow, a separate monitoring protocol. Instead of
grouping packets into flows, sFlow sends packet samples taken at a configurable
rate to a collector (see {ref}`sflow`).

## Configuration

### Monitored interfaces

```{cfgcmd} set system flow-accounting netflow interface \<interface\>

**Enable flow accounting on the specified interface.**

Repeat the command to enable flow accounting on multiple interfaces.

Enable flow accounting on at least one interface. Otherwise, the commit fails.
```

Example:

```none
set system flow-accounting netflow interface eth0
```

```{cfgcmd} set system flow-accounting enable-egress

**Enable flow accounting for traffic leaving the monitored interfaces.**

By default, only traffic entering the interfaces is accounted for.
```

Example:

```none
set system flow-accounting enable-egress
```

### Flow export

```{cfgcmd} set system flow-accounting netflow server \<address\>

**Configure the address of a collector that receives the exported records.**

Accepts an IPv4 or IPv6 address.

Repeat the command to export records to multiple collectors.

At least one collector must be configured. Otherwise, the commit fails.
```

Example:

```none
set system flow-accounting netflow server 192.0.2.10
set system flow-accounting netflow server 2001:db8::10
```

```{cfgcmd} set system flow-accounting netflow server \<address\> port \<1025-65535\>

**Configure the destination port on the collector.**

The default is 2055.
```

Example:

```none
set system flow-accounting netflow server 192.0.2.10 port 4739
```

```{cfgcmd} set system flow-accounting netflow server \<address\> source-address \<address\>

**Configure the source address the router uses to reach the collector.**

The address must already be assigned to a local interface. If flow accounting
is bound to a VRF, the address must be assigned within that VRF.

The source address must be IPv4 for an IPv4 collector and IPv6 for an IPv6
collector.

Set either source-address or source-interface for a collector, not both.
Configuring both for the same collector fails the commit.
```

Example:

```none
set system flow-accounting netflow server 192.0.2.10 source-address 192.0.2.1
```

```{cfgcmd} set system flow-accounting netflow server \<address\> source-interface \<interface\>

**Configure the interface the router uses to reach the collector.**

When flow accounting is bound to a VRF, the interface must belong to that VRF.

Set either source-address or source-interface for a collector, not both.
Configuring both for the same collector fails the commit.
```

Example:

```none
set system flow-accounting netflow server 192.0.2.10 source-interface eth0
```

```{cfgcmd} set system flow-accounting netflow version \<5 | 9 | 10\>

**Configure the export protocol version.**

Version 5 exports IPv4 flows only. Version 9 and version 10 (IPFIX) also
export IPv6 flows.

The default is 9.
```

Example:

```none
set system flow-accounting netflow version 10
```

```{cfgcmd} set system flow-accounting netflow engine-id \<id\>

**Configure the identifier the router places in the exported records to
distinguish this exporter's flow streams.**

For version 5, use two values in the form `<0-255>:<0-255>`. For versions 9
and 10, use a single value from 0 to 4294967295.

The value must be valid for the configured version. Otherwise, the commit
fails.
```

Example:

```none
set system flow-accounting netflow engine-id 100
```

```{cfgcmd} set system flow-accounting netflow sampling-rate \<0-4294967295\>

**Sample one packet in every N for accounting instead of every packet.**

Packets are selected at random. Sampling reduces the number of packets
accounted for, so the exported counts become estimates of the actual traffic.

By default, sampling is disabled, and every packet is accounted for.
```

Example:

```none
set system flow-accounting netflow sampling-rate 1000
```

```{cfgcmd} set system flow-accounting netflow max-flows \<0-4294967295\>

**Configure the maximum number of flows accounted for at the same time.**

By default, no explicit maximum is set.
```

Example:

```none
set system flow-accounting netflow max-flows 2000000
```

```{cfgcmd} set system flow-accounting netflow inactive-timeout \<0-2147483647\>

**Configure the number of seconds without new packets after which a flow is
considered finished and exported.**

The default is 15.
```

Example:

```none
set system flow-accounting netflow inactive-timeout 15
```

```{cfgcmd} set system flow-accounting netflow active-timeout \<0-2147483647\>

**Configure the maximum number of seconds an active flow is accounted for
before it is exported.**

A flow still receiving packets is exported once this time is reached.

The default is 1800.
```

Example:

```none
set system flow-accounting netflow active-timeout 1800
```

```{cfgcmd} set system flow-accounting vrf \<name\>

**Export flow records within the specified
{abbr}`VRF (Virtual Routing and Forwarding)` instance.**

The router reaches collectors through that VRF.

A collector configured with source-interface is reached through that
interface, not through the VRF.

The VRF must already be configured with `set vrf name <name>`.
```

Example:

```none
set system flow-accounting vrf mgmt
```

## Operation

```{opcmd} show flow-accounting

Show all flows the router is currently accounting for.
```

```{opcmd} show flow-accounting interface \<interface\>

Show accounted flows on the specified interface.
```

```{opcmd} show flow-accounting interface \<interface\> host \<address\>

Show accounted flows on the specified interface whose source or destination
address is the given IPv4 or IPv6 address.
```

```{opcmd} show flow-accounting interface \<interface\> port \<1-65535\>

Show accounted flows on the specified interface whose source or destination
port is the given port.
```

```{opcmd} show flow-accounting interface \<interface\> top \<1-100\>

Show accounted flows on the specified interface, limited to the first N
entries.
```

```{opcmd} restart flow-accounting

Restart flow accounting and reattach it to monitored interfaces.

If flow accounting is not configured and running, the command reports this and
exits without starting it.
```

## Example

The following example enables flow accounting on eth0 and eth1, and exports
version 10 (IPFIX) records to the collector at 192.0.2.10 on port 4739, using
192.0.2.1 as the source address.

```none
set system flow-accounting netflow interface eth0
set system flow-accounting netflow interface eth1
set system flow-accounting netflow version 10
set system flow-accounting netflow server 192.0.2.10 port 4739
set system flow-accounting netflow server 192.0.2.10 source-address 192.0.2.1
```
