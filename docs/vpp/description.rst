:lastproofread: 2025-09-04

.. _vpp_description:

.. include:: /_include/need_improvement.txt

#########################
VPP Dataplane Description
#########################

What is VPP in VyOS?
====================

VyOS supports two packet forwarding dataplanes: the traditional Linux kernel dataplane and the optional Vector Packet Processor (VPP) dataplane. VPP is a high-performance userspace packet processing engine that can significantly improve throughput for demanding network workloads.

Key Benefits
============

**Performance Improvement**

VPP processes packets in a special way, using vectors, rather than one-by-one, delivering:

- **Much higher throughput** compared to kernel forwarding
- **Lower and more consistent latency** for time-sensitive applications
- **Linear scaling** with additional CPU cores

**VyOS Hybrid Integration**

VyOS provides unique flexibility by supporting both dataplanes simultaneously:

- **Cross-dataplane forwarding**: Traffic can flow between VPP and kernel interfaces seamlessly
- **Transparent configuration**: Same CLI commands and most services work regardless of dataplane
- **Gradual migration**: Enable VPP on high-traffic interfaces while keeping others on kernel

When to Use VPP
===============

**Consider VPP if you have:**

- High-throughput requirements
- Latency-sensitive applications requiring consistent performance

**Stay with kernel dataplane if you have:**

- Low to moderate traffic volumes
- No latency-sensitive workloads
- Applications requiring specific features not supported by VPP Dataplane

Packets Processing Integration Details
======================================

VPP Dataplane integration is done in the way that minimizes configuration changes. Features that exist in kernel dataplane are not removed but continue to operate in kernel dataplane. VPP Dataplane only takes over packet forwarding for interfaces explicitly assigned to it.

Examples of traffic flow between interfaces connected to VPP and kernel dataplanes:

.. image:: /_static/images/vpp/vyos_vpp_integration.svg
   :align: center

Green path
""""""""""

Traffic between two VPP interfaces is processed entirely within VPP for maximum performance. Packets that follow this path can use only features available inside VPP dataplane.

Blue path
"""""""""

Traffic between a VPP interface and a kernel interface is processed by both dataplanes, with VPP handling the VPP side and the kernel handling the kernel side. Packets that follow this path can use features available in both VPP and kernel dataplanes, at the same time.

**Note:** Because packets must follow both dataplanes, performance will be slower than with pure VPP or pure kernel forwarding.

Red path
""""""""

Traffic between two kernel interfaces is processed entirely within the kernel dataplane. Packets that follow this path can use only features available inside kernel dataplane, and lack VPP acceleration.

This is the traditional VyOS dataplane operation.


CLI Integration
===============

VyOS CLI commands are designed to work seamlessly with both dataplanes. When configuring interfaces, routing, and other features, the same commands can be used regardless of the underlying dataplane.
