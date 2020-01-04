.. _bridge-interface:

######
Bridge
######

A Bridge is a way to connect two Ethernet segments together in a protocol
independent way. Packets are forwarded based on Ethernet address, rather than
IP address (like a router). Since forwarding is done at Layer 2, all protocols
can go transparently through a bridge. The Linux bridge code implements a
subset of the ANSI/IEEE 802.1d standard.

Configuration
#############

Address
-------

.. cfgcmd:: set interfaces bridge <interface> address <address | dhcp | dhcpv6>

   Configure interface `<interface>` with one or more interface addresses.

   * **address** can be specified multiple times as IPv4 and/or IPv6 address,
     e.g. 192.0.2.1/24 and/or 2001:db8::1/64
   * **dhcp** interface address is received by DHCP from a DHCP server on this
     segment.
   * **dhcpv6** interface address is received by DHCPv6 from a DHCPv6 server on
     this segment.

   Example:

   .. code-block:: none

     set interfaces bridge br0 address 192.0.2.1/24
     set interfaces bridge br0 address 192.0.2.2/24
     set interfaces bridge br0 address 2001:db8::ffff/64
     set interfaces bridge br0 address 2001:db8:100::ffff/64


.. cfgcmd:: set interfaces bridge <interface> ipv6 address autoconf

   .. include:: common-ipv6-addr-autoconf.txt

.. cfgcmd:: set interfaces bridge <interface> ipv6 address eui64 <prefix>

   :abbr:`EUI-64 (64-Bit Extended Unique Identifier)` as specified in
   :rfc:`4291` allows a host to assign iteslf a unique 64-Bit IPv6 address.

   .. code-block:: none

     set interfaces bridge br0 ipv6 address eui64 2001:db8:beef::/64


.. cfgcmd:: set interfaces bridge <interface> aging <time>

   MAC address aging `<time`> in seconds (default: 300).


.. cfgcmd:: set interfaces bridge <interface> max-age <time>

   Bridge maximum aging `<time>` in seconds (default: 20).

   If a another bridge in the spanning tree does not send out a hello packet
   for a long period of time, it is assumed to be dead.


Link Administration
-------------------

.. cfgcmd:: set interfaces bridge <interface> description <description>

   Assign given `<description>` to interface. Description will also be passed
   to SNMP monitoring systems.


.. cfgcmd:: set interfaces bridge <interface> disable

   Disable given `<interface>`. It will be placed in administratively down
   (``A/D``) state.


.. cfgcmd:: set interfaces bridge <interface> disable-flow-control

   Disable Ethernet flow control (pause frames).


.. cfgcmd:: set interfaces bridge <interface> mac <mac-address>

   Configure user defined :abbr:`MAC (Media Access Control)` address on given
   `<interface>`.


.. cfgcmd:: set interfaces bridge <interface> igmp querier

   Enable IGMP querier


Member Interfaces
-----------------

.. cfgcmd:: set interfaces bridge <interface> member interface <member>

   Assign `<member>` interface to bridge `<interface>`. A completion helper
   will help you with all allowed interfaces which can be bridged. This includes
   :ref:`ethernet-interface`, :ref:`bond-interface`, :ref:`l2tpv3-interface`,
   :ref:`openvpn`, :ref:`vxlan-interface`, :ref:`wireless-interface`,
   :ref:`tunnel-interface` and :ref:`geneve-interface`.


.. cfgcmd:: set interfaces bridge <interface> member interface <member> priority <priority>

   Configure individual bridge port `<priority>`.

   Each bridge has a relative priority and cost. Each interface is associated
   with a port (number) in the STP code. Each has a priority and a cost, that
   is used to decide which is the shortest path to forward a packet. The lowest
   cost path is always used unless the other path is down. If you have multiple
   bridges and interfaces then you may need to adjust the priorities to achieve
   optimium performance.


.. cfgcmd:: set interfaces bridge <interface> member interface <member> cost <cost>

   Path `<cost>` value for Spanning Tree Protocol. Each interface in a bridge
   could have a different speed and this value is used when deciding which
   link to use. Faster interfaces should have lower costs.


STP Parameter
-------------

:abbr:`STP (Spanning Tree Protocol)` is a network protocol that builds a
loop-free logical topology for Ethernet networks. The basic function of STP is
to prevent bridge loops and the broadcast radiation that results from them.
Spanning tree also allows a network design to include backup links providing
fault tolerance if an active link fails.

.. cfgcmd:: set interfaces bridge <interface> stp

   Enable spanning tree protocol. STP is disabled by default.


.. cfgcmd:: set interfaces bridge <interface> forwarding-delay <delay>

   Spanning Tree Protocol forwarding `<delay>` in seconds (default: 15).

   Forwarding delay time is the time spent in each of the Listening and
   Learning states before the Forwarding state is entered. This delay is so
   that when a new bridge comes onto a busy network it looks at some traffic
   before participating.


.. cfgcmd:: set interfaces bridge <interface> hello-time <interval>

   Spanning Tree Protocol hello advertisement `<interval>` in seconds
   (default: 2).

   Periodically, a hello packet is sent out by the Root Bridge and the
   Designated Bridges. Hello packets are used to communicate information about
   the topology throughout the entire Bridged Local Area Network.


Exammple
--------

Creating a bridge interface is very simple. In this example we will have:

* A bridge named `br100`
* Member interfaces `eth1` and VLAN 10 on interface `eth2`
* Enable STP
* Bridge answers on IP address 192.0.2.1/24 and 2001:db8::ffff/64

.. code-block:: none

  set interfaces bridge br100 address 192.0.2.1/24
  set interfaces bridge br100 address 2001:db8::ffff/64
  set interfaces bridge br100 member interface eth1
  set interfaces bridge br100 member interface eth2.10
  set interfaces bridge br100 stp

This results in the active configuration:

.. code-block:: none

   vyos@vyos# show interfaces bridge br100
    address 192.0.2.1/24
    address 2001:db8::ffff/64
    member {
        interface eth1 {
        }
        interface eth2.10 {
        }
    }
    stp


Operation
=========

.. opcmd:: show bridge

   The `show bridge` operational command can be used to display configured
   bridges:

   .. code-block:: none

     vyos@vyos:~$ show bridge
     bridge name     bridge id               STP enabled     interfaces
     br100           8000.0050569d11df       yes             eth1
                                                           eth2.10

.. opcmd:: show bridge <name> spanning-tree

   Show bridge `<name>` STP configuration.

   .. code-block:: none

     vyos@vyos:~$ show bridge br100 spanning-tree
     br100
      bridge id              8000.0050569d11df
      designated root        8000.0050569d11df
      root port                 0                    path cost                  0
      max age                  20.00                 bridge max age            20.00
      hello time                2.00                 bridge hello time          2.00
      forward delay            14.00                 bridge forward delay      14.00
      ageing time             300.00
      hello timer               0.06                 tcn timer                  0.00
      topology change timer     0.00                 gc timer                 242.02
      flags

     eth1 (1)
      port id                8001                    state                  disabled
      designated root        8000.0050569d11df       path cost                100
      designated bridge      8000.0050569d11df       message age timer          0.00
      designated port        8001                    forward delay timer        0.00
      designated cost           0                    hold timer                 0.00
      flags

     eth2.10 (2)
      port id                8002                    state                  disabled
      designated root        8000.0050569d11df       path cost                100
      designated bridge      8000.0050569d11df       message age timer          0.00
      designated port        8002                    forward delay timer        0.00
      designated cost           0                    hold timer                 0.00

.. opcmd: show bridge <name> macs

   Show bridge Media Access Control (MAC) address table

   .. code-block:: none

     vyos@vyos:~$ show bridge br100 macs
     port no mac addr                is local?       ageing timer
       1     00:53:29:44:3b:19       yes                0.00
