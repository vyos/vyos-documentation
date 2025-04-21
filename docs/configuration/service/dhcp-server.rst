.. _dhcp-server:

###########
DHCP Server
###########

VyOS uses Kea DHCP server for both IPv4 and IPv6 address assignment.

***********
IPv4 server
***********

The network topology is declared by shared-network-name and the subnet
declarations. The DHCP service can serve multiple shared networks, with each
shared network having 1 or more subnets. Each subnet must be present on an
interface. A range can be declared inside a subnet to define a pool of dynamic
addresses. Multiple ranges can be defined and can contain holes. Static
mappings can be set to assign "static" addresses to clients based on their MAC
address.

Configuration
=============

.. cfgcmd:: set service dhcp-server hostfile-update

   Create DNS record per client lease, by adding clients to /etc/hosts file.
   Entry will have format: `<shared-network-name>_<hostname>.<domain-name>`

.. cfgcmd:: set service dhcp-server shared-network-name <name> option domain-name <domain-name>

   The domain-name parameter should be the domain name that will be appended to
   the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
   Option 015).

   This is the configuration parameter for the entire shared network definition.
   All subnets will inherit this configuration item if not specified locally.

.. cfgcmd:: set service dhcp-server shared-network-name <name> option domain-search <domain-name>

   The domain-name parameter should be the domain name used when completing DNS
   request where no full FQDN is passed. This option can be given multiple times
   if you need multiple search domains (DHCP Option 119).

   This is the configuration parameter for the entire shared network definition.
   All subnets will inherit this configuration item if not specified locally.

.. cfgcmd:: set service dhcp-server shared-network-name <name> option name-server <address>

   Inform client that the DNS server can be found at `<address>`.

   This is the configuration parameter for the entire shared network definition.
   All subnets will inherit this configuration item if not specified locally. 
   Multiple DNS servers can be defined.

.. cfgcmd:: set service dhcp-server shared-network-name <name> option 
   vendor-option <option-name>

   This configuration parameter lets you specify a vendor-option for the 
   entire shared network definition. All subnets will inherit this 
   configuration item if not specified locally. An example for Ubiquiti is 
   shown below:

**Example:**

Pass address of Unifi controller at ``172.16.100.1`` to all clients of ``NET1``

.. code-block:: none

  set service dhcp-server shared-network-name 'NET1' option vendor-option  
  ubiquiti '172.16.100.1'

.. cfgcmd:: set service dhcp-server listen-address <address>

   This configuration parameter lets the DHCP server to listen for DHCP 
   requests sent to the specified address, it is only realistically useful for 
   a server whose only clients are reached via unicasts, such as via DHCP relay 
   agents.

Individual Client Subnet
-------------------------

.. cfgcmd:: set service dhcp-server shared-network-name <name> authoritative

   This says that this device is the only DHCP server for this network. If other
   devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
   any device trying to request an IP address that is not valid for this
   network.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   subnet-id <id>

   This configuration parameter is required and must be unique to each subnet.
   It is required to map subnets to lease file entries.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   option default-router <address>

   This is a configuration parameter for the `<subnet>`, saying that as part of
   the response, tell the client that the default gateway can be reached at
   `<address>`.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   option name-server <address>

   This is a configuration parameter for the subnet, saying that as part of the
   response, tell the client that the DNS server can be found at `<address>`.

   Multiple DNS servers can be defined.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   lease <time>

   Assign the IP address to this machine for `<time>` seconds.

   The default value is 86400 seconds which corresponds to one day.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   range <n> start <address>

   Create DHCP address range with a range id of `<n>`. DHCP leases are taken
   from this pool. The pool starts at address `<address>`.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   range <n> stop <address>

   Create DHCP address range with a range id of `<n>`. DHCP leases are taken
   from this pool. The pool stops with address `<address>`.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   exclude <address>

   Always exclude this address from any defined range. This address will never
   be assigned by the DHCP server.

   This option can be specified multiple times.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   option domain-name <domain-name>

   The domain-name parameter should be the domain name that will be appended to
   the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
   Option 015).

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   option domain-search <domain-name>

   The domain-name parameter should be the domain name used when completing DNS
   request where no full FQDN is passed. This option can be given multiple times
   if you need multiple search domains (DHCP Option 119).

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet> 
   option vendor-option <option-name>

   This configuration parameter lets you specify a vendor-option for the
   subnet specified within the shared network definition. An example for  
   Ubiquiti is shown below:

**Example:**

Create ``172.18.201.0/24`` as a subnet within ``NET1`` and pass address of  
Unifi controller at ``172.16.100.1`` to clients of that subnet.

.. code-block:: none

  set service dhcp-server shared-network-name 'NET1' subnet 
  '172.18.201.0/24' option vendor-option ubiquiti '172.16.100.1'


High Availability
-----------------

VyOS provides High Availability support for DHCP server. DHCP High
Availability can act in two different modes:

* **Active-active**: both DHCP servers will respond to DHCP requests. If
  ``mode`` is not defined, this is the default behavior.

* **Active-passive**: only ``primary`` server will respond to DHCP requests.
  If this server goes offline, then ``secondary`` server will take place.

DHCP High Availability must be configured explicitly by the following
statements on both servers:

.. cfgcmd:: set service dhcp-server high-availability mode [active-active
   | active-passive]

   Define operation mode of High Availability feature. Default value if command
   is not specified is `active-active`

.. cfgcmd:: set service dhcp-server high-availability source-address <address>

   Local IP `<address>` used when communicating to the HA peer.

.. cfgcmd:: set service dhcp-server high-availability remote <address>

   Remote peer IP `<address>` of the second DHCP server in this HA
   cluster.

.. cfgcmd:: set service dhcp-server high-availability name <name>

   A generic `<name>` referencing this sync service.

   .. note:: `<name>` must be identical on both sides!

.. cfgcmd:: set service dhcp-server high-availability status <primary
   | secondary>

   The primary and secondary statements determines whether the server is primary
   or secondary.

   .. note:: In order for the primary and the secondary DHCP server to keep
      their lease tables in sync, they must be able to reach each other on TCP
      port 647. If you have firewall rules in effect, adjust them accordingly.

   .. hint:: The dialogue between HA partners is neither encrypted nor
      authenticated. Since most DHCP servers exist within an organisation's own
      secure Intranet, this would be an unnecessary overhead. However, if you
      have DHCP HA peers whose communications traverse insecure networks,
      then we recommend that you consider the use of VPN tunneling between them
      to ensure that the HA partnership is immune to disruption
      (accidental or otherwise) via third parties.

Static mappings
---------------

You can specify a static DHCP assignment on a per host basis. You will need the
MAC address of the station and your desired IP address. The address must be
inside the subnet definition but can be outside of the range statement.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet
   <subnet> static-mapping <description> mac <address>

   Create a new DHCP static mapping named `<description>` which is valid for
   the host identified by its MAC `<address>`.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet
   <subnet> static-mapping <description> duid <identifier>

   Create a new DHCP static mapping named `<description>` which is valid for
   the host identified by its DHCP unique identifier (DUID) `<identifier>`.

.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet
   <subnet> static-mapping <description> ip-address <address>

   Static DHCP IP address assign to host identified by `<description>`. IP
   address must be inside the `<subnet>` which is defined but can be outside
   the dynamic range created with :cfgcmd:`set service dhcp-server
   shared-network-name <name> subnet <subnet> range <n>`. If no ip-address is
   specified, an IP from the dynamic pool is used.

   This is useful, for example, in combination with hostfile update.

   .. hint:: This is the equivalent of the host block in dhcpd.conf of
      isc-dhcpd.

**Example:**

* IP address ``192.168.1.100`` shall be statically mapped to client named ``client1``

.. code-block:: none

  set service dhcp-server shared-network-name 'NET1' subnet 192.168.1.0/24 subnet-id 1
  set service dhcp-server shared-network-name 'NET1' subnet 192.168.1.0/24 static-mapping client1 ip-address 192.168.1.100
  set service dhcp-server shared-network-name 'NET1' subnet 192.168.1.0/24 static-mapping client1 mac aa:bb:11:22:33:00

The configuration will look as follows:

.. code-block:: none

  show service dhcp-server shared-network-name NET1
   subnet 192.168.1.0/24 {
       static-mapping client1 {
           ip-address 192.168.1.100
           mac aa:bb:11:22:33:00
       }
       subnet-id 1
   }

Options
=======

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
     - Specifies the clients subnet mask as per RFC 950. If unset,
       subnet declaration is used.
     - N
   * - time-offset
     - 2
     - time-offset
     - Offset of the client's subnet in seconds from Coordinated
       Universal Time (UTC)
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
   * - name-server
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
   * - bootfile-size
     - 13
     - boot-size
     - Boot image length in 512-octet blocks
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

Example
=======

Please see the :ref:`dhcp-dns-quick-start` configuration.

.. _dhcp-server:v4_example_failover:

High Availability
-----------------

Configuration of a DHCP HA pair:

* Setup DHCP HA for network 192.0.2.0/24
* Use active-active HA mode.
* Default gateway and DNS server is at `192.0.2.254`
* The primary DHCP server uses address `192.168.189.252`
* The secondary DHCP server uses address `192.168.189.253`
* DHCP range spans from `192.168.189.10` - `192.168.189.250`

Common configuration, valid for both primary and secondary node.

.. code-block:: none

  set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 option default-router '192.0.2.254'
  set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 option name-server '192.0.2.254'
  set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 option domain-name 'vyos.net'
  set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 range 0 start '192.0.2.10'
  set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 range 0 stop '192.0.2.250'
  set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 subnet-id '1'


**Primary**

.. code-block:: none

  set service dhcp-server high-availability mode 'active-active'
  set service dhcp-server high-availability source-address '192.168.189.252'
  set service dhcp-server high-availability name 'NET-VYOS'
  set service dhcp-server high-availability remote '192.168.189.253'
  set service dhcp-server high-availability status 'primary'

**Secondary**

.. code-block:: none

  set service dhcp-server high-availability mode 'active-active'
  set service dhcp-server high-availability source-address '192.168.189.253'
  set service dhcp-server high-availability name 'NET-VYOS'
  set service dhcp-server high-availability remote '192.168.189.252'
  set service dhcp-server high-availability status 'secondary'

.. _dhcp-server:v4_example_raw:

Operation Mode
==============

.. opcmd:: show log dhcp server

   Show DHCP server daemon log file

.. opcmd:: show log dhcp client

   Show logs from all DHCP client processes.

.. opcmd:: show log dhcp client interface <interface>

   Show logs from specific `interface` DHCP client process.

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
  IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool      Hostname    Origin
  --------------  -----------------  -------  -------------------  -------------------  -----------  --------  ----------  --------
  192.168.11.134  00:50:79:66:68:09  active   2023/11/29 09:51:05  2023/11/29 10:21:05  0:24:10      LAN       VPCS1       local
  192.168.11.133  50:00:00:06:00:00  active   2023/11/29 09:51:38  2023/11/29 10:21:38  0:24:43      LAN       VYOS-6      local
  10.11.11.108    50:00:00:05:00:00  active   2023/11/29 09:51:43  2023/11/29 10:21:43  0:24:48      VIF-1001  VYOS5       local
  192.168.11.135  00:50:79:66:68:07  active   2023/11/29 09:55:16  2023/11/29 09:59:16  0:02:21                            remote
  vyos@vyos:~$

.. hint:: Static mappings aren't shown. To show all states, use
   ``show dhcp server leases state all``.

.. opcmd:: show dhcp server leases origin [local | remote]

   Show statuses of all active leases granted by local (this server) or
   remote (failover server):

.. code-block:: none

  vyos@vyos:~$ show dhcp server leases origin remote
  IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool      Hostname    Origin
  --------------  -----------------  -------  -------------------  -------------------  -----------  --------  ----------  --------
  192.168.11.135  00:50:79:66:68:07  active   2023/11/29 09:55:16  2023/11/29 09:59:16  0:02:21                            remote
  vyos@vyos:~$

.. opcmd:: show dhcp server leases pool <pool>

   Show only leases in the specified pool.

.. code-block:: none

  vyos@vyos:~$ show dhcp server leases pool LAN
  IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool    Hostname    Origin
  --------------  -----------------  -------  -------------------  -------------------  -----------  ------  ----------  --------
  192.168.11.134  00:50:79:66:68:09  active   2023/11/29 09:51:05  2023/11/29 10:21:05  0:23:55      LAN     VPCS1       local
  192.168.11.133  50:00:00:06:00:00  active   2023/11/29 09:51:38  2023/11/29 10:21:38  0:24:28      LAN     VYOS-6      local
  vyos@vyos:~$

.. opcmd:: show dhcp server leases sort <key>

   Sort the output by the specified key. Possible keys: ip, hardware_address,
   state, start, end, remaining, pool, hostname (default = ip)

.. opcmd:: show dhcp server leases state <state>

   Show only leases with the specified state. Possible states: all, active,
   free, expired, released, abandoned, reset, backup (default = active)


***********
IPv6 server
***********

VyOS also provides DHCPv6 server functionality which is described in this
section.

.. _dhcp-server:v6_config:

Configuration
=============

.. cfgcmd:: set service dhcpv6-server preference <preference value>

   Clients receiving advertise messages from multiple servers choose the server
   with the highest preference value. The range for this value is ``0...255``.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet <subnet>
   subnet-id <id>

   This configuration parameter is required and must be unique to each subnet.
   It is required to map subnets to lease file entries.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> lease-time {default | maximum | minimum}

   The default lease time for DHCPv6 leases is 24 hours. This can be changed by
   supplying a ``default-time``, ``maximum-time`` and ``minimum-time``. All
   values need to be supplied in seconds.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> option nis-domain <domain-name>

   A :abbr:`NIS (Network Information Service)` domain can be set to be used for
   DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> option nisplus-domain <domain-name>

   The procedure to specify a :abbr:`NIS+ (Network Information Service Plus)`
   domain is similar to the NIS domain one:

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> option nis-server <address>

   Specify a NIS server address for DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> option nisplus-server <address>

   Specify a NIS+ server address for DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> option sip-server <address | fqdn>

   Specify a :abbr:`SIP (Session Initiation Protocol)` server by IPv6
   address of Fully Qualified Domain Name for all DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> option sntp-server-address <address>

   A SNTP server address can be specified for DHCPv6 clients.

Prefix Delegation
-----------------

To hand out individual prefixes to your clients the following configuration is
used:


.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> prefix-delegation prefix <pd-prefix> prefix-length <lenght>

   Delegate prefixes from `<pd-prefix>` to clients in subnet `<prefix>`. Range
   is defined by `<lenght>` in bits, 32 to 64.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> prefix-delegation prefix <pd-prefix> delegated-length <lenght>

   Hand out prefixes of size `<length>` in bits from `<pd-prefix>` to clients
   in subnet `<prefix>` when the request for prefix delegation.

.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> prefix-delegation prefix <pd-prefix> excluded-prefix <exclude-prefix>

   Exclude `<exclude-prefix>` from `<pd-prefix>`.


.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> prefix-delegation prefix <pd-prefix> excluded-prefix-length <length> 

   Define lenght of exclude prefix in `<pd-prefix>`.

**Example:**

* A shared network named ``PD-NET`` serves subnet ``2001:db8::/64``.
* It is connected to ``eth1``.
* Address pool shall be ``2001:db8::100`` through ``2001:db8::199``.
* It hands out prefixes ``2001:db8:0:10::/64`` through ``2001:db8:0:1f::/64``.

.. code-block:: none

  set service dhcpv6-server shared-network-name 'PD-NET' interface 'eth1'
  set service dhcpv6-server shared-network-name 'PD-NET' subnet 2001:db8::/64 range 1 start 2001:db8::100
  set service dhcpv6-server shared-network-name 'PD-NET' subnet 2001:db8::/64 range 1 stop 2001:db8::199
  set service dhcpv6-server shared-network-name 'PD-NET' subnet 2001:db8::/64 prefix-delegation prefix 2001:db8:0:10:: delegated-length '64'
  set service dhcpv6-server shared-network-name 'PD-NET' subnet 2001:db8::/64 prefix-delegation prefix 2001:db8:0:10:: prefix-length '60'
  set service dhcpv6-server shared-network-name 'PD-NET' subnet 2001:db8::/64 subnet-id 1

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

  set service dhcpv6-server shared-network-name 'NET' interface 'eth1'
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 range 1 start 2001:db8::100
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 range 1 stop 2001:db8::199
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 option name-server 2001:db8::ffff
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 subnet-id 1

The configuration will look as follows:

.. code-block:: none

  show service dhcpv6-server
      shared-network-name NET1 {
          subnet 2001:db8::/64 {
             range 1 {
                start 2001:db8::100
                stop 2001:db8::199
             }
             option {
                name-server 2001:db8::ffff
             }
             subnet-id 1
          }
      }

.. _dhcp-server:v6_static_mapping:

Static mappings
---------------

In order to map specific IPv6 addresses to specific hosts static mappings can
be created. The following example explains the process.

**Example:**

* IPv6 address ``2001:db8::101`` shall be statically mapped
* IPv6 prefix ``2001:db8:0:101::/64`` shall be statically mapped
* Host specific mapping shall be named ``client1``

.. hint:: The identifier is the device's DUID: colon-separated hex list (as
   used by isc-dhcp option dhcpv6.client-id). If the device already has a
   dynamic lease from the DHCPv6 server, its DUID can be found with ``show
   service dhcpv6 server leases``. The DUID begins at the 5th octet (after the
   4th colon) of IAID_DUID.

.. code-block:: none

  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 ipv6-address 2001:db8::101
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 ipv6-prefix 2001:db8:0:101::/64
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 duid 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff

The configuration will look as follows:

.. stop_vyoslinter (00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff false positive)

.. code-block:: none

  show service dhcpv6-server shared-network-name NET1
   subnet 2001:db8::/64 {
       static-mapping client1 {
           duid 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
           ipv6-address 2001:db8::101
           ipv6-prefix 2001:db8:0:101::/64
       }
   }

.. start_vyoslinter

.. _dhcp-server:v6_op_cmd:

Operation Mode
==============

.. opcmd:: show log dhcpv6 server

   Show DHCPv6 server daemon log file

.. opcmd:: show log dhcpv6 client

   Show logs from all DHCPv6 client processes.

.. opcmd:: show log dhcpv6 client interface <interface>

   Show logs from specific `interface` DHCPv6 client process.

.. opcmd:: restart dhcpv6 server

   To restart the DHCPv6 server

.. opcmd:: show dhcpv6 server leases

   Shows status of all assigned leases:

.. code-block:: none

  vyos@vyos:~$ show dhcpv6 server leases
  IPv6 address      State    Last communication    Lease expiration     Remaining    Type   Pool      DUID
  ----------------  -------  --------------------  -------------------  -----------  -----  --------  --------------------------------------------
  2001:db8::101     active   2019/12/05 19:40:10   2019/12/06 07:40:10  11:45:21     IA_NA  NET1      98:76:54:32:00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
  2001:db8::102     active   2019/12/05 14:01:23   2019/12/06 02:01:23  6:06:34      IA_NA  NET1      87:65:43:21:00:01:00:01:11:22:33:44:fa:fb:fc:fd:fe:ff
  2001:db8:10::/64  active   2019/12/05 23:20:10   2019/12/06 11:40:10  11:45:21     IA_PD  PD-NET1   98:76:54:32:00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff


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
