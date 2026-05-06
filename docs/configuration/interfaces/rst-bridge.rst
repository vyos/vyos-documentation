:lastproofread: 2021-06-30

.. _bridge-interface:

######
Bridge
######

A Bridge is a way to connect two Ethernet segments together in a
protocol independent way. Packets are forwarded based on Ethernet
address, rather than IP address (like a router). Since forwarding is
done at Layer 2, all protocols can go transparently through a bridge.
The Linux bridge code implements a subset of the ANSI/IEEE 802.1d
standard.

.. note:: Spanning Tree Protocol is not enabled by default in VyOS.
   :ref:`stp` can be easily enabled if needed.

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-common-with-dhcp.txt
   :var0: bridge
   :var1: br0

Member Interfaces
=================

.. cfgcmd:: set interfaces bridge <interface> member interface <member>

   Assign `<member>` interface to bridge `<interface>`. A completion
   helper will help you with all allowed interfaces which can be
   bridged. This includes :ref:`ethernet-interface`,
   :ref:`bond-interface`, :ref:`l2tpv3-interface`, :ref:`openvpn`,
   :ref:`vxlan-interface`, :ref:`wireless-interface`,
   :ref:`tunnel-interface` and :ref:`geneve-interface`.


.. cfgcmd:: set interfaces bridge <interface> member interface <member>
   priority <priority>

   Configure individual bridge port `<priority>`.

   Each bridge has a relative priority and cost. Each interface is
   associated with a port (number) in the STP code. Each has a priority
   and a cost, that is used to decide which is the shortest path to
   forward a packet. The lowest cost path is always used unless the
   other path is down. If you have multiple bridges and interfaces then
   you may need to adjust the priorities to achieve optimum
   performance.


.. cfgcmd:: set interfaces bridge <interface> member interface <member>
   cost <cost>

   Path `<cost>` value for Spanning Tree Protocol. Each interface in a
   bridge could have a different speed and this value is used when
   deciding which link to use. Faster interfaces should have lower
   costs.

Bridge Options
==============

.. cfgcmd:: set interfaces bridge <interface> aging <time>

   MAC address aging `<time`> in seconds (default: 300).

.. cfgcmd:: set interfaces bridge <interface> max-age <time>

   Bridge maximum aging `<time>` in seconds (default: 20).

   If an another bridge in the spanning tree does not send out a hello
   packet for a long period of time, it is assumed to be dead.

.. cfgcmd:: set interfaces bridge <interface> igmp querier

   Enable IGMP and MLD querier.

.. cfgcmd:: set interfaces bridge <interface> igmp snooping

   Enable IGMP and MLD snooping.

.. _stp:

STP Parameter
-------------

:abbr:`STP (Spanning Tree Protocol)` is a network protocol that builds a
loop-free logical topology for Ethernet networks. The basic function of
STP is to prevent bridge loops and the broadcast radiation that results
from them. Spanning tree also allows a network design to include backup
links providing fault tolerance if an active link fails.

.. cfgcmd:: set interfaces bridge <interface> stp

   Enable spanning tree protocol. STP is disabled by default.


.. cfgcmd:: set interfaces bridge <interface> forwarding-delay <delay>

   Spanning Tree Protocol forwarding `<delay>` in seconds (default: 15).

   The forwarding delay time is the time spent in each of the listening and
   learning states before the Forwarding state is entered. This delay is
   so that when a new bridge comes onto a busy network it looks at some
   traffic before participating.


.. cfgcmd:: set interfaces bridge <interface> hello-time <interval>

   Spanning Tree Protocol hello advertisement `<interval>` in seconds
   (default: 2).

   Periodically, a hello packet is sent out by the Root Bridge and the
   Designated Bridges. Hello packets are used to communicate information
   about the topology throughout the entire Bridged Local Area Network.

VLAN
====

Enable VLAN-Aware Bridge
------------------------

.. cfgcmd:: set interfaces bridge <interface> enable-vlan

   To activate the VLAN aware bridge, you must activate this setting to use VLAN
   settings for the bridge

.. cfgcmd:: set interfaces bridge <interface> protocol <802.1ad|802.1q>

   Define used ethertype of bridge interface.

   Ethertype ``0x8100`` is used for ``802.1q`` and ethertype ``0x88a8`` is used
   for ``802.1ad``.

   The default is ``802.1q``.

VLAN Options
------------

.. note:: It is not valid to use the `vif 1` option for VLAN aware bridges
   because VLAN aware bridges assume that all unlabeled packets belong to
   the default VLAN 1 member and that the VLAN ID of the bridge's parent
   interface is always 1

.. cmdinclude:: /_include/interface-vlan-8021q.txt
   :var0: bridge
   :var1: br0

.. cfgcmd:: set interfaces bridge <interface> member interface <member>
   native-vlan <vlan-id>

   Set the native VLAN ID flag of the interface. When a data packet without a
   VLAN tag enters the port, the data packet will be forced to add a tag of a
   specific vlan id. When the vlan id flag flows out, the tag of the vlan id
   will be stripped

   Example: Set `eth0` member port to be native VLAN 2

   .. code-block:: none

     set interfaces bridge br1 member interface eth0 native-vlan 2

.. cfgcmd:: set interfaces bridge <interface> member interface <member>
   allowed-vlan <vlan-id>

   Allows specific VLAN IDs to pass through the bridge member interface. This
   can either be an individual VLAN id or a range of VLAN ids delimited by a
   hyphen.

   Example: Set `eth0` member port to be allowed VLAN 4

   .. code-block:: none

     set interfaces bridge br1 member interface eth0 allowed-vlan 4

   Example: Set `eth0` member port to be allowed VLAN 6-8

   .. code-block:: none

     set interfaces bridge br1 member interface eth0 allowed-vlan 6-8

Port Mirror (SPAN)
==================
.. cmdinclude:: ../../_include/interface-mirror.txt
   :var0: bridge
   :var1: br1
   :var2: eth3

********
Examples
********

Create a basic bridge
=====================

Creating a bridge interface is very simple. In this example, we will
have:

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


Using VLAN aware Bridge
=======================

An example of creating a VLAN-aware bridge is as follows:

* A bridge named `br100`
* The member interface `eth1` is a trunk that allows VLAN 10 to pass
* VLAN 10 on member interface `eth2` (ACCESS mode)
* Enable STP
* Bridge answers on IP address 192.0.2.1/24 and 2001:db8::ffff/64

.. code-block:: none

  set interfaces bridge br100 enable-vlan
  set interfaces bridge br100 member interface eth1 allowed-vlan 10
  set interfaces bridge br100 member interface eth2 native-vlan 10
  set interfaces bridge br100 vif 10 address 192.0.2.1/24
  set interfaces bridge br100 vif 10 address 2001:db8::ffff/64
  set interfaces bridge br100 stp

This results in the active configuration:

.. code-block:: none

   vyos@vyos# show interfaces bridge br100
    enable-vlan
    member {
        interface eth1 {
            allowed-vlan 10
        }
        interface eth2 {
            native-vlan 10
        }
    }
    stp
    vif 10 {
        address 192.0.2.1/24
        address 2001:db8::ffff/64
    }


Using the operation mode command to view Bridge Information
===========================================================

.. opcmd:: show bridge

   The `show bridge` operational command can be used to display
   configured bridges:

   .. code-block:: none

     vyos@vyos:~$ show bridge
     3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 master br0 state forwarding
     priority 32 cost 100
     4: eth2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 master br0 state forwarding
     priority 32 cost 100

.. opcmd:: show bridge <name> fdb

   Show bridge `<name>` fdb displays the current forwarding table:

   .. code-block:: none

     vyos@vyos:~$ show bridge br0 fdb
     50:00:00:08:00:01 dev eth1 vlan 20 master br0 permanent
     50:00:00:08:00:01 dev eth1 vlan 10 master br0 permanent
     50:00:00:08:00:01 dev eth1 master br0 permanent
     33:33:00:00:00:01 dev eth1 self permanent
     33:33:00:00:00:02 dev eth1 self permanent
     01:00:5e:00:00:01 dev eth1 self permanent
     50:00:00:08:00:02 dev eth2 vlan 20 master br0 permanent
     50:00:00:08:00:02 dev eth2 vlan 10 master br0 permanent
     50:00:00:08:00:02 dev eth2 master br0 permanent
     33:33:00:00:00:01 dev eth2 self permanent
     33:33:00:00:00:02 dev eth2 self permanent
     01:00:5e:00:00:01 dev eth2 self permanent
     33:33:00:00:00:01 dev br0 self permanent
     33:33:00:00:00:02 dev br0 self permanent
     33:33:ff:08:00:01 dev br0 self permanent
     01:00:5e:00:00:6a dev br0 self permanent
     33:33:00:00:00:6a dev br0 self permanent
     01:00:5e:00:00:01 dev br0 self permanent
     33:33:ff:00:00:00 dev br0 self permanent

.. opcmd:: show bridge <name> mdb

   Show bridge `<name>` mdb displays the current multicast group membership
   table.The table is populated by IGMP and MLD snooping in the bridge driver
   automatically.

   .. code-block:: none

     vyos@vyos:~$ show bridge br0 mdb
     dev br0 port br0 grp ff02::1:ff00:0 temp vid 1
     dev br0 port br0 grp ff02::2 temp vid 1
     dev br0 port br0 grp ff02::1:ff08:1 temp vid 1
     dev br0 port br0 grp ff02::6a temp vid 1

.. opcmd: show bridge <name> macs

   Show bridge Media Access Control (MAC) address table

   .. code-block:: none

     vyos@vyos:~$ show bridge br100 macs
     port no mac addr                is local?       ageing timer
       1     00:53:29:44:3b:19       yes                0.00
