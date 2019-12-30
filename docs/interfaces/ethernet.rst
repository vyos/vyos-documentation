.. _ethernet-interface:

########
Ethernet
########

Configuration
#############

Address
-------

.. cfgcmd:: set interfaces ethernet <interface> address <address | dhcp | dhcpv6>

   Configure interface `<interface>` with one or more interface addresses.

   * **address** can be specified multiple times as IPv4 and/or IPv6 address,
     e.g. 192.0.2.1/24 and/or 2001:db8::1/64
   * **dhcp** interface address is received by DHCP from a DHCP server on this
     segment.
   * **dhcpv6** interface address is received by DHCPv6 from a DHCPv6 server on
     this segment.

   Example:

   .. code-block:: none

     set interfaces ethernet eth0 address 192.0.2.1/24
     set interfaces ethernet eth0 address 192.0.2.2/24
     set interfaces ethernet eth0 address 2001:db8::ffff/64
     set interfaces ethernet eth0 address 2001:db8:100::ffff/64

.. cfgcmd:: set interfaces ethernet <interface> ipv6 address autoconf

   :abbr:`SLAAC (Stateless Address Autoconfiguration)`
   :rfc:`4862`. IPv6 hosts can configure themselves automatically when connected
   to an IPv6 network using the Neighbor Discovery Protocol via :abbr:`ICMPv6
   (Internet Control Message Protocol version 6)` router discovery messages.
   When first connected to a network, a host sends a link-local router
   solicitation multicast request for its configuration parameters; routers
   respond to such a request with a router advertisement packet that contains
   Internet Layer configuration parameters.

   .. note:: This method automatically disables IPv6 traffic forwarding on the
      interface in question.

.. cfgcmd:: set interfaces ethernet <interface> ipv6 address eui64 <prefix>

   :abbr:`EUI-64 (64-Bit Extended Unique Identifier)` as specified in
   :rfc:`4291` allows a host to assign iteslf a unique 64-Bit IPv6 address.

   .. code-block:: none

     set interfaces ethernet eth0 ipv6 address eui64 2001:db8:beef::/64

Speed/Duplex
------------

.. cfgcmd:: set interfaces ethernet <interface> duplex <auto | full | half>

   Configure physical interface duplex setting.

   * auto - interface duplex setting is auto-negotiated
   * full - always use full-duplex
   * half - always use half-duplex

   VyOS default will be `auto`.

.. cfgcmd:: set interfaces ethernet <interface> speed <auto | 10 | 100 | 1000 | 2500 | 5000 | 10000 | 25000 | 40000 | 50000 | 100000>

   Configure physical interface speed setting.

   * auto - interface speed is auto-negotiated
   * 10 - 10 MBit/s
   * 100 - 100 MBit/s
   * 1000 - 1 GBit/s
   * 2500 - 2.5 GBit/s
   * 5000 - 5 GBit/s
   * 10000 - 10 GBit/s
   * 25000 - 25 GBit/s
   * 40000 - 40 GBit/s
   * 50000 - 50 GBit/s
   * 100000 - 100 GBit/s

   VyOS default will be `auto`.

Link Administration
-------------------

.. cfgcmd:: set interfaces ethernet <interface> description <description>

   Assign given `<description>` to interface. Description will also be passed
   to SNMP monitoring systems.

.. cfgcmd:: set interfaces ethernet <interface> disable

   Disable given `<interface>`. It will be placed in administratively down
   (``A/D``) state.

.. cfgcmd:: set interfaces ethernet <interface> disable-flow-control

   Disable Ethernet flow control (pause frames).


.. cfgcmd:: set interfaces ethernet <interface> mac <mac-address>

   Configure user defined :abbr:`MAC (Media Access Control)` address on given
   `<interface>`.

.. cfgcmd:: set interfaces ethernet <interface> mtu <mtu>

   Configure :abbr:`MTU (Maximum Transmission Unit)` on given `<interface>`. It
   is the size (in bytes) of the largest ethernet frame sent on this link.

Router Advertisements
---------------------

Router advertisements are described in :rfc:`4861#section-4.6.2`. They are part
of what is known as :abbr:`SLAAC (Stateless Address Autoconfiguration)`.

.. cfgcmd:: set interfaces ethernet <interface> ipv6 router-advert send-advert <true | false>

   Enable or disable router advertisements in this `<interface>`.

.. cfgcmd:: set interfaces ethernet <interface> ipv6 router-advert prefix <prefix>

   Prefix information is described in :rfc:`4861#section-4.6.2`.

Operation
=========

.. opcmd:: show interfaces ethernet

   Show brief interface information.

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet
     Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
     Interface        IP Address                        S/L  Description
     ---------        ----------                        ---  -----------
     eth0             172.18.201.10/24                  u/u  LAN
     eth1             172.18.202.11/24                  u/u  WAN
     eth2             -                                 u/D

.. opcmd:: show interfaces ethernet <interface>

   Show detailed information on given `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth0
     eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
         link/ether 00:50:44:00:f5:c9 brd ff:ff:ff:ff:ff:ff
         inet6 fe80::250:44ff:fe00:f5c9/64 scope link
            valid_lft forever preferred_lft forever

         RX:  bytes    packets     errors    dropped    overrun      mcast
           56735451     179841          0          0          0     142380
         TX:  bytes    packets     errors    dropped    carrier collisions
            5601460      62595          0          0          0          0

.. opcmd:: show interfaces ethernet <interface> physical

   Show information about physical `<interface>`

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth0 physical
     Settings for eth0:
             Supported ports: [ TP ]
             Supported link modes:   1000baseT/Full
                                     10000baseT/Full
             Supported pause frame use: No
             Supports auto-negotiation: No
             Supported FEC modes: Not reported
             Advertised link modes:  Not reported
             Advertised pause frame use: No
             Advertised auto-negotiation: No
             Advertised FEC modes: Not reported
             Speed: 10000Mb/s
             Duplex: Full
             Port: Twisted Pair
             PHYAD: 0
             Transceiver: internal
             Auto-negotiation: off
             MDI-X: Unknown
             Supports Wake-on: uag
             Wake-on: d
             Link detected: yes
     driver: vmxnet3
     version: 1.4.16.0-k-NAPI
     firmware-version:
     expansion-rom-version:
     bus-info: 0000:0b:00.0
     supports-statistics: yes
     supports-test: no
     supports-eeprom-access: no
     supports-register-dump: yes
     supports-priv-flags: no

.. opcmd:: show interfaces ethernet <interface> transceiver

   Show transceiver information from plugin modules, e.g SFP+, QSFP

   .. code-block:: none

     vyos@vyos:~$ show interfaces ethernet eth5 transceiver
        Identifier              : 0x03 (SFP)
        Extended identifier     : 0x04 (GBIC/SFP defined by 2-wire interface ID)
        Connector               : 0x07 (LC)
        Transceiver codes       : 0x00 0x00 0x00 0x01 0x00 0x00 0x00 0x00 0x00
        Transceiver type        : Ethernet: 1000BASE-SX
        Encoding                : 0x01 (8B/10B)
        BR, Nominal             : 1300MBd
        Rate identifier         : 0x00 (unspecified)
        Length (SMF,km)         : 0km
        Length (SMF)            : 0m
        Length (50um)           : 550m
        Length (62.5um)         : 270m
        Length (Copper)         : 0m
        Length (OM3)            : 0m
        Laser wavelength        : 850nm
        Vendor name             : CISCO-FINISAR
        Vendor OUI              : 00:90:65
        Vendor PN               : FTRJ-8519-7D-CS4
        Vendor rev              : A
        Option values           : 0x00 0x1a
        Option                  : RX_LOS implemented
        Option                  : TX_FAULT implemented
        Option                  : TX_DISABLE implemented
        BR margin, max          : 0%
        BR margin, min          : 0%
        Vendor SN               : FNS092xxxxx
        Date code               : 0506xx

