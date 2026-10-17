---
lastproofread: '2026-09-30'
---

(system-dns)=

# System DNS

:::{warning}
The `system name-server` command cannot assign DNS traffic to a specific VRF.
DNS requests follow the system's routing configuration.
:::

This section describes configuring DNS on the system, namely:

> - DNS name servers
> - Domain search order

## DNS name servers

```{cfgcmd} set system name-server \<address | interface\>

Use this command to specify a DNS server for the system to use for DNS
lookups. Add multiple values by running the command once for each server.
IPv4 and IPv6 addresses are supported. You can also specify an interface
to use name servers received through DHCP or DHCPv6 on that interface.
```

### Example

This example configures IPv4 and IPv6 name servers. The addresses are
reserved for documentation and are not public DNS servers:

```none
set system name-server 192.0.2.53
set system name-server 198.51.100.53
set system name-server 2001:db8::53
set system name-server 2001:db8:1::53
```

To use DNS servers received through DHCP on an interface, specify its name:

```none
set system name-server eth0
```

## Domain search order

To complete unqualified host names, configure one or more search domains.
The system writes these domains to the resolver configuration in the order
configured.

```{cfgcmd} set system domain-search \<domain\>

Use this command to add a domain to the system DNS search list. Add multiple
domains by running the command once for each domain.
```

:::{note}
Domain names may contain letters, numbers, hyphens, and periods, and may be
up to 253 characters long.
:::

(name-server-domain-search-order-example)=

### Example

This example configures the system to try `vyos.io`, `vyos.net`, and then
`vyos.network` when completing unqualified host names:

```none
set system domain-search vyos.io
set system domain-search vyos.net
set system domain-search vyos.network
```
