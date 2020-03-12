.. include:: ../_include/need_improvement.txt

Conntrack
---------

One of the important features built on top of the Netfilter framework is
connection tracking. Connection tracking allows the kernel to keep track of all
logical network connections or sessions, and thereby relate all of the packets
which may make up that connection. NAT relies on this information to translate
all related packets in the same way, and iptables can use this information to
act as a stateful firewall.

The connection state however is completely independent of any upper-level
state, such as TCP's or SCTP's state. Part of the reason for this is that when
merely forwarding packets, i.e. no local delivery, the TCP engine may not
necessarily be invoked at all. Even connectionless-mode transmissions such as
UDP, IPsec (AH/ESP), GRE and other tunneling protocols have, at least, a pseudo
connection state. The heuristic for such protocols is often based upon a preset
timeout value for inactivity, after whose expiration a Netfilter connection is
dropped.

Each Netfilter connection is uniquely identified by a (layer-3 protocol, source
address, destination address, layer-4 protocol, layer-4 key) tuple. The layer-4
key depends on the transport protocol; for TCP/UDP it is the port numbers, for
tunnels it can be their tunnel ID, but otherwise is just zero, as if it were
not part of the tuple. To be able to inspect the TCP port in all cases, packets
will be mandatorily defragmented.

Configuration
^^^^^^^^^^^^^

.. code-block:: none

  # Protocols only for which local conntrack entries will be synced (tcp, udp, icmp, sctp)
  set service conntrack-sync accept-protocol

  # Queue size for listening to local conntrack events (in MB)
  set service conntrack-sync event-listen-queue-size <int>

  # Protocol for which expect entries need to be synchronized. (all, ftp, h323, nfs, sip, sqlnet)
  set service conntrack-sync expect-sync

  # Failover mechanism to use for conntrack-sync [REQUIRED]
  set service conntrack-sync failover-mechanism

  set service conntrack-sync cluster group <string>
  set service conntrack-sync vrrp sync-group <1-255>

  # IP addresses for which local conntrack entries will not be synced
  set service conntrack-sync ignore-address ipv4 <x.x.x.x>

  # Interface to use for syncing conntrack entries [REQUIRED]
  set service conntrack-sync interface <ifname>

  # Multicast group to use for syncing conntrack entries
  set service conntrack-sync mcast-group <x.x.x.x>

  # Queue size for syncing conntrack entries (in MB)
  set service conntrack-sync sync-queue-size <size>

Example
^^^^^^^
The next example is a simple configuration of conntrack-sync.


.. figure:: /_static/images/service_conntrack_sync-schema.png
   :scale: 60 %
   :alt: Conntrack Sync Example

   Conntrack Sync Example

First of all, make sure conntrack is enabled by running

.. code-block:: none

  show conntrack table ipv4

If the table is empty and you have a warning message, it means conntrack is not
enabled. To enable conntrack, just create a NAT or a firewall rule.

.. code-block:: none

  set firewall state-policy established action accept

You now should have a conntrack table

.. code-block:: none

  $ show conntrack table ipv4
  TCP state codes: SS - SYN SENT, SR - SYN RECEIVED, ES - ESTABLISHED,
                   FW - FIN WAIT, CW - CLOSE WAIT, LA - LAST ACK,
                   TW - TIME WAIT, CL - CLOSE, LI - LISTEN

  CONN ID    Source                 Destination            Protocol         TIMEOUT
  1015736576 10.35.100.87:58172     172.31.20.12:22        tcp [6] ES       430279
  1006235648 10.35.101.221:57483    172.31.120.21:22       tcp [6] ES       413310
  1006237088 10.100.68.100          172.31.120.21          icmp [1]         29
  1015734848 10.35.100.87:56282     172.31.20.12:22        tcp [6] ES       300
  1015734272 172.31.20.12:60286     239.10.10.14:694       udp [17]         29
  1006239392 10.35.101.221          172.31.120.21          icmp [1]         29

Now configure conntrack-sync service on ``router1`` **and** ``router2``

.. code-block:: none

  set service conntrack-sync accept-protocol 'tcp,udp,icmp'
  set service conntrack-sync event-listen-queue-size '8'
  set service conntrack-sync failover-mechanism cluster group 'GROUP'
  set service conntrack-sync interface 'eth0'
  set service conntrack-sync mcast-group '225.0.0.50'
  set service conntrack-sync sync-queue-size '8'

If you are using VRRP, you need to define a VRRP sync-group, and use ``vrrp sync-group`` instead of ``cluster group``.

.. code-block:: none

  set high-availablilty vrrp group internal virtual-address ... etc ...
  set high-availability vrrp sync-group syncgrp member 'internal'
  set service conntrack-sync failover-mechanism vrrp sync-group 'syncgrp'


On the active router, you should have information in the internal-cache of
conntrack-sync. The same current active connections number should be shown in
the external-cache of the standby router

On active router run:

.. code-block:: none

  $ show conntrack-sync statistics

  Main Table Statistics:

  cache internal:
  current active connections:               10
  connections created:                    8517    failed:            0
  connections updated:                     127    failed:            0
  connections destroyed:                  8507    failed:            0

  cache external:
  current active connections:                0
  connections created:                       0    failed:            0
  connections updated:                       0    failed:            0
  connections destroyed:                     0    failed:            0

  traffic processed:
                     0 Bytes                         0 Pckts

  multicast traffic (active device=eth0):
                868780 Bytes sent               224136 Bytes recv
                 20595 Pckts sent                14034 Pckts recv
                     0 Error send                    0 Error recv

  message tracking:
                     0 Malformed msgs                    0 Lost msgs



On standby router run:


.. code-block:: none


  $ show conntrack-sync statistics

  Main Table Statistics:

  cache internal:
  current active connections:                0
  connections created:                       0    failed:            0
  connections updated:                       0    failed:            0
  connections destroyed:                     0    failed:            0

  cache external:
  current active connections:               10
  connections created:                     888    failed:            0
  connections updated:                     134    failed:            0
  connections destroyed:                   878    failed:            0

  traffic processed:
                     0 Bytes                         0 Pckts

  multicast traffic (active device=eth0):
                234184 Bytes sent               907504 Bytes recv
                 14663 Pckts sent                21495 Pckts recv
                     0 Error send                    0 Error recv

  message tracking:
                     0 Malformed msgs                    0 Lost msgs

