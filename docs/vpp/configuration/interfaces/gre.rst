:lastproofread: 2025-09-04

.. _vpp_config_interfaces_gre:

.. include:: /_include/need_improvement.txt

#####################
VPP GRE Configuration
#####################

VPP GRE interfaces provide Generic Routing Encapsulation tunneling with high-performance packet processing. GRE tunnels encapsulate various protocols within IP packets, enabling connectivity across Layer 3 networks while maintaining the performance benefits of VPP's optimized data plane.

Basic Configuration
-------------------

Creating a GRE Interface
^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces gre <greN>

   Create a GRE interface where ``<greN>`` follows the naming convention gre1, gre2, etc.

.. cfgcmd:: set vpp interfaces gre <greN> remote <address>

   Set the tunnel remote endpoint address. Supports both IPv4 and IPv6 addresses.

.. cfgcmd:: set vpp interfaces gre <greN> source-address <address>

   Set the tunnel source address. Must match an address configured on the local system.

**Basic Example:**

.. code-block:: none

   set vpp interfaces gre gre1
   set vpp interfaces gre gre1 remote 203.0.113.2
   set vpp interfaces gre gre1 source-address 192.168.1.1

Interface Configuration
-----------------------

Description and Administrative Control
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces gre <greN> description <description>

   Set a descriptive name for the GRE interface.

.. cfgcmd:: set vpp interfaces gre <greN> disable

   Administratively disable the GRE interface.

Tunnel Mode
^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces gre <greN> mode <mode>

   Configure the GRE tunnel operating mode:

   * ``point-to-point`` - Default mode for direct tunnel between two endpoints
   * ``point-to-multipoint`` - Allows multiple remote endpoints

Tunnel Type
^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces gre <greN> tunnel-type <type>

   Set the GRE tunnel encapsulation type:

   * ``l3`` - Generic Routing Encapsulation for network layer traffic (default)
   * ``teb`` - Transparent Ethernet Bridge for Layer 2 frame transport
   * ``erspan`` - Encapsulated Remote Switched Port Analyzer for traffic mirroring

Kernel Interface Integration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces gre <greN> kernel-interface <interface-name>

   Bind a kernel interface to the GRE tunnel for management and application compatibility.

For detailed information about kernel interface integration, see :doc:`kernel`.

Configuration Examples
----------------------

Layer 3 GRE Tunnel
^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # IPv4 GRE tunnel
   set vpp interfaces gre gre1
   set vpp interfaces gre gre1 description "Site-to-site tunnel"
   set vpp interfaces gre gre1 remote 203.0.113.10
   set vpp interfaces gre gre1 source-address 192.168.1.1
   set vpp interfaces gre gre1 tunnel-type l3

Layer 2 GRE Tunnel (TEB)
^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Transparent Ethernet Bridge
   set vpp interfaces gre gre2
   set vpp interfaces gre gre2 description "L2 extension tunnel"
   set vpp interfaces gre gre2 remote 203.0.113.20
   set vpp interfaces gre gre2 source-address 192.168.1.1
   set vpp interfaces gre gre2 tunnel-type teb

IPv6 GRE Tunnel
^^^^^^^^^^^^^^^

.. code-block:: none

   # IPv6 endpoints
   set vpp interfaces gre gre3
   set vpp interfaces gre gre3 remote 2001:db8::2
   set vpp interfaces gre gre3 source-address 2001:db8::1

Point-to-Multipoint Configuration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Hub configuration for multiple spokes
   set vpp interfaces gre gre4
   set vpp interfaces gre gre4 mode point-to-multipoint
   set vpp interfaces gre gre4 remote 0.0.0.0
   set vpp interfaces gre gre4 source-address 192.168.1.1

.. note::

   For point-to-multipoint mode, the remote address must be set to 0.0.0.0 to allow multiple remote endpoints.

GRE with Kernel Interface
^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # GRE tunnel with management interface
   set vpp interfaces gre gre5
   set vpp interfaces gre gre5 remote 203.0.113.30
   set vpp interfaces gre gre5 source-address 192.168.1.1
   set vpp interfaces gre gre5 kernel-interface vpptun5
   set vpp kernel-interfaces vpptun5 address 10.0.1.1/30

Bridge Integration
------------------

GRE interfaces can be added as members to VPP bridges for Layer 2 switching. See :doc:`bridge` for detailed bridge configuration.

.. code-block:: none

   # Add TEB GRE tunnel to bridge
   set vpp interfaces bridge br1
   set vpp interfaces bridge br1 member interface gre2
   set vpp interfaces bridge br1 member interface eth1
