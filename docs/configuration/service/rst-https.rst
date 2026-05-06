.. _http-api:

########
HTTP API
########

VyOS provide an HTTP API. You can use it to execute op-mode commands,
update VyOS, set or delete config.

Please take a look at the :ref:`vyosapi` page for an detailed how-to.

*************
Configuration
*************

.. cfgcmd:: set service https allow-client address <address>

   Only allow certain IP addresses or prefixes to access the https
   webserver.

.. cfgcmd:: set service https certificates ca-certificate <name>

   Use CA certificate from PKI subsystem

.. cfgcmd:: set service https certificates certificate <name>

   Use certificate from PKI subsystem

.. cfgcmd:: set service https certificates dh-params <name>

   Use :abbr:`DH (Diffie–Hellman)` parameters from PKI subsystem.
   Must be at least 2048 bits in length.

.. cfgcmd:: set service https listen-address <address>

   Webserver should only listen on specified IP address

.. cfgcmd:: set service https port <number>

   Webserver should listen on specified port.

   Default: 443

.. cfgcmd:: set service https enable-http-redirect

   Enable automatic redirect from http to https.

.. cfgcmd:: set service https tls-version <1.2 | 1.3>

   Select TLS version used.

   This defaults to both 1.2 and 1.3.

.. cfgcmd:: set service https vrf <name>

   Start Webserver in given  VRF.

API
===

.. cfgcmd:: set service https api keys id <name> key <apikey>

   Set a named api key. Every key has the same, full permissions
   on the system.

.. cfgcmd:: set service https api debug

   To enable debug messages. Available via :opcmd:`show log` or
   :opcmd:`monitor log`

.. cfgcmd:: set service https api strict

   Enforce strict path checking

*********************
Example Configuration
*********************

Set an API-KEY is the minimal configuration to get a working API Endpoint.

.. code-block:: none

   set service https api keys id MY-HTTPS-API-ID key MY-HTTPS-API-PLAINTEXT-KEY
