Webproxy
--------

The proxy service in VyOS is based on Squid3 and some related modules.

Squid3_ is a caching and forwarding HTTP web proxy. It has a wide variety of
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

.. code-block:: none

  # Enable proxy service
  set service webproxy listen-address 192.168.0.1

  # By default it will listen to port 3128. If you want something else you have to define that.
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

If you want to use existing blacklists you have to create/download a database
first. Otherwise you will not be able to commit the config changes.

.. code-block:: none

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

.. code-block:: none

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

* ``base-dn`` set the base directory for the search
* ``bind-dn`` and ``password``: set the user, which is used for the ldap search
* ``filter-expression``: set the exact filter which a authorized user match in a ldap-search. In this example every User is able to authorized.

You can find more about the ldap authentication `here <http://www.squid-cache.org/Versions/v3/3.2/manuals/basic_ldap_auth.html>`_

Adjusting cache size
^^^^^^^^^^^^^^^^^^^^

The size of the proxy cache can be adjusted by the user.

.. code-block:: none

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

  :code:`set service webproxy whitelist destination-address 198.51.100.33`

  :code:`set service webproxy whitelist destination-address 192.0.2.0/24`


* To bypass the proxy for every request that is coming from a specific source:

  :code:`set service webproxy whitelist source-address 192.168.1.2`

  :code:`set service webproxy whitelist source-address 192.168.2.0/24`

  (This can be useful when a called service has many and/or often changing
  destination addresses - e.g. Netflix.)

.. _Squid3: http://www.squid-cache.org/
.. _Squidguard: http://www.squidguard.org/
