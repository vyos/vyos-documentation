---
lastproofread: '2026-09-30'
---

(pki)=

# PKI

VyOS 1.4 changed how encryption keys and certificates are stored. Before
VyOS 1.4, certificates were stored under `/config` and each service referenced
a file. Moving a configuration to another system also required copying those
files and preserving their permissions.

{vytask}`T3642` describes the PKI subsystem that provides certificates and
keys to VyOS services. Certificates use X.509 PEM format; private keys use
PKCS#8 format. They are managed in the VyOS configuration with the usual
`set`, `edit`, and `delete` commands. Since configuration backups contain
private key values, protect them and limit access to them.

VyOS can manage certificates issued by third-party certificate authorities
and can act as a CA. Operational mode commands can create a root CA and sign
certificates with it.

Migration scripts handle the configuration changes required when upgrading
from pre-1.4 releases.

## Key Generation

### Certificate Authority (CA)

VyOS now also has the ability to create CAs, keys, Diffie-Hellman and other
keypairs from an easy to access operational level command.

```{opcmd} generate pki ca

Create a new {abbr}`CA (Certificate Authority)` and print its certificate and
private key in PEM format.
```

```{opcmd} generate pki ca install \<name\>

Create a new {abbr}`CA (Certificate Authority)` and add its certificate and
private key to the configuration under `name`.

:::{note}
The install variant adds the CA certificate and private key to the
configuration under `name`.
:::
```

```{opcmd} generate pki ca sign \<ca-name\>

Create a subordinate {abbr}`CA (Certificate Authority)` and sign it with the
private key of `ca-name`. You can generate a new key pair or provide an
existing certificate request.
```

```{opcmd} generate pki ca sign \<ca-name\> install \<name\>

Create a subordinate {abbr}`CA (Certificate Authority)` and sign it with the
private key of `ca-name`, then add the result to the configuration under
`name`.

:::{note}
The install variant adds the signed CA certificate and any newly generated
private key to the configuration under `name`.
:::
```

### Certificates

```{opcmd} generate pki certificate

Create a private key and certificate request, then print both in PEM format.
```

```{opcmd} generate pki certificate install \<name\>

Create a certificate request and private key, and add the private key to the
configuration under `name`. The request is printed to the console.

:::{note}
The install variant adds the generated private key to the configuration under
`name`; the certificate request is printed to the console.
:::
```

```{opcmd} generate pki certificate self-signed

Create a self-signed certificate and private key, then print both in PEM
format.
```

```{opcmd} generate pki certificate self-signed install \<name\>

Create a self-signed certificate and private key, then add both to the
configuration under `name`.

:::{note}
The install variant adds the certificate and private key to the configuration
under `name`.
:::
```

```{opcmd} generate pki certificate sign \<ca-name\>

Generate a private key and certificate request, or provide an existing
request, then sign it with the CA named `ca-name`. Print the signed
certificate and any newly generated private key in PEM format.
```

```{opcmd} generate pki certificate sign \<ca-name\> install \<name\>

Generate a private key and certificate request, or provide an existing
request, then sign it with the CA named `ca-name`. Add the signed certificate
and any newly generated private key to the configuration under `name`.

:::{note}
The install variant writes the signed certificate and any newly generated
private key to the configuration under `name`.
:::
```

### Diffie-Hellman parameters

```{opcmd} generate pki dh

Generate a set of {abbr}`DH (Diffie-Hellman)` parameters. The CLI prompts for
the key size, which defaults to 2048 bits.

The generated parameters are then output to the console.
```

```{opcmd} generate pki dh install \<name\>

Generate {abbr}`DH (Diffie-Hellman)` parameters and add them to the
configuration under `name`. The CLI prompts for the key size, which defaults
to 2048 bits.

:::{note}
The install variant writes the generated parameters to the configuration
under `name`.
:::
```

### OpenVPN

```{opcmd} generate pki openvpn shared-secret

Generate an OpenVPN shared secret and print it to the console.
```

```{opcmd} generate pki openvpn shared-secret install \<name\>

Generate an OpenVPN shared secret and add it to the configuration under
`name`.

:::{note}
The install variant adds the generated secret to the configuration under
`name`.
:::
```

### WireGuard

```{opcmd} generate pki wireguard key-pair

Generate a WireGuard public/private key pair and print it to the console.
```

```{opcmd} generate pki wireguard key-pair install interface \<interface\>

Generate a WireGuard key pair and add the private key to the selected
interface's configuration.

:::{note}
The install variant writes the private key directly to the selected
WireGuard interface.
:::
```

```{opcmd} generate pki wireguard preshared-key

Generate a WireGuard pre-shared secret used for peers to communicate.
```

```{opcmd} generate pki wireguard preshared-key install interface \<interface\> peer \<peer\>

Generate a WireGuard pre-shared key and add it to the selected peer's
configuration.

:::{note}
The install variant writes the key directly to the selected WireGuard peer.
:::
```

## Key usage (CLI)
### CA (Certificate Authority)

```{cfgcmd} set pki ca \<name\> certificate

Add the public CA certificate for the CA named `name` to the VyOS CLI.

:::{note}
When loading the certificate you need to manually strip the
``-----BEGIN CERTIFICATE-----`` and ``-----END CERTIFICATE-----`` tags.
Also, the certificate/key needs to be presented in a single line without
line breaks (``\n``), this can be done using the following shell command:

``$ tail -n +2 ca.pem | head -n -1 | tr -d '\n'``
:::
```

```{cfgcmd} set pki ca \<name\> crl

Certificate revocation list in PEM format.
```

```{cfgcmd} set pki ca \<name\> description

A human readable description what this CA is about.
```

```{cfgcmd} set pki ca \<name\> system-install

Install the CA certificate into the router's system-wide CA certificate
store so local applications can trust certificates issued by this CA.
```

```{cfgcmd} set pki ca \<name\> private key

Add the CA's private key to the VyOS configuration. Protect this key; it is
required when VyOS uses this CA to sign certificates or generate CRLs.

:::{note}
For an unencrypted PKCS#8 key, strip the
``-----BEGIN PRIVATE KEY-----`` and ``-----END PRIVATE KEY-----`` tags. For
an encrypted key, strip the ``ENCRYPTED PRIVATE KEY`` tags instead. The key
must be entered as one line without line breaks (``\n``). For example:

``$ tail -n +2 ca.key | head -n -1 | tr -d '\n'``
:::
```

```{cfgcmd} set pki ca \<name\> private password-protected

Mark the CAs private key as password protected. User is asked for the password
when the key is referenced.
```

### Server Certificate

After we have imported the CA certificate(s) we can now import and add
certificates used by services on this router.

```{cfgcmd} set pki certificate \<name\> certificate

Add public key portion for the certificate named `name` to the VyOS CLI.

:::{note}
When loading the certificate you need to manually strip the
``-----BEGIN CERTIFICATE-----`` and ``-----END CERTIFICATE-----`` tags.
Also, the certificate/key needs to be presented in a single line without
line breaks (``\n``), this can be done using the following shell command:

``$ tail -n +2 cert.pem | head -n -1 | tr -d '\n'``
:::
```

```{cfgcmd} set pki certificate \<name\> description

A human readable description what this certificate is about.
```

```{cfgcmd} set pki certificate \<name\> private key

Add the certificate's private key to the VyOS configuration. Protect this
key; services that use the certificate need it to prove the router's identity.

:::{note}
For an unencrypted PKCS#8 key, strip the
``-----BEGIN PRIVATE KEY-----`` and ``-----END PRIVATE KEY-----`` tags. For
an encrypted key, strip the ``ENCRYPTED PRIVATE KEY`` tags instead. The key
must be entered as one line without line breaks (``\n``). For example:

``$ tail -n +2 cert.key | head -n -1 | tr -d '\n'``
:::
```

```{cfgcmd} set pki certificate \<name\> private password-protected

Mark the private key as password protected. User is asked for the password
when the key is referenced.
```

```{cfgcmd} set pki certificate \<name\> revoke

Mark this certificate as revoked so it is included in a CRL generated by its
issuing CA.
```

### Import files to PKI format

VyOS provides this utility to import existing certificates/key files directly
into PKI from op-mode. Previous to VyOS 1.4, certificates were stored under the
/config folder permanently and will be retained post upgrade.

```{opcmd} import pki ca \<name\> file \<Path to CA certificate file\>

Import the public CA certificate from the defined file to VyOS CLI.
```

```{opcmd} import pki ca \<name\> key-file \<Path to private key file\>

Import the CA's private key into the VyOS configuration. Protect this key;
it is required when VyOS uses this CA to sign certificates or generate CRLs.
```

```{opcmd} import pki certificate \<name\> file \<path to certificate\>

Import the certificate from the file to VyOS CLI.
```

```{opcmd} import pki certificate \<name\> key-file \<path to private key\>

Import the certificate's private key into the VyOS configuration. Protect
this key; services that use the certificate need it to prove their identity.
```

```{opcmd} import pki openvpn shared-secret \<name\> file \<path to OpenVPN secret key\>

Import the OpenVPN shared secret stored in file to the VyOS CLI.
```

#### ACME

The VyOS PKI subsystem can also be used to automatically retrieve Certificates
using the {abbr}`ACME (Automatic Certificate Management Environment)` protocol.

```{cfgcmd} set pki certificate \<name\> acme domain-name \<name\>

Domain names to apply, multiple domain-names can be specified.

This is a mandatory option
```

```{cfgcmd} set pki certificate \<name\> acme email \<address\>

Email used for registration and recovery contact.

This is a mandatory option
```

```{cfgcmd} set pki certificate \<name\> acme listen-address \<address\>

The address the server listens to during http-01 challenge
```

```{cfgcmd} set pki certificate \<name\> acme rsa-key-size \<2048 | 3072 | 4096\>

Size of the RSA key.

This options defaults to 2048
```

```{cfgcmd} set pki certificate \<name\> acme url \<url\>

ACME Directory Resource URI.

This defaults to https://acme-v02.api.letsencrypt.org/directory

:::{note}
During initial deployment, use the Let's Encrypt staging API to avoid
production rate limits while testing. Its endpoint is
https://acme-staging-v02.api.letsencrypt.org/directory.
:::
```

## Operation

VyOS operational mode commands are not only available for generating keys but
also to display them.

```{opcmd} show pki ca

Show a list of installed {abbr}`CA (Certificate Authority)` certificates.

:::{code-block} none
vyos@vyos:~$ show pki ca
Certificate Authorities:
Name            Subject                                                  Issuer CN          Issued               Expiry               Private Key    Parent
--------------  -------------------------------------------------------  -----------------  -------------------  -------------------  -------------  --------------
DST_Root_CA_X3  CN=ISRG Root X1,O=Internet Security Research Group,C=US  CN=DST Root CA X3  2021-01-20 19:14:03  2024-09-30 18:14:03  No             N/A
R3              CN=R3,O=Let's Encrypt,C=US                               CN=ISRG Root X1    2020-09-04 00:00:00  2025-09-15 16:00:00  No             DST_Root_CA_X3
vyos_rw         CN=VyOS RW CA,O=VyOS,L=Some-City,ST=Some-State,C=GB      CN=VyOS RW CA      2021-07-05 13:46:03  2026-07-04 13:46:03  Yes            N/A
:::
```

```{opcmd} show pki ca \<name\>

Show only information for specified Certificate Authority.
```

```{opcmd} show pki certificate

Show a list of installed certificates

:::{code-block} none
vyos@vyos:~$ show pki certificate
Certificates:
Name       Type    Subject CN             Issuer CN      Issued               Expiry               Revoked    Private Key    CA Present
---------  ------  ---------------------  -------------  -------------------  -------------------  ---------  -------------  -------------
ac2        Server  CN=ac2.vyos.net        CN=R3          2021-07-05 07:29:59  2021-10-03 07:29:58  No         Yes            Yes (R3)
rw_server  Server  CN=VyOS RW             CN=VyOS RW CA  2021-07-05 13:48:02  2022-07-05 13:48:02  No         Yes            Yes (vyos_rw)
:::
```

```{opcmd} show pki certificate \<name\>

Show only information for specified certificate.
```

```{opcmd} show pki crl

Show a list of installed {abbr}`CRLs (Certificate Revocation List)`.
```

```{opcmd} renew certbot

Manually trigger renewal of ACME-managed certificates. Automatic renewal is
handled by the `certbot.timer` systemd timer when an ACME certificate is
configured.
```

## Examples

### Create a CA chain and leaf certificates

This configuration generates and installs a root CA and two intermediate CAs
for client and server certificates. These CAs then sign a server certificate
for the router and a client certificate for a user.
- `vyos_root_ca` is the root certificate authority.
- `vyos_client_ca` and `vyos_server_ca` are intermediate CAs signed by the
  root CA.
- `vyos_cert` is a leaf server certificate used to identify the VyOS router,
  signed by the server intermediary CA.
- `vyos_example_user` is a leaf client certificate used to identify a user,
  signed by client intermediary CA.

First, we create the root certificate authority.

```none
[edit]
vyos@vyos# run generate pki ca install vyos_root_ca
Enter private key type: [rsa, dsa, ec] (Default: rsa) rsa
Enter private key bits: (Default: 2048) 2048
Enter country code: (Default: GB) GB
Enter state: (Default: Some-State) Some-State
Enter locality: (Default: Some-City) Some-City
Enter organization name: (Default: VyOS) VyOS
Enter common name: (Default: vyos.io) VyOS Root CA
Enter how many days certificate will be valid: (Default: 1825) 1825
Note: If you plan to use the generated key on this router, do not encrypt the private key.
Do you want to encrypt the private key with a passphrase? [y/N] n
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
```

Secondly, we create the intermediary certificate authorities, which are used to
sign the leaf certificates.

```none
[edit]
vyos@vyos# run generate pki ca sign vyos_root_ca install vyos_server_ca
Do you already have a certificate request? [y/N] n
Enter private key type: [rsa, dsa, ec] (Default: rsa) rsa
Enter private key bits: (Default: 2048) 2048
Enter country code: (Default: GB) GB
Enter state: (Default: Some-State) Some-State
Enter locality: (Default: Some-City) Some-City
Enter organization name: (Default: VyOS) VyOS
Enter common name: (Default: vyos.io) VyOS Intermediary Server CA
Enter how many days certificate will be valid: (Default: 1825) 1095
Note: If you plan to use the generated key on this router, do not encrypt the private key.
Do you want to encrypt the private key with a passphrase? [y/N] n
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.


[edit]
vyos@vyos# run generate pki ca sign vyos_root_ca install vyos_client_ca
Do you already have a certificate request? [y/N] n
Enter private key type: [rsa, dsa, ec] (Default: rsa) rsa
Enter private key bits: (Default: 2048) 2048
Enter country code: (Default: GB) GB
Enter state: (Default: Some-State) Some-State
Enter locality: (Default: Some-City) Some-City
Enter organization name: (Default: VyOS) VyOS
Enter common name: (Default: vyos.io) VyOS Intermediary Client CA
Enter how many days certificate will be valid: (Default: 1825) 1095
Note: If you plan to use the generated key on this router, do not encrypt the private key.
Do you want to encrypt the private key with a passphrase? [y/N] n
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
```

The following examples use documentation-range addresses for SANs. Expiration
dates in the sample output depend on the certificates configured on a router.

Lastly, create the leaf certificates that devices and users will use.

% stop_vyoslinter
```none
[edit]
vyos@vyos# run generate pki certificate sign vyos_server_ca install vyos_cert
Do you already have a certificate request? [y/N] n
Enter private key type: [rsa, dsa, ec] (Default: rsa) rsa
Enter private key bits: (Default: 2048) 2048
Enter country code: (Default: GB) GB
Enter state: (Default: Some-State) Some-State
Enter locality: (Default: Some-City) Some-City
Enter organization name: (Default: VyOS) VyOS
Enter common name: (Default: vyos.io) vyos.net
Do you want to configure Subject Alternative Names? [y/N] y
Enter alternative names as a comma-separated list, for example:
`ipv4:192.0.2.1,ipv6:2001:db8::1,dns:vyos.net`.
Enter Subject Alternative Names: dns:vyos.net,dns:www.vyos.net
Enter how many days certificate will be valid: (Default: 365) 365
Enter certificate type: (client, server) (Default: server) server
Note: If you plan to use the generated key on this router, do not encrypt the private key.
Do you want to encrypt the private key with a passphrase? [y/N] n
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.


[edit]
vyos@vyos# run generate pki certificate sign vyos_client_ca install vyos_example_user
Do you already have a certificate request? [y/N] n
Enter private key type: [rsa, dsa, ec] (Default: rsa) rsa
Enter private key bits: (Default: 2048) 2048
Enter country code: (Default: GB) GB
Enter state: (Default: Some-State) Some-State
Enter locality: (Default: Some-City) Some-City
Enter organization name: (Default: VyOS) VyOS
Enter common name: (Default: vyos.io) Example User
Do you want to configure Subject Alternative Names? [y/N] y
Enter alternative names as a comma-separated list, for example:
`ipv4:192.0.2.1,ipv6:2001:db8::1,dns:vyos.net,rfc822:user@example.net`.
Enter Subject Alternative Names: rfc822:example.user@vyos.net
Enter how many days certificate will be valid: (Default: 365) 365
Enter certificate type: (client, server) (Default: server) client
Note: If you plan to use the generated key on this router, do not encrypt the private key.
Do you want to encrypt the private key with a passphrase? [y/N] n
2 value(s) installed. Use "compare" to see the pending changes, and "commit" to apply.
```
% start_vyoslinter
