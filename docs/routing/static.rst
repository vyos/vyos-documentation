.. _routing-static:

Static
------

Static routes are manually configured network routes.

A typical use for a static route is a static default route for systems that do
not make use of DHCP or dynamic routing protocols:

.. code-block:: sh

  set protocols static route 0.0.0.0/0 next-hop 10.1.1.1 distance '1'

Another common use of static routes is to blackhole (drop) traffic. In the
example below, RFC 1918 private IP networks are set as blackhole routes. This
does not prevent networks within these segments from being used, since the
most specific route is always used. It does, however, prevent traffic to
unknown private networks from leaving the router. Commonly refereed to as
leaking.

.. code-block:: sh

  set protocols static route 10.0.0.0/8 blackhole distance '254'
  set protocols static route 172.16.0.0/12 blackhole distance '254'
  set protocols static route 192.168.0.0/16 blackhole distance '254'

.. note:: Routes with a distance of 255 are effectively disabled and not
   installed into the kernel.
