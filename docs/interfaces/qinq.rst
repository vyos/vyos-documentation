.. include:: ../_include/need_improvement.txt

.. _qinq-interface:

QinQ (802.1ad)
--------------

IEEE 802.1ad was an Ethernet networking standard informally known as QinQ as
an amendment to IEEE standard :ref:`vlan-interface`. 802.1ad was incorporated
into the base 802.1q standard in 2011. The technique is also known as provider
bridging, Stacked VLANs, or simply QinQ or Q-in-Q. "Q-in-Q" can for supported
devices apply to C-tag stacking on C-tag (Ethernet Type = 0x8100).

The original 802.1q specification allows a single Virtual Local Area Network
(VLAN) header to be inserted into an Ethernet frame. QinQ allows multiple
VLAN tags to be inserted into a single frame, an essential capability for
implementing Metro Ethernet network topologies. Just as QinQ extends 802.1Q,
QinQ itself is extended by other Metro Ethernet protocols.

In a multiple VLAN header context, out of convenience the term "VLAN tag" or
just "tag" for short is often used in place of "802.1Q VLAN header". QinQ
allows multiple VLAN tags in an Ethernet frame; together these tags constitute
a tag stack. When used in the context of an Ethernet frame, a QinQ frame is a
frame that has 2 VLAN 802.1Q headers (double-tagged).

In VyOS the terms **vif-s** and **vif-c** stand for the ethertype tags that
are used:

The inner tag is the tag which is closest to the payload portion of the frame.
It is officially called C-TAG (customer tag, with ethertype 0x8100). The outer
tag is the one closer/closest to the Ethernet header, its name is S-TAG
(service tag with ethertype 0x88a8).

Configuration commands:

.. code-block:: none

  interfaces
      ethernet <eth[0-999]>
          address <ipv4>
          address <ipv6>
          description <txt>
          disable
          ip
              <usual IP options>
          ipv6
              <usual IPv6 options>
          vif-s <[0-4096]>
              address <ipv4>
              address <ipv6>
              description <txt>
              disable
              ip
                  <usual IP options>
              ipv6
                  <usual IPv6 options>
              vif-c <[0-4096]>
                  address <ipv4>
                  address <ipv6>
                  description <txt>
                  disable
                  ip
                      <usual IP options>
                  ipv6
                      <usual IPv6 options>


Example:

.. code-block:: none

  set interfaces ethernet eth0 vif-s 333
  set interfaces ethernet eth0 vif-s 333 address 192.0.2.10/32
  set interfaces ethernet eth0 vif-s 333 vif-c 777
  set interfaces ethernet eth0 vif-s 333 vif-c 777 address 10.10.10.10/24

.. _802.1ad: https://en.wikipedia.org/wiki/IEEE_802.1ad