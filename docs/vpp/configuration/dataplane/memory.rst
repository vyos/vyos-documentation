:lastproofread: 2025-09-04

.. _vpp_config_dataplane_memory:

.. include:: /_include/need_improvement.txt

########################
VPP Memory Configuration
########################

VPP heavily relies on hugepages for its memory management. Hugepages are larger memory pages that reduce the overhead of page management and improve performance for applications that require large amounts of memory, such as VPP.

VPP supports both 2MB and 1GB hugepages, but the default and most commonly used size is 2MB. The choice of hugepage size can impact performance, with larger pages generally providing better performance for memory-intensive applications.

Before configuring memory in VPP dataplane settings, you need to ensure that hugepages are enabled and properly configured on your system.

.. seealso:: :ref:`Hugepages in VyOS Configuration for VPP <vpp_config_hugepages>`

To configure memory settings for VPP, you can use the following commands in the VPP CLI:

VPP uses a main heap as a central memory pool for FIB data structures entries allocations.

Efficient memory management is crucial for VPP's performance, and the main heap plays a significant role in this.

It can be configured using the following command:

.. cfgcmd:: set vpp settings memory main-heap-page-size <size>

Sets the main heap page size for VPP. 

.. cfgcmd:: set vpp settings memory main-heap-size <size>

Sets the main heap size for VPP.


Potential Issues and Troubleshooting
====================================

Improper configuration of main heap size can lead to performance degradation or even system instability. If VPP runs out of memory in the main heap, it may crash or exhibit erratic behavior. Symptoms you may observe include:

- Increased latency or packet loss
- Crashes or restarts of VPP processes, especially during routing table populating (e.g., BGP session establishment)
- Error messages related to memory allocation failures

You need to tune the main heap size based on expected FIB entries. Pay attention - same amount of routes with a single next-hop and with multiple next-hops will consume different amounts of memory.
