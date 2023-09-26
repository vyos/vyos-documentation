:lastproofread: 2021-06-29

.. _legacy-firewall:

###################################
Firewall Configuration (Deprecated)
###################################

.. note:: **Important note:**
   This documentation is valid only for VyOS Sagitta prior to
   1.4-rolling-202308040557

********
Overview
********

VyOS makes use of Linux `netfilter <https://netfilter.org/>`_ for packet
filtering.

The firewall supports the creation of groups for ports, addresses, and
networks (implemented using netfilter ipset) and the option of interface
or zone based firewall policy.

.. note:: **Important note on usage of terms:**
   The firewall makes use of the terms `in`, `out`, and `local`
   for firewall policy. Users experienced with netfilter often confuse
   `in` to be a reference to the `INPUT` chain, and `out` the `OUTPUT`
   chain from netfilter. This is not the case. These instead indicate
   the use of the `FORWARD` chain and either the input or output
   interface. The `INPUT` chain, which is used for local traffic to the
   OS, is a reference to as `local` with respect to its input interface.


***************
Global settings
***************

Some firewall settings are global and have an affect on the whole system.

.. cfgcmd:: set firewall all-ping [enable | disable]

   By default, when VyOS receives an ICMP echo request packet destined for
   itself, it will answer with an ICMP echo reply, unless you avoid it
   through its firewall.

   With the firewall you can set rules to accept, drop or reject ICMP in,
   out or local traffic. You can also use the general **firewall all-ping**
   command. This command affects only to LOCAL (packets destined for your
   VyOS system), not to IN or OUT traffic.

   .. note:: **firewall all-ping** affects only to LOCAL and it always
      behaves in the most restrictive way

   .. code-block:: none

      set firewall all-ping enable

   When the command above is set, VyOS will answer every ICMP echo request
   addressed to itself, but that will only happen if no other rule is
   applied dropping or rejecting local echo requests. In case of conflict,
   VyOS will not answer ICMP echo requests.

   .. code-block:: none

      set firewall all-ping disable

   When the command above is set, VyOS will answer no ICMP echo request
   addressed to itself at all, no matter where it comes from or whether
   more specific rules are being applied to accept them.

.. cfgcmd:: set firewall broadcast-ping [enable | disable]

   This setting enable or disable the response of icmp broadcast
   messages. The following system parameter will be altered:

   * ``net.ipv4.icmp_echo_ignore_broadcasts``

.. cfgcmd:: set firewall ip-src-route [enable | disable]
.. cfgcmd:: set firewall ipv6-src-route [enable | disable]

   This setting handle if VyOS accept packets with a source route
   option. The following system parameter will be altered:

   * ``net.ipv4.conf.all.accept_source_route``
   * ``net.ipv6.conf.all.accept_source_route``

.. cfgcmd:: set firewall receive-redirects [enable | disable]
.. cfgcmd:: set firewall ipv6-receive-redirects [enable | disable]

   enable or disable of ICMPv4 or ICMPv6 redirect messages accepted
   by VyOS. The following system parameter will be altered:

   * ``net.ipv4.conf.all.accept_redirects``
   * ``net.ipv6.conf.all.accept_redirects``

.. cfgcmd:: set firewall send-redirects [enable | disable]

   enable or disable  ICMPv4 redirect messages send by VyOS
   The following system parameter will be altered:

   * ``net.ipv4.conf.all.send_redirects``

.. cfgcmd:: set firewall log-martians [enable | disable]

   enable or disable the logging of martian IPv4 packets.
   The following system parameter will be altered:

   * ``net.ipv4.conf.all.log_martians``

.. cfgcmd:: set firewall source-validation [strict | loose | disable]

   Set the IPv4 source validation mode.
   The following system parameter will be altered:

   * ``net.ipv4.conf.all.rp_filter``

.. cfgcmd:: set firewall syn-cookies [enable | disable]

   Enable or Disable if VyOS use IPv4 TCP SYN Cookies.
   The following system parameter will be altered:

   * ``net.ipv4.tcp_syncookies``

.. cfgcmd:: set firewall twa-hazards-protection [enable | disable]

   Enable or Disable VyOS to be :rfc:`1337` conform.
   The following system parameter will be altered:

   * ``net.ipv4.tcp_rfc1337``

.. cfgcmd:: set firewall state-policy established action [accept | drop |
   reject]

.. cfgcmd:: set firewall state-policy established log enable

   Set the global setting for an established connection.

.. cfgcmd:: set firewall state-policy invalid action [accept | drop | reject]

.. cfgcmd:: set firewall state-policy invalid log enable

   Set the global setting for invalid packets.

.. cfgcmd:: set firewall state-policy related action [accept | drop | reject]

.. cfgcmd:: set firewall state-policy related log enable

   Set the global setting for related connections.


******
Groups
******

Firewall groups represent collections of IP addresses, networks, ports,
mac addresses or domains. Once created, a group can be referenced by
firewall, nat and policy route rules as either a source or destination
matcher. Members can be added or removed from a group without changes to,
or the need to reload, individual firewall rules.

Groups need to have unique names. Even though some contain IPv4
addresses and others contain IPv6 addresses, they still need to have
unique names, so you may want to append "-v4" or "-v6" to your group
names.


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

   Provide a IPv4 or IPv6 network group description.

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


Domain Groups
=============

A **domain group** represents a collection of domains.

.. cfgcmd::  set firewall group domain-group <name> address <domain>

   Define a domain group.

.. code-block:: none

      set firewall group domain-group DOM address example.com


*********
Rule-Sets
*********

A rule-set is a named collection of firewall rules that can be applied
to an interface or a zone. Each rule is numbered, has an action to apply
if the rule is matched, and the ability to specify the criteria to
match. Data packets go through the rules from 1 - 999999, at the first match
the action of the rule will be executed.

.. cfgcmd:: set firewall name <name> description <text>
.. cfgcmd:: set firewall ipv6-name <name> description <text>

   Provide a rule-set description.

.. cfgcmd:: set firewall name <name> default-action [accept | drop | jump |
   reject | return]
.. cfgcmd:: set firewall ipv6-name <name> default-action [accept | drop |
   jump | reject | return]

   This set the default action of the rule-set if no rule matched a packet
   criteria. If defacult-action is set to ``jump``, then
   ``default-jump-target`` is also needed.

.. cfgcmd:: set firewall name <name> default-jump-target <text>
.. cfgcmd:: set firewall ipv6-name <name> default-jump-target <text>

   To be used only when ``defult-action`` is set to ``jump``. Use this
   command to specify jump target for default rule.

.. cfgcmd:: set firewall name <name> enable-default-log
.. cfgcmd:: set firewall ipv6-name <name> enable-default-log

   Use this command to enable the logging of the default action.

.. cfgcmd:: set firewall name <name> rule <1-999999> action [accept | drop |
   jump | queue | reject | return]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> action [accept |
   drop | jump | queue | reject | return]

   This required setting defines the action of the current rule. If action
   is set to ``jump``, then ``jump-target`` is also needed.

.. cfgcmd:: set firewall name <name> rule <1-999999> jump-target <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> jump-target <text>

   To be used only when ``action`` is set to ``jump``. Use this
   command to specify jump target.

.. cfgcmd:: set firewall name <name> rule <1-999999> queue <0-65535>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> queue <0-65535>

   Use this command to set the target to use. Action queue must be defined
   to use this setting

.. cfgcmd:: set firewall name <name> rule <1-999999> queue-options
   <bypass-fanout>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> queue-options
   <bypass-fanout>

   Options used for queue target. Action queue must be defined to use this
   setting

.. cfgcmd:: set firewall name <name> rule <1-999999> description <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> description <text>

   Provide a description for each rule.

.. cfgcmd:: set firewall name <name> rule <1-999999> log [disable | enable]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> log [disable |
   enable]

   Enable or disable logging for the matched packet.

.. cfgcmd:: set firewall name <name> rule <1-999999> log-options level
   [emerg | alert | crit | err | warn | notice | info | debug]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> log-options level
   [emerg | alert | crit | err | warn | notice | info | debug]

   Define log-level. Only applicable if rule log is enable.

.. cfgcmd:: set firewall name <name> rule <1-999999> log-options group
   <0-65535>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> log-options group
   <0-65535>

   Define log group to send message to. Only applicable if rule log is enable.

.. cfgcmd:: set firewall name <name> rule <1-999999> log-options snaplen
   <0-9000>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> log-options snaplen
   <0-9000>

   Define length of packet payload to include in netlink message. Only
   applicable if rule log is enable and log group is defined.

.. cfgcmd:: set firewall name <name> rule <1-999999> log-options
   queue-threshold <0-65535>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> log-options
   queue-threshold <0-65535>

   Define number of packets to queue inside the kernel before sending them to
   userspace. Only applicable if rule log is enable and log group is defined.

.. cfgcmd:: set firewall name <name> rule <1-999999> disable
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> disable

   If you want to disable a rule but let it in the configuration.

Matching criteria
=================

There are a lot of matching criteria against which the package can be tested.

.. cfgcmd:: set firewall name <name> rule <1-999999> connection-status nat
   [destination | source]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> connection-status
   nat [destination | source]

   Match criteria based on nat connection status.

.. cfgcmd:: set firewall name <name> rule <1-999999> connection-mark
   <1-2147483647>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> connection-mark
   <1-2147483647>

   Match criteria based on connection mark.

.. cfgcmd:: set firewall name <name> rule <1-999999> source address
   [address | addressrange | CIDR]
.. cfgcmd:: set firewall name <name> rule <1-999999> destination address
   [address | addressrange | CIDR]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source address
   [address | addressrange | CIDR]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination address
   [address | addressrange | CIDR]

   This is similar to the network groups part, but here you are able to negate
   the matching addresses.

   .. code-block:: none

      set firewall name WAN-IN-v4 rule 100 source address 192.0.2.10-192.0.2.11
      # with a '!' the rule match everything except the specified subnet
      set firewall name WAN-IN-v4 rule 101 source address !203.0.113.0/24
      set firewall ipv6-name WAN-IN-v6 rule 100 source address 2001:db8::202

.. cfgcmd:: set firewall name <name> rule <1-999999> source address-mask
   [address]
.. cfgcmd:: set firewall name <name> rule <1-999999> destination address-mask
   [address]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source address-mask
   [address]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination
   address-mask [address]

   An arbitrary netmask can be applied to mask addresses to only match against
   a specific portion. This is particularly useful with IPv6 and a zone-based
   firewall as rules will remain valid if the IPv6 prefix changes and the host
   portion of systems IPv6 address is static (for example, with SLAAC or
   `tokenised IPv6 addresses
   <https://datatracker.ietf.org/doc/id/draft-chown-6man-tokenised-ipv6-identifiers-02.txt>`_).

   This functions for both individual addresses and address groups.

   .. stop_vyoslinter
   .. code-block:: none

      # Match any IPv6 address with the suffix ::0000:0000:0000:beef
      set firewall ipv6-name WAN-LAN-v6 rule 100 destination address ::beef
      set firewall ipv6-name WAN-LAN-v6 rule 100 destination address-mask ::ffff:ffff:ffff:ffff
      # Match any IPv4 address with `11` as the 2nd octet and `13` as the forth octet
      set firewall name WAN-LAN-v4 rule 100 destination address 0.11.0.13
      set firewall name WAN-LAN-v4 rule 100 destination address-mask 0.255.0.255
      # Address groups
      set firewall group ipv6-address-group WEBSERVERS address ::1000
      set firewall group ipv6-address-group WEBSERVERS address ::2000
      set firewall name WAN-LAN-v6 rule 200 source group address-group WEBSERVERS
      set firewall name WAN-LAN-v6 rule 200 source address-mask ::ffff:ffff:ffff:ffff
   .. start_vyoslinter

.. cfgcmd:: set firewall name <name> rule <1-999999> source fqdn <fqdn>
.. cfgcmd:: set firewall name <name> rule <1-999999> destination fqdn <fqdn>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source fqdn <fqdn>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination fqdn
   <fqdn>

   Specify a Fully Qualified Domain Name as source/destination matcher. Ensure
   router is able to resolve such dns query.

.. cfgcmd:: set firewall name <name> rule <1-999999> source geoip country-code
   <country>
.. cfgcmd:: set firewall name <name> rule <1-999999> source geoip inverse-match
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source geoip
   country-code <country>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source geoip
   inverse-match
.. cfgcmd:: set firewall name <name> rule <1-999999> destination geoip
   country-code <country>
.. cfgcmd:: set firewall name <name> rule <1-999999> destination geoip
   inverse-match
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination geoip
   country-code <country>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination geoip
   inverse-match

Match IP addresses based on its geolocation.
More info: `geoip matching
<https://wiki.nftables.org/wiki-nftables/index.php/GeoIP_matching>`_.

Use inverse-match to match anything except the given country-codes.

Data is provided by DB-IP.com under CC-BY-4.0 license. Attribution required,
permits redistribution so we can include a database in images(~3MB
compressed). Includes cron script (manually callable by op-mode update
geoip) to keep database and rules updated.

.. cfgcmd:: set firewall name <name> rule <1-999999> source mac-address
   <mac-address>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source mac-address
   <mac-address>

   Only in the source criteria, you can specify a mac-address.

   .. code-block:: none

      set firewall name LAN-IN-v4 rule 100 source mac-address 00:53:00:11:22:33
      set firewall name LAN-IN-v4 rule 101 source mac-address !00:53:00:aa:12:34

.. cfgcmd:: set firewall name <name> rule <1-999999> source port
   [1-65535 | portname | start-end]
.. cfgcmd:: set firewall name <name> rule <1-999999> destination port
   [1-65535 | portname | start-end]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source port
   [1-65535 | portname | start-end]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination port
   [1-65535 | portname | start-end]

   A port can be set with a port number or a name which is here
   defined: ``/etc/services``.

   .. code-block:: none

      set firewall name WAN-IN-v4 rule 10 source port '22'
      set firewall name WAN-IN-v4 rule 11 source port '!http'
      set firewall name WAN-IN-v4 rule 12 source port 'https'

   Multiple source ports can be specified as a comma-separated list.
   The whole list can also be "negated" using ``!``. For example:

   .. code-block:: none

      set firewall ipv6-name WAN-IN-v6 rule 10 source port '!22,https,3333-3338'

.. cfgcmd:: set firewall name <name> rule <1-999999> source group
   address-group <name | !name>
.. cfgcmd:: set firewall name <name> rule <1-999999> destination group
   address-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source group
   address-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination group
   address-group <name | !name>

   Use a specific address-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> source group
   network-group <name | !name>
.. cfgcmd:: set firewall name <name> rule <1-999999> destination group
   network-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source group
   network-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination group
   network-group <name | !name>

   Use a specific network-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> source group
   port-group <name | !name>
.. cfgcmd:: set firewall name <name> rule <1-999999> destination group
   port-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source group
   port-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination group
   port-group <name | !name>

   Use a specific port-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> source group
   domain-group <name | !name>
.. cfgcmd:: set firewall name <name> rule <1-999999> destination group
   domain-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source group
   domain-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination group
   domain-group <name | !name>

   Use a specific domain-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> source group
   mac-group <name | !name>
.. cfgcmd:: set firewall name <name> rule <1-999999> destination group
   mac-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> source group
   mac-group <name | !name>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> destination group
   mac-group <name | !name>

   Use a specific mac-group. Prepend character ``!`` for inverted matching
   criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> dscp [0-63 | start-end]
.. cfgcmd:: set firewall name <name> rule <1-999999> dscp-exclude [0-63 |
   start-end]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> dscp [0-63 |
   start-end]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> dscp-exclude [0-63 |
   start-end]

   Match based on dscp value.

.. cfgcmd:: set firewall name <name> rule <1-999999> fragment [match-frag |
   match-non-frag]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> fragment [match-frag
   | match-non-frag]

   Match based on fragment criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> icmp [code | type]
   <0-255>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> icmpv6 [code | type]
   <0-255>

   Match based on icmp|icmpv6 code and type.

.. cfgcmd:: set firewall name <name> rule <1-999999> icmp type-name <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> icmpv6 type-name
   <text>

   Match based on icmp|icmpv6 type-name criteria. Use tab for information
   about what **type-name** criteria are supported.

.. cfgcmd:: set firewall name <name> rule <1-999999> inbound-interface
   <iface>
.. cfgcmd:: set firewall name <name> rule <1-999999> outbound-interface
   <iface>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> inbound-interface
   <iface>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> outbound-interface
   <iface>

   Match based on inbound/outbound interface. Wilcard ``*`` can be used.
   For example: ``eth2*``

.. cfgcmd:: set firewall name <name> rule <1-999999> ipsec [match-ipsec
   | match-none]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> ipsec [match-ipsec
   | match-none]

   Match based on ipsec criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> limit burst
   <0-4294967295>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> limit burst
   <0-4294967295>

   Match based on the maximum number of packets to allow in excess of rate.

.. cfgcmd:: set firewall name <name> rule <1-999999> limit rate
   <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> limit rate
   <text>

   Match based on the maximum average rate, specified as **integer/unit**.
   For example **5/minutes**

.. cfgcmd:: set firewall name <name> rule <1-999999> packet-length
   <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> packet-length
   <text>
.. cfgcmd:: set firewall name <name> rule <1-999999> packet-length-exclude
   <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> packet-length-exclude
   <text>

   Match based on packet length criteria. Multiple values from 1 to 65535
   and ranges are supported.

.. cfgcmd:: set firewall name <name> rule <1-999999> packet-type
   [broadcast | host | multicast | other]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> packet-type
   [broadcast | host | multicast | other]

   Match based on packet type criteria.

.. cfgcmd:: set firewall name <name> rule <1-999999> protocol [<text> |
   <0-255> | all | tcp_udp]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> protocol [<text> |
   <0-255> | all | tcp_udp]

   Match a protocol criteria. A protocol number or a name which is here
   defined: ``/etc/protocols``.
   Special names are ``all`` for all protocols and ``tcp_udp`` for tcp and udp
   based packets. The ``!`` negate the selected protocol.

   .. code-block:: none

      set firewall name WAN-IN-v4 rule 10 protocol tcp_udp
      set firewall name WAN-IN-v4 rule 11 protocol !tcp_udp
      set firewall ipv6-name WAN-IN-v6 rule 10 protocol tcp

.. cfgcmd:: set firewall name <name> rule <1-999999> recent count <1-255>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> recent count <1-255>
.. cfgcmd:: set firewall name <name> rule <1-999999> recent time
   [second | minute | hour]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> recent time
   [second | minute | hour]

   Match bases on recently seen sources.

.. cfgcmd:: set firewall name <name> rule <1-999999> tcp flags <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> tcp flags <text>

   Allowed values fpr TCP flags: ``SYN``, ``ACK``, ``FIN``, ``RST``, ``URG``,
   ``PSH``, ``ALL`` When specifying more than one flag, flags should be comma
   separated. The ``!`` negate the selected protocol.

   .. code-block:: none

      set firewall name WAN-IN-v4 rule 10 tcp flags 'ACK'
      set firewall name WAN-IN-v4 rule 12 tcp flags 'SYN'
      set firewall name WAN-IN-v4 rule 13 tcp flags 'SYN,!ACK,!FIN,!RST'

.. cfgcmd:: set firewall name <name> rule <1-999999> state [established |
   invalid | new | related] [enable | disable]
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> state [established |
   invalid | new | related] [enable | disable]

   Match against the state of a packet.

.. cfgcmd:: set firewall name <name> rule <1-999999> time startdate <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> time startdate <text>
.. cfgcmd:: set firewall name <name> rule <1-999999> time starttime <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> time starttime <text>
.. cfgcmd:: set firewall name <name> rule <1-999999> time stopdate <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> time stopdate <text>
.. cfgcmd:: set firewall name <name> rule <1-999999> time stoptime <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> time stoptime <text>
.. cfgcmd:: set firewall name <name> rule <1-999999> time weekdays <text>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> time weekdays <text>

   Time to match the defined rule.

.. cfgcmd:: set firewall name <name> rule <1-999999> ttl <eq | gt | lt> <0-255>

   Match time to live parameter, where 'eq' stands for 'equal'; 'gt' stands for
   'greater than', and 'lt' stands for 'less than'.

.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> hop-limit <eq | gt |
   lt> <0-255>

   Match hop-limit parameter, where 'eq' stands for 'equal'; 'gt' stands for
   'greater than', and 'lt' stands for 'less than'.

.. cfgcmd:: set firewall name <name> rule <1-999999> recent count <1-255>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> recent count <1-255>
.. cfgcmd:: set firewall name <name> rule <1-999999> recent time <second |
   minute | hour>
.. cfgcmd:: set firewall ipv6-name <name> rule <1-999999> recent time <second |
   minute | hour>

   Match when 'count' amount of connections are seen within 'time'. These
   matching criteria can be used to block brute-force attempts.

***********************************
Applying a Rule-Set to an Interface
***********************************

A Rule-Set can be applied to every interface:

* ``in``: Ruleset for forwarded packets on an inbound interface
* ``out``: Ruleset for forwarded packets on an outbound interface
* ``local``: Ruleset for packets destined for this router

.. cfgcmd:: set firewall interface <interface> [in | out | local] [name |
   ipv6-name] <rule-set>


   Here are some examples for applying a rule-set to an interface

   .. code-block:: none

      set firewall interface eth1.100 in name LANv4-IN
      set firewall interface eth1.100 out name LANv4-OUT
      set firewall interface bond0 in name LANv4-IN
      set firewall interface vtun1 in name LANv4-IN
      set firewall interface eth2* in name LANv4-IN

   .. note::
      As you can see in the example here, you can assign the same rule-set to
      several interfaces. An interface can only have one rule-set per chain.

   .. note::
      You can use wildcard ``*`` to match a group of interfaces.

***********************
Operation-mode Firewall
***********************

Rule-set overview
=================

.. opcmd:: show firewall

   This will show you a basic firewall overview

   .. code-block:: none

      vyos@vyos:~$ show firewall

      ------------------------
      Firewall Global Settings
      ------------------------

      Firewall state-policy for all IPv4 and Ipv6 traffic

      state           action   log
      -----           ------   ---
      invalid         accept   disabled
      established     accept   disabled
      related         accept   disabled

      -----------------------------
      Rulesets Information
      -----------------------------
      --------------------------------------------------------------------------
      IPv4 Firewall "DMZv4-1-IN":

      Active on (eth0,IN)

      rule  action   proto     packets  bytes
      ----  ------   -----     -------  -----
      10    accept   icmp      0        0
      condition - saddr 10.1.0.0/24 daddr 0.0.0.0/0 LOG enabled

      10000 drop     all       0        0
      condition - saddr 0.0.0.0/0 daddr 0.0.0.0/0 LOG enabled

      --------------------------------------------------------------------------
      IPv4 Firewall "DMZv4-1-OUT":

      Active on (eth0,OUT)

      rule  action   proto     packets  bytes
      ----  ------   -----     -------  -----
      10    accept   tcp_udp   1        60
      condition - saddr 0.0.0.0/0 daddr 0.0.0.0/0 match-DST-PORT-GROUP DMZ-Ports /*
                  DMZv4-1-OUT-10 */LOG enabled

      11    accept   icmp      1        84
      condition - saddr 0.0.0.0/0 daddr 0.0.0.0/0 /* DMZv4-1-OUT-11 */LOG enabled

      10000 drop     all       6        360
      condition - saddr 0.0.0.0/0 daddr 0.0.0.0/0 LOG enabled

      --------------------------------------------------------------------------
      IPv4 Firewall "LANv4-IN":

      Inactive - Not applied to any interfaces or zones.

      rule  action   proto     packets  bytes
      ----  ------   -----     -------  -----
      10    accept   all       0        0
      condition - saddr 0.0.0.0/0 daddr 0.0.0.0/0 /* LANv4-IN-10 */

      10000 drop     all       0        0
      condition - saddr 0.0.0.0/0 daddr 0.0.0.0/0

.. opcmd:: show firewall summary

   This will show you a summary of rule-sets and groups

   .. code-block:: none

      vyos@vyos:~$ show firewall summary

      ------------------------
      Firewall Global Settings
      ------------------------

      Firewall state-policy for all IPv4 and Ipv6 traffic

      state           action   log
      -----           ------   ---
      invalid         accept   disabled
      related         accept   disabled
      established     accept   disabled

      ------------------------
      Firewall Rulesets
      ------------------------

      IPv4 name:

      Rule-set name             Description    References
      -------------             -----------    ----------
      DMZv4-1-OUT                              (eth0,OUT)
      DMZv4-1-IN                               (eth0,IN)

      ------------------------
      Firewall Groups
      ------------------------

      Port Groups:

      Group name                Description    References
      ----------                -----------    ----------
      DMZ-Ports                                DMZv4-1-OUT-10-destination

      Network Groups:

      Group name                Description    References
      ----------                -----------    ----------
      LANv4                                    LANv4-IN-10-source,
                                                DMZv4-1-OUT-10-source,
                                                DMZv4-1-OUT-11-source

.. opcmd:: show firewall statistics

   This will show you a statistic of all rule-sets since the last boot.

.. opcmd:: show firewall [name | ipv6name] <name> rule <1-999999>

   This command will give an overview of a rule in a single rule-set

.. opcmd:: show firewall group <name>

   Overview of defined groups. You see the type, the members, and where the
   group is used.

   .. code-block:: none

      vyos@vyos:~$ show firewall group DMZ-Ports
      Name       : DMZ-Ports
      Type       : port
      References : none
      Members    :
                  80
                  443
                  8080
                  8443

      vyos@vyos:~$ show firewall group LANv4
      Name       : LANv4
      Type       : network
      References : LANv4-IN-10-source
      Members    :
                  10.10.0.0/16

.. opcmd:: show firewall [name | ipv6name] <name>

   This command will give an overview of a single rule-set.

.. opcmd:: show firewall [name | ipv6name] <name> statistics

   This will show you a rule-set statistic since the last boot.

.. opcmd:: show firewall [name | ipv6name] <name> rule <1-999999>

   This command will give an overview of a rule in a single rule-set.


Zone-Policy Overview
====================

.. opcmd:: show zone-policy zone <name>

   Use this command to get an overview of a zone.

   .. code-block:: none

      vyos@vyos:~$ show zone-policy zone DMZ
      -------------------
      Name: DMZ

      Interfaces: eth0 eth1

      From Zone:
      name                                    firewall
      ----                                    --------
      LAN                                     DMZv4-1-OUT


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
     interface eth0 {
         in {
             name FROM-INTERNET
         }
     }
     all-ping enable
     broadcast-ping disable
     config-trap disable
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
     name FROM-INTERNET {
         default-action accept
         description "From the Internet"
         rule 10 {
             action accept
             description "Authorized Networks"
             protocol all
             source {
                 group {
                     network-group GOOD-NETWORKS
                 }
             }
         }
         rule 11 {
             action drop
             description "Bad Networks"
             protocol all
             source {
                 group {
                     network-group BAD-NETWORKS
                 }
             }
         }
         rule 30 {
             action drop
             description "BAD PORTS"
             destination {
                 group {
                     port-group BAD-PORTS
                 }
             }
             log enable
             protocol all
         }
     }
  }
  interfaces {
     ethernet eth1 {
         address dhcp
         description OUTSIDE
         duplex auto
     }
  }


Update geoip database
=====================

.. opcmd:: update geoip

   Command used to update GeoIP database and firewall sets.
