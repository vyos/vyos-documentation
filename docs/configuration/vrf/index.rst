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

.. cfgcmd:: set vrf name <name> table <id>

   Create new VRF instance with `<name>` and <id>. The name is used when placing
   individual interfaces into the VRF.

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

.. cfgcmd:: set interfaces <dummy | ethernet | bonding | bridge | pppoe>
   <interface> vrf <name>

   Assign interface identified by `<interface>` to VRF named `<name>`.

Routing
-------

.. note:: VyOS 1.3 (equuleus) only supports VRF static routing. Dynamic routing
   for given VRFs was added in VyOS 1.4 (sagitta). This also came with a change
   in the CLI configuration which will be - of course - automatically migrated
   on upgrades.

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

.. cfgcmd:: set protocols vrf <name> static route <subnet> next-hop <address>
   disable

   Disable IPv4 static route entry in the VRF identified by `<name>`

.. cfgcmd:: set protocols vrf <name> static route <subnet> next-hop <address>
   distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address>

   Configure next-hop `<address>` for an IPv6 static route in the VRF identified
   by `<name>`. Multiple IPv6 static routes can be created.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address>
   disable

   Disable IPv6 static route entry in the VRF identified by `<name>`.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address>
   distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

   .. note:: Routes with a distance of 255 are effectively disabled and not
      installed into the kernel.


Leaking
"""""""

.. cfgcmd:: set protocols vrf <name> static route <subnet> next-hop <address>
   next-hop-vrf <default | vrf-name>

   Use this command if you have shared services or routes that should be shared
   between multiple VRF instances. This will add an IPv4 route to VRF `<name>`
   routing table to reach a `<subnet>` via a next-hop gatewys `<address>` in
   a different VRF or leak it into the default VRF.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> next-hop <address>
   next-hop-vrf <default | vrf-name>

   Use this command if you have shared services or routes that should be shared
   between multiple VRF instances. This will add an IPv6 route to VRF `<name>`
   routing table to reach a `<subnet>` via a next-hop gatewys `<address>` in
   a different VRF or leak it into the default VRF.


Interface Routes
""""""""""""""""

.. cfgcmd:: set protocols vrf <name> static interface-route <subnet>
   next-hop-interface <interface>

   Allows you to configure the next-hop interface for an interface-based IPv4
   static route. `<interface>` will be the next-hop interface where trafic is
   routed for the given `<subnet>`.

.. cfgcmd:: set protocols vrf <name> static interface-route <subnet>
   next-hop-interface <interface> disable

   Disables interface-based IPv4 static route.

.. cfgcmd:: set protocols vrf <name> static interface-route <subnet>
   next-hop-interface <interface> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

.. cfgcmd:: set protocols vrf <name> static interface-route6 <subnet>
   next-hop-interface <interface>

   Allows you to configure the next-hop interface for an interface-based IPv6
   static route. `<interface>` will be the next-hop interface where trafic is
   routed for the given `<subnet>`.

.. cfgcmd:: set protocols vrf <name> static interface-route6 <subnet>
   next-hop-interface <interface> disable

   Disables interface-based IPv6 static route.

.. cfgcmd:: set protocols vrf <name> static interface-route6 <subnet>
   next-hop-interface <interface> distance <distance>

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

.. cfgcmd:: set protocols vrf <name> static route <subnet> blackhole distance
   <distance>

   Defines blackhole distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> blackhole

   Use this command to configure a "black-hole" route on the router. A
   black-hole route is a route for which the system silently discard packets
   that are matched. This prevents networks leaking out public interfaces, but
   it does not prevent them from being used as a more specific route inside your
   network.

.. cfgcmd:: set protocols vrf <name> static route6 <subnet> blackhole distance
   <distance>

   Defines blackhole distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.


Operation
=========

It is not sufficient to only configure a VRF but VRFs must be maintained, too.
For VRF maintenance, the following operational commands are in place.

.. opcmd:: show vrf

   List VRFs that have been created

   .. code-block:: none

     vyos@vyos:~$ show vrf
     VRF name          state     mac address        flags                     interfaces
     --------          -----     -----------        -----                     ----------
     blue              up        00:53:12:d8:74:24  noarp,master,up,lower_up  dum200,eth0.302
     red               up        00:53:de:02:df:aa  noarp,master,up,lower_up  dum100,eth0.300,bond0.100,peth0

   .. note:: Command should probably be extended to list also the real
      interfaces assigned to this one VRF to get a better overview.

.. opcmd:: show vrf <name>

   .. code-block:: none

     vyos@vyos:~$ show vrf name blue
     VRF name          state     mac address        flags                     interfaces
     --------          -----     -----------        -----                     ----------
     blue              up        00:53:12:d8:74:24  noarp,master,up,lower_up  dum200,eth0.302

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

Example
=======

VRF route leaking
-----------------

The following example topology was build using EVE-NG.

.. figure:: /_static/images/vrf-example-topology-01.png
   :alt: VRF topology example

   VRF route leaking

* PC1 is in the ``default`` VRF and acting as e.g. a "fileserver"
* PC2 is in VRF ``blue`` which is the development department
* PC3 and PC4 are connected to a bridge device on router ``R1`` which is in VRF
  ``red``. Say this is the HR department.
* R1 is managed through an out-of-band network that resides in VRF ``mgmt``

Configuration
^^^^^^^^^^^^^

  .. code-block:: none

    set interfaces bridge br10 address '10.30.0.254/24'
    set interfaces bridge br10 member interface eth3
    set interfaces bridge br10 member interface eth4
    set interfaces bridge br10 vrf 'red'

    set interfaces ethernet eth0 address 'dhcp'
    set interfaces ethernet eth0 vrf 'mgmt'
    set interfaces ethernet eth1 address '10.0.0.254/24'
    set interfaces ethernet eth2 address '10.20.0.254/24'
    set interfaces ethernet eth2 vrf 'blue'

    set protocols static interface-route 10.20.0.0/24 next-hop-interface eth2 next-hop-vrf 'blue'
    set protocols static interface-route 10.30.0.0/24 next-hop-interface br10 next-hop-vrf 'red'
    set protocols vrf blue static interface-route 10.0.0.0/24 next-hop-interface eth1 next-hop-vrf 'default'
    set protocols vrf red static interface-route 10.0.0.0/24 next-hop-interface eth1 next-hop-vrf 'default'

    set service ssh disable-host-validation
    set service ssh vrf 'mgmt'

    set system domain-name 'vyos.net'
    set system host-name 'R1'
    set system name-server 'eth0'

    set vrf name blue table '3000'
    set vrf name mgmt table '1000'
    set vrf name red table '2000'

Operation
^^^^^^^^^

After committing the configuration we can verify all leaked routes are installed,
and try to ICMP ping PC1 from PC3.

  .. code-block:: none

    PCS> ping 10.0.0.1

    84 bytes from 10.0.0.1 icmp_seq=1 ttl=63 time=1.943 ms
    84 bytes from 10.0.0.1 icmp_seq=2 ttl=63 time=1.618 ms
    84 bytes from 10.0.0.1 icmp_seq=3 ttl=63 time=1.745 ms

  .. code-block:: none

    VPCS> show ip

    NAME        : VPCS[1]
    IP/MASK     : 10.30.0.1/24
    GATEWAY     : 10.30.0.254
    DNS         :
    MAC         : 00:50:79:66:68:0f

VRF default routing table
"""""""""""""""""""""""""

  .. code-block:: none

    vyos@R1:~$ show ip route
    Codes: K - kernel route, C - connected, S - static, R - RIP,
           O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
           T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
           F - PBR, f - OpenFabric,
           > - selected route, * - FIB route, q - queued, r - rejected, b - backup

    C>* 10.0.0.0/24 is directly connected, eth1, 00:07:44
    S>* 10.20.0.0/24 [1/0] is directly connected, eth2 (vrf blue), weight 1, 00:07:38
    S>* 10.30.0.0/24 [1/0] is directly connected, br10 (vrf red), weight 1, 00:07:38

VRF red routing table
"""""""""""""""""""""

  .. code-block:: none

    vyos@R1:~$ show ip route vrf red
    Codes: K - kernel route, C - connected, S - static, R - RIP,
           O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
           T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
           F - PBR, f - OpenFabric,
           > - selected route, * - FIB route, q - queued, r - rejected, b - backup

    VRF red:
    K>* 0.0.0.0/0 [255/8192] unreachable (ICMP unreachable), 00:07:57
    S>* 10.0.0.0/24 [1/0] is directly connected, eth1 (vrf default), weight 1, 00:07:40
    C>* 10.30.0.0/24 is directly connected, br10, 00:07:54

VRF blue routing table
""""""""""""""""""""""

  .. code-block:: none

    vyos@R1:~$ show ip route vrf blue
    Codes: K - kernel route, C - connected, S - static, R - RIP,
           O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
           T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
           F - PBR, f - OpenFabric,
           > - selected route, * - FIB route, q - queued, r - rejected, b - backup

    VRF blue:
    K>* 0.0.0.0/0 [255/8192] unreachable (ICMP unreachable), 00:08:00
    S>* 10.0.0.0/24 [1/0] is directly connected, eth1 (vrf default), weight 1, 00:07:44
    C>* 10.20.0.0/24 is directly connected, eth2, 00:07:53



.. include:: /_include/common-references.txt
