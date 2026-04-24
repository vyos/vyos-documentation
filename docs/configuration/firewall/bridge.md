lastproofread  
2023-11-08

# Bridge Firewall Configuration

<div class="note">

<div class="title">

Note

</div>

**Documentation under development**

</div>

## Overview

In this section there's useful information of all firewall configuration that
can be done regarding bridge, and appropiate op-mode commands.
Configuration commands covered in this section:

<div class="cfgcmd">

set firewall bridge ...

</div>

From main structure defined in `Firewall Overview</configuration/firewall/index>`
in this section you can find detailed information only for the next part
of the general structure:

``` none
- set firewall
    * bridge
         - forward
            + filter
         - name
            + custom_name
```

Traffic which is received by the router on an interface which is member of a
bridge is processed on the **Bridge Layer**. A simplified packet flow diagram
for this layer is shown next:

<figure>
<img src="/_static/images/firewall-bridge-packet-flow.png" />
</figure>

For traffic that needs to be forwared internally by the bridge, base chain is
is **forward**, and it's base command for filtering is `set firewall bridge forward filter ...`, which happens in stage 4, highlightened with red color.

Custom bridge firewall chains can be create with command `set firewall bridge name <name> ...`. In order to use such custom chain, a rule with action jump,
and the appropiate target should be defined in a base chain.

<div class="note">

<div class="title">

Note

</div>

**Layer 3 bridge**:
When an IP address is assigned to the bridge interface, and if traffic
is sent to the router to this IP (for example using such IP as
default gateway), then rules defined for **bridge firewall** won't
match, and firewall analysis continues at **IP layer**.

</div>

## Bridge Rules

For firewall filtering, firewall rules needs to be created. Each rule is
numbered, has an action to apply if the rule is matched, and the ability
to specify multiple criteria matchers. Data packets go through the rules
from 1 - 999999, so order is crucial. At the first match the action of the
rule will be executed.

### Actions

If a rule is defined, then an action must be defined for it. This tells the
firewall what to do if all criteria matchers defined for such rule do match.

In firewall bridge rules, the action can be:

> - `accept`: accept the packet.
> - `continue`: continue parsing next rule.
> - `drop`: drop the packet.
> - `jump`: jump to another custom chain.
> - `return`: Return from the current chain and continue at the next rule
>   of the last chain.
> - `queue`: Enqueue packet to userspace.

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\> action
\[accept | continue | drop | jump | queue | return\]

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\> action
\[accept | continue | drop | jump | queue | return\]

This required setting defines the action of the current rule. If action is
set to jump, then jump-target is also needed.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
jump-target \<text\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
jump-target \<text\>

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
queue \<0-65535\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
queue \<0-65535\>

To be used only when action is set to `queue`. Use this command to specify
queue target to use. Queue range is also supported.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
queue-options bypass

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
queue-options bypass

To be used only when action is set to `queue`. Use this command to let
packet go through firewall when no userspace software is connected to the
queue.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
queue-options fanout

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
queue-options fanout

To be used only when action is set to `queue`. Use this command to
distribute packets between several queues.

</div>

Also, **default-action** is an action that takes place whenever a packet does
not match any rule in it's chain. For base chains, possible options for
**default-action** are **accept** or **drop**.

<div class="cfgcmd">

set firewall bridge forward filter default-action
\[accept | drop\]

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> default-action
\[accept | continue | drop | jump | queue | return\]

This set the default action of the rule-set if no rule matched a packet
criteria. If default-action is set to `jump`, then
`default-jump-target` is also needed. Note that for base chains, default
action can only be set to `accept` or `drop`, while on custom chain,
more actions are available.

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> default-jump-target \<text\>

To be used only when `defult-action` is set to `jump`. Use this
command to specify jump target for default rule.

</div>

<div class="note">

<div class="title">

Note

</div>

**Important note about default-actions:**
If default action for any base chain is not defined, then the default
action is set to **accept** for that chain. For custom chains, if default
action is not defined, then the default-action is set to **drop**.

</div>

### Firewall Logs

Logging can be enable for every single firewall rule. If enabled, other
log options can be defined.

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\> log

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\> log

Enable logging for the matched packet. If this configuration command is not
present, then log is not enabled.

</div>

<div class="cfgcmd">

set firewall bridge forward filter default-log

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> default-log

Use this command to enable the logging of the default action on
the specified chain.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
log-options level \[emerg | alert | crit | err | warn | notice
| info | debug\]

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
log-options level \[emerg | alert | crit | err | warn | notice
| info | debug\]

Define log-level. Only applicable if rule log is enable.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
log-options group \<0-65535\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
log-options group \<0-65535\>

Define log group to send message to. Only applicable if rule log is enable.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
log-options snapshot-length \<0-9000\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
log-options snapshot-length \<0-9000\>

Define length of packet payload to include in netlink message. Only
applicable if rule log is enable and log group is defined.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
log-options queue-threshold \<0-65535\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
log-options queue-threshold \<0-65535\>

Define number of packets to queue inside the kernel before sending them to
userspace. Only applicable if rule log is enable and log group is defined.

</div>

### Firewall Description

For reference, a description can be defined for every defined custom chain.

<div class="cfgcmd">

set firewall bridge name \<name\> description \<text\>

Provide a rule-set description to a custom firewall chain.

</div>

### Rule Status

When defining a rule, it is enable by default. In some cases, it is useful to
just disable the rule, rather than removing it.

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\> disable

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\> disable

Command for disabling a rule but keep it in the configuration.

</div>

### Matching criteria

There are a lot of matching criteria against which the packet can be tested.

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
destination mac-address \<mac-address\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
destination mac-address \<mac-address\>

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
source mac-address \<mac-address\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
source mac-address \<mac-address\>

Match criteria based on source and/or destination mac-address.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
inbound-interface name \<iface\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
inbound-interface name \<iface\>

Match based on inbound interface. Wilcard `*` can be used.
For example: `eth2*`. Prepending character `!` for inverted matching
criteria is also supportd. For example `!eth2`

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
inbound-interface group \<iface_group\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
inbound-interface group \<iface_group\>

Match based on inbound interface group. Prepending character `!` for
inverted matching criteria is also supportd. For example `!IFACE_GROUP`

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
outbound-interface name \<iface\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
outbound-interface name \<iface\>

Match based on outbound interface. Wilcard `*` can be used.
For example: `eth2*`. Prepending character `!` for inverted matching
criteria is also supportd. For example `!eth2`

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
outbound-interface group \<iface_group\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
outbound-interface group \<iface_group\>

Match based on outbound interface group. Prepending character `!` for
inverted matching criteria is also supportd. For example `!IFACE_GROUP`

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
vlan id \<0-4096\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
vlan id \<0-4096\>

Match based on vlan ID. Range is also supported.

</div>

<div class="cfgcmd">

set firewall bridge forward filter rule \<1-999999\>
vlan priority \<0-7\>

</div>

<div class="cfgcmd">

set firewall bridge name \<name\> rule \<1-999999\>
vlan priority \<0-7\>

Match based on vlan priority(pcp). Range is also supported.

</div>

## Operation-mode Firewall

### Rule-set overview

In this section you can find all useful firewall op-mode commands.

General commands for firewall configuration, counter and statiscits:

<div class="opcmd">

show firewall

</div>

<div class="opcmd">

show firewall summary

</div>

<div class="opcmd">

show firewall statistics

</div>

And, to print only bridge firewall information:

<div class="opcmd">

show firewall bridge

</div>

<div class="opcmd">

show firewall bridge forward filter

</div>

<div class="opcmd">

show firewall bridge forward filter rule \<rule\>

</div>

<div class="opcmd">

show firewall bridge name \<name\>

</div>

<div class="opcmd">

show firewall bridge name \<name\> rule \<rule\>

</div>

### Show Firewall log

<div class="opcmd">

show log firewall

</div>

<div class="opcmd">

show log firewall bridge

</div>

<div class="opcmd">

show log firewall bridge forward

</div>

<div class="opcmd">

show log firewall bridge forward filter

</div>

<div class="opcmd">

show log firewall bridge name \<name\>

</div>

<div class="opcmd">

show log firewall bridge forward filter rule \<rule\>

</div>

<div class="opcmd">

show log firewall bridge name \<name\> rule \<rule\>

Show the logs of all firewall; show all bridge firewall logs; show all logs
for forward hook; show all logs for forward hook and priority filter; show
all logs for particular custom chain; show logs for specific Rule-Set.

</div>

### Example

Configuration example:

``` none
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

``` none
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

``` none
vyos@BRI:~$ show log firewall bridge
Dec 05 14:37:47 kernel: [bri-NAM-TEST-10-C]IN=eth1 OUT=eth2 ARP HTYPE=1 PTYPE=0x0800 OPCODE=1 MACSRC=50:00:00:04:00:00 IPSRC=10.11.11.101 MACDST=00:00:00:00:00:00 IPDST=10.11.11.102
Dec 05 14:37:48 kernel: [bri-NAM-TEST-10-C]IN=eth1 OUT=eth2 ARP HTYPE=1 PTYPE=0x0800 OPCODE=1 MACSRC=50:00:00:04:00:00 IPSRC=10.11.11.101 MACDST=00:00:00:00:00:00 IPDST=10.11.11.102
Dec 05 14:37:49 kernel: [bri-NAM-TEST-10-C]IN=eth1 OUT=eth2 ARP HTYPE=1 PTYPE=0x0800 OPCODE=1 MACSRC=50:00:00:04:00:00 IPSRC=10.11.11.101 MACDST=00:00:00:00:00:00 IPDST=10.11.11.102
...
vyos@BRI:~$ show log firewall bridge forward filter
Dec 05 14:42:22 kernel: [bri-FWD-filter-default-D]IN=eth2 OUT=eth1 MAC=33:33:00:00:00:16:50:00:00:06:00:00:86:dd SRC=0000:0000:0000:0000:0000:0000:0000:0000 DST=ff02:0000:0000:0000:0000:0000:0000:0016 LEN=96 TC=0 HOPLIMIT=1 FLOWLBL=0 PROTO=ICMPv6 TYPE=143 CODE=0
Dec 05 14:42:22 kernel: [bri-FWD-filter-default-D]IN=eth2 OUT=eth1 MAC=33:33:00:00:00:16:50:00:00:06:00:00:86:dd SRC=0000:0000:0000:0000:0000:0000:0000:0000 DST=ff02:0000:0000:0000:0000:0000:0000:0016 LEN=96 TC=0 HOPLIMIT=1 FLOWLBL=0 PROTO=ICMPv6 TYPE=143 CODE=0
```
