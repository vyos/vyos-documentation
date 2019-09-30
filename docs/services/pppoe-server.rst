PPPoE server
------------

VyOS utilizes `accel-ppp`_ to provide PPPoE server functionality. It can be
used with local authentication or a connected RADIUS server.

.. note:: **Please be aware, due to an upstream bug, config changes/commits
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
  ifname | username |     ip     |    calling-sid    | rate-limit  | state  |  uptime  | rx-bytes | tx-bytes 
  -------+----------+------------+-------------------+-------------+--------+----------+----------+----------
  ppp0   | foo      | 10.1.1.100 | 08:00:27:ba:db:15 | 20480/10240 | active | 00:00:11 | 214 B    | 76 B     


Client IP address pools
=======================

To automatically assign the client an IP address as tunnel endpoint, a client IP pool is needed. The source can be either RADIUS or a local subnet or IP range definition.

Once the local tunnel endpoint ``set service pppoe-server local-ip '10.1.1.2'`` has been defined, the client IP pool can be either defined as a range or as subnet using CIDR notation.
If the CIDR notation is used, multiple subnets can be setup which are used sequentially.

**Client IP address via IP range definition**

.. code-block:: sh

  set service pppoe-server client-ip-pool start '10.1.1.100'
  set service pppoe-server client-ip-pool stop '10.1.1.111'


**Client IP subnets via CIDR notation**

.. code-block:: sh

  set service pppoe-server client-ip-pool subnet '10.1.1.0/24'
  set service pppoe-server client-ip-pool subnet '10.1.2.0/24'
  set service pppoe-server client-ip-pool subnet '10.1.3.0/24'



**RADIUS based IP pools (Framed-IP-Address)**

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

**RADIUS sessions management DM/CoA**

For remotely disconnect sessions and change some authentication parameters you can configure dae-server

.. code-block:: sh

  set service pppoe-server authentication radius-settings dae-server ip-address '10.1.1.2'
  set service pppoe-server authentication radius-settings dae-server port '3799'
  set service pppoe-server authentication radius-settings dae-server secret 'secret123'

Example, from radius-server send command for disconnect client with username test

.. code-block:: sh

  root@radius-server:~# echo "User-Name=test" | radclient -x 10.1.1.2:3799 disconnect secret123
  
You can also use another attributes for identify client for disconnect, like Framed-IP-Address, Acct-Session-Id, etc.
Result commands appears in log

.. code-block:: sh

  show log | match Disconnect*

Example for changing rate-limit via RADIUS CoA

.. code-block:: sh

  echo "User-Name=test,Filter-Id=5000/4000" | radclient 10.1.1.2:3799 coa secret123

Filter-Id=5000/4000 (means 5000Kbit down-stream rate and 4000Kbit up-stream rate)
If attribute Filter-Id redefined, replace it in radius coa request


Automatic VLAN creation
=======================

VLAN's can be created by accel-ppp on the fly if via the use of the kernel module vlan_mon, which is monitoring incoming vlans and creates the necessary VLAN if required and allowed.
VyOS supports the use of either VLAN ID's or entire ranges, both values can be defined at the same time for an interface.

.. code-block:: sh

  set service pppoe-server interface eth3 vlan-id 100
  set service pppoe-server interface eth3 vlan-id 200
  set service pppoe-server interface eth3 vlan-range 500-1000
  set service pppoe-server interface eth3 vlan-range 2000-3000


The pppoe-server will now create these VLANs if required and once the user session has been cancelled, and the VLAN is not necessary anymore, it will remove it again.



Bandwidth Shaping
^^^^^^^^^^^^^^^^^

Bandwidth rate limits can be set for local users or RADIUS based attributes.

Bandwidth Shaping for local users 
=================================

The rate-limit is set in kbit/sec.

.. code-block:: sh

  set service pppoe-server access-concentrator 'ACN'
  set service pppoe-server authentication local-users username foo password 'bar'
  set service pppoe-server authentication local-users username foo rate-limit download '20480'
  set service pppoe-server authentication local-users username foo rate-limit upload '10240'
  set service pppoe-server authentication mode 'local'
  set service pppoe-server client-ip-pool start '10.1.1.100'
  set service pppoe-server client-ip-pool stop '10.1.1.111'
  set service pppoe-server dns-servers server-1 '10.100.100.1'
  set service pppoe-server dns-servers server-2 '10.100.200.1'
  set service pppoe-server interface 'eth1'
  set service pppoe-server local-ip '10.1.1.2'


Once the user is connected, the user session is using the set limits and can be displayed via 'show pppoe-server sessions'.

.. code-block:: sh

  show pppoe-server sessions
  ifname | username |     ip     |    calling-sid    | rate-limit  | state  |  uptime  | rx-bytes | tx-bytes
  -------+----------+------------+-------------------+-------------+--------+----------+----------+----------
  ppp0   | foo      | 10.1.1.100 | 08:00:27:ba:db:15 | 20480/10240 | active | 00:00:11 | 214 B    | 76 B


RADIUS based shaper setup
=========================

The current attribute 'Filter-Id' is being used as default and can be setup within RADIUS:

Filter-Id=2000/3000 (means 2000Kbit down-stream rate and 3000Kbit up-stream rate)

The command below enables it, assuming the RADIUS connection has been setup and is working.

.. code-block:: sh

  set service pppoe-server authentication radius-settings rate-limit enable

Other attributes can be used, but they have to be in one of the dictionaries in /usr/share/accel-ppp/radius.



Practical Configuration Examples
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Dual-stack provisioning with IPv6 PD via pppoe
==============================================

The example below covers a dual-stack configuration via pppoe-server.

.. code-block:: sh

  set service pppoe-server authentication local-users username test password 'test'
  set service pppoe-server authentication mode 'local'
  set service pppoe-server client-ip-pool start '192.168.0.1'
  set service pppoe-server client-ip-pool stop '192.168.0.10'
  set service pppoe-server client-ipv6-pool delegate-prefix '2001:db8:8003::1/48,56'
  set service pppoe-server client-ipv6-pool prefix '2001:db8:8002::1/48,64'
  set service pppoe-server dns-servers server-1 '8.8.8.8'
  set service pppoe-server dnsv6-servers server-1 '2001:4860:4860::8888'
  set service pppoe-server interface 'eth2'
  set service pppoe-server local-ip '10.100.100.1'


The client, once successfully authenticated, will receive an IPv4 and an IPv6 /64 address, to terminate the pppoe endpoint on the client side and a /56 subnet for the clients internal use.

.. code-block:: sh

  vyos@pppoe-server:~$ sh pppoe-server sessions 
   ifname | username |     ip      |            ip6           |       ip6-dp        |    calling-sid    | rate-limit | state  |  uptime  | rx-bytes | tx-bytes 
  --------+----------+-------------+--------------------------+---------------------+-------------------+------------+--------+----------+----------+----------
   ppp0   | test     | 192.168.0.1 | 2001:db8:8002:0:200::/64 | 2001:db8:8003::1/56 | 08:00:27:12:42:eb |            | active | 00:00:49 | 875 B    | 2.1 KiB

.. _`accel-ppp`: https://accel-ppp.org/
