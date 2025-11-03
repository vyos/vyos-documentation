:lastproofread: 2025-09-04

.. _vpp_config_dataplane_ipv6:

.. include:: /_include/need_improvement.txt

######################
VPP IPv6 Configuration
######################

VPP allows to configure resources allocated for IPv6 traffic processing independently from IPv4. This allows to ensure that in networks without IPv6 traffic, the resources are not wasted on IPv6. But if IPv6 traffic is present - especially big routing tables - you need to allocate more resources for IPv6 processing to make dataplane stable.

There are two main resources that can be configured for IPv6 traffic processing:

.. cfgcmd:: set vpp settings ipv6 hash-buckets <value>

This parameter configures the number of hash buckets used for IPv6 routing table. If you have a big IPv6 routing table, you may need to increase this value to ensure that the routing table is efficient and lookups are fast.

.. cfgcmd:: set vpp settings ipv6 heap-size <value>

This parameter configures the size of the heap used for IPv6 forwarding table. If you have a big IPv6 routing table, you may need to increase this value to ensure that the routing table can accommodate all routes.

Potential Issues and Troubleshooting
====================================

Improper IPv6 configuration can lead to various issues, including:

- Inefficient, slow routing table lookups and traffic processing due to insufficient hash buckets
- Crashes or instability of the dataplane due to insufficient heap size if there are a lot of IPv6 routes
- Overall instability of the dataplane when handling IPv6 traffic

Consider increasing configuration values if you experience issues with IPv6 traffic processing or if you have a large IPv6 routing table.
