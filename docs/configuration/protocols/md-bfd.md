lastproofread  
2023-01-27

# BFD

`BFD (Bidirectional Forwarding Detection)` is described and extended by
the following RFCs: `5880`, `5881` and `5883`.

In the age of very fast networks, a second of unreachability may equal millions of lost packets.
The idea behind BFD is to detect very quickly when a peer is down and take action extremely fast.

BFD sends lots of small UDP packets very quickly to ensures that the peer is still alive.

This allows avoiding the timers defined in BGP and OSPF protocol to expires.

## Configure BFD

<div class="cfgcmd">

set protocols bfd peer \<address\>

Set BFD peer IPv4 address or IPv6 address

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> echo-mode

Enables the echo transmission mode

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> multihop

Allow this BFD peer to not be directly connected

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> source
\[address \<address\> | interface \<interface\>\]

Bind listener to specific interface/address, mandatory for IPv6

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> interval echo-interval \<10-60000\>

The minimal echo receive transmission interval that this system is
capable of handling

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> interval multiplier \<2-255\>

Remote transmission interval will be multiplied by this value

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> interval
\[receive | transmit\] \<10-60000\>

Interval in milliseconds

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> shutdown

Disable a BFD peer

</div>

<div class="cfgcmd">

set protocols bfd peer \<address\> minimum-ttl \<1-254\>

For multi hop sessions only. Configure the minimum expected TTL for an
incoming BFD control packet.

This feature serves the purpose of thightening the packet validation
requirements to avoid receiving BFD control packets from other sessions.

</div>

### Enable BFD in BGP

<div class="cfgcmd">

set protocols bgp neighbor \<neighbor\> bfd

Enable BFD on a single BGP neighbor

</div>

<div class="cfgcmd">

set protocols bgp peer-group \<neighbor\> bfd

Enable BFD on a BGP peer group

</div>

### Enable BFD in OSPF

<div class="cfgcmd">

set protocols ospf interface \<interface\> bfd

Enable BFD for OSPF on an interface

</div>

<div class="cfgcmd">

set protocols ospfv3 interface \<interface\> bfd

Enable BFD for OSPFv3 on an interface

</div>

### Enable BFD in ISIS

<div class="cfgcmd">

set protocols isis \<name\> interface \<interface\> bfd

Enable BFD for ISIS on an interface

</div>

## Operational Commands

<div class="opcmd">

show bfd peers

Show all BFD peers

``` none
BFD Peers:
     peer 198.51.100.33 vrf default interface eth4.100
             ID: 4182341893
             Remote ID: 12678929647
             Status: up
             Uptime: 1 month(s), 16 hour(s), 29 minute(s), 38 second(s)
             Diagnostics: ok
             Remote diagnostics: ok
             Local timers:
                     Receive interval: 300ms
                     Transmission interval: 300ms
                     Echo transmission interval: 50ms
             Remote timers:
                     Receive interval: 300ms
                     Transmission interval: 300ms
                     Echo transmission interval: 0ms

     peer 198.51.100.55 vrf default interface eth4.101
             ID: 4618932327
             Remote ID: 3312345688
             Status: up
             Uptime: 20 hour(s), 16 minute(s), 19 second(s)
             Diagnostics: ok
             Remote diagnostics: ok
             Local timers:
                     Receive interval: 300ms
                     Transmission interval: 300ms
                     Echo transmission interval: 50ms
             Remote timers:
                     Receive interval: 300ms
                     Transmission interval: 300ms
                     Echo transmission interval: 0ms
```

</div>

## BFD Static Route Monitoring

A monitored static route conditions the installation to the RIB on the BFD
session running state: when BFD session is up the route is installed to RIB,
but when the BFD session is down it is removed from the RIB.

### Configuration

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\>
bfd profile \<profile\>

Configure a static route for \<subnet\> using gateway \<address\>
and use the gateway address as BFD peer destination address.

</div>

<div class="cfgcmd">

set protocols static route \<subnet\> next-hop \<address\>
bfd multi-hop source \<address\> profile \<profile\>

Configure a static route for \<subnet\> using gateway \<address\>
, use source address to identify the peer when is multi-hop session
and the gateway address as BFD peer destination address.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\>
bfd profile \<profile\>

Configure a static route for \<subnet\> using gateway \<address\>
and use the gateway address as BFD peer destination address.

</div>

<div class="cfgcmd">

set protocols static route6 \<subnet\> next-hop \<address\>
bfd multi-hop source \<address\> profile \<profile\>

Configure a static route for \<subnet\> using gateway \<address\>
, use source address to identify the peer when is multi-hop session
and the gateway address as BFD peer destination address.

</div>

## Operational Commands

<div class="opcmd">

show bfd static routes

Showing BFD monitored static routes

``` none
Showing BFD monitored static routes:

  Next hops:
    VRF default IPv4 Unicast:
        10.10.13.3/32 peer 192.168.2.3 (status: installed)
        172.16.10.3/32 peer 192.168.10.1 (status: uninstalled)

    VRF default IPv4 Multicast:

    VRF default IPv6 Unicast:
```

</div>
