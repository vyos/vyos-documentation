:lastproofread: 2023-01-20

.. _geneve-interface:

######
GENEVE
######

:abbr:`GENEVE (Generic Network Virtualization Encapsulation)` interfaces 
operate as virtual network ports. Administrators can apply standard network 
configurations on them, such as IP addressing, bridging, or firewall rules, 
just as they would on physical Ethernet ports.

GENEVE interfaces are also used for configuring GENEVE tunnels. To transport 
data across the network, they utilize the GENEVE encapsulation protocol. This 
protocol encapsulates Layer 2 Ethernet frames originating from endpoints such 
as virtual machines, containers, or physical servers inside UDP packets. It 
unifies the features of earlier encapsulation protocols, including VXLAN, 
NVGRE, and STT, and addresses their limitations, such as fixed header 
structures and a lack of metadata support. Because of its extensibility, GENEVE 
may eventually replace those older protocols.

GENEVE tunnels are used to connect virtual switches residing within 
hypervisors, physical switches, middleboxes, and other network appliances.

GENEVE tunnels operate over any standard IP network. In larger deployments, 
the underlying network (underlay) is often built using a **Clos** topology, 
also known as a *leaf-and-spine* or *fat-tree* topology.

GENEVE header:

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

   Configure the remote endpoint IP address for the GENEVE tunnel.

.. cfgcmd:: set interfaces geneve gnv0 vni <vni>

   **Configure** :abbr:`VNI (Virtual Network Identifier)` **for the GENEVE 
   interface.**

   The VNI is a virtual network identifier. It allows multiple virtual networks to 
   share the same physical infrastructure while remaining isolated.

   The VNI is also used to distribute traffic after it leaves the tunnel, for 
   example, to map packets with overlapping IP addresses to specific routing 
   tables or to distribute traffic across multiple CPU cores.

.. cfgcmd:: set interfaces gnv0 <interface> port <port>

   **Configure the destination UDP port for the remote GENEVE tunnel endpoint.**

   Ensure the remote peer is configured to listen on this specific port.


