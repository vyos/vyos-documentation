---
myst:
  html_meta:
    description: |
      sFlow is a monitoring protocol that samples one out of every N
      packets per interface and periodically records total packet and byte
      counts, exporting the collected data to one or more external
      collectors.
    keywords: sflow, monitoring, sampling, collector, agent
---

(sflow)=

# sFlow

sFlow is a network monitoring protocol that samples one out of every N
packets and, at fixed intervals, records the total number of packets and
bytes passed. The router then exports the collected data to one or more
external collectors, identifying itself as the sFlow agent. Sampling
applies to both IPv4 and IPv6 traffic.

sFlow is configured per interface. By default, the router samples only the
packets entering an interface (ingress). The `enable-egress` command extends
sampling to the packets leaving the interface (egress). The recorded totals of
packets and bytes are not affected and always cover traffic in both
directions.

For flow-based accounting with NetFlow or IPFIX, see
{ref}`flow-accounting`.

## Configuration

```{cfgcmd} set system sflow agent-address \<address\>

**Configure the IP address the router uses to identify itself to
external collectors.**

Accepts an IPv4 or IPv6 address.

The address must already be assigned to a local interface. An address on
an interface in a VRF also qualifies. Otherwise, the commit fails.
```

Example:

```none
set system sflow agent-address 192.0.2.14
```

```{cfgcmd} set system sflow agent-interface \<interface\>

**Use the IP address of the specified interface as the sFlow agent
address.**

Configure this as an alternative to `agent-address`.
```

Example:

```none
set system sflow agent-interface eth0
```

```{cfgcmd} set system sflow drop-monitor-limit \<1-65535\>

**Report packets dropped by the kernel to sFlow collectors.**

The router captures the header of each dropped packet and exports it in
the sFlow stream, alongside samples and recorded totals. The value
limits how many of these reports the router sends per second.

By default, the router does not report dropped packets.
```

Example:

```none
set system sflow drop-monitor-limit 50
```

```{cfgcmd} set system sflow interface \<interface\>

**Enable sFlow sampling on the specified interface.**

Repeat the command to sample multiple interfaces.

Enable sampling on at least one interface, unless VPP sampling is enabled.
Otherwise, the commit fails.
```

Example:

```none
set system sflow interface eth0
```

```{cfgcmd} set system sflow vpp

**Enable sFlow sampling of traffic forwarded by VPP.**

Configure this together with the sFlow settings under `vpp sflow`. While
`vpp sflow` is configured, this command must remain set. Otherwise, the commit
fails.
```

Example:

```none
set system sflow vpp
```

```{cfgcmd} set system sflow polling \<1-600\>

**Configure the interval, in seconds, at which the router records the
number of packets and bytes passed.**

The default is 30.
```

Example:

```none
set system sflow polling 30
```

```{cfgcmd} set system sflow sampling-rate \<1-65535\>

**Configure N so the router samples one out of every N packets.**

A higher value samples fewer packets.

The default is 1000.
```

Example:

```none
set system sflow sampling-rate 1000
```

```{cfgcmd} set system sflow vrf \<name\>

**Export sFlow data within the specified VRF instance.**

The router reaches the collectors through that VRF.

The VRF must already be configured with `set vrf name <name>`. Otherwise, the
commit fails.
```

Example:

```none
set system sflow vrf mgmt
```

```{cfgcmd} set system sflow server \<address\>

**Configure an sFlow collector destination address.**

Accepts an IPv4 or IPv6 address.

Repeat the command to export to multiple collectors.

Configure at least one collector. Otherwise, the commit fails.
```

Example:

```none
set system sflow server 192.0.2.1
set system sflow server 2001:db8::1
```

```{cfgcmd} set system sflow server \<address\> port \<1-65535\>

**Configure an sFlow collector destination port.**

The default is 6343.
```

Example:

```none
set system sflow server 192.0.2.1 port 6343
```

```{cfgcmd} set system sflow enable-egress

**Enable sampling for traffic leaving the monitored interfaces.**

By default, only traffic entering the interfaces is sampled.
```

Example:

```none
set system sflow enable-egress
```

## Example

The following example samples traffic on `eth0` and `eth1` and exports
the collected data to two collectors, at `192.0.2.1` and `203.0.113.23`.
The router identifies itself as the sFlow agent by the address
`192.0.2.14` and reports packets dropped by the kernel, up to `50` per
second.

```none
set system sflow agent-address 192.0.2.14
set system sflow interface eth0
set system sflow interface eth1
set system sflow drop-monitor-limit 50
set system sflow server 192.0.2.1
set system sflow server 203.0.113.23
```
