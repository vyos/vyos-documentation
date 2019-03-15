.. _host-information:

Host Information
----------------

This section describes the system's host information and how to configure them,
it covers the following topics:

* Host name
* Domain
* IP address
* Default gateway
* Aliases

Host Name
^^^^^^^^^

A hostname is the label (name) assigned to a network device (a host) on a
network and is used to distinguish one device from another on specific networks
or over the internet.

Set a system host name:

.. code-block:: sh

  set system host-name <hostname>

.. note:: Only letters, numbers and hyphens are allowed.

Show host name:

.. code-block:: sh

  show system host-name

Delete host name:

.. code-block:: sh

  delete system host-name <hostname>

Example: Set system hostname to 'RT01':

.. code-block:: sh

  set system host-name RT01
  commit
  show system host-name
    host-name RT01

Domain Name
^^^^^^^^^^^

A domainname is the label (name) assigned to a computer network and is thus
unique!

Set the system's domain:

.. code-block:: sh

  set system domain-name <domain>

.. note:: Only letters, numbers, hyphens and periods are allowed.

Show domain:

.. code-block:: sh

  show system domain-name

Remove domain name:

.. code-block:: sh

  set system delete domain-name <domain>

Example: Set system domain to example.com:

.. code-block:: sh

  set system domain-name example.com
  commit
  show system domain-name
    domain-name example.com

Static host mappings
^^^^^^^^^^^^^^^^^^^^

How to assign IPs to interfaces is described in chapter
:ref:`interfaces-addresses`. This section shows how to statically map a system
IP to its host name for local (meaning on this VyOS instance) DNS resolution:

.. code-block:: sh

  set system static-host-mapping host-name <hostname> inet <IP address>

Show static mapping:

.. code-block:: sh

  show system static-host-mapping

Example: Create a static mapping between the system's hostname `RT01` and
IP address `10.20.30.41`:

.. code-block:: sh

  set system static-host-mapping host-name RT01 inet 10.20.30.41
  commit
  show system static-host-mapping
    host-name RT01 {
        inet 10.20.30.41
    }

Aliases
*******

One or more system aliases (static mappings) can be defined:

.. code-block:: sh

  set system static-host-mapping host-name <hostname> alias <alias>

Show aliases:

.. code-block:: sh

  show system static-mapping

Delete alias:

.. code-block:: sh

  delete system static-host-mapping host-name <hostname> alias <alias>

Example: Set alias `router1` for system with hostname `RT01`:

.. code-block:: sh

  set system static-host-mapping host-name RT01 alias router1
  commit
  show system static-host-mapping
    host-name RT01 {
        alias router1
        inet 10.20.30.41
    }

Default Gateway/Route
^^^^^^^^^^^^^^^^^^^^^

In the past (VyOS 1.1.8) used a gateway-address configured in the system tree
(`set system gateway-address <IP address>`) this is no longer supported and
existing configurations are migrated to the new CLI commands.

It is replaced by inserting a static route into the routing table using:

.. code-block:: sh

  set protocols static route 0.0.0.0/0 next-hop <gateway ip>

Delete default route fomr the system

.. code-block:: sh

  delete protocols static route 0.0.0.0/0

Show default route:

.. code-block:: sh

  vyos@vyos$ show ip route 0.0.0.0
  Routing entry for 0.0.0.0/0
    Known via "static", distance 1, metric 0, best
    Last update 3d00h23m ago
    * 172.16.34.6, via eth1
