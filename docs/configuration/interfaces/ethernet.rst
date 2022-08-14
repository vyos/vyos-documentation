:lastproofread: 2021-06-30

.. _ethernet-interface:

########
Ethernet
########

This will be the most widely used interface on a router carrying traffic to the
real world.

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-common-with-dhcp.txt
   :var0: ethernet
   :var1: eth0

Ethernet options
================

.. cfgcmd:: set interfaces ethernet <interface> duplex <auto | full | half>

   Configure physical interface duplex setting.

   * auto - interface duplex setting is auto-negotiated
   * full - always use full-duplex
   * half - always use half-duplex

   VyOS default will be `auto`.

.. cfgcmd:: set interfaces ethernet <interface> speed <auto | 10 | 100 | 1000 |
  2500 | 5000 | 10000 | 25000 | 40000 | 50000 | 100000>

   Configure physical interface speed setting.

   * auto - interface speed is auto-negotiated
   * 10 - 10 MBit/s
   * 100 - 100 MBit/s
   * 1000 - 1 GBit/s
   * 2500 - 2.5 GBit/s
   * 5000 - 5 GBit/s
   * 10000 - 10 GBit/s
   * 25000 - 25 GBit/s
   * 40000 - 40 GBit/s
   * 50000 - 50 GBit/s
   * 100000 - 100 GBit/s

   VyOS default will be `auto`.


.. cfgcmd:: set interfaces ethernet <interface> mirror <interface>

  Use this command to mirror the inbound traffic from one Ethernet interface to
  another interface. This feature is typically used to provide a copy of traffic
  inbound on one interface to a system running a monitoring or IPS application
  on another interface. The benefit of mirroring the traffic is that the
  application is isolated from the source traffic and so application processing
  does not affect the traffic or the system performance.

  Example:

  .. code-block:: none

    set interfaces ethernet eth0 mirror eth1

Offloading
----------

.. cfgcmd:: set interfaces ethernet <interface> offload <gro | gso | lro | rps |
  sg | tso>

  Enable different types of hardware offloading on the given NIC.

  :abbr:`GSO (Generic Segmentation Offload)` is a pure software offload that is
  meant to deal with cases where device drivers cannot perform the offloads
  described above. What occurs in GSO is that a given skbuff will have its data
  broken out over multiple skbuffs that have been resized to match the MSS
  provided via skb_shinfo()->gso_size.

  Before enabling any hardware segmentation offload a corresponding software
  offload is required in GSO. Otherwise it becomes possible for a frame to be
  re-routed between devices and end up being unable to be transmitted.

  :abbr:`GRO (Generic receive offload)` is the complement to GSO. Ideally any
  frame assembled by GRO should be segmented to create an identical sequence of
  frames using GSO, and any sequence of frames segmented by GSO should be able
  to be reassembled back to the original by GRO. The only exception to this is
  IPv4 ID in the case that the DF bit is set for a given IP header. If the
  value of the IPv4 ID is not sequentially incrementing it will be altered so
  that it is when a frame assembled via GRO is segmented via GSO.

  :abbr:`RPS (Receive Packet Steering)` is logically a software implementation
  of :abbr:`RSS (Receive Side Scaling)`. Being in software, it is necessarily
  called later in the datapath. Whereas RSS selects the queue and hence CPU that
  will run the hardware interrupt handler, RPS selects the CPU to perform
  protocol processing above the interrupt handler. This is accomplished by
  placing the packet on the desired CPU's backlog queue and waking up the CPU
  for processing. RPS has some advantages over RSS:

  - it can be used with any NIC,
  - software filters can easily be added to hash over new protocols,
  - it does not increase hardware device interrupt rate (although it does
    introduce inter-processor interrupts (IPIs)).


.. cmdinclude:: /_include/interface-xdp.txt
   :var0: ethernet
   :var1: eth0

Authentication (EAPoL)
----------------------

.. cmdinclude:: /_include/interface-eapol.txt
   :var0: ethernet
   :var1: eth0


VLAN
====

Regular VLANs (802.1q)
----------------------

.. cmdinclude:: /_include/interface-vlan-8021q.txt
   :var0: ethernet
   :var1: eth0

QinQ (802.1ad)
--------------

.. cmdinclude:: /_include/interface-vlan-8021ad.txt
   :var0: ethernet
   :var1: eth0

Port Mirror (SPAN)
==================
.. cmdinclude:: ../../_include/interface-mirror.txt
   :var0: ethernet
   :var1: eth1
   :var2: eth3

*********
Operation
*********

.. opcmd:: show interfaces ethernet

   Show brief interface information.

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet
     Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
     Interface        IP Address                        S/L  Description
     ---------        ----------                        ---  -----------
     eth0             172.18.201.10/24                  u/u  LAN
     eth1             172.18.202.11/24                  u/u  WAN
     eth2             -                                 u/D

.. opcmd:: show interfaces ethernet <interface>

   Show detailed information on given `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth0
     eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
         link/ether 00:50:44:00:f5:c9 brd ff:ff:ff:ff:ff:ff
         inet6 fe80::250:44ff:fe00:f5c9/64 scope link
            valid_lft forever preferred_lft forever

         RX:  bytes    packets     errors    dropped    overrun      mcast
           56735451     179841          0          0          0     142380
         TX:  bytes    packets     errors    dropped    carrier collisions
            5601460      62595          0          0          0          0

.. stop_vyoslinter

.. opcmd:: show interfaces ethernet <interface> physical

   Show information about physical `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth0 physical
     Settings for eth0:
             Supported ports: [ TP ]
             Supported link modes:   1000baseT/Full
                                     10000baseT/Full
             Supported pause frame use: No
             Supports auto-negotiation: No
             Supported FEC modes: Not reported
             Advertised link modes:  Not reported
             Advertised pause frame use: No
             Advertised auto-negotiation: No
             Advertised FEC modes: Not reported
             Speed: 10000Mb/s
             Duplex: Full
             Port: Twisted Pair
             PHYAD: 0
             Transceiver: internal
             Auto-negotiation: off
             MDI-X: Unknown
             Supports Wake-on: uag
             Wake-on: d
             Link detected: yes
     driver: vmxnet3
     version: 1.4.16.0-k-NAPI
     firmware-version:
     expansion-rom-version:
     bus-info: 0000:0b:00.0
     supports-statistics: yes
     supports-test: no
     supports-eeprom-access: no
     supports-register-dump: yes
     supports-priv-flags: no

.. start_vyoslinter

.. opcmd:: show interfaces ethernet <interface> physical offload

   Show available offloading functions on given `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth0 physical offload
     rx-checksumming               on
     tx-checksumming               on
     tx-checksum-ip-generic        on
     scatter-gather                off
     tx-scatter-gather             off
     tcp-segmentation-offload      off
     tx-tcp-segmentation           off
     tx-tcp-mangleid-segmentation  off
     tx-tcp6-segmentation          off
     udp-fragmentation-offload     off
     generic-segmentation-offload  off
     generic-receive-offload       off
     large-receive-offload         off
     rx-vlan-offload               on
     tx-vlan-offload               on
     ntuple-filters                off
     receive-hashing               on
     tx-gre-segmentation           on
     tx-gre-csum-segmentation      on
     tx-udp_tnl-segmentation       on
     tx-udp_tnl-csum-segmentation  on
     tx-gso-partial                on
     tx-nocache-copy               off
     rx-all                        off

.. opcmd:: show interfaces ethernet <interface> transceiver

   Show transceiver information from plugin modules, e.g SFP+, QSFP

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth5 transceiver
        Identifier              : 0x03 (SFP)
        Extended identifier     : 0x04 (GBIC/SFP defined by 2-wire interface ID)
        Connector               : 0x07 (LC)
        Transceiver codes       : 0x00 0x00 0x00 0x01 0x00 0x00 0x00 0x00 0x00
        Transceiver type        : Ethernet: 1000BASE-SX
        Encoding                : 0x01 (8B/10B)
        BR, Nominal             : 1300MBd
        Rate identifier         : 0x00 (unspecified)
        Length (SMF,km)         : 0km
        Length (SMF)            : 0m
        Length (50um)           : 550m
        Length (62.5um)         : 270m
        Length (Copper)         : 0m
        Length (OM3)            : 0m
        Laser wavelength        : 850nm
        Vendor name             : CISCO-FINISAR
        Vendor OUI              : 00:90:65
        Vendor PN               : FTRJ-8519-7D-CS4
        Vendor rev              : A
        Option values           : 0x00 0x1a
        Option                  : RX_LOS implemented
        Option                  : TX_FAULT implemented
        Option                  : TX_DISABLE implemented
        BR margin, max          : 0%
        BR margin, min          : 0%
        Vendor SN               : FNS092xxxxx
        Date code               : 0506xx

.. stop_vyoslinter

.. opcmd:: show interfaces ethernet <interface> xdp

   Display XDP forwarding statistics

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth1 xdp

     Collecting stats from BPF map
      - BPF map (bpf_map_type:6) id:176 name:xdp_stats_map key_size:4 value_size:16 max_entries:5
     XDP-action
     XDP_ABORTED            0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:0.250340
     XDP_DROP               0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:0.250317
     XDP_PASS               0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:0.250314
     XDP_TX                 0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:0.250313
     XDP_REDIRECT           0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:0.250313

     XDP-action
     XDP_ABORTED            0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:2.000410
     XDP_DROP               0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:2.000414
     XDP_PASS               0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:2.000414
     XDP_TX                 0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:2.000414
     XDP_REDIRECT           0 pkts (         0 pps)           0 Kbytes (     0 Mbits/s) period:2.000414
