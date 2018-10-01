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

Each interface can be configured with a description and address.

.. code-block:: sh

  set interfaces ethernet eth0 description 'OUTSIDE'
  set interfaces ethernet eth0 address 'dhcp'

Different network interfaces provide type-specific configuration. Ethernet
interfaces, for example, allow the configuration of speed and duplex.

Many services, such as network routing, firewall, and traffic policy also
maintain interface-specific configuration. These will be covered in their
respective sections.

Ethernet Interfaces
-------------------

Ethernet interfaces allow for the configuration of speed, duplex, and hw-id
(MAC address). Below is an example configuration:

.. code-block:: sh

  set interfaces ethernet eth1 address '192.168.0.1/24'
  set interfaces ethernet eth1 description 'INSIDE'
  set interfaces ethernet eth1 duplex 'auto'
  set interfaces ethernet eth1 speed 'auto'

Resulting in:

.. code-block:: sh

  ethernet eth1 {
      address 192.168.0.1/24
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

Resulting in:

.. code-block:: sh

  ethernet eth1 {
      address 192.168.0.1/24
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

VLAN interfaces are shown as <name>.<vlan-id>, e.g. eth1.100:

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

Example Result:

.. code-block:: sh

  bridge br100 {
      address 192.168.100.1/24
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

**NOTE:** Please use caution when introducing spanning-tree protocol on a
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

Results in:

.. code-block:: sh


  vyos@vyos# show interfaces vti
  vti vti0 {
      address 192.168.2.249/30
      description "Description"
  }

