.. _size2site_ipsec:

Site-to-Site
============

Site-to-site mode provides a way to add remote peers, which could be configured
to exchange encrypted information between them and VyOS itself or
connected/routed networks.

To configure site-to-site connection you need to add peers with the
``set vpn ipsec site-to-site peer <name>`` command.

The peer name must be an alphanumeric and can have hypen or underscore as
special characters. It is purely informational.

Each site-to-site peer has the next options:

* ``authentication`` - configure authentication between VyOS and a remote peer.
  If pre-shared-secret mode is used, the secret key must be defined in 
  ``set vpn ipsec authentication`` and suboptions:

 * ``psk`` - Preshared secret key name:

  * ``dhcp-interface`` - ID for authentication generated from DHCP address
    dynamically;
  * ``id`` - static ID's for authentication. In general local and remote
    address ``<x.x.x.x>``, ``<h:h:h:h:h:h:h:h>`` or ``%any``;
  * ``secret`` - predefined shared secret. Used if configured mode
    ``pre-shared-secret``;


 * ``local-id`` - ID for the local VyOS router. If defined, during the
   authentication
   it will be send to remote peer;

 * ``mode`` - mode for authentication between VyOS and remote peer:

  * ``pre-shared-secret`` - use predefined shared secret phrase;

  * ``rsa`` - use simple shared RSA key.

  * ``x509`` - use certificates infrastructure for authentication.

 * ``remote-id`` - define an ID for remote peer, instead of using peer name or
   address. Useful in case if the remote peer is behind NAT or if ``mode x509``
   is used;

 * ``rsa`` - options for RSA authentication mode:

  * ``local-key`` - name of PKI key-pair with local private key

  * ``remote-key`` - name of PKI key-pair with remote public key

  * ``passphrase`` - local private key passphrase

 * ``use-x509-id`` - use local ID from x509 certificate. Cannot be used when
   ``id`` is defined;

 * ``x509`` - options for x509 authentication mode:

  * ``ca-certificate`` - CA certificate in PKI configuration. Using for 
    authenticating remote peer;

  * ``certificate`` - certificate file in PKI configuration, which will be used
    for authenticating local router on remote peer;

  * ``passphrase`` - private key passphrase, if needed.

* ``connection-type`` - how to handle this connection process. Possible
  variants:

 * ``initiate`` - does initial connection to remote peer immediately after
   configuring and after boot. In this mode the connection will not be restarted
   in case of disconnection, therefore should be used only together with DPD or
   another session tracking methods;

 * ``respond`` - does not try to initiate a connection to a remote peer. In this
   mode, the IPSec session will be established only after initiation from a
   remote peer. Could be useful when there is no direct connectivity to the
   peer due to firewall or NAT in the middle of the local and remote side.

 * ``none`` - loads the connection only, which then can be manually initiated or
   used as a responder configuration.

* ``default-esp-group`` - ESP group to use by default for traffic encryption.
  Might be overwritten by individual settings for tunnel or VTI interface
  binding;

* ``description`` - description for this peer;

* ``dhcp-interface`` - use an IP address, received from DHCP for IPSec
  connection with this peer, instead of ``local-address``;

* ``force-udp-encapsulation`` - force encapsulation of ESP into UDP datagrams.
  Useful in case if between local and remote side is firewall or NAT, which not
  allows passing plain ESP packets between them;

* ``ike-group`` - IKE group to use for key exchanges;

* ``ikev2-reauth`` - reauthenticate remote peer during the rekeying process.
  Can be used only with IKEv2.
  Create a new IKE_SA from the scratch and try to recreate all IPsec SAs;

* ``local-address`` - local IP address for IPSec connection with this peer.
  If defined ``any``, then an IP address which configured on interface with
  default route will be used;

* ``remote-address`` - remote IP address or hostname for IPSec connection.
  IPv4 or IPv6 address is used when a peer has a public static IP address.
  Hostname is a DNS name which could be used when a peer has a public IP
  address and DNS name, but an IP address could be changed from time to time.

* ``replay-window`` - IPsec replay window to configure for this CHILD_SA 
  (default: 32), a value of 0 disables IPsec replay protection

* ``tunnel`` - define criteria for traffic to be matched for encrypting and send
  it to a peer:

 * ``disable`` - disable this tunnel;

 * ``esp-group`` - define ESP group for encrypt traffic, defined by this tunnel;

 * ``local`` - define a local source for match traffic, which should be
   encrypted and send to this peer:

  * ``port`` - define port. Have effect only when used together with ``prefix``;

  * ``prefix`` - IP network at local side.

 * ``priority`` - Add priority for policy-based IPSec VPN tunnels(lowest value 
   more preferable)

 * ``protocol`` - define the protocol for match traffic, which should be
   encrypted and send to this peer;

 * ``remote`` - define the remote destination for match traffic, which should be
   encrypted and send to this peer:

  * ``port`` - define port. Have effect only when used together with ``prefix``;

  * ``prefix`` - IP network at remote side.

* ``vti`` - use a VTI interface for traffic encryption. Any traffic, which will
  be send to VTI interface will be encrypted and send to this peer. Using VTI
  makes IPSec configuration much flexible and easier in complex situation, and
  allows to dynamically add/delete remote networks, reachable via a peer, as in
  this mode router don't need to create additional SA/policy for each remote
  network:

 * ``bind`` - select a VTI interface to bind to this peer;

 * ``esp-group`` - define ESP group for encrypt traffic, passed this VTI
   interface.

* ``virtual-address`` - Defines a virtual IP address which is requested by the
  initiator and one or several IPv4 and/or IPv6 addresses are assigned from
  multiple pools by the responder.

Examples:
------------------

IKEv1
^^^^^

Example:

* WAN interface on `eth1`
* left subnet: `192.168.0.0/24` site1, server side (i.e. locality, actually
  there is no client or server roles)
* left local_ip: `198.51.100.3` # server side WAN IP
* right subnet: `10.0.0.0/24` site2,remote office side
* right local_ip: `203.0.113.2` # remote office side WAN IP

.. code-block:: none

  # server config
  set vpn ipsec authentication psk OFFICE-B id '198.51.100.3'
  set vpn ipsec authentication psk OFFICE-B id '203.0.113.2'
  set vpn ipsec authentication psk OFFICE-B secret 'SomePreSharedKey'
  set vpn ipsec esp-group office-srv-esp lifetime '1800'
  set vpn ipsec esp-group office-srv-esp mode 'tunnel'
  set vpn ipsec esp-group office-srv-esp pfs 'enable'
  set vpn ipsec esp-group office-srv-esp proposal 1 encryption 'aes256'
  set vpn ipsec esp-group office-srv-esp proposal 1 hash 'sha1'
  set vpn ipsec ike-group office-srv-ike key-exchange 'ikev1'
  set vpn ipsec ike-group office-srv-ike lifetime '3600'
  set vpn ipsec ike-group office-srv-ike proposal 1 encryption 'aes256'
  set vpn ipsec ike-group office-srv-ike proposal 1 hash 'sha1'
  set vpn ipsec interface 'eth1'
  set vpn ipsec site-to-site peer OFFICE-B authentication local-id '198.51.100.3'
  set vpn ipsec site-to-site peer OFFICE-B authentication mode 'pre-shared-secret'
  set vpn ipsec site-to-site peer OFFICE-B authentication remote-id '203.0.113.2'
  set vpn ipsec site-to-site peer OFFICE-B ike-group 'office-srv-ike'
  set vpn ipsec site-to-site peer OFFICE-B local-address '198.51.100.3'
  set vpn ipsec site-to-site peer OFFICE-B remote-address '203.0.113.2'
  set vpn ipsec site-to-site peer OFFICE-B tunnel 0 esp-group 'office-srv-esp'
  set vpn ipsec site-to-site peer OFFICE-B tunnel 0 local prefix '192.168.0.0/24'
  set vpn ipsec site-to-site peer OFFICE-B tunnel 0 remote prefix '10.0.0.0/21'

  # remote office config
  set vpn ipsec authentication psk OFFICE-A id '198.51.100.3'
  set vpn ipsec authentication psk OFFICE-A id '203.0.113.2'
  set vpn ipsec authentication psk OFFICE-A secret 'SomePreSharedKey'
  set vpn ipsec esp-group office-srv-esp lifetime '1800'
  set vpn ipsec esp-group office-srv-esp mode 'tunnel'
  set vpn ipsec esp-group office-srv-esp pfs 'enable'
  set vpn ipsec esp-group office-srv-esp proposal 1 encryption 'aes256'
  set vpn ipsec esp-group office-srv-esp proposal 1 hash 'sha1'
  set vpn ipsec ike-group office-srv-ike key-exchange 'ikev1'
  set vpn ipsec ike-group office-srv-ike lifetime '3600'
  set vpn ipsec ike-group office-srv-ike proposal 1 encryption 'aes256'
  set vpn ipsec ike-group office-srv-ike proposal 1 hash 'sha1'
  set vpn ipsec interface 'eth1'
  set vpn ipsec site-to-site peer OFFICE-A authentication local-id '203.0.113.2'
  set vpn ipsec site-to-site peer OFFICE-A authentication mode 'pre-shared-secret'
  set vpn ipsec site-to-site peer OFFICE-A authentication remote-id '198.51.100.3'
  set vpn ipsec site-to-site peer OFFICE-A ike-group 'office-srv-ike'
  set vpn ipsec site-to-site peer OFFICE-A local-address '203.0.113.2'
  set vpn ipsec site-to-site peer OFFICE-A remote-address '198.51.100.3'
  set vpn ipsec site-to-site peer OFFICE-A tunnel 0 esp-group 'office-srv-esp'
  set vpn ipsec site-to-site peer OFFICE-A tunnel 0 local prefix '10.0.0.0/21'
  set vpn ipsec site-to-site peer OFFICE-A tunnel 0 remote prefix '192.168.0.0/24'

Show status of new setup:

.. code-block:: none

  vyos@srv-gw0:~$ show vpn ike sa
  Peer ID / IP                            Local ID / IP
  ------------                            -------------
  203.0.113.2                                 198.51.100.3
     State  Encrypt  Hash    D-H Grp  NAT-T  A-Time  L-Time
     -----  -------  ----    -------  -----  ------  ------
     up     aes256   sha1    5        no     734     3600

  vyos@srv-gw0:~$ show vpn ipsec sa
  Peer ID / IP                            Local ID / IP
  ------------                            -------------
  203.0.113.2                                 198.51.100.3
     Tunnel  State  Bytes Out/In   Encrypt  Hash    NAT-T  A-Time  L-Time  Proto
     ------  -----  -------------  -------  ----    -----  ------  ------  -----
     0       up     7.5M/230.6K    aes256   sha1    no     567     1800    all

If there is SNAT rules on eth1, need to add exclude rule

.. code-block:: none

  # server side
  set nat source rule 10 destination address '10.0.0.0/24'
  set nat source rule 10 'exclude'
  set nat source rule 10 outbound-interface name 'eth1'
  set nat source rule 10 source address '192.168.0.0/24'

  # remote office side
  set nat source rule 10 destination address '192.168.0.0/24'
  set nat source rule 10 'exclude'
  set nat source rule 10 outbound-interface name 'eth1'
  set nat source rule 10 source address '10.0.0.0/24'

To allow traffic to pass through to clients, you need to add the following
rules. (if you used the default configuration at the top of this page)

.. code-block:: none

  # server side
  set firewall name OUTSIDE-LOCAL rule 32 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 32 source address '10.0.0.0/24'

  # remote office side
  set firewall name OUTSIDE-LOCAL rule 32 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 32 source address '192.168.0.0/24'

IKEv2
^^^^^

Example:

* left local_ip: 192.168.0.10 # VPN Gateway, behind NAT device
* left public_ip:172.18.201.10
* right local_ip: 172.18.202.10 # right side WAN IP

Imagine the following topology

.. figure:: /_static/images/vpn_s2s_ikev2_c.png
   :scale: 50 %
   :alt: IPSec IKEv2 site2site VPN

   IPSec IKEv2 site2site VPN (source ./draw.io/vpn_s2s_ikev2.drawio)

**LEFT:**
* WAN interface on `eth0.201`
* `eth0.201` interface IP: `172.18.201.10/24`
* `vti10` interface IP: `10.0.0.2/31`
* `dum0` interface IP: `10.0.11.1/24` (for testing purposes)

**RIGHT:**
* WAN interface on `eth0.202`
* `eth0.201` interface IP: `172.18.202.10/24`
* `vti10` interface IP: `10.0.0.3/31`
* `dum0` interface IP: `10.0.12.1/24` (for testing purposes)

.. note:: Don't get confused about the used /31 tunnel subnet. :rfc:`3021`
   gives you additional information for using /31 subnets on point-to-point
   links.

**LEFT**

.. code-block:: none

  set interfaces ethernet eth0 vif 201 address '172.18.201.10/24'
  set interfaces dummy dum0 address '10.0.11.1/24'
  set interfaces vti vti10 address '10.0.0.2/31'

  set vpn ipsec authentication psk peer_172-18-202-10 id '172.18.201.10'
  set vpn ipsec authentication psk peer_172-18-202-10 id '172.18.202.10'
  set vpn ipsec authentication psk peer_172-18-202-10 secret 'secretkey'
  set vpn ipsec esp-group ESP_DEFAULT lifetime '3600'
  set vpn ipsec esp-group ESP_DEFAULT mode 'tunnel'
  set vpn ipsec esp-group ESP_DEFAULT pfs 'dh-group19'
  set vpn ipsec esp-group ESP_DEFAULT proposal 10 encryption 'aes256gcm128'
  set vpn ipsec esp-group ESP_DEFAULT proposal 10 hash 'sha256'
  set vpn ipsec ike-group IKEv2_DEFAULT close-action 'none'
  set vpn ipsec ike-group IKEv2_DEFAULT dead-peer-detection action 'trap'
  set vpn ipsec ike-group IKEv2_DEFAULT dead-peer-detection interval '30'
  set vpn ipsec ike-group IKEv2_DEFAULT dead-peer-detection timeout '120'
  set vpn ipsec ike-group IKEv2_DEFAULT disable-mobike
  set vpn ipsec ike-group IKEv2_DEFAULT key-exchange 'ikev2'
  set vpn ipsec ike-group IKEv2_DEFAULT lifetime '10800'
  set vpn ipsec ike-group IKEv2_DEFAULT proposal 10 dh-group '19'
  set vpn ipsec ike-group IKEv2_DEFAULT proposal 10 encryption 'aes256gcm128'
  set vpn ipsec ike-group IKEv2_DEFAULT proposal 10 hash 'sha256'
  set vpn ipsec interface 'eth0.201'
  set vpn ipsec site-to-site peer peer_172-18-202-10 authentication local-id '172.18.201.10'
  set vpn ipsec site-to-site peer peer_172-18-202-10 authentication mode 'pre-shared-secret'
  set vpn ipsec site-to-site peer peer_172-18-202-10 authentication remote-id '172.18.202.10'
  set vpn ipsec site-to-site peer peer_172-18-202-10 connection-type 'initiate'
  set vpn ipsec site-to-site peer peer_172-18-202-10 ike-group 'IKEv2_DEFAULT'
  set vpn ipsec site-to-site peer peer_172-18-202-10 ikev2-reauth 'inherit'
  set vpn ipsec site-to-site peer peer_172-18-202-10 local-address '172.18.201.10'
  set vpn ipsec site-to-site peer peer_172-18-202-10 remote-address '172.18.202.10'
  set vpn ipsec site-to-site peer peer_172-18-202-10 vti bind 'vti10'
  set vpn ipsec site-to-site peer peer_172-18-202-10 vti esp-group 'ESP_DEFAULT'

  set protocols static interface-route 10.0.12.0/24 next-hop-interface vti10

**RIGHT**

.. code-block:: none

  set interfaces ethernet eth0 vif 202 address '172.18.202.10/24'
  set interfaces dummy dum0 address '10.0.12.1/24'
  set interfaces vti vti10 address '10.0.0.3/31'

  set vpn ipsec authentication psk peer_172-18-201-10 id '172.18.202.10'
  set vpn ipsec authentication psk peer_172-18-201-10 id '172.18.201.10'
  set vpn ipsec authentication psk peer_172-18-201-10 secret 'secretkey'
  set vpn ipsec esp-group ESP_DEFAULT lifetime '3600'
  set vpn ipsec esp-group ESP_DEFAULT mode 'tunnel'
  set vpn ipsec esp-group ESP_DEFAULT pfs 'dh-group19'
  set vpn ipsec esp-group ESP_DEFAULT proposal 10 encryption 'aes256gcm128'
  set vpn ipsec esp-group ESP_DEFAULT proposal 10 hash 'sha256'
  set vpn ipsec ike-group IKEv2_DEFAULT close-action 'none'
  set vpn ipsec ike-group IKEv2_DEFAULT dead-peer-detection action 'trap'
  set vpn ipsec ike-group IKEv2_DEFAULT dead-peer-detection interval '30'
  set vpn ipsec ike-group IKEv2_DEFAULT dead-peer-detection timeout '120'
  set vpn ipsec ike-group IKEv2_DEFAULT disable-mobike
  set vpn ipsec ike-group IKEv2_DEFAULT key-exchange 'ikev2'
  set vpn ipsec ike-group IKEv2_DEFAULT lifetime '10800'
  set vpn ipsec ike-group IKEv2_DEFAULT proposal 10 dh-group '19'
  set vpn ipsec ike-group IKEv2_DEFAULT proposal 10 encryption 'aes256gcm128'
  set vpn ipsec ike-group IKEv2_DEFAULT proposal 10 hash 'sha256'
  set vpn ipsec interface 'eth0.202'
  set vpn ipsec site-to-site peer peer_172-18-201-10 authentication local-id '172.18.202.10'
  set vpn ipsec site-to-site peer peer_172-18-201-10 authentication mode 'pre-shared-secret'
  set vpn ipsec site-to-site peer peer_172-18-201-10 authentication remote-id '172.18.201.10'
  set vpn ipsec site-to-site peer peer_172-18-201-10 connection-type 'initiate'
  set vpn ipsec site-to-site peer peer_172-18-201-10 ike-group 'IKEv2_DEFAULT'
  set vpn ipsec site-to-site peer peer_172-18-201-10 ikev2-reauth 'inherit'
  set vpn ipsec site-to-site peer peer_172-18-201-10 local-address '172.18.202.10'
  set vpn ipsec site-to-site peer peer_172-18-201-10 remote-address '172.18.201.10'
  set vpn ipsec site-to-site peer peer_172-18-201-10 vti bind 'vti10'
  set vpn ipsec site-to-site peer peer_172-18-201-10 vti esp-group 'ESP_DEFAULT'

  set protocols static interface-route 10.0.11.0/24 next-hop-interface vti10

Key Parameters:

* ``authentication local-id/remote-id`` - IKE identification is used for
  validation of VPN peer devices during IKE negotiation. If you do not configure
  local/remote-identity, the device uses the IPv4 or IPv6 address that
  corresponds to the local/remote peer by default.
  In certain network setups (like ipsec interface with dynamic address, or
  behind the NAT ), the IKE ID received from the peer does not match the IKE
  gateway configured on the device. This can lead to a Phase 1 validation
  failure.
  So, make sure to configure the local/remote id explicitly and ensure that the
  IKE ID is the same as the remote-identity configured on the peer device.

* ``disable-route-autoinstall`` - This option when configured disables the
  routes installed in the default table 220 for site-to-site ipsec.
  It is mostly used with VTI configuration.

* ``dead-peer-detection action = clear | trap | restart`` - R_U_THERE
  notification messages(IKEv1) or empty INFORMATIONAL messages (IKEv2)
  are periodically sent in order to check the liveliness of the IPsec peer. The
  values clear, trap, and restart all activate DPD and determine the action to
  perform on a timeout.
  With ``clear`` the connection is closed with no further actions taken.
  ``trap`` installs a trap policy, which will catch matching traffic and tries
  to re-negotiate the connection on demand.
  ``restart`` will immediately trigger an attempt to re-negotiate the
  connection.

* ``close-action = none | clear | trap | start`` - defines the action to take
  if the remote peer unexpectedly closes a CHILD_SA (see above for meaning of
  values). A closeaction should not be used if the peer uses reauthentication or
  uniqueids.

  When the close-action option is set on the peers, the connection-type
  of each peer has to considered carefully. For example, if the option is set
  on both peers, then both would attempt to initiate and hold open multiple
  copies of each child SA. This might lead to instability of the device or
  cpu/memory utilization.

  Below flow-chart could be a quick reference for the close-action
  combination depending on how the peer is configured.

.. figure:: /_static/images/IPSec_close_action_settings.jpg

  Similar combinations are applicable for the dead-peer-detection.
