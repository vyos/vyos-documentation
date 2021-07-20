.. _wireguard:

#########
WireGuard
#########

WireGuard is an extremely simple yet fast and modern VPN that utilizes
state-of-the-art cryptography. See https://www.wireguard.com for more
information.

****************
Site to Site VPN
****************

This diagram corresponds with the example site to site configuration below.

.. figure:: /_static/images/wireguard_site2site_diagram.jpg

*************
Configuration
*************



********
Keypairs
********

WireGuard requires the generation of a keypair, which includes a private
key to decrypt incoming traffic, and a public key for peer(s) to encrypt
traffic.

Generate Keypair
================

.. opcmd:: generate wireguard keypair

   It generates the keypair, which includes the public and private parts,
   and stores it within VyOS. It will be used per default on any configured
   WireGuard interface, even if multiple interfaces are being configured.

.. opcmd:: show wireguard pubkey 

   It shows the public key to be shared with your peer(s). Your peer will
   encrypt all traffic to your system using this public key.

   .. code-block:: none

     vyos@vyos:~$ show wireguard pubkey
     hW17UxY7zeydJNPIyo3UtGnBHkzTK/NeBOrDSIU9Tx0=


***********************
Interface configuration
***********************

The next step is to configure your local side as well as the policy
based trusted destination addresses. If you only initiate a connection,
the listen port and address/port is optional; however, if you act as a
server and endpoints initiate the connections to your system, you need to
define a port your clients can connect to, otherwise the port is randomly
chosen and may make connection difficult with firewall rules, since the port
may be different each time the system is rebooted.

You will also need the public key of your peer as well as the network(s)
you want to tunnel (allowed-ips) to configure a WireGuard tunnel. The
public key below is always the public key from your peer, not your local
one.

**local side - commands**

.. code-block:: none

  set interfaces wireguard wg01 address '10.1.0.1/30'
  set interfaces wireguard wg01 description 'VPN-to-wg02'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '192.168.2.0/24'
  set interfaces wireguard wg01 peer to-wg02 address '<Site1 Pub IP>'
  set interfaces wireguard wg01 peer to-wg02 port '51820'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'XMrlPykaxhdAAiSjhtPlvi30NVkvLQliQuKP7AI7CyI='
  set interfaces wireguard wg01 port '51820'
  set protocols static route 192.168.2.0/24 interface wg01

**local side - annotated commands**

.. code-block:: none

  set interfaces wireguard wg01 address '10.1.0.1/30'                     # Address of the wg01 tunnel interface.          
  set interfaces wireguard wg01 description 'VPN-to-wg02'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '192.168.2.0/24' # Subnets that are allowed to travel over the tunnel
  set interfaces wireguard wg01 peer to-wg02 address '<Site2 Pub IP>'     # Public IP of the peer
  set interfaces wireguard wg01 peer to-wg02 port '58120'                 # Port of the Peer
  set interfaces wireguard wg01 peer to-wg02 pubkey '<pubkey>'            # Public Key of the Peer
  set interfaces wireguard wg01 port '51820'                              # Port of own server
  set protocols static route 192.168.2.0/24 interface wg01                # Static route to remote subnet

The last step is to define an interface route for 10.2.0.0/24 to get
through the WireGuard interface `wg01`. Multiple IPs or networks can be
defined and routed. The last check is allowed-ips which either prevents
or allows the traffic.

.. note:: You can not assign the same allowed-ips statement to multiple
   WireGuard peers. This a a design decision. For more information please
   check the `WireGuard mailing list`_.

**remote side - commands**

.. code-block:: none

  set interfaces wireguard wg01 address '10.1.0.2/30'
  set interfaces wireguard wg01 description 'VPN-to-wg01'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '192.168.1.0/24'
  set interfaces wireguard wg01 peer to-wg02 address '<Site1 Pub IP>'
  set interfaces wireguard wg01 peer to-wg02 port '51820'
  set interfaces wireguard wg01 peer to-wg02 pubkey 'u41jO3OF73Gq1WARMMFG7tOfk7+r8o8AzPxJ1FZRhzk='
  set interfaces wireguard wg01 port '51820'
  set protocols static route 192.168.1.0/24 interface wg01

**remote side - annotated commands**

.. code-block:: none

  set interfaces wireguard wg01 address '10.1.0.2/30'                     # Address of the wg01 tunnel interface.
  set interfaces wireguard wg01 description 'VPN-to-wg01'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '192.168.1.0/24' # Subnets that are allowed to travel over the tunnel
  set interfaces wireguard wg01 peer to-wg02 address 'Site1 Pub IP'       # Public IP address of the Peer
  set interfaces wireguard wg01 peer to-wg02 port '51820'                 # Port of the Peer
  set interfaces wireguard wg01 peer to-wg02 pubkey '<pubkey>'            # Public key of the Peer  
  set interfaces wireguard wg01 port '51820'                              # Port of own server
  set protocols static route 192.168.1.0/24 interface wg01                # Static route to remote subnet

*******************
Firewall Exceptions
*******************

For the WireGuard traffic to pass through the WAN interface, you must create a firewall exception.

.. code-block:: none

    set firewall name OUTSIDE_LOCAL rule 10 action accept
    set firewall name OUTSIDE_LOCAL rule 10 description 'Allow established/related'
    set firewall name OUTSIDE_LOCAL rule 10 state established enable
    set firewall name OUTSIDE_LOCAL rule 10 state related enable
    set firewall name OUTSIDE_LOCAL rule 20 action accept
    set firewall name OUTSIDE_LOCAL rule 20 description WireGuard_IN
    set firewall name OUTSIDE_LOCAL rule 20 destination port 51820
    set firewall name OUTSIDE_LOCAL rule 20 log enable
    set firewall name OUTSIDE_LOCAL rule 20 protocol udp
    set firewall name OUTSIDE_LOCAL rule 20 source

You should also ensure that the OUTISDE_LOCAL firewall group is applied to the WAN interface and a direction (local).

.. code-block:: none

    set interfaces ethernet eth0 firewall local name 'OUTSIDE-LOCAL'

Assure that your firewall rules allow the traffic, in which case you have a working VPN using WireGuard.

.. code-block:: none

  wg01# ping 192.168.1.1
  PING 192.168.1.1 (192.168.1.1) 56(84) bytes of data.
  64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=1.16 ms
  64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=1.77 ms

  wg02# ping 192.168.2.1
  PING 192.168.2.1 (192.168.2.1) 56(84) bytes of data.
  64 bytes from 192.168.2.1: icmp_seq=1 ttl=64 time=4.40 ms
  64 bytes from 192.168.2.1: icmp_seq=2 ttl=64 time=1.02 ms

An additional layer of symmetric-key crypto can be used on top of the
asymmetric crypto. This is optional.

.. code-block:: none

  wg01# run generate wireguard preshared-key
  rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc=

Copy the key, as it is not stored on the local filesystem. Because it
is a symmetric key, only you and your peer should have knowledge of
its content. Make sure you distribute the key in a safe manner,

.. code-block:: none

  wg01# set interfaces wireguard wg01 peer to-wg02 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='
  wg02# set interfaces wireguard wg01 peer to-wg01 preshared-key 'rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc='


***********************************
Remote Access "RoadWarrior" Example
***********************************

With WireGuard, a Road Warrior VPN config is similar to a site-to-site
VPN. It just lacks the ``address`` and ``port`` statements.

In the following example, the IPs for the remote clients are defined in
the peers. This allows the peers to interact with one another.

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
            allowed-ips 2001:DB8:470:22::20/128
            persistent-keepalive 15
            pubkey BknHcLFo8nOo8Dwq2CjaC/TedchKQ0ebxC7GYn7Al00=
        }
        port 2224
    }

The following is the config for the iPhone peer above. It's important to
note that the ``AllowedIPs`` wildcard setting directs all IPv4 and IPv6 traffic
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

However, split-tunneling can be achieved by specifing the remote subnets.
This ensures that only traffic destined for the remote site is sent over the tunnel.
All other traffic is unaffected.

.. code-block:: none

    [Interface]
    PrivateKey = 8Iasdfweirousd1EVGUk5XsT+wYFZ9mhPnQhmjzaJE6Go=
    Address = 10.172.24.30/24, 2001:DB8:470:22::30/64

    [Peer]
    PublicKey = RIbtUTCfgzNjnLNPQ/ulkGnnB2vMWHm7l2H/xUfbyjc=
    AllowedIPs = 10.172.24.30/24, 2001:DB8:470:22::/64
    Endpoint = 192.0.2.1:2224
    PersistentKeepalive = 25


********************
Operational Commands
********************

Status
======

.. opcmd:: show interfaces wireguard

  Get a list of all wireguard interfaces

  .. code-block:: none

    Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
    Interface        IP Address                        S/L  Description
    ---------        ----------                        ---  -----------
    wg0              10.0.0.1/24                       u/u


.. opcmd:: show interfaces wireguard <interface>

  Show general information about specific WireGuard interface

  .. code-block:: none

    vyos@vyos:~$ show interfaces wireguard wg01
    interface: wg0
      address: 10.0.0.1/24
      public key: h1HkYlSuHdJN6Qv4Hz4bBzjGg5WUty+U1L7DJsZy1iE=
      private key: (hidden)
      listening port: 41751

        RX:  bytes  packets  errors  dropped  overrun       mcast
                 0        0       0        0        0           0
        TX:  bytes  packets  errors  dropped  carrier  collisions
                 0        0       0        0        0           0

***************
Encryption Keys
***************

.. opcmd:: show wireguard keypair pubkey <name>

  Show public key portion for specified key. This can be either the ``default``
  key, or any other named key-pair.

  The ``default`` keypair

  .. code-block:: none

    vyos@vyos:~$ show wireguard keypair pubkey default
    FAXCPb6EbTlSH5200J5zTopt9AYXneBthAySPBLbZwM=

  Name keypair ``KP01``

  .. code-block:: none

    vyos@vyos:~$ show wireguard keypair pubkey KP01
    HUtsu198toEnm1poGoRTyqkUKfKUdyh54f45dtcahDM=

.. opcmd:: delete wireguard keypair pubkey <name>

  Delete a keypair, this can be either the ``default`` key, or any other
  named key-pair.

  .. code-block:: none

    vyos@vyos:~$ delete wireguard keypair default

.. stop_vyoslinter

.. _`WireGuard mailing list`: https://lists.zx2c4.com/pipermail/wireguard/2018-December/003704.html

.. start_vyoslinter
