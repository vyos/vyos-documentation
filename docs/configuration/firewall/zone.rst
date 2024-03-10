:lastproofread: 2023-11-01

.. _firewall-zone:

###################
Zone Based Firewall
###################

********
Overview
********

.. note:: Starting from VyOS 1.4-rolling-202308040557, a new firewall
   structure can be found on all vyos instalations. Zone based firewall was
   removed in that version, but re introduced in VyOS 1.4 and 1.5. All
   versions built after 2023-10-22 has this feature.
   Documentation for most of the new firewall CLI can be
   found in the `firewall
   <https://docs.vyos.io/en/latest/configuration/firewall/general.html>`_
   chapter. The legacy firewall is still available for versions before
   1.4-rolling-202308040557 and can be found in the
   :doc:`legacy firewall configuration </configuration/firewall/general-legacy>`
   chapter.

In this section there's useful information of all firewall configuration that
is needed for zone-based firewall.
Configuration commands covered in this section:

.. cfgcmd:: set firewall zone ...

From main structure defined in
:doc:`Firewall Overview</configuration/firewall/index>`
in this section you can find detailed information only for the next part
of the general structure:

.. code-block:: none

   - set firewall
       * zone
            - custom_zone_name
               + ...

In zone-based policy, interfaces are assigned to zones, and inspection policy
is applied to traffic moving between the zones and acted on according to
firewall rules. A zone is a group of interfaces that have similar functions or
features. It establishes the security borders of a network. A zone defines a
boundary where traffic is subjected to policy restrictions as it crosses to
another region of a network.

Key Points:

* A zone must be configured before an interface is assigned to it and an
  interface can be assigned to only a single zone.
* All traffic to and from an interface within a zone is permitted.
* All traffic between zones is affected by existing policies
* Traffic cannot flow between zone member interface and any interface that is
  not a zone member.
* You need 2 separate firewalls to define traffic: one for each direction.

.. note:: In :vytask:`T2199` the syntax of the zone configuration was changed.
   The zone configuration moved from ``zone-policy zone <name>`` to ``firewall
   zone <name>``.

*************
Configuration
*************

As an alternative to applying policy to an interface directly, a zone-based
firewall can be created to simplify configuration when multiple interfaces
belong to the same security zone. Instead of applying rule-sets to interfaces,
they are applied to source zone-destination zone pairs.

A basic introduction to zone-based firewalls can be found `here
<https://support.vyos.io/en/kb/articles/a-primer-to-zone-based-firewall>`_,
and an example at :ref:`examples-zone-policy`.

Define a Zone
=============

To define a zone setup either one with interfaces or a local zone.

.. cfgcmd:: set firewall zone <name> interface <interface>

   Set interfaces to a zone. A zone can have multiple interfaces.
   But an interface can only be a member in one zone.

.. cfgcmd:: set firewall zone <name> local-zone

   Define the zone as a local zone. A local zone has no interfaces and
   will be applied to the router itself.

.. cfgcmd:: set firewall zone <name> default-action [drop | reject]

   Change the default-action with this setting.

.. cfgcmd:: set firewall zone <name> description

   Set a meaningful description.

Applying a Rule-Set to a Zone
=============================

Before you are able to apply a rule-set to a zone you have to create the zones
first.

It helps to think of the syntax as: (see below). The 'rule-set' should be
written from the perspective of: *Source Zone*-to->*Destination Zone*

.. cfgcmd::  set firewall zone <Destination Zone> from <Source Zone>
   firewall name <rule-set>

.. cfgcmd::  set firewall zone <name> from <name> firewall name
   <rule-set>

.. cfgcmd::  set firewall zone <name> from <name> firewall ipv6-name
   <rule-set>

   You apply a rule-set always to a zone from an other zone, it is recommended
   to create one rule-set for each zone pair.

   .. code-block:: none

      set firewall zone DMZ from LAN firewall name LANv4-to-DMZv4
      set firewall zone LAN from DMZ firewall name DMZv4-to-LANv4

**************
Operation-mode
**************

.. opcmd:: show firewall zone-policy

   This will show you a basic summary of zones configuration.

   .. code-block:: none

      vyos@vyos:~$ show firewall zone-policy
      Zone    Interfaces    From Zone    Firewall IPv4    Firewall IPv6
      ------  ------------  -----------  ---------------  ---------------
      LAN     eth1          WAN          WAN_to_LAN
              eth2
      LOCAL   LOCAL         LAN          LAN_to_LOCAL
                            WAN          WAN_to_LOCAL     WAN_to_LOCAL_v6
      WAN     eth3          LAN          LAN_to_WAN
              eth0          LOCAL        LOCAL_to_WAN
      vyos@vyos:~$

.. opcmd:: show firewall zone-policy zone <zone>

   This will show you a basic summary of a particular zone.

   .. code-block:: none

      vyos@vyos:~$ show firewall zone-policy zone WAN
      Zone    Interfaces    From Zone    Firewall IPv4    Firewall IPv6
      ------  ------------  -----------  ---------------  ---------------
      WAN     eth3          LAN          LAN_to_WAN
              eth0          LOCAL        LOCAL_to_WAN
      vyos@vyos:~$ show firewall zone-policy zone LOCAL
      Zone    Interfaces    From Zone    Firewall IPv4    Firewall IPv6
      ------  ------------  -----------  ---------------  ---------------
      LOCAL   LOCAL         LAN          LAN_to_LOCAL
                            WAN          WAN_to_LOCAL     WAN_to_LOCAL_v6
      vyos@vyos:~$
