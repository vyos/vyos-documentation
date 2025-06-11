.. _openvpn:

#######
OpenVPN
#######

Traditionally hardware routers implement IPsec exclusively due to relative
ease of implementing it in hardware and insufficient CPU power for doing
encryption in software. Since VyOS is a software router, this is less of a
concern. OpenVPN has been widely used on the UNIX platform for a long time and
is a popular option for remote access VPN, though it's also capable of
site-to-site connections.

Advantages of OpenVPN are:

* It uses a single TCP or UDP connection and does not rely on packet source
  addresses, so it will work even through a double NAT: perfect for public
  hotspots and such

* It's easy to setup and offers very flexible split tunneling

* There's a variety of client GUI frontends for any platform

Disadvantages are:

* It's slower than IPsec due to higher protocol overhead and the fact it runs
  in user mode while IPsec, on Linux, is in kernel mode

* None of the operating systems have client software installed by default

In the VyOS CLI, a key point often overlooked is that rather than being
configured using the `set vpn` stanza, OpenVPN is configured as a network
`interface using `set interfaces openvpn`.

*************
Configuration
*************

.. cfgcmd:: set interfaces openvpn <interface> authentication password  <text> 

   Provide a password for auth-user-pass authentication method (client-only option)

.. cfgcmd:: set interfaces openvpn <interface> authentication username  <text>

   Provide a username for auth-user-pass authentication method (client-only option)

.. cfgcmd:: set interfaces openvpn <interface> description <description>

   set description <text> for openvpn interface being configured

.. cfgcmd:: set interfaces openvpn <interface> device-type  <tap | tun>
 
   * ``tun`` - devices encapsulate IPv4 or IPv6 (OSI Layer 3), default value
   * ``tap`` - devices encapsulate Ethernet 802.3 (OSI Layer 2).

.. cfgcmd:: set interfaces openvpn <interface> disable

   Administratively disable interface

.. cfgcmd:: set interfaces openvpn <interface> encryption <cipher | data-ciphers> < 3des | aes128 | aes128gcm | none | ...> 
 
   * ``cipher`` - Standard Data Encryption Algorithm
   * ``data-ciphers`` - Cipher negotiation list for use in server or client mode

.. cfgcmd:: set interfaces openvpn <interface> hash <md5 | sha1 | sha256 | ...> 

   Configure a secure hash algorithm

.. cmdinclude:: /_include/interface-ip.txt
   :var0: openvpn
   :var1: vtun0

.. cmdinclude:: /_include/interface-ipv6.txt
   :var0: openvpn
   :var1: vtun0

.. cfgcmd:: set interfaces openvpn <interface> keep-alive failure-count <value>

   Maximum number of keepalive packet failures. The default value is 60

.. cfgcmd:: set interfaces openvpn <interface> keep-alive interval <value>

   Send keepalive packet every interval seconds. Default value is 10

.. cfgcmd:: set interfaces openvpn <interface> local-address <address>
 
   Define local IP address of tunnel (site-to-site mode only)

.. cfgcmd:: set interfaces openvpn <interface> local-host <address>

   Local IP address to accept connections. If specified, OpenVPN will bind to 
   this address only. If unspecified, OpenVPN will bind to all interfaces.

.. cfgcmd:: set interfaces openvpn <interface> local-port <port>

   Define local port number to accept connections

.. cfgcmd:: set interfaces openvpn <interface> mirror egress <monitor-interface>

   Configure port mirroring for interface outbound traffic and copy the traffic 
   to monitor-interface

.. cfgcmd:: set interfaces openvpn <interface> mirror ingress <monitor-interface>

   Configure port mirroring for interface inbound traffic and copy the traffic 
   to monitor-interface

.. cfgcmd:: set interfaces openvpn <interface> mode <site-to-site | server | client>

   Define a mode for OpenVPN operation

   * **site-to-site** - enables site-to-site VPN connection
   * **client** - acts as client in server-client mode
   * **server** - acts as server in server-client mode

.. cfgcmd:: set interfaces openvpn <interface> offload dco

   OpenVPN Data Channel Offload (DCO) enables significant performance enhancement
   in encrypted OpenVPN data processing. By minimizing context switching for each
   packet, DCO effectively reduces overhead. This optimization is achieved by
   keeping most data handling tasks within the kernel, avoiding frequent switches
   between kernel and user space for encryption and packet handling.

   As a result, the processing of each packet becomes more efficient, 
   potentially leveraging hardware encryption offloading support available in 
   the kernel.

   .. note:: OpenVPN DCO is not a fully supported OpenVPN feature, and is currently
      considered experimental. Furthermore, there are certain OpenVPN features and
      use cases that remain incompatible with DCO. To get a comprehensive
      understanding of the limitations associated with DCO, refer to the list of
      known limitations in the documentation.

      https://community.openvpn.net/openvpn/wiki/DataChannelOffload/Features


   Enabling OpenVPN DCO
   ====================

   DCO support is a per-tunnel option and it is not automatically enabled by
   default for new or upgraded tunnels. Existing tunnels will continue to function
   as they have in the past.

   DCO can be enabled for both new and existing tunnels. VyOS adds an option in
   each tunnel configuration where we can enable this function. The current best
   practice is to create a new tunnel with DCO to minimize the chance of problems
   with existing clients.

   Example:

   .. code-block:: none

     set interfaces openvpn vtun0 offload dco

   Enable OpenVPN Data Channel Offload feature by loading the appropriate kernel
   module.

   Disabled by default - no kernel module loaded.

   .. note:: Enable this feature causes an interface reset.
 
.. cfgcmd:: set interfaces openvpn <interface> openvpn-option <text>
 
   OpenVPN has a lot of options, all of them are not included in VyOS CLI. 
   If an option is missing, a feature request may be opened at Phabricator_ so 
   all users can benefit from it (see :ref:`issues_features`). Alternatively,
   use ``openvpn-option`` for passing raw OpenVPN options to openvpn.conf file.  

   .. note:: Please use this only as last resort - things might break and OpenVPN 
      won’t start if you pass invalid options/syntax. Check system logs for errors.

   Example:

   .. code-block:: none 

     set interfaces openvpn vtun0 openvpn-option 'persist-key'

   This will add ``persist-key`` to the generated OpenVPN configuration. This 
   option solves the problem by persisting keys across resets, so they 
   don't need to be re-read.

   .. code-block:: none

     set interfaces openvpn vtun0 openvpn-option 'route-up &quot;/config/auth/tun_up.sh arg1&quot;'

   This will add ``route-up "/config/auth/tun_up.sh arg1"`` to the generated OpenVPN
   config file. This option is executed after connection authentication, either
   immediately after, or some number of seconds after as defined. The path and 
   arguments need to be single- or double-quoted.

   .. note:: Sometimes option lines in the generated OpenVPN configuration require
      quotes. This is done through a hack on our config generator. You can pass
      quotes using the ``&quot;`` statement.

.. cfgcmd:: set interfaces openvpn <interface> persistent-tunnel

   This option prevents the TUN/TAP device from closing or reopening on 
   connection resets or daemon reloads.

.. cfgcmd:: set interfaces openvpn <interface> protocol <udp | tcp-passive | tcp-active >

   Define a protocol for OpenVPN communication with remote host

 * **udp** - default protocol is udp when not defined
 * **tcp-passive** - TCP protocol and accepts connections passively
 * **tcp-active** - TCP protocol and initiates connections actively

.. cfgcmd:: set interfaces openvpn <interface> redirect <interface>

   This option redirects incoming packets to destination

.. cfgcmd:: set interfaces openvpn <interface> remote-address <address>

   Define remote IP address of tunnel (site-to-site mode only)

.. cfgcmd:: set interfaces openvpn <interface> remote-host <address | host>

   Define an IPv4/IPv6 address or hostname of server device if OpenVPN is being 
   run in client mode, and is undefined in server mode.

.. cfgcmd:: set interfaces openvpn <interface> remote-port <port>

   Define a remote port number to connect to server

.. cfgcmd:: set interfaces openvpn <interface> replace-default-route 

   This option will make OpenVPN tunnel to be used as the default route   

.. cfgcmd:: set interfaces openvpn <interface> server bridge disable

   Disable the given instance.

.. cfgcmd:: set interfaces openvpn <interface> server bridge gateway <ipv4 address>

   Define a gateway ip address

.. cfgcmd:: set interfaces openvpn <interface> server bridge start <ipv4 address>

   First IP address in the pool to allocate to connecting clients

.. cfgcmd:: set interfaces openvpn <interface> server bridge stop <ipv4 address>

   Last IP address in the pool to allocate to connecting clients

.. cfgcmd:: set interfaces openvpn <interface> server bridge subnet-mask <ipv4 subnet mask>

   Define subnet mask pushed to dynamic clients.

.. cfgcmd:: set interfaces openvpn <interface> server client <name>

   Define the common name specified in client certificate

.. cfgcmd:: set interfaces openvpn <interface> server client <name> disable

   Disable the client connection

.. cfgcmd:: set interfaces openvpn <interface> server client <name> ip <address>

   Set a specific IPv4/IPv6 address to the client

.. cfgcmd:: set interfaces openvpn <interface> server client <name> push-route <subnet>

   Define a route to be pushed to a specific client 

.. cfgcmd:: set interfaces openvpn <interface> server client <name> subnet <subnet>

   Define this option to route a fixed subnet from the server to a particular 
   client. Used as OpenVPN iroute directive.

.. cfgcmd:: set interfaces openvpn <interface> server client-ip-pool start <address>

   Define a first IP address from IPv4 pool of subnet to be dynamically 
   allocated to connecting clients   

.. cfgcmd:: set interfaces openvpn <interface> server client-ip-pool stop <address>

   Define a last IP address from IPv4 pool of subnet to be dynamically allocated 
   to connecting clients

.. cfgcmd:: set interfaces openvpn <interface> server client-ip-pool subnet <netmask>

   Define a subnet mask pushed to dynamic clients. This option is only used for 
   device type tap, not to be used with bridged interfaces.

.. cfgcmd:: set interfaces openvpn <interface> server client-ipv6-pool base <ipv6addr/bits>

   Define an IPv6 address pool for dynamic assignment to clients

.. cfgcmd:: set interfaces openvpn <interface> server domain-name <name>

   DNS suffix to be pushed to all clients

.. cfgcmd:: set interfaces openvpn <interface> server max-connections <1-4096>

   Define the maximum number of client connections

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp challenge <enable | disable>

   If set to enable, openvpn-otp will expect password as result of challenge/
   response protocol.

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp digits <1-65535>

   Configure number of digits to use for totp hash (default: 6)

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp drift <1-65535>

   Configure time drift in seconds (default: 0)

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp slop <1-65535>

   Configure maximum allowed clock slop in seconds (default: 180)

.. cfgcmd:: set interfaces openvpn <interface> server mfa totp step <1-65535>

   Configure step value for totp in seconds (default: 30)

.. cfgcmd:: set interfaces openvpn <interface> server name-server <address>

   Define Client DNS configuration to be used with the connection

.. cfgcmd:: set interfaces openvpn <interface> server push-route <subnet>

   Define a route to be pushed to all clients   

.. cfgcmd:: set interfaces openvpn <interface> server reject-unconfigured-client

   Reject connections from clients that are not explicitly configured 

.. cfgcmd:: set interfaces openvpn <interface> server subnet <subnet>

   Manadatory field to define in server mode, set ipv4 or ipv6 network

.. cfgcmd:: set interfaces openvpn <interface> server topology < net30 | point-to-point | subnet>

   Define virtual addressing topology when running in ``tun`` mode. This directive 
   has no meaning in ``tap`` mode, which always uses a subnet topology.

   * **subnet** - This topology is the current recommended and default topology.
     This mode allocates a single IP address per connecting client.
   * **net30** - This is the old topology for support with Windows clients, by 
     allocating one /30 subnet per client. It is effictively depcrecated.
   * **point-to-point** - Use a point-to-point topology where the remote endpoint
     of the client's tun interface always points to the local endpoint of the 
     server's tun interface. This mode allocates a single IP address per connecting 
     client. Only use when none of the connecting clients are Windows systems.


.. cfgcmd:: set interfaces openvpn <interface> shared-secret-key <key>

   Define a static secret key, used with site-to-site OpenVPN option only

.. cfgcmd:: set interfaces openvpn <interface> tls auth-key <key>

   Define a tls secret key for tls-auth which adds an additional HMAC signature 
   to all SSL/TLS handshake packets for integrity verification. Use ``run generate pki openvpn shared-secret install <name>`` to generate the key. 

.. cfgcmd:: set interfaces openvpn <interface> tls ca-certificate <name>

   Define Certificate Authority chain in PKI configuration

.. cfgcmd:: set interfaces openvpn <interface> tls certificate <name>

   Define a name of certificate in PKI configuration

.. cfgcmd:: set interfaces openvpn <interface> tls crypt-key

   Define a shared secret key to provide an additional level of security, 
   a variant similar to tls-auth

.. cfgcmd:: set interfaces openvpn <interface> tls dh-params

   Define Diffie Hellman parameters, required only on server mode 

.. cfgcmd:: set interfaces openvpn <interface> tls peer-fingerprint <text>

   Peer certificate SHA256 fingerprint, configured in site-to-site mode

.. cfgcmd:: set interfaces openvpn <interface> tls role <active | passive>

   Define a role for TLS negotiation, preferably used in site-to-site mode

   * **active** - Initiate TLS negotiation actively
   * **passive** - Wait for incoming TLS connection

.. cfgcmd:: set interfaces openvpn <interface> tls tls-version-min <1.0 | 1.1 | 1.2 | 1.4 >

   This option sets the minimum TLS version which will accept from the peer

.. cfgcmd:: set interfaces openvpn <interface>  use-lzo-compression

   Use fast LZO compression on this TUN/TAP interface

.. cfgcmd:: set interfaces openvpn <interface> vrf <name>

   Place interface in given VRF instance.

**************
Operation Mode
**************

.. opcmd:: show openvpn site-to-site

   Show tunnel status for OpenVPN site-to-site interfaces

.. opcmd:: show openvpn server

   Shows tunnel status for Openvpn server interfaces

.. opcmd:: show openvpn client

   Shows tunnel status for OpenVPN client interfaces

.. opcmd:: show log openvpn

   Show logs for all OpenVPN interfaces

.. opcmd:: show log openvpn interface <interface>

   Show logs for specific OpenVPN interface

.. opcmd:: reset openvpn client <text>

   Reset specified OpenVPN client

.. opcmd:: reset openvpn interface <interface>

   Reset OpenVPN process on specified interface

.. opcmd::  generate openvpn client-config interface <interface> ca <name> certificate <name> 

   Generate OpenVPN client configuration file in ovpn format to load in client machines

********
Examples
********

This section covers examples of OpenVPN configurations for various deployments.

.. toctree::
   :maxdepth: 1
   :includehidden:

   openvpn-examples

.. include:: /_include/common-references.txt
