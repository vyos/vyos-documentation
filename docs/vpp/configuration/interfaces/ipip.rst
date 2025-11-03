:lastproofread: 2025-09-04

.. _vpp_config_interfaces_ipip:

.. include:: /_include/need_improvement.txt

######################
VPP IPIP Configuration
######################

VPP IPIP interfaces provide IP-in-IP tunneling with high-performance packet processing. IPIP tunnels encapsulate IP packets within IP packets, creating point-to-point connections across Layer 3 networks.

Basic Configuration
-------------------

Creating an IPIP Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces ipip <ipipN>

   Create an IPIP interface where ``<ipipN>`` follows the naming convention ipip1, ipip2, etc.

.. cfgcmd:: set vpp interfaces ipip <ipipN> remote <address>

   Set the tunnel remote endpoint address. Supports both IPv4 and IPv6 addresses.

.. cfgcmd:: set vpp interfaces ipip <ipipN> source-address <address>

   Set the tunnel source address. Must match an address configured on the local system.

**Basic Example:**

.. code-block:: none

   set vpp interfaces ipip ipip1
   set vpp interfaces ipip ipip1 remote 203.0.113.2
   set vpp interfaces ipip ipip1 source-address 192.168.1.1

Interface Configuration
-----------------------

Description and Administrative Control
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces ipip <ipipN> description <description>

   Set a descriptive name for the IPIP interface.

.. cfgcmd:: set vpp interfaces ipip <ipipN> disable

   Administratively disable the IPIP interface.

Kernel Interface Integration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces ipip <ipipN> kernel-interface <interface-name>

   Bind a kernel interface to the IPIP tunnel for management and application compatibility.

For detailed information about kernel interface integration, see :doc:`kernel`.

Configuration Examples
----------------------

IPv4 IPIP Tunnel
^^^^^^^^^^^^^^^^

.. code-block:: none

   # Basic IPv4 IPIP tunnel
   set vpp interfaces ipip ipip1
   set vpp interfaces ipip ipip1 description "Site-to-site IPIP tunnel"
   set vpp interfaces ipip ipip1 remote 203.0.113.10
   set vpp interfaces ipip ipip1 source-address 192.168.1.1

IPv6 IPIP Tunnel
^^^^^^^^^^^^^^^^

.. code-block:: none

   # IPv6 endpoints
   set vpp interfaces ipip ipip2
   set vpp interfaces ipip ipip2 remote 2001:db8::2
   set vpp interfaces ipip ipip2 source-address 2001:db8::1

IPIP with Kernel Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # IPIP tunnel with management interface
   set vpp interfaces ipip ipip3
   set vpp interfaces ipip ipip3 remote 203.0.113.30
   set vpp interfaces ipip ipip3 source-address 192.168.1.1
   set vpp interfaces ipip ipip3 kernel-interface vpptun3
   set vpp kernel-interfaces vpptun3 address 10.0.2.1/30
