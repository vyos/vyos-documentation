.. _dynamic-dns:

###########
Dynamic DNS
###########

VyOS is able to update a remote DNS record when an interface gets a new IP
address. In order to do so, VyOS includes ddclient_, a Perl script written for
this only one purpose.

ddclient_ uses two methods to update a DNS record. The first one will send
updates directly to the DNS daemon, in compliance with :rfc:`2136`. The second
one involves a third party service, like DynDNS.com or any other similar
website. This method uses HTTP requests to transmit the new IP address. You
can configure both in VyOS.

Configuration
=============

:rfc:`2136` Based
-----------------

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name>

   Create new :rfc:`2136` DNS update configuration which will update the IP
   address assigned to `<interface>` on the service you configured under
   `<service-name>`.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name> key <keyfile>

   File identified by `<keyfile>` containing the secret RNDC key shared with
   remote DNS server.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name> server <server>

   Configure the DNS `<server>` IP/FQDN used when updating this dynamic
   assignment.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name> zone <zone>

   Configure DNS `<zone>` to be updated.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name> record <record>

   Configure DNS `<record>` which should be updated. This can be set multiple
   times.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name> ttl <ttl>

   Configure optional TTL value on the given resource record. This defualts to
   600 seconds.

Example
^^^^^^^

* Register DNS record ``example.vyos.io`` on DNS server ``ns1.vyos.io``
* Use auth key file at ``/config/auth/my.key``
* Set TTL to 300 seconds

.. code-block:: none

  vyos@vyos# show service dns dynamic
   interface eth0.7 {
       rfc2136 VyOS-DNS {
           key /config/auth/my.key
           record example.vyos.io
           server ns1.vyos.io
           ttl 300
           zone vyos.io
       }
   }

This will render the following ddclient_ configuration entry:

.. code-block:: none

  #
  # ddclient configuration for interface "eth0.7":
  #
  use=if, if=eth0.7

  # RFC2136 dynamic DNS configuration for example.vyos.io.vyos.io
  server=ns1.vyos.io
  protocol=nsupdate
  password=/config/auth/my.key
  ttl=300
  zone=vyos.io
  example.vyos.io

.. note:: You can also keep different DNS zone updated. Just create a new
   config node: ``set service dns dynamic interface <interface> rfc2136
   <other-service-name>``

HTTP based services
-------------------

VyOS is also able to use any service relying on protocols supported by ddclient.

To use such a service, one must define a login, password, one or multiple
hostnames, protocol and server.

.. cfgcmd:: set service dns dynamic interface <interface> service <service> host-name <hostname>

   Setup the dynamic DNS hostname `<hostname>` associated with the DynDNS
   provider identified by `<service>` when the IP address on interface
   `<interface>` changes.

.. cfgcmd:: set service dns dynamic interface <interface> service <service> login <username>

   Configure `<username>` used when authenticating the update request for
   DynDNS service identified by `<service>`.
   For Namecheap, set the <domain> you wish to update.

.. cfgcmd:: set service dns dynamic interface <interface> service <service> password <password>

   Configure `<password>` used when authenticating the update request for
   DynDNS service identified by `<service>`.

.. cfgcmd:: set service dns dynamic interface <interface> service <service> protocol <protocol>

   When a ``custom`` DynDNS provider is used the protocol used for communicating
   to the provider must be specified under `<protocol>`. See the embedded
   completion helper for available protocols.

.. cfgcmd:: set service dns dynamic interface <interface> service <service> server <server>

   When a ``custom`` DynDNS provider is used the `<server>` where update
   requests are being sent to must be specified.

Example:
^^^^^^^^

Use DynDNS as your preferred provider:

.. code-block:: none

  set service dns dynamic interface eth0 service dyndns
  set service dns dynamic interface eth0 service dyndns login my-login
  set service dns dynamic interface eth0 service dyndns password my-password
  set service dns dynamic interface eth0 service dyndns host-name my-dyndns-hostname

.. note:: Multiple services can be used per interface. Just specify as many
   serives per interface as you like!

Running Behind NAT
------------------

By default, ddclient_ will update a dynamic dns record using the IP address
directly attached to the interface. If your VyOS instance is behind NAT, your
record will be updated to point to your internal IP.

ddclient_ has another way to determine the WAN IP address. This is controlled
by:

.. cfgcmd:: set service dns dynamic interface <interface> use-web url <url>

   Use configured `<url>` to determine your IP address. ddclient_ will load
   `<url>` and tries to extract your IP address from the response.

.. cfgcmd:: set service dns dynamic interface <interface> use-web skip <pattern>

   ddclient_ will skip any address located before the string set in `<pattern>`.

.. _ddclient: https://github.com/ddclient/ddclient
