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

.. cfgcmd:: set service dns forwarding dhcp <interface>

   Interfaces whose DHCP client nameservers to forward requests to.

.. cfgcmd:: set service dns forwarding name-server <address> port <port>

   Send all DNS queries to the IPv4/IPv6 DNS server specified under `<address>`
   on optional port specified under `<port>`. The port defaults to 53. You can
   configure multiple nameservers here.

.. cfgcmd:: set service dns forwarding domain <domain-name> name-server <address>

   Forward received queries for a particular domain
   (specified via `domain-name`) to a given nameserver. Multiple nameservers
   can be specified. You can use this feature for a DNS split-horizon
   configuration.

   .. note:: This also works for reverse-lookup zones (``18.172.in-addr.arpa``).

.. cfgcmd:: set service dns forwarding domain <domain-name> addnta

   Add NTA (negative trust anchor) for this domain. This must be set if the
   domain does not support DNSSEC.

.. cfgcmd:: set service dns forwarding domain <domain-name> recursion-desired

   Set the "recursion desired" bit in requests to the upstream nameserver.

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

.. cfgcmd:: set service dns forwarding cache-size <0-2147483647>

   Maximum number of DNS cache entries. 1 million per CPU core will generally
   suffice for most installations.

   This defaults to 10000.

.. cfgcmd:: set service dns forwarding negative-ttl <0-7200>

   A query for which there is authoritatively no answer is cached to quickly
   deny a record's existence later on, without putting a heavy load on the
   remote server. In practice, caches can become saturated with hundreds of
   thousands of hosts which are tried only once.

   This setting, which defaults to 3600 seconds, puts a maximum on the amount
   of time negative entries are cached.

.. cfgcmd:: set service dns forwarding timeout <10-60000>

   The number of milliseconds to wait for a remote authoritative server to
   respond before timing out and responding with SERVFAIL.

   This setting defaults to 1500 and is valid between 10 and 60000.

.. cfgcmd:: set service dns forwarding listen-address <address>

   The local IPv4 or IPv6 addresses to bind the DNS forwarder to. The forwarder
   will listen on this address for incoming connections.

.. cfgcmd:: set service dns forwarding source-address <address>

   The local IPv4 or IPv6 addresses to use as a source address for sending queries.
   The forwarder will send forwarded outbound DNS requests from this address.

.. cfgcmd:: set service dns forwarding no-serve-rfc1918

   This makes the server authoritatively not aware of: 10.in-addr.arpa,
   168.192.in-addr.arpa, 16-31.172.in-addr.arpa, which enabling upstream
   DNS server(s) to be used for reverse lookups of these zones.

.. cfgcmd:: set service dns forwarding serve-stale-extension <0-65535>

   Maximum number of times an expired record’s TTL is extended by 30s when
   serving stale. Extension only occurs if a record cannot be refreshed. A
   value of 0 means the Serve Stale mechanism is not used. To allow records
   becoming stale to be served for an hour, use a value of 120.

.. cfgcmd:: set service dns forwarding exclude-throttle-address <ip|prefix>

   When an authoritative server does not answer a query or sends a reply the
   recursor does not like, it is throttled. Any servers matching the supplied
   netmasks will never be throttled.

.. cfgcmd:: set service dns forwarding options ecs-add-for <address>

   The requestor netmask for which the requestor IP Address should be used as the
   EDNS Client Subnet for outgoing queries.

.. cfgcmd:: set service dns forwarding options ecs-ipv4-bits <number>

   Number of bits of client IPv4 address to pass when sending EDNS Client Subnet
   address information.

.. cfgcmd:: set service dns forwarding options edns-subnet-allow-list <address|domain>

   The netmask or domain that EDNS Client Subnet should be enabled for in outgoing queries.

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

  set service dns forwarding domain example.com name-server 192.0.2.254
  set service dns forwarding domain example.com name-server 2001:db8:cafe::1
  set service dns forwarding name-server 192.0.2.1
  set service dns forwarding name-server 192.0.2.2
  set service dns forwarding name-server 192.0.2.3 port 853
  set service dns forwarding name-server 2001:db8::1:ffff
  set service dns forwarding name-server 2001:db8::2:ffff
  set service dns forwarding name-server 2001:db8::3:ffff port 8053
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

.. _dns:dynmaic_config:

Configuration
=============

:rfc:`2136` Based
-----------------

.. cfgcmd:: set service dns dynamic address <interface> rfc2136 <service-name>

   Create new :rfc:`2136` DNS update configuration which will update the IP
   address assigned to `<interface>` on the service you configured under
   `<service-name>`.

.. cfgcmd:: set service dns dynamic address <interface> rfc2136 <service-name>
   key <keyfile>

   File identified by `<keyfile>` containing the secret RNDC key shared with
   remote DNS server.

.. cfgcmd:: set service dns dynamic address <interface> rfc2136 <service-name>
   server <server>

   Configure the DNS `<server>` IP/FQDN used when updating this dynamic
   assignment.

.. cfgcmd:: set service dns dynamic address <interface> rfc2136 <service-name>
   zone <zone>

   Configure DNS `<zone>` to be updated.

.. cfgcmd:: set service dns dynamic address <interface> rfc2136 <service-name>
   record <record>

   Configure DNS `<record>` which should be updated. This can be set multiple
   times.

.. cfgcmd:: set service dns dynamic address <interface> rfc2136 <service-name>
   ttl <ttl>

   Configure optional TTL value on the given resource record. This defaults to
   600 seconds.

.. cfgcmd:: set service dns dynamic timeout <60-3600>

   Specify timeout / update interval to check if IP address changed.

   This defaults to 300 seconds.

.. _dns:dynmaic_example:

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

.. cfgcmd:: set service dns dynamic address <interface> service <service>
   host-name <hostname>

   Setup the dynamic DNS hostname `<hostname>` associated with the DynDNS
   provider identified by `<service>` when the IP address on address
   `<interface>` changes.

.. cfgcmd:: set service dns dynamic address <interface> service <service>
   username <username>

   Configure `<username>` used when authenticating the update request for
   DynDNS service identified by `<service>`.
   For Namecheap, set the <domain> you wish to update.

.. cfgcmd:: set service dns dynamic address <interface> service <service>
   password <password>

   Configure `<password>` used when authenticating the update request for
   DynDNS service identified by `<service>`.

.. cfgcmd:: set service dns dynamic address <interface> service <service>
   protocol <protocol>

   When a ``custom`` DynDNS provider is used the protocol used for communicating
   to the provider must be specified under `<protocol>`. See the embedded
   completion helper for available protocols.

.. cfgcmd:: set service dns dynamic address <interface> service <service>
   server <server>

   When a ``custom`` DynDNS provider is used the `<server>` where update
   requests are being sent to must be specified.

.. cfgcmd:: set service dns dynamic address <interface> ipv6-enable

   Allow explicit IPv6 address for the interface.


Example:
^^^^^^^^

Use DynDNS as your preferred provider:

.. code-block:: none

  set service dns dynamic address eth0 service dyndns
  set service dns dynamic address eth0 service dyndns username my-login
  set service dns dynamic address eth0 service dyndns password my-password
  set service dns dynamic address eth0 service dyndns host-name my-dyndns-hostname

.. note:: Multiple services can be used per interface. Just specify as many
   services per interface as you like!

Example IPv6 only:
^^^^^^^^^^^^^^^^^^

.. code-block:: none

  set service dns dynamic address eth0 ipv6-enable
  set service dns dynamic address eth0 service dyndns6 username my-login
  set service dns dynamic address eth0 service dyndns6 password my-password
  set service dns dynamic address eth0 service dyndns6 host-name my-dyndns-hostname
  set service dns dynamic address eth0 service dyndns6 protocol dyndns2
  set service dns dynamic address eth0 service dyndns6 server dyndns-v6-server


Running Behind NAT
------------------

By default, ddclient_ will update a dynamic dns record using the IP address
directly attached to the interface. If your VyOS instance is behind NAT, your
record will be updated to point to your internal IP.

Above, command syntax isn noted to configure dynamic dns on a specific interface.
It is possible to overlook the additional address option, web, when completeing
those commands. ddclient_ has another way to determine the WAN IP address, using
a web-based url to determine the external IP. Each of the commands above will
need to be modified to use 'web' as the 'interface' specified if this functionality
is to be utilized.

This functionality is controlled by adding the following configuration:

.. cfgcmd:: set service dns dynamic address web web-options url <url>

   Use configured `<url>` to determine your IP address. ddclient_ will load
   `<url>` and tries to extract your IP address from the response.

.. cfgcmd:: set service dns dynamic address web web-options skip <pattern>

   ddclient_ will skip any address located before the string set in `<pattern>`.

.. _ddclient: https://github.com/ddclient/ddclient
