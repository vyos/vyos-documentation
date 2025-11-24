:lastproofread: 2024-07-03

.. _firewall-zone:

###################
Zone Based Firewall
###################

********
Overview
********

.. note:: Starting from VyOS 1.4-rolling-202308040557, a new firewall
   structure can be found on all VyOS installations. The Zone based firewall
   was removed in that version, but re introduced in VyOS 1.4 and 1.5. All
   versions built after 2023-10-22 have this feature.
   Documentation for most of the new firewall CLI can be
   found in the `firewall
   <https://docs.vyos.io/en/latest/configuration/firewall/general.html>`_
   chapter.

In this section there's useful information on all firewall configuration that
is needed for the zone-based firewall.
Configuration commands covered in this section:

.. cfgcmd:: set firewall zone ...

From the main structure defined in
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
* Traffic cannot flow between a zone member interface and any interface that is
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
they are applied to source-destination zone pairs.

A basic introduction to zone-based firewalls can be found `here
<https://support.vyos.io/en/kb/articles/a-primer-to-zone-based-firewall>`_,
and an example at :ref:`examples-zone-policy`.

The following steps are required to create a zone-based firewall:

1. Define both the source and destination zones
2. Define the rule-set
3. Apply the rule-set to the zones

Define a Zone
=============

To define a zone setup either one with interfaces or the local zone.

.. cfgcmd:: set firewall zone <name> interface <interface>

   Assign interfaces as a member of a zone.

   .. note::

      * An interface can only be a member of one zone.
      * A zone can have multiple interfaces, with traffic between interfaces in
        the same zone subject to the intra-zone-filtering policy (allowed by
        default).

.. cfgcmd:: set firewall zone <name> local-zone

   Define the zone as the local zone, for traffic originating from and destined
   to the router itself.

   .. note::

      * A local zone cannot have any member interfaces
      * There cannot be multiple local zones

.. cfgcmd:: set firewall zone <name> default-action [drop | reject]

   Change the zone default-action, which applies to traffic destined to this
   zone that doesn't match any of the source zone rulesets applied.

.. cfgcmd:: set firewall zone <name> default-log

   Enable logging of packets that hit this zone's default-action (disabled by
   default).

.. cfgcmd:: set firewall zone <name> description

   Set a meaningful description.

Defining a Rule-Set
=============================

Zone-based firewall rule-sets are for traffic from a *Source Zone* to a
*Destination Zone*.

The rule-sets are created as a custom firewall chain using the commands below
(refer to the firewall IPv4/IPv6 sections for the full syntax):

* For :ref:`IPv4<configuration/firewall/ipv4:Firewall - IPv4 Rules>`:
  ``set firewall ipv4 name <name> ...``
* For :ref:`IPv6<configuration/firewall/ipv6:Firewall - IPv6 Rules>`:
  ``set firewall ipv6 name <name> ...``

It can be helpful to name the rule-sets in the format
``<Sourze Zone>-<Destination Zone>-<v4 | v6>`` to make them easily identifiable.

Applying a Rule-Set to a Zone
=============================

Once a rule-set has been defined, it can then be applied to the source and
destination zones. The configuration syntax is anchored on the destination
zone, with each of the source zone rule-sets listed against the destination.

.. cfgcmd::  set firewall zone <Destination Zone> from <Source Zone>
   firewall name <ipv4-rule-set-name>

.. cfgcmd::  set firewall zone <Destination Zone> from <Source Zone>
   firewall ipv6-name <ipv6-rule-set-name>

It is recommended to create two rule-sets for each source-destination zone pair.

.. code-block:: none

   set firewall zone DMZ from LAN firewall name LAN-DMZ-v4
   set firewall zone LAN from DMZ firewall name DMZ-LAN-v4

Applying a Default Rule-Set to a Zone
=====================================

When a destination zone shares a common rule-set for multiple source zones or
a complex set of default policies are required, an optional default rule-set
can be applied. The default rule-set applies to all zones that do not have a
rule-set configured as defined in
:ref:`IPv4<configuration/firewall/zone:Applying a Rule-Set to a Zone>`

.. cfgcmd:: set firewall zone <Destination Zone> default-firewall name
   <ipv4-rule-set-name>

.. cfgcmd:: set firewall zone <Destination Zone> default-firewall ipv6-name
   <ipv6-rule-set-name>

**************
Operation-mode
**************

.. opcmd:: show firewall zone-policy

   This will show you a basic summary of the zone configuration.

   .. code-block:: none

      vyos@vyos:~$ show firewall zone-policy
      Zone    Interfaces    From Zone    Firewall IPv4    Firewall IPv6
      ------  ------------  -----------  ---------------  ---------------
      LAN     eth1          WAN          WAN-LAN-v4
              eth2
      LOCAL   LOCAL         LAN          LAN-LOCAL-v4
                            WAN          WAN-LOCAL-v4     WAN-LOCAL-v6
      WAN     eth3          LAN          LAN-WAN-v4
              eth0          LOCAL        LOCAL-WAN-v4

.. opcmd:: show firewall zone-policy zone <zone>

   This will show you a basic summary of a particular zone.

   .. code-block:: none

      vyos@vyos:~$ show firewall zone-policy zone WAN
      Zone    Interfaces    From Zone    Firewall IPv4    Firewall IPv6
      ------  ------------  -----------  ---------------  ---------------
      WAN     eth3          LAN          LAN-WAN-v4
              eth0          LOCAL        LOCAL-WAN-v4

      vyos@vyos:~$ show firewall zone-policy zone LOCAL
      Zone    Interfaces    From Zone    Firewall IPv4    Firewall IPv6
      ------  ------------  -----------  ---------------  ---------------
      LOCAL   LOCAL         LAN          LAN-LOCAL-v4
                            WAN          WAN-LOCAL-v4     WAN-LOCAL-v6
