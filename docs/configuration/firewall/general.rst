:lastproofread: 2021-06-29

.. _firewall:

########
Firewall
########

********
Overview
********

VyOS makes use of Linux `netfilter <https://netfilter.org/>`_ for packet
filtering.

The firewall supports the creation of groups for addresses, domains,
interfaces, mac-addresses, networks and port groups. This groups can be used
later in firewall ruleset as desired.

.. note:: **Important note on usage of terms:**
   The firewall makes use of the terms `forward`, `input`, and `output`
   for firewall policy. More information of Netfilter hooks and Linux
   networking packet flows can be found in `Netfilter-Hooks
   <https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks>`_


Main structure is shown next:

.. code-block:: none

   - set firewall
       * global-options
           + all-ping
           + broadcast-ping
           + ...
       * group
           - address-group
           - ipv6-address-group
           - network-group
           - ipv6-network-group
           - interface-group
           - mac-group
           - port-group
           - domain-group
       * ipv4
           - forward
               + filter
           - input
               + filter
           - output
               + filter
           - name
               + custom_name
       * ipv6
           - forward
               + filter
           - input
               + filter
           - output
               + filter
           - ipv6-name
               + custom_name

Where, main key words and configuration paths that needs to be understood:

   * For firewall filtering, configuration should be done in ``set firewall
     [ipv4 | ipv6] ...``

      * For transit traffic, which is received by the router and forwarded,
        base chain is **forward filter**: ``set firewall [ipv4 | ipv6]
        forward filter ...``

      * For traffic originated by the router, base chain is **output filter**:
        ``set firewall [ipv4 | ipv6] output filter ...``

      * For traffic towards the router itself, base chain is **input filter**:
        ``set firewall [ipv4 | ipv6] input filter ...``

.. note:: **Important note about default-actions:**
   If default action for any chain is not defined, then the default
   action is set to **accept** for that chain. Only for custom chains,
   the default action is set to **drop**.

Custom firewall chains can be created, with commands
``set firewall [ipv4 | ipv6] [name | ipv6-name] <name> ...``. In order to use
such custom chain, a rule with **action jump**, and the appropiate **target**
should be defined in a base chain.

**************
Global Options
**************

Some firewall settings are global and have an affect on the whole system.

.. cfgcmd:: set firewall global-options all-ping [enable | disable]

   By default, when VyOS receives an ICMP echo request packet destined for
   itself, it will answer with an ICMP echo reply, unless you avoid it
   through its firewall.

   With the firewall you can set rules to accept, drop or reject ICMP in,
   out or local traffic. You can also use the general **firewall all-ping**
   command. This command affects only to LOCAL (packets destined for your
   VyOS system), not to IN or OUT traffic.

   .. note:: **firewall global-options all-ping** affects only to LOCAL
      and it always behaves in the most restrictive way

   .. code-block:: none

      set firewall global-options all-ping enable

   When the command above is set, VyOS will answer every ICMP echo request
   addressed to itself, but that will only happen if no other rule is
   applied dropping or rejecting local echo requests. In case of conflict,
   VyOS will not answer ICMP echo requests.

   .. code-block:: none

      set firewall global-options all-ping disable

   When the command above is set, VyOS will answer no ICMP echo request
   addressed to itself at all, no matter where it comes from or whether
   more specific rules are being applied to accept them.

.. cfgcmd:: set firewall global-options broadcast-ping [enable | disable]

   This setting enable or disable the response of icmp broadcast
   messages. The following system parameter will be altered:

   * ``net.ipv4.icmp_echo_ignore_broadcasts``

.. cfgcmd:: set firewall global-options ip-src-route [enable | disable]
.. cfgcmd:: set firewall global-options ipv6-src-route [enable | disable]

   This setting handle if VyOS accept packets with a source route
   option. The following system parameter will be altered:

   * ``net.ipv4.conf.all.accept_source_route``
   * ``net.ipv6.conf.all.accept_source_route``

.. cfgcmd:: set firewall global-options receive-redirects [enable | disable]
.. cfgcmd:: set firewall global-options ipv6-receive-redirects
   [enable | disable]

   enable or disable of ICMPv4 or ICMPv6 redirect messages accepted
   by VyOS. The following system parameter will be altered:

   * ``net.ipv4.conf.all.accept_redirects``
   * ``net.ipv6.conf.all.accept_redirects``

.. cfgcmd:: set firewall global-options send-redirects [enable | disable]

   enable or disable ICMPv4 redirect messages send by VyOS
   The following system parameter will be altered:

   * ``net.ipv4.conf.all.send_redirects``

.. cfgcmd:: set firewall global-options log-martians [enable | disable]

   enable or disable the logging of martian IPv4 packets.
   The following system parameter will be altered:

   * ``net.ipv4.conf.all.log_martians``

.. cfgcmd:: set firewall global-options source-validation
   [strict | loose | disable]

   Set the IPv4 source validation mode.
   The following system parameter will be altered:

   * ``net.ipv4.conf.all.rp_filter``

.. cfgcmd:: set firewall global-options syn-cookies [enable | disable]

   Enable or Disable if VyOS use IPv4 TCP SYN Cookies.
   The following system parameter will be altered:

   * ``net.ipv4.tcp_syncookies``

.. cfgcmd:: set firewall global-options twa-hazards-protection
   [enable | disable]

   Enable or Disable VyOS to be :rfc:`1337` conform.
   The following system parameter will be altered:

   * ``net.ipv4.tcp_rfc1337``

******
Groups
******

Firewall groups represent collections of IP addresses, networks, ports,
mac addresses, domains or interfaces. Once created, a group can be referenced
by firewall, nat and policy route rules as either a source or destination
matcher, and as inbpund/outbound in the case of interface group.

Address Groups
==============

In an **address group** a single IP address or IP address ranges are
defined.

.. cfgcmd::  set firewall group address-group <name> address [address |
   address range]
.. cfgcmd::  set firewall group ipv6-address-group <name> address <address>

   Define a IPv4 or a IPv6 address group

   .. code-block:: none

      set firewall group address-group ADR-INSIDE-v4 address 192.168.0.1
      set firewall group address-group ADR-INSIDE-v4 address 10.0.0.1-10.0.0.8
      set firewall group ipv6-address-group ADR-INSIDE-v6 address 2001:db8::1

.. cfgcmd::  set firewall group address-group <name> description <text>
.. cfgcmd::  set firewall group ipv6-address-group <name> description <text>

   Provide a IPv4 or IPv6 address group description

Network Groups
==============

While **network groups** accept IP networks in CIDR notation, specific
IP addresses can be added as a 32-bit prefix. If you foresee the need
to add a mix of addresses and networks, the network group is
recommended.

.. cfgcmd::  set firewall group network-group <name> network <CIDR>
.. cfgcmd::  set firewall group ipv6-network-group <name> network <CIDR>

   Define a IPv4 or IPv6 Network group.

   .. code-block:: none

      set firewall group network-group NET-INSIDE-v4 network 192.168.0.0/24
      set firewall group network-group NET-INSIDE-v4 network 192.168.1.0/24
      set firewall group ipv6-network-group NET-INSIDE-v6 network 2001:db8::/64

.. cfgcmd::  set firewall group network-group <name> description <text>
.. cfgcmd::  set firewall group ipv6-network-group <name> description <text>

   Provide an IPv4 or IPv6 network group description.

Interface Groups
================

An **interface group** represents a collection of interfaces.

.. cfgcmd::  set firewall group interface-group <name> interface <text>

   Define an interface group. Wildcard are accepted too.

.. code-block:: none

      set firewall group interface-group LAN interface bond1001
      set firewall group interface-group LAN interface eth3*

.. cfgcmd::  set firewall group interface-group <name> description <text>

   Provide an interface group description

Port Groups
===========

A **port group** represents only port numbers, not the protocol. Port
groups can be referenced for either TCP or UDP. It is recommended that
TCP and UDP groups are created separately to avoid accidentally
filtering unnecessary ports. Ranges of ports can be specified by using
`-`.

.. cfgcmd:: set firewall group port-group <name> port
   [portname | portnumber | startport-endport]

   Define a port group. A port name can be any name defined in
   /etc/services. e.g.: http

   .. code-block:: none

      set firewall group port-group PORT-TCP-SERVER1 port http
      set firewall group port-group PORT-TCP-SERVER1 port 443
      set firewall group port-group PORT-TCP-SERVER1 port 5000-5010

.. cfgcmd:: set firewall group port-group <name> description <text>

   Provide a port group description.

MAC Groups
==========

A **mac group** represents a collection of mac addresses.

.. cfgcmd::  set firewall group mac-group <name> mac-address <mac-address>

   Define a mac group.

.. code-block:: none

      set firewall group mac-group MAC-G01 mac-address 88:a4:c2:15:b6:4f
      set firewall group mac-group MAC-G01 mac-address 4c:d5:77:c0:19:81

.. cfgcmd:: set firewall group mac-group <name> description <text>

   Provide a mac group description.

Domain Groups
=============

A **domain group** represents a collection of domains.

.. cfgcmd::  set firewall group domain-group <name> address <domain>

   Define a domain group.

.. code-block:: none

      set firewall group domain-group DOM address example.com

.. cfgcmd:: set firewall group domain-group <name> description <text>

   Provide a domain group description.

**************
Firewall Rules
**************

For firewall filtering, firewall rules needs to be created. Each rule is
numbered, has an action to apply if the rule is matched, and the ability
to specify multiple criteria matchers. Data packets go through the rules
from 1 - 999999, so order is crucial. At the first match the action of the
rule will be executed.

Actions
=======

If a rule is defined, then an action must be defined for it. This tells the
firewall what to do if all criteria matchers defined for such rule do match.

The action can be :

   * ``accept``: accept the packet.

   * ``drop``: drop the packet.

   * ``reject``: reject the packet.

   * ``jump``: jump to another custom chain.

   * ``return``: Return from the current chain and continue at the next rule
     of the last chain.

   * ``queue``: Enqueue packet to userspace.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999> action
   [accept | drop | jump | queue | reject | return]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999> action
   [accept | drop | jump | queue | reject | return]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999> action
   [accept | drop | jump | queue | reject | return]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999> action
   [accept | drop | jump | queue | reject | return]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999> action
   [accept | drop | jump | queue | reject | return]

   This required setting defines the action of the current rule. If action is
   set to jump, then jump-target is also needed.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   jump-target <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   jump-target <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   jump-target <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   jump-target <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   jump-target <text>

   To be used only when action is set to jump. Use this command to specify
   jump target.

Also, **default-action** is an action that takes place whenever a packet does
not match any rule in it's chain. For base chains, possible options for
**default-action** are **accept** or **drop**. 

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter default-action
   [accept | drop]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter default-action
   [accept | drop]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter default-action
   [accept | drop]
.. cfgcmd:: set firewall ipv4 name <name> default-action
   [accept | drop | jump | queue | reject | return]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> default-action
   [accept | drop | jump | queue | reject | return]

   This set the default action of the rule-set if no rule matched a packet
   criteria. If defacult-action is set to ``jump``, then
   ``default-jump-target`` is also needed. Note that for base chains, default
   action can only be set to ``accept`` or ``drop``, while on custom chain,
   more actions are available.

.. cfgcmd:: set firewall name <name> default-jump-target <text>
.. cfgcmd:: set firewall ipv6-name <name> default-jump-target <text>

   To be used only when ``defult-action`` is set to ``jump``. Use this
   command to specify jump target for default rule.

.. note:: **Important note about default-actions:**
   If default action for any chain is not defined, then the default
   action is set to **drop** for that chain.


Firewall Logs
=============

Logging can be enable for every single firewall rule. If enabled, other
log options can be defined. 

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999> log
   [disable | enable]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999> log
   [disable | enable]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999> log
   [disable | enable]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999> log
   [disable | enable]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999> log
   [disable | enable]

   Enable or disable logging for the matched packet.

.. cfgcmd:: set firewall ipv4 name <name> enable-default-log
.. cfgcmd:: set firewall ipv6 ipv6-name <name> enable-default-log

   Use this command to enable the logging of the default action on
   custom chains.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   log-options level [emerg | alert | crit | err | warn | notice
   | info | debug]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   log-options level [emerg | alert | crit | err | warn | notice
   | info | debug]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   log-options level [emerg | alert | crit | err | warn | notice
   | info | debug]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   log-options level [emerg | alert | crit | err | warn | notice
   | info | debug]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   log-options level [emerg | alert | crit | err | warn | notice
   | info | debug]

   Define log-level. Only applicable if rule log is enable.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   log-options group <0-65535>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   log-options group <0-65535>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   log-options group <0-65535>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   log-options group <0-65535>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   log-options group <0-65535>

   Define log group to send message to. Only applicable if rule log is enable.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   log-options snapshot-length <0-9000>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   log-options snapshot-length <0-9000>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   log-options snapshot-length <0-9000>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   log-options snapshot-length <0-9000>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   log-options snapshot-length <0-9000>

   Define length of packet payload to include in netlink message. Only
   applicable if rule log is enable and log group is defined.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   log-options queue-threshold <0-65535>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   log-options queue-threshold <0-65535>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   log-options queue-threshold <0-65535>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   log-options queue-threshold <0-65535>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   log-options queue-threshold <0-65535>

   Define number of packets to queue inside the kernel before sending them to
   userspace. Only applicable if rule log is enable and log group is defined.


Firewall Description
====================

For reference, a description can be defined for every single rule, and for
every defined custom chain.

.. cfgcmd:: set firewall ipv4 name <name> description <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> description <text>

   Provide a rule-set description to a custom firewall chain.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   description <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   description <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   description <text>

.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999> description <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999> description <text>

   Provide a description for each rule.


Rule Status
===========

When defining a rule, it is enable by default. In some cases, it is useful to
just disable the rule, rather than removing it.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999> disable
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999> disable
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999> disable
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999> disable
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999> disable

   Command for disabling a rule but keep it in the configuration.


Matching criteria
=================

There are a lot of matching criteria against which the package can be tested.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   connection-status nat [destination | source]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   connection-status nat [destination | source]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   connection-status nat [destination | source]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   connection-status nat [destination | source]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   connection-status nat [destination | source]

   Match criteria based on nat connection status.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   connection-mark <1-2147483647>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   connection-mark <1-2147483647>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   connection-mark <1-2147483647>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   connection-mark <1-2147483647>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   connection-mark <1-2147483647>

   Match criteria based on connection mark.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source address [address | addressrange | CIDR]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source address [address | addressrange | CIDR]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source address [address | addressrange | CIDR]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source address [address | addressrange | CIDR]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source address [address | addressrange | CIDR]

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination address [address | addressrange | CIDR]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination address [address | addressrange | CIDR]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination address [address | addressrange | CIDR]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination address [address | addressrange | CIDR]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination address [address | addressrange | CIDR]

   Match criteria based on source and/or destination address. This is similar
   to the network groups part, but here you are able to negate the matching
   addresses.

   .. code-block:: none

      set firewall ipv4 name FOO rule 50 source address 192.0.2.10-192.0.2.11
      # with a '!' the rule match everything except the specified subnet
      set firewall ipv4 input filter FOO rule 51 source address !203.0.113.0/24
      set firewall ipv6 ipv6-name FOO rule 100 source address 2001:db8::202

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source address-mask [address]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source address-mask [address]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source address-mask [address]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source address-mask [address]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source address-mask [address]

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination address-mask [address]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination address-mask [address]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination address-mask [address]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination address-mask [address]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination address-mask [address]

   An arbitrary netmask can be applied to mask addresses to only match against
   a specific portion. This is particularly useful with IPv6 as rules will
   remain valid if the IPv6 prefix changes and the host
   portion of systems IPv6 address is static (for example, with SLAAC or
   `tokenised IPv6 addresses
   <https://datatracker.ietf.org/doc/id/draft-chown-6man-tokenised-ipv6-identifiers-02.txt>`_)
   
   This functions for both individual addresses and address groups.

   .. code-block:: none

      # Match any IPv6 address with the suffix ::0000:0000:0000:beef
      set firewall ipv6 forward filter rule 100 destination address ::beef
      set firewall ipv6 forward filter rule 100 destination address-mask ::ffff:ffff:ffff:ffff
      # Match any IPv4 address with `11` as the 2nd octet and `13` as the forth octet
      set firewall ipv4 name FOO rule 100 destination address 0.11.0.13
      set firewall ipv4 name FOO rule 100 destination address-mask 0.255.0.255
      # Address groups
      set firewall group ipv6-address-group WEBSERVERS address ::1000
      set firewall group ipv6-address-group WEBSERVERS address ::2000
      set firewall ipv6 forward filter rule 200 source group address-group WEBSERVERS
      set firewall ipv6 forward filter rule 200 source address-mask ::ffff:ffff:ffff:ffff

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source fqdn <fqdn>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source fqdn <fqdn>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source fqdn <fqdn>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source fqdn <fqdn>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source fqdn <fqdn>
.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination fqdn <fqdn>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination fqdn <fqdn>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination fqdn <fqdn>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination fqdn <fqdn>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination fqdn <fqdn>

   Specify a Fully Qualified Domain Name as source/destination matcher. Ensure
   router is able to resolve such dns query.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source geoip country-code <country>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source geoip country-code <country>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source geoip country-code <country>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source geoip country-code <country>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source geoip country-code <country>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination geoip country-code <country>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination geoip country-code <country>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination geoip country-code <country>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination geoip country-code <country>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination geoip country-code <country>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source geoip inverse-match
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source geoip inverse-match
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source geoip inverse-match
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source geoip inverse-match
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source geoip inverse-match

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination geoip inverse-match
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination geoip inverse-match
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination geoip inverse-match
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination geoip inverse-match
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination geoip inverse-match

   Match IP addresses based on its geolocation. More info: `geoip matching
   <https://wiki.nftables.org/wiki-nftables/index.php/GeoIP_matching>`_.
   Use inverse-match to match anything except the given country-codes.

Data is provided by DB-IP.com under CC-BY-4.0 license. Attribution required,
permits redistribution so we can include a database in images(~3MB
compressed). Includes cron script (manually callable by op-mode update
geoip) to keep database and rules updated.


.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source mac-address <mac-address>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source mac-address <mac-address>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source mac-address <mac-address>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source mac-address <mac-address>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source mac-address <mac-address>

   Only in the source criteria, you can specify a mac-address.

   .. code-block:: none

      set firewall ipv4 input filter rule 100 source mac-address 00:53:00:11:22:33
      set firewall ipv4 input filter rule 101 source mac-address !00:53:00:aa:12:34


.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source port [1-65535 | portname | start-end]

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination port [1-65535 | portname | start-end]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination port [1-65535 | portname | start-end]

   A port can be set with a port number or a name which is here
   defined: ``/etc/services``.

   .. code-block:: none

      set firewall ipv4 forward filter rule 10 source port '22'
      set firewall ipv4 forward filter rule 11 source port '!http'
      set firewall ipv4 forward filter rule 12 source port 'https'

   Multiple source ports can be specified as a comma-separated list.
   The whole list can also be "negated" using ``!``. For example:

   .. code-block:: none

      set firewall ipv6 forward filter rule 10 source port '!22,https,3333-3338'

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source group address-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source group address-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source group address-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source group address-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source group address-group <name | !name>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination group address-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination group address-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination group address-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination group address-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination group address-group <name | !name>

   Use a specific address-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source group network-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source group network-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source group network-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source group network-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source group network-group <name | !name>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination group network-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination group network-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination group network-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination group network-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination group network-group <name | !name>

   Use a specific network-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source group port-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source group port-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source group port-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source group port-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source group port-group <name | !name>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination group port-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination group port-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination group port-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination group port-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination group port-group <name | !name>

   Use a specific port-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source group domain-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source group domain-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source group domain-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source group domain-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source group domain-group <name | !name>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination group domain-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination group domain-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination group domain-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination group domain-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination group domain-group <name | !name>

   Use a specific domain-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   source group mac-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   source group mac-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   source group mac-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   source group mac-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   source group mac-group <name | !name>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   destination group mac-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   destination group mac-group <name | !name>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   destination group mac-group <name | !name>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   destination group mac-group <name | !name>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   destination group mac-group <name | !name>

   Use a specific mac-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   dscp [0-63 | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   dscp [0-63 | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   dscp [0-63 | start-end]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   dscp [0-63 | start-end]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   dscp [0-63 | start-end]

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   dscp-exclude [0-63 | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   dscp-exclude [0-63 | start-end]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   dscp-exclude [0-63 | start-end]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   dscp-exclude [0-63 | start-end]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   dscp-exclude [0-63 | start-end]

   Match based on dscp value.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   fragment [match-frag | match-non-frag]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   fragment [match-frag | match-non-frag]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   fragment [match-frag | match-non-frag]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   fragment [match-frag | match-non-frag]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   fragment [match-frag | match-non-frag]

   Match based on fragment criteria.

.. cfgcmd:: set firewall ipv4 forward filter rule <1-999999>
   icmp [code | type] <0-255>
.. cfgcmd:: set firewall ipv4 input filter rule <1-999999>
   icmp [code | type] <0-255>
.. cfgcmd:: set firewall ipv4 output filter rule <1-999999>
   icmp [code | type] <0-255>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   icmp [code | type] <0-255>
.. cfgcmd:: set firewall ipv6 forward filter rule <1-999999>
   icmpv6 [code | type] <0-255>
.. cfgcmd:: set firewall ipv6 input filter rule <1-999999>
   icmpv6 [code | type] <0-255>
.. cfgcmd:: set firewall ipv6 output filter rule <1-999999>
   icmpv6 [code | type] <0-255>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   icmpv6 [code | type] <0-255>

   Match based on icmp|icmpv6 code and type.

.. cfgcmd:: set firewall ipv4 forward filter rule <1-999999>
   icmp type-name <text>
.. cfgcmd:: set firewall ipv4 input filter rule <1-999999>
   icmp type-name <text>
.. cfgcmd:: set firewall ipv4 output filter rule <1-999999>
   icmp type-name <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   icmp type-name <text>
.. cfgcmd:: set firewall ipv6 forward filter rule <1-999999>
   icmpv6 type-name <text>
.. cfgcmd:: set firewall ipv6 input filter rule <1-999999>
   icmpv6 type-name <text>
.. cfgcmd:: set firewall ipv6 output filter rule <1-999999>
   icmpv6 type-name <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   icmpv6 type-name <text>

   Match based on icmp|icmpv6 type-name criteria. Use tab for information
   about what **type-name** criteria are supported.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   inbound-interface <iface>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   inbound-interface <iface>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   inbound-interface <iface>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   inbound-interface <iface>

   Match based on inbound interface. Wilcard ``*`` can be used.
   For example: ``eth2*``

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   outbound-interface <iface>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   outbound-interface <iface>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   outbound-interface <iface>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   outbound-interface <iface>

   Match based on outbound interface. Wilcard ``*`` can be used.
   For example: ``eth2*``

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   ipsec [match-ipsec | match-none]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   ipsec [match-ipsec | match-none]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   ipsec [match-ipsec | match-none]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   ipsec [match-ipsec | match-none]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   ipsec [match-ipsec | match-none]

   Match based on ipsec criteria.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   limit burst <0-4294967295>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   limit burst <0-4294967295>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   limit burst <0-4294967295>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   limit burst <0-4294967295>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   limit burst <0-4294967295>

   Match based on the maximum number of packets to allow in excess of rate.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   limit rate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   limit rate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   limit rate <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   limit rate <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   limit rate <text>

   Match based on the maximum average rate, specified as **integer/unit**.
   For example **5/minutes**

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   packet-length <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   packet-length <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   packet-length <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   packet-length <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   packet-length <text>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   packet-length-exclude <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   packet-length-exclude <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   packet-length-exclude <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   packet-length-exclude <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   packet-length-exclude <text>

   Match based on packet length criteria. Multiple values from 1 to 65535
   and ranges are supported.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   packet-type [broadcast | host | multicast | other]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   packet-type [broadcast | host | multicast | other]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   packet-type [broadcast | host | multicast | other]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   packet-type [broadcast | host | multicast | other]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   packet-type [broadcast | host | multicast | other]

   Match based on packet type criteria.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   protocol [<text> | <0-255> | all | tcp_udp]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   protocol [<text> | <0-255> | all | tcp_udp]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   protocol [<text> | <0-255> | all | tcp_udp]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   protocol [<text> | <0-255> | all | tcp_udp]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   protocol [<text> | <0-255> | all | tcp_udp]

   Match a protocol criteria. A protocol number or a name which is here
   defined: ``/etc/protocols``.
   Special names are ``all`` for all protocols and ``tcp_udp`` for tcp and udp
   based packets. The ``!`` negate the selected protocol.

   .. code-block:: none

      set firewall ipv4 forward fitler rule 10 protocol tcp_udp
      set firewall ipv4 forward fitler rule 11 protocol !tcp_udp
      set firewall ipv6 input filter rule 10 protocol tcp

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   recent count <1-255>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   recent time [second | minute | hour]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   recent time [second | minute | hour]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   recent time [second | minute | hour]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   recent time [second | minute | hour]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   recent time [second | minute | hour]

   Match bases on recently seen sources.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   tcp flags <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   tcp flags <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   tcp flags <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   tcp flags <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   tcp flags <text>

   Allowed values fpr TCP flags: ``SYN``, ``ACK``, ``FIN``, ``RST``, ``URG``,
   ``PSH``, ``ALL`` When specifying more than one flag, flags should be comma
   separated. The ``!`` negate the selected protocol.

   .. code-block:: none

      set firewall ipv4 input filter rule 10 tcp flags 'ACK'
      set firewall ipv4 input filter rule 12 tcp flags 'SYN'
      set firewall ipv4 input filter rule 13 tcp flags 'SYN,!ACK,!FIN,!RST'

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   state [established | invalid | new | related] [enable | disable]
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   state [established | invalid | new | related] [enable | disable]
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   state [established | invalid | new | related] [enable | disable]
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   state [established | invalid | new | related] [enable | disable]
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   state [established | invalid | new | related] [enable | disable]

   Match against the state of a packet.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   time startdate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   time startdate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   time startdate <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   time startdate <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   time startdate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   time starttime <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   time starttime <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   time starttime <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   time starttime <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   time starttime <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   time stopdate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   time stopdate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   time stopdate <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   time stopdate <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   time stopdate <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   time stoptime <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   time stoptime <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   time stoptime <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   time stoptime <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   time stoptime <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   time weekdays <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   time weekdays <text>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   time weekdays <text>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   time weekdays <text>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   time weekdays <text>

   Time to match the defined rule.

.. cfgcmd:: set firewall ipv4 forward filter rule <1-999999>
   ttl <eq | gt | lt> <0-255>
.. cfgcmd:: set firewall ipv4 input filter rule <1-999999>
   ttl <eq | gt | lt> <0-255>
.. cfgcmd:: set firewall ipv4 output filter rule <1-999999>
   ttl <eq | gt | lt> <0-255>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   ttl <eq | gt | lt> <0-255>

   Match time to live parameter, where 'eq' stands for 'equal'; 'gt' stands for
   'greater than', and 'lt' stands for 'less than'.

.. cfgcmd:: set firewall ipv6 forward filter rule <1-999999>
   hop-limit <eq | gt | lt> <0-255>
.. cfgcmd:: set firewall ipv6 input filter rule <1-999999>
   hop-limit <eq | gt | lt> <0-255>
.. cfgcmd:: set firewall ipv6 output filter rule <1-999999>
   hop-limit <eq | gt | lt> <0-255>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   hop-limit <eq | gt | lt> <0-255>

   Match hop-limit parameter, where 'eq' stands for 'equal'; 'gt' stands for
   'greater than', and 'lt' stands for 'less than'.

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   recent count <1-255>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   recent count <1-255>

.. cfgcmd:: set firewall [ipv4 | ipv6] forward filter rule <1-999999>
   recent time <second | minute | hour>
.. cfgcmd:: set firewall [ipv4 | ipv6] input filter rule <1-999999>
   recent time <second | minute | hour>
.. cfgcmd:: set firewall [ipv4 | ipv6] output filter rule <1-999999>
   recent time <second | minute | hour>
.. cfgcmd:: set firewall ipv4 name <name> rule <1-999999>
   recent time <second | minute | hour>
.. cfgcmd:: set firewall ipv6 ipv6-name <name> rule <1-999999>
   recent time <second | minute | hour>

   Match when 'count' amount of connections are seen within 'time'. These
   matching criteria can be used to block brute-force attempts.

***********************
Operation-mode Firewall
***********************

Rule-set overview
=================

.. opcmd:: show firewall

   This will show you a basic firewall overview

   .. code-block:: none

      vyos@vyos:~$ show firewall 
      Rulesets Information

      ---------------------------------
      IPv4 Firewall "forward filter"

      Rule     Action    Protocol      Packets    Bytes  Conditions
      -------  --------  ----------  ---------  -------  -----------------------------------------
      5        jump      all                 0        0  iifname "eth1"  jump NAME_VyOS_MANAGEMENT
      10       jump      all                 0        0  oifname "eth1"  jump NAME_WAN_IN
      15       jump      all                 0        0  iifname "eth3"  jump NAME_WAN_IN
      default  accept    all

      ---------------------------------
      IPv4 Firewall "name VyOS_MANAGEMENT"

      Rule     Action    Protocol      Packets    Bytes  Conditions
      -------  --------  ----------  ---------  -------  --------------------------------
      5        accept    all                 0        0  ct state established  accept
      10       drop      all                 0        0  ct state invalid
      20       accept    all                 0        0  ip saddr @A_GOOD_GUYS  accept
      30       accept    all                 0        0  ip saddr @N_ENTIRE_RANGE  accept
      40       accept    all                 0        0  ip saddr @A_VyOS_SERVERS  accept
      50       accept    icmp                0        0  meta l4proto icmp  accept
      default  drop      all                 0        0

      ---------------------------------
      IPv6 Firewall "forward filter"

      Rule     Action    Protocol
      -------  --------  ----------
      5        jump      all
      10       jump      all
      15       jump      all
      default  accept    all

      ---------------------------------
      IPv6 Firewall "input filter"

      Rule     Action    Protocol
      -------  --------  ----------
      5        jump      all
      default  accept    all

      ---------------------------------
      IPv6 Firewall "ipv6_name IPV6-VyOS_MANAGEMENT"

      Rule     Action    Protocol
      -------  --------  ----------
      5        accept    all
      10       drop      all
      20       accept    all
      30       accept    all
      40       accept    all
      50       accept    ipv6-icmp
      default  drop      all

.. opcmd:: show firewall summary

   This will show you a summary of rule-sets and groups

   .. code-block:: none

      vyos@vyos:~$ show firewall summary 
      Ruleset Summary

      IPv6 Ruleset:

      Ruleset Hook    Ruleset Priority      Description
      --------------  --------------------  -------------------------
      forward         filter
      input           filter
      ipv6_name       IPV6-VyOS_MANAGEMENT
      ipv6_name       IPV6-WAN_IN           PUBLIC_INTERNET

      IPv4 Ruleset:

      Ruleset Hook    Ruleset Priority    Description
      --------------  ------------------  -------------------------
      forward         filter
      input           filter
      name            VyOS_MANAGEMENT
      name            WAN_IN              PUBLIC_INTERNET

      Firewall Groups

      Name                     Type                References               Members
      -----------------------  ------------------  -----------------------  ----------------
      PBX                      address_group       WAN_IN-100               198.51.100.77
      SERVERS                  address_group       WAN_IN-110               192.0.2.10
                                                   WAN_IN-111               192.0.2.11
                                                   WAN_IN-112               192.0.2.12
                                                   WAN_IN-120
                                                   WAN_IN-121
                                                   WAN_IN-122
      SUPPORT                  address_group       VyOS_MANAGEMENT-20       192.168.1.2
                                                   WAN_IN-20
      PHONE_VPN_SERVERS        address_group       WAN_IN-160               10.6.32.2
      PINGABLE_ADRESSES        address_group       WAN_IN-170               192.168.5.2
                                                   WAN_IN-171
      PBX                      ipv6_address_group  IPV6-WAN_IN-100          2001:db8::1
      SERVERS                  ipv6_address_group  IPV6-WAN_IN-110          2001:db8::2
                                                   IPV6-WAN_IN-111          2001:db8::3
                                                   IPV6-WAN_IN-112          2001:db8::4
                                                   IPV6-WAN_IN-120
                                                   IPV6-WAN_IN-121
                                                   IPV6-WAN_IN-122
      SUPPORT                  ipv6_address_group  IPV6-VyOS_MANAGEMENT-20  2001:db8::5
                                                   IPV6-WAN_IN-20


.. opcmd:: show firewall [ipv4 | ipv6] [forward | input | output] filter

.. opcmd:: show firewall ipv4 name <name>

.. opcmd:: show firewall ipv6 ipv6-name <name>

   This command will give an overview of a single rule-set.

   .. code-block:: none

      vyos@vyos:~$ show firewall ipv4 input filter 
      Ruleset Information

      ---------------------------------
      IPv4 Firewall "input filter"

      Rule     Action    Protocol      Packets    Bytes  Conditions
      -------  --------  ----------  ---------  -------  -----------------------------------------
      5        jump      all                 0        0  iifname "eth2"  jump NAME_VyOS_MANAGEMENT
      default  accept    all

.. opcmd:: show firewall [ipv4 | ipv6] [forward | input | output]
   filter rule <1-999999>

.. opcmd:: show firewall ipv4 name <name> rule <1-999999>

.. opcmd:: show firewall ipv6 ipv6-name <name> rule <1-999999>

   This command will give an overview of a rule in a single rule-set

.. opcmd:: show firewall group <name>

   Overview of defined groups. You see the type, the members, and where the
   group is used.

   .. code-block:: none

      vyos@vyos:~$ show firewall group LAN 
      Firewall Groups

      Name          Type                References               Members
      ------------  ------------------  -----------------------  ----------------
      LAN           ipv6_network_group  IPV6-VyOS_MANAGEMENT-30  2001:db8::0/64
                                        IPV6-WAN_IN-30
      LAN           network_group       VyOS_MANAGEMENT-30       192.168.200.0/24
                                        WAN_IN-30


.. opcmd:: show firewall statistics

   This will show you a statistic of all rule-sets since the last boot.

Show Firewall log
=================

.. opcmd:: show log firewall [name | ipv6name] <name>

   Show the logs of a specific Rule-Set.

.. note::
   At the moment it not possible to look at the whole firewall log with VyOS
   operational commands. All logs will save to ``/var/logs/messages``.
   For example: ``grep '10.10.0.10' /var/log/messages``


Example Partial Config
======================

.. code-block:: none

  firewall {
      group {
          network-group BAD-NETWORKS {
              network 198.51.100.0/24
              network 203.0.113.0/24
          }
          network-group GOOD-NETWORKS {
              network 192.0.2.0/24
          }
          port-group BAD-PORTS {
              port 65535
          }
      }
      ipv4 {
          forward {
              filter {
                  default-action accept
                  rule 5 {
                      action accept
                      source {
                          group {
                              network-group GOOD-NETWORKS
                          }
                      }
                  }
                  rule 10 {
                      action drop
                      description "Bad Networks"
                      protocol all
                      source {
                          group {
                              network-group BAD-NETWORKS
                          }
                      }
                  }
              }
          }
      }
  }

Update geoip database
=====================

.. opcmd:: update geoip

   Command used to update GeoIP database and firewall sets.
