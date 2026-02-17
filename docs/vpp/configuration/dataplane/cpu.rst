:lastproofread: 2025-09-05

.. _vpp_config_dataplane_cpu:

.. include:: /_include/need_improvement.txt

###############################
VPP Dataplane CPU Configuration
###############################

VPP can utilize multiple CPU cores to enhance packet processing performance. Proper CPU configuration is crucial for achieving optimal throughput and low latency.

CPU assignment for VPP handled automatically. You only specify how many CPU cores VPP may use, and the system distributes them between the main thread and worker threads.

.. important::

   Please read carefully the system configuration settings page before making any changes to CPU settings: :doc:`system`.

If CPU settings are not configured, VPP uses a single CPU core for its main thread and does not create worker threads.

CPU Configuration Parameters
============================

``cpu-cores``
^^^^^^^^^^^^^

This parameter defines the total number of CPU cores allocated to VPP.

.. cfgcmd:: set vpp settings resource-allocation cpu-cores <core-number>

The system automatically assigns cores using the following rules:

   * The first two CPU cores are always reserved for the operating system and other services.

   * The main VPP thread is assigned to the first available core after the reserved ones.

   * The remaining allocated cores are used for worker threads.

For example:

   * If cpu-cores is set to 1, VPP runs only a main thread.

   * If cpu-cores is set to 4, VPP uses:

       * 1 core for the main thread

       * 3 cores for worker threads

Choose a value based on available hardware resources and expected traffic load. Allocating too few cores may limit performance, while allocating too many can negatively impact other system services.

Potential Issues and Troubleshooting
====================================

Improper CPU configuration can lead to various issues, including:

- Underperformance for both VPP (not enough cores were assigned) and kernel (too many cores were assigned to VPP)
- Resource conflicts with other processes and services

Indicators of such issues are:

- VPP or kernel forwarding performance is lower than expected
- Slower work of system components or services, including DNS, DHCP, dynamic routing, etc.
