.. _static-routing:

######
Static
######

Static routes are manually configured routes, which, in general, cannot be
updated dynamically from information VyOS learns about the network topology from
other routing protocols. However, if a link fails, the router will remove
routes, including static routes, from the :abbr:`RIPB (Routing Information
Base)` that used this interface to reach the next hop. In general, static
routes should only be used for very simple network topologies, or to override
the behavior of a dynamic routing protocol for a small number of routes. The
collection of all routes the router has learned from its configuration or from
its dynamic routing protocols is stored in the RIB. Unicast routes are directly
used to determine the forwarding table used for unicast packet forwarding.

Static Routes
#############

.. cfgcmd:: set protocols static route <subnet> next-hop <address>

   Configure next-hop `<address>` for an IPv4 static route. Multiple static
   routes can be created.

.. cfgcmd:: set protocols static route <subnet> next-hop <address> disable

   Disable this IPv4 static route entry.

.. cfgcmd:: set protocols static route <subnet> next-hop <address> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

   .. note:: Routes with a distance of 255 are effectively disabled and not
      installed into the kernel.

.. cfgcmd:: set protocols static route6 <subnet> next-hop <address>

   Configure next-hop `<address>` for an IPv6 static route. Multiple static
   routes can be created.

.. cfgcmd:: set protocols static route6 <subnet> next-hop <address> disable

   Disable this IPv6 static route entry.

.. cfgcmd:: set protocols static route6 <subnet> next-hop <address> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

   .. note:: Routes with a distance of 255 are effectively disabled and not
      installed into the kernel.


Interface Routes
================

.. cfgcmd:: set protocols static interface-route <subnet> next-hop-interface <interface>

   Allows you to configure the next-hop interface for an interface-based IPv4
   static route. `<interface>` will be the next-hop interface where trafic is
   routed for the given `<subnet>`.

.. cfgcmd:: set protocols static interface-route <subnet> next-hop-interface <interface> disable

   Disables interface-based IPv4 static route.

.. cfgcmd:: set protocols static interface-route <subnet> next-hop-interface <interface> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.

.. cfgcmd:: set protocols static interface-route6 <subnet> next-hop-interface <interface>

   Allows you to configure the next-hop interface for an interface-based IPv6
   static route. `<interface>` will be the next-hop interface where trafic is
   routed for the given `<subnet>`.

.. cfgcmd:: set protocols static interface-route6 <subnet> next-hop-interface <interface> disable

   Disables interface-based IPv6 static route.

.. cfgcmd:: set protocols static interface-route6 <subnet> next-hop-interface <interface> distance <distance>

   Defines next-hop distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

   Range is 1 to 255, default is 1.


Blackhole
=========

.. cfgcmd:: set protocols static route <subnet> blackhole

   Use this command to configure a "black-hole" route on the router. A
   black-hole route is a route for which the system silently discard packets
   that are matched. This prevents networks leaking out public interfaces, but
   it does not prevent them from being used as a more specific route inside your
   network.

.. cfgcmd:: set protocols static route <subnet> blackhole distance <distance>

   Defines blackhole distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.

.. cfgcmd:: set protocols static route6 <subnet> blackhole

   Use this command to configure a "black-hole" route on the router. A
   black-hole route is a route for which the system silently discard packets
   that are matched. This prevents networks leaking out public interfaces, but
   it does not prevent them from being used as a more specific route inside your
   network.

.. cfgcmd:: set protocols static route6 <subnet> blackhole distance <distance>

   Defines blackhole distance for this route, routes with smaller administrative
   distance are elected prior those with a higher distance.


Alternate Routing Tables
========================

TBD

Alternate routing tables are used with policy based routing of by utilizing
:ref:`vrf`.
