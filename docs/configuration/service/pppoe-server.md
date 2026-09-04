---
myst:
  html_meta:
    description: |
      The PPPoE server terminates PPPoE sessions from subscribers,
      authenticates them locally or via RADIUS, assigns IPv4 and IPv6
      addresses, and enforces per-subscriber bandwidth limits.
    keywords: pppoe-server, pppoe, radius, ppp, coa, prefix-delegation, vlan
---

(pppoe-server)=

# PPPoE server

Defined in
[RFC 2516](https://datatracker.ietf.org/doc/html/rfc2516), the
{abbr}`PPPoE (Point-to-Point Protocol over Ethernet)` server accepts
PPPoE sessions from subscribers connected over an Ethernet network
and acts as the provider-side endpoint of each session. Service
providers use the PPPoE server to authenticate individual
subscribers, assign them IPv4 and IPv6 addresses, account for their
traffic, and enforce per-subscriber bandwidth limits.

The PPPoE server is configured under `service pppoe-server`. PPPoE
sessions are authenticated in one of the following ways: locally, via
a {abbr}`RADIUS (Remote Authentication Dial-In User Service)` server
as defined in
[RFC 2865](https://datatracker.ietf.org/doc/html/rfc2865), or not at
all.

```{note}
Commits that change `interface`, `client-ip-pool`,
`client-ipv6-pool`, `authentication mode`, `authentication
protocols`, any option under `authentication radius`,
`ppp-options ipv6-peer-interface-id`, or
`ppp-options ipv6-peer-interface-id-secret` restart the PPPoE server
and terminate all active sessions. Adding or removing an interface
under `vpp settings interface` or `interfaces vpp bonding` has the
same effect when the PPPoE server listens on that interface or on
one of its VLANs. All other changes keep active sessions.
```

## Configuration

```{cfgcmd} set service pppoe-server access-concentrator \<name\>

**Configure the access concentrator name that the PPPoE server
announces to clients during PPPoE discovery.**

The name may contain letters, digits, hyphens, and underscores.

The default is `vyos-ac`.
```

Example:

```none
set service pppoe-server access-concentrator PPPoE-AC-01
```

```{cfgcmd} set service pppoe-server authentication mode \<local | radius | noauth\>

**Configure how the PPPoE server authenticates clients:**

- `local`: Clients are authenticated against the locally configured
  usernames and passwords.
- `radius`: Clients are authenticated by the configured RADIUS
  servers.
- `noauth`: Authentication is disabled.

The default is `local`.

In `local` and `noauth` modes, at least one `client-ip-pool` or
`client-ipv6-pool` must be configured. Otherwise, the commit fails.
```

Example:

```none
set service pppoe-server authentication mode radius
```

```{cfgcmd} set service pppoe-server authentication local-users username \<name\> password \<password\>

**Create a locally authenticated PPPoE user with the given password.**

In `local` authentication mode, at least one local user must be
configured, and every user needs a password. Otherwise, the commit
fails.
```

Example:

```none
set service pppoe-server authentication local-users username user01 password secret
```

```{cfgcmd} set service pppoe-server client-ip-pool \<name\> range \<x.x.x.x/x | x.x.x.x-x.x.x.x\>

**Configure an IPv4 address range as part of the named client pool.**

Specify the range either as an IPv4 prefix or as an address range
whose endpoints lie within a common /24 network. Repeat the command
to add several ranges to the same pool.
```

Example:

```none
set service pppoe-server client-ip-pool PPPOE-POOL range 192.0.2.10-192.0.2.99
set service pppoe-server client-ip-pool PPPOE-POOL range 198.51.100.0/24
```

```{cfgcmd} set service pppoe-server default-pool \<name\>

**Configure the client pool from which IPv4 addresses are assigned by
default.**

A RADIUS-provided address or pool, when present, takes precedence.

A client pool with this name must be configured under
`client-ip-pool`. Otherwise, the commit fails.

In `local` and `noauth` authentication modes, if at least one
`client-ip-pool` is configured but `default-pool` is not set, the
commit succeeds with a warning.
```

Example:

```none
set service pppoe-server default-pool PPPOE-POOL
```

```{cfgcmd} set service pppoe-server interface \<interface\>

**Configure an interface on which the PPPoE server listens for PPPoE
clients.**

Repeat the command to listen on several interfaces.

At least one listen interface must be configured. Otherwise, the
commit fails.
```

Example:

```none
set service pppoe-server interface eth1
```

```{cfgcmd} set service pppoe-server gateway-address \<ipv4-address\>

**Configure the local IPv4 address of the PPP interfaces created for
client sessions.**

For every session, the PPPoE server creates a PPP interface on the
router, and `gateway-address` becomes its local address. This address
is also sent to clients as their default gateway.

If `gateway-address` is not set, the commit succeeds with a warning,
and IPv4 sessions cannot be established.
```

Example:

```none
set service pppoe-server gateway-address 192.0.2.254
```

## RADIUS authentication

To enable RADIUS-based authentication, the authentication mode needs
to be changed to `radius`. Existing settings, such as local users,
remain in the configuration but are not used while the mode is
`radius`. When the mode is set back to `local`, the PPPoE server uses
the local users again.

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> key \<secret\>

**Configure a RADIUS server by its IPv4 address and the shared
secret.**

The shared secret authenticates the exchange of queries and replies
between the router and the RADIUS server
([RFC 2865](https://datatracker.ietf.org/doc/html/rfc2865)). The same
secret must be configured on the RADIUS server.

A single RADIUS server is a single point of failure. Repeat the
command to configure multiple servers for redundancy.

In `radius` authentication mode, at least one server must be
configured, and every server needs a shared secret. Otherwise, the
commit fails.
```

```{note}
Some RADIUS servers use an access control list that allows or denies
queries. Make sure to add your VyOS router to the allowed client
list.
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.9 key 'first-radius-secret'
set service pppoe-server authentication radius server 198.51.100.10 key 'second-radius-secret'
```

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> priority \<1-255\>

**Configure the weight of the specified RADIUS server when the router
distributes queries across multiple servers.**
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.9 priority 10
```

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> backup

**Configure the specified RADIUS server as a backup, used only when
all other servers have failed.**
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.10 backup
```

### Source address

By default, the router selects the source address of each RADIUS
query based on the route to that server. This address may change if
routing changes. The following command configures a single source
address for all RADIUS queries.

```{cfgcmd} set service pppoe-server authentication radius source-address \<ipv4-address\>

**Configure the source IPv4 address used in all queries to RADIUS
servers.**

Use an address configured on one of the router's interfaces.
Typically, this is a loopback or dummy interface address.
```

Example:

```none
set service pppoe-server authentication radius source-address 192.0.2.1
```

### Advanced options

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> port \<1-65535\>

**Configure the UDP port the router uses to send client
authentication requests to the specified RADIUS server.**

The default is 1812.
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.9 port 1645
```

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> acct-port \<1-65535\>

**Configure the UDP port to which the router sends accounting
requests for the specified RADIUS server.**

The default is 1813.
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.9 acct-port 1646
```

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> disable-accounting

**Stop sending accounting requests to the specified RADIUS server.**
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.9 disable-accounting
```

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> fail-time \<0-600\>

**Mark the specified RADIUS server as unavailable for the given time,
in seconds, after it fails to respond.**

The default is 0.
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.9 fail-time 60
```

```{cfgcmd} set service pppoe-server authentication radius server \<ipv4-address\> disable

**Disable the specified RADIUS server without removing it from the
configuration.**
```

Example:

```none
set service pppoe-server authentication radius server 198.51.100.9 disable
```

```{cfgcmd} set service pppoe-server authentication radius acct-timeout \<0-60\>

**Configure the time, in seconds, to wait for a reply to
Interim-Update accounting packets before terminating the session.**

Setting the value to 0 keeps the session active regardless of
accounting replies.

The default is 3.
```

Example:

```none
set service pppoe-server authentication radius acct-timeout 30
```

```{cfgcmd} set service pppoe-server authentication radius accounting-interim-interval \<1-3600\>

**Configure the interval, in seconds, at which the router sends
accounting updates for active sessions.**

A RADIUS server may override this interval with the
Acct-Interim-Interval attribute.
```

Example:

```none
set service pppoe-server authentication radius accounting-interim-interval 300
```

```{cfgcmd} set service pppoe-server authentication radius acct-interim-jitter \<1-60\>

**Configure the largest random offset, in seconds, applied to the
accounting update interval.**

Spreading the updates keeps sessions from sending them all at once.
```

Example:

```none
set service pppoe-server authentication radius acct-interim-jitter 10
```

```{cfgcmd} set service pppoe-server authentication radius dynamic-author server \<ipv4-address\>

**Configure the local IPv4 address on which the router accepts
{abbr}`CoA (Change of Authorization)` and Disconnect requests from
the RADIUS server.**

A Disconnect request terminates an active session. A CoA request
changes the authorization attributes of an active session. Both are
defined in
[RFC 5176](https://datatracker.ietf.org/doc/html/rfc5176), Dynamic
Authorization Extensions to RADIUS.

`dynamic-author key` must also be configured. Otherwise, the commit
fails.
```

Example:

```none
set service pppoe-server authentication radius dynamic-author server 192.0.2.1
```

```{cfgcmd} set service pppoe-server authentication radius dynamic-author port \<1-65535\>

**Configure the UDP port on which the router accepts CoA and
Disconnect requests.**

The default is 1700.
```

Example:

```none
set service pppoe-server authentication radius dynamic-author port 3799
```

```{cfgcmd} set service pppoe-server authentication radius dynamic-author key \<secret\>

**Configure the shared secret that authenticates incoming CoA and
Disconnect requests.**
```

Example:

```none
set service pppoe-server authentication radius dynamic-author key 'coa-secret'
```

```{cfgcmd} set service pppoe-server authentication radius max-try \<1-20\>

**Configure the maximum number of attempts to send Access-Request and
Accounting-Request queries to a RADIUS server.**

The default is 3.
```

Example:

```none
set service pppoe-server authentication radius max-try 5
```

```{cfgcmd} set service pppoe-server authentication radius timeout \<1-60\>

**Configure the time, in seconds, to wait for a reply from a RADIUS
server.**

The default is 3.
```

Example:

```none
set service pppoe-server authentication radius timeout 10
```

```{cfgcmd} set service pppoe-server authentication radius nas-identifier \<identifier\>

**Configure the value the router sends to RADIUS servers in the
NAS-Identifier attribute.**

In RADIUS, the router acts as a {abbr}`NAS (Network Access Server)`,
a device through which clients get access to the network. The RADIUS
server uses the NAS-Identifier value to identify which NAS originated
a request. The attribute is defined in
[RFC 2865 section 5.32](https://datatracker.ietf.org/doc/html/rfc2865#section-5.32).
```

Example:

```none
set service pppoe-server authentication radius nas-identifier pppoe-gw01
```

```{cfgcmd} set service pppoe-server authentication radius nas-ip-address \<ipv4-address\>

**Configure the IPv4 address the router sends to RADIUS servers in
the NAS-IP-Address attribute.**

NAS-IP-Address identifies the router to the RADIUS server by IPv4
address, as NAS-Identifier does by name. The attribute is defined in
[RFC 2865 section 5.4](https://datatracker.ietf.org/doc/html/rfc2865#section-5.4).
The attribute does not change the source address of RADIUS queries.
```

Example:

```none
set service pppoe-server authentication radius nas-ip-address 192.0.2.1
```

```{cfgcmd} set service pppoe-server authentication radius preallocate-vif

**Create the PPP interface of a session before authentication, so
that the router can send NAS-Port-Id in the Access-Request.**
```

Example:

```none
set service pppoe-server authentication radius preallocate-vif
```

```{cfgcmd} set service pppoe-server authentication radius called-sid-format \<ifname | ifname:mac\>

**Configure the format of the Called-Station-Id attribute the router
sends to RADIUS servers:**

- `ifname`: The name of the interface that accepted the request, for
  example `eth1`.
- `ifname:mac`: The interface name and its MAC address, for example
  `eth1:00:00:00:00:00:00`.
```

Example:

```none
set service pppoe-server authentication radius called-sid-format ifname:mac
```

```{cfgcmd} set service pppoe-server authentication radius rate-limit attribute \<attribute\>

**Configure which RADIUS attribute carries the rate information.**

The default is `Filter-Id`. When using a custom attribute, define it
in the RADIUS dictionaries of both the RADIUS server and the router.
```

Example:

```none
set service pppoe-server authentication radius rate-limit attribute Mikrotik-Rate-Limit
```

```{cfgcmd} set service pppoe-server authentication radius rate-limit enable

**Enable bandwidth shaping of client sessions based on rate
information received from the RADIUS server.**
```

Example:

```none
set service pppoe-server authentication radius rate-limit enable
```

```{cfgcmd} set service pppoe-server authentication radius rate-limit vendor \<vendor\>

**Configure the RADIUS vendor whose vendor-specific attribute carries
the rate information.**

Use a vendor name that exists in the RADIUS dictionaries in
`/usr/share/accel-ppp/radius`.
```

Example:

```none
set service pppoe-server authentication radius rate-limit vendor Mikrotik
```

```{cfgcmd} set service pppoe-server authentication radius rate-limit multiplier \<0.001-1000\>

**Configure the factor by which the router multiplies the rate
received from the RADIUS server.**

Use this option when the RADIUS server sends rates in a unit other
than kbit/s.

The default is 1.
```

Example:

```none
set service pppoe-server authentication radius rate-limit multiplier 0.001
```

### RADIUS attributes

When included in a RADIUS reply, the attributes below determine the
client's IP address and prefix assignment, taking precedence over the
corresponding CLI configuration. If an attribute is omitted, the CLI
configuration applies.

The following table outlines the allocation behaviors for different
RADIUS attributes:

% stop_vyoslinter

| RADIUS attribute | Allocation behavior with the RADIUS attribute | Allocation behavior without the RADIUS attribute |
|---|---|---|
| `Framed-IP-Address` | The IPv4 address carried in the attribute is assigned directly to the client. Example: `192.0.2.50` | IPv4 address assigned from the pool set as `default-pool`. Example: `192.0.2.15` from `PPPOE-POOL` |
| `Framed-Pool` | IPv4 address assigned from a pool named by the attribute value and defined with `client-ip-pool`. Example: `198.51.100.20` from `PREMIUM-V4` | IPv4 address assigned from the pool set as `default-pool`. Example: `192.0.2.15` from `PPPOE-POOL` |
| `Stateful-IPv6-Address-Pool` | IPv6 network assigned from the prefix ranges of a pool named by the attribute value and defined with `client-ipv6-pool`. Example: `2001:db8:aaaa:20::/64` from the prefix `2001:db8:aaaa::/48` of `PREMIUM-V6` | IPv6 network assigned from the pool set as `default-ipv6-pool`. Example: `2001:db8:8002:20::/64` from `IPV6-POOL` |
| `Delegated-IPv6-Prefix-Pool` | Delegated prefix assigned from the delegate ranges of a pool named by the attribute value and defined with `client-ipv6-pool`. Example: `2001:db8:bbbb:100::/56` from the delegate `2001:db8:bbbb::/48` of `PREMIUM-V6` | Delegated prefix assigned from the pool set as `default-ipv6-pool`. Example: `2001:db8:8003::/56` from `IPV6-POOL` |

```{note}
`Stateful-IPv6-Address-Pool` and `Delegated-IPv6-Prefix-Pool` are
defined in
[RFC 6911](https://datatracker.ietf.org/doc/html/rfc6911). If your
RADIUS server does not already define them, add them to its RADIUS
dictionary using the definitions from the
[accel-ppp RFC 6911 dictionary](https://github.com/accel-ppp/accel-ppp/blob/master/accel-pppd/radius/dict/dictionary.rfc6911).
```
% start_vyoslinter

```{note}
A session can be placed into a
{abbr}`VRF (Virtual Routing and Forwarding)` via the RADIUS
Access-Accept packet, or moved to another VRF via a CoA request,
using the `Accel-VRF-Name` attribute. It is a vendor-specific
ACCEL-PPP attribute. Define it on your RADIUS server.
```

### Rename client's session interfaces

If the RADIUS server sends the `NAS-Port-Id` attribute, the router
renames the client's session interface to the attribute value.

The value of the `NAS-Port-Id` attribute must be shorter than 16
characters. If it is 16 characters or longer, the router cannot
rename the interface and terminates the session.

## Automatic VLAN creation

```{cfgcmd} set service pppoe-server interface \<interface\> vlan \<1-4094 | start-end\>

**Configure the VLANs of the specified interface on which the PPPoE
server serves clients.**

Specify either a single VLAN ID or a range in the form `start-end`,
for example `500-1000`. Repeat the command to combine several IDs and
ranges on the same interface.
```

Example:

```none
set service pppoe-server interface eth3 vlan 100
set service pppoe-server interface eth3 vlan 500-1000
```

```{cfgcmd} set service pppoe-server interface \<interface\> combined

**Serve clients on the base interface in addition to the VLANs
configured with `vlan`.**

Without this option, an interface with `vlan` serves clients only on
those VLANs.
```

Example:

```none
set service pppoe-server interface eth3 combined
```

```{cfgcmd} set service pppoe-server interface \<interface\> vlan-mon

**Automatically create VLAN interfaces on the specified interface when
traffic arrives on the VLANs configured with `vlan`.**

The PPPoE server removes a created VLAN interface after 60 seconds
without traffic.

`vlan` must be configured on the same interface. Otherwise, the
commit fails.
```

Example:

```none
set service pppoe-server interface eth3 vlan 100
set service pppoe-server interface eth3 vlan-mon
```

## Bandwidth shaping

Bandwidth rate limits can be set for local users or via RADIUS
attributes.

### Local rate limits

```{cfgcmd} set service pppoe-server authentication local-users username \<name\> rate-limit download \<1-10000000\>

**Limit the download bandwidth of the specified user, in kbit/s.**

Both `download` and `upload` must be configured. Otherwise, the
commit fails.
```

Example:

```none
set service pppoe-server authentication local-users username user01 rate-limit download 20480
```

```{cfgcmd} set service pppoe-server authentication local-users username \<name\> rate-limit upload \<1-10000000\>

**Limit the upload bandwidth of the specified user, in kbit/s.**

Both `download` and `upload` must be configured. Otherwise, the
commit fails.
```

Example:

```none
set service pppoe-server authentication local-users username user01 rate-limit upload 10240
```

### RADIUS rate limits

By default, the rate information is taken from the `Filter-Id`
attribute. Configure it on the RADIUS server in the form
`Filter-Id=2000/3000`, where 2000 is the downstream rate and 3000 the
upstream rate, both in kbit/s.

The following command enables bandwidth shaping based on the rate
information received from the RADIUS server:

```none
set service pppoe-server authentication radius rate-limit enable
```

## Load balancing

Delaying {abbr}`PADO (PPPoE Active Discovery Offer)` replies balances
sessions across PPPoE servers. Clients usually connect to the server
that answers first, so a longer delay steers new clients toward other
servers.

```{cfgcmd} set service pppoe-server pado-delay \<1-999999\>

**Delay PADO replies by the given number of milliseconds while the
number of active sessions stays below every count configured with
`sessions`.**

By default, PADO replies are not delayed. Only one delay may be
configured without `sessions`, and its value cannot be `disable`.
Otherwise, the commit fails.
```

Example:

```none
set service pppoe-server pado-delay 20
```

```{cfgcmd} set service pppoe-server pado-delay \<1-999999 | disable\> sessions \<1-999999\>

**Delay PADO replies by the given number of milliseconds once the
number of active sessions reaches the given count.**

The value `disable` stops the PPPoE server from accepting new
connections at that session count.

Repeat the command with a different delay to configure several
thresholds.

If `disable` is used, it must be configured for the highest session
count of all delays. Otherwise, the commit fails.
```

Example:

```none
set service pppoe-server pado-delay 50 sessions 500
set service pppoe-server pado-delay disable sessions 1000
```

## IPv6 address assignment

```{cfgcmd} set service pppoe-server ppp-options ipv6 \<require | prefer | allow | deny\>

**Configure whether the PPPoE server negotiates IPv6 with clients:**

- `require`: Requires IPv6 negotiation.
- `prefer`: Asks the client for IPv6 negotiation. Does not fail if
  the client rejects it.
- `allow`: Negotiates IPv6 only if the client requests it.
- `deny`: Does not negotiate IPv6.

The default is `deny`.
```

Example:

```none
set service pppoe-server ppp-options ipv6 allow
```

```{cfgcmd} set service pppoe-server client-ipv6-pool \<name\> prefix \<ipv6net\> mask \<48-128\>

**Configure an IPv6 prefix as part of the named client pool.**

From this prefix, each client is assigned an individual network of
the configured `mask` length. The client forms its address inside
that network.

Repeat the command to add several prefixes to the same pool.

The default mask is 64.
```

Example:

```none
set service pppoe-server client-ipv6-pool IPV6-POOL prefix 2001:db8:8002::/48 mask 64
```

```{cfgcmd} set service pppoe-server client-ipv6-pool \<name\> delegate \<ipv6net\> delegation-prefix \<32-64\>

**Configure an IPv6 prefix from which the named pool delegates
prefixes of the configured `delegation-prefix` length to clients via
DHCPv6 prefix delegation
([RFC 3633](https://datatracker.ietf.org/doc/html/rfc3633)).**

Repeat the command to add several prefixes to the same pool.

The same pool must also have a `prefix` configured with
`client-ipv6-pool <name> prefix`. Otherwise, the commit fails.
```

Example:

```none
set service pppoe-server client-ipv6-pool IPV6-POOL prefix 2001:db8:8002::/48 mask 64
set service pppoe-server client-ipv6-pool IPV6-POOL delegate 2001:db8:8003::/48 delegation-prefix 56
```

```{cfgcmd} set service pppoe-server default-ipv6-pool \<name\>

**Configure the client pool from which IPv6 addresses and delegated
prefixes are assigned by default.**

A RADIUS-provided pool, when present, takes precedence.

In `local` and `noauth` authentication modes, if at least one
`client-ipv6-pool` is configured but `default-ipv6-pool` is not set,
the commit succeeds with a warning.
```

Example:

```none
set service pppoe-server default-ipv6-pool IPV6-POOL
```

### Advanced options

```{cfgcmd} set service pppoe-server ppp-options ipv6-accept-peer-interface-id

**Accept the interface identifier that the client proposes for its own
side of the session during IPv6 negotiation
([RFC 5072](https://datatracker.ietf.org/doc/html/rfc5072)).**

By default, the router does not accept it and uses the identifier
from `ipv6-peer-interface-id` instead.
```

Example:

```none
set service pppoe-server ppp-options ipv6-accept-peer-interface-id
```

```{cfgcmd} set service pppoe-server ppp-options ipv6-interface-id \<x:x:x:x | random\>

**Configure the interface identifier used on the router's side of
client sessions:**

- `x:x:x:x`: Use the given fixed interface identifier.
- `random`: Use a random interface identifier.

By default, a fixed interface identifier is used.
```

Example:

```none
set service pppoe-server ppp-options ipv6-interface-id random
```

```{cfgcmd} set service pppoe-server ppp-options ipv6-peer-interface-id \<x:x:x:x | random | ipv4-addr | calling-sid\>

**Configure the interface identifier used on the client's side of
sessions:**

- `x:x:x:x`: Use the given fixed interface identifier.
- `random`: Use a random interface identifier.
- `ipv4-addr`: Derive the interface identifier from the client's IPv4
  address, for example `192:168:0:1`.
- `calling-sid`: Derive the interface identifier from the client's
  calling station ID. With `calling-sid`,
  `ipv6-peer-interface-id-secret` must also be configured. Otherwise,
  the commit fails.
```

Example:

```none
set service pppoe-server ppp-options ipv6-peer-interface-id calling-sid
set service pppoe-server ppp-options ipv6-peer-interface-id-secret 'ChangeMeToARandomKey1234'
```

```{cfgcmd} set service pppoe-server ppp-options ipv6-peer-interface-id-secret \<secret\>

**Configure the secret key used to derive client interface identifiers
when `ipv6-peer-interface-id` is set to `calling-sid`.**

The secret must be 16 to 128 characters long. It may contain ASCII
letters, digits, and symbols, but not spaces.
```

Example:

```none
set service pppoe-server ppp-options ipv6-peer-interface-id-secret 'ChangeMeToARandomKey1234'
```

## Scripting

Store scripts under `/config` so that they are migrated to a new
image when the system is upgraded.

```{cfgcmd} set service pppoe-server extended-scripts on-change \<path\>

**Configure a script to run when the router changes a session
interface upon a RADIUS CoA request.**

The script file must exist and be executable. Otherwise, the commit
fails.
```

Example:

```none
set service pppoe-server extended-scripts on-change /config/scripts/pppoe-change.sh
```

```{cfgcmd} set service pppoe-server extended-scripts on-down \<path\>

**Configure a script to run when a client session is about to
terminate.**

The script file must exist and be executable. Otherwise, the commit
fails.
```

Example:

```none
set service pppoe-server extended-scripts on-down /config/scripts/pppoe-down.sh
```

```{cfgcmd} set service pppoe-server extended-scripts on-pre-up \<path\>

**Configure a script to run before the PPP interface of a client
session comes up.**

The script file must exist and be executable. Otherwise, the commit
fails.
```

Example:

```none
set service pppoe-server extended-scripts on-pre-up /config/scripts/pppoe-pre-up.sh
```

```{cfgcmd} set service pppoe-server extended-scripts on-up \<path\>

**Configure a script to run when the PPP interface of a client session
is completely configured and started.**

The script file must exist and be executable. Otherwise, the commit
fails.
```

Example:

```none
set service pppoe-server extended-scripts on-up /config/scripts/pppoe-up.sh
```

## Advanced options

### Authentication

```{cfgcmd} set service pppoe-server authentication local-users username \<name\> disable

**Disable the specified user account without removing it from the
configuration.**
```

Example:

```none
set service pppoe-server authentication local-users username user01 disable
```

```{cfgcmd} set service pppoe-server authentication local-users username \<name\> static-ip \<ipv4-address\>

**Assign a fixed IPv4 address to the specified user.**

Without this option, the user's address is allocated from the pool
set as `default-pool`.
```

Example:

```none
set service pppoe-server authentication local-users username user01 static-ip 192.0.2.50
```

```{cfgcmd} set service pppoe-server authentication protocols \<pap | chap | mschap | mschap-v2\>

**Configure the authentication protocols the PPPoE server accepts
from clients:**

- `pap`: Password Authentication Protocol
  ([RFC 1334](https://datatracker.ietf.org/doc/html/rfc1334))
- `chap`: Challenge Handshake Authentication Protocol
  ([RFC 1994](https://datatracker.ietf.org/doc/html/rfc1994))
- `mschap`: Microsoft CHAP
  ([RFC 2433](https://datatracker.ietf.org/doc/html/rfc2433))
- `mschap-v2`: Microsoft CHAP version 2
  ([RFC 2759](https://datatracker.ietf.org/doc/html/rfc2759))

Repeat the command to accept several protocols.

By default, all four protocols are accepted.
```

Example:

```none
set service pppoe-server authentication protocols mschap-v2
```

```{cfgcmd} set service pppoe-server authentication any-login

**Accept any username during PAP, CHAP, and MS-CHAPv1
authentication.**

The password is still checked. MS-CHAPv2 is not covered by this
option.
```

Example:

```none
set service pppoe-server authentication any-login
```

### Client IP pool

```{cfgcmd} set service pppoe-server client-ip-pool \<name\> next-pool \<name\>

**Configure the next pool, from which client addresses are allocated
once the specified client pool is exhausted.**

The following requirements are enforced when the configuration is
committed:

- The specified client pool must have a `range`.
- The pool named in `next-pool` must be configured under
  `client-ip-pool`.
- The chain of pools must not form a loop.
```

Example:

```none
set service pppoe-server client-ip-pool PPPOE-POOL range 192.0.2.10-192.0.2.99
set service pppoe-server client-ip-pool OVERFLOW-POOL range 198.51.100.10-198.51.100.99
set service pppoe-server client-ip-pool PPPOE-POOL next-pool OVERFLOW-POOL
```

### PPP

```{cfgcmd} set service pppoe-server ppp-options disable-ccp

**Disable {abbr}`CCP (Compression Control Protocol)` negotiation with
clients.**

CCP ([RFC 1962](https://datatracker.ietf.org/doc/html/rfc1962)) is
the part of PPP where the two ends of a session agree on compressing
session traffic. By default, the PPPoE server negotiates CCP.

{abbr}`MPPE (Microsoft Point-to-Point Encryption)` is negotiated as
part of CCP, so `disable-ccp` also disables MPPE, whatever
`ppp-options mppe` is set to.
```

Example:

```none
set service pppoe-server ppp-options disable-ccp
```

```{cfgcmd} set service pppoe-server ppp-options interface-cache \<1-256000\>

**Configure the number of PPP interfaces kept in a cache after their
sessions end, for reuse by new sessions.**

Reusing cached interfaces reduces how often the kernel creates and
deletes interfaces.

By default, interfaces are not cached.
```

Example:

```none
set service pppoe-server ppp-options interface-cache 1000
```

```{cfgcmd} set service pppoe-server ppp-options ipv4 \<require | prefer | allow | deny\>

**Configure whether the PPPoE server negotiates IPv4 with clients:**

- `require`: Requires IPv4 negotiation.
- `prefer`: Asks the client for IPv4 negotiation. Does not fail if
  the client rejects it.
- `allow`: Negotiates IPv4 only if the client requests it.
- `deny`: Does not negotiate IPv4.
```

Example:

```none
set service pppoe-server ppp-options ipv4 require
```

```{cfgcmd} set service pppoe-server ppp-options lcp-echo-failure \<number\>

**Configure the maximum number of {abbr}`LCP (Link Control Protocol)`
Echo-Request packets the PPPoE server may send without receiving a
valid reply.**

When the limit is exceeded, the session is terminated. The value must
be a positive integer.

The default is 3.
```

Example:

```none
set service pppoe-server ppp-options lcp-echo-failure 5
```

```{cfgcmd} set service pppoe-server ppp-options lcp-echo-interval \<interval\>

**Configure the interval, in seconds, between LCP Echo-Request packets
sent to the client.**

The value must be a positive integer.

The default is 30.
```

Example:

```none
set service pppoe-server ppp-options lcp-echo-interval 10
```

```{cfgcmd} set service pppoe-server ppp-options lcp-echo-timeout \<timeout\>

**Configure the time, in seconds, to wait for any client activity.**

Setting this option enables adaptive LCP echo, and `lcp-echo-failure`
is then not used. The value must be a positive integer.

The default is 0, which leaves adaptive LCP echo off.
```

Example:

```none
set service pppoe-server ppp-options lcp-echo-timeout 120
```

```{cfgcmd} set service pppoe-server ppp-options min-mtu \<68-65535\>

**Configure the smallest
{abbr}`MTU (Maximum Transmission Unit)` value, in bytes, that the
PPPoE server accepts from clients.**

If a client tries to negotiate a lower MTU, the PPPoE server rejects
the value and suggests an acceptable one. If the client also rejects
the greater MTU, the PPPoE server disconnects it.

The default is 1280.
```

Example:

```none
set service pppoe-server ppp-options min-mtu 1400
```

```{cfgcmd} set service pppoe-server ppp-options mppe \<require | prefer | deny\>

**Configure the negotiation of MPPE with clients:**

- `require`: Ask the client for MPPE. If the client rejects it, drop
  the connection.
- `prefer`: Ask the client for MPPE. If the client rejects it,
  continue without MPPE.
- `deny`: Do not use MPPE.

The default is `prefer`.

A RADIUS server may override this option with the
MS-MPPE-Encryption-Policy attribute.
```

Example:

```none
set service pppoe-server ppp-options mppe require
```

```{cfgcmd} set service pppoe-server ppp-options mru \<68-65535\>

**Configure the preferred {abbr}`MRU (Maximum Receive Unit)`, in
bytes, that the PPPoE server announces to clients.**

By default, no preferred MRU is configured.
```

Example:

```none
set service pppoe-server ppp-options mru 1492
```

### Global

```{cfgcmd} set service pppoe-server description \<description\>

**Set a description for the PPPoE server configuration.**

The description may be up to 255 characters long.
```

Example:

```none
set service pppoe-server description 'PPPoE access for example.com subscribers'
```

```{cfgcmd} set service pppoe-server limits burst \<value\>

**Configure how many PPPoE discovery requests the PPPoE server accepts
from a single client before it enforces the rate set with
`limits connection-limit`.**
```

Example:

```none
set service pppoe-server limits burst 100
```

```{cfgcmd} set service pppoe-server limits connection-limit \<n/min | n/sec\>

**Configure the rate of PPPoE discovery requests the PPPoE server
accepts from a single client, for example `10/min` or `60/sec`.**

Requests above this rate are ignored, so the client receives no
reply.
```

Example:

```none
set service pppoe-server limits connection-limit 10/min
```

```{cfgcmd} set service pppoe-server limits timeout \<value\>

**Configure how long, in seconds, a single client must send no
requests for its request count to be reset.**
```

Example:

```none
set service pppoe-server limits timeout 60
```

```{cfgcmd} set service pppoe-server log level \<0-5\>

**Configure how much detail the PPPoE server writes to the system
log:**

- `0`: Nothing.
- `1`: Errors.
- `2`: Errors and warnings.
- `3`: Errors, warnings, and basic information.
- `4`: Errors, warnings, and full information.
- `5`: Everything, including debug messages.

The default is 3.
```

Example:

```none
set service pppoe-server log level 4
```

```{cfgcmd} set service pppoe-server mtu \<128-16384\>

**Configure the MTU for client sessions, in bytes.**

The default is 1492.
```

Example:

```none
set service pppoe-server mtu 1460
```

```{cfgcmd} set service pppoe-server max-concurrent-sessions \<0-65535\>

**Limits how many client sessions may start at the same time.**

The value 0 means no limit. By default, the number of sessions
starting at the same time is not limited.
```

Example:

```none
set service pppoe-server max-concurrent-sessions 100
```

```{cfgcmd} set service pppoe-server name-server \<address\>

**Configure a DNS server address that clients should use.**

Repeat the command to configure multiple addresses. Both IPv4 and
IPv6 addresses are accepted. At most two IPv4 and three IPv6 name
servers may be configured. Otherwise, the commit fails.
```

Example:

```none
set service pppoe-server name-server 192.0.2.53
set service pppoe-server name-server 2001:db8::53
```

```{cfgcmd} set service pppoe-server service-name \<name\>

**Configure a Service-Name the PPPoE server answers to during PPPoE
discovery ([RFC 2516](https://datatracker.ietf.org/doc/html/rfc2516)).**

The name may be up to 100 characters long and may contain letters,
digits, and hyphens.

Repeat the command to configure multiple service names.

If no service name is configured, the PPPoE server accepts any
Service-Name and echoes the client's Service-Name back.
```

Example:

```none
set service pppoe-server service-name internet
```

```{cfgcmd} set service pppoe-server accept-any-service

**Accept any Service-Name in a PADR request, while still announcing
the names configured with `service-name`.**

Use this option when clients select the PPPoE server by the
Service-Name they see in PADO replies.
```

Example:

```none
set service pppoe-server accept-any-service
```

```{cfgcmd} set service pppoe-server accept-blank-service

**Accept a blank Service-Name even when `service-name` is
configured.**
```

Example:

```none
set service pppoe-server accept-blank-service
```

```{cfgcmd} set service pppoe-server session-control \<deny | disable | replace\>

**Configure what happens when a user who already has an active
session is authorized for a second session:**

- `deny`: Deny the second session.
- `disable`: Disable session control. Users may hold multiple
  sessions at once.
- `replace`: Terminate the first session when the second one is
  authorized.

The default is `replace`.
```

Example:

```none
set service pppoe-server session-control deny
```

```{cfgcmd} set service pppoe-server shaper fwmark \<1-2147483647\>

**Exclude traffic carrying the given firewall mark from bandwidth
shaping.**
```

Example:

```none
set service pppoe-server shaper fwmark 223
```

```{cfgcmd} set service pppoe-server snmp master-agent

**Configure the PPPoE server to serve
{abbr}`SNMP (Simple Network Management Protocol)` requests for its
own statistics.**

By default, the PPPoE server does not serve these requests itself.
```

Example:

```none
set service pppoe-server snmp master-agent
```

```{cfgcmd} set service pppoe-server thread-count \<all | half | 1-512\>

**Configure how many worker threads the PPPoE server runs:**

- `all`: One thread per CPU core.
- `half`: One thread per two CPU cores.
- `1-512`: The given number of threads.

A change to this option takes effect when the PPPoE server restarts.

The default is `all`.
```

Example:

```none
set service pppoe-server thread-count half
```

```{cfgcmd} set service pppoe-server wins-server \<ipv4-address\>

**Configure a {abbr}`WINS (Windows Internet Name Service)` server
address propagated to clients.**

Repeat the command to configure a second address.

At most two WINS servers may be configured. Otherwise, the commit
fails.
```

Example:

```none
set service pppoe-server wins-server 192.0.2.11
```

## Operation

### Show

```{opcmd} show pppoe-server sessions

**Show active PPPoE server sessions.**
```

```{opcmd} show pppoe-server statistics

**Show PPPoE server statistics.**
```

```{opcmd} show pppoe-server interfaces

**Show the interfaces on which the PPPoE server listens.**
```

### Reset

```{opcmd} reset pppoe-server all

**Terminate all PPPoE sessions.**
```

```{opcmd} reset pppoe-server interface \<interface\>

**Terminate the PPPoE session running on the specified PPP
interface.**
```

```{opcmd} reset pppoe-server username \<username\>

**Terminate the PPPoE sessions of the specified user.**
```

### Restart

```{opcmd} restart pppoe-server

**Restart the PPPoE server.**

All active PPPoE sessions are terminated.
```

### Maintenance mode

```{opcmd} set pppoe-server maintenance-mode enable

**Stop accepting new PPPoE sessions and shut the PPPoE server down
once the last active session ends.**
```

```{opcmd} set pppoe-server maintenance-mode cancel

**Resume accepting new PPPoE sessions.**
```

## Examples

### Configure PPPoE Server

The following example configures a minimal PPPoE server with local
authentication:

```none
set service pppoe-server access-concentrator PPPoE-Server
set service pppoe-server authentication mode local
set service pppoe-server authentication local-users username test password 'test'
set service pppoe-server client-ip-pool PPPOE-POOL range 192.168.255.2-192.168.255.254
set service pppoe-server default-pool 'PPPOE-POOL'
set service pppoe-server gateway-address 192.168.255.1
set service pppoe-server interface eth0
```

### IPv4

The following example uses ACN as the access concentrator name,
assigns client addresses from the range 10.1.1.100-10.1.1.111, uses
10.1.1.2 as the local address of the PPP interfaces, and serves
clients on eth1 only.

```none
set service pppoe-server access-concentrator 'ACN'
set service pppoe-server authentication local-users username foo password 'bar'
set service pppoe-server authentication mode 'local'
set service pppoe-server client-ip-pool IP-POOL range '10.1.1.100-10.1.1.111'
set service pppoe-server default-pool 'IP-POOL'
set service pppoe-server interface eth1
set service pppoe-server gateway-address '10.1.1.2'
set service pppoe-server name-server '10.100.100.1'
set service pppoe-server name-server '10.100.200.1'
```

### Automatic VLAN creation

```none
set service pppoe-server interface eth3 vlan 100
set service pppoe-server interface eth3 vlan 200
set service pppoe-server interface eth3 vlan 500-1000
set service pppoe-server interface eth3 vlan 2000-3000
```

### Bandwidth shaping for a local user

The following example configures a local user with a download limit
of 20480 kbit/s and an upload limit of 10240 kbit/s.

```none
set service pppoe-server access-concentrator 'ACN'
set service pppoe-server authentication local-users username foo password 'bar'
set service pppoe-server authentication local-users username foo rate-limit download '20480'
set service pppoe-server authentication local-users username foo rate-limit upload '10240'
set service pppoe-server authentication mode 'local'
set service pppoe-server client-ip-pool IP-POOL range '10.1.1.100/24'
set service pppoe-server default-pool 'IP-POOL'
set service pppoe-server name-server '10.100.100.1'
set service pppoe-server name-server '10.100.200.1'
set service pppoe-server interface 'eth1'
set service pppoe-server gateway-address '10.1.1.2'
```

Once the user is connected, the user session uses the configured
limits and can be displayed via `show pppoe-server sessions`.

```none
show pppoe-server sessions

% stop_vyoslinter
ifname | username |     ip     |    calling-sid    | rate-limit  | state  |  uptime  | rx-bytes | tx-bytes
-------+----------+------------+-------------------+-------------+--------+----------+----------+----------
ppp0   | foo      | 10.1.1.100 | 00:53:00:ba:db:15 | 20480/10240 | active | 00:00:11 | 214 B    | 76 B
```
% start_vyoslinter

### Load balancing with PADO delays

In the following example, PADO replies are delayed by 20 ms while
fewer than 500 sessions are active, by 50 ms from 500 active
sessions, by 100 ms from 1000, and by 300 ms from 3000. None of these
delays limits the number of sessions.

```none
set service pppoe-server pado-delay 20
set service pppoe-server pado-delay 50 sessions '500'
set service pppoe-server pado-delay 100 sessions '1000'
set service pppoe-server pado-delay 300 sessions '3000'
```

### IPv6 address assignment

The following example enables IPv6 for client sessions and configures
a pool that assigns each client a /64 network and delegates a /56
prefix for use in the client's own network.

```none
set service pppoe-server ppp-options ipv6 allow
set service pppoe-server client-ipv6-pool IPV6-POOL prefix '2001:db8:8002::/48' mask '64'
set service pppoe-server client-ipv6-pool IPV6-POOL delegate '2001:db8:8003::/48' delegation-prefix '56'
set service pppoe-server default-ipv6-pool IPV6-POOL
```

### Dual-stack IPv4/IPv6 provisioning with prefix delegation

The following example serves both IPv4 and IPv6. Each client receives
an IPv4 address, an IPv6 network for the client side of the session,
and a delegated prefix for the client's own network.

```none
set service pppoe-server authentication local-users username test password 'test'
set service pppoe-server authentication mode 'local'
set service pppoe-server client-ip-pool IP-POOL range '192.168.0.1/24'
set service pppoe-server default-pool 'IP-POOL'
set service pppoe-server client-ipv6-pool IPV6-POOL prefix '2001:db8:8002::/48' mask '64'
set service pppoe-server client-ipv6-pool IPV6-POOL delegate '2001:db8:8003::/48' delegation-prefix '56'
set service pppoe-server default-ipv6-pool IPV6-POOL
set service pppoe-server ppp-options ipv6 allow
set service pppoe-server name-server '10.1.1.1'
set service pppoe-server name-server '2001:db8:4860::8888'
set service pppoe-server interface 'eth2'
set service pppoe-server gateway-address '10.100.100.1'
```

```none
vyos@pppoe-server:~$ show pppoe-server sessions

% stop_vyoslinter
ifname | username |     ip      |            ip6           |       ip6-dp        |    calling-sid    | rate-limit | state  |  uptime  | rx-bytes | tx-bytes
-------+----------+-------------+--------------------------+---------------------+-------------------+------------+--------+----------+----------+----------
ppp0   | test     | 192.168.0.1 | 2001:db8:8002:0:200::/64 | 2001:db8:8003::1/56 | 00:53:00:12:42:eb |            | active | 00:00:49 | 875 B    | 2.1 KiB
```
% start_vyoslinter
