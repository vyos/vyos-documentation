.. _http-api:

########
HTTP-API
########

Enabling HTTP-API
-----------------

VyOS HTTP API can be enabled through the ``set service https api`` command.

.. code-block:: none

  set service https api debug
  set service https api keys id MY-HTTP-API-ID key MY-HTTP-API-PLAINTEXT-KEY

The local API process listens on localhost:8080, and nginx exposes it on all
virtual servers, by default. For the purpose of illustration below, we will
assume nginx is running at https://192.168.122.127.

One can limit proxying to specific listen addresses/ports/server-names by
defining a ``service https virtual-host <id>``, and setting ``service https
api-restrict virtual-host <id>``.

.. code-block:: none

  set service https virtual-host example listen-address 192.168.122.127
  set service https virtual-host example listen-port 44302
  set service https virtual-host example server-name example.net

  set service https api-restrict virtual-host example

In this example, nginx will proxy only those requests to
192.168.122.127:44302 or example.net:44302 (assuming the DNS record is
viable). Omitting any of listen-address, listen-port, or server-name, will
leave appropriate defaults in the nginx directive. Multiple instances of
``service https api-restrict virtual-host`` may be set.

Configuration mode requests
---------------------------

In our example, we are creating a dummy interface and assigning an address to it:

.. code-block:: none

  curl -k -X POST -F data='{"op": "set", "path": ["interfaces", "dummy", "dum1", "address"], "value": "203.0.113.76/32"}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/configure

The ``/configure`` endpoint takes a request serialized in JSON. The only HTTP method it uses is POST. Request data is passed in the ``data=`` field and the API key is passed in the ``key=`` field. Key identifiers from the config are purely informational and the application doesn't need to know them, they only appear in the server logs to avoid exposing keys in log files, you only need the key itself.

Since internally there is no distinction between a path and a value, you can omit the value field and include the value in the path like it's done in the shell commands:

.. code-block:: none

  curl -k -X POST -F data='{"op": "set", "path": ["interfaces", "dummy", "dum10", "address", "203.0.113.99/32"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/configure

Separate value field make the semantics more clear though, and also makes it easier to create a command template once and update it with different values as needed.

You can pass the ``set``, ``delete`` or ``comment`` command to it. The API will push the command to the session and commit.

To retrieve a value:

.. code-block:: none

  curl -k -X POST -F data='{"op": "returnValue", "path": ["interfaces", "dummy", "dum1", "address"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/retrieve

Use ``returnValues`` for multi-valued nodes.


Show config
"""""""""""

To retrieve the full config under a path:

.. code-block:: none

  # curl -k -X POST -F data='{"op": "showConfig", "path": ["interfaces", "dummy"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/retrieve

It will return:

.. code-block:: none

  {"success": true, "data": {"dummy": {"dum1": {"address": "203.0.113.76/32"}}}, "error": null}

Passing an empty path will return the full config:

.. code-block:: none

  # curl -k -X POST -F data='{"op": "showConfig", "path": []}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/retrieve


Configuration management requests
---------------------------------

When saving or loading a configuration, the endpoint is ``/config-file`` and you can pass the ``save`` or ``load`` command.

If you don't specify the file when saving, it saves to ``/config/config.boot``. Here's an example:

.. code-block:: none

  # curl -k -X POST -F key=MY-HTTP-API-PLAINTEXT-KEY -Fdata='{"op": "save", "file": "/config/config.boot"}' https://192.168.122.127/config-file

Image management requests
-------------------------

One may ``add`` or ``delete`` a system image using the endpoint ``/image``. Here are the respective examples:

``add`` from ``url``. Here we use the URL of the latest rolling release:

.. code-block:: none

  # curl -k -X POST -F data='{"op": "add", "url": "https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso"}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/image

``delete`` by image ``name``. For example:

.. code-block:: none

  # curl -k -X POST -F data='{"op": "delete", "name": "1.3-rolling-202006070117"}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/image

To list the available system images by name, one may use the operational mode request ``show`` discussed in the next section; in this setting it would be:

.. code-block:: none

  # curl -k -X POST -F data='{"op": "show", "path": ["system", "image"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/show

Operational mode requests
-------------------------

It is possible to run ``show`` and ``generate`` commands:


Request:

.. code-block:: none

  curl -k -X POST -F data='{"op": "generate", "path": ["wireguard", "default-keypair"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/generate

Response:

.. code-block:: none

  {"success": true, "data": "", "error": null}

Request:

.. code-block:: none

  curl -k -X POST -F data='{"op": "show", "path": ["wireguard", "keypairs", "pubkey", "default"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/show

Response:

.. code-block:: none

  {"success": true, "data": "<some pubkey>=\n", "error": null}

Request:

.. code-block:: none

  curl -k -X POST -F data='{"op": "show", "path": ["ip", "route"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/show

Response:

.. code-block:: none

  {"success": true, "data": "Codes: K - kernel route, C - connected, S - static, R - RIP,\n       O - OSPF, I - IS-IS, B - BGP, E - EIGRP, N - NHRP,\n       T - Table, v - VNC, V - VNC-Direct, A - Babel, D - SHARP,\n       F - PBR, f - OpenFabric,\n       > - selected route, * - FIB route, q - queued route, r - rejected route\n\nS>* 0.0.0.0/0 [210/0] via 192.168.100.1, eth0, 01:41:05\nC>* 192.168.0.0/24 is directly connected, eth1, 01:41:09\nC>* 192.168.100.0/24 is directly connected, eth0, 01:41:05\nC>* 203.0.113.76/32 is directly connected, dum1, 01:38:40\n", "error": null}

