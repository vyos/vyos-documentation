:lastproofread: 2025-09-04

.. _vpp_config_dataplane_lcp:

.. include:: /_include/need_improvement.txt

#####################
VPP LCP Configuration
#####################

Linux Control Plane (LCP) is one of core components of VPP that allows to offload various control plane functions to the Linux kernel. LCP provides seamless integration with other components of VyOS, allowing usage of other system components, like DHCP client, routing daemons, etc. together with VPP dataplane.

VPP integration in VyOS relies heavily on LCP, building the relationship where almost all control plane functions are handled by other daemons and services and VPP is used exclusively for high-performance packet forwarding. This also reduces VPP management processing load, improving overall performance and stability of the dataplane.

VyOS contains unique integration between kernel and VPP routing tables. By default, all the routes, even if they are not directly connected to VPP interfaces, are imported from kernel routing table to VPP routing table, pointing to the kernel. This allows to forward traffic to any destination known to the kernel, even if VPP itself does not have a route to that destination.

However, in some scenarios, this behavior may not be desired. For example, if you have a large number of routes in the kernel routing table that are not directly connected to VPP interfaces, and you do not need forwarding between such destinations and destinations reachable via VPP, you can disable this behavior. This can be done using the following command:

.. _vpp_config_dataplane_lcp_ignore-kernel-routes:

.. cfgcmd:: set vpp settings resource-allocation ignore-kernel-routes

Pay attention that disabling this option leads to loss of connectivity to destinations if there are no direct routes in VPP routing table.

Potential Issues and Troubleshooting
====================================

Disabling kernel route import can result in:

- Loss of connectivity to certain destinations if kernel routes are ignored
- Incomplete route synchronization between the kernel and VPP
