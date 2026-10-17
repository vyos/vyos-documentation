---
lastproofread: '2026-09-30'
---

(cgnat)=

# CGNAT

{abbr}`CGNAT (Carrier-Grade Network Address Translation)`, also known as
Large-Scale NAT (LSN), lets an Internet service provider share a pool of
public IPv4 addresses among many subscribers. The shared address block
`100.64.0.0/10` is reserved for this purpose by {rfc}`6598`.

## Overview

VyOS CGNAT uses deterministic source NAT mappings. Each internal IPv4 address
is assigned an external IPv4 address and a port range. That mapping is shared
across TCP, UDP, and ICMP. Other IP protocols use the address mapping without
a port range. The configured per-user port limit determines the size of each
subscriber's port block.

VyOS supports several {rfc}`6888` requirements, including paired address
mapping, multiple external address ranges, and a per-subscriber port limit.
The implementation does not support every RFC requirement; Port Control
Protocol (PCP), for example, is not implemented.

External and internal pools accept IPv4 addresses, prefixes, or address
ranges. External pools can contain multiple ranges, optionally ordered with
sequence numbers. VyOS expands pool addresses while building mappings, so
very large ranges can require substantial memory and configuration time.

## Port allocation

The default external port range is `1024-65535`, which contains 64,512 ports.
The default per-user limit is 2,000 ports, allowing up to 32 subscriber
addresses to share one external address (`64,512 / 2,000`, rounded down).
With a configured limit of 1,000 ports, up to 64 subscriber addresses can
share one external address. Actual capacity depends on the configured port
range and per-user limit.

## Configuration

```{cfgcmd} set nat cgnat pool external \<pool-name\> external-port-range \<port-range\>

Set the external port range for this pool. The default is 1024-65535.
```

```{cfgcmd} set nat cgnat pool external \<pool-name\> per-user-limit port \<num\>

Set the number of external ports assigned to each subscriber. The default
is 2000.
```

```{cfgcmd} set nat cgnat pool external \<pool-name\> range [address | address range | network] [seq]

Set an external IPv4 address, address range, or prefix. Multiple entries can
be added to the same pool. The optional sequence orders ranges; lower values
have higher priority.
```

```{cfgcmd} set nat cgnat pool internal \<pool-name\> range [address range | network]

Set an internal IPv4 address, address range, or prefix. Multiple entries can
be added to the same pool.
```

```{cfgcmd} set nat cgnat rule \<num\> source pool \<internal-pool-name\>

Set the internal pool used by this rule.
```

```{cfgcmd} set nat cgnat rule \<num\> translation pool \<external-pool-name\>

Set the external pool used by this rule.
```

```{cfgcmd} set nat cgnat log-allocation

Log the internal address, external address, and allocated port range.
```

## Configuration examples

### Single external address

This example maps the internal `100.64.0.0/28` range to one external address.
Each subscriber receives up to 2,000 ports.

```none
set nat cgnat pool external ext1 external-port-range '1024-65535'
set nat cgnat pool external ext1 per-user-limit port '2000'
set nat cgnat pool external ext1 range '192.0.2.222/32'
set nat cgnat pool internal int1 range '100.64.0.0/28'
set nat cgnat rule 10 source pool 'int1'
set nat cgnat rule 10 translation pool 'ext1'
```

### Multiple external addresses

This example defines two discontiguous external address ranges. The four
external addresses and an 8,000-port limit provide capacity for up to 32
internal addresses.

```none
set nat cgnat pool external ext1 external-port-range '1024-65535'
set nat cgnat pool external ext1 per-user-limit port '8000'
set nat cgnat pool external ext1 range '192.0.2.1-192.0.2.2'
set nat cgnat pool external ext1 range '203.0.113.253-203.0.113.254'
set nat cgnat pool internal int1 range '100.64.0.1-100.64.0.32'
set nat cgnat rule 10 source pool 'int1'
set nat cgnat rule 10 translation pool 'ext1'
```

### External address sequence

Lower sequence values are assigned first. This example maps the first four
internal addresses to `203.0.113.1` and the next four to `192.0.2.1`.

```none
set nat cgnat pool external ext-01 per-user-limit port '16000'
set nat cgnat pool external ext-01 range 203.0.113.1/32 seq '10'
set nat cgnat pool external ext-01 range 192.0.2.1/32 seq '20'
set nat cgnat pool internal int-01 range '100.64.0.0/29'
set nat cgnat rule 10 source pool 'int-01'
set nat cgnat rule 10 translation pool 'ext-01'
```

## Operational commands

```{opcmd} show nat cgnat allocation

Show address and port allocations.
```

```{opcmd} show nat cgnat allocation external-address \<address\>

Show allocations that use the specified external address.
```

```{opcmd} show nat cgnat allocation internal-address \<address\>

Show the allocation for the specified internal address.
```

### Show CGNAT allocations

```none
vyos@vyos:~$ show nat cgnat allocation
Internal IP    External IP    Port range
-------------  -------------  ------------
100.64.0.0     203.0.113.1    1024-17023
100.64.0.1     203.0.113.1    17024-33023
100.64.0.2     203.0.113.1    33024-49023
100.64.0.3     203.0.113.1    49024-65023
100.64.0.4     192.0.2.1      1024-17023
100.64.0.5     192.0.2.1      17024-33023
100.64.0.6     192.0.2.1      33024-49023
100.64.0.7     192.0.2.1      49024-65023

vyos@vyos:~$ show nat cgnat allocation internal-address 100.64.0.4
Internal IP    External IP    Port range
-------------  -------------  ------------
100.64.0.4     192.0.2.1      1024-17023
```

## Further reading

- {rfc}`6598` - IANA-Reserved IPv4 Prefix for Shared Address Space
- {rfc}`6888` - Requirements for CGNAT
