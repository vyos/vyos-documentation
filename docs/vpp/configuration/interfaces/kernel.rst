:lastproofread: 2025-09-04

.. _vpp_config_interfaces_kernel:

.. include:: /_include/need_improvement.txt

###################################
VPP Kernel Interfaces Configuration
###################################

VPP kernel interfaces provide a bridge between the high-performance VPP data plane and the Linux kernel networking stack. These interfaces appear as standard network interfaces in the kernel while being transparently connected to VPP interfaces, enabling seamless integration between VPP processing and kernel-based applications.

**How Kernel Interfaces Work:**

* Traffic sent to the kernel interface by any application or kernel is forwarded to the connected VPP interface
* Traffic processed within VPP is sent to the kernel interface only if VPP cannot handle it (e.g., no matching route)
* Standard Linux networking tools and daemons can interact with VPP interfaces

**Use Cases:**

* Integrating VPP interfaces with routing daemons (FRR, BIRD)
* Providing management access to VPP-processed networks
* Running standard network services on VPP interfaces

Interface Types: TUN vs TAP
---------------------------

VPP kernel interfaces support two types of virtual network interfaces that differ in how they handle network traffic.

**TAP Interfaces (vpptapN)**

TAP interfaces operate at Layer 2 (Data Link Layer) and work with complete Ethernet frames. They process full Ethernet packets including MAC addresses and headers, making them suitable for scenarios where you need complete Layer 2 functionality. TAP interfaces can participate in bridging and switching operations, and they provide native support for VLAN tagging and sub-interfaces. This makes them ideal for Layer 2 connectivity, bridging setups, and VLAN segmentation.

**TUN Interfaces (vpptunN)**

TUN interfaces operate at Layer 3 (Network Layer) and handle raw IP packets without Ethernet headers. They are optimized for Layer 3 routing operations and have lower processing overhead due to their simpler packet structure. TUN interfaces are typically used for VPN tunnels, point-to-point links, and routing applications where Layer 2 functionality is not required.

**Choosing the Right Interface Type**

The choice between TUN and TAP depends on your specific networking requirements. Use TAP interfaces when you need Layer 2 functionality such as bridging, VLANs, or full Ethernet compatibility. Choose TUN interfaces when you only need Layer 3 functionality for routing or VPN scenarios. While TAP interfaces are more versatile, they have slightly higher overhead compared to TUN interfaces, which are more efficient for pure routing scenarios.

.. note::

   The interface type is determined by the naming convention: ``vpptapN`` creates TAP interfaces, while ``vpptunN`` creates TUN interfaces. Both support the same configuration commands but behave differently at the packet processing level.

Basic Configuration
-------------------

Creating a Kernel Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp kernel-interfaces <interface-name>

   Create a kernel interface. The interface name follows the convention ``vpptapN`` or ``vpptunN``.

**Example:**

.. code-block:: none

   set vpp kernel-interfaces vpptap1

Interface Description
^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp kernel-interfaces <interface-name> description <description>

   Set a descriptive name for the kernel interface.

**Example:**

.. code-block:: none

   set vpp kernel-interfaces vpptap1 description "Management interface for VPP bond"

Administrative Control
^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp kernel-interfaces <interface-name> disable

   Administratively disable the kernel interface. By default, interfaces are enabled.

IP Address Configuration
------------------------

.. cfgcmd:: set vpp kernel-interfaces <interface-name> address <ip-address/prefix>

   Configure IPv4 or IPv6 addresses on the kernel interface. Multiple addresses can be assigned.

**Examples:**

.. code-block:: none

   # IPv4 address
   set vpp kernel-interfaces vpptap1 address 192.168.1.10/24
   
   # IPv6 address
   set vpp kernel-interfaces vpptap1 address 2001:db8::10/64
   
   # Multiple addresses
   set vpp kernel-interfaces vpptap1 address 192.168.1.10/24
   set vpp kernel-interfaces vpptap1 address 10.0.0.10/8

MTU Configuration
-----------------

.. cfgcmd:: set vpp kernel-interfaces <interface-name> mtu <size>

   Set the Maximum Transmission Unit (MTU) for the kernel interface. The MTU must be compatible with the connected VPP interface.

**Example:**

.. code-block:: none

   set vpp kernel-interfaces vpptap1 mtu 9000

.. note::

   Ensure the MTU setting matches or is smaller than the MTU supported by the associated VPP interface to avoid issues.

Receive Processing Mode
-----------------------

.. cfgcmd:: set vpp kernel-interfaces <interface-name> rx-mode <mode>

   Configure how the interface processes received packets:

   * **polling**: Constantly check for new data (highest performance, higher CPU usage)
   * **interrupt**: Interrupt-driven processing (balanced performance and CPU usage)
   * **adaptive**: Automatically switch between polling and interrupt based on traffic load

**Examples:**

.. code-block:: none

   # High-performance mode (default)
   set vpp kernel-interfaces vpptap1 rx-mode polling
   
   # Balanced mode
   set vpp kernel-interfaces vpptap1 rx-mode interrupt
   
   # Adaptive mode
   set vpp kernel-interfaces vpptap1 rx-mode adaptive

VLAN Configuration
------------------

VPP kernel interfaces support VLAN (Virtual LAN) sub-interfaces for network segmentation.

Creating VLAN Sub-interfaces
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set vpp kernel-interfaces <interface-name> vif <vlan-id>

   Create a VLAN sub-interface with the specified VLAN ID (0-4094).

**Example:**

.. code-block:: none

   set vpp kernel-interfaces vpptap1 vif 100

VLAN Sub-interface Configuration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

VLAN sub-interfaces support the same configuration options as the parent interface:

.. cfgcmd:: set vpp kernel-interfaces <interface-name> vif <vlan-id> address <ip-address/prefix>

.. cfgcmd:: set vpp kernel-interfaces <interface-name> vif <vlan-id> description <description>

.. cfgcmd:: set vpp kernel-interfaces <interface-name> vif <vlan-id> disable

.. cfgcmd:: set vpp kernel-interfaces <interface-name> vif <vlan-id> mtu <size>

**Examples:**

.. code-block:: none

   # Configure VLAN 100
   set vpp kernel-interfaces vpptap1 vif 100 address 192.168.100.1/24
   set vpp kernel-interfaces vpptap1 vif 100 description "Management VLAN"
   set vpp kernel-interfaces vpptap1 vif 100 mtu 1500
   
   # Configure VLAN 200
   set vpp kernel-interfaces vpptap1 vif 200 address 192.168.200.1/24
   set vpp kernel-interfaces vpptap1 vif 200 description "Guest VLAN"

Configuration Examples
----------------------

Basic Kernel Interface
^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Create basic kernel interface
   set vpp kernel-interfaces vpptap1
   set vpp kernel-interfaces vpptap1 description "VPP-Kernel bridge"
   set vpp kernel-interfaces vpptap1 address 192.168.1.10/24
   set vpp kernel-interfaces vpptap1 mtu 1500
   set vpp kernel-interfaces vpptap1 rx-mode adaptive

High-Performance Interface
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # High-throughput configuration
   set vpp kernel-interfaces vpptap2
   set vpp kernel-interfaces vpptap2 description "High-performance bridge"
   set vpp kernel-interfaces vpptap2 address 10.0.0.10/8
   set vpp kernel-interfaces vpptap2 mtu 9000
   set vpp kernel-interfaces vpptap2 rx-mode polling

Multi-VLAN Setup
^^^^^^^^^^^^^^^^

.. code-block:: none

   # Parent interface
   set vpp kernel-interfaces vpptap3
   set vpp kernel-interfaces vpptap3 description "Multi-VLAN trunk"
   
   # Management VLAN
   set vpp kernel-interfaces vpptap3 vif 10
   set vpp kernel-interfaces vpptap3 vif 10 address 192.168.10.1/24
   set vpp kernel-interfaces vpptap3 vif 10 description "Management network"
   
   # Production VLAN
   set vpp kernel-interfaces vpptap3 vif 20
   set vpp kernel-interfaces vpptap3 vif 20 address 192.168.20.1/24
   set vpp kernel-interfaces vpptap3 vif 20 description "Production network"
   
   # Guest VLAN
   set vpp kernel-interfaces vpptap3 vif 30
   set vpp kernel-interfaces vpptap3 vif 30 address 192.168.30.1/24
   set vpp kernel-interfaces vpptap3 vif 30 description "Guest network"

Bonding Integration
^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   # Create VPP bonding interface
   set vpp interfaces bonding bond0
   set vpp interfaces bonding bond0 member interface eth0
   set vpp interfaces bonding bond0 member interface eth1
   set vpp interfaces bonding bond0 kernel-interface vpptap1
   
   # Configure the kernel interface for the bond
   set vpp kernel-interfaces vpptap1 address 192.168.1.10/24
   set vpp kernel-interfaces vpptap1 description "Bond management interface"

Best Practices
--------------

* Use kernel interfaces selectively - not every VPP interface needs kernel exposure and also not all VPP interface types support kernel interfaces
* Consider the performance impact of copying traffic between VPP and kernel
