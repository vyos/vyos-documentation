.. _routing-mss-clamp:

TCP-MSS Clamping
----------------

As Internet wide PMTU discovery rarely works we sometimes need to clamp our TCP
MSS value to a specific value. Starting with VyOS 1.2 there is a firewall option
to clamp your TCP MSS value for IPv4 and IPv6.

Clamping can be disabled per interface using the `disable` keyword:

.. code-block:: sh

  set firewall options interface pppoe0 disable

IPv4
^^^^

Clamp outgoing MSS value in a TCP SYN packet to `1452` for `pppoe0` and `1372`
for your WireGuard `wg02` tunnel.

.. code-block:: sh

  set firewall options interface pppoe0 adjust-mss '1452'
  set firewall options interface wg02 adjust-mss '1372'

IPv6
^^^^^

Clamp outgoing MSS value in a TCP SYN packet to `1280` for both `pppoe0` and
`wg02` interface.

To achieve the same for IPv6 please use:

.. code-block:: sh

  set firewall options interface pppoe0 adjust-mss6 '1280'
  set firewall options interface wg02 adjust-mss6 '1280'

.. note:: MSS value = MTU - 20 (IP header) - 20 (TCP header), resulting in 1452
          bytes on a 1492 byte MTU.
