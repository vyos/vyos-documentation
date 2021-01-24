DNS Forwarding
--------------

Use DNS forwarding if you want your router to function as a DNS server for the
local network. There are several options, the easiest being 'forward all
traffic to the system DNS server(s)' (defined with set system name-server):

.. code-block:: none

  set service dns forwarding system

Manually setting DNS servers for forwarding:

.. code-block:: none

  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4

Manually setting DNS servers with IPv6 connectivity:

.. code-block:: none

  set service dns forwarding name-server 2001:4860:4860::8888
  set service dns forwarding name-server 2001:4860:4860::8844

Setting a forwarding DNS server for a specific domain:

.. code-block:: none

  set service dns forwarding domain example.com server 192.0.2.1
  
Set which networks or clients are allowed to query the DNS Server. Allow from all:

.. code-block:: none

  set service dns forwarding allow-from 0.0.0.0/0

Example 1
^^^^^^^^^

Router with two interfaces eth0 (WAN link) and eth1 (LAN). Split DNS for example.com.

* DNS request for a local domain (example.com) get forwarded to 192.0.2.1
* Other DNS requests are forwarded to Google's DNS servers.
* The IP address for the LAN interface is 192.168.0.1.

.. code-block:: none

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding listen-address 192.168.0.1
  set service dns forwarding allow-from 0.0.0.0/0

Example 2
^^^^^^^^^

Same as example 1 but with additional IPv6 addresses for Google's public DNS
servers.

The IP addresses for the LAN interface are 192.168.0.1 and 2001:db8::1

.. code-block:: none

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding name-server 2001:4860:4860::8888
  set service dns forwarding name-server 2001:4860:4860::8844
  set service dns forwarding listen-address 2001:db8::1
  set service dns forwarding listen-address 192.168.0.1 
  set service dns forwarding allow-from 0.0.0.0/0


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

.. code-block:: none

  edit service dns dynamic interface eth0 rfc2136 <confignodename>

Present your RNDC key to ddclient :

.. code-block:: none

  set key /config/dyndns/mydnsserver.rndc.key

Set the DNS server IP/FQDN :

.. code-block:: none

  set server dns.mydomain.com

Set the NS zone to be updated :

.. code-block:: none

  set zone mydomain.com

Set the records to be updated :

.. code-block:: none

  set record dyn
  set record dyn2

You can optionally set a TTL (note : default value is 600 seconds) :

.. code-block:: none

  set ttl 600

This will generate the following ddclient config blocks:

.. code-block:: none

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

.. code-block:: none

  edit service dns dynamic interface eth0 rfc2136 <confignode2>

VyOS CLI and HTTP dynamic DNS services
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

VyOS is also able to use any service relying on protocols supported
by ddclient.

To use such a service, you must define a login, a password, one or multiple
hostnames, a protocol and a server.

.. code-block:: none

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

.. code-block:: none

  edit service dns dynamic interface eth0 service dyndns
  set login my-login
  set password my-password
  set host-name my-dyndns-hostname

It's possible to use multiple services :

.. code-block:: none

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

.. code-block:: none

  set service dns dynamic interface eth0 use-web url
  set service dns dynamic interface eth0 use-web skip

ddclient_ will load the webpage at `[url]` and will try to extract an IP
address for the response. ddclient_ will skip any address located before the
string set in `[skip]`.


.. include:: references.rst
