.. _dns-forwarding:

##############
DNS Forwarding
##############

VyOS provides DNS infrastructure for small networks. It is designed to be
lightweight and have a small footprint, suitable for resource constrained
routers and firewalls, for this we utilize PowerDNS recursor.

VyOS DNS forwarder doe not require an upstream DNS server. It can serve as a
full recursive DNS server - but it can also forward queries to configurable
upstream DNS servers.

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
attacts, you must configure the networks which are allowed to use this recursor.
A network of ``0.0.0.0/0`` or ``::/0`` would allow all IPv4 and IPv6 networks
to query this server. This is on general a bad idea.

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

