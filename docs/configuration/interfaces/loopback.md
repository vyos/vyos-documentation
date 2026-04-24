lastproofread  
2023-01-20

# Loopback

The loopback networking interface is a virtual network device implemented
entirely in software. All traffic sent to it "loops back" and just targets
services on your local machine.

<div class="note">

<div class="title">

Note

</div>

There can only be one loopback `lo` interface on the system. If
you need multiple interfaces, please use the `dummy-interface`
interface type.

</div>

<div class="hint">

<div class="title">

Hint

</div>

A loopback interface is always up, thus it could be used for
management traffic or as source/destination for and `IGP (Interior
Gateway Protocol)` like `routing-bgp` so your internal BGP link is not
dependent on physical link states and multiple routes can be chosen to the
destination. A `dummy-interface` Interface should always be preferred
over a `loopback-interface` interface.

</div>

## Configuration

### Common interface configuration

<div class="cmdinclude" var0="loopback" var1="lo">

/\_include/interface-address.txt

</div>

<div class="cmdinclude" var0="loopback" var1="lo">

/\_include/interface-description.txt

</div>

## Operation

<div class="opcmd">

show interfaces loopback

Show brief interface information.

``` none
vyos@vyos:~$ show interfaces loopback
Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
Interface        IP Address                        S/L  Description
---------        ----------                        ---  -----------
lo               127.0.0.1/8                       u/u
                 ::1/128
```

</div>

<div class="opcmd">

show interfaces loopback lo

Show detailed information on the given loopback interface <span class="title-ref">lo</span>.

``` none
vyos@vyos:~$ show interfaces loopback lo
lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever

    RX:  bytes    packets     errors    dropped    overrun      mcast
           300          6          0          0          0          0
    TX:  bytes    packets     errors    dropped    carrier collisions
           300          6          0          0          0          0
```

</div>
