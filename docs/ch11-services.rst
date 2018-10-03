Services
========

DHCP
----

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

 set interface eth1 address 172.16.17.1/24

Multiple ranges can be defined and can contain holes.

.. code-block:: sh

  set service dhcp-server shared-network-name dhcpexample authoritative
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 default-router 172.16.17.1
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 dns-server 172.16.17.1
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 lease 86400
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 start 172.16.17.100
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 range 0 stop 172.16.17.199

Failover
^^^^^^^^

VyOS provides support for DHCP failover:

.. code-block:: sh

  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover local-address '192.168.0.1'
  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover name 'foo'
  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover peer-address '192.168.0.2'

**NOTE:** `name` must be identical on both sides!

The primary and secondary statements determines whether the server is primary or secondary

.. code-block:: sh

  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover status 'primary'

or

.. code-block:: sh

  set service dhcp-server shared-network-name 'LAN' subnet '192.168.0.0/24' failover status 'secondary'

**NOTE:** In order for the primary and the secondary DHCP server to keep their
lease tables in sync, they must be able to reach each other on TCP port 647.
If you have firewall rules in effect, adjust them accordingly.

Static mappings MAC/IP
^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: sh

  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 static-mapping static-mapping-01 ip-address 172.16.17.10
  set service dhcp-server shared-network-name dhcpexample subnet 172.16.17.0/24 static-mapping static-mapping-01 mac-address ff:ff:ff:ff:ff:ff

Explanation
^^^^^^^^^^^

:code:`set service dhcp-server shared-network-name dhcpexample authoritative`
This says that this device is the only DHCP server for this network. If other
devices are trying to offer DHCP leases, this machine will send 'DHCPNAK' to
any device trying to request an IP address that is not valid for this network.

:code:`set service dhcp-server shared-network-name dhcpexample subnet
172.16.17.0/24 default-router 172.16.17.1` This is a configuration parameter
for the subnet, saying that as part of the response, tell the client that I am
the default router for this network

:code:`set service dhcp-server shared-network-name dhcpexample subnet
172.16.17.0/24 dns-server 172.16.17.1` This is a configuration parameter for
the subnet, saying that as part of the response, tell the client that I am the
DNS server for this network. If you do not want to run a DNS server, you could
also provide one of the public DNS servers, such as google's. You can add
multiple entries by repeating the line.

:code:`set service dhcp-server shared-network-name dhcpexample subnet
172.16.17.0/24 lease 86400` Assign the IP address to this machine for 24
hours. It is unlikely you'd need to shorten this period, unless you are running
a network with lots of devices appearing and disappearing.

:code:`set service dhcp-server shared-network-name dhcpexample subnet
172.16.17.0/24 start 172.16.17.100 stop 172.16.17.199` Make the IP Addresses
between .100 and .199 available for clients.

DHCPv6 server
-------------

VyOS provides DHCPv6 server functionality which is described in this section.
In order to use the DHCPv6 server it has to be enabled first:

.. code-block:: sh

  set service dhcpv6-server

To restart the DHCPv6 server (operational mode):

.. code-block:: sh

  restart dhcpv6 server

To show the current status of the DHCPv6 server use:

.. code-block:: sh

  show dhcpv6 server status

Show statuses of all assigned leases:

.. code-block:: sh

  show dhcpv6 server leases

DHCPv6 server options
^^^^^^^^^^^^^^^^^^^^^

DHCPv6 server preference value
******************************

Clients receiving advertise messages from multiple servers choose the server
with the highest preference value. The range for this value is `0...255`. Set
a preference value for the DHCPv6 server:

.. code-block:: sh

  set service dhcpv6-server preference <preference value>

Delete a preference:

.. code-block:: sh

  set service dhcpv6-server preference

Show current preference:

.. code-block:: sh

  show service dhcpv6-server preference

Specify address lease time
**************************

The default lease time for DHCPv6 leases is 24 hours. This can be changed by
supplying a `default-time`, `maximum-time` and `minimum-time` (all values in
seconds):

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> lease-time {default <default-time> | maximum <maximum-time> | minimum <minimum-time>}

Reset the custom lease times:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> lease-time {default | maximum | minimum}

Show the current configuration:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> lease-time {default | maximum | minimum}

Specify NIS domain
******************

A Network Information (NIS) domain can be set to be used for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-domain <nis-domain-name>

To Delete the NIS domain:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-domain <nis-domain-name>

Show a configured NIS domain:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-domain <nis-domain-name>

Specify NIS+ domain
*******************

The procedure to specify a Network Information Service Plus (NIS+) domain is
similar to the NIS domain one:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-domain <nisplus-domain-name>

To Delete the NIS+ domain:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-domain <nisplus-domain-name>

Show a configured NIS domain:

 # show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-domain <nisplus-domain-name>

Specify NIS server address
**************************

To specify a NIS server address for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-server <IPv6 address>

Delete a specified NIS server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-server <IPv6 address>

Show specified NIS server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-server

Specify NIS+ server address
***************************

To specify a NIS+ server address for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-server <IPv6 address>

Delete a specified NIS+ server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-server <IPv6 address>

Show specified NIS+ server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-server

Specify a SIP server address for DHCPv6 clients
***********************************************

By IPv6 address
###############


A Session Initiation Protocol (SIP) server address can be specified for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-address <IPv6 address>

Delete a specified SIP server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-address <IPv6 address>

Show specified SIP server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-address

By FQDN
#######

A name for SIP server can be specified:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-name <sip-server-name>

Delete a specified SIP server name:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-name <sip-server-name>

Show specified SIP server names:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-name

Simple Network Time Protocol (SNTP) server address for DHCPv6 clients
*********************************************************************

A SNTP server address can be specified for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> sntp-server-address <IPv6 address>

Delete a specified SNTP server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> sntp-server-address <IPv6 address>

Show specified SNTP server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> sntp-server-address

DHCPv6 address pools
^^^^^^^^^^^^^^^^^^^^

DHCPv6 address pools must be configured for the system to act as a DHCPv6
server. The following example describes a common scenario.

Example 1: DHCPv6 address pool
******************************

A shared network named `NET1` serves subnet `2001:db8:100::/64` which is
connected to `eth1`, a DNS server at `2001:db8:111::111` is used for name
services. The range of the address pool shall be `::100` through `::199`. The
lease time will be left at the default value which is 24 hours.

.. code-block:: sh

  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 address-range start 2001:db8:100::100 stop 2001:db8:100::199
  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 name-server 2001:db8:111::111

Commit the changes and show the configuration:

.. code-block:: sh

  commit
  show service dhcpv6-server
      shared-network-name NET1 {
          subnet 2001:db8:100::/64 {
             address-range {
                start 2001:db8:100::100 {
                   stop 2001:db8:100::199
                }
             }
             name-server 2001:db8:111::111
          }
      }

Static mappings
^^^^^^^^^^^^^^^

In order to map specific IPv6 addresses to specific hosts static mappings can
be created. The following example explains the process.

Example 1: Static IPv6 MAC-based mapping
****************************************

IPv6 address `2001:db8:100::101` shall be statically mapped to a device with
MAC address `00:15:c5:b7:5e:23`, this host-specific mapping shall be named
`client1`. **NOTE:** The MAC address identifier is defined by the last 4 byte
of the MAC address.

.. code-block:: sh

  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 static-mapping client1 ipv6-address 2001:db8:100::101
  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 static-mapping client1 identifier c5b75e23

Commit the changes and show the configuration:

.. code-block:: sh

  show service dhcp-server shared-network-name NET1
     shared-network-name NET1 {
         subnet 2001:db8:100::/64 {
            name-server 2001:db8:111::111
            address-range {
                start 2001:db8:100::100 {
                   stop 2001:db8:100::199 {
                }
            }
            static-mapping client1 {
               ipv6-address 2001:db8:100::101
               identifier c5b75e23
            }
         }
      }


DHCP Relay
----------

If you want your router to forward DHCP requests to an external DHCP server
you can configure the system to act as a DHCP relay agent. The DHCP relay
agent works with IPv4 and IPv6 addresses.

All interfaces used for the DHCP relay must be configured. See
https://wiki.vyos.net/wiki/Network_address_setup.

DHCP relay example
^^^^^^^^^^^^^^^^^^

.. figure:: images/service_dhcp-relay01.png
   :scale: 80 %
   :alt: DHCP relay example

   DHCP relay example

In this example the interfaces used for the DHCP relay are eth1 and eth2. The
router receives DHCP client requests on eth1 and relays them through eth2 to
the DHCP server at 10.0.1.4.

Configuration
^^^^^^^^^^^^^

Enable DHCP relay for eth1 and eth2:

.. code-block:: sh

  set service dhcp-relay interface eth1
  set service dhcp-relay interface eth2

Set the IP address of the DHCP server:

.. code-block:: sh

  set service dhcp-relay server 10.0.1.4

The router should discard DHCP packages already containing relay agent
information to ensure that only requests from DHCP clients are forwarded:

.. code-block:: sh

  set service dhcp-relay relay-options relay-agents-packets discard

Commit the changes and show the results:

.. code-block:: sh

  commit
  show service dhcp-relay
      interface eth1
      interface eth2
      server 10.0.1.4
      relay-options {
         relay-agents-packets discard
      }

The DHCP relay agent can be restarted with:

.. code-block:: sh

  restart dhcp relay-agent

DHCPv6 relay example
^^^^^^^^^^^^^^^^^^^^

.. figure:: images/service_dhcpv6-relay01.png
   :scale: 80 %
   :alt: DHCPv6 relay example

   DHCPv6 relay example

In this example DHCPv6 requests are received by the router on eth1 (`listening
interface`) and forwarded through eth2 (`upstream interface`) to the external
DHCPv6 server at 2001:db8:100::4.

Configuration
*************

Set eth1 to be the listening interface for the DHCPv6 relay:

.. code-block:: sh

  set service dhcpv6-relay listen-interface eth1

Set eth2 to be the upstream interface and specify the IPv6 address of the DHCPv6 server:

.. code-block:: sh

  set service dhcpv6-relay upstream-interface eth2 address 2001:db8:100::4

Commit the changes and show results:

.. code-block:: sh

  commit
  show service dhcpv6-relay
      listen-interface eth1 {
      }
      upstream-interface eth2 {
         address 2001:db8:100::4
      }

Show the current status of the DHCPv6 relay agent:

.. code-block:: sh

  show dhcpv6 relay-agent status

The DHCPv6 relay agent can be restarted with:

.. code-block:: sh

  restart dhcpv6 relay-agent

Additional parameters
^^^^^^^^^^^^^^^^^^^^^

DHCP relay agent options
************************

Set the maximum hop count before packets are discarded. Range 0...255,
default 10.

* :code:`set service dhcp-relay relay-options hop-count 'count'`

Set maximum size of DHCP packets including relay agent information. If a
DHCP packet size surpasses this value it will be forwarded without appending
relay agent information. Range 64...1400, default 576.

* :code:`set service dhcp-relay relay-options max-size 'size'`

Set the port used to relay DHCP client messages. Range 1...65535, default 67.
After setting a different port, requests are still accepted on port 67 but
replies are forwarded to 255.255.255.255 port 0 instead of 68.

* :code:`set service dhcp-relay relay-options port 'port'`

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

* :code:`set service dhcp-relay relay-options relay-agents-packet 'policy'`

DHCPv6 relay agent options
**************************

Set listening port for DHCPv6 requests. Default: 547.

* :code:`set service dhcpv6-relay listen-port 'port'`

Set maximum hop count before packets are discarded. Default: 10.

* :code:`set service dhcpv6-relay max-hop-count 'count'`

If this is set the relay agent will insert the interface ID. This option is
set automatically if more than one listening interfaces are in use.

* :code:`set service dhcpv6-relay use-interface-id-option`

DNS Forwarding
--------------

Use DNS forwarding if you want your router to function as a DNS server for the
local network. There are several options, the easiest being 'forward all
traffic to the system DNS server(s)' (defined with set system name-server):

.. code-block:: sh

  set service dns forwarding system

Manually setting DNS servers for forwarding:

.. code-block:: sh

  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4

Manually setting DNS servers with IPv6 connectivity:

.. code-block:: sh

  set service dns forwarding name-server 2001:4860:4860::8888
  set service dns forwarding name-server 2001:4860:4860::8844

Setting a forwarding DNS server for a specific domain:

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1

Example 1
^^^^^^^^^

Router with two interfaces eth0 (WAN link) and eth1 (LAN). A DNS server for the
local domain (example.com) is at 192.0.2.1, other DNS requests are forwarded
to Google's DNS servers.

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding listen-on 'eth1'

Example 2
^^^^^^^^^

Same as example 1 but with additional IPv6 addresses for Google's public DNS
servers:

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding name-server 2001:4860:4860::8888
  set service dns forwarding name-server 2001:4860:4860::8844
  set service dns forwarding listen-on 'eth1'

Dynamic DNS
-----------

VyOS is able to update a remote DNS record when an interface gets a new IP
address. In order to do so, VyOS includes ddclient_, a perl script written for
this exact purpose.

ddclient_ uses two methods to update a DNS record. The first one will send
updates directly to the DNS daemon, in compliance with RFC2136_. The second
one involves a third party service, like DynDNS.com or any other similar
website. This method uses HTTP requests to transmit the new IP address. You
can configure both in VyOS.

VyOS CLI and RFC2136
^^^^^^^^^^^^^^^^^^^^

First, create an RFC2136_ config node :

.. code-block:: sh

  edit service dns dynamic interface eth0 rfc2136 <confignodename>

Present your RNDC key to ddclient :

.. code-block:: sh

  set key /config/dyndns/mydnsserver.rndc.key

Set the DNS server IP/FQDN :

.. code-block:: sh

  set server dns.mydomain.com

Set the NS zone to be updated :

.. code-block:: sh

  set zone mydomain.com

Set the records to be updated :

.. code-block:: sh

  set record dyn
  set record dyn2

You can optionally set a TTL (note : default value is 600 seconds) :

.. code-block:: sh

  set ttl 600

This will generate the following ddclient config blocks:

.. code-block:: sh

  server=dns.mydomain.com
  protocol=nsupdate
  password=/config/dyndns/mydnsserver.rndc.key
  ttl=600
  zone=mydomain.com 
  dyn
  server=dns.mydomain.com
  protocol=nsupdate
  password=/config/dyndns/mydnsserver.rndc.key
  ttl=600
  zone=mydomain.com
  dyn2

You can also keep a different dns zone updated. Just create a new config node:

.. code-block:: sh

  edit service dns dynamic interface eth0 rfc2136 <confignode2>

VyOS CLI and HTTP dynamic DNS services
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

VyOS is also able to use any service relying on protocols supported by ddclient.

To use such a service, you must define a login, a password, one or multiple
hostnames, a protocol and a server.

.. code-block:: sh

  edit service dns dynamic interface eth0 service HeNet
  set login my-login # set password my-password
  set host-name my-tunnel-id
  set protocol dyndns2
  set server ipv4.tunnelbroker.net

VyOS is also shipped with a list of known services. You don't need to set the
protocol and server value as VyOS has defaults provided for those. These are
the services VyOS knows about:

* afraid
* changeip
* dnspark
* dslreports
* dyndns
* easydns
* namecheap
* noip
* zoneedit

To use DynDNS for example:

.. code-block:: sh

  edit service dns dynamic interface eth0 service dyndns
  set login my-login
  set password my-password
  set host-name my-dyndns-hostname

It's possible to use multiple services :

.. code-block:: sh

  edit service dns dynamic interface eth0 service dyndns
  set login my-login
  set password my-password
  set host-name my-dyndns-hostname
  edit service dns dynamic interface eth0 service HeNet
  set login my-login
  set password my-password
  set host-name my-tunnel-id
  set protocol dyndns2
  set server ipv4.tunnelbroker.net

ddclient behind NAT
^^^^^^^^^^^^^^^^^^^

By default, ddclient will update a dynamic dns record using the IP address
directly attached to the interface. If your VyOS instance is behind NAT, your
record will be updated to point to your internal IP.

ddclient_ has another way to determine the WAN IP address. This is controlled
by these two options:

.. code-block:: sh

  set service dns dynamic interface eth0 use-web url
  set service dns dynamic interface eth0 use-web skip

ddclient_ will load the webpage at `[url]` and will try to extract an IP
address for the response. ddclient_ will skip any address located before the
string set in `[skip]`.

mDNS Repeater
-------------

Starting with VyOS 1.2 a `Multicast DNS`_ (mDNS) repeater functionality is
provided.

Multicast DNS uses the 224.0.0.51 address, which is "administratively scoped"
and does not leave the subnet. It re-broadcast mDNS packets from one interface
to other interfaces. This enables support for e.g. Apple Airplay devices across
multiple VLANs.

To enable mDNS repeater you need to configure at least two interfaces. To re-
broadcast all mDNS packets from `eth0` to `eth1` and vice versa run:

.. code-block:: sh

  set service mdns repeater interface eth0
  set service mdns repeater interface eth1

mDNS repeater can be temporarily disabled without deleting the service using

.. code-block:: sh

  set service mdns repeater disable

**NOTE**: You can not run this in a VRRP setup, if multiple mDNS repeaters are
launched in a subnet you will experience the mDNS packet storm death!

UDP broadcast relay
-------------------

Certain vendors use broadcasts to identify their equipemnt within one ethernet
segment. Unfortunately if you split your network with multiple VLANs you loose
the ability of identifying your equiment.

This is where "UDP broadcast relay" comes into play! It will forward received
broadcasts to other configured networks.

Every UDP port which will be forward requires one unique ID. Currently we
support 99 IDs!

To Forward broadcasts on port 1900 for eth3, eth4 and eth5 configure the service
as follows:

.. code-block:: sh

  set service broadcast-relay id 1 description 'SONOS'
  set service broadcast-relay id 1 interface 'eth3'
  set service broadcast-relay id 1 interface 'eth4'
  set service broadcast-relay id 1 interface 'eth5'
  set service broadcast-relay id 1 port '1900'

Forward broadcasts on port 6969 for eth3, eth4

.. code-block:: sh

  set service broadcast-relay id 2 description 'SONOS MGMT'
  set service broadcast-relay id 2 interface 'eth3'
  set service broadcast-relay id 2 interface 'eth4'
  set service broadcast-relay id 2 port '6969'

Each broadcast relay instance can be individually disabled without deleting the
configured node by:

.. code-block:: sh

  set service broadcast-relay id <n> disable

In addition you can also disable the whole service without removing the
configuration by:

.. code-block:: sh

  set service broadcast-relay disable

**NOTE:** You can run the UDP broadcast relay service on multiple routers
connected to a subnet. There is **NO** UDP broadcast relay packet storm!

.. _ddclient: http://sourceforge.net/p/ddclient/wiki/Home/
.. _RFC2136: https://www.ietf.org/rfc/rfc2136.txt
.. _`Multicast DNS`: https://en.wikipedia.org/wiki/Multicast_DNS
