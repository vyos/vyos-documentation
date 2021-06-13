.. _wwan-interface:

#################################
WWAN - Wireless Wide-Area-Network
#################################

The Wireless Wide-Area-Network interface provides access (through a wireless
modem/wwan) to wireless networks provided by various cellular providers.

VyOS uses the `interfaces wwan` subsystem for configuration.

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-address-with-dhcp.txt
   :var0: wwan
   :var1: wwan0


.. cmdinclude:: /_include/interface-description.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-disable.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-disable-link-detect.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-mtu.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-ip.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-ipv6.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-vrf.txt
   :var0: wwan
   :var1: wwan0

**DHCP(v6)**

.. cmdinclude:: /_include/interface-dhcp-options.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-dhcpv6-options.txt
   :var0: wwan
   :var1: wwan0

.. cmdinclude:: /_include/interface-dhcpv6-prefix-delegation.txt
   :var0: wwan
   :var1: wwan0

WirelessModem (WWAN) options
============================

.. cfgcmd:: set interfaces wwan <interface> apn <apn>

   Every WWAN connection requires an :abbr:`APN (Access Point Name)` which is
   used by the client to dial into the ISPs network. This is a mandatory
   parameter. Contact your Service Provider for correct APN.


*********
Operation
*********

TBD

*******
Example
*******

The following example is based on a Sierra Wireless MC7710 miniPCIe card (only
the form factor in reality it runs UBS) and Deutsche Telekom as ISP. The card
is assembled into a :ref:`pc-engines-apu4`.

.. code-block:: none

  set interfaces wwan wwan0 apn 'internet.telekom'
  set interfaces wwan wwan0 address 'dhcp'

*****************
Supported Modules
*****************

The following hardware modules have been tested successfully in an
:ref:`pc-engines-apu4` board:

* Sierra Wireless AirPrime MC7304 miniPCIe card (LTE)
* Sierra Wireless AirPrime MC7430 miniPCIe card (LTE)
* Sierra Wireless AirPrime MC7455 miniPCIe card (LTE)
* Sierra Wireless AirPrime MC7710 miniPCIe card (LTE)
* Huawei ME909u-521 miniPCIe card (LTE)
* Huawei ME909s-120 miniPCIe card (LTE)
