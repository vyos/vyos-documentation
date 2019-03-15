.. _syslog:



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
