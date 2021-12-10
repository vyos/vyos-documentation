
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

10.X1.0.0/30 - p2p Hubs to ISP networks, where X is Hub site number
10.Y1.1.0/24 - p2p Spokes to ISP networks(DHCP), where Y is Spoke site number
172.16.253.0/29 - tunnels addressing for Hub-1 connections
172.16.254.0/29 - tunnels addressing for Hub-2 connections
192.168.0.0/24 - HQ site local network
192.168.Z.0/24 - remote sites local network, where Z is Spoke site number

eBGP parameters for the routers:

AS65000 - HQ (Hub-1 and Hub-2)
AS6500X - Spokes, where X is Spoke site number



*************
Configuration
*************



Step-1: Configuring IGP and enabling MPLS LDP
=============================================

At the first step we need to configure the IP/MPLS backbone network using OSPF as 
IGP protocol and LDP as label-switching protocol for the base connectivity between 
**P** (rovider), **P** (rovider) **E** (dge) and **R** (oute) **R** (eflector) nodes:

- VyOS-P1:

.. code-block:: none
   
   # interfaces 
   set interfaces dummy dum10 address '10.0.0.3/32'
   set interfaces ethernet eth0 address '172.16.30.1/24'
   set interfaces ethernet eth1 address '172.16.40.1/24'
   set interfaces ethernet eth2 address '172.16.90.1/24'
   set interfaces ethernet eth3 address '172.16.10.1/24'
   set interfaces ethernet eth5 address '172.16.100.1/24'
   
   # protocols ospf+ldp
   set protocols mpls interface 'eth1'
   set protocols mpls interface 'eth2'
   set protocols mpls interface 'eth3'
   set protocols mpls interface 'eth5'
   set protocols mpls interface 'eth0'
   set protocols mpls ldp discovery transport-ipv4-address '10.0.0.3'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth2'
   set protocols mpls ldp interface 'eth3'
   set protocols mpls ldp interface 'eth5'
   set protocols mpls ldp router-id '10.0.0.3'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '10.0.0.3
