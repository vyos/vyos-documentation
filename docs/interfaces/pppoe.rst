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

Operating Modes
===============

VyOS supports setting up PPPoE in two different ways to a PPPoE internet
connection. This is due to most ISPs provide a modem that is also a wireless
router.

Home Users
----------

In this method, the DSL Modem/Router connects to the ISP for you with your
credentials preprogrammed into the device. This gives you an :rfc:`1918`
address, such as ``192.168.1.0/24`` by default.

For a simple home network using just the ISP's equipment, this is usually
desirable. But if you want to run VyOS as your firewall and router, this
will result in having a double NAT and firewall setup. This results in a
few extra layers of complexity, particularly if you use some NAT or
tunnel features.

Business Users
--------------

In order to have full control and make use of multiple static public IP
addresses, your VyOS will have to initiate the PPPoE connection and control
it. In order for this method to work, you will have to figure out how to make
your DSL Modem/Router switch into a Bridged Mode so it only acts as a DSL
Transceiver device to connect between the Ethernet link of your VyOS and the
phone cable. Once your DSL Transceiver is in Bridge Mode, you should get no
IP address from it. Please make sure you connect to the Ethernet Port 1 if
your DSL Transeiver has a switch, as some of them only work this way.

Once you have an Ethernet device connected, i.e. `eth0`, then you can
configure it to open the PPPoE session for you and your DSL Transceiver
(Modem/Router) just acts to translate your messages in a way that
vDSL/aDSL understands.

Configuration
=============

.. cfgcmd:: set interfaces pppoe <interface> access-concentrator <name>

   Use this command to restrict the PPPoE session on a given access
   concentrator. Normally, a host sends a PPPoE initiation packet to start the
   PPPoE discovery process, a number of access concentrators respond with offer
   packets and the host selects one of the responding access concentrators to
   serve this session.

   This command allows you to select a specific access concentrator when you
   know the access concentrators `<name>`.

.. cfgcmd:: set interfaces pppoe <interface> authentication user <username>

   Use this command to set the username for authenticating with a remote PPPoE
   endpoint. Authentication is optional from the system's point of view but
   most service providers require it.

.. cfgcmd:: set interfaces pppoe <interface> authentication password <password>

   Use this command to set the password for authenticating with a remote PPPoE
   endpoint. Authentication is optional from the system's point of view but
   most service providers require it.

.. cfgcmd:: set interfaces pppoe <interface> connect-on-demand

   Enables or disables on-demand PPPoE connection on a PPPoE unit.

   Use this command to instruct the system to establish a PPPoE connections
   automatically once traffic passes through the interface. A disabled on-demand
   connection is established at boot time and remains up. If the link fails for
   any reason, the link is brought back up immediately.

   Enabled on-demand PPPoE connections bring up the link only when traffic needs
   to pass this link.  If the link fails for any reason, the link is brought
   back up automatically once traffic passes the interface again. If you
   configure an on-demand PPPoE connection, you must also configure the idle
   timeout period, after which an idle PPPoE link will be disconnected. A
   non-zero idle timeout will never disconnect the link after it first came up.

.. cfgcmd:: set interfaces pppoe <interface> default-route

   Use this command to specify whether to automatically add a default route
   pointing to the endpoint of the PPPoE when the link comes up. The default
   route is only added if no other default route already exists in the system.

   **default:** A default route to the remote endpoint is automatically added
   when the link comes up (i.e. auto).

.. cfgcmd:: set interfaces pppoe <interface> description

   Assign given `<description>` to interface. Description will also be passed
   to SNMP monitoring systems.

.. cfgcmd:: set interfaces pppoe <interface> disable

   Disable given `<interface>`. It will be placed in administratively down
   (``A/D``) state.

.. cfgcmd:: set interfaces pppoe <interface> idle-timeout <time>

   Use this command to set the idle timeout interval to be used with on-demand
   PPPoE sessions. When an on-demand connection is established, the link is
   brought up only when traffic is sent and is disabled when the link is idle
   for the interval specified.

   If this parameter is not set or 0, an on-demand link will not be taken down
   when it is idle and after the initial establishment of the connection. It
   will stay up forever.

.. cfgcmd:: set interfaces pppoe <interface> local-address <address>

   Use this command to set the IP address of the local endpoint of a PPPoE
   session. If it is not set it will be negotiated.

.. cfgcmd:: set interfaces pppoe <interface> mtu <mtu>

   Configure :abbr:`MTU (Maximum Transmission Unit)` on given `<interface>`. It
   is the size (in bytes) of the largest ethernet frame sent on this link.

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

IPv6
----

.. cfgcmd:: set interfaces pppoe <interface> ipv6 enable

   Use this command to enable IPv6 support on this PPPoE connection.

.. cfgcmd:: set interfaces pppoe <interface> ipv6 address autoconf

   Use this command to enable acquisition of IPv6 address using stateless
   autoconfig (SLAAC).


Operation
=========

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

.. opcmd:: show interfaces pppoe <interface> log

   Displays log information for a PPPoE interface.

.. opcmd:: show interfaces pppoe <interface> queue

   Displays queue information for a PPPoE interface.

   .. code-block:: none

     vyos@vyos:~$ show interfaces pppoe pppoe0 queue
     qdisc pfifo_fast 0: root refcnt 2 bands 3 priomap  1 2 2 2 1 2 0 0 1 1 1 1 1 1 1 1
      Sent 534625359 bytes 1626761 pkt (dropped 62, overlimits 0 requeues 0)
      backlog 0b 0p requeues 0

Connect/Disconnect
------------------

.. opcmd:: disconnect interface <interface>

   Test disconnecting given connection-oriented interface. `<interface>` can be
   ``pppoe0`` as example.

.. opcmd:: connect interface <interface>

   Test connecting given connection-oriented interface. `<interface>` can be
   ``pppoe0`` as example.

Example
=======

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
* With the ``default-route`` option set to ``auto``, VyOS will only add the
  default gateway you receive from your DSL ISP to the routing table if you
  have no other WAN connections. If you wish to use a dual WAN connection,
  change the ``default-route`` option to ``force``.
* With the ``name-server`` option set to ``none``, VyOS will ignore the
  nameservers your ISP sens you and thus you can fully rely on the ones you
  have configured statically.

.. note:: Syntax has changed from VyOS 1.2 (crux) and it will be automatically
   migrated during an upgrade.

.. code-block:: none

  set interfaces pppoe pppoe0 default-route 'auto'
  set interfaces pppoe pppoe0 mtu 1492
  set interfaces pppoe pppoe0 authentication user 'userid'
  set interfaces pppoe pppoe0 authentication password 'secret'
  set interfaces pppoe pppoe0 source-interface 'eth0'


You should add a firewall to your configuration above as well by
assigning it to the pppoe0 itself as shown here:

.. code-block:: none

  set interfaces pppoe pppoe0 firewall in name NET-IN
  set interfaces pppoe pppoe0 firewall local name NET-LOCAL
  set interfaces pppoe pppoe0 firewall out name NET-OUT

VLAN Example
------------

Some recent ISPs require you to build the PPPoE connection through a VLAN
interface. One of those ISPs is e.g. Deutsche Telekom in Germany. VyOS
can easily create a PPPoE session through an encapsulated VLAN interface.
The following configuration will run your PPPoE connection through VLAN7
which is the default VLAN for Deutsche Telekom:

.. code-block:: none

  set interfaces pppoe pppoe0 default-route 'auto'
  set interfaces pppoe pppoe0 mtu 1492
  set interfaces pppoe pppoe0 authentication user 'userid'
  set interfaces pppoe pppoe0 authentication password 'secret'
  set interfaces pppoe pppoe0 source-interface 'eth0.7'

