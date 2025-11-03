:lastproofread: 2025-09-04

.. _vpp_config_dataplane_lcp:

.. include:: /_include/need_improvement.txt

#####################
VPP LCP Configuration
#####################

Linux Control Plane (LCP) is one of core components of VPP that allows to offload various control plane functions to the Linux kernel. LCP provides seamless integration with other components of VyOS, allowing usage of other system components, like DHCP client, routing daemons, etc. together with VPP dataplane.

VPP integration in VyOS relies heavily on LCP, building the relationship where almost all control plane functions are handled by other daemons and services and VPP is used exclusively for high-performance packet forwarding. This also reduces VPP management processing load, improving overall performance and stability of the dataplane.

LCP can be configured using the following command:

VyOS contains unique integration between kernel and VPP routing tables. By default, all the routes, even if they are not directly connected to VPP interfaces, are imported from kernel routing table to VPP routing table, pointing to the kernel. This allows to forward traffic to any destination known to the kernel, even if VPP itself does not have a route to that destination.

However, in some scenarios, this behavior may not be desired. For example, if you have a large number of routes in the kernel routing table that are not directly connected to VPP interfaces, and you do not need forwarding between such destinations and destinations reachable via VPP, you can disable this behavior. This can be done using the following command:

.. _vpp_config_dataplane_lcp_ignore-kernel-routes:

.. cfgcmd:: set vpp settings lcp ignore-kernel-routes

Pay attention that disabling this option leads to loss of connectivity to destinations if there are no direct routes in VPP routing table.

Other configuration section crucial for integration between VPP and Kernel is netlink settings. It allows to configure how VPP management listen to netlink events and how it processes them.

.. cfgcmd:: set vpp settings lcp netlink batch-delay-ms <value>

This parameter specifies the delay in milliseconds between processing batch netlink messages. If you expect to get frequent and intensive netlink events, you may need to decrease this value to ensure that VPP processes netlink events in a timely manner.

.. cfgcmd:: set vpp settings lcp netlink batch-size <value>

This parameter specifies the maximum number of netlink messages to process in a single batch. If you have a high volume of netlink events, increasing this value can improve throughput by allowing more messages to be processed at once. However, setting it too high may increase latency for individual messages.

.. cfgcmd:: set vpp settings lcp netlink rx-buffer-size <value>

This parameter specifies the size of the receive buffer for netlink messages. Increasing this value can help accommodate bursts of netlink messages, but setting it too high may lead to increased memory usage.

Potential Issues and Troubleshooting
====================================

Improper LCP configuration can lead to various issues, including:

- Loss of connectivity to certain destinations if kernel routes are ignored
- Delays in synchronization between kernel and VPP routing tables
- Desynchronization between kernel and VPP routing tables if netlink settings are not optimal

Consider adjusting LCP settings if you experience issues with routing or connectivity, especially in scenarios involving dynamic route changes or a large number of routes.
