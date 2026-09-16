---
lastproofread: '2026-03-30'
---

(firewall-global-options-configuration)=

# Global Options Firewall Configuration

## Overview

Some firewall settings are global and affect the entire system. This section
provides information about these global options that you can configure using
the VyOS CLI.

Configuration commands covered in this section:

```{cfgcmd} set firewall global-options ...
```

## Configuration

```{cfgcmd} set firewall global-options all-ping [enable | disable]

By default, when VyOS receives an ICMP echo request packet destined for
itself, it answers with an ICMP echo reply, unless your firewall prevents
it.

You can set firewall rules to accept, drop, or reject ICMP in, out, or
local traffic. You can also use the **firewall global-options all-ping**
command. This command affects only LOCAL traffic (packets destined for your
VyOS system), not IN or OUT traffic.

:::{note}
**firewall global-options all-ping** affects only LOCAL traffic
and always behaves in the most restrictive way
:::
:::{code-block} none
set firewall global-options all-ping enable
:::
When you set this command, VyOS answers every ICMP echo request addressed
to itself, but that response occurs only if no other rule drops or rejects
local echo requests. In case of conflict, VyOS does not answer ICMP echo
requests.

:::{code-block} none
set firewall global-options all-ping disable
:::
When you set this command, VyOS answers no ICMP echo requests addressed to
itself, regardless of where they come from or what specific rules accept
them.
```

```{cfgcmd} set firewall global-options apply-to-bridged-traffic [ipv4 | ipv6]

Apply IPv4 or IPv6 firewall rules to bridged traffic.
```

```{cfgcmd} set firewall global-options apply-to-bridged-traffic accept-invalid ethernet-type [arp | dhcp | pppoe | pppoe-discovery | 802.1q | 802.1ad | wol]

Allow selected Ethernet protocol types to continue through the IP firewall
when connection tracking classifies them as invalid.
```

```{cfgcmd} set firewall global-options broadcast-ping [enable | disable]

Enable or disable the response to ICMP broadcast messages. The system
alters the following parameter:
* ``net.ipv4.icmp_echo_ignore_broadcasts``

The default is ``disable``.
```

```{cfgcmd} set firewall global-options directed-broadcast [enable | disable]

Enable or disable forwarding of IPv4 directed broadcasts on all interfaces.
The default is ``enable``.
```

```{cfgcmd} set firewall global-options ip-src-route [enable | disable]

Enable or disable processing of IPv4 packets that contain a source-route
option. The default is ``disable``.

The following sysctl parameters will be changed:
* ``net.ipv4.conf.all.accept_source_route``
```

```{cfgcmd} set firewall global-options ipv6-src-route [enable | disable]

Set whether VyOS accepts IPv6 packets with a routing extension header. The
default is ``disable``.

The following sysctl parameters will be changed:
* ``net.ipv6.conf.all.accept_source_route``
```

```{cfgcmd} set firewall global-options receive-redirects [enable | disable]

Allow VyOS to accept IPv4 ICMP redirect messages. This changes:

* ``net.ipv4.conf.*.accept_redirects``

The default is ``disable``.
```

```{cfgcmd} set firewall global-options ipv6-receive-redirects [enable | disable]

Allow VyOS to accept ICMPv6 redirect messages. This changes:

* ``net.ipv6.conf.*.accept_redirects``

The default is ``disable``.
```

```{cfgcmd} set firewall global-options send-redirects [enable | disable]

Allow VyOS to send ICMPv4 redirect messages.
The following sysctl parameter will be changed:
* ``net.ipv4.conf.all.send_redirects``

The default is ``enable``.
```

```{cfgcmd} set firewall global-options log-martians [enable | disable]

Allow VyOS to log martian IPv4 packets.
The following sysctl parameter will be changed:
* ``net.ipv4.conf.all.log_martians``

The default is ``enable``.
```

```{cfgcmd} set firewall global-options source-validation [strict | loose | disable]

Set strict or loose IPv4 reverse-path source validation as described by
{rfc}`3704`, or disable it. The default is ``disable``.
```

```{cfgcmd} set firewall global-options ipv6-source-validation [strict | loose | disable]

Set strict or loose IPv6 reverse-path source validation as described by
{rfc}`3704`, or disable it. The default is ``disable``.
```

### Name resolution

FQDN matches, domain groups, and remote groups use the firewall resolver.

```{cfgcmd} set firewall global-options resolver-interval \<10-3600\>

Set the resolver refresh interval in seconds. The default is ``300``.
Individual remote groups can override this value with their own
``interval``.
```

```{cfgcmd} set firewall global-options resolver-cache

Retain the last successfully resolved values when a later DNS resolution
or remote-group update fails.
```

### GeoIP

GeoIP match rules cause VyOS to download and maintain the selected database.
DB-IP is the default provider.

```{cfgcmd} set firewall global-options geoip provider [db-ip | maxmind]
```

```{cfgcmd} set firewall global-options geoip maxmind-account-id \<text\>
```

```{cfgcmd} set firewall global-options geoip maxmind-license-key \<text\>

:::{important}
Both the account ID and license key are required when ``provider`` is
``maxmind``.
:::
```

```{cfgcmd} set firewall global-options geoip maxmind-lite

Use the MaxMind GeoLite2 database instead of the commercial database.
```

```{cfgcmd} set firewall global-options geoip source-address [\<IPv4\> | \<IPv6\>]

Set the source address used to download the database.
```

```{cfgcmd} set firewall global-options geoip vrf \<name\>

Download the database through the specified VRF.
```

```{opcmd} update geoip

Request an immediate GeoIP database and firewall-set update.

:::{code-block} none
vyos@vyos:~$ update geoip
Downloading latest DB-IP database...
Extracting database...
:::
```

```{cfgcmd} set firewall global-options syn-cookies [enable | disable]

Allow VyOS to use IPv4 TCP SYN Cookies.
The following sysctl parameter will be changed:
* ``net.ipv4.tcp_syncookies``

The default is ``enable``.
```

```{cfgcmd} set firewall global-options twa-hazards-protection [enable | disable]

Enable or disable VyOS {rfc}`1337` conformance.
The following sysctl parameter will be changed:
* ``net.ipv4.tcp_rfc1337``

The default is ``disable``.
```

### Global state policy

:::{important}
Configure ``log`` for a state before setting its ``log-level``.
:::

```{cfgcmd} set firewall global-options state-policy established action [accept | drop | reject]
```

```{cfgcmd} set firewall global-options state-policy established log
```

```{cfgcmd} set firewall global-options state-policy established log-level [emerg | alert | crit | err | warn | notice | info | debug]

Set the global setting for an established connection.
```

```{cfgcmd} set firewall global-options state-policy invalid action [accept | drop | reject]
```

```{cfgcmd} set firewall global-options state-policy invalid log
```

```{cfgcmd} set firewall global-options state-policy invalid log-level [emerg | alert | crit | err | warn | notice | info | debug]

Set the global setting for invalid packets.
```

```{cfgcmd} set firewall global-options state-policy related action [accept | drop | reject]
```

```{cfgcmd} set firewall global-options state-policy related log
```

```{cfgcmd} set firewall global-options state-policy related log-level [emerg | alert | crit | err | warn | notice | info | debug]

Set the global setting for related connections.
```

```{cfgcmd} set firewall global-options state-policy offload offload-target \<flowtable\>

Offload stateful forwarding traffic handled by the global state-policy
forward chain to an existing flowtable.

:::{important}
The target must name an existing flowtable, and connection tracking must
remain enabled. See {doc}`Flowtables </configuration/firewall/flowtables>`.
:::
```

### Connection tracking timeouts

VyOS supports setting timeouts for connections by connection type. You can
set timeout values for generic connections, ICMP connections, UDP
connections, or TCP connections in various states.

```{eval-rst}
.. cfgcmd:: set firewall global-options timeout icmp <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout other <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp close <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp close-wait <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp established <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp fin-wait <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp last-ack <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp syn-recv <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp syn-sent <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout tcp time-wait <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout udp other <1-21474836>
    :defaultvalue:
.. cfgcmd:: set firewall global-options timeout udp stream <1-21474836>
    :defaultvalue:

    Set the timeout in seconds for a protocol or state.
```