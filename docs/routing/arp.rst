.. _routing-arp:

Address Resolution Protocol (ARP)
---------------------------------

To manipulate or display ARP_ table entries, the following commands are implemented.

adding a static arp entry
^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: sh

  set protocols static arp 10.1.1.100 hwaddr 08:00:27:de:23:aa
  commit

display arp table entries
^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: sh

  show protocols static arp

  Address                  HWtype  HWaddress           Flags Mask            Iface
  10.1.1.1                 ether   08:00:27:de:23:2e   C                     eth1
  10.1.1.100               ether   08:00:27:de:23:aa   CM                    eth1

.. code-block:: sh

  show protocols static arp interface eth1
  Address                  HWtype  HWaddress           Flags Mask            Iface
  10.1.1.1                 ether   08:00:27:de:23:2e   C                     eth1
  10.1.1.100               ether   08:00:27:de:23:aa   CM                    eth1

.. _ARP: https://en.wikipedia.org/wiki/Address_Resolution_Protocol
