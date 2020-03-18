.. _wireguard:

#########
WireGuard
#########

WireGuard is an extremely simple yet fast and modern VPN that utilizes
state-of-the-art cryptography. See https://www.wireguard.com for more
information.

Configuration
=============

WireGuard requires the generation of a keypair, a private key which will
decrypt incoming traffic and a public key, which the peer(s) will use to
encrypt traffic.

Generate keypair
----------------

.. opcmd:: generate wireguard default-keypair

It generates the keypair, that is its public and private part and stores
it within VyOS. It will be used per default on any configured WireGuard
interface, even if multiple interfaces are being configured.



.. opcmd:: show wireguard keypairs pubkey default

It shows the public key which needs to be shared with your peer(s). Your
peer will encrypt all traffic to your system using this public key.



   .. code-block:: none

     vyos@vyos:~$ show wireguard keypairs pubkey default 
     hW17UxY7zeydJNPIyo3UtGnBHkzTK/NeBOrDSIU9Tx0=



Generate named keypair
----------------------

Named keypairs can be used on a interface basis, if configured. If
multiple WireGuard interfaces are being configured, each can have their
own keypairs.

The commands below will generate 2 keypairs, which are not related to
each other.

.. code-block:: none

  vyos@vyos:~$ generate wireguard named-keypairs KP01
  vyos@vyos:~$ generate wireguard named-keypairs KP02


Interface configuration
-----------------------

The next step is to configure your local side as well as the policy
based trusted destination addresses. If you only initiate a connection,
the listen port and endpoint is optional, if you however act as a server
and endpoints initiate the connections to your system, you need to
define a port your clients can connect to, otherwise it's randomly
chosen and may make it difficult with firewall rules, since the port may
be a different one when you reboot your system.

You will also need the public key of your peer as well as the network(s)
you want to tunnel (allowed-ips) to configure a WireGuard tunnel. The
public key below is always the public key from your peer, not your local
one.

**local side**

.. code-block:: none

  set interfaces wireguard wg01 address '10.1.0.1/24'
  set interfaces wireguard wg01 description 'VPN-to-wg02'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '10.2.0.0/24'
  set interfaces wireguard wg01 peer to-wg02 endpoint '192.168.0.142:12345'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'XMrlPykaxhdAAiSjhtPlvi30NVkvLQliQuKP7AI7CyI='
  set interfaces wireguard wg01 port '12345'
  set protocols static interface-route 10.2.0.0/24 next-hop-interface wg01

.. note:: The `endpoint` must be an IP and not a fully qualified domain
  name (FQDN). Using a FQDN will result in unexpected behavior.

The last step is to define an interface route for 10.2.0.0/24 to get
through the WireGuard interface `wg01`. Multiple IPs or networks can be
defined and routed, the last check is allowed-ips which either prevents
or allows the traffic.


To use a named key on an interface, the option private-key needs to be
set.

.. code-block:: none

  set interfaces wireguard wg01 private-key KP01
  set interfaces wireguard wg02 private-key KP02

The command ``run show wireguard keypairs pubkey KP01`` will then show
the public key, which needs to be shared with the peer.


**remote side**

.. code-block:: none

  set interfaces wireguard wg01 address '10.2.0.1/24'
  set interfaces wireguard wg01 description 'VPN-to-wg01'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '10.1.0.0/24'
  set interfaces wireguard wg01 peer to-wg02 endpoint '192.168.0.124:12345'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'u41jO3OF73Gq1WARMMFG7tOfk7+r8o8AzPxJ1FZRhzk='
  set interfaces wireguard wg01 port '12345'
  set protocols static interface-route 10.1.0.0/24 next-hop-interface wg01

Assure that your firewall rules allow the traffic, in which case you
have a working VPN using WireGuard

.. code-block:: none

  wg01# ping 10.2.0.1
  PING 10.2.0.1 (10.2.0.1) 56(84) bytes of data.
  64 bytes from 10.2.0.1: icmp_seq=1 ttl=64 time=1.16 ms
  64 bytes from 10.2.0.1: icmp_seq=2 ttl=64 time=1.77 ms

  wg02# ping 10.1.0.1
  PING 10.1.0.1 (10.1.0.1) 56(84) bytes of data.
  64 bytes from 10.1.0.1: icmp_seq=1 ttl=64 time=4.40 ms
  64 bytes from 10.1.0.1: icmp_seq=2 ttl=64 time=1.02 ms

An additional layer of symmetric-key crypto can be used on top of the
asymmetric crypto, which is optional.

.. code-block:: none

  wg01# run generate wireguard preshared-key
  rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc=

Copy the key, as it is not stored on the local file system. Make sure
you distribute that key in a safe manner, it's a symmetric key, so only
you and your peer should have knowledge of its content.

.. code-block:: none

  wg01# set interfaces wireguard wg01 peer to-wg02 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='
  wg02# set interfaces wireguard wg01 peer to-wg01 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='

Road Warrior Example
--------------------

With WireGuard, a Road Warrior VPN config is similar to a site-to-site
VPN. It just lacks the ``endpoint`` address.

In the following example, the IPs for the remote clients are defined in
the peers. This would allow the peers to interact with one another.

.. code-block:: none

    wireguard wg0 {
        address 10.172.24.1/24
        address 2001:DB8:470:22::1/64
        description RoadWarrior
        peer MacBook {
            allowed-ips 10.172.24.30/32
            allowed-ips 2001:DB8:470:22::30/128
            persistent-keepalive 15
            pubkey F5MbW7ye7DsoxdOaixjdrudshjjxN5UdNV+pGFHqehc=
        }
        peer iPhone {
            allowed-ips 10.172.24.20/32
            allowed-ips 2001:DB8:470:22::30/128
            persistent-keepalive 15
            pubkey BknHcLFo8nOo8Dwq2CjaC/TedchKQ0ebxC7GYn7Al00=
        }
        port 2224
    }

The following is the config for the iPhone peer above. It's important to
note that the ``AllowedIPs`` setting directs all IPv4 and IPv6 traffic
through the connection.

.. code-block:: none

    [Interface]
    PrivateKey = ARAKLSDJsadlkfjasdfiowqeruriowqeuasdf=
    Address = 10.172.24.20/24, 2001:DB8:470:22::20/64
    DNS = 10.0.0.53, 10.0.0.54

    [Peer]
    PublicKey = RIbtUTCfgzNjnLNPQ/ulkGnnB2vMWHm7l2H/xUfbyjc=
    AllowedIPs = 0.0.0.0/0, ::/0
    Endpoint = 192.0.2.1:2224
    PersistentKeepalive = 25


This MacBook peer is doing split-tunneling, where only the subnets local
to the server go over the connection.

.. code-block:: none

    [Interface]
    PrivateKey = 8Iasdfweirousd1EVGUk5XsT+wYFZ9mhPnQhmjzaJE6Go=
    Address = 10.172.24.30/24, 2001:DB8:470:22::30/64

    [Peer]
    PublicKey = RIbtUTCfgzNjnLNPQ/ulkGnnB2vMWHm7l2H/xUfbyjc=
    AllowedIPs = 10.172.24.30/24, 2001:DB8:470:22::/64
    Endpoint = 192.0.2.1:2224
    PersistentKeepalive = 25


Operational commands
====================

**Show interface status**

.. code-block:: none

  vyos@wg01# run show interfaces wireguard wg01
  interface: wg1
      description: VPN-to-wg01
      address: 10.2.0.1/24
      public key: RIbtUTCfgzNjnLNPQ/asldkfjhaERDFl2H/xUfbyjc=
      private key: (hidden)
      listening port: 53665
      peer: to-wg02
          public key: u41jO3OF73Gq1WARMMFG7tOfk7+r8o8AzPxJ1FZRhzk=
          latest handshake: 0:01:20
          status: active
          endpoint: 192.168.0.124:12345
          allowed ips: 10.2.0.0/24
          transfer: 42 GB received, 487 MB sent
          persistent keepalive: every 15 seconds
      RX:
              bytes    packets    errors    dropped    overrun    mcast
      45252407916   31192260         0     244493          0        0
      TX:
          bytes    packets    errors    dropped    carrier    collisions
      511649780    5129601     24465          0          0             0

**Show public key of the default key**

.. code-block:: none

  vyos@wg01# run show wireguard keypair pubkey default
  FAXCPb6EbTlSH5200J5zTopt9AYXneBthAySPBLbZwM=

**Show public key of a named key**

.. code-block:: none

  vyos@wg01# run show wireguard keypair pubkey KP01
  HUtsu198toEnm1poGoRTyqkUKfKUdyh54f45dtcahDM=


**Delete wireguard keypairs**

.. code-block:: none

  vyos@wg01# wireguard keypair default

