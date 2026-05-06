########
Failover
########

Failover routes are manually configured routes, but they only install
to the routing table as kernel routes if the health-check target is alive.
If the target is not alive the route is removed from the routing table
until the target becomes available.

***************
Failover Routes
***************

.. cfgcmd:: set protocols failover route <subnet> next-hop <address> check 
   target <target-address>

   Configure next-hop `<address>` and `<target-address>` for an IPv4 static 
   route. Specify the target
   IPv4 address for health checking.

.. cfgcmd:: set protocols failover route <subnet> next-hop <address> check 
   timeout <timeout>

   Timeout in seconds between health target checks.

   Range is 1 to 300, default is 10.

.. cfgcmd:: set protocols failover route <subnet> next-hop <address> check 
   type <protocol>

   Defines protocols for checking ARP, ICMP, TCP.
* ICMP probe sends 2 ICMP request packets with a response timeout of 1 second.
  If one ICMP response is received, the health check is successful.
* ARP probe sends 2 ARP requests with a response timeout of 1 second.
  If one response is received, the health check is successful.
* TCP probe checks whether the destination port is open.

   Default is ``icmp``.

.. cfgcmd:: set protocols failover route <subnet> next-hop <address> check
   policy <policy>

   Policy for checking targets

* ``all-available`` all checking target addresses must be available to pass
  this check

* ``any-available`` any of the checking target addresses must be available
  to pass this check

   Default is ``any-available``.

.. cfgcmd:: set protocols failover route <subnet> next-hop <address> 
   interface <interface>

   Next-hop interface for the route

.. cfgcmd:: set protocols failover route <subnet> next-hop <address> 
   metric <metric>

   Route metric

   Default 1.


*******
Example
*******

**One gateway:**

.. code-block:: none

  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 check target '192.0.2.1'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 check timeout '5'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 check type 'icmp'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 interface 'eth0'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 metric '10'

Show the route

.. code-block:: none

  vyos@vyos:~$ show ip route 203.0.113.1
    Routing entry for 203.0.113.1/32
    Known via "kernel", distance 0, metric 10, best
    Last update 00:00:39 ago
    * 192.0.2.1, via eth0

**Two gateways and different metrics:**

.. code-block:: none

  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 check target '192.0.2.1'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 check timeout '5'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 check type 'icmp'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 interface 'eth0'
  set protocols failover route 203.0.113.1/32 next-hop 192.0.2.1 metric '10'

  set protocols failover route 203.0.113.1/32 next-hop 198.51.100.1 check target '198.51.100.99'
  set protocols failover route 203.0.113.1/32 next-hop 198.51.100.1 check timeout '5'
  set protocols failover route 203.0.113.1/32 next-hop 198.51.100.1 check type 'icmp'
  set protocols failover route 203.0.113.1/32 next-hop 198.51.100.1 interface 'eth2'
  set protocols failover route 203.0.113.1/32 next-hop 198.51.100.1 metric '20'

Show the route

.. code-block:: none

  vyos@vyos:~$ show ip route 203.0.113.1
  Routing entry for 203.0.113.1/32
    Known via "kernel", distance 0, metric 10, best
    Last update 00:08:06 ago
    * 192.0.2.1, via eth0

  Routing entry for 203.0.113.1/32
    Known via "kernel", distance 0, metric 20
    Last update 00:08:14 ago
    * 198.51.100.1, via eth2
