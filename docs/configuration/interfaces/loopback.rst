:lastproofread: 2023-01-20

.. _loopback-interface:

########
Loopback
########

The loopback networking interface is a virtual network device implemented
entirely in software. All traffic sent to it "loops back" and just targets
services on your local machine.

.. note:: There can only be one loopback ``lo`` interface on the system. If
   you need multiple interfaces, please use the :ref:`dummy-interface`
   interface type.

.. hint:: A loopback interface is always up, thus it could be used for
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
   :var0: loopback
   :var1: lo

.. cmdinclude:: /_include/interface-description.txt
   :var0: loopback
   :var1: lo

*********
Operation
*********

.. opcmd:: show interfaces loopback

   Show brief interface information.

   .. code-block:: none

     vyos@vyos:~$ show interfaces loopback
     Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
     Interface        IP Address                        S/L  Description
     ---------        ----------                        ---  -----------
     lo               127.0.0.1/8                       u/u
                      ::1/128

.. opcmd:: show interfaces loopback lo

   Show detailed information on the given loopback interface `lo`.

   .. code-block:: none

     vyos@vyos:~$ show interfaces loopback lo
     lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
         link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
         inet 127.0.0.1/8 scope host lo
            valid_lft forever preferred_lft forever
         inet6 ::1/128 scope host
            valid_lft forever preferred_lft forever

         RX:  bytes    packets     errors    dropped    overrun      mcast
                300          6          0          0          0          0
         TX:  bytes    packets     errors    dropped    carrier collisions
                300          6          0          0          0          0
