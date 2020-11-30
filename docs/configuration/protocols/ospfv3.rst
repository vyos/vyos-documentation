OSPFv3 (IPv6)
#############

A typical configuration using 2 nodes.

**Node 1:**

.. code-block:: none

  set protocols ospfv3 area 0.0.0.0 interface eth1
  set protocols ospfv3 area 0.0.0.0 range 2001:db8:1::/64
  set protocols ospfv3 parameters router-id 192.168.1.1
  set protocols ospfv3 redistribute connected

**Node 2:**

.. code-block:: none

  set protocols ospfv3 area 0.0.0.0 interface eth1
  set protocols ospfv3 area 0.0.0.0 range 2001:db8:2::/64
  set protocols ospfv3 parameters router-id 192.168.2.1
  set protocols ospfv3 redistribute connected

.. note:: You can not easily redistribute IPv6 routes via OSPFv3 on a WireGuard
   interface link. This requires you to configure link-local addresses manually
   on the WireGuard interfaces, see :vytask:`T1483`.

Example configuration for WireGuard interfaces:

**Node 1**

.. code-block:: none

  set interfaces wireguard wg01 address 'fe80::216:3eff:fe51:fd8c/64'
  set interfaces wireguard wg01 address '192.168.0.1/24'
  set interfaces wireguard wg01 peer ospf02 allowed-ips '::/0'
  set interfaces wireguard wg01 peer ospf02 allowed-ips '0.0.0.0/0'
  set interfaces wireguard wg01 peer ospf02 endpoint '10.1.1.101:12345'
  set interfaces wireguard wg01 peer ospf02 pubkey 'ie3...='
  set interfaces wireguard wg01 port '12345'
  set protocols ospfv3 parameters router-id 192.168.1.1
  set protocols ospfv3 area 0.0.0.0 interface 'wg01'
  set protocols ospfv3 area 0.0.0.0 interface 'lo'

**Node 2**

.. code-block:: none

  set interfaces wireguard wg01 address 'fe80::216:3eff:fe0a:7ada/64'
  set interfaces wireguard wg01 address '192.168.0.2/24'
  set interfaces wireguard wg01 peer ospf01 allowed-ips '::/0'
  set interfaces wireguard wg01 peer ospf01 allowed-ips '0.0.0.0/0'
  set interfaces wireguard wg01 peer ospf01 endpoint '10.1.1.100:12345'
  set interfaces wireguard wg01 peer ospf01 pubkey 'NHI...='
  set interfaces wireguard wg01 port '12345'
  set protocols ospfv3 parameters router-id 192.168.1.2
  set protocols ospfv3 area 0.0.0.0 interface 'wg01'
  set protocols ospfv3 area 0.0.0.0 interface 'lo'

**Status**

.. code-block:: none

  vyos@ospf01:~$ sh ipv6 ospfv3 neighbor
  Neighbor ID     Pri    DeadTime    State/IfState         Duration I/F[State]
  192.168.0.2       1    00:00:37     Full/PointToPoint    00:18:03 wg01[PointToPoint]

  vyos@ospf02# run sh ipv6 ospfv3 neighbor
  Neighbor ID     Pri    DeadTime    State/IfState         Duration I/F[State]
  192.168.0.1       1    00:00:39     Full/PointToPoint    00:19:44 wg01[PointToPoint]

