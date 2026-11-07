---
lastproofread: '2026-01-19'
---

(ethernet-interface)=

# Ethernet

Ethernet interfaces (e.g., `eth0`, `eth1`) represent the host's physical
or virtual network ports.

They are the most common interface type, serving as the base layer upon which
IP addresses, VLANs, and tunnels are configured to carry traffic across both
LANs and WANs.

## Configuration

### Common interface configuration

```{cmdincludemd} /_include/interface-common-with-dhcp.txt
:var0: ethernet
:var1: eth0
```

```{cfgcmd} set interfaces ethernet \<interface\> switchdev

**Enable** ``switchdev`` **mode for the interface.**

In ``switchdev`` mode, the interface offloads traffic switching between ports
to the hardware, bypassing the host CPU. This increases the interface’s
traffic-handling capacity and reduces its forwarding delay.
```

:::{note}
`switchdev` mode is available only on certain physical network
interfaces and requires a switchdev-compatible driver.
:::

### Ethernet options

```{cfgcmd} set interfaces ethernet \<interface\> duplex \<auto | full | half\>

**Configure duplex mode for the interface.**

The following duplex modes are available:

* ``auto``: The interface negotiates the duplex mode with the connected device.
* ``full``: The interface sends and receives data simultaneously. The
  connected device must also be set to full-duplex to avoid a duplex mismatch.
* ``half``: The interface either sends or receives data, but not both at the
  same time.

The default duplex mode is ``auto``.
```

```{cfgcmd} set interfaces ethernet \<interface\> speed \<auto | 10 | 100 | 1000 | 2500 | 5000 | 10000 | 25000 | 40000 | 50000 | 100000\>

**Configure the interface's speed, in Mbit/s.**

The following options are available:

* ``auto``:  The interface negotiates the speed with the connected device.
* ``10, 100, 1000 ...``: The interface operates at the selected speed. The
  connected device must be set to the same speed to establish a connection.

The default option is ``auto``.
```

```{cfgcmd} set interfaces ethernet \<interface\> ring-buffer rx \<value\>

**Configure the receive (RX) ring buffer size for the interface.**

The RX ring buffer size defines the number of incoming packets the interface
can queue in hardware before the CPU processes them.

Higher values reduce the risk of drops when the NIC receives network traffic
faster than the CPU can process it, though latency may increase. Lower values
reduce latency but increase the risk of packet drops during incoming traffic
bursts.

To view supported values for a specific interface, use:
```

```none
ethtool -g <interface>
```

```{cfgcmd} set interfaces ethernet \<interface\> ring-buffer tx \<value\>

**Configure the transmit (TX) ring buffer size.**

The TX ring buffer size defines the number of outgoing packets the interface
can queue in hardware before they are transmitted onto the network.

Higher values reduce the risk of drops when the CPU generates traffic faster
than the NIC can handle, though latency may increase. Lower values reduce
latency but increase the risk of packet drops during outgoing traffic bursts.

To view supported values for a specific interface, use:
```

```none
ethtool -g <interface>
```


#### Interrupt Coalescing

Interrupt coalescing is a mechanism that reduces CPU interrupt load by bundling
multiple packets into a single interrupt event instead of interrupting
the CPU for every packet arrival or transmission.

:::{note}
Not all network drivers or virtual interfaces support all
coalescing parameters. Use `ethtool --show-coalesce <interface>`
to verify which settings are supported by your hardware and driver.
:::

**Basic adaptive coalescing**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing adaptive-rx

```
```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing adaptive-tx

Enable adaptive interrupt coalescing. The NIC automatically tunes RX/TX
interrupt pacing based on traffic patterns to reduce CPU utilization
during high throughput while preserving latency at low packet rates.
```

**Basic interrupt delay**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-usecs \<0-16384\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-usecs \<0-16384\>

Set the delay in microseconds before generating an RX/TX interrupt after
receiving or transmitting a packet. Lower values reduce latency; higher
values reduce CPU load.
```

**Interrupt frame thresholds**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-frames \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-frames \<number\>

Generate an RX/TX interrupt only after the specified number of packets
have been received or transmitted.
```

**IRQ-specific coalescing**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-usecs-irq \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-frames-irq \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-usecs-irq \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-frames-irq \<number\>

Control interrupt coalescing parameters while the driver is already
servicing an interrupt (IRQ context). These settings allow finer tuning
of interrupt behavior under sustained load.
```

**Adaptive rate thresholds**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing pkt-rate-low \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing pkt-rate-high \<number\>

Define packet-rate thresholds (packets per second) used by adaptive
coalescing to switch between low-rate and high-rate interrupt coalescing
profiles.
```

**Low-rate adaptive parameters**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-usecs-low \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-frame-low \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-usecs-low \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-frame-low \<number\>

Interrupt coalescing parameters applied when the packet rate is below
``pkt-rate-low``. Typically optimized for lower latency.
```

**High-rate adaptive parameters**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-usecs-high \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing rx-frame-high \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-usecs-high \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-frame-high \<number\>

Interrupt coalescing parameters applied when the packet rate exceeds
``pkt-rate-high``. Typically optimized for maximum throughput and
reduced CPU utilization.
```

**Statistics and sampling**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing stats-block-usecs \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing sample-interval \<number\>

Control how frequently coalescing statistics are updated and how often
the NIC samples traffic rates for adaptive coalescing decisions.
```

**Completion queue (CQE) mode**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing cqe-mode-rx
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing cqe-mode-tx

Enable RX/TX Completion Queue Entry (CQE) mode, if supported by the
driver. CQE mode can improve performance on high-speed NICs by
optimizing completion handling.
```

**Transmit aggregation**

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-aggr-max-bytes \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-aggr-max-frames \<number\>
```

```{cfgcmd} set interfaces ethernet \<interface\> interrupt-coalescing tx-aggr-time-usecs \<number\>

Control transmit packet aggregation. Packets may be buffered and sent
together until one of the configured limits (bytes, frames, or time)
is reached, reducing interrupt and DMA overhead.
```

#### Offloading

```{cfgcmd} set interfaces ethernet \<interface\> offload \<lro | tso | gso | gro | rps | sg\>

**Configure the offloading features for the interface.**

The interface offloading features define whether specific packet-processing tasks
are performed by hardware (the NIC) or by software (the kernel). You can enable
multiple offloading features for a single interface.

 * ``lro`` **(Large Receive Offload):** Instructs the NIC to merge multiple
   incoming packets into one larger packet before sending it to the CPU.

   :::{note}
   {abbr}`LRO (Large Receive Offload)` hardware support is often limited
   to TCP/IPv4 packets. For details on LRO limitations, see
   https://lwn.net/Articles/358910/
   :::
   :::{warning}
   {abbr}`LRO (Large Receive Offload)` irreversibly alters packet
   headers during merging. This prevents the merged packet from being correctly
   split back into the original packets, causing packet drops and forwarding
   failures on routers and bridges. Use {abbr}`LRO (Large Receive Offload)` only
   for end-hosts that do not forward traffic.
   :::
 * ``tso`` **(TCP Segmentation Offload):** Instructs the NIC to split large TCP
   packets into smaller ones before transmitting them to the network.

   **Important:** {abbr}`SG (Scatter-Gather/Scatter-Gather DMA)` must be enabled
   for {abbr}`TSO (TCP Segmentation Offload)` to work. Additionally, {abbr}`GSO
   (Generic Segmentation Offload)` should be enabled as a safety fallback; it
   ensures that if traffic is rerouted to hardware without {abbr}`TSO (TCP
   Segmentation Offload)` support, the kernel can still segment the packets,
   preventing transmission failures.

 * ``gso`` **(Generic Segmentation Offload):** Instructs the kernel to split
   large packets into smaller ones before sending them to the NIC.

   {abbr}`GSO (Generic Segmentation Offload)` serves as a software fallback for
   hardware that does not support {abbr}`TSO (TCP Segmentation Offload)` or for
   protocols (like UDP) that hardware cannot offload.

   **Important:** {abbr}`SG (Scatter-Gather/Scatter-Gather DMA)` must be enabled
   for {abbr}`GSO (Generic Segmentation Offload)` to work.

 * ``gro`` **(Generic Receive Offload):** Instructs the kernel to merge multiple
   incoming packets into one larger packet before passing it to upper protocol
   layers.

   Unlike LRO, GRO preserves the necessary packet metadata so the merged packet
   can be correctly split back into the original packets. This makes GRO safe for
   use on routers and bridges.

 :::{note}
The exception is for IPv4 IDs. If the "Don't Fragment" (DF) bit is
set and IDs are not sequential, {abbr}`GSO (Generic Segmentation Offload)`
alters them to maintain a consistent sequence for {abbr}`GSO (Generic
Segmentation Offload)` compatibility.
 :::
 * ``rps`` **(Receive Packet Steering):** Instructs the kernel to distribute
   the processing of incoming packets across multiple CPU cores.

   The kernel calculates a hash from packet headers (IP addresses and ports) to
   ensure packets from the same flow are processed by the same CPU core.

 :::{note}
{abbr}`RPS (Receive Packet Steering)` is a software version of
{abbr}`RSS (Receive Side Scaling)` and is useful for NICs without hardware
multi-queue support.
 :::
 * ``sg`` **(Scatter-Gather/Scatter-Gather DMA):** Instructs the NIC to fetch
   data fragments from various RAM locations and transmit them as a single packet
   to the network, eliminating the need for the kernel to copy them into a
   contiguous block first.
```

#### 802.1X (EAPOL) authentication

```{cmdincludemd} /_include/interface-eapol.txt
:var0: ethernet
:var1: eth0
```

#### EVPN Multihoming

Uplink/core tracking.

```{cmdincludemd} /_include/interface-evpn-uplink.txt
:var0: ethernet
:var1: eth0
```

### VLAN
#### Regular VLANs (802.1q)

```{cmdincludemd} /_include/interface-vlan-8021q.txt
:var0: ethernet
:var1: eth0
```

#### 802.1ad (QinQ)

```{cmdincludemd} /_include/interface-vlan-8021ad.txt
:var0: ethernet
:var1: eth0
```

### SPAN port mirroring

```{cmdincludemd} ../../_include/interface-mirror.txt
:var0: ethernet
:var1: eth1
:var2: eth3
```

(interface-naming)=

## Interface naming

VyOS owns the `ethN` and `wlanN` namespace: the kernel command line carries
`net.ifnames=0`, which turns off the naming policy systemd would otherwise
apply. Which physical port gets which name is therefore decided by VyOS, and
that decision has to survive a reboot.

### How names are assigned

A name is bound to the **slot** the hardware sits in, not to its MAC address.
The bindings live in `/config/interface-mapping.json`:

```{code-block} none
{
  "version": 1,
  "interfaces": {
    "eth0": "ID_NET_NAME_SLOT=ens18",
    "eth1": "ID_PATH=pci-0000:00:13.0"
  }
}
```

Each value is a single udev property. The most stable one the device can
offer is used, in this order:

1. `ID_NET_NAME_ONBOARD`
2. `ID_NET_NAME_SLOT`
3. `ID_NET_NAME_PATH`
4. `ID_PATH`
5. `ID_NET_NAME_MAC`

A firmware slot index survives PCI renumbering, a bus path does not — adding a
card can shift `pci-0000:00:13.0` but not the slot the firmware reports. The
last entry is a fallback for paravirtual buses which offer no usable topology.

The store is rendered into one file per interface under
`/etc/systemd/network/`, named `10-vyos-<interface>.link`, so udev applies the
name as the device appears and nothing ever observes a probe-order name.

:::{note}
The `.link` files are generated from the mapping file. Do not edit them,
they are regenerated on every boot.
:::

A name stays reserved while its hardware is absent, so a NIC which appears
later can never inherit the name — and with it the addresses — of an
interface which is merely unplugged. Hardware the system has not seen before
is named at boot in canonical hardware order and then recorded.

What a boot decided can be inspected in `/run/vyos-net-name-resolve.json`.

### Replacing a network card

Nothing needs to be done. The slot is the identity, so a replacement card in
the same slot is the same interface and keeps its configuration. This is the
case which used to require updating a `hw-id` value by hand.

### Adding a network card

A card which the system has not seen before is given the next free name, and
that name is appended after the ones already in use. Where the card sits has
no say in it: a card in a slot between two existing ones does **not** take a
name in the middle and push the others along, because every name already
recorded is reserved. Renumbering would move interfaces onto cables they were
never configured for.

So on a system with `eth0` to `eth7`, a card added in any free slot becomes
`eth8`, and keeps that name once it is recorded.

This applies to a card plugged into a running system as well. It is named as
soon as it appears, and a configuration node for it is added on the next
boot, after which it can be configured like any other interface.

### Renaming an interface

Renaming an interface means changing both the configuration and the mapping
file. Changing only one of them leaves the old name's settings orphaned and
the new name unconfigured.

To rename `eth1` to `eth23`:

```{code-block} none
vyos@vyos:~$ configure
vyos@vyos# rename interfaces ethernet eth1 to interfaces ethernet eth23
vyos@vyos# commit
vyos@vyos# save
vyos@vyos# exit
```

Then change the key in the mapping file, leaving its value untouched:

```{code-block} none
vyos@vyos:~$ sudo vi /config/interface-mapping.json
```

```{code-block} none
{
  "version": 1,
  "interfaces": {
    "eth0": "ID_NET_NAME_SLOT=ens18",
    "eth23": "ID_PATH=pci-0000:00:13.0"
  }
}
```

The new name is applied on the next boot:

```{code-block} none
vyos@vyos:~$ reboot
```

:::{note}
The mapping file belongs to the `vyattacfg` group and is edited with
`sudo`. It lives on the config volume and therefore survives an image
upgrade.
:::

### Migrating from hw-id

`interfaces ethernet <interface> hw-id` and
`interfaces wireless <interface> hw-id` no longer exist. A name is a property
of the hardware, not of the configuration.

Upgrading converts the existing bindings automatically: every `hw-id` is
matched against the permanent address of the hardware actually present and
the slot that card sits in is recorded. No interface changes its name across
the upgrade, including systems whose names never followed slot order. A
`hw-id` whose hardware is absent is skipped, as the configuration may well
originate from another machine.

Setting a MAC address is unrelated to naming and is still done with
`set interfaces ethernet <interface> mac <address>`.

## Operation

```{opcmd} show interfaces ethernet

Show brief interface information.

:::{code-block} none
vyos@vyos:~$ show interfaces ethernet
Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
Interface        IP Address                        S/L  Description
---------        ----------                        ---  -----------
eth0             172.18.201.10/24                  u/u  LAN
eth1             172.18.202.11/24                  u/u  WAN
eth2             -                                 u/D
:::
```

```{opcmd} show interfaces ethernet \<interface\>

Show detailed interface information.

:::{code-block} none
vyos@vyos:~$ show interfaces ethernet eth0
eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 00:50:44:00:f5:c9 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::250:44ff:fe00:f5c9/64 scope link
       valid_lft forever preferred_lft forever

    RX:  bytes    packets     errors    dropped    overrun      mcast
      56735451     179841          0          0          0     142380
    TX:  bytes    packets     errors    dropped    carrier collisions
       5601460      62595          0          0          0          0
:::
```

```{opcmd} show interfaces ethernet \<interface\> physical

Show interface hardware-level and driver details.

:::{code-block} none
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
:::
```

```{opcmd} show interfaces ethernet \<interface\> physical offload

Show the status of the interface offloading features.

:::{code-block} none
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
:::
```

```{opcmd} show interfaces ethernet \<interface\> transceiver

Show information about the transceiver module plugged into the interface
(e.g., SFP+, QSFP).

:::{code-block} none
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
:::
```