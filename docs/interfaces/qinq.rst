.. _interfaces-qinq:

QinQ
----

QinQ (802.1ad_) — allows multiple VLAN tags to be inserted into a single frame.

QinQ can be used to tunnel vlans in a vlan.

**vif-s** and **vif-c** stand for the ethertype tags that get set:

The inner tag is the tag which is closest to the payload portion of the frame; it is officially called C-TAG (Customer tag, with ethertype 0x8100).
The outer tag is the one closer/closest to the Ethernet header; its name is S-TAG (Service tag, ethertype 0x88a8).

Configuration commands:

.. code-block:: console

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

.. code-block:: console

  set interfaces ethernet eth0 vif-s 333
  set interfaces ethernet eth0 vif-s 333 address 192.0.2.10/32
  set interfaces ethernet eth0 vif-s 333 vif-c 777
  set interfaces ethernet eth0 vif-s 333 vif-c 777 address 10.10.10.10/24

.. _802.1ad: https://en.wikipedia.org/wiki/IEEE_802.1ad