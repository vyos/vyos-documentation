.. _http-api:

########
HTTP-API
########

VyOS provide a HTTP API. You can use it to execute op-mode commands,
update VyOS, set or delete config.

Please take a look at the :ref:`vyosapi` page for an detailed how-to.

*************
Configuration
*************

.. cfgcmd:: set service https api keys id <name> key <apikey>

   Set an named api key, every key have the same, full permissions
   on the system.

.. cfgcmd:: set service https api debug

   To enable debug messages. Available via :opcmd:`show log` or 
   :opcmd:`monitor log`

.. cfgcmd:: set service https api port

   Set the listen port of the local API, this have non effect of the
   webserver. The default is port 8080

.. cfgcmd:: set service https api strict

   Enforce strict path checking

.. cfgcmd:: set service https virtual-host <vhost> listen-address

   Address to listen for HTTPS requests

.. cfgcmd:: set service https virtual-host <vhost> listen-port <1-65535>

   Port to listen for HTTPS requests; default 443

.. cfgcmd:: set service https virtual-host <vhost> server-name <text>

   Server names for virtual hosts it ca be exact, wildcard or regex.

.. cfgcmd:: set service https api-restrict virtual-host <vhost>

   Nginx exposes the local API on all virtual servers, by default
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


*********************
Example Configuration
*********************

Set an API-KEY is the minimal configuration to get a working API Endpoint.

.. code-block:: none

   set service https api keys id MY-HTTPS-API-ID key MY-HTTPS-API-PLAINTEXT-KEY


To use this full configuration we asume a publice accessable hostname.

.. code-block:: none

   set service https api keys id MY-HTTPS-API-ID key MY-HTTPS-API-PLAINTEXT-KEY
   set service https certificates certbot domain-name rtr01.example.com
   set service https certificates certbot email mail@example.com
   set service https virtual-host rtr01 listen-address 198.51.100.2
   set service https virtual-host rtr01 listen-port 11443
   set service https virtual-host rtr01 server-name rtr01.example.com
   set service https api-restrict virtual-host rtr01.example.com