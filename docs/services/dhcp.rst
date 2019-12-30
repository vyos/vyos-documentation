.. _dhcp:

#############
DHCP / DHCPv6
#############

VyOS uses ISC DHCPd for both IPv4 and IPv6 address assignment.

.. _dhcp-server:

DHCP Server
===========

The network topology is declared by shared-network-name and the subnet declarations.
The DHCP service can serve multiple shared networks, with each shared network having 1 or more subnets.
Each subnet must be present on an interface.
A range can be declared inside a subnet to define a pool of dynamic addresses.
Multiple ranges can be defined and can contain holes.
Static mappings can be set to assign "static" addresses to clients based on their MAC address.

Basic Example
-------------

In this example, we are offering address space in the 192.0.2.0/24 network.
We are using the network name `dhcpexample`.

.. code-block:: none

  set service dhcp-server shared-network-name dhcpexample authoritative
  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 default-router 192.0.2.1
  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 dns-server 192.0.2.1
  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 lease 86400
  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 range 0 start 192.0.2.100
  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 range 0 stop 192.0.2.199

The generated config will look like:

.. code-block:: none

  vyos@vyos# show service dhcp-server shared-network-name dhcpexample
  authoritative
  subnet 192.0.2.0/24 {
      default-router 192.0.2.1
      dns-server 192.0.2.1
      lease 86400
      range 0 {
          start 192.0.2.100
          stop 192.0.2.199
      }
  }

Explanation
^^^^^^^^^^^

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample authoritative

   This says that this device is the only DHCP server for this network. If other
   devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
   any device trying to request an IP address that is not valid for this
   network.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 default-router 192.0.2.1

   This is a configuration parameter for the subnet, saying that as part of the
   response, tell the client that I am the default router for this network.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 dns-server 192.0.2.1

   This is a configuration parameter for the subnet, saying that as part of the
   response, tell the client that I am the DNS server for this network. If you
   do not want to run a DNS server, you could also provide one of the public
   DNS servers, such as google's. You can add multiple entries by repeating the
   line.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 lease 86400

   Assign the IP address to this machine for 24 hours. It is unlikely you'd need
   to shorten this period, unless you are running a network with lots of devices
   appearing and disappearing.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 range 0 start 192.0.2.100

   Make a range of addresses available for clients starting from .100 [...]

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 range 0 stop 192.0.2.199

   [...] and ending at .199.

Failover
--------

VyOS provides support for DHCP failover. DHCP failover must be configured
explicitly by the following statements.

.. cfgcmd:: set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' failover local-address '192.0.2.1'

   Local IP address used when communicating to the failover peer.

.. cfgcmd:: set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' failover peer-address '192.0.2.2'

   Peer IP address of the second DHCP server in this failover cluster.

.. cfgcmd:: set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' failover name 'foo'

   A generic name referencing this sync service.

.. note:: `name` must be identical on both sides!

.. cfgcmd:: set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' failover status '{primary|secondary}'

   The primary and secondary statements determines whether the server is primary
   or secondary.

.. note:: In order for the primary and the secondary DHCP server to keep
   their lease tables in sync, they must be able to reach each other on TCP
   port 647. If you have firewall rules in effect, adjust them accordingly.

.. hint:: The dialogue between failover partners is neither encrypted nor
   authenticated. Since most DHCP servers exist within an organisation's own
   secure Intranet, this would be an unnecessary overhead. However, if you have
   DHCP failover peers whose communications traverse insecure networks, then we
   recommend that you consider the use of VPN tunneling between them to ensure
   that the failover partnership is immune to disruption (accidental or
   otherwise) via third parties.

Static mappings
---------------

You can specify a static DHCP assignment on a per host basis. You will need the
MAC address of the station and your desired IP address. The address must be
inside the subnet definition but can be outside of the range statement.

.. cfgcmd::  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping static-mapping-01 mac-address ff:ff:ff:ff:ff:ff

   Each host is uniquely identified by its MAC address.

.. cfgcmd::  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping static-mapping-01 ip-address 192.0.2.10

   IP address to assign to this host. It must be inside the subnet in which it
   is defined but can be outside the dynamic range. If ip-address is not
   specified, an IP from the dynamic pool (as specified by ``range``) is used.
   This is useful, for example, in combination with hostfile update.

.. hint:: This is the equivalent of the host block in dhcpd.conf of isc-dhcpd.

DHCP Options
------------

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet 192.0.2.0/24 default-router <address>

   Specify the default routers IPv4 address which should be used in this subnet.
   This can - of course - be a VRRP address (DHCP option 003).

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet 192.0.2.0/24 dns-server <address>

   Specify the DNS nameservers used (Option 006). This option may be used
   mulltiple times to specify additional DNS nameservers.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet 192.0.2.0/24 domain-name <domain-name>

   The domain-name parameter should be the domain name that will be appended to
   the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
   Option 015).

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet 192.0.2.0/24 domain-search <domain-name>

   The domain-name parameter should be the domain name used when completing DNS
   request where no full FQDN is passed. This option can be given multiple times
   if you need multiple search domains (DHCP Option 119).

.. list-table::
   :header-rows: 1
   :stub-columns: 0
   :widths: 12 7 23 40 20

   * - Setting name
     - Option number
     - ISC-DHCP Option name
     - Option description
     - Multi
   * - client-prefix-length
     - 1
     - subnet-mask
     - Specifies the clients subnet mask as per RFC 950. If unset, subnet declaration is used.
     - N
   * - time-offset
     - 2
     - time-offset
     - Offset of the client's subnet in seconds from Coordinated Universal Time (UTC)
     - N
   * - default-router
     - 3
     - routers
     - IPv4 address of router on the client's subnet
     - N
   * - time-server
     - 4
     - time-servers
     - RFC 868 time server IPv4 address
     - Y
   * - dns-server
     - 6
     - domain-name-servers
     - DNS server IPv4 address
     - Y
   * - domain-name
     - 15
     - domain-name
     - Client domain name
     - Y
   * - ip-forwarding
     - 19
     - ip-forwarding
     - Enable IP forwarding on client
     - N
   * - ntp-server
     - 42
     - ntp-servers
     - IP address of NTP server
     - Y
   * - wins-server
     - 44
     - netbios-name-servers
     - NetBIOS over TCP/IP name server
     - Y
   * - server-identifier
     - 54
     - dhcp-server-identifier
     - IP address for DHCP server identifier
     - N
   * - bootfile-server
     - siaddr
     - next-server
     - IPv4 address of next bootstrap server
     - N
   * - tftp-server-name
     - 66
     - tftp-server-name
     - Name or IPv4 address of TFTP server
     - N
   * - bootfile-name
     - 67
     - bootfile-name, filename
     - Bootstrap file name
     - N
   * - smtp-server
     - 69
     - smtp-server
     - IP address of SMTP server
     - Y
   * - pop-server
     - 70
     - pop-server
     - IP address of POP3 server
     - Y
   * - domain-search
     - 119
     - domain-search
     - Client domain search
     - Y
   * - static-route
     - 121, 249
     - rfc3442-static-route, windows-static-route
     - Classless static route
     - N
   * - wpad-url
     - 252
     - wpad-url, wpad-url code 252 = text
     - Web Proxy Autodiscovery (WPAD) URL
     - N
   * - lease
     -
     - default-lease-time, max-lease-time
     - Lease timeout in seconds (default: 86400)
     - N
   * - range
     -
     - range
     - DHCP lease range
     - Y
   * - exclude
     -
     -
     - IP address to exclude from DHCP lease range
     - Y
   * - failover
     -
     -
     - DHCP failover parameters
     -
   * - static-mapping
     -
     -
     - Name of static mapping
     - Y

Multi: can be specified multiple times.

Raw parameters
--------------

Raw parameters can be passed to shared-network-name, subnet and static-mapping:

.. code-block:: none

  set service dhcp-server shared-network-name dhcpexample shared-network-parameters
     <text>       Additional shared-network parameters for DHCP server.
  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 subnet-parameters
     <text>       Additional subnet parameters for DHCP server.
  set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping example static-mapping-parameters
     <text>       Additional static-mapping parameters for DHCP server.
                  Will be placed inside the "host" block of the mapping.

These parameters are passed as-is to isc-dhcp's dhcpd.conf under the configuration node they are defined in.
They are not validated so an error in the raw parameters won't be caught by vyos's scripts and will cause dhcpd to fail to start.
Always verify that the parameters are correct before commiting the configuration.
Refer to isc-dhcp's dhcpd.conf manual for more information:
https://kb.isc.org/docs/isc-dhcp-44-manual-pages-dhcpdconf

Quotes can be used inside parameter values by replacing all quote characters 
with the string ``&quot;``. They will be replaced with literal quote characters
when generating dhcpd.conf.

Example
^^^^^^^

.. opcmd:: set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping example static-mapping-parameters "option domain-name-servers 192.0.2.11, 192.0.2.12;"

   Override the static-mapping's dns-server with a custom one that will be sent
   only to this host.

.. opcmd:: set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping example static-mapping-parameters "option pxelinux.configfile &quot;pxelinux.cfg/01-00-15-17-44-2d-aa&quot;;"

   An option that takes a quoted string is set by replacing all quote characters
   with the string ``&quot;`` inside the static-mapping-parameters value.
   The resulting line in dhcpd.conf will be
   ``option pxelinux.configfile "pxelinux.cfg/01-00-15-17-44-2d-aa";``.

Operation Mode
--------------

.. opcmd:: restart dhcp server

   Restart the DHCP server

.. opcmd:: show dhcp server statistics

   Show the DHCP server statistics:

.. code-block:: none

  vyos@vyos:~$ show dhcp server statistics
  Pool           Size    Leases    Available  Usage
  -----------  ------  --------  -----------  -------
  dhcpexample      99         2           97  2%

.. opcmd:: show dhcp server statistics pool <pool>

   Show the DHCP server statistics for the specified pool.

.. opcmd:: show dhcp server leases

   Show statuses of all active leases:

.. code-block:: none

  vyos@vyos:~$ show dhcp server leases
  IP address      Hardware address    State    Lease start          Lease expiration     Remaining   Pool         Hostname
  --------------  ------------------  -------  -------------------  -------------------  ----------  -----------  ---------
  192.0.2.104     aa:bb:cc:dd:ee:ff   active   2019/12/05 14:24:23  2019/12/06 02:24:23  6:05:35     dhcpexample  test1
  192.0.2.115     ab:ac:ad:ae:af:bf   active   2019/12/05 18:02:37  2019/12/06 06:02:37  9:43:49     dhcpexample  test2

.. hint:: Static mappings aren't shown. To show all states, use
   ``show dhcp server leases state all``.

.. opcmd:: show dhcp server leases pool <pool>

   Show only leases in the specified pool.

.. opcmd:: show dhcp server leases sort <key>

   Sort the output by the specified key. Possible keys: ip, hardware_address,
   state, start, end, remaining, pool, hostname (default = ip)

.. opcmd:: show dhcp server leases state <state>

   Show only leases with the specified state. Possible states: all, active,
   free, expired, released, abandoned, reset, backup (default = active)

DHCPv6 Server
=============

VyOS also provides DHCPv6 server functionality which is described in this
section.

Configuration Options
---------------------

.. cfgcmd:: set service dhcpv6-server preference <preference value>

   Clients receiving advertise messages from multiple servers choose the server
   with the highest preference value. The range for this value is ``0...255``.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> lease-time {default | maximum | minimum}

   The default lease time for DHCPv6 leases is 24 hours. This can be changed by
   supplying a ``default-time``, ``maximum-time`` and ``minimum-time``. All
   values need to be supplied in seconds.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> nis-domain <domain-name>

   A :abbr:`NIS (Network Information Service)` domain can be set to be used for
   DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> nisplus-domain <domain-name>

   The procedure to specify a :abbr:`NIS+ (Network Information Service Plus)`
   domain is similar to the NIS domain one:

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> nis-server <address>

   Specify a NIS server address for DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> nisplus-server <address>

   Specify a NIS+ server address for DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> sip-server-address <address>

   Specify a :abbr:`SIP (Session Initiation Protocol)` server by IPv6 address
   for all DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> sip-server-name <fqdn>

   Specify a :abbr:`SIP (Session Initiation Protocol)` server by FQDN for all
   DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <prefix> sntp-server-address <address>

   A SNTP server address can be specified for DHCPv6 clients.

Address pools
-------------

DHCPv6 address pools must be configured for the system to act as a DHCPv6
server. The following example describes a common scenario.

**Example:**

* A shared network named ``NET1`` serves subnet ``2001:db8::/64``
* It is connected to ``eth1``
* DNS server is located at ``2001:db8::ffff``
* Address pool shall be ``2001:db8::100`` through ``2001:db8::199``.
* Lease time will be left at the default value which is 24 hours

.. code-block:: none

  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 address-range start 2001:db8::100 stop 2001:db8::199
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 name-server 2001:db8::ffff

The configuration will look as follows:

.. code-block:: none

  show service dhcpv6-server
      shared-network-name NET1 {
          subnet 2001:db8::/64 {
             address-range {
                start 2001:db8::100 {
                   stop 2001:db8::199
                }
             }
             name-server 2001:db8::ffff
          }
      }

Static mappings
^^^^^^^^^^^^^^^

In order to map specific IPv6 addresses to specific hosts static mappings can
be created. The following example explains the process.

**Example:**

* IPv6 address ``2001:db8::101`` shall be statically mapped
* Host specific mapping shall be named ``client1``

.. hint:: The identifier is the device's DUID: colon-separated hex list (as
   used by isc-dhcp option dhcpv6.client-id). If the device already has a
   dynamic lease from the DHCPv6 server, its DUID can be found with ``show
   service dhcpv6 server leases``. The DUID begins at the 5th octet (after the
   4th colon) of IAID_DUID.

.. code-block:: none

  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 ipv6-address 2001:db8::101
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 identifier 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff

The configuration will look as follows:

.. code-block:: none

  show service dhcp-server shared-network-name NET1
     shared-network-name NET1 {
         subnet 2001:db8::/64 {
            name-server 2001:db8:111::111
            address-range {
                start 2001:db8::100 {
                   stop 2001:db8::199 {
                }
            }
            static-mapping client1 {
               ipv6-address 2001:db8::101
               identifier 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
            }
         }
      }

Operation Mode
--------------

.. opcmd:: restart dhcpv6 server

   To restart the DHCPv6 server

.. opcmd:: show dhcpv6 server status

   To show the current status of the DHCPv6 server.

.. opcmd:: show dhcpv6 server leases

   Show statuses of all assigned leases:

.. code-block:: none

  vyos@vyos:~$ show dhcpv6 server leases
  IPv6 address   State    Last communication    Lease expiration     Remaining    Type           Pool   IAID_DUID
  -------------  -------  --------------------  -------------------  -----------  -------------  -----  --------------------------------------------
  2001:db8::101  active   2019/12/05 19:40:10   2019/12/06 07:40:10  11:45:21     non-temporary  NET1   98:76:54:32:00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
  2001:db8::102  active   2019/12/05 14:01:23   2019/12/06 02:01:23  6:06:34      non-temporary  NET1   87:65:43:21:00:01:00:01:11:22:33:44:fa:fb:fc:fd:fe:ff

.. hint:: Static mappings aren't shown. To show all states, use ``show dhcp
   server leases state all``.

.. opcmd:: show dhcpv6 server leases pool <pool>

   Show only leases in the specified pool.

.. opcmd:: show dhcpv6 server leases sort <key>

   Sort the output by the specified key. Possible keys: expires, iaid_duid, ip,
   last_comm, pool, remaining, state, type (default = ip)

.. opcmd:: show dhcpv6 server leases state <state>

   Show only leases with the specified state. Possible states: abandoned,
   active, all, backup, expired, free, released, reset (default = active)

DHCP Relay
==========

If you want your router to forward DHCP requests to an external DHCP server
you can configure the system to act as a DHCP relay agent. The DHCP relay
agent works with IPv4 and IPv6 addresses.

All interfaces used for the DHCP relay must be configured. See
https://wiki.vyos.net/wiki/Network_address_setup.


Configuration
-------------

.. cfgcmd:: set service dhcp-relay interface <interface>

   Enable the DHCP relay service on the given interface.

.. cfgcmd:: set service dhcp-relay server 10.0.1.4

   Configure IP address of the DHCP server

.. cfgcmd:: set service dhcp-relay relay-options relay-agents-packets discard

   The router should discard DHCP packages already containing relay agent
   information to ensure that only requests from DHCP clients are forwarded.

Example
-------

* Use interfaces ``eth1`` and ``eth2`` for DHCP relay
* Router receives DHCP client requests on ``eth1`` and relays them through
  ``eth2``
* DHCP server is located at IPv4 address 10.0.1.4.

.. figure:: /_static/images/service_dhcp-relay01.png
   :scale: 80 %
   :alt: DHCP relay example

   DHCP relay example

The generated configuration will look like:

.. code-block:: none

  show service dhcp-relay
      interface eth1
      interface eth2
      server 10.0.1.4
      relay-options {
         relay-agents-packets discard
      }

Options
-------

.. cfgcmd:: set service dhcp-relay relay-options hop-count 'count'

   Set the maximum hop count before packets are discarded. Range 0...255,
   default 10.

.. cfgcmd:: set service dhcp-relay relay-options max-size 'size'

   Set maximum size of DHCP packets including relay agent information. If a
   DHCP packet size surpasses this value it will be forwarded without appending
   relay agent information. Range 64...1400, default 576.

.. cfgcmd:: set service dhcp-relay relay-options relay-agents-packet 'policy'

   Four policies for reforwarding DHCP packets exist:

   * **append:** The relay agent is allowed to append its own relay information
     to a received DHCP packet, disregarding relay information already present in
     the packet.

   * **discard:** Received packets which already contain relay information will
     be discarded.

   * **forward:** All packets are forwarded, relay information already present
     will be ignored.

   * **replace:** Relay information already present in a packet is stripped and
     replaced with the router's own relay information set.

Operation
---------

.. opcmd:: restart dhcp relay-agent

   Restart DHCP relay service

DHCPv6 relay
============

Configuration
-------------

.. cfgcmd:: set service dhcpv6-relay listen-interface eth1

   Set eth1 to be the listening interface for the DHCPv6 relay:

.. cfgcmd:: set service dhcpv6-relay upstream-interface eth2 address 2001:db8::4

   Set eth2 to be the upstream interface and specify the IPv6 address of
   the DHCPv6 server:

Example
^^^^^^^

* DHCPv6 requests are received by the router on `listening interface` ``eth1``
* Requests are forwarded through ``eth2`` as the `upstream interface`
* External DHCPv6 server is at 2001:db8::4

.. figure:: /_static/images/service_dhcpv6-relay01.png
   :scale: 80 %
   :alt: DHCPv6 relay example

   DHCPv6 relay example

The generated configuration will look like:

.. code-block:: none

  commit
  show service dhcpv6-relay
      listen-interface eth1 {
      }
      upstream-interface eth2 {
         address 2001:db8::4
      }

Options
-------

.. cfgcmd:: set service dhcpv6-relay max-hop-count 'count'

   Set maximum hop count before packets are discarded, default: 10

.. cfgcmd:: set service dhcpv6-relay use-interface-id-option

   If this is set the relay agent will insert the interface ID. This option is
   set automatically if more than one listening interfaces are in use.

Operation
---------

.. opcmd:: show dhcpv6 relay-agent status

   Show the current status of the DHCPv6 relay agent:

.. opcmd:: restart dhcpv6 relay-agent

   Restart DHCPv6 relay agent immediately.
