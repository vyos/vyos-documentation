.. _babel:

#####
Babel
#####

Babel is a modern routing protocol designed to be robust and efficient
both in ordinary wired networks and in wireless mesh networks.
By default, it uses hop-count on wired networks and a variant of ETX
on wireless links, It can be configured to take radio diversity into account
and to automatically compute a link's latency and include it in the metric.
It is defined in :rfc:`8966`.

Babel a dual stack protocol.
A single Babel instance is able to perform routing for both IPv4 and IPv6.

General Configuration
---------------------

VyOS does not have a special command to start the Babel process.
The Babel process starts when the first Babel enabled interface is configured.

.. cfgcmd:: set protocols babel interface <interface>

  This command specifies a Babel enabled interface by interface name. Both
  the sending and receiving of Babel packets will be enabled on the interface
  specified in this command.

Optional Configuration
----------------------

.. cfgcmd:: set protocols babel parameters diversity

  This command enables routing using radio frequency diversity.
  This is highly recommended in networks with many wireless nodes.

   .. note:: If you enable this, you will probably want to
      set diversity-factor and channel below.

.. cfgcmd:: set protocols babel parameters diversity-factor <1-256>

  This command sets the multiplicative factor used for diversity routing,
  in units of 1/256; lower values cause diversity to play a more important role
  in route selection.
  The default it 256, which means that diversity plays no role in route
  selection; you will probably want to set that to 128 or less on nodes
  with multiple independent radios.

.. cfgcmd:: set protocols babel parameters resend-delay <milliseconds>

  This command specifies the time in milliseconds after which an 'important'
  request or update will be resent. The default is 2000 ms.

.. cfgcmd:: set protocols babel parameters smoothing-half-life <seconds>

  This command specifies the time constant, in seconds, of the smoothing
  algorithm used for implementing hysteresis.
  Larger values reduce route oscillation at the cost of very slightly increasing
  convergence time. The value 0 disables hysteresis, and is suitable for wired
  networks. The default is 4 s.

Interfaces Configuration
------------------------

.. cfgcmd:: set protocols babel interface <interface> type <auto|wired|wireless>

  This command sets the interface type:

  **auto** – automatically determines the interface type.
  **wired** – enables optimisations for wired interfaces.
  **wireless** – disables a number of optimisations that are only correct
  on wired interfaces. Specifying wireless is always correct,
  but may cause slower convergence and extra routing traffic.

.. cfgcmd:: set protocols babel interface <interface> split-horizon <default|disable|enable>

  This command specifies whether to perform split-horizon on the interface.
  Specifying no babel split-horizon is always correct, while babel split-horizon
  is an optimisation that should only be used on symmetric
  and transitive (wired) networks.

  **default** – enable split-horizon on wired interfaces, and disable
  split-horizon on wireless interfaces.
  **enable** – enable split-horizon on this interfaces.
  **disable** – disable split-horizon on this interfaces.

.. cfgcmd:: set protocols babel interface <interface> hello-interval <milliseconds>

  This command specifies the time in milliseconds between two scheduled hellos.
  On wired links, Babel notices a link failure within two hello intervals;
  on wireless links, the link quality value is reestimated at every hello
  interval.
  The default is 4000 ms.

.. cfgcmd:: set protocols babel interface <interface> update-interval <milliseconds>

  This command specifies the time in milliseconds between two scheduled updates.
  Since Babel makes extensive use of triggered updates,
  this can be set to fairly high values on links with little packet loss.
  The default is 20000 ms.

.. cfgcmd:: set protocols babel interface <interface> rxcost <1-65534>

  This command specifies the base receive cost for this interface.
  For wireless interfaces, it specifies the multiplier used for computing
  the ETX reception cost (default 256);
  for wired interfaces, it specifies the cost that will be advertised to
  neighbours.

.. cfgcmd:: set protocols babel interface <interface> rtt-decay <1-256>

  This command specifies the decay factor for the exponential moving average
  of RTT samples, in units of 1/256.
  Higher values discard old samples faster. The default is 42.

.. cfgcmd:: set protocols babel interface <interface> rtt-min <milliseconds>

  This command specifies the minimum RTT, in milliseconds,
  starting from which we increase the cost to a neighbour.
  The additional cost is linear in (rtt - rtt-min). The default is 10 ms.

.. cfgcmd:: set protocols babel interface <interface> rtt-max <milliseconds>

  This command specifies the maximum RTT, in milliseconds, above which
  we don't increase the cost to a neighbour. The default is 120 ms.


.. cfgcmd:: set protocols babel interface <interface> max-rtt-penalty <milliseconds>

  This command specifies the maximum cost added to a neighbour because of RTT,
  i.e. when the RTT is higher or equal than rtt-max.
  The default is 150.
  Setting it to 0 effectively disables the use of a RTT-based cost.

.. cfgcmd:: set protocols babel interface <interface> enable-timestamps

  This command enables sending timestamps with each Hello and IHU message
  in order to compute RTT values.
  It is recommended to enable timestamps on tunnel interfaces.

.. cfgcmd:: set protocols babel interface <interface> channel <1-254|interfering|noninterfering>

  This command set the channel number that diversity routing uses for this
  interface (see diversity option above).

  **1-254** – interfaces with a channel number interfere with
  interfering interfaces and interfaces with the same channel number.
  **interfering** – interfering interfaces are assumed to interfere with all other channels except
  noninterfering channels.
  **noninterfering** – noninterfering interfaces are assumed to only interfere
  with themselves.

Redistribution Configuration
----------------------------

.. cfgcmd:: set protocols babel redistribute <ipv4|ipv6> <route source>

   This command redistributes routing information from the given route source
   to the Babel process.

   IPv4 route source: bgp, connected, eigrp, isis, kernel, nhrp, ospf, rip, static.

   IPv6 route source: bgp, connected, eigrp, isis, kernel, nhrp, ospfv3, ripng, static.

.. cfgcmd:: set protocols babel distribute-list <ipv4|ipv6> access-list <in|out> <number>

  This command can be used to filter the Babel routes using access lists.
  :cfgcmd:`in` and :cfgcmd:`out` this is the direction in which the access
  lists are applied.

.. cfgcmd:: set protocols babel distribute-list <ipv4|ipv6> interface <interface> access-list <in|out> <number>

  This command allows you apply access lists to a chosen interface to
  filter the Babel routes.

.. cfgcmd:: set protocols babel distribute-list <ipv4|ipv6> prefix-list <in|out> <name>

  This command can be used to filter the Babel routes using prefix lists.
  :cfgcmd:`in` and :cfgcmd:`out` this is the direction in which the prefix
  lists are applied.

.. cfgcmd:: set protocols babel distribute-list <ipv4|ipv6> interface <interface> prefix-list <in|out> <name>

  This command allows you apply prefix lists to a chosen interface to
  filter the Babel routes.

Configuration Example
---------------------

Simple Babel configuration using 2 nodes and redistributing connected interfaces.

**Node 1:**

.. code-block:: none

  set interfaces loopback lo address 10.1.1.1/32
  set interfaces loopback lo address fd12:3456:dead:beef::1/128
  set protocols babel interface eth0 type wired
  set protocols babel redistribute ipv4 connected
  set protocols babel redistribute ipv6 connected

**Node 2:**

.. code-block:: none

  set interfaces loopback lo address 10.2.2.2/32
  set interfaces loopback lo address fd12:3456:beef:dead::2/128
  set protocols babel interface eth0 type wired
  set protocols babel redistribute ipv4 connected
  set protocols babel redistribute ipv6 connected
