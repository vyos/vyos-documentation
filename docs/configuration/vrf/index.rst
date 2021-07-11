:lastproofread:2021-07-07

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

   Create new VRF instance with `<name>`. The name is used when placing
   individual interfaces into the VRF.

.. cfgcmd:: set vrf name <name> table <id>

   Configured routing table `<id>` is used by VRF `<name>`.

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

.. note:: VyOS 1.4 (sagitta) introduced dynamic routing support for VRFs.

Currently dynamic routing is supported for the following protocols:

- :ref:`routing-bgp`
- :ref:`routing-isis`
- :ref:`routing-ospf`
- :ref:`routing-static`

The CLI configuration is same as mentioned in above articles. The only
difference is, that each routing protocol used, must be prefixed with the `vrf
name <name>` command.

Example
^^^^^^^

The following commands would be required to set options for a given dynamic
routing protocol inside a given vrf:

- :ref:`routing-bgp`: ``set vrf name <name> protocols bgp ...``
- :ref:`routing-isis`: ``set vrf name <name> protocols isis ...``
- :ref:`routing-ospf`: ``set vrf name <name> protocols ospf ...``
- :ref:`routing-static`: ``set vrf name <name> protocols static ...``

Operation
=========

It is not sufficient to only configure a VRF but VRFs must be maintained, too.
For VRF maintenance the following operational commands are in place.

.. opcmd:: show vrf

   Lists VRFs that have been created

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

   When doing fault isolation with ping, you should first run it on the local
   host, to verify that the local network interface is up and running. Then,
   continue with hosts and gateways further down the road towards your
   destination. Round-trip time and packet loss statistics are computed.

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

   Displays the route packets taken to a network host utilizing VRF instance
   identified by `<name>`. When using the IPv4 or IPv6 option, displays the
   route packets taken to the given hosts IP address family. This option is
   useful when the host is specified as a hostname rather than an IP address.

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

    set protocols static route 10.20.0.0/24 interface eth2 vrf 'blue'
    set protocols static route 10.30.0.0/24 interface br10 vrf 'red'

    set service ssh disable-host-validation
    set service ssh vrf 'mgmt'

    set system name-servers-dhcp 'eth0'

    set vrf name blue protocols static route 10.0.0.0/24 interface eth1 vrf 'default'
    set vrf name blue table '3000'
    set vrf name mgmt table '1000'
    set vrf name red protocols static route 10.0.0.0/24 interface eth1 vrf 'default'
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
