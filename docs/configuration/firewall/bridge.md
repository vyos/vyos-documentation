---
lastproofread: '2026-10-01'
---

(firewall-configuration)=

# Bridge Firewall Configuration

## Overview

This section describes bridge firewall configuration and related operational
mode commands.

The following commands are covered in this section:

```{cfgcmd} set firewall bridge \<options\>
```

From the main structure defined in
{doc}`Firewall Overview</configuration/firewall/index>`
in this section you can find detailed information only for the next part
of the general structure:

```none
- set firewall
    * bridge
         - forward
            + filter
         - input
            + filter
         - output
            + filter
         - prerouting
            + filter
         - name
            + custom_name
```

Traffic received on an interface that is a member of a bridge is processed at
the bridge layer. Before the bridge makes a forwarding decision, packets pass
through the **prerouting** chain. You can filter packets there and configure
rules to bypass connection tracking. Configure this chain with:


- `set firewall bridge prerouting filter ...`.


Traffic that the bridge forwards between its ports passes through the
**forward** chain. Configure its filter with `set firewall bridge forward
filter ...`.


:::{figure} /_static/images/firewall-bridge-forward.webp
:::


Frames addressed to the bridge device pass through the bridge **input** chain.
If the frame contains IP traffic destined for the router, it then continues
through the IP firewall. Configure bridge input filtering with `set firewall
bridge input filter ...`:


:::{figure} /_static/images/firewall-bridge-input.webp
:::


See the {doc}`general packet flow diagram</configuration/firewall/index> for
the complete packet path.


Traffic originating from the router through a bridge device passes through the
bridge **output** chain. Configure its filter with `set firewall bridge output
filter ...`:


:::{figure} /_static/images/firewall-bridge-output.webp
:::


Custom bridge firewall chains can be created with the command `set firewall
bridge name <name> ...`. To use such a custom chain, a rule with action jump
and the appropriate target must be defined in a base chain.


## Bridge Rules


Each firewall rule has a number, an action, and zero or more match criteria.
Rules are evaluated in ascending numerical order. When a rule matches, its
action determines what happens next: for example, `accept` and `drop` end
processing, `continue` evaluates the next rule, and `jump` enters a custom
chain.


### Actions


If a rule is defined, an action must also be defined for it. This tells the
firewall what to do if all matching criteria in the rule are met.


Bridge firewall rules support the following actions; the available actions
depend on the chain:


- `accept`: accept the packet.
- `continue`: continue parsing next rule.
- `drop`: drop the packet.
- `jump`: jump to another custom chain.
- `return`: Return from the current chain and continue at the next rule in the
  calling chain.
- `queue`: Enqueue the packet to userspace.
- `reject`: Reject the packet. This action is available only in prerouting.
- `notrack`: Bypass connection tracking. This action is available only in
  prerouting.

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> action [accept | continue | drop | jump | queue | return]
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> action [accept | continue | drop | jump | queue | return]
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> action [accept | continue | drop | jump | queue | return]
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> action [accept | continue | drop | jump | notrack | queue | reject | return]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> action [accept | continue | drop | jump | queue | return]

This required setting defines the action of the current rule. If action is
set to jump, then jump-target is also needed.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> jump-target \<text\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> jump-target \<text\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> jump-target \<text\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> jump-target \<text\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> jump-target \<text\>
```

If action is set to `queue`, use the following command to specify the queue
target. A range is also supported:

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> queue \<0-65535\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> queue \<0-65535\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> queue \<0-65535\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> queue \<0-65535\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> queue \<0-65535\>

If action is set to `queue`, use the following commands to specify queue
options. The available options are `bypass` and `fanout`:
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> queue-options bypass
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> queue-options fanout
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> queue-options fanout
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> queue-options fanout
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> queue-options fanout
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> queue-options fanout
```

Also, **default-action** is an action that takes place whenever a packet does
not match any rule in its chain. For base chains, possible options for
**default-action** are **accept** or **drop**.

```{cfgcmd} set firewall bridge forward filter default-action [accept | drop]
```

```{cfgcmd} set firewall bridge input filter default-action [accept | drop]
```

```{cfgcmd} set firewall bridge output filter default-action [accept | drop]
```

```{cfgcmd} set firewall bridge prerouting filter default-action [accept | drop]
```

```{cfgcmd} set firewall bridge name \<name\> default-action [accept | continue | drop | jump | reject | return]

This sets the default action when a packet does not match any rule in the
custom chain. If `default-action` is set to `jump`, configure
`default-jump-target`. Base chains support only `accept` and `drop`; custom
chains also support `continue`, `jump`, `reject`, and `return`.
```

```{cfgcmd} set firewall bridge name \<name\> default-jump-target \<text\>

Use this only when `default-action` is set to `jump`. It specifies the jump
target for the default rule.
```
:::{note}
**Important note about default-actions:**
If you do not configure a default action, base chains default to **accept**
and custom chains default to **drop**.
:::


### Firewall Logs


You can enable logging for every firewall rule. If enabled, other log options
can be configured.

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> log
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> log
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> log
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> log
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log

Enable logging for the matched packet. If this configuration command is not
present, then the log is not enabled.
```

```{cfgcmd} set firewall bridge forward filter default-log
```

```{cfgcmd} set firewall bridge input filter default-log
```

```{cfgcmd} set firewall bridge output filter default-log
```

```{cfgcmd} set firewall bridge prerouting filter default-log
```

```{cfgcmd} set firewall bridge name \<name\> default-log

Use this command to enable the logging of the default action on
the specified chain.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options level [emerg | alert | crit | err | warn | notice | info | debug]

Define the log level. This option applies only when logging is enabled for the
rule.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> log-options group \<0-65535\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> log-options group \<0-65535\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> log-options group \<0-65535\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> log-options group \<0-65535\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options group \<0-65535\>

Define the log group to which messages are sent. This option applies only
when logging is enabled for the rule.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> log-options snapshot-length \<0-9000\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> log-options snapshot-length \<0-9000\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> log-options snapshot-length \<0-9000\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> log-options snapshot-length \<0-9000\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options snapshot-length \<0-9000\>

Define the number of packet payload bytes to include in the netlink message.
This option applies only when rule logging is enabled and a log group is
configured.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> log-options queue-threshold \<0-65535\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> log-options queue-threshold \<0-65535\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> log-options queue-threshold \<0-65535\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> log-options queue-threshold \<0-65535\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> log-options queue-threshold \<0-65535\>

Define the number of packets queued in the kernel before they are sent to
userspace. This option applies only when rule logging is enabled and a log
group is configured.
```

### Firewall Description


You can define a description for reference for every custom chain.

```{cfgcmd} set firewall bridge name \<name\> description \<text\>

Provide a rule-set description to a custom firewall chain.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> description \<text\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> description \<text\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> description \<text\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> description \<text\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> description \<text\>

Provide a description for each rule.
```

### Rule Status


By default, when you define a rule, it is enabled. In some cases, it is
useful to disable the rule instead of removing it.

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> disable
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> disable
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> disable
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> disable
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> disable

Command for disabling a rule but keep it in the configuration.
```

### Matching criteria


There are many matching criteria against which a packet can be tested. Refer
to {doc}`IPv4</configuration/firewall/ipv4>` and
{doc}`IPv6</configuration/firewall/ipv6>` matching criteria for more details.


Although bridges operate at layer 2, bridge firewall rules can match IPv4 and
IPv6 packet fields. Firewall groups can also be used where supported by the
rule's match criteria.


Same specific matching criteria that can be used in bridge firewall are
described in this section:

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]

Match based on the Ethernet type of the packet.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> vlan ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> vlan ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> vlan ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> vlan ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> vlan ethernet-type [802.1q | 802.1ad | arp | ipv4 | ipv6]

Match based on the Ethernet type of the packet when it is VLAN tagged.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> vlan id \<0-4096\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> vlan id \<0-4096\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> vlan id \<0-4096\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> vlan id \<0-4096\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> vlan id \<0-4096\>

Match based on VLAN identifier. Range is also supported.
```

```{cfgcmd} set firewall bridge forward filter rule \<1-999999\> vlan priority \<0-7\>
```

```{cfgcmd} set firewall bridge input filter rule \<1-999999\> vlan priority \<0-7\>
```

```{cfgcmd} set firewall bridge output filter rule \<1-999999\> vlan priority \<0-7\>
```

```{cfgcmd} set firewall bridge prerouting filter rule \<1-999999\> vlan priority \<0-7\>
```

```{cfgcmd} set firewall bridge name \<name\> rule \<1-999999\> vlan priority \<0-7\>

Match based on VLAN priority (Priority Code Point - PCP). Range is also
supported.
```

### Packet Modifications


Bridge firewall rules can modify packet fields in the supported chains, as
shown in the following commands.

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set dscp \<0-63\>

Set a specific value of Differentiated Services Codepoint (DSCP).
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set mark \<1-2147483647\>

Set a specific packet mark value.
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set tcp-mss \<500-1460\>

Set the TCP maximum segment size (MSS) on matching packets.
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set ttl \<0-255\>

Set the TTL (Time to Live) value.
```

```{cfgcmd} set firewall bridge [prerouting | forward | output] filter rule \<1-999999\> set hop-limit \<0-255\>

Set the hop limit value.
```

```{cfgcmd} set firewall bridge [forward | output] filter rule \<1-999999\> set connection-mark \<0-2147483647\>

Set connection mark value.
```

### Use IP firewall

By default, switched traffic is filtered by the bridge firewall. To also apply
the IPv4 or IPv6 firewall to bridged traffic, configure the corresponding
global option:

```{cfgcmd} set firewall global-options apply-to-bridged-traffic ipv4

Apply IPv4 firewall rules to bridged traffic.
```

```{cfgcmd} set firewall global-options apply-to-bridged-traffic ipv6

Apply IPv6 firewall rules to bridged traffic.
```

## Operation-mode Firewall
### Rule-set overview

Use the following operational mode commands to inspect firewall rules,
counters, and statistics:

```{opcmd} show firewall
```

```{opcmd} show firewall summary
```

```{opcmd} show firewall statistics
```

And, to print only bridge firewall information:

```{opcmd} show firewall bridge
```

```{opcmd} show firewall bridge forward filter
```

```{opcmd} show firewall bridge forward filter rule \<rule\>
```

```{opcmd} show firewall bridge name \<name\>
```

```{opcmd} show firewall bridge name \<name\> rule \<rule\>
```

### Show Firewall log

```{opcmd} show log firewall
```

```{opcmd} show log firewall bridge
```

```{opcmd} show log firewall bridge forward
```

```{opcmd} show log firewall bridge forward filter
```

```{opcmd} show log firewall bridge name \<name\>
```

```{opcmd} show log firewall bridge forward filter rule \<rule\>
```

```{opcmd} show log firewall bridge name \<name\> rule \<rule\>

These commands show firewall logs, including all bridge firewall logs, logs
for the forward chain, logs for a custom chain, or logs for a specific rule.
```

### Example

Configuration example:

```none
set firewall bridge forward filter default-action 'drop'
set firewall bridge forward filter default-log
set firewall bridge forward filter rule 10 action 'continue'
set firewall bridge forward filter rule 10 inbound-interface name 'eth2'
set firewall bridge forward filter rule 10 vlan id '22'
set firewall bridge forward filter rule 20 action 'drop'
set firewall bridge forward filter rule 20 inbound-interface group 'TRUNK-RIGHT'
set firewall bridge forward filter rule 20 vlan id '60'
set firewall bridge forward filter rule 30 action 'jump'
set firewall bridge forward filter rule 30 jump-target 'TEST'
set firewall bridge forward filter rule 30 outbound-interface name '!eth1'
set firewall bridge forward filter rule 35 action 'accept'
set firewall bridge forward filter rule 35 vlan id '11'
set firewall bridge forward filter rule 40 action 'continue'
set firewall bridge forward filter rule 40 destination mac-address '66:55:44:33:22:11'
set firewall bridge forward filter rule 40 source mac-address '11:22:33:44:55:66'
set firewall bridge name TEST default-action 'accept'
set firewall bridge name TEST default-log
set firewall bridge name TEST rule 10 action 'continue'
set firewall bridge name TEST rule 10 log
set firewall bridge name TEST rule 10 vlan priority '0'
```

And op-mode commands:

```none
vyos@BRI:~$ show firewall bridge
Rulesets bridge Information

---------------------------------
bridge Firewall "forward filter"

Rule     Action    Protocol      Packets    Bytes  Conditions
-------  --------  ----------  ---------  -------  ---------------------------------------------------------------------
10       continue  all                 0        0  iifname "eth2" vlan id 22  continue
20       drop      all                 0        0  iifname @I_TRUNK-RIGHT vlan id 60
30       jump      all              2130   170688  oifname != "eth1"  jump NAME_TEST
35       accept    all              2080   168616  vlan id 11  accept
40       continue  all                 0        0  ether daddr 66:55:44:33:22:11 ether saddr 11:22:33:44:55:66  continue
default  drop      all                 0        0

---------------------------------
bridge Firewall "name TEST"

Rule     Action    Protocol      Packets    Bytes  Conditions
-------  --------  ----------  ---------  -------  --------------------------------------------------
10       continue  all              2130   170688  vlan pcp 0  prefix "[bri-NAM-TEST-10-C]"  continue
default  accept    all              2130   170688

vyos@BRI:~$
vyos@BRI:~$ show firewall bridge name TEST
Ruleset Information

---------------------------------
bridge Firewall "name TEST"

Rule     Action    Protocol      Packets    Bytes  Conditions
-------  --------  ----------  ---------  -------  --------------------------------------------------
10       continue  all              2130   170688  vlan pcp 0  prefix "[bri-NAM-TEST-10-C]"  continue
default  accept    all              2130   170688

vyos@BRI:~$
```

Inspect logs:

% stop_vyoslinter
```none
vyos@BRI:~$ show log firewall bridge
Dec 05 14:37:47 kernel: [bri-NAM-TEST-10-C]IN=eth1 OUT=eth2 ARP HTYPE=1 PTYPE=0x0800 OPCODE=1 MACSRC=50:00:00:04:00:00 IPSRC=10.11.11.101 MACDST=00:00:00:00:00:00 IPDST=10.11.11.102
Dec 05 14:37:48 kernel: [bri-NAM-TEST-10-C]IN=eth1 OUT=eth2 ARP HTYPE=1 PTYPE=0x0800 OPCODE=1 MACSRC=50:00:00:04:00:00 IPSRC=10.11.11.101 MACDST=00:00:00:00:00:00 IPDST=10.11.11.102
Dec 05 14:37:49 kernel: [bri-NAM-TEST-10-C]IN=eth1 OUT=eth2 ARP HTYPE=1 PTYPE=0x0800 OPCODE=1 MACSRC=50:00:00:04:00:00 IPSRC=10.11.11.101 MACDST=00:00:00:00:00:00 IPDST=10.11.11.102
...
vyos@BRI:~$ show log firewall bridge forward filter
Dec 05 14:42:22 kernel: [bri-FWD-filter-default-D]IN=eth2 OUT=eth1 MAC=33:33:00:00:00:16:50:00:00:06:00:00:86:dd SRC=0000:0000:0000:0000:0000:0000:0000:0000 DST=ff02:0000:0000:0000:0000:0000:0000:0016 LEN=96 TC=0 HOPLIMIT=1 FLOWLBL=0 PROTO=ICMPv6 TYPE=143 CODE=0
Dec 05 14:42:22 kernel: [bri-FWD-filter-default-D]IN=eth2 OUT=eth1 MAC=33:33:00:00:00:16:50:00:00:06:00:00:86:dd SRC=0000:0000:0000:0000:0000:0000:0000:0000 DST=ff02:0000:0000:0000:0000:0000:0000:0016 LEN=96 TC=0 HOPLIMIT=1 FLOWLBL=0 PROTO=ICMPv6 TYPE=143 CODE=0
```
% start_vyoslinter
