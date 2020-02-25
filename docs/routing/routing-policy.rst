.. include:: ../_include/need_improvement.txt

Routing-policy
--------------

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
  set protocols bgp 1 neighbor 203.0.113.2 address-family ipv4-unicast route-map import 'setmet'
  set protocols bgp 1 neighbor 203.0.113.2 address-family ipv4-unicast soft-reconfiguration 'inbound' <<<< ***

  *** get policy update without bouncing the neighbor

**Routes learned before routing policy applied:**

.. code-block:: none

  vyos@vos1:~$ show ip bgp
  BGP table version is 0, local router ID is 192.168.56.101
  Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
                r RIB-failure, S Stale, R Removed
  Origin codes: i - IGP, e - EGP, ? - incomplete

     Network          Next Hop            Metric LocPrf Weight Path
  *> 198.51.100.3/32   203.0.113.2           1             0 2 i  < Path

  Total number of prefixes 1

**Routes learned after routing policy applied:**

.. code-block:: none

  vyos@vos1:~$ sho ip b
  BGP table version is 0, local router ID is 192.168.56.101
  Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
                r RIB-failure, S Stale, R Removed
  Origin codes: i - IGP, e - EGP, ? - incomplete

     Network          Next Hop            Metric LocPrf Weight Path
  *> 198.51.100.3/32   203.0.113.2           1             0 2 2 2 2 i < longer AS_path length

  Total number of prefixes 1
  vyos@vos1:~$
