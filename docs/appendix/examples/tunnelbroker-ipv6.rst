.. _examples-tunnelbroker-ipv6:

#######################
Tunnelbroker.net (IPv6)
#######################

This guides walks through the setup of https://www.tunnelbroker.net/ for an
IPv6 Tunnel.

Prerequisites
=============

- A public, routable IPv4 address. This does not necessarily need to be static,
  but you will need to update the tunnel endpoint when/if your IP address
  changes, which can be done with a script and a scheduled task.
- Account at https://www.tunnelbroker.net/
- Requested a "Regular Tunnel". You want to choose a location that is closest
  to your physical location for the best response time.

Setup initial tunnel
====================

Set up initial IPv6 tunnel. Replace the field below from the fields on the
tunnel information page.

.. code-block:: none

  conf
  set interfaces tunnel tun0 address Client_IPv6_from_Tunnelbroker    # This will be your VyOS install's public IPv6 address
  set interfaces tunnel tun0 description 'HE.NET IPv6 Tunnel'
  set interfaces tunnel tun0 encapsulation 'sit'
  set interfaces tunnel tun0 local-ip Client_IPv4_from_Tunnelbroker   # This is your public IP
  set interfaces tunnel tun0 mtu '1472'
  set interfaces tunnel tun0 multicast 'disable'
  set interfaces tunnel tun0 remote-ip Server_IPv4_from_Tunnelbroker  # This is the IP of the Tunnelbroker server
  set protocols static interface-route6 ::/0 next-hop-interface tun0  # Tell all traffic to go over this tunnel
  commit

If your WAN connection is over PPPoE, you may need to set the MTU on the above
tunnel lower than 1472.

At this point you should be able to ping an IPv6 address, try pinging Google:

.. code-block:: none

   ping6 -c2 2001:4860:4860::8888

   64 bytes from 2001:4860:4860::8888: icmp_seq=1 ttl=57 time=21.7 ms
   64 bytes from 2001:4860:4860::8888: icmp_seq=2 ttl=57 time=21.1 ms

   --- 2001:4860:4860::8888 ping statistics ---
   2 packets transmitted, 2 received, 0% packet loss, time 1001ms
   rtt min/avg/max/mdev = 21.193/21.459/21.726/0.304 ms

Assuming the pings are successful, you need to add some DNS servers.
Some options:

.. code-block:: none

   set system name-server 2001:4860:4860::8888  # Google
   set system name-server 2001:4860:4860::8844  # Google
   set system name-server 2606:4700:4700::1111  # Cloudflare
   set system name-server 2606:4700:4700::1001  # Cloudflare
   commit

You should now be able to ping something by IPv6 DNS name:

.. code-block:: none

   # ping6 -c2 one.one.one.one
   PING one.one.one.one(one.one.one.one) 56 data bytes
   64 bytes from one.one.one.one: icmp_seq=1 ttl=58 time=16.8 ms
   64 bytes from one.one.one.one: icmp_seq=2 ttl=58 time=17.4 ms

   --- one.one.one.one ping statistics ---
   2 packets transmitted, 2 received, 0% packet loss, time 1001ms
   rtt min/avg/max/mdev = 16.880/17.153/17.426/0.273 ms

Assuming everything works, you can proceed to client configuration

LAN Configuration
=================

At this point your VyOS install should have full IPv6, but now your LAN devices
need access.

With Tunnelbroker.net, you have two options:

- Routed /64. This is the default assignment. In IPv6-land, it's good for a
  single "LAN", and is somewhat equivalent to a /24.
  Example: `2001:470:xxxx:xxxx::/64`
- Routed /48. This is something you can request by clicking the "Assign /48"
  link in the Tunnelbroker.net tunnel config. It allows you to have up to 65k
  LANs. Example: `2001:470:xxxx::/48`

Unlike IPv4, IPv6 is really not designed to be broken up smaller than /64. So
if you ever want to have multiple LANs, VLANs, DMZ, etc, you'll want to ignore
the assigned /64, and request the /48 and use that.

Single LAN Setup
================

Single LAN setup where eth1 is your LAN interface. Use the /64 (all the xxxx
should be replaced with the information from your `Routed /64` tunnel):

.. code-block:: none

  set interfaces ethernet eth1 address '2001:470:xxxx:xxxx::1/64'
  set service router-advert interface eth1 name-server '2001:4860:4860::8888'
  set service router-advert interface eth1 name-server '2001:4860:4860::8844'
  set service router-advert interface eth1 prefix 2001:470:xxxx:xxxx::/64 autonomous-flag
  set service router-advert interface eth1 prefix 2001:470:xxxx:xxxx::/64 on-link-flag
  set service router-advert interface eth1 prefix 2001:470:xxxx:xxxx::/64 valid-lifetime '2592000'

This accomplishes a few things:

- Sets your LAN interface's IP address
- Enables router advertisements. This is an IPv6 alternative for DHCP (though
  DHCPv6 can still be used). With RAs, Your devices will automatically find the
  information they need for routing and DNS.

Multiple LAN/DMZ Setup
======================

In this, you use the `Routed /48` information. This allows you to assign a
different /64 to every interface, LAN, or even device. Or you could break your
network into smaller chunks like /56 or /60.

The format of these addresses:

- `2001:470:xxxx::/48`: The whole subnet. xxxx should come from Tunnelbroker.
- `2001:470:xxxx:1::/64`: A subnet suitable for a LAN
- `2001:470:xxxx:2::/64`: Another subnet
- `2001:470:xxxx:ffff:/64`: The last usable /64 subnet.

In the above examples, 1,2,ffff are all chosen by you. You can use 1-ffff
(1-65535).

So, when your LAN is eth1, your DMZ is eth2, your cameras live on eth3, etc:

.. code-block:: none

  set interfaces ethernet eth1 address '2001:470:xxxx:1::1/64'
  set service router-advert interface eth1 name-server '2001:4860:4860::8888'
  set service router-advert interface eth1 name-server '2001:4860:4860::8844'
  set service router-advert interface eth1 prefix 2001:470:xxxx:1::/64 autonomous-flag 'true'
  set service router-advert interface eth1 prefix 2001:470:xxxx:1::/64 on-link-flag 'true'
  set service router-advert interface eth1 prefix 2001:470:xxxx:1::/64 valid-lifetime '2592000'

  set interfaces ethernet eth2 address '2001:470:xxxx:2::1/64'
  set service router-advert interface eth2 name-server '2001:4860:4860::8888'
  set service router-advert interface eth2 name-server '2001:4860:4860::8844'
  set service router-advert interface eth2 prefix 2001:470:xxxx:2::/64 autonomous-flag 'true'
  set service router-advert interface eth2 prefix 2001:470:xxxx:2::/64 on-link-flag 'true'
  set service router-advert interface eth2 prefix 2001:470:xxxx:2::/64 valid-lifetime '2592000'

  set interfaces ethernet eth3 address '2001:470:xxxx:3::1/64'
  set service router-advert interface eth3 name-server '2001:4860:4860::8888'
  set service router-advert interface eth3 name-server '2001:4860:4860::8844'
  set service router-advert interface eth3 prefix 2001:470:xxxx:3::/64 autonomous-flag 'true'
  set service router-advert interface eth3 prefix 2001:470:xxxx:3::/64 on-link-flag 'true'
  set service router-advert interface eth3 prefix 2001:470:xxxx:3::/64 valid-lifetime '2592000'

Firewall
========

Finally, don't forget the :ref:`firewall`. The usage is identical, except for
instead of `set firewall name NAME`, you would use `set firewall ipv6-name
NAME`.

Similarly, to attach the firewall, you would use `set interfaces ethernet eth0
firewall in ipv6-name` or `set zone-policy zone LOCAL from WAN firewall
ipv6-name`.
