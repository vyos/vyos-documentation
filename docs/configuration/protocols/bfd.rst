:lastproofread: 2022-02-05

.. include:: /_include/need_improvement.txt

.. _routing-bfd:

###
BFD
###

:abbr:`BFD (Bidirectional Forwarding Detection)` is described and extended by
the following RFCs: :rfc:`5880`, :rfc:`5881` and :rfc:`5883`.

In the age of very fast networks, a second of unreachability may equal millions of lost packets.
The idea behind BFD is to detect very quickly when a peer is down and take action extremely fast.

BFD sends lots of small UDP packets very quickly to ensures that the peer is still alive.

This allows avoiding the timers defined in BGP and OSPF protocol to expires.

Configure BFD
=============

.. cfgcmd:: set protocols bfd peer <address>

   Set BFD peer IPv4 address or IPv6 address

.. cfgcmd:: set protocols bfd peer <address> echo-mode

   Enables the echo transmission mode

.. cfgcmd:: set protocols bfd peer <address> multihop

   Allow this BFD peer to not be directly connected

.. cfgcmd:: set protocols bfd peer <address> source
   [address <address> | interface <interface>]

   Bind listener to specific interface/address, mandatory for IPv6

.. cfgcmd:: set protocols bfd peer <address> interval echo-interval <10-60000>

   The minimal echo receive transmission interval that this system is
   capable of handling

.. cfgcmd:: set protocols bfd peer <address> interval multiplier <2-255>

   Remote transmission interval will be multiplied by this value

.. cfgcmd:: set protocols bfd peer <address> interval
   [receive | transmit] <10-60000>

   Interval in milliseconds

.. cfgcmd:: set protocols bfd peer <address> shutdown

   Disable a BFD peer


Enable BFD in BGP
-----------------

.. cfgcmd:: set protocols bgp neighbor <neighbor> bfd

   Enable BFD on a single BGP neighbor

.. cfgcmd:: set protocols bgp peer-group <neighbor> bfd

   Enable BFD on a BGP peer group


Enable BFD in OSPF
------------------

.. cfgcmd:: set protocols ospf interface <interface> bfd

   Enable BFD for OSPF on an interface

.. cfgcmd:: set protocols ospfv3 interface <interface> bfd

   Enable BFD for OSPFv3 on an interface


Enable BFD in ISIS
------------------

.. cfgcmd:: set protocols isis <name> interface <interface> bfd

   Enable BFD for ISIS on an interface



Operational Commands
====================

.. opcmd:: show bfd peers

   Show all BFD peers

   .. code-block:: none

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


