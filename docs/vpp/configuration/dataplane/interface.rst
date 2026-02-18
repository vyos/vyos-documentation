:lastproofread: 2025-09-04

.. _vpp_config_dataplane_interface:

.. include:: /_include/need_improvement.txt

######################################
VPP Dataplane Interfaces Configuration
######################################

Only Ethernet interfaces (physical or virtual) can be connected to the VPP dataplane. Interfaces configured here act as a bridge between VPP and the outside world, allowing VPP to send and receive packets into the network.


Interface Configuration Parameters
==================================

Interfaces connected to the VPP dataplane use the DPDK driver by default, providing high performance and low latency.

.. cfgcmd:: set vpp settings interface <interface-name>

Some network interface cards (NICs) may not be compatible with the DPDK driver.

DPDK interface options
----------------------

This section allows for the configuration of various DPDK-specific settings for an interface.

.. cfgcmd:: set vpp settings interface <interface-name> num-rx-queues <value>

Specifies the number of receive queues for the interface. More queues can improve performance on multi-core systems by allowing parallel processing of incoming packets. Each queue will be assigned to a separate CPU core.

.. cfgcmd:: set vpp settings interface <interface-name> num-tx-queues <value>

Specifies the number of transmit queues for the interface. Similar to receive queues, more transmit queues can enhance performance by enabling parallel processing of outgoing packets. By default, the VPP Dataplane has one TX queue per enabled CPU worker, or a single queue if no workers are configured.

.. seealso:: :doc:`cpu`

.. cfgcmd:: set vpp settings interface <interface-name> num-rx-desc <value>

Defines the size of each receive queue. Larger queue sizes can help accommodate bursts of incoming traffic, reducing the likelihood of packet drops during high traffic periods.

.. cfgcmd:: set vpp settings interface <interface-name> num-tx-desc <value>

Defines the size of each transmit queue. Larger sizes can help manage bursts of outgoing traffic more effectively.

Global Interface Parameters
===========================

.. _vpp_config_dataplane_interface_rx_mode:

interface-rx-mode
-----------------

The interface-rx-mode parameter defines how VPP handles incoming packets on interfaces. There are several modes available, each with its own advantages and use cases:

- ``interrupt``: In this mode, VPP relies on hardware interrupts to notify it of incoming packets. This mode is suitable for low to moderate traffic loads and can help reduce CPU usage during idle periods. It is not recommended if low-latency processing is required. May not be supported by some NICs.
- ``polling``: In polling mode, VPP continuously checks the interface for incoming packets. This mode is ideal for high-throughput scenarios where low latency is critical, as it minimizes the time packets spend waiting to be processed. However, it can lead to higher CPU usage, especially during periods of low traffic, because the polling process is always active.
- ``adaptive``: Adaptive mode combines the benefits of both interrupt and polling modes. VPP starts in interrupt mode and switches to polling mode when the traffic load increases.

.. cfgcmd:: set vpp settings interface-rx-mode <mode>

The choice of rx-mode should be based on the expected traffic patterns and performance requirements of the network environment.

Potential Issues and Troubleshooting
====================================

Improper interface configuration can lead to various issues, including:

- Failure to initialize the interface
- Poor performance due to suboptimal driver selection or driver settings

Indicators of such issues are:

- Failed commits after adding or modifying an interface settings
- Low throughput or high latency on the interface
