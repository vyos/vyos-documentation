:lastproofread: 2024-07-04

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

********
Keypairs
********

WireGuard requires the generation of a keypair, which includes a private key to
decrypt incoming traffic, and a public key for peer(s) to encrypt traffic.

Generate Keypair
================

.. opcmd:: generate pki wireguard key-pair

   Generates the keypair, which includes the public and private parts.
   The key is not stored on the system - only a keypair is generated.

   .. code-block:: none

     vyos@vyos:~$ generate pki wireguard key-pair
     Private key: iJJyEARGK52Ls1GYRCcFvPuTj7WyWYDo//BknoDU0XY=
     Public key: EKY0dxRrSD98QHjfHOK13mZ5PJ7hnddRZt5woB3szyw=

.. opcmd:: generate pki wireguard key-pair install interface <interface>

   Generates a keypair, which includes the public and private parts, and builds
   a configuration command to install this key to ``interface``.

   .. code-block:: none

      vyos@vyos:~$ generate pki wireguard key-pair install interface wg10
      "generate" CLI command executed from operational level.
      Generated private-key is not stored to CLI, use configure mode commands to install key:

      set interfaces wireguard wg10 private-key '4Krkv8h6NkAYMMaBWI957yYDJDMvj9URTHstdlOcDU0='

      Corresponding public-key to use on peer system is: 'UxDsYT6EnpTIOKUzvMlw2p0sNOKQvFxEdSVrnNrX1Ro='

   .. note:: If this command is invoked from configure mode with the ``run``
      prefix the key is automatically installed to the appropriate interface:

      .. code-block:: none

        vyos@vyos# run generate pki wireguard key-pair install interface wg10
        "generate" CLI command executed from config session.
        Generated private-key was imported to CLI!

        Use the following command to verify: show interfaces wireguard wg10
        Corresponding public-key to use on peer system is: '7d9KwabjLhHpJiEJeIGd0CBlao/eTwFOh6xyCovTfG8='

        vyos@vyos# compare
        [edit interfaces]
        +wireguard wg10 {
        +    private-key CJweb8FC6BU3Loj4PC2pn5V82cDjIPs7G1saW0ZfLWc=
        +}

.. opcmd:: show interfaces wireguard <interface> public-key

   Retrieve public key portion from configured WIreGuard interface.

   .. code-block:: none

     vyos@vyos:~$ show interfaces wireguard wg01 public-key
     EKY0dxRrSD98QHjfHOK13mZ5PJ7hnddRZt5woB3szyw=


Optional
--------

.. opcmd:: generate pki wireguard preshared-key

   An additional layer of symmetric-key crypto can be used on top of the
   asymmetric crypto.

   This is optional.

   .. code-block:: none

     vyos@vyos:~$ generate pki wireguard preshared-key
     Pre-shared key: OHH2EwZfMNK+1L6BXbYw3bKCtMrfjpR4mCAEeBlFnRs=


.. opcmd:: generate pki wireguard preshared-key install interface <interface> peer <peer>

   An additional layer of symmetric-key crypto can be used on top of the
   asymmetric crypto. This command automatically creates the required CLI
   command to install this PSK for a given peer.

   This is optional.

   .. code-block:: none

     vyos@vyos:~$ generate pki wireguard preshared-key install interface wg10 peer foo
     "generate" CLI command executed from operational level.
     Generated preshared-key is not stored to CLI, use configure mode commands to install key:

     set interfaces wireguard wg10 peer foo preshared-key '32vQ1w1yFKTna8n7Gu7EimubSe2Y63m8bafz55EG3Ro='

     Pre-shared key: +LuaZ8W6DjsDFJFX3jJzoNqrsXHhvq08JztM9z8LHCs=


   .. note:: If this command is invoked from configure mode with the ``run``
      prefix the key is automatically installed to the appropriate interface:


***********************
Interface configuration
***********************

The next step is to configure your local side as well as the policy based
trusted destination addresses. If you only initiate a connection, the listen
port and address/port is optional; however, if you act like a server and
endpoints initiate the connections to your system, you need to define a port
your clients can connect to, otherwise the port is randomly chosen and may
make connection difficult with firewall rules, since the port may be different
each time the system is rebooted.

You will also need the public key of your peer as well as the network(s) you
want to tunnel (allowed-ips) to configure a WireGuard tunnel. The public key
below is always the public key from your peer, not your local one.

**local side - commands**

- WireGuard interface itself uses address 10.1.0.1/30
- We only allow the 192.168.2.0/24 subnet to travel over the tunnel
- Our remote end of the tunnel for peer `to-wg02` is reachable at 192.0.2.1
  port 51820
- The remote peer `to-wg02` uses XMrlPykaxhdAAiSjhtPlvi30NVkvLQliQuKP7AI7CyI=
  as its public key portion
- We listen on port 51820
- We route all traffic for the 192.168.2.0/24 network to interface `wg01`

.. code-block:: none

  set interfaces wireguard wg01 address '10.1.0.1/30'
  set interfaces wireguard wg01 description 'VPN-to-wg02'
  set interfaces wireguard wg01 peer to-wg02 allowed-ips '192.168.2.0/24'
  set interfaces wireguard wg01 peer to-wg02 address '192.0.2.1'
  set interfaces wireguard wg01 peer to-wg02 port '51820'
  set interfaces wireguard wg01 peer to-wg02 public-key 'XMrlPykaxhdAAiSjhtPlvi30NVkvLQliQuKP7AI7CyI='
  set interfaces wireguard wg01 port '51820'

  set protocols static route 192.168.2.0/24 interface wg01

The last step is to define an interface route for 192.168.2.0/24 to get through
the WireGuard interface `wg01`. Multiple IPs or networks can be defined and
routed. The last check is allowed-ips which either prevents or allows the
traffic.

.. warning:: You can not assign the same allowed-ips statement to multiple
   WireGuard peers. This a design decision. For more information please
   check the `WireGuard mailing list`_.

.. cfgcmd:: set interfaces wireguard <interface> private-key <private-key>

  Associates the previously generated private key to a specific WireGuard
  interface. The private key can be generate via the command

  :opcmd:`generate pki wireguard key-pair`.

  .. code-block:: none

    set interfaces wireguard wg01 private-key 'iJJyEARGK52Ls1GYRCcFvPuTj7WyWYDo//BknoDU0XY='

  The command :opcmd:`show interfaces wireguard wg01 public-key` will then show the
  public key, which needs to be shared with the peer.

.. cmdinclude:: /_include/interface-per-client-thread.txt
   :var0: wireguard
   :var1: wg01

**remote side - commands**

.. code-block:: none

  set interfaces wireguard wg01 address '10.1.0.2/30'
  set interfaces wireguard wg01 description 'VPN-to-wg01'
  set interfaces wireguard wg01 peer to-wg01 allowed-ips '192.168.1.0/24'
  set interfaces wireguard wg01 peer to-wg01 address '192.0.2.2'
  set interfaces wireguard wg01 peer to-wg01 port '51820'
  set interfaces wireguard wg01 peer to-wg01 public-key 'EKY0dxRrSD98QHjfHOK13mZ5PJ7hnddRZt5woB3szyw='
  set interfaces wireguard wg01 port '51820'
  set interfaces wireguard wg01 private-key 'OLTQY3HuK5qWDgVs6fJR093SwPgOmCKkDI1+vJLGoFU='

  set protocols static route 192.168.1.0/24 interface wg01

*******************
Firewall Exceptions
*******************

For the WireGuard traffic to pass through the WAN interface, you must create a
firewall exception.

.. code-block:: none

    set firewall ipv4 name OUTSIDE_LOCAL rule 10 action accept
    set firewall ipv4 name OUTSIDE_LOCAL rule 10 description 'Allow established/related'
    set firewall ipv4 name OUTSIDE_LOCAL rule 10 state established enable
    set firewall ipv4 name OUTSIDE_LOCAL rule 10 state related enable
    set firewall ipv4 name OUTSIDE_LOCAL rule 20 action accept
    set firewall ipv4 name OUTSIDE_LOCAL rule 20 description WireGuard_IN
    set firewall ipv4 name OUTSIDE_LOCAL rule 20 destination port 51820
    set firewall ipv4 name OUTSIDE_LOCAL rule 20 log enable
    set firewall ipv4 name OUTSIDE_LOCAL rule 20 protocol udp

You should also ensure that the OUTSIDE_LOCAL firewall group is applied to the
WAN interface and in an input (local) direction.

.. code-block:: none

    set firewall ipv4 input filter rule 10 action jump
    set firewall ipv4 input filter rule 10 jump-target 'OUTSIDE_LOCAL'
    set firewall ipv4 input filter rule 10 inbound-interface name 'eth0'

Assure that your firewall rules allow the traffic, in which case you have a
working VPN using WireGuard.

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

  vyos@vyos:~$ generate pki wireguard preshared-key
  Pre-shared key: rvVDOoc2IYEnV+k5p7TNAmHBMEGTHbPU8Qqg8c/sUqc=

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
the peers. This allows the peers to interact with one another. In
comparison to the site-to-site example the ``persistent-keepalive``
flag is set to 15 seconds to assure the connection is kept alive.
This is mainly relevant if one of the peers is behind NAT and can't
be connected to if the connection is lost. To be effective this
value needs to be lower than the UDP timeout.

.. code-block:: none

    wireguard wg01 {
        address 10.172.24.1/24
        address 2001:db8:470:22::1/64
        description RoadWarrior
        peer MacBook {
            allowed-ips 10.172.24.30/32
            allowed-ips 2001:db8:470:22::30/128
            persistent-keepalive 15
            pubkey F5MbW7ye7DsoxdOaixjdrudshjjxN5UdNV+pGFHqehc=
        }
        peer iPhone {
            allowed-ips 10.172.24.20/32
            allowed-ips 2001:db8:470:22::20/128
            persistent-keepalive 15
            pubkey BknHcLFo8nOo8Dwq2CjaC/TedchKQ0ebxC7GYn7Al00=
        }
        port 2224
        private-key OLTQY3HuK5qWDgVs6fJR093SwPgOmCKkDI1+vJLGoFU=
    }

The following is the config for the iPhone peer above. It's important to
note that the ``AllowedIPs`` wildcard setting directs all IPv4 and IPv6 traffic
through the connection.

.. code-block:: none

    [Interface]
    PrivateKey = ARAKLSDJsadlkfjasdfiowqeruriowqeuasdf=
    Address = 10.172.24.20/24, 2001:db8:470:22::20/64
    DNS = 10.0.0.53, 10.0.0.54

    [Peer]
    PublicKey = RIbtUTCfgzNjnLNPQ/ulkGnnB2vMWHm7l2H/xUfbyjc=
    AllowedIPs = 0.0.0.0/0, ::/0
    Endpoint = 192.0.2.1:2224
    PersistentKeepalive = 25

However, split-tunneling can be achieved by specifying the remote subnets.
This ensures that only traffic destined for the remote site is sent over the
tunnel. All other traffic is unaffected.

.. code-block:: none

    [Interface]
    PrivateKey = 8Iasdfweirousd1EVGUk5XsT+wYFZ9mhPnQhmjzaJE6Go=
    Address = 10.172.24.30/24, 2001:db8:470:22::30/64

    [Peer]
    PublicKey = RIbtUTCfgzNjnLNPQ/ulkGnnB2vMWHm7l2H/xUfbyjc=
    AllowedIPs = 10.172.24.30/24, 2001:db8:470:22::/64
    Endpoint = 192.0.2.1:2224
    PersistentKeepalive = 25


********************
Operational Commands
********************

Status
======

.. opcmd:: show interfaces wireguard wg01 summary

  Show info about the Wireguard service.
  It also shows the latest handshake.

  .. code-block:: none

    vyos@vyos:~$ show interfaces wireguard wg01 summary
    interface: wg01
      public key:
      private key: (hidden)
      listening port: 51820

    peer: <peer pubkey>
      endpoint: <peer public IP>
      allowed ips: 10.69.69.2/32
      latest handshake: 23 hours, 45 minutes, 26 seconds ago
      transfer: 1.26 MiB received, 6.47 MiB sent

.. opcmd:: show interfaces wireguard

  Get a list of all wireguard interfaces

  .. code-block:: none

    Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
    Interface        IP Address                        S/L  Description
    ---------        ----------                        ---  -----------
    wg01             10.0.0.1/24                       u/u


.. opcmd:: show interfaces wireguard <interface>

  Show general information about specific WireGuard interface

  .. code-block:: none

    vyos@vyos:~$ show interfaces wireguard wg01
    interface: wg01
      address: 10.0.0.1/24
      public key: h1HkYlSuHdJN6Qv4Hz4bBzjGg5WUty+U1L7DJsZy1iE=
      private key: (hidden)
      listening port: 41751

        RX:  bytes  packets  errors  dropped  overrun       mcast
                 0        0       0        0        0           0
        TX:  bytes  packets  errors  dropped  carrier  collisions
                 0        0       0        0        0           0

***********************************
Remote Access "RoadWarrior" clients
***********************************

Some users tend to connect their mobile devices using WireGuard to their VyOS
router. To ease deployment one can generate a "per mobile" configuration from
the VyOS CLI.

.. warning:: From a security perspective, it is not recommended to let a third
  party create and share the private key for a secured connection.
  You should create the private portion on your own and only hand out the
  public key. Please keep this in mind when using this convenience feature.

.. opcmd:: generate wireguard client-config <name> interface <interface> server
   <ip|fqdn> address <client-ip>

  Using this command, you will create a new client configuration which can
  connect to ``interface`` on this router. The public key from the specified
  interface is automatically extracted and embedded into the configuration.

  The command also generates a configuration snippet which can be copy/pasted
  into the VyOS CLI if needed. The supplied ``<name>`` on the CLI will become
  the peer name in the snippet.

  In addition you will specify the IP address or FQDN for the client where it
  will connect to. The address parameter can be used up to two times and is used
  to assign the clients specific IPv4 (/32) or IPv6 (/128) address.

  .. figure:: /_static/images/wireguard_qrcode.jpg
     :alt: WireGuard Client QR code

.. stop_vyoslinter

.. _`WireGuard mailing list`: https://lists.zx2c4.com/pipermail/wireguard/2018-December/003704.html

.. start_vyoslinter
