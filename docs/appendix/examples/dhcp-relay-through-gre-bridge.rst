.. _examples-dhcp-relay-through-gre-bridge:


DHCP Relay through GRE-Bridge
-----------------------------

Diagram
^^^^^^^

.. image:: /_static/images/dhcp-relay-through-gre-bridge.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram

Configuration
^^^^^^^^^^^^^

DHCP Server
"""""""""""

.. code-block:: none

   set interfaces ethernet eth0 address '10.0.2.1/24'
   set interfaces loopback lo address '3.3.3.3/24'
   set interfaces tunnel tun100 address '172.16.0.2/30'
   set interfaces tunnel tun100 encapsulation 'gre-bridge'
   set interfaces tunnel tun100 local-ip '10.0.2.1'
   set interfaces tunnel tun100 remote-ip '192.168.0.1'
   set protocols ospf area 0 network '3.3.3.0/24'
   set protocols ospf area 0 network '10.0.2.0/24'
   set protocols ospf parameters router-id '3.3.3.3'
   set protocols static interface-route 10.0.1.2/32 next-hop-interface tun100
   set service dhcp-server shared-network-name asdf authoritative
   set service dhcp-server shared-network-name asdf subnet 3.3.3.0/24 range 0 start '3.3.3.30'
   set service dhcp-server shared-network-name asdf subnet 3.3.3.0/24 range 0 stop '3.3.3.40'
   set service dhcp-server shared-network-name asdf subnet 10.0.1.0/24 default-router '10.0.1.2'
   set service dhcp-server shared-network-name asdf subnet 10.0.1.0/24 range 0 start '10.0.1.200'
   set service dhcp-server shared-network-name asdf subnet 10.0.1.0/24 range 0 stop '10.0.1.210'
   set service dhcp-server shared-network-name asdf subnet 10.2.1.0/24 range 0 start '10.2.1.222'
   set service dhcp-server shared-network-name asdf subnet 10.2.1.0/24 range 0 stop '10.2.1.233'
   set service dhcp-server shared-network-name asdf subnet 172.16.0.0/30 range 0 start '172.16.0.1'
   set service dhcp-server shared-network-name asdf subnet 172.16.0.0/30 range 0 stop '172.16.0.2'
   

In-Between Router
"""""""""""""""""

.. code-block:: none

   set interfaces ethernet eth0 address '192.168.0.2/24'
   set interfaces ethernet eth1 address '10.0.2.2/24'
   set protocols ospf area 0 network '192.168.0.0/24'
   set protocols ospf area 0 network '10.0.2.0/24'
   set protocols ospf parameters router-id '192.168.0.2'
   

DHCP Relay
""""""""""

.. code-block:: none

   set interfaces ethernet eth0 address '10.0.1.2/24'
   set interfaces ethernet eth1 address '192.168.0.1/24'
   set interfaces loopback lo address '1.1.1.1'
   set interfaces tunnel tun100 address '172.16.0.1/30'
   set interfaces tunnel tun100 encapsulation 'gre-bridge'
   set interfaces tunnel tun100 local-ip '192.168.0.1'
   set interfaces tunnel tun100 remote-ip '10.0.2.1'
   set protocols ospf area 0 network '10.0.1.0/24'
   set protocols ospf area 0 network '192.168.0.0/24'
   set protocols ospf area 0 network '1.1.1.0/24'
   set protocols ospf parameters router-id '1.1.1.1'
   set protocols static interface-route 3.3.3.3/32 next-hop-interface tun100
   set service dhcp-relay interface 'eth0'
   set service dhcp-relay interface 'tun100'
   set service dhcp-relay server '3.3.3.3'
   
