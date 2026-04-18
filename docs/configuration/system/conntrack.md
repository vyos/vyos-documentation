# Conntrack

VyOS can be configured to track connections using the connection
tracking subsystem. Connection tracking becomes operational once either
stateful firewall or NAT is configured.

## Configure

```{eval-rst}
.. cfgcmd:: set system conntrack table-size <1-50000000>
    :defaultvalue:

    The connection tracking table contains one entry for each connection being
    tracked by the system.
```

```{eval-rst}
.. cfgcmd:: set system conntrack expect-table-size <1-50000000>
    :defaultvalue:

    The connection tracking expect table contains one entry for each expected
    connection related to an existing connection. These are generally used by
    “connection tracking helper” modules such as FTP.
    The default size of the expect table is 2048 entries.
```

```{eval-rst}
.. cfgcmd:: set system conntrack hash-size <1-50000000>
    :defaultvalue:

    Set the size of the hash table. The connection tracking hash table makes
    searching the connection tracking table faster. The hash table uses
    “buckets” to record entries in the connection tracking table.
```

```{eval-rst}
.. cfgcmd:: set system conntrack modules ftp
```

```{eval-rst}
.. cfgcmd:: set system conntrack modules h323
```

```{eval-rst}
.. cfgcmd:: set system conntrack modules nfs
```

```{eval-rst}
.. cfgcmd:: set system conntrack modules pptp
```

```{eval-rst}
.. cfgcmd:: set system conntrack modules sip
```

```{eval-rst}
.. cfgcmd:: set system conntrack modules sqlnet
```

```{eval-rst}
.. cfgcmd:: set system conntrack modules tftp

    Configure the connection tracking protocol helper modules.
    All modules are enable by default.

    | Use `delete system conntrack modules` to deactive all modules.
    | Or, for example ftp, `delete system conntrack modules ftp`.
```

```{eval-rst}
.. cfgcmd:: set system conntrack tcp half-open-connections <1-21474836>
    :defaultvalue:

    Set the maximum number of TCP half-open connections.
```

```{eval-rst}
.. cfgcmd:: set system conntrack tcp loose <enable | disable>
    :defaultvalue:

    Policy to track previously established connections.
```

```{eval-rst}
.. cfgcmd:: set system conntrack tcp max-retrans <1-2147483647>
    :defaultvalue:

    Set the number of TCP maximum retransmit attempts.
```

### Contrack Timeouts

You can define custom timeout values to apply to a specific subset of
connections, based on a packet and flow selector. To do this, you need to
create a rule defining the packet and flow selector.

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   description <test>

    Set a rule description.
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   destination address <ip-address>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   source address <ip-address>

    Set a destination and/or source address. Accepted input for ipv4:

    .. code-block:: none

        set system conntrack timeout custom ipv4 rule <1-999999> [source | destination] address
        Possible completions:
           <x.x.x.x>            IPv4 address to match
           <x.x.x.x/x>          IPv4 prefix to match
           <x.x.x.x>-<x.x.x.x>  IPv4 address range to match
           !<x.x.x.x>           Match everything except the specified address
           !<x.x.x.x/x>         Match everything except the specified prefix
           !<x.x.x.x>-<x.x.x.x> Match everything except the specified range

        set system conntrack timeout custom ipv6 rule <1-999999> [source | destination] address
        Possible completions:
           <h:h:h:h:h:h:h:h>    IP address to match
           <h:h:h:h:h:h:h:h/x>  Subnet to match
           <h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>
                                IP range to match
           !<h:h:h:h:h:h:h:h>   Match everything except the specified address
           !<h:h:h:h:h:h:h:h/x> Match everything except the specified prefix
           !<h:h:h:h:h:h:h:h>-<h:h:h:h:h:h:h:h>
                                Match everything except the specified range
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   destination port <value>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   source port <value>

    Set a destination and/or source port. Accepted input:

    .. code-block:: none

        <port name>    Named port (any name in /etc/services, e.g., http)
        <1-65535>      Numbered port
        <start>-<end>  Numbered port range (e.g., 1001-1005)

    Multiple destination ports can be specified as a comma-separated list.
    The whole list can also be "negated" using '!'. For example:
    `!22,telnet,http,123,1001-1005``
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp close <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp close-wait <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp established <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp fin-wait <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp last-ack <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp syn-recv <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp syn-sent <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol tcp time-wait <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol udp replied <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom [ipv4 | ipv6] rule <1-999999>
   protocol udp unreplied <1-21474836>

    Set the timeout in seconds for a protocol or state in a custom rule.
```

### Conntrack ignore rules

:::{note}
**Important note about conntrack ignore rules:**
Starting from vyos-1.5-rolling-202406120020, ignore rules can be defined in
`set firewall [ipv4 | ipv6] prerouting raw ...`. It's expected that in
the future the conntrack ignore rules will be removed.

> Customized ignore rules, based on a packet and flow selector.
:::

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   description <text>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   destination address <ip-address>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   destination port <port>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   inbound-interface <interface>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   protocol <protocol>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   source address <ip-address>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   source port <port>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore [ipv4 | ipv6] rule <1-999999>
   tcp flags [not] <text>

   Allowed values fpr TCP flags: ``ack``, ``cwr``, ``ecn``, ``fin``, ``psh``,
   ``rst``, ``syn`` and ``urg``. Multiple values are supported, and for
   inverted selection use ``not``, as shown in the example.
```

### Conntrack log

```{eval-rst}
.. cfgcmd:: set system conntrack log event destroy
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event new
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event update

    Log the connection tracking events per type.
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event destroy icmp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event destroy other
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event destroy tcp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event destroy udp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event new icmp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event new other
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event new tcp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event new udp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event update icmp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event update other
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event update tcp
```

```{eval-rst}
.. cfgcmd:: set system conntrack log event update udp

    Log the connection tracking events per protocol.
```

```{eval-rst}
.. cfgcmd:: set system conntrack log timestamp

    Turn on flow-based timestamp extension.
```

```{eval-rst}
.. cfgcmd:: set system conntrack log queue-size <100-999999>

    Manage internal queue size, default size is 4096 events.
```

```{eval-rst}
.. cfgcmd:: set system conntrack log log-level <info | debug>

    Manage log level
```
