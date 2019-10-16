.. _high-availability:

High availability
=================

VRRP (Virtual Redundancy Protocol) provides active/backup redundancy for routers. 
Every VRRP router has a physical IP/IPv6 address, and a virtual address.
On startup, routers elect the master, and the router with the highest priority becomes the master and assigns the virtual address to its interface.
All routers with lower priorities become backup routers. The master then starts sending keepalive packets to notify other routers that it's available.
If the master fails and stops sending keepalive packets, the router with the next highest priority becomes the new master and takes over the virtual address.

VRRP keepalive packets use multicast, and VRRP setups are limited to a single datalink layer segment.
You can setup multiple VRRP groups (also called virtual routers). Virtual routers are identified by a VRID (Virtual Router IDentifier).
If you setup multiple groups on the same interface, their VRIDs must be unique, but it's possible (even if not recommended for readability reasons) to use duplicate VRIDs on different interfaces.

Basic setup
-----------

VRRP groups are created with the ``set high-availability vrrp group $GROUP_NAME`` commands.
The required parameters are interface, vrid, and virtual-address.

minimal config

.. code-block:: sh

  set high-availability vrrp group Foo vrid 10
  set high-availability vrrp group Foo interface eth0
  set high-availability vrrp group Foo virtual-address 192.0.2.1/24

You can verify your VRRP group status with the operational mode ``run show vrrp`` command:

.. code-block:: sh

  vyos@vyos# run show vrrp 
  Name        Interface      VRID  State    Last Transition
  ----------  -----------  ------  -------  -----------------
  Foo         eth1             10  MASTER   2s

IPv6 support
------------

The ``virtual-address`` parameter can be either an IPv4 or IPv6 address, but you cannot mix IPv4 and IPv6 in the same group, and will need to create groups with different VRIDs specially for IPv4 and IPv6.

Disabling a VRRP group
----------------------

You can disable a VRRP group with ``disable`` option:

.. code-block:: sh

  set high-availability vrrp group Foo disable

A disabled group will be removed from the VRRP process and your router will not participate in VRRP for that VRID. It will disappear from operational mode commands output, rather than enter the backup state.

Setting VRRP group priority
---------------------------

VRRP priority can be set with ``priority`` option:

.. code-block:: sh

  set high-availability vrrp group Foo priority 200

The priority must be an integer number from 1 to 255. Higher priority value increases router's precedence in the master elections.

Sync groups
-----------

A sync group allows VRRP groups to transition together.  

.. code-block:: sh

    edit high-availability
    set sync-group MAIN member VLAN9
    set sync-group MAIN member VLAN20

In the following example, when VLAN9 transitions, VLAN20 will also transition:

.. code-block:: sh

    vrrp {
        group VLAN9 {
            interface eth0.9
            virtual-address 10.9.1.1/24
            priority 200
            vrid 9
        }
        group VLAN20 {
            interface eth0.20
            priority 200
            virtual-address 10.20.20.1/24
            vrid 20
        }
        sync-group MAIN {
            member VLAN20
            member VLAN9
        }
    }


.. warning:: All items in a sync group should be similarly configured.  If one VRRP group is set to a different premption delay or priority, it would result in an endless transition loop.


Preemption
----------

VRRP can use two modes: preemptive and non-preemptive. In the preemptive mode, if a router with a higher priority fails and then comes back, routers with lower priority will give up their master status. In non-preemptive mode, the newly elected master will keep the master status and the virtual address indefinitely.

By default VRRP uses preemption. You can disable it with the "no-preempt" option:

.. code-block:: sh

  set high-availability vrrp group Foo no-preempt

You can also configure the time interval for preemption with the "preempt-delay" option. For example, to set the higher priority router to take over in 180 seconds, use:

.. code-block:: sh

  set high-availability vrrp group Foo preempt-delay 180

Unicast VRRP
------------

By default VRRP uses multicast packets. If your network does not support multicast for whatever reason, you can make VRRP use unicast communication instead.

.. code-block:: sh

  set high-availability vrrp group Foo peer-address 192.0.2.10
  set high-availability vrrp group Foo hello-source-address 192.0.2.15

Scripting
---------

VRRP functionality can be extended with scripts. VyOS supports two kinds of scripts: health check scripts and transition scripts. Health check scripts execute custom checks in addition to the master router reachability.
Transition scripts are executed when VRRP state changes from master to backup or fault and vice versa and can be used to enable or disable certain services, for example.

Health check scripts
^^^^^^^^^^^^^^^^^^^^

This setup will make the VRRP process execute the ``/config/scripts/vrrp-check.sh script`` every 60 seconds, and transition the group to the fault state if it fails (i.e. exits with non-zero status) three times:

.. code-block:: sh

  set high-availability vrrp group Foo health-check script /config/scripts/vrrp-check.sh
  set high-availability vrrp group Foo health-check interval 60
  set high-availability vrrp group Foo health-check failure-count 3

Transition scripts
^^^^^^^^^^^^^^^^^^

Transition scripts can help you implement various fixups, such as starting and stopping services, or even modifying the VyOS config on VRRP transition.
This setup will make the VRRP process execute the ``/config/scripts/vrrp-fail.sh`` with argument ``Foo`` when VRRP fails, and the ``/config/scripts/vrrp-master.sh`` when the router becomes the master:

.. code-block:: sh

  set high-availability vrrp group Foo transition-script backup "/config/scripts/vrrp-fail.sh Foo"
  set high-availability vrrp group Foo transition-script fault "/config/scripts/vrrp-fail.sh Foo"
  set high-availability vrrp group Foo transition-script master "/config/scripts/vrrp-master.sh Foo"
