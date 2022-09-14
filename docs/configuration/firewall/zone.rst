:lastproofread: 2022-09-14

.. _firewall-zone:

###################
Zone Based Firewall
###################

In zone-based policy, interfaces are assigned to zones, and inspection policy
is applied to traffic moving between the zones and acted on according to
firewall rules. A Zone is a group of interfaces that have similar functions or
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

An basic introduction to zone-based firewalls can be found `here
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

.. cfgcmd:: set firewall zone <name> default-action [drop | reject]

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

