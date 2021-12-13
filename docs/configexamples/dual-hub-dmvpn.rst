
########################
Dual-Hub DMVPN with VyOS
########################

DMVPN is a Dynamic Multipoint VPN technology that provides the capability 
for creating a dynamic-mesh VPN network without having to pre-configure 
(static) all possible tunnel end-point peers those simplifying deployment 
and management of the newly added remote sites. There are 3 main protocols 
primarily used to implement DMVPN:

* NHRP - provides the dynamic tunnel endpoint discovery mechanism (endpoint 
  registration, and endpoint discovery/lookup) 
* mGRE - provides the tunnel encapsulation itself 
* IPSec - protocols handle the key exchange, and crypto mechanism

For his example we are using the following devices:

* 2 x Hubs
* 3 x Spokes
* 1 x Client device (VPC)
* 1 x ISP router

The following software was used in the creation of this document:

* Operating system: VyOS
* Version: 1.3-beta-202112090443
* Image name: vyos-1.3-beta-202112090443-amd64.iso



********
Topology
********
.. image:: /_static/images/VyOS_Dual-Hub_DMVPN.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram



******************************************
Network Addressing and Protocol Parameters
******************************************

The following ip addressing schema used for the devices IPv4 connectivity:

+-----------------------------------------------------------------------------+
|10.X1.0.0/30 - p2p Hubs to ISP networks, where X is Hub site number          |
+-----------------------------------------------------------------------------+
|10.Y1.1.0/24 - p2p Spokes to ISP networks(DHCP), where Y is Spoke site number|
+-----------------------------------------------------------------------------+
|172.16.253.0/29 - tunnels addressing for Hub-1 connections                   |
+-----------------------------------------------------------------------------+
|172.16.254.0/29 - tunnels addressing for Hub-2 connections                   |
+-----------------------------------------------------------------------------+
|192.168.0.0/24 - HQ site local network                                       |
+-----------------------------------------------------------------------------+
|192.168.Z.0/24 - remote sites local network, where Z is Spoke site number    |
+-----------------------------------------------------------------------------+

eBGP parameters for the routers:

+----------------------------------------------+
|AS65000 - HQ (Hub-1 and Hub-2)                |
+----------------------------------------------+
|AS6500X - Spokes, where X is Spoke site number|
+----------------------------------------------+



*************
Configuration
*************



Step-1: Basic connectivity configuration
========================================

- Hub-1:

.. code-block:: none
   
    set interfaces ethernet eth0 address '10.11.0.1/30'
    set interfaces ethernet eth1 address '192.168.0.1/24'
    set protocols static route 0.0.0.0/0 next-hop 10.11.0.2
    set system host-name 'Hub-1'

- Hub-2:

.. code-block:: none
   
    set interfaces ethernet eth0 address '10.21.0.1/30'
    set interfaces ethernet eth1 address '192.168.0.2/24'
    set protocols static route 0.0.0.0/0 next-hop 10.21.0.2
    set system host-name 'Hub-2'

- Spoke-1:

.. code-block:: none
   
    set interfaces ethernet eth0 address 'dhcp'
    set interfaces ethernet eth1 address '192.168.1.1/24'
    set system host-name 'Spoke-1'

- Spoke-2:

.. code-block:: none
   
    set interfaces ethernet eth0 address 'dhcp'
    set interfaces ethernet eth1 address '192.168.2.1/24'
    set system host-name 'Spoke-2'
    
- Spoke-3:

.. code-block:: none
   
    set interfaces ethernet eth0 address 'dhcp'
    set interfaces ethernet eth1 address '192.168.3.1/24'
    set system host-name 'Spoke-3'
    
- ISP-1:

.. code-block:: none
   
    set interfaces ethernet eth0 address '10.11.0.2/30'
    set interfaces ethernet eth1 address '10.21.0.2/30'
    set interfaces ethernet eth2 address '10.31.1.1/24'
    set interfaces ethernet eth3 address '10.21.1.1/24'
    set interfaces ethernet eth4 address '10.11.1.1/24'
    set service dhcp-server shared-network-name SPK-1 authoritative
    set service dhcp-server shared-network-name SPK-1 subnet 10.11.1.0/24 default-router '10.11.1.1'
    set service dhcp-server shared-network-name SPK-1 subnet 10.11.1.0/24 range 1 start '10.11.1.10'
    set service dhcp-server shared-network-name SPK-1 subnet 10.11.1.0/24 range 1 stop '10.11.1.100'
    set service dhcp-server shared-network-name SPK-2 authoritative
    set service dhcp-server shared-network-name SPK-2 subnet 10.21.1.0/24 default-router '10.21.1.1'
    set service dhcp-server shared-network-name SPK-2 subnet 10.21.1.0/24 range 1 start '10.21.1.10'
    set service dhcp-server shared-network-name SPK-2 subnet 10.21.1.0/24 range 1 stop '10.21.1.100'
    set service dhcp-server shared-network-name SPK-3 authoritative
    set service dhcp-server shared-network-name SPK-3 subnet 10.31.1.0/24 default-router '10.31.1.1'
    set service dhcp-server shared-network-name SPK-3 subnet 10.31.1.0/24 range 1 start '10.31.1.10'
    set service dhcp-server shared-network-name SPK-3 subnet 10.31.1.0/24 range 1 stop '10.31.1.100'
    set system host-name 'ISP1'



Step-2: VRRP configuration for HQ Local network redundancy
==========================================================

Here we are using VRRP as a local redundancy protocol between Hub-1 and Hub-2.
Initially, Hub-1 operates as an Active and Hub-2 as a Standby router.
Additionally, health-check and script are used to track uplinks and properly 
switch mastership between Hub nodes based on the upstream router 
reachability (ISP-1). **Note, that before adding local paths to the scripts into 
configuration, you have to create and make them executable first**.

Hub-1 and Hub-2 VRRP health-check script:
_________________________________________

* /config/scripts/vrrp-check.sh

.. code-block:: none
    
    TBC

**Note**: some parts of the script might be dependent on your network topology 
and connectivity. Be careful before using it on your own devices.


Hub-1 and Hub-2 VRRP configuration:
___________________________________

* Hub-1

.. code-block:: none
   
    set high-availability vrrp group HQ health-check failure-count '3'
    set high-availability vrrp group HQ health-check interval '1'
    set high-availability vrrp group HQ health-check script '/config/scripts/vrrp-check.sh'
    set high-availability vrrp group HQ interface 'eth1'
    set high-availability vrrp group HQ no-preempt
    set high-availability vrrp group HQ priority '200'
    set high-availability vrrp group HQ rfc3768-compatibility
    set high-availability vrrp group HQ virtual-address '192.168.0.254/24'
    set high-availability vrrp group HQ vrid '1'

* Hub-2:

.. code-block:: none
    
    set high-availability vrrp group HQ health-check failure-count '3'
    set high-availability vrrp group HQ health-check interval '1'
    set high-availability vrrp group HQ health-check script '/config/scripts/vrrp-check.sh'
    set high-availability vrrp group HQ interface 'eth1'
    set high-availability vrrp group HQ no-preempt
    set high-availability vrrp group HQ priority '100'
    set high-availability vrrp group HQ rfc3768-compatibility
    set high-availability vrrp group HQ virtual-address '192.168.0.254/24'
    set high-availability vrrp group HQ vrid '1'



Step-3: DMVPN configuration between Hub and Spoke devices
=========================================================

This section provides an example configuration of the DMVPN enabled devices. 
Hub devices are configured with static IPv4 addresses on the uplink interfaces 
while Spoke devices receive addresses dynamically from a pre-defined DHCP 
pool configured on ISP router. For redundancy purposes, we use 1 tunnel 
interface on each Hub device and 2 tunnel interfaces on Spoke devices 
destined to each of the Hubs. For the optimal tunnel operation timers are 
significantly decreased and set to the following values:

**NHRP** tunnel holding time - 30 seconds

**IKE DPD** enabled with "restart" action set, interval 3 and timeout 
30 seconds

**Note**: these values are used only for the lab demonstration and may not 
suit exclusive production networks.

- Hub-1:

.. code-block:: none
   
    set interfaces tunnel tun100 address '172.16.253.134/29'
    set interfaces tunnel tun100 encapsulation 'gre'
    set interfaces tunnel tun100 multicast 'enable'
    set interfaces tunnel tun100 parameters ip key '1'
    set interfaces tunnel tun100 source-address '10.11.0.1'
    
    set protocols nhrp tunnel tun100 cisco-authentication 'secret'
    set protocols nhrp tunnel tun100 holding-time '30'
    set protocols nhrp tunnel tun100 multicast 'dynamic'
    set protocols nhrp tunnel tun100 redirect
    set protocols nhrp tunnel tun100 shortcut
    
    set vpn ipsec esp-group ESP-HUB compression 'disable'
    set vpn ipsec esp-group ESP-HUB lifetime '1800'
    set vpn ipsec esp-group ESP-HUB mode 'transport'
    set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
    set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
    set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
    set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
    set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
    set vpn ipsec ike-group IKE-HUB close-action 'none'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection action 'restart'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection interval '3'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection timeout '30'
    set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
    set vpn ipsec ike-group IKE-HUB key-exchange 'ikev2'
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

- Hub-2:

.. code-block:: none
   
    set interfaces tunnel tun100 address '172.16.254.134/29'
    set interfaces tunnel tun100 encapsulation 'gre'
    set interfaces tunnel tun100 multicast 'enable'
    set interfaces tunnel tun100 parameters ip key '2'
    set interfaces tunnel tun100 source-address '10.21.0.1'
    
    set protocols nhrp tunnel tun100 cisco-authentication 'secret'
    set protocols nhrp tunnel tun100 holding-time '30'
    set protocols nhrp tunnel tun100 multicast 'dynamic'
    set protocols nhrp tunnel tun100 redirect
    set protocols nhrp tunnel tun100 shortcut
    
    set vpn ipsec esp-group ESP-HUB compression 'disable'
    set vpn ipsec esp-group ESP-HUB lifetime '1800'
    set vpn ipsec esp-group ESP-HUB mode 'transport'
    set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
    set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
    set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
    set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
    set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
    set vpn ipsec ike-group IKE-HUB close-action 'none'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection action 'restart'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection interval '3'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection timeout '30'
    set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
    set vpn ipsec ike-group IKE-HUB key-exchange 'ikev2'
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
    
- Spoke-1:

.. code-block:: none
   
    set interfaces tunnel tun100 address '172.16.253.131/29'
    set interfaces tunnel tun100 encapsulation 'gre'
    set interfaces tunnel tun100 multicast 'enable'
    set interfaces tunnel tun100 parameters ip key '1'
    set interfaces tunnel tun100 source-address '0.0.0.0'
    set interfaces tunnel tun200 address '172.16.254.131/29'
    set interfaces tunnel tun200 encapsulation 'gre'
    set interfaces tunnel tun200 multicast 'enable'
    set interfaces tunnel tun200 parameters ip key '2'
    set interfaces tunnel tun200 source-address '0.0.0.0'
    
    set protocols nhrp tunnel tun100 cisco-authentication 'secret'
    set protocols nhrp tunnel tun100 holding-time '30'
    set protocols nhrp tunnel tun100 map 172.16.253.134/29 nbma-address '10.11.0.1'
    set protocols nhrp tunnel tun100 map 172.16.253.134/29 register
    set protocols nhrp tunnel tun100 multicast 'nhs'
    set protocols nhrp tunnel tun100 redirect
    set protocols nhrp tunnel tun100 shortcut
    set protocols nhrp tunnel tun200 cisco-authentication 'secret'
    set protocols nhrp tunnel tun200 holding-time '30'
    set protocols nhrp tunnel tun200 map 172.16.254.134/29 nbma-address '10.21.0.1'
    set protocols nhrp tunnel tun200 map 172.16.254.134/29 register
    set protocols nhrp tunnel tun200 multicast 'nhs'
    set protocols nhrp tunnel tun200 redirect
    set protocols nhrp tunnel tun200 shortcut
    
    set vpn ipsec esp-group ESP-HUB compression 'disable'
    set vpn ipsec esp-group ESP-HUB lifetime '1800'
    set vpn ipsec esp-group ESP-HUB mode 'transport'
    set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
    set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
    set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
    set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
    set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
    set vpn ipsec ike-group IKE-HUB close-action 'none'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection action 'restart'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection interval '3'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection timeout '30'
    set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
    set vpn ipsec ike-group IKE-HUB key-exchange 'ikev2'
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
    set vpn ipsec profile NHRPVPN bind tunnel 'tun200'
    set vpn ipsec profile NHRPVPN esp-group 'ESP-HUB'
    set vpn ipsec profile NHRPVPN ike-group 'IKE-HUB'
    
- Spoke-2:

.. code-block:: none
   
    set interfaces tunnel tun100 address '172.16.253.132/29'
    set interfaces tunnel tun100 encapsulation 'gre'
    set interfaces tunnel tun100 multicast 'enable'
    set interfaces tunnel tun100 parameters ip key '1'
    set interfaces tunnel tun100 source-address '0.0.0.0'
    set interfaces tunnel tun200 address '172.16.254.132/29'
    set interfaces tunnel tun200 encapsulation 'gre'
    set interfaces tunnel tun200 multicast 'enable'
    set interfaces tunnel tun200 parameters ip key '2'
    set interfaces tunnel tun200 source-address '0.0.0.0'
    
    set protocols nhrp tunnel tun100 cisco-authentication 'secret'
    set protocols nhrp tunnel tun100 holding-time '30'
    set protocols nhrp tunnel tun100 map 172.16.253.134/29 nbma-address '10.11.0.1'
    set protocols nhrp tunnel tun100 map 172.16.253.134/29 register
    set protocols nhrp tunnel tun100 multicast 'nhs'
    set protocols nhrp tunnel tun100 redirect
    set protocols nhrp tunnel tun100 shortcut
    set protocols nhrp tunnel tun200 cisco-authentication 'secret'
    set protocols nhrp tunnel tun200 holding-time '30'
    set protocols nhrp tunnel tun200 map 172.16.254.134/29 nbma-address '10.21.0.1'
    set protocols nhrp tunnel tun200 map 172.16.254.134/29 register
    set protocols nhrp tunnel tun200 multicast 'nhs'
    set protocols nhrp tunnel tun200 redirect
    set protocols nhrp tunnel tun200 shortcut
    
    set vpn ipsec esp-group ESP-HUB compression 'disable'
    set vpn ipsec esp-group ESP-HUB lifetime '1800'
    set vpn ipsec esp-group ESP-HUB mode 'transport'
    set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
    set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
    set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
    set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
    set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
    set vpn ipsec ike-group IKE-HUB close-action 'none'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection action 'restart'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection interval '3'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection timeout '30'
    set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
    set vpn ipsec ike-group IKE-HUB key-exchange 'ikev2'
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
    set vpn ipsec profile NHRPVPN bind tunnel 'tun200'
    set vpn ipsec profile NHRPVPN esp-group 'ESP-HUB'
    set vpn ipsec profile NHRPVPN ike-group 'IKE-HUB'
    
- Spoke-3:

.. code-block:: none
   
    set interfaces tunnel tun100 address '172.16.253.133/29'
    set interfaces tunnel tun100 encapsulation 'gre'
    set interfaces tunnel tun100 multicast 'enable'
    set interfaces tunnel tun100 parameters ip key '1'
    set interfaces tunnel tun100 source-address '0.0.0.0'
    set interfaces tunnel tun200 address '172.16.254.133/29'
    set interfaces tunnel tun200 encapsulation 'gre'
    set interfaces tunnel tun200 multicast 'enable'
    set interfaces tunnel tun200 parameters ip key '2'
    set interfaces tunnel tun200 source-address '0.0.0.0'
    
    set protocols nhrp tunnel tun100 cisco-authentication 'secret'
    set protocols nhrp tunnel tun100 holding-time '30'
    set protocols nhrp tunnel tun100 map 172.16.253.134/29 nbma-address '10.11.0.1'
    set protocols nhrp tunnel tun100 map 172.16.253.134/29 register
    set protocols nhrp tunnel tun100 multicast 'nhs'
    set protocols nhrp tunnel tun100 redirect
    set protocols nhrp tunnel tun100 shortcut
    set protocols nhrp tunnel tun200 cisco-authentication 'secret'
    set protocols nhrp tunnel tun200 holding-time '30'
    set protocols nhrp tunnel tun200 map 172.16.254.134/29 nbma-address '10.21.0.1'
    set protocols nhrp tunnel tun200 map 172.16.254.134/29 register
    set protocols nhrp tunnel tun200 multicast 'nhs'
    set protocols nhrp tunnel tun200 redirect
    set protocols nhrp tunnel tun200 shortcut
    
    set vpn ipsec esp-group ESP-HUB compression 'disable'
    set vpn ipsec esp-group ESP-HUB lifetime '1800'
    set vpn ipsec esp-group ESP-HUB mode 'transport'
    set vpn ipsec esp-group ESP-HUB pfs 'dh-group2'
    set vpn ipsec esp-group ESP-HUB proposal 1 encryption 'aes256'
    set vpn ipsec esp-group ESP-HUB proposal 1 hash 'sha1'
    set vpn ipsec esp-group ESP-HUB proposal 2 encryption '3des'
    set vpn ipsec esp-group ESP-HUB proposal 2 hash 'md5'
    set vpn ipsec ike-group IKE-HUB close-action 'none'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection action 'restart'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection interval '3'
    set vpn ipsec ike-group IKE-HUB dead-peer-detection timeout '30'
    set vpn ipsec ike-group IKE-HUB ikev2-reauth 'no'
    set vpn ipsec ike-group IKE-HUB key-exchange 'ikev2'
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
    set vpn ipsec profile NHRPVPN bind tunnel 'tun200'
    set vpn ipsec profile NHRPVPN esp-group 'ESP-HUB'
    set vpn ipsec profile NHRPVPN ike-group 'IKE-HUB'
    


Step-4: Enabling eBGP as a Dynamic Routing Protocol between Hubs and Spokes
===========================================================================

For the simplified and better network management we're using eBGP for routing 
information exchange between devices. As we're using Active-Standby mode in 
this example, Hub-2 is configured with AS-prepand as an export route-policy 
and VRRP transition scripts are used for switching mastership based on the 
current link/device state. Also, we use multihop BFD for faster eBGP failure 
detection.

Hub-1 and Hub-2 VRRP transition scripts:
________________________________________

* /config/scripts/vrrp-master.sh

.. code-block:: none
    
    #!/bin/vbash

    if [ $(id -gn) != vyattacfg ]; then
        exec sg vyattacfg "$0 $*"
    fi
    
    source /opt/vyatta/etc/functions/script-template
    
    configure
    delete protocols bgp 65000 peer-group DMVPN address-family ipv4-unicast route-map export AS65000-PREP
    commit
    
    exit


* /config/scripts/vrrp-fail.sh

.. code-block:: none
    
    #!/bin/vbash

    if [ $(id -gn) != vyattacfg ]; then
        exec sg vyattacfg "$0 $*"
    fi
    
    source /opt/vyatta/etc/functions/script-template
    
    configure
    set protocols bgp 65000 peer-group DMVPN address-family ipv4-unicast route-map export AS65000-PREP
    commit
    
    exit


**Note**: some parts of the script might be dependent on your network topology 
and connectivity. Be careful before using it on your own devices.


Hub devices configuration:
__________________________

- Hub-1:

.. code-block:: none
   
    set high-availability vrrp group HQ transition-script backup '/config/scripts/vrrp-fail.sh'
    set high-availability vrrp group HQ transition-script fault '/config/scripts/vrrp-fail.sh'
    set high-availability vrrp group HQ transition-script master '/config/scripts/vrrp-master.sh'
    set high-availability vrrp group HQ transition-script stop '/config/scripts/vrrp-fail.sh'
    
    set policy route-map AS65000-PREP rule 1 action 'permit'
    set policy route-map AS65000-PREP rule 1 set as-path-prepend '65000 65000 65000'
    
    set protocols bfd peer 172.16.253.131 interval multiplier '3'
    set protocols bfd peer 172.16.253.131 interval receive '300'
    set protocols bfd peer 172.16.253.131 interval transmit '300'
    set protocols bfd peer 172.16.253.131 multihop
    set protocols bfd peer 172.16.253.131 source address '172.16.253.134'
    set protocols bfd peer 172.16.253.132 interval multiplier '3'
    set protocols bfd peer 172.16.253.132 interval receive '300'
    set protocols bfd peer 172.16.253.132 interval transmit '300'
    set protocols bfd peer 172.16.253.132 multihop
    set protocols bfd peer 172.16.253.132 source address '172.16.253.134'
    set protocols bfd peer 172.16.253.133 interval multiplier '3'
    set protocols bfd peer 172.16.253.133 interval receive '300'
    set protocols bfd peer 172.16.253.133 interval transmit '300'
    set protocols bfd peer 172.16.253.133 multihop
    set protocols bfd peer 172.16.253.133 source address '172.16.253.134'
    
    set protocols bgp 65000 address-family ipv4-unicast network 192.168.0.0/24
    set protocols bgp 65000 neighbor 172.16.253.131 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.131 remote-as '65001'
    set protocols bgp 65000 neighbor 172.16.253.132 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.132 remote-as '65002'
    set protocols bgp 65000 neighbor 172.16.253.133 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.133 remote-as '65003'
    set protocols bgp 65000 parameters log-neighbor-changes
    set protocols bgp 65000 parameters network-import-check
    set protocols bgp 65000 peer-group DMVPN bfd

- Hub-2:

.. code-block:: none
   
    set high-availability vrrp group HQ transition-script backup '/config/scripts/vrrp-fail.sh'
    set high-availability vrrp group HQ transition-script fault '/config/scripts/vrrp-fail.sh'
    set high-availability vrrp group HQ transition-script master '/config/scripts/vrrp-master.sh'
    set high-availability vrrp group HQ transition-script stop '/config/scripts/vrrp-fail.sh'
    
    set policy route-map AS65000-PREP rule 1 action 'permit'
    set policy route-map AS65000-PREP rule 1 set as-path-prepend '65000 65000 65000'
    
    set protocols bfd peer 172.16.254.131 interval multiplier '3'
    set protocols bfd peer 172.16.254.131 interval receive '300'
    set protocols bfd peer 172.16.254.131 interval transmit '300'
    set protocols bfd peer 172.16.254.131 multihop
    set protocols bfd peer 172.16.254.131 source address '172.16.254.134'
    set protocols bfd peer 172.16.254.132 interval multiplier '3'
    set protocols bfd peer 172.16.254.132 interval receive '300'
    set protocols bfd peer 172.16.254.132 interval transmit '300'
    set protocols bfd peer 172.16.254.132 multihop
    set protocols bfd peer 172.16.254.132 source address '172.16.254.134'
    set protocols bfd peer 172.16.254.133 interval multiplier '3'
    set protocols bfd peer 172.16.254.133 interval receive '300'
    set protocols bfd peer 172.16.254.133 interval transmit '300'
    set protocols bfd peer 172.16.254.133 multihop
    set protocols bfd peer 172.16.254.133 source address '172.16.254.134'
    
    set protocols bgp 65000 address-family ipv4-unicast network 192.168.0.0/24
    set protocols bgp 65000 neighbor 172.16.254.131 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.131 remote-as '65001'
    set protocols bgp 65000 neighbor 172.16.254.132 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.132 remote-as '65002'
    set protocols bgp 65000 neighbor 172.16.254.133 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.133 remote-as '65003'
    set protocols bgp 65000 parameters log-neighbor-changes
    set protocols bgp 65000 parameters network-import-check
    set protocols bgp 65000 peer-group DMVPN address-family ipv4-unicast route-map export 'AS65000-PREP'
    set protocols bgp 65000 peer-group DMVPN bfd
    
Spoke devices configuration:
____________________________

- Spoke-1:

.. code-block:: none
   
    set protocols bfd peer 172.16.253.134 interval multiplier '3'
    set protocols bfd peer 172.16.253.134 interval receive '300'
    set protocols bfd peer 172.16.253.134 interval transmit '300'
    set protocols bfd peer 172.16.253.134 multihop
    set protocols bfd peer 172.16.253.134 source address '172.16.253.131'
    set protocols bfd peer 172.16.254.134 interval multiplier '3'
    set protocols bfd peer 172.16.254.134 interval receive '300'
    set protocols bfd peer 172.16.254.134 interval transmit '300'
    set protocols bfd peer 172.16.254.134 multihop
    set protocols bfd peer 172.16.254.134 source address '172.16.254.131'
    
    set protocols bgp 65001 address-family ipv4-unicast network 192.168.1.0/24
    set protocols bgp 65001 neighbor 172.16.253.134 address-family ipv4-unicast
    set protocols bgp 65001 neighbor 172.16.253.134 bfd
    set protocols bgp 65001 neighbor 172.16.253.134 remote-as '65000'
    set protocols bgp 65001 neighbor 172.16.254.134 address-family ipv4-unicast
    set protocols bgp 65001 neighbor 172.16.254.134 bfd
    set protocols bgp 65001 neighbor 172.16.254.134 remote-as '65000'
    set protocols bgp 65001 parameters log-neighbor-changes
    
- Spoke-2:

.. code-block:: none
   
    set protocols bfd peer 172.16.253.134 interval multiplier '3'
    set protocols bfd peer 172.16.253.134 interval receive '300'
    set protocols bfd peer 172.16.253.134 interval transmit '300'
    set protocols bfd peer 172.16.253.134 multihop
    set protocols bfd peer 172.16.253.134 source address '172.16.253.132'
    set protocols bfd peer 172.16.254.134 interval multiplier '3'
    set protocols bfd peer 172.16.254.134 interval receive '300'
    set protocols bfd peer 172.16.254.134 interval transmit '300'
    set protocols bfd peer 172.16.254.134 multihop
    set protocols bfd peer 172.16.254.134 source address '172.16.254.132'
    
    set protocols bgp 65002 address-family ipv4-unicast network 192.168.2.0/24
    set protocols bgp 65002 neighbor 172.16.253.134 address-family ipv4-unicast
    set protocols bgp 65002 neighbor 172.16.253.134 bfd
    set protocols bgp 65002 neighbor 172.16.253.134 remote-as '65000'
    set protocols bgp 65002 neighbor 172.16.254.134 address-family ipv4-unicast
    set protocols bgp 65002 neighbor 172.16.254.134 bfd
    set protocols bgp 65002 neighbor 172.16.254.134 remote-as '65000'
    set protocols bgp 65002 parameters log-neighbor-changes
    
- Spoke-3:

.. code-block:: none
   
    set protocols bfd peer 172.16.253.134 interval multiplier '3'
    set protocols bfd peer 172.16.253.134 interval receive '300'
    set protocols bfd peer 172.16.253.134 interval transmit '300'
    set protocols bfd peer 172.16.253.134 multihop
    set protocols bfd peer 172.16.253.134 source address '172.16.253.133'
    set protocols bfd peer 172.16.254.134 interval multiplier '3'
    set protocols bfd peer 172.16.254.134 interval receive '300'
    set protocols bfd peer 172.16.254.134 interval transmit '300'
    set protocols bfd peer 172.16.254.134 multihop
    set protocols bfd peer 172.16.254.134 source address '172.16.254.133'
    
    set protocols bgp 65003 address-family ipv4-unicast network 192.168.3.0/24
    set protocols bgp 65003 neighbor 172.16.253.134 address-family ipv4-unicast
    set protocols bgp 65003 neighbor 172.16.253.134 bfd
    set protocols bgp 65003 neighbor 172.16.253.134 remote-as '65000'
    set protocols bgp 65003 neighbor 172.16.254.134 address-family ipv4-unicast
    set protocols bgp 65003 neighbor 172.16.254.134 bfd
    set protocols bgp 65003 neighbor 172.16.254.134 remote-as '65000'
    set protocols bgp 65003 parameters log-neighbor-changes
    
**Note**: In case if you're using VyOS version that has a VRRP transition 
scripts issues after a device reboot, as a temporary solution you may add
postconfig-bootup script that reloads **keepalived** process additionally after 
the device booted.

- Hub devices /config/scripts/vyos-postconfig-bootup.script:

.. code-block:: none
   
    #!/bin/sh
    # This script is executed at boot time after VyOS configuration is fully applied.
    # Any modifications required to work around unfixed bugs
    # or use services not available through the VyOS CLI system can be placed here.
    
    echo "Reloading VRRP process"
    sudo systemctl restart keepalived.service
    echo "VRRP process reload completed"



Step-5: Verification
====================

Now, it's time to check that all protocols are working as expected and mastership 
during the failover switches correctly between Hub devices.

- Checking VRRP state between Hub-1 and Hub-2:

.. code-block:: none
   
    vyos@Hub-1:~$ show vrrp
    Name    Interface      VRID  State      Priority  Last Transition
    ------  -----------  ------  -------  ----------  -----------------
    HQ      eth1v1            1  MASTER          200  14s
    
    vyos@Hub-2:~$ show vrrp
    Name    Interface      VRID  State      Priority  Last Transition
    ------  -----------  ------  -------  ----------  -----------------
    HQ      eth1v1            1  BACKUP          100  29s

- Checking NHRP and eBGP sessions between Hub and Spoke devices:

.. code-block:: none
   
    vyos@Hub-1:~$ show nhrp tunnel
    Status: ok
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.135/32
    Alias-Address: 172.16.253.134
    Flags: up
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.134/32
    Flags: up
    
    Interface: tun100
    Type: dynamic
    Protocol-Address: 172.16.253.131/32
    NBMA-Address: 10.11.1.11
    Flags: up
    Expires-In: 0:23
    
    Interface: tun100
    Type: dynamic
    Protocol-Address: 172.16.253.133/32
    NBMA-Address: 10.31.1.11
    Flags: up
    Expires-In: 0:22
    
    Interface: tun100
    Type: dynamic
    Protocol-Address: 172.16.253.132/32
    NBMA-Address: 10.21.1.11
    Flags: up
    Expires-In: 0:21
    
    vyos@Hub-1:~$ show bgp summary
    
    IPv4 Unicast Summary:
    BGP router identifier 192.168.0.1, local AS number 65000 vrf-id 0
    BGP table version 20
    RIB entries 7, using 1344 bytes of memory
    Peers 3, using 64 KiB of memory
    Peer groups 1, using 64 bytes of memory
    
    Neighbor        V         AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt
    172.16.253.131  4      65001     26519     26526        0    0    0 00:43:38            1        4
    172.16.253.132  4      65002     26545     26540        0    0    0 00:46:36            1        4
    172.16.253.133  4      65003     26528     26520        0    0    0 00:41:59            1        4
    
    Total number of neighbors 3
    
    
    vyos@Hub-2:~$ show nhrp tunnel
    Status: ok
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.254.135/32
    Alias-Address: 172.16.254.134
    Flags: up
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.254.134/32
    Flags: up
    
    Interface: tun100
    Type: dynamic
    Protocol-Address: 172.16.254.132/32
    NBMA-Address: 10.21.1.11
    Flags: up
    Expires-In: 0:28
    
    Interface: tun100
    Type: dynamic
    Protocol-Address: 172.16.254.131/32
    NBMA-Address: 10.11.1.11
    Flags: up
    Expires-In: 0:21
    
    Interface: tun100
    Type: dynamic
    Protocol-Address: 172.16.254.133/32
    NBMA-Address: 10.31.1.11
    Flags: up
    Expires-In: 0:20
    
    vyos@Hub-2:~$ show bgp summary
    
    IPv4 Unicast Summary:
    BGP router identifier 192.168.0.2, local AS number 65000 vrf-id 0
    BGP table version 14
    RIB entries 7, using 1344 bytes of memory
    Peers 3, using 64 KiB of memory
    Peer groups 1, using 64 bytes of memory
    
    Neighbor        V         AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt
    172.16.254.131  4      65001     26516     26516        0    0    0 00:43:03            1        4
    172.16.254.132  4      65002     26563     26562        0    0    0 00:48:27            1        4
    172.16.254.133  4      65003     26518     26516        0    0    0 00:42:20            1        4
    
    Total number of neighbors 3
    
- Checking BFD sessions between Hub and Spoke devices:

.. code-block:: none
   
    vyos@Hub-1:~$ show protocols bfd peers
    Session count: 6
    SessionId  LocalAddress                             PeerAddress                             Status
    =========  ============                             ===========                             ======
    3600626867 172.16.253.134                           172.16.253.133                          up
    1123939978 172.16.253.134                           172.16.253.131                          up
    374394280  172.16.253.134                           172.16.253.132                          up
    1786735466 172.16.253.134                           172.16.253.132                          up
    1440522544 172.16.253.134                           172.16.253.131                          up
    1106910911 172.16.253.134                           172.16.253.133                          up
    
    
    vyos@Hub-2:~$ show protocols bfd peers
    Session count: 6
    SessionId  LocalAddress                             PeerAddress                             Status
    =========  ============                             ===========                             ======
    2442966178 172.16.254.134                           172.16.254.133                          up
    393258775  172.16.254.134                           172.16.254.131                          up
    2990308682 172.16.254.134                           172.16.254.133                          up
    2267910949 172.16.254.134                           172.16.254.132                          up
    3542474595 172.16.254.134                           172.16.254.131                          up
    4239538185 172.16.254.134                           172.16.254.132                          up

- Checking routing information and connectivity between Hub and Spoke devices:

.. code-block:: none
   
    vyos@Hub-1:~$ show ip bgp
    BGP table version is 20, local router ID is 192.168.0.1, vrf id 0
    Default local pref 100, local AS 65000
    Status codes:  s suppressed, d damped, h history, * valid, > best, = multipath,
                   i internal, r RIB-failure, S Stale, R Removed
    Nexthop codes: @NNN nexthop's vrf id, < announce-nh-self
    Origin codes:  i - IGP, e - EGP, ? - incomplete
    
       Network          Next Hop            Metric LocPrf Weight Path
    *> 192.168.0.0/24   0.0.0.0                  0         32768 i
    *> 192.168.1.0/24   172.16.253.131           0             0 65001 i
    *> 192.168.2.0/24   172.16.253.132           0             0 65002 i
    *> 192.168.3.0/24   172.16.253.133           0             0 65003 i
    
    Displayed  4 routes and 4 total paths


    vyos@Hub-2:~$ show ip bgp
    BGP table version is 14, local router ID is 192.168.0.2, vrf id 0
    Default local pref 100, local AS 65000
    Status codes:  s suppressed, d damped, h history, * valid, > best, = multipath,
                   i internal, r RIB-failure, S Stale, R Removed
    Nexthop codes: @NNN nexthop's vrf id, < announce-nh-self
    Origin codes:  i - IGP, e - EGP, ? - incomplete
    
       Network          Next Hop            Metric LocPrf Weight Path
    *> 192.168.0.0/24   0.0.0.0                  0         32768 i
    *> 192.168.1.0/24   172.16.254.131           0             0 65001 i
    *> 192.168.2.0/24   172.16.254.132           0             0 65002 i
    *> 192.168.3.0/24   172.16.254.133           0             0 65003 i
    
    Displayed  4 routes and 4 total paths


    vyos@Spoke-1:~$ show ip bgp
    BGP table version is 19, local router ID is 192.168.1.1, vrf id 0
    Default local pref 100, local AS 65001
    Status codes:  s suppressed, d damped, h history, * valid, > best, = multipath,
                   i internal, r RIB-failure, S Stale, R Removed
    Nexthop codes: @NNN nexthop's vrf id, < announce-nh-self
    Origin codes:  i - IGP, e - EGP, ? - incomplete
    
       Network          Next Hop            Metric LocPrf Weight Path
    *  192.168.0.0/24   172.16.254.134           0             0 65000 65000 65000 65000 i
    *>                  172.16.253.134           0             0 65000 i
    *> 192.168.1.0/24   0.0.0.0                  0         32768 i
    *  192.168.2.0/24   172.16.254.132                         0 65000 65000 65000 65000 65002 i
    *>                  172.16.253.132                         0 65000 65002 i
    *  192.168.3.0/24   172.16.254.133                         0 65000 65000 65000 65000 65003 i
    *>                  172.16.253.133                         0 65000 65003 i
    
    Displayed  4 routes and 7 total paths

As you can see, Hub-2 announces routes with longer(prepended) AS path as 
we've configured it previously, those, traffic towards HQ subnet will be 
forwarded over Hub-1 which is operating as an Active VRRP router. Let's 
check connectivity and the path from Spoke-1 to the HQ local network:

.. code-block:: none
   
    vyos@Spoke-1:~$ ping 192.168.0.10 count 5 interface 192.168.1.1
    PING 192.168.0.10 (192.168.0.10) from 192.168.1.1 : 56(84) bytes of data.
    64 bytes from 192.168.0.10: icmp_seq=1 ttl=63 time=3.50 ms
    64 bytes from 192.168.0.10: icmp_seq=2 ttl=63 time=2.45 ms
    64 bytes from 192.168.0.10: icmp_seq=3 ttl=63 time=2.34 ms
    64 bytes from 192.168.0.10: icmp_seq=4 ttl=63 time=2.20 ms
    64 bytes from 192.168.0.10: icmp_seq=5 ttl=63 time=2.44 ms
    
    --- 192.168.0.10 ping statistics ---
    5 packets transmitted, 5 received, 0% packet loss, time 11ms
    rtt min/avg/max/mdev = 2.195/2.583/3.496/0.465 ms
    
    vyos@Spoke-1:~$ traceroute 192.168.0.10
    traceroute to 192.168.0.10 (192.168.0.10), 30 hops max, 60 byte packets
     1  172.16.253.134 (172.16.253.134)  0.913 ms  0.884 ms  0.819 ms
     2  192.168.0.10 (192.168.0.10)  1.352 ms  1.446 ms  1.391 ms

From the output, we can confirm successful connectivity between Spoke-1 and HQ 
local networks. From the traceroute we see that the traffic pass through the 
Hub-1.

Now, let's check traffic between Spoke sites. Based on our configuration, Spoke 
sites are using shourtcut for direct reachability between each other. First, let's 
check NHRP tunnels before passing the traffic between Spoke-1 and Spoke-2:

.. code-block:: none
   
    vyos@Spoke-1:~$ show nhrp tunnel
    Status: ok
    
    Interface: tun200
    Type: local
    Protocol-Address: 172.16.254.135/32
    Alias-Address: 172.16.254.131
    Flags: up
    
    Interface: tun200
    Type: local
    Protocol-Address: 172.16.254.131/32
    Flags: up
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.135/32
    Alias-Address: 172.16.253.131
    Flags: up
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.131/32
    Flags: up
    
    Interface: tun200
    Type: static
    Protocol-Address: 172.16.254.134/29
    NBMA-Address: 10.21.0.1
    Flags: used up
    
    Interface: tun100
    Type: static
    Protocol-Address: 172.16.253.134/29
    NBMA-Address: 10.11.0.1
    Flags: used up

    vyos@Spoke-2:~$ show nhrp tunnel
    Status: ok
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.135/32
    Alias-Address: 172.16.253.132
    Flags: up
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.132/32
    Flags: up
    
    Interface: tun200
    Type: local
    Protocol-Address: 172.16.254.135/32
    Alias-Address: 172.16.254.132
    Flags: up
    
    Interface: tun200
    Type: local
    Protocol-Address: 172.16.254.132/32
    Flags: up
    
    Interface: tun100
    Type: static
    Protocol-Address: 172.16.253.134/29
    NBMA-Address: 10.11.0.1
    Flags: used up
    
    Interface: tun200
    Type: static
    Protocol-Address: 172.16.254.134/29
    NBMA-Address: 10.21.0.1


After passing traffic we could see that there is additional shourtcut tunnel 
created between Spoke-1 and Spoke-2 for the direct communication:

.. code-block:: none
   
    vyos@Spoke-1:~$ ping 192.168.2.1 count 5 interface 192.168.1.1
    PING 192.168.2.1 (192.168.2.1) from 192.168.1.1 : 56(84) bytes of data.
    64 bytes from 192.168.2.1: icmp_seq=1 ttl=64 time=1.03 ms
    64 bytes from 192.168.2.1: icmp_seq=2 ttl=64 time=0.820 ms
    64 bytes from 192.168.2.1: icmp_seq=3 ttl=64 time=1.13 ms
    64 bytes from 192.168.2.1: icmp_seq=4 ttl=63 time=1.41 ms
    64 bytes from 192.168.2.1: icmp_seq=5 ttl=64 time=0.988 ms
    
    --- 192.168.2.1 ping statistics ---
    5 packets transmitted, 5 received, 0% packet loss, time 10ms
    rtt min/avg/max/mdev = 0.820/1.075/1.412/0.197 ms
    
    vyos@Spoke-1:~$ traceroute 192.168.2.1
    traceroute to 192.168.2.1 (192.168.2.1), 30 hops max, 60 byte packets
     1  192.168.2.1 (192.168.2.1)  1.172 ms  1.109 ms  1.151 ms

    vyos@Spoke-1:~$ show nhrp tunnel
    Status: ok
    
    Interface: tun200
    Type: local
    Protocol-Address: 172.16.254.135/32
    Alias-Address: 172.16.254.131
    Flags: up
    
    Interface: tun200
    Type: local
    Protocol-Address: 172.16.254.131/32
    Flags: up
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.135/32
    Alias-Address: 172.16.253.131
    Flags: up
    
    Interface: tun100
    Type: local
    Protocol-Address: 172.16.253.131/32
    Flags: up
    
    Interface: tun200
    Type: static
    Protocol-Address: 172.16.254.134/29
    NBMA-Address: 10.21.0.1
    Flags: used up
    
    ____________________________________
    Interface: tun100
    Type: cached
    Protocol-Address: 172.16.253.132/32
    NBMA-Address: 10.21.1.11
    Flags: used up
    Expires-In: 0:24
    ____________________________________
    
    Interface: tun100
    Type: static
    Protocol-Address: 172.16.253.134/29
    NBMA-Address: 10.11.0.1
    Flags: used up

The same applies to the rest of the devices and works with the same logic. 
As we've already confirmed successfull connectivity between Hub and Spoke 
devices, let's check failover process.

- Failover on the health-check failure on Hub-1:
  
.. code-block:: none
   
    # disabling interface towards Hub-1 on ISP router
    vyos@ISP1:~$ configure
    [edit]
    vyos@ISP1# set interfaces ethernet eth0 disable
    [edit]
    vyos@ISP1# commit
    [edit]
    vyos@ISP1#


    # checking VRRP state and eBGP configuration on Hub-1:
    vyos@Hub-1:~$ show vrrp
    Name    Interface      VRID  State      Priority  Last Transition
    ------  -----------  ------  -------  ----------  -----------------
    HQ      eth1v1            1  FAULT           200  1m15s
    
    vyos@Hub-1:~$ show configuration commands | match bgp
    set protocols bgp 65000 address-family ipv4-unicast network 192.168.0.0/24
    set protocols bgp 65000 neighbor 172.16.253.131 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.131 remote-as '65001'
    set protocols bgp 65000 neighbor 172.16.253.132 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.132 remote-as '65002'
    set protocols bgp 65000 neighbor 172.16.253.133 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.133 remote-as '65003'
    set protocols bgp 65000 parameters log-neighbor-changes
    set protocols bgp 65000 peer-group DMVPN address-family ipv4-unicast route-map export 'AS65000-PREP'
    set protocols bgp 65000 peer-group DMVPN bfd


    # consecutive pings check from Spoke-1 to the HQ local network during the failure
    --- 192.168.0.10 ping statistics ---
    223 packets transmitted, 219 received, 1.79372% packet loss, time 679ms
    rtt min/avg/max/mdev = 0.918/2.191/2.957/0.364 ms
    vyos@Spoke-1:~$


    # consecutive pings check from Spoke-3 to the Spoke-2 local network during the failure
    --- 192.168.2.1 ping statistics ---
    265 packets transmitted, 265 received, 0% packet loss, time 690ms
    rtt min/avg/max/mdev = 0.663/1.128/2.272/0.285 ms
    vyos@Spoke-3:~$

**Note**: After bringing ISP interface towards Hub-1 back to UP state, 
VRRP state will remain unchanged due to "no-preempt" option enabled 
under the VRRP configuration on the Hub-1 and Hub-2 and will be changed 
only during link/device failure on Hub-2.
    
- Failover during Hub-2 device failure:

.. code-block:: none
   
    # Checking VRRP state and eBGP configuration on Hub-2 before reboot
    vyos@Hub-2:~$ show vrrp
    Name    Interface      VRID  State      Priority  Last Transition
    ------  -----------  ------  -------  ----------  -----------------
    HQ      eth1v1            1  MASTER          100  20m22s

    vyos@Hub-2:~$ show configuration commands | match bgp
    set protocols bgp 65000 address-family ipv4-unicast network 192.168.0.0/24
    set protocols bgp 65000 neighbor 172.16.254.131 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.131 remote-as '65001'
    set protocols bgp 65000 neighbor 172.16.254.132 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.132 remote-as '65002'
    set protocols bgp 65000 neighbor 172.16.254.133 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.133 remote-as '65003'
    set protocols bgp 65000 parameters log-neighbor-changes
    set protocols bgp 65000 peer-group DMVPN address-family ipv4-unicast route-map
    set protocols bgp 65000 peer-group DMVPN bfd


    # Rebooting Hub-2
    vyos@Hub-2:~$ reboot
    Are you sure you want to reboot this system? [y/N]  y

    
    # Checking VRRP state and eBGP configuration on Hub-1
    vyos@Hub-1:~$ show vrrp
    Name    Interface      VRID  State      Priority  Last Transition
    ------  -----------  ------  -------  ----------  -----------------
    HQ      eth1v1            1  MASTER          200  1m57s
    
    vyos@Hub-1:~$ show configuration commands | match bgp
    set protocols bgp 65000 address-family ipv4-unicast network 192.168.0.0/24
    set protocols bgp 65000 neighbor 172.16.253.131 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.131 remote-as '65001'
    set protocols bgp 65000 neighbor 172.16.253.132 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.132 remote-as '65002'
    set protocols bgp 65000 neighbor 172.16.253.133 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.253.133 remote-as '65003'
    set protocols bgp 65000 parameters log-neighbor-changes
    set protocols bgp 65000 peer-group DMVPN address-family ipv4-unicast route-map
    set protocols bgp 65000 peer-group DMVPN bfd
    
    
    # Checking VRRP state and eBGP configuration on Hub-2 after reboot completed
    vyos@Hub-2:~$ show vrrp
    Name    Interface      VRID  State      Priority  Last Transition
    ------  -----------  ------  -------  ----------  -----------------
    HQ      eth1v1            1  BACKUP          100  1m46s
    
    vyos@Hub-2:~$ show configuration commands | match bgp
    set protocols bgp 65000 address-family ipv4-unicast network 192.168.0.0/24
    set protocols bgp 65000 neighbor 172.16.254.131 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.131 remote-as '65001'
    set protocols bgp 65000 neighbor 172.16.254.132 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.132 remote-as '65002'
    set protocols bgp 65000 neighbor 172.16.254.133 peer-group 'DMVPN'
    set protocols bgp 65000 neighbor 172.16.254.133 remote-as '65003'
    set protocols bgp 65000 parameters log-neighbor-changes
    set protocols bgp 65000 peer-group DMVPN address-family ipv4-unicast route-map export 'AS65000-PREP'
    set protocols bgp 65000 peer-group DMVPN bfd


    # consecutive pings check from Spoke-1 to the HQ local network during the failure
    --- 192.168.0.10 ping statistics ---
    1182 packets transmitted, 1182 received, 0% packet loss, time 1921ms
    rtt min/avg/max/mdev = 0.890/1.692/3.305/0.503 ms
    vyos@Spoke-1:~$


    # consecutive pings check from Spoke-3 to the Spoke-2 local network during the failure
    --- 192.168.2.1 ping statistics ---
    1186 packets transmitted, 1186 received, 0% packet loss, time 2100ms
    rtt min/avg/max/mdev = 0.506/1.236/8.497/0.369 ms
    vyos@Spoke-3:~$

From the results, we can see that the switchover performed as expected with 
0 packets loss both from Spoke-1 to HQ and Spoke-3 to Spoke-2 networks. 
