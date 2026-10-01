(webproxy)=

# Webproxy

The proxy service in VyOS is based on [Squid] and some related modules.

[Squid] is a caching and forwarding HTTP web proxy. It has a wide variety of
uses, including speeding up a web server by caching repeated requests, caching
web, DNS and other computer network lookups for a group of people sharing
network resources, and aiding security by filtering traffic. Although primarily
used for HTTP and FTP, Squid includes limited support for several other
protocols including Internet Gopher, SSL,[6] TLS and HTTPS. Squid does not
support the SOCKS protocol.

URL Filtering is provided by [SquidGuard].

## Configuration

```{cfgcmd} set service webproxy append-domain \<domain\>

Use this command to specify a domain name to be appended to domain-names
within URLs that do not include a dot ``.`` the domain is appended.

Example: to be appended is set to ``vyos.net`` and the URL received is
``www/foo.html``, the system will use the generated, final URL of
``www.vyos.net/foo.html``.

:::{code-block} none
set service webproxy append-domain vyos.net
:::
```


```{cfgcmd} set service webproxy cache-size \<size\>

The size of the on-disk Proxy cache is user configurable. The Proxies default
cache-size is configured to 100 MB.

Unit of this command is MB.

:::{code-block} none
set service webproxy cache-size 1024
:::
```


```{cfgcmd} set service webproxy default-port \<port\>

Specify the port used on which the proxy service is listening for requests.
This port is the default port used for the specified listen-address.

Default port is 3128.

:::{code-block} none
set service webproxy default-port 8080
:::
```


```{cfgcmd} set service webproxy domain-block \<domain\>

Used to block specific domains by the Proxy. Specifying "vyos.net" will block
all access to vyos.net, and specifying ".xxx" will block all access to URLs
having an URL ending on .xxx.

:::{code-block} none
set service webproxy domain-block vyos.net
:::
```


```{cfgcmd} set service webproxy domain-noncache \<domain\>

Allow access to sites in a domain without retrieving them from the Proxy
cache. Specifying "vyos.net" will allow access to vyos.net but the pages
accessed will not be cached. It useful for working around problems with
"If-Modified-Since" checking at certain sites.

:::{code-block} none
set service webproxy domain-noncache vyos.net
:::
```


```{cfgcmd} set service webproxy listen-address \<address\>

Specifies proxy service listening address. The listen address is the IP
address on which the web proxy service listens for client requests.

For security, the listen address should only be used on internal/trusted
networks!

:::{code-block} none
set service webproxy listen-address 192.0.2.1
:::
```


```{cfgcmd} set service webproxy listen-address \<address\> disable-transparent

Disables web proxy transparent mode at a listening address.

In transparent proxy mode, all traffic arriving on port 80 and destined for
the Internet is automatically forwarded through the proxy. This allows
immediate proxy forwarding without configuring client browsers.

Non-transparent proxying requires that the client browsers be configured with
the proxy settings before requests are redirected. The advantage of this is
that the client web browser can detect that a proxy is in use and can behave
accordingly. In addition, web-transmitted malware can sometimes be blocked by
a non-transparent web proxy, since they are not aware of the proxy settings.

:::{code-block} none
set service webproxy listen-address 192.0.2.1 disable-transparent
:::
```


```{cfgcmd} set service webproxy listen-address \<address\> port \<port\>

Sets the listening port for a listening address. This overrides the default
port of 3128 on the specific listen address.

:::{code-block} none
set service webproxy listen-address 192.0.2.1 port 8080
:::
```
```{cfgcmd} set service webproxy reply-block-mime \<mime\>

Used to block a specific mime-type.

:::{code-block} none
# block all PDFs
set service webproxy reply-block-mime application/pdf
:::
```
```{cfgcmd} set service webproxy reply-body-max-size \<size\>

Specifies the maximum size of a reply body in KB, used to limit the reply
size.

All reply sizes are accepted by default.

:::{code-block} none
set service webproxy reply-body-max-size 2048
:::
```


```{cfgcmd} set service webproxy safe-ports \<port\>

Add new port to Safe-ports acl. Ports included by default in Safe-ports acl:
21, 70, 80, 210, 280, 443, 488, 591, 777, 873, 1025-65535
```


```{cfgcmd} set service webproxy ssl-safe-ports \<port\>

Add new port to SSL-ports acl. Ports included by default in SSL-ports acl:
443
```

### Authentication

The embedded Squid proxy can use LDAP to authenticate users against a company
wide directory. The following configuration is an example of how to use Active
Directory as authentication backend. Queries are done via LDAP.

```{cfgcmd} set service webproxy authentication children \<number\>

Maximum number of authenticator processes to spawn. If you start too few
Squid will have to wait for them to process a backlog of credential
verifications, slowing it down. When password verifications are done via a
(slow) network you are likely to need lots of authenticator processes.

This defaults to 5.

:::{code-block} none
set service webproxy authentication children 10
:::
```


```{cfgcmd} set service webproxy authentication credentials-ttl \<time\>

Specifies how long squid assumes an externally validated username:password
pair is valid for - in other words how often the helper program is called for
that user. Set this low to force revalidation with short lived passwords.

Time is in minutes and defaults to 60.

:::{code-block} none
set service webproxy authentication credentials-ttl 120
:::
```
```{cfgcmd} set service webproxy authentication method \<ldap\>

Proxy authentication method, currently only LDAP is supported.

:::{code-block} none
set service webproxy authentication method ldap
:::
```


```{cfgcmd} set service webproxy authentication realm

Specifies the protection scope (aka realm name) which is to be reported to
the client for the authentication scheme. It is commonly part of the text
the user will see when prompted for their username and password.

:::{code-block} none
set service webproxy authentication realm "VyOS proxy auth"
:::
```

#### LDAP

```{cfgcmd} set service webproxy authentication ldap base-dn \<base-dn\>

Specifies the base DN under which the users are located.

:::{code-block} none
set service webproxy authentication ldap base-dn DC=vyos,DC=net
:::
```
```{cfgcmd} set service webproxy authentication ldap bind-dn \<bind-dn\>

The DN and password to bind as while performing searches.

:::{code-block} none
set service webproxy authentication ldap bind-dn CN=proxyuser,CN=Users,DC=vyos,DC=net
:::
```


```{cfgcmd} set service webproxy authentication ldap filter-expression \<expr\>

LDAP search filter to locate the user DN. Required if the users are in a
hierarchy below the base DN, or if the login name is not what builds the user
specific part of the users DN.

The search filter can contain up to 15 occurrences of %s which will be
replaced by the username, as in "uid=%s" for {rfc}`2037` directories. For a
detailed description of LDAP search filter syntax see {rfc}`2254`.

:::{code-block} none
set service webproxy authentication ldap filter-expression (cn=%s)
:::
```


```{cfgcmd} set service webproxy authentication ldap password \<password\>

The DN and password to bind as while performing searches. As the password
needs to be printed in plain text in your Squid configuration it is strongly
recommended to use a account with minimal associated privileges. This to limit
the damage in case someone could get hold of a copy of your Squid
configuration file.

:::{code-block} none
set service webproxy authentication ldap password vyos
:::
```


```{cfgcmd} set service webproxy authentication ldap persistent-connection

Use a persistent LDAP connection. Normally the LDAP connection is only open
while validating a username to preserve resources at the LDAP server. This
option causes the LDAP connection to be kept open, allowing it to be reused
for further user validations.

Recommended for larger installations.

:::{code-block} none
set service webproxy authentication ldap persistent-connection
:::
```


```{cfgcmd} set service webproxy authentication ldap port \<port\>

Specify an alternate TCP port where the ldap server is listening if other than
the default LDAP port 389.

:::{code-block} none
set service webproxy authentication ldap port 389
:::
```


```{cfgcmd} set service webproxy authentication ldap server \<server\>

Specify the LDAP server to connect to.

:::{code-block} none
set service webproxy authentication ldap server ldap.vyos.net
:::
```
```{cfgcmd} set service webproxy authentication ldap use-ssl

Use TLS encryption.

:::{code-block} none
set service webproxy authentication ldap use-ssl
:::
```
```{cfgcmd} set service webproxy authentication ldap username-attribute \<attr\>

Specifies the name of the DN attribute that contains the username/login.
Combined with the base DN to construct the users DN when no search filter is
specified (filter-expression).

Defaults to 'uid'

:::{note}
This can only be done if all your users are located directly under
the same position in the LDAP tree and the login name is used for naming
each user object. If your LDAP tree does not match these criteria or if you
want to filter who are valid users then you need to use a search filter to
search for your users DN (filter-expression).
:::

:::{code-block} none
set service webproxy authentication ldap username-attribute uid
:::
```


```{cfgcmd} set service webproxy authentication ldap version \<2 | 3\>

LDAP protocol version. Defaults to 3 if not specified.

:::{code-block} none
set service webproxy authentication ldap version 2
:::
```

### URL filtering

URL filtering is provided by [SquidGuard]. Squid hands every request to
SquidGuard, which either lets it through or answers with a redirect to a
block page. Category based filtering needs the blacklist databases described
in the Update part of the Operation section below.

```{cfgcmd} set service webproxy url-filtering disable

Disables web filtering without discarding configuration.

:::{code-block} none
set service webproxy url-filtering disable
:::
```

#### How a request is decided

Clients are split in two groups. A client whose address is part of a
source group that is referenced by a rule is handled by that rule. Every
other client is handled by the global `url-filtering squidguard` settings.

For one client the checks run from left to right and the first match decides:

1. Global settings only: URLs that use an IP address instead of a host name
   are blocked, unless `allow-ipaddr-url` is set.
2. `local-ok` and `local-ok-url`: allowed.
3. `local-block`, `local-block-url` and `local-block-keyword`: blocked.
4. `block-category`: blocked.
5. `allow-category`: allowed.
6. If nothing matched, `default-action` decides. The default is `allow`.

Blocked requests are answered with an HTTP 302 redirect to `redirect-url`.

:::{note}
Not every option can be used in every place. The descriptions below name the
options that are only evaluated in the global settings, and the options the
CLI accepts but that are currently not used when the SquidGuard configuration
is generated.
:::

#### Global settings

```{cfgcmd} set service webproxy url-filtering squidguard block-category \<category\>

Block a blacklist category, for example `ads` or `malware`. Can be given
multiple times. Use tab completion to list the categories that are installed.

The category database has to exist. If it does not, the commit still
succeeds, but only prints a warning and the category has no effect until the
database is installed with {opcmd}`update webproxy blacklists`.

:::{code-block} none
set service webproxy url-filtering squidguard block-category ads
set service webproxy url-filtering squidguard block-category malware
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard allow-category \<category\>

Allow a blacklist category. Can be given multiple times. This is useful
together with `default-action block`, where only the listed categories are
let through.

:::{code-block} none
set service webproxy url-filtering squidguard allow-category news
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard default-action \<allow | block\>

Action for every request that no other setting matched. Defaults to `allow`.
With `block` only explicitly allowed sites and categories are let through.

:::{code-block} none
set service webproxy url-filtering squidguard default-action block
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard allow-ipaddr-url

By default SquidGuard blocks URLs that use an IP address instead of a host
name, such as `http://203.0.113.9/`. This option allows them.

Only the global setting is evaluated, clients that are handled by a rule are
not checked for IP address URLs.
```

```{cfgcmd} set service webproxy url-filtering squidguard redirect-url \<url\>

Blocked requests are redirected (HTTP 302) to this URL. Defaults to
`block.vyos.net`.

Only the global setting is evaluated. Blocked requests of clients that are
handled by a rule are redirected to the global URL as well.

:::{code-block} none
set service webproxy url-filtering squidguard redirect-url blocked.example.net
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard enable-safe-search

Rewrites search queries on popular search engines (Google, Bing, Yahoo,
Yandex, Live and MSN) so that their safe search mode is used.

Only clients that are not handled by a rule are affected.
```

```{cfgcmd} set service webproxy url-filtering squidguard log \<category\>

Log matches to `/var/log/squid/blacklist.log`.

The command takes a category name, but the value is currently not evaluated.
As soon as `log` is configured once, matches of all configured categories and
of the global settings are logged. Only the global `log` is evaluated, the
`log` of a rule has no effect.
```

```{cfgcmd} set service webproxy url-filtering squidguard auto-update update-hour \<0-23\>

Hour of the day at which the blacklist databases are updated automatically.
Defaults to `0`.

:::{code-block} none
set service webproxy url-filtering squidguard auto-update update-hour 23
:::
```

#### Local lists

Local lists add your own sites to the filter. They are available globally and
per rule, and are compiled into SquidGuard databases when the configuration
is committed. They do not need the blacklist download.

```{cfgcmd} set service webproxy url-filtering squidguard local-block \<address | fqdn\>

Block a site by IPv4 address or host name. Can be given multiple times.

:::{code-block} none
set service webproxy url-filtering squidguard local-block blocked.example.com
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard local-block-url \<url\>

Block a URL. Write it without the leading `http://`. Can be given multiple
times.

:::{code-block} none
set service webproxy url-filtering squidguard local-block-url example.org/private
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard local-block-keyword \<keyword\>

Block every URL that contains the keyword. The value is a regular
expression. Can be given multiple times.

:::{code-block} none
set service webproxy url-filtering squidguard local-block-keyword casino
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard local-ok \<address | fqdn\>

Always allow a site, by IPv4 address or host name. Allowed sites are checked
before any blocking setting, so they win over `local-block` and over the
blocked categories. Can be given multiple times.

:::{code-block} none
set service webproxy url-filtering squidguard local-ok good.example.com
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard local-ok-url \<url\>

Always allow a URL. Write it without the leading `http://`. Can be given
multiple times.

:::{code-block} none
set service webproxy url-filtering squidguard local-ok-url example.org/public
:::
```

#### Source groups

A source group names the clients a rule applies to.

```{cfgcmd} set service webproxy url-filtering squidguard source-group \<name\> address \<address | prefix\>

IPv4 address or prefix of the clients in the group. Can be given multiple
times.

:::{code-block} none
set service webproxy url-filtering squidguard source-group kids address 192.0.2.0/24
set service webproxy url-filtering squidguard source-group kids address 198.51.100.5
:::
```

```{cfgcmd} set service webproxy url-filtering squidguard source-group \<name\> description \<text\>

Description of the source group.
```

:::{note}
The following source group options are accepted by the CLI, but are currently
not used when the SquidGuard configuration is generated, so they do not
select any client: `domain`, `user`, `ldap-ip-search` and `ldap-user-search`.
:::

```{cfgcmd} set service webproxy url-filtering squidguard source-group \<name\> domain \<domain\>
```

```{cfgcmd} set service webproxy url-filtering squidguard source-group \<name\> user \<user\>
```

```{cfgcmd} set service webproxy url-filtering squidguard source-group \<name\> ldap-ip-search \<expression\>
```

```{cfgcmd} set service webproxy url-filtering squidguard source-group \<name\> ldap-user-search \<expression\>
```

#### Rules

A rule applies its own filter settings to the clients of one source group.
Clients of a source group that has a rule are *only* handled by the rule, the
global settings do not apply to them.

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> source-group \<name\>

Source group the rule applies to.

:::{code-block} none
set service webproxy url-filtering squidguard rule 10 source-group kids
:::
```

These settings work like their global counterparts, described above:

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> block-category \<category\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> allow-category \<category\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> default-action \<allow | block\>

With `block` the clients of the source group can only reach what the rule
explicitly allows. A rule with `default-action block` and nothing allowed
blocks everything for its clients.
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> local-block \<address | fqdn\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> local-block-url \<url\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> local-block-keyword \<keyword\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> local-ok \<address | fqdn\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> local-ok-url \<url\>
```

:::{note}
The following rule options are accepted by the CLI, but are currently not
evaluated for the clients of a rule: `allow-ipaddr-url`, `enable-safe-search`,
`redirect-url`, `log` and `time-period`. Use the global `redirect-url` and
`log` instead, they apply to the clients of a rule as well. Safe search is not
available for those clients, and they are not checked for IP address URLs.
The `time-period` nodes below are not used either.
:::

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> allow-ipaddr-url
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> enable-safe-search
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> redirect-url \<url\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> log \<category\>
```

```{cfgcmd} set service webproxy url-filtering squidguard rule \<1-1024\> time-period \<name\>
```

```{cfgcmd} set service webproxy url-filtering squidguard time-period \<name\> description \<text\>
```

```{cfgcmd} set service webproxy url-filtering squidguard time-period \<name\> days \<Sun | Mon | Tue | Wed | Thu | Fri | Sat\> time \<hh:mm-hh:mm\>
```

#### Example

Block ads and malware for everybody, but let the clients in `192.0.2.0/24`
only reach the `news` category and one local site:

:::{code-block} none
set service webproxy url-filtering squidguard block-category ads
set service webproxy url-filtering squidguard block-category malware
set service webproxy url-filtering squidguard redirect-url blocked.example.net
set service webproxy url-filtering squidguard source-group kids address 192.0.2.0/24
set service webproxy url-filtering squidguard rule 10 source-group kids
set service webproxy url-filtering squidguard rule 10 default-action block
set service webproxy url-filtering squidguard rule 10 allow-category news
set service webproxy url-filtering squidguard rule 10 local-ok school.example.org
:::

## Operation

```{include} /_include/need_improvement.txt
```

### Filtering
#### Update

If you want to use existing blacklists you have to create/download a database
first. A category without a database does not stop the commit, but prints a
warning and has no effect until the database exists:

:::{code-block} none
WARNING: DB of category ads does not exist.
 Use [update webproxy blacklists] or delete undefined category!
:::

```{opcmd} update webproxy blacklists

Download/Update complete blacklist

:::{code-block} none
vyos@vyos:~$ update webproxy blacklists
Warning: No url-filtering blacklist installed
Would you like to download a default blacklist? [confirm][y]
Connecting to ftp.example.com (192.0.2.249:21)
blacklists.gz        100% |*************************************************************************************************************| 17.0M  0:00:00 ETA
Uncompressing blacklist...
Checking permissions...
Skip link for   [ads] -> [publicite]
Building DB for [adult/domains] - 2467177 entries
Building DB for [adult/urls] - 67798 entries
Skip link for   [aggressive] -> [agressif]
Building DB for [agressif/domains] - 348 entries
Building DB for [agressif/urls] - 36 entries
Building DB for [arjel/domains] - 69 entries
...
Building DB for [webmail/domains] - 374 entries
Building DB for [webmail/urls] - 9 entries
The webproxy daemon must be restarted
Would you like to restart it now? [confirm][y]
[ ok ] Restarting squid (via systemctl): squid.service.
vyos@vyos:~$
:::
```
```{opcmd} update webproxy blacklists category \<category\>

Download/Update partial blacklist.

Use tab completion to get a list of categories.
```

- To auto update the blacklist files

  `set service webproxy url-filtering squidguard auto-update update-hour 23`

- To configure blocking add the following to the configuration

  `set service webproxy url-filtering squidguard block-category ads`

  `set service webproxy url-filtering squidguard block-category malware`

#### Bypassing the webproxy

```{include} /_include/need_improvement.txt
```

Some services don't work correctly when being handled via a web proxy.
So sometimes it is useful to bypass a transparent proxy:

- To bypass the proxy for every request that is directed to a specific
  destination:

  `set service webproxy whitelist destination-address 198.51.100.33`

  `set service webproxy whitelist destination-address 192.0.2.0/24`

- To bypass the proxy for every request that is coming from a specific source:

  `set service webproxy whitelist source-address 192.168.1.2`

  `set service webproxy whitelist source-address 192.168.2.0/24`

  (This can be useful when a called service has many and/or often changing
  destination addresses - e.g. Netflix.)

## Examples

```none
vyos@vyos# show service webproxy
 authentication {
     children 5
     credentials-ttl 60
     ldap {
         base-dn DC=example,DC=local
         bind-dn CN=proxyuser,CN=Users,DC=example,DC=local
         filter-expression (cn=%s)
         password Qwert1234
         server ldap.example.local
         username-attribute cn
     }
     method ldap
     realm "VyOS Webproxy"
 }
 cache-size 100
 default-port 3128
 listen-address 192.168.188.103 {
     disable-transparent
 }
```

[squid]: http://www.squid-cache.org/
[squidguard]: http://www.squidguard.org/
