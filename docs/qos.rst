.. _qos:

***********************
QoS and Traffic Control
***********************

The generic name of Quality of Service or Traffic Control involves
things like shaping, scheduling, policing or dropping traffic, which are
the kind of things you may want to play with when you have, for
instance, a bandwidth bottleneck in a link and you want to somehow
prioritize some type of traffic over another.

tc_ is a powerful tool for Traffic Control found at the Linux kernel.
However, its configuration is often considered a cumbersome task.
Fortunately, VyOS eases the job through its CLI, while using ``tc`` as
backend.


How to make it work
===================

In order to have VyOS Traffic Control working you need to follow 2
steps:

 1. Create a traffic policy.

 2. Apply the traffic policy to an interface ingress or egress.
    (You can only apply one policy per interface and direction.)

But before learning to configure your policy, we will quickly warn you
about the different units you can use and also show you what *classes*
are and how they work, as some policies may require you to configure
them.
 


Units
=====

When configuring your traffic policy, you will have to set data rate
values, watch out the units you are managing, it is easy to get confused
with the different prefixes and suffixes you can use. VyOS will always
show you the different units you can use.

Prefixes
--------

They can be **decimal** prefixes.

   .. code-block:: none

	kbit  (10^3)    kilobit per second
	mbit  (10^6)    megabit per second
	gbit  (10^9)    gigabit per second
 	tbit  (10^12)   terabit per second
	
	kbps  (8*10^3)  kilobyte per second
	mbps  (8*10^6)  megabyte per second
	gbps  (8*10^9)  gigabyte per second
	tbps  (8*10^12) terabyte per second

Or **binary** prefixes.

   .. code-block:: none

	kibit (2^10 = 1024)    kibibit per second
	mibit (2^20 = 1024^2)  mebibit per second
	gibit (2^30 = 1024^3)  gibibit per second
        tbit  (2^40 = 1024^4)  tebibit per second

	kibps (1024*8)	       kibibyte (KiB) per second
	mibps (1024^2*8)       mebibyte (MiB) per second
        gibps (1024^3*8)       gibibyte (GiB) per second
        tibps (1024^4*8)       tebibyte (TiB) per second


Suffixes
--------

A *bit* is written as **bit**.
   
   .. code-block:: none

        kbit (kilobits per second)
        mbit (megabits per second)
        gbit (gigabits per second)
	tbit (terabits per second)

While a *byte* is written as a single **b**.

   .. code-block:: none

        kbps (kilobytes per second)
        mbps (megabytes per second)
        gbps (gigabytes per second)




.. _classes:

Classes
=======

In the subsection :ref:`creating_a_traffic_policy` you will see that
some of the policies use *classes*. Those policies let you distribute
traffic into different classes according to different parameters you can
choose. So, a class is just a specific type of traffic you select.

The ultimate goal of classifying traffic is to give each class a
different treatment.


Matching traffic
----------------

In order to define which traffic goes to which class, you define filters
(that is, matching criteria). Packets go through these matching rules
(as in the rules of a firewall) and, if a packet matches the filter, it
is assigned to that class.

In VyOS, a class is identified by a number you can choose when
configuring it.


.. note:: When configuring a class, some policies just need a
   meaningless number to identify that class (Class ID), but in other
   policies, like Priority Queue, the number of the class defines its
   priority.

When you define a class, you will always need to define which traffic
will be assigned to that class.

.. code-block:: none

  set traffic-policy <policy> <policy-name> class <class-ID> match <class-matching-rule-name>


In the command above, we are setting the type of policy we are going to
work with, the name we choose for it, a class (so that we can
differentiate some traffic) and an identifiable number for that class,
and then we are configuring a matching rule (or filter) and a name for
it.

A class can have multiple match filters:

.. code-block:: none

  set traffic-policy shaper MY-SHAPER class 30 match HTTP
  set traffic-policy shaper MY-SHAPER class 30 match HTTPs

A match filter can contain multiple criteria and will match traffic if
all those criteria are true.

For example:

.. code-block:: none

  set traffic-policy shaper MY-SHAPER class 30 match HTTP ip protocol tcp
  set traffic-policy shaper MY-SHAPER class 30 match HTTP ip source port 80

This will match TCP traffic with source port 80.

There are many parameters you will be able to use in order to match the
traffic you want for a class:

 - Ethernet (protocol, destination address or source address)
 - Interface name
 - IPv4 (DSCP value, maximum packet length, protocol, source address,
   destination address, source port, destination port or TCP flags)
 - IPv6 (DSCP value, maximum payload length, protocol, source address,
   destination address, source port, destination port or TCP flags)
 - Firewall mark
 - VLAN ID

When configuring your filter, you can use the ``Tab`` key to see the many
different parameters you can configure.


.. code-block:: none

   vyos@vyos# set traffic-policy shaper MY-SHAPER class 30 match MY-FIRST-FILTER 
   Possible completions:
      description  Description for this match
    > ether        Ethernet header match
      interface    Interface name for this match
    > ip           Match IP protocol header
    > ipv6         Match IPV6 header
      mark         Match on mark applied by firewall
      vif          Virtual Local Area Network (VLAN) ID for this match
 
 

You can also write a description for a filter:

.. code-block:: none

  set traffic-policy shaper MY-SHAPER class 30 match MY-FIRST-FILTER description "My filter description"



.. note:: An IPv4 TCP filter will only match packets with an IPv4 header length of
   20 bytes (which is the majority of IPv4 packets anyway).


.. note:: IPv6 TCP filters will only match IPv6 packets with no header extension, see
   https://en.wikipedia.org/wiki/IPv6_packet#Extension_headers



Class treatment
---------------


Once a class has a filter configured, you will also have to define what
you want to do with the traffic of that class, what specific
Traffic-Control treatment you want to give it. You will have different
possibilities depending on the Traffic Policy you are configuring, you
will know about them in the :ref:`creating_a_traffic_policy` subsection.

.. code-block:: none

   vyos@vyos# set traffic-policy shaper MY-SHAPER class 30 
   Possible completions:
      bandwidth    Bandwidth used for this class
      burst        Burst size for this class (default: 15kb)
      ceiling      Bandwidth limit for this class
      codel-quantum
                   fq-codel - Number of bytes used as 'deficit' (default 1514)
      description  Description for this traffic class
      flows        fq-codel - Number of flows (default 1024)
      interval     fq-codel - Interval (milliseconds) used to measure the delay (default 100)
   +> match        Class matching rule name
      priority     Priority for usage of excess bandwidth
      queue-limit  Maximum queue size (packets)
      queue-type   Queue type for this class
      set-dscp     Change the Differentiated Services (DiffServ) field in the IP header
      target       fq-codel - Acceptable minimum queue delay (milliseconds)
   



Default
-------

Often you will also have to configure what you want to do with traffic
called *default*, in the same way you do with a class. *Default* is just
any traffic which is not matching any of the classes you configured. It
is like a class without filters.



.. _creating_a_traffic_policy:


Creating a traffic policy
=========================

VyOS lets you control traffic in many different ways, here we will cover
every possibility. You can configure as many policies as you want, but
you will only be able to apply one policy per interface and direction
(inbound or outbound).

Some policies let you have different queues inside, so you will be able
to combine policies by assigning a different policy to a subqueue. 


.. hint:: If you do not know what policy you need for your outbound
   traffic, you might want to try FQ-CoDel_ for a multipurpose simple
   configuration, you might also be interested in trying Shaper_ if you
   don't need to guarantee low delay, or Shaper-HFSC_ when you need to
   guarantee a low delay transmission for some specific traffic and you
   are not afraid of setting a complex configuration.

Drop Tail
---------

| **Queueing discipline:** PFIFO (Packet First In First Out).
| **Applies to:** Outbound traffic.

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

Very likely you do not need this simple policy as you cannot get much
from it. Sometimes it is used just to enable logging.

.. cfgcmd:: set traffic-policy drop-tail <policy-name> queue-limit <number-of-packets>

   Use this command to configure a drop-tail policy (PFIFO). Choose a
   unique name for this policy and the size of the queue by setting the
   number of packets it can contain (maximum 4294967295).


Fair Queue
----------

| **Queueing discipline:** SFQ (Stochastic Fairness Queuing).
| **Applies to:** Outbound traffic.

Fair Queue is a work-conserving scheduler which schedules the
transmission of packets based on flows, trying to ensure fairness so
that each flow is able to send data in turn, preventing any single one
from drowning out the rest.

.. cfgcmd:: set traffic-policy fair-queue <policy-name>

   Use this command to create a Fair-Queue policy, which is based on the
   Stochastic Fairness Queueing and can be applied to outbound traffic.

The algorithm enqueues packets to hash buckets based on source address,
destination address and source port. Each of these buckets should
represent a unique flow. Because multiple flows may get hashed to the
same bucket, the hashing algorithm is perturbed at configurable
intervals so that the unfairness lasts only for a short while.
Perturbation may however cause some inadvertent packet reordering to
occur. An advisable value could be 10 seconds.

One of the uses of Fair Queue might be the mitigation of Denial of
Service attacks.

.. cfgcmd:: set traffic-policy fair-queue <policy-name> hash-interval <seconds>`

   Use this command to define a Fair-Queue policy, based on the
   Stochastic Fairness Queueing, and set the number of seconds at which
   a new queue algorithm perturbation will occur (maximum 4294967295).

When dequeuing, each hash-bucket with data is queried in a round robin
fashion. You can configure the length of the queue.

.. cfgcmd:: set traffic-policy fair-queue <policy-name> queue-limit <limit>

   Use this command to define a Fair-Queue policy, based on the
   Stochastic Fairness Queueing, and set the number of maximum packets
   allowed to wait in the queue. Any other packet will be dropped.

.. note:: Fair Queue is a non-shaping (work-conserving) policy, so it
   will only be useful if your outgoing interface is really full. If it
   is not, VyOS will not own the queue and Fair Queue will have no
   effect. If there is bandwidth available on the physical link, you can
   embed_ Fair Queue into a classful shaping policy to make sure it owns
   the queue.



.. _FQ-QoDel

FQ-CoDel
--------

| **Queueing discipline** Fair/Flow Queue CoDel
| **Applies to:** Outbound Traffic

The FQ-CoDel policy fights bufferbloat and reduces latency without the
need of complex configurations. It has become the new default Queueing
Discipline for the interfaces of some GNU/Linux distributions.

FQ-Codel uses a stochastic model to classify incoming packets into
different flows and is used to provide a fair share of the bandwidth to
all the flows using the queue. Each such flow is managed by the CoDel
queuing  discipline. Reordering within a flow is avoided since Codel
internally uses a FIFO queue.

FQ-Codel is based on a modified Deficit Round Robin (DRR) queue
scheduler with the CoDel Active Queue Management (AQM) algorithm
operating on each queue.

VyOS let you customize FQ-CoDel parameters, but very likely it will work
ok with its default values.


.. note:: FQ-Codel is a non-shaping (work-conserving) policy, so it
   will only be useful if your outgoing interface is really full. If it
   is not, VyOS will not own the queue and FQ-Codel will have no
   effect. If there is bandwidth available on the physical link, you can
   embed_ FQ-Codel into a classful shaping policy to make sure it owns
   the queue.



Limiter
-------

| **Queueing discipline:** Ingress policer.
| **Applies to:** Inbound traffic.

Limiter is one of those policies that uses classes_. (Ingress qdisc is
actually classless but filters do work with it.)

The limiter performs basic ingress policing of traffic flows. Multiple
classes of traffic can be defined and traffic limits can be applied to
each class. Although the policer uses a token bucket mechanism
internally, it does not have the capability to delay a packet as a
shaping mechanism does. Traffic exceeding the defined bandwidth limits
is directly dropped. A maximum allowed burst can be configured too.

You can configure classes (up to 4090) with different settings and a
default policy which will be applied to any traffic not matching any of
the configured classes.


.. note:: In the case you want to apply some kind of **shaping** to your
  **inbound** traffic, check the ingress-shaping_ section.


.. cfgcmd:: set traffic-policy limiter <policy-name> class <class ID> match <match-name> description <description>

   Use this command to configure an Ingress Policer, defining its name,
   a class identifier (1-4090), a class matching rule name and its
   description.


Once the matching rules are set for a class, you can start configuring
how you want matching traffic to behave.


.. cfgcmd:: set traffic-policy limiter <policy-name> class <class-ID> bandwidth <rate>

   Use this command to configure an Ingress Policer, defining its name,
   a class identifier (1-4090) and the maximum allowed bandwidth for
   this class.


.. cfgcmd:: set traffic-policy limiter <policy-name> class <class-ID> burst <burst-size>

   Use this command to configure an Ingress Policer, defining its name,
   a class identifier (1-4090) and the burst size in bytes for this
   class (default: 15).


.. cfgcmd:: set traffic-policy limiter <policy-name> default bandwidth <rate>

   Use this command to configure an Ingress Policer, defining its name
   and the maximum allowed bandwidth for its default policy.


.. cfgcmd:: set traffic-policy limiter <policy-name> default burst <burst-size>

   Use this command to configure an Ingress Policer, defining its name
   and the burst size in bytes (default: 15) for its default policy.


.. cfgcmd:: set traffic-policy limiter <policy-name> class <class ID> priority <value>

   Use this command to configure an Ingress Policer, defining its name,
   a class identifier (1-4090), and the priority (0-20, default 20) in
   which the rule is evaluated (the lower the number, the higher the
   priority).

 

Network emulator
----------------

| **Queueing discipline:** netem (Network Emulator) + TBF (Token Bucket Filter)
| **Applies to:** Outbound traffic.

VyOS Network Emulator policy emulates the conditions you can suffer in a
real network. You will be able to configure things like rate, burst,
delay, packet loss, packet corruption or packet reordering.

This could be helpful if you want to test how an application behaves
under certain network conditions.


.. cfgcmd:: set traffic-policy network-emulator <policy-name> bandwidth <rate>
   
   Use this command to configure the maximum rate at which traffic will
   be shaped in a Network Emulator policy. Define the name of the policy
   and the rate.

.. cfgcmd:: set traffic-policy network-emulator <policy-name> burst <burst-size>
   
   Use this command to configure the burst size of the traffic in a
   Network Emulator policy. Define the name of the Network Emulator
   policy and its traffic burst size. It will only take effect if you
   have configured its bandwidth too.

.. cfgcmd:: set traffic-policy network-emulator <policy-name> network-delay <delay>
   
   Use this command to configure a Network Emulator policy defining its
   name and the fixed amount of time you want to add to all packet going
   out of the interface. You can use secs, ms and us. Default: ms.

.. cfgcmd:: set traffic-policy network-emulator <policy-name> packet-corruption
  <percent>`
   
   Use this command to emulate noise in a Network Emulator policy. Set
   the policy name and the percentage of corrupted packets you want. A
   random error will be introduced in a random position for the chosen
   percent of packets.

.. cfgcmd:: set traffic-policy network-emulator <policy-name> packet-loss
  <percent>`
   
   Use this command to emulate packet-loss conditions in a Network
   Emulator policy. Set the policy name and the percentage of loss
   packets your traffic will suffer.

.. cfgcmd:: set traffic-policy network-emulator <policy-name> packet-reordering
  <percent>`
   
   Use this command to emulate packet-reordering conditions in a Network
   Emulator policy. Set the policy name and the percentage of reordered
   packets your traffic will suffer.

.. cfgcmd:: set traffic-policy network-emulator <policy-name> queue-limit <limit>
   
   Use this command to define the length of the queue of your Network
   Emulator policy. Set the policy name and the maximum number of
   packets (1-4294967295) the queue may hold queued at a time.



Priority queue
--------------

| **Queueing discipline:** PRIO 
| **Applies to:** Outbound traffic


The Priority Queue is a classful scheduling policy. It does not delay
packets, it simply dequeues packets according to their priority.

.. note:: Priority Queue, as other non-shaping policies, is only useful
   if your outgoing interface is really full. If it is not, VyOS will
   not own the queue and Priority Queue will have no effect. If there is
   bandwidth available on the physical link, you can embed Priority
   Queue into a classful shaping policy to make sure it owns the queue.
   In that case packets can be prioritized based on DSCP.

Up to seven queues -defined as classes_ with different priorities- can
be configured. Packets are placed into queues based on associated match
criteria. Packets are transmitted from the queues in priority order. If
classes with a higher priority are being filled with packets
continuously, packets from lower priority classes will only be
transmitted after traffic volume from higher priority classes decreases.


.. note:: In Priority Queue we do not define clases with a class ID
   number but with a class priority number (1-7). The lower the number,
   the higher the priority.


As with other policies, you can define different type of matching rules
for your classes:

.. code-block:: none

   vyos@vyos# set traffic-policy priority-queue MY-PRIO class 3 match MY-MATCH-RULE 
   Possible completions:
      description  Description for this match
    > ether        Ethernet header match
      interface    Interface name for this match
    > ip           Match IP protocol header
    > ipv6         Match IPV6 header
      mark         Match on mark applied by firewall
      vif          Virtual Local Area Network (VLAN) ID for this match


.. cfgcmd:: set traffic-policy priority-queue <policy name> class
   <class-priority-number> codel-quantum <bytes>

   Use this command to configure a Priority Queue, set its name, set a
   class with a priority from 1 to 7 and set the maximum number of bytes
   (default: 1514) to be dequeued from a queue at once when using an
   fq-codel queue.


.. cfgcmd:: set traffic-policy priority-queue <policy name> class
   <class-priority-number> flows <number-of-flows>

   Use this command to configure a Priority Queue, set its name, set a
   class with a priority from 1 to 7 and set the number of sub-queues
   (default: 1024) into which packets are classified when using an
   fq-codel queue.

.. cfgcmd:: set traffic-policy priority-queue <policy name> class
   <class-priority-number> interval <miliseconds>

   Use this command to configure a Priority Queue, set its name, set a
   class with a priority from 1 to 7 and set the time period used by the
   control loop of CoDel to detect when a persistent queue is
   developing. It can be used when an fq-codel queue is configured.

.. cfgcmd:: set traffic-policy priority-queue <policy-name> class
   <class-ID>  queue-limit <limit>`

   Use this command to configure a Priority Queue, set its name, set a
   class with a priority from 1 to 7 and set the xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

* Specify a queue type for a traffic class, available queue types:

 * drop-tail
 * fair-queue
 * random-detect

  :code:`set traffic-policy priority-queue <policy name> class <class ID>
  queue-type <type>`

Default class
"""""""""""""

* Define a default priority queue:

  :code:`set traffic-policy priority-queue <policy name> default`

* Define a maximum queue length for the default traffic class in packets:

  :code:`set traffic-policy priority-queue <policy name> default queue-limit
  <limit>`

* Specify the queuing type for the default traffic class, available queue types:

 * drop-tail
 * fair-queue
 * random-detect

  :code:`set traffic-policy priority-queue <policy name> default queue-type <type>`

Matching rules
""""""""""""""

* Define a class matching rule:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name>`

* Add a match rule description:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> description <description>`

* Specify a match criterion based on a **destination MAC address**
  (format: xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ether destination <MAC address>`

* Specify a match criterion based on a **source MAC address**
  (format: xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ether source <MAC address>`

* Specify a match criterion based on **packet type/protocol**, range 0...65535:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ether protocol <number>`

* Specify a match criterion based on **ingress interface**:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> interface <interface>`

* Specify a match criterion based on the **fwmark field**, range 0....4294967295:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> mark <fwmark>`

* Specify a match criterion based on **VLAN ID**, range 1...4096:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> vif <VLAN ID>`

**IPv4**

* Specify a match criterion based on **destination IPv4 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ip destination <IPv4 address|port>`

* Specify a match criterion based on **source IPv4 address and/or port**, port
  may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ip source <IPv4 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code Point)
  value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ip dscp <DSCP value>`

* Specify a match criterion based on **IPv4 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ip protocol <proto>`

**IPv6**

* Specify a match criterion based on **destination IPv6 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ipv6 destination <IPv6 address|port>`

* Specify a match criterion based on **source IPv6 address and/or port**, port
  may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ipv6 source <IPv6 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code Point)
  value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ipv6 dscp <DSCP value>`

* Specify a match criterion based on **IPv6 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy priority-queue <policy name> class <class ID> match
  <match name> ipv6 protocol <proto>`


Random Early Detection (RED/WRED)
---------------------------------

RED
^^^

| **Queueing discipline:**
| **Applies to:**

A Random Early Detection (RED) policy starts randomly dropping packets from a
queue before it reaches its queue limit thus avoiding congestion. It is also
beneficial for TCP connections as the gradual dropping of packets acts as a
signal for the sender to decrease its transmission rate, avoiding global TCP
synchronisation. Applicable to outbound traffic only.

Available commands:

* Define a RED policy:

  :code:`set traffic-policy random-detect <policy name>`

* Add a description:

  :code:`set traffic-policy random-detect <policy name> description <description>`

* Set a bandwidth limit, default auto:

  :code:`set traffic-policy random-detect <policy name> bandwidth <rate>`

  Available suffixes:</u>

 * auto (bandwidth limit based on interface speed, default)
 * kbit (kilobits per second)
 * mbit (megabits per second)
 * gbit (gigabits per second)
 * kbps (kilobytes per second)
 * mbps (megabytes per second)
 * gbps (gigabytes per second)


WRED
^^^^

| **Queueing discipline:**
| **Applies to:**

In contrast to RED, Weighted Random Early Detection (WRED) differentiates
between classes of traffic in a single queue and assigns different precedence
to traffic flows accordingly; low priority packets are dropped from a queue
earlier than high priority packets. This is achieved by using the first three
bits of the ToS (Type of Service) field to categorise data streams and in
accordance with the defined precedence parameters a decision is made. A WRED
policy is defined with the following parameters:

* precedence
* min-threshold
* max-threshold
* average-packet
* mark-probability
* queue-limit

If the average queue size is lower than the :code:`min-threshold`, an arriving
packet is placed in the queue. If the average queue size is between
:code:`min-threshold` and :code:`max-threshold` an arriving packet is either
dropped or placed in the queue depending on the defined :code:`mark-probability`.
In case the average queue size is larger than :code:`max-threshold`, packets
are dropped. If the current queue size is larger than :code:`queue-limit`,
packets are dropped. The average queue size depends on its former average size
and its current size. If :code:`max-threshold` is set but :code:`min-threshold`
is not, then :code:`min-threshold` is scaled to 50% of :code:`max-threshold`.
In principle, values must be :code:`min-threshold` < :code:`max-threshold` <
:code:`queue-limit`. Applicable to outbound traffic only.

Possible values for WRED parameters:

* precedence - IP precedence, first three bits of the ToS field as defined in
  :rfc:`791`.

 +------------+----------------------+
 | Precedence |      Priority        |
 +============+======================+
 |      7     | Network Control      |
 +------------+----------------------+
 |      6     | Internetwork Control |
 +------------+----------------------+
 |      5     | CRITIC/ECP           |
 +------------+----------------------+
 |      4     | Flash Override       |
 +------------+----------------------+
 |      3     | Flash                |
 +------------+----------------------+
 |      2     | Immediate            |
 +------------+----------------------+
 |      1     | Priority             |
 +------------+----------------------+
 |      0     | Routine              |
 +------------+----------------------+

* min-threshold - Min value for the average queue length, packets are dropped
  if the average queue length reaches this threshold. Range 0...4096, default
  is dependent on precedence:

 +------------+-----------------------+
 | Precedence | default min-threshold |
 +============+=======================+
 |      7     |         16            |
 +------------+-----------------------+
 |      6     |         15            |
 +------------+-----------------------+
 |      5     |         14            |
 +------------+-----------------------+
 |      4     |         13            |
 +------------+-----------------------+
 |      3     |         12            |
 +------------+-----------------------+
 |      2     |         11            |
 +------------+-----------------------+
 |      1     |         10            |
 +------------+-----------------------+
 |      0     |          9            |
 +------------+-----------------------+

* max-threshold - Max value for the average queue length, packets are dropped
  if this value is exceeded. Range 0...4096 packets, default 18.

* average-packet - Average packet size in bytes, default 1024.

* mark-probability - The fraction of packets (n/probability) dropped from the
  queue when the average queue length reaches <code>max-threshold</code>,
  default 10.

* queue-limit - Packets are dropped when the current queue length reaches this
  value, default 4*<code>max-threshold</code>.

Usage:

:code:`set traffic-policy random-detect <policy-name> precedence
<precedence> [average-packet <bytes> | mark-probability <probability> |
max-threshold <max> | min-threshold <min> | queue-limit <packets>]`

Rate control (TBF)
------------------

| **Queueing discipline:**
| **Applies to:**

The rate control policy uses the Token Bucket Filter (TBF_) algorithm to limit
the packet flow to a set rate. Short bursts can be allowed to exceed the limit.
Applicable to outbound traffic only.

Available commands:

* Define a rate control policy:

  :code:`set traffic-policy rate-control <policy-name>`

* Add a description:

  :code:`set traffic-policy rate-control <policy-name> description <description>`

* Specify a bandwidth limit in kbits/s:

  :code:`set traffic-policy rate-control <policy-name> bandwidth <rate>`

  Available suffixes:</u>

 * kbit (kilobits per second, default)
 * mbit (megabits per second)
 * gbit (gigabits per second)
 * kbps (kilobytes per second)
 * mbps (megabytes per second)
 * gbps (gigabytes per second)

* Specify a burst size in bytes, default 15 kilobytes:

  :code:`set traffic-policy rate-control <policy-name> burst <burst-size>`

  Available suffixes:

 * kb (kilobytes)
 * mb (megabytes)
 * gb (gigabytes)

* Specify a latency in milliseconds; the maximum amount of time packets are
  allowed to wait in the queue, default 50 milliseconds:

  :code:`set traffic-policy rate-control <policy-name> latency`

  Available suffixes:

 * secs (seconds)
 * ms (milliseconds, default)
 * us (microseconds)

Round robin (DRR)
-----------------

| **Queueing discipline:**
| **Applies to:**

The round robin policy divides available bandwidth between all defined traffic
classes.

Available commands:

* Define a round robin policy:

  :code:`set traffic-policy round-robin <policy-name>`

* Add a description:

  :code:`set traffic-policy round-robin <policy-name> description <description>`

* Define a traffic class ID, range 2...4095:

  :code:`set traffic-policy round-robin <policy-name> class <class>`

**Default policy:**

* Define a default priority queue:

  :code:`set traffic-policy round-robin <policy name> default`

* Set the number of packets that can be sent per scheduling quantum:

  :code:`set traffic-policy round-robin <policy name> default quantum <packets>`

* Define a maximum queue length for the default policy in packets:

  :code:`set traffic-policy round-robin <policy name> default queue-limit <limit>`

* Specify the queuing type for the default policy, available queue types:

 * drop-tail
 * fair-queue
 * priority (based on the DSCP values in the ToS byte)

  :code:`set traffic-policy round-robin <policy name> default queue-type <type>`

Matching rules
""""""""""""""

* Define a class matching rule:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name>`

* Add a match rule description:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> description <description>`

* Specify a match criterion based on a **destination MAC address** (format:
  xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ether destination <MAC address>`

* Specify a match criterion based on a **source MAC address** (format:
  xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ether source <MAC address>`

* Specify a match criterion based on **packet type/protocol**, range 0...65535:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ether protocol <number>`

* Specify a match criterion based on **ingress interface**:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> interface <interface>`

* Specify a match criterion based on the **fwmark field**, range 0....4294967295:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> mark <fwmark>`

* Specify a match criterion based on **VLAN ID**, range 1...4096:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> vif <VLAN ID>*`

**IPv4**

* Specify a match criterion based on **destination IPv4 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ip destination <IPv4 address|port>`

* Specify a match criterion based on **source IPv4 address and/or port**, port
  may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ip source <IPv4 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code Point)
  value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ip dscp <DSCP value>`

* Specify a match criterion based on **IPv4 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ip protocol <proto>`

**IPv6**

* Specify a match criterion based on **destination IPv6 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ipv6 destination <IPv6 address|port>`

* Specify a match criterion based on **source IPv6 address and/or port**, port
  may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ipv6 source <IPv6 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code Point)
  value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ipv6 dscp <DSCP value>`

* Specify a match criterion based on **IPv6 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> ipv6 protocol <proto>`


.. _Shaper:

Traffic shaper
--------------

| **Queueing discipline:**
| **Applies to:**



DEFAULT PRIORITY: 0
DEFAULT CEILING: SAME AS BANDWIDTH (so no borrowing)



VyOS shaper uses the Hierarchical Token Bucket algorithm to optimally
allocate different amounts of bandwidth to different traffic classes
while being able to define guaranteed bandwidth and shared bandwidth for
different conditions.

Available commands:

* Define a shaper policy:

  :code:`set traffic-policy shaper <policy-name>`

* Add a description:

  :code:`set traffic-policy shaper <policy-name> description <description>`

* Set the available bandwidth for all combined traffic of this policy in kbit/s,
  default 100%:

  :code:`set traffic-policy shaper <policy-name> bandwidth <rate>`

  Available suffixes:

 * %    (percentage of total bandwidth)
 * kbit (kilobits per second)
 * mbit (megabits per second)
 * gbit (gigabits per second)
 * kbps (kilobytes per second)
 * mbps (megabytes per second)
 * gbps (gigabytes per second)

Traffic classes
"""""""""""""""

* Define a traffic class for a shaper policy, range for class ID is 2...4095:

  :code:`set traffic-policy shaper <policy-name> class <class ID>`

* Add a class description:

  :code:`set traffic-policy shaper <policy name> class <class ID> description
  <description>`

* Specify a bandwidth limit for a class, in kbit/s:

  :code:`set traffic-policy shaper <policy-name> class <class ID> bandwidth <rate>`

  Available suffixes:

 * kbit (kilobits per second, default)
 * mbit (megabits per second)
 * gbit (gigabits per second)
 * kbps (kilobytes per second)
 * mbps (megabytes per second)
 * gbps (gigabytes per second)

* Set a burst size for a class, the maximum amount of traffic that can be sent,
  in bytes:

  :code:`set traffic-policy shaper <policy-name> class <class ID>
  burst <burst-size>`

  Available suffixes:

 * kb (kilobytes)
 * mb (megabytes)
 * gb (gigabytes)

* Set a bandwidth ceiling for a class in kbit/s:

  :code:`set traffic-policy shaper <policy-name> class <class ID> ceiling <rate>`

  Available suffixes:

 * %    (percentage of total bandwidth)
 * kbit (kilobits per second)
 * mbit (megabits per second)
 * gbit (gigabits per second)

* Set the priority of a class for allocation of additional bandwidth, if unused
  bandwidth is available. You can set any number from 0 to 7. The lower
  the number, the higher the priority. If no value is set for a classs,
  it will be internally configured as 0, the highest priority.

  :code:`set traffic-policy shaper <policy-name> class <class ID>
  priority <priority>`

* Set a queue length limit in packets:

  :code:`set traffic-policy shaper <policy name> class <class ID> queue-limit
  <limit>`

* Specify a queue type for a traffic class, default fair-queue. Available
  queue types:

 * drop-tail
 * fair-queue
 * random-detect
 * priority

  :code:`set traffic-policy shaper <policy name> class <class ID> queue-type <type>`

* Modify DSCP field; the DSCP field value of packets in a class can be
  rewritten to change the forwarding behaviour and allow for traffic
  conditioning:

  :code:`set traffic-policy shaper <policy name> class <class ID> set-dscp <value>`

  DSCP values as per :rfc:`2474` and :rfc:`4595`:

  +---------+------------+--------+------------------------------+
  | Binary  | Configured |  Drop  | Description                  |
  | value   | value      |  rate  |                              |
  +=========+============+========+==============================+
  | 101110  |     46     |   -    | Expedited forwarding (EF)    |
  +---------+------------+--------+------------------------------+
  | 000000  |     0      |   -    | Best effort traffic, default |
  +---------+------------+--------+------------------------------+
  | 001010  |     10     | Low    | Assured Forwarding(AF) 11    |
  +---------+------------+--------+------------------------------+
  | 001100  |     12     | Medium | Assured Forwarding(AF) 12    |
  +---------+------------+--------+------------------------------+
  | 001110  |     14     | High   | Assured Forwarding(AF) 13    |
  +---------+------------+--------+------------------------------+
  | 010010  |     18     | Low    | Assured Forwarding(AF) 21    |
  +---------+------------+--------+------------------------------+
  | 010100  |     20     | Medium | Assured Forwarding(AF) 22    |
  +---------+------------+--------+------------------------------+
  | 010110  |     22     | High   | Assured Forwarding(AF) 23    |
  +---------+------------+--------+------------------------------+
  | 011010  |     26     | Low    | Assured Forwarding(AF) 31    |
  +---------+------------+--------+------------------------------+
  | 011100  |     28     | Medium | Assured Forwarding(AF) 32    |
  +---------+------------+--------+------------------------------+
  | 011110  |     30     | High   | Assured Forwarding(AF) 33    |
  +---------+------------+--------+------------------------------+
  | 100010  |     34     | Low    | Assured Forwarding(AF) 41    |
  +---------+------------+--------+------------------------------+
  | 100100  |     36     | Medium | Assured Forwarding(AF) 42    |
  +---------+------------+--------+------------------------------+
  | 100110  |     38     | High   | Assured Forwarding(AF) 43    |
  +---------+------------+--------+------------------------------+

Matching rules
""""""""""""""

* Define a class matching rule:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name>`

* Add a match rule description:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> description <description>`

* Specify a match criterion based on a **destination MAC address**
  (format: xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ether destination <MAC address>`

* Specify a match criterion based on a **source MAC address**
  (format: xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ether source <MAC address>`

* Specify a match criterion based on **packet type/protocol**, range 0...65535:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ether protocol <number>`

* Specify a match criterion based on **ingress interface**:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> interface <interface>`

* Specify a match criterion based on the **fwmark field**, range 0....4294967295:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> mark <fwmark>`

* Specify a match criterion based on **VLAN ID**, range 1...4096:

  :code:`set traffic-policy round-robin <policy name> class <class ID> match
  <match name> vif <VLAN ID>`

**IPv4**

* Specify a match criterion based on **destination IPv4 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ip destination <IPv4 address|port>`

* Specify a match criterion based on **source IPv4 address and/or port**, port
  may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ip source <IPv4 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code Point)
  value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ip dscp <DSCP value>`

* Specify a match criterion based on **IPv4 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ip protocol <proto>`

**IPv6**

* Specify a match criterion based on **destination IPv6 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ipv6 destination <IPv6 address|port>`

* Specify a match criterion based on **source IPv6 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ipv6 source <IPv6 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code Point)
  value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ipv6 dscp <DSCP value>`

* Specify a match criterion based on **IPv6 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy shaper <policy name> class <class ID> match
  <match name> ipv6 protocol <proto>`


.. _Shaper-HFSC

shaper-hfsc (HFSC_ + sfq)
-------------------------

| **Queueing discipline:**
| **Applies to:**

TBD



.. _embed

Embedding a policy into a another one
=====================================

You can embed a non-shaping policy into a classful shaping policy, as in
the example below:

.. code-block:: none

   set traffic-policy shaper SHAPER_FOR_FAIR-QUEUE bandwidth '50mbit'
   set traffic-policy shaper SHAPER_FOR_FAIR-QUEUE default bandwidth '50mbit'
   set traffic-policy shaper SHAPER_FOR_FAIR-QUEUE default queue-type 'fair-queue'





Applying a traffic policy
=========================

Once a traffic-policy is created, you can apply it to an interface:

.. code-block:: none

  set interfaces etherhet eth0 traffic-policy out WAN-OUT



You can have serveral policies running at the same time:

.. code-block:: none

  set interfaces ethernet eth0 traffic-policy in WAN-IN
  set interfaces etherhet eth0 traffic-policy out WAN-OUT
  set interfaces ethernet eth1 traffic-policy out LAN-OUT




.. _ingress-shaping:

The case of ingress shaping
===========================

| **Queueing discipline:**
| **Applies to:**

Only a **limiter** policy can be applied directly
for ingress traffic on an interface. It is possible though to use what is
called an Intermediate Functional Block (IFB_) to allow the usage of any policy
on the ingress traffic.

Let's assume eth0 is your WAN link. You created two traffic-policies: `WAN-IN`
and `WAN-OUT`.

Steps to do:

* First, create the IFB:

  :code:`set interfaces input ifb0 description "WAN Input"`

* Apply the `WAN-IN` traffic-policy to ifb0 input.

  :code:`set interfaces input ifb0 traffic-policy out WAN-IN`

* Redirect traffic from eth0 to ifb0

  :code:`set interfaces ethernet eth0 redirect ifb0`





A Real-World Example
====================

This policy sets download and upload bandwidth maximums (roughly 90% of the speeds possible), then divvies
up the traffic into buckets of importance, giving guaranteed bandwidth chunks to types of
traffic that are necessary for general interactive internet use, like web browsing, streaming, or gaming.

After identifying and prioritizing that traffic, it drops the remaining traffic into a general-priority
bucket, which it gives a lower priority than what is required for real-time use. If there is no real-time
traffic that needs the bandwidth, the lower-priority traffic can use most of the connection. This ensures
that the connection can be used fully by whatever wants it, without suffocating real-time traffic or
throttling background traffic too much.

.. code-block:: none

  set traffic-policy shaper download bandwidth '175mbit'
  set traffic-policy shaper download class 10 bandwidth '10%'
  set traffic-policy shaper download class 10 burst '15k'
  set traffic-policy shaper download class 10 ceiling '100%'
  set traffic-policy shaper download class 10 match dns ip source port '53'
  set traffic-policy shaper download class 10 match icmp ip protocol 'icmp'
  set traffic-policy shaper download class 10 match ssh ip source port '22'
  set traffic-policy shaper download class 10 priority '5'
  set traffic-policy shaper download class 10 queue-type 'fair-queue'
  set traffic-policy shaper download class 20 bandwidth '10%'
  set traffic-policy shaper download class 20 burst '15k'
  set traffic-policy shaper download class 20 ceiling '100%'
  set traffic-policy shaper download class 20 match http ip source port '80'
  set traffic-policy shaper download class 20 match https ip source port '443'
  set traffic-policy shaper download class 20 priority '4'
  set traffic-policy shaper download class 20 queue-type 'fair-queue'
  set traffic-policy shaper download default bandwidth '70%'
  set traffic-policy shaper download default burst '15k'
  set traffic-policy shaper download default ceiling '100%'
  set traffic-policy shaper download default priority '3'
  set traffic-policy shaper download default queue-type 'fair-queue'
  set traffic-policy shaper upload bandwidth '18mbit'
  set traffic-policy shaper upload class 2 bandwidth '10%'
  set traffic-policy shaper upload class 2 burst '15k'
  set traffic-policy shaper upload class 2 ceiling '100%'
  set traffic-policy shaper upload class 2 match ack ip tcp ack
  set traffic-policy shaper upload class 2 match dns ip destination port '53'
  set traffic-policy shaper upload class 2 match icmp ip protocol 'icmp'
  set traffic-policy shaper upload class 2 match ssh ip destination port '22'
  set traffic-policy shaper upload class 2 match syn ip tcp syn
  set traffic-policy shaper upload class 2 priority '5'
  set traffic-policy shaper upload class 2 queue-limit '16'
  set traffic-policy shaper upload class 2 queue-type 'fair-queue'
  set traffic-policy shaper upload class 5 bandwidth '10%'
  set traffic-policy shaper upload class 5 burst '15k'
  set traffic-policy shaper upload class 5 ceiling '100%'
  set traffic-policy shaper upload class 5 match http ip destination port '80'
  set traffic-policy shaper upload class 5 match https ip destination port '443'
  set traffic-policy shaper upload class 5 priority '4'
  set traffic-policy shaper upload class 5 queue-type 'fair-queue'
  set traffic-policy shaper upload default bandwidth '60%'
  set traffic-policy shaper upload default burst '15k'
  set traffic-policy shaper upload default ceiling '100%'
  set traffic-policy shaper upload default priority '3'
  set traffic-policy shaper upload default queue-type 'fair-queue'







.. _tc: https://en.wikipedia.org/wiki/Tc_(Linux)
.. _TBF: https://en.wikipedia.org/wiki/Token_bucket
.. _HFSC: https://en.wikipedia.org/wiki/Hierarchical_fair-service_curve
.. _IFB: https://www.linuxfoundation.org/collaborate/workgroups/networking/ifb
