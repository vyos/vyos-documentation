
Ethernet Interfaces
-------------------
.. _interfaces-ethernet:

Ethernet interfaces allow for the configuration of speed, duplex, and hw-id
(MAC address). Below is an example configuration:

.. code-block:: none

  set interfaces ethernet eth1 address '192.168.0.1/24'
  set interfaces ethernet eth1 address '2001:db8:1::ffff/64'
  set interfaces ethernet eth1 description 'INSIDE'
  set interfaces ethernet eth1 duplex 'auto'
  set interfaces ethernet eth1 speed 'auto'

Resulting in:

.. code-block:: none

  ethernet eth1 {
      address 192.168.0.1/24
      address 2001:db8:1::ffff/64
      description INSIDE
      duplex auto
      hw-id 00:0c:29:44:3b:19
      smp_affinity auto
      speed auto
  }

In addition, Ethernet interfaces provide the extended operational commands:

* `show interfaces ethernet <name> physical`
* `show interfaces ethernet <name> statistics` 

Statistics available are driver dependent.

.. code-block:: none

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
.. _interfaces-vlan:

802.1Q VLAN interfaces are represented as virtual sub-interfaces in VyOS. The
term used for this is `vif`. Configuration of a tagged sub-interface is
accomplished using the configuration command
`set interfaces ethernet <name> vif <vlan-id>`.

.. code-block:: none

  set interfaces ethernet eth1 vif 100 description 'VLAN 100'
  set interfaces ethernet eth1 vif 100 address '192.168.100.1/24'
  set interfaces ethernet eth1 vif 100 address '2001:db8:100::1/64'

Resulting in:

.. code-block:: none

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

.. code-block:: none

  vyos@vyos:~$ show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             172.16.51.129/24                  u/u  OUTSIDE
  eth1             192.168.0.1/24                    u/u  INSIDE
  eth1.100         192.168.100.1/24                  u/u  VLAN 100
  lo               127.0.0.1/8                       u/u
                   ::1/128



.. _interfaces-qinq:

QinQ
----

QinQ (802.1ad_) — allows multiple VLAN tags to be inserted into a single frame.

QinQ can be used to tunnel vlans in a vlan.

**vif-s** and **vif-c** stand for the ethertype tags that get set:

The inner tag is the tag which is closest to the payload portion of the frame; it is officially called C-TAG (Customer tag, with ethertype 0x8100).
The outer tag is the one closer/closest to the Ethernet header; its name is S-TAG (Service tag, ethertype 0x88a8).

Configuration commands:

.. code-block:: none

  interfaces
      ethernet <eth[0-999]>
          address <ipv4>
          address <ipv6>
          description <txt>
          disable
          ip
              <usual IP options>
          ipv6
              <usual IPv6 options>
          vif-s <[0-4096]>
              address <ipv4>
              address <ipv6>
              description <txt>
              disable
              ip
                  <usual IP options>
              ipv6
                  <usual IPv6 options>
              vif-c <[0-4096]>
                  address <ipv4>
                  address <ipv6>
                  description <txt>
                  disable
                  ip
                      <usual IP options>
                  ipv6
                      <usual IPv6 options>


Example:

.. code-block:: none

  set interfaces ethernet eth0 vif-s 333
  set interfaces ethernet eth0 vif-s 333 address 192.0.2.10/32
  set interfaces ethernet eth0 vif-s 333 vif-c 777
  set interfaces ethernet eth0 vif-s 333 vif-c 777 address 10.10.10.10/24

.. _802.1ad: https://en.wikipedia.org/wiki/IEEE_802.1ad