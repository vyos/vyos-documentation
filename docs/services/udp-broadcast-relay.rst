UDP broadcast relay
-------------------

Certain vendors use broadcasts to identify their equipemnt within one ethernet
segment. Unfortunately if you split your network with multiple VLANs you loose
the ability of identifying your equiment.

This is where "UDP broadcast relay" comes into play! It will forward received
broadcasts to other configured networks.

Every UDP port which will be forward requires one unique ID. Currently we
support 99 IDs!

Example #1: To forward all broadcast packets received on `UDP port 1900` on
`eth3`, `eth4` or `eth5` to all other interfaces in this configuration.

.. code-block:: none

  set service broadcast-relay id 1 description 'SONOS'
  set service broadcast-relay id 1 interface 'eth3'
  set service broadcast-relay id 1 interface 'eth4'
  set service broadcast-relay id 1 interface 'eth5'
  set service broadcast-relay id 1 port '1900'

Example #2: To Forward all broadcasts packets received on `UDP port 6969` on
`eth3` or `eth4` to the other interface in this configuration.

.. code-block:: none

  set service broadcast-relay id 2 description 'SONOS MGMT'
  set service broadcast-relay id 2 interface 'eth3'
  set service broadcast-relay id 2 interface 'eth4'
  set service broadcast-relay id 2 port '6969'

Disable Instance(s)
^^^^^^^^^^^^^^^^^^^

Each broadcast relay instance can be individually disabled without deleting the
configured node by using the following command:

.. code-block:: none

  set service broadcast-relay id <n> disable

In addition you can also disable the whole service without removing the
configuration by:

.. code-block:: none

  set service broadcast-relay disable

.. note:: You can run the UDP broadcast relay service on multiple routers
   connected to a subnet. There is **NO** UDP broadcast relay packet storm!
