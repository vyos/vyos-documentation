.. _dhcp:

#############
DHCP / DHCPv6
#############

VyOS uses ISC DHCPd for both IPv4 and IPv6 address assignment.

DHCP Server
===========

Multiple DHCP Servers can be run from a single machine. Each DHCP service is
identified by a ``shared-network-name``.

Basic Example
-------------

We are offering address space in the 192.0.2.0/24 network, which is
physically connected on eth1, and pppoe0 is our connection to the internet.
We are using the network name ``<name>``.

Prerequisites:

* Configuring PPPoE interface is assumed to be done already, and appears
  on `pppoe0`
* Interface ``eth1`` is configured to be connected to our DHCP subnet
  192.0.2.0/24 by assigning e.g. address 192.0.2.1/24.

Multiple DHCP ranges can be defined and may contain holes.

.. code-block:: none

  set service dhcp-server shared-network-name '<name>' authoritative
  set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 default-router 192.0.2.1
  set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 dns-server 192.0.2.1
  set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 lease 86400
  set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 range 0 start 192.0.2.100
  set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 range 0 stop 192.0.2.199

The generated config will look like:

.. code-block:: none

  vyos@vyos# show service dhcp-server shared-network-name '<name>'
  authoritative
  subnet 192.0.2.0/24 {
      default-router 192.0.2.1
      dns-server 192.0.2.1
      lease 86400
      range 0 {
          start 192.0.2.100
          stop 192.0.2.199
      }
  }


Explanation
^^^^^^^^^^^

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' authoritative

This says that this device is the only DHCP server for this network. If other
devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
any device trying to request an IP address that is
not valid for this network.

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 default-router 192.0.2.1

This is a configuration parameter for the subnet, saying that as part of the
response, tell the client that I am the default router for this network

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 dns-server 192.0.2.1

This is a configuration parameter for the subnet, saying that as part of the
response, tell the client that I am the DNS server for this network. If you
do not want to run a DNS server, you could also provide one of the public
DNS servers, such as google's. You can add multiple entries by repeating the
line.

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 lease 86400

Assign the IP address to this machine for 24 hours. It is unlikely you'd need
to shorten this period, unless you are running a network with lots of devices
appearing and disappearing.

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 range 0 start 192.0.2.100

Make a range of addresses available for clients starting from .100 [...]

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 range 0 stop 192.0.2.199

[...] and ending at .199


Failover
--------

VyOS provides support for DHCP failover:

.. code-block:: none

  set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' \
      failover local-address '192.0.2.1'
  set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' \
      failover name 'foo'
  set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' \
      failover peer-address '192.0.2.2'

.. note:: `name` must be identical on both sides!

The primary and secondary statements determines whether the server is
primary or secondary

.. code-block:: none

  set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' \
      failover status 'primary'

or

.. code-block:: none

  set service dhcp-server shared-network-name 'LAN' subnet '192.0.2.0/24' \
      failover status 'secondary'

.. note:: In order for the primary and the secondary DHCP server to keep
   their lease tables in sync, they must be able to reach each other on TCP
   port 647. If you have firewall rules in effect, adjust them accordingly.

Static mappings
---------------

You can specify a static DHCP assignment on a per host basis. You will need the
MAC address of the station and your desired IP address. The address must be
inside your subnet definition but can be outside of your range sttement.


.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 static-mapping <host> ip-address 192.0.2.10

Configure desired IPv4 address for your host referenced to as `host`.

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 static-mapping <hodt> mac-address ff:ff:ff:ff:ff:ff

Configure MAC address for your host referenced by as `host` used in this static
assignment.

DHCP Options
------------

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 default-router '<address>'

Specify the default routers IPv4 address which should be used in this subnet.
This can - of course - be a VRRP address (DHCP option 003).

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 dns-server '<address>'

Specify the DNS nameservers used (Option 006). This option may be used mulltiple
times to specify additional DNS nameservers.

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 domain-name '<domain-name>'

The domain-name parameter should be the domain name that will be appended to
the client's hostname to form a fully-qualified domain-name (FQDN) (DHCP
Option 015).

.. cfgcmd:: set service dhcp-server shared-network-name '<name>' subnet 192.0.2.0/24 domain-search '<domain-name>'

The domain-name parameter should be the domain name used when completing DNS
request where no full FQDN is passed. This option can be given multiple times
if you need multiple search domains (DHCP Option 119).


DHCPv6 Server
=============

VyOS also provides DHCPv6 server functionality which is described in this
section.

Configuration Options
---------------------

.. cfgcmd:: set service dhcpv6-server preference <preference value>

Clients receiving advertise messages from multiple servers choose the server
with the highest preference value. The range for this value is ``0...255``.


.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' lease-time {default | maximum | minimum}

The default lease time for DHCPv6 leases is 24 hours. This can be changed by
supplying a ``default-time``, ``maximum-time`` and ``minimum-time``. All values
need to be supplied in seconds.

.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' nis-domain '<domain-name>'

A :abbr:`NIS (Network Information Service)` domain can be set to be used for
DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' nisplus-domain '<domain-name>'

The procedure to specify a :abbr:`NIS+ (Network Information Service Plus)`
domain is similar to the NIS domain one:

.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' nis-server '<address>'

Specify a NIS server address for DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' nisplus-server '<address>'

Specify a NIS+ server address for DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' sip-server-address '<address>'

Specify a :abbr:`SIP (Session Initiation Protocol)` server by IPv6 address for
all DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' sip-server-name '<fqdn>'

Specify a :abbr:`SIP (Session Initiation Protocol)` server by FQDN for all
DHCPv6 clients.

.. cfgcmd:: set service dhcpv6-server shared-network-name '<name>' subnet '<v6net>' sntp-server-address '<address>'

A SNTP server address can be specified for DHCPv6 clients:

Address pools
-------------

DHCPv6 address pools must be configured for the system to act as a DHCPv6
server. The following example describes a common scenario.

**Example:**

* A shared network named ``NET1`` serves subnet ``2001:db8::/64``
* It is connected to ``eth1``
* DNS server is located at ``2001:db8::ffff``
* Address pool shall be ``2001:db8::100`` through ``2001:db8::199``.
* Lease time will be left at the default value which is 24 hours

.. code-block:: none

  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 \
      address-range start 2001:db8::100 stop 2001:db8::199
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 \
      name-server 2001:db8::ffff

The configuration will look as follows:

.. code-block:: none

  show service dhcpv6-server
      shared-network-name NET1 {
          subnet 2001:db8::/64 {
             address-range {
                start 2001:db8::100 {
                   stop 2001:db8::199
                }
             }
             name-server 2001:db8::ffff
          }
      }

Static mappings
^^^^^^^^^^^^^^^

In order to map specific IPv6 addresses to specific hosts static mappings can
be created. The following example explains the process.

**Example:**

* IPv6 address ``2001:db8::101`` shall be statically mapped
* Device MAC address will be ``00:53:c5:b7:5e:23``
* Host specific mapping shall be named ``client1``

.. hint:: The MAC address identifier is defined by the last 4 byte of the
   MAC address.

.. code-block:: none

  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 \
      static-mapping client1 ipv6-address 2001:db8::101
  set service dhcpv6-server shared-network-name 'NET1' subnet 2001:db8::/64 \
      static-mapping client1 identifier c5b75e23

The configuration will look as follows:

.. code-block:: none

  show service dhcp-server shared-network-name NET1
     shared-network-name NET1 {
         subnet 2001:db8::/64 {
            name-server 2001:db8:111::111
            address-range {
                start 2001:db8::100 {
                   stop 2001:db8::199 {
                }
            }
            static-mapping client1 {
               ipv6-address 2001:db8::101
               identifier c5b75e23
            }
         }
      }


Operation Mode
--------------

.. opcmd:: restart dhcpv6 server

To restart the DHCPv6 server

.. opcmd:: show dhcpv6 server status

To show the current status of the DHCPv6 server.

.. opcmd:: show dhcpv6 server leases

Show statuses of all assigned leases:


DHCP Relay
==========

If you want your router to forward DHCP requests to an external DHCP server
you can configure the system to act as a DHCP relay agent. The DHCP relay
agent works with IPv4 and IPv6 addresses.

All interfaces used for the DHCP relay must be configured. See
https://wiki.vyos.net/wiki/Network_address_setup.


Configuration
-------------

.. cfgcmd:: set service dhcp-relay interface '<interface>'

Enable the DHCP relay service on the given interface.

.. cfgcmd:: set service dhcp-relay server 10.0.1.4

Configure IP address of the DHCP server

.. cfgcmd:: set service dhcp-relay relay-options relay-agents-packets discard

The router should discard DHCP packages already containing relay agent
information to ensure that only requests from DHCP clients are forwarded.

Example
-------

* Use interfaces ``eth1`` and ``eth2`` for DHCP relay
* Router receives DHCP client requests on ``eth1`` and relays them through
  ``eth2``
* DHCP server is located at IPv4 address 10.0.1.4.

.. figure:: /_static/images/service_dhcp-relay01.png
   :scale: 80 %
   :alt: DHCP relay example

   DHCP relay example

The generated configuration will look like:

.. code-block:: none

  show service dhcp-relay
      interface eth1
      interface eth2
      server 10.0.1.4
      relay-options {
         relay-agents-packets discard
      }

Options
-------

.. cfgcmd:: set service dhcp-relay relay-options hop-count 'count'

Set the maximum hop count before packets are discarded. Range 0...255,
default 10.

.. cfgcmd:: set service dhcp-relay relay-options max-size 'size'

Set maximum size of DHCP packets including relay agent information. If a
DHCP packet size surpasses this value it will be forwarded without appending
relay agent information. Range 64...1400, default 576.

.. cfgcmd:: set service dhcp-relay relay-options relay-agents-packet 'policy'

Four policies for reforwarding DHCP packets exist:

* **append:** The relay agent is allowed to append its own relay information
  to a received DHCP packet, disregarding relay information already present in
  the packet.

* **discard:** Received packets which already contain relay information will
  be discarded.

* **forward:** All packets are forwarded, relay information already present
  will be ignored.

* **replace:** Relay information already present in a packet is stripped and
  replaced with the router's own relay information set.

Operation
---------

.. opcmd:: restart dhcp relay-agent

Restart DHCP relay service

DHCPv6 relay
============

Configuration
-------------

.. cfgcmd:: set service dhcpv6-relay listen-interface eth1

Set eth1 to be the listening interface for the DHCPv6 relay:

.. cfgcmd:: set service dhcpv6-relay upstream-interface eth2 address 2001:db8::4

Set eth2 to be the upstream interface and specify the IPv6 address of
the DHCPv6 server:

Example
^^^^^^^

* DHCPv6 requests are received by the router on `listening interface` ``eth1``
* Requests are forwarded through ``eth2`` as the `upstream interface`
* External DHCPv6 server is at 2001:db8::4

.. figure:: /_static/images/service_dhcpv6-relay01.png
   :scale: 80 %
   :alt: DHCPv6 relay example

   DHCPv6 relay example

The generated configuration will look like:

.. code-block:: none

  commit
  show service dhcpv6-relay
      listen-interface eth1 {
      }
      upstream-interface eth2 {
         address 2001:db8::4
      }

Options
-------

.. cfgcmd:: set service dhcpv6-relay max-hop-count 'count'

Set maximum hop count before packets are discarded, default: 10

.. cfgcmd:: set service dhcpv6-relay use-interface-id-option

If this is set the relay agent will insert the interface ID. This option is
set automatically if more than one listening interfaces are in use.

Operation
---------

.. opcmd:: show dhcpv6 relay-agent status

Show the current status of the DHCPv6 relay agent:

.. opcmd:: restart dhcpv6 relay-agent

Restart DHCPv6 relay agent immediately.
