.. _ip-commands:

***********
IP commands
***********


IPv4
====

System configuration commands
-----------------------------


.. cfgcmd:: set system ip disable-forwarding

   Use this command to disable IPv4 forwarding on all interfaces.


.. cfgcmd:: set system ip arp table-size <number>

   Use this command to define the maximum number of entries to keep in
   the ARP cache (1024, 2048, 4096, 8192, 16384, 32768).


.. cfgcmd:: set system ip multipath layer4-hashing

   Use this command to use Layer 4 information for IPv4 ECMP hashing.


Operational commands
--------------------


show commands
^^^^^^^^^^^^^

See below the different parameters available for the IPv4 **show** command:

.. code-block::

   vyos@vyos:~$ show ip
   Possible completions:
     access-list   Show all IP access-lists
     as-path-access-list
                   Show all as-path-access-lists
     bgp           Show Border Gateway Protocol (BGP) information
     community-list
                   Show IP community-lists
     extcommunity-list
                   Show extended IP community-lists
     forwarding    Show IP forwarding status
     groups        Show IP multicast group membership
     igmp          Show IGMP (Internet Group Management Protocol) information
     large-community-list
                   Show IP large-community-lists
     multicast     Show IP multicast
     ospf          Show IPv4 Open Shortest Path First (OSPF) routing information
     pim           Show PIM (Protocol Independent Multicast) information
     ports         Show IP ports in use by various system services
     prefix-list   Show all IP prefix-lists
     protocol      Show IP route-maps per protocol
     rip           Show Routing Information Protocol (RIP) information
     route         Show IP routes
   

reset commands
^^^^^^^^^^^^^^

And the different IPv4 **reset** commands available:

.. code-block::

   vyos@vyos:~$ reset ip 
   Possible completions:
     arp           Reset Address Resolution Protocol (ARP) cache
     bgp           Clear Border Gateway Protocol (BGP) statistics or status
     igmp          IGMP clear commands
     multicast     IP multicast routing table
     route         Reset IP route
   

IPv6
====

System configuration commands
-----------------------------

.. cfgcmd:: set system ipv6 disable

   Use this command to disable assignment of IPv6 addresses on all
   interfaces.


.. cfgcmd:: set system ipv6 disable-forwarding

   Use this command to disable IPv6 forwarding on all interfaces.


.. cfgcmd:: set system ipv6 neighbor table-size <number>

   Use this command to define the maximum number of entries to keep in
   the Neighbor cache (1024, 2048, 4096, 8192, 16384, 32768).


.. cfgcmd:: set system ipv6 strict-dad

   Use this command to disable IPv6 operation on interface when
   Duplicate Address Detection fails on Link-Local address.


.. cfgcmd:: set system ipv6 multipath layer4-hashing

   Use this command to user Layer 4 information for ECMP hashing.

.. cfgcmd:: set system ipv6 blacklist

   Use this command to prevent the IPv6 kernel module from being loaded.



Operational commands
--------------------

Show commands
^^^^^^^^^^^^^


.. opcmd:: show ipv6 neighbors

   Use this command to show IPv6 Neighbor Discovery Protocol information.


.. opcmd:: show ipv6 groups

   Use this command to show IPv6 multicast group membership.


.. opcmd:: show ipv6 forwarding
  
   Use this command to show IPv6 forwarding status.

.. opcmd:: show ipv6 route

   Use this command to show IPv6 routes.


   Check the many parameters available for the `show ipv6 route` command:

   .. code-block:: none

      vyos@vyos:~$ show ipv6 route 
      Possible completions:
        <Enter>       Execute the current command
        <X:X::X:X>    Show IPv6 routes of given address or prefix
        <X:X::X:X/M>
        bgp           Show IPv6 BGP routes
        cache         Show kernel IPv6 route cache
        connected     Show IPv6 connected routes
        forward       Show kernel IPv6 route table
        isis          Show IPv6 ISIS routes
        kernel        Show IPv6 kernel routes
        ospfv3        Show IPv6 OSPF6 routes
        ripng         Show IPv6 RIPNG routes
        static        Show IPv6 static routes
        summary       Show IPv6 routes summary
        table         Show IP routes in policy table
      

.. opcmd:: show ipv6 prefix-list

   Use this command to show all IPv6 prefix lists

   There are different parameters for getting prefix-list information:

   .. code-block:: none

      vyos@vyos:~$ show ipv6 prefix-list 
      Possible completions:
        <Enter>       Execute the current command
        <WORD>        Show specified IPv6 prefix-list
        detail        Show detail of IPv6 prefix-lists
        summary       Show summary of IPv6 prefix-lists
      
.. opcmd:: show ipv6 access-list

   Use this command to show all IPv6 access lists

   You can also specify which IPv6 access-list should be shown:

   .. code-block:: none

      vyos@vyos:~$ show ipv6 access-list 
      Possible completions:
        <Enter>       Execute the current command
        <text>        Show specified IPv6 access-list
      


.. opcmd:: show ipv6 bgp

   Use this command to show IPv6 Border Gateway Protocol information.


   In addition, you can specify many other parameters to get BGP
   information:

   .. code-block:: none
   
      vyos@vyos:~$ show ipv6 bgp 
      Possible completions:
        <Enter>       Execute the current command
        <X:X::X:X>    Show BGP information for given address or prefix
        <X:X::X:X/M>
        community     Show routes matching the communities
        community-list
                      Show routes matching the community-list
        filter-list   Show routes conforming to the filter-list
        large-community
                      Show routes matching the large-community-list
        large-community-list
        neighbors     Show detailed information on TCP and BGP neighbor connections
        prefix-list   Show routes matching the prefix-list
        regexp        Show routes matching the AS path regular expression
        summary       Show summary of BGP neighbor status
      
      

.. opcmd:: show ipv6 ospfv3

   Use this command to get information about OSPFv3.

   You can get more specific OSPFv3 information by using the parameters
   shown below:
   
   .. code-block:: none
   
      vyos@vyos:~$ show ipv6 ospfv3 
      Possible completions:
        <Enter>       Execute the current command
        area          Show OSPFv3 spf-tree information
        border-routers
                      Show OSPFv3 border-router (ABR and ASBR) information
        database      Show OSPFv3 Link state database information
        interface     Show OSPFv3 interface information
        linkstate     Show OSPFv3 linkstate routing information
        neighbor      Show OSPFv3 neighbor information
        redistribute  Show OSPFv3 redistribute External information
        route         Show OSPFv3 routing table information
      
.. opcmd:: show ipv6 ripng

   Use this command to get information about the RIPNG protocol

.. opcmd:: show ipv6 ripng status

   Use this command to show the status of the RIPNG protocol



Reset commands
^^^^^^^^^^^^^^

.. opcmd:: reset ipv6 bgp <address>

   Use this command to clear Border Gateway Protocol statistics or
   status.


.. opcmd:: reset ipv6 neighbors <address | interface>

   Use this command to reset IPv6 Neighbor Discovery Protocol cache for 
   an address or interface.

.. opcmd:: reset ipv6 route cache

   Use this command to flush the kernel IPv6 route cache.
   An address can be added to flush it only for that route. 



