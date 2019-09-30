.. _qos:

QoS and Traffic Policy
======================

VyOS uses tc_ as backend for QoS. VyOS provides its users with configuration
nodes for the following shaping/queueing/policing disciplines:

* HTB
* HFSC
* SFQ
* pfifo
* network-emulator
* PRIO
* GRED
* TBF
* DRR

Configuration nodes
-------------------

VyOS QoS configuration is done in two steps. The first one consists in setting
up your classes/queues and traffic filters to distribute traffic amongst them.
The second step is to apply such traffic policy to an interface ingress or
egress.

Creating a traffic policy
^^^^^^^^^^^^^^^^^^^^^^^^^

Such configuration takes place under the `traffic-policy` tree.

Available subtrees :

.. code-block:: sh

  set traffic-policy drop-tail NAME
  set traffic-policy fair-queue NAME
  set traffic-policy limiter NAME
  set traffic-policy network-emulator NAME
  set traffic-policy priority-queue NAME
  set traffic-policy random-detect NAME
  set traffic-policy rate-control NAME
  set traffic-policy round-robin NAME
  set traffic-policy shaper NAME
  set traffic-policy shaper-hfsc NAME

Apply traffic policy to an interface
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Once a traffic-policy is created, you can apply it to an interface :

.. code-block:: sh

  set interfaces ethernet eth0 traffic-policy in WAN-IN
  set interfaces etherhet eth0 traffic-policy out WAN-OUT
  
A Real-World Example
^^^^^^^^^^^^^^^^^^^^

This policy sets download and upload bandwidth maximums (roughly 90% of the speeds possible), then divvies
up the traffic into buckets of importance, giving guaranteed bandwidth chunks to types of 
traffic that are necessary for general interactive internet use, like web browsing, streaming, or gaming.

After identifying and prioritizing that traffic, it drops the remaining traffic into a general-priority
bucket, which it gives a lower priority than what is required for real-time use. If there is no real-time
traffic that needs the bandwidth, the lower-priority traffic can use most of the connection. This ensures
that the connection can be used fully by whatever wants it, without suffocating real-time traffic or 
throttling background traffic too much.

.. code-block:: sh

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


Traffic policies in VyOS
------------------------
An overview of QoS traffic policies supported by VyOS.

Drop-tail (FIFO)
^^^^^^^^^^^^^^^^

A packet queuing mechanism on a FIFO (First In, First Out) basis; packets are
sent out in the same order as they arrive. The queue has a defined length,
packets arriving after the queue is filled up will be dropped (hence the name
`drop tail`, the "tail" of the queue will be dropped). With this policy in
place, all traffic is treated equally and put into a single queue. Applicable
to outbound traffic only.

Available commands:

* Define a drop-tail policy (unique name, exclusive to this policy):

  :code:`set traffic-policy drop-tail <policy name>`

* Add a description:

  :code:`set traffic-policy drop-tail <policy name> description <description>`

* Set the queue length limit (max. number of packets in queue), range
  0...4294967295 packets:

  :code:`set traffic-policy drop-tail <policy name> queue-limit <limit>`

Fair queue (SFQ)
^^^^^^^^^^^^^^^^

Fair queue is a packet queuing mechanism that separates traffic flows based on
their source/destination IP addresses and/or source port and places them into
buckets. Bandwidth is allocated fairly between buckets based on the Stochastic
airness Queuing algorithm. Applicable to outbound traffic only.

Available commands:

* Define a fair queue policy:

  :code:`set traffic-policy fair-queue <policy name>`

* Add a description:

  :code:`set traffic-policy fair-queue <policy name> description <description>`

* Set hash update interval; the algorithm used is stochastic and thus not
  'truly' fair, hash collisions can occur, in which case traffic flows may be
  put into the same bucket. To mitigate this, the hashes can be updated at a
  set interval, Range 0...4294967295 seconds:

  :code:`set traffic-policy fair-queue <policy name> hash-interval <seconds>`

* Set the queue-limit (max. number of packets in queue), range 0...4294967295
  packets, default 127:

  :code:`set traffic-policy fair-queue <policy name> queue-limit <limit>`

Limiter
^^^^^^^

The limiter performs ingress policing of traffic flows. Multiple classes of
traffic can be defined and traffic limits can be applied to each class. Traffic
exceeding the defined bandwidth limits is dropped. Applicable to inbound
traffic only.

Available commands:

* Define a traffic limiter policy:
  :code:`set traffic-policy limiter <policy-name>`
* Add a description:
  :code:`set traffic-policy limiter <policy-name> description <description>`

Traffic classes
***************

* Define a traffic class for a limiter policy, range for class ID is 1...4095:

  :code:`set traffic-policy limiter <policy-name> class <class ID>`

* Add a class description:

  :code:`set traffic-policy limiter <policy-name> class <class ID> description
  <description>`

* Specify a bandwidth limit for a class, in kbit/s:

  :code:`set traffic-policy limiter <policy-name> class <class ID> bandwidth
  <rate>`.

  Available suffixes:

 * kbit (kilobits per second, default)
 * mbit (megabits per second)
 * gbit (gigabits per second)
 * kbps (kilobytes per second)
 * mbps (megabytes per second)
 * gbps (gigabytes per second)

* Set a burst size for a class, the maximum amount of traffic that can be sent,
  in bytes:

  :code:`set traffic-policy limiter <policy-name> class <class ID>
  burst <burst-size>`.

  Available suffixes:

 * kb (kilobytes)
 * mb (megabytes)
 * gb (gigabytes)

Default class
#############

* Define a default class for a limiter policy that applies to traffic not
  matching any other classes for this policy:

  :code:`set traffic-policy limiter <policy name> default`

* Specify a bandwidth limit for the default class, in kbit/s:

  :code:`set traffic-policy limiter <policy name> default bandwidth <rate>`.

  Available suffixes:

 * kbit (kilobits per second, default)
 * mbit (megabits per second)
 * gbit (gigabits per second)
 * kbps (kilobytes per second)
 * mbps (megabytes per second)
 * gbps (gigabytes per second)

* Set a burst size for the default class, the maximum amount of traffic that
  can be sent, in bytes:

  :code:`set traffic-policy limiter <policy-name> default burst <burst-size>`.

  Available suffixes:

 * kb (kilobytes)
 * mb (megabytes)
 * gb (gigabytes)

* Specify the priority of the default class to set the order in which the rules
  are evaluated, the higher the number the lower the priority, range 0...20
  (default 20):

  :code:`set traffic-policy limiter <policy name> default priority <priority>`

Matching rules
**************

* Define a traffic class matching rule:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name>`

* Add a description:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> description <description>`

* Specify the priority of a matching rule to set the order in which the rules
  are evaluated, the higher the number the lower the priority, range 0...20
  (default 20):

  :code:`set traffic-policy limiter <policy name> class <class ID>
  priority <priority>`

* Specify a match criterion based on a **destination MAC address**
  (format: xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ether destination <MAC address>`

* Specify a match criterion based on a **source MAC address** (format:
  xx:xx:xx:xx:xx:xx):

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ether source <MAC address>`

* Specify a match criterion based on **packet type/protocol**, range 0...65535:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ether protocol <number>`

* Specify a match criterion based on the **fwmark field**, range 0....4294967295:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> mark <fwmark>`

* Specify a match criterion based on **VLAN ID**, range 1...4096:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> vif <VLAN ID>`

**IPv4**

* Specify a match criterion based on **destination IPv4 address** and/or port,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy limiter <policy name> class <class ID>
  match <match name> ip destination <IPv4 address|port>`

* Specify a match criterion based on **source IPv4 address** and/or port, port
  may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy limiter <policy name> class <class ID>
  match <match name> ip source <IPv4 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code Point)
  value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ip dscp <DSCP value>`

* Specify a match criterion based on **IPv4 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ip protocol <proto>`

**IPv6**

* Specify a match criterion based on **destination IPv6 address and/or port**,
  port may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ipv6 destination <IPv6 address|port>`

* Specify a match criterion based on **source IPv6 address and/or port**, port
  may be specified as number or service name (i.e. ssh):

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ipv6 source <IPv6 address|port>`

* Specify a match criterion based on **DSCP (Differentiated Services Code
  Point) value**, DSCP value may be specified as decimal or hexadecimal number:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ipv6 dscp <DSCP value>`

* Specify a match criterion based on **IPv6 protocol**, protocol may be
  specified by name (i.e. icmp) or IANA-assigned number:

  :code:`set traffic-policy limiter <policy name> class <class ID> match
  <match name> ipv6 protocol <proto>`

Network emulator
^^^^^^^^^^^^^^^^

The network emulator policy emulates WAN traffic, which is useful for testing
purposes. Applicable to outbound traffic only.

Available commands:

* Define a network emulator policy:

  :code:`set traffic-policy network-emulator <policy name>`

* Add a description:

  :code:`set traffic-policy network-emulator <policy name> description <description>`

* Specify a bandwidth limit in kbit/s:

  :code:`set traffic-policy network-emulator <policy name> bandwidth <rate>`

  Available suffixes:

 * kbit (kilobits per second, default)
 * mbit (megabits per second)
 * gbit (gigabits per second)
 * kbps (kilobytes per second)
 * mbps (megabytes per second)
 * gbps (gigabytes per second)

* Set a burst size, the maximum amount of traffic that can be sent, in bytes:

  :code:`set traffic-policy network-emulator <policy name> burst <burst size>`

  Available suffixes:

 * kb (kilobytes)
 * mb (megabytes)
 * gb (gigabytes)

* Define a delay between packets:

  :code:`set traffic-policy network-emulator <policy name> network-delay <delay>`

  Available suffixes:

 * secs (seconds)
 * ms (milliseconds, default)
 * us (microseconds)

* Set a percentage of corrupted of packets (one bit flip, unchanged checksum):

  :code:`set traffic-policy network-emulator <policy name> packet-corruption
  <percent>`

* Set a percentage of random packet loss:

  :code:`set traffic-policy network-emulator <policy name> packet-loss <percent>`

* Set a percentage of packets for random reordering:

  :code:`set traffic-policy network-emulator <policy name> packet-reordering
  <percent>`

* Set a queue length limit in packets, range 0...4294967295, default 127:

  :code:`set traffic-policy network-emulator <policy name> queue-limit <limit>`

Priority queue
^^^^^^^^^^^^^^

Up to seven queues with differing priorities can be defined, packets are placed
into queues based on associated match criteria. Packets are transmitted from
the queues in priority order. If queues with a higher order are being filled
with packets continuously, packets from lower priority queues will only be
transmitted after traffic volume from higher priority queues decreases.

Available commands:

* Define a priority queue:

  :code:`set traffic-policy priority-queue <policy name>`

* Add a description:

  :code:`set traffic-policy priority-queue <policy name> description <description>`

Traffic classes
***************

* Define a traffic class, each class is a separate queue, range for class ID
  is 1...7, while 1 being the lowest priority:

  :code:`set traffic-policy  priority-queue <policy name> class <class ID>`

* Add a class description:

  :code:`set traffic-policy priority-queue <policy name> class <class ID>
  description <description>`

* Set a queue length limit in packets, default 1000:

  :code:`set traffic-policy priority-queue <policy name> class <class ID>
  queue-limit <limit>`

* Specify a queue type for a traffic class, available queue types:

 * drop-tail
 * fair-queue
 * random-detect

  :code:`set traffic-policy priority-queue <policy name> class <class ID>
  queue-type <type>`

Default class
#############

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
**************

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
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

RED
***

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
****

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
  RFC791_.

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
^^^^^^^^^^^^^^^^^^

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
^^^^^^^^^^^^^^^^^

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
**************

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

Traffic shaper
^^^^^^^^^^^^^^

The shaper policy uses the Hierarchical Token Bucket algorithm to allocate
different amounts of bandwidth to different traffic classes. In contrast to
round robin, shaper limits bandwidth allocation by traffic class whereas round
robin divides the total available bandwidth between classes.

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
***************

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
  bandwidth is available. Range 0...7, lowest number has lowest priority,
  default 0:

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

  DSCP values as per RFC2474_ and RFC4595_:

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
**************

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

shaper-hfsc (HFSC_ + sfq)
^^^^^^^^^^^^^^^^^^^^^^^^^

TBD

Ingress shaping
---------------

The case of ingress shaping. Only a **limiter** policy can be applied directly
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

Classful policies and traffic matching
--------------------------------------

`limiter`, `round-robin`, `priority-queue`, `shaper` and `shaper-hfsc`
distribute traffic into different classes with different options. In VyOS,
classes are numbered and work like firewall rules. e.g:

:code:`set traffic-policy shaper SHAPER class 30`

Matching traffic
^^^^^^^^^^^^^^^^

A class can have multiple match filters:

.. code-block:: sh

  set traffic-policy <POLICY> <POLICY-NAME> class N match MATCH-FILTER-NAME

Example:

.. code-block:: sh

  set traffic-policy shaper SHAPER class 30 match HTTP
  set traffic-policy shaper SHAPER class 30 match HTTPs

A match filter contains multiple criteria and will match traffic if all those criteria are true.

For example:

.. code-block:: sh

  set traffic-policy shaper SHAPER class 30 match HTTP ip protocol tcp
  set traffic-policy shaper SHAPER class 30 match HTTP ip source port 80

This will match tcp traffic with source port 80.

description
***********

.. code-block:: sh

  set traffic-policy shaper SHAPER class 30 match MATCH description "match filter description"

ether
*****

.. code-block:: sh

  edit traffic-policy shaper SHAPER class 30 match MATCH ether

destination
###########

protocol
########

source
######

interface
*********

.. code-block:: sh

  edit traffic-policy shaper SHAPER class 30 match MATCH interface <interface-name>

ip
**
.. code-block:: sh

  edit traffic-policy shaper SHAPER class 30 match MATCH ip

destination
###########

.. code-block:: sh

 set destination address IPv4-SUBNET
 set destination port U32-PORT

dscp
####

.. code-block:: sh

  set dscp DSCPVALUE

max-length
##########

.. code-block:: sh

  set max-length U32-MAXLEN

Will match ipv4 packets with a total length lesser than set value.

protocol
########

.. code-block:: sh

  set protocol <IP PROTOCOL>

source
######

.. code-block:: sh

  set source address IPv4-SUBNET
  set source port U32-PORT

tcp
###

.. note:: You must set ip protocol to TCP to use the TCP filters.

.. note:: This filter will only match packets with an IPv4 header length of
   20 bytes (which is the majority of IPv4 packets anyway).

.. code-block:: sh

 set tcp ack

Will match tcp packets with ACK flag set.

.. code-block:: sh

  set tcp syn

Will match tcp packets with SYN flag set.

ipv6
****

.. code-block:: sh

  edit traffic-policy shaper SHAPER class 30 match MATCH ipv6

destination
###########

 .. code-block:: sh

  set destination address IPv6-SUBNET
  set destination port U32-PORT

dscp
####

.. code-block:: sh

  set dscp DSCPVALUE

max-length
##########

.. code-block:: sh

  set max-length U32-MAXLEN

Will match ipv6 packets with a payload length lesser than set value.

protocol
########

.. code-block:: sh

  set protocol IPPROTOCOL

source
######

.. code-block:: sh

  set source address IPv6-SUBNET
  set source port U32-PORT

tcp
###

.. note:: You must set ipv6 protocol to TCP to use the TCP filters.

.. note:: This filter will only match IPv6 packets with no header extension, see
   http://en.wikipedia.org/wiki/IPv6_packet#Extension_headers for no header
   extension.

.. code-block:: sh

  set tcp ack

Will match tcp packets with ACK flag set.

.. code-block:: sh

  set tcp syn

Will match tcp packets with SYN flag set.

mark
****

.. code-block:: sh

  set traffic-policy shaper SHAPER class 30 match MATCH mark **firewall-mark**

vif
***

.. code-block:: sh

  set traffic-policy shaper SHAPER class 30 match MATCH vif **vlan-tag**

.. code-block:: sh

  set interfaces ethernet eth0 traffic-policy out 'WAN-OUT'
  set interfaces ethernet eth1 traffic-policy out 'LAN-OUT'

.. _tc: http://en.wikipedia.org/wiki/Tc_(Linux)
.. _RFC791: https://tools.ietf.org/html/rfc791
.. _TBF: https://en.wikipedia.org/wiki/Token_bucket
.. _RFC2474: https://tools.ietf.org/html/rfc2474#page-7
.. _RFC4595: https://tools.ietf.org/html/rfc4594#page-19
.. _HFSC: https://en.wikipedia.org/wiki/Hierarchical_fair-service_curve
.. _IFB: http://www.linuxfoundation.org/collaborate/workgroups/networking/ifb
