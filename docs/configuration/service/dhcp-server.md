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

<div class="cfgcmd">

set service dhcp-server hostfile-update

Create DNS record per client lease, by adding clients to /etc/hosts file.
Entry will have format: <span class="title-ref">\<shared-network-name\>\_\<hostname\>.\<domain-name\></span>

</div>

<div class="cfgcmd">

set service dhcp-server host-decl-name

Will drop <span class="title-ref">\<shared-network-name\>\_</span> from client DNS record, using only the
host declaration name and domain: <span class="title-ref">\<hostname\>.\<domain-name\></span>

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\>
domain-name \<domain-name\>

The domain-name parameter should be the domain name that will be appended to
the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
Option 015).

This is the configuration parameter for the entire shared network definition.
All subnets will inherit this configuration item if not specified locally.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\>
domain-search \<domain-name\>

The domain-name parameter should be the domain name used when completing DNS
request where no full FQDN is passed. This option can be given multiple times
if you need multiple search domains (DHCP Option 119).

This is the configuration parameter for the entire shared network definition.
All subnets will inherit this configuration item if not specified locally.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\>
name-server \<address\>

Inform client that the DNS server can be found at <span class="title-ref">\<address\></span>.

This is the configuration parameter for the entire shared network definition.
All subnets will inherit this configuration item if not specified locally.

Multiple DNS servers can be defined.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> ping-check

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

</div>

<div class="cfgcmd">

set service dhcp-server listen-address \<address\>

This configuration parameter lets the DHCP server to listen for DHCP
requests sent to the specified address, it is only realistically useful for
a server whose only clients are reached via unicasts, such as via DHCP relay
agents.

</div>

#### Individual Client Subnet

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> authoritative

This says that this device is the only DHCP server for this network. If other
devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
any device trying to request an IP address that is not valid for this
network.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
default-router \<address\>

This is a configuration parameter for the <span class="title-ref">\<subnet\></span>, saying that as part of
the response, tell the client that the default gateway can be reached at
<span class="title-ref">\<address\></span>.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
name-server \<address\>

This is a configuration parameter for the subnet, saying that as part of the
response, tell the client that the DNS server can be found at <span class="title-ref">\<address\></span>.

Multiple DNS servers can be defined.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
lease \<time\>

Assign the IP address to this machine for <span class="title-ref">\<time\></span> seconds.

The default value is 86400 seconds which corresponds to one day.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
range \<n\> start \<address\>

Create DHCP address range with a range id of <span class="title-ref">\<n\></span>. DHCP leases are taken
from this pool. The pool starts at address <span class="title-ref">\<address\></span>.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
range \<n\> stop \<address\>

Create DHCP address range with a range id of <span class="title-ref">\<n\></span>. DHCP leases are taken
from this pool. The pool stops with address <span class="title-ref">\<address\></span>.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
exclude \<address\>

Always exclude this address from any defined range. This address will never
be assigned by the DHCP server.

This option can be specified multiple times.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
domain-name \<domain-name\>

The domain-name parameter should be the domain name that will be appended to
the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
Option 015).

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
domain-search \<domain-name\>

The domain-name parameter should be the domain name used when completing DNS
request where no full FQDN is passed. This option can be given multiple times
if you need multiple search domains (DHCP Option 119).

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
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

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet \<subnet\>
enable-failover

Enable DHCP failover configuration for this address pool.

</div>

#### High Availability

VyOS provides High Availability support for DHCP server. DHCP High
Availability can act in two different modes:

- **Active-active**: both DHCP servers will respond to DHCP requests. If
  `mode` is not defined, this is the default behavior.
- **Active-passive**: only `primary` server will respond to DHCP requests.
  If this server goes offline, then `secondary` server will take place.

DHCP High Availability must be configured explicitly by the following
statements on both servers:

<div class="cfgcmd">

set service dhcp-server high-availability mode \[active-active
| active-passive\]

Define operation mode of High Availability feature. Default value if command
is not specified is <span class="title-ref">active-active</span>

</div>

<div class="cfgcmd">

set service dhcp-server high-availability source-address \<address\>

Local IP <span class="title-ref">\<address\></span> used when communicating to the HA peer.

</div>

<div class="cfgcmd">

set service dhcp-server high-availability remote \<address\>

Remote peer IP <span class="title-ref">\<address\></span> of the second DHCP server in this HA
cluster.

</div>

<div class="cfgcmd">

set service dhcp-server high-availability name \<name\>

Define the name of the peer server to establish and identify the HA (High Availability) connection.

</div>

<div class="cfgcmd">

set service dhcp-server high-availability status \<primary
| secondary\>

The primary and secondary statements determines whether the server is primary
or secondary.

<div class="note">

<div class="title">

Note

</div>

In order for the primary and the secondary DHCP server to keep
their lease tables in sync, they must be able to reach each other on TCP
port 647. If you have firewall rules in effect, adjust them accordingly.

</div>

<div class="hint">

<div class="title">

Hint

</div>

The dialogue between HA partners is neither encrypted nor
authenticated. Since most DHCP servers exist within an organisation's own
secure Intranet, this would be an unnecessary overhead. However, if you
have DHCP HA peers whose communications traverse insecure networks,
then we recommend that you consider the use of VPN tunneling between them
to ensure that the HA partnership is immune to disruption
(accidental or otherwise) via third parties.

</div>

</div>

#### Static mappings

You can specify a static DHCP assignment on a per host basis. You will need the
MAC address of the station and your desired IP address. The address must be
inside the subnet definition but can be outside of the range statement.

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet
\<subnet\> static-mapping \<description\> mac-address \<address\>

Create a new DHCP static mapping named <span class="title-ref">\<description\></span> which is valid for
the host identified by its MAC <span class="title-ref">\<address\></span>.

</div>

<div class="cfgcmd">

set service dhcp-server shared-network-name \<name\> subnet
\<subnet\> static-mapping \<description\> ip-address \<address\>

Static DHCP IP address assign to host identified by <span class="title-ref">\<description\></span>. IP
address must be inside the <span class="title-ref">\<subnet\></span> which is defined but can be outside
the dynamic range created with `set service dhcp-server
shared-network-name <name> subnet <subnet> range <n>`. If no ip-address is
specified, an IP from the dynamic pool is used.

This is useful, for example, in combination with hostfile update.

<div class="hint">

<div class="title">

Hint

</div>

This is the equivalent of the host block in dhcpd.conf of
isc-dhcpd.

</div>

</div>

**Example:**

- IP address `192.168.1.100` shall be statically mapped to
  client named `client1`

``` none
set service dhcp-server shared-network-name 'NET1' subnet 192.168.1.0/24 static-mapping client1 ip-address 192.168.1.100
set service dhcp-server shared-network-name 'NET1' subnet 192.168.1.0/24 static-mapping client1 mac-address aa:bb:11:22:33:00
```

The configuration will look as follows:

``` none
show service dhcp-server shared-network-name NET1
 subnet 192.168.1.0/24 {
     static-mapping client1 {
         ip-address 192.168.1.100
         mac-address aa:bb:11:22:33:00
     }
 }
```

### Options

<table>
<colgroup>
<col style="width: 11%" />
<col style="width: 6%" />
<col style="width: 22%" />
<col style="width: 39%" />
<col style="width: 19%" />
</colgroup>
<thead>
<tr>
<th>Setting name</th>
<th>Option number</th>
<th>ISC-DHCP Option name</th>
<th>Option description</th>
<th>Multi</th>
</tr>
</thead>
<tbody>
<tr>
<td>client-prefix-length</td>
<td>1</td>
<td>subnet-mask</td>
<td>Specifies the clients subnet mask as per RFC 950. If unset,
subnet declaration is used.</td>
<td>N</td>
</tr>
<tr>
<td>time-offset</td>
<td>2</td>
<td>time-offset</td>
<td>Offset of the client's subnet in seconds from Coordinated
Universal Time (UTC)</td>
<td>N</td>
</tr>
<tr>
<td>default-router</td>
<td>3</td>
<td>routers</td>
<td>IPv4 address of router on the client's subnet</td>
<td>N</td>
</tr>
<tr>
<td>time-server</td>
<td>4</td>
<td>time-servers</td>
<td>RFC 868 time server IPv4 address</td>
<td>Y</td>
</tr>
<tr>
<td>name-server</td>
<td>6</td>
<td>domain-name-servers</td>
<td>DNS server IPv4 address</td>
<td>Y</td>
</tr>
<tr>
<td>domain-name</td>
<td>15</td>
<td>domain-name</td>
<td>Client domain name</td>
<td>Y</td>
</tr>
<tr>
<td>ip-forwarding</td>
<td>19</td>
<td>ip-forwarding</td>
<td>Enable IP forwarding on client</td>
<td>N</td>
</tr>
<tr>
<td>ntp-server</td>
<td>42</td>
<td>ntp-servers</td>
<td>IP address of NTP server</td>
<td>Y</td>
</tr>
<tr>
<td>wins-server</td>
<td>44</td>
<td>netbios-name-servers</td>
<td>NetBIOS over TCP/IP name server</td>
<td>Y</td>
</tr>
<tr>
<td>server-identifier</td>
<td>54</td>
<td>dhcp-server-identifier</td>
<td>IP address for DHCP server identifier</td>
<td>N</td>
</tr>
<tr>
<td>bootfile-server</td>
<td>siaddr</td>
<td>next-server</td>
<td>IPv4 address of next bootstrap server</td>
<td>N</td>
</tr>
<tr>
<td>tftp-server-name</td>
<td>66</td>
<td>tftp-server-name</td>
<td>Name or IPv4 address of TFTP server</td>
<td>N</td>
</tr>
<tr>
<td>bootfile-name</td>
<td>67</td>
<td>bootfile-name, filename</td>
<td>Bootstrap file name</td>
<td>N</td>
</tr>
<tr>
<td>bootfile-size</td>
<td>13</td>
<td>boot-size</td>
<td>Boot image length in 512-octet blocks</td>
<td>N</td>
</tr>
<tr>
<td>smtp-server</td>
<td>69</td>
<td>smtp-server</td>
<td>IP address of SMTP server</td>
<td>Y</td>
</tr>
<tr>
<td>pop-server</td>
<td>70</td>
<td>pop-server</td>
<td>IP address of POP3 server</td>
<td>Y</td>
</tr>
<tr>
<td>domain-search</td>
<td>119</td>
<td>domain-search</td>
<td>Client domain search</td>
<td>Y</td>
</tr>
<tr>
<td>static-route</td>
<td>121, 249</td>
<td>rfc3442-static-route, windows-static-route</td>
<td>Classless static route</td>
<td>N</td>
</tr>
<tr>
<td>wpad-url</td>
<td>252</td>
<td>wpad-url, wpad-url code 252 = text</td>
<td>Web Proxy Autodiscovery (WPAD) URL</td>
<td>N</td>
</tr>
<tr>
<td>lease</td>
<td></td>
<td>default-lease-time, max-lease-time</td>
<td>Lease timeout in seconds (default: 86400)</td>
<td>N</td>
</tr>
<tr>
<td>range</td>
<td></td>
<td>range</td>
<td>DHCP lease range</td>
<td>Y</td>
</tr>
<tr>
<td>exclude</td>
<td></td>
<td></td>
<td>IP address to exclude from DHCP lease range</td>
<td>Y</td>
</tr>
<tr>
<td>failover</td>
<td></td>
<td></td>
<td>DHCP failover parameters</td>
<td></td>
</tr>
<tr>
<td>static-mapping</td>
<td></td>
<td></td>
<td>Name of static mapping</td>
<td>Y</td>
</tr>
</tbody>
</table>

Multi: can be specified multiple times.

### Raw Parameters

Raw parameters can be passed to shared-network-name, subnet and static-mapping:

``` none
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

Please see the `dhcp-dns-quick-start` configuration.

#### High Availability

Configuration of a DHCP HA pair

- Setup DHCP HA for network 192.0.2.0/24
- Use active-active HA mode.
- Default gateway and DNS server is at <span class="title-ref">192.0.2.254</span>
- The primary DHCP server named dhcp-primary uses address <span class="title-ref">192.168.189.252</span>
- The secondary DHCP server named dhcp-secondary uses address <span class="title-ref">192.168.189.253</span>
- DHCP range spans from <span class="title-ref">192.168.189.10</span> - <span class="title-ref">192.168.189.250</span>

Common configuration, valid for both primary and secondary node.

``` none
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 default-router '192.0.2.254'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 name-server '192.0.2.254'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 domain-name 'vyos.net'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 range 0 start '192.0.2.10'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 range 0 stop '192.0.2.250'
set service dhcp-server shared-network-name NET-VYOS subnet 192.0.2.0/24 enable-failover
```

**Primary**

``` none
set service dhcp-server high-availability mode 'active-active'
set service dhcp-server high-availability source-address '192.168.189.252'
set service dhcp-server high-availability name 'dhcp-secondary'
set service dhcp-server high-availability remote '192.168.189.253'
set service dhcp-server high-availability status 'primary'
```

**Secondary**

``` none
set service dhcp-server high-availability mode 'active-active'
set service dhcp-server high-availability source-address '192.168.189.253'
set service dhcp-server high-availability name 'dhcp-primary'
set service dhcp-server high-availability remote '192.168.189.252'
set service dhcp-server high-availability status 'secondary'
```

#### Raw Parameters

- Override static-mapping's name-server with a custom one that will be sent only
  to this host.
- An option that takes a quoted string is set by replacing all quote characters
  with the string `&quot;` inside the static-mapping-parameters value.
  The resulting line in dhcpd.conf will be
  `option pxelinux.configfile "pxelinux.cfg/01-00-15-17-44-2d-aa";`.

``` none
set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping example static-mapping-parameters "option domain-name-servers 192.0.2.11, 192.0.2.12;"
set service dhcp-server shared-network-name dhcpexample subnet 192.0.2.0/24 static-mapping example static-mapping-parameters "option pxelinux.configfile &quot;pxelinux.cfg/01-00-15-17-44-2d-aa&quot;;"
```

#### Option 43 for UniFI

- These parameters need to be part of the DHCP global options.
  They stay unchanged.

``` none
set service dhcp-server global-parameters 'option space ubnt;'
set service dhcp-server global-parameters 'option ubnt.unifi-address code 1 = ip-address;'
set service dhcp-server global-parameters 'class &quot;ubnt&quot; {'
set service dhcp-server global-parameters 'match if substring (option vendor-class-identifier, 0, 4) = &quot;ubnt&quot;;'
set service dhcp-server global-parameters 'option vendor-class-identifier &quot;ubnt&quot;;'
set service dhcp-server global-parameters 'vendor-option-space ubnt;'
set service dhcp-server global-parameters '}'
```

- Now we add the option to the scope, adapt to your setup

``` none
set service dhcp-server shared-network-name example-scope subnet 10.1.1.0/24 subnet-parameters 'option ubnt.unifi-address 172.16.1.10;'
```

### Operation Mode

<div class="opcmd">

show log dhcp server

Show DHCP server daemon log file

</div>

<div class="opcmd">

show log dhcp client

Show logs from all DHCP client processes.

</div>

<div class="opcmd">

show log dhcp client interface \<interface\>

Show logs from specific <span class="title-ref">interface</span> DHCP client process.

</div>

<div class="opcmd">

restart dhcp server

Restart the DHCP server

</div>

<div class="opcmd">

show dhcp server statistics

Show the DHCP server statistics:

</div>

``` none
vyos@vyos:~$ show dhcp server statistics
Pool           Size    Leases    Available  Usage
-----------  ------  --------  -----------  -------
dhcpexample      99         2           97  2%
```

<div class="opcmd">

show dhcp server statistics pool \<pool\>

Show the DHCP server statistics for the specified pool.

</div>

<div class="opcmd">

show dhcp server leases

Show statuses of all active leases:

</div>

``` none
vyos@vyos:~$ show dhcp server leases
IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool      Hostname    Origin
--------------  -----------------  -------  -------------------  -------------------  -----------  --------  ----------  --------
192.168.11.134  00:50:79:66:68:09  active   2023/11/29 09:51:05  2023/11/29 10:21:05  0:24:10      LAN       VPCS1       local
192.168.11.133  50:00:00:06:00:00  active   2023/11/29 09:51:38  2023/11/29 10:21:38  0:24:43      LAN       VYOS-6      local
10.11.11.108    50:00:00:05:00:00  active   2023/11/29 09:51:43  2023/11/29 10:21:43  0:24:48      VIF-1001  VYOS5       local
192.168.11.135  00:50:79:66:68:07  active   2023/11/29 09:55:16  2023/11/29 09:59:16  0:02:21                            remote
vyos@vyos:~$
```

<div class="hint">

<div class="title">

Hint

</div>

Static mappings aren't shown. To show all states, use
`show dhcp server leases state all`.

</div>

<div class="opcmd">

show dhcp server leases origin \[local | remote\]

Show statuses of all active leases granted by local (this server) or
remote (failover server):

</div>

``` none
vyos@vyos:~$ show dhcp server leases origin remote
IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool      Hostname    Origin
--------------  -----------------  -------  -------------------  -------------------  -----------  --------  ----------  --------
192.168.11.135  00:50:79:66:68:07  active   2023/11/29 09:55:16  2023/11/29 09:59:16  0:02:21                            remote
vyos@vyos:~$
```

<div class="opcmd">

show dhcp server leases pool \<pool\>

Show only leases in the specified pool.

</div>

``` none
vyos@vyos:~$ show dhcp server leases pool LAN
IP Address      MAC address        State    Lease start          Lease expiration     Remaining    Pool    Hostname    Origin
--------------  -----------------  -------  -------------------  -------------------  -----------  ------  ----------  --------
192.168.11.134  00:50:79:66:68:09  active   2023/11/29 09:51:05  2023/11/29 10:21:05  0:23:55      LAN     VPCS1       local
192.168.11.133  50:00:00:06:00:00  active   2023/11/29 09:51:38  2023/11/29 10:21:38  0:24:28      LAN     VYOS-6      local
vyos@vyos:~$
```

<div class="opcmd">

show dhcp server leases sort \<key\>

Sort the output by the specified key. Possible keys: ip, hardware_address,
state, start, end, remaining, pool, hostname (default = ip)

</div>

<div class="opcmd">

show dhcp server leases state \<state\>

Show only leases with the specified state. Possible states: all, active,
free, expired, released, abandoned, reset, backup (default = active)

</div>

## IPv6 server

VyOS also provides DHCPv6 server functionality which is described in this
section.

### Configuration

<div class="cfgcmd">

set service dhcpv6-server preference \<preference value\>

Clients receiving advertise messages from multiple servers choose the server
with the highest preference value. The range for this value is `0...255`.

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> lease-time {default | maximum | minimum}

The default lease time for DHCPv6 leases is 24 hours. This can be changed by
supplying a `default-time`, `maximum-time` and `minimum-time`. All
values need to be supplied in seconds.

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> nis-domain \<domain-name\>

A `NIS (Network Information Service)` domain can be set to be used for
DHCPv6 clients.

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> nisplus-domain \<domain-name\>

The procedure to specify a `NIS+ (Network Information Service Plus)`
domain is similar to the NIS domain one:

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> nis-server \<address\>

Specify a NIS server address for DHCPv6 clients.

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> nisplus-server \<address\>

Specify a NIS+ server address for DHCPv6 clients.

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> sip-server \<address | fqdn\>

Specify a `SIP (Session Initiation Protocol)` server by IPv6
address of Fully Qualified Domain Name for all DHCPv6 clients.

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> sntp-server-address \<address\>

A SNTP server address can be specified for DHCPv6 clients.

</div>

#### Prefix Delegation

<div class="note">

<div class="title">

Note

</div>

VyOS =\< 1.4.3 does not add the prefixes to the routing table.

</div>

To hand out individual prefixes to your clients the following configuration is
used:

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> prefix-delegation start \<address\> prefix-length \<length\>

Hand out prefixes of size <span class="title-ref">\<length\></span> to clients in subnet <span class="title-ref">\<prefix\></span> when
they request for prefix delegation.

</div>

<div class="cfgcmd">

set service dhcpv6-server shared-network-name \<name\> subnet
\<prefix\> prefix-delegation start \<address\> stop \<address\>

Delegate prefixes from the range indicated by the start and stop qualifier.

</div>

**Example:**

To delegate /64's from a bigger /56

``` none
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

``` none
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 address-range start 2001:db8::100 stop 2001:db8::199
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 name-server 2001:db8::ffff
```

The configuration will look as follows:

``` none
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

#### Static mappings

In order to map specific IPv6 addresses to specific hosts static mappings can
be created. The following example explains the process.

**Example:**

- IPv6 address `2001:db8::101` shall be statically mapped
- IPv6 prefix `2001:db8:0:101::/64` shall be statically mapped
- Host specific mapping shall be named `client1`

<div class="hint">

<div class="title">

Hint

</div>

The identifier is the device's DUID: colon-separated hex list (as
used by isc-dhcp option dhcpv6.client-id). If the device already has a
dynamic lease from the DHCPv6 server, its DUID can be found with `show service dhcpv6 server leases`.

</div>

``` none
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 ipv6-address 2001:db8::101
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 ipv6-prefix 2001:db8:0:101::/64
set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 static-mapping client1 identifier 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
```

The configuration will look as follows:

``` none
show service dhcpv6-server shared-network-name NET1
 subnet 2001:db8::/64 {
     static-mapping client1 {
         identifier 00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
         ipv6-address 2001:db8::101
         ipv6-prefix 2001:db8:0:101::/64
     }
 }
```

### Operation Mode

<div class="opcmd">

show log dhcpv6 server

Show DHCPv6 server daemon log file

</div>

<div class="opcmd">

show log dhcpv6 client

Show logs from all DHCPv6 client processes.

</div>

<div class="opcmd">

show log dhcpv6 client interface \<interface\>

Show logs from specific <span class="title-ref">interface</span> DHCPv6 client process.

</div>

<div class="opcmd">

restart dhcpv6 server

To restart the DHCPv6 server

</div>

<div class="opcmd">

show dhcpv6 server leases

Shows status of all assigned leases:

</div>

``` none
vyos@vyos:~$ show dhcpv6 server leases
IPv6 address   State    Last communication    Lease expiration     Remaining    Type           Pool   DUID
-------------  -------  --------------------  -------------------  -----------  -------------  -----  --------------------------------------------
2001:db8::101  active   2019/12/05 19:40:10   2019/12/06 07:40:10  11:45:21     non-temporary  NET1   00:01:00:01:12:34:56:78:aa:bb:cc:dd:ee:ff
2001:db8::102  active   2019/12/05 14:01:23   2019/12/06 02:01:23  6:06:34      non-temporary  NET1   00:01:00:01:11:22:33:44:fa:fb:fc:fd:fe:ff
```

<div class="hint">

<div class="title">

Hint

</div>

Static mappings aren't shown. To show all states, use `show dhcp server leases state all`.

</div>

<div class="opcmd">

show dhcpv6 server leases pool \<pool\>

Show only leases in the specified pool.

</div>

<div class="opcmd">

show dhcpv6 server leases sort \<key\>

Sort the output by the specified key. Possible keys: expires, duid, ip,
last_comm, pool, remaining, state, type (default = ip)

</div>

<div class="opcmd">

show dhcpv6 server leases state \<state\>

Show only leases with the specified state. Possible states: abandoned,
active, all, backup, expired, free, released, reset (default = active)

</div>
