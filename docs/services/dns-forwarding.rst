DNS Forwarding
--------------

Use DNS forwarding if you want your router to function as a DNS server for the
local network. There are several options, the easiest being 'forward all
traffic to the system DNS server(s)' (defined with set system name-server):

.. code-block:: sh

  set service dns forwarding system

Manually setting DNS servers for forwarding:

.. code-block:: sh

  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4

Manually setting DNS servers with IPv6 connectivity:

.. code-block:: sh

  set service dns forwarding name-server 2001:4860:4860::8888
  set service dns forwarding name-server 2001:4860:4860::8844

Setting a forwarding DNS server for a specific domain:

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1

Example 1
^^^^^^^^^

Router with two interfaces eth0 (WAN link) and eth1 (LAN). A DNS server for the
local domain (example.com) is at 192.0.2.1, other DNS requests are forwarded
to Google's DNS servers.

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding listen-on 'eth1'

Example 2
^^^^^^^^^

Same as example 1 but with additional IPv6 addresses for Google's public DNS
servers:

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding name-server 2001:4860:4860::8888
  set service dns forwarding name-server 2001:4860:4860::8844
  set service dns forwarding listen-on 'eth1'
