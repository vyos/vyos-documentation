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

### Define Conection Timeouts

VyOS supports setting timeouts for connections according to the
connection type. You can set timeout values for generic connections, for ICMP
connections, UDP connections, or for TCP connections in a number of different
states.

```{eval-rst}
.. cfgcmd:: set system conntrack timeout icmp <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout other <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp close <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp close-wait <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp established <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp fin-wait <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp last-ack <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp syn-recv <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp syn-sent <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout tcp time-wait <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout udp other <1-21474836>
    :defaultvalue:
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout udp stream <1-21474836>
    :defaultvalue:

    Set the timeout in secounds for a protocol or state.

```

You can also define custom timeout values to apply to a specific subset of
connections, based on a packet and flow selector. To do this, you need to
create a rule defining the packet and flow selector.

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> description <test>

    Set a rule description.

```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> destination address <ip-address>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> source address <ip-address>

    set a destination and/or source address. Accepted input:

    .. code-block:: none

        <x.x.x.x>    IP address to match
        <x.x.x.x/x>  Subnet to match
        <x.x.x.x>-<x.x.x.x>
                        IP range to match
        !<x.x.x.x>   Match everything except the specified address
        !<x.x.x.x/x> Match everything except the specified subnet
        !<x.x.x.x>-<x.x.x.x>
                        Match everything except the specified range
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> destination port <value>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> source port <value>

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
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol icmp <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol other <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp close <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp close-wait <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp established <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp fin-wait <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp last-ack <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp syn-recv <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp syn-sent <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol tcp time-wait <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol udp other <1-21474836>
```

```{eval-rst}
.. cfgcmd:: set system conntrack timeout custom rule <1-9999> protocol udp stream <1-21474836>

    Set the timeout in secounds for a protocol or state in a custom rule.

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

```{eval-rst}
.. cfgcmd:: set system conntrack ignore rule <1-9999> description <text>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore rule <1-9999> destination address <ip-address>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore rule <1-9999> destination port <port>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore rule <1-9999> inbound-interface <interface>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore rule <1-9999> protocol <protocol>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore rule <1-9999> source address <ip-address>
```

```{eval-rst}
.. cfgcmd:: set system conntrack ignore rule <1-9999> source port <port>

    Customized ignore rules, based on a packet and flow selector.
```

```{eval-rst}
.. cfgcmd:: set system conntrack log icmp destroy
```

```{eval-rst}
.. cfgcmd:: set system conntrack log icmp new
```

```{eval-rst}
.. cfgcmd:: set system conntrack log icmp update
```

```{eval-rst}
.. cfgcmd:: set system conntrack log other destroy
```

```{eval-rst}
.. cfgcmd:: set system conntrack log other new
```

```{eval-rst}
.. cfgcmd:: set system conntrack log other update
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp destroy
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp new
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp update close-wait
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp update established
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp update fin-wait
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp update last-ack
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp update syn-received
```

```{eval-rst}
.. cfgcmd:: set system conntrack log tcp update time-wait
```

```{eval-rst}
.. cfgcmd:: set system conntrack log udp destroy
```

```{eval-rst}
.. cfgcmd:: set system conntrack log udp new
```

```{eval-rst}
.. cfgcmd:: set system conntrack log udp update

    Log the connection tracking events per protocol.
```
