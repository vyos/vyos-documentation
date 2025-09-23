:lastproofread: 2025-09-23

.. _vpp_troubleshooting:

.. include:: /_include/need_improvement.txt

#############################
VPP Dataplane Troubleshooting
#############################

This page provides essential troubleshooting information for VPP dataplane issues. It covers data collection techniques that are useful both for self-assistance and for providing comprehensive information to support teams when seeking help.

When experiencing VPP issues, collecting the right diagnostic information is crucial for effective troubleshooting. The following sections describe the most important data collection methods.

Packet Capture (PCAP)
=====================

Packet capture is one of the most valuable debugging tools for analyzing network traffic and identifying issues with packet processing, routing, or filtering.

VPP's pcap trace functionality captures packets at various points: received (rx), transmitted (tx), and dropped (drop) packets.

Starting Packet Capture
-----------------------

**Command syntax:**

.. opcmd::

   sudo vppctl pcap trace [rx] [tx] [drop] [max <n>] [intfc <interface-name|any>] [file <name>] [max-bytes-per-pkt <n>]

**Key parameters:**

- ``rx`` - Capture received packets
- ``tx`` - Capture transmitted packets  
- ``drop`` - Capture dropped packets
- ``max <n>`` - Depth of local buffer. Once ``n`` packets are received, buffer is flushed to file. Once next ``n`` packets are received the file is overwritten with new data. (default: 100)
- ``intfc <interface-name|any>`` - Specify interface or use ``any`` for all interfaces (default: any)
- ``file <name>`` - Output filename. The PCAP file with this name is stored in ``/tmp/`` directory.
- ``max-bytes-per-pkt <n>`` - Maximum bytes to capture per packet (must be >= 32, <= 9000)

**Examples:**

.. code-block:: none

   # Start capturing tx packets with specific parameters
   sudo vppctl pcap trace tx max 35 intfc eth1 file vpp_eth1.pcap
   
   # Capture all packet types from any interface
   sudo vppctl pcap trace rx tx drop max 1000 intfc any file vpp_capture.pcap max-bytes-per-pkt 128

Monitoring Capture Status
-------------------------

To check the current capture status:

.. opcmd::

   sudo vppctl pcap trace status

This command shows:

- Whether capture is active
- Capture parameters
- Number of packets captured so far
- Output file location

Stopping Packet Capture
-----------------------

.. warning::

    VPP does not automatically stop packet captures. If left running, captures will continue indefinitely, consuming resources. Always remember to stop captures when they are no longer needed.

To stop the active packet capture:

.. opcmd::

   sudo vppctl pcap trace off

Example output when stopping:

.. code-block:: none

   Write 35 packets to /tmp/vpp_eth1.pcap, and stop capture...

**Important notes:**

- PCAP files are stored in ``/tmp/`` directory  
- Files will be overwritten if they already exist
- If no filename is provided, default names are used: ``/tmp/rx.pcap``, ``/tmp/tx.pcap``, ``/tmp/rxandtx.pcap``
- Large captures can consume significant disk space - monitor available space
- Stop captures promptly to avoid filling up storage

Packet Tracing
==============

VPP packet tracing provides detailed information about how packets flow through the VPP processing graph, showing exactly which nodes process each packet and any transformations applied. Packet tracing is essential for understanding VPP's internal packet processing flow.

.. warning::

   Tracing can generate a large amount of data, especially on high-traffic systems. Use it judiciously and limit the number of packets traced to avoid overwhelming the system.

Basic Packet Tracing Commands
-----------------------------

Start tracing
^^^^^^^^^^^^^

To start tracing packets at a specific graph node:

.. opcmd::

   sudo vppctl trace add <input-graph-node> <pkts> [verbose]

- ``<input-graph-node>`` - Name of the graph node to start tracing from (e.g., ``dpdk-input``, ``ethernet-input``, ``ip4-input``)
- ``<pkts>`` - Number of packets to trace (e.g., 100)
- ``[verbose]`` - Optional flag to include detailed buffer information in the trace output

**Common node names for tracing:**

- ``dpdk-input``: Packets received from DPDK interfaces
- ``ethernet-input``: Ethernet frame processing
- ``ip4-input``: IPv4 packet processing
- ``ip6-input``: IPv6 packet processing
- ``ip4-lookup``: IPv4 routing table lookup
- ``ip6-lookup``: IPv6 routing table lookup

View traces
^^^^^^^^^^^

When packets have been traced, view the results with:

.. opcmd::

   sudo vppctl show trace [max COUNT]

- ``[max COUNT]`` - Optional limit on number of packets to display (default: all)

Clear traces
^^^^^^^^^^^^

After reviewing traces, clear them to free up resources:

.. opcmd::

   sudo vppctl clear trace

Example Workflow
^^^^^^^^^^^^^^^^

.. code-block:: none

   # Add traces for 100 packets on dpdk-input node
   sudo vppctl trace add dpdk-input 100
   
   # Send some traffic, then view results
   sudo vppctl show trace
   
   # Clear traces for next test
   sudo vppctl clear trace

Understanding Trace Output
--------------------------

Trace output shows the packet's journey through VPP processing nodes:

.. code-block:: none

    Packet 1

    01:00:09:508438: dpdk-input
      eth2 rx queue 0
      buffer 0x8533: current data 0, length 98, buffer-pool 0, ref-count 1, trace handle 0x1000000
                     ext-hdr-valid 
      PKT MBUF: port 1, nb_segs 1, pkt_len 98
        buf_len 1828, data_len 98, ol_flags 0x0, data_off 128, phys_addr 0x78814d40
        packet_type 0x0 l2_len 0 l3_len 0 outer_l2_len 0 outer_l3_len 0 
        rss 0x0 fdir.hi 0x0 fdir.lo 0x0
      IP4: 0c:87:6c:4e:00:01 -> 0c:de:0d:e2:00:02
      ICMP: 192.168.102.2 -> 192.168.99.3
        tos 0x00, ttl 64, length 84, checksum 0xb88d dscp CS0 ecn NON_ECN
        fragment id 0x37c5, flags DONT_FRAGMENT
      ICMP echo_request checksum 0x64e id 3024
    01:00:09:508449: ethernet-input
      frame: flags 0x1, hw-if-index 2, sw-if-index 2
      IP4: 0c:87:6c:4e:00:01 -> 0c:de:0d:e2:00:02
    01:00:09:508455: ip4-input
      ICMP: 192.168.102.2 -> 192.168.99.3
        tos 0x00, ttl 64, length 84, checksum 0xb88d dscp CS0 ecn NON_ECN
        fragment id 0x37c5, flags DONT_FRAGMENT
      ICMP echo_request checksum 0x64e id 3024
    01:00:09:508458: ip4-sv-reassembly-feature
      [not-fragmented]
    01:00:09:508460: nat-pre-in2out
      in2out next_index 2 arc_next_index 10
    01:00:09:508462: nat44-ed-in2out
      NAT44_IN2OUT_ED_FAST_PATH: sw_if_index 2, next index 10, session 0, translation result 'success' via i2of
      i2of match: saddr 192.168.102.2 sport 3024 daddr 192.168.99.3 dport 3024 proto ICMP fib_idx 0 rewrite: saddr 192.168.99.1 daddr 192.168.99.3 icmp-id 3024 txfib 0 
      o2if match: saddr 192.168.99.3 sport 3024 daddr 192.168.99.1 dport 3024 proto ICMP fib_idx 0 rewrite: saddr 192.168.99.3 daddr 192.168.102.2 icmp-id 3024 txfib 0 
      search key local 192.168.102.2:3024 remote 192.168.99.3:3024 proto ICMP fib 0 thread-index 0 session-index 0
    01:00:09:508469: ip4-lookup
      fib 0 dpo-idx 10 flow hash: 0x00000000
      ICMP: 192.168.99.1 -> 192.168.99.3
        tos 0x00, ttl 64, length 84, checksum 0xbb8e dscp CS0 ecn NON_ECN
        fragment id 0x37c5, flags DONT_FRAGMENT
      ICMP echo_request checksum 0x64e id 3024
    01:00:09:508472: ip4-rewrite
      tx_sw_if_index 1 dpo-idx 10 : ipv4 via 192.168.99.3 eth1: mtu:1500 next:5 flags:[] 0ccea70400010cde0de200010800 flow hash: 0x00000000
      00000000: 0ccea70400010cde0de2000108004500005437c540003f01bc8ec0a86301c0a8
      00000020: 63030800064e0bd00d9a52c2d26800000000f4490000000000001011
    01:00:09:508474: eth1-output
      eth1 flags 0x0038000d
      IP4: 0c:de:0d:e2:00:01 -> 0c:ce:a7:04:00:01
      ICMP: 192.168.99.1 -> 192.168.99.3
        tos 0x00, ttl 63, length 84, checksum 0xbc8e dscp CS0 ecn NON_ECN
        fragment id 0x37c5, flags DONT_FRAGMENT
      ICMP echo_request checksum 0x64e id 3024
    01:00:09:508477: eth1-tx
      eth1 tx queue 0
      buffer 0x8533: current data 0, length 98, buffer-pool 0, ref-count 1, trace handle 0x1000000
                     ext-hdr-valid 
                     natted l2-hdr-offset 0 l3-hdr-offset 14 
      PKT MBUF: port 1, nb_segs 1, pkt_len 98
        buf_len 1828, data_len 98, ol_flags 0x0, data_off 128, phys_addr 0x78814d40
        packet_type 0x0 l2_len 0 l3_len 0 outer_l2_len 0 outer_l3_len 0 
        rss 0x0 fdir.hi 0x0 fdir.lo 0x0
      IP4: 0c:de:0d:e2:00:01 -> 0c:ce:a7:04:00:01
      ICMP: 192.168.99.1 -> 192.168.99.3
        tos 0x00, ttl 63, length 84, checksum 0xbc8e dscp CS0 ecn NON_ECN
        fragment id 0x37c5, flags DONT_FRAGMENT
      ICMP echo_request checksum 0x64e id 3024


In this case, the trace shows:

- The packet was received on ``eth2`` interface (``dpdk-input`` node)
- It was processed by the ``ethernet-input`` and ``ip4-input`` nodes
- NAT translation occurred at the ``nat44-ed-in2out`` node, changing the source IP
- The packet was routed via ``ip4-lookup`` and ``ip4-rewrite`` nodes
- Finally, it was transmitted out of ``eth1`` interface (``eth1-tx`` node)

Additional Diagnostic Information
=================================

When reporting issues to support teams or performing advanced troubleshooting, you may need to collect additional diagnostic information.

Before/After Traffic Analysis
-----------------------------

Before sending traffic:

.. code-block:: none

   sudo vppctl clear hardware-interfaces
   sudo vppctl clear interfaces
   sudo vppctl clear error
   sudo vppctl clear runtime

After sending traffic:

.. code-block:: none

   sudo vppctl show version verbose
   sudo vppctl show hardware-interfaces
   sudo vppctl show interface address
   sudo vppctl show interface
   sudo vppctl show runtime
   sudo vppctl show error

Core System Information
-----------------------

**Memory and buffer information:**

.. code-block:: none

   sudo vppctl show memory api-segment stats-segment numa-heaps main-heap map verbose
   sudo vppctl show buffers
   sudo vppctl show physmem detail
   sudo vppctl show physmem map

**Runtime and performance data:**

.. code-block:: none

   sudo vppctl show cpu
   sudo vppctl show threads
   sudo vppctl show runtime
   sudo vppctl show node counters

Protocol-Specific Information
-----------------------------

**Layer 2 information (if configured):**

.. code-block:: none

   sudo vppctl show l2fib
   sudo vppctl show bridge-domain

**IPv4 information (if configured):**

.. code-block:: none

   sudo vppctl show ip fib
   sudo vppctl show ip neighbors

**IPv6 information (if configured):**

.. code-block:: none

   sudo vppctl show ip6 fib
   sudo vppctl show ip6 neighbors

**MPLS information (if configured):**

.. code-block:: none

   sudo vppctl show mpls fib
   sudo vppctl show mpls tunnel

Creating Support Packages
=========================

When contacting support or reporting issues, use the automated diagnostic collection script to create a comprehensive package. This ensures all relevant VPP troubleshooting information is collected systematically.

VPP Diagnostic Collection Script
--------------------------------

Create the diagnostic collection script:

.. code-block:: python

    #!/usr/bin/env python3
    """VyOS VPP Diagnostic Collection Script"""

    import datetime
    import shutil
    import subprocess
    import tarfile
    from pathlib import Path


    def run_cmd(cmd, output_file, diag_dir):
        """Run command and save output to file."""
        try:
            result = subprocess.run(
                cmd, shell=True, capture_output=True, text=True, timeout=30
            )
            content = f"Command: {cmd}\nExit code: {result.returncode}\nTimestamp: {datetime.datetime.now()}\n{'-' * 50}\n"
            if result.stdout:
                content += f"\nSTDOUT:\n{result.stdout}"
            if result.stderr:
                content += f"\nSTDERR:\n{result.stderr}"
            (diag_dir / output_file).write_text(content)
        except Exception as e:
            (diag_dir / output_file).write_text(f"Command: {cmd}\nERROR: {e}")


    def collect_diagnostics():
        """Collect all VPP diagnostics and create archive."""
        timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        diag_dir = Path.home() / f"vpp-diagnostics-{timestamp}"

        # VPP commands to collect
        commands = [
            ("sudo vppctl show version verbose cmdline", "vpp-version.txt"),
            ("sudo vppctl show hardware-interfaces", "hardware-interfaces.txt"),
            ("sudo vppctl show interface address", "interface-addresses.txt"),
            ("sudo vppctl show interface", "interfaces.txt"),
            ("sudo vppctl show errors", "errors.txt"),
            ("sudo vppctl show runtime", "runtime.txt"),
            (
                "sudo vppctl show memory api-segment stats-segment numa-heaps main-heap map verbose",
                "memory.txt",
            ),
            ("sudo vppctl show buffers", "buffers.txt"),
            ("sudo vppctl show physmem detail", "physmem.txt"),
            ("sudo vppctl show physmem map", "physmem-map.txt"),
            ("sudo vppctl show cpu", "cpu.txt"),
            ("sudo vppctl show threads", "threads.txt"),
            ("sudo vppctl show node counters", "node-counters.txt"),
            ("sudo vppctl show l2fib", "l2fib.txt"),
            ("sudo vppctl show bridge-domain", "bridge-domains.txt"),
            ("sudo vppctl show ip fib", "ip4-fib.txt"),
            ("sudo vppctl show ip neighbors", "ip4-neighbors.txt"),
            ("sudo vppctl show ip6 fib", "ip6-fib.txt"),
            ("sudo vppctl show ip6 neighbors", "ip6-neighbors.txt"),
            ("sudo vppctl show mpls fib", "mpls-fib.txt"),
            ("sudo vppctl show mpls tunnel", "mpls-tunnels.txt"),
            ("sudo vppctl show trace", "packet-traces.txt"),
        ]

        try:
            # Create diagnostics directory
            diag_dir.mkdir(parents=True, exist_ok=True)

            # Collect VPP data
            for cmd, output_file in commands:
                run_cmd(cmd, output_file, diag_dir)

            # Collect PCAP files
            pcap_files = list(Path("/tmp").glob("*.pcap"))
            if pcap_files:
                pcap_dir = diag_dir / "pcap-files"
                pcap_dir.mkdir(exist_ok=True)
                for pcap_file in pcap_files:
                    try:
                        shutil.copy2(pcap_file, pcap_dir)
                    except (PermissionError, OSError):
                        pass

            # Create archive
            archive_name = f"vpp-diagnostics-{timestamp}.tar.gz"
            archive_path = Path.home() / archive_name

            with tarfile.open(archive_path, "w:gz") as tar:
                tar.add(diag_dir, arcname=diag_dir.name)

            # Cleanup
            shutil.rmtree(diag_dir)

            print(f"VPP diagnostics collected: {archive_path}")
            return archive_path

        except Exception as e:
            if diag_dir.exists():
                shutil.rmtree(diag_dir)
            print(f"Collection failed: {e}")
            return None


    def main():
        """Main function."""
        collect_diagnostics()


    if __name__ == "__main__":
        main()

Save this script as ``/config/scripts/vpp-collect-diagnostics``

Installation and Usage
----------------------

**1. Make the script executable**

.. opcmd::

   sudo chmod +x /config/scripts/vpp-collect-diagnostics

**2. Run VPP diagnostic collection**

The script will automatically collect all VPP diagnostics and store it in your home directory.

.. opcmd::

    /config/scripts/vpp-collect-diagnostics

**3. Generate VyOS tech-support archive separately**

Additionally, you can generate a VyOS tech-support archive that includes system-wide diagnostics:

.. opcmd::

    generate tech-support archive

What the Script Collects
------------------------

- **System Information**: Version details, build information, command line parameters
- **Interface Data**: Hardware interfaces, interface addresses, interface statistics and configurations
- **Performance Metrics**: Runtime statistics, error counters, node counters, CPU and thread information
- **Memory Analysis**: Memory usage (API segment, stats segment, NUMA heaps, main heap), buffer information, physical memory details
- **Layer 2 Data**: L2 forwarding table (L2FIB), bridge domain configurations
- **IPv4 Information**: IPv4 forwarding table (FIB), IPv4 neighbor table
- **IPv6 Information**: IPv6 forwarding table (FIB), IPv6 neighbor table
- **MPLS Data**: MPLS forwarding table (FIB), MPLS tunnel information
- **Packet Traces**: Captured packet traces VPP (if available)
- **Packet Dumps**: PCAP files from ``/tmp`` directory (if available)
