:lastproofread: 2022-07-27

.. _pppoe-interface:

#####
PPPoE
#####

:abbr:`PPPoE (Point-to-Point Protocol over Ethernet)` is a network protocol
for encapsulating PPP frames inside Ethernet frames. It appeared in 1999,
in the context of the boom of DSL as the solution for tunneling packets
over the DSL connection to the :abbr:`ISPs (Internet Service Providers)`
IP network, and from there to the rest of the Internet. A 2005 networking
book noted that "Most DSL providers use PPPoE, which provides authentication,
encryption, and compression." Typical use of PPPoE involves leveraging the
PPP facilities for authenticating the user with a username and password,
predominately via the PAP protocol and less often via CHAP.

***************
Operating Modes
***************

VyOS supports setting up PPPoE in two different ways to a PPPoE internet
connection. This is because most ISPs provide a modem that is also a wireless
router.

Home Users
==========

In this method, the DSL Modem/Router connects to the ISP for you with your
credentials preprogrammed into the device. This gives you an :rfc:`1918`
address, such as ``192.168.1.0/24`` by default.

For a simple home network using just the ISP's equipment, this is usually
desirable. But if you want to run VyOS as your firewall and router, this
will result in having a double NAT and firewall setup. This results in a
few extra layers of complexity, particularly if you use some NAT or
tunnel features.

Business Users
==============

In order to have full control and make use of multiple static public IP
addresses, your VyOS will have to initiate the PPPoE connection and control
it. In order for this method to work, you will have to figure out how to make
your DSL Modem/Router switch into a Bridged Mode so it only acts as a DSL
Transceiver device to connect between the Ethernet link of your VyOS and the
phone cable. Once your DSL Transceiver is in Bridge Mode, you should get no
IP address from it. Please make sure you connect to the Ethernet Port 1 if
your DSL Transceiver has a switch, as some of them only work this way.

Once you have an Ethernet device connected, i.e. `eth0`, then you can
configure it to open the PPPoE session for you and your DSL Transceiver
(Modem/Router) just acts to translate your messages in a way that
vDSL/aDSL understands.

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-description.txt
   :var0: pppoe
   :var1: pppoe0

.. cmdinclude:: /_include/interface-disable.txt
   :var0: pppoe
   :var1: pppoe0

.. cmdinclude:: /_include/interface-mtu.txt
   :var0: pppoe
   :var1: pppoe0

.. cmdinclude:: /_include/interface-vrf.txt
   :var0: pppoe
   :var1: pppoe0

PPPoE options
=============

.. cfgcmd:: set interfaces pppoe <interface> access-concentrator <name>

   Use this command to restrict the PPPoE session on a given access
   concentrator. Normally, a host sends a PPPoE initiation packet to start the
   PPPoE discovery process, a number of access concentrators respond with offer
   packets and the host selects one of the responding access concentrators to
   serve this session.

   This command allows you to select a specific access concentrator when you
   know the access concentrators `<name>`.

.. cfgcmd:: set interfaces pppoe <interface> authentication username <username>

   Use this command to set the username for authenticating with a remote PPPoE
   endpoint. Authentication is optional from the system's point of view but
   most service providers require it.

.. cfgcmd:: set interfaces pppoe <interface> authentication password <password>

   Use this command to set the password for authenticating with a remote PPPoE
   endpoint. Authentication is optional from the system's point of view but
   most service providers require it.

.. cfgcmd:: set interfaces pppoe <interface> connect-on-demand

   When set the interface is enabled for "dial-on-demand".

   Use this command to instruct the system to establish a PPPoE connection
   automatically once traffic passes through the interface. A disabled on-demand
   connection is established at boot time and remains up. If the link fails for
   any reason, the link is brought back up immediately.

   Enabled on-demand PPPoE connections bring up the link only when traffic needs
   to pass this link.  If the link fails for any reason, the link is brought
   back up automatically once traffic passes the interface again. If you
   configure an on-demand PPPoE connection, you must also configure the idle
   timeout period, after which an idle PPPoE link will be disconnected. A
   non-zero idle timeout will never disconnect the link after it first came up.

.. cfgcmd:: set interfaces pppoe <interface> no-default-route

   Only request an address from the PPPoE server but do not install any default
   route.

   Example:

   .. code-block:: none

     set interfaces pppoe pppoe0 no-default-route

   .. note:: This command got added in VyOS 1.4 and inverts the logic from the old
     ``default-route`` CLI option.

.. cfgcmd:: set interfaces pppoe <interface> default-route-distance <distance>

   Set the distance for the default gateway sent by the PPPoE server.

   Example:

   .. code-block:: none

     set interfaces pppoe pppoe0 default-route-distance 220

.. cfgcmd:: set interfaces pppoe <interface> mru <mru>

   Set the :abbr:`MRU (Maximum Receive Unit)` to `mru`. PPPd will ask the peer to
   send packets of no more than `mru` bytes. The value of `mru` must be between 128
   and 16384.

   A value of 296 works well on very slow links (40 bytes for TCP/IP header + 256
   bytes of data).

   The default is 1492.

   .. note:: When using the IPv6 protocol, MRU must be at least 1280 bytes.

.. cfgcmd:: set interfaces pppoe <interface> idle-timeout <time>

   Use this command to set the idle timeout interval to be used with on-demand
   PPPoE sessions. When an on-demand connection is established, the link is
   brought up only when traffic is sent and is disabled when the link is idle
   for the interval specified.

   If this parameter is not set or 0, an on-demand link will not be taken down
   when it is idle and after the initial establishment of the connection. It
   will stay up forever.

.. cfgcmd:: set interfaces pppoe <interface> holdoff <time>

   Use this command to set re-dial delay time to be used with persist PPPoE
   sessions. When the PPPoE session is terminated by peer, and on-demand
   option is not set, the router will attempt to re-establish the PPPoE link.

   If this parameter is not set, the default holdoff time is 30 seconds.

.. cfgcmd:: set interfaces pppoe <interface> local-address <address>

   Use this command to set the IP address of the local endpoint of a PPPoE
   session. If it is not set it will be negotiated.

.. cfgcmd:: set interfaces pppoe <interface> no-peer-dns

   Use this command to not install advertised DNS nameservers into the local
   system.

.. cfgcmd:: set interfaces pppoe <interface> remote-address <address>

   Use this command to set the IP address of the remote endpoint of a PPPoE
   session. If it is not set it will be negotiated.

.. cfgcmd:: set interfaces pppoe <interface> service-name <name>

   Use this command to specify a service name by which the local PPPoE interface
   can select access concentrators to connect with. It will connect to any
   access concentrator if not set.

.. cfgcmd:: set interfaces pppoe <interface> source-interface <source-interface>

   Use this command to link the PPPoE connection to a physical interface. Each
   PPPoE connection must be established over a physical interface. Interfaces
   can be regular Ethernet interfaces, VIFs or bonding interfaces/VIFs.

.. cfgcmd:: set interfaces pppoe <interface> ip adjust-mss <mss | clamp-mss-to-pmtu>

  As Internet wide PMTU discovery rarely works, we sometimes need to clamp our
  TCP MSS value to a specific value. This is a field in the TCP options part of
  a SYN packet. By setting the MSS value, you are telling the remote side
  unequivocally 'do not try to send me packets bigger than this value'.

  .. note:: This command was introduced in VyOS 1.4 - it was previously called:
    ``set firewall options interface <name> adjust-mss <value>``

  .. hint:: MSS value = MTU - 20 (IP header) - 20 (TCP header), resulting in
    1452 bytes on a 1492 byte MTU.

  Instead of a numerical MSS value `clamp-mss-to-pmtu` can be used to
  automatically set the proper value.

.. cfgcmd:: set interfaces pppoe <interface> ip disable-forwarding

  Configure interface-specific Host/Router behaviour. If set, the interface will
  switch to host mode and IPv6 forwarding will be disabled on this interface.

.. cfgcmd:: set interfaces pppoe <interface> ip source-validation <strict | loose | disable>

  Enable policy for source validation by reversed path, as specified in
  :rfc:`3704`. Current recommended practice in :rfc:`3704` is to enable strict
  mode to prevent IP spoofing from DDos attacks. If using asymmetric routing
  or other complicated routing, then loose mode is recommended.

  - strict: Each incoming packet is tested against the FIB and if the interface
    is not the best reverse path the packet check will fail. By default failed
    packets are discarded.

  - loose: Each incoming packet's source address is also tested against the FIB
    and if the source address is not reachable via any interface the packet
    check will fail.

  - disable: No source validation

IPv6
----

.. cfgcmd:: set interfaces pppoe <interface> ipv6 address autoconf

   Use this command to enable acquisition of IPv6 address using stateless
   autoconfig (SLAAC).

.. cfgcmd:: set interfaces pppoe <interface> ipv6 adjust-mss <mss | clamp-mss-to-pmtu>

  As Internet wide PMTU discovery rarely works, we sometimes need to clamp our
  TCP MSS value to a specific value. This is a field in the TCP options part of
  a SYN packet. By setting the MSS value, you are telling the remote side
  unequivocally 'do not try to send me packets bigger than this value'.

  .. note:: This command was introduced in VyOS 1.4 - it was previously called:
    ``set firewall options interface <name> adjust-mss <value>``

  .. hint:: MSS value = MTU - 40 (IPv6 header) - 20 (TCP header), resulting in
    1432 bytes on a 1492 byte MTU.

  Instead of a numerical MSS value `clamp-mss-to-pmtu` can be used to
  automatically set the proper value.

.. cfgcmd:: set interfaces pppoe <interface> ipv6 disable-forwarding

  Configure interface-specific Host/Router behaviour. If set, the interface will
  switch to host mode and IPv6 forwarding will be disabled on this interface.

.. cmdinclude:: /_include/interface-dhcpv6-prefix-delegation.txt
  :var0: pppoe
  :var1: pppoe0

*********
Operation
*********

.. opcmd:: show interfaces pppoe <interface>

   Show detailed information on given `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces pppoe pppoe0
     pppoe0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1492 qdisc pfifo_fast state UNKNOWN group default qlen 3
         link/ppp
         inet 192.0.2.1 peer 192.0.2.255/32 scope global pppoe0
            valid_lft forever preferred_lft forever

         RX:  bytes    packets     errors    dropped    overrun      mcast
         7002658233    5064967          0          0          0          0
         TX:  bytes    packets     errors    dropped    carrier collisions
          533822843    1620173          0          0          0          0

.. opcmd:: show interfaces pppoe <interface> queue

   Displays queue information for a PPPoE interface.

   .. code-block:: none

     vyos@vyos:~$ show interfaces pppoe pppoe0 queue
     qdisc pfifo_fast 0: root refcnt 2 bands 3 priomap  1 2 2 2 1 2 0 0 1 1 1 1 1 1 1 1
      Sent 534625359 bytes 1626761 pkt (dropped 62, overlimits 0 requeues 0)
      backlog 0b 0p requeues 0

Connect/Disconnect
==================

.. opcmd:: disconnect interface <interface>

   Test disconnecting given connection-oriented interface. `<interface>` can be
   ``pppoe0`` as the example.

.. opcmd:: connect interface <interface>

   Test connecting given connection-oriented interface. `<interface>` can be
   ``pppoe0`` as the example.

*******
Example
*******

Requirements:

* Your ISPs modem is connected to port ``eth0`` of your VyOS box.
* No VLAN tagging required by your ISP.
* You need your PPPoE credentials from your DSL ISP in order to configure
  this. The usual username is in the form of name@host.net but may vary
  depending on ISP.
* The largest MTU size you can use with DSL is 1492 due to PPPoE overhead.
  If you are switching from a DHCP based ISP like cable then be aware that
  things like VPN links may need to have their MTU sizes adjusted to work
  within this limit.
* With the ``name-server`` option set to ``none``, VyOS will ignore the
  nameservers your ISP sends you and thus you can fully rely on the ones you
  have configured statically.

.. note:: Syntax has changed from VyOS 1.2 (crux) and it will be automatically
   migrated during an upgrade.

.. note:: A default route is automatically installed once the interface is up.
  To change this behavior use the ``no-default-route`` CLI option.

.. code-block:: none

  set interfaces pppoe pppoe0 authentication username 'userid'
  set interfaces pppoe pppoe0 authentication password 'secret'
  set interfaces pppoe pppoe0 source-interface 'eth0'


You should add a firewall to your configuration above as well by
assigning it to the pppoe0 itself as shown here:

.. code-block:: none

  set firewall interface pppoe0 in name NET-IN
  set firewall interface pppoe0 local name NET-LOCAL
  set firewall interface pppoe0 out name NET-OUT

VLAN Example
============

Some recent ISPs require you to build the PPPoE connection through a VLAN
interface. One of those ISPs is e.g. Deutsche Telekom in Germany. VyOS
can easily create a PPPoE session through an encapsulated VLAN interface.
The following configuration will run your PPPoE connection through VLAN7
which is the default VLAN for Deutsche Telekom:

.. code-block:: none

  set interfaces pppoe pppoe0 authentication username 'userid'
  set interfaces pppoe pppoe0 authentication password 'secret'
  set interfaces pppoe pppoe0 source-interface 'eth0.7'


IPv6 DHCPv6-PD Example
----------------------

.. stop_vyoslinter

The following configuration will setup a PPPoE session source from eth1 and
assign a /64 prefix out of a /56 delegation (requested from the ISP) to eth0.
The IPv6 address assigned to eth0 will be <prefix>::1/64. If you do not know
the prefix size delegated to you, start with sla-len 0.

In addition we setup IPv6 :abbr:`RA (Router Advertisements)` to make the
prefix known on the eth0 link.

.. start_vyoslinter

.. code-block:: none

  set interfaces pppoe pppoe0 authentication username vyos
  set interfaces pppoe pppoe0 authentication password vyos
  set interfaces pppoe pppoe0 dhcpv6-options pd 0 interface eth0 address '1'
  set interfaces pppoe pppoe0 dhcpv6-options pd 0 interface eth0 sla-id '0'
  set interfaces pppoe pppoe0 dhcpv6-options pd 0 length '56'
  set interfaces pppoe pppoe0 ipv6 address autoconf
  set interfaces pppoe pppoe0 source-interface eth1

  set service router-advert interface eth0 prefix ::/64
