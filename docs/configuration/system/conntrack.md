---
myst:
  html_meta:
    description: |
      Connection tracking (conntrack) is a VyOS subsystem that records the
      state of network connections passing through the router. It
      activates for IPv4 or IPv6 once a dependent feature such as NAT or a
      stateful firewall rule is configured. Table sizes, helper modules,
      custom timeouts, ignore rules, and logging can all be tuned.
    keywords: conntrack, connection tracking, helper modules, timeout, ignore
---

(conntrack)=

# Conntrack

VyOS tracks connections with its connection tracking subsystem.
Connection tracking becomes operational for one or both address families
once a dependent feature is configured:

- IPv4: NAT, WAN load balancing, or an IPv4 firewall rule that matches
  connection state or connection status, or enables flow offload.
- IPv6: NAT66, or an IPv6 firewall rule that matches connection state or
  connection status, or enables flow offload.
- Both IPv4 and IPv6: a global firewall `state-policy`.

## Configuration

```{cfgcmd} set system conntrack table-size \<1-50000000\>

**Configure the maximum number of entries in the connection tracking
table.**

The router creates one entry for each tracked connection.

The default is 262144.
```

Example:

```none
set system conntrack table-size 524288
```

```{cfgcmd} set system conntrack expect-table-size \<1-50000000\>

**Configure the maximum number of entries in the connection tracking
expect table.**

The expect table holds one entry for each related connection that the
router expects to see, but that has not started yet. A connection
tracking helper module adds this entry when its protocol is about to open
the related connection, such as an FTP data connection.

The default is 2048.
```

Example:

```none
set system conntrack expect-table-size 4096
```

```{cfgcmd} set system conntrack hash-size \<1024-50000000\>

**Configure the size of the hash table that indexes the connection
tracking table.**

A larger hash table makes looking up entries in the connection tracking
table faster.

The default is 65536.
```

Example:

```none
set system conntrack hash-size 131072
```

```{cfgcmd} set system conntrack modules \<ftp | h323 | nfs | pptp | rtsp | sip | sqlnet | tftp\>

**Enable a connection tracking helper module.**

Some protocols open a second, related connection for their data. The
data connection uses a port that is not fixed but chosen for each session
over the control connection. A helper reads the control connection to
learn the port.

Each helper monitors the control connection on the following ports:

- `ftp`: FTP on TCP port 21.
- `h323`: H.323 RAS on UDP port 1719 and Q.931 on TCP port 1720.
- `nfs`: RPC on TCP and UDP port 111.
- `pptp`: PPTP on TCP port 1723. IPv4 only.
- `rtsp`: RTSP on TCP port 554. IPv4 only.
- `sip`: SIP on TCP and UDP ports 5060 and 5061.
- `sqlnet`: SQLnet (TNS) on TCP ports 1521, 1525, and 1536.
- `tftp`: TFTP on UDP port 69.

A helper applies only while the router is already tracking connections in the
helper's address family. See the conditions at the top of this page.

By default, all helper modules are disabled.

Repeat the command to enable multiple modules.
```

Example:

```none
set system conntrack modules ftp
```

```{cfgcmd} set system conntrack tcp half-open-connections \<1-2147483647\>

**Configure the maximum number of half-open TCP connections to the
router.**

A half-open connection has reached the SYN-RECEIVED state and has not
received the final acknowledgment from the client. The limit counts only
connections to the router itself, such as an SSH or management session.
It does not count connections that the router forwards between other
hosts.

By default, the limit is 512.
```

Example:

```none
set system conntrack tcp half-open-connections 1024
```

```{cfgcmd} set system conntrack tcp loose \<enable | disable\>

**Configure whether the router tracks connections that were established
before tracking started:**

- `enable`: Tracks previously established connections.
- `disable`: Does not track previously established connections.

The default is `enable`.
```

Example:

```none
set system conntrack tcp loose disable
```

```{cfgcmd} set system conntrack tcp max-retrans \<1-255\>

**Configure the number of packets that the sending end of a TCP
connection can retransmit without being acknowledged by the receiving
end.**

When a tracked TCP connection passes this count, the router applies a
shorter timeout than the connection's state would normally use.

The default is 3.
```

Example:

```none
set system conntrack tcp max-retrans 5
```

### Conntrack timeouts

Custom timeouts can be applied to a chosen subset of connections by
creating a numbered rule under `timeout custom`. Each rule defines
matching criteria, such as inbound interface, protocol, source or
destination address, and port, to select which connections it applies
to, along with timeout values. Matching connections use these values
instead of defaults.

A packet is checked against every rule. Rules are not mutually exclusive,
so avoid overlapping match criteria that would set conflicting timeouts
on the same connection.

```{cfgcmd} set system conntrack timeout custom \<ipv4 | ipv6\> rule \<1-999999\> description \<text\>

**Configure a description for the rule.**

The text can be up to 255 characters.
```

Example:

```none
set system conntrack timeout custom ipv4 rule 100 description 'Long-lived SSH'
```

```{cfgcmd} set system conntrack timeout custom \<ipv4 | ipv6\> rule \<1-999999\> \<destination | source\> address \<address\>

**Configure the source or destination address, prefix, or address range
the rule matches on.**

Accepted values for an IPv4 rule:

- `<x.x.x.x>`: Matches the address.
- `<x.x.x.x/x>`: Matches the prefix.
- `<x.x.x.x>-<x.x.x.x>`: Matches the address range.
- `!<x.x.x.x>`, `!<x.x.x.x/x>`, `!<x.x.x.x>-<x.x.x.x>`: Matches everything
  except the given address, prefix, or range.

Accepted values for an IPv6 rule:

- `<h:h:h:h:h:h:h:h>`: Matches the address.
- `<h:h:h:h:h:h:h:h/x>`: Matches the prefix.
- `<h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>`: Matches the address range.
- `!<address>`, `!<prefix>`, `!<range>`: Matches everything except the
  given address, prefix, or range.

A rule can set both a source and a destination address. It then matches a
connection only when both the source and the destination match.
```

Example:

```none
set system conntrack timeout custom ipv4 rule 100 source address 198.51.100.0/24
```

```{cfgcmd} set system conntrack timeout custom \<ipv4 | ipv6\> rule \<1-999999\> inbound-interface \<interface\>

**Configure the interface the rule matches on.**

The rule matches packets that enter the router through this interface.
The value `any` matches every interface.
```

Example:

```none
set system conntrack timeout custom ipv4 rule 100 inbound-interface eth0
```

```{cfgcmd} set system conntrack timeout custom \<ipv4 | ipv6\> rule \<1-999999\> \<destination | source\> port \<port\>

**Configure the destination or source port the rule matches on.**

Accepted values:

- `<port name>`: Matches a named port from `/etc/services`, for example
  `http`.
- `<1-65535>`: Matches a port number.
- `<start>-<end>`: Matches a port range.
- `<a,b,c>`: Matches a comma-separated list of ports and ranges.
- `!<list>`: Matches every port except the ones in the given list, for
  example `!22,telnet,http,123,1001-1005`.
```

Example:

```none
set system conntrack timeout custom ipv4 rule 100 destination port 22
```

```{cfgcmd} set system conntrack timeout custom \<ipv4 | ipv6\> rule \<1-999999\> protocol tcp \<close | close-wait | established | fin-wait | last-ack | syn-recv | syn-sent | time-wait\> \<1-21474836\>

**Configure the timeout, in seconds, that the router applies to a
matching TCP connection while it is in the given state.**

Each rule must configure timeouts for exactly one protocol, either `tcp`
or `udp`. Otherwise, the commit fails.

Repeat the command with a different state to set several timeouts in one
rule.
```

Example:

```none
set system conntrack timeout custom ipv4 rule 100 protocol tcp established 3600
```

```{cfgcmd} set system conntrack timeout custom \<ipv4 | ipv6\> rule \<1-999999\> protocol udp \<replied | unreplied\> \<1-21474836\>

**Configure the timeout, in seconds, that the router applies to a
matching UDP connection in the given state.**

Each rule must configure timeouts for exactly one protocol, either `tcp`
or `udp`. Otherwise, the commit fails.

Repeat the command with a different state to set several timeouts in one
rule.
```

Example:

```none
set system conntrack timeout custom ipv6 rule 200 protocol udp replied 30
```

### Conntrack ignore rules

```{note}
Beginning with `vyos-1.5-rolling-202406120020`, ignore rules can be
defined under `set firewall <ipv4 | ipv6> prerouting raw`. The conntrack
ignore rules are expected to be removed in a future release.
```

A chosen subset of packets can be exempted from connection tracking by
creating a numbered rule under `ignore`. Each rule defines matching
criteria, such as inbound interface, protocol, source or destination
address, port, and TCP flags, to select which packets it applies to. The
router does not create a tracking entry for a packet that matches a rule.

```{cfgcmd} set system conntrack ignore \<ipv4 | ipv6\> rule \<1-999999\> description \<text\>

**Configure a description for the rule.**

The text can be up to 255 characters.
```

Example:

```none
set system conntrack ignore ipv4 rule 10 description 'Do not track BGP'
```

```{cfgcmd} set system conntrack ignore \<ipv4 | ipv6\> rule \<1-999999\> \<destination | source\> address \<address\>

**Configure the source or destination address, prefix, or address range
the rule matches on.**

Accepted values for an IPv4 rule:

- `<x.x.x.x>`: Matches the address.
- `<x.x.x.x/x>`: Matches the prefix.
- `<x.x.x.x>-<x.x.x.x>`: Matches the address range.
- `!<x.x.x.x>`, `!<x.x.x.x/x>`, `!<x.x.x.x>-<x.x.x.x>`: Matches everything
  except the given address, prefix, or range.

Accepted values for an IPv6 rule:

- `<h:h:h:h:h:h:h:h>`: Matches the address.
- `<h:h:h:h:h:h:h:h/x>`: Matches the prefix.
- `<h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>`: Matches the address range.
- `!<address>`, `!<prefix>`, `!<range>`: Matches everything except the
  given address, prefix, or range.

A rule can set both a source and a destination address. It then matches a
packet only when both the source and the destination match.
```

Example:

```none
set system conntrack ignore ipv4 rule 10 destination address 192.0.2.10
```

````{cfgcmd} set system conntrack ignore \<ipv4 | ipv6\> rule \<1-999999\> \<destination | source\> port \<port\>

**Configure the destination or source port the rule matches on.** A rule that
matches a port must also set `protocol tcp` or `protocol udp`. Otherwise, the
commit fails.

Accepted values:

- `<port name>`: Matches a named port, for example `http`.
- `<1-65535>`: Matches a port number.
- `<start>-<end>`: Matches a port range.
- `<a,b,c>`: Matches a comma-separated list of ports and ranges.
- `!<list>`: Matches every port except the ones in the given list, for example
  `!22,telnet,http,123,1001-1005`.

Example:

```none
set system conntrack ignore ipv4 rule 10 destination port 179
```
````

```{cfgcmd} set system conntrack ignore \<ipv4 | ipv6\> rule \<1-999999\> inbound-interface \<interface\>

**Configure the interface the rule matches on.**

The rule applies to packets that enter the router through this
interface. The value `any` matches every interface.
```

Example:

```none
set system conntrack ignore ipv4 rule 10 inbound-interface eth0
```

```{cfgcmd} set system conntrack ignore \<ipv4 | ipv6\> rule \<1-999999\> protocol \<protocol\>

**Configure the protocol the rule matches on.**

The protocol can be specified as:

- `<name>`: A protocol name, for example `tcp` or `udp`.
- `<0-255>`: A protocol number.
- `all`: Every protocol.
- `tcp_udp`: TCP and UDP.
- `!<name>`: Every protocol except the named one.
```

Example:

```none
set system conntrack ignore ipv4 rule 10 protocol tcp
```

```{cfgcmd} set system conntrack ignore \<ipv4 | ipv6\> rule \<1-999999\> tcp flags [not] \<ack | cwr | ecn | fin | psh | rst | syn | urg\>

**Configure the TCP flag the rule matches on.**

The optional `not` keyword inverts the match, so the rule matches only
when the specified flag is absent. A packet matches the rule only when
every flag listed without `not` is set and every flag listed with `not`
is absent.

The rule must also set `protocol tcp`, and cannot list the same flag both
with and without `not`. Otherwise, the commit fails.

Repeat the command to match on additional flags.
```

Example:

```none
set system conntrack ignore ipv4 rule 10 tcp flags syn
```

### Conntrack log

```{cfgcmd} set system conntrack log event \<destroy | new | update\>

**Log connection tracking events of the given type:**

- `new`: Logs the creation of an entry.
- `update`: Logs changes to an entry.
- `destroy`: Logs the deletion of an entry.

Repeat the command to log multiple event types.

By default, the router logs events of the configured type for every
protocol. To log only some protocols, add a protocol to the event type.
```

Example:

```none
set system conntrack log event new
```

```{cfgcmd} set system conntrack log event \<destroy | new | update\> \<icmp | other | tcp | udp\>

**Restrict logging of an event type to the given protocol.**

The value `other` covers every protocol except TCP, UDP, and ICMP.
ICMPv6 is included in `other`.

Repeat the command to log on additional protocols.
```

Example:

```none
set system conntrack log event destroy tcp
```

```{cfgcmd} set system conntrack log timestamp

**Record the start and stop time of every tracked connection.**

The log line for a destroyed connection then reports when the connection
started, when it stopped, and how long it lasted.
```

Example:

```none
set system conntrack log timestamp
```

```{cfgcmd} set system conntrack log queue-size \<100-2147483647\>

**Configure how many connection tracking events the router holds in
memory before writing them to the log.**

Raise the value if events are lost under heavy load.
```

Example:

```none
set system conntrack log queue-size 65536
```

```{cfgcmd} set system conntrack log log-level \<info | debug\>

**Configure how much detail the router writes for each connection
tracking event.**

With `info`, each log line reports the event itself. With `debug`, the
line also carries the raw event data and is prefixed with its time and
level.

By default, the level is `info`.
```

Example:

```none
set system conntrack log log-level debug
```
