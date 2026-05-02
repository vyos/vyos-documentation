# Host Information

This section describes the system's host information and how to configure them,
it covers the following topics:

- Host name
- Domain
- IP address
- Aliases

## Hostname

A hostname is the label (name) assigned to a network device (a host) on a
network and is used to distinguish one device from another on specific networks
or over the internet. On the other hand this will be the name which appears on
the command line prompt.

<div class="cfgcmd">

set system host-name \<hostname\>

The hostname can be up to 63 characters. A hostname
must start and end with a letter or digit, and have as interior characters
only letters, digits, or a hyphen.

The default hostname used is <span class="title-ref">vyos</span>.

</div>

## Domain Name

A domain name is the label (name) assigned to a computer network and is thus
unique. VyOS appends the domain name as a suffix to any unqualified name. For
example, if you set the domain name <span class="title-ref">example.com</span>, and you would ping the
unqualified name of <span class="title-ref">crux</span>, then VyOS qualifies the name to <span class="title-ref">crux.example.com</span>.

<div class="cfgcmd">

set system domain-name \<domain\>

Configure system domain name. A domain name must start and end with a letter
or digit, and have as interior characters only letters, digits, or a hyphen.

</div>

## Static Hostname Mapping

How an IP address is assigned to an interface in `ethernet-interface`.
This section shows how to statically map an IP address to a hostname for local
(meaning on this VyOS instance) name resolution. This is the VyOS equivalent to
<span class="title-ref">/etc/hosts</span> file entries.

<div class="note">

<div class="title">

Note

</div>

Do *not* manually edit <span class="title-ref">/etc/hosts</span>. This file will automatically be
regenerated on boot based on the settings in this section, which means you'll
lose all your manual edits. Instead, configure static host mappings as follows.

</div>

<div class="cfgcmd">

set system static-host-mapping host-name \<hostname\> inet \<address\>

Create a static hostname mapping which will always resolve the name
<span class="title-ref">\<hostname\></span> to IP address <span class="title-ref">\<address\></span>.

</div>

<div class="cfgcmd">

set system static-host-mapping host-name \<hostname\> alias \<alias\>

Create named <span class="title-ref">\<alias\></span> for the configured static mapping for <span class="title-ref">\<hostname\></span>.
Thus the address configured as `set system static-host-mapping
host-name <hostname> inet <address>` can be reached via multiple names.

Multiple aliases can be specified per host-name.

</div>
