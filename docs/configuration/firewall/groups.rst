:lastproofread: 2023-11-08

.. _firewall-groups-configuration:

###############
Firewall groups
###############

*************
Configuration
*************

Firewall groups represent collections of IP addresses, networks, ports,
mac addresses, domains or interfaces. Once created, a group can be referenced
by firewall, nat and policy route rules as either a source or destination
matcher, and/or as inbound/outbound in the case of interface group.

Address Groups
==============

In an **address group** a single IP address or IP address ranges are
defined.

.. cfgcmd::  set firewall group address-group <name> address [address |
   address range]
.. cfgcmd::  set firewall group ipv6-address-group <name> address <address>

   Define a IPv4 or a IPv6 address group

   .. code-block:: none

      set firewall group address-group ADR-INSIDE-v4 address 192.168.0.1
      set firewall group address-group ADR-INSIDE-v4 address 10.0.0.1-10.0.0.8
      set firewall group ipv6-address-group ADR-INSIDE-v6 address 2001:db8::1

.. cfgcmd::  set firewall group address-group <name> description <text>
.. cfgcmd::  set firewall group ipv6-address-group <name> description <text>

   Provide a IPv4 or IPv6 address group description

Network Groups
==============

While **network groups** accept IP networks in CIDR notation, specific
IP addresses can be added as a 32-bit prefix. If you foresee the need
to add a mix of addresses and networks, the network group is
recommended.

.. cfgcmd::  set firewall group network-group <name> network <CIDR>
.. cfgcmd::  set firewall group ipv6-network-group <name> network <CIDR>

   Define a IPv4 or IPv6 Network group.

   .. code-block:: none

      set firewall group network-group NET-INSIDE-v4 network 192.168.0.0/24
      set firewall group network-group NET-INSIDE-v4 network 192.168.1.0/24
      set firewall group ipv6-network-group NET-INSIDE-v6 network 2001:db8::/64

.. cfgcmd::  set firewall group network-group <name> description <text>
.. cfgcmd::  set firewall group ipv6-network-group <name> description <text>

   Provide an IPv4 or IPv6 network group description.

Interface Groups
================

An **interface group** represents a collection of interfaces.

.. cfgcmd::  set firewall group interface-group <name> interface <text>

   Define an interface group. Wildcard are accepted too.

.. code-block:: none

      set firewall group interface-group LAN interface bond1001
      set firewall group interface-group LAN interface eth3*

.. cfgcmd::  set firewall group interface-group <name> description <text>

   Provide an interface group description

Port Groups
===========

A **port group** represents only port numbers, not the protocol. Port
groups can be referenced for either TCP or UDP. It is recommended that
TCP and UDP groups are created separately to avoid accidentally
filtering unnecessary ports. Ranges of ports can be specified by using
`-`.

.. cfgcmd:: set firewall group port-group <name> port
   [portname | portnumber | startport-endport]

   Define a port group. A port name can be any name defined in
   /etc/services. e.g.: http

   .. code-block:: none

      set firewall group port-group PORT-TCP-SERVER1 port http
      set firewall group port-group PORT-TCP-SERVER1 port 443
      set firewall group port-group PORT-TCP-SERVER1 port 5000-5010

.. cfgcmd:: set firewall group port-group <name> description <text>

   Provide a port group description.

MAC Groups
==========

A **mac group** represents a collection of mac addresses.

.. cfgcmd::  set firewall group mac-group <name> mac-address <mac-address>

   Define a mac group.

.. code-block:: none

      set firewall group mac-group MAC-G01 mac-address 88:a4:c2:15:b6:4f
      set firewall group mac-group MAC-G01 mac-address 4c:d5:77:c0:19:81

.. cfgcmd:: set firewall group mac-group <name> description <text>

   Provide a mac group description.

Domain Groups
=============

A **domain group** represents a collection of domains.

.. cfgcmd::  set firewall group domain-group <name> address <domain>

   Define a domain group.

.. code-block:: none

      set firewall group domain-group DOM address example.com

.. cfgcmd:: set firewall group domain-group <name> description <text>

   Provide a domain group description.

********
Examples
********

As said before, once firewall groups are created, they can be referenced
either in firewall, nat, nat66 and/or policy-route rules.

Here is an example were multiple groups are created: 

   .. code-block:: none
      
      set firewall group address-group SERVERS address 198.51.100.101
      set firewall group address-group SERVERS address 198.51.100.102
      set firewall group network-group TRUSTEDv4 network 192.0.2.0/30
      set firewall group network-group TRUSTEDv4 network 203.0.113.128/25
      set firewall group ipv6-network-group TRUSTEDv6 network 2001:db8::/64
      set firewall group interface-group LAN interface eth2.2001
      set firewall group interface-group LAN interface bon0
      set firewall group port-group PORT-SERVERS port http
      set firewall group port-group PORT-SERVERS port 443
      set firewall group port-group PORT-SERVERS port 5000-5010

And next, some configuration example where groups are used:

   .. code-block:: none
      
      set firewall ipv4 input filter rule 10 action accept
      set firewall ipv4 input filter rule 10 inbound-interface group !LAN
      set firewall ipv4 forward filter rule 20 action accept
      set firewall ipv4 forward filter rule 20 source group network-group TRUSTEDv4
      set firewall ipv6 input filter rule 10 action accept
      set firewall ipv6 input filter rule 10 source-group network-group TRUSTEDv6
      set nat destination rule 101 inbound-interface group LAN
      set nat destination rule 101 destination group address-group SERVERS
      set nat destination rule 101 protocol tcp
      set nat destination rule 101 destination group port-group PORT-SERVERS
      set nat destination rule 101 translation address 203.0.113.250
      set policy route PBR rule 201 destination group port-group PORT-SERVERS
      set policy route PBR rule 201 protocol tcp
      set policy route PBR rule 201 set table 15

**************
Operation-mode
**************

.. opcmd:: show firewall group <name>

   Overview of defined groups. You see the type, the members, and where the
   group is used.

   .. code-block:: none

      vyos@ZBF-15-CLean:~$ show firewall group 
      Firewall Groups

      Name          Type                References              Members
      ------------  ------------------  ----------------------  ----------------
      SERVERS       address_group       nat-destination-101     198.51.100.101
                                                                198.51.100.102
      LAN           interface_group     ipv4-input-filter-10    bon0
                                        nat-destination-101     eth2.2001
      TRUSTEDv6     ipv6_network_group  ipv6-input-filter-10    2001:db8::/64
      TRUSTEDv4     network_group       ipv4-forward-filter-20  192.0.2.0/30
                                                                203.0.113.128/25
      PORT-SERVERS  port_group          route-PBR-201           443
                                        nat-destination-101     5000-5010
                                                                http
      vyos@ZBF-15-CLean:~$
