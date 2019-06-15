.. _network-interfaces:

Network Interfaces
==================

Configured interfaces on a VyOS system can be displayed using the
`show interfaces` command.

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


.. toctree::
   :maxdepth: 2
   :hidden:

   addresses
   dummy
   ethernet
   l2tpv3
   pppoe
   wireless
   bridging
   bonding
   tunnel
   vlan
   qinq
   vxlan
