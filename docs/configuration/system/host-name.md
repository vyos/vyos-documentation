---
myst:
  html_meta:
    description: |
      Host information sets the router's system name and controls how it
      resolves host names to IP addresses. It covers the host name, the
      domain name, and static host mappings kept in the local hosts file.
    keywords: host information, host name, domain name, static host mapping
---

(host-information)=

# Host information

Host information sets the router's system name and controls how it
resolves host names to IP addresses.

## Configuration

### Host name

A host name is the label that distinguishes the router from other
devices on the network. It appears in the router's command-line prompt
and log messages.

```{cfgcmd} set system host-name \<hostname\>

**Configure the router's host name.**

The host name must start and end with a letter or digit, may contain
letters, digits, hyphens, and periods in between, and must not exceed 63
characters. Otherwise, the commit fails.

By default, the router uses `vyos`.
```

Example:

```none
set system host-name router-east
```

### Domain name

A domain name identifies the network the router belongs to. Setting it
allows hosts in that network to be reached by a short name. When the
router looks up a name with no domain, such as `crux`, it appends the
domain name and looks up `crux.example.com`.

```{cfgcmd} set system domain-name \<domain\>

**Configure the router's domain name.**

The domain name must begin with a letter or digit and may contain
letters, digits, hyphens, and periods. Otherwise, the commit fails.
```

Example:

```none
set system domain-name example.com
```

### Static host mapping

A static host mapping ties a host name to one or more IP addresses. The
router keeps it in the `/etc/hosts` file and resolves that name from
there.

```{note}
Do not manually edit `/etc/hosts`. The router regenerates this file
whenever the configuration is applied (at boot and on every commit that
changes these settings), so any manual edits are lost. Instead,
configure static host mappings as follows.
```

```{cfgcmd} set system static-host-mapping host-name \<hostname\> inet \<address\>

**Map a host name to an IP address for local name resolution.**

The address can be IPv4 or IPv6, and the same host name can map to more
than one address.

Each `host-name` mapping requires at least one `inet` address.
Otherwise, the commit fails.
```

Example:

```none
set system static-host-mapping host-name server1 inet 192.0.2.10
```

```{cfgcmd} set system static-host-mapping host-name \<hostname\> alias \<alias\>

**Configure an alias for a static host mapping.**

The alias points to the same address as its host name, and a mapping
can have more than one alias.

Each alias must start and end with a letter or digit, may contain
letters, digits, hyphens, and periods in between, and must not exceed 63
characters. Otherwise, the commit fails.
```

Example:

```none
set system static-host-mapping host-name server1 alias mail
```
