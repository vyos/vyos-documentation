:lastproofread: 2022-11-25

.. _virtual-ethernet:

################
Virtual Ethernet
################

The veth devices are virtual Ethernet devices. They can act as tunnels between
network namespaces to create a bridge to a physical network device in another
namespace or VRF, but can also be used as standalone network devices.

.. note:: veth interfaces need to be created in pairs - it's called the peer name

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-address-with-dhcp.txt
   :var0: virtual-ethernet
   :var1: veth0

.. cmdinclude:: /_include/interface-description.txt
   :var0: virtual-ethernet
   :var1: veth0
VLAN
====

Regular VLANs (802.1q)
----------------------
.. cmdinclude:: /_include/interface-vlan-8021q.txt
   :var0: virtual-ethernet
   :var1: veth0

QinQ (802.1ad)
--------------

.. cmdinclude:: /_include/interface-vlan-8021ad.txt
   :var0: virtual-ethernet
   :var1: veth0

.. cmdinclude:: /_include/interface-disable.txt
   :var0: virtual-ethernet
   :var1: veth0

.. cmdinclude:: /_include/interface-vrf.txt
   :var0: virtual-ethernet
   :var1: veth0

*********
Operation
*********

.. opcmd:: show interfaces virtual-ethernet

   Show brief interface information.

   .. code-block:: none

     vyos@vyos:~$ show interfaces virtual-ethernet
     Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
     Interface        IP Address                        S/L  Description
     ---------        ----------                        ---  -----------
     veth10           100.64.0.0/31                     u/u
     veth11           100.64.0.1/31                     u/u

.. opcmd:: show interfaces virtual-ethernet <interface>

   Show detailed information on given `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces virtual-ethernet veth11
     10: veth11@veth10: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master red state UP group default qlen 1000
         link/ether b2:7b:df:47:e9:11 brd ff:ff:ff:ff:ff:ff
         inet 100.64.0.1/31 scope global veth11
            valid_lft forever preferred_lft forever
         inet6 fe80::b07b:dfff:fe47:e911/64 scope link
            valid_lft forever preferred_lft forever


         RX:  bytes    packets     errors    dropped    overrun      mcast
                  0          0          0          0          0          0
         TX:  bytes    packets     errors    dropped    carrier collisions
            1369707       4267          0          0          0          0

*******
Example
*******

Interconnect the global VRF with vrf "red" using the veth10 <-> veth 11 pair

.. code-block:: none

  set interfaces virtual-ethernet veth10 address '100.64.0.0/31'
  set interfaces virtual-ethernet veth10 peer-name 'veth11'
  set interfaces virtual-ethernet veth11 address '100.64.0.1/31'
  set interfaces virtual-ethernet veth11 peer-name 'veth10'
  set interfaces virtual-ethernet veth11 vrf 'red'
  set vrf name red table '1000'

  vyos@vyos:~$ ping 100.64.0.1
  PING 100.64.0.1 (100.64.0.1) 56(84) bytes of data.
  64 bytes from 100.64.0.1: icmp_seq=1 ttl=64 time=0.080 ms
  64 bytes from 100.64.0.1: icmp_seq=2 ttl=64 time=0.119 ms


