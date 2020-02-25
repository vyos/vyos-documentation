.. include:: ../_include/need_improvement.txt

.. _rip:

RIP
---

:abbr:`RIP (Routing Information Protocol)` is a widely deployed interior gateway
protocol. RIP was developed in the 1970s at Xerox Labs as part of the XNS
routing protocol. RIP is a distance-vector protocol and is based on the
Bellman-Ford algorithms. As a distance-vector protocol, RIP router send updates
to its neighbors periodically, thus allowing the convergence to a known
topology. In each update, the distance to any given network will be broadcast
to its neighboring router.

Supported versions of RIP are:
* RIPv1 as described in :rfc:`1058`
* RIPv2 as described in :rfc:`2453`

Simple RIP configuration using 2 nodes and redistributing connected interfaces.

**Node 1:**

.. code-block:: none

  set interfaces loopback address 10.1.1.1/32
  set protocols rip network 192.168.0.0/24
  set protocols rip redistribute connected

**Node 2:**

.. code-block:: none

  set interfaces loopback address 10.2.2.2/32
  set protocols rip network 192.168.0.0/24
  set protocols rip redistribute connected
