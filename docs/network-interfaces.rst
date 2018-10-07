.. _network-interfaces:

Network Interfaces
==================

Configured interfaces on a VyOS system can be displayed using the `show
interfaces` command.

.. code-block:: sh

  vyos@vyos:~$ show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             172.16.51.129/24                  u/u  OUTSIDE
  eth1             192.168.0.1/24                    u/u  INSIDE
  lo               127.0.0.1/8                       u/u
                   ::1/128
  vyos@vyos:~$

A specific interface can be shown using the `show interfaces <type> <name>`
command.

.. code-block:: sh

  vyos@vyos:~$ show interfaces ethernet eth0
  eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP qlen 1000
      link/ether 00:0c:29:44:3b:0f brd ff:ff:ff:ff:ff:ff
      inet 172.16.51.129/24 brd 172.16.51.255 scope global eth0
      inet6 fe80::20c:29ff:fe44:3b0f/64 scope link
         valid_lft forever preferred_lft forever
      Description: OUTSIDE

      RX:  bytes    packets     errors    dropped    overrun      mcast
          274397       3064          0          0          0          0
      TX:  bytes    packets     errors    dropped    carrier collisions
          257276       1890          0          0          0          0
  vyos@vyos:~$

Different network interfaces provide type-specific configuration. Ethernet
interfaces, for example, allow the configuration of speed and duplex.

Many services, such as network routing, firewall, and traffic policy also
maintain interface-specific configuration. These will be covered in their
respective sections.

Interface Addresses
-------------------

Each interface can be configured with a description and address. Interface
addresses might be:

* Static IPv4 `address 172.16.51.129/24`
* Static IPv6 `address 2001:db8:1::ffff/64`
* DHCP IPv4 `address dhcp`
* DHCP IPv6 `address dhcpv6`

An interface description is assigned using the following command:

.. code-block:: sh

  set interfaces ethernet eth0 description 'OUTSIDE'

IPv4
^^^^

Static Address
**************

This method is supported on all interfaces, apart from OpenVPN that uses
different syntax and wireless modems that are always autoconfigured through
PPP.

The command is `set interfaces $type $name address $address`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 address 192.0.2.1/24
  set interfaces tunnel tun0 address 10.0.0.1/30
  set interfaces bridge br0 address 203.0.113.45/26
  set interfaces ethernet eth0 vif 30 address 192.0.30.254/24

DHCP
****

This method is supported on all physical interfaces, and those that are
directly connected to a physical interface (ethernet, VLAN, bridge, bond,
pseudo-ethernet, wireless).

The command is `set interfaces $type $name address dhcp`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 vif 90 address dhcp
  set interfaces bridge br0 address dhcp

IPv6
^^^^

Static Address
**************

This method is supported on all interfaces, apart from OpenVPN that uses
different syntax and wireless modems that are always autoconfigured through
PPP. Static IPv6 addresses are supported on all interfaces except VTI.

The command is `set interfaces $type $name address $address`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 address 2001:db8:100::ffff/64
  set interfaces tunnel tun0 address 2001:db8::1/64
  set interfaces bridge br0 address  2001:db8:200::1/64
  set interfaces ethernet eth0 vif 30 address 2001:db8:3::ffff/64

DHCP
****

This method is supported on all physical interfaces, and those that are
directly connected to a physical interface (ethernet, VLAN, bridge, bond,
pseudo-ethernet, wireless).

The command is `set interfaces $type $name address dhcpv6`. Examples:

.. code-block:: sh

  set interfaces bonding bond1 address dhcpv6
  set interfaces bridge br0 vif 56 address dhcpv6

Autoconfiguration (SLAAC)
*************************

SLAAC is specified in RFC4862_. This method is supported on all physical
interfaces, and those that are directly connected to a physical interface
(ethernet, VLAN, bridge, bond, pseudo-ethernet, wireless).

The command is `set interfaces $type $name ipv6 address autoconf`. Examples:

.. code-block:: sh

  set interfaces ethernet eth0 vif 90 ipv6 address autoconf
  set interfaces bridge br0 ipv6 address autoconf

.. note:: This method automatically disables IPv6 traffic forwarding on the
   interface in question.

EUI-64
******

EUI-64 (64-Bit Extended Unique Identifier) as specified in RFC4291_. IPv6
addresses in /64 networks can be automatically generated from the prefix and
MAC address, if you specify the prefix.

The command is `set interfaces $type $name ipv6 address eui64 $prefix`. Examples:

.. code-block:: sh

  set interfaces bridge br0 ipv6 address eui64 2001:db8:beef::/64
  set interfaces pseudo-ethernet peth0 ipv6 address eui64 2001:db8:aa::/64

Ethernet Interfaces
-------------------

Ethernet interfaces allow for the configuration of speed, duplex, and hw-id
(MAC address). Below is an example configuration:

.. code-block:: sh

  set interfaces ethernet eth1 address '192.168.0.1/24'
  set interfaces ethernet eth1 address '2001:db8:1::ffff/64'
  set interfaces ethernet eth1 description 'INSIDE'
  set interfaces ethernet eth1 duplex 'auto'
  set interfaces ethernet eth1 speed 'auto'

Resulting in:

.. code-block:: sh

  ethernet eth1 {
      address 192.168.0.1/24
      address 2001:db8:1::ffff/64
      description INSIDE
      duplex auto
      hw-id 00:0c:29:44:3b:19
      smp_affinity auto
      speed auto
  }

In addition, Ethernet interfaces provide the extended operational commands
`show interfaces ethernet <name> physical` and `show interfaces ethernet <name>
statistics`. Statistics available are driver dependent.

.. code-block:: sh

  vyos@vyos:~$ show interfaces ethernet eth0 physical
  Settings for eth0:
          Supported ports: [ TP ]
          Supported link modes:   10baseT/Half 10baseT/Full
                                  100baseT/Half 100baseT/Full
                                  1000baseT/Full
          Supports auto-negotiation: Yes
          Advertised link modes:  10baseT/Half 10baseT/Full
                                  100baseT/Half 100baseT/Full
                                  1000baseT/Full
          Advertised pause frame use: No
          Advertised auto-negotiation: Yes
          Speed: 1000Mb/s
          Duplex: Full
          Port: Twisted Pair
          PHYAD: 0
          Transceiver: internal
          Auto-negotiation: on
          MDI-X: Unknown
          Supports Wake-on: d
          Wake-on: d
          Current message level: 0x00000007 (7)
          Link detected: yes
  driver: e1000
  version: 7.3.21-k8-NAPI
  firmware-version:
  bus-info: 0000:02:01.0

  vyos@vyos:~$ show interfaces ethernet eth0 statistics
  NIC statistics:
       rx_packets: 3530
       tx_packets: 2179
  [...]

VLAN Sub-Interfaces (802.1Q)
----------------------------

802.1Q VLAN interfaces are represented as virtual sub-interfaces in VyOS. The
term used for this is `vif`. Configuration of a tagged sub-interface is
accomplished using the configuration command `set interfaces ethernet <name>
vif <vlan-id>`.

.. code-block:: sh

  set interfaces ethernet eth1 vif 100 description 'VLAN 100'
  set interfaces ethernet eth1 vif 100 address '192.168.100.1/24'
  set interfaces ethernet eth1 vif 100 address '2001:db8:100::1/64'

Resulting in:

.. code-block:: sh

  ethernet eth1 {
      address 192.168.100.1/24
      address 2001:db8:100::1/64
      description INSIDE
      duplex auto
      hw-id 00:0c:29:44:3b:19
      smp_affinity auto
      speed auto
      vif 100 {
          address 192.168.100.1/24
          description "VLAN 100"
      }
  }

VLAN interfaces are shown as `<name>.<vlan-id>`, e.g. `eth1.100`:

.. code-block:: sh

  vyos@vyos:~$ show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             172.16.51.129/24                  u/u  OUTSIDE
  eth1             192.168.0.1/24                    u/u  INSIDE
  eth1.100         192.168.100.1/24                  u/u  VLAN 100
  lo               127.0.0.1/8                       u/u
                   ::1/128

Bridging
--------

Interfaces in VyOS can be bridged together to provide software switching of
Layer-2 traffic.

A bridge is created when a bridge interface is defined. In the example below
we will be creating a bridge for VLAN 100 and assigning a VIF to the bridge.

.. code-block:: sh

  set interfaces bridge 'br100'
  set interfaces ethernet eth1 vif 100 bridge-group bridge br100

Interfaces assigned to a bridge-group do not have address configuration. An IP
address can be assigned to the bridge interface itself, however, like any
normal interface.

.. code-block:: sh

  set interfaces bridge br100 address '192.168.100.1/24'
  set interfaces bridge br100 address '2001:db8:100::1/64'

Example Result:

.. code-block:: sh

  bridge br100 {
      address 192.168.100.1/24
      address 2001:db8:100::1/64
  }
  [...]
  ethernet eth1 {
  [...]
      vif 100 {
          bridge-group {
              bridge br100
          }
      }
  }

In addition to normal IP interface configuration, bridge interfaces support
Spanning-Tree Protocol. STP is disabled by default.

.. note:: Please use caution when introducing spanning-tree protocol on a
   network as it may result in topology changes.

To enable spanning-tree use the `set interfaces bridge <name> stp true` command:

.. code-block:: sh

  set interfaces bridge br100 stp true

STP `priority`, `forwarding-delay`, `hello-time`, and `max-age` can be
configured for the bridge-group. The MAC aging time can also be configured
using the `aging` directive.

For member interfaces, the bridge-group `priority` and `cost` can be configured.

The `show bridge` operational command can be used to display configured bridges:

.. code-block:: sh

  vyos@vyos:~$ show bridge
  bridge name     bridge id               STP enabled     interfaces
  br100           0000.000c29443b19       yes             eth1.100

If spanning-tree is enabled, the `show bridge <name> spanning-tree` command
can be used to show STP configuration:

.. code-block:: sh

  vyos@vyos:~$ show bridge br100 spanning-tree
  br100
   bridge id              0000.000c29443b19
   designated root        0000.000c29443b19
   root port                 0                    path cost                  0
   max age                  20.00                 bridge max age            20.00
   hello time                2.00                 bridge hello time          2.00
   forward delay            15.00                 bridge forward delay      15.00
   ageing time             300.00
   hello timer               0.47                 tcn timer                  0.00
   topology change timer     0.00                 gc timer                  64.63
   flags

  eth1.100 (1)
   port id                8001                    state                forwarding
   designated root        0000.000c29443b19       path cost                  4
   designated bridge      0000.000c29443b19       message age timer          0.00
   designated port        8001                    forward delay timer        0.00
   designated cost           0                    hold timer                 0.00
   flags

The MAC address-table for a bridge can be displayed using the `show bridge
<name> macs` command:

.. code-block:: sh

  vyos@vyos:~$ show bridge br100 macs
  port no mac addr                is local?       ageing timer
    1     00:0c:29:44:3b:19       yes                0.00

Bonding
-------

You can combine (aggregate) 2 or more physical interfaces into a single
logical one. It's called bonding, or LAG, or ether-channel, or port-channel.

Create interface bondX, where X is just a number:

.. code-block:: sh

  set interfaces bonding bond0 description 'my-sw1 int 23 and 24'

You are able to choose a hash policy:

.. code-block:: sh

  vyos@vyos# set interfaces bonding bond0 hash-policy
  Possible completions:
    layer2       use MAC addresses to generate the hash (802.3ad)
    layer2+3     combine MAC address and IP address to make hash
    layer3+4     combine IP address and port to make hash

For example:

.. code-block:: sh

  set interfaces bonding bond0 hash-policy 'layer2'

You may want to set IEEE 802.3ad Dynamic link aggregation (802.3ad) AKA LACP
(don't forget to setup it on the other end of these links):

.. code-block:: sh

 set interfaces bonding bond0 mode '802.3ad'

or some other modes:

.. code-block:: sh

  vyos@vyos# set interfaces bonding bond0 mode
  Possible completions:
    802.3ad      IEEE 802.3ad Dynamic link aggregation (Default)
    active-backup
                 Fault tolerant: only one slave in the bond is active
    broadcast    Fault tolerant: transmits everything on all slave interfaces
    round-robin  Load balance: transmit packets in sequential order
    transmit-load-balance
                 Load balance: adapts based on transmit load and speed
    adaptive-load-balance
                 Load balance: adapts based on transmit and receive plus ARP
    xor-hash     Load balance: distribute based on MAC address

Now bond some physical interfaces into bond0:

.. code-block:: sh

  set interfaces ethernet eth0 bond-group 'bond0'
  set interfaces ethernet eth0 description 'member of bond0'
  set interfaces ethernet eth1 bond-group 'bond0'
  set interfaces ethernet eth1 description 'member of bond0'

After a commit you may treat bond0 as almost a physical interface (you can't
change its` duplex, for example) and assign IPs or VIFs on it.

You may check the result:

.. code-block:: sh

  vyos@vyos# run sh interfaces bonding
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  bond0            -                                 u/u  my-sw1 int 23 and 24
  bond0.10         192.168.0.1/24                    u/u  office-net
  bond0.100        10.10.10.1/24                     u/u  management-net

Tunnel Interfaces
-----------------

Set Virtual Tunnel interface

.. code-block:: sh

  set interfaces vti vti0 address 192.168.2.249/30
  set interfaces vti vti0 address 2001:db8:2::249/64

Results in:

.. code-block:: sh

  vyos@vyos# show interfaces vti
  vti vti0 {
      address 192.168.2.249/30
      address 2001:db8:2::249/64
      description "Description"
  }

WireGuard VPN Interface
-----------------------

WireGuard_ is an extremely simple yet fast and modern VPN that utilizes
state-of-the-art cryptography. See https://www.wireguard.com for more
information.

Configuration
^^^^^^^^^^^^^

Generate the keypair, which creates a public and private part and stores it
within VyOS.

.. code-block:: sh

  wg01:~$ configure
  wg01# run generate wireguard keypair

The public key is being shared with your peer(s), your peer will encrypt all
traffic to your system using this public key.

.. code-block:: sh

  wg01# run show wireguard pubkey
  u41jO3OF73Gq1WARMMFG7tOfk7+r8o8AzPxJ1FZRhzk=

The next step is to configure your local side as well as the policy based
trusted destination addresses. If you only initiate a connection, the listen
port and endpoint is optional, if you however act as a server and endpoints
initiate the connections to your system, you need to define a port your clients
can connect to, otherwise it's randomly chosen and may make it difficult with
firewall rules, since the port may be a different one when you reboot your
system.

You will also need the public key of your peer as well as the network(s) you
want to tunnel (allowed-ips) to configure a wireguard tunnel. The public key
below is always the public key from your peer, not your local one.

**local side**

.. code-block:: sh

  set interfaces wireguard wg01 address '10.1.0.1/24'
  set interfaces wireguard wg01 description 'VPN-to-wg02'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '10.2.0.0/24'
  set interfaces wireguard wg01 peer to-wg02 endpoint '192.168.0.142:12345'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'XMrlPykaxhdAAiSjhtPlvi30NVkvLQliQuKP7AI7CyI='
  set interfaces wireguard wg01 port '12345'
  set protocols static interface-route 10.2.0.0/24 next-hop-interface wg01

The last step is to define an interface route for 10.2.0.0/24 to get through
the wireguard interface `wg01`. Multiple IPs or networks can be defined and
routed, the last check is allowed-ips which either prevents or allows the
traffic.

**remote side**

.. code-block:: sh

  set interfaces wireguard wg01 address '10.2.0.1/24'
  set interfaces wireguard wg01 description 'VPN-to-wg01'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '10.1.0.0/24'
  set interfaces wireguard wg01 peer to-wg02 endpoint '192.168.0.124:12345'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'u41jO3OF73Gq1WARMMFG7tOfk7+r8o8AzPxJ1FZRhzk='
  set interfaces wireguard wg01 port '12345'
  set protocols static interface-route 10.1.0.0/24 next-hop-interface wg01

Assure that your firewall rules allow the traffic, in which case you have a
working VPN using wireguard.

.. code-block:: sh

  wg01# ping 10.2.0.1
  PING 10.2.0.1 (10.2.0.1) 56(84) bytes of data.
  64 bytes from 10.2.0.1: icmp_seq=1 ttl=64 time=1.16 ms
  64 bytes from 10.2.0.1: icmp_seq=2 ttl=64 time=1.77 ms

  wg02# ping 10.1.0.1
  PING 10.1.0.1 (10.1.0.1) 56(84) bytes of data.
  64 bytes from 10.1.0.1: icmp_seq=1 ttl=64 time=4.40 ms
  64 bytes from 10.1.0.1: icmp_seq=2 ttl=64 time=1.02 ms

An additional layer of symmetric-key crypto can be used on top of the
asymmetric crypto, which is optional.

.. code-block:: sh

  wg01# run generate wireguard preshared-key
  rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc=

Copy the key, it is not stored on the local file system. Make sure you
distribute that key in a safe manner, it's a symmatric key, so only you and
your peer should have knowledge if its content.

.. code-block:: sh

  wg01# set interfaces wireguard wg01 peer to-wg02 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='
  wg02# set interfaces wireguard wg01 peer to-wg01 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='

.. _RFC4862: https://tools.ietf.org/html/rfc4862
.. _RFC4291: http://tools.ietf.org/html/rfc4291#section-2.5.1
.. _WireGuard: https://www.wireguard.com
