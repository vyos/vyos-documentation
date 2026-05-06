:lastproofread: 2024-07-03

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

In an **address group** a single IP address or IP address range is defined.

.. cfgcmd:: set firewall group address-group <name> address [address |
   address range]
.. cfgcmd:: set firewall group ipv6-address-group <name> address <address>

   Define a IPv4 or a IPv6 address group

   .. code-block:: none

      set firewall group address-group ADR-INSIDE-v4 address 192.168.0.1
      set firewall group address-group ADR-INSIDE-v4 address 10.0.0.1-10.0.0.8
      set firewall group ipv6-address-group ADR-INSIDE-v6 address 2001:db8::1

.. cfgcmd:: set firewall group address-group <name> description <text>
.. cfgcmd:: set firewall group ipv6-address-group <name> description <text>

   Provide a IPv4 or IPv6 address group description

Remote Groups
==============

A **remote-group** takes an argument of a URL hosting a linebreak-deliminated
list of IPv4 and/or IPv6 addresses, CIDRs and ranges. VyOS will pull this list periodicity
according to the frequency defined in the firewall **resolver-interval** and load
matching entries into the group for use in rules. The list will be cached in
persistent storage, so in cases of update failure rules will still function.

.. cfgcmd:: set firewall group remote-group <name> url <http(s) url>

   Define remote list of IPv4 and/or IPv6 addresses/ranges/CIDRs to fetch

.. cfgcmd:: set firewall group remote-group <name> description <text>

   Set a description for a remote group

The format of the remote list is very flexible. VyOS will attempt to parse the
first word of each line as an entry, and will skip if it cannot find a valid
match. Lines that begin with an alphanumeric character but do not match valid IPv4
or IPv6 addresses, ranges, or CIDRs will be logged to the system log. Below is a
list of acceptable matches that would be parsed correctly:

.. code-block:: none

      127.0.0.1
      127.0.0.0/24
      127.0.0.1-127.0.0.254
      2001:db8::1
      2001:db8:cafe::/48
      2001:db8:cafe::1-2001:db8:cafe::ffff

Network Groups
==============

While **network groups** accept IP networks in CIDR notation, specific
IP addresses can be added as a 32-bit prefix. If you foresee the need
to add a mix of addresses and networks, then a network group is
recommended.

.. cfgcmd:: set firewall group network-group <name> network <CIDR>
.. cfgcmd:: set firewall group ipv6-network-group <name> network <CIDR>

   Define a IPv4 or IPv6 Network group.

   .. code-block:: none

      set firewall group network-group NET-INSIDE-v4 network 192.168.0.0/24
      set firewall group network-group NET-INSIDE-v4 network 192.168.1.0/24
      set firewall group ipv6-network-group NET-INSIDE-v6 network 2001:db8::/64

.. cfgcmd:: set firewall group network-group <name> description <text>
.. cfgcmd:: set firewall group ipv6-network-group <name> description <text>

   Provide an IPv4 or IPv6 network group description.

Interface Groups
================

An **interface group** represents a collection of interfaces.

.. cfgcmd:: set firewall group interface-group <name> interface <text>

   Define an interface group. Wildcard are accepted too.

.. code-block:: none

      set firewall group interface-group LAN interface bond1001
      set firewall group interface-group LAN interface eth3*

.. cfgcmd:: set firewall group interface-group <name> description <text>

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

.. cfgcmd:: set firewall group mac-group <name> mac-address <mac-address>

   Define a mac group.

.. code-block:: none

      set firewall group mac-group MAC-G01 mac-address 88:a4:c2:15:b6:4f
      set firewall group mac-group MAC-G01 mac-address 4c:d5:77:c0:19:81

.. cfgcmd:: set firewall group mac-group <name> description <text>

   Provide a mac group description.

Domain Groups
=============

A **domain group** represents a collection of domains.

.. cfgcmd:: set firewall group domain-group <name> address <domain>

   Define a domain group.

.. code-block:: none

      set firewall group domain-group DOM address example.com

.. cfgcmd:: set firewall group domain-group <name> description <text>

   Provide a domain group description.

Dynamic Groups
==============

Firewall dynamic groups are different from all the groups defined previously
because, not only they can be used as source/destination in firewall rules,
but members of these groups are not defined statically using vyos
configuration.

Instead, members of these groups are added dynamically using firewall
rules.

Defining Dynamic Address Groups
-------------------------------

Dynamic address group is supported by both IPv4 and IPv6 families.
Commands used to define dynamic IPv4|IPv6 address groups are:

.. cfgcmd:: set firewall group dynamic-group address-group <name>
.. cfgcmd:: set firewall group dynamic-group ipv6-address-group <name>

Add description to firewall groups:

.. cfgcmd:: set firewall group dynamic-group address-group <name>
   description <text>
.. cfgcmd:: set firewall group dynamic-group ipv6-address-group <name>
   description <text>

Adding elements to Dynamic Firewall Groups
------------------------------------------

Once dynamic firewall groups are defined, they should be used in firewall
rules in order to dynamically add elements to it.

Commands used for this task are:

* Add destination IP address of the connection to a dynamic address group:

.. cfgcmd:: set firewall ipv4 [forward | input | output] filter rule
   <1-999999> add-address-to-group destination-address address-group <name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999> add-address-to-group
   destination-address address-group <name>
.. cfgcmd:: set firewall ipv6 [forward | input | output] filter rule
   <1-999999> add-address-to-group destination-address address-group <name>
.. cfgcmd:: set firewall ipv6 name <name> rule <1-999999> add-address-to-group
   destination-address address-group <name>

* Add source IP address of the connection to a dynamic address group:

.. cfgcmd:: set firewall ipv4 [forward | input | output] filter rule
   <1-999999> add-address-to-group source-address address-group <name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999> add-address-to-group
   source-address address-group <name>
.. cfgcmd:: set firewall ipv6 [forward | input | output] filter rule
   <1-999999> add-address-to-group source-address address-group <name>
.. cfgcmd:: set firewall ipv6 name <name> rule <1-999999> add-address-to-group
   source-address address-group <name>

Also, specific timeouts can be defined per rule. In case rule gets a hit,
a source or destinatination address will be added to the group, and this
element will remain in the group until the timeout expires. If no timeout
is defined, then the element will remain in the group until next reboot,
or until a new commit that changes firewall configuration is done.

.. cfgcmd:: set firewall ipv4 [forward | input | output] filter rule
   <1-999999> add-address-to-group [destination-address | source-address]
   timeout <timeout>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999> add-address-to-group
   [destination-address | source-address] timeout <timeout>
.. cfgcmd:: set firewall ipv6 [forward | input | output] filter rule
   <1-999999> add-address-to-group [destination-address | source-address]
   timeout <timeout>
.. cfgcmd:: set firewall ipv6 name <name> rule <1-999999> add-address-to-group
   [destination-address | source-address] timeout <timeout>

Timeout can be defined using seconds, minutes, hours or days:

.. code-block:: none

   set firewall ipv6 name FOO rule 10 add-address-to-group source-address timeout
   Possible completions:
   <number>s            Timeout value in seconds
   <number>m            Timeout value in minutes
   <number>h            Timeout value in hours
   <number>d            Timeout value in days

Using Dynamic Firewall Groups
-----------------------------

As any other firewall group, dynamic firewall groups can be used in firewall
rules as matching options. For example:

.. code-block:: none

   set firewall ipv4 input filter rule 10 source group dynamic-address-group FOO
   set firewall ipv4 input filter rule 10 destination group dynamic-address-group BAR

********
Examples
********

General example
===============

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

      set firewall ipv4 output filter rule 10 action accept
      set firewall ipv4 output filter rule 10 outbound-interface group !LAN
      set firewall ipv4 forward filter rule 20 action accept
      set firewall ipv4 forward filter rule 20 source group network-group TRUSTEDv4
      set firewall ipv6 input filter rule 10 action accept
      set firewall ipv6 input filter rule 10 source group network-group TRUSTEDv6
      set nat destination rule 101 inbound-interface group LAN
      set nat destination rule 101 destination group address-group SERVERS
      set nat destination rule 101 protocol tcp
      set nat destination rule 101 destination group port-group PORT-SERVERS
      set nat destination rule 101 translation address 203.0.113.250
      set policy route PBR rule 201 destination group port-group PORT-SERVERS
      set policy route PBR rule 201 protocol tcp
      set policy route PBR rule 201 set table 15

Port knocking example
=====================

Using dynamic firewall groups, we can secure access to the router, or any other
device if needed, by using the technique of port knocking.

A 4 step port knocking example is shown next:

   .. code-block:: none

      set firewall global-options state-policy established action 'accept'
      set firewall global-options state-policy invalid action 'drop'
      set firewall global-options state-policy related action 'accept'
      set firewall group dynamic-group address-group ALLOWED
      set firewall group dynamic-group address-group PN_01
      set firewall group dynamic-group address-group PN_02
      set firewall ipv4 input filter default-action 'drop'
      set firewall ipv4 input filter rule 5 action 'accept'
      set firewall ipv4 input filter rule 5 protocol 'icmp'
      set firewall ipv4 input filter rule 10 action 'drop'
      set firewall ipv4 input filter rule 10 add-address-to-group source-address address-group 'PN_01'
      set firewall ipv4 input filter rule 10 add-address-to-group source-address timeout '2m'
      set firewall ipv4 input filter rule 10 description 'Port_nock 01'
      set firewall ipv4 input filter rule 10 destination port '9990'
      set firewall ipv4 input filter rule 10 protocol 'tcp'
      set firewall ipv4 input filter rule 20 action 'drop'
      set firewall ipv4 input filter rule 20 add-address-to-group source-address address-group 'PN_02'
      set firewall ipv4 input filter rule 20 add-address-to-group source-address timeout '3m'
      set firewall ipv4 input filter rule 20 description 'Port_nock 02'
      set firewall ipv4 input filter rule 20 destination port '9991'
      set firewall ipv4 input filter rule 20 protocol 'tcp'
      set firewall ipv4 input filter rule 20 source group dynamic-address-group 'PN_01'
      set firewall ipv4 input filter rule 30 action 'drop'
      set firewall ipv4 input filter rule 30 add-address-to-group source-address address-group 'ALLOWED'
      set firewall ipv4 input filter rule 30 add-address-to-group source-address timeout '2h'
      set firewall ipv4 input filter rule 30 description 'Port_nock 03'
      set firewall ipv4 input filter rule 30 destination port '9992'
      set firewall ipv4 input filter rule 30 protocol 'tcp'
      set firewall ipv4 input filter rule 30 source group dynamic-address-group 'PN_02'
      set firewall ipv4 input filter rule 99 action 'accept'
      set firewall ipv4 input filter rule 99 description 'Port_nock 04 - Allow ssh'
      set firewall ipv4 input filter rule 99 destination port '22'
      set firewall ipv4 input filter rule 99 protocol 'tcp'
      set firewall ipv4 input filter rule 99 source group dynamic-address-group 'ALLOWED'

Before testing, we can check the members of firewall groups:

   .. code-block:: none

      vyos@vyos# run show firewall group
      Firewall Groups

      Name     Type                    References            Members        Timeout    Expires
      -------  ----------------------  --------------------  -------------  ---------  ---------
      ALLOWED  address_group(dynamic)  ipv4-input-filter-30  N/D            N/D        N/D
      PN_01    address_group(dynamic)  ipv4-input-filter-10  N/D            N/D        N/D
      PN_02    address_group(dynamic)  ipv4-input-filter-20  N/D            N/D        N/D
      [edit]
      vyos@vyos#

With this configuration, in order to get ssh access to the router, the user
needs to:

1. Generate a new TCP connection with destination port 9990. As shown next,
a new entry was added to dynamic firewall group **PN_01**

   .. code-block:: none

      vyos@vyos# run show firewall group
      Firewall Groups

      Name     Type                    References            Members        Timeout    Expires
      -------  ----------------------  --------------------  -------------  ---------  ---------
      ALLOWED  address_group(dynamic)  ipv4-input-filter-30  N/D            N/D        N/D
      PN_01    address_group(dynamic)  ipv4-input-filter-10  192.168.89.31  120        119
      PN_02    address_group(dynamic)  ipv4-input-filter-20  N/D            N/D        N/D
      [edit]
      vyos@vyos#

2. Generate a new TCP connection with destination port 9991. As shown next,
a new entry was added to dynamic firewall group **PN_02**

   .. code-block:: none

      vyos@vyos# run show firewall group
      Firewall Groups

      Name     Type                    References            Members        Timeout    Expires
      -------  ----------------------  --------------------  -------------  ---------  ---------
      ALLOWED  address_group(dynamic)  ipv4-input-filter-30  N/D            N/D        N/D
      PN_01    address_group(dynamic)  ipv4-input-filter-10  192.168.89.31  120        106
      PN_02    address_group(dynamic)  ipv4-input-filter-20  192.168.89.31  180        179
      [edit]
      vyos@vyos#

3. Generate a new TCP connection with destination port 9992. As shown next,
a new entry was added to dynamic firewall group **ALLOWED**

   .. code-block:: none

      vyos@vyos# run show firewall group
      Firewall Groups

      Name     Type                    References            Members        Timeout    Expires
      -------  ----------------------  --------------------  -------------  ---------  ---------
      ALLOWED  address_group(dynamic)  ipv4-input-filter-30  192.168.89.31       7200       7199
      PN_01    address_group(dynamic)  ipv4-input-filter-10  192.168.89.31        120         89
      PN_02    address_group(dynamic)  ipv4-input-filter-20  192.168.89.31        180        170
      [edit]
      vyos@vyos#

4. Now the user can connect through ssh to the router (assuming ssh is configured).

**************
Operation-mode
**************

.. opcmd:: show firewall group
.. opcmd:: show firewall group <name>

   Overview of defined groups. You see the firewall group name, type,
   references (where the group is used), members, timeout and expiration (last
   two only present in dynamic firewall groups).

Here is an example of such command:

   .. code-block:: none

      vyos@vyos:~$ show firewall group
      Firewall Groups

      Name          Type                    References              Members             Timeout    Expires
      ------------  ----------------------  ----------------------  ----------------  ---------  ---------
      SERVERS       address_group           nat-destination-101     198.51.100.101
                                                                    198.51.100.102
      ALLOWED       address_group(dynamic)  ipv4-input-filter-30    192.168.77.39          7200       7174
      PN_01         address_group(dynamic)  ipv4-input-filter-10    192.168.0.245           120        112
                                                                    192.168.77.39           120         85
      PN_02         address_group(dynamic)  ipv4-input-filter-20    192.168.77.39           180        151
      LAN           interface_group         ipv4-output-filter-10   bon0
                                            nat-destination-101     eth2.2001
      TRUSTEDv6     ipv6_network_group      ipv6-input-filter-10    2001:db8::/64
      TRUSTEDv4     network_group           ipv4-forward-filter-20  192.0.2.0/30
                                                                    203.0.113.128/25
      PORT-SERVERS  port_group              route-PBR-201           443
                                            route-PBR-201           5000-5010
                                            nat-destination-101     http
      vyos@vyos:~$
