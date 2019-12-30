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

Configuration
=============

Address
-------

.. cfgcmd:: set interfaces loopback lo address <address>

   Configure Loopback interface `lo` with one or more interface addresses.
   Address can be specified multiple times as IPv4 and/or IPv6 address, e.g.
   192.0.2.1/24 and/or 2001:db8::1/64.

Link Administration
-------------------

.. cfgcmd:: set interfaces loopback lo description <description>

   Assign given `<description>` to interface `lo`. Description will also be
   passed to SNMP monitoring systems.

Operation
=========

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

   Show detailed information on given loopback interface `lo`.

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth0
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
