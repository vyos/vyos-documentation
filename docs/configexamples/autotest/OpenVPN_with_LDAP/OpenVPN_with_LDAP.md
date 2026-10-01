---
lastproofread: '2026-10-01'
---

(examples-openvpn-with-ldap)=

# OpenVPN with LDAP

```{eval-rst}
| Testdate: 2023-05-11
| Version: 1.4-rolling-202305100734
```

This lab demonstrates OpenVPN user authentication against Active Directory
through the `openvpn-auth-ldap` plugin.

The topology consists of a Windows Server 2019 system running Active Directory,
a VyOS OpenVPN server, and a VyOS OpenVPN client.

```{image} _include/topology.webp
:alt: OpenVPN with LDAP topology image
```


## Active Directory on Windows Server

The lab assumes that Active Directory is installed on Windows Server. These
PowerShell commands install the AD DS role and create a test forest:

```powershell
# Install the Active Directory Domain Services role
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools

Install-ADDSForest -DomainName "vyos.local" -DomainNetBiosName "VYOS" -InstallDns
```

The forest installation restarts the server. After it comes back up, create
the test accounts:

```powershell
New-ADUser -Name 'binduser' -AccountPassword (Read-Host -AsSecureString 'Password for binduser') -Enabled $true
New-ADUser -Name 'user01' -AccountPassword (Read-Host -AsSecureString 'Password for user01') -Enabled $true
```

Use the `binduser` password in the LDAP configuration and the `user01`
password when authenticating the VPN client. Use test-only credentials in this
lab; the LDAP example below does not enable TLS.


## Configure VyOS as OpenVPN Server

This example uses both a client certificate and LDAP username/password
authentication. OpenVPN requires both checks to succeed.

First, generate a CA, signed server and client certificates, and Diffie-Hellman
parameters. See {ref}`the PKI guide <configuration/pki/index:pki>` for details.

Create `/config/auth/ldap-auth.config` on the OpenVPN server using the example
below. The [plugin repository](https://github.com/threerings/openvpn-auth-ldap)
includes a sample `auth-ldap.conf` with the available settings.

```{literalinclude} _include/ldap-auth.config
:language: none
```

Generate the required certificates on the OpenVPN server. Run these commands
from configuration mode:

First, create the CA:

```none
vyos@ovpn-server# run generate pki ca install OVPN-CA
```

Then create signed server and client certificates:

```none
vyos@ovpn-server# run generate pki certificate sign OVPN-CA install SRV
vyos@ovpn-server# run generate pki certificate sign OVPN-CA install CLIENT
```

Finally, generate the Diffie-Hellman parameters:

```none
vyos@ovpn-server# run generate pki dh install DH
```

These commands install generated certificate and key material in the
configuration. The following shows the configuration tree structure; the
certificate and key values are placeholders:

```none
set pki ca OVPN-CA certificate '<BASE64 CA CERTIFICATE>'
set pki ca OVPN-CA private key '<CA PRIVATE KEY>'
set pki certificate SRV certificate '<BASE64 SERVER CERTIFICATE>'
set pki certificate SRV private key '<SERVER PRIVATE KEY>'
set pki certificate CLIENT certificate '<BASE64 CLIENT CERTIFICATE>'
set pki certificate CLIENT private key '<CLIENT PRIVATE KEY>'
set pki dh DH parameters '<BASE64 DH PARAMETERS>'
```

Once all the required certificates and keys are installed, the remaining
OpenVPN Server configuration can be carried out.

```{literalinclude} _include/ovpn-server.conf
:language: none
```


## Client configuration

Because the client certificate is stored on the server, you can generate a
client profile from the VyOS CLI:

```none
vyos@ovpn-server:~$ generate openvpn client-config interface vtun10 ca OVPN-CA certificate CLIENT
```

The command output contains the client private key. Save it as an `.ovpn`
profile and protect the file. Add `auth-user-pass` as a top-level line in the
profile so the client prompts for the `user01` credentials required by the LDAP
plugin. The generated profile already contains the CA and client certificate.

### Configure VyOS as client

```none
set interfaces openvpn vtun10 authentication username 'user01'
set interfaces openvpn vtun10 authentication password '<user01-password>'
set interfaces openvpn vtun10 encryption data-ciphers 'aes256'
set interfaces openvpn vtun10 hash 'sha512'
set interfaces openvpn vtun10 mode 'client'
set interfaces openvpn vtun10 persistent-tunnel
set interfaces openvpn vtun10 protocol 'udp'
set interfaces openvpn vtun10 remote-host '198.51.100.254'
set interfaces openvpn vtun10 remote-port '1194'
set interfaces openvpn vtun10 tls ca-certificate 'OVPN-CA'
set interfaces openvpn vtun10 tls certificate 'CLIENT'
```


## Monitoring

To check whether a client is connected, run this command on the server:

```none
vyos@ovpn-server:~$ show openvpn server
OpenVPN status on vtun10

Client CN    Remote Host         Tunnel IP    Local Host           TX bytes    RX bytes    Connected Since
-----------  ------------------  -----------  -------------------  ----------  ----------  -------------------
client       198.51.100.1:55150  10.23.1.6    198.51.100.254:1194  4.7 KB      4.7 KB      2023-05-11 12:47:11
```
