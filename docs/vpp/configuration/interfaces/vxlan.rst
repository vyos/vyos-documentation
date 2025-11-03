:lastproofread: 2025-09-04

.. _vpp_config_interfaces_vxlan:

.. include:: /_include/need_improvement.txt

#######################
VPP VXLAN Configuration
#######################

VPP VXLAN interfaces provide Virtual eXtensible Local Area Network tunneling with high-performance packet processing. VXLAN extends Layer 2 domains across Layer 3 networks using UDP encapsulation, enabling scalable multi-tenant networking while leveraging VPP's optimized data plane.

Basic Configuration
-------------------

Creating a VXLAN Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces vxlan <vxlanN>

   Create a VXLAN interface where ``<vxlanN>`` follows the naming convention vxlan1, vxlan2, etc.

.. cfgcmd:: set vpp interfaces vxlan <vxlanN> vni <vni>

   Set the Virtual Network Identifier (VNI) for the VXLAN tunnel. Valid range is 0-16777214.

.. cfgcmd:: set vpp interfaces vxlan <vxlanN> remote <address>

   Set the tunnel remote endpoint address. Supports both IPv4 and IPv6 addresses.

.. cfgcmd:: set vpp interfaces vxlan <vxlanN> source-address <address>

   Set the tunnel source address. Must match an address configured on the local system.

**Basic Example:**

.. code-block:: none

   set vpp interfaces vxlan vxlan1
   set vpp interfaces vxlan vxlan1 vni 100
   set vpp interfaces vxlan vxlan1 remote 203.0.113.2
   set vpp interfaces vxlan vxlan1 source-address 192.168.1.1

Interface Configuration
-----------------------

Description and Administrative Control
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces vxlan <vxlanN> description <description>

   Set a descriptive name for the VXLAN interface.

.. cfgcmd:: set vpp interfaces vxlan <vxlanN> disable

   Administratively disable the VXLAN interface.

Kernel Interface Integration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces vxlan <vxlanN> kernel-interface <interface-name>

   Bind a kernel interface to the VXLAN tunnel for management and application compatibility.

For detailed information about kernel interface integration, see :doc:`kernel`.

Configuration Examples
----------------------

Basic VXLAN Tunnel
^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # IPv4 VXLAN tunnel
   set vpp interfaces vxlan vxlan1
   set vpp interfaces vxlan vxlan1 description "Tenant A network extension"
   set vpp interfaces vxlan vxlan1 vni 1000
   set vpp interfaces vxlan vxlan1 remote 203.0.113.10
   set vpp interfaces vxlan vxlan1 source-address 192.168.1.1

IPv6 VXLAN Tunnel
^^^^^^^^^^^^^^^^^

.. code-block:: none

   # IPv6 endpoints
   set vpp interfaces vxlan vxlan2
   set vpp interfaces vxlan vxlan2 vni 2000
   set vpp interfaces vxlan vxlan2 remote 2001:db8::2
   set vpp interfaces vxlan vxlan2 source-address 2001:db8::1

VXLAN with Kernel Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # VXLAN tunnel with management interface
   set vpp interfaces vxlan vxlan3
   set vpp interfaces vxlan vxlan3 vni 3000
   set vpp interfaces vxlan vxlan3 remote 203.0.113.30
   set vpp interfaces vxlan vxlan3 source-address 192.168.1.1
   set vpp interfaces vxlan vxlan3 kernel-interface vpptun3
   set vpp kernel-interfaces vpptun3 address 10.0.3.1/24

Bridge Integration
------------------

VXLAN interfaces are commonly used as members in VPP bridges for Layer 2 extension. See :doc:`bridge` for detailed bridge configuration.

.. code-block:: none

   # Add VXLAN tunnel to bridge
   set vpp interfaces bridge br1
   set vpp interfaces bridge br1 member interface vxlan1
   set vpp interfaces bridge br1 member interface eth1
   set vpp interfaces bridge br1 member interface lo1 bvi

Multi-Tenant Configuration
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Multiple VNIs for tenant separation
   set vpp interfaces vxlan vxlan10
   set vpp interfaces vxlan vxlan10 description "Tenant A - Production"
   set vpp interfaces vxlan vxlan10 vni 1001
   set vpp interfaces vxlan vxlan10 remote 203.0.113.20
   set vpp interfaces vxlan vxlan10 source-address 192.168.1.1
   
   set vpp interfaces vxlan vxlan11
   set vpp interfaces vxlan vxlan11 description "Tenant A - Development"
   set vpp interfaces vxlan vxlan11 vni 1002
   set vpp interfaces vxlan vxlan11 remote 203.0.113.21
   set vpp interfaces vxlan vxlan11 source-address 192.168.1.1
