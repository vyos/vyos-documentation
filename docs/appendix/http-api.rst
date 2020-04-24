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

Operational requests
--------------------

In our example, we are creating a dummy interface and assigning an address to it:

.. code-block:: none

  curl -k -X POST -F data='{"op": "set", "path": ["interfaces", "dummy", "dum1", "address"], "value": "203.0.113.76/32"}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/configure

The ``/configure`` endpoint takes a request serialized in JSON. The only HTTP method it uses is POST. Request data is passed in the ``data=`` field and the API key is passed in the ``key=`` field. Key identifiers from the config are purely informational and the application doesn't need to know them, they only appear in the server logs to avoid exposing keys in log files, you only need the key itself.

Since internally there is no distinction between a path and a value, you can omit the value field and include the value in the path like it's done in the shell commands:

.. code-block:: none

  curl -k -X POST -F data='{"op": "set", "path": ["interfaces", "dummy", "dum10", "address", "203.0.113.99/32"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/configure

Separate value field make the semantics more clear though, and also makes it easier to create a command template once and update it with different values as needed.

You can pass the ``set``, ``delete`` or ``comment`` command to it. The API will push the command to the session and commit.


Configuration management requests
---------------------------------

When saving or loading a configuration, the endpoint is ``/config-file`` and you can pass the ``save`` or ``load`` command.

If you don't specify the file when saving, it saves to ``/config/config.boot``. Here's an example:

.. code-block:: none

  # curl -k -X POST -F key=MY-HTTP-API-PLAINTEXT-KEY -Fdata='{"op": "save", "file": "/config/config.boot"}' https://192.168.122.127/config-file



Reading config
--------------

To retrieve raw configs:

  # curl -X POST -F data='{"op": "showConfig", "path": ["interfaces", "dummy"]}' -F key=MY-HTTP-API-PLAINTEXT-KEY https://192.168.122.127/retrieve
 
It will returns: 
  {"success": true, "data": " /* So very dummy */\n dummy dum0 {\n     address 192.168.168.1/32\n     address 192.168.168.2/32\n     /* That is a description */\n     description \"Test interface\"\n }\n dummy dum1 {\n     address 203.0.113.76/32\n     address 203.0.113.79/32\n }\n", "error": null}


