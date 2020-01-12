.. _gre-ipsec:

GRE/IPsec
---------

Generic Routing Encapsulation (GRE), GRE/IPsec (or IPIP/IPsec, SIT/IPsec, or any
other stateless tunnel protocol over IPsec) is the usual way to protect the
traffic inside a tunnel.

An advantage of this scheme is that you get a real interface with its own
address, which makes it easier to setup static routes or use dynamic routing
protocols without having to modify IPsec policies. The other advantage is that
it greatly simplifies router to router communication, which can be tricky with
plain IPsec because the external outgoing address of the router usually doesn't
match the IPsec policy of typical site-to-site setup and you need to add special
configuration for it, or adjust the source address for outgoing traffic of your
applications. GRE/IPsec has no such problem and is completely transparent for
the applications.

GRE/IPIP/SIT and IPsec are widely accepted standards, which make this scheme
easy to implement between VyOS and virtually any other router.

For simplicity we'll assume that the protocol is GRE, it's not hard to guess
what needs to be changed to make it work with a different protocol. We assume
that IPsec will use pre-shared secret authentication and will use AES128/SHA1
for the cipher and hash. Adjust this as necessary.

.. NOTE:: VMware users should ensure that VMXNET3 adapters used, e1000 adapters
   have known issue with GRE processing

IPsec policy matching GRE
^^^^^^^^^^^^^^^^^^^^^^^^^

The first and arguably cleaner option is to make your IPsec policy match GRE
packets between external addresses of your routers. This is the best option if
both routers have static external addresses.

Suppose the LEFT router has external address 192.0.2.10 on its eth0 interface,
and the RIGHT router is 203.0.113.45

On the LEFT:

.. code-block:: none

  # GRE tunnel
  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 local-ip 192.0.2.10
  set interfaces tunnel tun0 remote-ip 203.0.113.45
  set interfaces tunnel tun0 address 10.10.10.1/30

  ## IPsec
  set vpn ipsec ipsec-interfaces interface eth0

  # IKE group
  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group '2'
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption 'aes128'
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash 'sha1'

  # ESP group
  set vpn ipsec esp-group MyESPGroup proposal 1 encryption 'aes128'
  set vpn ipsec esp-group MyESPGroup proposal 1 hash 'sha1'

  # IPsec tunnel
  set vpn ipsec site-to-site peer 203.0.113.45 authentication mode pre-shared-secret
  set vpn ipsec site-to-site peer 203.0.113.45 authentication pre-shared-secret MYSECRETKEY

  set vpn ipsec site-to-site peer 203.0.113.45 ike-group MyIKEGroup
  set vpn ipsec site-to-site peer 203.0.113.45 default-esp-group MyESPGroup

  set vpn ipsec site-to-site peer 203.0.113.45 local-address 192.0.2.10

  # This will match all GRE traffic to the peer
  set vpn ipsec site-to-site peer 203.0.113.45 tunnel 1 protocol gre

On the RIGHT, setup by analogy and swap local and remote addresses.


Source tunnel from loopbacks
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The scheme above doesn't work when one of the routers has a dynamic external
address though. The classic workaround for this is to setup an address on a
loopback interface and use it as a source address for the GRE tunnel, then setup
an IPsec policy to match those loopback addresses.

We assume that the LEFT router has static 192.0.2.10 address on eth0, and the
RIGHT router has a dynamic address on eth0.

**Setting up the GRE tunnel**

On the LEFT:

.. code-block:: none

  set interfaces loopback lo address 192.168.99.1/32

  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 address 10.10.10.1/30
  set interfaces tunnel tun0 local-ip 192.168.99.1
  set interfaces tunnel tun0 remote-ip 192.168.99.2

On the RIGHT:

.. code-block:: none

  set interfaces loopback lo address 192.168.99.2/32

  set interfaces tunnel tun0 encapsulation gre
  set interfaces tunnel tun0 address 10.10.10.2/30
  set interfaces tunnel tun0 local-ip 192.168.99.2
  set interfaces tunnel tun0 remote-ip 192.168.99.1

**Setting up IPSec**

However, now you need to make IPsec work with dynamic address on one side. The
tricky part is that pre-shared secret authentication doesn't work with dynamic
address, so we'll have to use RSA keys.

First, on both routers run the operational command "generate vpn rsa-key bits
2048". You may choose different length than 2048 of course.

.. code-block:: none

  vyos@left# run generate vpn rsa-key bits 2048
  Generating rsa-key to /config/ipsec.d/rsa-keys/localhost.key

  Your new local RSA key has been generated
  The public portion of the key is:

  0sAQO2335[long string here]

Then on the opposite router, add the RSA key to your config.

.. code-block:: none

  set vpn rsa-keys rsa-key-name LEFT rsa-key KEYGOESHERE

Now you are ready to setup IPsec. You'll need to use an ID instead of address
for the peer on the dynamic side.

On the LEFT (static address):

.. code-block:: none

  set vpn rsa-keys rsa-key-name RIGHT rsa-key <PUBLIC KEY FROM THE RIGHT>

  set vpn ipsec ipsec-interfaces interface eth0

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer @RIGHT authentication mode rsa
  set vpn ipsec site-to-site peer @RIGHT authentication rsa-key-name RIGHT
  set vpn ipsec site-to-site peer @RIGHT default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer @RIGHT ike-group MyIKEGroup
  set vpn ipsec site-to-site peer @RIGHT local-address 192.0.2.10
  set vpn ipsec site-to-site peer @RIGHT connection-type respond
  set vpn ipsec site-to-site peer @RIGHT tunnel 1 local prefix 192.168.99.1/32  # Additional loopback address on the local
  set vpn ipsec site-to-site peer @RIGHT tunnel 1 remote prefix 192.168.99.2/32 # Additional loopback address on the remote


On the RIGHT (dynamic address):

.. code-block:: none

  set vpn rsa-keys rsa-key-name LEFT rsa-key <PUBLIC KEY FROM THE LEFT>

  set vpn ipsec ipsec-interfaces interface eth0

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer 192.0.2.10 authentication id @RIGHT
  set vpn ipsec site-to-site peer 192.0.2.10 authentication mode rsa
  set vpn ipsec site-to-site peer 192.0.2.10 authentication rsa-key-name LEFT
  set vpn ipsec site-to-site peer 192.0.2.10 remote-id @LEFT
  set vpn ipsec site-to-site peer 192.0.2.10 connection-type initiate
  set vpn ipsec site-to-site peer 192.0.2.10 default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer 192.0.2.10 ike-group MyIKEGroup
  set vpn ipsec site-to-site peer 192.0.2.10 local-address any
  set vpn ipsec site-to-site peer 192.0.2.10 tunnel 1 local prefix 192.168.99.2/32  # Additional loopback address on the local
  set vpn ipsec site-to-site peer 192.0.2.10 tunnel 1 remote prefix 192.168.99.1/32 # Additional loopback address on the remote
