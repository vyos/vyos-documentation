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

VyOS is also able to use any service relying on protocols supported
by ddclient.

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


.. include:: references.rst
