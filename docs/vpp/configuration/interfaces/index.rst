:lastproofread: 2025-09-04

.. _vpp_config_interfaces_index:

.. include:: /_include/need_improvement.txt

############################
VPP Interfaces Configuration
############################

.. toctree::
   :maxdepth: 1
   :includehidden:

   bonding
   bridge
   gre
   ipip
   kernel
   loopback
   vxlan
   xconnect

VyOS utilizes VPP (Vector Packet Processor) to provide high-performance data plane processing. While physical interfaces are typically managed through the Linux kernel using linux-cp (Linux Control Plane) integration, VyOS also supports creating dedicated VPP interfaces for enhanced flexibility and performance.

**Why VPP Interfaces?**

VPP interfaces offer several advantages:

* **Total Isolation**: VPP interfaces operate entirely within the VPP data plane, providing isolation from the Linux kernel when needed
* **Advanced Features**: Access to VPP-specific functionality not available in standard Linux interfaces
* **Flexible Deployment**: Some interface types are only available as VPP interfaces or may not be supported by the kernel
* **Specific scenarios**: Not all use cases require integration with the Linux Kernel

Integration with Kernel
^^^^^^^^^^^^^^^^^^^^^^^

However, if needed, VyOS provides seamless integration between VPP and kernel networking. For detailed information about kernel interface integration, see :doc:`kernel`.

This allows you to leverage the strengths of both approaches - create interfaces inside VPP, but still have them accessible from the Linux kernel and other services side.
