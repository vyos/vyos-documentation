:lastproofread: 2025-09-05

.. _vpp_config_dataplane_cpu:

.. include:: /_include/need_improvement.txt

###############################
VPP Dataplane CPU Configuration
###############################

VPP can utilize multiple CPU cores to enhance packet processing performance. Proper CPU configuration is crucial for achieving optimal throughput and low latency.

There are several parameters that can be configured to optimize CPU usage for VPP.

.. important::

   Please read carefully the system configuration settings page before making any changes to CPU settings: :doc:`system`.

If CPU settings are not configured, VPP will start a single main thread on core 1 (``main-core``), without any additional worker threads.

CPU Configuration Parameters
============================

Mandatory settings
------------------

``main-core``
^^^^^^^^^^^^^

The main core is responsible for handling control plane operations, managing worker threads, and processing packets. It should be set to a core that is not heavily utilized by other processes. The option should be always set if you apply any other CPU settings.

.. cfgcmd:: set vpp settings cpu main-core <core-number>

Manual cores selection
----------------------

``corelist-workers``
^^^^^^^^^^^^^^^^^^^^

This parameter specifies the list of CPU cores that will be used as worker threads for packet processing.

.. cfgcmd:: set vpp settings cpu corelist-workers <core-list>

The core list can be specified in various formats, such as a comma-separated list (e.g., 2,3,4) or a range (e.g., 2-4). It is advisable to select cores that are on the same NUMA node as the network interfaces to minimize latency.

Automatic cores selection
-------------------------

There is a possibility to let VPP select CPU cores automatically. This can be done by configuring the following two parameters:

``skip-cores``
^^^^^^^^^^^^^^

This parameter allows you to specify number of first CPU cores that should be excluded from being used for main or worker threads. The main thread will be assigned to the first available core after the skipped ones, and worker threads will be assigned to subsequent cores.

.. cfgcmd:: set vpp settings cpu skip-cores <cores>

Exclude cores that are reserved for other critical system processes to ensure that VPP does not interfere with their operation.

``workers``
^^^^^^^^^^^

This parameter allows you to specify the number of worker threads that should be created. Each worker thread will be assigned to a separate CPU core after the skipped and main ones.

.. cfgcmd:: set vpp settings cpu workers <number>

The number of worker threads should be chosen based on the available CPU resources and the expected network load. A common approach is to set the number of workers to the number of available CPU cores minus the skipped and main cores.

Potential Issues and Troubleshooting
====================================

Improper CPU configuration can lead to various issues, including:

- Underperformance for both VPP (not enough cores were assigned) and kernel (too many cores were assigned to VPP)
- Resource conflicts with other processes and services

Indicators of such issues are:

- VPP or kernel forwarding performance is lower than expected
- Slower work of system components or services, including DNS, DHCP, dynamic routing, etc.
