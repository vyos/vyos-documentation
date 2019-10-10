
DHCP Server
-----------

Multiple DHCP Servers can be run from a single machine. Each DHCP service is
identified by a `shared-network-name`.

DHCP Server Example
^^^^^^^^^^^^^^^^^^^

In this example, we are offering address space in the 172.16.17.0/24 network,
which is on eth1, and pppoe0 is our connection to the internet. We are using
the network name `dhcpexample`.

Prerequisites
^^^^^^^^^^^^^

Configuring the PPPoE interface is assumed to be done already, and appears
on `pppoe0`

Interface Configuration
^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: sh

 set interface ethernet eth1 address 172.16.17.1/24

Multiple ranges can be defined and can contain holes.

.. code-block:: sh

  set service dhcp-server shared-network-name dhcpexample authoritative
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 default-router 172.16.17.1
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 dns-server 172.16.17.1
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 lease 86400
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 start 172.16.17.100
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 stop 172.16.17.199


Explanation
^^^^^^^^^^^

* :code:`set service dhcp-server shared-network-name dhcpexample authoritative`

  This says that this device is the only DHCP server for this network. If other
  devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
  any device trying to request an IP address that is
  not valid for this network.

* :code:`set service dhcp-server shared-network-name dhcpexample subnet
  172.16.17.0/24 default-router 172.16.17.1`

  This is a configuration parameter for the subnet, saying that as part of the
  response, tell the client that I am the default router for this network

* :code:`set service dhcp-server shared-network-name dhcpexample subnet
  172.16.17.0/24 dns-server 172.16.17.1`

  This is a configuration parameter for the subnet, saying that as part of the
  response, tell the client that I am the DNS server for this network. If you
  do not want to run a DNS server, you could also provide one of the public
  DNS servers, such as google's. You can add multiple entries by repeating the
  line.

* :code:`set service dhcp-server shared-network-name dhcpexample subnet
  172.16.17.0/24 lease 86400`

  Assign the IP address to this machine for 24 hours. It is unlikely you'd need
  to shorten this period, unless you are running a network with lots of devices
  appearing and disappearing.


* :code:`set service dhcp-server shared-network-name dhcpexample subnet
  172.16.17.0/24 range 0 start 172.16.17.100`

  Make a range of addresses available for clients starting from .100 [...]

* :code:`set service dhcp-server shared-network-name dhcpexample subnet
  172.16.17.0/24 range 0 stop 172.16.17.199`

  [...] and ending at .199


Failover
^^^^^^^^

VyOS provides support for DHCP failover:

.. code-block:: sh

  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover local-address '192.168.0.1'
  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover name 'foo'
  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover peer-address '192.168.0.2'

.. note:: `name` must be identical on both sides!

The primary and secondary statements determines whether the server is
primary or secondary

.. code-block:: sh

  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover status 'primary'

or

.. code-block:: sh

  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover status 'secondary'

.. note:: In order for the primary and the secondary DHCP server to keep
   their lease tables in sync, they must be able to reach each other on TCP
   port 647. If you have firewall rules in effect, adjust them accordingly.

Static mappings MAC/IP
^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: sh

  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 static-mapping static-mapping-01 ip-address 172.16.17.10
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 static-mapping static-mapping-01 mac-address ff:ff:ff:ff:ff:ff

DHCP server options
^^^^^^^^^^^^^^^^^^^^^^^^^

default-router (DHCP option 003)
  :code:`set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 default-router <ROUTER-IP>`

dns-server (DHCP option 006)
  :code:`set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 dns-server <DNS-SERVER-IP>`

domain-name  Client domain name (DHCP option 015)
  :code:`set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 domain-name "<DOMAIN-NAME>"`

domain-search (DHCP option 119)
  This option can be given multiple times if you need multiple search domains
  :code:`set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 domain-search "<DOMAIN_NAME_1>"`
  :code:`set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 domain-search "<DOMAIN_NAME_2>"`

