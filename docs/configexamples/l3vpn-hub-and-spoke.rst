
##############################################
L3VPN for Hub-and-Spoke connectivity with VyOS
##############################################

IP/MPLS technology is widely used by various service providers and large 
enterprises in order to achieve better network scalability, manageability 
and flexibility. It also provides the possibility to deliver different 
services for the customers in a seamless manner. 
Layer 3 VPN (L3VPN) is a type of VPN mode that is built and delivered 
through OSI layer 3 networking technologies. Often the border gateway 
protocol (BGP) is used to send and receive VPN-related data that is 
responsible for the control plane. L3VPN utilizes virtual routing and 
forwarding (VRF) techniques to receive and deliver user data as well as 
separate data planes of the end-users. It is built using a combination of 
IP- and MPLS-based information. Generally, L3VPNs are used to send data 
on back-end VPN infrastructures, such as for VPN connections between data 
centres, HQs and branches.

An L3VPN consists of multiple access links, multiple VPN routing and 
forwarding (VRF) tables, and multiple MPLS paths or multiple P2MP LSPs. 
An L3VPN can be configured to connect two or more customer sites.
In hub-and-spoke MPLS L3VPN environments, the spoke routers need to have 
unique Route Distinguishers (RDs). In order to use the hub site as a 
transit point for connectivity in such an environment, the spoke sites 
export their routes to the hub. Spokes can talk to hubs, but never have 
direct paths to other spokes. All traffic between spokes is controlled 
and delivered over the hub site.


To deploy a Layer3 VPN with MPLS on VyOS, we should meet a couple 
requirements in order to properly implement the solution. 
We'll use the following nodes in our LAB environment:

* 2 x Route reflectors (VyOS-RRx)
* 4 x Provider routers (VyOS-Px)
* 3 x Provider Edge (VyOs-PEx)
* 3 x Customer Edge (VyOS-CEx)

The following software was used in the creation of this document:

* Operating system: VyOS
* Version: 1.4-rolling-202110310317
* Image name: vyos-1.4-rolling-202110310317-amd64.iso

**NOTE:** VyOS Router (tested with VyOS 1.4-rolling-202110310317) 
–  The configurations below are specifically for VyOS 1.4.x.

General information can be found in the :ref:`l3vpn-vrfs` chapter.



********
Topology
********
.. image:: /_static/images/L3VPN_hub_spoke.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram



*****************
How does it work?
*****************

As we know the main assumption of L3VPN “Hub and Spoke” is, that the traffic 
between spokes have to pass via hub, in our scenario VyOS-PE2 is the Hub PE 
and the VyOS-CE1-HUB is the central customer office device that is responsible 
for controlling access between all spokes and announcing its network prefixes 
(100.100.100.100/32). VyOS-PE2 has the main VRF (its name is BLUE_HUB), its 
own Route-Distinguisher(RD) and route-target import/export lists. 
Multiprotocol-BGP(MP-BGP) delivers L3VPN related control-plane information to 
the nodes across network where PEs Spokes import the route-target 60535:1030 
(this is export route-target of vrf BLUE_HUB) and export its own route-target 
60535:1011(this is vrf BLUE_SPOKE export route-target). Therefore, the 
Customer edge nodes can only learn the network prefixes of the HUB site 
[100.100.100.100/32]. For this example VyOS-CE1 has network prefixes 
[80.80.80.80/32] / VyOS-CE2 has network prefixes [90.90.90.90/32]. 
Route-Reflector devices VyOS-RR1 and VyOS-RR2 are used to simplify network 
routes exchange and minimize iBGP peerings between devices.

L3VPN configuration parameters table:

+----------+-------+------------+-----------------+-------------+-------------+
|   Node   |  Role |     VRF    |        RD       |  RT import  |  RT export  |
+----------+-------+------------+-----------------+-------------+-------------+
| VyOS-PE2 | Hub   | BLUE_HUB   | 10.80.80.1:1011 | 65035:1011  | 65035:1030  |
|          |       |            |                 | 65035:1030  |             |
+----------+-------+------------+-----------------+-------------+-------------+
| VyOS-PE1 | Spoke | BLUE_SPOKE | 10.50.50.1:1011 | 65035:1030  | 65035:1011  |
+----------+-------+------------+-----------------+-------------+-------------+
| VyOS-PE3 | Spoke | BLUE_SPOKE | 10.60.60.1:1011 | 65035:1030  | 65035:1011  |
+----------+-------+------------+-----------------+-------------+-------------+



*************
Configuration
*************



Step-1: Configuring IGP and enabling MPLS LDP
=====================================

At the first step we need to configure the IP/MPLS backbone network using OSPF as 
IGP protocol and LDP as label-switching protocol for the base connectivity between 
**P** (rovider), **P** (rovider) **E** (dge) and **R** (oute) **R** (eflector) nodes:

- VyOS-P1:

.. code-block:: none
   
   # interfaces 
   set interfaces dummy dum10 address '3.3.3.3/32'
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
   set protocols mpls ldp discovery transport-ipv4-address '3.3.3.3'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth2'
   set protocols mpls ldp interface 'eth3'
   set protocols mpls ldp interface 'eth5'
   set protocols mpls ldp router-id '3.3.3.3'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '3.3.3.3


- VyOS-P2:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum10 address '4.4.4.4/32'
   set interfaces ethernet eth0 address '172.16.30.2/24'
   set interfaces ethernet eth1 address '172.16.20.1/24'
   set interfaces ethernet eth2 address '172.16.120.1/24'
   set interfaces ethernet eth3 address '172.16.60.1/24'
   
   # protocols ospf+ldp
   set protocols mpls interface 'eth1'
   set protocols mpls interface 'eth2'
   set protocols mpls interface 'eth3'
   set protocols mpls interface 'eth0'
   set protocols mpls ldp discovery transport-ipv4-address '4.4.4.4'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth2'
   set protocols mpls ldp interface 'eth3'
   set protocols mpls ldp router-id '4.4.4.4'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '4.4.4.4'

- VyOS-P3:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum10 address '5.5.5.5/32'
   set interfaces ethernet eth0 address '172.16.110.1/24'
   set interfaces ethernet eth1 address '172.16.40.2/24'
   set interfaces ethernet eth2 address '172.16.50.1/24'
   set interfaces ethernet eth3 address '172.16.70.1/24'
   
   # protocols ospf + ldp
   set protocols mpls interface 'eth1'
   set protocols mpls interface 'eth2'
   set protocols mpls interface 'eth3'
   set protocols mpls interface 'eth0'
   set protocols mpls ldp discovery transport-ipv4-address '5.5.5.5'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth2'
   set protocols mpls ldp interface 'eth3'
   set protocols mpls ldp router-id '5.5.5.5'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '5.5.5.5'

- VyOS-P4:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum10 address '6.6.6.6/32'
   set interfaces ethernet eth0 address '172.16.80.2/24'
   set interfaces ethernet eth1 address '172.16.130.1/24'
   set interfaces ethernet eth2 address '172.16.50.2/24'
   set interfaces ethernet eth3 address '172.16.60.2/24'
   set interfaces ethernet eth5 address '172.16.140.1/24'
   
   
   # protocols ospf + ldp
   set protocols mpls interface 'eth1'
   set protocols mpls interface 'eth2'
   set protocols mpls interface 'eth3'
   set protocols mpls interface 'eth0'
   set protocols mpls interface 'eth5'
   set protocols mpls ldp discovery transport-ipv4-address '6.6.6.6'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth2'
   set protocols mpls ldp interface 'eth3'
   set protocols mpls ldp interface 'eth5'
   set protocols mpls ldp router-id '6.6.6.6'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '6.6.6.6'

- VyOS-PE1:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum10 address '7.7.7.7/32'
   set interfaces ethernet eth0 address '172.16.90.2/24'
   
   # protocols  ospf + ldp 
   set protocols mpls interface 'eth0'
   set protocols mpls ldp discovery transport-ipv4-address '7.7.7.7'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp router-id '7.7.7.7'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '7.7.7.7'

- VyOS-PE2:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum10 address '8.8.8.8/32'
   set interfaces ethernet eth0 address '172.16.110.2/24'
   set interfaces ethernet eth1 address '172.16.100.2/24'
   set interfaces ethernet eth2 address '172.16.80.1/24'
   
   # protocols  ospf + ldp 
   set protocols mpls interface 'eth0'
   set protocols mpls interface 'eth1'
   set protocols mpls ldp discovery transport-ipv4-address '8.8.8.8'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp router-id '8.8.8.8'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '8.8.8.8'

- VyOS-PE3:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum10 address '10.10.10.10/32'
   set interfaces ethernet eth0 address '172.16.140.2/24'
   
   # protocols ospf + ldp
   set protocols mpls interface 'eth0'
   set protocols mpls ldp discovery transport-ipv4-address '10.10.10.10'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp router-id '10.10.10.10'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '10.10.10.10'

- VyOS-RR1:

.. code-block:: none
   
   # interfaces
   set interfaces ethernet eth1 address '172.16.20.2/24'
   set interfaces ethernet eth2 address '172.16.10.2/24'
   set interfaces dummy dum10 address '1.1.1.1/32'
   
   # protocols ospf + ldp
   set protocols mpls interface 'eth1'
   set protocols mpls interface 'eth2'
   set protocols mpls ldp discovery transport-ipv4-address '1.1.1.1'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth2'
   set protocols mpls ldp router-id '1.1.1.1'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '1.1.1.1'

- VyOS-RR2:

.. code-block:: none
   
   # interfaces
   set interfaces ethernet eth0 address '172.16.80.1/24'
   set interfaces ethernet eth1 address '172.16.70.2/24'
   set interfaces dummy dum10 address '2.2.2.2/32'
   
   # protocols ospf + ldp
   set protocols mpls interface 'eth0'
   set protocols mpls interface 'eth1'
   set protocols mpls ldp discovery transport-ipv4-address '2.2.2.2'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth0'
   set protocols mpls ldp router-id '2.2.2.2'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters abr-type 'cisco'
   set protocols ospf parameters router-id '2.2.2.2'



Step-2: Configuring iBGP for L3VPN control-plane 
================================================

At this step we are going to enable iBGP protocol on MPLS nodes and 
Route Reflectors (two routers for redundancy) that will deliver IPv4 
VPN (L3VPN) routes between them:

- VyOS-RR1:

.. code-block:: none
   
   set protocols bgp local-as '65001'
   set protocols bgp neighbor 7.7.7.7 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 7.7.7.7 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 8.8.8.8 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 8.8.8.8 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 9.9.9.9 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 9.9.9.9 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 10.10.10.10 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 10.10.10.10 peer-group 'RR_VPNv4'
   set protocols bgp parameters cluster-id '1.1.1.1'
   set protocols bgp parameters default no-ipv4-unicast
   set protocols bgp parameters log-neighbor-changes
   set protocols bgp parameters router-id '1.1.1.1'
   set protocols bgp peer-group RR_VPNv4 remote-as '65001'
   set protocols bgp peer-group RR_VPNv4 update-source 'dum10'

- VyOS-RR2:

.. code-block:: none
   
   set protocols bgp local-as '65001'
   set protocols bgp neighbor 7.7.7.7 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 7.7.7.7 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 8.8.8.8 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 8.8.8.8 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 9.9.9.9 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 9.9.9.9 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 10.10.10.10 address-family ipv4-vpn route-reflector-client
   set protocols bgp neighbor 10.10.10.10 peer-group 'RR_VPNv4'
   set protocols bgp parameters cluster-id '1.1.1.1'
   set protocols bgp parameters default no-ipv4-unicast
   set protocols bgp parameters log-neighbor-changes
   set protocols bgp parameters router-id '2.2.2.2'
   set protocols bgp peer-group RR_VPNv4 remote-as '65001'
   set protocols bgp peer-group RR_VPNv4 update-source 'dum10'

- VyOS-PE1:

.. code-block:: none
   
   set protocols bgp local-as '65001'
   set protocols bgp neighbor 1.1.1.1 address-family ipv4-vpn nexthop-self
   set protocols bgp neighbor 1.1.1.1 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 2.2.2.2 address-family ipv4-vpn nexthop-self
   set protocols bgp neighbor 2.2.2.2 peer-group 'RR_VPNv4'
   set protocols bgp parameters default no-ipv4-unicast
   set protocols bgp parameters log-neighbor-changes
   set protocols bgp parameters router-id '7.7.7.7'
   set protocols bgp peer-group RR_VPNv4 remote-as '65001'
   set protocols bgp peer-group RR_VPNv4 update-source 'dum10'

- VyOS-PE2:

.. code-block:: none
   
   set protocols bgp local-as '65001'
   set protocols bgp neighbor 1.1.1.1 address-family ipv4-vpn nexthop-self
   set protocols bgp neighbor 1.1.1.1 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 2.2.2.2 address-family ipv4-vpn nexthop-self
   set protocols bgp neighbor 2.2.2.2 peer-group 'RR_VPNv4'
   set protocols bgp parameters default no-ipv4-unicast
   set protocols bgp parameters log-neighbor-changes
   set protocols bgp parameters router-id '8.8.8.8'
   set protocols bgp peer-group RR_VPNv4 remote-as '65001'
   set protocols bgp peer-group RR_VPNv4 update-source 'dum10'

- VyOS-PE3:

.. code-block:: none
   
   set protocols bgp local-as '65001'
   set protocols bgp neighbor 1.1.1.1 address-family ipv4-vpn nexthop-self
   set protocols bgp neighbor 1.1.1.1 peer-group 'RR_VPNv4'
   set protocols bgp neighbor 2.2.2.2 address-family ipv4-vpn nexthop-self
   set protocols bgp neighbor 2.2.2.2 peer-group 'RR_VPNv4'
   set protocols bgp parameters default no-ipv4-unicast
   set protocols bgp parameters log-neighbor-changes
   set protocols bgp parameters router-id '10.10.10.10'
   set protocols bgp peer-group RR_VPNv4 remote-as '65001'
   set protocols bgp peer-group RR_VPNv4 update-source 'dum10'



Step-3: Configuring L3VPN VRFs on PE nodes
==========================================

This section provides configuration steps for setting up VRFs on our 
PE nodes including CE facing interfaces, BGP, rd and route-target 
import/export based on the pre-defined parameters.

- VyOS-PE1:

.. code-block:: none
   
   # VRF settings
   set vrf name BLUE_SPOKE table '200'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast export vpn
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast import vpn
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast label vpn export 'auto'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast network 10.50.50.0/24
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast rd vpn export '10.50.50.1:1011'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast redistribute connected
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast route-target vpn export '65035:1011'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast route-target vpn import '65035:1030'
   set vrf name BLUE_SPOKE protocols bgp local-as '65001'
   set vrf name BLUE_SPOKE protocols bgp neighbor 10.50.50.2 address-family ipv4-unicast as-override
   set vrf name BLUE_SPOKE protocols bgp neighbor 10.50.50.2 remote-as '65035'
   
   # interfaces
   set interfaces ethernet eth3 address '10.50.50.1/24'
   set interfaces ethernet eth3 vrf 'BLUE_SPOKE'

- VyOS-PE2:

.. code-block:: none
   
   # VRF settings 
   set vrf name BLUE_HUB table '400'
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast export vpn
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast import vpn
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast label vpn export 'auto'
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast network 10.80.80.0/24
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast rd vpn export '10.80.80.1:1011'
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast redistribute connected
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast route-target vpn export '65035:1030'
   set vrf name BLUE_HUB protocols bgp address-family ipv4-unicast route-target vpn import '65035:1011 65050:2011 65035:1030'
   set vrf name BLUE_HUB protocols bgp local-as '65001'
   set vrf name BLUE_HUB protocols bgp neighbor 10.80.80.2 address-family ipv4-unicast as-override
   set vrf name BLUE_HUB protocols bgp neighbor 10.80.80.2 remote-as '65035'
   
   # interfaces
   set interfaces ethernet eth3 address '10.80.80.1/24'
   set interfaces ethernet eth3 vrf 'BLUE_HUB'

- VyOS-PE3:

.. code-block:: none
   
   # VRF settings
   set vrf name BLUE_SPOKE table '200'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast export vpn
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast import vpn
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast label vpn export 'auto'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast network 10.60.60.0/24
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast rd vpn export '10.60.60.1:1011'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast redistribute connected
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast route-target vpn export '65035:1011'
   set vrf name BLUE_SPOKE protocols bgp address-family ipv4-unicast route-target vpn import '65035:1030'
   set vrf name BLUE_SPOKE protocols bgp local-as '65001'
   set vrf name BLUE_SPOKE protocols bgp neighbor 10.60.60.2 address-family ipv4-unicast as-override
   set vrf name BLUE_SPOKE protocols bgp neighbor 10.60.60.2 remote-as '65035'
   
   # interfaces
   set interfaces ethernet eth3 address '10.60.60.1/24'
   set interfaces ethernet eth3 vrf 'BLUE_SPOKE'



Step-4: Configuring CE nodes
============================

Dynamic routing used between CE and PE nodes and eBGP peering 
established for the route exchanging between them. All routes 
received by PEs are then exported to L3VPN and delivered from 
Spoke sites to Hub and vise-versa based on previously 
configured L3VPN parameters.

- VyOS-CE1-SPOKE:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum20 address '80.80.80.80/32'
   set interfaces ethernet eth0 address '10.50.50.2/24'
   
   # BGP for peering with PE
   set protocols bgp 65035 address-family ipv4-unicast network 80.80.80.80/32
   set protocols bgp 65035 neighbor 10.50.50.1 ebgp-multihop '2'
   set protocols bgp 65035 neighbor 10.50.50.1 remote-as '65001'
   set protocols bgp 65035 neighbor 10.50.50.1 update-source 'eth0'
   set protocols bgp 65035 parameters default no-ipv4-unicast
   set protocols bgp 65035 parameters log-neighbor-changes
   set protocols bgp 65035 parameters router-id '10.50.50.2'

- VyOS-CE1-HUB:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum20 address '100.100.100.100/32'
   set interfaces ethernet eth0 address '10.80.80.2/24'
   
   # BGP for peering with PE
   set protocols bgp 65035 address-family ipv4-unicast network 100.100.100.100/32
   set protocols bgp 65035 address-family ipv4-unicast redistribute connected
   set protocols bgp 65035 neighbor 10.80.80.1 ebgp-multihop '2'
   set protocols bgp 65035 neighbor 10.80.80.1 remote-as '65001'
   set protocols bgp 65035 neighbor 10.80.80.1 update-source 'eth0'
   set protocols bgp 65035 parameters default no-ipv4-unicast
   set protocols bgp 65035 parameters log-neighbor-changes
   set protocols bgp 65035 parameters router-id '10.80.80.2'

- VyOS-CE2-SPOKE:

.. code-block:: none
   
   # interfaces
   set interfaces dummy dum20 address '90.90.90.90/32'
   set interfaces ethernet eth0 address '10.60.60.2/24'
   
   # BGP for peering with PE 
   set protocols bgp 65035 address-family ipv4-unicast network 90.90.90.90/32
   set protocols bgp 65035 neighbor 10.60.60.1 ebgp-multihop '2'
   set protocols bgp 65035 neighbor 10.60.60.1 remote-as '65001'
   set protocols bgp 65035 neighbor 10.60.60.1 update-source 'eth0'
   set protocols bgp 65035 parameters default no-ipv4-unicast
   set protocols bgp 65035 parameters log-neighbor-changes
   set protocols bgp 65035 parameters router-id '10.60.60.2'



Step-5: Verification
====================

This section describes verification commands for MPLS/BGP/LDP 
protocols and L3VPN related routes as well as diagnosis and 
reachability checks between CE nodes.

Let’s check IPv4 routing and MPLS information on provider nodes 
(same procedure for all P nodes):

- “show ip ospf neighbor” for checking ospf relationship

.. code-block:: none
   
   vyos@VyOS-P1:~$  show ip ospf neighbor
   
   Neighbor ID 	Pri State       	Dead Time Address     	Interface            RXmtL RqstL DBsmL
   4.4.4.4       	1 Full/Backup   	34.718s   172.16.30.2 	eth0:172.16.30.1       0 	  0 	  0
   5.5.5.5       	1 Full/Backup   	35.132s   172.16.40.2 	eth1:172.16.40.1       0 	  0 	  0
   7.7.7.7       	1 Full/Backup   	34.764s   172.16.90.2 	eth2:172.16.90.1       0 	  0 	  0
   1.1.1.1       	1 Full/Backup   	35.642s   172.16.10.2 	eth3:172.16.10.1       0 	  0 	  0
   8.8.8.8       	1 Full/Backup   	35.484s   172.16.100.2	eth5:172.16.100.1      0 	  0     0

- “show mpls ldp neighbor “ for checking ldp neighbors

.. code-block:: none
   
   vyos@VyOS-P1:~$ show mpls ldp neighbor
   AF   ID          	State   	   Remote Address	Uptime
   ipv4 1.1.1.1     	OPERATIONAL 1.1.1.1     	07w5d06h
   ipv4 4.4.4.4     	OPERATIONAL 4.4.4.4     	09w3d00h
   ipv4 5.5.5.5     	OPERATIONAL 5.5.5.5     	09w2d23h
   ipv4 7.7.7.7     	OPERATIONAL 7.7.7.7     	03w0d01h
   ipv4 8.8.8.8     	OPERATIONAL 8.8.8.8     	01w3d02h

- “show mpls ldp binding” for checking mpls label assignment

.. code-block:: none
   
   vyos@VyOS-P1:~$ show mpls ldp discovery
   AF   Destination      	Nexthop     	Local    Label Remote Label  In Use
   ipv4 1.1.1.1/32       	1.1.1.1     	23      	      imp-null     	yes
   ipv4 1.1.1.1/32       	4.4.4.4     	23      	      20            	no
   ipv4 1.1.1.1/32       	5.5.5.5     	23      	      17            	no
   ipv4 1.1.1.1/32       	7.7.7.7     	23      	      16            	no
   ipv4 1.1.1.1/32       	8.8.8.8     	23      	      16            	no
   ipv4 2.2.2.2/32       	1.1.1.1     	20      	      16            	no
   ipv4 2.2.2.2/32       	4.4.4.4     	20      	      22            	no
   ipv4 2.2.2.2/32       	5.5.5.5     	20      	      24           	yes
   ipv4 2.2.2.2/32       	7.7.7.7     	20      	      17            	no
   ipv4 2.2.2.2/32       	8.8.8.8     	20      	      17            	no
   ipv4 3.3.3.3/32       	1.1.1.1     	imp-null	      17            	no
   ipv4 3.3.3.3/32       	4.4.4.4     	imp-null	      16            	no
   ipv4 3.3.3.3/32       	5.5.5.5     	imp-null	      18            	no
   ipv4 3.3.3.3/32       	7.7.7.7     	imp-null	      18            	no
   ipv4 3.3.3.3/32       	8.8.8.8     	imp-null	      18            	no
   ipv4 4.4.4.4/32       	1.1.1.1     	16      	      18            	no
   ipv4 4.4.4.4/32       	4.4.4.4     	16      	      imp-null     	yes
   ipv4 4.4.4.4/32       	5.5.5.5     	16      	      19            	no
   ipv4 4.4.4.4/32       	7.7.7.7     	16      	      19            	no
   ipv4 4.4.4.4/32       	8.8.8.8     	16      	      19            	no
   ipv4 5.5.5.5/32       	1.1.1.1     	21      	      19            	no
   ipv4 5.5.5.5/32       	4.4.4.4     	21      	      17            	no
   ipv4 5.5.5.5/32       	5.5.5.5     	21      	      imp-null     	yes
   ipv4 5.5.5.5/32       	7.7.7.7     	21      	      20            	no
   ipv4 5.5.5.5/32       	8.8.8.8     	21      	      20            	no
   ipv4 6.6.6.6/32       	1.1.1.1     	17      	      20            	no
   ipv4 6.6.6.6/32       	4.4.4.4     	17      	      23           	yes
   ipv4 6.6.6.6/32       	5.5.5.5     	17      	      21           	yes
   ipv4 6.6.6.6/32       	7.7.7.7     	17      	      21            	no
   ipv4 6.6.6.6/32       	8.8.8.8     	17      	      21            	no
   ipv4 7.7.7.7/32       	1.1.1.1     	22      	      21            	no
   ipv4 7.7.7.7/32       	4.4.4.4     	22      	      18            	no
   ipv4 7.7.7.7/32       	5.5.5.5     	22      	      20            	no
   ipv4 7.7.7.7/32       	7.7.7.7     	22      	      imp-null     	yes
   ipv4 7.7.7.7/32       	8.8.8.8     	22      	      22            	no
   ipv4 8.8.8.8/32       	1.1.1.1     	24      	      22            	no
   ipv4 8.8.8.8/32       	4.4.4.4     	24      	      19            	no
   ipv4 8.8.8.8/32       	5.5.5.5     	24      	      16            	no
   ipv4 8.8.8.8/32       	7.7.7.7     	24      	      22            	no
   ipv4 8.8.8.8/32       	8.8.8.8     	24      	      imp-null     	yes
   ipv4 9.9.9.9/32       	1.1.1.1     	18      	      23            	no
   ipv4 9.9.9.9/32       	4.4.4.4     	18      	      21           	yes
   ipv4 9.9.9.9/32       	5.5.5.5     	18      	      22            	no
   ipv4 9.9.9.9/32       	7.7.7.7     	18      	      23            	no
   ipv4 9.9.9.9/32       	8.8.8.8     	18      	      23            	no
   ipv4 10.10.10.10/32   	1.1.1.1     	19      	      24            	no
   ipv4 10.10.10.10/32   	4.4.4.4     	19      	      24           	yes
   ipv4 10.10.10.10/32   	5.5.5.5     	19      	      23           	yes
   ipv4 10.10.10.10/32   	7.7.7.7     	19      	      24            	no
   ipv4 10.10.10.10/32   	8.8.8.8     	19      	      24            	no
   
Now we’re checking iBGP status and routes from route-reflector 
nodes to other devices:

- “show bgp ipv4 vpn summary” for checking BGP VPNv4 neighbors:

.. code-block:: none
   
   vyos@VyOS-RR1:~$ show bgp ipv4 vpn summary
   BGP router identifier 1.1.1.1, local AS number 65001 vrf-id 0
   BGP table version 0
   RIB entries 9, using 1728 bytes of memory
   Peers 4, using 85 KiB of memory
   Peer groups 1, using 64 bytes of memory
   
   Neighbor    	V     	AS   MsgRcvd   MsgSent   TblVer  InQ OutQ  Up/Down State/PfxRcd   PfxSnt
   7.7.7.7     	4  	65001  	7719  	7733    	      0	   0	0   5d07h56m        	2   	10
   8.8.8.8     	4  	65001  	7715  	7724    	      0	   0	0   5d08h28m        	4   	10
   9.9.9.9     	4  	65001  	7713  	7724    	      0	   0	0   5d08h28m        	2   	10
   10.10.10.10 	4  	65001  	7713  	7724    	      0	   0	0   5d08h28m        	2   	10
   
   Total number of neighbors 4

- “show bgp ipv4 vpn”  for checking all VPNv4 prefixes information: 

.. code-block:: none
   
   vyos@VyOS-RR1:~$ show bgp ipv4 vpn
   BGP table version is 2, local router ID is 1.1.1.1, vrf id 0
   Default local pref 100, local AS 65001
   Status codes:  s suppressed, d damped, h history, * valid, > best, = multipath,
              	i internal, r RIB-failure, S Stale, R Removed
   Nexthop codes: @NNN nexthop's vrf id, < announce-nh-self
   Origin codes:  i - IGP, e - EGP, ? - incomplete
   
      Network      	Next Hop        	Metric LocPrf Weight Path
   Route Distinguisher: 10.50.50.1:1011
   *>i10.50.50.0/24	7.7.7.7              	0	100  	0 i
   	UN=7.7.7.7 EC{65035:1011} label=80 type=bgp, subtype=0
   *>i80.80.80.80/32   7.7.7.7              	0	100  	0 65035 i
   	UN=7.7.7.7 EC{65035:1011} label=80 type=bgp, subtype=0
   Route Distinguisher: 10.60.60.1:1011
   *>i10.60.60.0/24	10.10.10.10          	0	100  	0 i
   	UN=10.10.10.10 EC{65035:1011} label=80 type=bgp, subtype=0
   *>i90.90.90.90/32   10.10.10.10          	0	100  	0 65035 i
   	UN=10.10.10.10 EC{65035:1011} label=80 type=bgp, subtype=0
   Route Distinguisher: 10.80.80.1:1011
   *>i10.80.80.0/24	8.8.8.8              	0	100  	0 i
   	UN=8.8.8.8 EC{65035:1030} label=80 type=bgp, subtype=0
   *>i100.100.100.100/32
                   	8.8.8.8              	0	100  	0 65035 i
   	UN=8.8.8.8 EC{65035:1030} label=80 type=bgp, subtype=0
   Route Distinguisher: 172.16.80.1:2011
   *>i10.110.110.0/24  8.8.8.8              	0	100  	0 65050 i
   	UN=8.8.8.8 EC{65050:2011} label=81 type=bgp, subtype=0
   *>i172.16.80.0/24   8.8.8.8              	0	100  	0 i
   	UN=8.8.8.8 EC{65050:2011} label=81 type=bgp, subtype=0
   Route Distinguisher: 172.16.100.1:2011
   *>i10.210.210.0/24  9.9.9.9              	0	100  	0 65050 i
   	UN=9.9.9.9 EC{65050:2011} label=80 type=bgp, subtype=0
   *>i172.16.100.0/24  9.9.9.9              	0	100  	0 i
   	UN=9.9.9.9 EC{65050:2011} label=80 type=bgp, subtype=0

- “show bgp ipv4 vpn x.x.x.x/x” for checking best path selected 
  for specific VPNv4 destination

.. code-block:: none
   
   vyos@VyOS-RR1:~$ show bgp  ipv4 vpn 100.100.100.100/32
   BGP routing table entry for 10.80.80.1:1011:100.100.100.100/32
   not allocated
   Paths: (1 available, best #1)
     Advertised to non peer-group peers:
     7.7.7.7 8.8.8.8 9.9.9.9 10.10.10.10
     65035, (Received from a RR-client)
   	8.8.8.8 from 8.8.8.8 (8.8.8.8)
     	Origin incomplete, metric 0, localpref 100, valid, internal, best (First path received)
     	Extended Community: RT:65035:1030
     	Remote label: 80
     	Last update: Tue Oct 19 13:45:32 202
   
Also we can verify how PE devices receives VPNv4 networks from the RRs 
and installing them to the specific customer VRFs:

- “show bgp ipv4 vpn summary” for checking iBGP neighbors against 
  route-reflector devices:

.. code-block:: none
   
