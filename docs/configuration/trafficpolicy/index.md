---
lastproofread: '2026-09-30'
---

(qos)=

# Traffic Policy

## QoS

Quality of Service (QoS), also called traffic control, covers tasks such
as shaping, scheduling, and dropping packets. It can help prioritize
some traffic over other traffic when a link is congested.

[tc] is a powerful tool for Traffic Control found at the Linux kernel.
However, its configuration is often considered a cumbersome task.
Fortunately, VyOS eases the job through its CLI, while using `tc` as
backend.

### How to make it work

In order to have VyOS Traffic Control working you need to follow 2
steps:

> 1. **Create a traffic policy**.
> 2. **Apply the traffic policy to an interface ingress or egress**.

But before learning to configure your policy, we will warn you
about the different units you can use and also show you what *classes*
are and how they work, as some policies may require you to configure
them.

### Units

Rate fields accept decimal bit-rate suffixes. Some fields also accept
`auto` or a percentage of the interface speed. Check the CLI completion
for the values supported by each field.

#### Prefixes

Use these decimal bit-rate suffixes:

```{eval-rst}
   .. code-block:: none

    bit   (1)       bit per second
    kbit  (10^3)    kilobit per second
    mbit  (10^6)    megabit per second
    gbit  (10^9)    gigabit per second
    tbit  (10^12)   terabit per second
```


Byte-size fields such as `burst` use bytes and may accept scaling suffixes
such as `k` (for example, the default shaper burst is `15k`). A lowercase
`b` in a rate suffix means bits, not bytes.

(classes)=

### Classes

In the {ref}`creating_a_traffic_policy` section you will see that
some of the policies use *classes*. Those policies let you distribute
traffic into different classes according to different parameters you can
choose. So, a class is just a specific type of traffic you select.

The ultimate goal of classifying traffic is to give each class a
different treatment.

#### Matching traffic

In order to define which traffic goes into which class, you define
filters (that is, the matching criteria). Packets go through these matching
rules (as in the rules of a firewall) and, if a packet matches the filter, it
is assigned to that class.

In VyOS, a class is identified by a number you can choose when
configuring it.

:::{note}
The meaning of the Class ID is not the same for every type of
policy. Normally policies just need a meaningless number to identify
a class (Class ID), but that does not apply to every policy.
In a Priority Queue policy, the class number identifies the queue and
sets its priority.
:::
```none
set qos policy <policy> <policy-name> class <class-ID> match <class-matching-rule-name>
```

In the command above, we set the type of policy we are going to
work with and the name we choose for it; a class (so that we can
differentiate some traffic) and an identifiable number for that class;
then we configure a matching rule (or filter) and a name for it.

A class can have multiple match filters:

```none
set qos policy shaper MY-SHAPER class 30 match HTTP
set qos policy shaper MY-SHAPER class 30 match HTTPs
```

A match filter can contain multiple criteria and will match traffic if
all those criteria are true.

For example:

```none
set qos policy shaper MY-SHAPER class 30 match HTTP ip protocol tcp
set qos policy shaper MY-SHAPER class 30 match HTTP ip source port 80
```

This will match TCP traffic with source port 80.

There are many parameters you will be able to use in order to match the
traffic you want for a class:

> - **Ethernet (protocol, destination address or source address)**
> - **Interface name**
> - **IPv4 (DSCP value, maximum packet length, protocol, source address,**
>   **destination address, source port, destination port or TCP flags)**
> - **IPv6 (DSCP value, maximum payload length, protocol, source address,**
>   **destination address, source port, destination port or TCP flags)**
> - **Firewall mark**
> - **VLAN ID**

When configuring your filter, you can use the `Tab` key to see the many
different parameters you can configure.

```none
vyos@vyos# set qos policy shaper MY-SHAPER class 30 match MY-FIRST-FILTER 
Possible completions:
   description  Description
 > ether        Ethernet header match
   interface    Interface to use
 > ip           Match IP protocol header
 > ipv6         Match IPV6 protocol header
   mark         Match on mark applied by firewall
   vif          Virtual Local Area Network (VLAN) ID for this match
```

As shown in the example above, one of the possibilities to match packets
is based on marks done by the firewall,
[that can give you a great deal of flexibility].

You can also write a description for a filter:

```none
set qos policy shaper MY-SHAPER class 30 match MY-FIRST-FILTER description "My filter description"
```
:::{note}
An IPv4 TCP filter will only match packets with an IPv4 header
length of 20 bytes (which is the majority of IPv4 packets anyway).
:::

:::{note}
IPv6 TCP filters will only match IPv6 packets with no header
extension, see <https://en.wikipedia.org/wiki/IPv6_packet#Extension_headers>
:::

#### Traffic Match Group

In some case where we need to have an organization of our matching selection,
in order to be more flexible and organize with our filter definition. We can
apply traffic match groups, allowing us to create distinct filter groups within
our policy and define various parameters for each group:

```none
set qos traffic-match-group <group_name> match <match_name>
Possible completions:
   description          Description
 > ip                   Match IP protocol header
 > ipv6                 Match IPv6 protocol header
   mark                 Match on mark applied by firewall
   vif                  Virtual Local Area Network (VLAN) ID for this match
```

inherit matches from another group

```none
set qos traffic-match-group <group_name> match-group <match_group_name>
```

A match group can contain multiple criteria and inherit them in the same policy.

For example:

```none
set qos traffic-match-group Mission-Critical match AF31 ip dscp 'AF31'
set qos traffic-match-group Mission-Critical match AF32 ip dscp 'AF42'
set qos traffic-match-group Mission-Critical match CS3 ip dscp 'CS3'
set qos traffic-match-group Streaming-Video match AF11 ip dscp 'AF11'
set qos traffic-match-group Streaming-Video match AF41 ip dscp 'AF41'
set qos traffic-match-group Streaming-Video match AF43 ip dscp 'AF43'
set qos policy shaper VyOS-HTB class 10 bandwidth '30%'
set qos policy shaper VyOS-HTB class 10 description 'Multimedia'
set qos policy shaper VyOS-HTB class 10 match CS4 ip dscp 'CS4'
set qos policy shaper VyOS-HTB class 10 match-group 'Streaming-Video'
set qos policy shaper VyOS-HTB class 10 priority '1'
set qos policy shaper VyOS-HTB class 10 queue-type 'fair-queue'
set qos policy shaper VyOS-HTB class 20 description 'MC'
set qos policy shaper VyOS-HTB class 20 match-group 'Mission-Critical'
set qos policy shaper VyOS-HTB class 20 priority '2'
set qos policy shaper VyOS-HTB class 20 queue-type 'fair-queue'
set qos policy shaper VyOS-HTB default bandwidth '20%'
set qos policy shaper VyOS-HTB default queue-type 'fq-codel'
```

In this example, we can observe that different DSCP criteria are defined based
on our QoS configuration within the same policy group.

#### Default

Often you will also have to configure your *default* traffic in the same
way you do with a class. *Default* can be considered a class as it
behaves like that. It contains any traffic that did not match any
of the defined classes, so it is like an open class, a class without
matching filters.

#### Class treatment

Once a class has a filter configured, you will also have to define what
you want to do with the traffic of that class, what specific
Traffic-Control treatment you want to give it. You will have different
possibilities depending on the Traffic Policy you are configuring.

```none
vyos@vyos# set qos policy shaper MY-SHAPER class 30
Possible completions:
   bandwidth    Available bandwidth for this policy (default: auto)
   burst        Burst size for this class (default: 15k)
   ceiling      Bandwidth limit for this class
   codel-quantum
                Deficit in the fair queuing algorithm (default 1514)
   description  Description
   flows        Number of flows into which the incoming packets are classified(default 1024)
   interval     Interval used to measure the delay (default 100)
+> match        Class matching rule name
   priority     Priority for rule evaluation
   queue-limit  Maximum queue size
   queue-type   Queue type for default traffic (default: fq-codel)
   set-dscp     Change the Differentiated Services (DiffServ) field in the IP header
   target       Acceptable minimum standing/persistent queue delay (default: 5)
```

For instance, with {code}`set qos policy shaper MY-SHAPER
class 30 set-dscp EF` you would be modifying the DSCP field value of packets in
that class to Expedite Forwarding.

> DSCP values as per {rfc}`2474` and {rfc}`4595`:
>
> | Binary value | Configured value | Drop rate | Description                  |
> | ------------ | ---------------- | --------- | ---------------------------- |
> | 101110       | 46               | -         | Expedited forwarding (EF)    |
> | 000000       | 0                | -         | Best effort traffic, default |
> | 001010       | 10               | Low       | Assured Forwarding(AF) 11    |
> | 001100       | 12               | Medium    | Assured Forwarding(AF) 12    |
> | 001110       | 14               | High      | Assured Forwarding(AF) 13    |
> | 010010       | 18               | Low       | Assured Forwarding(AF) 21    |
> | 010100       | 20               | Medium    | Assured Forwarding(AF) 22    |
> | 010110       | 22               | High      | Assured Forwarding(AF) 23    |
> | 011010       | 26               | Low       | Assured Forwarding(AF) 31    |
> | 011100       | 28               | Medium    | Assured Forwarding(AF) 32    |
> | 011110       | 30               | High      | Assured Forwarding(AF) 33    |
> | 100010       | 34               | Low       | Assured Forwarding(AF) 41    |
> | 100100       | 36               | Medium    | Assured Forwarding(AF) 42    |
> | 100110       | 38               | High      | Assured Forwarding(AF) 43    |

(embed)=

#### Embedding one policy into another one

Often we need to embed one policy into another one. It is possible to do
so on classful policies, by attaching a new policy into a class. For
instance, you might want to apply different policies to the different
classes of a Round-Robin policy you have configured.

A common example is the case of some policies which, in order to be
effective, they need to be applied to an interface that is directly
connected where the bottleneck is. If your router is not
directly connected to the bottleneck, but some hop before it, you can
emulate the bottleneck by embedding your non-shaping policy into a
classful shaping one so that it takes effect.

You can configure a policy into a class through the `queue-type`
setting.

```none
set qos policy shaper FQ-SHAPER bandwidth 4gbit
set qos policy shaper FQ-SHAPER default bandwidth 100%
set qos policy shaper FQ-SHAPER default queue-type fq-codel
```

As shown in the last command of the example above, the `queue-type`
setting allows these combinations. You will be able to use it
in many policies.

:::{note}
Some policies already include other embedded policies inside.
Shaper classes use FQ-CoDel by default; you can select another supported
queue type for a class.
:::

(creating_a_traffic_policy)=

### Creating a traffic policy

VyOS lets you control traffic in many different ways, here we will cover
every possibility. You can configure as many policies as you want, but
you will only be able to apply one policy per interface and direction
(inbound or outbound).

Some policies can be combined, you will be able to embed a different
policy that will be applied to a class of the main policy.

:::{hint}
**If you are looking for a policy for your outbound traffic**
but you don't know which one you need and you don't want to go
through every possible policy shown here, **our bet is that highly
likely you are looking for a** Shaper **policy and you want to**
{ref}`set its queues <embed>` **as FQ-CoDel**.
:::

#### Drop Tail

```{eval-rst}
| **Queueing discipline:** PFIFO (Packet First In First Out).
| **Applies to:** Outbound traffic.
```

This the simplest queue possible you can apply to your traffic. Traffic
must go through a finite queue before it is actually sent. You must
define how many packets that queue can contain.

When a packet is to be sent, it will have to go through that queue, so
the packet will be placed at the tail of it. When the packet completely
goes through it, it will be dequeued emptying its place in the queue and
being eventually handed to the NIC to be actually sent out.

Despite the Drop-Tail policy does not slow down packets, if many packets
are to be sent, they could get dropped when trying to get enqueued at
the tail. This can happen if the queue has still not been able to
release enough packets from its head.

This is the policy that requires the lowest resources for the same
amount of traffic. But **very likely you do not need it as you cannot
get much from it. Sometimes it is used just to enable logging.**

```{cfgcmd} set qos policy drop-tail \<policy-name\> queue-limit \<number-of-packets\>

Use this command to configure a drop-tail policy (PFIFO). Choose a
unique name for this policy and the size of the queue by setting the
number of packets it can contain (maximum 4294967295).

```

#### Fair Queue

```{eval-rst}
| **Queueing discipline:** SFQ (Stochastic Fairness Queuing).
| **Applies to:** Outbound traffic.
```

Fair Queue uses Stochastic Fairness Queueing (SFQ), a work-conserving
scheduler that hashes packets into subqueues and services them in turn.
This provides a fair share of transmission opportunities across flows.

```{cfgcmd} set qos policy fair-queue \<policy-name\>

   Use this command to create a Fair-Queue policy and give it a name.
   It is based on the Stochastic Fairness Queueing and can be applied to
   outbound traffic.

```

SFQ hashes flows into a limited number of buckets, so multiple flows
can share a bucket. The optional `hash-interval` setting periodically
perturbs the hash, which can change bucket assignments and may reorder
packets. Its default is `0`, which disables perturbation; the kernel
documentation advises using an interval such as 10 seconds when
perturbation is desired.

```{cfgcmd} set qos policy fair-queue \<policy-name\> hash-interval \<seconds\>

Use this command to set the SFQ hash perturbation interval in seconds
(0-2147483647; default: 0).
```

When dequeuing, SFQ services active hash buckets in turn. You can also
set a per-bucket queue limit.

```{cfgcmd} set qos policy fair-queue \<policy-name\> queue-limit \<limit\>

Use this command to set the maximum number of packets in the SFQ queue
(range: 1-127; default: 127). Packets arriving when the queue is full
are dropped.
```
:::{note}
Fair Queue does not limit the link rate. It schedules packets when a
queue builds; when traffic is below link capacity, there may be no
backlog for it to manage. To create a controlled bottleneck, embed it
in a classful shaping policy.
:::


(fq-codel)=


#### FQ-CoDel


```{eval-rst}
| **Queueing discipline:** Fair/Flow Queue CoDel.
| **Applies to:** Outbound Traffic.
```


FQ-CoDel hashes traffic into flow queues and combines fair queuing with
the CoDel active queue management (AQM) algorithm. VyOS defaults to
1024 flows, a 1514-byte quantum, a 100 ms interval, a 5 ms target, and
a 10240-packet hard queue limit.


It aims to reduce persistent queue delay while sharing service among
flows. Each flow queue uses CoDel; packets within a flow remain in FIFO
order.


:::{note}
FQ-CoDel does not limit the link rate. It manages queueing delay when
traffic builds a queue; when traffic is below link capacity, there may
be no backlog for it to manage. To create a controlled bottleneck, embed
it in a classful shaping policy.
:::


```{cfgcmd} set qos policy fq-codel \<policy name\> codel-quantum \<bytes\>

Use this command to set the per-flow byte quantum used by the fair
queuing scheduler (default: 1514 bytes).
```

```{cfgcmd} set qos policy fq-codel \<policy name\> flows \<number-of-flows\>

Use this command to configure an fq-codel policy, set its name and
the number of sub-queues (default: 1024) into which packets are
classified.
```

```{cfgcmd} set qos policy fq-codel \<policy name\> interval \<milliseconds\>

Use this command to configure an fq-codel policy, set its name and
the time period used by the control loop of CoDel to detect when a
persistent queue is developing, ensuring that the measured minimum
delay does not become too stale (default: 100ms).
```

```{cfgcmd} set qos policy fq-codel \<policy-name\> queue-limit \<number-of-packets\>

Use this command to configure an fq-codel policy, set its name, and
define a hard limit on the real queue size. When this limit is
reached, new packets are dropped (default: 10240 packets).
```

```{cfgcmd} set qos policy fq-codel \<policy-name\> target \<milliseconds\>

Use this command to configure an fq-codel policy, set its name, and
define the acceptable minimum standing/persistent queue delay. This
minimum delay is identified by tracking the local minimum queue delay
that packets experience (default: 5ms).
```

##### Example

A simple example of an FQ-CoDel policy working inside a Shaper one.

```none
set qos policy shaper FQ-CODEL-SHAPER bandwidth 2gbit
set qos policy shaper FQ-CODEL-SHAPER default bandwidth 100%
set qos policy shaper FQ-CODEL-SHAPER default queue-type fq-codel
```

#### Limiter

```{eval-rst}
| **Queueing discipline:** Ingress policer.
| **Applies to:** Inbound traffic.
```

Limiter is one of those policies that uses classes (Ingress qdisc is
actually a classless policy but filters do work in it).

The limiter performs basic ingress policing of traffic flows. Multiple
classes of traffic can be defined and traffic limits can be applied to
each class. Although the policer uses a token bucket mechanism
internally, it does not have the capability to delay a packet as a
shaping mechanism does. Traffic exceeding the defined bandwidth limits
is directly dropped. A maximum allowed burst can be configured too.

You can configure classes (IDs 1-4090) with different settings and a
default policy which will be applied to any traffic not matching any of
the configured classes.

:::{note}
In the case you want to apply some kind of **shaping** to your
**inbound** traffic, check the ingress-shaping section.
:::
```{cfgcmd} set qos policy limiter \<policy-name\> class \<class ID\> match \<match-name\> description \<description\>

Use this command to configure an ingress policer class, its matching
rule, and an optional description. Class IDs range from 1 to 4090.

```

Once the matching rules are set for a class, you can start configuring
how you want matching traffic to behave.

```{cfgcmd} set qos policy limiter \<policy-name\> class \<class-ID\> bandwidth \<rate\>

Use this command to set the maximum allowed rate for the class.

```

```{cfgcmd} set qos policy limiter \<policy-name\> class \<class-ID\> burst \<burst-size\>

Use this command to set the class burst size in bytes (default: 15).

```

```{cfgcmd} set qos policy limiter \<policy-name\> default bandwidth \<rate\>

Use this command to set the maximum allowed rate for unmatched traffic.

```

```{cfgcmd} set qos policy limiter \<policy-name\> default burst \<burst-size\>

Use this command to set the burst size for unmatched traffic, in bytes
(default: 15).

```

```{cfgcmd} set qos policy limiter \<policy-name\> class \<class ID\> priority \<value\>

Use this command to set the class filter evaluation priority (0-20).
Lower numbers are evaluated first.

```

#### Network Emulator

```{eval-rst}
| **Queueing discipline:** netem (Network Emulator).
| **Applies to:** Outbound traffic.
```

The Network Emulator policy applies selected network impairments to
outbound traffic. It supports a rate, queue limit, delay, packet loss,
corruption, duplication, and reordering. Its rate setting is provided
by netem; this policy does not configure a separate TBF qdisc or a
burst setting.

This policy is useful for testing how an application behaves under
selected network conditions.

```{cfgcmd} set qos policy network-emulator \<policy-name\> bandwidth \<rate\>

Use this command to set the netem rate for the policy.

```

```{cfgcmd} set qos policy network-emulator \<policy-name\> delay \<delay\>

Use this command to add a fixed delay to outgoing packets. The value is
in milliseconds (0-65535); delay works independently of the optional
rate setting.
```

```{cfgcmd} set qos policy network-emulator \<policy-name\> corruption \<percent\>

Use this command to emulate noise in a Network Emulator policy. Set
the policy name and the percentage of corrupted packets you want. A
random error will be introduced in a random position for the chosen
percent of packets.
```

```{cfgcmd} set qos policy network-emulator \<policy-name\> loss \<percent\>

Use this command to emulate packet-loss conditions in a Network
Emulator policy. Set the policy name and the percentage of loss
packets your traffic will suffer.
```

```{cfgcmd} set qos policy network-emulator \<policy-name\> reordering \<percent\>

Use this command to set the percentage of packets affected by
reordering (0-100).
```

```{cfgcmd} set qos policy network-emulator \<policy-name\> duplicate \<percent\>

Use this command to set the percentage of packets that netem duplicates
(0-100).
```

```{cfgcmd} set qos policy network-emulator \<policy-name\> queue-limit \<limit\>

Use this command to set the maximum number of packets held by the
queue (1-4294967295).
```

#### Priority Queue

```{eval-rst}
| **Queueing discipline:** PRIO.
| **Applies to:** Outbound traffic.
```

The Priority Queue is a classful scheduling policy. It does not delay
packets (Priority Queue is not a shaping policy), it simply dequeues
packets according to their priority.

:::{note}
Priority Queue does not limit the link rate. It schedules packets when
a queue builds; when traffic is below link capacity, there may be no
backlog for it to manage. Embed it in a classful shaping policy to
create a controlled bottleneck.
:::

Up to seven queues can be configured. Packets are assigned to queues by
their match criteria and transmitted in strict priority order. Sustained
traffic in higher-priority queues can starve lower-priority queues.

:::{note}
In Priority Queue we do not define classes with a meaningless
class ID number but with a class priority number (1-7). The lower the
number, the higher the priority.
:::

As with other policies, you can define different type of matching rules
for your classes:

```none
vyos@vyos# set qos policy priority-queue MY-PRIO class 3 match MY-MATCH-RULE 
Possible completions:
   description  Description
 > ether        Ethernet header match
   interface    Interface to use
 > ip           Match IP protocol header
 > ipv6         Match IPV6 protocol header
   mark         Match on mark applied by firewall
   vif          Virtual Local Area Network (VLAN) ID for this match
```

As with other policies, you can embed other policies into the classes
(and default) of your Priority Queue policy through the `queue-type`
setting:

```none
vyos@vyos# set qos policy priority-queue MY-PRIO class 3 queue-type 
Possible completions:
   drop-tail    First-In-First-Out (FIFO) (default)
   fq-codel     Fair Queue Codel
   fair-queue   Stochastic Fair Queue (SFQ)
   priority     Priority queueing
   random-detect
                Random Early Detection (RED)
```

```{cfgcmd} set qos policy priority-queue \<policy-name\> class \<class-ID\> queue-limit \<limit\>

Use this command to configure a Priority Queue policy, set its name,
set a class with a priority from 1 to 7 and define a hard limit on
the real queue size. When this limit is reached, new packets are
dropped.

```

(random-detect)=

#### Random-Detect

```{eval-rst}
| **Queueing discipline:** Generalized Random Early Drop.
| **Applies to:** Outbound traffic.
```

A simple Random Early Detection (RED) policy would start randomly
dropping packets from a queue before it reaches its queue limit thus
avoiding congestion. That is good for TCP connections as the gradual
dropping of packets acts as a signal for the sender to decrease its
transmission rate.

In contrast to simple RED, VyOS' Random-Detect uses a Generalized Random
Early Detect policy that provides different virtual queues based on the
IP Precedence value so that some virtual queues can drop more packets
than others.

This is achieved by using the first three bits of the ToS (Type of
Service) field to categorize data streams and, in accordance with the
defined precedence parameters, a decision is made.

IP precedence as defined in {rfc}`791`:
> | Precedence | Priority             |
> | ---------- | -------------------- |
> | 7          | Network Control      |
> | 6          | Internetwork Control |
> | 5          | CRITIC/ECP           |
> | 4          | Flash Override       |
> | 3          | Flash                |
> | 2          | Immediate            |
> | 1          | Priority             |
> | 0          | Routine              |
Random-Detect uses generalized RED (GRED) with eight virtual queues,
one for each IP precedence value. It can mark or drop packets as the
average queue size grows, before the hard queue limit is reached.

```{cfgcmd} set qos policy random-detect \<policy-name\> bandwidth \<bandwidth\>

   Use this command to configure a Random-Detect policy, set its name
   and set the available bandwidth for this policy. It is used for
   calculating the average queue size after some idle time. It should be
   set to the bandwidth of your interface. Random Detect is not a
   shaping policy, this command will not shape.

```

```{cfgcmd} set qos policy random-detect \<policy-name\> precedence \<IP-precedence-value\> average-packet \<bytes\>

Use this command to configure a Random-Detect policy and set its
name, then state the IP Precedence for the virtual queue you are
configuring and what the size of its average-packet should be
(in bytes, default: 1024).
```
:::{note}
GRED maps IP precedence value `p` to traffic class priority `8 - p`.
Therefore, a lower IP precedence value receives a higher scheduling
priority.
:::
```{cfgcmd} set qos policy random-detect \<policy-name\> precedence \<IP-precedence-value\> mark-probability \<value\>

Use this command to configure a Random-Detect policy and set its
name, then state the IP Precedence for the virtual queue you are
configuring and what its mark (drop) probability will be. Set the
probability by giving the N value of the fraction 1/N (default: 10).
```

```{cfgcmd} set qos policy random-detect \<policy-name\> precedence \<IP-precedence-value\> maximum-threshold \<packets\>

Use this command to configure a Random-Detect policy and set its
name, then state the IP Precedence for the virtual queue you are
configuring and what its maximum threshold for random detection will
be (from 0 to 4096 packets, default: 18). At this size, the marking
(drop) probability is maximal.

```

```{cfgcmd} set qos policy random-detect \<policy-name\> precedence \<IP-precedence-value\> minimum-threshold \<packets\>

Use this command to configure a Random-Detect policy and set its
name, then state the IP Precedence for the virtual queue you are
configuring and what its minimum threshold for random detection will
be (from 0 to 4096 packets).  If this value is exceeded, packets
start being eligible for being dropped.
```

With the default maximum threshold of 18 packets, the minimum-threshold
defaults are calculated from the IP precedence as shown below. Changing
the maximum threshold also changes these defaults.
> | Precedence | default min-threshold |
> | ---------- | --------------------- |
> | 7          | 16                    |
> | 6          | 15                    |
> | 5          | 14                    |
> | 4          | 13                    |
> | 3          | 12                    |
> | 2          | 11                    |
> | 1          | 10                    |
> | 0          | 9                     |

```{cfgcmd} set qos policy random-detect \<policy-name\> precedence \<IP-precedence-value\> queue-limit \<packets\>

Use this command to configure a Random-Detect policy and set its
name, then specify the IP precedence for the virtual queue you are
configuring and what the maximum size of its queue will be (from 1 to
4294967295 packets). Packets are dropped when the current queue
length reaches this value.

```

If the average queue size is lower than the **min-threshold**, an
arriving packet will be placed in the queue.

In the case the average queue size is between **min-threshold** and
**max-threshold**, then an arriving packet would be either dropped or
placed in the queue, it will depend on the defined **mark-probability**.

If the current queue size is larger than **queue-limit**,
then packets will be dropped. The average queue size depends on its
former average size and its current one.

If **minimum-threshold** is not configured, VyOS derives it from the
maximum threshold and IP precedence. The default formula is
`((9 + precedence) * maximum-threshold) // 18` (integer division).

In principle, values must be
{code}`min-threshold` < {code}`max-threshold` < {code}`queue-limit`.

#### Rate Control

```{eval-rst}
| **Queueing discipline:** Token Bucket Filter.
| **Applies to:** Outbound traffic.
```

Rate-Control is a classless policy that limits the packet flow to a set
rate. It is a pure shaper, it does not schedule traffic. Traffic is
filtered based on the expenditure of tokens. Tokens roughly correspond
to bytes.

Short bursts can be allowed to exceed the limit. On creation, the
Rate-Control traffic is stocked with tokens which correspond to the
amount of traffic that can be burst in one go. Tokens arrive at a steady
rate, until the bucket is full.

```{cfgcmd} set qos policy rate-control \<policy-name\> bandwidth \<rate\>

   Use this command to configure a Rate-Control policy, set its name
   and the rate limit you want to have.

```

```{cfgcmd} set qos policy rate-control \<policy-name\> burst \<burst-size\>

Use this command to configure a Rate-Control policy, set its name
and the size of the bucket in bytes which will be available for
burst.
```

As a reference: for 10mbit/s on Intel, you might need at least 10kbyte
buffer if you want to reach your configured rate.

A very small buffer will soon start dropping packets.

```{cfgcmd} set qos policy rate-control \<policy-name\> latency \<milliseconds\>

Use this command to set the maximum queueing latency in milliseconds
(0-4096, default: 50).

```

Rate-Control limits outbound traffic without classifying it into
multiple classes.
(drr)=

#### Round Robin

**Queueing discipline:**
 Deficit Round Robin.
**Applies to:**
 Outbound traffic.

The round-robin policy is a classful scheduler that divides traffic into
classes with IDs from 1 to 4095. You can embed a
new policy into each of those classes (default included).

Deficit Round Robin (DRR) visits each class in turn. Each class has a
deficit counter measured in bytes. On a visit, the class quantum is
added to its counter, and packets are sent while the counter covers the
next packet's size. The packet size is then deducted. If the next packet
is too large for the remaining deficit, DRR moves to the next class and
adds another quantum on the next round. This lets classes with larger
packets receive a fair share over time.

```{cfgcmd} set qos policy round-robin \<policy name\> class \<class-ID\> quantum \<bytes\>

Use this command to configure a Round-Robin policy, set its name, set
a class ID, and the scheduling quantum for that class, in bytes.

```

```{cfgcmd} set qos policy round-robin \<policy name\> class <class ID> queue-limit \<packets\>

Use this command to configure a Round-Robin policy, set its name, set
a class ID, and the queue size in packets.
```

As with other policies, Round-Robin can embed another policy into a
class through the `queue-type` setting.

```none
vyos@vyos# set qos policy round-robin DRR class 10 queue-type 
Possible completions:
   drop-tail    First-In-First-Out (FIFO) (default)
   fq-codel     Fair Queue Codel
   fair-queue   Stochastic Fair Queue (SFQ)
   priority     Priority queueing based
   random-detect
                Random Early Detection (RED)
```

(shaper)=


#### Shaper


```{eval-rst}
| **Queueing discipline:** Hierarchical Token Bucket.
| **Applies to:** Outbound traffic.
```


The Shaper policy does not guarantee a low delay, but it does guarantee
bandwidth to different traffic classes and also lets you decide how to
allocate more traffic once the guarantees are met.


Each class can have a guaranteed part of the total bandwidth defined for
the whole policy, so all those shares together should not be higher
than the policy's whole bandwidth.


If guaranteed traffic for a class is met and there is room for more
traffic, the ceiling parameter can be used to set how much more
bandwidth could be used. If guaranteed traffic is met and there are
several classes willing to use their ceilings, the priority parameter
will establish the order in which that additional traffic will be
allocated. Priority can be any number from 0 to 20. The lower the number,
the higher the priority.

```{cfgcmd} set qos policy shaper \<policy-name\> bandwidth \<rate\>

Use this command to configure a Shaper policy, set its name
and the maximum bandwidth for all combined traffic.
```

```{cfgcmd} set qos policy shaper \<policy-name\> class \<class-ID\> bandwidth \<rate\>

Use this command to configure a Shaper policy, set its name, define
a class and set the guaranteed traffic you want to allocate to that
class.

```

```{cfgcmd} set qos policy shaper \<policy-name\> class \<class-ID\> burst \<bytes\>

Use this command to configure a Shaper policy, set its name, define
a class and set the size of the token bucket in bytes, which will
be available to be sent at ceiling speed (default: 15Kb).
```

```{cfgcmd} set qos policy shaper \<policy-name\> class \<class-ID\> ceiling \<bandwidth\>

Use this command to configure a Shaper policy, set its name, define
a class and set the maximum speed possible for this class. The
default ceiling value is the bandwidth value.
```

```{cfgcmd} set qos policy shaper \<policy-name\> class \<class-ID\> priority \<0-20\>

Use this command to configure a Shaper policy, set its name, define
a class and set the priority for usage of available bandwidth once
guarantees have been met. The lower the priority number, the higher
the priority. The class priority range is 0-20; lower values have higher
priority. An unspecified class priority defaults to 0; the `default`
class priority defaults to 20.
```

As with other policies, Shaper can embed other policies into its
classes through the `queue-type` setting and then configure their
parameters.

```none
vyos@vyos# set qos policy shaper HTB class 10 queue-type 
Possible completions:
   fq-codel     Fair Queue Codel (default)
   fair-queue   Stochastic Fair Queue (SFQ)
   drop-tail    First-In-First-Out (FIFO)
   priority     Priority queueing
   random-detect
                Random Early Detection (RED)
```

```none
vyos@vyos# set qos policy shaper HTB class 10
Possible completions:
   bandwidth    Available bandwidth for this policy (default: auto)
   burst        Burst size for this class (default: 15k)
   ceiling      Bandwidth limit for this class
   codel-quantum
                Deficit in the fair queuing algorithm (default 1514)
   description  Description
   flows        Number of flows into which the incoming packets are classified (default 1024)
   interval     Interval used to measure the delay (default 100)
+> match        Class matching rule name
   priority     Priority for rule evaluation
   queue-limit  Maximum queue size (packets)
   queue-type   Queue type for default traffic (default: fq-codel)
   set-dscp     Change the Differentiated Services (DiffServ) field in the IP header
   target       Acceptable minimum standing/persistent queue delay (default: 5)
```
:::{note}
If you configure a class for **VoIP traffic**, don't give it any
*ceiling*, otherwise new VoIP calls could start when the link is
available and get suddenly dropped when other classes start using
their assigned *bandwidth* share.
:::

(traffic-policy-shaper-example)=

##### Example

A simple example of Shaper using priorities.

```none
set qos policy shaper MY-HTB bandwidth '50mbit'
set qos policy shaper MY-HTB class 10 bandwidth '20%'
set qos policy shaper MY-HTB class 10 match DSCP ip dscp 'EF'
set qos policy shaper MY-HTB class 10 queue-type 'fq-codel'
set qos policy shaper MY-HTB class 20 bandwidth '10%'
set qos policy shaper MY-HTB class 20 ceiling '50%'
set qos policy shaper MY-HTB class 20 match PORT666 ip destination port '666'
set qos policy shaper MY-HTB class 20 priority '3'
set qos policy shaper MY-HTB class 20 queue-type 'fair-queue'
set qos policy shaper MY-HTB class 30 bandwidth '10%'
set qos policy shaper MY-HTB class 30 ceiling '50%'
set qos policy shaper MY-HTB class 30 match ADDRESS30 ip source address '192.168.30.0/24'
set qos policy shaper MY-HTB class 30 priority '5'
set qos policy shaper MY-HTB class 30 queue-type 'fair-queue'
set qos policy shaper MY-HTB default bandwidth '10%'
set qos policy shaper MY-HTB default ceiling '100%'
set qos policy shaper MY-HTB default priority '7'
set qos policy shaper MY-HTB default queue-type 'fair-queue'
```

#### HFSC Shaper

Hierarchical Fair Service Curve (HFSC) is another classful egress
shaper. It supports link sharing and service curves that can express
bandwidth and delay goals. The policy bandwidth sets the root rate;
each class and the default class must define at least one `m2` rate
under `linkshare`, `realtime`, or `upperlimit`.

An `m1` rate requires both a `d` duration and an `m2` rate. An
`upperlimit` curve can only be used when the same class also has a
`linkshare` `m2` rate.

```none
set qos policy shaper-hfsc WAN bandwidth 100mbit
set qos policy shaper-hfsc WAN class 10 linkshare m2 20mbit
set qos policy shaper-hfsc WAN default linkshare m2 80mbit
set qos interface eth0 egress WAN
```

For details about HFSC service curves, see the [HFSC manual][hfsc].

(cake)=

#### CAKE

```{eval-rst}
| **Queueing discipline:** Deficit mode.
| **Applies to:** Outbound traffic.
```

Common Applications Kept Enhanced (CAKE) is a comprehensive queue management
system, implemented as a queue discipline (qdisc) for the Linux kernel. It is
designed to replace and improve upon the complex hierarchy of simple qdiscs
presently required to effectively tackle the bufferbloat problem at the network
edge.

```{cfgcmd} set qos policy cake \<text\> bandwidth \<value\>

   Set the shaper bandwidth, either as an explicit bitrate or a percentage
   of the interface bandwidth.

```

```{cfgcmd} set qos policy cake \<policy-name\> description \<text\>

Set a description for the shaper.
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation blind

Disables flow isolation, all traffic passes through a single queue.
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation dst-host

Flows are defined only by destination address.
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation dual-dst-host

Flows are defined by the 5-tuple. Fairness is applied first over destination
addresses, then over individual flows.
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation dual-src-host

Flows are defined by the 5-tuple. Fairness is applied first over source
addresses, then over individual flows.
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation flow

Flows are defined by the entire 5-tuple (source IP address, source port,
destination IP address, destination port, transport protocol).
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation host

Flows are defined by source-destination host pairs.
```

```{cfgcmd} set qos policy cake \<policy-name\> flow-isolation-nat

Perform NAT lookup before applying flow-isolation rules.
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation src-host

Flows are defined only by source address.
```

```{cfgcmd} set qos policy cake \<text\> flow-isolation triple-isolate

**(Default)** Flows are defined by the 5-tuple, fairness is applied
over source and destination addresses and also over individual flows.
```

```{cfgcmd} set qos policy cake \<policy-name\> rtt \<milliseconds\>

Defines the round-trip time used for active queue management (AQM) in
milliseconds (range: 1-1000000000; default: 100).
```

```{cfgcmd} set qos policy cake \<policy-name\> ack-filter

Enables filtering of TCP ACK packets that do not carry new information.
```

```{cfgcmd} set qos policy cake \<policy-name\> ack-filter aggressive

Enables the more aggressive TCP ACK filtering mode.
```

```{cfgcmd} set qos policy cake \<policy-name\> no-split-gso

Disables splitting of GSO super-packets into on-the-wire packets.
```

### Applying a traffic policy

Once a traffic-policy is created, you can apply it to an interface:

```none
set qos interface eth0 egress WAN-OUT
```

You can only apply one policy per interface and direction, but you could
reuse a policy on different interfaces and directions:

```none
set qos interface eth0 ingress WAN-IN
set qos interface eth0 egress WAN-OUT
set qos interface eth1 ingress LAN-IN
set qos interface eth1 egress LAN-OUT
set qos interface eth2 ingress LAN-IN
set qos interface eth2 egress LAN-OUT
set qos interface eth3 ingress TWO-WAY-POLICY
set qos interface eth3 egress TWO-WAY-POLICY
set qos interface eth4 ingress TWO-WAY-POLICY
set qos interface eth4 egress TWO-WAY-POLICY
```

(ingress-shaping)=

### The case of ingress shaping

**Applies to:**
 Inbound traffic.

For the ingress traffic of an interface, there is only one policy you
can directly apply, a **Limiter** policy. You cannot apply a shaping
policy directly to the ingress traffic of any interface because shaping
only works for outbound traffic.

This workaround lets you apply a shaping policy to the ingress traffic
by first redirecting it to an in-between virtual interface
([Intermediate Functional Block]). There, in that virtual interface,
you will be able to apply any of the policies that work for outbound
traffic, for instance, a shaping one.

That is how it is possible to do the so-called "ingress shaping".

```none
set qos policy shaper MY-INGRESS-SHAPING bandwidth 1000kbit
set qos policy shaper MY-INGRESS-SHAPING default bandwidth 1000kbit
set qos policy shaper MY-INGRESS-SHAPING default queue-type fair-queue

set qos interface ifb0 egress MY-INGRESS-SHAPING
set interfaces ethernet eth0 redirect ifb0

set interfaces input ifb0
```

:::{warning}
Do not configure IFB as the first step. First create everything else
of your traffic-policy, and then you can configure IFB.
Otherwise you might get the `RTNETLINK answer: File exists` error,
which can be solved with `sudo ip link delete ifb0`.
:::

% stop_vyoslinter
[common applications kept enhanced]: https://man7.org/linux/man-pages/man8/tc-cake.8.html
[hfsc]: https://man7.org/linux/man-pages/man8/tc-hfsc.8.html
[intermediate functional block]: https://www.linuxfoundation.org/collaborate/workgroups/networking/ifb
[tc]: https://man7.org/linux/man-pages/man8/tc.8.html
[that can give you a great deal of flexibility]: https://blog.vyos.io/using-the-policy-route-and-packet-marking-for-custom-qos-matches
[token bucket]: <https://en.wikipedia.org/wiki/Token_bucket>
% start_vyoslinter
