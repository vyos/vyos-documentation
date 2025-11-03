:lastproofread: 2025-09-04

.. _vpp_config_interfaces_xconnect:

.. include:: /_include/need_improvement.txt

##########################
VPP XConnect Configuration
##########################

VPP XConnect provides direct Layer 2 packet forwarding between two interfaces with maximum transparency and minimal overhead. XConnect creates a simple point-to-point bridge that forwards all Layer 2 packets bidirectionally without MAC learning or flooding, making it ideal for transparent connectivity scenarios.

XConnect operates as a super-transparent bridge, forwarding all frames between the connected interfaces without any packet inspection or modification. This provides the simplest possible Layer 2 forwarding with VPP's high-performance packet processing.

Comparison with Bridges
-----------------------

* **XConnect**: Point-to-point only, no MAC learning, maximum transparency, minimal overhead
* **Bridge**: Multi-port, MAC learning, broadcast handling, more features but higher overhead

Choose XConnect when you need simple point-to-point Layer 2 forwarding with maximum performance and transparency. Use bridges when you need multi-port switching with MAC learning and broadcast handling.

Basic Configuration
-------------------

Creating an XConnect Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces xconnect <xconN>

   Create an XConnect interface where ``<xconN>`` follows the naming convention xcon1, xcon2, etc.

.. cfgcmd:: set vpp interfaces xconnect <xconN> member interface <interface-name>

   Add an interface as a member of the XConnect. Exactly two member interfaces must be configured to create bidirectional forwarding.

**Basic Example:**

.. code-block:: none

   set vpp interfaces xconnect xcon1
   set vpp interfaces xconnect xcon1 member interface eth0
   set vpp interfaces xconnect xcon1 member interface eth1

This configuration creates transparent forwarding between eth0 and eth1, where any packet received on either interface is immediately forwarded to the other without any processing.

Interface Configuration
-----------------------

Description and Administrative Control
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces xconnect <xconN> description <description>

   Set a descriptive name for the XConnect interface.

.. cfgcmd:: set vpp interfaces xconnect <xconN> disable

   Administratively disable the XConnect interface.

Configuration Examples
----------------------

Physical Interface XConnect
^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Connect two physical interfaces
   set vpp interfaces xconnect xcon1
   set vpp interfaces xconnect xcon1 description "Transparent wire between ports"
   set vpp interfaces xconnect xcon1 member interface eth0
   set vpp interfaces xconnect xcon1 member interface eth1

This creates a transparent wire between two physical ports, effectively making them function as a single cable.

Tunnel to Physical XConnect
^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Connect tunnel to physical interface
   set vpp interfaces xconnect xcon2
   set vpp interfaces xconnect xcon2 description "GRE tunnel to physical bridge"
   set vpp interfaces xconnect xcon2 member interface gre1
   set vpp interfaces xconnect xcon2 member interface eth2

This forwards all traffic from a GRE tunnel directly to a physical interface and vice versa.

Mixed Interface Types
^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Connect different interface types
   set vpp interfaces xconnect xcon3
   set vpp interfaces xconnect xcon3 description "VXLAN to bonding bridge"
   set vpp interfaces xconnect xcon3 member interface vxlan1
   set vpp interfaces xconnect xcon3 member interface bond0

This demonstrates XConnect's flexibility in connecting various VPP interface types.
