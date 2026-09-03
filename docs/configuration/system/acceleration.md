---
myst:
  html_meta:
    description: |
      Hardware acceleration speeds up the router's own workload by
      offloading it to a supported cryptographic accelerator on the PCI
      bus. It is configured under system acceleration, is disabled by
      default, and applies system-wide once enabled. Intel QAT is
      currently the only supported accelerator.
    keywords: cryptographic acceleration, intel qat, pci passthrough
---

(acceleration)=

# Acceleration

Hardware acceleration speeds up the router's own workload. It is
configured under `system acceleration` and is disabled by default. Once
enabled, it applies system-wide, with no per-interface or per-tunnel
control. Acceleration requires a cryptographic accelerator that the router
supports, present on its {abbr}`PCI (Peripheral Component Interconnect)` bus.

When the router runs on a virtual machine, it detects a supported
accelerator only when the hypervisor assigns the accelerator to the
machine directly, a setup known as PCI passthrough.

Currently, only Intel® {abbr}`QAT (QuickAssist Technology)` for
cryptographic acceleration is supported.

## Configuration

### Intel® QAT

```{cfgcmd} set system acceleration qat

**Enable Intel® QAT acceleration.**

If IPsec is configured, the commit stops the IPsec service and starts it
again after the change is applied.
```

```{note}
The system must have a supported Intel® QAT device: C3xx (`8086:19e2`),
C62x (`8086:37c8`), C62xvf (`8086:37c9`), DH895 (`8086:0435`), D15xx
(`8086:6f54`), or 200xx (`8086:18ee`). Otherwise, the commit fails.
```

Example:

```none
set system acceleration qat
```

## Operation

### Intel® QAT

```{opcmd} show system acceleration qat

**List the Intel® QAT devices found in the system.**

If the system has no such device, the command shows
`No QAT device found`.
```

Example:

```none
show system acceleration qat
```

```{note}
The following commands work only after `set system acceleration qat` is
committed. Otherwise, they show
`system acceleration qat is not configured`.
```

```{opcmd} show system acceleration qat status

**Show the status of all Intel® QAT devices.**

The `state` field shows whether a device is up.
```

Example:

```none
show system acceleration qat status
```

```{opcmd} show system acceleration qat device \<device\> config

**Show the configuration of the specified Intel® QAT device.**
```

Example:

```none
show system acceleration qat device <device> config
```

```{opcmd} show system acceleration qat device \<device\> flows

**Show the firmware counters of the specified Intel® QAT device.**
```

Example:

```none
show system acceleration qat device <device> flows
```

```{opcmd} show system acceleration qat interrupts

**Show the Intel® QAT device interrupts.**

The output lists each interrupt with a counter for every CPU core.
```

Example:

```none
show system acceleration qat interrupts
```

## Example

### Intel® QAT

The following example configures an IPsec VPN between two routers with
Intel® QAT devices and compares the bandwidth with and without
acceleration.

Side A:

```none
set interfaces ethernet eth0 address '192.0.2.2/30'
set interfaces vti vti1 address '203.0.113.2/24'
set vpn ipsec authentication psk right id '192.0.2.2'
set vpn ipsec authentication psk right id '192.0.2.1'
set vpn ipsec authentication psk right secret 'REPLACE_WITH_RANDOM_SECRET'
set vpn ipsec esp-group MyESPGroup proposal 1 encryption 'aes256'
set vpn ipsec esp-group MyESPGroup proposal 1 hash 'sha256'
set vpn ipsec ike-group MyIKEGroup dead-peer-detection action 'restart'
set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group '14'
set vpn ipsec ike-group MyIKEGroup proposal 1 encryption 'aes256'
set vpn ipsec ike-group MyIKEGroup proposal 1 hash 'sha256'
set vpn ipsec interface 'eth0'
set vpn ipsec options disable-route-autoinstall
set vpn ipsec site-to-site peer right authentication local-id '192.0.2.2'
set vpn ipsec site-to-site peer right authentication mode 'pre-shared-secret'
set vpn ipsec site-to-site peer right authentication remote-id '192.0.2.1'
set vpn ipsec site-to-site peer right connection-type 'initiate'
set vpn ipsec site-to-site peer right default-esp-group 'MyESPGroup'
set vpn ipsec site-to-site peer right ike-group 'MyIKEGroup'
set vpn ipsec site-to-site peer right local-address '192.0.2.2'
set vpn ipsec site-to-site peer right remote-address '192.0.2.1'
set vpn ipsec site-to-site peer right vti bind 'vti1'
```

Side B:

```none
set interfaces ethernet eth0 address '192.0.2.1/30'
set interfaces vti vti1 address '203.0.113.1/24'
set vpn ipsec authentication psk left id '192.0.2.2'
set vpn ipsec authentication psk left id '192.0.2.1'
set vpn ipsec authentication psk left secret 'REPLACE_WITH_RANDOM_SECRET'
set vpn ipsec esp-group MyESPGroup proposal 1 encryption 'aes256'
set vpn ipsec esp-group MyESPGroup proposal 1 hash 'sha256'
set vpn ipsec ike-group MyIKEGroup dead-peer-detection action 'restart'
set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group '14'
set vpn ipsec ike-group MyIKEGroup proposal 1 encryption 'aes256'
set vpn ipsec ike-group MyIKEGroup proposal 1 hash 'sha256'
set vpn ipsec interface 'eth0'
set vpn ipsec options disable-route-autoinstall
set vpn ipsec site-to-site peer left authentication local-id '192.0.2.1'
set vpn ipsec site-to-site peer left authentication mode 'pre-shared-secret'
set vpn ipsec site-to-site peer left authentication remote-id '192.0.2.2'
set vpn ipsec site-to-site peer left connection-type 'trap'
set vpn ipsec site-to-site peer left default-esp-group 'MyESPGroup'
set vpn ipsec site-to-site peer left ike-group 'MyIKEGroup'
set vpn ipsec site-to-site peer left local-address '192.0.2.1'
set vpn ipsec site-to-site peer left remote-address '192.0.2.2'
set vpn ipsec site-to-site peer left vti bind 'vti1'
```

Router A initiates the tunnel. Router B uses `trap`, which raises the
tunnel when matching traffic appears rather than initiating in
parallel with Router A. Dead peer detection on both routers restarts
the tunnel if it drops, including after the acceleration commit
restarts the IPsec service. Both routers disable automatic route
installation, because routing over the tunnel is managed through the
`vti1` interface.

Without acceleration, a bandwidth test between the tunnel addresses
(`203.0.113.1` to `203.0.113.2`) shows the following results:

```none
Connecting to host 203.0.113.2, port 5201
[  9] local 203.0.113.1 port 51344 connected to 203.0.113.2 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  9]   0.00-1.01   sec  32.3 MBytes   268 Mbits/sec    0    196 KBytes
[  9]   1.01-2.03   sec  32.5 MBytes   268 Mbits/sec    0    208 KBytes
[  9]   2.03-3.03   sec  32.5 MBytes   271 Mbits/sec    0    208 KBytes
[  9]   3.03-4.04   sec  32.5 MBytes   272 Mbits/sec    0    208 KBytes
[  9]   4.04-5.00   sec  31.2 MBytes   272 Mbits/sec    0    208 KBytes
[  9]   5.00-6.01   sec  32.5 MBytes   272 Mbits/sec    0    234 KBytes
[  9]   6.01-7.04   sec  32.5 MBytes   265 Mbits/sec    0    234 KBytes
[  9]   7.04-8.04   sec  32.5 MBytes   272 Mbits/sec    0    234 KBytes
[  9]   8.04-9.04   sec  32.5 MBytes   273 Mbits/sec    0    336 KBytes
[  9]   9.04-10.00  sec  31.2 MBytes   272 Mbits/sec    0    336 KBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  9]   0.00-10.00  sec   322 MBytes   270 Mbits/sec    0           sender
[  9]   0.00-10.00  sec   322 MBytes   270 Mbits/sec                receiver
```

With `set system acceleration qat` committed on both routers, the same
test shows higher bandwidth:

```none
Connecting to host 203.0.113.2, port 5201
[  9] local 203.0.113.1 port 51340 connected to 203.0.113.2 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  9]   0.00-1.00   sec  97.3 MBytes   817 Mbits/sec    0   1000 KBytes
[  9]   1.00-2.00   sec  92.5 MBytes   776 Mbits/sec    0   1.07 MBytes
[  9]   2.00-3.00   sec  92.5 MBytes   776 Mbits/sec    0    820 KBytes
[  9]   3.00-4.00   sec  92.5 MBytes   776 Mbits/sec    0    899 KBytes
[  9]   4.00-5.00   sec  91.2 MBytes   765 Mbits/sec    0    972 KBytes
[  9]   5.00-6.00   sec  92.5 MBytes   776 Mbits/sec    0   1.02 MBytes
[  9]   6.00-7.00   sec  92.5 MBytes   776 Mbits/sec    0   1.08 MBytes
[  9]   7.00-8.00   sec  92.5 MBytes   776 Mbits/sec    0   1.14 MBytes
[  9]   8.00-9.00   sec  91.2 MBytes   765 Mbits/sec    0    915 KBytes
[  9]   9.00-10.00  sec  92.5 MBytes   776 Mbits/sec    0   1000 KBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  9]   0.00-10.00  sec   927 MBytes   778 Mbits/sec    0             sender
[  9]   0.00-10.01  sec   925 MBytes   775 Mbits/sec                  receiver
```
