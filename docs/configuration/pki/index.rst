lastproofread: 1970-01-01

.. include:: /_include/need_improvement.txt

###
PKI
###

VyOS 1.4 changed the way in how encrytions keys/certificates are stored on the
running system. In the pre VyOS 1.4 era, certificates got stored under /config
ans every service referenced a file. That made copying a running configuration
from system A to system B a bit harder, as you had to copy the files and their
permissions by hand.

VyOS 1.4 comes with a new approach where the keys are stored on the CLI and are
simply referenced by their name.

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

.. opcmd:: generate pki ca sign <name> install

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

Configuration
=============

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

.. opcmd:: show pki certificates

  Show a list of installed certificates

  .. code-block:: none

    vyos@vyos:~$ show pki certificate
    Certificates:
    Name       Type    Subject CN             Issuer CN      Issued               Expiry               Revoked    Private Key    CA Present
    ---------  ------  ---------------------  -------------  -------------------  -------------------  ---------  -------------  -------------
    ac2        Server  CN=ac2.vyos.net        CN=R3          2021-07-05 07:29:59  2021-10-03 07:29:58  No         Yes            Yes (R3)
    rw_server  Server  CN=VyOS RW             CN=VyOS RW CA  2021-07-05 13:48:02  2022-07-05 13:48:02  No         Yes            Yes (vyos_rw)

.. opcmd:: show pki crl

  Show a list of installed :abbr:`CRLs (Certificate Revocation List)`.
