:lastproofread: 2023-01-20

.. _geneve-interface:

######
GENEVE
######

:abbr:`GENEVE (Generic Network Virtualization Encapsulation)` supports all of
the capabilities of :abbr:`VXLAN (Virtual Extensible LAN)`, :abbr:`NVGRE
(Network Virtualization using Generic Routing Encapsulation)`, and :abbr:`STT
(Stateless Transport Tunneling)` and was designed to overcome their perceived
limitations. Many believe GENEVE could eventually replace these earlier formats
entirely.

GENEVE is designed to support network virtualization use cases, where tunnels
are typically established to act as a backplane between the virtual switches
residing in hypervisors, physical switches, or middleboxes or other appliances.
An arbitrary IP network can be used as an underlay although Clos networks - A
technique for composing network fabrics larger than a single switch while
maintaining non-blocking bandwidth across connection points. ECMP is used to
divide traffic across the multiple links and switches that constitute the
fabric. Sometimes termed "leaf and spine" or "fat tree" topologies.

Geneve Header:

.. code-block:: none

  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |Ver|  Opt Len  |O|C|    Rsvd.  |          Protocol Type        |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |        Virtual Network Identifier (VNI)       |    Reserved   |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
  |                    Variable Length Options                    |
  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-address.txt
  :var0: geneve
  :var1: gnv0

.. cmdinclude:: /_include/interface-description.txt
  :var0: geneve
  :var1: gnv0

.. cmdinclude:: /_include/interface-disable.txt
  :var0: geneve
  :var1: gnv0

.. cmdinclude:: /_include/interface-mac.txt
  :var0: geneve
  :var1: gnv0

.. cmdinclude:: /_include/interface-mtu.txt
  :var0: geneve
  :var1: gnv0

.. cmdinclude:: /_include/interface-ip.txt
  :var0: geneve
  :var1: gnv0

.. cmdinclude:: /_include/interface-ipv6.txt
  :var0: geneve
  :var1: gnv0

GENEVE options
==============

.. cfgcmd:: set interfaces geneve gnv0 remote <address>

   Configure GENEVE tunnel far end/remote tunnel endpoint.

.. cfgcmd:: set interfaces geneve gnv0 vni <vni>

   :abbr:`VNI (Virtual Network Identifier)` is an identifier for a unique
   element of a virtual network.  In many situations this may represent an L2
   segment, however, the control plane defines the forwarding semantics of
   decapsulated packets. The VNI MAY be used as part of ECMP forwarding
   decisions or MAY be used as a mechanism to distinguish between overlapping
   address spaces contained in the encapsulated packet when load balancing
   across CPUs.
