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
  set interfaces wireless wlan0 mode n
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
          mode n
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

WPA/WPA2 enterprise
*******************

:abbr:`WPA (Wi-Fi Protected Access)` and WPA2 Enterprise in combination with
802.1x based authentication can be used to authenticate users or computers
in a domain.

The wireless client (supplicant) authenticates against the RADIUS server
(authentication server) using an :abbr:`EAP (Extensible Authentication
Protocol)`  method configured on the RADIUS server. The WAP (also referred
to as authenticator) role is to send all authentication messages between the
supplicant and the configured authentication server, thus the RADIUS server
is responsible for authenticating the users.

The WAP in this example has the following characteristics:

* IP address ``192.0.2.1/24``
* Network ID (SSID) ``Enterprise-TEST``
* WPA passphrase ``12345678``
* Use 802.11n protocol
* Wireless channel ``1``
* RADIUS server at ``192.0.3.10`` with shared-secret ``VyOSPassword``

.. code-block:: sh

  set interfaces wireless wlan0 address '192.0.2.1/24'
  set interfaces wireless wlan0 type access-point
  set interfaces wireless wlan0 channel 1
  set interfaces wireless wlan0 mode n
  set interfaces wireless wlan0 ssid 'TEST'
  set interfaces wireless wlan0 security wpa mode wpa2
  set interfaces wireless wlan0 security wpa cipher CCMP
  set interfaces wireless wlan0 security wpa radius server 192.0.3.10 key 'VyOSPassword'
  set interfaces wireless wlan0 security wpa radius server 192.0.3.10 port 1812

Resulting in

.. code-block:: sh

  interfaces {
    [...]
    wireless wlan0 {
          address 192.0.2.1/24
          channel 1
          mode n
          security {
              wpa {
                  cipher CCMP
                  mode wpa2
                  radius {
                      server 192.0.3.10 {
                          key 'VyOSPassword'
                          port 1812
                      }
                  }
              }
          }
          ssid "Enterprise-TEST"
          type access-point
      }
  }
  system {
    [...]
    wifi-regulatory-domain DE
  }


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

Operational Commands
^^^^^^^^^^^^^^^^^^^^

.. option:: show interfaces wireless info

Use this command to view operational status and wireless-specific information
about all wireless interfaces.

.. code-block:: sh

  vyos@vyos:~$ show interfaces wireless info
  Interface   Type        SSID             Channel
  mon.wlan0   monitor     ?                ?
  wlan0       AP          testing          3


.. option:: show interfaces wireless detail

Use this command to view operational status and detailes wireless-specific
information about all wireless interfaces.

.. code-block:: sh

  vyos@vyos:~$ show interfaces wireless detail
  wlan0: <NO?CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast state DOWN0
      link/ether 00:21:91:d1:18:ca brd ff:ff:ff:ff:ff:ff
      RX: bytes   packets   errors   dropped   overrun      mcast
              0         0        0         0         0          0
      TX: bytes   packets   errors   dropped   carrier collisions
              0         0        0         0         0          0


.. option:: show interfaces wireless <wlanX>

This command shows both status and statistics on the specified wireless interface.
The wireless interface identifier can range from wlan0 to wlan999.

.. code-block:: sh

  vyos@vyos:~$ show interfaces wireless wlan0
  wlan0: <NO?CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast state DOWN0
      link/ether 00:21:91:d1:18:ca brd ff:ff:ff:ff:ff:ff
      RX: bytes   packets   errors   dropped   overrun      mcast
              0         0        0         0         0          0
      TX: bytes   packets   errors   dropped   carrier collisions
              0         0        0         0         0          0


.. option:: show interfaces wireless <wlanX> brief

This command gives a brief status overview of a specified wireless interface.
The wireless interface identifier can range from wlan0 to wlan999.

.. code-block:: sh

  vyos@vyos:~$ show interfaces wireless wlan0 brief
  Interface   IP Address         State   Link   Description
  wlan0       192.168.40.1/24    up      up


.. option:: show interfaces wireless <wlanX> queue

Use this command to view wireless interface queue information.
The wireless interface identifier can range from wlan0 to wlan999.


.. code-block:: sh

  vyos@vyos:~$ show interfaces wireless wlan0 queue
  qdisc pfifo_fast 0: root bands 3 priomap 1 2 2 2 1 2 0 0 1 1 1 1 1 1 1 1
   Sent 810323 bytes 6016 pkt (dropped 0, overlimits 0 requeues 0)
   rate 0bit 0pps backlog 0b 0p requeues 0


.. option:: show interfaces wireless <wlanX> scan

This command is used to retrive information about WAP within the range of your
wireless interface. This command is usefull on wireless interfaces configured
in station mode.

.. note:: Scanning is not supported on all wireless drivers and wireless
   hardware. Refer to your driver and wireless hardware documentation for
   further details.

.. code-block:: sh

  vyos@vyos:~$ show interfaces wireless wlan0 scan
  Access-point       SSID             Chan    Signal (dbm)
  00:53:00:b5:8b:d6  VyOS-TEST-NET    1       -77
  00:53:29:10:45:03  GUESTS           11      -67
  00:53:ab:20:45:03  Hotspot          10      -68
