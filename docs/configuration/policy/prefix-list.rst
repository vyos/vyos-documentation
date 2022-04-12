##################
Prefix List Policy
##################

Prefix lists provides the most powerful prefix based filtering mechanism. In
addition to access-list functionality, ip prefix-list has prefix length range
specification.

If no ip prefix list is specified, it acts as permit. If ip prefix list is
defined, and no match is found, default deny is applied.

Prefix filtering can be done using prefix-list and prefix-list6.

*************
Configuration
*************

Prefix Lists
============

.. cfgcmd:: set policy prefix-list <text>

   This command creates the new prefix-list policy, identified by <text>.

.. cfgcmd:: set policy prefix-list <text> description <text>

   Set description for the prefix-list policy.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> action <permit|deny>

   This command creates a new rule in the prefix-list and defines an action.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> description <text>

   Set description for rule in the prefix-list.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> prefix <x.x.x.x/x>

   Prefix to match against.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> ge <0-32>

   Netmask greater than length.

.. cfgcmd:: set policy prefix-list <text> rule <1-65535> le <0-32>

   Netmask less than length

IPv6 Prefix Lists
=================

.. cfgcmd:: set policy prefix-list6 <text>

   This command creates the new IPv6 prefix-list policy, identified by <text>.

.. cfgcmd:: set policy prefix-list6 <text> description <text>

   Set description for the IPv6 prefix-list policy.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> action <permit|deny>

   This command creates a new rule in the IPv6 prefix-list and defines an
   action.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> description <text>

   Set description for rule in IPv6 prefix-list.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> prefix
   <h:h:h:h:h:h:h:h/x>

   IPv6 prefix.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> ge <0-128>

   Netmask greater than length.

.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> le <0-128>

   Netmask less than length
