IPoE server
------------

VyOS utilizes `accel-ppp`_ to provide IPoE server functionality. It can be
used with local authentication (mac-address) or a connected RADIUS server.

.. note:: **Please be aware, due to an upstream bug, config changes/commits
   will restart the ppp daemon and will reset existing IPoE sessions,
   in order to become effective.**

Configuration
^^^^^^^^^^^^^

IPoE can be configure on different interfaces, it will depend on each specific situation which interface will provide IPoE to clients.
The clients mac address and the incoming interface is being used as control parameter, to authenticate a client.

The example comnfiguration below will assign an IP to the client on the incoming interface eth2 with the client mac address 08:00:27:2f:d8:06.
Other DHCP discovery requests will be ignored, unless the client mac has been enabled in the configuration.

.. code-block:: sh

  set service ipoe-server authentication interface eth2 mac-address 08:00:27:2f:d8:06
  set service ipoe-server authentication mode 'local'
  set service ipoe-server dns-server server-1 '8.8.8.8'
  set service ipoe-server dns-server server-2 '8.8.4.4'
  set service ipoe-server interface eth2 client-subnet '192.168.0.0/24'


The first address of the paramter ``client-subnet``, will be used as the default gateway. 
Connected sessions can be checked via the ``show ipoe-server sessions`` command.

.. code-block:: sh

  vyos@vyos:~$ show ipoe-server sessions

  ifname | called-sid |    calling-sid    |     ip      | ip6 | ip6-dp | rate-limit | state  |  uptime  |        sid
  -------+------------+-------------------+-------------+-----+--------+------------+--------+----------+------------------
  ipoe0  | eth2       | 08:00:27:2f:d8:06 | 192.168.0.2 |     |        |            | active | 00:45:05 | dccc870fd3134612


IPv6 SLAAC and IA-PD
====================

To configure IPv6 assignments for clients, two options need to be configured. A global prefix which is terminated on the clients cpe and a delegated prefix, the client can use
for devices routed via the clients cpe.

IPv6 DNS addresses are optional.

.. code-block:: sh

  set service ipoe-server authentication interface eth3 mac-address 08:00:27:2F:D8:06
  set service ipoe-server authentication mode 'local'
  set service ipoe-server client-ipv6-pool delegate-prefix '2001:db8:1::/48,56'
  set service ipoe-server client-ipv6-pool prefix '2001:db8::/48,64'
  set service ipoe-server dnsv6-server server-1 '2001:db8::'
  set service ipoe-server dnsv6-server server-2 '2001:db8:aaa::'
  set service ipoe-server dnsv6-server server-3 '2001:db8:bbb::'
  set service ipoe-server interface eth3 client-subnet '192.168.1.0/24'

.. code-block:: sh

  vyos@ipoe-server# run sh ipoe-server sessions 
  ifname | called-sid |    calling-sid    |     ip      |               ip6               | ip6-dp          | rate-limit | state  |  uptime  |        sid       
  -------+------------+-------------------+-------------+---------------------------------+-----------------+------------+--------+----------+------------------
  ipoe0  | eth3       | 08:00:27:2f:d8:06 | 192.168.1.2 | 2001:db8::a00:27ff:fe2f:d806/64 | 2001:db8:1::/56 |            | active | 01:02:59 | 4626faf71b12cc25  


The clients cpe can now communicate via IPv4 or IPv6. All devices behind ``2001:db8::a00:27ff:fe2f:d806/64`` can use addresses from ``2001:db8:1::/56`` and can
globally communicate without the need of any NAT rules.


Automatic VLAN creation
=======================

To create VLANs per user during runtime, the follwing settings are required on a per interface basis. VLAN ID and VLAN range can be present in the configuration at the same time.

.. code-block:: sh

  set service ipoe-server interface eth2 network vlan
  set service ipoe-server interface eth2 vlan-id 100
  set service ipoe-server interface eth2 vlan-id 200
  set service ipoe-server interface eth2 vlan-range 1000-2000
  set service ipoe-server interface eth2 vlan-range 2500-2700


RADIUS Setup
^^^^^^^^^^^^

To use a RADIUS server for authentication and bandwidth-shaping, the following example configuration can be used.

.. code-block:: sh

  set service ipoe-server authentication mode 'radius'
  set service ipoe-server authentication radius-server 10.100.100.1 secret 'password'


Bandwidth Shaping
^^^^^^^^^^^^^^^^^

Bandwidth rate limits can be set for local users within the configuration or via RADIUS based attributes.


Bandwidth Shaping for local users 
=================================

The rate-limit is set in kbit/sec.

.. code-block:: sh

  set service ipoe-server authentication interface eth2 mac-address 08:00:27:2f:d8:06 rate-limit download '500'
  set service ipoe-server authentication interface eth2 mac-address 08:00:27:2f:d8:06 rate-limit upload '500'
  set service ipoe-server authentication mode 'local'
  set service ipoe-server dns-server server-1 '8.8.8.8'
  set service ipoe-server dns-server server-2 '8.8.4.4'
  set service ipoe-server interface eth2 client-subnet '192.168.0.0/24'


.. code-block:: sh

  vyos@vyos# run show ipoe-server sessions 

  ifname | called-sid |    calling-sid    |     ip      | ip6 | ip6-dp | rate-limit | state  |  uptime  |        sid       
  -------+------------+-------------------+-------------+-----+--------+------------+--------+----------+------------------
  ipoe0  | eth2       | 08:00:27:2f:d8:06 | 192.168.0.2 |     |        | 500/500    | active | 00:00:05 | dccc870fd31349fb




.. _`accel-ppp`: https://accel-ppp.org/
