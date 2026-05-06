.. _routing-static-arp:

###
ARP
###

:abbr:`ARP (Address Resolution Protocol)` is a communication protocol used for
discovering the link layer address, such as a MAC address, associated with a
given internet layer address, typically an IPv4 address. This mapping is a
critical function in the Internet protocol suite. ARP was defined in 1982 by
:rfc:`826` which is Internet Standard STD 37.

In Internet Protocol Version 6 (IPv6) networks, the functionality of ARP is
provided by the Neighbor Discovery Protocol (NDP).

To manipulate or display ARP_ table entries, the following commands are
implemented.

*********
Configure
*********

.. cfgcmd:: set protocols static arp interface <interface> address <host>
   mac <mac>

   This will configure a static ARP entry always resolving `<address>` to
   `<mac>` for interface `<interface>`.

   Example:

   .. code-block:: none

     set protocols static arp interface eth0 address 192.0.2.1 mac 01:23:45:67:89:01


*********
Operation
*********

.. opcmd:: show protocols static arp

   Display all known ARP table entries spanning across all interfaces

.. code-block:: none

  vyos@vyos:~$ show protocols static arp
  Address                  HWtype  HWaddress           Flags Mask     Iface
  10.1.1.1                 ether   00:53:00:de:23:2e   C              eth1
  10.1.1.100               ether   00:53:00:de:23:aa   CM             eth1


.. opcmd:: show protocols static arp interface eth1

   Display all known ARP table entries on a given interface only (`eth1`):

.. code-block:: none

  vyos@vyos:~$ show protocols static arp interface eth1
  Address                  HWtype  HWaddress           Flags Mask     Iface
  10.1.1.1                 ether   00:53:00:de:23:2e   C              eth1
  10.1.1.100               ether   00:53:00:de:23:aa   CM             eth1

.. _ARP: https://en.wikipedia.org/wiki/Address_Resolution_Protocol
