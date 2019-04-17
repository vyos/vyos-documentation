.. _interfaces-addresses:

Interface Addresses
-------------------

Each interface can be configured with a description and address. Interface
addresses might be:

* Static IPv4 `address 172.16.51.129/24`
* Static IPv6 `address 2001:db8:1::ffff/64`
* DHCP IPv4 `address dhcp`
* DHCP IPv6 `address dhcpv6`

An interface description is assigned using the following command:

.. code-block:: sh

  set interfaces ethernet eth0 description 'OUTSIDE'

IPv4
^^^^

Static Address
**************

This method is supported on all interfaces, apart from OpenVPN that uses
different syntax and wireless modems that are always autoconfigured through
PPP.

The command is `set interfaces $type $name address $address`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 address 192.0.2.1/24
  set interfaces tunnel tun0 address 10.0.0.1/30
  set interfaces bridge br0 address 203.0.113.45/26
  set interfaces ethernet eth0 vif 30 address 192.0.30.254/24

DHCP
****

This method is supported on all physical interfaces, and those that are
directly connected to a physical interface (ethernet, VLAN, bridge, bond,
pseudo-ethernet, wireless).

The command is `set interfaces $type $name address dhcp`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 vif 90 address dhcp
  set interfaces bridge br0 address dhcp

IPv6
^^^^

Static Address
**************

This method is supported on all interfaces, apart from OpenVPN that uses
different syntax and wireless modems that are always autoconfigured through
PPP. Static IPv6 addresses are supported on all interfaces
except :ref:`interfaces-tunnel`.

The command is `set interfaces $type $name address $address`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 address 2001:db8:100::ffff/64
  set interfaces tunnel tun0 address 2001:db8::1/64
  set interfaces bridge br0 address  2001:db8:200::1/64
  set interfaces ethernet eth0 vif 30 address 2001:db8:3::ffff/64

DHCP
****

This method is supported on all physical interfaces, and those that are
directly connected to a physical interface (ethernet, VLAN, bridge, bond,
pseudo-ethernet, wireless).

The command is `set interfaces $type $name address dhcpv6`. Examples:

.. code-block:: sh

  set interfaces bonding bond1 address dhcpv6
  set interfaces bridge br0 vif 56 address dhcpv6

Autoconfiguration (SLAAC)
*************************

SLAAC is specified in RFC4862_. This method is supported on all physical
interfaces, and those that are directly connected to a physical interface
(ethernet, VLAN, bridge, bond, pseudo-ethernet, wireless).

The command is `set interfaces $type $name ipv6 address autoconf`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 vif 90 ipv6 address autoconf
  set interfaces bridge br0 ipv6 address autoconf

.. note:: This method automatically disables IPv6 traffic forwarding on the
   interface in question.

EUI-64
******

EUI-64 (64-Bit Extended Unique Identifier) as specified in RFC4291_. IPv6
addresses in /64 networks can be automatically generated from the prefix and
MAC address, if you specify the prefix.

The command is `set interfaces $type $name ipv6 address eui64 $prefix`.
Examples:

.. code-block:: sh

  set interfaces bridge br0 ipv6 address eui64 2001:db8:beef::/64
  set interfaces pseudo-ethernet peth0 ipv6 address eui64 2001:db8:aa::/64



.. _RFC4862: https://tools.ietf.org/html/rfc4862
.. _RFC4291: http://tools.ietf.org/html/rfc4291#section-2.5.1
