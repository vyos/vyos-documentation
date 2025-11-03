:lastproofread: 2025-09-04

.. _vpp_config_interfaces_loopback:

.. include:: /_include/need_improvement.txt

####################################
VPP Loopback Interface Configuration
####################################

VPP loopback interfaces provide virtual interfaces that remain administratively up and are commonly used for stable addressing, routing protocols, and as Bridge Virtual Interfaces (BVI). Loopback interfaces in VPP offer high-performance virtual connectivity with optimized packet processing.

Basic Configuration
-------------------

Creating a Loopback Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces loopback <loN>

   Create a loopback interface where ``<loN>`` follows the naming convention lo1, lo2, etc.

**Basic Example:**

.. code-block:: none

   set vpp interfaces loopback lo1

Interface Configuration
-----------------------

Description and Administrative Control
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces loopback <loN> description <description>

   Set a descriptive name for the loopback interface.

.. cfgcmd:: set vpp interfaces loopback <loN> disable

   Administratively disable the loopback interface.

Kernel Interface Integration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces loopback <loN> kernel-interface <interface-name>

   Bind a kernel interface to the loopback interface for management and application compatibility.

For detailed information about kernel interface integration, see :doc:`kernel`.

Configuration Examples
----------------------

Basic Loopback Interface
^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Create simple loopback
   set vpp interfaces loopback lo1
   set vpp interfaces loopback lo1 description "Router ID interface"

Loopback with Kernel Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Loopback with management access
   set vpp interfaces loopback lo2
   set vpp interfaces loopback lo2 description "Management loopback"
   set vpp interfaces loopback lo2 kernel-interface vpptun2
   set vpp kernel-interfaces vpptun2 address 10.255.255.1/32

Bridge Virtual Interface (BVI)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Loopback as BVI for bridge
   set vpp interfaces loopback lo3
   set vpp interfaces loopback lo3 description "Bridge gateway interface"
   set vpp interfaces bridge br1
   set vpp interfaces bridge br1 member interface lo3 bvi
   set vpp interfaces loopback lo3 kernel-interface vpptun3
   set vpp kernel-interfaces vpptun3 address 192.168.100.1/24
