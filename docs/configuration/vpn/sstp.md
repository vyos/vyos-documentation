---
lastproofread: '2026-09-30'
---

(sstp)=

# SSTP Server

{abbr}`SSTP (Secure Socket Tunneling Protocol)` is a form of
{abbr}`VPN (Virtual Private Network)` that transports
{abbr}`PPP (Point-to-Point Protocol)` traffic through a TLS channel.
SSTP uses TCP port 443 by default, but firewalls and proxy servers can
still block or inspect this traffic.

VyOS uses [Accel-PPP](https://accel-ppp.org/) to provide SSTP server
functionality, with local-user or RADIUS authentication.

The server requires a TLS certificate and its issuing CA certificate.
Use a certificate trusted by clients, either from a public CA or your
private PKI.

## Configuring SSTP Server

### Certificates

Use the {ref}`pki` commands to install a CA and issue a server
certificate:

```none
vyos@vyos:~$ generate pki ca install CA
```

```none
vyos@vyos:~$ generate pki certificate sign CA install Server
```


### Configuration

```none
set vpn sstp authentication local-users username test password '<strong-password>'
set vpn sstp authentication mode 'local'
set vpn sstp client-ip-pool SSTP-POOL range '10.0.0.2-10.0.0.100'
set vpn sstp default-pool 'SSTP-POOL'
set vpn sstp gateway-address '10.0.0.1'
set vpn sstp ssl ca-certificate 'CA'
set vpn sstp ssl certificate 'Server'
```

Replace the example password with a strong secret. The server listens on
TCP port 443 by default; configure `set vpn sstp port <1-65535>` to use a
different port. Ensure the firewall and clients allow the selected TCP port.

```{cfgcmd} set vpn sstp authentication mode \<local | radius\>

Set authentication backend. The configured authentication backend is used
for all queries.
* **radius**: All authentication queries are handled by a configured RADIUS
server.
* **local**: All authentication queries are handled locally.
```

```{cfgcmd} set vpn sstp authentication local-users username \<user\> password \<pass\>

Create `<user>` for local authentication on this system and set its
password to `<pass>`.
```

```{cfgcmd} set vpn sstp client-ip-pool \<POOL-NAME\> range \<x.x.x.x-x.x.x.x | x.x.x.x/x\>

Configure an IPv4 range in a named client pool. Specify either an IPv4
prefix or an address range whose endpoints are in the same /24 network.
Repeat the command to add ranges to the same pool.
```

```{cfgcmd} set vpn sstp default-pool \<POOL-NAME\>

Configure the named pool from which the server assigns IPv4 addresses
when RADIUS does not return an address or pool.
```

```{cfgcmd} set vpn sstp gateway-address \<gateway\>

Configure the local IPv4 address used on each PPP interface. This is
also the peer's gateway address.
```

```{cfgcmd} set vpn sstp ssl ca-certificate \<file\>

Name of installed certificate authority certificate.
```

```{cfgcmd} set vpn sstp ssl certificate \<file\>

Name of installed server certificate.
```


## Configuring RADIUS authentication

To use RADIUS, set the authentication mode to `radius`. Local-user
settings remain in the configuration but are not used in this mode. If
you switch back to `local`, the server uses the local accounts again.

```none
set vpn sstp authentication mode radius
```

```{cfgcmd} set vpn sstp authentication radius server \<server\> key \<secret\>

Configure RADIUS `<server>` and its required shared `<secret>` for
communicating with the RADIUS server.
```

Configure more than one RADIUS server for redundancy. The server
priority and optional backup settings control how Accel-PPP uses them.
Use distinct shared secrets for each server where possible:

```none
set vpn sstp authentication radius server 192.0.2.10 key '<radius-secret-1>'
set vpn sstp authentication radius server 192.0.2.11 key '<radius-secret-2>'
```

:::{note}
Some RADIUS servers use an access control list to allow or deny
queries. Add the VyOS router to the allowed-client list.
:::

### RADIUS source address

By default, the router selects the source address according to its
route to each RADIUS server. You can bind all outgoing RADIUS requests
to one IPv4 address, such as an address on a loopback or dummy interface.

```{cfgcmd} set vpn sstp authentication radius source-address \<address\>

Configure the source IPv4 address used in RADIUS queries. The address
must be configured on a VyOS interface.
```

:::{note}
The `source-address` must be configured to that of an interface.
Best practice would be a loopback or dummy interface.
:::

### RADIUS advanced options

```{cfgcmd} set vpn sstp authentication radius server \<server\> port \<port\>

Configure the UDP destination port for authentication requests to
RADIUS `<server>`. The default is 1812.
```

```{cfgcmd} set vpn sstp authentication radius server \<server\> fail-time \<time\>

After a server fails to respond, mark it unavailable for `<time>`
seconds. The default is 0.
```

```{cfgcmd} set vpn sstp authentication radius server \<server\> disable

Temporarily disable this RADIUS server without removing it from the
configuration.
```

```{cfgcmd} set vpn sstp authentication radius acct-timeout \<timeout\>

Set how long to wait for a reply to Interim-Update accounting packets
before terminating the session. A value of 0 keeps the session active
regardless of accounting replies. The default is 3 seconds.
```

```{cfgcmd} set vpn sstp authentication radius dynamic-author server \<address\>

Configure the local IPv4 address on which the router accepts Dynamic
Authorization Extension (Disconnect and CoA) requests. The address
must be configured on a VyOS interface; `0.0.0.0` can be used to
listen on all IPv4 interfaces.
```

```{cfgcmd} set vpn sstp authentication radius dynamic-author port \<port\>

Configure the UDP port on which the router accepts Dynamic
Authorization Extension requests. The default is 1700.
```

```{cfgcmd} set vpn sstp authentication radius dynamic-author key \<secret\>

Configure the shared secret used to authenticate Dynamic
Authorization Extension requests.
```

```{cfgcmd} set vpn sstp authentication radius max-try \<number\>

Set the maximum number of attempts to send Access-Request and
Accounting-Request packets to a RADIUS server. The default is 3.
```

```{cfgcmd} set vpn sstp authentication radius timeout \<timeout\>

Set how long to wait for a response from a RADIUS server, in seconds.
The default is 3.
```

```{cfgcmd} set vpn sstp authentication radius nas-identifier \<identifier\>

Configure the value sent in the RADIUS NAS-Identifier attribute and
matched in Disconnect and CoA requests.
```

```{cfgcmd} set vpn sstp authentication radius nas-ip-address \<address\>

Configure the IPv4 address sent in the RADIUS NAS-IP-Address attribute
and matched in Disconnect and CoA requests. When Dynamic Authorization
is configured, Accel-PPP also binds its listener to this address.
```

```{cfgcmd} set vpn sstp authentication radius source-address \<address\>

Configure the source IPv4 address used in RADIUS queries. The address
must be configured on a VyOS interface.
```

```{cfgcmd} set vpn sstp authentication radius rate-limit attribute \<attribute\>

Configure the RADIUS attribute that carries rate information. The
default is `Filter-Id`. For example, a `Filter-Id` value of `1000`
specifies 1000 kbit/s in both directions; `2000/3000` specifies
2000 kbit/s downstream and 3000 kbit/s upstream.
```

:::{note}
Define a custom attribute in the dictionaries used by both the RADIUS
server and Accel-PPP. If it is vendor-specific, configure the vendor
dictionary as well.
:::

```{cfgcmd} set vpn sstp authentication radius rate-limit enable

Enables bandwidth shaping via RADIUS.
```

```{cfgcmd} set vpn sstp authentication radius rate-limit vendor

Configure the vendor dictionary for a vendor-specific rate attribute.
The dictionary must be present in `/usr/share/accel-ppp/radius`.
```

RADIUS address and pool attributes take precedence over the matching
default pool configuration, as described below.

### RADIUS address assignment

For IPv4, `Framed-IP-Address` assigns the address carried in the
attribute and takes precedence over `default-pool`.

`Framed-Pool` assigns an address from the configured IPv4 pool whose
name matches the attribute value.

For IPv6, `Stateful-IPv6-Address-Pool` selects the configured
`client-ipv6-pool` prefix pool whose name matches the attribute value.

`Delegated-IPv6-Prefix-Pool` selects the configured IPv6 delegation
pool whose name matches the attribute value. Without either IPv6 pool
attribute, the `default-ipv6-pool` is used.

:::{note}
`Stateful-IPv6-Address-Pool` and `Delegated-IPv6-Prefix-Pool` are
defined in [RFC 6911](https://datatracker.ietf.org/doc/html/rfc6911).
If your RADIUS server does not define these attributes, add them using
the [Accel-PPP RFC 6911 dictionary].
:::

A client session can be placed into a VRF by the RADIUS Access-Accept
packet or moved to another VRF by a CoA request. Use the vendor-specific
`Accel-VRF-Name` attribute and define it in your RADIUS server's
dictionary. The target VRF must already exist on VyOS.

### Renaming clients interfaces by RADIUS

If the RADIUS server sends the `NAS-Port-Id` attribute, VyOS renames
the client session interface to that value.

:::{note}
The value must be shorter than 16 characters. A value of 16 characters
or longer prevents the session from being established.
:::

## IPv6

```{cfgcmd} set vpn sstp ppp-options ipv6 \<require | prefer | allow | deny\>

Specifies IPv6 negotiation preference.
* **require** - Require IPv6 negotiation
* **prefer** - Ask client for IPv6 negotiation, do not fail if it rejects
* **allow** - Negotiate IPv6 only if client requests
* **deny** - Do not negotiate IPv6 (default value)
```

```{cfgcmd} set vpn sstp client-ipv6-pool \<IPv6-POOL-NAME\> prefix \<address\> mask \<number-of-bits\>

Define a named IPv6 address pool. The configured prefix is divided into
client prefixes of the specified `mask` length, from 48 to 128 bits.
The default mask length is 64.
```

```{cfgcmd} set vpn sstp client-ipv6-pool \<IPv6-POOL-NAME\> delegate \<address\> delegation-prefix \<number-of-bits\>

Define an IPv6 prefix pool for DHCPv6 Prefix Delegation (RFC 3633).
The configured prefix is divided into delegated prefixes of the
specified `delegation-prefix` length, from 32 to 64 bits.
```

```{cfgcmd} set vpn sstp default-ipv6-pool \<IPv6-POOL-NAME\>

Use this command to define default IPv6 address pool name.
```

```none
set vpn sstp ppp-options ipv6 allow
set vpn sstp client-ipv6-pool IPv6-POOL delegate '2001:db8:8003::/48' delegation-prefix '56'
set vpn sstp client-ipv6-pool IPv6-POOL prefix '2001:db8:8002::/48' mask '64'
set vpn sstp default-ipv6-pool IPv6-POOL
```


### IPv6 Advanced Options

```{cfgcmd} set vpn sstp ppp-options ipv6-accept-peer-interface-id

Accept peer interface identifier. By default this is not defined.
```

```{cfgcmd} set vpn sstp ppp-options ipv6-interface-id \<random | x:x:x:x\>

Configure the server-side IPv6 interface identifier. It can be a fixed
identifier or generated randomly. The default is fixed.
* **random** - Random interface identifier for IPv6
* **x:x:x:x** - Specify interface identifier for IPv6
```

```{cfgcmd} set vpn sstp ppp-options ipv6-peer-interface-id \<random | ipv4-addr | calling-sid | x:x:x:x\>

Configure the peer-side IPv6 interface identifier. The default is
fixed.
* **random** - Random interface identifier for IPv6
* **ipv4-addr** - Derive the identifier from the IPv4 address
* **calling-sid** - Derive the identifier from the RADIUS Calling-Station-Id
* **x:x:x:x** - Specify the interface identifier
```

When using `calling-sid`, configure a secret of 16 to 128 printable,
non-whitespace ASCII characters:

```{cfgcmd} set vpn sstp ppp-options ipv6-peer-interface-id-secret \<secret\>

Secret used to generate the peer interface identifier when
`ipv6-peer-interface-id` is `calling-sid`.
```


## Scripting

```{cfgcmd} set vpn sstp extended-scripts on-change \<path_to_script\>

Script to run when the session interface is changed by RADIUS CoA handling
```

```{cfgcmd} set vpn sstp extended-scripts on-down \<path_to_script\>

Script to run when the session interface about to terminate
```

```{cfgcmd} set vpn sstp extended-scripts on-pre-up \<path_to_script\>

Script to run before the session interface comes up
```

```{cfgcmd} set vpn sstp extended-scripts on-up \<path_to_script\>

Script to run when the session interface is completely configured and started
```


## Advanced Options

### Authentication Advanced Options

```{cfgcmd} set vpn sstp authentication local-users username \<user\> disable

Disable `<user>` account.
```

```{cfgcmd} set vpn sstp authentication local-users username \<user\> static-ip \<address\>

Assign a static IP address to `<user>` account.
```

```{cfgcmd} set vpn sstp authentication local-users username \<user\> rate-limit download \<bandwidth\>

Rate limit the download bandwidth for `<user>` to `<bandwidth>` kbit/s.
```

```{cfgcmd} set vpn sstp authentication local-users username \<user\> rate-limit upload \<bandwidth\>

Rate limit the upload bandwidth for `<user>` to `<bandwidth>` kbit/s.
```

```{cfgcmd} set vpn sstp authentication protocols \<pap | chap | mschap | mschap-v2\>

Select the protocols the server accepts for peer authentication. The
default is to accept PAP, CHAP, MS-CHAP, and MS-CHAPv2.
```


### Client IP Pool Advanced Options

```{cfgcmd} set vpn sstp client-ip-pool \<POOL-NAME\> next-pool \<NEXT-POOL-NAME\>

Use this command to define the next address pool name.
```


### PPP Advanced Options

```{cfgcmd} set vpn sstp ppp-options disable-ccp

Disable Compression Control Protocol (CCP).
CCP is enabled by default.
```

```{cfgcmd} set vpn sstp ppp-options interface-cache \<number\>

Specifies number of interfaces to cache. This prevents interfaces from being
removed once the corresponding session is destroyed. Instead, interfaces are
cached for later use in new sessions. This should reduce the kernel-level
interface creation/deletion rate.
Default value is **0**.
```

```{cfgcmd} set vpn sstp ppp-options ipv4 \<require | prefer | allow | deny\>

Specifies IPv4 negotiation preference.
* **require** - Require IPv4 negotiation
* **prefer** - Ask client for IPv4 negotiation, do not fail if it rejects
* **allow** - Negotiate IPv4 only if client requests (Default value)
* **deny** - Do not negotiate IPv4
```

```{cfgcmd} set vpn sstp ppp-options lcp-echo-failure \<number\>

Defines the maximum `<number>` of unanswered echo requests. Upon reaching the
value `<number>`, the session will be reset. Default value is **3**.
```

```{cfgcmd} set vpn sstp ppp-options lcp-echo-interval \<interval\>

If this option is specified and is greater than 0, then the PPP module will
send LCP echo requests every `<interval>` seconds.
Default value is **30**.
```

```{cfgcmd} set vpn sstp ppp-options lcp-echo-timeout

Set the number of seconds to wait for peer activity before disconnecting.
A value greater than 0 enables adaptive LCP echo behavior, and
`lcp-echo-failure` is then ignored. `lcp-echo-interval` must be enabled
for echo requests to be sent. The default is 0 (disabled).
```

```{cfgcmd} set vpn sstp ppp-options min-mtu \<number\>

Defines the minimum acceptable MTU. If a client tries to negotiate an MTU
lower than this it will be NAKed, and disconnected if it rejects a greater
MTU.
Default value is **100**.
```

```{cfgcmd} set vpn sstp ppp-options mppe \<require | prefer | deny\>

Specifies {abbr}`MPPE (Microsoft Point-to-Point Encryption)` negotiation
preference.
* **require** - ask client for mppe, if it rejects drop connection
* **prefer** - ask client for mppe, if it rejects don't fail. (Default value)
* **deny** - deny mppe

RADIUS may override this option with the `MS-MPPE-Encryption-Policy`
attribute.
```

```{cfgcmd} set vpn sstp ppp-options mru \<number\>

Defines preferred MRU. By default is not defined.
```


### Global Advanced options

```{cfgcmd} set vpn sstp description \<description\>

Set description.
```

```{cfgcmd} set vpn sstp limits burst \<value\>

Burst count
```

```{cfgcmd} set vpn sstp limits connection-limit \<value\>

Maximum accepted connection rate (e.g. 1/min, 60/sec)
```

```{cfgcmd} set vpn sstp limits timeout \<value\>

Timeout in seconds
```

```{cfgcmd} set vpn sstp mtu

Maximum Transmission Unit (MTU) (default: **1500**)
```

```{cfgcmd} set vpn sstp max-concurrent-sessions

Maximum number of concurrent session start attempts
```

```{cfgcmd} set vpn sstp name-server \<address\>

Connected clients should use `<address>` as their DNS server. This command
accepts both IPv4 and IPv6 addresses. Up to two nameservers can be configured
for IPv4, up to three for IPv6.
```

```{cfgcmd} set vpn sstp shaper fwmark \<1-2147483647\>

Match firewall mark value
```

```{cfgcmd} set vpn sstp snmp master-agent

Enable SNMP
```

```{cfgcmd} set vpn sstp wins-server \<address\>

Windows Internet Name Service (WINS) servers propagated to client
```

```{cfgcmd} set vpn sstp host-name \<hostname\>

If this option is given, only SSTP connections to the specified host
and with the same TLS SNI will be allowed.
```


## Configuring SSTP client

Once you have setup your SSTP server there comes the time to do some basic
testing. The Linux client used for testing is called [sstpc]. [sstpc] requires a
PPP configuration/peer file.

For a private CA, install its certificate in the client's trust store or
pass it to `sstpc` with `--ca-cert`.

The following PPP configuration tests MSCHAP-v2:

```none
$ cat /etc/ppp/peers/vyos
name vyos-user
usepeerdns
#require-mppe
#require-pap
require-mschap-v2
noauth
lock
refuse-pap
refuse-eap
refuse-chap
refuse-mschap
#refuse-mschap-v2
nobsdcomp
nodeflate
debug
```

Store the client credentials in `/etc/ppp/chap-secrets` and restrict the
file permissions to the root user. For example, add an entry in the
format `client server secret allowed-IP`:

```none
vyos-user * <client-password> *
```

The client command can then use the peer configuration without placing
the password in its process arguments:

```none
$ sudo chmod 600 /etc/ppp/chap-secrets
$ sstpc --log-level 4 --log-stderr vpn.example.com -- call vyos
```

The hostname should match the server certificate. After connecting,
the client interface should show an address from the configured pool
and the configured gateway as its peer:

```none
$ ip addr show ppp0
ppp0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1452
     link/ppp  promiscuity 0
     inet 10.0.0.2 peer 10.0.0.1/32 scope global ppp0
```


## Monitoring

```{opcmd} show sstp-server sessions

Use this command to locally check the active sessions in the SSTP
server.
```

```none
vyos@vyos:~$ show sstp-server sessions
 ifname | username |    ip    | ip6 | ip6-dp |   calling-sid  | rate-limit | state  |  uptime  | rx-bytes | tx-bytes
--------+----------+----------+-----+--------+----------------+------------+--------+----------+----------+----------
 sstp0  | test     | 10.0.0.2 |     |        | 192.168.10.100 |            | active | 00:15:46 | 16.3 KiB | 210 B
```

```none
vyos@vyos:~$ show sstp-server statistics
 uptime: 0.01:21:54
cpu: 0%
mem(rss/virt): 6688/100464 kB
core:
  mempool_allocated: 149420
  mempool_available: 146092
  thread_count: 1
  thread_active: 1
  context_count: 6
  context_sleeping: 0
  context_pending: 0
  md_handler_count: 7
  md_handler_pending: 0
  timer_count: 2
  timer_pending: 0
sessions:
  starting: 0
  active: 1
  finishing: 0
sstp:
  starting: 0
  active: 1
```


## Troubleshooting

```none
vyos@vyos:~$ sudo journalctl -u accel-ppp@sstp.service -b

Feb 28 17:03:04 vyos accel-sstp[2492]: sstp: new connection from 192.168.10.100:49852
Feb 28 17:03:04 vyos accel-sstp[2492]: sstp: starting
Feb 28 17:03:04 vyos accel-sstp[2492]: sstp: started
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [HTTP <SSTP_DUPLEX_POST /sra_{BA195980-CD49-458b-9E23-C84EE0ADCD75}/ HTTP/1.1>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [HTTP <SSTPCORRELATIONID: {48B82435-099A-4158-A987-052E7570CFAA}>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [HTTP <Content-Length: 18446744073709551615>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [HTTP <Host: vyos.io>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [HTTP <HTTP/1.1 200 OK>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [HTTP <Date: Wed, 28 Feb 2024 17:03:04 GMT>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [HTTP <Content-Length: 18446744073709551615>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [SSTP SSTP_MSG_CALL_CONNECT_REQUEST]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [SSTP SSTP_MSG_CALL_CONNECT_ACK]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: lcp_layer_init
Feb 28 17:03:04 vyos accel-sstp[2492]: :: auth_layer_init
Feb 28 17:03:04 vyos accel-sstp[2492]: :: ccp_layer_init
Feb 28 17:03:04 vyos accel-sstp[2492]: :: ipcp_layer_init
Feb 28 17:03:04 vyos accel-sstp[2492]: :: ipv6cp_layer_init
Feb 28 17:03:04 vyos accel-sstp[2492]: :: ppp establishing
Feb 28 17:03:04 vyos accel-sstp[2492]: :: lcp_layer_start
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [LCP ConfReq id=56 <auth PAP> <mru 1452> <magic 1cd9ad05>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [LCP ConfReq id=0 <mru 4091> <magic 345f64ca> <pcomp> <accomp> < d 3 6 >]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [LCP ConfRej id=0 <pcomp> <accomp> < d 3 6 >]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [LCP ConfReq id=1 <mru 4091> <magic 345f64ca>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [LCP ConfNak id=1 <mru 1452>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: recv [LCP ConfReq id=2 <mru 1452> <magic 345f64ca>]
Feb 28 17:03:04 vyos accel-sstp[2492]: :: send [LCP ConfAck id=2]
Feb 28 17:03:07 vyos accel-sstp[2492]: :: fsm timeout 9
Feb 28 17:03:07 vyos accel-sstp[2492]: :: send [LCP ConfReq id=56 <auth PAP> <mru 1452> <magic 1cd9ad05>]
Feb 28 17:03:07 vyos accel-sstp[2492]: :: recv [LCP ConfAck id=56 <auth PAP> <mru 1452> <magic 1cd9ad05>]
Feb 28 17:03:07 vyos accel-sstp[2492]: :: lcp_layer_started
Feb 28 17:03:07 vyos accel-sstp[2492]: :: auth_layer_start
Feb 28 17:03:07 vyos accel-sstp[2492]: :: recv [LCP Ident id=3 <MSRASV5.20>]
Feb 28 17:03:07 vyos accel-sstp[2492]: :: recv [LCP Ident id=4 <MSRAS-0-MSEDGEWIN10>]
Feb 28 17:03:07 vyos accel-sstp[2492]: [50B blob data]
Feb 28 17:03:07 vyos accel-sstp[2492]: :: recv [PAP AuthReq id=3]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: connect: ppp0 <--> sstp(192.168.10.100:49852)
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: ppp connected
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: send [PAP AuthAck id=3 "Authentication succeeded"]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: test: authentication succeeded
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: auth_layer_started
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: ccp_layer_start
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: ipcp_layer_start
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: ipv6cp_layer_start
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: recv [SSTP SSTP_MSG_CALL_CONNECTED]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: IPV6CP: discarding packet
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: send [LCP ProtoRej id=88 <8057>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: recv [IPCP ConfReq id=7 <addr 0.0.0.0> <dns1 0.0.0.0> <wins1 0.0.0.0> <dns2 0.0.0.0> <wins2 0.0.0.0>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: send [IPCP ConfReq id=25 <addr 10.0.0.1>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: send [IPCP ConfRej id=7 <dns1 0.0.0.0> <wins1 0.0.0.0> <dns2 0.0.0.0> <wins2 0.0.0.0>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: recv [IPCP ConfAck id=25 <addr 10.0.0.1>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: recv [IPCP ConfReq id=8 <addr 0.0.0.0>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: send [IPCP ConfNak id=8 <addr 10.0.0.5>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: recv [IPCP ConfReq id=9 <addr 10.0.0.5>]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: send [IPCP ConfAck id=9]
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: ipcp_layer_started
Feb 28 17:03:07 vyos accel-sstp[2492]: ppp0:test: rename interface to 'sstp0'
Feb 28 17:03:07 vyos accel-sstp[2492]: sstp0:test: sstp: ppp: started
```

[accel-ppp attribute]:
  https://github.com/accel-ppp/accel-ppp/tree/master/accel-pppd/radius/dict
[Accel-PPP RFC 6911 dictionary]:
  https://github.com/accel-ppp/accel-ppp/tree/master/accel-pppd/radius/dict
[sstpc]: https://github.com/reliablehosting/sstp-client
