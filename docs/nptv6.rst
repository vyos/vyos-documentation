.. include:: _include/need_improvement.txt

.. _nptv6:

#####
NPTv6
#####

:abbr:`NPTv6 (Network Prefix Translation)` is a form of NAT for IPv6. It's
described in :rfc:`6296`.

**Usage**

NPTv6 is very useful for IPv6 multihoming. It is also commonly used when the
external IPv6 prefix is dynamic, as it prevents the need for renumbering of
internal hosts when the extern prefix changes.

Let's assume the following network configuration:

* eth0 : LAN
* eth1 : WAN1, with 2001:db8:e1::/48 routed towards it
* eth2 : WAN2, with 2001:db8:e2::/48 routed towards it

Regarding LAN hosts addressing, why would you choose 2001:db8:e1::/48 over
2001:db8:e2::/48? What happens when you get a new provider with a different
routed IPv6 subnet?

The solution here is to assign to your hosts ULAs_ and to prefix-translate
their address to the right subnet when going through your router.

* LAN Subnet : fc00:dead:beef::/48
* WAN 1 Subnet : 2001:db8:e1::/48
* WAN 2 Subnet : 2001:db8:e2::/48

* eth0 addr : fc00:dead:beef::1/48
* eth1 addr : 2001:db8:e1::1/48
* eth2 addr : 2001:db8:e2::1/48

VyOS Support
^^^^^^^^^^^^

NPTv6 support has been added in VyOS 1.2 (Crux) and is available through
`nat nptv6` configuration nodes.

.. code-block:: none

  set rule 10 source prefix 'fc00:dead:beef::/48'
  set rule 10 outside-interface 'eth1'
  set rule 10 translation prefix '2001:db8:e1::/48'
  set rule 20 source prefix 'fc00:dead:beef::/48'
  set rule 20 outside-interface 'eth2'
  set rule 20 translation prefix '2001:db8:e2::/48'

Resulting in the following ip6tables rules:

.. code-block:: none

  Chain VYOS_DNPT_HOOK (1 references)
   pkts bytes target   prot opt in   out   source              destination
      0     0 NETMAP   all    eth1   any   anywhere            2001:db8:e1::/48  to:fc00:dead:beef::/48
      0     0 NETMAP   all    eth2   any   anywhere            2001:db8:e2::/48  to:fc00:dead:beef::/48
      0     0 RETURN   all    any    any   anywhere            anywhere
  Chain VYOS_SNPT_HOOK (1 references)
   pkts bytes target   prot opt in   out   source              destination
      0     0 NETMAP   all    any    eth1  fc00:dead:beef::/48 anywhere          to:2001:db8:e1::/48
      0     0 NETMAP   all    any    eth2  fc00:dead:beef::/48 anywhere          to:2001:db8:e2::/48
      0     0 RETURN   all    any    any   anywhere            anywhere

.. _ULAs: https://en.wikipedia.org/wiki/Unique_local_address
