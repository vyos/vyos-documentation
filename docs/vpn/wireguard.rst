.. _wireguard:

WireGuard VPN Interface
-----------------------

WireGuard is an extremely simple yet fast and modern VPN that utilizes
state-of-the-art cryptography. See https://www.wireguard.com for more
information.

Configuration
^^^^^^^^^^^^^

Generate the keypair, which creates a public and private part and stores it
within VyOS.

.. code-block:: sh

  wg01:~$ configure
  wg01# run generate wireguard keypair

The public key is being shared with your peer(s), your peer will encrypt all
traffic to your system using this public key.

.. code-block:: sh

  wg01# run show wireguard pubkey
  u41jO3OF73Gq1WARMMFG7tOfk7+r8o8AzPxJ1FZRhzk=

The next step is to configure your local side as well as the policy based
trusted destination addresses. If you only initiate a connection, the listen
port and endpoint is optional, if you however act as a server and endpoints
initiate the connections to your system, you need to define a port your clients
can connect to, otherwise it's randomly chosen and may make it difficult with
firewall rules, since the port may be a different one when you reboot your
system.

You will also need the public key of your peer as well as the network(s) you
want to tunnel (allowed-ips) to configure a wireguard tunnel. The public key
below is always the public key from your peer, not your local one.

**local side**

.. code-block:: sh

  set interfaces wireguard wg01 address '10.1.0.1/24'
  set interfaces wireguard wg01 description 'VPN-to-wg02'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '10.2.0.0/24'
  set interfaces wireguard wg01 peer to-wg02 endpoint '192.168.0.142:12345'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'XMrlPykaxhdAAiSjhtPlvi30NVkvLQliQuKP7AI7CyI='
  set interfaces wireguard wg01 port '12345'
  set protocols static interface-route 10.2.0.0/24 next-hop-interface wg01

The last step is to define an interface route for 10.2.0.0/24 to get through
the wireguard interface `wg01`. Multiple IPs or networks can be defined and
routed, the last check is allowed-ips which either prevents or allows the
traffic.

**remote side**

.. code-block:: sh

  set interfaces wireguard wg01 address '10.2.0.1/24'
  set interfaces wireguard wg01 description 'VPN-to-wg01'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '10.1.0.0/24'
  set interfaces wireguard wg01 peer to-wg02 endpoint '192.168.0.124:12345'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'u41jO3OF73Gq1WARMMFG7tOfk7+r8o8AzPxJ1FZRhzk='
  set interfaces wireguard wg01 port '12345'
  set protocols static interface-route 10.1.0.0/24 next-hop-interface wg01

Assure that your firewall rules allow the traffic, in which case you have a
working VPN using wireguard.

.. code-block:: sh

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

.. code-block:: sh

  wg01# run generate wireguard preshared-key
  rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc=

Copy the key, it is not stored on the local file system. Make sure you
distribute that key in a safe manner, it's a symmatric key, so only you and
your peer should have knowledge if its content.

.. code-block:: sh

  wg01# set interfaces wireguard wg01 peer to-wg02 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='
  wg02# set interfaces wireguard wg01 peer to-wg01 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='

**operational commands**

.. code-block:: sh

  vyos@wg01# show interfaces wireguard wg01

  interface: wg01
  public key: xHvgSJC8RTClfvjc0oX6OALxU6GGLapjthjw7x82CSw=
  private key: (hidden)
  listening port: 12345

  peer: 9Ek3R30mG6Vk+GHsENtPF0b9Ul+ftxx4dDBa1bdBxX8=
  endpoint: 192.168.0.142:12345
  allowed ips: 10.2.0.0/24
  latest handshake: 4 minutes, 22 seconds ago
  transfer: 860 B received, 948 B sent
