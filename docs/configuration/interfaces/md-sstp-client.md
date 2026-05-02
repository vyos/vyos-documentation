lastproofread  
2022-12-11

# SSTP Client

`SSTP (Secure Socket Tunneling Protocol)` is a form of `VTP (Virtual
Private Network)` tunnel that provides a mechanism to transport PPP traffic
through an SSL/TLS channel. SSL/TLS provides transport-level security with key
negotiation, encryption and traffic integrity checking. The use of SSL/TLS over
TCP port 443 (by default, port can be changed) allows SSTP to pass through
virtually all firewalls and proxy servers except for authenticated web proxies.

<div class="note">

<div class="title">

Note

</div>

VyOS also comes with a build in SSTP server, see `sstp`.

</div>

## Configuration

### Common interface configuration

<div class="cmdinclude" var0="sstpc" var1="sstpc0">

/\_include/interface-description.txt

</div>

<div class="cmdinclude" var0="sstpc" var1="sstpc0">

/\_include/interface-disable.txt

</div>

<div class="cmdinclude" var0="sstpc" var1="sstpc0">

/\_include/interface-mtu.txt

</div>

<div class="cmdinclude" var0="sstpc" var1="sstpc0">

/\_include/interface-vrf.txt

</div>

### SSTP Client Options

<div class="cfgcmd">

set interfaces sstpc \<interface\> no-default-route

Only request an address from the SSTP server but do not install any default
route.

Example:

``` none
set interfaces sstpc sstpc0 no-default-route
```

<div class="note">

<div class="title">

Note

</div>

This command got added in VyOS 1.4 and inverts the logic from the old
`default-route` CLI option.

</div>

</div>

<div class="cfgcmd">

set interfaces sstpc \<interface\> default-route-distance \<distance\>

Set the distance for the default gateway sent by the SSTP server.

Example:

``` none
set interfaces sstpc sstpc0 default-route-distance 220
```

</div>

<div class="cfgcmd">

set interfaces sstpc \<interface\> no-peer-dns

Use this command to not install advertised DNS nameservers into the local
system.

</div>

<div class="cfgcmd">

set interfaces sstpc \<interface\> server \<address\>

SSTP remote server to connect to. Can be either an IP address or FQDN.

</div>

<div class="cfgcmd">

set interfaces sstpc \<interface\> ip adjust-mss \<mss | clamp-mss-to-pmtu\>

As Internet wide PMTU discovery rarely works, we sometimes need to clamp our
TCP MSS value to a specific value. This is a field in the TCP options part of
a SYN packet. By setting the MSS value, you are telling the remote side
unequivocally 'do not try to send me packets bigger than this value'.

<div class="note">

<div class="title">

Note

</div>

This command was introduced in VyOS 1.4 - it was previously called:
`set firewall options interface <name> adjust-mss <value>`

</div>

<div class="hint">

<div class="title">

Hint

</div>

MSS value = MTU - 20 (IP header) - 20 (TCP header), resulting in
1452 bytes on a 1492 byte MTU.

</div>

Instead of a numerical MSS value <span class="title-ref">clamp-mss-to-pmtu</span> can be used to
automatically set the proper value.

</div>

<div class="cfgcmd">

set interfaces sstpc \<interface\> ip disable-forwarding

Configure interface-specific Host/Router behaviour. If set, the interface will
switch to host mode and IPv6 forwarding will be disabled on this interface.

</div>

<div class="cfgcmd">

set interfaces sstpc \<interface\> ip source-validation \<strict | loose | disable\>

Enable policy for source validation by reversed path, as specified in
`3704`. Current recommended practice in `3704` is to enable strict
mode to prevent IP spoofing from DDos attacks. If using asymmetric routing
or other complicated routing, then loose mode is recommended.

- strict: Each incoming packet is tested against the FIB and if the interface
  is not the best reverse path the packet check will fail. By default failed
  packets are discarded.
- loose: Each incoming packet's source address is also tested against the FIB
  and if the source address is not reachable via any interface the packet
  check will fail.
- disable: No source validation

</div>

## Operation

<div class="opcmd">

show interfaces sstpc \<interface\>

Show detailed information on given <span class="title-ref">\<interface\></span>

``` none
vyos@vyos:~$ show interfaces sstpc sstpc10
sstpc10: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UNKNOWN group default qlen 3
    link/ppp
    inet 192.0.2.5 peer 192.0.2.254/32 scope global sstpc10
       valid_lft forever preferred_lft forever
    inet6 fe80::fd53:c7ff:fe8b:144f/64 scope link
       valid_lft forever preferred_lft forever

    RX:  bytes  packets  errors  dropped  overrun       mcast
           215        9       0        0        0           0
    TX:  bytes  packets  errors  dropped  carrier  collisions
           539       14       0        0        0           0
```

</div>

### Connect/Disconnect

<div class="opcmd">

disconnect interface \<interface\>

Test disconnecting given connection-oriented interface. <span class="title-ref">\<interface\></span> can be
`sstpc0` as the example.

</div>

<div class="opcmd">

connect interface \<interface\>

Test connecting given connection-oriented interface. <span class="title-ref">\<interface\></span> can be
`sstpc0` as the example.

</div>
