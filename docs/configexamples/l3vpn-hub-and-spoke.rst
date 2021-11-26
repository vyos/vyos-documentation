
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




