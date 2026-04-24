lastproofread  
2023-01-20

# Dummy

The dummy interface is really a little exotic, but rather useful nevertheless.
Dummy interfaces are much like the `loopback-interface` interface, except
you can have as many as you want.

<div class="note">

<div class="title">

Note

</div>

Dummy interfaces can be used as interfaces that always stay up (in
the same fashion to loopbacks in Cisco IOS), or for testing purposes.

</div>

<div class="hint">

<div class="title">

Hint

</div>

On systems with multiple redundant uplinks and routes,
it's a good idea to use a dedicated address for management and dynamic routing protocols.
However, assigning that address to a physical link is risky:
if that link goes down, that address will become inaccessible.
A common solution is to assign the management address to a loopback or a dummy interface
and advertise that address via all physical links, so that it's reachable
through any of them. Since in Linux-based systems, there can be only one loopback interface,
it's better to use a dummy interface for that purpose, since they can be added, removed,
and taken up and down independently.

</div>

## Configuration

### Common interface configuration

<div class="cmdinclude" var0="dummy" var1="dum0">

/\_include/interface-address.txt

</div>

<div class="cmdinclude" var0="dummy" var1="dum0">

/\_include/interface-description.txt

</div>

<div class="cmdinclude" var0="dummy" var1="dum0">

/\_include/interface-disable.txt

</div>

<div class="cmdinclude" var0="dummy" var1="dum0">

/\_include/interface-vrf.txt

</div>

## Operation

<div class="opcmd">

show interfaces dummy

Show brief interface information.

``` none
vyos@vyos:~$ show interfaces dummy
Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
Interface        IP Address                        S/L  Description
---------        ----------                        ---  -----------
dum0             172.18.254.201/32                 u/u
```

</div>

<div class="opcmd">

show interfaces dummy \<interface\>

Show detailed information on given <span class="title-ref">\<interface\></span>

``` none
vyos@vyos:~$ show interfaces dummy dum0
dum0: <BROADCAST,NOARP,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
    link/ether 26:7c:8e:bc:fc:f5 brd ff:ff:ff:ff:ff:ff
    inet 172.18.254.201/32 scope global dum0
       valid_lft forever preferred_lft forever
    inet6 fe80::247c:8eff:febc:fcf5/64 scope link
       valid_lft forever preferred_lft forever

    RX:  bytes    packets     errors    dropped    overrun      mcast
             0          0          0          0          0          0
    TX:  bytes    packets     errors    dropped    carrier collisions
       1369707       4267          0          0          0          0
```

</div>
