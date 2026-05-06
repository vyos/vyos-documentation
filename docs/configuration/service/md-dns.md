# DNS Forwarding

## Configuration

VyOS provides DNS infrastructure for small networks. It is designed to be
lightweight and have a small footprint, suitable for resource constrained
routers and firewalls. For this we utilize PowerDNS recursor.

The VyOS DNS forwarder does not require an upstream DNS server. It can serve as
a full recursive DNS server - but it can also forward queries to configurable
upstream DNS servers. By not configuring any upstream DNS servers you also
avoid being tracked by the provider of your upstream DNS server.

<div class="cfgcmd">

set service dns forwarding system

Forward incoming DNS queries to the DNS servers configured under the `system name-server` nodes.

</div>

<div class="cfgcmd">

set service dns forwarding dhcp \<interface\>

Interfaces whose DHCP client nameservers to forward requests to.

</div>

<div class="cfgcmd">

set service dns forwarding name-server \<address\> port \<port\>

Send all DNS queries to the IPv4/IPv6 DNS server specified under <span class="title-ref">\<address\></span>
on optional port specified under <span class="title-ref">\<port\></span>. The port defaults to 53. You can
configure multiple nameservers here.

</div>

<div class="cfgcmd">

set service dns forwarding domain \<domain-name\> name-server \<address\>

Forward received queries for a particular domain
(specified via <span class="title-ref">domain-name</span>) to a given nameserver. Multiple nameservers
can be specified. You can use this feature for a DNS split-horizon
configuration.

<div class="note">

<div class="title">

Note

</div>

This also works for reverse-lookup zones (`18.172.in-addr.arpa`).

</div>

</div>

<div class="cfgcmd">

set service dns forwarding domain \<domain-name\> addnta

Add NTA (negative trust anchor) for this domain. This must be set if the
domain does not support DNSSEC.

</div>

<div class="cfgcmd">

set service dns forwarding domain \<domain-name\> recursion-desired

Set the "recursion desired" bit in requests to the upstream nameserver.

</div>

<div class="cfgcmd">

set service dns forwarding allow-from \<network\>

Given the fact that open DNS recursors could be used on DDoS amplification
attacks, you must configure the networks which are allowed to use this
recursor. A network of `0.0.0.0/0` or `::/0` would allow all IPv4 and
IPv6 networks to query this server. This is generally a bad idea.

</div>

<div class="cfgcmd">

set service dns forwarding dnssec
\<off | process-no-validate | process | log-fail | validate\>

The PowerDNS recursor has 5 different levels of DNSSEC processing, which can
be set with the dnssec setting. In order from least to most processing, these
are:

- **off** In this mode, no DNSSEC processing takes place. The recursor will
  not set the DNSSEC OK (DO) bit in the outgoing queries and will ignore the
  DO and AD bits in queries.
- **process-no-validate** In this mode the recursor acts as a "security
  aware, non-validating" nameserver, meaning it will set the DO-bit on
  outgoing queries and will provide DNSSEC related RRsets (NSEC, RRSIG) to
  clients that ask for them (by means of a DO-bit in the query), except for
  zones provided through the auth-zones setting. It will not do any
  validation in this mode, not even when requested by the client.
- **process** When dnssec is set to process the behavior is similar to
  process-no-validate. However, the recursor will try to validate the data
  if at least one of the DO or AD bits is set in the query; in that case,
  it will set the AD-bit in the response when the data is validated
  successfully, or send SERVFAIL when the validation comes up bogus.
- **log-fail** In this mode, the recursor will attempt to validate all data
  it retrieves from authoritative servers, regardless of the client's DNSSEC
  desires, and will log the validation result. This mode can be used to
  determine the extra load and amount of possibly bogus answers before
  turning on full-blown validation. Responses to client queries are the same
  as with process.
- **validate** The highest mode of DNSSEC processing. In this mode, all
  queries will be validated and will be answered with a SERVFAIL in case of
  bogus data, regardless of the client's request.

<div class="note">

<div class="title">

Note

</div>

The popular Unix/Linux `dig` tool sets the AD-bit in the query.
This might lead to unexpected query results when testing. Set `+noad`
on the `dig` command line when this is the case.

</div>

<div class="note">

<div class="title">

Note

</div>

The `CD`-bit is honored correctly for process and validate. For
log-fail, failures will be logged too.

</div>

</div>

<div class="cfgcmd">

set service dns forwarding ignore-hosts-file

Do not use the local `/etc/hosts` file in name resolution. VyOS DHCP
server will use this file to add resolvers to assigned addresses.

</div>

<div class="cfgcmd">

set service dns forwarding cache-size \<0-2147483647\>

Maximum number of DNS cache entries. 1 million per CPU core will generally
suffice for most installations.

This defaults to 10000.

</div>

<div class="cfgcmd">

set service dns forwarding negative-ttl \<0-7200\>

A query for which there is authoritatively no answer is cached to quickly
deny a record's existence later on, without putting a heavy load on the
remote server. In practice, caches can become saturated with hundreds of
thousands of hosts which are tried only once.

This setting, which defaults to 3600 seconds, puts a maximum on the amount
of time negative entries are cached.

</div>

<div class="cfgcmd">

set service dns forwarding timeout \<10-60000\>

The number of milliseconds to wait for a remote authoritative server to
respond before timing out and responding with SERVFAIL.

This setting defaults to 1500 and is valid between 10 and 60000.

</div>

<div class="cfgcmd">

set service dns forwarding listen-address \<address\>

The local IPv4 or IPv6 addresses to bind the DNS forwarder to. The forwarder
will listen on this address for incoming connections.

</div>

<div class="cfgcmd">

set service dns forwarding source-address \<address\>

The local IPv4 or IPv6 addresses to use as a source address for sending queries.
The forwarder will send forwarded outbound DNS requests from this address.

</div>

<div class="cfgcmd">

set service dns forwarding no-serve-rfc1918

This makes the server authoritatively not aware of: 10.in-addr.arpa,
168.192.in-addr.arpa, 16-31.172.in-addr.arpa, which enabling upstream
DNS server(s) to be used for reverse lookups of these zones.

</div>

## Example

A VyOS router with two interfaces - eth0 (WAN) and eth1 (LAN) - is required to
implement a split-horizon DNS configuration for example.com.

In this scenario:

- All DNS requests for example.com must be forwarded to a DNS server
  at 192.0.2.254 and 2001:db8:cafe::1
- All other DNS requests will be forwarded to a different set of DNS servers at
  192.0.2.1, 192.0.2.2, 2001:db8::1:ffff and 2001:db8::2:ffff
- The VyOS DNS forwarder will only listen for requests on the eth1 (LAN)
  interface addresses - 192.168.1.254 for IPv4 and 2001:db8::ffff for IPv6
- The VyOS DNS forwarder will only accept lookup requests from the
  LAN subnets - 192.168.1.0/24 and 2001:db8::/64
- The VyOS DNS forwarder will pass reverse lookups for 10.in-addr.arpa,
  168.192.in-addr.arpa, 16-31.172.in-addr.arpa zones to upstream server.

``` none
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
```

## Operation

<div class="opcmd">

reset dns forwarding \<all | domain\>

Resets the local DNS forwarding cache database. You can reset the cache
for all entries or only for entries to a specific domain.

</div>

<div class="opcmd">

restart dns forwarding

Restarts the DNS recursor process. This also invalidates the local DNS
forwarding cache.

</div>

# Dynamic DNS

VyOS is able to update a remote DNS record when an interface gets a new IP
address. In order to do so, VyOS includes [ddclient](https://github.com/ddclient/ddclient), a Perl script written for
this only one purpose.

[ddclient](https://github.com/ddclient/ddclient) uses two methods to update a DNS record. The first one will send
updates directly to the DNS daemon, in compliance with `2136`. The second
one involves a third party service, like DynDNS.com or any other such
service provider. This method uses HTTP requests to transmit the new IP address. You
can configure both in VyOS.

## Configuration

### `2136` Based

<div class="cfgcmd">

set service dns dynamic name \<service-name\> address interface \<interface\>

Create new dynamic DNS update configuration which will update the IP
address assigned to <span class="title-ref">\<interface\></span> on the service you configured under
<span class="title-ref">\<service-name\></span>.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> description \<text\>

Set description <span class="title-ref">\<text\></span> for dynamic DNS service being configured.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> key \<filename\>

File identified by <span class="title-ref">\<filename\></span> containing the TSIG authentication key for RFC2136
nsupdate on remote DNS server.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> server \<server\>

Configure the DNS <span class="title-ref">\<server\></span> IP/FQDN used when updating this dynamic
assignment.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> zone \<zone\>

Configure DNS <span class="title-ref">\<zone\></span> to be updated.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> host-name \<record\>

Configure DNS <span class="title-ref">\<record\></span> which should be updated. This can be set multiple times.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> ttl \<ttl\>

Configure optional TTL value on the given resource record. This defaults to
600 seconds.

</div>

<div class="cfgcmd">

set service dns dynamic interval \<60-3600\>

Specify interval in seconds to wait between Dynamic DNS updates.
The default is 300 seconds.

</div>

#### Example

- Register DNS record `example.vyos.io` on DNS server `ns1.vyos.io`
- Use auth key file at `/config/auth/my.key`
- Set TTL to 300 seconds

``` none
# Configuration commands entered:
#
set service dns dynamic name 'VyOS-DNS' address interface 'eth0'
set service dns dynamic name 'VyOS-DNS' description 'RFC 2136 dynamic dns service'
set service dns dynamic name 'VyOS-DNS' key '/config/auth/my.key'
set service dns dynamic name 'VyOS-DNS' server 'ns1.vyos.io'
set service dns dynamic name 'VyOS-DNS' zone 'vyos.io'
set service dns dynamic name 'VyOS-DNS' host-name 'example.vyos.io'
set service dns dynamic name 'VyOS-DNS' protocol 'nsupdate'
set service dns dynamic name 'VyOS-DNS' ttl '300'

# Resulting config:
#
vyos@vyos# show service dns dynamic
 name VyOS-DNS {
     address {
         interface eth0
     }
     description "RFC 2136 dynamic dns service"
     host-name example.vyos.io
     key /config/auth/my.key
     protocol nsupdate
     server ns1.vyos.io
     ttl 300
     zone vyos.io
 }
```

This will render the following [ddclient](https://github.com/ddclient/ddclient) configuration entry:

``` none
# ddclient configuration for interface "eth0":
#

# Web service dynamic DNS configuration for VyOS-DNS: [nsupdate, example.vyos.io]
use=if, \
if=eth0, \
protocol=nsupdate, \
server=ns1.vyos.io, \
zone=vyos.io, \
password='/config/auth/my.key', \
ttl=300 \
example.vyos.io
```

<div class="note">

<div class="title">

Note

</div>

You can also keep different DNS zone updated. Just create a new
config node: `set service dns dynamic interface <interface> rfc2136 <other-service-name>`

</div>

### HTTP based services

VyOS is also able to use any service relying on protocols supported by ddclient.

To use such a service, one must define a login, password, one or multiple
hostnames, protocol and server.

<div class="cfgcmd">

set service dns dynamic name \<service-name\> address interface \<interface\>

Create new dynamic DNS update configuration which will update the IP
address assigned to <span class="title-ref">\<interface\></span> on the service you configured under
<span class="title-ref">\<service-name\></span>.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> description \<text\>

Set description <span class="title-ref">\<text\></span> for dynamic DNS service being configured.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> host-name \<hostname\>

Setup the dynamic DNS hostname <span class="title-ref">\<hostname\></span> associated with the DynDNS
provider identified by <span class="title-ref">\<service-name\></span>.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> username \<username\>

Configure <span class="title-ref">\<username\></span> used when authenticating the update request for
DynDNS service identified by <span class="title-ref">\<service-name\></span>.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> password \<password\>

Configure <span class="title-ref">\<password\></span> used when authenticating the update request for
DynDNS service identified by <span class="title-ref">\<service-name\></span>.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> protocol \<protocol\>

When a `custom` DynDNS provider is used, the protocol used for communicating
to the provider must be specified under <span class="title-ref">\<protocol\></span>. See the embedded
completion helper when entering above command for available protocols.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> server \<server\>

When a `custom` DynDNS provider is used the <span class="title-ref">\<server\></span> where update
requests are being sent to must be specified.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> ip-version 'ipv6'

Allow explicit IPv6 address for the interface.

</div>

#### Example:

Use deSEC (dedyn.io) as your preferred provider:

``` none
set service dns dynamic name dedyn description 'deSEC dynamic dns service'
set service dns dynamic name dedyn username 'myusername'
set service dns dynamic name dedyn password 'mypassword'
set service dns dynamic name dedyn host-name 'myhostname.dedyn.io'
set service dns dynamic name dedyn protocol 'dyndns2'
set service dns dynamic name dedyn server 'update.dedyn.io'
set service dns dynamic name dedyn address interface 'eth0'
```

<div class="note">

<div class="title">

Note

</div>

Multiple services can be used per interface. Just specify as many
services per interface as you like!

</div>

#### Example IPv6 only:

``` none
set service dns dynamic name dedyn description 'deSEC ipv6 dynamic dns service'
set service dns dynamic name dedyn username 'myusername'
set service dns dynamic name dedyn password 'mypassword'
set service dns dynamic name dedyn host-name 'myhostname.dedyn.io'
set service dns dynamic name dedyn protocol 'dyndns2'
set service dns dynamic name dedyn ip-version 'ipv6'
set service dns dynamic name dedyn server 'update6.dedyn.io'
set service dns dynamic name dedyn address interface 'eth0'
```

### Running Behind NAT

By default, [ddclient](https://github.com/ddclient/ddclient) will update a dynamic dns record using the IP address
directly attached to the interface. If your VyOS instance is behind NAT, your
record will be updated to point to your internal IP.

[ddclient](https://github.com/ddclient/ddclient) has another way to determine the WAN IP address. This is controlled
by:

<div class="cfgcmd">

set service dns dynamic name \<service-name\> address web \<url\>

Use configured <span class="title-ref">\<url\></span> to determine your IP address. [ddclient](https://github.com/ddclient/ddclient) will load
<span class="title-ref">\<url\></span> and tries to extract your IP address from the response.

</div>

<div class="cfgcmd">

set service dns dynamic name \<service-name\> address web skip \<pattern\>

[ddclient](https://github.com/ddclient/ddclient) will skip any address located before the string set in <span class="title-ref">\<pattern\></span>.

</div>
