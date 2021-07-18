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

  Genearate a new OpenVPN shared secret.


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
    Name                      Subject                                                                                                  Issuer CN                                Issued               Expiry               Private Key    Parent
    ------------------------  -------------------------------------------------------------------------------------------------------  ---------------------------------------  -------------------  -------------------  -------------  ------------------------
    CAcert_Class_3_Root       CN=CAcert Class 3 Root,OU=http://www.CAcert.org,O=CAcert Inc.                                            1.2.840.113549.1.9.1=support@cacert.org  2021-04-19 12:18:30  2031-04-17 12:18:30  No             CAcert_Signing_Authority
    CAcert_Signing_Authority  1.2.840.113549.1.9.1=support@cacert.org,CN=CA Cert Signing Authority,OU=http://www.cacert.org,O=Root CA  1.2.840.113549.1.9.1=support@cacert.org  2003-03-30 12:29:49  2033-03-29 12:29:49  No             N/A
    peer_172_18_254_202       CN=Easy-RSA CA                                                                                           CN=Easy-RSA CA                           2021-06-14 19:45:27  2031-06-12 19:45:27  No             N/A

.. opcmd:: show pki certificates

  Show a list of installed certificates

  .. code-block:: none

    cpo@LR1.wue3:~$ show pki certificate
    Certificates:
    Name                 Type    Subject CN    Issuer CN       Issued               Expiry               Revoked    Private Key    CA Present
    -------------------  ------  ------------  --------------  -------------------  -------------------  ---------  -------------  -------------------------
    peer_172_18_254_202  Server  CN=peer1      CN=Easy-RSA CA  2021-06-14 20:04:47  2024-05-29 20:04:47  No         Yes            Yes (peer_172_18_254_202)


.. opcmd:: show pki crl

  Show a list of installed :abbr:`CRLs (Certificate Revocation List)`.
