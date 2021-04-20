.. include:: /_include/need_improvement.txt

.. _routing-isis:

#####
IS-IS
#####

:abbr:`IS-IS (Intermediate System to Intermediate System)` is a link-state
interior gateway routing protocol which is described in ISO10589,
:rfc:`1195`, :rfc:`5308`. Like OSPF, IS-IS runs the Dijkstra shortest-path
first (SPF) algorithm to create a database of the network’s topology and,
from that database, to determine the best (that is, shortest) path to a
destination. The routers exchange topology information with their nearest
neighbors. IS-IS runs directly on the data link layer (Layer 2). IS-IS
addresses are called :abbr:`NETs (Network Entity Titles)` and can be
8 to 20 bytes long, but are generally 10 bytes long.

*******
General
*******

Configuration
=============

Mandatory Settings
------------------

.. cfgcmd:: set protocols isis net <network-entity-title>

  This commad also sets network entity title (NET) provided in ISO format.

  For example :abbr:`NET (Network Entity Title)`

  .. code-block:: none

    49.0001.1921.6800.1002.00

  The IS-IS address consists of the following parts:

  * :abbr:`AFI (Address family authority identifier)` - ``49`` The AFI value
    49 is what IS-IS uses for private addressing.

  * Area identifier: ``0001`` IS-IS area number (Area1)

  * System identifier: ``1921.6800.1002`` - for system idetifiers we recommend
    to use IP address or MAC address of the router itself.

  * NET selector: ``00`` Must always be 00, to indicate "this system".

.. cfgcmd:: set protocols isis interface <interface>

  This command activates ISIS adjacency on this interface. Note that the name
  of ISIS instance must be the same as the one used to configure the ISIS
  process.

.. cfgcmd:: set protocols isis dynamic-hostname

  This command enables support for dynamic hostname. Dynamic hostname mapping
  determined as described in :rfc:`2763`, Dynamic Hostname Exchange Mechanism
  for IS-IS.

.. cfgcmd:: set protocols isis level <level-1|level-1-2|level-2>

  This command defines the ISIS router behavior:

      **level-1** Act as a station router only.
      **level-1-2** Act as both a station router and an area router.
      **level-2-only** Act as an area router only.

.. cfgcmd:: set protocols isis lsp-mtu <size>

  This command configures the maximum size of generated LSPs, in bytes. The
  size range is 128 to 4352.

.. cfgcmd:: set protocols isis metric-style <narrow|transition|wide>

  This command sets old-style (ISO 10589) or new-style packet formats:

      **narrow** Use old style of TLVs with narrow metric.
      **transition** Send and accept both styles of TLVs during transition.
      **wide** Use new style of TLVs to carry wider metric.

.. cfgcmd:: set protocols isis purge-originator

  This command enables :rfc:`6232` purge originator identification. Enable
  purge originator identification (POI) by adding the type, length and value
  (TLV) with the Intermediate System (IS) identification to the LSPs that do
  not contain POI information. If an IS generates a purge, VyOS adds this TLV
  with the system ID of the IS to the purge.

.. cfgcmd:: set protocols isis set-attached-bit

  This command sets ATT bit to 1 in Level1 LSPs. It is described in :rfc:`3787`.

.. cfgcmd:: set protocols isis set-overload-bit

  This command sets overload bit to avoid any transit traffic through this
  router. It is described in :rfc:`3787`.

.. cfgcmd:: set protocols isis name default-information originate <ipv4|ipv6>
  level-1

  This command will generate a default-route in L1 database.

.. cfgcmd:: set protocols isis name default-information originate <ipv4|ipv6>
  level-2

  This command will generate a default-route in L2 database.


Interface Configuration
-----------------------

.. cfgcmd:: set protocols isis interface <interface> circuit-type
  <level-1|level-1-2|level-2-only>

  This command specifies circuit type for interface:

  * **level-1** Level-1 only adjacencies are formed.
  * **level-1-2** Level-1-2 adjacencies are formed
  * **level-2-only** Level-2 only adjacencies are formed

.. cfgcmd:: set protocols isis interface <interface> hello-interval
  <seconds>

  This command sets hello interval in seconds on a given interface.
  The range is 1 to 600.

.. cfgcmd:: set protocols isis interface <interface> hello-multiplier
  <seconds>

  This command sets multiplier for hello holding time on a given
  interface. The range is 2 to 100.

.. cfgcmd:: set protocols isis interface <interface> hello-padding

  This command configures padding on hello packets to accommodate asymmetrical
  maximum transfer units (MTUs) from different hosts as described in
  :rfc:`3719`. This helps to prevent a premature adjacency Up state when one
  routing devices MTU does not meet the requirements to establish the adjacency.

.. cfgcmd:: set protocols isis interface <interface> metric <metric>

  This command set default metric for circuit.

  The metric range is 1 to 16777215 (Max value depend if metric support narrow
  or wide value).

.. cfgcmd:: set protocols isis interface <interface> network
  point-to-point

  This command specifies network type to Point-to-Point. The default
  network type is broadcast.

.. cfgcmd:: set protocols isis interface <interface> passive

  This command configures the passive mode for this interface.

.. cfgcmd:: set protocols isis interface <interface> password
  plaintext-password <text>

  This command configures the authentication password for the interface.

.. cfgcmd:: set protocols isis interface <interface> priority <number>

  This command sets priority for the interface for
  :abbr:`DIS (Designated Intermediate System)` election. The priority
  range is 0 to 127.

.. cfgcmd:: set protocols isis interface <interface> psnp-interval
  <number>

  This command sets PSNP interval in seconds. The interval range is 0
  to 127.

.. cfgcmd:: set protocols isis interface <interface>
  no-three-way-handshake

  This command disables Three-Way Handshake for P2P adjacencies which
  described in :rfc:`5303`. Three-Way Handshake is enabled by default.


Route Redistribution
--------------------

.. cfgcmd:: set protocols isis redistribute ipv4 <route source> level-1

  This command redistributes routing information from the given route source
  into the ISIS database as Level-1. There are six modes available for route
  source: bgp, connected, kernel, ospf, rip, static.

.. cfgcmd:: set protocols isis redistribute ipv4 <route source> level-2

  This command redistributes routing information from the given route source
  into the ISIS database as Level-2. There are six modes available for route
  source: bgp, connected, kernel, ospf, rip, static.

.. cfgcmd:: set protocols isis redistribute ipv4 <route source>
  <level-1|level-2> metric <number>

  This command specifies metric for redistributed routes from the given route
  source. There are six modes available for route source: bgp, connected,
  kernel, ospf, rip, static. The metric range is 1 to 16777215.

.. cfgcmd:: set protocols isis redistribute ipv4 <route source>
  <level-1|level-2> route-map <name>

  This command allows to use route map to filter redistributed routes from
  the given route source. There are six modes available for route source:
  bgp, connected, kernel, ospf, rip, static.


Timers
------

.. cfgcmd:: set protocols isis lsp-gen-interval <seconds>

  This command sets minimum interval in seconds between regenerating same
  LSP. The interval range is 1 to 120.

.. cfgcmd:: set protocols isis lsp-refresh-interval <seconds>

  This command sets LSP refresh interval in seconds. IS-IS generates LSPs
  when the state of a link changes. However, to ensure that routing
  databases on all routers remain converged, LSPs in stable networks are
  generated on a regular basis even though there has been no change to
  the state of the links. The interval range is 1 to 65235. The default
  value is 900 seconds.

.. cfgcmd:: set protocols isis max-lsp-lifetime <seconds>

  This command sets LSP maximum LSP lifetime in seconds. The interval range
  is 350 to 65535. LSPs remain in a database for 1200 seconds by default.
  If they are not refreshed by that time, they are deleted. You can change
  the LSP refresh interval or the LSP lifetime. The LSP refresh interval
  should be less than the LSP lifetime or else LSPs will time out before
  they are refreshed.

.. cfgcmd:: set protocols isis spf-interval <seconds>

  This command sets minimum interval between consecutive SPF calculations in
  seconds.The interval range is 1 to 120.

.. cfgcmd:: set protocols isis spf-delay-ietf holddown <milliseconds>

.. cfgcmd:: set protocols isis spf-delay-ietf init-delay
  <milliseconds>

.. cfgcmd:: set protocols isis spf-delay-ietf long-delay
  <milliseconds>

.. cfgcmd:: set protocols isis spf-delay-ietf short-delay
  <milliseconds>

.. cfgcmd:: set protocols isis spf-delay-ietf time-to-learn
  <milliseconds>

  This commands specifies the Finite State Machine (FSM) intended to
  control the timing of the execution of SPF calculations in response
  to IGP events. The process described in :rfc:`8405`.


*******
Example
*******

Simple IS-IS configuration using 2 nodes and redistributing connected
interfaces.

**Node 1:**

.. code-block:: none

  set interfaces dummy dum0 address '203.0.113.1/24'
  set interfaces ethernet eth1 address '192.0.2.1/24'

  set policy prefix-list EXPORT-ISIS rule 10 action 'permit'
  set policy prefix-list EXPORT-ISIS rule 10 prefix '203.0.113.0/24'
  set policy route-map EXPORT-ISIS rule 10 action 'permit'
  set policy route-map EXPORT-ISIS rule 10 match ip address prefix-list 'EXPORT-ISIS'

  set protocols isis interface eth1
  set protocols isis net '49.0001.1921.6800.1002.00'
  set protocols isis redistribute ipv4 connected level-2 route-map 'EXPORT-ISIS'

**Node 2:**

.. code-block:: none

  set interfaces ethernet eth1 address '192.0.2.2/24'

  set protocols isis interface eth1
  set protocols isis net '49.0001.1921.6800.2002.00'

Show ip routes on Node2:

.. code-block:: none

  vyos@r2:~$ show ip route isis
  Codes: K - kernel route, C - connected, S - static, R - RIP,
         O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
         T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
         F - PBR, f - OpenFabric,
         > - selected route, * - FIB route, q - queued route, r - rejected route

  I   203.0.113.0/24 [115/10] via 192.0.2.1, eth1, 00:03:42
