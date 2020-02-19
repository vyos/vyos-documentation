.. _pseudo-ethernet-interface:

#######################
Pseudo Ethernet/MACVLAN
#######################

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
  ethernet packets are not forwarded between Pseudo-Ethernet interfaces.
* Pseudo-Ethernet interfaces can not participate in Link Bonding.
* Pseudo-Ethernet interfaces may not work in environments which expect a
  :abbr:`NIC (Network Interface Card)` to only have a single address. This
  applies to:
  - VMware machines using default settings
  - Network switches with security settings allowing only a single MAC address
  - xDSL modems that try to lear the MAC address of the NIC

Configuration
=============

Address
-------

.. cfgcmd:: set interfaces pseudo-ethernet <interface> address <address | dhcp | dhcpv6>

   .. include:: common-ip-ipv6-addr.txt

   Example:

   .. code-block:: none

     set interfaces pseudo-ethernet peth0 address 192.0.2.1/24
     set interfaces pseudo-ethernet peth0 address 192.0.2.2/24
     set interfaces pseudo-ethernet peth0 address 2001:db8::ffff/64
     set interfaces pseudo-ethernet peth0 address 2001:db8:100::ffff/64

.. cfgcmd:: set interfaces pseudo-ethernet <interface> ipv6 address autoconf

   .. include:: common-ipv6-addr-autoconf.txt

Physical Asignment
------------------

.. cfgcmd:: set interfaces pseudo-ethernet <interface> link <ethX>

   Specifies the physical `<ethX>` Ethernet interface associated with a Pseudo
   Ethernet `<interface>`.

Link Administration
-------------------

.. cfgcmd:: set interfaces pseudo-ethernet <interface> description <description>

   Assign given `<description>` to interface. Description will also be passed
   to SNMP monitoring systems.

.. cfgcmd:: set interfaces pseudo-ethernet <interface> disable

   Disable given `<interface>`. It will be placed in administratively down
   (``A/D``) state.

.. cfgcmd:: set interfaces pseudo-ethernet <interface> mac <mac-address>

   Configure user defined :abbr:`MAC (Media Access Control)` address on given
   `<interface>`.

