.. _igmp_proxy:

IGMP Proxy
==========

Internet Group Management Protocol (IGMP)

A IGMP Proxy to send IGMP host messages on behalf of a connected client.
The configuration must define one upstream interface, and one or more downstream interfaces.
If multicast traffic originates outside the upstream subnet, the "alt-subnet" option can be used in order to define legal multicast sources.

simple example:
---------------

Interface eth1 LAN is behind NAT. In order to subscribe 10.0.0.0/23 subnet multicast which is in eth0 WAN we need igmp-proxy.

.. code-block:: sh

  # show protocols igmp-proxy 
  interface eth0 {
      alt-subnet 10.0.0.0/23
      role upstream
  }
  interface eth1 {
      role downstream
  }