:lastproofread: 2021-07-24

.. _routing-static:

######
Static
######

Static routes are manually configured network routes.

A typical use for a static route is a static default route for systems that do
not make use of DHCP or dynamic routing protocols:

.. code-block:: none

  set protocols static route 0.0.0.0/0 next-hop 10.1.1.1 distance '1'

Another common use of static routes is to blackhole (drop) traffic. In the
example below, RFC1918_ networks are set as blackhole routes. 

This prevents these networks leaking out public interfaces, but it does not prevent
them from being used as the most specific route has the highest priority.

.. code-block:: none

  set protocols static route 10.0.0.0/8 blackhole distance '254'
  set protocols static route 172.16.0.0/12 blackhole distance '254'
  set protocols static route 192.168.0.0/16 blackhole distance '254'

.. note:: Routes with a distance of 255 are effectively disabled and not
   installed into the kernel.

.. _RFC1918: https://tools.ietf.org/html/rfc1918

.. _routing-arp:

Address Resolution Protocol (ARP)
---------------------------------

To manipulate or display ARP_ table entries, the following commands are implemented.

adding a static arp entry
^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

  set protocols static arp 10.1.1.100 hwaddr 08:00:27:de:23:aa
  commit

display arp table entries
^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

  show arp

  Address                  HWtype  HWaddress           Flags Mask            Iface
  10.1.1.1                 ether   08:00:27:de:23:2e   C                     eth1
  10.1.1.100               ether   08:00:27:de:23:aa   CM                    eth1

.. code-block:: none

  show arp interface eth1
  Address                  HWtype  HWaddress           Flags Mask            Iface
  10.1.1.1                 ether   08:00:27:de:23:2e   C                     eth1
  10.1.1.100               ether   08:00:27:de:23:aa   CM                    eth1

.. _ARP: https://en.wikipedia.org/wiki/Address_Resolution_Protocol
