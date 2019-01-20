PPPoE server
------------

VyOS utilizes `accel-ppp`_ to provide PPPoE server functionality. It can be
used with local authentication or a connected RADIUS server.

.. note:: Please be aware, due to an upstream bug, config changes/commits
   will restart the ppp daemon and will reset existing PPPoE connections from
   connected users, in order to become effective.**

Configuration
^^^^^^^^^^^^^

The example below uses ACN as access-concentrator name, assigns an address
from the pool 10.1.1.100-111, terminates at the local endpoint 10.1.1.1 and
serves requests only on eth1.

.. code-block:: sh

  set service pppoe-server access-concentrator 'ACN'
  set service pppoe-server authentication local-users username foo password 'bar'
  set service pppoe-server authentication mode 'local'
  set service pppoe-server client-ip-pool start '10.1.1.100'
  set service pppoe-server client-ip-pool stop '10.1.1.111'
  set service pppoe-server dns-servers server-1 '10.100.100.1'
  set service pppoe-server dns-servers server-2 '10.100.200.1'
  set service pppoe-server interface 'eth1'
  set service pppoe-server local-ip '10.1.1.2'


Connections can be locally checked via the command

.. code-block:: sh

  show pppoe-server sessions
  ifname | username |    calling-sid    |     ip     | type  | comp | state  |  uptime
  -------+----------+-------------------+------------+-------+------+--------+----------
  ppp0   | foo      | 08:00:27:fa:3e:50 | 10.1.1.100 | pppoe |      | active | 00:04:15


To use a radius server, you need to switch to authentication mode radius and
of course need to specify an IP for the server. You can have multiple RADIUS
server configured, if you wish to achieve redundancy.

.. code-block:: sh

  set service pppoe-server access-concentrator 'ACN'
  set service pppoe-server authentication mode 'radius'
  set service pppoe-server authentication radius-server 10.1.100.1 secret 'secret'
  set service pppoe-server interface 'eth1'
  set service pppoe-server local-ip '10.1.1.2'

RADIUS provides the IP addresses in the example above via Framed-IP-Address.


.. _`accel-ppp`: https://accel-ppp.org/
