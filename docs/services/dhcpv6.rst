
DHCPv6 server
-------------

VyOS provides DHCPv6 server functionality which is described in this section.
In order to use the DHCPv6 server it has to be enabled first:

.. code-block:: sh

  set service dhcpv6-server

To restart the DHCPv6 server (operational mode):

.. code-block:: sh

  restart dhcpv6 server

To show the current status of the DHCPv6 server use:

.. code-block:: sh

  show dhcpv6 server status

Show statuses of all assigned leases:

.. code-block:: sh

  show dhcpv6 server leases

DHCPv6 server options
^^^^^^^^^^^^^^^^^^^^^

DHCPv6 server preference value
******************************

Clients receiving advertise messages from multiple servers choose the server
with the highest preference value. The range for this value is `0...255`. Set
a preference value for the DHCPv6 server:

.. code-block:: sh

  set service dhcpv6-server preference <preference value>

Delete a preference:

.. code-block:: sh

  set service dhcpv6-server preference

Show current preference:

.. code-block:: sh

  show service dhcpv6-server preference

Specify address lease time
**************************

The default lease time for DHCPv6 leases is 24 hours. This can be changed by
supplying a `default-time`, `maximum-time` and `minimum-time` (all values in
seconds):

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> lease-time {default <default-time> | maximum <maximum-time> | minimum <minimum-time>}

Reset the custom lease times:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> lease-time {default | maximum | minimum}

Show the current configuration:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> lease-time {default | maximum | minimum}

Specify NIS domain
******************

A Network Information (NIS) domain can be set to be used for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-domain <nis-domain-name>

To Delete the NIS domain:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-domain <nis-domain-name>

Show a configured NIS domain:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-domain <nis-domain-name>

Specify NIS+ domain
*******************

The procedure to specify a Network Information Service Plus (NIS+) domain is
similar to the NIS domain one:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-domain <nisplus-domain-name>

To Delete the NIS+ domain:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-domain <nisplus-domain-name>

Show a configured NIS domain:

 # show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-domain <nisplus-domain-name>

Specify NIS server address
**************************

To specify a NIS server address for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-server <IPv6 address>

Delete a specified NIS server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-server <IPv6 address>

Show specified NIS server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nis-server

Specify NIS+ server address
***************************

To specify a NIS+ server address for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-server <IPv6 address>

Delete a specified NIS+ server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-server <IPv6 address>

Show specified NIS+ server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> nisplus-server

Specify a SIP server address for DHCPv6 clients
***********************************************

By IPv6 address
###############


A Session Initiation Protocol (SIP) server address can be specified
for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-address <IPv6 address>

Delete a specified SIP server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-address <IPv6 address>

Show specified SIP server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-address

By FQDN
#######

A name for SIP server can be specified:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-name <sip-server-name>

Delete a specified SIP server name:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-name <sip-server-name>

Show specified SIP server names:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> sip-server-name

Simple Network Time Protocol (SNTP) server address for DHCPv6 clients
*********************************************************************

A SNTP server address can be specified for DHCPv6 clients:

.. code-block:: sh

  set service dhcpv6-server shared-network-name <name> subnet <ipv6net> sntp-server-address <IPv6 address>

Delete a specified SNTP server address:

.. code-block:: sh

  delete service dhcpv6-server shared-network-name <name> subnet <ipv6net> sntp-server-address <IPv6 address>

Show specified SNTP server addresses:

.. code-block:: sh

  show service dhcpv6-server shared-network-name <name> subnet <ipv6net> sntp-server-address

DHCPv6 address pools
^^^^^^^^^^^^^^^^^^^^

DHCPv6 address pools must be configured for the system to act as a DHCPv6
server. The following example describes a common scenario.

Example 1: DHCPv6 address pool
******************************

A shared network named `NET1` serves subnet `2001:db8:100::/64` which is
connected to `eth1`, a DNS server at `2001:db8:111::111` is used for name
services. The range of the address pool shall be `::100` through `::199`. The
lease time will be left at the default value which is 24 hours.

.. code-block:: sh

  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 address-range start 2001:db8:100::100 stop 2001:db8:100::199
  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 name-server 2001:db8:111::111

Commit the changes and show the configuration:

.. code-block:: sh

  commit
  show service dhcpv6-server
      shared-network-name NET1 {
          subnet 2001:db8:100::/64 {
             address-range {
                start 2001:db8:100::100 {
                   stop 2001:db8:100::199
                }
             }
             name-server 2001:db8:111::111
          }
      }

Static mappings
^^^^^^^^^^^^^^^

In order to map specific IPv6 addresses to specific hosts static mappings can
be created. The following example explains the process.

Example 1: Static IPv6 MAC-based mapping
****************************************

IPv6 address `2001:db8:100::101` shall be statically mapped to a device with
MAC address `00:15:c5:b7:5e:23`, this host-specific mapping shall be named
`client1`.

.. note:: The MAC address identifier is defined by the last 4 byte of the
   MAC address.

.. code-block:: sh

  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 static-mapping client1 ipv6-address 2001:db8:100::101
  set service dhcpv6-server shared-network-name NET1 subnet 2001:db8:100::/64 static-mapping client1 identifier c5b75e23

Commit the changes and show the configuration:

.. code-block:: sh

  show service dhcp-server shared-network-name NET1
     shared-network-name NET1 {
         subnet 2001:db8:100::/64 {
            name-server 2001:db8:111::111
            address-range {
                start 2001:db8:100::100 {
                   stop 2001:db8:100::199 {
                }
            }
            static-mapping client1 {
               ipv6-address 2001:db8:100::101
               identifier c5b75e23
            }
         }
      }
