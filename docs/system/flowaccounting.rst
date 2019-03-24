.. _flow-accounting:


Flow Accounting
---------------

VyOS supports flow accounting through NetFlow or sFlow.

For both types you need to specify the interfaces for which the data will be collected:

.. code-block:: sh

  set system flow-accounting interface eth0
  set system flow-accounting interface bond3


NetFlow is a protocol originating from Cisco Systems. It works on level3.
VyOS supports version 1, 5 and 9

NetFlow v5 example:

.. code-block:: sh

  set system flow-accounting netflow engine-id 100
  set system flow-accounting netflow version 5
  set system flow-accounting netflow server 192.168.2.10 port 2055