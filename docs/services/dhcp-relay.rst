

DHCP Relay
----------

If you want your router to forward DHCP requests to an external DHCP server
you can configure the system to act as a DHCP relay agent. The DHCP relay
agent works with IPv4 and IPv6 addresses.

All interfaces used for the DHCP relay must be configured. See
https://wiki.vyos.net/wiki/Network_address_setup.

DHCP relay example
^^^^^^^^^^^^^^^^^^

.. figure:: /_static/images/service_dhcp-relay01.png
   :scale: 80 %
   :alt: DHCP relay example

   DHCP relay example

In this example the interfaces used for the DHCP relay are eth1 and eth2. The
router receives DHCP client requests on eth1 and relays them through eth2 to
the DHCP server at 10.0.1.4.

Configuration
^^^^^^^^^^^^^

Enable DHCP relay for eth1 and eth2:

.. code-block:: console

  set service dhcp-relay interface eth1
  set service dhcp-relay interface eth2

Set the IP address of the DHCP server:

.. code-block:: console

  set service dhcp-relay server 10.0.1.4

The router should discard DHCP packages already containing relay agent
information to ensure that only requests from DHCP clients are forwarded:

.. code-block:: console

  set service dhcp-relay relay-options relay-agents-packets discard

Commit the changes and show the results:

.. code-block:: console

  commit
  show service dhcp-relay
      interface eth1
      interface eth2
      server 10.0.1.4
      relay-options {
         relay-agents-packets discard
      }

The DHCP relay agent can be restarted with:

.. code-block:: console

  restart dhcp relay-agent

DHCPv6 relay example
^^^^^^^^^^^^^^^^^^^^

.. figure:: /_static/images/service_dhcpv6-relay01.png
   :scale: 80 %
   :alt: DHCPv6 relay example

   DHCPv6 relay example

In this example DHCPv6 requests are received by the router on eth1
(`listening interface`) and forwarded through eth2 (`upstream interface`) to
the external DHCPv6 server at 2001:db8:100::4.

Configuration
*************

Set eth1 to be the listening interface for the DHCPv6 relay:

.. code-block:: console

  set service dhcpv6-relay listen-interface eth1

Set eth2 to be the upstream interface and specify the IPv6 address of
the DHCPv6 server:

.. code-block:: console

  set service dhcpv6-relay upstream-interface eth2 address 2001:db8:100::4

Commit the changes and show results:

.. code-block:: console

  commit
  show service dhcpv6-relay
      listen-interface eth1 {
      }
      upstream-interface eth2 {
         address 2001:db8:100::4
      }

Show the current status of the DHCPv6 relay agent:

.. code-block:: console

  show dhcpv6 relay-agent status

The DHCPv6 relay agent can be restarted with:

.. code-block:: console

  restart dhcpv6 relay-agent

Additional parameters
^^^^^^^^^^^^^^^^^^^^^

DHCP relay agent options
************************

Set the maximum hop count before packets are discarded. Range 0...255,
default 10.

* :code:`set service dhcp-relay relay-options hop-count 'count'`

Set maximum size of DHCP packets including relay agent information. If a
DHCP packet size surpasses this value it will be forwarded without appending
relay agent information. Range 64...1400, default 576.

* :code:`set service dhcp-relay relay-options max-size 'size'`

Four policies for reforwarding DHCP packets exist:

* **append:** The relay agent is allowed to append its own relay information
  to a received DHCP packet, disregarding relay information already present in
  the packet.

* **discard:** Received packets which already contain relay information will
  be discarded.

* **forward:** All packets are forwarded, relay information already present
  will be ignored.

* **replace:** Relay information already present in a packet is stripped and
  replaced with the router's own relay information set.

* :code:`set service dhcp-relay relay-options relay-agents-packet 'policy'`

DHCPv6 relay agent options
**************************

Set maximum hop count before packets are discarded. Default: 10.

* :code:`set service dhcpv6-relay max-hop-count 'count'`

If this is set the relay agent will insert the interface ID. This option is
set automatically if more than one listening interfaces are in use.

* :code:`set service dhcpv6-relay use-interface-id-option`
