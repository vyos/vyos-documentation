---
myst:
  html_meta:
    description: |
      FRR (FRRouting) is the control plane VyOS uses to run its dynamic
      and static routing protocols, with each protocol run as its own
      process.
    keywords: frr, frrouting, dynamic routing, static routing
---

(frr)=

# FRR

VyOS uses [FRRouting](https://frrouting.org/) as the control plane for
its dynamic and static routing protocols. The control plane runs each
routing protocol as its own process and computes the routing table. The
router forwards packets according to that table, which is the data
plane.

The commands under `system frr` control how FRR starts. After the
initial boot, a change under `system frr` takes effect only after you
reboot the router (preferred) or restart FRR.

## Configuration

```{cfgcmd} set system frr bmp

**Enable {abbr}`BMP (BGP Monitoring Protocol)` for BGP.**

BMP ([RFC 7854](https://datatracker.ietf.org/doc/html/rfc7854)) lets the
router send the BGP routes it learns and periodic BGP statistics to an
external monitoring station. This command only enables BMP. Configure the
monitoring station separately under `set protocols bgp bmp`.
```

Example:

```none
set system frr bmp
```

```{cfgcmd} set system frr descriptors \<1024-8192\>

**Configure the maximum number of open file descriptors that each of
FRR's processes may hold.**

Raise it for a process that maintains many simultaneous network
connections, such as BGP with thousands of peers.

The default is 1024.
```

Example:

```none
set system frr descriptors 4096
```

```{cfgcmd} set system frr irdp

**Enable {abbr}`IRDP (ICMP Router Discovery Protocol)` on the router.**

IRDP ([RFC 1256](https://datatracker.ietf.org/doc/html/rfc1256)) makes
the router periodically multicast ICMP Router Advertisement messages on
its interfaces, so directly connected hosts can discover it as a default
router without static configuration.
```

Example:

```none
set system frr irdp
```

```{cfgcmd} set system frr watchfrr-timeout \<60-600\>

**Configure the time, in seconds, that FRR's watchdog waits for a
monitored FRR process to answer its health check before marking it
unresponsive.**

The watchdog (watchfrr) repeatedly sends an echo to each FRR process and
restarts one that does not answer within this time.

The default is 90.
```

Example:

```none
set system frr watchfrr-timeout 120
```

```{cfgcmd} set system frr profile \<traditional | datacenter\>

**Configure the profile whose defaults FRR applies to the routing
protocols:**

- `traditional`: Provides defaults that follow IETF standards and common
  wide-area internet routing practice.
- `datacenter`: Provides more aggressive defaults tailored for single
  administrative domains, for example, a BGP keepalive of 3 seconds and
  hold time of 9 seconds compared to 60 and 180 for `traditional`.

The default is `traditional`.
```

Example:

```none
set system frr profile datacenter
```

```{cfgcmd} set system frr snmp \<bgpd | isisd | ldpd | ospf6d | ospfd | ripd | zebra\>

**Enable SNMP for the specified FRR process.**

The process then makes its own state available over SNMP. This requires
an SNMP service configured under `set service snmp`.

Supported processes:

- `bgpd`: BGP
- `isisd`: IS-IS
- `ldpd`: LDP
- `ospf6d`: OSPFv3
- `ospfd`: OSPFv2
- `ripd`: RIP
- `zebra`: The router's routing table manager

Repeat the command to enable SNMP for more than one process.
```

Example:

```none
set system frr snmp bgpd
set system frr snmp ospfd
```
