.. _vpn-dmvpn:

DMVPN
-----

**D** ynamic **M** ultipoint **V** irtual **P** rivate **N** etworking

DMVPN is a dynamic VPN technology originally developed by Cisco. While their
implementation was somewhat proprietary, the underlying technologies are
actually standards based. The three technologies are:

* **NHRP** - NBMA Next Hop Resolution Protocol RFC2332_
* **mGRE** - Multipoint Generic Routing Encapsulation / mGRE RFC1702_
* **IPSec** - IP Security (too many RFCs to list, but start with RFC4301_)

NHRP provides the dynamic tunnel endpoint discovery mechanism (endpoint
registration, and endpoint discovery/lookup), mGRE provides the tunnel
encapsulation itself, and the IPSec protocols handle the key exchange, and
crypto mechanism.

In short, DMVPN provides the capability for creating a dynamic-mesh VPN
network without having to pre-configure (static) all possible tunnel end-point
peers.

.. note:: DMVPN only automates the tunnel endpoint discovery and setup. A
   complete solution also incorporates the use of a routing protocol. BGP is
   particularly well suited for use with DMVPN.

Baseline Configuration:

**STEPS:**

#. Create tunnel config (`interfaces tunnel`)
#. Create nhrp (`protocols nhrp`)
#. Create ipsec vpn (optional, but recommended for security) (`vpn ipsec`)

The tunnel will be set to mGRE if for encapsulation `gre` is set, and no
`remote-ip` is set. If the public ip is provided by DHCP the tunnel `local-ip`
can be set to "0.0.0.0"

.. figure:: ../_static/images/vpn_dmvpn_topology01.png
   :scale: 40 %
   :alt: Baseline DMVPN topology

   Baseline DMVPN topology

HUB Configuration
^^^^^^^^^^^^^^^^^

.. code-block:: sh

  interfaces
      tunnel <tunN> {
          address <ipv4>
          encapsulation gre
          local-ip <public ip>
          multicast enable
          description <txt>
          parameters {
              ip {
                  <usual IP options>
              }
          }
      }
  }
  protocols {
      nhrp {
          tunnel <tunN> {
              cisco-authentication <key phrase>
              holding-time <seconds>
              multicast dynamic
              redirect
          }
      }
  }
  vpn {
      ipsec {
          esp-group <text> {
              lifetime <30-86400>
              mode tunnel
              pfs enable
              proposal <1-65535> {
                  encryption aes256
                  hash sha1
              }
              proposal <1-65535> {
                  encryption 3des
                  hash md5
              }
          }
          ike-group <text> {
              key-exchange ikev1
              lifetime <30-86400>
              proposal <1-65535> {
                  encryption aes256
                  hash sha1
              }
              proposal <1-65535> {
                  encryption aes128
                  hash sha1
              }
          }
          ipsec-interfaces {
              interface <ethN>
          }
          profile <text> {
              authentication {
                  mode pre-shared-secret
                  pre-shared-secret <key phrase>
              }
              bind {
                  tunnel <tunN>
              }
              esp-group <text>
              ike-group <text>
          }
      }
  }

HUB Example Configuration:

.. code-block:: sh

  set interfaces ethernet eth0 address '1.1.1.1/30'
  set interfaces ethernet eth1 address '192.168.1.1/24'
  set system host-name 'HUB'

  set interfaces tunnel tun0 address 10.0.0.1/24
  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 local-ip 1.1.1.1
  set interfaces tunnel tun0 multicast enable
  set interfaces tunnel tun0 parameters ip key 1

  set protocols nhrp tunnel tun0 cisco-authentication SECRET
  set protocols nhrp tunnel tun0 holding-time  300
  set protocols nhrp tunnel tun0 multicast dynamic
  set protocols nhrp tunnel tun0 redirect

  set vpn ipsec ipsec-interfaces interface eth0
  set vpn ipsec ike-group IKE-HUB proposal 1
  set vpn ipsec ike-group IKE-HUB proposal 1 encryption aes256
  set vpn ipsec ike-group IKE-HUB proposal 1 hash sha1
  set vpn ipsec ike-group IKE-HUB proposal 2 encryption aes128
  set vpn ipsec ike-group IKE-HUB proposal 2 hash sha1
  set vpn ipsec ike-group IKE-HUB lifetime 3600
  set vpn ipsec esp-group ESP-HUB proposal 1 encryption aes256
  set vpn ipsec esp-group ESP-HUB proposal 1 hash sha1
  set vpn ipsec esp-group ESP-HUB proposal 2 encryption 3des
  set vpn ipsec esp-group ESP-HUB proposal 2 hash md5
  set vpn ipsec esp-group ESP-HUB lifetime 1800
  set vpn ipsec esp-group ESP-HUB pfs dh-group2

  set vpn ipsec profile NHRPVPN
  set vpn ipsec profile NHRPVPN authentication mode pre-shared-secret
  set vpn ipsec profile NHRPVPN authentication pre-shared-secret SECRET
  set vpn ipsec profile NHRPVPN bind tunnel tun0
  set vpn ipsec profile NHRPVPN esp-group ESP-HUB
  set vpn ipsec profile NHRPVPN ike-group IKE-HUB

  set protocols static route 0.0.0.0/0 next-hop 1.1.1.2
  set protocols static route 192.168.2.0/24 next-hop 10.0.0.2
  set protocols static route 192.168.3.0/24 next-hop 10.0.0.3

SPOKE Configuration
^^^^^^^^^^^^^^^^^^^

SPOKE1 Configuration:

.. code-block:: sh

  interfaces
      tunnel <tunN> {
          address <ipv4>
          encapsulation gre
          local-ip <public ip>
          multicast enable
          description <txt>
          parameters {
              ip {
                  <usual IP options>
              }
          }
      }
  }
  protocols {
      nhrp {
          tunnel <tunN> {
              cisco-authentication <key phrase>
              map <ipv4/net> {
                  nbma-address <ipv4>
                  register
              }
              holding-time <seconds>
              multicast nhs
              redirect
              shortcut
          }
      }
  }
  vpn {
      ipsec {
          esp-group <text> {
              lifetime <30-86400>
              mode tunnel
              pfs enable
              proposal <1-65535> {
                  encryption aes256
                  hash sha1
              }
              proposal <1-65535> {
                  encryption 3des
                  hash md5
              }
          }
          ike-group <text> {
              key-exchange ikev1
              lifetime <30-86400>
              proposal <1-65535> {
                  encryption aes256
                  hash sha1
              }
              proposal <1-65535> {
                  encryption aes128
                  hash sha1
              }
          }
          ipsec-interfaces {
              interface <ethN>
          }
          profile <text> {
              authentication {
                  mode pre-shared-secret
                  pre-shared-secret <key phrase>
              }
              bind {
                  tunnel <tunN>
              }
              esp-group <text>
              ike-group <text>
          }
      }
  }

SPOKE1 Example Configuration

.. code-block:: sh

  set interfaces ethernet eth0 address 'dhcp'
  set interfaces ethernet eth1 address '192.168.2.1/24'
  set system host-name 'SPOKE1'

  set interfaces tunnel tun0 address 10.0.0.2/24
  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 local-ip 0.0.0.0
  set interfaces tunnel tun0 multicast enable
  set interfaces tunnel tun0 parameters ip key 1

  set protocols nhrp tunnel tun0 cisco-authentication 'SECRET'
  set protocols nhrp tunnel tun0 map 10.0.0.1/24 nbma-address 1.1.1.1
  set protocols nhrp tunnel tun0 map 10.0.0.1/24 'register'
  set protocols nhrp tunnel tun0 multicast 'nhs'
  set protocols nhrp tunnel tun0 'redirect'
  set protocols nhrp tunnel tun0 'shortcut'

  set vpn ipsec ipsec-interfaces interface eth0
  set vpn ipsec ike-group IKE-SPOKE proposal 1
  set vpn ipsec ike-group IKE-SPOKE proposal 1 encryption aes256
  set vpn ipsec ike-group IKE-SPOKE proposal 1 hash sha1
  set vpn ipsec ike-group IKE-SPOKE proposal 2 encryption aes128
  set vpn ipsec ike-group IKE-SPOKE proposal 2 hash sha1
  set vpn ipsec ike-group IKE-SPOKE lifetime 3600
  set vpn ipsec esp-group ESP-SPOKE proposal 1 encryption aes256
  set vpn ipsec esp-group ESP-SPOKE proposal 1 hash sha1
  set vpn ipsec esp-group ESP-SPOKE proposal 2 encryption 3des
  set vpn ipsec esp-group ESP-SPOKE proposal 2 hash md5
  set vpn ipsec esp-group ESP-SPOKE lifetime 1800
  set vpn ipsec esp-group ESP-SPOKE pfs dh-group2

  set vpn ipsec profile NHRPVPN
  set vpn ipsec profile NHRPVPN authentication mode pre-shared-secret
  set vpn ipsec profile NHRPVPN authentication pre-shared-secret SECRET
  set vpn ipsec profile NHRPVPN bind tunnel tun0
  set vpn ipsec profile NHRPVPN esp-group ESP-SPOKE
  set vpn ipsec profile NHRPVPN ike-group IKE-SPOKE

  set protocols static route 192.168.1.0/24 next-hop 10.0.0.1
  set protocols static route 192.168.3.0/24 next-hop 10.0.0.3


SPOKE2 Configuration

.. code-block:: sh

  interfaces
      tunnel <tunN> {
          address <ipv4>
          encapsulation gre
          local-ip <public ip>
          multicast enable
          description <txt>
          parameters {
              ip {
                  <usual IP options>
              }
          }
      }
  }
  protocols {
      nhrp {
          tunnel <tunN> {
              cisco-authentication <key phrase>
              map <ipv4/net> {
                  nbma-address <ipv4>
                  register
              }
              holding-time <seconds>
              multicast nhs
              redirect
              shortcut
          }
      }
  }
  vpn {
      ipsec {
          esp-group <text> {
              lifetime <30-86400>
              mode tunnel
              pfs enable
              proposal <1-65535> {
                  encryption aes256
                  hash sha1
              }
              proposal <1-65535> {
                  encryption 3des
                  hash md5
              }
          }
          ike-group <text> {
              key-exchange ikev1
              lifetime <30-86400>
              proposal <1-65535> {
                  encryption aes256
                  hash sha1
              }
              proposal <1-65535> {
                  encryption aes128
                  hash sha1
              }
          }
          ipsec-interfaces {
              interface <ethN>
          }
          profile <text> {
              authentication {
                  mode pre-shared-secret
                  pre-shared-secret <key phrase>
              }
              bind {
                  tunnel <tunN>
              }
              esp-group <text>
              ike-group <text>
          }
      }
  }

SPOKE2 Example Configuration

.. code-block:: sh

  set interfaces ethernet eth0 address 'dhcp'
  set interfaces ethernet eth1 address '192.168.3.1/24'
  set system host-name 'SPOKE2'

  set interfaces tunnel tun0 address 10.0.0.3/24
  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 local-ip 0.0.0.0
  set interfaces tunnel tun0 multicast enable
  set interfaces tunnel tun0 parameters ip key 1

  set protocols nhrp tunnel tun0 cisco-authentication SECRET
  set protocols nhrp tunnel tun0 map 10.0.0.1/24 nbma-address 1.1.1.1
  set protocols nhrp tunnel tun0 map 10.0.0.1/24 register
  set protocols nhrp tunnel tun0 multicast nhs
  set protocols nhrp tunnel tun0 redirect
  set protocols nhrp tunnel tun0 shortcut

  set vpn ipsec ipsec-interfaces interface eth0
  set vpn ipsec ike-group IKE-SPOKE proposal 1
  set vpn ipsec ike-group IKE-SPOKE proposal 1 encryption aes256
  set vpn ipsec ike-group IKE-SPOKE proposal 1 hash sha1
  set vpn ipsec ike-group IKE-SPOKE proposal 2 encryption aes128
  set vpn ipsec ike-group IKE-SPOKE proposal 2 hash sha1
  set vpn ipsec ike-group IKE-SPOKE lifetime 3600
  set vpn ipsec esp-group ESP-SPOKE proposal 1 encryption aes256
  set vpn ipsec esp-group ESP-SPOKE proposal 1 hash sha1
  set vpn ipsec esp-group ESP-SPOKE proposal 2 encryption 3des
  set vpn ipsec esp-group ESP-SPOKE proposal 2 hash md5
  set vpn ipsec esp-group ESP-SPOKE lifetime 1800
  set vpn ipsec esp-group ESP-SPOKE pfs dh-group2

  set vpn ipsec profile NHRPVPN
  set vpn ipsec profile NHRPVPN authentication mode pre-shared-secret
  set vpn ipsec profile NHRPVPN authentication pre-shared-secret SECRET
  set vpn ipsec profile NHRPVPN bind tunnel tun0
  set vpn ipsec profile NHRPVPN esp-group ESP-SPOKE
  set vpn ipsec profile NHRPVPN ike-group IKE-SPOKE

  set protocols static route 192.168.1.0/24 next-hop 10.0.0.1
  set protocols static route 192.168.2.0/24 next-hop 10.0.0.2


.. _RFC2332: https://tools.ietf.org/html/rfc2332
.. _RFC1702: https://tools.ietf.org/html/rfc1702
.. _RFC4301: https://tools.ietf.org/html/rfc4301