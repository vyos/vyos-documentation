.. _examples-dmvpn:

#########
DMVPN Hub
#########

General infomration can be found in the :ref:`vpn-dmvpn` chapter.

Configuration
=============

VyOS Hub
--------

.. code-block:: none

  set interfaces tunnel tun100 address '172.16.253.134/29'
  set interfaces tunnel tun100 encapsulation 'gre'
  set interfaces tunnel tun100 local-ip '203.0.113.44'
  set interfaces tunnel tun100 multicast 'enable'
  set interfaces tunnel tun100 parameters ip key '1'

  set protocols nhrp tunnel tun100 cisco-authentication <secret>
  set protocols nhrp tunnel tun100 holding-time '300'
  set protocols nhrp tunnel tun100 multicast 'dynamic'
  set protocols nhrp tunnel tun100 redirect
  set protocols nhrp tunnel tun100 shortcut

  set vpn ipsec esp-group ESP-HUB compression 'disable'
  set vpn ipsec esp-group ESP-HUB lifetime '1800'
  set vpn ipsec esp-group ESP-HUB mode 'tunnel'
  set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
  set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
  set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
  set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
  set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
  set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
  set vpn ipsec ike-group IKE-HUB key-exchange 'ikev1'
  set vpn ipsec ike-group IKE-HUB lifetime '3600'
  set vpn ipsec ike-group IKE-HUB proposal 1 dh-group '2'
  set vpn ipsec ike-group IKE-HUB proposal 1 encryption 'aes256'
  set vpn ipsec ike-group IKE-HUB proposal 1 hash 'sha1'
  set vpn ipsec ike-group IKE-HUB proposal 2 dh-group '2'
  set vpn ipsec ike-group IKE-HUB proposal 2 encryption 'aes128'
  set vpn ipsec ike-group IKE-HUB proposal 2 hash 'sha1'
  set vpn ipsec ipsec-interfaces interface 'eth0'

  set vpn ipsec profile NHRPVPN authentication mode 'pre-shared-secret'
  set vpn ipsec profile NHRPVPN authentication pre-shared-secret <secret>
  set vpn ipsec profile NHRPVPN bind tunnel 'tun100'
  set vpn ipsec profile NHRPVPN esp-group 'ESP-HUB'
  set vpn ipsec profile NHRPVPN ike-group 'IKE-HUB'

Cisco IOS Spoke
---------------

This example is verified with a Cisco 2811 platform running IOS 15.1(4)M9 and
VyOS 1.1.7 (helium) up to VyOS 1.2 (Crux).

.. code-block:: none

  Cisco IOS Software, 2800 Software (C2800NM-ADVENTERPRISEK9-M), Version 15.1(4)M9, RELEASE SOFTWARE (fc3)
  Technical Support: http://www.cisco.com/techsupport
  Copyright (c) 1986-2014 by Cisco Systems, Inc.
  Compiled Fri 12-Sep-14 10:45 by prod_rel_team

  ROM: System Bootstrap, Version 12.3(8r)T7, RELEASE SOFTWARE (fc1)

Use this configuration on your Cisco device:

.. code-block:: none

  crypto pki token default removal timeout 0
  crypto keyring DMVPN
    pre-shared-key address 198.51.100.2 key <secretkey>
  !
  crypto isakmp policy 10
   encr aes 256
   authentication pre-share
   group 2
  !
  crypto isakmp invalid-spi-recovery
  crypto isakmp keepalive 30 30 periodic
  crypto isakmp profile DMVPN
     keyring DMVPN
     match identity address 203.0.113.44 255.255.255.255
  !
  crypto ipsec transform-set DMVPN-AES256 esp-aes 256 esp-sha-hmac
   mode transport
  !
  crypto ipsec profile DMVPN
   set security-association idle-time 720
   set transform-set DMVPN-AES256
   set isakmp-profile DMVPN
  !
  interface Tunnel10
   description Tunnel to DMVPN HUB
   ip address 172.16.253.129 255.255.255.248
   no ip redirects
   ip nhrp authentication <nhrp secret key>
   ip nhrp map multicast 203.0.113.44
   ip nhrp map 172.16.253.134 203.0.113.44
   ip nhrp network-id 1
   ip nhrp holdtime 600
   ip nhrp nhs 172.16.253.134
   ip nhrp registration timeout 75
   tunnel source Dialer1
   tunnel mode gre multipoint
   tunnel key 1
