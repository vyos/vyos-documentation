.. _dummy-interface:

#####
Dummy
#####

The dummy interface is really a little exotic, but rather useful nevertheless.
Dummy interfaces are much like the :ref:`loopback-interface` interface, except
you can have as many as you want.

.. note:: Dummy interfaces can be used as interfaces that always stay up (in
   the same fashion to loopbacks in Cisco IOS), or for testing purposes.

.. hint:: A Dummy interface is always up, thus it could be used for
   management traffic or as source/destination for and :abbr:`IGP (Interior
   Gateway Protocol)` like :ref:`routing-bgp` so your internal BGP link is not
   dependent on physical link states and multiple routes can be chosen to the
   destination. A :ref:`dummy-interface` Interface should always be preferred
   over a :ref:`loopback-interface` interface.

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-address.txt
   :var0: dummy
   :var1: dum0

.. cmdinclude:: /_include/interface-description.txt
   :var0: dummy
   :var1: dum0

.. cmdinclude:: /_include/interface-disable.txt
   :var0: dummy
   :var1: dum0

.. cmdinclude:: /_include/interface-vrf.txt
   :var0: dummy
   :var1: dum0

*********
Operation
*********

.. opcmd:: show interfaces dummy

   Show brief interface information.information

   .. code-block:: none

     vyos@vyos:~$ show interfaces dummy
     Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
     Interface        IP Address                        S/L  Description
     ---------        ----------                        ---  -----------
     dum0             172.18.254.201/32                 u/u

.. opcmd:: show interfaces dummy <interface>

   Show detailed information on given `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth0
     dum0: <BROADCAST,NOARP,UP,LOWER_UP> mtu 1500 qdisc noqueue state UNKNOWN group default qlen 1000
         link/ether 26:7c:8e:bc:fc:f5 brd ff:ff:ff:ff:ff:ff
         inet 172.18.254.201/32 scope global dum0
            valid_lft forever preferred_lft forever
         inet6 fe80::247c:8eff:febc:fcf5/64 scope link
            valid_lft forever preferred_lft forever

         RX:  bytes    packets     errors    dropped    overrun      mcast
                  0          0          0          0          0          0
         TX:  bytes    packets     errors    dropped    carrier collisions
            1369707       4267          0          0          0          0


