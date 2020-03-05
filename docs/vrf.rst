.. _vrf:

###
VRF
###

:abbr:`VRF (Virtual Routing and Forwarding)` devices combined with ip rules
provides the ability to create virtual routing and forwarding domains (aka
VRFs, VRF-lite to be specific) in the Linux network stack. One use case is the
multi-tenancy problem where each tenant has their own unique routing tables and
in the very least need different default gateways.

Configuration
=============

A VRF device is created with an associated route table. Network interfaces are
then enslaved to a VRF device.

.. cfgcmd:: set vrf name <name>

   Create new VRF instance with `<name>`. The name is used when placing individual
   interfaces into the VRF.

.. cfgcmd:: set vrf name <name> table <id>

   Configure use routing table `<id>` used by VRF `<name>`.

   .. note:: A routing table ID can not be modified once it is assigned. It can
      only be changed by deleting and re-adding the VRF instance.


.. cfgcmd:: set vrf bind-to-all

   By default the scope of the port bindings for unbound sockets is limited to
   the default VRF. That is, it will not be matched by packets arriving on
   interfaces enslaved to a VRF and processes may bind to the same port if
   they bind to a VRF.

   TCP & UDP services running in the default VRF context (ie., not bound to any
   VRF device) can work across all VRF domains by enabling this option.

Operation
=========

.. opcmd:: show vrf

   List VRFs that have been created

   .. code-block:: none

     vyos@vyos:~$ show vrf

     interface         state    mac                flags
     ---------         -----    ---                -----
     bar               up       ee:c7:5b:fc:ae:f9  noarp,master,up,lower_up
     foo               up       ee:bb:a4:ac:cd:20  noarp,master,up,lower_up

.. opcmd:: show vrf <name>

   .. code-block:: none

     vyos@vyos:~$ show vrf name bar
     interface         state    mac                flags
     ---------         -----    ---                -----
     bar               up       ee:c7:5b:fc:ae:f9  noarp,master,up,lower_up

.. opcmd:: show ip route vrf <name>

   Display routing table used by VRF `<name>`

   .. code-block:: none

      vyos@vyos:~$ show ip route vrf blue
      Codes: K - kernel route, C - connected, S - static, R - RIP,
             O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
             T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
             F - PBR, f - OpenFabric,
             > - selected route, * - FIB route, q - queued route, r - rejected route

      VRF blue:
      K   0.0.0.0/0 [255/8192] unreachable (ICMP unreachable), 00:00:50
      C>* 192.0.2.0/24 is directly connected, dum1, 00:00:06

