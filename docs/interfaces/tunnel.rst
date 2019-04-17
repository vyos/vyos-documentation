.. _interfaces-tunnel:

Tunnel Interfaces
=================

This article touches on 'classic' IP tunneling protocols.

GRE is often seen as a one size fits all solution when it comes to classic IP tunneling protocols, and for a good reason.
However, there are more specialized options, and many of them are supported by VyOS. There are also rather obscure GRE options that can be useful.

All those protocols are grouped under 'interfaces tunnel' in VyOS. Let's take a closer look at the protocols and options currently supported by VyOS.

IPIP
----

This is the simplest tunneling protocol in existence. It is defined by RFC2003_.
It simply takes an IPv4 packet and sends it as a payload of another IPv4 packet. For this reason it doesn't really have any configuration options by itself.

An example:

.. code-block:: sh

  set interfaces tunnel tun0 encapsulation ipip
  set interfaces tunnel tun0 local-ip 192.0.2.10
  set interfaces tunnel tun0 remote-ip 203.0.113.20
  set interfaces tunnel tun0 address 192.168.100.200

IP6IP6
------

This is the IPv6 counterpart of IPIP. I'm not aware of an RFC that defines this encapsulation specifically, but it's a natural specific case of IPv6 encapsulation mechanisms described in RFC2473_.

It's not likely that anyone will need it any time soon, but it does exist.

An example:

.. code-block:: sh

  set interfaces tunnel tun0 encapsulation ipip
  set interfaces tunnel tun0 local-ip 2001:db8:aa::1/64
  set interfaces tunnel tun0 remote-ip 2001:db8:aa::2/64
  set interfaces tunnel tun0 address 2001:db8:bb::1/64

IPIP6
-----

In the future this is expected to be a very useful protocol (though there are `other proposals`_).

As the name implies, it's IPv4 encapsulated in IPv6, as simple as that.

An example:

.. code-block:: sh

  set interfaces tunnel tun0 encapsulation ipip6
  set interfaces tunnel tun0 local-ip 2001:db8:aa::1/64
  set interfaces tunnel tun0 remote-ip 2001:db8:aa::2/64
  set interfaces tunnel tun0 address 192.168.70.80

6in4 (SIT)
----------


6in4 uses tunneling to encapsulate IPv6 traffic over IPv4 links as defined in RFC4213_.
The 6in4 traffic is sent over IPv4 inside IPv4 packets whose IP headers have the IP protocol number set to 41.
This protocol number is specifically designated for IPv6 encapsulation, the IPv4 packet header is immediately followed by the IPv6 packet being carried.
qThe encapsulation overhead is the size of the IPv4 header of 20 bytes, therefore with an MTU of 1500 bytes, IPv6 packets of 1480 bytes can be sent without fragmentation. This tunneling technique is frequently used by IPv6 tunnel brokers like `Hurricane Electric`_.

An example:

.. code-block:: sh

  set interfaces tunnel tun0 encapsulation sit
  set interfaces tunnel tun0 local-ip 192.0.2.10
  set interfaces tunnel tun0 remote-ip 192.0.2.20
  set interfaces tunnel tun0 address 2001:db8:bb::1/64

Generic Routing Encapsulation (GRE)
-----------------------------------

A GRE tunnel operates at layer 3 of the OSI model and is repsented by IP protocol 47.  The 
main benefit of a GRE tunnel is that you are able to route traffic across disparate networks.  
GRE also supports multicast traffic and supports routing protocols that leverage multicast to 
form neighbor adjacencies.

Configuration
^^^^^^^^^^^^^

A basic configuration requires a tunnel source (local-ip), a tunnel destination (remote-ip), 
an encapsulation type (gre), and an address (ipv4/ipv6).  Below is a configuration example 
taken from a VyOS router and a Cisco IOS router.  The main difference between these two 
configurations is that VyOS requires you explicitly configure the encapsulation type.  
The Cisco router defaults to 'gre ip' otherwise it would have to be configured as well.

**VyOS Router:**

.. code-block:: sh

  set interfaces tunnel tun100 address '10.0.0.1/30'
  set interfaces tunnel tun100 encapsulation 'gre'
  set interfaces tunnel tun100 local-ip '198.18.0.2'
  set interfaces tunnel tun100 remote-ip '198.18.2.2'

**Cisco IOS Router:**

.. code-block:: sh

  interface Tunnel100
  ip address 10.0.0.2 255.255.255.252
  tunnel source 198.18.2.2
  tunnel destination 198.18.0.2

Troubleshooting
^^^^^^^^^^^^^^^

GRE is a well defined standard that is common in most networks.  While not inherently difficult 
to configure there are a couple of things to keep in mind to make sure the configuration performs 
as expected.  A common cause for GRE tunnels to fail to come up correctly include ACL or Firewall 
configurations that are discarding IP protocol 47 or blocking your source/desintation traffic.

**1. Confirm IP connectivity between tunnel local-ip and remote-ip:**

.. code-block:: sh

  vyos@vyos:~$ ping 198.18.2.2 interface 198.18.0.2 count 4
  PING 198.18.2.2 (198.18.2.2) from 198.18.0.2 : 56(84) bytes of data.
  64 bytes from 198.18.2.2: icmp_seq=1 ttl=254 time=0.807 ms
  64 bytes from 198.18.2.2: icmp_seq=2 ttl=254 time=1.50 ms
  64 bytes from 198.18.2.2: icmp_seq=3 ttl=254 time=0.624 ms
  64 bytes from 198.18.2.2: icmp_seq=4 ttl=254 time=1.41 ms

  --- 198.18.2.2 ping statistics ---
  4 packets transmitted, 4 received, 0% packet loss, time 3007ms
  rtt min/avg/max/mdev = 0.624/1.087/1.509/0.381 ms

**2. Confirm the link type has been set to GRE:**

.. code-block:: sh

  vyos@vyos:~$ show interfaces tunnel tun100
  tun100@NONE: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1476 qdisc noqueue state UNKNOWN group default qlen 1000
    link/gre 198.18.0.2 peer 198.18.2.2
    inet 10.0.0.1/30 brd 10.0.0.3 scope global tun100
       valid_lft forever preferred_lft forever
    inet6 fe80::5efe:c612:2/64 scope link
       valid_lft forever preferred_lft forever

    RX:  bytes    packets     errors    dropped    overrun      mcast
          2183         27          0          0          0          0
    TX:  bytes    packets     errors    dropped    carrier collisions
           836          9          0          0          0          0

**3. Confirm IP connectivity across the tunnel:**

.. code-block:: sh

  vyos@vyos:~$ ping 10.0.0.2 interface 10.0.0.1 count 4
  PING 10.0.0.2 (10.0.0.2) from 10.0.0.1 : 56(84) bytes of data.
  64 bytes from 10.0.0.2: icmp_seq=1 ttl=255 time=1.05 ms
  64 bytes from 10.0.0.2: icmp_seq=2 ttl=255 time=1.88 ms
  64 bytes from 10.0.0.2: icmp_seq=3 ttl=255 time=1.98 ms
  64 bytes from 10.0.0.2: icmp_seq=4 ttl=255 time=1.98 ms

  --- 10.0.0.2 ping statistics ---
  4 packets transmitted, 4 received, 0% packet loss, time 3008ms
  rtt min/avg/max/mdev = 1.055/1.729/1.989/0.395 ms

Virtual Tunnel Interface (VTI)
------------------------------

Set Virtual Tunnel Interface

.. code-block:: sh

  set interfaces vti vti0 address 192.168.2.249/30
  set interfaces vti vti0 address 2001:db8:2::249/64

Results in:

.. code-block:: sh

  vyos@vyos# show interfaces vti
  vti vti0 {
      address 192.168.2.249/30
      address 2001:db8:2::249/64
      description "Description"
  }


.. _RFC2003: https://tools.ietf.org/html/rfc2003
.. _RFC2473: https://tools.ietf.org/html/rfc2473
.. _`other proposals`: https://www.isc.org/downloads/aftr
.. _RFC4213: https://tools.ietf.org/html/rfc4213
.. _`Hurricane Electric`: https://tunnelbroker.net/