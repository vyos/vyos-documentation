---
myst:
  html_meta:
    description: |
      Firewall groups are named collections of addresses, networks,
      ports, MAC addresses, interfaces, and domain names that you can
      reference in rules. They cover address, network, interface, port,
      MAC, domain, remote, and dynamic groups, and nested groups.
    keywords: firewall, groups, address group, remote group, dynamic group
---

(firewall-groups-configuration)=

# Firewall groups

Firewall groups are named collections of IP addresses, networks, ports, MAC
addresses, domain names, or interfaces. You can reference a group in firewall,
NAT, and policy route rules as a source or destination match, and an interface
group as an inbound or outbound interface match. Remote and dynamic
groups are available in firewall rules only.

Address, IPv6 address, network, IPv6 network, MAC, port, and interface groups
can include other groups of the same type. A rule that references a group
matches the members of that group and the members of the groups that it
includes.

## Configuration

### Address groups

An **address group** is a named collection of IPv4 addresses and IPv4 address
ranges. An **IPv6 address group** is the IPv6 equivalent.

```{cfgcmd} set firewall group address-group \<name\> address \<ipv4-address | ipv4-range\>

**Add an IPv4 address or address range to the specified address group.**

Repeat the command to add more addresses or ranges to the same group.
```

Example:

```none
set firewall group address-group ADR-INSIDE-v4 address 192.0.2.1
set firewall group address-group ADR-INSIDE-v4 address 198.51.100.1-198.51.100.8
```

```{cfgcmd} set firewall group ipv6-address-group \<name\> address \<ipv6-address | ipv6-range\>

**Add an IPv6 address or address range to the specified IPv6 address group.**

Repeat the command to add more addresses or ranges to the same group.
```

Example:

```none
set firewall group ipv6-address-group ADR-INSIDE-v6 address 2001:db8::1
set firewall group ipv6-address-group ADR-INSIDE-v6 address 2001:db8::10-2001:db8::1f
```

```{cfgcmd} set firewall group address-group \<name\> include \<name\>

**Include another address group in the specified address group.**

A rule that references the specified group matches the members of the specified
group and the members of the included group. The included group remains a
separate group that rules can reference separately.

The included group can itself include other address groups. The included group
must exist, and address groups must not include each other in a circle.
Otherwise, the commit fails.
```

Example:

```none
set firewall group address-group ADR-ALL-v4 include ADR-INSIDE-v4
```

```{cfgcmd} set firewall group ipv6-address-group \<name\> include \<name\>

**Include another IPv6 address group in the specified IPv6 address group.**

A rule that references the specified group matches the members of the specified
group and the members of the included group. The included group remains a
separate group that rules can reference separately.

The included group can itself include other IPv6 address groups. The included
group must exist, and IPv6 address groups must not include each other in a
circle. Otherwise, the commit fails.
```

Example:

```none
set firewall group ipv6-address-group ADR-ALL-v6 include ADR-INSIDE-v6
```

```{cfgcmd} set firewall group address-group \<name\> description \<text\>

**Configure a description for the specified address group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group address-group ADR-INSIDE-v4 description 'Inside hosts'
```

```{cfgcmd} set firewall group ipv6-address-group \<name\> description \<text\>

**Configure a description for the specified IPv6 address group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group ipv6-address-group ADR-INSIDE-v6 description 'Inside hosts'
```

### Remote groups

A **remote group** is a named collection of IPv4 and IPv6 addresses, address
ranges, and networks. The router downloads them from the HTTP or HTTPS URL that
you configure with the `url` option of the remote group.

The file at the URL is a plain text file. Each line holds one entry: an IPv4 or
IPv6 address, an address range, or a network in CIDR notation. A network must be
in canonical form, with no host bits set. For example, `192.0.2.0/24` is valid
and `192.0.2.1/24` is not. The file can contain IPv4 and IPv6 entries together.

The router reads the first word of each line, up to the first space. Separate
an entry from any following text, such as a comment, with a space. The router
ignores:

- Empty lines.
- Lines whose first word is not a valid IPv4 or IPv6 address, range, or network.

The router logs the first word of an ignored line when the word begins with a
letter or a digit. An ignored line whose first word begins with another
character, such as `#`, produces no log message.

The following example shows valid lines:

```none
192.0.2.1
192.0.2.1 # office
198.51.100.0/24
192.0.2.1-192.0.2.254
2001:db8::1
2001:db8:cafe::/48
2001:db8:cafe::1-2001:db8:cafe::ffff
```

The router downloads the file when it applies the firewall configuration and
then at the `interval` of the group or, when no `interval` is configured, at
`resolver-interval` (see `set firewall global-options resolver-interval`).

If a download fails, the router writes a message to the system log and uses the
last downloaded file, which it keeps in persistent storage. The router retries
the download after `resolver-interval`, or after the `interval` of the group, if
configured, whichever is shorter. If the router has not downloaded the file
before, the group has no addresses.

```{cfgcmd} set firewall group remote-group \<name\> url \<url\>

**Configure the URL from which the router downloads the file of the specified
remote group.**

The URL must use the `http` or `https` scheme.

To safely type or past a URL without worrying about having to escape
`?` and `&` characters in a query strings, enter an opening quote (`'`)
before typing or pasting, then close the quote.

You must configure `url` for every remote group. Otherwise, the commit fails.
```

Example:

```none
set firewall group remote-group RMT url 'https://api.example.com/list?key=YOUR_KEY&plaintext'
```

```{cfgcmd} set firewall group remote-group \<name\> interval \<60-2419200 | number+suffix\>

**Configure the interval at which the router downloads the file of the
specified remote group.**

Enter a number of seconds, or a number followed by the suffix `s`, `m`, `h`,
`d`, or `w`, for example `4h`. You can combine units, for example `1h30m`. The
interval must be between 60 seconds and 4 weeks. Otherwise, the configuration
is rejected.

When no `interval` is configured, the router uses `resolver-interval` (see
`set firewall global-options resolver-interval`).
```

Example:

```none
set firewall group remote-group RMT interval 4h
```

```{cfgcmd} set firewall group remote-group \<name\> description \<text\>

**Configure a description for the specified remote group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group remote-group RMT description 'Blocklist'
```

### Network groups

A **network group** is a named collection of IPv4 networks in CIDR notation. An
**IPv6 network group** is the IPv6 equivalent. Both group types can also contain
single hosts. You add a host to a network group with a prefix length of 32 and
to an IPv6 network group with a prefix length of 128.

```{cfgcmd} set firewall group network-group \<name\> network \<ipv4-network\>

**Add an IPv4 network to the specified network group.**

Repeat the command to add more networks to the same group.

A network must be in canonical form, with no host bits set. For example,
`192.0.2.0/24` is valid and `192.0.2.1/24` is not.
```

Example:

```none
set firewall group network-group NET-INSIDE-v4 network 192.0.2.0/24
set firewall group network-group NET-INSIDE-v4 network 198.51.100.0/24
set firewall group network-group NET-INSIDE-v4 network 203.0.113.10/32
```

```{cfgcmd} set firewall group ipv6-network-group \<name\> network \<ipv6-network\>

**Add an IPv6 network to the specified IPv6 network group.**

Repeat the command to add more networks to the same group.

A network must be in canonical form, with no host bits set. For example,
`2001:db8::/64` is valid and `2001:db8::1/64` is not.
```

Example:

```none
set firewall group ipv6-network-group NET-INSIDE-v6 network 2001:db8::/64
set firewall group ipv6-network-group NET-INSIDE-v6 network 2001:db8:1::10/128
```

```{cfgcmd} set firewall group network-group \<name\> include \<name\>

**Include another network group in the specified network group.**

A rule that references the specified group matches the members of the specified
group and the members of the included group. The included group remains a
separate group that rules can reference separately.

The included group can itself include other network groups. The included group
must exist, and network groups must not include each other in a circle.
Otherwise, the commit fails.
```

Example:

```none
set firewall group network-group NET-ALL-v4 include NET-INSIDE-v4
```

```{cfgcmd} set firewall group ipv6-network-group \<name\> include \<name\>

**Include another IPv6 network group in the specified IPv6 network group.**

A rule that references the specified group matches the members of the specified
group and the members of the included group. The included group remains a
separate group that rules can reference separately.

The included group can itself include other IPv6 network groups. The included
group must exist, and IPv6 network groups must not include each other in a
circle. Otherwise, the commit fails.
```

Example:

```none
set firewall group ipv6-network-group NET-ALL-v6 include NET-INSIDE-v6
```

```{cfgcmd} set firewall group network-group \<name\> description \<text\>

**Configure a description for the specified network group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group network-group NET-INSIDE-v4 description 'Inside networks'
```

```{cfgcmd} set firewall group ipv6-network-group \<name\> description \<text\>

**Configure a description for the specified IPv6 network group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group ipv6-network-group NET-INSIDE-v6 description 'Inside networks'
```

### Interface groups

An **interface group** is a named collection of interfaces. You reference an
interface group in the inbound interface match or the outbound interface match
of a rule. The rule then matches packets by the receiving interface or the
outgoing interface, and the packet matches if that interface is a member of the
group. To match all other interfaces, prepend `!` to the group name in the rule,
for example `outbound-interface group !LAN`.

```{cfgcmd} set firewall group interface-group \<name\> interface \<interface\>

**Add an interface to the specified interface group.**

Repeat the command to add more interfaces to the same group.
```

Example:

```none
set firewall group interface-group LAN interface eth1
```

```{cfgcmd} set firewall group interface-group \<name\> include \<name\>

**Include another interface group in the specified interface group.**

A rule that references the specified group matches the members of the specified
group and the members of the included group. The included group remains a
separate group that rules can reference separately.

The included group can itself include other interface groups. The included
group must exist, and interface groups must not include each other in a circle.
```

Example:

```none
set firewall group interface-group LAN-ALL include LAN
```

```{cfgcmd} set firewall group interface-group \<name\> description \<text\>

**Configure a description for the specified interface group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group interface-group LAN description 'Inside interfaces'
```

### Port groups

A **port group** is a named collection of ports and port ranges. A rule that
references a port group must set `protocol` to `tcp`, `udp`, or `tcp_udp`.
Otherwise, the commit fails. To match different ports for TCP and UDP, create a
port group and a rule for each protocol.

```{cfgcmd} set firewall group port-group \<name\> port \<port-number | port-range | service-name\>

**Add a port or a port range to the specified port group.**

Enter a port number from 1 to 65535, a port range such as `5000-5010`, or a
service name defined in `/etc/services`, such as `http`.

The first port of a range must be less than or equal to the last port.

Repeat the command to add more ports or ranges to the same group.
```

Example:

```none
set firewall group port-group PORT-TCP-SERVER1 port http
set firewall group port-group PORT-TCP-SERVER1 port 443
set firewall group port-group PORT-TCP-SERVER1 port 5000-5010
```

```{cfgcmd} set firewall group port-group \<name\> include \<name\>

**Include another port group in the specified port group.**

A rule that references the specified group matches the members of the specified
group and the members of the included group. The included group remains a
separate group that rules can reference separately.

The included group can itself include other port groups. The included group
must exist, and port groups must not include each other in a circle. Otherwise,
the commit fails.
```

Example:

```none
set firewall group port-group PORT-ALL include PORT-TCP-SERVER1
```

```{cfgcmd} set firewall group port-group \<name\> description \<text\>

**Configure a description for the specified port group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group port-group PORT-TCP-SERVER1 description 'Server 1 ports'
```

### MAC groups

A **MAC group** is a named collection of MAC addresses. A rule that references a
MAC group matches packets whose source or destination MAC address is a member of
the group.

```{cfgcmd} set firewall group mac-group \<name\> mac-address \<mac-address\>

**Add a MAC address to the specified MAC group.**

Repeat the command to add more MAC addresses to the same group.
```

Example:

```none
set firewall group mac-group MAC-G01 mac-address 00:00:5e:00:53:02
```

```{cfgcmd} set firewall group mac-group \<name\> include \<name\>

**Include another MAC group in the specified MAC group.**

A rule that references the specified group matches the members of the specified
group and the members of the included group. The included group remains a
separate group that rules can reference separately.

The included group can itself include other MAC groups. The included group must
exist, and MAC groups must not include each other in a circle. Otherwise, the
commit fails.
```

Example:

```none
set firewall group mac-group MAC-ALL include MAC-G01
```

```{cfgcmd} set firewall group mac-group \<name\> description \<text\>

**Configure a description for the specified MAC group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group mac-group MAC-G01 description 'Office devices'
```

### Domain groups

A **domain group** is a named collection of domain names. The router resolves
the domain names to IPv4 and IPv6 addresses at `resolver-interval` (see
`set firewall global-options resolver-interval`). A rule that references a
domain group matches packets whose source or destination address is an address
of a domain name in that group. A domain group name must begin with a letter or
an underscore.

```{cfgcmd} set firewall group domain-group \<name\> address \<domain\>

**Add a domain name to the specified domain group.**

A domain name can contain letters, digits, hyphens, and dots, and must start
with a letter or a digit.

Repeat the command to add more domain names to the same group.
```

Example:

```none
set firewall group domain-group DOM address example.com
set firewall group domain-group DOM address www.example.net
```

```{cfgcmd} set firewall group domain-group \<name\> description \<text\>

**Configure a description for the specified domain group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group domain-group DOM description 'Update servers'
```

### Dynamic address groups

A **dynamic address group** is a named collection of the source or destination
IP addresses of packets that rules match. A rule adds these addresses to the
group when you configure `add-address-to-group` in the rule and name the group.
Several rules can add addresses to the same group.

You can reference the group as a source or destination match in firewall rules.
The router removes all addresses from dynamic address groups whenever it
applies the firewall configuration.

#### Define a dynamic address group

Dynamic address groups support both IPv4 and IPv6 families.

```{cfgcmd} set firewall group dynamic-group address-group \<name\>

**Define a dynamic IPv4 address group.**
```

Example:

```none
set firewall group dynamic-group address-group ALLOWED
```

```{cfgcmd} set firewall group dynamic-group ipv6-address-group \<name\>

**Define a dynamic IPv6 address group.**

The name must begin with a letter or a digit.
```

Example:

```none
set firewall group dynamic-group ipv6-address-group ALLOWED-v6
```

```{cfgcmd} set firewall group dynamic-group address-group \<name\> description \<text\>

**Configure a description for the specified dynamic address group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group dynamic-group address-group ALLOWED description 'Hosts that completed knocking'
```

```{cfgcmd} set firewall group dynamic-group ipv6-address-group \<name\> description \<text\>

**Configure a description for the specified dynamic IPv6 address group.**

The description can contain up to 255 characters.
```

Example:

```none
set firewall group dynamic-group ipv6-address-group ALLOWED-v6 description 'Hosts that completed knocking'
```

#### Add addresses to a dynamic address group

After you define dynamic address groups, reference them with
`add-address-to-group` in firewall rules to add addresses to them. A rule can
add the source address, the destination address, or both. The rule must
reference an existing dynamic address group of the matching family: IPv4 rules
use `dynamic-group address-group`, and IPv6 rules use
`dynamic-group ipv6-address-group`. Otherwise, the commit fails.

```{cfgcmd} set firewall [ipv4 | ipv6] [forward | input | output] filter rule \<1-999999\> add-address-to-group source-address address-group \<name\>
```

```{cfgcmd} set firewall [ipv4 | ipv6] name \<name\> rule \<1-999999\> add-address-to-group source-address address-group \<name\>
```

```{cfgcmd} set firewall [ipv4 | ipv6] [prerouting | output] raw rule \<1-999999\> add-address-to-group source-address address-group \<name\>

**Add the source address of the packets that the rule matches to the
specified dynamic address group.**
```

Example:

```none
set firewall ipv4 input filter rule 10 add-address-to-group source-address address-group ALLOWED
set firewall ipv4 name KNOCK rule 10 add-address-to-group source-address address-group ALLOWED
set firewall ipv4 prerouting raw rule 10 add-address-to-group source-address address-group ALLOWED
set firewall ipv6 input filter rule 10 add-address-to-group source-address address-group ALLOWED-v6
set firewall ipv6 name KNOCK6 rule 10 add-address-to-group source-address address-group ALLOWED-v6
set firewall ipv6 prerouting raw rule 10 add-address-to-group source-address address-group ALLOWED-v6
```

```{cfgcmd} set firewall [ipv4 | ipv6] [forward | input | output] filter rule \<1-999999\> add-address-to-group destination-address address-group \<name\>
```

```{cfgcmd} set firewall [ipv4 | ipv6] name \<name\> rule \<1-999999\> add-address-to-group destination-address address-group \<name\>
```

```{cfgcmd} set firewall [ipv4 | ipv6] [prerouting | output] raw rule \<1-999999\> add-address-to-group destination-address address-group \<name\>

**Add the destination address of the packets that the rule matches to the
specified dynamic address group.**
```

Example:

```none
set firewall ipv4 forward filter rule 10 add-address-to-group destination-address address-group SEEN-SERVERS
set firewall ipv4 name KNOCK rule 20 add-address-to-group destination-address address-group SEEN-SERVERS
set firewall ipv4 prerouting raw rule 10 add-address-to-group destination-address address-group SEEN-SERVERS
set firewall ipv6 forward filter rule 10 add-address-to-group destination-address address-group SEEN-SERVERS-v6
set firewall ipv6 name KNOCK6 rule 20 add-address-to-group destination-address address-group SEEN-SERVERS-v6
set firewall ipv6 prerouting raw rule 10 add-address-to-group destination-address address-group SEEN-SERVERS-v6
```

#### Set a timeout for added addresses

You can set a timeout for the addresses that a rule adds to a dynamic address
group. The router removes an address with a timeout from the group when the
timeout expires. An address that has no timeout remains in the group until the
router removes all addresses from dynamic address groups.

```{cfgcmd} set firewall [ipv4 | ipv6] [forward | input | output] filter rule \<1-999999\> add-address-to-group [destination-address | source-address] timeout \<number+suffix\>
```

```{cfgcmd} set firewall [ipv4 | ipv6] name \<name\> rule \<1-999999\> add-address-to-group [destination-address | source-address] timeout \<number+suffix\>
```

```{cfgcmd} set firewall [ipv4 | ipv6] [prerouting | output] raw rule \<1-999999\> add-address-to-group [destination-address | source-address] timeout \<number+suffix\>

**Configure how long an address that the rule adds remains in the dynamic
address group.**

Specify the timeout as a number followed by `s` (seconds), `m` (minutes),
`h` (hours), or `d` (days).

Set a timeout for the source address together with the command that adds the
source address to a dynamic address group. Set a timeout for the destination
address together with the command that adds the destination address to a
dynamic address group. Otherwise, the commit fails.
```

In the following example, the rule adds the source address to group `A` for two
minutes and the destination address to group `B` for one hour:

```none
set firewall ipv4 input filter rule 10 add-address-to-group source-address address-group A
set firewall ipv4 input filter rule 10 add-address-to-group source-address timeout 2m
set firewall ipv4 input filter rule 10 add-address-to-group destination-address address-group B
set firewall ipv4 input filter rule 10 add-address-to-group destination-address timeout 1h
```

#### Reference a dynamic address group in a rule

You reference a dynamic address group in the source or destination of IPv4 and
IPv6 firewall rules, like other groups. A rule matches packets whose source or
destination IP address is in a dynamic address group.

Example:

```none
set firewall ipv4 input filter rule 10 source group dynamic-address-group ALLOWED
set firewall ipv6 input filter rule 10 destination group dynamic-address-group BLOCKED
```

## Operation

```{opcmd} show firewall group

**Show all firewall groups.**
```

```{opcmd} show firewall group \<name\>

**Show the firewall groups with the specified name.**

The `<name>` must match the name of the group exactly. Groups of different types
can have the same name, and the command shows all of them.
```

```{opcmd} show firewall group detail

**Show all firewall groups with the description of each group.**
```

```{opcmd} show firewall group \<name\> detail

**Show the firewall groups with the specified name and the description of each
group.**

The `<name>` must match the name of the group exactly. Groups of different types
can have the same name, and the command shows all of them.
```

## Examples

### Create and use firewall groups

The following commands create an address group, two network groups, an interface
group, and a port group:

```none
set firewall group address-group SERVERS address 198.51.100.101
set firewall group address-group SERVERS address 198.51.100.102
set firewall group network-group TRUSTEDv4 network 192.0.2.0/30
set firewall group network-group TRUSTEDv4 network 203.0.113.128/25
set firewall group ipv6-network-group TRUSTEDv6 network 2001:db8::/64
set firewall group interface-group LAN interface eth2.2001
set firewall group interface-group LAN interface bond0
set firewall group port-group PORT-SERVERS port http
set firewall group port-group PORT-SERVERS port 443
set firewall group port-group PORT-SERVERS port 5000-5010
```

The following commands reference the groups in firewall, NAT, and policy route
rules:

```none
set firewall ipv4 output filter rule 10 action accept
set firewall ipv4 output filter rule 10 outbound-interface group !LAN
set firewall ipv4 forward filter rule 20 action accept
set firewall ipv4 forward filter rule 20 source group network-group TRUSTEDv4
set firewall ipv6 input filter rule 10 action accept
set firewall ipv6 input filter rule 10 source group network-group TRUSTEDv6
set nat destination rule 101 inbound-interface group LAN
set nat destination rule 101 destination group address-group SERVERS
set nat destination rule 101 protocol tcp
set nat destination rule 101 destination group port-group PORT-SERVERS
set nat destination rule 101 translation address 203.0.113.250
set policy route PBR rule 201 destination group port-group PORT-SERVERS
set policy route PBR rule 201 protocol tcp
set policy route PBR rule 201 set table 15
```

### Restrict SSH access with port knocking

You can use dynamic address groups to implement port knocking: the router
accepts SSH connections from a client only after the client sends TCP packets to
a sequence of ports in the correct order. The following configuration uses the
ports 9990, 9991, and 9992:

```none
set firewall global-options state-policy established action 'accept'
set firewall global-options state-policy invalid action 'drop'
set firewall global-options state-policy related action 'accept'
set firewall group dynamic-group address-group ALLOWED
set firewall group dynamic-group address-group PN_01
set firewall group dynamic-group address-group PN_02
set firewall ipv4 input filter default-action 'drop'
set firewall ipv4 input filter rule 5 action 'accept'
set firewall ipv4 input filter rule 5 protocol 'icmp'
set firewall ipv4 input filter rule 10 action 'drop'
set firewall ipv4 input filter rule 10 add-address-to-group source-address address-group 'PN_01'
set firewall ipv4 input filter rule 10 add-address-to-group source-address timeout '2m'
set firewall ipv4 input filter rule 10 description 'Port_knock 01'
set firewall ipv4 input filter rule 10 destination port '9990'
set firewall ipv4 input filter rule 10 protocol 'tcp'
set firewall ipv4 input filter rule 20 action 'drop'
set firewall ipv4 input filter rule 20 add-address-to-group source-address address-group 'PN_02'
set firewall ipv4 input filter rule 20 add-address-to-group source-address timeout '3m'
set firewall ipv4 input filter rule 20 description 'Port_knock 02'
set firewall ipv4 input filter rule 20 destination port '9991'
set firewall ipv4 input filter rule 20 protocol 'tcp'
set firewall ipv4 input filter rule 20 source group dynamic-address-group 'PN_01'
set firewall ipv4 input filter rule 30 action 'drop'
set firewall ipv4 input filter rule 30 add-address-to-group source-address address-group 'ALLOWED'
set firewall ipv4 input filter rule 30 add-address-to-group source-address timeout '2h'
set firewall ipv4 input filter rule 30 description 'Port_knock 03'
set firewall ipv4 input filter rule 30 destination port '9992'
set firewall ipv4 input filter rule 30 protocol 'tcp'
set firewall ipv4 input filter rule 30 source group dynamic-address-group 'PN_02'
set firewall ipv4 input filter rule 99 action 'accept'
set firewall ipv4 input filter rule 99 description 'Port_knock 04 - Allow ssh'
set firewall ipv4 input filter rule 99 destination port '22'
set firewall ipv4 input filter rule 99 protocol 'tcp'
set firewall ipv4 input filter rule 99 source group dynamic-address-group 'ALLOWED'
```

Before a client sends the first knocking packet, the dynamic address groups
contain no addresses:

```none
vyos@vyos:~$ show firewall group
Firewall Groups

Name     Type                    References            Members    Timeout    Expires
-------  ----------------------  --------------------  ---------  ---------  ---------
ALLOWED  address_group(dynamic)  ipv4-input-filter-30  N/D        N/D        N/D
PN_01    address_group(dynamic)  ipv4-input-filter-10  N/D        N/D        N/D
PN_02    address_group(dynamic)  ipv4-input-filter-20  N/D        N/D        N/D
```

With this configuration, a client must complete the following steps to connect
to the router with SSH.

1. Send TCP packets to destination port 9990. The router adds the source address
   of the client to dynamic address group `PN_01` for two minutes.

```none
vyos@vyos:~$ show firewall group
Firewall Groups

Name     Type                    References            Members       Timeout    Expires
-------  ----------------------  --------------------  ------------  ---------  ---------
ALLOWED  address_group(dynamic)  ipv4-input-filter-30  N/D           N/D        N/D
PN_01    address_group(dynamic)  ipv4-input-filter-10  203.0.113.10  120        119
PN_02    address_group(dynamic)  ipv4-input-filter-20  N/D           N/D        N/D
```

2. Within two minutes, send TCP packets to destination port 9991. The router
   adds the source address to dynamic address group `PN_02` for three minutes.

```none
vyos@vyos:~$ show firewall group
Firewall Groups

Name     Type                    References            Members       Timeout    Expires
-------  ----------------------  --------------------  ------------  ---------  ---------
ALLOWED  address_group(dynamic)  ipv4-input-filter-30  N/D           N/D        N/D
PN_01    address_group(dynamic)  ipv4-input-filter-10  203.0.113.10  120        106
PN_02    address_group(dynamic)  ipv4-input-filter-20  203.0.113.10  180        179
```

3. Within three minutes, send TCP packets to destination port 9992. The router
   adds the source address to dynamic address group `ALLOWED` for two hours.

```none
vyos@vyos:~$ show firewall group
Firewall Groups

Name     Type                    References            Members         Timeout    Expires
-------  ----------------------  --------------------  ------------  ---------  ---------
ALLOWED  address_group(dynamic)  ipv4-input-filter-30  203.0.113.10       7200       7199
PN_01    address_group(dynamic)  ipv4-input-filter-10  203.0.113.10        120         89
PN_02    address_group(dynamic)  ipv4-input-filter-20  203.0.113.10        180        162
```

4. Within two hours, connect to the router with SSH. Rule 99 accepts the SSH
   packets because the source address is in the dynamic address group
   `ALLOWED`.
