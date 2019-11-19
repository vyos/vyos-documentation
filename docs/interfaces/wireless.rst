.. _wireless:

Wireless Interfaces
-------------------

:abbr:`WLAN (Wireless LAN)` interface provide 802.11 (a/b/g/n/ac) wireless
support (commonly referred to as Wi-Fi) by means of compatible hardware. If your
hardware supports it, VyOS supports multiple logical wireless interfaces per
physical device.

There are three modes of operation for a wireless interface:

* :abbr:`WAP (Wireless Access-Point)` provides network access to connecting
  stations if the physical hardware supports acting as a WAP
  
* A station acts as a Wi-Fi client accessing the network through an available
  WAP

* Monitor, the system passively monitors any kind of wireless traffic

If the system detects an unconfigured wireless device, it will be automatically
added the configuration tree, specifying any detected settings (for example,
its MAC address) and configured to run in monitor mode.

To be able to use the wireless interfaces you will first need to set a
regulatory domain with the country code of your locaion.

.. option:: set system wifi-regulatory-domain DE

   Configure system wide Wi-Fi regulatory domain. A reboot is required for this
   change to be enabled.   

Configuring Access-Point
^^^^^^^^^^^^^^^^^^^^^^^^

The following example creates a WAP. When configuring multiple WAP interfaces,
you must specify unique IP addresses, channels, Network IDs commonly refered
to as :addr:`SSID (Service Set Identifier), and MAC addresses.

The WAP in this example has the following characteristics:
* IP address ``192.0.2.1/24``
* Network ID (SSID) ``TEST``
* WPA passphrase ``12345678``
* Use 802.11n protocol
* Wireless channel ``1``

.. code-block:: sh

  set interfaces wireless wlan0 address '192.0.2.1/24'
  set interfaces wireless wlan0 type access-point
  set interfaces wireless wlan0 channel 1
  set interfaces wireless wlan0 ssid 'TEST'
  set interfaces wireless wlan0 security wpa mode wpa2
  set interfaces wireless wlan0 security wpa cipher CCMP
  set interfaces wireless wlan0 security wpa passphrase '12345678'

Resulting in

.. code-block:: sh

  interfaces {
    [...]
    wireless wlan0 {
          address 192.0.2.1/24
          channel 1
          mode g
          security {
              wpa {
                  cipher CCMP
                  mode wpa2
                  passphrase "12345678"
              }
          }
          ssid "TEST"
          type access-point
      }
  }
  system {
    [...]
    wifi-regulatory-domain DE
  }

To get it to work as a access point with this configuration you will need
to set up a DHCP server to work with that network. You can - of course - also
bridge the Wireless interface with any configured bridge (:ref:`bridge`) on
the system.

Configuring Wireless Station
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The example creates a wireless station (commonly referred to as Wi-Fi client)
that accesses the network through the WAP defined in the above example. The
default physical device (``phy0``) is used.

.. code-block:: sh

  set interfaces wireless wlan0 type station
  set interfaces wireless wlan0 address dhcp
  set interfaces wireless wlan0 ssid Test
  set interfaces wireless wlan0 security wpa

Resulting in

.. code-block:: sh

  interfaces {
    [...]
    wireless wlan0 {
      address dhcp
      security {
        wpa {
          passphrase "12345678"
        }
      }
      ssid TEST
      type station
	}