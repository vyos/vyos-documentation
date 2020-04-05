.. _wwan-interface:

####################
WirelessModem (WWAN)
####################

Configuration
#############

The wirelessmodem interface provides access (through a wireless modem/wwan) to
wireless networks provided by various cellular providers. VyOS uses the
interfaces wirelessmodem subsystem for configuration.

Address
-------

.. cfgcmd:: set interfaces wirelessmodem <interface> apn <apn>

   Every WWAN connection requires an :abbr:`APN (Access Point Name)` which is
   used by the client to dial into the ISPs network. This is a mandatory
   parameter. See the following list of well-known APNs:

   - AT&T (isp.cingular)
   - Deutsche Telekom (internet.t-d1.de or internet.telekom)

.. cfgcmd:: set interfaces wirelessmodem <interface> backup distance <metric>

   Configure metric of the default route added via the Wireless Modem interface.
   The default metric if not specified is 10.

.. cfgcmd:: set interfaces wirelessmodem <interface> device <tty>

   Device identifier of the underlaying physical interface. This is usually a
   ttyUSB device, if not configured this defaults to ttyUSB2.

.. cfgcmd:: set interfaces wirelessmodem <interface> no-peer-dns

   Do not install DNS nameservers received from ISP into system wide nameserver
   list.

.. cfgcmd:: set interfaces wirelessmodem <interface> ondemand

   Enables or disables on-demand WWAN connection.

   Use this command to instruct the system to establish a PPP connection
   automatically once traffic passes through the interface. A disabled on-demand
   connection is established at boot time and remains up. If the link fails for
   any reason, the link is brought back up immediately.

Link Administration
-------------------

.. cfgcmd:: set interfaces wirelessmodem <interface> description <description>

   Assign given `<description>` to interface. Description will also be passed
   to SNMP monitoring systems.

.. cfgcmd:: set interfaces wirelessmodem <interface> disable

   Disable given `<interface>`. It will be placed in administratively down
   state.

.. cfgcmd:: set interfaces wirelessmodem <interface> mtu <mtu>

   Configure :abbr:`MTU (Maximum Transmission Unit)` on given `<interface>`. It
   is the size (in bytes) of the largest ethernet frame sent on this link.



Operation
=========
