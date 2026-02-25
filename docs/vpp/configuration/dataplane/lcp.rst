:lastproofread: 2026-02-26

.. _vpp_config_dataplane_lcp:

.. include:: /_include/need_improvement.txt

#####################
VPP LCP Configuration
#####################

Linux Control Plane (LCP) is a core component of VPP that lets you
offload various control plane functions to the Linux kernel. LCP provides
seamless integration with other VyOS components, letting you use system
components like DHCP clients and routing daemons together with the VPP
dataplane.

VPP integration in VyOS relies heavily on LCP. Almost all control plane
functions are handled by other daemons and services, while VPP handles
high-performance packet forwarding exclusively. This approach also reduces
VPP management processing load, improving overall dataplane performance and
stability.

VyOS integrates the kernel and VPP routing tables uniquely. By default,
all routes, even those not directly connected to VPP interfaces, are
imported from the kernel routing table to the VPP routing table, pointing
to the kernel. This lets you forward traffic to any destination known to
the kernel, even if VPP doesn't have a route to that destination.

However, in some scenarios this behavior may not be desired. For example,
if you have many routes in the kernel routing table not directly connected
to VPP interfaces, and you don't need forwarding between those
destinations and destinations reachable via VPP, you can disable this
behavior using the following command:

.. _vpp_config_dataplane_lcp_ignore-kernel-routes:

.. cfgcmd:: set vpp settings lcp ignore-kernel-routes

Note that disabling this option results in loss of connectivity
to destinations without direct routes in the VPP routing table.

Another crucial configuration section for VPP and kernel integration is
netlink settings. This lets you configure how VPP management listens to
netlink events and processes them.

.. cfgcmd:: set vpp settings lcp netlink batch-delay-ms <value>

This parameter specifies the delay in milliseconds between processing
batches of netlink messages. If you expect frequent and intensive netlink
events, you may need to decrease this value to ensure VPP processes
netlink events promptly.

.. cfgcmd:: set vpp settings lcp netlink batch-size <value>

This parameter specifies the maximum number of netlink messages to process
in a single batch. If you have high netlink event volume, increasing this
value can improve throughput by processing more messages at once. However,
setting it too high may increase latency for individual messages.

.. cfgcmd:: set vpp settings lcp netlink rx-buffer-size <value>

This parameter specifies the receive buffer size for netlink messages.
Increasing this value helps accommodate netlink message bursts, but
setting it too high may increase memory usage.

Potential Issues and Troubleshooting
====================================

Improper LCP configuration can lead to various issues, including:

- Loss of connectivity to certain destinations if kernel routes are
  ignored
- Delays in synchronization between kernel and VPP routing tables
- Desynchronization between kernel and VPP routing tables if netlink
  settings are not optimal

Consider adjusting LCP settings if you experience routing or connectivity
issues, especially in scenarios with dynamic route changes or many routes.
