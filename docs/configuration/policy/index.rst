
######
Policy
######

Routing Policies could be used to tell the router (self or neighbors) what routes and their attributes needs to be put into the routing table.

There could be a wide range of routing policies. Some examples are below:

  * Set some metric to routes learned from a particular neighbor
  * Set some attributes (like AS PATH or Community value) to advertised routes to neighbors
  * Prefer a specific routing protocol routes over another routing protocol running on the same router

Routing Policy Example
~~~~~~~~~~~~~~~~~~~~~~

**Policy definition:**

.. code-block:: none

  #Create policy
  set policy route-map setmet rule 2 action 'permit'
  set policy route-map setmet rule 2 set as-path-prepend '2 2 2'  
  
  #Apply policy to BGP
  set protocols bgp 1 neighbor 1.1.1.2 address-family ipv4-unicast route-map import 'setmet'
  set protocols bgp 1 neighbor 1.1.1.2 address-family ipv4-unicast soft-reconfiguration 'inbound' <<<< *** 
  
  *** get policy update without bouncing the neighbor

**Routes learned before routing policy applied:**

.. code-block:: none

  vyos@vos1:~$ show ip bgp
  BGP table version is 0, local router ID is 192.168.56.101
  Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
                r RIB-failure, S Stale, R Removed
  Origin codes: i - IGP, e - EGP, ? - incomplete
  
     Network          Next Hop            Metric LocPrf Weight Path
  *> 22.22.22.22/32   1.1.1.2                  1             0 2 i  < Path 
  
  Total number of prefixes 1

**Routes learned after routing policy applied:**

.. code-block:: none

  vyos@vos1:~$ sho ip b
  BGP table version is 0, local router ID is 192.168.56.101
  Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
                r RIB-failure, S Stale, R Removed
  Origin codes: i - IGP, e - EGP, ? - incomplete
  
     Network          Next Hop            Metric LocPrf Weight Path
  *> 22.22.22.22/32   1.1.1.2                  1             0 2 2 2 2 i < longer AS_path length
  
  Total number of prefixes 1
  vyos@vos1:~$ 


.. _routing-pbr:

Policy-Based Routing (PBR)
--------------------------

VyOS supports Policy Routing, allowing traffic to be assigned to a different
routing table. Traffic can be matched using standard 5-tuple matching (source
address, destination address, protocol, source port, destination port).

Transparent Proxy
^^^^^^^^^^^^^^^^^

The following example will show how VyOS can be used to redirect web traffic to
an external transparent proxy:

.. code-block:: none

  set policy route FILTER-WEB rule 1000 destination port 80
  set policy route FILTER-WEB rule 1000 protocol tcp
  set policy route FILTER-WEB rule 1000 set table 100

This creates a route policy called FILTER-WEB with one rule to set the routing
table for matching traffic (TCP port 80) to table ID 100 instead of the
default routing table.

To create routing table 100 and add a new default gateway to be used by
traffic matching our route policy:

.. code-block:: none

  set protocols static table 100 route 0.0.0.0/0 next-hop 10.255.0.2

This can be confirmed using the show ip route table 100 operational command.

Finally, to apply the policy route to ingress traffic on our LAN interface,
we use:

.. code-block:: none

  set interfaces ethernet eth1 policy route FILTER-WEB


Multiple Uplinks
^^^^^^^^^^^^^^^^

VyOS Policy-Based Routing (PBR) works by matching source IP address ranges and
forwarding the traffic using different routing tables.

Routing tables that will be used in this example are:

* ``table 10`` Routing tabled used for VLAN 10 (192.168.188.0/24)
* ``table 11`` Routing tabled used for VLAN 11 (192.168.189.0/24)
* ``main`` Routing table used by VyOS and other interfaces not paritipating in PBR

.. figure:: ../_static/images/pbr_example_1.png
   :scale: 80 %
   :alt: PBR multiple uplinks

   Policy-Based Routing with multiple ISP uplinks (source ./draw.io/pbr_example_1.drawio)

Add default routes for routing ``table 10`` and ``table 11``

.. code-block:: none

  set protocols static table 10 route 0.0.0.0/0 next-hop 192.0.1.1
  set protocols static table 11 route 0.0.0.0/0 next-hop 192.0.2.2

Add policy route matching VLAN source addresses

.. code-block:: none

  set policy route PBR rule 20 set table '10'
  set policy route PBR rule 20 description 'Route VLAN10 traffic to table 10'
  set policy route PBR rule 20 source address '192.168.188.0/24'

  set policy route PBR rule 30 set table '11'
  set policy route PBR rule 30 description 'Route VLAN11 traffic to table 11'
  set policy route PBR rule 30 source address '192.168.189.0/24'

Apply routing policy to **inbound** direction of out VLAN interfaces

.. code-block:: none

  set interfaces ethernet eth0 vif 10 policy route 'PBR'
  set interfaces ethernet eth0 vif 11 policy route 'PBR'


**OPTIONAL:** Exclude Inter-VLAN traffic (between VLAN10 and VLAN11) from PBR

.. code-block:: none

  set policy route PBR rule 10 description 'VLAN10 <-> VLAN11 shortcut'
  set policy route PBR rule 10 destination address '192.168.188.0/24'
  set policy route PBR rule 10 destination address '192.168.189.0/24'
  set policy route PBR rule 10 set table 'main'

.. note:: Allows the VLAN10 and VLAN20 hosts to communicate with each other using the
   main routing table.
