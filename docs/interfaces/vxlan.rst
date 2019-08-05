VXLAN
-----

VXLAN is an overlaying Ethernet over IP protocol.
It is described in RFC7348_.

If configuring VXLAN in a VyOS virtual machine, ensure that MAC spoofing
(Hyper-V) or Forged Transmits (ESX) are permitted, otherwise forwarded frames
may be blocked by the hypervisor.

Multicast VXLAN
^^^^^^^^^^^^^^^^

Example Topology:

PC4 - Leaf2 - Spine1 - Leaf3 - PC5

PC4 has IP 10.0.0.4/24 and PC5 has IP 10.0.0.5/24, so they believe they are in
the same broadcast domain.

Let's assume PC4 on Leaf2 wants to ping PC5 on Leaf3. Instead of setting Leaf3
as our remote end manually, Leaf2 encapsulates the packet into a UDP-packet and
sends it to its designated multicast-address via Spine1. When Spine1 receives
this packet it forwards it to all other Leafs who has joined the same
multicast-group, in this case Leaf3. When Leaf3 receives the packet it forwards
it, while at the same time learning that PC4 is reachable behind Leaf2, because
the encapsulated packet had Leaf2's IP-address set as source IP.

PC5 receives the ping echo, responds with an echo reply that Leaf3 receives and
this time forwards to Leaf2's unicast address directly because it learned the
location of PC4 above. When Leaf2 receives the echo reply from PC5 it sees that
it came from Leaf3 and so remembers that PC5 is reachable via Leaf3.

Thanks to this discovery, any subsequent traffic between PC4 and PC5 will not
be using the multicast-address between the Leafs as they both know behind which
Leaf the PCs are connected. This saves traffic as less multicast packets sent
reduces the load on the network, which improves scalability when more Leafs are
added.

For optimal scalability Multicast shouldn't be used at all, but instead use BGP
to signal all connected devices between leafs. Unfortunately, VyOS does not yet
support this.

Configuration commands
^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: sh

  interfaces
    vxlan <vxlan[0-16777215]>
      address          # IP address of the VXLAN interface
      description      # Description
      group <ipv4>     # IPv4 Multicast group address (required)
      ip               # IPv4 routing options
      ipv6             # IPv6 routing options
      link <dev>       # IP interface for underlay of this vxlan overlay (optional)
      mtu              # MTU
      policy           # Policy routing options
      remote           # Remote address of the VXLAN tunnel, used for PTP instead of multicast
      vni <1-16777215> # Virtual Network Identifier (required)

Configuration Example
^^^^^^^^^^^^^^^^^^^^^

The setup is this:

Leaf2 - Spine1 - Leaf3

Spine1 is a Cisco IOS router running version 15.4, Leaf2 and Leaf3 is each a
VyOS router running 1.2.

This topology was built using GNS3.

Topology:

.. code-block:: sh

  Spine1:
  fa0/2 towards Leaf2, IP-address: 10.1.2.1/24
  fa0/3 towards Leaf3, IP-address: 10.1.3.1/24

  Leaf2:
  Eth0 towards Spine1, IP-address: 10.1.2.2/24
  Eth1 towards a vlan-aware switch

  Leaf3:
  Eth0 towards Spine1, IP-address 10.1.3.3/24
  Eth1 towards a vlan-aware switch

Spine1 Configuration:

.. code-block:: sh

  conf t
  ip multicast-routing
  !
  interface fastethernet0/2
   ip address 10.1.2.1 255.255.255.0
   ip pim sparse-dense-mode
  !
  interface fastethernet0/3
   ip address 10.1.3.1 255.255.255.0
   ip pim sparse-dense-mode
  !
  router ospf 1
   network 10.0.0.0 0.255.255.255 area 0

Multicast-routing is required for the leafs to forward traffic between each
other in a more scalable way. This also requires PIM to be enabled towards the
Leafs so that the Spine can learn what multicast groups each Leaf expect traffic
from.

Leaf2 configuration:

.. code-block:: sh

  set interfaces ethernet eth0 address '10.1.2.2/24'
  set protocols ospf area 0 network '10.0.0.0/8'

  ! Our first vxlan interface
  set interfaces bridge br241 address '172.16.241.1/24'
  set interfaces bridge br241 member interface 'eth1.241'
  set interfaces bridge br241 member interface 'vxlan241'

  set interfaces vxlan vxlan241 group '239.0.0.241'
  set interfaces vxlan vxlan241 link 'eth0'
  set interfaces vxlan vxlan241 vni '241'

  ! Our seconds vxlan interface
  set interfaces bridge br242 address '172.16.242.1/24'
  set interfaces bridge br242 member interface 'eth1.242'
  set interfaces bridge br242 member interface 'vxlan242'

  set interfaces vxlan vxlan242 group '239.0.0.242'
  set interfaces vxlan vxlan242 link 'eth0'
  set interfaces vxlan vxlan242 vni '242'

Leaf3 configuration:

.. code-block:: sh

  set interfaces ethernet eth0 address '10.1.3.3/24'
  set protocols ospf area 0 network '10.0.0.0/8'

  ! Our first vxlan interface
  set interfaces bridge br241 address '172.16.241.1/24'
  set interfaces bridge br241 member interface 'eth1.241'
  set interfaces bridge br241 member interface 'vxlan241'

  set interfaces vxlan vxlan241 group '239.0.0.241'
  set interfaces vxlan vxlan241 link 'eth0'
  set interfaces vxlan vxlan241 vni '241'

  ! Our seconds vxlan interface
  set interfaces bridge br242 address '172.16.242.1/24'
  set interfaces bridge br242 member interface 'eth1.242'
  set interfaces bridge br242 member interface 'vxlan242'

  set interfaces vxlan vxlan242 group '239.0.0.242'
  set interfaces vxlan vxlan242 link 'eth0'
  set interfaces vxlan vxlan242 vni '242'

As you can see, Leaf2 and Leaf3 configuration is almost identical. There are
lots of commands above, I'll try to into more detail below, command
descriptions are placed under the command boxes:

.. code-block:: sh

  set interfaces bridge br241 address '172.16.241.1/24'

This commands creates a bridge that is used to bind traffic on eth1 vlan 241
with the vxlan241-interface. The IP-address is not required. It may however be
used as a default gateway for each Leaf which allows devices on the vlan to
reach other subnets. This requires that the subnets are redistributed by OSPF
so that the Spine will learn how to reach it. To do this you need to change the
OSPF network from '10.0.0.0/8' to '0.0.0.0/0' to allow 172.16/12-networks to be
advertised.

.. code-block:: sh

  set interfaces bridge br241 member interface 'eth1.241'
  set interfaces bridge br241 member interface 'vxlan241'

Binds eth1.241 and vxlan241 to each other by making them both member interfaces of
the same bridge.

.. code-block:: sh

  set interfaces vxlan vxlan241 group '239.0.0.241'

The multicast-group used by all Leafs for this vlan extension. Has to be the
same on all Leafs that has this interface.

.. code-block:: sh

  set interfaces vxlan vxlan241 link 'eth0'

Sets the interface to listen for multicast packets on. Could be a loopback, not
yet tested.

.. code-block:: sh

  set interfaces vxlan vxlan241 vni '241'

Sets the unique id for this vxlan-interface. Not sure how it correlates with
multicast-address.

.. code-block:: sh

  set interfaces vxlan vxlan241 remote-port 12345

The destination port used for creating a VXLAN interface in Linux defaults to
its pre-standard value of 8472 to preserve backwards compatibility. A
configuration directive to support a user-specified destination port to override
that behavior is available using the above command.

Older Examples
^^^^^^^^^^^^^^

Example for bridging normal L2 segment and vxlan overlay network, and using a
vxlan interface as routing interface.

.. code-block:: sh

  interfaces {
       bridge br0 {
           member {
               interface vxlan0 {
               }
           }
       }
       ethernet eth0 {
           address dhcp
       }
       loopback lo {
       }
       vxlan vxlan0 {
           group 239.0.0.1
           vni 0
       }
       vxlan vxlan1 {
           address 192.168.0.1/24
           link eth0
           group 239.0.0.1
           vni 1
       }
  }

Here is a working configuration that creates a VXLAN between two routers. Each
router has a VLAN interface (26) facing the client devices and a VLAN interface
(30) that connects it to the other routers. With this configuration, traffic
can flow between both routers' VLAN 26, but can't escape since there is no L3
gateway. You can add an IP to a bridge to create a gateway.

.. code-block:: sh

  interfaces {
       bridge br0 {
           member {
               interface eth0.26 {
               }
               interface vxlan0 {
               }
           }
       }
       ethernet eth0 {
           duplex auto
           smp-affinity auto
           speed auto
           vif 30 {
               address 10.7.50.6/24
           }
       }
       loopback lo {
       }
       vxlan vxlan0 {
           group 239.0.0.241
           vni 241
       }
  }

Unicast VXLAN
^^^^^^^^^^^^^

Alternative to multicast, the remote IPv4 address of the VXLAN tunnel can set directly.
Let's change the Multicast example from above:


.. code-block:: sh

  # leaf2 and leaf3
  delete interfaces vxlan vxlan241 group '239.0.0.241'
  delete interfaces vxlan vxlan241 link 'eth0'

  # leaf2
  set interface vxlan vxlan241 remote 10.1.3.3

  # leaf3
  set interface vxlan vxlan241 remote 10.1.2.2

The default port udp is set to 8472. 
It can be changed with ``set interface vxlan <vxlanN> remote-port <port>``


.. target-notes::

.. _RFC7348: https://datatracker.ietf.org/doc/rfc7348/
