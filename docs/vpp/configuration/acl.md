---
lastproofread: '2026-09-30'
---

(vpp-config-acl)=

```{include} /_include/need_improvement.txt
```


# VPP ACL Configuration

VPP access control lists (ACLs) filter traffic on VPP interfaces. VyOS
supports IP ACLs and MAC/IP ACLs, which match packets using different fields.

VyOS supports two ACL types:

- **IP ACLs** match IPv4 or IPv6 addresses, protocols, ports, and TCP flags.
  Apply them to input or output traffic.
- **MAC/IP ACLs** match a source MAC address and an IP prefix. Apply them to
  input traffic only.

## Structure and Components

### Tags

ACL tags name rule sets that contain one or more access control entries
(ACEs). Use tags to group rules and apply them to interfaces.

- Tag names are user-defined.
- Each tag can contain multiple numbered rules.
- IP ACL tags can be applied in input or output direction.
- Multiple IP ACL tags can be applied to one interface and direction.
- One MAC/IP ACL tag can be applied to an interface, in input direction.

### Interface Application

ACL tags control traffic on the interface to which they are applied:

- **Input** filters traffic entering the interface.
- **Output** filters traffic leaving the interface.

:::{note}
**Direction limitation:** MAC/IP ACLs can only be applied to input traffic.
Use IP ACLs to filter both input and output traffic.
:::

### Rule Processing

Rules are evaluated in ascending rule-number order. The first matching rule
determines the action. Traffic that matches no rule is denied by default.

Available IP ACL actions:

- `permit` allows matching traffic.
- `deny` drops matching traffic.
- `permit-reflect` permits matching traffic and allows return traffic for
  the flow.

## L3/IP ACLs

IP ACLs match IPv4 or IPv6 prefixes, IP protocols, source and destination
ports, and TCP flags. The `permit-reflect` action supports stateful,
reflexive filtering.

### Creating IP ACL Tags

IP ACL tags are created under the `vpp acl ip` configuration node:

```none
set vpp acl ip tag-name <tag-name>
set vpp acl ip tag-name <tag-name> description '<description>'
```

Example:

```none
set vpp acl ip tag-name 'WEB-FILTER'
set vpp acl ip tag-name 'WEB-FILTER' description 'Web server access control'
```

### Adding Rules to IP ACL Tags

Rules are added to IP ACL tags with specific rule numbers:

```none
set vpp acl ip tag-name <tag-name> rule <rule-number>
```

#### Basic IP ACL Rule Configuration

Each rule requires an action. Match fields are optional; an omitted field
matches any value for that field.

```none
set vpp acl ip tag-name <tag-name> rule <rule-number> action <permit|deny|permit-reflect>
set vpp acl ip tag-name <tag-name> rule <rule-number> description '<description>'
set vpp acl ip tag-name <tag-name> rule <rule-number> protocol <protocol>
```

**Actions:**

- `permit` allows matching traffic.
- `deny` drops matching traffic.
- `permit-reflect` permits matching traffic and allows return traffic for
  the flow.

**Protocols:**

- `all` matches every IP protocol and is the default.
- You can specify a protocol by name, such as `tcp`, `udp`, `icmp`, or
  `ipv6-icmp`.

#### Source and Destination Matching

Configure source and destination prefixes and port ranges. For IPv6, VyOS
requires both source and destination prefixes, and they must use the same
address family.

```none
# Source configuration
set vpp acl ip tag-name <tag-name> rule <rule-number> source prefix <ip-prefix>
set vpp acl ip tag-name <tag-name> rule <rule-number> source port <port-spec>

# Destination configuration  
set vpp acl ip tag-name <tag-name> rule <rule-number> destination prefix <ip-prefix>
set vpp acl ip tag-name <tag-name> rule <rule-number> destination port <port-spec>
```

**Prefix specification:** IPv4 and IPv6 prefixes use CIDR notation, such as
`192.0.2.0/24` or `2001:db8::/32`.

**Port specification:** Use a port from 1 through 65535, or a range such as
`1001-1005`. When the protocol is ICMP, these fields represent the ICMP type
and code instead of ports.

#### TCP Flags Matching

For rules with protocol `tcp`, match TCP flags that must be set or unset:

```none
# Match packets with specific flags set
set vpp acl ip tag-name <tag-name> rule <rule-number> tcp-flags is-set <ack|cwr|ecn|fin|psh|rst|syn|urg>

# Match packets without specific flags set
set vpp acl ip tag-name <tag-name> rule <rule-number> tcp-flags is-not-set <ack|cwr|ecn|fin|psh|rst|syn|urg>
```

### IP ACL Configuration Examples
#### Example 1: Basic Web Server ACL

```none
# Create ACL for web server access
set vpp acl ip tag-name 'WEB-SERVER'
set vpp acl ip tag-name 'WEB-SERVER' description 'Web server access control'

# Allow HTTP traffic
set vpp acl ip tag-name 'WEB-SERVER' rule 10 action permit
set vpp acl ip tag-name 'WEB-SERVER' rule 10 protocol tcp
set vpp acl ip tag-name 'WEB-SERVER' rule 10 destination port 80

# Allow HTTPS traffic
set vpp acl ip tag-name 'WEB-SERVER' rule 20 action permit
set vpp acl ip tag-name 'WEB-SERVER' rule 20 protocol tcp
set vpp acl ip tag-name 'WEB-SERVER' rule 20 destination port 443

# Deny all other traffic
set vpp acl ip tag-name 'WEB-SERVER' rule 999 action deny
set vpp acl ip tag-name 'WEB-SERVER' rule 999 protocol all
```

#### Example 2: Network Segmentation ACL

```none
# Create ACL for network segmentation
set vpp acl ip tag-name 'DMZ-FILTER'
set vpp acl ip tag-name 'DMZ-FILTER' description 'DMZ to internal network filter'

# Allow specific internal subnet access
set vpp acl ip tag-name 'DMZ-FILTER' rule 10 action permit
set vpp acl ip tag-name 'DMZ-FILTER' rule 10 destination prefix '192.168.100.0/24'
set vpp acl ip tag-name 'DMZ-FILTER' rule 10 protocol tcp
set vpp acl ip tag-name 'DMZ-FILTER' rule 10 destination port 443

# Allow DNS queries
set vpp acl ip tag-name 'DMZ-FILTER' rule 20 action permit
set vpp acl ip tag-name 'DMZ-FILTER' rule 20 destination prefix '192.168.1.10/32'
set vpp acl ip tag-name 'DMZ-FILTER' rule 20 protocol udp
set vpp acl ip tag-name 'DMZ-FILTER' rule 20 destination port 53

# Block everything else to internal networks
set vpp acl ip tag-name 'DMZ-FILTER' rule 100 action deny
set vpp acl ip tag-name 'DMZ-FILTER' rule 100 destination prefix '192.168.0.0/16'
```

#### Example 3: Reflexive ACL

```none
# Create reflexive ACL for outbound connections
set vpp acl ip tag-name 'OUTBOUND-REFLECT'
set vpp acl ip tag-name 'OUTBOUND-REFLECT' description 'Allow outbound with return traffic'

# Allow outbound HTTP/HTTPS with return traffic
set vpp acl ip tag-name 'OUTBOUND-REFLECT' rule 10 action permit-reflect
set vpp acl ip tag-name 'OUTBOUND-REFLECT' rule 10 protocol tcp
set vpp acl ip tag-name 'OUTBOUND-REFLECT' rule 10 destination port 80

set vpp acl ip tag-name 'OUTBOUND-REFLECT' rule 20 action permit-reflect
set vpp acl ip tag-name 'OUTBOUND-REFLECT' rule 20 protocol tcp
set vpp acl ip tag-name 'OUTBOUND-REFLECT' rule 20 destination port 443
```

### Applying IP ACL Tags to Interfaces

IP ACL tags are applied to interfaces using the interface configuration:

```none
# Apply to input direction
set vpp acl ip interface <interface> input acl-tag <number> tag-name <tag-name>

# Apply to output direction  
set vpp acl ip interface <interface> output acl-tag <number> tag-name <tag-name>
```

Where:
- `<interface>` - Interface name (e.g., eth0, eth1)
- `<number>` - ACL sequence number (1-4294967295) for ordering IP ACL tags
- `<tag-name>` - Name of the ACL tag to apply

Apply multiple IP ACL tags to the same interface and direction by assigning
each tag a different sequence number.

Example:

```none
# Apply web server ACL to input direction
set vpp acl ip interface eth0 input acl-tag 10 tag-name 'WEB-SERVER'

# Apply outbound reflexive ACL to output direction
set vpp acl ip interface eth1 output acl-tag 10 tag-name 'OUTBOUND-REFLECT'

# Apply multiple ACLs to the same interface and direction
set vpp acl ip interface eth0 input acl-tag 20 tag-name 'FIREWALL'
```

## L2/MAC ACLs

MAC/IP ACLs match a source MAC address and an IPv4 or IPv6 source prefix.
They are applied to input traffic only.

:::{important}
**Direction limitation:** MAC/IP ACLs can only be applied to input traffic.
Use IP ACLs to filter both input and output traffic.
:::

### Creating MAC ACL Tags

MAC ACL tags are created under the `vpp acl mac` configuration node:

```none
set vpp acl mac tag-name <tag-name>
set vpp acl mac tag-name <tag-name> description '<description>'
```

Example:

```none
set vpp acl mac tag-name 'MAC-FILTER'
set vpp acl mac tag-name 'MAC-FILTER' description 'Layer 2 MAC address filtering'
```

### Adding Rules to MAC ACL Tags

Rules are added to MAC ACL tags with specific rule numbers:

```none
set vpp acl mac tag-name <tag-name> rule <rule-number>
```

#### Basic MAC ACL Rule Configuration

Each rule requires an action, source MAC address, and source IP prefix.
The MAC mask is optional and defaults to `ff:ff:ff:ff:ff:ff`.

```none
set vpp acl mac tag-name <tag-name> rule <rule-number> action <permit|deny>
set vpp acl mac tag-name <tag-name> rule <rule-number> description '<description>'
```

**Actions:**
- `permit` - Allow matching traffic
- `deny` - Block matching traffic

MAC/IP ACLs support `permit` and `deny`; they do not support
`permit-reflect`.

#### MAC Address Matching

Configure MAC address matching criteria:

```none
set vpp acl mac tag-name <tag-name> rule <rule-number> mac-address <mac-address>
set vpp acl mac tag-name <tag-name> rule <rule-number> mac-mask <mac-mask>
```

**MAC address fields:** `mac-address` is the source MAC address to match.
`mac-mask` selects the bits to compare; its default
`ff:ff:ff:ff:ff:ff` matches the complete address.

The mask can select part of an address. For example,
`ff:ff:ff:00:00:00` compares the first three octets, while
`ff:ff:ff:ff:ff:ff` compares all six.

#### IP Prefix Matching

Configure a source IP prefix:

```none
set vpp acl mac tag-name <tag-name> rule <rule-number> prefix <ip-prefix>
```

The source prefix can be IPv4 or IPv6 and uses CIDR notation.

### MAC ACL Configuration Examples

#### Example 1: Device Whitelist

```none
# Create MAC ACL for device whitelisting
set vpp acl mac tag-name 'DEVICE-WHITELIST'
set vpp acl mac tag-name 'DEVICE-WHITELIST' description 'Allow only approved devices'

# Allow specific workstation
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 10 action permit
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 10 mac-address '00:1b:21:12:34:56'
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 10 prefix '192.168.1.100/32'
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 10 description 'Admin workstation'

# Allow specific server
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 20 action permit
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 20 mac-address '00:1b:21:78:90:ab'
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 20 prefix '192.168.1.10/32'
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 20 description 'Web server'

# Deny everything else
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 999 action deny
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 999 mac-address '00:00:00:00:00:00'
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 999 mac-mask '00:00:00:00:00:00'
set vpp acl mac tag-name 'DEVICE-WHITELIST' rule 999 prefix '0.0.0.0/0'
```

#### Example 2: MAC Prefix Filtering

```none
# Create a MAC ACL that matches a MAC address prefix
set vpp acl mac tag-name 'MAC-PREFIX-FILTER'
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' description 'Filter by MAC prefix'

# Deny addresses with the selected first three octets
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 10 action deny
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 10 mac-address '02:00:01:00:00:00'
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 10 mac-mask 'ff:ff:ff:00:00:00'
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 10 description 'Block selected prefix'

# Allow all other devices
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 100 action permit
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 100 mac-address '00:00:00:00:00:00'
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 100 mac-mask '00:00:00:00:00:00'
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 100 prefix '0.0.0.0/0'
set vpp acl mac tag-name 'MAC-PREFIX-FILTER' rule 100 description 'Allow other addresses'
```

#### Example 3: Network Segmentation by MAC

```none
# Create MAC ACL for network segmentation
set vpp acl mac tag-name 'SEGMENT-FILTER'
set vpp acl mac tag-name 'SEGMENT-FILTER' description 'Segment networks by MAC/IP binding'

# Allow management VLAN devices
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 10 action permit
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 10 mac-address '02:01:00:00:00:00'
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 10 mac-mask 'ff:ff:00:00:00:00'
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 10 prefix '10.1.0.0/16'
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 10 description 'Management VLAN'

# Allow user VLAN devices
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 20 action permit
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 20 mac-address '02:02:00:00:00:00'
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 20 mac-mask 'ff:ff:00:00:00:00'
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 20 prefix '10.2.0.0/16'
set vpp acl mac tag-name 'SEGMENT-FILTER' rule 20 description 'User VLAN'
```

### Applying MAC ACL Tags to Interfaces

MAC ACL tags can only be applied to the input direction of interfaces:

```none
set vpp acl mac interface <interface> tag-name <tag-name>
```
:::{note}
**Syntax difference:** MAC/IP ACL interface application has no
`acl-tag <number>` sequence because only one MAC/IP ACL can be applied.
:::

:::{warning}
MAC/IP ACLs do not support output filtering. The interface configuration
has no `output` option for this ACL type.
:::

Example:

```none
# Apply MAC filtering to interface input
set vpp acl mac interface eth0 tag-name 'MAC-FILTER'
set vpp acl mac interface eth1 tag-name 'DEVICE-WHITELIST'
```

## Configuration Best Practices

### Rule Ordering

- **Leave gaps:** Number rules 10, 20, 30 to allow future insertions.
- **Order deliberately:** Lower-numbered rules are evaluated first.
- **Use a catch-all when useful:** Unmatched traffic is denied by default;
  an explicit final rule can make the intended policy visible.
- **Document rules:** Add descriptions to help explain complex policies.

### Performance Considerations

- **Choose needed match fields:** IP ACLs match IP-layer fields; MAC/IP ACLs
  also match a source MAC address.
- **Account for direction:** MAC/IP ACLs apply only to input traffic.
- **Group related rules:** Use tags to organize rules that serve one policy.
- **Measure performance:** Test with representative traffic and hardware
  before drawing conclusions about throughput.

## Troubleshooting

### Common Issues

- **ACL not taking effect:**
  - Verify ACL is applied to correct interface and direction
  - Check rule numbering and order
  - Ensure interface is properly configured in VPP
- **Unexpected throughput:**
  - Check packet counters and interface statistics.
  - Compare results with and without the ACL under representative traffic.
- **Traffic blocked unexpectedly:**
  - Review rule order (first match wins)
  - Check for overly restrictive rules
  - Verify protocol and port specifications

### Verification Commands

Use these commands to view ACL configuration and interface assignments:

```none
show configuration commands | match "vpp acl"
show vpp acl ip interface
show vpp acl mac interface
```

## Operational Commands

These commands display VPP ACLs and their interface assignments. They
require the corresponding ACL type to be configured.

### IP ACL Commands

View all IP ACLs:

```{opcmd} show vpp acl ip
```

View IP ACL interface assignments:

```{opcmd} show vpp acl ip interface
```

Example output:

```none
Interface    Input ACLs    Output ACLs
-----------  ------------  -------------
eth1         WEB-SERVER
```

View specific IP ACL by tag name:

```{opcmd} show vpp acl ip tag-name \<tag-name\>
```

Example:

```none
vyos@vyos:~$ show vpp acl ip tag-name WEB-SERVER 

---------------------------------
IP ACL "tag-name WEB-SERVER" acl_index 0

  Rule  Action    Src prefix    Src port    Dst prefix    Dst port      Proto  TCP flags set    TCP flags not set
------  --------  ------------  ----------  ------------  ----------  -------  ---------------  -------------------
    10  permit    0.0.0.0/0     0-65535     0.0.0.0/0     80                6
    20  permit    0.0.0.0/0     0-65535     0.0.0.0/0     443               6
   999  deny      0.0.0.0/0     0-65535     0.0.0.0/0     0-65535           0
```

### MAC ACL Commands

View all MAC ACLs:

```{opcmd} show vpp acl mac
```

View MAC ACL interface assignments:

```{opcmd} show vpp acl mac interface
```

Example output:

```none
Interface    ACL
-----------  -----
eth0         MAC-PREFIX-FILTER
```

View specific MAC ACL by tag name:

```{opcmd} show vpp acl mac tag-name \<tag-name\>
```

Example:

```none
vyos@vyos:~$ show vpp acl mac tag-name MAC-PREFIX-FILTER

---------------------------------
MACIP ACL "tag-name MAC-PREFIX-FILTER" acl_index 0

  Rule  Action    IP prefix    MAC address        MAC mask
------  --------  -----------  -----------------  -----------------
    10  deny      0.0.0.0/0    02:00:01:00:00:00  ff:ff:ff:00:00:00
   100  permit    0.0.0.0/0    00:00:00:00:00:00  00:00:00:00:00:00
```


### Understanding Command Output

**IP ACL Output Fields:**

- **Rule**: Rule number within the ACL
- **Action**: permit, deny, or permit-reflect
- **Src prefix**: Source IP prefix (0.0.0.0/0 = any source)
- **Src port**: Source port range (0-65535 = any port)
- **Dst prefix**: Destination IP prefix
- **Dst port**: Destination port or port range
- **Proto**: IP protocol number (6=TCP, 17=UDP, 1=ICMP, 0=any)
- **TCP flags set**: Required TCP flags (for TCP protocol)
- **TCP flags not set**: Prohibited TCP flags (for TCP protocol)

**MAC ACL Output Fields:**

- **Rule**: Rule number within the ACL
- **Action**: permit or deny
- **IP prefix**: Source IP prefix constraint
- **MAC address**: Source MAC address to match
- **MAC mask**: MAC address mask for partial matching

**Interface Assignment Output:**

- Shows which interfaces have ACLs applied
- **Input ACLs**: ACL tags applied to incoming traffic
- **Output ACLs**: ACL tags applied to outgoing traffic (IP ACLs only)
- **ACL**: MAC ACL tag applied to interface (input only)
