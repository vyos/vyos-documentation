.. _l2tp:

VyOS utilizes accel-ppp_ to provide L2TP server functionality. It can be used
with local authentication or a connected RADIUS server.

L2TP over IPsec
---------------

Example for configuring a simple L2TP over IPsec VPN for remote access (works
with native Windows and Mac VPN clients):

.. code-block:: sh

  set vpn ipsec ipsec-interfaces interface eth0
  set vpn ipsec nat-traversal enable
  set vpn ipsec nat-networks allowed-network 0.0.0.0/0

  set vpn l2tp remote-access outside-address 203.0.113.2
  set vpn l2tp remote-access client-ip-pool start 192.168.255.1
  set vpn l2tp remote-access client-ip-pool stop 192.168.255.254
  set vpn l2tp remote-access ipsec-settings authentication mode pre-shared-secret
  set vpn l2tp remote-access ipsec-settings authentication pre-shared-secret <secret>
  set vpn l2tp remote-access authentication mode local
  set vpn l2tp remote-access authentication local-users username <username> password <password>

In the example above an external IP of 203.0.113.2 is assumed.

If a local firewall policy is in place on your external interface you will need
to open:

* UDP port 500 (IKE)
* IP protocol number 50 (ESP)
* UDP port 1701 for IPsec

In addition when NAT is detected by the VPN client ESP is encapsulated in UDP
for NAT-traversal:

* UDP port 4500 (NAT-T)

Example:

.. code-block:: sh

  set firewall name OUTSIDE-LOCAL rule 40 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 40 destination port '50'
  set firewall name OUTSIDE-LOCAL rule 40 protocol 'esp'
  set firewall name OUTSIDE-LOCAL rule 41 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 41 destination port '500'
  set firewall name OUTSIDE-LOCAL rule 41 protocol 'udp'
  set firewall name OUTSIDE-LOCAL rule 42 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 42 destination port '4500'
  set firewall name OUTSIDE-LOCAL rule 42 protocol 'udp'
  set firewall name OUTSIDE-LOCAL rule 43 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 43 destination port '1701'
  set firewall name OUTSIDE-LOCAL rule 43 ipsec 'match-ipsec'
  set firewall name OUTSIDE-LOCAL rule 43 protocol 'udp'

Also note that if you wish to allow the VPN to be used for external access you
will need to add the appropriate source NAT rules to your configuration.

.. code-block:: sh

  set nat source rule 110 outbound-interface 'eth0'
  set nat source rule 110 source address '192.168.255.0/24'
  set nat source rule 110 translation address masquerade

To be able to resolve when connected to the VPN, the following DNS rules are
needed as well.

.. code-block:: sh

  set vpn l2tp remote-access dns-servers server-1 '8.8.8.8'
  set vpn l2tp remote-access dns-servers server-2 '8.8.4.4'

.. note:: Those are the `Google public DNS`_ servers. You can also use the
   public available servers from Quad9_ (9.9.9.9) or Cloudflare_ (1.1.1.1).

Established sessions can be viewed using the **show vpn remote-access**
operational command.

.. code-block:: sh

  vyos@vyos:~$ show vpn remote-access
  Active remote access VPN sessions:
  User            Proto Iface     Tunnel IP       TX byte RX byte  Time
  ----            ----- -----     ---------       ------- -------  ----
  vyos            L2TP  l2tp0     192.168.255.1      3.2K    8.0K  00h06m13s

RADIUS authentication
^^^^^^^^^^^^^^^^^^^^^

The above configuration made use of local accounts on the VyOS router for
authenticating L2TP/IPSec clients. In bigger environments usually something
like RADIUS_ (FreeRADIUS_ or Microsoft `Network Policy Server`_, NPS) is used.

VyOS supports either `local` or `radius` user authentication:

.. code-block:: sh

  set vpn l2tp remote-access authentication mode <local|radius>

In addition one or more RADIUS_ servers can be configured to server for user
authentication. This is done using the `radius server` and `radius server key`
nodes:

.. code-block:: sh

  set vpn l2tp remote-access authentication radius server 1.1.1.1 key 'foo'
  set vpn l2tp remote-access authentication radius server 2.2.2.2 key 'foo'

.. note:: Some RADIUS_ severs make use of an access control list who is allowed
   to query the server. Please configure your VyOS router in the allowed client
   list.

RADIUS source address
*********************

If you are using e.g. OSPF as IGP always the nearest interface facing the RADIUS
server is used. With VyOS 1.2 you can bind all outgoing RADIUS requests to a
single source IP e.g. the loopback interface.

.. code-block:: sh

  set vpn l2tp remote-access authentication radius source-address 3.3.3.3

Above command will use `3.3.3.3` as source IPv4 address for all RADIUS queries
on this NAS.


.. _`Google Public DNS`: https://developers.google.com/speed/public-dns
.. _Quad9: https://quad9.net
.. _CloudFlare: https://blog.cloudflare.com/announcing-1111
.. _RADIUS: https://en.wikipedia.org/wiki/RADIUS
.. _FreeRADIUS: https://freeradius.org
.. _`Network Policy Server`: https://en.wikipedia.org/wiki/Network_Policy_Server
