.. _interfaces-tunnel:

Tunnel Interfaces
=================

Generic Routing Encapsulation (GRE)
-----------------------------------

A GRE tunnel requires a tunnel source (local-ip), a tunnel destination (remote-ip), 
an encapsulation type (gre), and an address (ipv4/ipv6).  Below is a configuration example 
taken from a VyOS router and a Cisco IOS router.

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

The main difference between these two configurations is that VyOS requires you explicitly 
configure your encapsulation type.  The Cisco router defaults to 'gre ip'.


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
