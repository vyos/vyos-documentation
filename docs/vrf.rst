.. _vrf:

###
VRF
###

:abbr:`VRF (Virtual Routing and Forwarding)` devices combined with ip rules
provides the ability to create virtual routing and forwarding domains (aka
VRFs, VRF-lite to be specific) in the Linux network stack. One use case is the
multi-tenancy problem where each tenant has their own unique routing tables and
in the very least need different default gateways.

.. warning:: VRFs are an "needs testing" feature. If you think things should be
   different then they are implemented and handled right now - please feedback
   via a task created in Phabricator_.


Configuration
=============

A VRF device is created with an associated route table. Network interfaces are
then enslaved to a VRF device.

.. cfgcmd:: set vrf name <name>

   Create new VRF instance with `<name>`. The name is used when placing individual
   interfaces into the VRF.

.. cfgcmd:: set vrf name <name> table <id>

   Configure use routing table `<id>` used by VRF `<name>`.

   .. note:: A routing table ID can not be modified once it is assigned. It can
      only be changed by deleting and re-adding the VRF instance.


.. cfgcmd:: set vrf bind-to-all

   By default the scope of the port bindings for unbound sockets is limited to
   the default VRF. That is, it will not be matched by packets arriving on
   interfaces enslaved to a VRF and processes may bind to the same port if
   they bind to a VRF.

   TCP & UDP services running in the default VRF context (ie., not bound to any
   VRF device) can work across all VRF domains by enabling this option.

Interfaces
----------

When VRFs are used it is not only mandatory to create a VRF but also the VRF
itself needs to be assigned to an interface.

.. cfgcmd:: set interfaces <dummy | ethernet | bonding | bridge | pppoe> <interface> vrf <name>

   Assign interface identified by `<interface>` to VRF named `<name>`.

Routing
-------

Static
^^^^^^

Static routes are manually configured routes, which, in general, cannot be
updated dynamically from information VyOS learns about the network topology from
other routing protocols. However, if a link fails, the router will remove
routes, including static routes, from the :abbr:`RIPB (Routing Information
Base)` that used this interface to reach the next hop. In general, static
routes should only be used for very simple network topologies, or to override
the behavior of a dynamic routing protocol for a small number of routes. The
collection of all routes the router has learned from its configuration or from
its dynamic routing protocols is stored in the RIB. Unicast routes are directly
used to determine the forwarding table used for unicast packet forwarding.

Static Routes
"""""""""""""

.. cfgcmd:: set protocols vrf <name> static route <subnet> next-hop <address>

   Configure next-hop `<address>` for an IPv4 static route in the VRF identified
   by `<name>`. Multiple static routes can be created.

.. cfgcmd:: set protocols vrf <name> static route <subnet> next-hop <address> disable

   Disable IPv4 static route entry in the VRF identified by `<name>`

.. cfgcmd:: set protocols vrf <name> static route <subnet> next-hop <address> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address>

   Configure next-hop `<address>` for an IPv6 static route in the VRF identified
   by `<name>`. Multiple IPv6 static routes can be created.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address> disable

   Disable IPv6 static route entry in the VRF identified by `<name>`.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

   .. note:: Routes with a distance of 255 are effectively disabled and not
      installed into the kernel.


Leaking
"""""""

.. cfgcmd:: set protocols vrf <name> static route <subnet> next-hop <address> next-hop-vrf <default | vrf-name>

   Use this command if you have shared services or routes that should be shared
   between multiple VRF instances. This will add an IPv4 route to VRF `<name>`
   routing table to reach a `<subnet>` via a next-hop gatewys `<address>` in
   a different VRF or leak it into the default VRF.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address> next-hop-vrf <default | vrf-name>

   Use this command if you have shared services or routes that should be shared
   between multiple VRF instances. This will add an IPv6 route to VRF `<name>`
   routing table to reach a `<subnet>` via a next-hop gatewys `<address>` in
   a different VRF or leak it into the default VRF.


Interface Routes
""""""""""""""""

.. cfgcmd:: set protocols vrf <name> static interface-route <subnet> next-hop-interface <interface>

   Allows you to configure the next-hop interface for an interface-based IPv4
   static route. `<interface>` will be the next-hop interface where trafic is
   routed for the given `<subnet>`.

.. cfgcmd:: set protocols vrf <name> static interface-route <subnet> next-hop-interface <interface> disable

   Disables interface-based IPv4 static route.

.. cfgcmd:: set protocols vrf <name> static interface-route <subnet> next-hop-interface <interface> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

.. cfgcmd:: set protocols vrf <name> static interface-route6 <subnet> next-hop-interface <interface>

   Allows you to configure the next-hop interface for an interface-based IPv6
   static route. `<interface>` will be the next-hop interface where trafic is
   routed for the given `<subnet>`.

.. cfgcmd:: set protocols vrf <name> static interface-route6 <subnet> next-hop-interface <interface> disable

   Disables interface-based IPv6 static route.

.. cfgcmd:: set protocols vrf <name> static interface-route6 <subnet> next-hop-interface <interface> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

Blackhole
"""""""""

.. cfgcmd:: set protocols vrf <name> static route <subnet> blackhole

   Use this command to configure a "black-hole" route on the router. A
   black-hole route is a route for which the system silently discard packets
   that are matched. This prevents networks leaking out public interfaces, but
   it does not prevent them from being used as a more specific route inside your
   network.

.. cfgcmd:: set protocols vrf <name> static route <subnet> blackhole distance <distance>

   Defines blackhole distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> blackhole

   Use this command to configure a "black-hole" route on the router. A
   black-hole route is a route for which the system silently discard packets
   that are matched. This prevents networks leaking out public interfaces, but
   it does not prevent them from being used as a more specific route inside your
   network.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> blackhole distance <distance>

   Defines blackhole distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.


Operation
=========

It is not sufficient to only configure a VRF but VRFs must be maintained, too.
For VR Fmaintenance the followin operational commands are in place.

.. opcmd:: show vrf

   List VRFs that have been created

   .. code-block:: none

     vyos@vyos:~$ show vrf
     VRF name          state     mac address        flags                     interfaces
     --------          -----     -----------        -----                     ----------
     blue              up        de:c4:83:d8:74:24  noarp,master,up,lower_up  dum200,eth0.302
     red               up        be:36:ce:02:df:aa  noarp,master,up,lower_up  dum100,eth0.300,bond0.100,peth0

   .. note:: Command should probably be extended to list also the real interfaces
      assigned to this one VRF to get a better overview.

.. opcmd:: show vrf <name>

   .. code-block:: none

     vyos@vyos:~$ show vrf name blue
     VRF name          state     mac address        flags                     interfaces
     --------          -----     -----------        -----                     ----------
     blue              up        de:c4:83:d8:74:24  noarp,master,up,lower_up  dum200,eth0.302

.. opcmd:: show ip route vrf <name>

   Display IPv4 routing table for VRF identified by `<name>`.

   .. code-block:: none

     vyos@vyos:~$ show ip route vrf blue
     Codes: K - kernel route, C - connected, S - static, R - RIP,
            O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
            T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
            F - PBR, f - OpenFabric,
            > - selected route, * - FIB route, q - queued route, r - rejected route

     VRF blue:
     K   0.0.0.0/0 [255/8192] unreachable (ICMP unreachable), 00:00:50
     S>* 172.16.0.0/16 [1/0] via 192.0.2.1, dum1, 00:00:02
     C>* 192.0.2.0/24 is directly connected, dum1, 00:00:06


.. opcmd:: show ipv6 route vrf <name>

   Display IPv6 routing table for VRF identified by `<name>`.

   .. code-block:: none

     vyos@vyos:~$ show ipv6 route vrf red
     Codes: K - kernel route, C - connected, S - static, R - RIPng,
            O - OSPFv3, I - IS-IS, B - BGP, N - NHRP, T - Table,
            v - VNC, V - VNC-Direct, A - Babel, D - SHARP, F - PBR,
            f - OpenFabric,
            > - selected route, * - FIB route, q - queued route, r - rejected route

     VRF red:
     K   ::/0 [255/8192] unreachable (ICMP unreachable), 00:43:20
     C>* 2001:db8::/64 is directly connected, dum1, 00:02:19
     C>* fe80::/64 is directly connected, dum1, 00:43:19
     K>* ff00::/8 [0/256] is directly connected, dum1, 00:43:19


.. opcmd:: ping <host> vrf <name>

   The ping command is used to test whether a network host is reachable or not.

   Ping uses ICMP protocol's mandatory ECHO_REQUEST datagram to elicit an
   ICMP ECHO_RESPONSE from a host or gateway. ECHO_REQUEST datagrams (pings)
   will have an IP and ICMP header, followed by "struct timeval" and an
   arbitrary number of pad bytes used to fill out the packet.

   When doing fault isolation with ping, your should first run it on the local
   host, to verify that the local network interface is up and running. Then,
   continue with hosts and gateways further down the road towards your
   destination. Round-trip times and packet loss statistics are computed.

   Duplicate packets are not included in the packet loss calculation, although
   the round-trip time of these packets is used in calculating the minimum/
   average/maximum round-trip time numbers.

   Ping command can be interrupted at any given time using `<Ctrl>+c`- A brief
   statistic is shown afterwards.

   .. code-block:: none

     vyos@vyos:~$ ping 192.0.2.1 vrf red
     PING 192.0.2.1 (192.0.2.1) 56(84) bytes of data.
     64 bytes from 192.0.2.1: icmp_seq=1 ttl=64 time=0.070 ms
     64 bytes from 192.0.2.1: icmp_seq=2 ttl=64 time=0.078 ms
     ^C
     --- 192.0.2.1 ping statistics ---
     2 packets transmitted, 2 received, 0% packet loss, time 4ms
     rtt min/avg/max/mdev = 0.070/0.074/0.078/0.004 ms

.. opcmd:: traceroute vrf <name> [ipv4 | ipv6] <host>

   Displays the route packets take to a network host utilizing VRF instance
   identified by `<name>`. When using the IPv4 or IPv6 option, display the route
   packets take to the for the given hosts IP address family. This option is
   useful when the host specified is a hostname rather than an IP address.


.. include:: common-references.rst
