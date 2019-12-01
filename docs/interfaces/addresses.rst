.. _interfaces-addresses:

Addresses
---------

Each interface can be configured with a description and address. Interface
addresses might be:

* Static IPv4 ``address 172.16.51.129/24``
* Static IPv6 ``address 2001:db8:1::ffff/64``
* DHCP IPv4 ``address dhcp``
* DHCP IPv6 ``address dhcpv6``

.. cfgcmd:: set interfaces ethernet eth0 description 'OUTSIDE'

An interface description is assigned using the following command:

IPv4
^^^^

Static Address
**************

This method is supported on all interfaces, apart from OpenVPN that uses
different syntax and wireless modems that are always autoconfigured through
PPP.

The command is ``set interfaces $type $name address $address``. Examples:

.. code-block:: none

  set interfaces ethernet eth0 address 192.0.2.1/24
  set interfaces tunnel tun0 address 10.0.0.1/30
  set interfaces bridge br0 address 203.0.113.45/26
  set interfaces ethernet eth0 vif 30 address 198.51.100.254/24

DHCP
****

This method is supported on all physical interfaces, and those that are
directly connected to a physical interface (Ethernet, VLAN, Bridge, Bond,
Pseudo-ethernet, Wireless).

The command is ``set interfaces $type $name address dhcp``. Examples:

.. code-block:: none

  set interfaces ethernet eth0 vif 90 address dhcp
  set interfaces bridge br0 address dhcp

IPv6
^^^^

Static Address
**************

This method is supported on all interfaces, apart from OpenVPN that uses
different syntax and wireless modems that are always autoconfigured through
PPP. Static IPv6 addresses are supported on all interfaces
except :ref:`tunnel-interface`.

The command is ``set interfaces $type $name address $address``. Examples:

.. code-block:: none

  set interfaces ethernet eth0 address 2001:db8:100::ffff/64
  set interfaces tunnel tun0 address 2001:db8::1/64
  set interfaces bridge br0 address  2001:db8:200::1/64
  set interfaces ethernet eth0 vif 30 address 2001:db8:3::ffff/64

DHCP
****

This method is supported on all physical interfaces, and those that are
directly connected to a physical interface (Ethernet, VLAN, Bridge, Bond,
Pseudo-ethernet, Wireless).

The command is `set interfaces $type $name address dhcpv6`. Examples:

.. code-block:: none

  set interfaces bonding bond1 address dhcpv6
  set interfaces bridge br0 vif 56 address dhcpv6

Autoconfiguration (SLAAC)
*************************

SLAAC is specified in :rfc:`4862`. This method is supported on all physical
interfaces, and those that are directly connected to a physical interface
(Ethernet, VLAN, Bridge, Bond, Pseudo-ethernet, Wireless).

The command is ``set interfaces $type $name ipv6 address autoconf``. Examples:

.. code-block:: none

  set interfaces ethernet eth0 vif 90 ipv6 address autoconf
  set interfaces bridge br0 ipv6 address autoconf

.. note:: This method automatically disables IPv6 traffic forwarding on the
   interface in question.

EUI-64
******

EUI-64 (64-Bit Extended Unique Identifier) as specified in :rfc:`4291`. IPv6
addresses in /64 networks can be automatically generated from the prefix and
MAC address, if you specify the prefix.

The command is `set interfaces $type $name ipv6 address eui64 $prefix`.
Examples:

.. code-block:: none

  set interfaces bridge br0 ipv6 address eui64 2001:db8:beef::/64
  set interfaces pseudo-ethernet peth0 ipv6 address eui64 2001:db8:aa::/64


Router Advertisements
*********************

Router advertisements are described in :rfc:`4861#section-4.6.2`. They are part
of what is known as SLAAC (Stateless Address Autoconfiguration).

To enable or disable, use:

.. code-block:: none

  set interfaces <interface> ipv6 router-advert send-advert <true|false>


To set the options described in "Router Advertisement Message Format":

.. code-block:: none

  vyos@vyos#  set interfaces <interface> ipv6 router-advert
  Possible completions:
     cur-hop-limit         Value to be placed in the "Current Hop Limit" field in RAs
     default-lifetime      Value to be placed in "Router Lifetime" field in RAs
     default-preference    Default router preference
     link-mtu              Value of link MTU to place in RAs
     managed-flag          Value for "managed address configuration" flag in RAs
     max-interval          Maximum interval between unsolicited multicast RAs
     min-interval          Minimum interval between unsolicited multicast RAs
  +  name-server           IPv6 address of a Recursive DNS Server
     other-config-flag     Value to be placed in the "other configuration" flag in RAs
  +> prefix                IPv6 prefix to be advertised in Router Advertisements (RAs)
     reachable-time        Value to be placed in "Reachable Time" field in RAs
     retrans-timer         Value to place in "Retrans Timer" field in RAs.
     send-advert           Enable/disable sending RAs


Prefix Information
~~~~~~~~~~~~~~~~~~

Prefix information is described in :rfc:`4861#section-4.6.2`.

.. code-block:: none

  vyos@vyos# set interfaces <interface> ipv6 router-advert prefix <h:h:h:h:h:h:h:h/x>
  Possible completions:
    autonomous-flag       Whether prefix can be used for address auto-configuration
    on-link-flag          Flag that prefix can be used for on-link determination
    preferred-lifetime    Time in seconds that the prefix will remain preferred
    valid-lifetime        Time in seconds that the prefix will remain valid

Receiving Router Advertisements
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

To receive and accept RAs on an interface, you need to enable it with the
following configuration command

.. code-block:: none

  vyos@vyos# set system sysctl custom net.ipv6.conf.<interface>.accept_ra value 2

