# IPoE Server

VyOS utilizes [accel-ppp]() to provide `IPoE (Internet Protocol over
Ethernet)` server functionality. It can be used with local authentication
(mac-address) or a connected RADIUS server.

IPoE is a method of delivering an IP payload over an Ethernet-based access
network or an access network using bridged Ethernet over Asynchronous Transfer
Mode (ATM) without using PPPoE. It directly encapsulates the IP datagrams in
Ethernet frames, using the standard `894` encapsulation.

The use of IPoE addresses the disadvantage that PPP is unsuited for multicast
delivery to multiple users. Typically, IPoE uses Dynamic Host Configuration
Protocol and Extensible Authentication Protocol to provide the same
functionality as PPPoE, but in a less robust manner.

<div class="note">

<div class="title">

Note

</div>

Please be aware, due to an upstream bug, config changes/commits
will restart the ppp daemon and will reset existing IPoE sessions,
in order to become effective.

</div>

## Configuring IPoE Server

IPoE can be configure on different interfaces, it will depend on each specific
situation which interface will provide IPoE to clients. The clients mac address
and the incoming interface is being used as control parameter, to authenticate
a client.

The example configuration below will assign an IP to the client on the incoming
interface eth2 with the client mac address 08:00:27:2f:d8:06. Other DHCP
discovery requests will be ignored, unless the client mac has been enabled in
the configuration.

``` none
set interfaces ethernet eth1 address '192.168.0.1/24'
set service ipoe-server authentication interface eth1.100 mac 00:50:79:66:68:00
set service ipoe-server authentication interface eth1.101 mac 00:50:79:66:68:01
set service ipoe-server authentication mode 'local'
set service ipoe-server client-ip-pool IPOE-POOL range '192.168.0.2-192.168.0.254'
set service ipoe-server default-pool 'IPOE-POOL'
set service ipoe-server gateway-address '192.168.0.1/24'
set service ipoe-server interface eth1 mode 'l2'
set service ipoe-server interface eth1 network 'vlan'
set service ipoe-server interface eth1 vlan '100-200'
```

<div class="cfgcmd">

set service ipoe-server authentication interface \<interface\> mac \<MAC\>

Creates local IPoE user with username=\*\*\<interface\>\*\* and
password=\*\*\<MAC\>\*\* (mac-address)

</div>

<div class="cfgcmd">

set service ipoe-server authentication mode \<local | radius\>

Set authentication backend. The configured authentication backend is used
for all queries.

- **radius**: All authentication queries are handled by a configured RADIUS
  server.
- **local**: All authentication queries are handled locally.
- **noauth**: Authentication disabled

</div>

<div class="cfgcmd">

set service ipoe-server client-ip-pool \<POOL-NAME\> range \<x.x.x.x-x.x.x.x | x.x.x.x/x\>

Use this command to define the first IP address of a pool of
addresses to be given to IPoE clients. If notation `x.x.x.x-x.x.x.x`,
it must be within a /24 subnet. If notation `x.x.x.x/x` is
used there is possibility to set host/netmask.

</div>

<div class="cfgcmd">

set service ipoe-server default-pool \<POOL-NAME\>

Use this command to define default address pool name.

</div>

<div class="cfgcmd">

set service ipoe-server gateway-address \<x.x.x.x/x\>

Specifies address to be used as server ip address if radius can assign
only client address. In such case if client address is matched network
and mask then specified address and mask will be used. You can specify
multiple such options.

</div>

<div class="cfgcmd">

set service ipoe-server interface \<interface\> mode \<l2 | l3\>

Set authentication backend. The configured authentication backend is used
for all queries.

- **l2**: It means that clients are on same network where interface
  is.\*\*(default)\*\*
- **local**: It means that client are behind some router.

</div>

<div class="cfgcmd">

set service ipoe-server interface \<interface\> network \<shared | vlan\>

Specify where interface is shared by multiple users or it is vlan-per-user.

- **shared**: Multiple clients share the same network. **(default)**
- **vlan**: One VLAN per client.

</div>

``` none
vyos@vyos:~$ show ipoe-server sessions

 ifname | username |    calling-sid    |     ip      | rate-limit | type | comp | state  |  uptime
--------+----------+-------------------+-------------+------------+------+------+--------+----------
 ipoe0  | eth1.100 | 00:50:79:66:68:00 | 192.168.0.2 |            | ipoe |      | active | 00:04:55
 ipoe1  | eth1.101 | 00:50:79:66:68:01 | 192.168.0.3 |            | ipoe |      | active | 00:04:44
```

## Configuring RADIUS authentication

To enable RADIUS based authentication, the authentication mode needs to be
changed within the configuration. Previous settings like the local users, still
exists within the configuration, however they are not used if the mode has been
changed from local to radius. Once changed back to local, it will use all local
accounts again.

``` none
set service ipoe-server authentication mode radius
```

<div class="cfgcmd">

set service ipoe-server authentication radius server \<server\> key \<secret\>

Configure RADIUS <span class="title-ref">\<server\></span> and its required shared <span class="title-ref">\<secret\></span> for
communicating with the RADIUS server.

</div>

Since the RADIUS server would be a single point of failure, multiple RADIUS
servers can be setup and will be used subsequentially.
For example:

``` none
set service ipoe-server authentication radius server 10.0.0.1 key 'foo'
set service ipoe-server authentication radius server 10.0.0.2 key 'foo'
```

<div class="note">

<div class="title">

Note

</div>

Some RADIUS severs use an access control list which allows or denies
queries, make sure to add your VyOS router to the allowed client list.

</div>

### RADIUS source address

If you are using OSPF as IGP, always the closest interface connected to the
RADIUS server is used. With VyOS 1.2 you can bind all outgoing RADIUS requests
to a single source IP e.g. the loopback interface.

<div class="cfgcmd">

set service ipoe-server authentication radius source-address \<address\>

Source IPv4 address used in all RADIUS server queries.

</div>

<div class="note">

<div class="title">

Note

</div>

The `source-address` must be configured on one of VyOS interface.
Best practice would be a loopback or dummy interface.

</div>

### RADIUS advanced options

<div class="cfgcmd">

set service ipoe-server authentication radius server \<server\> port \<port\>

Configure RADIUS <span class="title-ref">\<server\></span> and its required port for authentication requests.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius server \<server\> fail-time \<time\>

Mark RADIUS server as offline for this given <span class="title-ref">\<time\></span> in seconds.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius server \<server\> disable

Temporary disable this RADIUS server.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius acct-timeout \<timeout\>

Timeout to wait reply for Interim-Update packets. (default 3 seconds)

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius dynamic-author server \<address\>

Specifies IP address for Dynamic Authorization Extension server (DM/CoA)

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius dynamic-author port \<port\>

Port for Dynamic Authorization Extension server (DM/CoA)

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius dynamic-author key \<secret\>

Secret for Dynamic Authorization Extension server (DM/CoA)

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius max-try \<number\>

Maximum number of tries to send Access-Request/Accounting-Request queries

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius timeout \<timeout\>

Timeout to wait response from server (seconds)

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius nas-identifier \<identifier\>

Value to send to RADIUS server in NAS-Identifier attribute and to be matched
in DM/CoA requests.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius nas-ip-address \<address\>

Value to send to RADIUS server in NAS-IP-Address attribute and to be matched
in DM/CoA requests. Also DM/CoA server will bind to that address.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius source-address \<address\>

Source IPv4 address used in all RADIUS server queries.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius rate-limit attribute \<attribute\>

Specifies which RADIUS server attribute contains the rate limit information.
The default attribute is <span class="title-ref">Filter-Id</span>.

</div>

<div class="note">

<div class="title">

Note

</div>

If you set a custom RADIUS attribute you must define it on both
dictionaries at RADIUS server and client.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius rate-limit enable

Enables bandwidth shaping via RADIUS.

</div>

<div class="cfgcmd">

set service ipoe-server authentication radius rate-limit vendor

Specifies the vendor dictionary, dictionary needs to be in
/usr/share/accel-ppp/radius.

</div>

Received RADIUS attributes have a higher priority than parameters defined within
the CLI configuration, refer to the explanation below.

### Allocation clients ip addresses by RADIUS

If the RADIUS server sends the attribute `Framed-IP-Address` then this IP
address will be allocated to the client and the option `default-pool` within the CLI
config is being ignored.

If the RADIUS server sends the attribute `Framed-Pool`, IP address will be allocated
from a predefined IP pool whose name equals the attribute value.

If the RADIUS server sends the attribute `Stateful-IPv6-Address-Pool`, IPv6 address
will be allocated from a predefined IPv6 pool `prefix` whose name equals the attribute value.

If the RADIUS server sends the attribute `Delegated-IPv6-Prefix-Pool`, IPv6
delegation prefix will be allocated from a predefined IPv6 pool `delegate`
whose name equals the attribute value.

<div class="note">

<div class="title">

Note

</div>

`Stateful-IPv6-Address-Pool` and `Delegated-IPv6-Prefix-Pool` are defined in
RFC6911. If they are not defined in your RADIUS server, add new [dictionary](https://github.com/accel-ppp/accel-ppp/blob/master/accel-pppd/radius/dict/dictionary.rfc6911).

</div>

User interface can be put to VRF context via RADIUS Access-Accept packet, or change
it via RADIUS CoA. `Accel-VRF-Name` is used from these purposes. It is custom [ACCEL-PPP attribute](https://github.com/accel-ppp/accel-ppp/blob/master/accel-pppd/radius/dict/dictionary.accel).
Define it in your RADIUS server.

## IPv6

<div class="cfgcmd">

set service ipoe-server client-ipv6-pool \<IPv6-POOL-NAME\> prefix \<address\>
mask \<number-of-bits\>

Use this command to set the IPv6 address pool from which an IPoE client
will get an IPv6 prefix of your defined length (mask) to terminate the
IPoE endpoint at their side. The mask length can be set from 48 to 128
bit long, the default value is 64.

</div>

<div class="cfgcmd">

set service ipoe-server client-ipv6-pool \<IPv6-POOL-NAME\> delegate \<address\>
delegation-prefix \<number-of-bits\>

Use this command to configure DHCPv6 Prefix Delegation (RFC3633) on
IPoE. You will have to set your IPv6 pool and the length of the
delegation prefix. From the defined IPv6 pool you will be handing out
networks of the defined length (delegation-prefix). The length of the
delegation prefix can be set from 32 to 64 bit long.

</div>

<div class="cfgcmd">

set service ipoe-server default-ipv6-pool \<IPv6-POOL-NAME\>

Use this command to define default IPv6 address pool name.

</div>

``` none
set service ipoe-server client-ipv6-pool IPv6-POOL delegate '2001:db8:8003::/48' delegation-prefix '56'
set service ipoe-server client-ipv6-pool IPv6-POOL prefix '2001:db8:8002::/48' mask '64'
set service ipoe-server default-ipv6-pool IPv6-POOL
```

## Scripting

<div class="cfgcmd">

set service ipoe-server extended-scripts on-change \<path_to_script\>

Script to run when session interface changed by RADIUS CoA handling

</div>

<div class="cfgcmd">

set service ipoe-server extended-scripts on-down \<path_to_script\>

Script to run when session interface going to terminate

</div>

<div class="cfgcmd">

set service ipoe-server extended-scripts on-pre-up \<path_to_script\>

Script to run before session interface comes up

</div>

<div class="cfgcmd">

set service ipoe-server extended-scripts on-up \<path_to_script\>

Script to run when session interface is completely configured and started

</div>

## Advanced Options

### Authentication Advanced Options

<div class="cfgcmd">

set service ipoe-server authentication interface \<interface\> mac \<MAC\> vlan
\<vlan-id\>

VLAN monitor for automatic creation of VLAN interfaces for specific user on specific \<interface\>

</div>

<div class="cfgcmd">

set service ipoe-server authentication interface \<interface\> mac \<MAC\> rate-limit
download \<bandwidth\>

Download bandwidth limit in kbit/s for user on interface <span class="title-ref">\<interface\></span>.

</div>

<div class="cfgcmd">

set service ipoe-server authentication interface \<interface\> mac \<MAC\> rate-limit
upload \<bandwidth\>

Upload bandwidth limit in kbit/s for for user on interface <span class="title-ref">\<interface\></span>.

</div>

### Client IP Pool Advanced Options

<div class="cfgcmd">

set service ipoe-server client-ip-pool \<POOL-NAME\> next-pool \<NEXT-POOL-NAME\>

Use this command to define the next address pool name.

</div>

### Advanced Interface Options

<div class="cfgcmd">

set service ipoe-server interface \<interface\> client-subnet \<x.x.x.x/x\>

Specify local range of ip address to give to dhcp clients. First IP in range is router IP.
If you need more customization use <span class="title-ref">client-ip-pool</span>

</div>

<div class="cfgcmd">

set service ipoe-server interface \<interface\> external-dhcp dhcp-relay \<x.x.x.x\>

Specify DHCPv4 relay IP address to pass requests to. If specified giaddr is also needed.

</div>

<div class="cfgcmd">

set service ipoe-server interface \<interface\> external-dhcp giaddr \<x.x.x.x\>

Specifies relay agent IP addre

</div>

### Global Advanced options

<div class="cfgcmd">

set service ipoe-server description \<description\>

Set description.

</div>

<div class="cfgcmd">

set service ipoe-server limits burst \<value\>

Burst count

</div>

<div class="cfgcmd">

set service ipoe-server limits connection-limit \<value\>

Acceptable rate of connections (e.g. 1/min, 60/sec)

</div>

<div class="cfgcmd">

set service ipoe-server limits timeout \<value\>

Timeout in seconds

</div>

<div class="cfgcmd">

set service ipoe-server max-concurrent-sessions

Maximum number of concurrent session start attempts

</div>

<div class="cfgcmd">

set service ipoe-server name-server \<address\>

Connected client should use <span class="title-ref">\<address\></span> as their DNS server. This
command accepts both IPv4 and IPv6 addresses. Up to two nameservers
can be configured for IPv4, up to three for IPv6.

</div>

<div class="cfgcmd">

set service ipoe-server shaper fwmark \<1-2147483647\>

Match firewall mark value

</div>

<div class="cfgcmd">

set service ipoe-server snmp master-agent

Enable SNMP

</div>

## Monitoring

<div class="opcmd">

show ipoe-server sessions

Use this command to locally check the active sessions in the IPoE
server.

</div>

``` none
vyos@vyos:~$ show ipoe-server sessions
ifname  | username |    calling-sid    |     ip      | rate-limit | type | comp | state  |  uptime
----------+----------+-------------------+-------------+------------+------+------+--------+----------
 eth1.100 | eth1.100 | 0c:98:bd:b8:00:01 | 192.168.0.3 |            | ipoe |      | active | 03:03:58
```

``` none
vyos@vyos:~$ show ipoe-server statistics
uptime: 0.03:31:36
cpu: 0%
mem(rss/virt): 6044/101360 kB
core:
  mempool_allocated: 148628
  mempool_available: 144748
  thread_count: 1
  thread_active: 1
  context_count: 10
  context_sleeping: 0
  context_pending: 0
  md_handler_count: 6
  md_handler_pending: 0
  timer_count: 1
  timer_pending: 0
sessions:
  starting: 0
  active: 1
  finishing: 0
ipoe:
  starting: 0
  active: 1
  delayed: 0
```

## Troubleshooting

``` none
vyos@vyos:~$sudo journalctl -u accel-ppp@ipoe -b 0

Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:: recv [DHCPv4 Discover xid=55df9228 chaddr=0c:98:bd:b8:00:01 <Message-Type Discover> <Request-IP 192.168.0.3> <Host-Name vyos> <Request-List Subnet,Broadcast,Router,DNS,Classless-Route,Domain-Name,MTU>]
Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:eth1.100: eth1.100: authentication succeeded
Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:eth1.100: send [DHCPv4 Offer xid=55df9228 yiaddr=192.168.0.4 chaddr=0c:98:bd:b8:00:01 <Message-Type Offer> <Server-ID 192.168.0.1> <Lease-Time 600> <T1 300> <T2 525> <Router 192.168.0.1> <Subnet 255.255.255.0>]
Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:eth1.100: recv [DHCPv4 Request xid=55df9228 chaddr=0c:98:bd:b8:00:01 <Message-Type Request> <Server-ID 192.168.0.1> <Request-IP 192.168.0.4> <Host-Name vyos> <Request-List Subnet,Broadcast,Router,DNS,Classless-Route,Domain-Name,MTU>]
Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:eth1.100: ipoe: activate session
Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:eth1.100: ipoe: no free IPv6 address
Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:eth1.100: ipoe: session started
Feb 27 14:29:27 vyos accel-ipoe[2262]: eth1.100:eth1.100: send [DHCPv4 Ack xid=55df9228 yiaddr=192.168.0.4 chaddr=0c:98:bd:b8:00:01 <Message-Type Ack> <Server-ID 192.168.0.1> <Lease-Time 600> <T1 300> <T2 525> <Router 192.168.0.1> <Subnet 255.255.255.0>]
```
