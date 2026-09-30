---
lastproofread: '2026-09-30'
---

# Site-to-site

:::{todo}
Convert raw command blocks to `cfgcmd`/`opcmd` directives for command
coverage tracking.
:::

OpenVPN is popular for client-server setups, but site-to-site mode is less
common and is not supported by every router appliance. It provides a direct
way to establish tunnels between routers.

VyOS 1.4 and later supports pre-shared keys or X.509 certificates in
site-to-site mode.

VyOS deprecates static shared-key mode and plans to remove it in a future
release. Use TLS with certificates for new deployments.

This example configures OpenVPN with self-signed certificates, then covers
the deprecated shared-key mode for compatibility.

In both cases, we will use the following settings:

- The public IP address of the local VPN endpoint is 198.51.100.10.
- The public IP address of the remote VPN endpoint is 203.0.113.11.
- The tunnel uses `10.255.1.1` locally and `10.255.1.2` remotely.
- The local site has a subnet of 10.0.0.0/16.
- The remote site has a subnet of 10.1.0.0/16.
- OpenVPN uses port 1194 by default. This example uses port 1195 for the
  site-to-site tunnel.
- `persistent-tunnel` keeps the TUN/TAP device open when a client restarts.
- The active peer uses `remote-host` to initiate the connection. The passive
  peer waits for incoming connections.

![](/_static/images/openvpn_site2site_diagram.webp)

## Set up site-to-site certificates

You can use self-signed certificates with fingerprint verification instead
of setting up a Certificate Authority (CA). VyOS 1.4 and later supports this
site-to-site authentication method.

Generate a self-signed certificate on each router. Elliptic Curve (EC) keys
are supported. In configuration mode, run
`run generate pki certificate self-signed install <name>`. The command adds
the certificate to the candidate `pki` configuration; review and commit it.

``` none
vyos@vyos# run generate pki certificate self-signed install openvpn-local
Enter private key type: [rsa, dsa, ec] (Default: rsa) ec
Enter private key bits: (Default: 256)
Enter country code: (Default: GB)
Enter state: (Default: Some-State)
Enter locality: (Default: Some-City)
Enter organization name: (Default: VyOS)
Enter common name: (Default: vyos.io)
Do you want to configure Subject Alternative Names? [y/N]
Enter how many days certificate will be valid: (Default: 365)
Enter certificate type: (client, server) (Default: server)
Note: OpenVPN needs an unencrypted private key to start without interaction.
Do you want to encrypt the private key with a passphrase? [y/N]
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
[edit]

vyos@vyos# compare
[pki]
+ certificate openvpn-local {
+     certificate "<certificate data omitted>"
+     private {
+         key "<private key data omitted>"
+     }
+ }

[edit]

vyos@vyos# commit
```

You do not need to copy the peer certificate. Retrieve its SHA-256
fingerprint with this command, then configure that fingerprint on the other
router. VyOS accepts SHA-256 fingerprints for this setting.

``` none
vyos@vyos# run show pki certificate openvpn-local fingerprint sha256
<SHA-256 fingerprint>
```

::::{note}
Certificate names are arbitrary. This example uses `openvpn-local` and
`openvpn-remote`.
::::

Repeat the procedure on the other router.

## Set up site-to-site OpenVPN

Local configuration:

``` none
Configure the tunnel:

set interfaces openvpn vtun1 encryption data-ciphers-fallback aes256
set interfaces openvpn vtun1 mode site-to-site
set interfaces openvpn vtun1 protocol udp
set interfaces openvpn vtun1 persistent-tunnel
set interfaces openvpn vtun1 remote-host '203.0.113.11' # Remote endpoint
set interfaces openvpn vtun1 local-port '1195'
set interfaces openvpn vtun1 remote-port '1195'
set interfaces openvpn vtun1 local-address '10.255.1.1' # Local tunnel IP
set interfaces openvpn vtun1 remote-address '10.255.1.2' # Remote tunnel IP
set interfaces openvpn vtun1 tls certificate 'openvpn-local'
set interfaces openvpn vtun1 tls peer-fingerprint <remote fingerprint>
set interfaces openvpn vtun1 tls role active
```

Remote configuration:

``` none
set interfaces openvpn vtun1 encryption data-ciphers-fallback aes256
set interfaces openvpn vtun1 mode site-to-site
set interfaces openvpn vtun1 protocol udp
set interfaces openvpn vtun1 persistent-tunnel
set interfaces openvpn vtun1 local-port '1195'
set interfaces openvpn vtun1 local-address '10.255.1.2' # Local tunnel IP
set interfaces openvpn vtun1 remote-address '10.255.1.1' # Remote tunnel IP
set interfaces openvpn vtun1 tls certificate 'openvpn-remote'
set interfaces openvpn vtun1 tls peer-fingerprint <local fingerprint>
set interfaces openvpn vtun1 tls role passive
```


## Set up pre-shared keys

Static shared-key mode is retained for compatibility, but VyOS deprecates it
and plans to remove it in a future release. Use it only when the peer requires
this legacy mode; otherwise, configure TLS certificates.

In configuration mode, generate a key with
`run generate pki openvpn shared-secret install <name>`. This example uses
the name `s2s`.

``` none
vyos@local# run generate pki openvpn shared-secret install s2s
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
[edit]
vyos@local# compare
[pki openvpn shared-secret]
+ s2s {
+     key   "<shared key omitted>"
+     version "1"
+ }

[edit]

vyos@local# commit
[edit]
```

Next, install the key on the remote router:

``` none
vyos@remote# set pki openvpn shared-secret s2s key <generated key string>
```

Finally, configure the key in your OpenVPN interface settings:

``` none
set interfaces openvpn vtun1 shared-secret-key s2s
```


## Set up firewall exceptions

To allow OpenVPN traffic through the WAN interface, create a firewall
exception:

``` none
set firewall ipv4 name OUTSIDE_LOCAL rule 10 action 'accept'
set firewall ipv4 name OUTSIDE_LOCAL rule 10 description 'Allow established/related'
set firewall ipv4 name OUTSIDE_LOCAL rule 10 state 'established'
set firewall ipv4 name OUTSIDE_LOCAL rule 10 state 'related'
set firewall ipv4 name OUTSIDE_LOCAL rule 20 action 'accept'
set firewall ipv4 name OUTSIDE_LOCAL rule 20 description 'OpenVPN_IN'
set firewall ipv4 name OUTSIDE_LOCAL rule 20 destination port '1195'
set firewall ipv4 name OUTSIDE_LOCAL rule 20 log
set firewall ipv4 name OUTSIDE_LOCAL rule 20 protocol 'udp'
```

Apply the `OUTSIDE_LOCAL` chain to WAN traffic in the input filter. This
example assumes the WAN interface is `eth0`:

``` none
set firewall ipv4 input filter rule 10 action 'jump'
set firewall ipv4 input filter rule 10 inbound-interface name eth0
set firewall ipv4 input filter rule 10 jump-target OUTSIDE_LOCAL
```

Static routing:

Configure static routes through the tunnel interface. For example, if the
local network is `10.0.0.0/16` and the remote network is `10.1.0.0/16`, add
these routes:

Local configuration:

``` none
set protocols static route 10.1.0.0/16 interface vtun1
```

Remote configuration:

``` none
set protocols static route 10.0.0.0/16 interface vtun1
```

As with Ethernet interfaces, you can apply firewall policies to the tunnel
interface in the input, output, and forward directions.

For multiple tunnels, configure distinct endpoint addresses or ports so the
connections can be distinguished.

Verify OpenVPN status using the show openvpn operational commands.

``` none
vyos@vyos:~$ show openvpn site-to-site

OpenVPN status on vtun1

Client CN    Remote Host        Tunnel IP    Local Host    TX bytes    RX bytes    Connected Since
-----------  -----------------  -----------  ------------  ----------  ----------  -----------------
N/A          10.110.12.54:1195  N/A          N/A           504.0 B     656.0 B     N/A
```


### Server-client

In server-client mode, one server accepts multiple client connections. Clients
can route traffic through the server or reach networks behind it. This is a
common mode for router deployments.

## Set up server-client certificates

Server-client mode uses X.509 certificates and requires a PKI. VyOS commands
can generate a Certificate Authority (CA), server and client certificates,
and Diffie-Hellman parameters.

On the server, generate the CA and server certificate in configuration mode.
These commands add the generated objects to the candidate `pki` configuration.

Certificate Authority (CA):

``` none
vyos@vyos# run generate pki ca install ca-1
Enter private key type: [rsa, dsa, ec] (Default: rsa)
Enter private key bits: (Default: 2048)
Enter country code: (Default: GB)
Enter state: (Default: Some-State)
Enter locality: (Default: Some-City)
Enter organization name: (Default: VyOS)
Enter common name: (Default: vyos.io) ca-1
Enter how many days certificate will be valid: (Default: 1825)
Note: Protect the CA private key. Peers need only its certificate.
Do you want to encrypt the private key with a passphrase? [y/N]
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
[edit]
vyos@vyos# compare
[pki]
+ ca ca-1 {
+     certificate "<certificate data omitted>"
+     private {
+         key "<private key data omitted>"
+     }
+ }

[edit]
vyos@vyos# commit
```

Server certificate:

``` none
vyos@vyos# run generate pki certificate sign ca-1 install srv-1
Do you already have a certificate request? [y/N] N
Enter private key type: [rsa, dsa, ec] (Default: rsa)
Enter private key bits: (Default: 2048)
Enter country code: (Default: GB)
Enter state: (Default: Some-State)
Enter locality: (Default: Some-City)
Enter organization name: (Default: VyOS)
Enter common name: (Default: vyos.io) srv-1
Do you want to configure Subject Alternative Names? [y/N]
Enter how many days certificate will be valid: (Default: 365)
Enter certificate type: (client, server) (Default: server) server
Note: OpenVPN cannot use a password-protected private key.
Do you want to encrypt the private key with a passphrase? [y/N]
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
[edit]
vyos@vyos# compare
[pki certificate]
+ srv-1 {
+     certificate "<certificate data omitted>"
+     private {
+         key "<private key data omitted>"
+     }
+ }

[edit]
vyos@vyos# commit
```

Diffie-Hellman key:

``` none
vyos@vyos# run generate pki dh install dh-1
Enter DH parameters key size: (Default: 2048)
Generating parameters...
1 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
[edit]
vyos@vyos# compare
[pki]
+ dh dh-1 {
+     parameters "<DH parameters omitted>"
+ }

[edit]
vyos@vyos# commit
```

Client certificate:

``` none
vyos@vyos:~$  generate pki certificate sign ca-1 install client1
Do you already have a certificate request? [y/N] N
Enter private key type: [rsa, dsa, ec] (Default: rsa)
Enter private key bits: (Default: 2048)
Enter country code: (Default: GB)
Enter state: (Default: Some-State)
Enter locality: (Default: Some-City)
Enter organization name: (Default: VyOS)
Enter common name: (Default: vyos.io) client1
Do you want to configure Subject Alternative Names? [y/N]
Enter how many days certificate will be valid: (Default: 365)
Enter certificate type: (client, server) (Default: server) client
Note: OpenVPN cannot use a password-protected private key.
Do you want to encrypt the private key with a passphrase? [y/N]
You are not in configure mode, commands to install manually from configure mode:
set pki certificate client1 certificate '<certificate data omitted>'
set pki certificate client1 private key '<private key data omitted>'
```

Copy the CA certificate, client certificate, and private key to the client
device. Install them in its `pki` configuration before configuring the
OpenVPN interface.

For more options, refer to {ref}`configuration/pki/index:pki`.

## Set up server-client OpenVPN

This example shows a hub-and-spoke deployment in which each client is a
router with its own subnet. Simpler deployments can use a subset of these
settings.

The server allocates tunnel addresses from `10.23.1.0/24`. Client LANs use
addresses from `10.23.0.0/20`, and clients need access to `192.168.0.0/16`.

Server configuration:

``` none
set interfaces openvpn vtun10 encryption data-ciphers 'aes256'
set interfaces openvpn vtun10 hash 'sha512'
set interfaces openvpn vtun10 local-host '172.18.201.10'
set interfaces openvpn vtun10 local-port '1194'
set interfaces openvpn vtun10 mode 'server'
set interfaces openvpn vtun10 persistent-tunnel
set interfaces openvpn vtun10 protocol 'udp'
set interfaces openvpn vtun10 server client client1 ip '10.23.1.10'
set interfaces openvpn vtun10 server client client1 subnet '10.23.2.0/25'
set interfaces openvpn vtun10 server domain-name 'vyos.net'
set interfaces openvpn vtun10 server max-connections '250'
set interfaces openvpn vtun10 server name-server '172.16.254.30'
set interfaces openvpn vtun10 server subnet '10.23.1.0/24'
set interfaces openvpn vtun10 server topology 'subnet'
set interfaces openvpn vtun10 tls ca-certificate ca-1
set interfaces openvpn vtun10 tls certificate srv-1
set interfaces openvpn vtun10 tls dh-params dh-1
```

This configuration uses the default UDP port, AES-256 data encryption, and
SHA-512 packet authentication. `persistent-tunnel` keeps the TUN/TAP device
open when a client restarts. The server identifies each client by the Common
Name (CN) in its certificate.

To give clients access to a network behind the server, use `push-route` to
push that route to each client.

``` none
set interfaces openvpn vtun10 server push-route 192.168.0.0/16
```

OpenVPN records each client subnet as an internal route, but does not add a
kernel route for the aggregate client network. Add a static route for
`10.23.0.0/20` on the server:

``` none
set protocols static route 10.23.0.0/20 interface vtun10
```


## Set up OpenVPN client

VyOS can act as a site-to-site peer, a server for multiple clients, or a
client. A VyOS client can connect to another VyOS router or a third-party
OpenVPN server.

Client configuration:

``` none
set interfaces openvpn vtun10 encryption data-ciphers 'aes256'
set interfaces openvpn vtun10 hash 'sha512'
set interfaces openvpn vtun10 mode 'client'
set interfaces openvpn vtun10 persistent-tunnel
set interfaces openvpn vtun10 protocol 'udp'
set interfaces openvpn vtun10 remote-host '172.18.201.10'
set interfaces openvpn vtun10 remote-port '1194'
set interfaces openvpn vtun10 tls ca-certificate ca-1
set interfaces openvpn vtun10 tls certificate client1
```


## Verification

Check the tunnel status:

``` none
vyos@vyos:~$ show openvpn server

OpenVPN status on vtun10

Client CN    Remote Host         Tunnel IP    Local Host        TX bytes    RX bytes    Connected Since
-----------  ------------------  -----------  ----------------  ----------  ----------  -------------------
client1      172.16.12.54:33166  10.23.1.10   172.18.201.10:1194  3.4 KB      3.4 KB      2024-06-11 12:07:25
```


### Server bridge

For Ethernet bridging, configure the OpenVPN server interface as a TAP device
and add it to a bridge. TAP carries Ethernet frames, allowing clients to
exchange Layer 2 traffic through the tunnel. Account for tunnel overhead when
setting MTU values.

The following is a basic configuration example:

Server side:

``` none
set interfaces bridge br10 member interface eth1.10
set interfaces bridge br10 member interface vtun10
set interfaces openvpn vtun10 device-type 'tap'
set interfaces openvpn vtun10 encryption data-ciphers 'aes192'
set interfaces openvpn vtun10 hash 'sha256'
set interfaces openvpn vtun10 local-host '172.18.201.10'
set interfaces openvpn vtun10 local-port '1194'
set interfaces openvpn vtun10 mode 'server'
set interfaces openvpn vtun10 server bridge gateway '10.10.0.1'
set interfaces openvpn vtun10 server bridge start '10.10.0.100'
set interfaces openvpn vtun10 server bridge stop '10.10.0.200'
set interfaces openvpn vtun10 server bridge subnet-mask '255.255.255.0'
set interfaces openvpn vtun10 server topology 'subnet'
set interfaces openvpn vtun10 tls ca-certificate 'ca-1'
set interfaces openvpn vtun10 tls certificate 'srv-1'
set interfaces openvpn vtun10 tls dh-params 'dh-1'
```

Client side:

``` none
set interfaces openvpn vtun10 device-type 'tap'
set interfaces openvpn vtun10 encryption data-ciphers 'aes192'
set interfaces openvpn vtun10 hash 'sha256'
set interfaces openvpn vtun10 mode 'client'
set interfaces openvpn vtun10 protocol 'udp'
set interfaces openvpn vtun10 remote-host '172.18.201.10'
set interfaces openvpn vtun10 remote-port '1194'
set interfaces openvpn vtun10 tls ca-certificate 'ca-1'
set interfaces openvpn vtun10 tls certificate 'client1'
```


### Server LDAP authentication

#### LDAP

Enterprise networks often use a directory service for account management.
VyOS supports LDAP and Active Directory authentication for OpenVPN clients.

Authentication uses the `openvpn-auth-ldap.so` plugin, provided by the
`openvpn-auth-ldap` package. Create a separate plugin configuration file.
Store it under `/config` so it persists across image updates.

``` none
set interfaces openvpn vtun0 openvpn-option "--plugin /usr/lib/openvpn/openvpn-auth-ldap.so /config/auth/ldap-auth.config"
```

A sample configuration file is shown below:

``` none
<LDAP>
# LDAP server URL
URL             ldap://ldap.example.com
# Bind DN (if the LDAP server doesn't support anonymous binds)
BindDN          cn=LDAPUser,dc=example,dc=com
# Bind password
Password        REPLACE_WITH_BIND_PASSWORD
# Network timeout (in seconds)
Timeout         15
# Enable StartTLS
TLSEnable       yes
</LDAP>

<Authorization>
# Base DN
BaseDN          "ou=people,dc=example,dc=com"
# User Search Filter
SearchFilter    "(&(uid=%u)(objectClass=shadowAccount))"
# Require Group Membership - allow all users
RequireGroup    false
</Authorization>
```


### Active Directory

A sample configuration file is shown below:

``` none
<LDAP>
  # LDAP server URL
  URL ldap://dc01.example.com
  # Bind DN (if the LDAP server doesn’t support anonymous binds)
  BindDN CN=LDAPUser,DC=example,DC=com
  # Bind Password
  Password REPLACE_WITH_BIND_PASSWORD
  # Network timeout (in seconds)
  Timeout  15
  # Enable Start TLS
  TLSEnable yes
  # Follow LDAP Referrals (anonymously)
  FollowReferrals no
</LDAP>

<Authorization>
  # Base DN
  BaseDN        "DC=example,DC=com"
  # User Search Filter, user must be a member of the VPN AD group
  SearchFilter  "(&(sAMAccountName=%u)(memberOf=CN=VPN,OU=Groups,DC=example,DC=com))"
  # The search filter already restricts membership to the VPN group.
  RequireGroup    false
</Authorization>
```

To authenticate any matching account under the configured `BaseDN`, without
requiring group membership, use this search filter:

``` none
<LDAP>
  URL ldap://dc01.example.com
  BindDN CN=SA_OPENVPN,OU=ServiceAccounts,DC=example,DC=com
  Password REPLACE_WITH_BIND_PASSWORD
  Timeout  15
  TLSEnable yes
  FollowReferrals no
</LDAP>

<Authorization>
  BaseDN          "DC=example,DC=com"
  SearchFilter    "(sAMAccountName=%u)"
  RequireGroup    false
</Authorization>
```

This sample shows the LDAP plugin and related server settings. It leaves
compression and MTU options at their defaults:

``` none
vyos@vyos# show interfaces openvpn
 openvpn vtun0 {
     mode server
     openvpn-option "--plugin /usr/lib/openvpn/openvpn-auth-ldap.so /config/auth/ldap-auth.config"
     server {
         domain-name example.com
         max-connections 5
         name-server 203.0.113.10
         name-server 198.51.100.3
         subnet 172.18.100.128/29
     }
     tls {
         ca-certificate ca-1
         certificate srv-1
         dh-params dh-1
     }
 }
```

For a full setup, see {doc}`OpenVPN with LDAP
</configexamples/autotest/OpenVPN_with_LDAP/OpenVPN_with_LDAP>`.

### Multi-factor authentication

VyOS supports multi-factor authentication (MFA) with Time-based One-Time
Passwords (TOTP). TOTP works with Google Authenticator and other compatible
authenticator apps.

## Server side

``` none
set interfaces openvpn vtun20 encryption data-ciphers 'aes256'
set interfaces openvpn vtun20 hash 'sha512'
set interfaces openvpn vtun20 mode 'server'
set interfaces openvpn vtun20 persistent-tunnel
set interfaces openvpn vtun20 server client user1
set interfaces openvpn vtun20 server mfa totp challenge 'disable'
set interfaces openvpn vtun20 server subnet '10.10.2.0/24'
set interfaces openvpn vtun20 server topology 'subnet'
set interfaces openvpn vtun20 tls ca-certificate 'openvpn_vtun20'
set interfaces openvpn vtun20 tls certificate 'openvpn_vtun20'
set interfaces openvpn vtun20 tls dh-params 'dh-pem'
```

When server MFA is configured, VyOS creates a TOTP secret for each client.
Display the QR code with:

`show interfaces openvpn vtun20 user user1 mfa qrcode`

Example:

``` none
vyos@vyos:~$ show interfaces openvpn vtun20 user user1 mfa qrcode
... QR code output omitted ...
```

Scan the QR code with an authenticator app. The client uses the generated
one-time password as its password.

### Authentication with username/password

An OpenVPN server can request a username and password from each client and
use them for authentication.

Configure the server to use an authentication plugin or script. OpenVPN calls
it when a client attempts to connect and passes the client credentials.

This example uses `--auth-user-pass-verify` with `via-env` to pass credentials
to a script that validates them.

## Server configuration

``` none
set interfaces openvpn vtun10 local-port '1194'
set interfaces openvpn vtun10 mode 'server'
set interfaces openvpn vtun10 openvpn-option '--auth-user-pass-verify /config/auth/check_user.sh via-env'
set interfaces openvpn vtun10 openvpn-option '--script-security 3'
set interfaces openvpn vtun10 persistent-tunnel
set interfaces openvpn vtun10 protocol 'udp'
set interfaces openvpn vtun10 server client client-1 ip '10.10.10.55'
set interfaces openvpn vtun10 server push-route 192.0.2.0/24
set interfaces openvpn vtun10 server subnet '10.10.10.0/24'
set interfaces openvpn vtun10 server topology 'subnet'
set interfaces openvpn vtun10 tls ca-certificate 'ca-1'
set interfaces openvpn vtun10 tls certificate 'srv-1'
set interfaces openvpn vtun10 tls dh-params 'dh-1'
```

Save the script as `/config/auth/check_user.sh`, make it executable, and
replace the sample credentials with real authentication logic before use:

``` none
#!/bin/bash
USERNAME="$username"
PASSWORD="$password"

# Replace this with real user checking logic or use getent
if [[ "$USERNAME" == "client1" && "$PASSWORD" == "pass123" ]]; then
    exit 0
elif [[ "$USERNAME" == "peter" && "$PASSWORD" == "qwerty" ]]; then
    exit 0
else
    exit 1
fi
```

Set its permissions with `chmod 700 /config/auth/check_user.sh`.


## Client configuration

With the client certificate stored locally, generate an OpenVPN client
configuration file with this command:

``` none
vyos@vyos:~$ generate openvpn client-config interface vtun10 ca ca-1 certificate client1
```

Save the output as a `.ovpn` file and add the `auth-user-pass` directive. The
client then prompts for a username and password and sends them through the TLS
connection. Import the file into an OpenVPN client application.

``` none
client
dev tun
proto udp
remote 172.18.201.10 1194
remote-cert-tls server
persist-key
persist-tun
verb 3
auth-user-pass

<ca>
... CA certificate omitted ...
</ca>

<cert>
... client certificate omitted ...
</cert>

<key>
... client private key omitted ...
</key>
```

When prompted, log in with the username and password.
