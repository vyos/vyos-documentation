:lastproofread: 2025-09-04

.. _vpp_config_interfaces_bonding:

.. include:: /_include/need_improvement.txt

#########################
VPP Bonding Configuration
#########################

VPP bonding interfaces provide link aggregation capabilities, combining multiple physical interfaces into a single logical interface for increased bandwidth and redundancy. VPP bonding offers high-performance packet processing compared to traditional Linux bonding.

Basic Configuration
-------------------

Creating a Bonding Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

To create a VPP bonding interface:

.. cfgcmd:: set vpp interfaces bonding <bondN>

   Create a bonding interface where ``<bondN>`` follows the naming convention bond0, bond1, etc.

**Example:**

.. code-block:: none

   set vpp interfaces bonding bond0

Interface Description
^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces bonding <bondN> description <description>

   Set a descriptive name for the bonding interface.

**Example:**

.. code-block:: none

   set vpp interfaces bonding bond0 description "Primary uplink bond"

Administrative Control
^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces bonding <bondN> disable

   Administratively disable the bonding interface. By default, interfaces are enabled.

Member Interface Configuration
------------------------------

Adding Member Interfaces
^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp interfaces bonding <bondN> member interface <interface-name>

   Add physical interfaces as members of the bond. Multiple interfaces can be added to the same bond.

**Example:**

.. code-block:: none

   set vpp interfaces bonding bond0 member interface eth0
   set vpp interfaces bonding bond0 member interface eth1

.. note::

   Member interfaces should be of the same speed and duplex for optimal performance and already be attached to VPP.

Bonding Modes
-------------

.. cfgcmd:: set vpp interfaces bonding <bondN> mode <mode>

   Configure the bonding mode. Available modes:

   * **802.3ad**: IEEE 802.3ad Dynamic Link Aggregation (LACP) - Default
   * **active-backup**: Fault tolerant, only one slave interface active
   * **broadcast**: Transmits everything on all slave interfaces
   * **round-robin**: Load balance by transmitting packets in sequential order
   * **xor-hash**: Distribute based on hash policy

**Examples:**

.. code-block:: none

   # Use LACP (recommended for switch environments)
   set vpp interfaces bonding bond0 mode 802.3ad
   
   # Use active-backup for simple failover
   set vpp interfaces bonding bond0 mode active-backup

Hash Policies
-------------

For load balancing modes, configure how traffic is distributed across member interfaces:

.. cfgcmd:: set vpp interfaces bonding <bondN> hash-policy <policy>

   Set the transmit hash policy:

   * **layer2**: Use MAC addresses to generate hash (default)
   * **layer2+3**: Combine MAC addresses and IP addresses
   * **layer3+4**: Combine IP addresses and port numbers

**Examples:**

.. code-block:: none

   # Layer 2 hashing (default)
   set vpp interfaces bonding bond0 hash-policy layer2
   
   # Layer 3+4 for better distribution with multiple flows
   set vpp interfaces bonding bond0 hash-policy layer3+4

MAC Address Configuration
-------------------------

.. cfgcmd:: set vpp interfaces bonding <bondN> mac <mac-address>

   Set a specific MAC address for the bonding interface.

**Example:**

.. code-block:: none

   set vpp interfaces bonding bond0 mac 00:11:22:33:44:55

Kernel Interface Integration
----------------------------

.. cfgcmd:: set vpp interfaces bonding <bondN> kernel-interface <interface-name>

   Create a kernel interface bound to the VPP bonding interface. This allows standard Linux networking tools and services to interact with the VPP bond.

For detailed information about kernel interface integration, see :doc:`kernel`.

**Example:**

.. code-block:: none

   set vpp interfaces bonding bond0 kernel-interface vpptap0

.. important::

   When using kernel interface binding, you can configure IP addresses and other network settings on the kernel interface.

   A kernel-interface must be created beforehand.

Complete Configuration Example
------------------------------

Here's a complete example configuring a bonding interface with LACP:

.. code-block:: none

   # Create bonding interface
   set vpp interfaces bonding bond0
   set vpp interfaces bonding bond0 description "Server uplink bond"
   
   # Configure bonding parameters
   set vpp interfaces bonding bond0 mode 802.3ad
   set vpp interfaces bonding bond0 hash-policy layer3+4
   
   # Add member interfaces
   set vpp interfaces bonding bond0 member interface eth0
   set vpp interfaces bonding bond0 member interface eth1
   
   # Create kernel interface for OS integration
   set vpp interfaces bonding bond0 kernel-interface vpptap0
   
   # Configure IP on kernel interface
   set vpp kernel-interfaces vpptap0 address 192.168.1.10/24

Best Practices
--------------

* Use **802.3ad mode** with LACP-capable switches for best performance and standards compliance
* Configure **layer3+4 hash policy** for environments with multiple traffic flows
* Ensure member interfaces have identical capabilities (speed, duplex, MTU)
