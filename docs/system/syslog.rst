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

.. code-block:: console

  set system syslog console facility all level all

Use the **[tab]** function to display all facilities and levels which can
be configured.

.. code-block:: console

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

.. code-block:: console

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

.. code-block:: console

  set system syslog host 10.1.1.1 facility all level all
  <optional>
  set system syslog host 10.1.1.1 facility all protocol udp


**TCP**

.. code-block:: console

  set system syslog host 10.1.1.2 facility all level all
  set system syslog host 10.1.1.2 facility all protocol tcp

Logging to a local user account
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If logging to a local useraccount is configured, all defined log messages are
display on the console if the local user is logged in, if the user is not
logged in, no messages are being displayed.

.. code-block:: console

  set system syslog user <LOCAL_USERNAME> facility <FACILITY> level <LEVEL>

Show logs
^^^^^^^^^

Display log files on the console

.. code-block:: console

  vyos@vyos:~$ show log
  Possible completions:
    <Enter>       Execute the current command
    all           Show contents of all master log files
    authorization Show listing of authorization attempts
    cluster       Show log for Cluster
    conntrack-sync
                  Show log for Conntrack-sync
    dhcp          Show log for Dynamic Host Control Protocol (DHCP)
    directory     Show listing of user-defined log files
    dns           Show log for Domain Name Service (DNS)
    file          Show contents of user-defined log file
    firewall      Show log for Firewall
    https         Show log for Https
    image         Show logs from an image
    lldp          Show log for Lldp
    nat           Show log for Network Address Translation (NAT)
    openvpn       Show log for Openvpn
    snmp          Show log for Simple Network Monitoring Protocol (SNMP)
    tail          Monitor last lines of messages file
    vpn           Show log for Virtual Private Network (VPN)
    vrrp          Show log for Virtual Router Redundancy Protocol (VRRP)
    webproxy      Show log for Webproxy

Show contents of a log file in an image
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Log messages from a specified image can be displayed on the console:

.. code-block:: console

  $ show log image <image name>
  $ show log image <image name> [all | authorization | directory | file <file name> | tail <lines>]

Details of allowed parameters:

.. list-table::
   :widths: 25 75
   :header-rows: 0

   * - all
     - Display contents of all master log files of the specified image
   * - authorization
     - Display all authorization attempts of the specified image
   * - directory
     - Display list of all user-defined log files of the specified image
   * - file <file name>
     - Display contents of a specified user-defined log file of the specified image
   * - tail
     - Display last lines of the system log of the specified image
   * - <lines>
     - Number of lines to be displayed, default 10


When no options/parameters are used, the contents of the main syslog file are displayed.
