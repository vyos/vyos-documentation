:lastproofread: 2022-09-17

.. _pppoe-server:

############
PPPoE Server
############

VyOS utilizes `accel-ppp`_ to provide PPPoE server functionality. It can
be used with local authentication or a connected RADIUS server.

.. note:: Please be aware, due to an upstream bug, config
   changes/commits will restart the ppp daemon and will reset existing
   PPPoE connections from connected users, in order to become effective.

Configuration
=============


First steps
-----------


.. cfgcmd:: set service pppoe-server access-concentrator <name>

   Use this command to set a name for this PPPoE-server access
   concentrator.

.. cfgcmd:: set service pppoe-server authentication mode <local | radius>

   Use this command to define whether your PPPoE clients will locally
   authenticate in your VyOS system or in RADIUS server.

.. cfgcmd:: set service pppoe-server authentication local-users username
   <name> password <password>

   Use this command to configure the username and the password of a
   locally configured user.

.. cfgcmd:: set service pppoe-server interface <interface>

   Use this command to define the interface the PPPoE server will use to
   listen for PPPoE clients.

.. cfgcmd:: set service pppoe-server gateway-address <address>

   Use this command to configure the local gateway IP address.

.. cfgcmd:: set service pppoe-server name-server <address>

   Use this command to set the IPv4 or IPv6 address of every Doman Name
   Server you want to configure. They will be propagated to PPPoE
   clients.


Client Address Pools
--------------------

To automatically assign the client an IP address as tunnel endpoint, a
client IP pool is needed. The source can be either RADIUS or a local
subnet or IP range definition.

Once the local tunnel endpoint ``set service pppoe-server gateway-address
'10.1.1.2'`` has been defined, the client IP pool can be either defined
as a range or as subnet using CIDR notation. If the CIDR notation is
used, multiple subnets can be setup which are used sequentially.


**Client IP address via IP range definition**

.. cfgcmd:: set service pppoe-server client-ip-pool start <address>

   Use this command to define the first IP address of a pool of
   addresses to be given to PPPoE clients. It must be within a /24
   subnet.

.. cfgcmd:: set service pppoe-server client-ip-pool stop <address>

   Use this command to define the last IP address of a pool of
   addresses to be given to PPPoE clients. It must be within a /24
   subnet.

.. code-block:: none

  set service pppoe-server client-ip-pool start '10.1.1.100'
  set service pppoe-server client-ip-pool stop '10.1.1.111'


**Client IP subnets via CIDR notation**

.. cfgcmd:: set service pppoe-server client-ip-pool subnet <address>

   Use this command for every pool of client IP addresses you want to
   define. The addresses of this pool will be given to PPPoE clients.
   You must use CIDR notation and it must be within a /24 subnet.

.. code-block:: none

  set service pppoe-server client-ip-pool subnet '10.1.1.0/24'
  set service pppoe-server client-ip-pool subnet '10.1.2.0/24'
  set service pppoe-server client-ip-pool subnet '10.1.3.0/24'


**RADIUS based IP pools (Framed-IP-Address)**

To use a radius server, you need to switch to authentication mode RADIUS
and then configure it.

.. cfgcmd:: set service pppoe-server authentication radius server <address>
   key <secret>

   Use this command to configure the IP address and the shared secret
   key of your RADIUS server.  You can have multiple RADIUS servers
   configured if you wish to achieve redundancy.


.. code-block:: none

  set service pppoe-server access-concentrator 'ACN'
  set service pppoe-server authentication mode 'radius'
  set service pppoe-server authentication radius server 10.1.100.1 key 'secret'
  set service pppoe-server interface 'eth1'
  set service pppoe-server gateway-address '10.1.1.2'

RADIUS provides the IP addresses in the example above via
Framed-IP-Address.

**RADIUS sessions management DM/CoA**

.. cfgcmd:: set service pppoe-server authentication radius dynamic-author
   <key | port | server>

   Use this command to configure Dynamic Authorization Extensions to
   RADIUS so that you can remotely disconnect sessions and change some
   authentication parameters.

.. code-block:: none

  set service pppoe-server authentication radius dynamic-author key 'secret123'
  set service pppoe-server authentication radius dynamic-author port '3799'
  set service pppoe-server authentication radius dynamic-author server '10.1.1.2'


Example, from radius-server send command for disconnect client with
username test

.. code-block:: none

  root@radius-server:~# echo "User-Name=test" | radclient -x 10.1.1.2:3799
  disconnect secret123

You can also use another attributes for identify client for disconnect,
like Framed-IP-Address, Acct-Session-Id, etc. Result commands appears in
log.

.. code-block:: none

  show log | match Disconnect*

Example for changing rate-limit via RADIUS CoA.

.. code-block:: none

  echo "User-Name=test,Filter-Id=5000/4000" | radclient 10.1.1.2:3799 coa
  secret123

Filter-Id=5000/4000 (means 5000Kbit down-stream rate and 4000Kbit
up-stream rate) If attribute Filter-Id redefined, replace it in RADIUS
CoA request.

Automatic VLAN Creation
-----------------------

.. cfgcmd:: set service pppoe-server interface <interface> vlan <id | range>

   VLAN's can be created by Accel-ppp on the fly via the use of a Kernel module
   named `vlan_mon`, which is monitoring incoming vlans and creates the
   necessary VLAN if required and allowed. VyOS supports the use of either
   VLAN ID's or entire ranges, both values can be defined at the same time for
   an interface.

   When configured, PPPoE will create the necessary VLANs when required. Once
   the user session has been cancelled and the VLAN is not needed anymore, VyOS
   will remove it again.

.. code-block:: none

  set service pppoe-server interface eth3 vlan 100
  set service pppoe-server interface eth3 vlan 200
  set service pppoe-server interface eth3 vlan 500-1000
  set service pppoe-server interface eth3 vlan 2000-3000


Bandwidth Shaping
-----------------

Bandwidth rate limits can be set for local users or RADIUS based
attributes.

For Local Users
^^^^^^^^^^^^^^^

.. cfgcmd:: set service pppoe-server authentication local-users username <name>
   rate-limit <download | upload>

   Use this command to configure a data-rate limit to PPPOoE clients for
   traffic download or upload. The rate-limit is set in kbit/sec.

.. code-block:: none

  set service pppoe-server access-concentrator 'ACN'
  set service pppoe-server authentication local-users username foo password 'bar'
  set service pppoe-server authentication local-users username foo rate-limit download '20480'
  set service pppoe-server authentication local-users username foo rate-limit upload '10240'
  set service pppoe-server authentication mode 'local'
  set service pppoe-server client-ip-pool start '10.1.1.100'
  set service pppoe-server client-ip-pool stop '10.1.1.111'
  set service pppoe-server name-server '10.100.100.1'
  set service pppoe-server name-server '10.100.200.1'
  set service pppoe-server interface 'eth1'
  set service pppoe-server gateway-address '10.1.1.2'


Once the user is connected, the user session is using the set limits and
can be displayed via 'show pppoe-server sessions'.

.. code-block:: none

  show pppoe-server sessions
  ifname | username |     ip     |    calling-sid    | rate-limit  | state  |  uptime  | rx-bytes | tx-bytes
  -------+----------+------------+-------------------+-------------+--------+----------+----------+----------
  ppp0   | foo      | 10.1.1.100 | 00:53:00:ba:db:15 | 20480/10240 | active | 00:00:11 | 214 B    | 76 B


For RADIUS users
^^^^^^^^^^^^^^^^

The current attribute 'Filter-Id' is being used as default and can be
setup within RADIUS:

Filter-Id=2000/3000 (means 2000Kbit down-stream rate and 3000Kbit
up-stream rate)

The command below enables it, assuming the RADIUS connection has been
setup and is working.

.. cfgcmd:: set service pppoe-server authentication radius rate-limit enable

   Use this command to enable bandwidth shaping via RADIUS.

Other attributes can be used, but they have to be in one of the
dictionaries in */usr/share/accel-ppp/radius*.


Load Balancing
--------------


.. cfgcmd:: set service pppoe-server pado-delay <number-of-ms>
   sessions <number-of-sessions>

   Use this command to enable the delay of PADO (PPPoE Active Discovery
   Offer) packets, which can be used as a session balancing mechanism
   with other PPPoE servers.

.. code-block:: none

  set service pppoe-server pado-delay 50 sessions '500'
  set service pppoe-server pado-delay 100 sessions '1000'
  set service pppoe-server pado-delay 300 sessions '3000'

In the example above, the first 499 sessions connect without delay. PADO
packets will be delayed 50 ms for connection from 500 to 999, this trick
allows other PPPoE servers send PADO faster and clients will connect to
other servers. Last command says that this PPPoE server can serve only
3000 clients.


IPv6
----

IPv6 client's prefix assignment
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set service pppoe-server client-ipv6-pool prefix <address>
   mask <number-of-bits>

   Use this comand to set the IPv6 address pool from which a PPPoE
   client will get an IPv6 prefix of your defined length (mask) to
   terminate the PPPoE endpoint at their side. The mask length can be
   set from 48 to 128 bit long, the default value is 64.


IPv6 Prefix Delegation
^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set service pppoe-server client-ipv6-pool delegate <address>
   delegation-prefix <number-of-bits>

   Use this command to configure DHCPv6 Prefix Delegation (RFC3633). You
   will have to set your IPv6 pool and the length of the delegation
   prefix. From the defined IPv6 pool you will be handing out networks
   of the defined length (delegation-prefix). The length of the
   delegation prefix can be set from 32 to 64 bit long.


Maintenance mode
================

.. opcmd:: set pppoe-server maintenance-mode <enable | disable>

   For network maintenance, it's a good idea to direct users to a backup
   server so that the primary server can be safely taken out of service.
   It's possible to switch your PPPoE server to maintenance mode where
   it maintains already established connections, but refuses new
   connection attempts.


Checking connections
====================

.. opcmd:: show pppoe-server sessions

   Use this command to locally check the active sessions in the PPPoE
   server.


.. code-block:: none

  show pppoe-server sessions
  ifname | username |     ip     |    calling-sid    | rate-limit  | state  |  uptime  | rx-bytes | tx-bytes
  -------+----------+------------+-------------------+-------------+--------+----------+----------+----------
  ppp0   | foo      | 10.1.1.100 | 00:53:00:ba:db:15 | 20480/10240 | active | 00:00:11 | 214 B    | 76 B


Per default the user session is being replaced if a second
authentication request succeeds. Such session requests can be either
denied or allowed entirely, which would allow multiple sessions for a
user in the latter case. If it is denied, the second session is being
rejected even if the authentication succeeds, the user has to terminate
its first session and can then authentication again.

.. code-block:: none

  vyos@# set service pppoe-server session-control
    Possible completions:
    disable      Disables session control
    deny         Deny second session authorization






Examples
========

IPv4
----

The example below uses ACN as access-concentrator name, assigns an
address from the pool 10.1.1.100-111, terminates at the local endpoint
10.1.1.1 and serves requests only on eth1.

.. code-block:: none

  set service pppoe-server access-concentrator 'ACN'
  set service pppoe-server authentication local-users username foo password 'bar'
  set service pppoe-server authentication mode 'local'
  set service pppoe-server client-ip-pool start '10.1.1.100'
  set service pppoe-server client-ip-pool stop '10.1.1.111'
  set service pppoe-server interface eth1
  set service pppoe-server gateway-address '10.1.1.2'
  set service pppoe-server name-server '10.100.100.1'
  set service pppoe-server name-server '10.100.200.1'



Dual-Stack IPv4/IPv6 provisioning with Prefix Delegation
--------------------------------------------------------

The example below covers a dual-stack configuration via pppoe-server.

.. code-block:: none

  set service pppoe-server authentication local-users username test password 'test'
  set service pppoe-server authentication mode 'local'
  set service pppoe-server client-ip-pool start '192.168.0.1'
  set service pppoe-server client-ip-pool stop '192.168.0.10'
  set service pppoe-server client-ipv6-pool delegate '2001:db8:8003::/48' delegation-prefix '56'
  set service pppoe-server client-ipv6-pool prefix '2001:db8:8002::/48' mask '64'
  set service pppoe-server ppp-options ipv6 allow
  set service pppoe-server name-server '10.1.1.1'
  set service pppoe-server name-server '2001:db8:4860::8888'
  set service pppoe-server interface 'eth2'
  set service pppoe-server gateway-address '10.100.100.1'

The client, once successfully authenticated, will receive an IPv4 and an
IPv6 /64 address to terminate the pppoe endpoint on the client side and
a /56 subnet for the clients internal use.

.. code-block:: none

  vyos@pppoe-server:~$ sh pppoe-server sessions
   ifname | username |     ip      |            ip6           |       ip6-dp        |    calling-sid    | rate-limit | state  |  uptime  | rx-bytes | tx-bytes
  --------+----------+-------------+--------------------------+---------------------+-------------------+------------+--------+----------+----------+----------
   ppp0   | test     | 192.168.0.1 | 2001:db8:8002:0:200::/64 | 2001:db8:8003::1/56 | 00:53:00:12:42:eb |            | active | 00:00:49 | 875 B    | 2.1 KiB

.. include:: /_include/common-references.txt
