System
======

After a basic system setup by setting up `Interface Addresses`_, VyOS should
be ready for further configuration which is described in this chapter.

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

**NOTE:** Only letters, numbers and hyphens are allowed.

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

**NOTE:** Only letters, numbers, hyphens and periods are allowed.

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

How to assign IPs to interfaces is described in chapter `Interface Addresses`_.
This section shows how to statically map a system IP to its host name for
local (meaning on this VyOS instance) DNS resolution:

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

System Users
------------

VyOS supports two levels of users: admin and operator.

The operator level restricts a user to operational commands and prevents
changes to system configuration. This is useful for gathering information
about the state of the system (dhcp leases, vpn connections, routing tables,
etc...) and for manipulating state of the system, such as resetting
connections, clearing counters and bringing up and taking down connection
oriented interfaces.

The admin level has all of the capabilities of the operator level, plus the
ability to change system configuration. The admin level also enables a user
to use the sudo command, which essentially means the user has root access to
the system.

Creating Login User Accounts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Create user account `jsmith`, with `admin` level access and the password
`mypassword`

.. code-block:: sh

  set system login user jsmith full-name "Johan Smith"
  set system login user jsmith authentication plaintext-password mypassword
  set system login user jsmith level admin

The command:

.. code-block:: sh

  show system login

will show the contents of :code:`system login` configuration node:

.. code-block:: sh

  user jsmith {
      authentication {
          encrypted-password $6$0OQHjuQ8M$AYXVn7jufdfqPrSk4/XXsDBw99JBtNsETkQKDgVLptXogHA2bU9BWlvViOFPBoFxIi.iqjqrvsQdQ./cfiiPT.
          plaintext-password ""
      }
      full-name "Johan Smith"
      level admin
  }

SSH Access using Shared Public Keys
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The following command will load the public key `dev.pub` for user `jsmith`

.. code-block:: sh

  loadkey jsmith dev.pub

**NOTE:** This requires uploading the `dev.pub` public key to the VyOS router
first. As an alternative you can also load the SSH public key directly from a
remote system:

.. code-block:: sh

  loadkey jsmith scp://devuser@dev001.vyos.net/home/devuser/.ssh/dev.pub

Syslog
------

Per default VyOSs has minimal syslog logging enabled which is stored and
rotated locally. Errors will be always logged to a local file, which includes
`local7` error messages, emergency messages will be sent to the console, too.

To configure syslog, you need to switch into configuration mode.

Logging to serial console
^^^^^^^^^^^^^^^^^^^^^^^^^

The below would log all messages to :code:`/dev/console`.

.. code-block:: sh

  set system syslog console facility all level all

Use the **[tab]** function to display all facilities and levels which can
be configured.

.. code-block:: sh

  vyos@vyos# set system syslog console facility <TAB>
  Possible completions:
  > all          All facilities excluding "mark"
  > auth         Authentication and authorization
  > authpriv     Non-system authorization
  > cron         Cron daemon
  > daemon       System daemons
  > kern         Kernel
  > lpr          Line printer spooler
  > mail         Mail subsystem
  > mark         Timestamp
  > news         USENET subsystem
  > protocols    depricated will be set to local7
  > security     depricated will be set to auth
  > syslog       Authentication and authorization
  > user         Application processes
  > uucp         UUCP subsystem
  > local0       Local facility 0
  > local1       Local facility 1
  > local2       Local facility 2
  > local3       Local facility 3
  > local4       Local facility 4
  > local5       Local facility 5
  > local6       Local facility 6
  > local7       Local facility 7

  vyos@vyos# set system syslog console facility all level <TAB>
  Possible completions:
   emerg        Emergency messages
   alert        Urgent messages
   crit         Critical messages
   err          Error messages
   warning      Warning messages
   notice       Messages for further investigation
   info         Informational messages
   debug        Debug messages
   all          Log everything


Logging to a custom file
^^^^^^^^^^^^^^^^^^^^^^^^^

Logging to a custom file, rotation size and the number of rotate files left
on the system can be configured.

.. code-block:: sh

  set system syslog file <FILENAME> facility <FACILITY>  level <LEVEL>
  set system syslog file <FILENAME> archive file <NUMBER OF FILES>
  set system syslog file FILENAME archive size <FILESIZE>

The very same setting can be applied to the global configuration, to modify
the defaults for the global logging.

Logging to a remote host
^^^^^^^^^^^^^^^^^^^^^^^^

Logging to a remote host leaves the local logging configuration intact, it
can be configured in parallel. You can log ro multiple hosts at the same time,
using either TCP or UDP. The default is sending the messages via UDP.

**UDP**

.. code-block:: sh

  set system syslog host 10.1.1.1 facility all level all
  <optional>
  set system syslog host 10.1.1.1 facility all protocol udp


**TCP**

.. code-block:: sh

  set system syslog host 10.1.1.2 facility all level all
  set system syslog host 10.1.1.2 facility all protocol tcp

Logging to a local user account
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If logging to a local useraccount is configured, all defined log messages are
display on the console if the local user is logged in, if the user is not
logged in, no messages are being displayed.

.. code-block:: sh

  set system syslog user <LOCAL_USERNAME> facility <FACILITY> level <LEVEL>
