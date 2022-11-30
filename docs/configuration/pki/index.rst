:lastproofread: 2021-09-01

.. include:: /_include/need_improvement.txt

###
PKI
###

VyOS 1.4 changed the way in how encryption keys or certificates are stored on the
system. In the pre VyOS 1.4 era, certificates got stored under /config and every
service referenced a file. That made copying a running configuration from system
A to system B a bit harder, as you had to copy the files and their permissions
by hand.

:vytask:`T3642` describes a new CLI subsystem that serves as a "certstore" to
all services requiring any kind of encryption key(s). In short, public and
private certificates are now stored in PKCS#8 format in the regular VyOS CLI.
Keys can now be added, edited, and deleted using the regular set/edit/delete
CLI commands.

VyOS not only can now manage certificates issued by 3rd party Certificate
Authorities, it can also act as a CA on its own. You can create your own root
CA and sign keys with it by making use of some simple op-mode commands.

Don't be afraid that you need to re-do your configuration. Key transformation is
handled, as always, by our migration scripts, so this will be a smooth transition
for you!

Key Generation
==============

Certificate Authority (CA)
--------------------------

VyOS now also has the ability to create CAs, keys, Diffie-Hellman and other
keypairs from an easy to access operational level command.

.. opcmd:: generate pki ca

  Create a new :abbr:`CA (Certificate Authority)` and output the CAs public and
  private key on the console.

.. opcmd:: generate pki ca install <name>

  Create a new :abbr:`CA (Certificate Authority)` and output the CAs public and
  private key on the console.

  .. include:: pki_cli_import_help.txt

.. opcmd:: generate pki ca sign <ca-name>

  Create a new subordinate :abbr:`CA (Certificate Authority)` and sign it using
  the private key referenced by `ca-name`.

.. opcmd:: generate pki ca sign <ca-name> install <name>

  Create a new subordinate :abbr:`CA (Certificate Authority)` and sign it using
  the private key referenced by `name`.

  .. include:: pki_cli_import_help.txt

Certificates
------------

.. opcmd:: generate pki certificate

  Create a new public/private keypair and output the certificate on the console.

.. opcmd:: generate pki certificate install <name>

  Create a new public/private keypair and output the certificate on the console.

  .. include:: pki_cli_import_help.txt

.. opcmd:: generate pki certificate self-signed

  Create a new self-signed certificate. The public/private is then shown on the
  console.

.. opcmd:: generate pki certificate self-signed install <name>

  Create a new self-signed certificate. The public/private is then shown on the
  console.

  .. include:: pki_cli_import_help.txt

.. opcmd:: generate pki certificate sign <ca-name>

  Create a new public/private keypair which is signed by the CA referenced by
  `ca-name`. The signed certificate is then output to the console.

.. opcmd:: generate pki certificate sign <ca-name> install <name>

  Create a new public/private keypair which is signed by the CA referenced by
  `ca-name`. The signed certificate is then output to the console.

  .. include:: pki_cli_import_help.txt

Diffie-Hellman parameters
-------------------------

.. opcmd:: generate pki dh

  Generate a new set of :abbr:`DH (Diffie-Hellman)` parameters. The key size
  is requested by the CLI and defaults to 2048 bit.

  The generated parameters are then output to the console.

.. opcmd:: generate pki dh install <name>

  Generate a new set of :abbr:`DH (Diffie-Hellman)` parameters. The key size
  is requested by the CLI and defaults to 2048 bit.

  .. include:: pki_cli_import_help.txt

OpenVPN
-------

.. opcmd:: generate pki openvpn shared-secret

  Genearate a new OpenVPN shared secret. The generated secred is the output to
  the console.

.. opcmd:: generate pki openvpn shared-secret install <name>

  Genearate a new OpenVPN shared secret. The generated secred is the output to
  the console.

  .. include:: pki_cli_import_help.txt

WireGuard
---------

.. opcmd:: generate pki wireguard key-pair

  Generate a new WireGuard public/private key portion and output the result to
  the console.

.. opcmd:: generate pki wireguard key-pair install <interface>

  Generate a new WireGuard public/private key portion and output the result to
  the console.

  .. note:: In addition to the command above, the output is in a format which can
    be used to directly import the key into the VyOS CLI by simply copy-pasting
    the output from op-mode into configuration mode.

    ``interface`` is used for the VyOS CLI command to identify the WireGuard
    interface where this private key is to be used.

.. opcmd:: generate pki wireguard pre-shared-key

  Generate a WireGuard pre-shared secret used for peers to communicate.

.. opcmd:: generate pki wireguard pre-shared-key install <peer>

  Generate a WireGuard pre-shared secret used for peers to communicate.

  .. note:: In addition to the command above, the output is in a format which can
    be used to directly import the key into the VyOS CLI by simply copy-pasting
    the output from op-mode into configuration mode.

    ``peer`` is used for the VyOS CLI command to identify the WireGuard peer where
    this secred is to be used.

Key usage (CLI)
===============

CA (Certificate Authority)
--------------------------

.. cfgcmd:: set pki ca <name> certificate

  Add the public CA certificate for the CA named `name` to the VyOS CLI.

  .. note:: When loading the certificate you need to manually strip the
    ``-----BEGIN CERTIFICATE-----`` and ``-----END CERTIFICATE-----`` tags.
    Also, the certificate/key needs to be presented in a single line without
    line breaks (``\n``), this can be done using the following shell command:

    ``$ tail -n +2 ca.pem | head -n -1 | tr -d '\n'``

.. cfgcmd:: set pki ca <name> crl

  Certificate revocation list in PEM format.

.. cfgcmd:: set pki ca <name> description

  A human readable description what this CA is about.

.. cfgcmd:: set pki ca <name> private key

  Add the CAs private key to the VyOS CLI. This should never leave the system,
  and is only required if you use VyOS as your certificate generator as
  mentioned above.

  .. note:: When loading the certificate you need to manually strip the
    ``-----BEGIN KEY-----`` and ``-----END KEY-----`` tags. Also, the
    certificate/key needs to be presented in a single line without line
    breaks (``\n``), this can be done using the following shell command:

    ``$ tail -n +2 ca.key | head -n -1 | tr -d '\n'``

.. cfgcmd:: set pki ca <name> private password-protected

  Mark the CAs private key as password protected. User is asked for the password
  when the key is referenced.

Server Certificate
------------------

After we have imported the CA certificate(s) we can now import and add
certificates used by services on this router.

.. cfgcmd:: set pki certificate <name> certificate

  Add public key portion for the certificate named `name` to the VyOS CLI.

  .. note:: When loading the certificate you need to manually strip the
    ``-----BEGIN CERTIFICATE-----`` and ``-----END CERTIFICATE-----`` tags.
    Also, the certificate/key needs to be presented in a single line without
    line breaks (``\n``), this can be done using the following shell command:

    ``$ tail -n +2 cert.pem | head -n -1 | tr -d '\n'``

.. cfgcmd:: set pki certificate <name> description

  A human readable description what this certificate is about.

.. cfgcmd:: set pki certificate <name> private key

  Add the private key portion of this certificate to the CLI. This should never
  leave the system as it is used to decrypt the data.

  .. note:: When loading the certificate you need to manually strip the
    ``-----BEGIN KEY-----`` and ``-----END KEY-----`` tags. Also, the
    certificate/key needs to be presented in a single line without line
    breaks (``\n``), this can be done using the following shell command:

    ``$ tail -n +2 cert.key | head -n -1 | tr -d '\n'``

.. cfgcmd:: set pki certificate <name> private password-protected

  Mark the private key as password protected. User is asked for the password
  when the key is referenced.

.. cfgcmd:: set pki certificate <name> revoke

  If CA is present, this certificate will be included in generated CRLs

.. _pki-cert-chains-example:

Certificate Chains Example
--------------------------

This example is meant to clarify the role of certificate chains and how to
import them into Vyos' PKI for those unfamiliar with how they work.

When Vyos is used to terminate a TLS session, such as in the case of enabling
the :ref:`http-api`, it will not be enough to simply add the server's 
certificate and key to the PKI unless that certificate is issued directly by
a root CA which the client already trusts.

RFC 5246 7.4.2 specifies that during a TLS handshake the server must provide the
entire chain of public certificates (optionally omitting the root certificate) 
which authenticate its identity to the client. The first certificate in that 
list will be the server's certificate, for which the server also has the 
corresponding private key. Each certificate which follows must directly certify
the one which precedes it, up to the root certificate. These certifying 
certificates are ones for which the server will not possess the corresponding 
private key.

As an example, LetsEncrypt supplies a ``fullchain.pem`` file which contains the 
entire chain of public certificates concatenated in the correct order, starting 
with the server certificate and ending with the root certificate. When manually
adding a LetsEncrypt certificate to Vyos' PKI, such as in the case of a DNS 
wildcard certificate generated somewhere other than Vyos, the server certificate
and its private key should be added with the ``set pki certificate`` command and 
all following certificates should be added with the ``set pki ca`` command 
without a private key.

The following ``sed`` command will break a concatenated file of certificates 
into several single-line base 64 representations which can be directly used in 
the ``set pki certificate <name> certificate`` and 
``set pki ca <name> certificate`` commands.

.. code-block:: bash

  sed -r ':a;N;$!ba;s/\n//g;s/-{5}[A-Z ]+-{5}/ /g;s/(^\s+|\s+$)//g;s/\s+/\n\n/g' fullchain.pem

  # This can also be set as a bash alias with some escaping
  alias pem-vyos="sed -r ':a;N;\$!ba;s/\\n//g;s/-{5}[A-Z ]+-{5}/ /g;s/(^\\s+|\\s+$)//g;s/\s+/\\n\\n/g'"
  pem-vyos fullchain.pem

For example, assume you are trying to use an externally generated LetsEncrypt 
DNS wildcard certificate into Vyos' PKI for use with the :ref:`http-api`. You 
have four files from LetsEncrypt:

* ``cert.pem`` - contains the wildcard certificate for your server
* ``privkey.pem`` - contains the private key which matches ``cert.pem``
* ``chain.pem`` - contains the public certs for LetsEncrypt and ISRG (root CA)
* ``fullchain.pem`` - concatenation of ``cert.pem`` plus ``chain.pem``

Running the ``sed`` command above on ``chain.pem`` or ``fullchain.pem`` will 
output two or three (respectively) single line base 64 certificates which can 
be directly copied and pasted. The last certificate in the output will be the 
root CA, and the second-to-last will be LetsEncrypt's. 

.. code-block:: none

  set pki ca isrg certificate <ISRG's certificate data>
  set pki ca lets_encrypt certificate <LetsEncrypt's certificate data>

Then running the ``sed`` command on ``cert.pem`` and ``privkey.pem`` will output
the prepared forms of your server certificate and its private key, respectively.

.. code-block:: none

  set pki certificate my_cert certificate <certificate data>
  set pki certificate my_cert private key <key data>

If there are more issuer certificates in the chain, they should also be added 
as CAs. The configuration can be verified with the ``show pki`` command:

.. code-block:: none 

  vyos@vyos:~$ show pki
  Certificate Authorities:
  Name          Subject                                                  Issuer CN          Issued               Expiry               Private Key    Parent
  ------------  -------------------------------------------------------  -----------------  -------------------  -------------------  -------------  --------
  isrg          CN=ISRG Root X1,O=Internet Security Research Group,C=US  CN=DST Root CA X3  2021-01-20 19:14:03  2024-09-30 18:14:03  No             N/A
  lets_encrypt  CN=R3,O=Let's Encrypt,C=US                               CN=ISRG Root X1    2020-09-04 00:00:00  2025-09-15 16:00:00  No             isrg
  Certificates:
  Name             Type    Subject CN            Issuer CN    Issued               Expiry               Revoked    Private Key    CA Present
  ---------------  ------  --------------------  -----------  -------------------  -------------------  ---------  -------------  ------------------
  my_cert          Server  CN=*.example.com      CN=R3        2022-11-28 10:19:30  2023-02-26 10:19:29  No         Yes            Yes (lets_encrypt)

The certificate should identify the correct CA under the "CA Present" field, and 
each CA should identify the correct parent down to the root CA.

Operation
=========

VyOS operational mode commands are not only available for generating keys but
also to display them.

.. opcmd:: show pki ca

  Show a list of installed :abbr:`CA (Certificate Authority)` certificates.

  .. code-block:: none

    vyos@vyos:~$ show pki ca
    Certificate Authorities:
    Name            Subject                                                  Issuer CN          Issued               Expiry               Private Key    Parent
    --------------  -------------------------------------------------------  -----------------  -------------------  -------------------  -------------  --------------
    DST_Root_CA_X3  CN=ISRG Root X1,O=Internet Security Research Group,C=US  CN=DST Root CA X3  2021-01-20 19:14:03  2024-09-30 18:14:03  No             N/A
    R3              CN=R3,O=Let's Encrypt,C=US                               CN=ISRG Root X1    2020-09-04 00:00:00  2025-09-15 16:00:00  No             DST_Root_CA_X3
    vyos_rw         CN=VyOS RW CA,O=VyOS,L=Some-City,ST=Some-State,C=GB      CN=VyOS RW CA      2021-07-05 13:46:03  2026-07-04 13:46:03  Yes            N/A

.. opcmd:: show pki ca <name>

  Show only information for specified Certificate Authority.

.. opcmd:: show pki certificate

  Show a list of installed certificates

  .. code-block:: none

    vyos@vyos:~$ show pki certificate
    Certificates:
    Name       Type    Subject CN             Issuer CN      Issued               Expiry               Revoked    Private Key    CA Present
    ---------  ------  ---------------------  -------------  -------------------  -------------------  ---------  -------------  -------------
    ac2        Server  CN=ac2.vyos.net        CN=R3          2021-07-05 07:29:59  2021-10-03 07:29:58  No         Yes            Yes (R3)
    rw_server  Server  CN=VyOS RW             CN=VyOS RW CA  2021-07-05 13:48:02  2022-07-05 13:48:02  No         Yes            Yes (vyos_rw)

.. opcmd:: show pki certificate <name>

  Show only information for specified certificate.

.. opcmd:: show pki crl

  Show a list of installed :abbr:`CRLs (Certificate Revocation List)`.
