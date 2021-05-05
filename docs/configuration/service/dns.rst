.. _dns-forwarding:

##############
DNS Forwarding
##############

Configuration
=============

VyOS provides DNS infrastructure for small networks. It is designed to be
lightweight and have a small footprint, suitable for resource constrained
routers and firewalls. For this we utilize PowerDNS recursor.

The VyOS DNS forwarder does not require an upstream DNS server. It can serve as
a full recursive DNS server - but it can also forward queries to configurable
upstream DNS servers. By not configuring any upstream DNS servers you also
avoid being tracked by the provider of your upstream DNS server.

.. cfgcmd:: set service dns forwarding system

   Forward incoming DNS queries to the DNS servers configured under the ``system
   name-server`` nodes.

.. cfgcmd:: set service dns forwarding name-server <address>

   Send all DNS queries to the IPv4/IPv6 DNS server specified under `<address>`.
   You can configure multiple nameservers here.

.. cfgcmd:: set service dns forwarding domain <domain-name> server <address>

   Forward received queries for a particular domain
   (specified via `domain-name`) to a given nameserver. Multiple nameservers
   can be specified. You can use this feature for a DNS split-horizon
   configuration.

   .. note:: This also works for reverse-lookup zones (``18.172.in-addr.arpa``).

.. cfgcmd:: set service dns forwarding allow-from <network>

   Given the fact that open DNS recursors could be used on DDoS amplification
   attacks, you must configure the networks which are allowed to use this
   recursor. A network of ``0.0.0.0/0`` or ``::/0`` would allow all IPv4 and
   IPv6 networks to query this server. This is generally a bad idea.

.. cfgcmd:: set service dns forwarding dnssec
   <off | process-no-validate | process | log-fail | validate>

   The PowerDNS recursor has 5 different levels of DNSSEC processing, which can
   be set with the dnssec setting. In order from least to most processing, these
   are:

   * **off** In this mode, no DNSSEC processing takes place. The recursor will
     not set the DNSSEC OK (DO) bit in the outgoing queries and will ignore the
     DO and AD bits in queries.

   * **process-no-validate** In this mode the recursor acts as a "security
     aware, non-validating" nameserver, meaning it will set the DO-bit on
     outgoing queries and will provide DNSSEC related RRsets (NSEC, RRSIG) to
     clients that ask for them (by means of a DO-bit in the query), except for
     zones provided through the auth-zones setting. It will not do any
     validation in this mode, not even when requested by the client.

   * **process** When dnssec is set to process the behavior is similar to
     process-no-validate. However, the recursor will try to validate the data
     if at least one of the DO or AD bits is set in the query; in that case,
     it will set the AD-bit in the response when the data is validated
     successfully, or send SERVFAIL when the validation comes up bogus.

   * **log-fail** In this mode, the recursor will attempt to validate all data
     it retrieves from authoritative servers, regardless of the client's DNSSEC
     desires, and will log the validation result. This mode can be used to
     determine the extra load and amount of possibly bogus answers before
     turning on full-blown validation. Responses to client queries are the same
     as with process.

   * **validate** The highest mode of DNSSEC processing. In this mode, all
     queries will be validated and will be answered with a SERVFAIL in case of
     bogus data, regardless of the client's request.

   .. note:: The popular Unix/Linux ``dig`` tool sets the AD-bit in the query.
      This might lead to unexpected query results when testing. Set ``+noad``
      on the ``dig`` command line when this is the case.

   .. note:: The ``CD``-bit is honored correctly for process and validate. For
      log-fail, failures will be logged too.

.. cfgcmd:: set service dns forwarding ignore-hosts-file

   Do not use the local ``/etc/hosts`` file in name resolution. VyOS DHCP
   server will use this file to add resolvers to assigned addresses.

.. cfgcmd:: set service dns forwarding max-cache-entries

   Maximum number of DNS cache entries. 1 million per CPU core will generally
   suffice for most installations.

.. cfgcmd:: set service dns forwarding negative-ttl

   A query for which there is authoritatively no answer is cached to quickly
   deny a record's existence later on, without putting a heavy load on the
   remote server. In practice, caches can become saturated with hundreds of
   thousands of hosts which are tried only once. This setting, which defaults
   to 3600 seconds, puts a maximum on the amount of time negative entries are
   cached.

.. cfgcmd:: set service dns forwarding listen-address

   The local IPv4 or IPv6 addresses to bind the DNS forwarder to. The forwarder
   will listen on this address for incoming connections.

.. cfgcmd:: set service dns forwarding no-server-rfc1918

   This makes the server authoritatively not aware of: 10.in-addr.arpa,
   168.192.in-addr.arpa, 16-31.172.in-addr.arpa, which enabling upstream 
   DNS server(s) to be used for reverse lookups of these zones.

Example
=======

A VyOS router with two interfaces - eth0 (WAN) and eth1 (LAN) - is required to
implement a split-horizon DNS configuration for example.com.

In this scenario:

* All DNS requests for example.com must be forwarded to a DNS server
  at 192.0.2.254 and 2001:db8:cafe::1
* All other DNS requests will be forwarded to a different set of DNS servers at
  192.0.2.1, 192.0.2.2, 2001:db8::1:ffff and 2001:db8::2:ffff
* The VyOS DNS forwarder will only listen for requests on the eth1 (LAN)
  interface addresses - 192.168.1.254 for IPv4 and 2001:db8::ffff for IPv6
* The VyOS DNS forwarder will only accept lookup requests from the
  LAN subnets - 192.168.1.0/24 and 2001:db8::/64
* The VyOS DNS forwarder will pass reverse lookups for  10.in-addr.arpa,
  168.192.in-addr.arpa, 16-31.172.in-addr.arpa zones to upstream server.

.. code-block:: none

  set service dns forwarding domain example.com server 192.0.2.254
  set service dns forwarding domain example.com server 2001:db8:cafe::1
  set service dns forwarding name-server 192.0.2.1
  set service dns forwarding name-server 192.0.2.2
  set service dns forwarding name-server 2001:db8::1:ffff
  set service dns forwarding name-server 2001:db8::2:ffff
  set service dns forwarding listen-address 192.168.1.254
  set service dns forwarding listen-address 2001:db8::ffff
  set service dns forwarding allow-from 192.168.1.0/24
  set service dns forwarding allow-from 2001:db8::/64
  set service dns forwarding no-serve-rfc1918

Operation
=========

.. opcmd:: reset dns forwarding <all | domain>

   Resets the local DNS forwarding cache database. You can reset the cache
   for all entries or only for entries to a specific domain.

.. opcmd:: restart dns forwarding

   Restarts the DNS recursor process. This also invalidates the local DNS
   forwarding cache.


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

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name>
   key <keyfile>

   File identified by `<keyfile>` containing the secret RNDC key shared with
   remote DNS server.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name>
   server <server>

   Configure the DNS `<server>` IP/FQDN used when updating this dynamic
   assignment.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name>
   zone <zone>

   Configure DNS `<zone>` to be updated.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name>
   record <record>

   Configure DNS `<record>` which should be updated. This can be set multiple
   times.

.. cfgcmd:: set service dns dynamic interface <interface> rfc2136 <service-name>
   ttl <ttl>

   Configure optional TTL value on the given resource record. This defaults to
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

.. cfgcmd:: set service dns dynamic interface <interface> service <service>
   host-name <hostname>

   Setup the dynamic DNS hostname `<hostname>` associated with the DynDNS
   provider identified by `<service>` when the IP address on interface
   `<interface>` changes.

.. cfgcmd:: set service dns dynamic interface <interface> service <service>
   login <username>

   Configure `<username>` used when authenticating the update request for
   DynDNS service identified by `<service>`.
   For Namecheap, set the <domain> you wish to update.

.. cfgcmd:: set service dns dynamic interface <interface> service <service>
   password <password>

   Configure `<password>` used when authenticating the update request for
   DynDNS service identified by `<service>`.

.. cfgcmd:: set service dns dynamic interface <interface> service <service>
   protocol <protocol>

   When a ``custom`` DynDNS provider is used the protocol used for communicating
   to the provider must be specified under `<protocol>`. See the embedded
   completion helper for available protocols.

.. cfgcmd:: set service dns dynamic interface <interface> service <service>
   server <server>

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
   services per interface as you like!

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
