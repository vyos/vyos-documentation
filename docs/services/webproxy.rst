Webproxy
--------

The proxy service in VyOS is based on Squid3 and some related modules.

Squid is a caching and forwarding HTTP web proxy. It has a wide variety of
uses, including speeding up a web server by caching repeated requests,
caching web, DNS and other computer network lookups for a group of people
sharing network resources, and aiding security by filtering traffic. Although
primarily used for HTTP and FTP, Squid includes limited support for several
other protocols including Internet Gopher, SSL,[6] TLS and HTTPS. Squid does
not support the SOCKS protocol.

All examples here assumes that your inside ip address is ``192.168.0.1``.
Replace with your own where applicable.

URL Filtering is provided by Squidguard_.

Configuration
^^^^^^^^^^^^^^

.. code-block:: sh

  # Enable proxy service
  set service webproxy listen-address 192.168.0.1

  # By default it will listen to port 3128. If you wan't something else you have to define that.
  set service webproxy listen-address 192.168.0.1 port 2050

  # By default the transparent proxy on that interface is enabled. To disable that you simply
  set service webproxy listen-address 192.168.0.1 disable-transparent

  # Block specific urls
  set service webproxy url-filtering squidguard local-block myspace.com

  # If you want to you can log these blocks
  set service webproxy url-filtering squidguard log local-block


Options
*******

Filtering by category
^^^^^^^^^^^^^^^^^^^^^

If you wan't to use existing blacklists you have to create/download a database
first. Otherwise you will not be able to commit the config changes.

.. code-block:: sh

  vyos@vyos# commit
  [ service webproxy ]
  Warning: no blacklists installed
  Unknown block-category [ads] for policy [default]

  [[service webproxy]] failed
  Commit failed

* Download/Update complete blacklist

  :code:`update webproxy blacklists`

* Download/Update partial blacklist

  :code:`update webproxy blacklists category ads`

  Use tab completion to get a list of categories.

* To auto update the blacklist files

  :code:`set service webproxy url-filtering squidguard auto-update update-hour 23`

* To configure blocking add the following to the configuration

  :code:`set service webproxy url-filtering squidguard block-category ads`

  :code:`set service webproxy url-filtering squidguard block-category malware`

Authentication
^^^^^^^^^^^^^^

The embedded Squid proxy can use LDAP to authenticate users against a company
wide directory. The following configuration is an example of how to use Active
Directory as authentication backend. Queries are done via LDAP.

.. code-block:: sh

  vyos@vyos# show service webproxy
   authentication {
       children 5
       credentials-ttl 60
       ldap {
           base-dn DC=rgtest,DC=local
           bind-dn CN=proxyuser,CN=Users,DC=rgtest,DC=local
           filter-expression (cn=%s)
           password Qwert1234
           server 192.168.188.201
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

Adjusting cache size
^^^^^^^^^^^^^^^^^^^^

The size of the proxy cache can be adjusted by the user.

.. code-block:: sh

  set service webproxy cache-size
   Possible completions:
     <0-4294967295>
                  Disk cache size in MB (default 100)
     0            Disable disk caching
     100

Bypassing the webproxy
^^^^^^^^^^^^^^^^^^^^^^

Some services don't work correctly when being handled via a web proxy.
So sometimes it is useful to bypass a transparent proxy:

* To bypass the proxy for every request that is directed to a specific
  destination:

  :code:`set service webproxy whitelist destination-address 1.2.3.4`

  :code:`set service webproxy whitelist destination-address 4.5.6.0/24`


* To bypass the proxy for every request that is coming from a specific source:

  :code:`set service webproxy whitelist source-address 192.168.1.2`

  :code:`set service webproxy whitelist source-address 192.168.2.0/24`

  (This can be useful when a called service has many and/or often changing
  destination addresses - e.g. Netflix.)

.. include:: references.rst
