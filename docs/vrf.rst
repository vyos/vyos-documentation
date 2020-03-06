.. _vrf:

###
VRF
###

:abbr:`VRF (Virtual Routing and Forwarding)` devices combined with ip rules
provides the ability to create virtual routing and forwarding domains (aka
VRFs, VRF-lite to be specific) in the Linux network stack. One use case is the
multi-tenancy problem where each tenant has their own unique routing tables and
in the very least need different default gateways.

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

.. cfgcmd:: set interfaces dummy <interface> vrf <name>

   Assign dummy interface identified by `<interface>` to VRF named `<name>`.

   .. warning:: VRFs are still experimental - thus they are only available to
      certain interfaces types right now (``dummy``) to test out the
      functionality.

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

.. opcmd:: show vrf

   List VRFs that have been created

   .. code-block:: none

     vyos@vyos:~$ show vrf

     interface         state    mac                flags
     ---------         -----    ---                -----
     bar               up       ee:c7:5b:fc:ae:f9  noarp,master,up,lower_up
     foo               up       ee:bb:a4:ac:cd:20  noarp,master,up,lower_up

.. opcmd:: show vrf <name>

   .. code-block:: none

     vyos@vyos:~$ show vrf name bar
     interface         state    mac                flags
     ---------         -----    ---                -----
     bar               up       ee:c7:5b:fc:ae:f9  noarp,master,up,lower_up

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

