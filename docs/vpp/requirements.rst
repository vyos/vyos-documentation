:lastproofread: 2026-02-16

.. _vpp_requirements:

.. include:: /_include/need_improvement.txt

##########################
VPP Dataplane Requirements
##########################

VPP Dataplane requires specific hardware. Ensure your system meets these
prerequisites before enabling VPP:

* **Deployment Platform**

  VPP Dataplane is available on both bare-metal, on-premise virtualized, and
  cloud deployment platforms.

* **CPU Requirements**

  Regardless of the platform, VPP Dataplane requires a CPU with:

  - SSE4.2 support (available on most modern Intel and AMD CPUs).
  - At least 4 physical CPU cores for a minimum configuration (more cores
    recommended for higher throughput).

  .. important:: **Physical Cores vs Logical Cores**

     VPP Dataplane requires 4 *physical* CPU cores, not logical cores.
     Systems with Simultaneous Multithreading (SMT) or Hyper-Threading (HT)
     present each physical core as 2 logical cores.

     Cloud providers often display logical cores as "cores" or "vCPUs".
     For example, a cloud instance showing "4 cores" may have only 2 physical
     cores with SMT/HT enabled. Always verify the actual physical core count
     in your cloud provider's documentation.

  For virtualized environments, ensure CPU features are passed through to the
  VM and that sufficient physical cores are allocated.

* **Memory Requirements**

  Memory significantly affects VPP stability. Insufficient RAM can cause
  initialization failures or prevent the dataplane from starting.

  - Minimum: 8 GB RAM. VyOS will not start the VPP Dataplane if less than 8 GB
    is available.
  - Recommended: 16 GB or more (especially for high throughput, many interfaces,
    or large routing tables).

* **Network Interface Cards (NICs)**

  .. warning:: 

     VyOS supports only specific NICs for VPP Dataplane. Unsupported NICs may
     cause activation failures, initialization errors, crashes, or
     degraded performance.

  Supported NICs:

  - Intel® Ethernet Network Adapter E810-2CQDA2
  - NVIDIA/Mellanox ConnectX-5
  - VirtIO

  Other NICs may work but are not officially supported.
