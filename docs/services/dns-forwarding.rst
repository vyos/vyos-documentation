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
  
Set which networks or clients are allowed to query the DNS Server. Allow from all:

.. code-block:: sh

  set service dns forwarding allow-from 0.0.0.0/0

Example 1
^^^^^^^^^

Router with two interfaces eth0 (WAN link) and eth1 (LAN). Split DNS for example.com.

* DNS request for a local domain (example.com) get forwarded to 192.0.2.1
* Other DNS requests are forwarded to Google's DNS servers.
* The IP address for the LAN interface is 192.168.0.1.

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding listen-address 192.168.0.1
  set service dns forwarding allow-from 0.0.0.0/0

Example 2
^^^^^^^^^

Same as example 1 but with additional IPv6 addresses for Google's public DNS
servers.

The IP addresses for the LAN interface are 192.168.0.1 and 2001:db8::1

.. code-block:: sh

  set service dns forwarding domain example.com server 192.0.2.1
  set service dns forwarding name-server 8.8.8.8
  set service dns forwarding name-server 8.8.4.4
  set service dns forwarding name-server 2001:4860:4860::8888
  set service dns forwarding name-server 2001:4860:4860::8844
  set service dns forwarding listen-address 2001:db8::1
  set service dns forwarding listen-address 192.168.0.1 
  set service dns forwarding allow-from 0.0.0.0/0
