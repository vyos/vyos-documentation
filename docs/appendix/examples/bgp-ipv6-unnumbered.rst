.. _examples-bgp-ipv6-unnumbered:

VyOS BGP ipv6 unnumbered with extended nexthop
----------------------------------------------

General infomration can be found in the :ref:`routing-bgp` chapter.

Configuration
^^^^^^^^^^^^^

- Router A:

.. code-block:: sh

  set protocols bgp 65020 address-family ipv4-unicast redistribute connected
  set protocols bgp 65020 address-family ipv6-unicast redistribute connected
  set protocols bgp 65020 neighbor eth1 interface v6only
  set protocols bgp 65020 neighbor eth1 interface v6only peer-group 'fabric'
  set protocols bgp 65020 neighbor eth2 interface v6only
  set protocols bgp 65020 neighbor eth2 interface v6only peer-group 'fabric'
  set protocols bgp 65020 parameters bestpath as-path multipath-relax
  set protocols bgp 65020 parameters bestpath compare-routerid
  set protocols bgp 65020 parameters default no-ipv4-unicast
  set protocols bgp 65020 parameters router-id '192.168.0.1'
  set protocols bgp 65020 peer-group fabric address-family ipv4-unicast
  set protocols bgp 65020 peer-group fabric address-family ipv6-unicast
  set protocols bgp 65020 peer-group fabric capability extended-nexthop
  set protocols bgp 65020 peer-group fabric remote-as 'external'

- Router B:

.. code-block:: sh

  set protocols bgp 65021 address-family ipv4-unicast redistribute connected
  set protocols bgp 65021 address-family ipv6-unicast redistribute connected
  set protocols bgp 65021 neighbor eth1 interface v6only
  set protocols bgp 65021 neighbor eth1 interface v6only peer-group 'fabric'
  set protocols bgp 65021 neighbor eth2 interface v6only
  set protocols bgp 65021 neighbor eth2 interface v6only peer-group 'fabric'
  set protocols bgp 65021 parameters bestpath as-path multipath-relax
  set protocols bgp 65021 parameters bestpath compare-routerid
  set protocols bgp 65021 parameters default no-ipv4-unicast
  set protocols bgp 65021 parameters router-id '192.168.0.2'
  set protocols bgp 65021 peer-group fabric address-family ipv4-unicast
  set protocols bgp 65021 peer-group fabric address-family ipv6-unicast
  set protocols bgp 65021 peer-group fabric capability extended-nexthop
  set protocols bgp 65021 peer-group fabric remote-as 'external'

Results
^^^^^^^^^^^^^

- Router A:

.. code-block:: sh

  vyos@vyos:~$ show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             62.104.XXX.XXX/24                 u/u
  eth1             -                                 u/u
  eth2             -                                 u/u
  lo               127.0.0.1/8                       u/u
                   192.168.0.1/32
                   ::1/128

.. code-block:: sh

  vyos@vyos:~$ show ip route
  Codes: K - kernel route, C - connected, S - static, R - RIP,
         O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
         T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
         F - PBR, f - OpenFabric,
         > - selected route, * - FIB route

  S>* 0.0.0.0/0 [210/0] via 62.104.XXX.XXX, eth0, 03:21:53
  C>* 62.104.56.0/24 is directly connected, eth0, 03:21:53
  C>* 192.168.0.1/32 is directly connected, lo, 03:21:56
  B>* 192.168.0.2/32 [20/0] via fe80::a00:27ff:fe3b:7ed2, eth2, 00:05:07
    *                       via fe80::a00:27ff:fe7b:4000, eth1, 00:05:07

.. code-block:: sh

  vyos@vyos:~$ ping 192.168.0.2
  PING 192.168.0.2 (192.168.0.2) 56(84) bytes of data.
  64 bytes from 192.168.0.2: icmp_seq=1 ttl=64 time=0.575 ms
  64 bytes from 192.168.0.2: icmp_seq=2 ttl=64 time=0.628 ms
  64 bytes from 192.168.0.2: icmp_seq=3 ttl=64 time=0.581 ms
  64 bytes from 192.168.0.2: icmp_seq=4 ttl=64 time=0.682 ms
  64 bytes from 192.168.0.2: icmp_seq=5 ttl=64 time=0.597 ms

  --- 192.168.0.2 ping statistics ---
  5 packets transmitted, 5 received, 0% packet loss, time 4086ms
  rtt min/avg/max/mdev = 0.575/0.612/0.682/0.047 ms

.. code-block:: sh

  vyos@vyos:~$ show ip bgp summary

  IPv4 Unicast Summary:
  BGP router identifier 192.168.0.1, local AS number 65020 vrf-id 0
  BGP table version 4
  RIB entries 5, using 800 bytes of memory
  Peers 2, using 41 KiB of memory
  Peer groups 1, using 64 bytes of memory

  Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd
  eth1            4      65021      13      13        0    0    0 00:05:33            2
  eth2            4      65021      13      14        0    0    0 00:05:29            2

  Total number of neighbors 2

- Router B:

.. code-block:: sh

  vyos@vyos:~$ show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             62.104.XXX.XXX/24                 u/u
  eth1             -                                 u/u
  eth2             -                                 u/u
  lo               127.0.0.1/8                       u/u
                   192.168.0.2/32
                   ::1/128

.. code-block:: sh

  vyos@vyos:~$ show ip route
  Codes: K - kernel route, C - connected, S - static, R - RIP,
         O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
         T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
         F - PBR, f - OpenFabric,
         > - selected route, * - FIB route

  S>* 0.0.0.0/0 [210/0] via 62.104.XXX.XXX, eth0, 00:44:08
  C>* 62.104.56.0/24 is directly connected, eth0, 00:44:09
  B>* 192.168.0.1/32 [20/0] via fe80::a00:27ff:fe2d:205d, eth1, 00:06:18
    *                       via fe80::a00:27ff:fe93:e142, eth2, 00:06:18
  C>* 192.168.0.2/32 is directly connected, lo, 00:44:11

.. code-block:: sh

  vyos@vyos:~$ ping 192.168.0.1
  PING 192.168.0.1 (192.168.0.1) 56(84) bytes of data.
  64 bytes from 192.168.0.1: icmp_seq=1 ttl=64 time=0.427 ms
  64 bytes from 192.168.0.1: icmp_seq=2 ttl=64 time=0.471 ms
  64 bytes from 192.168.0.1: icmp_seq=3 ttl=64 time=0.782 ms
  64 bytes from 192.168.0.1: icmp_seq=4 ttl=64 time=0.715 ms

  --- 192.168.0.1 ping statistics ---
  4 packets transmitted, 4 received, 0% packet loss, time 3051ms
  rtt min/avg/max/mdev = 0.427/0.598/0.782/0.155 ms

.. code-block:: sh

  vyos@vyos:~$ show ip bgp summary
  IPv4 Unicast Summary:
  BGP router identifier 192.168.0.2, local AS number 65021 vrf-id 0
  BGP table version 4
  RIB entries 5, using 800 bytes of memory
  Peers 2, using 41 KiB of memory
  Peer groups 1, using 64 bytes of memory

  Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd
  eth1            4      65020      14      14        0    0    0 00:06:40            2
  eth2            4      65020      14      14        0    0    0 00:06:37            2

  Total number of neighbors 2

