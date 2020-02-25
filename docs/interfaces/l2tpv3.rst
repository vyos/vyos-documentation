.. include:: ../_include/need_improvement.txt

.. _l2tpv3-interface:

L2TPv3
------

L2TPv3 is a pseudowire protocol, you can read more about on `Wikipedia L2TPv3`_
or in :rfc:`3921`

L2TPv3 can transport any traffic including ethernet frames. L2TPv2 is limited
to PPP.

Over IP
^^^^^^^

.. code-block:: none

  # show interfaces l2tpv3
  l2tpv3 l2tpeth10 {
      address 192.168.37.1/27
      encapsulation ip
      local-ip 192.0.2.1
      peer-session-id 100
      peer-tunnel-id 200
      remote-ip 203.0.113.24
      session-id 100
      tunnel-id 200
  }

Inverse configuration has to be applied to the remote side.

Over UDP
^^^^^^^^

UDP mode works better with NAT:

* Set local-ip to your local IP (LAN).
* Add a forwarding rule matching UDP port on your internet router.

.. code-block:: none

  # show interfaces l2tpv3
  l2tpv3 l2tpeth10 {
      address 192.168.37.1/27
      destination-port 9001
      encapsulation udp
      local-ip 192.0.2.1
      peer-session-id 100
      peer-tunnel-id 200
      remote-ip 203.0.113.24
      session-id 100
      source-port 9000
      tunnel-id 200
  }

To create more than one tunnel, use distinct UDP ports.


Over IPSec, L2 VPN (bridge)
^^^^^^^^^^^^^^^^^^^^^^^^^^^

This is the LAN extension use case. The eth0 port of the distant VPN peers
will be directly connected like if there was a switch between them.

IPSec:

.. code-block:: none

  set vpn ipsec ipsec-interfaces <VPN-interface>
  set vpn ipsec esp-group test-ESP-1 compression 'disable'
  set vpn ipsec esp-group test-ESP-1 lifetime '3600'
  set vpn ipsec esp-group test-ESP-1 mode 'transport'
  set vpn ipsec esp-group test-ESP-1 pfs 'enable'
  set vpn ipsec esp-group test-ESP-1 proposal 1 encryption 'aes128'
  set vpn ipsec esp-group test-ESP-1 proposal 1 hash 'sha1'
  set vpn ipsec ike-group test-IKE-1 ikev2-reauth 'no'
  set vpn ipsec ike-group test-IKE-1 key-exchange 'ikev1'
  set vpn ipsec ike-group test-IKE-1 lifetime '3600'
  set vpn ipsec ike-group test-IKE-1 proposal 1 dh-group '5'
  set vpn ipsec ike-group test-IKE-1 proposal 1 encryption 'aes128'
  set vpn ipsec ike-group test-IKE-1 proposal 1 hash 'sha1'
  set vpn ipsec site-to-site peer <peer-ip> authentication mode 'pre-shared-secret'
  set vpn ipsec site-to-site peer <peer-ip> authentication pre-shared-secret <pre-shared-key>
  set vpn ipsec site-to-site peer <peer-ip> connection-type 'initiate'
  set vpn ipsec site-to-site peer <peer-ip> ike-group 'test-IKE-1'
  set vpn ipsec site-to-site peer <peer-ip> ikev2-reauth 'inherit'
  set vpn ipsec site-to-site peer <peer-ip> local-address <local-ip>
  set vpn ipsec site-to-site peer <peer-ip> tunnel 1 allow-nat-networks 'disable'
  set vpn ipsec site-to-site peer <peer-ip> tunnel 1 allow-public-networks 'disable'
  set vpn ipsec site-to-site peer <peer-ip> tunnel 1 esp-group 'test-ESP-1'
  set vpn ipsec site-to-site peer <peer-ip> tunnel 1 protocol 'l2tp'

Bridge:

.. code-block:: none

  set interfaces bridge br0 description 'L2 VPN Bridge'
  # remote side in this example:
  # set interfaces bridge br0 address '172.16.30.18/30'
  set interfaces bridge br0 address '172.16.30.17/30'
  set interfaces bridge br0 member interface eth0
  set interfaces ethernet eth0 description 'L2 VPN Physical port'

L2TPv3:

.. code-block:: none

  set interfaces bridge br0 member interface 'l2tpeth0'
  set interfaces l2tpv3 l2tpeth0 description 'L2 VPN Tunnel'
  set interfaces l2tpv3 l2tpeth0 destination-port '5000'
  set interfaces l2tpv3 l2tpeth0 encapsulation 'ip'
  set interfaces l2tpv3 l2tpeth0 local-ip <local-ip>
  set interfaces l2tpv3 l2tpeth0 mtu '1500'
  set interfaces l2tpv3 l2tpeth0 peer-session-id '110'
  set interfaces l2tpv3 l2tpeth0 peer-tunnel-id '10'
  set interfaces l2tpv3 l2tpeth0 remote-ip <peer-ip>
  set interfaces l2tpv3 l2tpeth0 session-id '110'
  set interfaces l2tpv3 l2tpeth0 source-port '5000'
  set interfaces l2tpv3 l2tpeth0 tunnel-id '10'

.. _`Wikipedia L2TPv3`: https://en.wikipedia.org/wiki/L2TPv3
