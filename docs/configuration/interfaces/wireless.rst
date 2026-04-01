:lastproofread: 2026-03-23

.. _wireless-interface:

########################
Wireless LAN / Wi-Fi
########################

:abbr:`WLAN (Wireless LAN)` interfaces provide 802.11 (a/b/g/n/ac) wireless 
connectivity, referred to as Wi-Fi, and operate in one of the following modes:

* ``access-point``: Provide network access to connecting stations.

* ``station:`` Operate as Wi-Fi clients, connecting to the network via an 
  available :abbr:`AP (Access Point)`.

* ``monitor:`` Passively monitor wireless traffic.

If the system detects an unconfigured wireless device, it automatically adds 
the device to the configuration tree with the detected settings, such as the 
MAC address, and sets it to ``monitor`` mode.

.. note:: VyOS supports creating **multiple** WLAN interfaces on a single 
   physical device. 

.. note:: Wi-Fi connectivity, support for multiple WLAN interfaces on a single 
   physical device, and access point capabilities strictly depend on the 
   underlying hardware.

*************
Configuration
*************

Common interface configuration
==============================

.. cmdinclude:: /_include/interface-common-with-dhcp.txt
   :var0: wireless
   :var1: wlan0

System-wide configuration
=========================

.. cfgcmd:: set system wireless country-code <cc>

  **Configure the system's ISO/IEC 3166-1 country code.**

  The country code indicates the region in which the device operates. This may 
  restrict available channels and transmit power.

  .. note:: This option is mandatory in ``access-point`` mode.

Wireless options
================

.. cfgcmd:: set interfaces wireless <interface> channel <number>

  **Configure the IEEE 802.11 wireless radio channel for the interface.** 

  Channel allocation depends on the frequency band:

  * **2.4 GHz** (802.11b/g/n/ax): Channels range from 1 to 14.
  * **5 GHz** (802.11a/h/j/n/ac/ax): Channels range from 34 to 177.
  * **6 GHz** (802.11ax): Channels range from 1 to 233.
  * **Automatic channel selection:** 0.

.. cfgcmd:: set interfaces wireless <interface> disable-broadcast-ssid

  **Configure the interface to broadcast an empty SSID in beacons and to ignore 
  probe requests that do not include the full SSID.** 

  This requires client stations to be configured with the correct SSID to connect.

.. cfgcmd:: set interfaces wireless <interface> expunge-failing-stations

  **Configure the interface to disconnect client stations upon excessive 
  transmission failures or connection loss.**

  This feature depends on driver capabilities and may not work with some drivers.

.. cfgcmd:: set interfaces wireless <interface> isolate-stations

  **Enable client isolation on the interface.**

  This prevents low-level frame bridging between associated stations within the 
  BSS. 

  By default, this bridging is allowed.

.. cfgcmd:: set interfaces wireless <interface> max-stations <number>

  **Configure the number of allowed connecting clients for the interface.** 

  When this limit is reached, new client association requests are rejected. The 
  IEEE 802.11 standard allows up to 2007 distinct association IDs. Therefore, 
  this value should not exceed 2007.

  Default: 2007.

.. cfgcmd:: set interfaces wireless <interface> mgmt-frame-protection

  Enable :abbr:`MFP (Management Frame Protection)` on the interface according to 
  IEEE 802.11w.

  .. note:: :abbr:`MFP (Management Frame Protection)` is required for WPA3.

.. cfgcmd:: set interfaces wireless <interface> enable-bf-protection

  Enable :abbr:`BF (Beacon Frame)` protection on the interface.

  .. note:: This option requires :abbr:`MFP (Management Frame Protection)` 
    to be enabled.

.. cfgcmd:: set interfaces wireless <interface> mode <a | b | g | n | ac | ax>

  Configure wireless radio mode for the interface. 

  * ``a``: 802.11a (up to 54 Mbps).
  * ``b``: 802.11b (up to 11 Mbps).
  * ``g`` (default): 802.11g (up to 54 Mbps).
  * ``n``: 802.11n (up to 600 Mbps).
  * ``ac``: 802.11ac (up to 1300 Mbps).
  * ``ax``: 802.11ax (exceeds 1 Gbps).

  .. note:: In VyOS, 802.11ax is only implemented for 2.4 GHz and 6 GHz.

.. cfgcmd:: set interfaces wireless <interface> physical-device <device>

  **Configure the underlying wireless physical device for the interface.**

  Default: ``phy0``.

.. cfgcmd:: set interfaces wireless <interface> reduce-transmit-power <number>

  **Configure the interface to add the Power Constraint** :abbr:`IE (Information 
  Element)` **to Beacon and Probe Response frames.** 

  The Power Constraint :abbr:`IE (Information Element)` is required by :abbr:`TPC 
  (Transmit Power Control)`.

  Valid values: 0 to 255.

  .. note:: You must configure the country code to use this option.

.. cfgcmd:: set interfaces wireless <interface> ssid <ssid>

  Configure the SSID to be used in IEEE 802.11 management frames.

.. cfgcmd:: set interfaces wireless <interface> type
   <access-point | station | monitor>

  **Configure the wireless device type for the interface.**

  * ``access-point``: Forwards packets between other nodes.
  * ``station``: Connects to another :abbr:`AP (Access Point)`.
  * ``monitor``: Passively monitors all packets on the frequency/channel.

.. cmdinclude:: /_include/interface-per-client-thread.txt
   :var0: wireless
   :var1: wlan0

PPDU
----

.. cfgcmd:: set interfaces wireless <interface> capabilities require-ht

.. cfgcmd:: set interfaces wireless <interface> capabilities require-vht

.. cfgcmd:: set interfaces wireless <interface> capabilities require-he

HT (High Throughput) capabilities (802.11n)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  Configure **HT mode options** if you use 802.11n or 802.11ax at 2.4 GHz.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht 40mhz-incapable

  **Configure the interface to operate at 20 MHz.**

  The command sets the ``[40-INTOLERANT]`` flag.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht auto-powersave

  Enable :abbr:`WMM-PS (Wi-Fi Multimedia Power Save)` (:abbr:`U-APSD (Unscheduled 
  Automatic Power Save Delivery)`) for the interface.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht
   channel-set-width <ht20 | ht40+ | ht40->

  **Configure the supported channel width set for the interface.**

  * ``ht20``: Allows a 20 MHz channel width.
  * ``ht40-``: Allows both 20 MHz and 40 MHz channel widths, with the secondary 
    channel **below** the primary channel.
  * ``ht40+``: Allows both 20 MHz and 40 MHz channel widths, with the secondary 
    channel **above** the primary channel.
  
  .. note:: Channel availability for HT40- and HT40+ is limited. The following 
     table lists channels permitted for HT40- and HT40+ according to IEEE 802.11n 
     Annex J. Channel availability may vary by location.

     .. code-block:: none

       freq		HT40-		HT40+
       2.4 GHz		5-13		1-7 (1-9 in Europe/Japan)
       5 GHz		40,48,56,64	36,44,52,60

  .. note:: 40 MHz channels may automatically switch their primary and secondary 
     assignments, or the creation of a 40 MHz channel may be rejected due to 
     :abbr:`OBSSs (Overlapping Basic Service Sets)`. ``hostapd`` performs these 
     adjustments automatically when setting up the channel.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht
   delayed-block-ack

  **Enable HT-delayed** :abbr:`Block Ack (Block Acknowledgement)` **on the 
  interface.** 

  This sets the ``[DELAYED-BA]`` flag.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht dsss-cck-40

  **Enable** :abbr:`DSSS (Direct Sequence Spread Spectrum)`/:abbr:`CCK 
  (Complementary Code Keying)` **mode in 40 MHz channels.** 

  This sets the ``[DSSS_CCK-40]`` flag.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht greenfield

  **Enable HT Greenfield mode on the interface.** 

  This sets the ``[GF]`` flag.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht ldpc

  Enable :abbr:`LDPC (Low-Density Parity-Check)` coding on the interface.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht lsig-protection

  Enable :abbr:`L-SIG TXOP (Legacy Signal Transmission Opportunity)` protection 
  on the interface.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht max-amsdu
   <3839 | 7935>

  Configure the maximum :abbr:`A-MSDU (Aggregate MAC Service Data Unit)` length 
  to either 3839 octets (default) or 7935 octets.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht
   short-gi <20 | 40>

  **Configure** :abbr:`Short GI (Short Guard Interval)` **capabilities for 20 MHz 
  or 40 MHz channels.**

  * ``20``: Enables Short GI for 20 MHz channels. 
  * ``40``: Enables Short GI for 40 MHz channels. 

.. cfgcmd:: set interfaces wireless <interface> capabilities ht
   smps <static | dynamic>

  **Configure** :abbr:`SMPS (Spatial Multiplexing Power Save)` **mode for the 
  interface.**

  * ``static``: Enables static SMPS mode. 
  * ``dynamic``: Enables dynamic SMPS mode. 

.. cfgcmd:: set interfaces wireless <interface> capabilities ht stbc rx <num>

  Enable receiving :abbr:`PPDUs (PLCP Protocol Data Units)` using :abbr:`STBC 
  (Space-Time Block Coding)`.

.. cfgcmd:: set interfaces wireless <interface> capabilities ht stbc tx

  Enable transmitting :abbr:`PPDUs (PLCP Protocol Data Units)` using :abbr:`STBC 
  (Space-Time Block Coding)`.


VHT (Very High Throughput) capabilities (802.11ac)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set interfaces wireless <interface> capabilities vht antenna-count <num>

  **Configure the number of antennas for the interface.**

  Valid values: 1 to 8.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht
   antenna-pattern-fixed

  **Enable the fixed antenna pattern capability on the interface.**

  Use this option if the antenna pattern does not change during the lifetime of 
  an association.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht beamform
  <single-user-beamformer | single-user-beamformee | multi-user-beamformer |
  multi-user-beamformee>

  Configure VHT beamforming capabilities for the interface.

  * ``single-user-beamformer``: Supports operation as a Single-User (SU) 
    beamformer.
  * ``single-user-beamformee``: Supports operation as a Single-User (SU) 
    beamformee.
  * ``multi-user-beamformer``: Supports operation as a Multi-User (MU) beamformer.
  * ``multi-user-beamformee``: Supports operation as a Multi-User (MU) beamformee.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht
   center-channel-freq <freq-1 | freq-2> <number>

  **Configure the VHT operating channel center frequency for the interface.**

  * ``freq-1``: Specifies the center frequency for 80 MHz, 160 MHz, and 80+80 MHz 
    channels.

  * ``freq-2:`` Specifies the center frequency for 80+80 MHz channels.

  * ``<number>``: Ranges from 34 to 173. For 80 MHz channels, the center 
    frequency is typically the channel number plus 6. 

.. cfgcmd:: set interfaces wireless <interface> capabilities vht
   channel-set-width <0 | 1 | 2 | 3>

  **Configure the VHT operating channel width for the interface.**

  * ``0`` (default): 20 MHz or 40 MHz channel width.
  * ``1``: 80 MHz channel width.
  * ``2``: 160 MHz channel width.
  * ``3``: 80+80 MHz channel width.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht ldpc

  Enable :abbr:`LDPC (Low-Density Parity Check)` coding for the interface.

.. cfgcmd:: set interfaces wireless <interface> 
  capabilities vht link-adaptation

  Enable VHT link adaptation on the interface.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht
   max-mpdu <value>

  **Increase the maximum** :abbr:`MPDU (MAC Protocol Data Unit)` **length to 
  7991 or 11454 octets.** 

  Default: 3895 octets.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht
   max-mpdu-exp <value>

  Configure the maximum length of :abbr:`A-MPDU (Aggregated MAC Protocol Data 
  Unit)` :abbr:`pre-EOF (pre-End of Frame)` padding that the interface can 
  receive.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht
   short-gi <80 | 160>

  **Configure** :abbr:`Short GI (Short Guard Interval)` **capabilities for 80 MHz 
  or 160 MHz channels.**

  * ``80``: Enables Short GI for 80 MHz channels. 
  * ``160``: Enables Short GI for 160 MHz channels. 


.. cfgcmd:: set interfaces wireless <interface> capabilities vht stbc rx <num>

  Enable receiving :abbr:`PPDUs (PLCP Protocol Data Units)` using :abbr:`STBC 
  (Space-Time Block Coding)`.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht stbc tx

  Enable transmitting :abbr:`PPDUs (PLCP Protocol Data Units)` using :abbr:`STBC 
  (Space-Time Block Coding)`.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht tx-powersave

  Enable VHT :abbr:`TXOP (Transmit Opportunity)` Power Save mode for the 
  interface.

.. cfgcmd:: set interfaces wireless <interface> capabilities vht vht-cf

  Enable receiving the VHT variant HT Control field on the interface.

HE (High Efficiency) capabilities (802.11ax)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. cfgcmd:: set interfaces wireless <interface> 
  capabilities he antenna-pattern-fixed

  Notify the :abbr:`AP (Access Point)` that antenna positions are fixed and do not change during the lifetime of an association.

.. cfgcmd:: set interfaces wireless <interface> capabilities he beamform 
  <single-user-beamformer | single-user-beamformee | multi-user-beamformer>

  **Configure HE beamforming capabilities for the interface.**

  * ``single-user-beamformer``: Supports operation as a Single-User (SU) 
    beamformer.
  * ``single-user-beamformee``: Supports operation as a Single-User (SU) 
    beamformee.
  * ``multi-user-beamformer``: Supports operation as a Multi-User (MU) beamformer.

.. cfgcmd:: set interfaces wireless <interface> 
  capabilities he bss-color <number>

  **Configure the** :abbr:`BSS (Basic Service Set)` **color for the interface.** 
  
  BSS coloring helps prevent channel jamming when multiple :abbr:`APs (Access 
  Points)` use the same channels.

  Valid values are 1..63

.. cfgcmd:: set interfaces wireless <interface> capabilities he 
  center-channel-freq <freq-1 | freq-2> <number>

  **Configure the HE operating channel center frequency for the interface.**

  * ``freq-1``: Specifies the center frequency for 80 MHz, 160 MHz, and 80+80 MHz 
    channels.

  * ``freq-2``: Specifies the center frequency for 80+80 MHz channels.

  * ``<number>``: Ranges from 34 to 173. For 80 MHz channels, the center 
    frequency is typically the primary channel number plus 6. 

.. cfgcmd:: set interfaces wireless <interface> 
  capabilities he channel-set-width <number>

  **Configure the HE operating channel width for the interface.**

  For the 2.4 GHz band:

  * ``81``: 20 MHz channel width.
  * ``83``: 40 MHz channel width, secondary 20 MHz channel above primary.
  * ``84``: 40 MHz channel width, secondary 20 MHz channel below primary.

  For the 6 GHz band: 

  * ``131``: 20 MHz channel width.
  * ``132``: 40 MHz channel width.
  * ``133``: 80 MHz channel width.
  * ``134``: 160 MHz channel width.
  * ``135``: 80+80 MHz channel width.

.. cfgcmd:: set interfaces wireless <interface> 
  capabilities he coding-scheme <number>
  
  **Configure** :abbr:`SS (Spatial Stream)` **and** :abbr:`HE-MCS (High 
  Efficiency Modulation and Coding Scheme)` **settings for the interface.** 

  Explicit configuration of these settings is typically unnecessary.

  The ``<number>`` defines the supported MCS range and must be one of the following:

  * ``0``: Allows HE-MCS 0-7.
  * ``1``: Allows HE-MCS 0-9.
  * ``2``: Allows HE-MCS 0-11.
  * ``3``: Disables HE-MCS.

Wireless options (station/client)
=================================

The following example configures a wireless station (Wi-Fi client) that 
connects to the network through an :abbr:`AP (Access Point)`, using the default 
physical interface ``phy0``.

.. code-block:: none

  set system wireless country-code de
  set interfaces wireless wlan0 type station
  set interfaces wireless wlan0 address dhcp
  set interfaces wireless wlan0 ssid Test
  set interfaces wireless wlan0 security wpa passphrase '12345678'

Resulting configuration:

.. code-block:: none

  system {
    wireless {
      country-code de
    }
  }
  interfaces {
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

Wireless security
=================

:abbr:`WPA (Wi-Fi Protected Access)`, WPA2, and WPA3 Enterprise, combined with 
802.1X-based authentication, enable user or computer authentication within a 
domain.

The authentication process involves the following three participants:

* **Supplicant**: The wireless client authenticates against the RADIUS server 
  using an EAP method.
* **Authenticator**: The Access Point (AP) sends authentication messages 
  between the supplicant and the RADIUS server.
* **Authentication server**: The RADIUS server authenticates users.

The following example configures an :abbr:`AP (Access Point)` to use WPA2 
Enterprise security and authenticate connecting clients against an external 
RADIUS server.

Configuration parameters:

* **IP address:** ``192.168.2.1/24``
* **Network ID (SSID):** ``Enterprise-TEST``
* **Protocol:** 802.11n
* **Wireless channel:** ``1``
* **RADIUS server:** ``192.168.3.10`` with shared-secret ``VyOSPassword``

.. stop_vyoslinter
.. code-block:: none

  set system wireless country-code de
  set interfaces wireless wlan0 address '192.168.2.1/24'
  set interfaces wireless wlan0 type access-point
  set interfaces wireless wlan0 channel 1
  set interfaces wireless wlan0 mode n
  set interfaces wireless wlan0 ssid 'Enterprise-TEST'
  set interfaces wireless wlan0 security wpa mode wpa2
  set interfaces wireless wlan0 security wpa cipher CCMP
  set interfaces wireless wlan0 security wpa radius server 192.168.3.10 key 'VyOSPassword'
  set interfaces wireless wlan0 security wpa radius server 192.168.3.10 port 1812

.. start_vyoslinter

Resulting configuration:

.. code-block:: none

  system {
    wireless {
      country-code de
    }
  }
  interfaces {
    [...]
    wireless wlan0 {
          address 192.168.2.1/24
          channel 1
          mode n
          security {
              wpa {
                  cipher CCMP
                  mode wpa2
                  radius {
                      server 192.168.3.10 {
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

VLAN
====

Regular VLANs (802.1q)
----------------------

.. cmdinclude:: /_include/interface-vlan-8021q.txt
   :var0: wireless
   :var1: wlan0

QinQ (802.1ad)
--------------

.. cmdinclude:: /_include/interface-vlan-8021ad.txt
   :var0: wireless
   :var1: wlan0

*********
Operation 
*********

.. opcmd:: show interfaces wireless info

Show the operational status and wireless-specific information about all 
wireless interfaces.

.. code-block:: none

  vyos@vyos:~$ show interfaces wireless info
  Interface  Type          SSID                         Channel
  wlan0      access-point  VyOS-TEST-0                        1

.. opcmd:: show interfaces wireless detail

Show the operational status and detailed wireless-specific information about 
all wireless interfaces.

.. stop_vyoslinter
.. code-block:: none

  vyos@vyos:~$ show interfaces wireless detail
  wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
      link/ether XX:XX:XX:XX:XX:c3 brd XX:XX:XX:XX:XX:ff
      inet xxx.xxx.99.254/24 scope global wlan0
         valid_lft forever preferred_lft forever
      inet6 fe80::xxxx:xxxx:fe54:2fc3/64 scope link
         valid_lft forever preferred_lft forever

      RX:  bytes    packets     errors    dropped    overrun      mcast
           66072        282          0          0          0          0
      TX:  bytes    packets     errors    dropped    carrier collisions
           83413        430          0          0          0          0

  wlan1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
      link/ether XX:XX:XX:XX:XX:c3 brd XX:XX:XX:XX:XX:ff
      inet xxx.xxx.100.254/24 scope global wlan0
         valid_lft forever preferred_lft forever
      inet6 fe80::xxxx:xxxx:ffff:2ed3/64 scope link
         valid_lft forever preferred_lft forever

      RX:  bytes    packets     errors    dropped    overrun      mcast
           166072      5282          0          0          0          0
      TX:  bytes    packets     errors    dropped    carrier collisions
           183413      5430          0          0          0          0

.. start_vyoslinter

.. opcmd:: show interfaces wireless <wlanX>

Show the operational status and statistics for the specified wireless 
interface. Interface identifiers range from ``wlan0`` to ``wlan999``.

.. stop_vyoslinter
.. code-block:: none

  vyos@vyos:~$ show interfaces wireless wlan0
  wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
      link/ether XX:XX:XX:XX:XX:c3 brd XX:XX:XX:XX:XX:ff
      inet xxx.xxx.99.254/24 scope global wlan0
         valid_lft forever preferred_lft forever
      inet6 fe80::xxxx:xxxx:fe54:2fc3/64 scope link
         valid_lft forever preferred_lft forever

      RX:  bytes    packets     errors    dropped    overrun      mcast
           66072        282          0          0          0          0
      TX:  bytes    packets     errors    dropped    carrier collisions
           83413        430          0          0          0          0

.. start_vyoslinter


.. opcmd:: show interfaces wireless <wlanX> brief

Show a brief operational status summary for the specified wireless interface. 
Interface identifiers range from ``wlan0`` to ``wlan999``.

.. code-block:: none

  vyos@vyos:~$ show interfaces wireless wlan0 brief
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  wlan0            192.168.2.254/24                    u/u


.. opcmd:: show interfaces wireless <wlanX> queue

Show queue information for the specified wireless interface. Interface 
identifiers range from ``wlan0`` to ``wlan999``.

.. code-block:: none

  vyos@vyos:~$ show interfaces wireless wlan0 queue
  qdisc pfifo_fast 0: root bands 3 priomap 1 2 2 2 1 2 0 0 1 1 1 1 1 1 1 1
   Sent 810323 bytes 6016 pkt (dropped 0, overlimits 0 requeues 0)
   rate 0bit 0pps backlog 0b 0p requeues 0


.. opcmd:: show interfaces wireless <wlanX> scan

Show information about :abbr:`APs (Access Points)` within the range of the 
specified wireless interface. You can use this data when configuring wireless 
interfaces in ``station`` mode.

.. note:: Some wireless drivers or hardware may not support such scanning. 
   Refer to your driver and hardware documentation for more information.

.. code-block:: none

  vyos@vyos:~$ show interfaces wireless wlan0 scan
  Address            SSID                          Channel  Signal (dbm)
  00:53:3b:88:6e:d8  WLAN-576405                         1  -64.00
  00:53:3b:88:6e:da  Telekom_FON                         1  -64.00
  00:53:00:f2:c2:a4  BabyView_F2C2A4                     6  -60.00
  00:53:3b:88:6e:d6  Telekom_FON                       100  -72.00
  00:53:3b:88:6e:d4  WLAN-576405                       100  -71.00
  00:53:44:a4:96:ec  KabelBox-4DC8                      56  -81.00
  00:53:d9:7a:67:c2  WLAN-741980                         1  -75.00
  00:53:7c:99:ce:76  Vodafone Homespot                   1  -86.00
  00:53:44:a4:97:21  KabelBox-4DC8                       1  -78.00
  00:53:44:a4:97:21  Vodafone Hotspot                    1  -79.00
  00:53:44:a4:97:21  Vodafone Homespot                   1  -79.00
  00:53:86:40:30:da  Telekom_FON                         1  -86.00
  00:53:7c:99:ce:76  Vodafone Hotspot                    1  -86.00
  00:53:44:46:d2:0b  Vodafone Hotspot                    1  -87.00


********
Examples
********

The following example configures an :abbr:`AP (Access Point)` with the 
following parameters:

* IP address: ``192.168.2.1/24``
* Network ID (SSID): ``TEST``
* WPA passphrase: ``12345678``
* Protocol: 802.11n
* Wireless channel: ``1``

.. note:: When setting up multiple WAP interfaces, ensure each has a unique IP 
   address, channel, network ID (SSID), and MAC address.

.. code-block:: none

  set system wireless country-code de
  set interfaces wireless wlan0 address '192.168.2.1/24'
  set interfaces wireless wlan0 type access-point
  set interfaces wireless wlan0 channel 1
  set interfaces wireless wlan0 mode n
  set interfaces wireless wlan0 ssid 'TEST'
  set interfaces wireless wlan0 security wpa mode wpa2
  set interfaces wireless wlan0 security wpa cipher CCMP
  set interfaces wireless wlan0 security wpa passphrase '12345678'

Resulting configuration:

.. code-block:: none

  system {
    wireless {
      country-code de
    }
  }
  interfaces {
    [...]
    wireless wlan0 {
          address 192.168.2.1/24
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

To enable access point functionality, configure a DHCP server for this 
interface's network, or add the interface to an existing local bridge.
(see :ref:`bridge-interface` for details).

Wi-Fi 6/6E (802.11ax)
=====================

The following examples configure Wi-Fi 6 (2.4 GHz) and Wi-Fi 6E (6 GHz) 
:abbr:`APs (Access Points)` with the following parameters:

* Network ID (SSID): ``test.ax``
* WPA passphrase: ``super-dooper-secure-passphrase``
* Protocol: 802.11ax
* Wireless channel for 2.4 GHz: ``11`` 
* Wireless channel for 6 GHz: ``5`` 


Example configuration: Wi-Fi 6 at 2.4 GHz
-----------------------------------------

You may expect real throughput around 10 MB/s or higher in crowded areas.

.. code-block:: none

  set system wireless country-code de
  set interfaces wireless wlan0 capabilities he antenna-pattern-fixed
  set interfaces wireless wlan0 capabilities he beamform multi-user-beamformer
  set interfaces wireless wlan0 capabilities he beamform single-user-beamformee
  set interfaces wireless wlan0 capabilities he beamform single-user-beamformer
  set interfaces wireless wlan0 capabilities he bss-color 13
  set interfaces wireless wlan0 capabilities he channel-set-width 81
  set interfaces wireless wlan0 capabilities ht 40mhz-incapable
  set interfaces wireless wlan0 capabilities ht channel-set-width ht20
  set interfaces wireless wlan0 capabilities ht channel-set-width ht40+
  set interfaces wireless wlan0 capabilities ht channel-set-width ht40-
  set interfaces wireless wlan0 capabilities ht short-gi 20
  set interfaces wireless wlan0 capabilities ht short-gi 40
  set interfaces wireless wlan0 capabilities ht stbc rx 2
  set interfaces wireless wlan0 capabilities ht stbc tx
  set interfaces wireless wlan0 channel 11
  set interfaces wireless wlan0 description "802.11ax 2.4GHz"
  set interfaces wireless wlan0 mode ax
  set interfaces wireless wlan0 security wpa cipher CCMP
  set interfaces wireless wlan0 security wpa cipher CCMP-256
  set interfaces wireless wlan0 security wpa cipher GCMP-256
  set interfaces wireless wlan0 security wpa cipher GCMP
  set interfaces wireless wlan0 security wpa mode wpa2
  set interfaces wireless wlan0 security wpa passphrase super-dooper-secure-passphrase
  set interfaces wireless wlan0 ssid test.ax
  set interfaces wireless wlan0 type access-point
  commit

Resulting configuration:

.. code-block:: none

  system {
    wireless {
      country-code de
    }
  }
  interfaces {
    [...]
    wireless wlan0 {
          capabilities {
              he {
                  antenna-pattern-fixed
                  beamform {
                      multi-user-beamformer
                      single-user-beamformee
                      single-user-beamformer
                  }
                  bss-color 13
                  channel-set-width 81
              }
              ht {
                  40mhz-incapable
                  channel-set-width ht20
                  channel-set-width ht40+
                  channel-set-width ht40-
                  short-gi 20
                  short-gi 40
                  stbc {
                      rx 2
                      tx
                  }
              }
          }
          channel 11
          description "802.11ax 2.4GHz"
          hw-id [...]
          mode ax
          physical-device phy0
          security {
              wpa {
                  cipher CCMP
                  cipher CCMP-256
                  cipher GCMP-256
                  cipher GCMP
                  mode wpa2
                  passphrase super-dooper-secure-passphrase
              }
          }
          ssid test.ax
          type access-point
      }
  }

Example configuration: Wi-Fi 6E at 6 GHz
----------------------------------------

You may expect real throughput between 50 MB/s and 150 MB/s, depending on 
obstructions from walls, water, metal, or other materials with high 
electromagnetic damping at 6 GHz. 

Best results are achieved when the AP is in the same room and in line of sight.

.. code-block:: none

  set system wireless country-code de
  set interfaces wireless wlan0 capabilities he antenna-pattern-fixed
  set interfaces wireless wlan0 capabilities he beamform multi-user-beamformer
  set interfaces wireless wlan0 capabilities he beamform single-user-beamformee
  set interfaces wireless wlan0 capabilities he beamform single-user-beamformer
  set interfaces wireless wlan0 capabilities he bss-color 13
  set interfaces wireless wlan0 capabilities he channel-set-width 134
  set interfaces wireless wlan0 capabilities he center-channel-freq freq-1 15
  set interfaces wireless wlan0 channel 5
  set interfaces wireless wlan0 description "802.11ax 6GHz"
  set interfaces wireless wlan0 mode ax
  set interfaces wireless wlan0 security wpa cipher CCMP
  set interfaces wireless wlan0 security wpa cipher CCMP-256
  set interfaces wireless wlan0 security wpa cipher GCMP-256
  set interfaces wireless wlan0 security wpa cipher GCMP
  set interfaces wireless wlan0 security wpa mode wpa3
  set interfaces wireless wlan0 security wpa passphrase super-dooper-secure-passphrase
  set interfaces wireless wlan0 mgmt-frame-protection required
  set interfaces wireless wlan0 enable-bf-protection
  set interfaces wireless wlan0 ssid test.ax
  set interfaces wireless wlan0 type access-point
  set interfaces wireless wlan0 stationary-ap
  commit

Resulting configuration:

.. code-block:: none

  system {
    wireless {
      country-code de
    }
  }
  interfaces {
    [...]
    wireless wlan0 {
          capabilities {
              he {
                  antenna-pattern-fixed
                  beamform {
                      multi-user-beamformer
                      single-user-beamformee
                      single-user-beamformer
                  }
                  bss-color 13
                  center-channel-freq {
                      freq-1 15
                  }
                  channel-set-width 134
              }
          }
          channel 5
          description "802.11ax 6GHz"
          enable-bf-protection
          hw-id [...]
          mgmt-frame-protection required
          mode ax
          physical-device phy0
          security {
              wpa {
                  cipher CCMP
                  cipher CCMP-256
                  cipher GCMP-256
                  cipher GCMP
                  mode wpa3
                  passphrase super-dooper-secure-passphrase
              }
          }
          ssid test.ax
          stationary-ap
          type access-point
      }
  }

.. _wireless-interface-intel-ax200:

Intel AX200
===========

The Intel AX200 card does not operate out of the box in ``access-point`` mode. 

You can still enable :abbr:`AP (Access Point)` functionality on this hardware 
by applying the following configuration:

.. stop_vyoslinter
.. code-block:: none

  set system wireless country-code 'us'
  set interfaces wireless wlan0 channel '1'
  set interfaces wireless wlan0 mode 'n'
  set interfaces wireless wlan0 physical-device 'phy0'
  set interfaces wireless wlan0 ssid 'VyOS'
  set interfaces wireless wlan0 type 'access-point'

.. start_vyoslinter
