.. include:: /_include/need_improvement.txt

.. _isis:

#####
IS-IS
#####

:abbr:`IS-IS (Intermediate System to Intermediate System)` is a link-state
interior gateway routing protocol. Like OSPF, IS-IS runs the Dijkstra
shortest-path first (SPF) algorithm to create a database of the network’s
topology and, from that database, to determine the best (that is, shortest)
path to a destination. The routers exchange topology information with their
nearest neighbors. IS-IS runs directly on the data link layer (Layer 2).
IS-IS addresses are called :abbr:`NETs (Network Entity Titles)` and can be
8 to 20 bytes long, but are generally 10 bytes long.

For example :abbr:`NET (Network Entity Title)`

.. code-block:: none

  49.0001.1921.6800.1002.00

The IS-IS address consists of three parts:

  :abbr:`AFI (Address family authority identifier)`
    ``49`` The AFI value 49 is what IS-IS uses for private addressing.

  Area identifier:
    ``0001`` IS-IS area number (Area1)

  System identifier:
    ``1921.6800.1002`` For system idetifier we recommend to use IP address or
    MAC address of the router.

  NET selector:
    ``00`` Must always be 00, to indicate "this system".

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

  set protocols isis FOO interface eth1
  set protocols isis FOO net '49.0001.1921.6800.1002.00'
  set protocols isis FOO redistribute ipv4 connected level-2 route-map 'EXPORT-ISIS'

**Node 2:**

.. code-block:: none

  set interfaces ethernet eth1 address '192.0.2.2/24'

  set protocols isis FOO interface eth1
  set protocols isis FOO net '49.0001.1921.6800.2002.00'

Show ip routes on Node2:

.. code-block:: none

  vyos@r2:~$ show ip route isis 
  Codes: K - kernel route, C - connected, S - static, R - RIP,
         O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,
         T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,
         F - PBR, f - OpenFabric,
         > - selected route, * - FIB route, q - queued route, r - rejected route

  I   203.0.113.0/24 [115/10] via 192.0.2.1, eth1, 00:03:42
