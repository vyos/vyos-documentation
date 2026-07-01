(dhcp-server)=

# DHCP Server

VyOS uses ISC DHCP server for both IPv4 and IPv6 address assignment.

## IPv4 server

The network topology is declared by shared-network-name and the subnet
declarations. The DHCP service can serve multiple shared networks, with each
shared network having 1 or more subnets. Each subnet must be present on an
interface. A range can be declared inside a subnet to define a pool of dynamic
addresses. Multiple ranges can be defined and can contain holes. Static
mappings can be set to assign "static" addresses to clients based on their MAC
address.

### Configuration

```{eval-rst}
.. cfgcmd:: set service dhcp-server hostfile-update

   Create DNS record per client lease, by adding clients to /etc/hosts file.
   Entry will have format: `<shared-network-name>_<hostname>.<domain-name>`
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server host-decl-name

   Will drop `<shared-network-name>_` from client DNS record, using only the
   host declaration name and domain: `<hostname>.<domain-name>`
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name>
   domain-name <domain-name>

   The domain-name parameter should be the domain name that will be appended to
   the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
   Option 015).

   This is the configuration parameter for the entire shared network definition.
   All subnets will inherit this configuration item if not specified locally.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name>
   domain-search <domain-name>

   The domain-name parameter should be the domain name used when completing DNS
   request where no full FQDN is passed. This option can be given multiple times
   if you need multiple search domains (DHCP Option 119).

   This is the configuration parameter for the entire shared network definition.
   All subnets will inherit this configuration item if not specified locally.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name>
   name-server <address>

   Inform client that the DNS server can be found at `<address>`.

   This is the configuration parameter for the entire shared network definition.
   All subnets will inherit this configuration item if not specified locally.

   Multiple DNS servers can be defined.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> ping-check

   When the DHCP server is considering dynamically allocating an IP address to a
   client, it first sends an ICMP Echo request (a ping) to the address being
   assigned. It waits for a second, and if no ICMP Echo response has been heard,
   it assigns the address.

   If a response is heard, the lease is abandoned, and the server does not
   respond to the client. The lease will remain abandoned for a minimum of
   abandon-lease-time seconds (defaults to 24 hours).

   If there are no free addresses but there are abandoned IP addresses, the
   DHCP server will attempt to reclaim an abandoned IP address regardless of the
   value of abandon-lease-time.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server listen-address <address>

   This configuration parameter lets the DHCP server to listen for DHCP
   requests sent to the specified address, it is only realistically useful for
   a server whose only clients are reached via unicasts, such as via DHCP relay
   agents.
```

#### Individual Client Subnet

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> authoritative

   This says that this device is the only DHCP server for this network. If other
   devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
   any device trying to request an IP address that is not valid for this
   network.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   default-router <address>

   This is a configuration parameter for the `<subnet>`, saying that as part of
   the response, tell the client that the default gateway can be reached at
   `<address>`.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   name-server <address>

   This is a configuration parameter for the subnet, saying that as part of the
   response, tell the client that the DNS server can be found at `<address>`.

   Multiple DNS servers can be defined.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   lease <time>

   Assign the IP address to this machine for `<time>` seconds.

   The default value is 86400 seconds which corresponds to one day.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   range <n> start <address>

   Create DHCP address range with a range id of `<n>`. DHCP leases are taken
   from this pool. The pool starts at address `<address>`.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   range <n> stop <address>

   Create DHCP address range with a range id of `<n>`. DHCP leases are taken
   from this pool. The pool stops with address `<address>`.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   exclude <address>

   Always exclude this address from any defined range. This address will never
   be assigned by the DHCP server.

   This option can be specified multiple times.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   domain-name <domain-name>

   The domain-name parameter should be the domain name that will be appended to
   the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
   Option 015).
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   domain-search <domain-name>

   The domain-name parameter should be the domain name used when completing DNS
   request where no full FQDN is passed. This option can be given multiple times
   if you need multiple search domains (DHCP Option 119).
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   ping-check

   When the DHCP server is considering dynamically allocating an IP address to a
   client, it first sends an ICMP Echo request (a ping) to the address being
   assigned. It waits for a second, and if no ICMP Echo response has been heard,
   it assigns the address.

   If a response is heard, the lease is abandoned, and the server does not
   respond to the client. The lease will remain abandoned for a minimum of
   abandon-lease-time seconds (defaults to 24 hours).

   If a there are no free addresses but there are abandoned IP addresses, the
   DHCP server will attempt to reclaim an abandoned IP address regardless of the
   value of abandon-lease-time.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet <subnet>
   enable-failover

   Enable DHCP failover configuration for this address pool.
```

#### High Availability

VyOS provides High Availability support for DHCP server. DHCP High
Availability can act in two different modes:

- **Active-active**: both DHCP servers will respond to DHCP requests. If
  `mode` is not defined, this is the default behavior.
- **Active-passive**: only `primary` server will respond to DHCP requests.
  If this server goes offline, then `secondary` server will take place.

DHCP High Availability must be configured explicitly by the following
statements on both servers:

```{eval-rst}
.. cfgcmd:: set service dhcp-server high-availability mode [active-active
   | active-passive]

   Define operation mode of High Availability feature. Default value if command
   is not specified is `active-active`
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server high-availability source-address <address>

   Local IP `<address>` used when communicating to the HA peer.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server high-availability remote <address>

   Remote peer IP `<address>` of the second DHCP server in this HA
   cluster.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server high-availability name <name>

   Define the name of the peer server to establish and identify the HA (High Availability) connection.
```

```{eval-rst}
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
```

#### Static mappings

You can specify a static DHCP assignment on a per host basis. You will need the
MAC address of the station and your desired IP address. The address must be
inside the subnet definition but can be outside of the range statement.

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet
   <subnet> static-mapping <description> mac-address <address>

   Create a new DHCP static mapping named `<description>` which is valid for
   the host identified by its MAC `<address>`.
```

```{eval-rst}
.. cfgcmd:: set service dhcp-server shared-network-name <name> subnet
   <subnet> static-mapping <description> ip-address <address>

   Static DHCP IP address assign to host identified by `<description>`. IP
   address must be inside the `<subnet>` which is defined but can be outside
   the dynamic range created with {cfgcmd}`set service dhcp-server
   shared-network-name <name> subnet <subnet> range <n>`. If no ip-address is
   specified, an IP from the dynamic pool is used.

   This is useful, for example, in combination with hostfile update.

   .. hint:: This is the equivalent of the host block in dhcpd.conf of
      isc-dhcpd.
```

**Example:**

- IP address `192.168.1.100` shall be statically mapped to
  client named `client1`

```none
set service dhcp-server shared-network-name 'NET1' subnet 192.168.1.0/24 static-mapping client1 ip-address 192.168.1.100
set service dhcp-server shared-network-name 'NET1' subnet 192.168.1.0/24 static-mapping client1 mac-address aa:bb:11:22:33:00
```

The configuration will look as follows:

```none
show service dhcp-server shared-network-name NET1
 subnet 192.168.1.0/24 {
     static-mapping client1 {
         ip-address 192.168.1.100
         mac-address aa:bb:11:22:33:00
     }
 }
```

### Options

```{eval-rst}
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
```

Multi: can be specified multiple times.

### Raw Parameters

Raw parameters can be passed to shared-network-name, subnet and static-mapping:

```none
set service dhcp-server shared-network-name <name> shared-network-parameters
   <text>       Additional shared-network parameters for DHCP server.
set service dhcp-server shared-network-name <name> subnet <subnet> subnet-parameters
   <text>       Additional subnet parameters for DHCP server.
set service dhcp-server shared-network-name <name> subnet <subnet> static-mapping <description> static-mapping-parameters
   <text>       Additional static-mapping parameters for DHCP server.
                Will be placed inside the "host" block of the mapping.
```

These parameters are passed as-is to isc-dhcp's dhcpd.conf under the
configuration node they are defined in. They are not validated so an error in
the raw parameters won't be caught by vyos's scripts and will cause dhcpd to
fail to start. Always verify that the parameters are correct before committing
the configuration. Refer to isc-dhcp's dhcpd.conf manual for more information:
<https://kb.isc.org/docs/isc-dhcp-44-manual-pages-dhcpdconf>

Quotes can be used inside parameter values by replacing all quote characters
with the string `&quot;`. They will be replaced with literal quote characters
when generating dhcpd.conf.

### Example

Please see the {ref}`dhcp-dns-quick-start` configuration.

(dhcp-server-v4-example-failover)=

#### High Availability

Configuration of a DHCP HA pair

- Setup DHCP HA for network 192.0.2.0/24
- Use active-active HA mode.
- Default gateway and DNS server is at `192.0.2.254`
- The primary DHCP server named dhcp-primary uses address `192.168.189.252`
- The secondary DHCP server named dhcp-secondary uses address `192.168.189.253`
- DHCP range spans from `192.168.189.10` - `192.168.189.250`

Common configuration, valid for both primary and secondary node.

```none
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 default-router '192.0.2.254'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 name-server '192.0.2.254'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 domain-name 'vyos.net'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 range 0 start '192.0.2.10'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 range 0 stop '192.0.2.250'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 enable-failover
```

**Primary**

```none
set service dhcp-server high-availability mode 'active-active'
set service dhcp-server high-availability source-address '192.168.189.252'
set service dhcp-server high-availability name 'dhcp-secondary'
set service dhcp-server high-availability remote '192.168.189.253'
set service dhcp-server high-availability status 'primary'
```

**Secondary**

```none
set service dhcp-server high-availability mode 'active-active'
set service dhcp-server high-availability source-address '192.168.189.253'
set service dhcp-server high-availability name 'dhcp-primary'
set service dhcp-server high-availability remote '192.168.189.252'
set service dhcp-server high-availability status 'secondary'
```

(dhcp-server-v4-example-raw)=

#### Raw Parameters

- Override static-mapping's name-server with a custom one that will be sent only
  to this host.
- An option that takes a quoted string is set by replacing all quote characters
  with the string `&quot;` inside the static-mapping-parameters value.
  The resulting line in dhcpd.conf will be
  `option pxelinux.configfile "pxelinux.cfg/01-00-15-17-44-2d-aa";`.

```none
set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping example static-mapping-parameters "option domain-name-servers 192.0.2.11, 192.0.2.12;"
set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping example static-mapping-parameters "option pxelinux.configfile &quot;pxelinux.cfg/01-00-15-17-44-2d-aa&quot;;"
```

#### Option 43 for UniFI

- These parameters need to be part of the DHCP global options.
  They stay unchanged.

```none
set service dhcp-server global-parameters 'option space ubnt;'
set service dhcp-server global-parameters 'option ubnt.unifi-address code 1 = ip-address;'
set service dhcp-server global-parameters 'class &quot;ubnt&quot; {'
set service dhcp-server global-parameters 'match if substring (option vendor-class-identifier, 0, 4) = &quot;ubnt&quot;;'
set service dhcp-server global-parameters 'option vendor-class-identifier &quot;ubnt&quot;;'
set service dhcp-server global-parameters 'vendor-option-space ubnt;'
set service dhcp-server global-parameters '}'
```

- Now we add the option to the scope, adapt to your setup

```none
set service dhcp-server shared-network-name example-scope subnet 10.1.1.0/24 subnet-parameters 'option ubnt.unifi-address 172.16.1.10;'
```

### Operation Mode

```{eval-rst}
.. opcmd:: show log dhcp server

   Show DHCP server daemon log file
```

```{eval-rst}
.. opcmd:: show log dhcp client

   Show logs from all DHCP client processes.
```

```{eval-rst}
.. opcmd:: show log dhcp client interface <interface>

   Show logs from specific `interface` DHCP client process.
```

```{eval-rst}
.. opcmd:: restart dhcp server

   Restart the DHCP server
```

```{eval-rst}
.. opcmd:: show dhcp server statistics

   Show the DHCP server statistics:
```

```none
vyos@vyos:~$ show dhcp server statistics
Pool           Size    Leases    Available  Usage
-----------  ------  --------  -----------  -------
dhcpexample      99         2           97  2%
```

```{eval-rst}
.. opcmd:: show dhcp server statistics pool <pool>

   Show the DHCP server statistics for the specified pool.
```

```{eval-rst}
.. opcmd:: show dhcp server leases

   Show statuses of all active leases:
```

```none
vyos@vyos:~$ show dhcp server leases
IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool      Hostname    Origin
--------------  -----------------  -------  -------------------  -------------------  -----------  --------  ----------  --------
192.168.11.134  00:50:79:66:68:09  active   2023/11/29 09:51:05  2023/11/29 10:21:05  0:24:10      LAN       VPCS1       local
192.168.11.133  50:00:00:06:00:00  active   2023/11/29 09:51:38  2023/11/29 10:21:38  0:24:43      LAN       VYOS-6      local
10.11.11.108    50:00:00:05:00:00  active   2023/11/29 09:51:43  2023/11/29 10:21:43  0:24:48      VIF-1001  VYOS5       local
192.168.11.135  00:50:79:66:68:07  active   2023/11/29 09:55:16  2023/11/29 09:59:16  0:02:21                            remote
vyos@vyos:~$
```

:::{hint}
Static mappings aren't shown. To show all states, use
`show dhcp server leases state all`.
:::

```{eval-rst}
.. opcmd:: show dhcp server leases origin [local | remote]

   Show statuses of all active leases granted by local (this server) or
   remote (failover server):
```

```none
vyos@vyos:~$ show dhcp server leases origin remote
IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool      Hostname    Origin
--------------  -----------------  -------  -------------------  -------------------  -----------  --------  ----------  --------
192.168.11.135  00:50:79:66:68:07  active   2023/11/29 09:55:16  2023/11/29 09:59:16  0:02:21                            remote
vyos@vyos:~$
```

```{eval-rst}
.. opcmd:: show dhcp server leases pool <pool>

   Show only leases in the specified pool.
```

```none
vyos@vyos:~$ show dhcp server leases pool LAN
IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool    Hostname    Origin
--------------  -----------------  -------  -------------------  -------------------  -----------  ------  ----------  --------
192.168.11.134  00:50:79:66:68:09  active   2023/11/29 09:51:05  2023/11/29 10:21:05  0:23:55      LAN     VPCS1       local
192.168.11.133  50:00:00:06:00:00  active   2023/11/29 09:51:38  2023/11/29 10:21:38  0:24:28      LAN     VYOS-6      local
vyos@vyos:~$
```

```{eval-rst}
.. opcmd:: show dhcp server leases sort <key>

   Sort the output by the specified key. Possible keys: ip, hardware_address,
   state, start, end, remaining, pool, hostname (default = ip)
```

```{eval-rst}
.. opcmd:: show dhcp server leases state <state>

   Show only leases with the specified state. Possible states: all, active,
   free, expired, released, abandoned, reset, backup (default = active)

```

## IPv6 server

VyOS also provides DHCPv6 server functionality which is described in this
section.

(dhcp-server-v6-config)=

### Configuration

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server preference <preference value>

   Clients receiving advertise messages from multiple servers choose the server
   with the highest preference value. The range for this value is ``0...255``.
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> lease-time {default | maximum | minimum}

   The default lease time for DHCPv6 leases is 24 hours. This can be changed by
   supplying a ``default-time``, ``maximum-time`` and ``minimum-time``. All
   values need to be supplied in seconds.
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> nis-domain <domain-name>

   A :abbr:`NIS (Network Information Service)` domain can be set to be used for
   DHCPv6 clients.
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> nisplus-domain <domain-name>

   The procedure to specify a :abbr:`NIS+ (Network Information Service Plus)`
   domain is similar to the NIS domain one:
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> nis-server <address>

   Specify a NIS server address for DHCPv6 clients.
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> nisplus-server <address>

   Specify a NIS+ server address for DHCPv6 clients.
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> sip-server <address | fqdn>

   Specify a :abbr:`SIP (Session Initiation Protocol)` server by IPv6
   address of Fully Qualified Domain Name for all DHCPv6 clients.
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> sntp-server-address <address>

   A SNTP server address can be specified for DHCPv6 clients.
```

#### Prefix Delegation

:::{note}
VyOS =< 1.4.3 does not add the prefixes to the routing table.
:::

To hand out individual prefixes to your clients the following configuration is
used:

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> prefix-delegation start <address> prefix-length <length>

   Hand out prefixes of size `<length>` to clients in subnet `<prefix>` when
   they request for prefix delegation.
```

```{eval-rst}
.. cfgcmd:: set service dhcpv6-server shared-network-name <name> subnet
   <prefix> prefix-delegation start <address> stop <address>

   Delegate prefixes from the range indicated by the start and stop qualifier.
```

**Example:**

To delegate /64's from a bigger /56

```none
set service dhcpv6-server shared-network-name MYNET subnet 2001:db8:0:1::/64 prefix-delegation start 2001:0db8:1:: prefix-length '64'
set service dhcpv6-server shared-network-name MYNET subnet 2001:db8:0:1::/64 prefix-delegation start 2001:0db8:1:: stop '2001:0db8:1:ff::'
```

#### Address pools

DHCPv6 address pools must be configured for the system to act as a DHCPv6
server. The following example describes a common scenario.

**Example:**

- A shared network named `NET1` serves subnet `2001:db8::/64`
- It is connected to `eth1`
- DNS server is located at `2001:db8::ffff`
- Address pool shall be `2001:db8::100` through `2001:db8::199`.
- Lease time will be left at the default value which is 24 hours

```none
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 address-range start 2001:db8::100 stop 2001:db8::199
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 name-server 2001:db8::ffff
```

The configuration will look as follows:

```none
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
```

(dhcp-server-v6-static-mapping)=

#### Static mappings

In order to map specific IPv6 addresses to specific hosts static mappings can
be created. The following example explains the process.

**Example:**

- IPv6 address `2001:db8::101` shall be statically mapped
- IPv6 prefix `2001:db8:0:101::/64` shall be statically mapped
- Host specific mapping shall be named `client1`

:::{hint}
The identifier is the device's DUID: colon-separated hex list (as
used by isc-dhcp option dhcpv6.client-id). If the device already has a
dynamic lease from the DHCPv6 server, its DUID can be found with `show
service dhcpv6 server leases`.
:::

```none
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 ipv6-address 2001:db8::101
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 ipv6-prefix 2001:db8:0:101::/64
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 identifier 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
```

The configuration will look as follows:


```none
show service dhcpv6-server shared-network-name NET1
 subnet 2001:db8::/64 {
     static-mapping client1 {
         identifier 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
         ipv6-address 2001:db8::101
         ipv6-prefix 2001:db8:0:101::/64
     }
 }
```


(dhcp-server-v6-op-cmd)=

### Operation Mode

```{eval-rst}
.. opcmd:: show log dhcpv6 server

   Show DHCPv6 server daemon log file
```

```{eval-rst}
.. opcmd:: show log dhcpv6 client

   Show logs from all DHCPv6 client processes.
```

```{eval-rst}
.. opcmd:: show log dhcpv6 client interface <interface>

   Show logs from specific `interface` DHCPv6 client process.
```

```{eval-rst}
.. opcmd:: restart dhcpv6 server

   To restart the DHCPv6 server
```

```{eval-rst}
.. opcmd:: show dhcpv6 server leases

   Shows status of all assigned leases:
```

```none
vyos@vyos:~$ show dhcpv6 server leases
IPv6 address   State    Last communication    Lease expiration     Remaining    Type           Pool   DUID
-------------  -------  --------------------  -------------------  -----------  -------------  -----  --------------------------------------------
2001:db8::101  active   2019/12/05 19:40:10   2019/12/06 07:40:10  11:45:21     non-temporary  NET1   00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
2001:db8::102  active   2019/12/05 14:01:23   2019/12/06 02:01:23  6:06:34      non-temporary  NET1   00:01:00:01:11:22:33:44:fa:fb:fc:fd:fe:ff
```

:::{hint}
Static mappings aren't shown. To show all states, use `show dhcp
server leases state all`.
:::

```{eval-rst}
.. opcmd:: show dhcpv6 server leases pool <pool>

   Show only leases in the specified pool.
```

```{eval-rst}
.. opcmd:: show dhcpv6 server leases sort <key>

   Sort the output by the specified key. Possible keys: expires, duid, ip,
   last_comm, pool, remaining, state, type (default = ip)
```

```{eval-rst}
.. opcmd:: show dhcpv6 server leases state <state>

   Show only leases with the specified state. Possible states: abandoned,
   active, all, backup, expired, free, released, reset (default = active)
```
