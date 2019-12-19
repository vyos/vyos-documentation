.. _dns-forwarding:

##############
DNS Forwarding
##############

Configuration
=============

VyOS provides DNS infrastructure for small networks. It is designed to be
lightweight and have a small footprint, suitable for resource constrained
routers and firewalls, for this we utilize PowerDNS recursor.

VyOS DNS forwarder does not require an upstream DNS server. It can serve as a
full recursive DNS server - but it can also forward queries to configurable
upstream DNS servers. By not configuring any upstream DNS servers you also
avoid to be tracked by the provider of your upstream DNS server.

.. cfgcmd:: set service dns forwarding system

   Forward incoming DNS queries to the DNS servers configured under the ``system
   name-server`` nodes.

.. cfgcmd:: set service dns forwarding name-server <address>

   Send all DNS queries to the IPv4/IPv6 DNS server specified under `<address>`.
   You can configure multiple nameservers here.

.. cfgcmd:: set service dns forwarding domain <domain-name> server <address>

   Forward received queries for a particular domain (specified via `domain-name`)
   to a given name-server. Multiple nameservers can be specified.

.. note:: This also works for reverse-lookup zones e.g. ``18.172.in-addr.arpa``.

.. cfgcmd:: set service dns forwarding allow-from <network>

   Given the fact that open DNS recursors could be used on DDOS amplification
   attacts, you must configure the networks which are allowed to use this
   recursor. A network of ``0.0.0.0/0`` or ``::/0`` would allow all IPv4 and
   IPv6 networks to query this server. This is on general a bad idea.

.. cfgcmd:: set service dns forwarding dnssec <off | process-no-validate | process | log-fail | validate>

   The PowerDNS Recursor has 5 different levels of DNSSEC processing, which can
   be set with the dnssec setting. In order from least to most processing, these
   are:

   * **off** In this mode, no DNSSEC processing takes place. The recursor will
     not set the DNSSEC OK (DO) bit in the outgoing queries and will ignore the
     DO and AD bits in queries.

   * **process-no-validate** In this mode the Recursor acts as a "security
     aware, non-validating" nameserver, meaning it will set the DO-bit on
     outgoing queries and will provide DNSSEC related RRsets (NSEC, RRSIG) to
     clients that ask for them (by means of a DO-bit in the query), except for
     zones provided through the auth-zones setting. It will not do any
     validation in this mode, not even when requested by the client.

   * **process** When dnssec is set to process the behaviour is similar to
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
     queries will be be validated and will be answered with a SERVFAIL in case
     of bogus data, regardless of the client's request.

   .. note:: The famous UNIX/Linux ``dig`` tool sets the AD-bit in the query.
      This might lead to unexpected query results when testing. Set ``+noad``
      on the ``dig`` commandline when this is the case.

   .. note:: The ``CD``-bit is honored correctly for process and validate. For
      log-fail, failures will be logged too.

.. cfgcmd:: set service dns forwarding ignore-hosts-file

   Do not use local ``/etc/hosts`` file in name resolution. VyOS DHCP server
   will use this file to add resolvers to assigned addresses.

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

   Local IPv4 or IPv6 addresses to bind to - waiting on this address for
   incoming connections.

Example
=======

Router with two interfaces eth0 (WAN link) and eth1 (LAN) does want to make
use of DNS split-horizon for example.com.

* DNS request for example.com need to get forwarded to IPv4 address 192.0.2.254
  and IPv6 address 2001:db8:cafe::1
* All other DNS requests are forwarded to DNS server listening on 192.0.2.1,
  192.0.2.2, 2001:db8::1:ffff and 2001:db8::2:ffff
* DNS server is listening on the LAN interface addresses only, 192.168.1.254
  for IPv4 and 2001:db8::ffff for IPv6
* Only clients from the LAN segment (192.168.1.0/24) are allowed to use this
  server

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

Operation
=========

.. opcmd:: reset dns forwarding <all | domain>

   Reset local DNS forwarding cache database. You can reset the cache for all
   entries or only for entries to a specific domain.

.. opcmd:: restart dns forwarding

   Restart DNS recursor process which also invalidates the cache.
