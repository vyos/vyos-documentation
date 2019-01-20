
Ethernet Interfaces
-------------------
.. _interfaces-ethernet:

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
`show interfaces ethernet <name> physical` and
`show interfaces ethernet <name> statistics`. Statistics available are driver
dependent.

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
