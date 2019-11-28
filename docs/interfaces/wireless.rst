Wireless Interfaces
-------------------
.. _interfaces-wireless:

Wireless, for example WiFi 802.11 b/g/n, interfaces allow for connection to
WiFi networks or act as an access-point.
If your device is configurable it will appear as `wlan` in `show interfaces`.

To be able to use the wireless interfaces you will first need to set a
regulatory domain with the country code of your locaion.

.. code-block:: none

  set system wifi-regulatory-domain SE

An example on how to set it up as an access point:

.. code-block:: none

  set interfaces wireless wlan0 address '192.168.99.1/24'
  set interfaces wireless wlan0 type access-point
  set interfaces wireless wlan0 channel 1
  set interfaces wireless wlan0 ssid '<your ssid>'
  set interfaces wireless wlan0 security wpa mode wpa2
  set interfaces wireless wlan0 security wpa cipher CCMP
  set interfaces wireless wlan0 security wpa passphrase '<your passphrase>'

Resulting in

.. code-block:: none

  interfaces {
    [...]
    wireless wlan0 {
          address 192.168.99.1/24
          channel 1
          mode g
          security {
              wpa {
                  cipher CCMP
                  mode wpa2
                  passphrase "<your passphrase>"
              }
          }
          ssid "<your ssid>"
          type access-point
      }
  }
  system {
    [...]
    wifi-regulatory-domain SE
  }

To get it to work as a access point with this configuration you will need
to set up a DHCP server to work with that network.
