.. _pppoe:


PPPoE
=====

There are two main ways to setup VyOS to connect over a PPPoE internet connection. This is due to most ISPs (Internet Service Providers) providing a DSL modem that is also a wireless router.

**First Method:** (Common for Homes)

In this method, the DSL Modem/Router connects to the DSL ISP for you with your credentials preprogrammed into the device and it gives you a local IP address such as 192.168.1.0/24 be default.
For home networks this is usually fine and saves you trouble but if you want to run a configuration of your own controlled by VyOS, this would mean a Double Firewall, a Double NAT, and double Router as both the DSL Modem/Router and the VyOS would act as firewalls, NATs, and Routers and if you try to do more then just browse Web Sites this will usually cause you trouble.

**Second Method:** (Common for Businesses)

In order to have full control and make use of multiple static public IP addresses, your VyOS will have to initiate the PPPoE connection and control it.
In order for this method to work, you will have to figure out how to make your DSL Modem/Router switch into a Bridged Mode so it only acts as a DSL Transceiver device to connect between the Ethernet link of your VyOS and the phone cable.
Once your DSL Transceiver is in Bridge Mode, you should get no IP address from it.
Please make sure you connect to the Ethernet Port 1 if your DSL Transeiver has a switch, as some of them only work this way.
Once you have an Ethernet device connected, i.e. eth0, then you can configure it to open the PPPoE session for you and your DSL Transceiver (Modem/Router) just acts to translate your messages in a way that vDSL/aDSL understands.

**Here is an example configuration:**

.. code-block:: sh

  set interface ethernet eth0 description "DSL Modem"
  set interface ethernet eth0 duplex auto
  set interface ethernet eth0 smp_affinity auto
  set interface ethernet eth0 speed auto
  set interface ethernet eth0 pppoe 0 default-route auto
  set interface ethernet eth0 pppoe 0 mtu 1492
  set interface ethernet eth0 pppoe 0 name-server auto
  set interface ethernet eth0 pppoe 0 user-id <PPPoE Username>
  set interface ethernet eth0 pppoe 0 password <PPPoE Password>


* You should add a firewall to your configuration above as well by assigning it to the pppoe0 itself as shown here:

.. code-block:: sh

  set interface ethernet eth0 pppoe 0 firewall in name NET-IN
  set interface ethernet eth0 pppoe 0 firewall local name NET-LOCAL
  set interface ethernet eth0 pppoe 0 firewall out name NET-OUT

* You need your PPPoE credentials from your DSL ISP in order to configure this. The usual username is in the form of name@host.net but may vary depending on ISP.
* The largest MTU size you can use with DSL is 1492 due to PPPoE overhead. If you are switching from a DHCP based ISP like cable then be aware that things like VPN links may need to have their MTU sizes adjusted to work within this limit.
* With the ``default-route`` option set to ``auto``, VyOS will only add the Default Gateway you receive from your DSL ISP to the routing table if you have no other WAN connections. If you wish to use a Dual WAN connection, change the ``default-route`` option to ``force``.

Handling and troubleshooting
----------------------------

You can test connecting and disconnecting with the below commands:

.. code-block:: sh

  disconnect interface 0
  connect interface 0


You can check the PPPoE connection logs with the following:

This command shows the current statistics, status and some of the settings (i.e. MTU) for the current connection on pppoe0.

.. code-block:: sh

  show interfaces pppoe 0

This command shows the entire log for the PPPoE connection starting with the oldest data. Scroll down with the <space> key to reach the end where the current data is.

.. code-block:: sh

  show interfaces pppoe 0 log


This command shows the same log as without the 'tail' option but only starts with the last few lines and continues to show added lines until you exit with ``Ctrl + x``

.. code-block:: sh

  show interfaces pppoe 0 log tail
