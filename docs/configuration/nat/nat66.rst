.. _nat66:

############
NAT66(NPTv6)
############

:abbr:`NPTv6 (IPv6-to-IPv6 Network Prefix Translation)` is an address translation technology based
on IPv6 networks, used to convert an IPv6 address prefix in an IPv6 message into another IPv6
address prefix. We call this address translation method NAT66. Devices that support the NAT66
function are called NAT66 devices, which can provide NAT66 source and destination address
translation functions.

Overview
========

Different NAT Types
-------------------

.. _source-nat66:

SNAT66
^^^^^^

:abbr:`SNPTv6 (Source IPv6-to-IPv6 Network Prefix Translation)` The conversion function is mainly used in
the following scenarios:

* A single internal network and external network. Use the NAT66 device to connect a single internal
  network and public network, and the hosts in the internal network use IPv6 address prefixes that
  only support routing within the local range. When a host in the internal network accesses the
  external network, the source IPv6 address prefix in the message will be converted into a
  global unicast IPv6 address prefix by the NAT66 device.
* Redundancy and load sharing. There are multiple NAT66 devices at the edge of an IPv6 network
  to another IPv6 network. The path through the NAT66 device to another IPv6 network forms an
  equivalent route, and traffic can be load-shared on these NAT66 devices. In this case, you
  can configure the same source address translation rules on these NAT66 devices, so that any
  NAT66 device can handle IPv6 traffic between different sites.
* Multi-homed. In a multi-homed network environment, the NAT66 device connects to an
  internal network and simultaneously connects to different external networks. Address
  translation can be configured on each external network side interface of the NAT66
  device to convert the same internal network address into different external network
  addresses, and realize the mapping of the same internal address to multiple external addresses.

.. _destination-nat66:

DNAT66
^^^^^^

The :abbr:`DNPTv6 (Destination IPv6-to-IPv6 Network Prefix Translation)` destination address translation
function is used in scenarios where the server in the internal network provides services to the external
network, such as providing Web services or FTP services to the external network. By configuring the mapping
relationship between the internal server address and the external network address on the external network
side interface of the NAT66 device, external network users can access the internal network server through
the designated external network address.

Prefix Conversion
------------------

Source Prefix
^^^^^^^^^^^^^

Every SNAT66 rule has a translation command defined. The prefix defined
for the translation is the prefix used when the address information in
a packet is replaced.、

The :ref:`source-nat66` rule replaces the source address of the packet and calculates the
converted address using the prefix specified in the rule.

Example:

* Convert the address prefix of a single `fc01::/64` network to `fc00::/64`
* Output from `eth0` network interface

.. code-block:: none

  set nat66 source rule 1 outbound-interface 'eth0'
  set nat66 source rule 1 source prefix 'fc01::/64'
  set nat66 source rule 1 translation prefix 'fc00::/64'

Destination Prefix
^^^^^^^^^^^^^^^^^^

For the :ref:`destination-nat66` rule, the destination address of the packet is
replaced by the address calculated from the specified address or prefix in the
`translation address` command

Example:

* Convert the address prefix of a single `fc00::/64` network to `fc01::/64`
* Input from `eth0` network interface

.. code-block:: none

  set nat66 destination rule 1 inbound-interface 'eth0'
  set nat66 destination rule 1 destination address 'fc00::/64'
  set nat66 destination rule 1 translation address 'fc01::/64'

Configuration Examples
======================

Use the following topology to build a nat66 based isolated network between internal
and external networks (dynamic prefix is not supported):

.. figure:: /_static/images/vyos_1_4_nat66_simple.png
   :alt: VyOS NAT66 Simple Configure

R1:

.. code-block:: none

  set interfaces ethernet eth0 ipv6 address autoconf
  set interfaces ethernet eth1 address 'fc01::1/64'
  set nat66 destination rule 1 destination address 'fc00:470:f1cd:101::/64'
  set nat66 destination rule 1 inbound-interface 'eth0'
  set nat66 destination rule 1 translation address 'fc01::/64'
  set nat66 source rule 1 outbound-interface 'eth0'
  set nat66 source rule 1 source prefix 'fc01::/64'
  set nat66 source rule 1 translation prefix 'fc00:470:f1cd:101::/64'

R2:

.. code-block:: none

  set interfaces bridge br1 address 'fc01::2/64'
  set interfaces bridge br1 member interface eth0
  set interfaces bridge br1 member interface eth1
  set protocols static route6 ::/0 next-hop fc01::1
  set service router-advert interface br1 prefix ::/0
