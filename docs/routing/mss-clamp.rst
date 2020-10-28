.. _routing-mss-clamp:

################
TCP-MSS Clamping
################

As Internet wide PMTU discovery rarely works, we sometimes need to clamp
our TCP MSS value to a specific value. This is a field in the TCP
Options part of a SYN packet. By setting the MSS value, you are telling
the remote side unequivocally 'do not try to send me packets bigger than
this value'.

Starting with VyOS 1.2 there is a firewall option to clamp your TCP MSS
value for IPv4 and IPv6.


.. note:: MSS value = MTU - 20 (IP header) - 20 (TCP header), resulting
   in 1452 bytes on a 1492 byte MTU.


IPv4
====

.. cfgcmd:: set firewall options interface <interface> adjust-mss <number-of-bytes>

   Use this command to set the maximum segment size for IPv4 transit
   packets on a specific interface (500-1460 bytes).

Example
-------

Clamp outgoing MSS value in a TCP SYN packet to `1452` for `pppoe0` and
`1372`
for your WireGuard `wg02` tunnel.

.. code-block:: none

  set firewall options interface pppoe0 adjust-mss '1452'
  set firewall options interface wg02 adjust-mss '1372'

IPv6
====

.. cfgcmd:: set firewall options interface <interface> adjust-mss6 <number-of-bytes>

   Use this command to set the maximum segment size for IPv6 transit
   packets on a specific interface (1280-1492 bytes).

Example
-------

Clamp outgoing MSS value in a TCP SYN packet to `1280` for both `pppoe0` and
`wg02` interface.

.. code-block:: none

  set firewall options interface pppoe0 adjust-mss6 '1280'
  set firewall options interface wg02 adjust-mss6 '1280'



.. hint:: When doing your byte calculations, you might find useful this
   `Visual packet size calculator <https://baturin.org/tools/encapcalc/>`_.
