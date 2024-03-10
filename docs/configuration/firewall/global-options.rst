:lastproofread: 2023-12-26

.. _firewall-global-options-configuration:

#####################################
Global Options Firewall Configuration
#####################################

********
Overview
********

Some firewall settings are global and have an affect on the whole system.
In this section there's useful information about these global-options that can
be configured using vyos cli.

Configuration commands covered in this section:

.. cfgcmd:: set firewall global-options ...

*************
Configuration
*************

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

.. cfgcmd:: set firewall global-options state-policy established action
   [accept | drop | reject]

.. cfgcmd:: set firewall global-options state-policy established log

.. cfgcmd:: set firewall global-options state-policy established log-level
   [emerg | alert | crit | err | warn | notice | info | debug]

   Set the global setting for an established connection.

.. cfgcmd:: set firewall global-options state-policy invalid action
   [accept | drop | reject]

.. cfgcmd:: set firewall global-options state-policy invalid log

.. cfgcmd:: set firewall global-options state-policy invalid log-level
   [emerg | alert | crit | err | warn | notice | info | debug]

   Set the global setting for invalid packets.

.. cfgcmd:: set firewall global-options state-policy related action
   [accept | drop | reject]

.. cfgcmd:: set firewall global-options state-policy related log

.. cfgcmd:: set firewall global-options state-policy related log-level
   [emerg | alert | crit | err | warn | notice | info | debug]

   Set the global setting for related connections.
