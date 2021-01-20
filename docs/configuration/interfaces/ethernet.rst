
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

.. _pppoe:


PPPoE
=====

There are two main ways to setup VyOS to connect over a PPPoE internet connection. This is due to most ISPs (Internet Service Providers) providing a DSL modem that is also a wireless router.

**First Method:** (Common for Homes)

In this method, the DSL Modem/Router connects to the ISP for you with your credentials preprogrammed into the device.  This gives you an RFC1918_ address, such as 192.168.1.0/24 by default.

For a simple home network using just the ISP's equipment, this is usually desirable.  But if you want to run VyOS as your firewall and router, this will result in having a double NAT and firewall setup. This results in a few extra layers of complexity, particularly if you use some NAT or tunnel features.

**Second Method:** (Common for Businesses)

In order to have full control and make use of multiple static public IP addresses, your VyOS will have to initiate the PPPoE connection and control it.
In order for this method to work, you will have to figure out how to make your DSL Modem/Router switch into a Bridged Mode so it only acts as a DSL Transceiver device to connect between the Ethernet link of your VyOS and the phone cable.
Once your DSL Transceiver is in Bridge Mode, you should get no IP address from it.
Please make sure you connect to the Ethernet Port 1 if your DSL Transeiver has a switch, as some of them only work this way.
Once you have an Ethernet device connected, i.e. eth0, then you can configure it to open the PPPoE session for you and your DSL Transceiver (Modem/Router) just acts to translate your messages in a way that vDSL/aDSL understands.

**Here is an example configuration:**

.. code-block:: none

  set interface ethernet eth0 description "DSL Modem"
  set interface ethernet eth0 duplex auto
  set interface ethernet eth0 smp_affinity auto
  set interface ethernet eth0 speed auto
  set interface ethernet eth0 pppoe 0 default-route auto
  set interface ethernet eth0 pppoe 0 mtu 1492
  set interface ethernet eth0 pppoe 0 name-server auto
  set interface ethernet eth0 pppoe 0 user-id <PPPoE Username>
  set interface ethernet eth0 pppoe 0 password <PPPoE Password>


* You should add a firewall to your configuration above as well by assigning it to the pppoe0 itself as shown here:

.. code-block:: none

  set interface ethernet eth0 pppoe 0 firewall in name NET-IN
  set interface ethernet eth0 pppoe 0 firewall local name NET-LOCAL
  set interface ethernet eth0 pppoe 0 firewall out name NET-OUT

* You need your PPPoE credentials from your DSL ISP in order to configure this. The usual username is in the form of name@host.net but may vary depending on ISP.
* The largest MTU size you can use with DSL is 1492 due to PPPoE overhead. If you are switching from a DHCP based ISP like cable then be aware that things like VPN links may need to have their MTU sizes adjusted to work within this limit.
* With the ``default-route`` option set to ``auto``, VyOS will only add the Default Gateway you receive from your DSL ISP to the routing table if you have no other WAN connections. If you wish to use a Dual WAN connection, change the ``default-route`` option to ``force``.

Handling and troubleshooting
----------------------------

You can test connecting and disconnecting with the below commands:

.. code-block:: none

  disconnect interface 0
  connect interface 0


You can check the PPPoE connection logs with the following:

This command shows the current statistics, status and some of the settings (i.e. MTU) for the current connection on pppoe0.

.. code-block:: none

  show interfaces pppoe 0

This command shows the entire log for the PPPoE connection starting with the oldest data. Scroll down with the <space> key to reach the end where the current data is.

.. code-block:: none

  show interfaces pppoe 0 log


This command shows the same log as without the 'tail' option but only starts with the last few lines and continues to show added lines until you exit with ``Ctrl + x``

.. code-block:: none

  show interfaces pppoe 0 log tail

.. _RFC1918: https://tools.ietf.org/html/rfc1918
