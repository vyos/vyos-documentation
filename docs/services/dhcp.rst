.. _dhcp:

########
DHCP(v6)
########

VyOS uses ISC DHCPd for both IPv4 and IPv6 address assignment.

DHCP Server
===========

Multiple DHCP Servers can be run from a single machine. Each DHCP service is
identified by a ``shared-network-name``.

Basic Example
-------------

We are offering address space in the 172.16.17.0/24 network, which is
physically connected on eth1, and pppoe0 is our connection to the internet.
We are using the network name `dhcpexample`.

Prerequisites:

* Configuring PPPoE interface is assumed to be done already, and appears
  on `pppoe0`
* Interface ``eth1`` is configured to be connected to our DHCP subnet
  172.16.17.0/24 by assigning e.g. address 172.16.17.1/24.

Multiple DHCP ranges can be defined and may contain holes.

.. code-block:: sh

  set service dhcp-server shared-network-name dhcpexample authoritative
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 default-router 172.16.17.1
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 dns-server 172.16.17.1
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 lease 86400
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 start 172.16.17.100
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 stop 172.16.17.199


Explanation
^^^^^^^^^^^

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample authoritative

  This says that this device is the only DHCP server for this network. If other
  devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
  any device trying to request an IP address that is
  not valid for this network.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 default-router 172.16.17.1

  This is a configuration parameter for the subnet, saying that as part of the
  response, tell the client that I am the default router for this network

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 dns-server 172.16.17.1

  This is a configuration parameter for the subnet, saying that as part of the
  response, tell the client that I am the DNS server for this network. If you
  do not want to run a DNS server, you could also provide one of the public
  DNS servers, such as google's. You can add multiple entries by repeating the
  line.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 lease 86400

  Assign the IP address to this machine for 24 hours. It is unlikely you'd need
  to shorten this period, unless you are running a network with lots of devices
  appearing and disappearing.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 start 172.16.17.100

  Make a range of addresses available for clients starting from .100 [...]

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 stop 172.16.17.199

  [...] and ending at .199


Failover
--------

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

Static mappings
---------------

You can specify a static DHCP assignment on a per host basis. You will need the
MAC address of the station and your desired IP address. The address must be
inside your subnet definition but can be outside of your range sttement.


.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 static-mapping <host> ip-address 172.16.17.10

Configure desired IPv4 address for your host referenced to as `host`.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 static-mapping <hodt> mac-address ff:ff:ff:ff:ff:ff

Configure MAC address for your host referenced by as `host` used in this static
assignment.

DHCP Options
------------

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 default-router '<address>'

Specify the default routers IPv4 address which should be used in this subnet.
This can - of course - be a VRRP address (DHCP option 003).

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 dns-server '<address>'

Specify the DNS nameservers used (Option 006). This option may be used mulltiple
times to specify additional DNS nameservers.

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 domain-name '<domain-name>'

The domain-name parameter should be the domain name that will be appended to
the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
Option 015).

.. cfgcmd:: set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 domain-search '<domain-name>'

The domain-name parameter should be the domain name used when completing DNS
request where no full FQDN is passed. This option can be given multiple times
if you need multiple search domains (DHCP Option 119).
