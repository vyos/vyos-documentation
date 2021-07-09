:lastproofread: 2021-07-09

.. _pseudo-ethernet-interface:

#########################
MACVLAN - Pseudo Ethernet
#########################

Pseudo-Ethernet or MACVLAN interfaces can be seen as subinterfaces to regular
ethernet interfaces. Each and every subinterface is created a different media
access control (MAC) address, for a single physical Ethernet port. Pseudo-
Ethernet interfaces have most of their application in virtualized environments,

By using Pseudo-Ethernet interfaces there will be less system overhead compared
to running a traditional bridging approach. Pseudo-Ethernet interfaces can also
be used to workaround the general limit of 4096 virtual LANs (VLANs) per
physical Ethernet port, since that limit is with respect to a single MAC
address.

Every Virtual Ethernet interfaces behaves like a real Ethernet interface. They
can have IPv4/IPv6 addresses configured, or can request addresses by DHCP/
DHCPv6 and are associated/mapped with a real ethernet port. This also makes
Pseudo-Ethernet interfaces interesting for testing purposes. A Pseudo-Ethernet
device will inherit characteristics (speed, duplex, ...) from its physical
parent (the so called link) interface.

Once created in the system, Pseudo-Ethernet interfaces can be referenced in
the exact same way as other Ethernet interfaces. Notes about using Pseudo-
Ethernet interfaces:

* Pseudo-Ethernet interfaces can not be reached from your internal host. This
  means that you can not try to ping a Pseudo-Ethernet interface from the host
  system on which it is defined. The ping will be lost.
* Loopbacks occurs at the IP level the same way as for other interfaces,
  ethernet frames are not forwarded between Pseudo-Ethernet interfaces.
* Pseudo-Ethernet interfaces may not work in environments which expect a
  :abbr:`NIC (Network Interface Card)` to only have a single address. This
  applies to:
  - VMware machines using default settings
  - Network switches with security settings allowing only a single MAC address
  - xDSL modems that try to learn the MAC address of the NIC

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-common-with-dhcp.txt
   :var0: pseudo-ethernet
   :var1: peth0

Pseudo Ethernet/MACVLAN options
===============================

.. cfgcmd:: set interfaces pseudo-ethernet <interface> source-interface <ethX>

   Specifies the physical `<ethX>` Ethernet interface associated with a Pseudo
   Ethernet `<interface>`.

VLAN
====

.. cmdinclude:: /_include/interface-vlan-8021q.txt
   :var0: pseudo-ethernet
   :var1: peth0
