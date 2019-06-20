.. _routing-rip:

Routing Information Protocol (RIP)
----------------------------------

Simple RIP configuration using 2 nodes and redistributing connected interfaces.

**Node 1:**

.. code-block:: sh

  set interfaces loopback address 10.1.1.1/32
  set protocols rip network 192.168.0.0/24
  set protocols rip redistribute connected

**Node 2:**

.. code-block:: sh

  set interfaces loopback address 10.2.2.2/32
  set protocols rip network 192.168.0.0/24
  set protocols rip redistribute connected
