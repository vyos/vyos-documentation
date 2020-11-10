.. _wwan-interface:

####################
WirelessModem (WWAN)
####################

Configuration
#############

The wirelessmodem interface provides access (through a wireless modem/wwan) to
wireless networks provided by various cellular providers. VyOS uses the
interfaces wirelessmodem subsystem for configuration.

Common interface configuration
------------------------------

.. cmdinclude:: ../_include/interface-description.txt
   :var0: wirelessmodem
   :var1: wlm0

.. cmdinclude:: ../_include/interface-disable.txt
   :var0: wirelessmodem
   :var1: wlm0

.. cmdinclude:: ../_include/interface-vrf.txt
   :var0: wirelessmodem
   :var1: wlm0

WWAN specific options
---------------------

.. cfgcmd:: set interfaces wirelessmodem <interface> apn <apn>

   Every WWAN connection requires an :abbr:`APN (Access Point Name)` which is
   used by the client to dial into the ISPs network. This is a mandatory
   parameter. Contact your Service Provider for correct APN.

.. cfgcmd:: set interfaces wirelessmodem <interface> backup distance <metric>

   Configure metric of the default route added via the Wireless Modem interface.
   The default metric if not specified is 10.

.. cfgcmd:: set interfaces wirelessmodem <interface> device <tty>

   Device identifier of the underlaying physical interface. This is usually a
   ttyUSB device, if not configured this defaults to ttyUSB2.

.. cfgcmd:: set interfaces wirelessmodem <interface> no-peer-dns

   Do not install DNS nameservers received from ISP into system wide nameserver
   list.

.. cfgcmd:: set interfaces wirelessmodem <interface> connect-on-demand

   When set the interface is enabled for "dial-on-demand".

   Use this command to instruct the system to establish a PPP connection
   automatically once traffic passes through the interface. A disabled on-demand
   connection is established at boot time and remains up. If the link fails for
   any reason, the link is brought back up immediately.

Example
=======

The following example is based on a Sierra Wireless MC7710 miniPCIe card (only
the form factor in reality it runs UBS) and Deutsche Telekom as ISP. The card
is assembled into a :ref:`pc-engines-apu4`.

.. code-block:: none

  set interfaces wirelessmodem wlm0 apn 'internet.telekom'
  set interfaces wirelessmodem wlm0 backup distance '100'
  set interfaces wirelessmodem wlm0 device 'ttyUSB2'
  set interfaces wirelessmodem wlm0 disable
  set interfaces wirelessmodem wlm0 no-peer-dns

Operation
=========

.. opcmd:: show interfaces wirelessmodem <interface>

   Retrive interface information from given WWAN interface.

   .. code-block:: none

     vyos@vyos:~$ show interfaces wirelessmodem wlm0
     wlm0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast master black state UNKNOWN group default qlen 3
         link/ppp
         inet 10.26.238.93 peer 10.64.64.64/32 scope global wlm0
            valid_lft forever preferred_lft forever
         Description: baaar

         RX:  bytes    packets     errors    dropped    overrun      mcast
                 38          5          0          0          0          0
         TX:  bytes    packets     errors    dropped    carrier collisions
                217          8          0          0          0          0

.. opcmd:: show interfaces wirelessmodem <interface> statistics

   Retrive interface statistics from given WWAN interface.

   .. code-block:: none

     vyos@vyos:~$ show interfaces wirelessmodem wlm0 statistics
         IN   PACK VJCOMP  VJUNC  VJERR  |      OUT   PACK VJCOMP  VJUNC NON-VJ
         38      5      0      0      0  |      217      8      0      0      8

.. opcmd:: show interfaces wirelessmodem <interface> log

   Displays log information for a WWAN interface.

Supported Modules
#################

The following hardware modules have been tested successfully in an
:ref:`pc-engines-apu4` board:

* Sierra Wireless AirPrime MC7304 miniPCIe card (LTE)
* Sierra Wireless AirPrime MC7430 miniPCIe card (LTE)
* Sierra Wireless AirPrime MC7455 miniPCIe card (LTE)
* Sierra Wireless AirPrime MC7710 miniPCIe card (LTE)
* Huawei ME909u-521 miniPCIe card (LTE)

