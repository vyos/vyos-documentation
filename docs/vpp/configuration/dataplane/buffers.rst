:lastproofread: 2025-09-04

.. _vpp_config_dataplane_buffers:

.. include:: /_include/need_improvement.txt

###################################
VPP Dataplane Buffers Configuration
###################################

Buffers are essential for handling network packets efficiently, and proper configuration can enhance performance, reliability and is mandatory for VPP work.

Buffers are used to temporarily store packets during processing, therefore their configuration should be in sync with NIC configuration, CPU threads, and overall system resources.

.. important::

   VPP buffers are allocated from the physical memory pool (physmem). The total amount of memory available for buffer allocation is controlled by the ``physmem max-size`` setting, while the buffer configuration parameters below control how that memory is used for buffer allocation.

   See :ref:`VPP Physical Memory Configuration <vpp_config_dataplane_physmem>` for details on configuring physmem.

Buffer Configuration Parameters
===============================

The following parameters can be configured for VPP buffers:

buffers-per-numa
----------------

Number of buffers allocated per NUMA node. This setting helps in optimizing memory access patterns for multi-CPU systems.

Usually it needs to be tuned if:

- there are a lot of interfaces in the system
- there are a lot of queues in NICs
- there are big descriptors size configured for NICs

The value should be set responsibly, overprovisioning can lead to issues with NICs configured with XDP driver.

.. cfgcmd:: set vpp settings buffers buffers-per-numa <value>

The common approach for the calculation is to use the formula:

.. code-block:: none

    buffers-per-numa = (num-rx-queues * num-rx-desc) + (num-tx-queues * num-tx-desc)

This should be done for each NIC, and then sum the results for all NICs in the system needs to be multiplied by 2.5 and the result will be the minimum value for `buffers-per-numa`.

Try to avoid setting this value too low to avoid packet drops.

data-size
---------

This value sets how much payload data can be stored in a single buffer allocated by VPP.
Making it larger can reduce buffer chains for big packets, while a smaller value can save memory for environments handling mostly small packets.

.. cfgcmd:: set vpp settings buffers data-size <value>

Optimal size depends on the typical packet size in your network. If you are not sure, use the value of biggest MTU in your network plus some overhead (e.g., 128 bytes).

page-size
---------

A memory pages type used for buffer allocation. Common values are 4K, 2M, or 1G.

Use pages that are configured in system settings.

.. cfgcmd:: set vpp settings buffers page-size <value>

Potential Issues and Troubleshooting
====================================

Improper buffer configuration can lead to various issues, including:

- Increased latency and packet loss
- Inefficient CPU utilization
- Interfaces initialization failures

Indicators of such issues are:

- Errors during interfaces initialization in VPP logs
- Packet drops observed in VPP statistics

To troubleshoot buffer-related issues, consider the following steps:

- Review VPP logs for any errors related to buffer allocation (often the message may contains error `-5`).
- Tune available buffers by adjusting the `buffers-per-numa` and `data-size` parameters.
