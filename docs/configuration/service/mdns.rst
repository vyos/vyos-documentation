mDNS Repeater
-------------

Starting with VyOS 1.2 a :abbr:`mDNS (Multicast DNS)` repeater functionality is
provided. Additional information can be obtained from
https://en.wikipedia.org/wiki/Multicast_DNS.

Multicast DNS uses the 224.0.0.251 address, which is "administratively scoped"
and does not leave the subnet. It retransmits mDNS packets from one interface
to other interfaces. This enables support for e.g. Apple Airplay devices across
multiple VLANs.

Since the mDNS protocol sends the AA records in the packet itself, the repeater
does not need to forge the source address. Instead, the source address is of
the interface that repeats the packet.

Configuration
=============

.. cfgcmd:: set service mdns repeater interface <interface>

   To enable mDNS repeater you need to configure at least two interfaces. To
   re-broadcast all incoming mDNS packets from any interface configured here to
   any other interface configured under this section.

.. cfgcmd:: set service mdns repeater disable

   mDNS repeater can be temporarily disabled without deleting the service using

.. note:: You can not run this in a VRRP setup, if multiple mDNS repeaters
   are launched in a subnet you will experience the mDNS packet storm death!

Example
=======

To listen on both `eth0` and `eth1` mDNS packets and also repeat packets
received on `eth0` to `eth1` (and vice-versa) use the following commands:

.. code-block:: none

  set service mdns repeater interface 'eth0'
  set service mdns repeater interface 'eth1'

.. _`Multicast DNS`: https://en.wikipedia.org/wiki/Multicast_DNS
