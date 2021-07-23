####################
BGP Related Policies
####################

VyOS provides policies commands exclusively for BGP traffic filtering and
manipulation. In this section, all those commands are covered.

*************
Configuration
*************

policy as-path-list
===================

.. cfgcmd:: set policy as-path-list <text>

   Create as-path-policy identified by name <text>.

.. cfgcmd:: set policy as-path-list <text> description <text>

   Set description for as-path-list policy.

.. cfgcmd:: set policy as-path-list <text> rule <1-65535> action <permit|deny>

   Set action to take on entries matching this rule.

.. cfgcmd:: set policy as-path-list <text> rule <1-65535> description <text>

   Set description for rule.

.. cfgcmd:: set policy as-path-list <text> rule <1-65535> regex <text>

   Regular expression to match against an AS path. For example "64501 64502".


policy community-list
=====================

.. cfgcmd:: set policy community-list <text>

   Creat community-list policy identified by name <text>.

.. cfgcmd:: set policy community-list <text> description <text>

   Set description for community-list policy.

.. cfgcmd:: set policy community-list <text> rule <1-65535> action
   <permit|deny>

   Set action to take on entries matching this rule.

.. cfgcmd:: set policy community-list <text> rule <1-65535> description <text>

   Set description for rule.

.. cfgcmd:: set policy community-list <text> rule <1-65535> regex
   <aa:nn|local-AS|no-advertise|no-export|internet|additive>

   Regular expression to match against a community-list.


policy extcommunity-list
========================

.. cfgcmd:: set policy extcommunity-list <text>

   Creat extcommunity-list policy identified by name <text>.

.. cfgcmd:: set policy extcommunity-list <text> description <text>

   Set description for extcommunity-list policy.

.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> action
   <permit|deny>

   Set action to take on entries matching this rule.

.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> description
   <text>

   Set description for rule.

.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> regex <text>

   Regular expression to match against an extended community list, where text
   could be:

   * <aa:nn:nn>: Extended community list regular expression.
   * <rt aa:nn:nn>: Route Target regular expression.
   * <soo aa:nn:nn>: Site of Origin regular expression.


policy large-community-list
===========================

.. cfgcmd:: set policy large-community-list <text>

   Creat large-community-list policy identified by name <text>.

.. cfgcmd:: set policy large-community-list <text> description <text>

   Set description for large-community-list policy.

.. cfgcmd:: set policy large-community-list <text> rule <1-65535> action
   <permit|deny>

   Set action to take on entries matching this rule.

.. cfgcmd:: set policy large-community-list <text> rule <1-65535> description
   <text>

   Set description for rule.

.. cfgcmd:: set policy large-community-list <text> rule <1-65535> regex
   <aa:nn:nn>

   Regular expression to match against a large community list.


********
Examples
********

Examples would be uploaded soon.