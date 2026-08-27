---
myst:
  html_meta:
    description: |
      SNMP is an Internet Standard protocol for collecting and
      organizing information about managed devices on IP networks and
      for modifying that information to change device behavior.
    keywords: snmp, snmpv2c, snmpv3, mib, community, trap, usm, vacm, engineid
---

(snmp)=

# SNMP

{abbr}`SNMP (Simple Network Management Protocol)` is an Internet
Standard protocol for collecting and organizing information about
managed devices on IP networks and for modifying that information to
change device behavior. Devices that support SNMP typically include
routers, switches, servers, workstations, and printers.

SNMP exposes management data as variables organized in a management
information base ({abbr}`MIB (Management Information Base)`), which
describes the managed system's status and configuration. Managed
devices run a software component called an agent, which has local
knowledge of management information and translates it to and from an
SNMP-specific form. One or more administrative computers, running
{abbr}`NMS (Network Management Station)` software, remotely query (and,
in some circumstances, manipulate) these variables.

Three significant versions of SNMP have been developed and deployed.
SNMPv1 is the original version of the protocol. More recent versions,
SNMPv2c and SNMPv3, feature improvements in performance, flexibility,
and security.

A VyOS router is such a managed device: VyOS provides its SNMP agent,
configurable under `service snmp`. When you commit the configuration,
VyOS generates the agent configuration from these settings and starts
the agent, which then answers SNMP requests and sends notifications to
any configured monitoring systems (trap targets).

## SNMP protocol versions

VyOS supports community-based SNMPv2c and SNMPv3. SNMPv3 is recommended
because of improved security (authentication and encryption).

### SNMPv2c

SNMPv2c authorizes clients using the concept of communities. A
community may be authorized read-only (`ro`, the most common case) or
read-write (`rw`). A configured community also authorizes SNMPv1
requests.

SNMP can work synchronously or asynchronously. In synchronous
communication, the monitoring system queries the router periodically.
In asynchronous communication, the router sends notifications to a trap
target.

SNMPv2c authenticates requests only by the community string, which is
transmitted in clear text, and supports no encryption. Restrict access
to the addresses or networks of trusted clients, and prefer SNMPv3
where possible.

### SNMPv3

SNMPv3 introduced the security features missing from previous protocol
versions. Each SNMPv3 message carries security parameters whose meaning
depends on the security model in use. VyOS uses the
{abbr}`USM (User-based Security Model)` (RFC 3414) together with the
{abbr}`VACM (View-based Access Control Model)` (RFC 3415).

The security approach in SNMPv3 targets:

- Confidentiality: Encryption of packets to prevent snooping by an
  unauthorized source.
- Integrity: Message integrity to ensure that a packet has not been
  tampered with while in transit, including an optional packet replay
  protection mechanism.
- Authentication: Verification that the message is from a valid source.

## Configuration

### Listener

```{cfgcmd} set service snmp listen-address \<address\> port \<1-65535\>

Configure a local IPv4 or IPv6 address, and optionally a port, on which
the SNMP agent listens for incoming SNMP requests.

The address must already be assigned to a local interface in the same
{abbr}`VRF (Virtual Routing and Forwarding)` as the agent. Otherwise,
the commit fails.

Repeat the command to configure multiple addresses.

When unset, the agent listens on all local IPv4 and IPv6 addresses.

The default port is 161.

When at least one listen address is configured, VyOS automatically adds
127.0.0.1 and ::1 (port 161) to the configured listen addresses.
```

Example:

```none
set service snmp listen-address 192.0.2.1
set service snmp listen-address 2001:db8::1
```

```{cfgcmd} set service snmp protocol \<udp | tcp\>

**Configure the transport protocol on which the SNMP agent listens.**

The default is `udp`.
```

Example:

```none
set service snmp protocol tcp
```

```{cfgcmd} set service snmp vrf \<name\>

Bind the SNMP agent to the specified VRF instance.

The VRF must already be configured under `set vrf name <name>`.
Otherwise, the commit fails.
```

Example:

```none
set service snmp vrf mgmt
```

### System information

```{cfgcmd} set service snmp contact \<contact\>

Configure the system contact information that the SNMP agent publishes
in the SNMPv2-MIB `sysContact` object (RFC 3418).

The value is limited to 255 characters.
```

Example:

```none
set service snmp contact 'admin@example.com'
```

```{cfgcmd} set service snmp location \<location\>

Configure the system location information that the SNMP agent publishes
in the SNMPv2-MIB `sysLocation` object (RFC 3418).

The value is limited to 255 characters.
```

Example:

```none
set service snmp location 'UK, London'
```

```{cfgcmd} set service snmp description \<description\>

Configure the system description that the SNMP agent publishes in the
SNMPv2-MIB `sysDescr` object (RFC 3418).

By default, the SNMP agent publishes `VyOS <version>` as the system
description. The value is limited to 255 characters.
```

Example:

```none
set service snmp description 'Edge router'
```

### SNMPv2c communities

By default, a community grants access to the whole MIB except the
routing and address resolution tables. `set service snmp oid-enable`
adds them.

```{cfgcmd} set service snmp community \<name\>

Configure a community string that authorizes client requests.

The community name may contain alphanumeric characters and `-`, `_`,
`!`, `@`, `*`, `#`, with a maximum length of 100 characters.
```

Example:

```none
set service snmp community routers
```

```{cfgcmd} set service snmp community \<name\> authorization \<ro | rw\>

Configure the authorization granted to clients using the specified
community: read-only (`ro`) or read-write (`rw`).

The default is `ro`.
```

Example:

```none
set service snmp community routers authorization ro
```

```{cfgcmd} set service snmp community \<name\> client \<address\>

**Configure an IPv4 or IPv6 address of a client allowed to contact the
router using the specified community.**

Repeat the command to allow multiple clients.

On its own, this does not restrict access, because the default for
`network` permits requests from any source address. Configure `network`
as well, so that the agent accepts requests for this community only from
the addresses and prefixes you list.
```

Example:

```none
set service snmp community routers client 203.0.113.10
set service snmp community routers client 2001:db8::10
```

```{cfgcmd} set service snmp community \<name\> network \<prefix\>

**Configure an IPv4 or IPv6 prefix from which clients are allowed to
contact the router using the specified community.**

Repeat the command to allow multiple prefixes.

The default is `0.0.0.0/0` and `::/0`, which permits requests from any
source address.
```

Example:

```none
set service snmp community routers network 192.0.2.0/24
set service snmp community routers network 2001:db8:ffff:eeee::/64
```

### Trap notifications

VyOS pre-configures `linkUp` and `linkDown` notification events. Every
10 seconds, the SNMP agent evaluates the operational status of the
interfaces it collects data from and notifies the configured trap
targets of interface state changes.

```{cfgcmd} set service snmp trap-target \<address\> community \<community\>

Configure a destination host for SNMPv2c trap notifications and the
community string that the SNMP agent sends with them.

Repeat the command to configure multiple trap targets.

Each trap target requires a community. Otherwise, the commit fails.
```

Example:

```none
set service snmp trap-target 203.0.113.10 community routers
```

```{cfgcmd} set service snmp trap-target \<address\> port \<1-65535\>

Configure the destination port for traps that the SNMP agent sends to
the specified trap target.

The default is 162.
```

Example:

```none
set service snmp trap-target 203.0.113.10 port 10162
```

```{cfgcmd} set service snmp trap-source \<address\>

Configure the source IPv4 or IPv6 address that the router uses for SNMP
notifications.
```

Example:

```none
set service snmp trap-source 192.0.2.1
```

### SNMPv3

Access to the MIB over SNMPv3 is configured in three parts: views,
groups, and users. A view is a named list of MIB subtrees. A subtree is
written as an {abbr}`OID (object identifier)` and contains every object
whose OID starts with it. A group combines a view, an access
permission, and a security level. Each user belongs to a group, and the
group's view determines what that user may reach.

```{cfgcmd} set service snmp v3 engineid \<id\>

Configure the unique identifier of the SNMP agent (snmpEngineID, RFC
3411).

The value must contain an even number of lowercase hexadecimal
characters and be 2 to 36 characters long.

The ID must be configured when any user is defined under
`service snmp v3 user`. Otherwise, the commit fails.

Changing the ID after users are configured leaves their stored keys
tied to the previous value. Set their passwords again under
`service snmp v3 user`.
```

Example:

```none
set service snmp v3 engineid 000000000000000000000002
```

```{cfgcmd} set service snmp v3 group \<name\> view \<view\>

**Configure the MIB view that determines which objects members of the
specified group can access.**

Each group requires a view, and the view must already be defined under
`service snmp v3 view`. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 group default view default
```

```{cfgcmd} set service snmp v3 group \<name\> mode \<ro | rw\>

Configure the access permission granted to the specified group:
read-only (`ro`) or read-write (`rw`).

With `rw`, the SNMP agent uses the group's view for both read and write
access. The default is `ro`.
```

Example:

```none
set service snmp v3 group default mode ro
```

```{cfgcmd} set service snmp v3 group \<name\> seclevel \<noauth | auth | priv\>

Configure the security level required for the specified group.

- noauth: Messages are not authenticated and not encrypted.
- auth: Messages are authenticated but not encrypted.
- priv: Messages are authenticated and encrypted.

The default is `auth`.
```

Example:

```none
set service snmp v3 group default seclevel priv
```

```{cfgcmd} set service snmp v3 user \<name\> auth \<plaintext-password | encrypted-password\> \<value\>

**Configure the authentication key for the specified SNMPv3 user,
either as a plaintext password or as the derived key itself.**

A plaintext password must be at least 8 characters long. A key must use
lowercase hexadecimal characters (`0` to `9`, `a` to `f`).

Upon commit, VyOS derives a key from the plaintext password and the ID,
using the selected authentication protocol, and replaces
`plaintext-password` with the resulting `encrypted-password` in the
configuration.

Each user requires an authentication key. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 user vyos auth plaintext-password vyos12345678
```

```{cfgcmd} set service snmp v3 user \<name\> auth type \<md5 | sha\>

Configure the authentication protocol used by the specified user:
HMAC-MD5-96 (md5) or HMAC-SHA-96 (sha).

The default is `md5`.

VyOS derives both the authentication key and the privacy key of the
user using this protocol. Changing it after the keys are derived leaves
them tied to the previous protocol. Set the authentication and privacy
passwords again under `service snmp v3 user`.
```

Example:

```none
set service snmp v3 user vyos auth type sha
```

```{cfgcmd} set service snmp v3 user \<name\> privacy \<plaintext-password | encrypted-password\> \<value\>

Configure the privacy key for the specified SNMPv3 user, either as a
plaintext password or as the derived key itself.

A plaintext password must be at least 8 characters long. A key must use
lowercase hexadecimal characters (`0` to `9`, `a` to `f`).

Upon commit, VyOS derives a key from the plaintext password and the ID,
using the selected authentication protocol, and replaces
`plaintext-password` with the resulting `encrypted-password` in the
configuration.

Each user requires a privacy key. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 user vyos privacy plaintext-password vyos12345678
```

```{cfgcmd} set service snmp v3 user \<name\> privacy type \<des | aes\>

Configure the privacy protocol used by the specified user: CBC-DES
(des) or CFB128-AES-128 (aes).

The default is `des`.
```

Example:

```none
set service snmp v3 user vyos privacy type aes
```

```{cfgcmd} set service snmp v3 user \<name\> group \<group\>

**Assign the specified SNMPv3 user to a group.**

Groups are defined under `service snmp v3 group`.

Each user must be assigned a group. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 user vyos group default
```

```{cfgcmd} set service snmp v3 user \<name\> mode \<ro | rw\>

**Configure the access permission of the specified user: read-only
(`ro`) or read-write (`rw`).**

The value does not affect what the user may access. Access is
determined by the group the user belongs to, configured under
`service snmp v3 group`.

The default is `ro`.
```

Example:

```none
set service snmp v3 user vyos mode ro
```

```{cfgcmd} set service snmp v3 view \<name\> oid \<oid\>

**Configure an OID subtree included in the specified MIB view.**

Repeat the command to include multiple subtrees.

Each view requires at least one OID. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 view default oid 1
```

```{cfgcmd} set service snmp v3 view \<name\> oid \<oid\> exclude \<oid\>

**Exclude an OID subtree from the specified MIB view.**

Repeat the command to exclude multiple subtrees.
```

Example:

```none
set service snmp v3 view default oid 1 exclude 1.3.6.1.2.1.4
```

<!-- The command below is intentionally left undocumented. The CLI accepts
and stores the value, but the generated agent configuration omits it,
so the mask never reaches the running service. Verified on VyOS 1.5.0.

```{cfgcmd} set service snmp v3 view \<name\> oid \<oid\> mask \<hex-octets\>

**Define a bitmask indicating which numbers of the OID an object's OID
must match, instead of all of them, for the object to be in the view.**
```
-->

```{cfgcmd} set service snmp v3 trap-target \<address\>

**Configure a destination host (trap target) for SNMPv3
notifications.**

The SNMP agent authenticates and encrypts every notification it sends
to an SNMPv3 trap target.

Each SNMPv3 trap target requires an authentication key and a privacy
key. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10
```

```{cfgcmd} set service snmp v3 trap-target \<address\> port \<1-65535\>

**Configure the destination port for notifications that the SNMP agent
sends to the specified trap target.**

The default is 162.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 port 10162
```

```{cfgcmd} set service snmp v3 trap-target \<address\> protocol \<udp | tcp\>

Configure the transport protocol for notifications that the SNMP agent
sends to the specified trap target.

The default is udp.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 protocol udp
```

```{cfgcmd} set service snmp v3 trap-target \<address\> type \<inform | trap\>

Configure whether the SNMP agent sends notifications to the specified
trap target as acknowledged InformRequests (inform) or as unacknowledged
traps (trap).

The default is inform.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 type trap
```

```{cfgcmd} set service snmp v3 trap-target \<address\> user \<name\>

**Configure the security name that the SNMP agent sends in
notifications to the specified trap target.**

The name does not have to match any user configured under
`service snmp v3 user`. Those users authorize incoming queries, not
outgoing notifications.

The agent sends the name in clear text. The receiver uses it to select
the keys for verifying and decrypting the notification. Configure the
receiver with this name and the keys from `auth` and `privacy` of this
trap target.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 user vyos
```

```{cfgcmd} set service snmp v3 trap-target \<address\> auth \<plaintext-password | encrypted-password\> \<value\>

**Configure the authentication key for notifications that the SNMP
agent sends to the specified trap target, either as a plaintext password
or as the key itself.**

A plaintext password must be at least 8 characters long. A key must use
lowercase hexadecimal characters (`0` to `9`, `a` to `f`).

VyOS stores the value as entered and passes it to the SNMP agent
unchanged. A plaintext password therefore stays readable in the
configuration and in configuration backups. An encrypted password keeps
the password itself out of the configuration, but it is a working key.
Anyone who obtains it can send notifications in the router's name.

Exactly one of `plaintext-password` or `encrypted-password` must be
configured. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 auth plaintext-password vyos12345678
```

```{cfgcmd} set service snmp v3 trap-target \<address\> auth type \<md5 | sha\>

Configure the authentication protocol for notifications that the SNMP
agent sends to the specified trap target: HMAC-MD5-96 (md5) or
HMAC-SHA-96 (sha).

The default is `md5`.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 auth type sha
```

```{cfgcmd} set service snmp v3 trap-target \<address\> privacy \<plaintext-password | encrypted-password\> \<value\>

**Configure the privacy key for notifications that the SNMP agent sends
to the specified trap target, either as a plaintext password or as the
key itself.**

A plaintext password must be at least 8 characters long. A key must use
lowercase hexadecimal characters (`0` to `9`, `a` to `f`).

VyOS stores the value as entered and passes it to the SNMP agent
unchanged. A plaintext password therefore stays readable in the
configuration and in configuration backups. An encrypted password keeps
the password itself out of the configuration, but it is a working key.
Anyone who obtains it can decrypt captured notifications.

Exactly one of `plaintext-password` or `encrypted-password` must be
configured. Otherwise, the commit fails.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 privacy plaintext-password vyos12345678
```

```{cfgcmd} set service snmp v3 trap-target \<address\> privacy type \<des | aes\>

Configure the privacy protocol for notifications that the SNMP agent
sends to the specified trap target: CBC-DES (des) or CFB128-AES-128
(aes).

The default is des.
```

Example:

```none
set service snmp v3 trap-target 203.0.113.10 privacy type aes
```

### MIB options

```{cfgcmd} set service snmp mib interface-max \<1-4294967295\>

**Limit how many interfaces the SNMP agent collects data from.**

By default, the agent collects data from all local interfaces.

Once a limit is set, the agent sorts the interfaces by their number and
collects data from that many, starting with the lowest.
```

Example:

```none
set service snmp mib interface-max 1000
```

```{cfgcmd} set service snmp mib interface \<prefix\>

**Restrict the interfaces the SNMP agent collects data from to those
whose names begin with the specified prefix.**

By default, the agent collects data from all local interfaces.

Accepted prefixes: `br`, `bond`, `dum`, `eth`, `gnv`, `macsec`, `peth`,
`sstpc`, `tun`, `veth`, `vti`, `vtun`, `vxlan`, `wg`, `wlan`, `wwan`.

Repeat the command to include multiple prefixes.
```

Example:

```none
set service snmp mib interface eth
set service snmp mib interface bond
```

```{cfgcmd} set service snmp oid-enable \<ip-forward | ip-route-table | ip-net-to-media-table | ip-net-to-physical-phys-address\>

Enable OID subtrees that community-based access excludes by default.

- ip-forward: ipForward (.1.3.6.1.2.1.4.24)
- ip-route-table: ipRouteTable (.1.3.6.1.2.1.4.21)
- ip-net-to-media-table: ipNetToMediaTable (.1.3.6.1.2.1.4.22)
- ip-net-to-physical-phys-address: ipNetToPhysicalPhysAddress (.1.3.6.1.2.1.4.35)

Repeat the command to enable multiple subtrees.

Enabling these subtrees may lead to system instability and high
resource consumption, for example, on systems with large routing
tables. VyOS prints a corresponding warning at commit time.
```

Example:

```none
set service snmp oid-enable ip-forward
```

### SMUX peer

{abbr}`SMUX (SNMP Multiplexing)`, defined in
[RFC 1227](https://datatracker.ietf.org/doc/html/rfc1227), is a legacy
protocol that lets a separate process, called a SMUX peer, answer
requests for part of the MIB on behalf of the SNMP agent.

```{cfgcmd} set service snmp smux-peer \<oid\>

**Register an OID subtree so that a SMUX peer can answer requests for
it.**

Repeat the command to register multiple subtrees.
```

Example:

```none
set service snmp smux-peer 1.3.6.1.4.1.3317.1.2.2
```

### Script extensions

The SNMP agent can run a custom script and report its output and exit
status through the extension MIB (NET-SNMP-EXTEND-MIB), shown in the
query below. Create the script, upload it to the router using
`scp your_script.sh vyos@your_router:/config/user-data`, and then
register it with the command below.

```{cfgcmd} set service snmp script-extensions extension-name \<name\> script \<script\>

**Configure a script that the SNMP agent runs under the specified
name.**

The agent reports the script's output and exit status to clients. It
runs the script when a client asks for either of them.

Specify either a filename, which VyOS looks for in `/config/user-data/`,
or an absolute path to a script kept elsewhere. Names and paths may
contain lowercase letters, digits, and the characters `.`, `-`, `_`,
and paths may also contain `/`.

Every configured name must point to a script path. Otherwise, the
commit fails.

VyOS does not require the file to exist yet. If it is missing at commit
time, VyOS prints a warning and commits anyway. If it is present, VyOS
makes it executable.
```

Example:

```none
set service snmp script-extensions extension-name my-extension script your_script.sh
```

The script's output and exit status can then be queried:

```none
vyos@vyos# snmpwalk -v2c -c routers 127.0.0.1 nsExtendOutput1Table
NET-SNMP-EXTEND-MIB::nsExtendOutput1Line."my-extension" = STRING: hello
NET-SNMP-EXTEND-MIB::nsExtendOutputFull."my-extension" = STRING: hello
NET-SNMP-EXTEND-MIB::nsExtendOutNumLines."my-extension" = INTEGER: 1
NET-SNMP-EXTEND-MIB::nsExtendResult."my-extension" = INTEGER: 0
```

## Operation

```{opcmd} show snmp community \<community\>

Show the status of the SNMP agent on the local system, queried over
SNMPv1 with the specified community string.
```

```{opcmd} show snmp community \<community\> host \<host\>

Show the status of the SNMP agent on the specified remote host, queried
over SNMPv1 with the specified community string.
```

```{opcmd} show snmp mib ifmib

Show the IF-MIB `ifAlias`, `ifDescr`, and `ifIndex` values for all
interfaces.
```

```{opcmd} show snmp mib ifmib \<if-alias | if-descr | if-index\> \<interface\>

Show the IF-MIB `ifAlias`, `ifDescr`, or `ifIndex` value for the
specified interface.
```

```{opcmd} show snmp v3

Show the configured SNMPv3 groups, trap targets, users, and views.
```

```{opcmd} show snmp v3 group

Show the configured SNMPv3 groups.
```

```{opcmd} show snmp v3 trap-target

Show the configured SNMPv3 trap targets.
```

```{opcmd} show snmp v3 user

Show the configured SNMPv3 users.
```

```{opcmd} show snmp v3 view

Show the configured SNMPv3 views.
```

```{opcmd} show snmp v3 certificates

Show SNMP {abbr}`TSM (Transport Security Model)` certificates from
`/etc/snmp/tls/certs/`.
```

```{opcmd} show log snmp

Show the SNMP agent log for the current boot.
```

```{opcmd} monitor log snmp

Show the SNMP agent log for the current boot and follow new entries in
real time.
```

```{opcmd} restart snmp

Restart the SNMP agent. The command fails when SNMP is not configured or
while a commit is in progress.
```

## VyOS MIBs

All SNMP MIBs shipped with a VyOS image are located in
`/usr/share/snmp/mibs/`. An SNMP client uses these files to show
symbolic object names such as `SNMPv2-MIB::sysDescr.0` instead of
numeric OIDs. Copy them to the client to get the same names there, with
SCP once the SSH service is configured:

```none
scp -r vyos@your_router:/usr/share/snmp/mibs /your_folder/mibs
```

(solarwinds)=

## SolarWinds Orion

SolarWinds Orion is a network monitoring and management platform. To
manage the configuration of a device, it opens a command-line session
and runs commands on it. Since every system has its own commands, Orion
needs a device template that maps its actions, such as retrieving the
configuration or rebooting, to that system's commands.

Orion selects the template by the system object identifier that a device
reports in the SNMPv2-MIB `sysObjectID` object. A VyOS router always
reports `1.3.6.1.4.1.44641`, so a template with this value applies to
every VyOS device.

To add the template, create a file named
`VyOS-1.3.6.1.4.1.44641.ConfigMgmt-Commands` with the following content
and then import it in Orion using Device Templates Management:

```none
<Configuration-Management Device="VyOS" SystemOID="1.3.6.1.4.1.44641">
    <Commands>
        <Command Name="Reset" Value="set terminal width 0${CRLF}set terminal length 0"/>
        <Command Name="Reboot" Value="reboot${CRLF}Yes"/>
        <Command Name="EnterConfigMode" Value="configure"/>
        <Command Name="ExitConfigMode" Value="commit${CRLF}exit"/>
        <Command Name="DownloadConfig" Value="show configuration commands"/>
        <Command Name="SaveConfig" Value="commit${CRLF}save"/>
        <Command Name="Version" Value="show version"/>
        <Command Name="MenuBased" Value="False"/>
        <Command Name="VirtualPrompt" Value=":~"/>
    </Commands>
</Configuration-Management>
```

## Examples

### SNMPv2c

```none
# Define a community
set service snmp community routers authorization 'ro'

# Allow monitoring access only from these networks. For specific
# addresses, use /32 and /128 prefixes.
set service snmp community routers network '192.0.2.0/24'
set service snmp community routers network '2001:db8:ffff:eeee::/64'

# Define optional router information
set service snmp location 'UK, London'
set service snmp contact 'admin@example.com'

# Send trap notifications to this host
set service snmp trap-target 203.0.113.10 community 'routers'

# Listen only on specific IP addresses (port defaults to 161)
set service snmp listen-address 192.0.2.1 port 161
set service snmp listen-address 2001:db8::1
```

(snmp-v3-example)=

### SNMPv3

The following example lets the SNMP agent listen only on IP address
192.0.2.1 and configures a new user named "vyos" with password
"vyos12345678", using `sha` for authentication and `aes` for privacy.

```none
set service snmp listen-address 192.0.2.1
set service snmp location 'VyOS Datacenter'
set service snmp v3 engineid '000000000000000000000002'
set service snmp v3 group default mode 'ro'
set service snmp v3 group default view 'default'
set service snmp v3 user vyos auth plaintext-password 'vyos12345678'
set service snmp v3 user vyos auth type 'sha'
set service snmp v3 user vyos group 'default'
set service snmp v3 user vyos privacy plaintext-password 'vyos12345678'
set service snmp v3 user vyos privacy type 'aes'
set service snmp v3 view default oid 1
```

After commit, VyOS replaces the plaintext passwords with the derived
keys. The resulting configuration looks like:

```none
vyos@vyos# show service snmp
 listen-address 192.0.2.1 {
 }
 location "VyOS Datacenter"
 v3 {
     engineid 000000000000000000000002
     group default {
         mode ro
         view default
     }
     user vyos {
         auth {
             encrypted-password 4e52fe55fd011c9c51ae2c65f4b78ca93dcafdfe
             type sha
         }
         group default
         privacy {
             encrypted-password 4e52fe55fd011c9c51ae2c65f4b78ca93dcafdfe
             type aes
         }
     }
     view default {
         oid 1 {
         }
     }
 }
```

Test the configuration on the router itself or from another host by
running the following command:

% stop_vyoslinter
`snmpwalk -v 3 -u vyos -a SHA -A vyos12345678 -x AES -X vyos12345678 -l authPriv 192.0.2.1 .1`
% start_vyoslinter
