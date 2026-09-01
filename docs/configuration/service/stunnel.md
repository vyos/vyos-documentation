(stunnel)=
# Stunnel

**stunnel** wraps TCP connections in {abbr}`TLS (Transport Layer Security)`
and authenticates peers using X.509 certificates, a pre-shared key, or
both. It is commonly used to secure protocols that lack native TLS
support, such as plain IMAP, POP3, or SMTP. You can also use it to build
TLS-encrypted tunnels for other services, such as a SOCKS proxy.

Each named service (`service stunnel client|server <name>`) operates in
one of the following modes:

- **Client:** Accepts plaintext connections locally and forwards them,
  encrypted, to a remote TLS endpoint.
- **Server:** Accepts TLS connections and forwards them, decrypted, to a
  local plaintext service.

The following sections describe how to configure a service in each mode.

## Configuration

### Connection endpoints

The following commands define where a service accepts connections and
where it forwards them. They are the same for client and server modes.

```{cfgcmd} set service stunnel \<client | server\> \<name\> listen address \<address\>

**Configure the local address on which the specified service accepts
incoming connections.**

The value can be an IPv4 address, an IPv6 address, or an
{abbr}`FQDN (Fully Qualified Domain Name)`.

When unset, the service accepts connections on all local IPv4 addresses,
and the listen port must then be free on every local IPv4 address.
```

Example:

```none
set service stunnel server app1 listen address 192.0.2.1
```

```{cfgcmd} set service stunnel \<client | server\> \<name\> listen port \<1-65535\>

**Configure the TCP port on which the specified service accepts incoming
connections.**

A listen port is mandatory for every named service.

The listen address and port together must not already be in use on the
router, either by another stunnel service or by any other local process.
Otherwise, the commit fails.
```

Example:

```none
set service stunnel server app1 listen port 443
```

```{cfgcmd} set service stunnel \<client | server\> \<name\> connect address \<address\>

**Configure the destination address to which the specified service
forwards accepted connections.**

The value can be an IPv4 address, an IPv6 address, or an FQDN.

In client mode, the destination is typically a remote TLS server, and in
server mode, it is typically a plaintext service.

When unset, the service uses the local host as the destination.
```

Example:

```none
set service stunnel client app1 connect address 203.0.113.10
```

```{cfgcmd} set service stunnel \<client | server\> \<name\> connect port \<1-65535\>

**Configure the destination TCP port to which the specified service
forwards accepted connections.**

A connect port is mandatory for every named service, except a
server-mode service using the `socks` protocol, where `connect` must not
be configured at all. Otherwise, the commit fails.
```

Example:

```none
set service stunnel client app1 connect port 443
```

### TLS certificates

The following commands configure certificate-based authentication for a
service.

```{cfgcmd} set service stunnel \<client | server\> \<name\> ssl certificate \<name\>

**Reference a TLS certificate and its private key from the 
{doc}`PKI subsystem </configuration/pki/index>`
to the specified service.**

The pair must already be defined under `set pki certificate <cert-name>`.

The service presents this certificate to authenticate itself to the
remote peer during the TLS handshake.

A server-mode service requires either a TLS certificate from the PKI
subsystem or at least one pre-shared key. Otherwise, the commit fails.

A TLS certificate is optional for a client-mode service.
```

Example:

```none
set service stunnel server app1 ssl certificate srv-cert
```

```{cfgcmd} set service stunnel \<client | server\> \<name\> ssl ca-certificate \<name\>

**Add a CA certificate from the PKI subsystem to the trusted CA store of
the specified service.**

The CA certificate must already be defined under `set pki ca <ca-name>`.

Repeat the command to add multiple CA certificates.
```

```{note}
Configuring a CA certificate loads it into the service's trusted CA
store, but it does not make the service validate the certificate that the
peer presents. Peer-certificate validation cannot currently be enabled
from the CLI, so the handshake completes even when the peer certificate
is not signed by a CA in the store.
```

Example:

```none
set service stunnel client app1 ssl ca-certificate my-ca
```

### Pre-shared keys

As an alternative or in addition to TLS certificates, a service can
authenticate its peers with TLS pre-shared keys. Each PSK entry pairs an
identity with a secret key, and the client and server must be configured
with a matching identity and secret.

During the TLS handshake, a server-mode service accepts any peer whose
identity matches one of its configured PSK pairs. A client-mode service
presents only a single identity. If several PSK entries are defined on a
client, only one is used, so configure exactly one.

```{cfgcmd} set service stunnel \<client | server\> \<name\> psk \<name\> id \<id\>

**Configure the identity for the specified PSK entry.**

The PSK entry name is only a local configuration label. The `id` value is
the identity exchanged with the peer.

Both an identity and a secret must be configured for every PSK entry.

To configure additional identities, define separate PSK entries
(`psk <name>`), each with its own `id`.
```

Example:

```none
set service stunnel server app1 psk key1 id client1
```

```{cfgcmd} set service stunnel \<client | server\> \<name\> psk \<name\> secret \<secret\>

**Configure the pre-shared secret key, as a hexadecimal string, for the
specified PSK entry.**

The key must be at least 16 bytes long, which implies at least 32
hexadecimal characters. Otherwise, the commit fails.
```

```{note}
Use the `generate psk random size <32-512>` operational command to
generate a valid random secret. The `<32-512>` size is specified in
bytes.
```

Example:

```none
set service stunnel server app1 psk key1 secret 1234567890abcdef1234567890abcdef
```

### Protocol negotiation

By default, a service encrypts or decrypts the whole TCP connection. For
applications that upgrade a plaintext connection to TLS (STARTTLS-style),
and for other protocol-specific exchanges such as SOCKS or proxy
handshakes, the application protocol must be declared so that stunnel
performs this negotiation before starting TLS.

```{cfgcmd} set service stunnel \<client | server\> \<name\> protocol \<cifs | connect | imap | nntp | pgsql | pop3 | proxy | smtp | socks\>

**Configure the application protocol used for the initial,
protocol-specific negotiation that precedes TLS encryption.**

This option should not be used when TLS runs on its own dedicated port.

The `connect` and `nntp` protocols are available only in client mode.
```

Example:

```none
set service stunnel client app1 protocol connect
```

### Protocol options

The following commands tune the protocol negotiation of a client-mode
service. They are committable only when the service's protocol is
`connect` or `smtp`. With the `smtp` protocol, the `domain` and `host`
options are not available.

```{cfgcmd} set service stunnel client \<name\> options authentication \<basic | ntlm | plain | login\>

**Configure the authentication type for the protocol negotiation.**

The `connect` protocol supports `basic` or `ntlm` authentication;
`basic` is the default. The `smtp` protocol supports `plain` or `login`
authentication; `plain` is the default.
```

Example:

```none
set service stunnel client app1 options authentication ntlm
```

```{cfgcmd} set service stunnel client \<name\> options domain \<domain\>

**Configure the domain used for the connect protocol negotiation.**

The value must be a FQDN.
```

Example:

```none
set service stunnel client app1 options domain example.com
```

```{cfgcmd} set service stunnel client \<name\> options host address \<address\>

**Configure the final destination address the intermediate proxy
connects to during the connect protocol negotiation.**

The intermediate proxy itself is the service's `connect` destination.

Both a `host address` and a `host port` are required.
```

Example:

```none
set service stunnel client app1 options host address 198.51.100.10
```

```{cfgcmd} set service stunnel client \<name\> options host port \<1-65535\>

**Configure the TCP port of the final destination the intermediate proxy
connects to during the connect protocol negotiation.**
```

Example:

```none
set service stunnel client app1 options host port 443
```

```{cfgcmd} set service stunnel client \<name\> options username \<username\>

**Configure the username used for the protocol negotiation.**
```

Example:

```none
set service stunnel client app1 options username stunnel-user
```

```{cfgcmd} set service stunnel client \<name\> options password \<password\>

**Configure the password used for the protocol negotiation.**
```

Example:

```none
set service stunnel client app1 options password mysecretpassword
```

### Logging

```{cfgcmd} set service stunnel log level \<emerg | alert | crit | err | warning | notice | info | debug\>

**Configure the severity threshold for stunnel logging.**

The levels correspond to syslog severity levels. Messages at the
configured level and all more severe levels are logged.

The default is `notice`.
```

Example:

```none
set service stunnel log level info
```

## Examples

### TLS wrapper for a plaintext service

The following example demonstrates how two VyOS routers secure a legacy
plaintext application over an untrusted network by protecting its
traffic with TLS, without modifying the application.

On the router at `192.0.2.1`, stunnel runs in server mode: it terminates
TLS and forwards the connection to a local application on port 8080. On
the router at `192.0.2.2`, stunnel runs in client mode: it wraps the
application's connection in TLS and forwards it to the server.

On `192.0.2.1` (server mode):

```none
set service stunnel server app1 listen address 192.0.2.1
set service stunnel server app1 listen port 443
set service stunnel server app1 connect address 127.0.0.1
set service stunnel server app1 connect port 8080
set service stunnel server app1 ssl certificate srv-cert
```

On `192.0.2.2` (client mode):

```none
set service stunnel client app1 listen address 127.0.0.1
set service stunnel client app1 listen port 8080
set service stunnel client app1 connect address 192.0.2.1
set service stunnel client app1 connect port 443
```

### TLS-secured SOCKS proxy

To build a TLS-secured SOCKS proxy, configure a **server** service with
`protocol socks` - note that no `connect` target is set on the server side
since SOCKS negotiates its own destination - and a matching **client**
service that exposes a local SOCKS listener:

```none
set service stunnel server srv-one listen port 9001
set service stunnel server srv-one protocol 'socks'
set service stunnel server srv-one psk sock_proxy id 'cli-one'
set service stunnel server srv-one psk sock_proxy secret '1234567890ABCDEF1234567890ABCDEF'

set service stunnel client cli-one listen port 9000
set service stunnel client cli-one connect port 9001
set service stunnel client cli-one psk sock_proxy id 'cli-one'
set service stunnel client cli-one psk sock_proxy secret '1234567890ABCDEF1234567890ABCDEF'
```

### TLS via an HTTP CONNECT proxy

To tunnel an authenticated HTTP CONNECT proxy session:

```none
set service stunnel client app2 listen address '127.0.0.1'
set service stunnel client app2 listen port 83
set service stunnel client app2 connect address '192.168.0.10'
set service stunnel client app2 connect port 84

set service stunnel client app2 protocol 'connect'
set service stunnel client app2 options authentication 'basic'
set service stunnel client app2 options domain 'example.com'
set service stunnel client app2 options host address '127.0.0.1'
set service stunnel client app2 options host port 5000
set service stunnel client app2 options username 'user'
set service stunnel client app2 options password 'password'
```
