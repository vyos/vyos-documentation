.. _examples-bgp-ipv6-unnumbered:

#########################################
BGP IPv6 unnumbered with extended nexthop
#########################################

General information can be found in the :ref:`routing-bgp` chapter.

VyOS supports BGP unnumbered to exchange v4/v6 routes over a single BGP session 
using the default IPv6 link-local address present on an interface (:rfc:`5549`).

Keep in mind BGP unnumbered will only work on point-to-point links: It will 
not work if there's more than one possible peer on the same broadcast domain!

Basic Configuration
===================
This example is the minimum configuration needed to exchange v4 routes. 

.. code-block:: none

  Topology:

  Router-1      Router-2
    [eth0]------[eth0] 

Router 1:

.. code-block:: none

  set interfaces dummy dum0 address '192.168.1.1/32'
  set protocols bgp local-as '64512'
  set protocols bgp address-family ipv4-unicast redistribute connected
  set protocols bgp address-family ipv6-unicast redistribute
  set protocols bgp neighbor eth0 address-family ipv4-unicast
  set protocols bgp neighbor eth0 interface remote-as 'external'

Router 2:

.. code-block:: none

  set interfaces dummy dum0 address '192.168.1.2/32'
  set protocols bgp local-as '65000'
  set protocols bgp address-family ipv4-unicast redistribute connected
  set protocols bgp address-family ipv6-unicast redistribute
  set protocols bgp neighbor eth0 address-family ipv4-unicast
  set protocols bgp neighbor eth0 interface remote-as 'external'

Basic Configuration Results
===========================

Router 1:

.. code-block:: none

  vyos@rt1:~$  show interfaces 
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  dum0             192.168.1.1/32                    u/u  
  eth0             -                                 u/u  rt2-eth0
  eth1             -                                 u/D  rt2-eth1
  lo               127.0.0.1/8                       u/u  
                   ::1/128                                

Verify BGP neighborship is established:

.. code-block:: none

  vyos@rt1:~$ show ip bgp summary 

  IPv4 Unicast Summary:
  BGP router identifier 192.168.1.1, local AS number 64512 vrf-id 0
  BGP table version 2
  RIB entries 3, using 576 bytes of memory
  Peers 1, using 21 KiB of memory

  Neighbor        V         AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt
  eth0            4      65000         8         9        0    0    0 00:03:52            1        2

  Total number of neighbors 1

Verify we're learning routes from our neighbor (note how the next-hop address
is seen as the link-local address of our BGP peer)

.. code-block:: none

  vyos@rt1:~$ show ip route 
  Codes: K - kernel route, C - connected, S - static, R - RIP,
        O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
        T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
        F - PBR, f - OpenFabric,
        > - selected route, * - FIB route, q - queued, r - rejected, b - backup

  C>* 192.168.1.1/32 is directly connected, dum0, 00:03:37
  B>* 192.168.1.2/32 [20/0] via fe80::e89:aff:fe14:af00, eth0, weight 1, 00:03:12

.. code-block:: none

  vyos@rt1:~$ ping 192.168.1.2 count 3
  PING 192.168.1.2 (192.168.1.2) 56(84) bytes of data.
  64 bytes from 192.168.1.2: icmp_seq=1 ttl=64 time=3.17 ms
  64 bytes from 192.168.1.2: icmp_seq=2 ttl=64 time=3.60 ms
  64 bytes from 192.168.1.2: icmp_seq=3 ttl=64 time=0.852 ms

  --- 192.168.1.2 ping statistics ---
  3 packets transmitted, 3 received, 0% packet loss, time 7ms
  rtt min/avg/max/mdev = 0.852/2.540/3.595/1.205 ms

Example v4/v6 Configuration
===========================

This example will configure BGP to exchange v4/v6 routes over two separate 
unnumbered interfaces using a peer-group.

.. code-block:: none

  Topology:

  Router-1      Router-2
    [eth0]------[eth0] 
    [eth1]------[eth1] 

Router 1:

.. code-block:: none

  set interfaces dummy dum0 address '192.168.1.1/32'
  set interfaces dummy dum0 address '2001:dead:beef::1/128'
  set protocols bgp address-family ipv4-unicast redistribute connected
  set protocols bgp address-family ipv6-unicast redistribute connected
  set protocols bgp local-as '64512'
  set protocols bgp neighbor eth0 interface peer-group 'fabric'
  set protocols bgp neighbor eth1 interface peer-group 'fabric'
  set protocols bgp peer-group fabric address-family ipv4-unicast
  set protocols bgp peer-group fabric address-family ipv6-unicast
  set protocols bgp peer-group fabric capability extended-nexthop
  set protocols bgp peer-group fabric remote-as 'external'

Router 2:

.. code-block:: none

  set interfaces dummy dum0 address '192.168.1.2/32'
  set interfaces dummy dum0 address '2001:dead:beef::2/128'
  set protocols bgp address-family ipv4-unicast redistribute connected
  set protocols bgp address-family ipv6-unicast redistribute connected
  set protocols bgp local-as '65000'
  set protocols bgp neighbor eth0 interface peer-group 'fabric'
  set protocols bgp neighbor eth1 interface peer-group 'fabric'
  set protocols bgp peer-group fabric address-family ipv4-unicast
  set protocols bgp peer-group fabric address-family ipv6-unicast
  set protocols bgp peer-group fabric capability extended-nexthop
  set protocols bgp peer-group fabric remote-as 'external'

Note: FRR implicitly enables the extended-nexthop capability if you configure 
peering over a v6 link-local address. 
While this example explicitly enables it, it is not required in this use case. 

Advanced Example Results
========================

Router 1:

.. code-block:: none

  vyos@rt1:~$ show interfaces 
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  dum0             192.168.1.1/32                    u/u  
                   2001:dead:beef::1/128                  
  eth0             -                                 u/u  rt2-eth0
  eth1             -                                 u/u  rt2-eth1
  lo               127.0.0.1/8                       u/u  
                   ::1/128

Verify BGP neighborship is established and exchanging v4/v6 routes:

.. code-block:: none

  vyos@rt1:~$ show bgp summary 

  IPv4 Unicast Summary:
  BGP router identifier 192.168.1.1, local AS number 64512 vrf-id 0
  BGP table version 4
  RIB entries 3, using 576 bytes of memory
  Peers 2, using 43 KiB of memory
  Peer groups 1, using 64 bytes of memory

  Neighbor        V         AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt
  eth0            4      65000        21        21        0    0    0 00:13:13            1        2
  eth1            4      65000        21        22        0    0    0 00:13:13            1        2

  Total number of neighbors 2

  IPv6 Unicast Summary:
  BGP router identifier 192.168.1.1, local AS number 64512 vrf-id 0
  BGP table version 2
  RIB entries 3, using 576 bytes of memory
  Peers 2, using 43 KiB of memory
  Peer groups 1, using 64 bytes of memory

  Neighbor        V         AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt
  eth0            4      65000        21        21        0    0    0 00:13:13            1        2
  eth1            4      65000        21        22        0    0    0 00:13:13            1        2

Verify v4/v6 routes are being learned:

.. code-block:: none

  vyos@rt1:~$ show ip route 
  Codes: K - kernel route, C - connected, S - static, R - RIP,
        O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
        T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
        F - PBR, f - OpenFabric,
        > - selected route, * - FIB route, q - queued, r - rejected, b - backup

  C>* 192.168.1.1/32 is directly connected, dum0, 00:36:40
  B>* 192.168.1.2/32 [20/0] via fe80::e89:aff:fe14:af00, eth0, weight 1, 00:14:30
    *                       via fe80::e89:aff:fe14:af01, eth1, weight 1, 00:14:30
  vyos@rt1:~$ 
  vyos@rt1:~$ 
  vyos@rt1:~$ show ipv6 route 
  Codes: K - kernel route, C - connected, S - static, R - RIPng,
        O - OSPFv3, I - IS-IS, B - BGP, N - NHRP, T - Table,
        v - VNC, V - VNC-Direct, A - Babel, D - SHARP, F - PBR,
        f - OpenFabric,
        > - selected route, * - FIB route, q - queued, r - rejected, b - backup

  C>* 2001:dead:beef::1/128 is directly connected, dum0, 00:15:13
  B>* 2001:dead:beef::2/128 [20/0] via fe80::e89:aff:fe14:af00, eth0, weight 1, 00:14:33
    *                              via fe80::e89:aff:fe14:af01, eth1, weight 1, 00:14:33
  C * fe80::/64 is directly connected, eth0, 00:36:20
  C * fe80::/64 is directly connected, eth1, 00:36:20
  C * fe80::/64 is directly connected, dum0, 00:36:43
  C>* fe80::/64 is directly connected, lo, 00:36:53

Verify we can reach the remote router's v4/v6 loopback:

.. code-block:: none

  vyos@rt1:~$ ping 192.168.1.2 count 3 ; ping 2001:dead:beef::2 count 3
  PING 192.168.1.2 (192.168.1.2) 56(84) bytes of data.
  64 bytes from 192.168.1.2: icmp_seq=1 ttl=64 time=2.30 ms
  64 bytes from 192.168.1.2: icmp_seq=2 ttl=64 time=1.29 ms
  64 bytes from 192.168.1.2: icmp_seq=3 ttl=64 time=1.98 ms

  --- 192.168.1.2 ping statistics ---
  3 packets transmitted, 3 received, 0% packet loss, time 5ms
  rtt min/avg/max/mdev = 1.288/1.857/2.301/0.424 ms
  PING 2001:dead:beef::2(2001:dead:beef::2) 56 data bytes
  64 bytes from 2001:dead:beef::2: icmp_seq=1 ttl=64 time=1.23 ms
  64 bytes from 2001:dead:beef::2: icmp_seq=2 ttl=64 time=1.62 ms
  64 bytes from 2001:dead:beef::2: icmp_seq=3 ttl=64 time=0.731 ms

  --- 2001:dead:beef::2 ping statistics ---
  3 packets transmitted, 3 received, 0% packet loss, time 7ms
  rtt min/avg/max/mdev = 0.731/1.194/1.621/0.364 ms