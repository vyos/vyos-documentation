.. _ipsec:

#####
IPsec
#####

:abbr:`GRE (Generic Routing Encapsulation)`, GRE/IPsec (or IPIP/IPsec,
SIT/IPsec, or any other stateless tunnel protocol over IPsec) is the usual way
to protect the traffic inside a tunnel.

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

.. NOTE:: VMware users should ensure that a VMXNET3 adapter is used. E1000
  adapters have known issues with GRE processing.

**************************************
IKE (Internet Key Exchange) Attributes
**************************************
IKE performs mutual authentication between two parties and establishes 
an IKE security association (SA) that includes shared secret information 
that can be used to efficiently establish SAs for Encapsulating Security 
Payload (ESP) or Authentication Header (AH) and a set of cryptographic 
algorithms to be used by the SAs to protect the traffic that they carry.
https://datatracker.ietf.org/doc/html/rfc5996

In VyOS, IKE attributes are specified through IKE groups.
Multiple proposals can be specified in a single group.

VyOS IKE group has the next options:

* ``close-action`` defines the action to take if the remote peer unexpectedly 
  closes a CHILD_SA:

 * ``none`` set action to none (default);
 
 * ``hold`` set action to hold;
 
 * ``clear`` set action to clear;
 
 * ``restart`` set action to restart;
 
* ``dead-peer-detection`` controls the use of the Dead Peer Detection protocol 
  (DPD, RFC 3706) where R_U_THERE notification messages (IKEv1) or empty 
  INFORMATIONAL messages (IKEv2) are periodically sent in order to check the 
  liveliness of the IPsec peer:
  
 * ``action`` keep-alive failure action:
 
  * ``hold`` set action to hold (default)
  
  * ``clear`` set action to clear;
  
  * ``restart`` set action to restart;
  
 * ``interval`` keep-alive interval in seconds <2-86400> (default 30);
 
 * ``timeout`` keep-alive timeout in seconds <2-86400> (default 120) IKEv1 only
 
* ``ikev2-reauth`` whether rekeying of an IKE_SA should also reauthenticate 
  the peer. In IKEv1, reauthentication is always done:
  
 * ``yes`` enable remote host re-authentication during an IKE rekey;
 
 * ``no`` disable remote host re-authenticaton during an IKE rekey;
 
* ``key-exchange`` which protocol should be used to initialize the connection
  If not set both protocols are handled and connections will use IKEv2 when 
  initiating, but accept any protocol version when responding:
  
 * ``ikev1`` use IKEv1 for Key Exchange;
 
 * ``ikev2`` use IKEv2 for Key Exchange;
 
* ``lifetime`` IKE lifetime in seconds <30-86400> (default 28800);

* ``mobike`` enable MOBIKE Support. MOBIKE is only available for IKEv2:

 * ``enable`` enable MOBIKE (default for IKEv2);
 
 * ``disable`` disable MOBIKE;
 
* ``mode`` IKEv1 Phase 1 Mode Selection:

 * ``main`` use Main mode for Key Exchanges in the IKEv1 Protocol 
   (Recommended Default);
   
 * ``aggressive`` use Aggressive mode for Key Exchanges in the IKEv1 protocol 
   aggressive mode is much more insecure compared to Main mode;
   
* ``proposal`` the list of proposals and their parameters:

 * ``dh-group`` dh-group;
 
 * ``encryption`` encryption algorithm;

 * ``hash`` hash algorithm.

*************************
IPsec policy matching GRE
*************************

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

First, on both routers run the operational command "generate pki key-pair 
install <key-pair nam>>". You may choose different length than 2048 of course.

.. code-block:: none

  vyos@left# run generate pki key-pair install ipsec-LEFT
  Enter private key type: [rsa, dsa, ec] (Default: rsa)
  Enter private key bits: (Default: 2048)
  Note: If you plan to use the generated key on this router, do not encrypt the private key.
  Do you want to encrypt the private key with a passphrase? [y/N] N
  Configure mode commands to install key pair:
  Do you want to install the public key? [Y/n] Y
  set pki key-pair ipsec-LEFT public key 'MIIBIjANBgkqh...'
  Do you want to install the private key? [Y/n] Y
  set pki key-pair ipsec-LEFT private key 'MIIEvgIBADAN...'
  [edit]

Configuration commands for the private and public key will be displayed on the 
screen which needs to be set on the router first.
Note the command with the public key 
(set pki key-pair ipsec-LEFT public key 'MIIBIjANBgkqh...'). 
Then do the same on the opposite router:

.. code-block:: none

  vyos@left# run generate pki key-pair install ipsec-RIGHT

Note the command with the public key 
(set pki key-pair ipsec-RIGHT public key 'FAAOCAQ8AMII...'). 

Now the noted public keys should be entered on the opposite routers.

On the LEFT:

.. code-block:: none

  set pki key-pair ipsec-RIGHT public key 'FAAOCAQ8AMII...'

On the RIGHT:

.. code-block:: none

  set pki key-pair ipsec-LEFT public key 'MIIBIjANBgkqh...'

Now you are ready to setup IPsec. You'll need to use an ID instead of address
for the peer.

On the LEFT (static address):

.. code-block:: none

  set vpn ipsec interface eth0

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer @RIGHT authentication id LEFT
  set vpn ipsec site-to-site peer @RIGHT authentication mode rsa
  set vpn ipsec site-to-site peer @RIGHT authentication rsa local-key ipsec-LEFT
  set vpn ipsec site-to-site peer @RIGHT authentication rsa remote-key ipsec-RIGHT
  set vpn ipsec site-to-site peer @RIGHT authentication remote-id RIGHT
  set vpn ipsec site-to-site peer @RIGHT default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer @RIGHT ike-group MyIKEGroup
  set vpn ipsec site-to-site peer @RIGHT local-address 192.0.2.10
  set vpn ipsec site-to-site peer @RIGHT connection-type respond
  set vpn ipsec site-to-site peer @RIGHT tunnel 1 local prefix 192.168.99.1/32  # Additional loopback address on the local
  set vpn ipsec site-to-site peer @RIGHT tunnel 1 remote prefix 192.168.99.2/32 # Additional loopback address on the remote

On the RIGHT (dynamic address):

.. code-block:: none

  set vpn ipsec interface eth0

  set vpn ipsec esp-group MyESPGroup proposal 1 encryption aes128
  set vpn ipsec esp-group MyESPGroup proposal 1 hash sha1

  set vpn ipsec ike-group MyIKEGroup proposal 1 dh-group 2
  set vpn ipsec ike-group MyIKEGroup proposal 1 encryption aes128
  set vpn ipsec ike-group MyIKEGroup proposal 1 hash sha1

  set vpn ipsec site-to-site peer 192.0.2.10 authentication id RIGHT
  set vpn ipsec site-to-site peer 192.0.2.10 authentication mode rsa
  set vpn ipsec site-to-site peer 192.0.2.10 authentication rsa local-key ipsec-RIGHT
  set vpn ipsec site-to-site peer 192.0.2.10 authentication rsa remote-key ipsec-LEFT
  set vpn ipsec site-to-site peer 192.0.2.10 authentication remote-id LEFT
  set vpn ipsec site-to-site peer 192.0.2.10 connection-type initiate
  set vpn ipsec site-to-site peer 192.0.2.10 default-esp-group MyESPGroup
  set vpn ipsec site-to-site peer 192.0.2.10 ike-group MyIKEGroup
  set vpn ipsec site-to-site peer 192.0.2.10 local-address any
  set vpn ipsec site-to-site peer 192.0.2.10 tunnel 1 local prefix 192.168.99.2/32  # Additional loopback address on the local
  set vpn ipsec site-to-site peer 192.0.2.10 tunnel 1 remote prefix 192.168.99.1/32 # Additional loopback address on the remote
