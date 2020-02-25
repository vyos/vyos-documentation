.. include:: ../_include/need_improvement.txt

.. _routing-bfd:

###
BFD
###

:abbr:`BFD (Bidirectional Forwarding Detection)` is described and extended by
the following RFCs: :rfc:`5880`, :rfc:`5881` and :rfc:`5883`.


Configure BFD
=============

.. cfgcmd:: set protocols bfd <address>

   Set BFD peer IPv4 address or IPv6 address

.. cfgcmd:: set protocols bfd <address> echo-mode

   Enables the echo transmission mode

.. cfgcmd:: set protocols bfd <address> multihop

   Allow this BFD peer to not be directly connected

.. cfgcmd:: set protocols bfd <address> source [address <address> | interface <interface>]

   Bind listener to specifid interface/address, mandatory for IPv6

.. cfgcmd:: set protocols bfd <address> interval echo-interval <10-60000>

   The minimal echo receive transmission interval that this system is capable of handling

.. cfgcmd:: set protocols bfd <address> interval multiplier <2-255>

   Remote transmission interval will be multiplied by this value

.. cfgcmd:: set protocols bfd <address> interval [receive | transmit] <10-60000>

   Interval in milliseconds

.. cfgcmd:: set protocols bfd <address> shutdown

   Disable a BFD peer


Enable BFD in BGP
-----------------

.. cfgcmd:: set protocols bgp <asn> neighbor <address> bfd

   Enable BFD on a single BGP neighbor

.. cfgcmd:: set protocols bgp <asn> peer-group <group> bfd

   Enable BFD on a BGP peer group



Enable BFD in OSPF
------------------

.. cfgcmd:: set interfaces ethernet <ethN> ip ospf bfd

   Enable BFD for ospf on a interface

.. cfgcmd:: set interfaces ethernet <ethN> ipv6 ospfv3 bfd

   Enable BFD for ospfv3 on a interface



Operational Commands
====================

.. opcmd:: show protocols bfd peer

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


