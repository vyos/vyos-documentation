.. _pppoe-interface:

PPPoE
=====

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
---------------

VyOS supports setting up PPPoE in two different ways to a PPPoE internet
connection. This is due to most ISPs provide a modem that is also a wireless
router.

Home Users
**********

In this method, the DSL Modem/Router connects to the ISP for you with your
credentials preprogrammed into the device. This gives you an :rfc:`1918`
address, such as ``192.168.1.0/24`` by default.

For a simple home network using just the ISP's equipment, this is usually
desirable. But if you want to run VyOS as your firewall and router, this
will result in having a double NAT and firewall setup. This results in a
few extra layers of complexity, particularly if you use some NAT or
tunnel features.

Business Users
**************

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

Configuration Example
~~~~~~~~~~~~~~~~~~~~~

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

.. code-block:: console

  set interfaces ethernet eth0 description "DSL Modem"
  set interfaces ethernet eth0 duplex auto
  set interfaces ethernet eth0 smp_affinity auto
  set interfaces ethernet eth0 speed auto
  set interfaces ethernet eth0 pppoe 0 default-route 'auto'
  set interfaces ethernet eth0 pppoe 0 mtu 1492
  set interfaces ethernet eth0 pppoe 0 name-server 'auto'
  set interfaces ethernet eth0 pppoe 0 user-id 'userid'
  set interfaces ethernet eth0 pppoe 0 password 'secret'


You should add a firewall to your configuration above as well by
assigning it to the pppoe0 itself as shown here:

.. code-block:: console

  set interfaces ethernet eth0 pppoe 0 firewall in name NET-IN
  set interfaces ethernet eth0 pppoe 0 firewall local name NET-LOCAL
  set interfaces ethernet eth0 pppoe 0 firewall out name NET-OUT

VLAN Example
++++++++++++

Some recent ISPs require you to build the PPPoE connection through a VLAN
interface. One of those ISPs is e.g. Deutsche Telekom in Germany. VyOS
can easily create a PPPoE session through an encapsulated VLAN interface.
The following configuration will run your PPPoE connection through VLAN7
which is the default VLAN for Deutsche Telekom:

.. code-block:: console

  set interfaces ethernet eth0 description "DSL Modem"
  set interfaces ethernet eth0 duplex auto
  set interfaces ethernet eth0 smp_affinity auto
  set interfaces ethernet eth0 speed auto
  set interfaces ethernet eth0 vif 7 pppoe 0 default-route 'auto'
  set interfaces ethernet eth0 vif 7 pppoe 0 mtu '1492'
  set interfaces ethernet eth0 vif 7 pppoe 0 name-server 'auto'
  set interfaces ethernet eth0 vif 7 pppoe 0 user-id 'userid#0001@t-online.de'
  set interfaces ethernet eth0 vif 7 pppoe 0 password 'secret'

Troubleshooting
---------------

.. opcmd:: disconnect interface <interface>

Test disconnecting given connection-oriented interface. `<interface>` can be
``pppoe0`` as example.

.. opcmd:: connect interface <interface>

Test connecting given connection-oriented interface. `<interface>` can be
``pppoe0`` as example.

.. opcmd:: show interfaces pppoe <interface>

Check PPPoE connection logs with the following command which shows the current
statistics, status and some of the settings (i.e. MTU) for the current
connection on <interface> (e.g. ``pppoe0``)

.. opcmd:: show interfaces pppoe <interface> log

Show entire log for the PPPoE connection starting with the oldest data. Scroll
down with the <space> key to reach the end where the current data is.

.. opcmd::  show interfaces pppoe <interface> log tail

Shows the same log as without the 'tail' option but start with the last few
lines and continues to show added lines until you exit with ``Ctrl + x``
