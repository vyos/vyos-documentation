:lastproofread: 2025-09-04

.. _vpp_config_dataplane_interface:

.. include:: /_include/need_improvement.txt

######################################
VPP Dataplane Interfaces Configuration
######################################

Only Ethernet interfaces (physical or virtual) can be connected to the VPP dataplane. Interfaces configured here act as a bridge between VPP and the outside world, allowing VPP to send and receive packets into the network.


Interface Configuration Parameters
==================================

driver
------

The driver parameter specifies the type of driver used for the network interface. VPP supports two types of drivers that can be used for this: DPDK and XDP. The choice of driver depends on the specific use case, hardware capabilities, and performance requirements. Some NICs may support only one of these drivers.

.. cfgcmd:: set vpp settings interface <interface-name> driver <driver-type>

The DPDK driver is generally preferred for high-performance scenarios, while the XDP driver may be suitable for NICs that do not support DPDK.

.. _vpp_config_dataplane_interface_rx_mode:

rx-mode
-------

The rx-mode parameter defines how VPP handles incoming packets on the interface. There are several modes available, each with its own advantages and use cases:

- ``interrupt``: In this mode, VPP relies on hardware interrupts to notify it of incoming packets. This mode is suitable for low to moderate traffic loads and can help reduce CPU usage during idle periods. It is not recommended if low-latency processing is required. May not be supported by some NICs.
- ``polling``: In polling mode, VPP continuously checks the interface for incoming packets. This mode is ideal for high-throughput scenarios where low latency is critical, as it minimizes the time packets spend waiting to be processed. However, it can lead to higher CPU usage, especially during periods of low traffic, because the polling process is always active.
- ``adaptive``: Adaptive mode combines the benefits of both interrupt and polling modes. VPP starts in interrupt mode and switches to polling mode when the traffic load increases.

.. cfgcmd:: set vpp settings interface <interface-name> rx-mode <mode>

The choice of rx-mode should be based on the expected traffic patterns and performance requirements of the network environment.

dpdk-options
------------

The dpdk-options section allows for the configuration of various DPDK-specific settings for the interface.

.. cfgcmd:: set vpp settings interface <interface-name> dpdk-options <option> <value>

DPDK options you can configure are:

- ``num-rx-queues``: Specifies the number of receive queues for the interface. More queues can improve performance on multi-core systems by allowing parallel processing of incoming packets. Each queue will be assigned to a separate CPU core.
- ``num-tx-queues``: Specifies the number of transmit queues for the interface. Similar to receive queues, more transmit queues can enhance performance by enabling parallel processing of outgoing packets. By default, the VPP Dataplane has one TX queue per enabled CPU worker, or a single queue if no workers are configured.

.. seealso:: :doc:`cpu`

- ``num-rx-desc``: Defines the size of each receive queue. Larger queue sizes can help accommodate bursts of incoming traffic, reducing the likelihood of packet drops during high traffic periods.
- ``num-tx-desc``: Defines the size of each transmit queue. Larger sizes can help manage bursts of outgoing traffic more effectively.
- ``promisc``: Enables or disables promiscuous mode on the interface. When promiscuous mode is enabled, the interface will receive all packets on the network, regardless of type and destination of the packets. Some NICs need this feature to be enabled to avoid filtering out packets (for example to pass VLAN tagged packets).

xdp-options
-----------

The xdp-options section allows for the configuration of various XDP-specific settings for the interface.

.. cfgcmd:: set vpp settings interface <interface-name> xdp-options <option> <value>

XDP options you can configure are:

- ``no-syscall-lock``: Disables the syscall lock for the XDP interface. This can improve performance by allowing multiple threads to access the interface concurrently.
- ``num-rx-queues``: Specifies the number of receive queues for the XDP interface. More queues can improve performance on multi-core systems by allowing parallel processing of incoming packets. Each queue will be assigned to a separate CPU core.
- ``promisc``: Enables or disables promiscuous mode on the interface. When promiscuous mode is enabled, the interface will receive all packets on the network, regardless of type and destination of the packets. Some NICs need this feature to be enabled to avoid filtering out packets (for example to pass VLAN tagged packets).
- ``rx-queue-size``: Defines the size of each receive queue. Larger queue sizes can help accommodate bursts of incoming traffic, reducing the likelihood of packet drops during high traffic periods.
- ``tx-queue-size``: Defines the size of each transmit queue. Larger sizes can help manage bursts of outgoing traffic more effectively.
- ``zero-copy``: Enables zero-copy mode for the XDP interface. This mode allows packets to be processed without copying them between kernel and user space, reducing latency and CPU usage.

Potential Issues and Troubleshooting
====================================

Improper interface configuration can lead to various issues, including:

- Failure to initialize the interface
- Poor performance due to suboptimal driver selection or driver settings

Indicators of such issues are:

- Failed commits after adding or modifying an interface settings
- Low throughput or high latency on the interface
