# System Proxy

Some IT environments require the use of a proxy to connect to the Internet.
Without this configuration VyOS updates could not be installed directly by
using the `add system image` command (`update_vyos`).

<div class="cfgcmd">

set system proxy url \<url\>

Set proxy for all connections initiated by VyOS, including HTTP, HTTPS, and
FTP (anonymous ftp).

</div>

<div class="cfgcmd">

set system proxy port \<port\>

Configure proxy port if it does not listen to the default port 80.

</div>

<div class="cfgcmd">

set system proxy username \<username\>

Some proxies require/support the "basic" HTTP authentication scheme as per
`7617`, thus a username can be configured.

</div>

<div class="cfgcmd">

set system proxy password \<password\>

Some proxies require/support the "basic" HTTP authentication scheme as per
`7617`, thus a password can be configured.

</div>
