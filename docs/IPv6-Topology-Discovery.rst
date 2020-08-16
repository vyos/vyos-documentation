.. _IPv6-Topology-Discovery:

#######################
IPv6 Topology Discovery
#######################

IPv6 uses different techniques to discover its Neighbors/topology.

Router Discovery
================

.. opcmd:: force ipv6-rd interface <interface>

   Discover routers via <interface>.

   Example:

   .. code-block:: none

     vyos@vyos:~$ force ipv6-rd interface br2
     Soliciting ff02::2 (ff02::2) on br2...

     Hop limit                 :           60 (      0x3c)
     Stateful address conf.    :           No
     Stateful other conf.      :           No
     Mobile home agent         :           No
     Router preference         :         high
     Neighbor discovery proxy  :           No
     Router lifetime           :         1800 (0x00000708) seconds
     Reachable time            :  unspecified (0x00000000)
     Retransmit time           :  unspecified (0x00000000)
      Prefix                   : 240e:fe:8ca7:ea01::/64
       On-link                 :          Yes
       Autonomous address conf.:          Yes
       Valid time              :      2592000 (0x00278d00) seconds
       Pref. time              :        14400 (0x00003840) seconds
      Prefix                   : fc00:470:f1cd:101::/64
       On-link                 :          Yes
       Autonomous address conf.:          Yes
       Valid time              :      2592000 (0x00278d00) seconds
       Pref. time              :        14400 (0x00003840) seconds
      Recursive DNS server     : fc00:470:f1cd::ff00
       DNS server lifetime     :          600 (0x00000258) seconds
      Source link-layer address: 00:98:2B:F8:3F:11
      from fe80::298:2bff:fef8:3f11
      
.. opcmd:: force ipv6-rd interface <interface> address <ipv6-address>

   Discover the router <ipv6-address> through <interface>.
   
   Example:
   
   .. code-block:: none
     vyos@vyos:~$ force ipv6-rd interface br1 address fc00:470:f1cd::1
     Soliciting fc00:470:f1cd::1 (fc00:470:f1cd::1) on br1...

     Hop limit                 :           64 (      0x40)
     Stateful address conf.    :           No
     Stateful other conf.      :           No
     Mobile home agent         :           No
     Router preference         :         high
     Neighbor discovery proxy  :           No
     Router lifetime           :         1800 (0x00000708) seconds
     Reachable time            :  unspecified (0x00000000)
     Retransmit time           :  unspecified (0x00000000)
      Prefix                   : 240e:fe:8ca3:2e02::/64
       On-link                 :          Yes
       Autonomous address conf.:          Yes
       Valid time              :      2592000 (0x00278d00) seconds
       Pref. time              :        14400 (0x00003840) seconds
      Prefix                   : fc00:470:f1cd::/64
       On-link                 :          Yes
       Autonomous address conf.:          Yes
       Valid time              :      2592000 (0x00278d00) seconds
       Pref. time              :        14400 (0x00003840) seconds
      Recursive DNS server     : fc00:470:f1cd::ff00
       DNS server lifetime     :          600 (0x00000258) seconds
      Source link-layer address: 00:98:2B:F8:3F:12
      from fe80::f055:20ff:fea8:8fa9

Neighbor Discovery
==================

.. opcmd:: force ipv6-nd interface <interface> address <ipv6-address>

   Discover the host fc00:470:f1cd::1 through eth0.


   Example:

   .. code-block:: none

     vyos@vyos:~$ force ipv6-nd interface eth0 address fc00:470:f1cd:101::1

     Soliciting fc00:470:f1cd:101::1 (fc00:470:f1cd:101::1) on eth0...
     Target link-layer address: 00:98:2B:F8:3F:11 from fc00:470:f1cd:101::1

