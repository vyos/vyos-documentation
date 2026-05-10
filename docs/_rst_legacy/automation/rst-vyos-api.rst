:lastproofread: 2023-01-16

.. _vyosapi:

########
VyOS API
########

For configuration and enabling the API see :ref:`http-api`

**************
Authentication
**************

All endpoints except one listen on HTTP POST requests and the API KEY must set
as ``key`` in the formdata. The only public endpoint listens to HTTP GET request
and takes optional query parameters.

Below see one example for curl and one for python.
The rest of the documentation is reduced to curl.

.. code-block:: none

   curl --location --request POST 'https://vyos/retrieve' \
   --form data='{"op": "showConfig", "path": []}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

.. code-block:: python

   import requests
   url = "https://vyos/retrieve"
   payload={'data': '{"op": "showConfig", "path": []}',
            'key': 'MY-HTTPS-API-PLAINTEXT-KEY'
           }
   headers = {}
   response = requests.request("POST", url, headers=headers, data=payload)
   print(response.text)


*************
API Endpoints
*************
/info
=========

This is the only endpoint provided by the API service that does not require
authentication and can be queried by anonymous users. Requesting the ``info``
endpoint you obtain general information about the system, namely the VyOS
version, the system host name and a welcome banner for anonymous users.

This endpoint responds **only** to HTTP GET requests.

.. code-block:: none

    curl --location --request GET 'https://vyos/info'

    response
    {
        "success": true,
        "data": {
            "version": "1.5-rolling",
            "hostname: "vyos"
            "banner": "Welcome to VyOS"
        },
        "error": null
    }

This endpoint can take two optional query parameters - ``version`` and
``hostname``. These parameters accept all values that can be converted to
Boolean - e.g. ``yes/no``, ``1/0``, ``true/false`` etc, and they dictate whether
to include the respective values into the response.

If request is sent without any query parameters, the endpoints treats them as
if they are set to ``true`` by default:

.. code-block:: none

    curl --location --request GET 'https://vyos/info?version=1&hostname=1'

    response {
        "success": true,
        "data": {
            "version": "1.5-rolling",
            "hostname": "vyos",
            "banner": "Welcome to VyOS"
        },
        "error": null
    }

If any of the parameters is set to a value that corresponds to ``false``, the
response object will have an empty string instead of the respective value:

.. code-block:: none

    curl --location --request GET 'https://vyos/info?version=0&hostname=1'

    response {
        "success": true,
        "data": {
            "version": "",
            "hostname": "vyos",
            "banner": "Welcome to VyOS"
        },
        "error": null
    }

Please note, that there is no need to specify both parameters if you want to
hide just one of the fields - a missing query parameter is treated as ``true``:

.. code-block:: none

    curl --location --request GET 'https://vyos/info?hostname=no'

    response {
        "success": true,
        "data": {
            "version": "1.5-rolling",
            "hostname": "",
            "banner": "Welcome to VyOS"
        },
        "error": null
    }

Please note, that while you can disable output for both ``hostname`` and
``version``, the ``banner`` is included into the response in any case.

**Important:** The endpoint accepts **ONLY** ``hostname`` and ``version`` query
parameters. Including any other besides them, or instead of them, will respond
with HTTP 400 Bad Request:

.. code-block:: none

    curl --location --request GET \
        'https://192.168.56.119/info?hostname=1&url=https://evilsite.com'

    response {
        "success": false,
        "error": "{'type': 'extra_forbidden', 'loc': ('query', 'url'), 'msg': 'Extra inputs are not permitted', 'input': 'https://evilsite.com'}",
        "data": null
    }

As well as the values passed to the query string are validated to ensure they
are strictly Boolean and won't accept any other data type:

.. code-block:: none

    curl --location --request GET 'https://vyos/info?hostname=1; eval"sudo rm -rf /"

    response
    {
        "success": false,
        "error": "{'type': 'bool_parsing', 'loc': ('query', 'hostname'), 'msg': 'Input should be a valid boolean, unable to interpret input', 'input': '1; eval \"sudo rm -rf /\"'}",
        "data": null
    }

/retrieve
=========

With the ``retrieve`` endpoint you get parts or the whole configuration.

To get the whole configuration, pass an empty list to the ``path`` field 

.. code-block:: none

   curl --location --request POST 'https://vyos/retrieve' \
   --form data='{"op": "showConfig", "path": []}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'


   response (shorted)
   {
      "success": true,
      "data": {
         "interfaces": {
               "ethernet": {
                  "eth0": {
                     "address": "dhcp",
                     "duplex": "auto",
                     "hw-id": "50:00:00:01:00:00",
                     "speed": "auto"
                  },
                  "eth1": {
                     "duplex": "auto",
                     "hw-id": "50:00:00:01:00:01",
                     "speed": "auto"
      ...
      },
      "error": null
   }


To only get a part of the configuration, for example ``system syslog``.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/retrieve' \
   --form data='{"op": "showConfig", "path": ["system", "syslog"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'


   response:
   {
      "success": true,
      "data": {
         "global": {
               "facility": {
                  "all": {
                     "level": "info"
                  },
                  "protocols": {
                     "level": "debug"
                  }
               }
         }
      },
      "error": null
   }

if you just want the Value of a multi-valued node, use the ``returnValues``
operation.

For example, get the addresses of a ``dum0`` interface.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/retrieve' \
   --form data='{"op": "returnValues", "path": ["interfaces","dummy","dum0","address"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   respone:
   {
      "success": true,
      "data": [
         "10.10.10.10/24",
         "10.10.10.11/24",
         "10.10.10.12/24"
      ],
      "error": null
   }

To check existence of a configuration path, use the ``exists`` operation.

For example, check an existing path:

.. code-block:: none

   curl -k --location --request POST 'https://vyos/retrieve' \
   --form data='{"op": "exists", "path": ["service","https","api"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": true,
      "error": null
   }

versus a non-existent path:

.. code-block:: none

   curl -k --location --request POST 'https://vyos/retrieve' \
   --form data='{"op": "exists", "path": ["service","non","existent","path"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": false,
      "error": null
   }

/reset
======

The ``reset`` endpoint run a ``reset`` command.

.. code-block:: none

   curl --location --request POST 'https://vyos/reset' \
   --form data='{"op": "reset", "path": ["ip", "bgp", "192.0.2.11"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   respone:
   {
     "success": true,
     "data": "",
     "error": null
   }

/reboot
=======

To initiate a reboot use the ``reboot`` endpoint.

.. code-block:: none

   curl --location --request POST 'https://vyos/reboot' \
   --form data='{"op": "reboot", "path": ["now"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   respone:
   {
     "success": true,
     "data": "",
     "error": null
   }

/poweroff
=========

To power off the system use the ``poweroff`` endpoint.

.. code-block:: none

   curl --location --request POST 'https://vyos/poweroff' \
   --form data='{"op": "poweroff", "path": ["now"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   respone:
   {
     "success": true,
     "data": "",
     "error": null
   }


/image
======

To add or delete an image, use the ``/image`` endpoint.

add an image

.. code-block:: none

   curl -k --location --request POST 'https://vyos/image' \
   --form data='{"op": "add", "url": "https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso"}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   respone (shorted):
   {
      "success": true,
      "data": "Trying to fetch ISO file from https://downloads.vyos.io/rolling-latest.iso\n
               ...
               Setting up grub configuration...\nDone.\n",
      "error": null
   }

delete an image, for example ``1.3-rolling-202006070117``

.. code-block:: none

   curl -k --location --request POST 'https://vyos/image' \
   --form data='{"op": "delete", "name": "1.3-rolling-202006070117"}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": "Deleting the \"1.3-rolling-202006070117\" image...\nDone\n",
      "error": null
   }


/show
=====

The ``/show`` endpoint is to show everything in the operational mode.

For example, show which images are installed.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/show' \
   --form data='{"op": "show", "path": ["system", "image"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": "The system currently has the following image(s) installed:\n\n
                1: 1.4-rolling-202102280559 (default boot)\n
                2: 1.4-rolling-202102230218\n
                3: 1.3-beta-202102210443\n\n",
      "error": null
   }


/generate
=========

The ``generate`` endpoint run a ``generate`` command.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/generate' \
   --form data='{"op": "generate", "path": ["pki", "wireguard", "key-pair"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": "Private key: CFZR2eyhoVZwk4n3JFPMJx3E145f1EYgDM+ubytXYVY=\n
               Public key: jjtpPT8ycI1Q0bNtrWuxAkO4k88Xwzg5VHV9xGZ58lU=\n\n",
      "error": null
   }


/configure
==========

You can pass a ``set``, ``delete`` or ``comment`` command to the
``/configure`` endpoint.

``set`` a single command

.. code-block:: none

   curl -k --location --request POST 'https://vyos/configure' \
   --form data='{"op": "set", "path": ["interfaces", "dummy", "dum1", "address", "10.11.0.1/32"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": null,
      "error": null
   }


``delete`` a single command

.. code-block:: none

   curl -k --location --request POST 'https://vyos/configure' \
   --form data='{"op": "delete", "path": ["interfaces", "dummy", "dum1", "address", "10.11.0.1/32"]}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": null,
      "error": null
   }

The API pushes every request to a session and commit it.
But some of VyOS components like DHCP and PPPoE Servers, IPSec, VXLAN, and
other tunnels require full configuration for commit. 
The endpoint will process multiple commands when you pass them as a list to
the ``data`` field.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/configure' \
   --form data='[{"op": "set","path":["interfaces","vxlan","vxlan1","remote","203.0.113.99"]}, {"op": "set","path":["interfaces","vxlan","vxlan1","vni","1"]}]' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": null,
      "error": null
   }


/config-file
============

The endpoint ``/config-file`` is to save or load a configuration.

Save a running configuration to the startup configuration.
When you don't specify the file when saving, it saves to
``/config/config.boot``.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/config-file' \
   --form data='{"op": "save"}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": "Saving configuration to '/config/config.boot'...\nDone\n",
      "error": null
   }


Save a running configuration to a file.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/config-file' \
   --form data='{"op": "save", "file": "/config/test.config"}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": "Saving configuration to '/config/test.config'...\nDone\n",
      "error": null
   }


To Load a configuration file.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/config-file' \
   --form data='{"op": "load", "file": "/config/test.config"}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": null,
      "error": null
   }

To Merge a configuration file.

.. code-block:: none

   curl -k --location --request POST 'https://vyos/config-file' \
   --form data='{"op": "merge", "file": "/config/test.config"}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": null,
      "error": null
   }

In either of the last two cases, one can pass a string in the body of the
request, for example:

.. code-block:: none

   curl -k --location --request POST 'https://vyos/config-file' \
   --form data='{"op": "merge", "string": "interfaces {\nethernet eth1 {\naddress "192.168.2.137/24"\ndescription "test"\n}\n}\n"}' \
   --form key='MY-HTTPS-API-PLAINTEXT-KEY'

   response:
   {
      "success": true,
      "data": null,
      "error": null
   }

**************
Commit-confirm
**************

For the previous two endpoints discussed, a ``commit`` command is implicit
following a succesful request operation (``set | delete | load | merge``, or
a list of ``set`` and ``delete`` operations).  One can instead request a
``commit-confirm`` command by including the field ``confirm_time`` of type
int > 0. An example follows, in the alternative JSON format, for brevity,
although the standard form-data format is fine:

.. code-block:: none

   curl -k -X POST -d '{"key": "MY-HTTPS-API-PLAINTEXT-KEY", "op": "merge", "string": "interfaces {\nethernet eth1 {\naddress '192.168.137.1/24'\ndescription 'internal'\n}\n}\n", "confirm_time": 1}' https://vyos/config-file

   response:
   {
      "success": true,
      "data": "Initialized commit-confirm; 1 minutes to confirm before reload\n",
      "error": null
   }

The committed changes will be reverted at the timeout unless confirmed.
To confirm and keep the changes:

.. code-block:: none

   curl -k -X POST -d '{"key": "MY-HTTPS-API-PLAINTEXT-KEY", "op": "confirm"}' https://vyos/config-file

   response:
   {
      "success": true,
      "data": "Reload timer stopped\n",
      "error": null
   }

If allowed to revert to the previous configuration, the manner in which
changes are reverted is governed by:

.. code-block:: none

   vyos@vyos# set system config-management commit-confirm action
   Possible completions:
      reload               Reload previous configuration if not confirmed
      reboot               Reboot to saved configuration if not confirmed (default)
