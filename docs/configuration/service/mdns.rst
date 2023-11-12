mDNS Repeater
-------------

Starting with VyOS 1.2 a :abbr:`mDNS (Multicast DNS)` repeater functionality is
provided. Additional information can be obtained from
https://en.wikipedia.org/wiki/Multicast_DNS.

Multicast DNS uses the reserved address ``224.0.0.251``, which is
`"administratively scoped"` and does not leave the subnet. mDNS repeater
retransmits mDNS packets from one interface to other interfaces. This enables
support for devices using mDNS discovery (like network printers, Apple Airplay,
Chromecast, various IP based home-automation devices etc) across multiple VLANs.

Since the mDNS protocol sends the :abbr:`AA(Authoritative Answer)` records in
the packet itself, the repeater does not need to forge the source address.
Instead, the source address is of the interface that repeats the packet.

Configuration
=============

.. cfgcmd:: set service mdns repeater interface <interface>

   To enable mDNS repeater you need to configure at least two interfaces so that
   all incoming mDNS packets from one interface configured here can be
   re-broadcasted to any other interface(s) configured under this section.

.. cfgcmd:: set service mdns repeater disable

   mDNS repeater can be temporarily disabled without deleting the service using

.. cfgcmd:: set service mdns repeater ip-version <ipv4 | ipv6 | both>

   mDNS repeater can be enabled either on IPv4 socket or on IPv6 socket or both
   to re-broadcast. By default, mDNS repeater will listen on both IPv4 and IPv6.

.. cfgcmd:: set service mdns repeater allow-service <service>

   mDNS repeater can be configured to re-broadcast only specific services. By
   default, all services are re-broadcasted.

.. cfgcmd:: set service mdns repeater browse-domain <domain>

   Allow listing additional custom domains to be browsed (in addition to the
   default ``local``) so that they can be reflected.

.. note:: You can not run this in a VRRP setup, if multiple mDNS repeaters
   are launched in a subnet you will experience the mDNS packet storm death!

Example
-------

To listen on both `eth0` and `eth1` mDNS packets and also repeat packets
received on `eth0` to `eth1` (and vice-versa) use the following commands:

.. code-block:: none

  set service mdns repeater interface 'eth0'
  set service mdns repeater interface 'eth1'

To allow only specific services, for example ``_airplay._tcp`` or ``_ipp._tcp``,
(instead of all services) to be re-broadcasted, use the following command:

.. code-block:: none

  set service mdns repeater allow-service '_airplay._tcp'
  set service mdns repeater allow-service '_ipp._tcp'

To allow listing additional custom domain, for example
``openthread.thread.home.arpa``, so that it can reflected in addition to the
default ``local``, use the following command:

.. code-block:: none

   set service mdns repeater browse-domain 'openthread.thread.home.arpa'

.. _`Multicast DNS`: https://en.wikipedia.org/wiki/Multicast_DNS

Operation
=========

.. opcmd:: restart mdns repeater

  Restart mDNS repeater service.

.. opcmd:: show log mdns repeater

  Show logs for mDNS repeater service.

.. opcmd:: monitor log mdns repeater

  Follow the logs for mDNS repeater service.
