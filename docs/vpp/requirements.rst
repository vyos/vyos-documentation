:lastproofread: 2025-09-04

.. _vpp_requirements:

.. include:: /_include/need_improvement.txt

##########################
VPP Dataplane Requirements
##########################

VPP Dataplane usage in VyOS has very strict hardware requirements. Please ensure your system meets the following prerequisites before enabling VPP:

* **Deployment Platform**

  VPP Dataplane is available on both bare-metal, on-premise virtualized, and cloud deployment platforms.

* **CPU Requirements**

  Regardless of the platform, VPP Dataplane requires a CPU with the following features:

  - SSE4.2 support (most modern Intel and AMD CPUs)
  - At least 4 **physical** CPU cores for the minimum configuration. More cores are recommended for higher throughput.

  .. important:: **Physical Cores vs Logical Cores**

     VPP Dataplane requires 4 **physical** CPU cores, not logical cores. Many systems use Simultaneous Multithreading (SMT) or Hyper-Threading (HT), which presents each physical core as 2 logical cores.

     **Cloud Provider Considerations:**

     Some cloud providers display logical cores in their UI as "cores" or "vCPUs", which can be misleading. For example:

     - A cloud instance showing "4 cores" may actually have only 2 physical cores with SMT/HT enabled
     - Always verify the actual physical core count, not the logical core count
     - Check your cloud provider's documentation to understand their core counting methodology

  **Note:** If you are using VyOS in a virtualized environment, ensure that CPU features are properly passed through to the VM and that you have allocated sufficient physical cores.

* **Memory Requirements**

  Memory is one of the biggest factors affecting VPP stability, therefore it is critical to ensure that your system has sufficient RAM.

  - Minimum: 8 GB RAM
  - Recommended: 16 GB or more, if you have high throughput requirements, many interfaces, or big routing tables.

  VyOS contains safeguards that prevent VPP from starting if there is insufficient memory for the initial configuration, but it does not protect from memory exhaustion during operation.

* **Network Interface Cards (NICs)**

  .. warning:: VyOS allows using VPP Dataplane only with NICs that are known to be compatible. Using unsupported NICs may lead to inability to activate the dataplane, initialize a NIC, crashes during operations, and degraded performance.

  Validated NICs include:

  - Intel® Ethernet Network Adapter E810-2CQDA2
  - NVIDIA/Mellanox ConnectX-5
  - VirtIO

  Other NICs may work, but are not officially supported.
