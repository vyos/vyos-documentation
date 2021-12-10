
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
