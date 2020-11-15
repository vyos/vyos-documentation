.. _examples-dmvpn:

#########
DMVPN Hub
#########

********
Overview
********

General information can be found in the :ref:`vpn-dmvpn` chapter.

This blueprint uses VyOS as the DMVPN Hub and Cisco (7206VXR) as multiple
spokes. The lab was build using :abbr:`EVE-NG (Emulated Virtual Environment NG)`.

.. figure:: /_static/images/blueprint-dmvpn.png
   :alt: DMVPN network

Each node (Hub and Spoke) uses an IP address from the network 172.16.253.128/29.

The below referenced IP address `192.0.2.1` is used as example address
representing a global unicast address under which the HUB can be contacted by
each and every individual spoke.

*************
Configuration
*************

Hub
===

.. code-block:: none

  set interfaces ethernet eth0 address 192.0.2.1/24

  set interfaces tunnel tun100 address '172.16.253.134/29'
  set interfaces tunnel tun100 encapsulation 'gre'
  set interfaces tunnel tun100 local-ip '192.0.2.1'
  set interfaces tunnel tun100 multicast 'enable'
  set interfaces tunnel tun100 parameters ip key '1'

  set protocols nhrp tunnel tun100 cisco-authentication 'secret'
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
  set vpn ipsec profile NHRPVPN authentication pre-shared-secret 'secret'
  set vpn ipsec profile NHRPVPN bind tunnel 'tun100'
  set vpn ipsec profile NHRPVPN esp-group 'ESP-HUB'
  set vpn ipsec profile NHRPVPN ike-group 'IKE-HUB'

Spoke
=====

The individual spoke configurations only differ in the local IP address on the
``tun10`` interface. See the above diagram for the individual IP addresses.

spoke01
-------

.. code-block:: none

  crypto keyring DMVPN
    pre-shared-key address 192.0.2.1 key secret
  !
  crypto isakmp policy 10
   encr aes 256
   authentication pre-share
   group 2
  crypto isakmp invalid-spi-recovery
  crypto isakmp keepalive 30 30 periodic
  crypto isakmp profile DMVPN
     keyring DMVPN
     match identity address 192.0.2.1 255.255.255.255
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
   ip nhrp authentication secret
   ip nhrp map 172.16.253.134 192.0.2.1
   ip nhrp map multicast 192.0.2.1
   ip nhrp network-id 1
   ip nhrp holdtime 600
   ip nhrp nhs 172.16.253.134
   ip nhrp registration timeout 75
   tunnel source FastEthernet0/0
   tunnel mode gre multipoint
   tunnel key 1
  !
  interface FastEthernet0/0
   ip address dhcp
   duplex half
