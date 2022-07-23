##
IP
##

System configuration commands
-----------------------------

.. cfgcmd:: set system ip disable-forwarding

   Use this command to disable IPv4 forwarding on all interfaces.

.. cfgcmd:: set system ip disable-directed-broadcast

   Use this command to disable IPv4 directed broadcast forwarding on all
   interfaces.

   If set, IPv4 directed broadcast forwarding will be completely disabled
   regardless of whether per-interface directed broadcast forwarding is
   enabled or not.

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

.. code-block:: none

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

.. code-block:: none

   vyos@vyos:~$ reset ip
   Possible completions:
     arp           Reset Address Resolution Protocol (ARP) cache
     bgp           Clear Border Gateway Protocol (BGP) statistics or status
     igmp          IGMP clear commands
     multicast     IP multicast routing table
     route         Reset IP route
