.. _http-api:

########
HTTP-API
########

VyOS provide an HTTP API. You can use it to execute op-mode commands,
update VyOS, set or delete config.

Please take a look at the :ref:`vyosapi` page for an detailed how-to.

*************
Configuration
*************

.. cfgcmd:: set service https api keys id <name> key <apikey>

   Set a named api key. Every key has the same, full permissions
   on the system.

.. cfgcmd:: set service https api debug

   To enable debug messages. Available via :opcmd:`show log` or 
   :opcmd:`monitor log`

.. cfgcmd:: set service https api port

   Set the listen port of the local API, this has no effect on the
   webserver. The default is port 8080

.. cfgcmd:: set service https api socket

   Use local socket for API

.. cfgcmd:: set service https api strict

   Enforce strict path checking

.. cfgcmd:: set service https virtual-host <vhost> listen-address 
            <ipv4 or ipv6 address>

   Address to listen for HTTPS requests

.. cfgcmd:: set service https virtual-host <vhost> listen-port <1-65535>

   Port to listen for HTTPS requests; default 443

.. cfgcmd:: set service https virtual-host <vhost> server-name <text>

   Server names for virtual hosts it can be exact, wildcard or regex.

.. cfgcmd:: set service https api-restrict virtual-host <vhost>

   By default, nginx exposes the local API on all virtual servers.
   Use this to restrict nginx to one or more virtual hosts.

.. cfgcmd:: set service https certificates certbot domain-name <text>

   Domain name(s) for which to obtain certificate

.. cfgcmd:: set service https certificates certbot email

   Email address to associate with certificate

.. cfgcmd:: set service https certificates system-generated-certificate

   Use an automatically generated self-signed certificate

.. cfgcmd:: set service https certificates system-generated-certificate
   lifetime <days>

   Lifetime in days; default is 365


**********************
Example Configurations
**********************

Set an API-KEY is the minimal configuration to get a working API Endpoint.

.. code-block:: none

   set service https api keys id MY-HTTPS-API-ID key MY-HTTPS-API-PLAINTEXT-KEY

The following examples demonstrate how to configure TLS certificates and 
virtual hosts.

Certbot Integration
===================

This configuration example uses Nginx's certbot integration to set up the API 
with a TLS certificate acquired from LetsEncrypt. This will require the 
following conditions:

* The hostname points to your Vyos instance in the public DNS system
* The instance is reachable by LetsEncrypt's public servers using that hostname

.. code-block:: none

   set service https api keys id MY-HTTPS-API-ID key MY-HTTPS-API-PLAINTEXT-KEY
   set service https certificates certbot domain-name rtr01.example.com
   set service https certificates certbot email mail@example.com
   set service https virtual-host rtr01 listen-address 198.51.100.2
   set service https virtual-host rtr01 listen-port 11443
   set service https virtual-host rtr01 server-name rtr01.example.com
   set service https api-restrict virtual-host rtr01

Manual Certificate 
==================

If the Vyos instance is not publicly accessible, certbot cannot be used directly 
to automatically manage certificates using the HTTP challenge method. However, 
if you have an externally acquired certificate, such as one acquired through 
LetsEncrypt's DNS challenge method, it can be loaded directly into the PKI 
and used from there.

To see how to load a full certificate chain, refer to the 
:ref:`pki-cert-chains-example` documentation. 

As in the example, assume that the certificate in the PKI is stored as 
``my_cert`` and the associated CA was stored as ``lets_encrypt``. After that, 
the API can be configured as follows:

.. code-block:: none

   set service https api keys id MY-HTTPS-API-ID key MY-HTTPS-API-PLAINTEXT-KEY

   set service https certificates ca-certificate lets_encrypt
   set service https certificates certificate my_cert

   set service https virtual-host rtr01 listen-address 198.51.100.2
   set service https virtual-host rtr01 listen-port 11443
   set service https virtual-host rtr01 server-name rtr01.example.com
   set service https api-restrict virtual-host rtr01
