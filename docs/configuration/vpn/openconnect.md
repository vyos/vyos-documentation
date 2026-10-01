---
lastproofread: '2026-09-30'
---

(vpn-openconnect)=

# OpenConnect

VyOS provides an OpenConnect-compatible VPN server based on ocserv. It accepts
connections from OpenConnect and compatible Cisco AnyConnect clients over TLS;
ocserv can also use DTLS over UDP for the data channel. The VPN assigns client
addresses from a configured pool and can push routes and DNS settings. Routes,
firewall rules, and any required routing or NAT determine which networks
clients can reach. VyOS pushes a default route when no `push-route` is
configured.

## Configuration

### Server certificate

The server certificate authenticates the VPN server to clients. Create a CA
and sign a server certificate in configuration mode:

```{opcmd} generate pki ca install \<name\>

Create a CA and store it in the VyOS PKI configuration.
```

```{opcmd} generate pki certificate sign \<ca-name\> install \<certificate-name\>

Create and sign the OpenConnect server certificate with the CA.
```

Follow the prompts. Use a DNS name clients will connect to as the certificate
common name and include it as a Subject Alternative Name when prompted. Commit
the generated certificates before referencing them in the OpenConnect
configuration. For a publicly trusted certificate, see the ACME guidance in
{doc}`the PKI documentation </configuration/pki/index>`.

### Password authentication

Configure at least one local user, select local password authentication, set
the client IPv4 pool, and reference the server certificate:

```{cfgcmd} set vpn openconnect authentication local-users username \<user\> password \<password\>

Create a local user and set its password.
```

```{cfgcmd} set vpn openconnect authentication mode local \<password | password-otp | otp\>

Select local password, password-plus-OTP, or OTP-only authentication.
```

```{cfgcmd} set vpn openconnect network-settings client-ip-settings subnet \<ipv4-prefix\>

Set the IPv4 subnet used to assign addresses to VPN clients.
```

```{cfgcmd} set vpn openconnect ssl certificate \<certificate-name\>

Select the server certificate from the VyOS PKI configuration.
```

The `network-settings` node is required. You can also configure one or more
DNS servers and routes to push to clients:

```{cfgcmd} set vpn openconnect network-settings name-server \<address\>

Set one DNS server address to provide to clients. Repeat this command to add
multiple servers.
```

```{cfgcmd} set vpn openconnect network-settings push-route \<prefix\>

Add a route to push to clients. Repeat this command to add multiple routes.
Use `0.0.0.0/0` to direct all client traffic through the VPN.
```

To use a CA-signed client certificate for authentication, also configure the
trusted CA under `vpn openconnect ssl ca-certificate`. This setting validates
client certificates; it is not needed merely to configure the server
certificate.

### OTP authentication

Local users can authenticate with an OTP alone or with a password followed by
an OTP. Generate a key for a user with:

```{opcmd} generate openconnect username \<user\> otp-key hotp-time
```

The command prints a secret key, an `otpauth` URI, and a QR code. Treat these
values as credentials and deliver them to the user securely. The command also
prints the configuration command; the OTP key is stored in hexadecimal:

```{cfgcmd} set vpn openconnect authentication local-users username \<user\> otp key \<hex-key\>

Store the user's OTP key in hexadecimal.
```

For password plus OTP, set the authentication mode to `password-otp`; for OTP
only, use `otp`:

```{cfgcmd} set vpn openconnect authentication mode local password-otp

Select password plus OTP authentication.
```

```{cfgcmd} set vpn openconnect authentication mode local otp

Select OTP-only authentication.
```

Optional per-user settings are under the `otp` node. The defaults are a
30-second interval, six digits, and time-based OTP (`hotp-time`). The
alternative `hotp-event` token type is event-based.

```{cfgcmd} set vpn openconnect authentication local-users username \<user\> otp interval \<seconds\>

Set the time interval for time-based tokens.
```

```{cfgcmd} set vpn openconnect authentication local-users username \<user\> otp otp-length \<6-8\>

Set the number of digits in each token.
```

```{cfgcmd} set vpn openconnect authentication local-users username \<user\> otp token-type \<hotp-time | hotp-event\>

Select time-based or event-based OTP.
```

For time-based tokens, keep the router and authenticator clocks synchronized.
Use the following command to view configured token information. The `full`,
`key-b32`, `key-hex`,
`qrcode`, and `uri` options expose the OTP secret; restrict access to this
command accordingly.

```{opcmd} show openconnect-server user \<user\> otp \<full | key-b32 | key-hex | qrcode | uri\>
```

### Client certificate authentication

Certificate authentication requires a CA certificate in the server
configuration. The client certificate must be signed by that CA and contain a
user identifier in its subject. VyOS recognizes Common Name (`cn`), User ID
(`uid`), or a custom object identifier (OID):

```{cfgcmd} set vpn openconnect authentication mode certificate user-identifier-field \<cn | uid | x.x.xx.xxx\>

Select the certificate field used to identify the user.
```

```{cfgcmd} set vpn openconnect ssl ca-certificate \<ca-name\>

Select a CA that will validate client certificates. Repeat to add CA
certificates to the trusted chain.
```

The `cn` shortcut selects Common Name; `uid` selects User ID. A custom OID can
be set in dotted-decimal form.

% stop_vyoslinter
Common Name uses OID `2.5.4.3`; User ID uses OID
`0.9.2342.19200300.100.1.1`.
% start_vyoslinter

```{cfgcmd} set vpn openconnect http-security-headers

Enable HTTP security headers in server responses.
```

### RADIUS authentication and accounting

RADIUS accounting requires RADIUS authentication and at least one RADIUS
server. Configure authentication and accounting server details as needed:

```{cfgcmd} set vpn openconnect authentication mode radius

Select RADIUS authentication.
```

```{cfgcmd} set vpn openconnect authentication radius server \<address\> key \<shared-secret\>

Add a RADIUS authentication server.
```

```{cfgcmd} set vpn openconnect accounting mode radius

Enable RADIUS accounting. VyOS requires RADIUS authentication when accounting
is enabled.
```

```{cfgcmd} set vpn openconnect accounting radius server \<address\> key \<shared-secret\>

Add a RADIUS accounting server.
```

The accounting port defaults to UDP 1813. The server address and shared secret
must match the RADIUS server configuration.

### Identity-based configuration

ocserv can apply a limited set of INI-format options per user or group. VyOS
exposes this third-party ocserv feature as identity-based configuration and
warns that it may affect daemon operation. Keep the directory and default file
under `/config/auth` so they persist across image upgrades. Group-based
configuration requires RADIUS authentication. See the [ocserv manual](
https://ocserv.gitlab.io/www/manual.html#per-user-and-per-group-configuration)
for the options supported in per-user and per-group files.

For example, prepare persistent paths and configure per-user files:

```bash
sudo mkdir -p /config/auth/ocserv/config-per-user
sudo touch /config/auth/ocserv/default-user.conf
```

```{cfgcmd} set vpn openconnect authentication identity-based-config mode \<user | group\>

Choose username-based or RADIUS group-based configuration.
```

```{cfgcmd} set vpn openconnect authentication identity-based-config directory \<path\>

Set the directory for per-user or per-group configuration files. The path must
be under `/config/auth`.
```

```{cfgcmd} set vpn openconnect authentication identity-based-config default-config \<path\>

Set the fallback file path. It must be under `/config/auth`.
```

Create a file named for each username or group name, as appropriate for the
selected mode, in the configured directory. Use the default file when no
matching per-user or per-group file is present. User and group names are
matched case-sensitively.

## Verification

View active sessions with:

```{opcmd} show openconnect-server sessions
```

Example output:

```none
interface    username    ip             remote IP    RX       TX         state      uptime
-----------  ----------  -------------  -----------  -------  ---------  --------
sslvpn0      tst         172.20.20.198  192.0.2.1    0 bytes  152 bytes  connected  3s
```

