.. _syslog:

######
Syslog
######

Per default VyOSs has minimal syslog logging enabled which is stored and
rotated locally. Errors will be always logged to a local file, which includes
`local7` error messages, emergency messages will be sent to the console, too.

To configure syslog, you need to switch into configuration mode.

Logging
=======

Syslog supports logging to multiple targets, those targets could be a plain
file on your VyOS installation itself, a serial console or a remote syslog
server which is reached via :abbr:`IP (Internet Protocol)` UDP/TCP.

Console
-------

.. cfgcmd:: set system syslog console facility <keyword> level <keyword>

Log syslog messages to ``/dev/console``, for en explanation on
:ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords
see tables below.


Custom File
-----------

.. cfgcmd:: set system syslog file <filename> facility <keyword> level <keyword>

Log syslog messages to file specified via `<filename>`, for en explanation on
:ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords see
tables below.

.. cfgcmd:: set system syslog file <filename> archive size <size>

Syslog will write `<size>` kilobytes into the file specified by `<filename>`.
After this limit has been reached, the custom file is "rotated" by logrotate
and a new custom file is created.

.. cfgcmd:: set system syslog file <filename> archive file <number>

Syslog uses logrotate to rotate logiles after a number of gives bytes. We keep
as many as `<number>` rotated file before they are deleted on the system.


Remote Host
-----------

Logging to a remote host leaves the local logging configuration intact, it
can be configured in parallel to a custom file or console logging. You can log
to multiple hosts at the same time, using either TCP or UDP. The default is
sending the messages via port 514/UDP.


.. cfgcmd:: set system syslog host <address> facility <keyword> level <keyword>

Log syslog messages to remote host specified by `<address>`. The address can be
specified by either FQDN or IP address. For en explanation on
:ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords see
tables below.


.. cfgcmd:: set system syslog host <address> facility <keyword> protocol <udp|tcp>

Configure protocol used for communication to remote syslog host. This can be
either UDP or TCP.


Local User Account
------------------

.. cfgcmd:: set system syslog user <username> facility <keyword> level <keyword>

If logging to a local user account is configured, all defined log messages are
display on the console if the local user is logged in, if the user is not
logged in, no messages are being displayed. For en explanation on
:ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords see
tables below.

.. _syslog_facilities:

Facilities
==========

List of facilities used by syslog. Most facilities names are self explanatory.
Facilities local0 - local7 common usage is f.e. as network logs facilities for
nodes and network equipment. Generally it depends on the situation how to
classify logs and put them to facilities. See facilities more as a tool rather
than a directive to follow.

Facilities can be adjusted to meet the needs of the user:

+----------+----------+----------------------------------------------------+
| Facility | Keyword  | Description                                        |
| Code     |          |                                                    |
+==========+==========+====================================================+
|          | all      | All facilities                                     |
+----------+----------+----------------------------------------------------+
| 0        | kern     | Kernel messages                                    |
+----------+----------+----------------------------------------------------+
| 1        | user     | User-level messages                                |
+----------+----------+----------------------------------------------------+
| 2        | mail     | Mail system                                        |
+----------+----------+----------------------------------------------------+
| 3        | daemon   | System daemons                                     |
+----------+----------+----------------------------------------------------+
| 4        | auth     | Security/authentication messages                   |
+----------+----------+----------------------------------------------------+
| 5        | syslog   | Messages generated internally by syslogd           |
+----------+----------+----------------------------------------------------+
| 6        | lpr      | Line printer subsystem                             |
+----------+----------+----------------------------------------------------+
| 7        | news     | Network news subsystem                             |
+----------+----------+----------------------------------------------------+
| 8        | uucp     | UUCP subsystem                                     |
+----------+----------+----------------------------------------------------+
| 9        | cron     | Clock daemon                                       |
+----------+----------+----------------------------------------------------+
| 10       | security | Security/authentication messages                   |
+----------+----------+----------------------------------------------------+
| 11       | ftp      | FTP daemon                                         |
+----------+----------+----------------------------------------------------+
| 12       | ntp      | NTP subsystem                                      |
+----------+----------+----------------------------------------------------+
| 13       | logaudit | Log audit                                          |
+----------+----------+----------------------------------------------------+
| 14       | logalert | Log alert                                          |
+----------+----------+----------------------------------------------------+
| 15       | clock    | clock daemon (note 2)                              |
+----------+----------+----------------------------------------------------+
| 16       | local0   | local use 0 (local0)                               |
+----------+----------+----------------------------------------------------+
| 17       | local1   | local use 1 (local1)                               |
+----------+----------+----------------------------------------------------+
| 18       | local2   | local use 2 (local2)                               |
+----------+----------+----------------------------------------------------+
| 19       | local3   | local use 3 (local3)                               |
+----------+----------+----------------------------------------------------+
| 20       | local4   | local use 4 (local4)                               |
+----------+----------+----------------------------------------------------+
| 21       | local5   | local use 5 (local5)                               |
+----------+----------+----------------------------------------------------+
| 22       | local6   |  use 6 (local6)                                    |
+----------+----------+----------------------------------------------------+
| 23       | local7   | local use 7 (local7)                               |
+----------+----------+----------------------------------------------------+

.. _syslog_severity_level:

Severity Level
==============

+-------+---------------+---------+-------------------------------------------+
| Value | Severity      | Keyword | Description                               |
+=======+===============+=========+===========================================+
|       |               | all     | Log everything                            |
+-------+---------------+---------+-------------------------------------------+
| 0     | Emergency     | emerg   | System is unusable - a panic condition    |
+-------+---------------+---------+-------------------------------------------+
| 1     | Alert         | alert   | Action must be taken immediately - A      |
|       |               |         | condition that should be corrected        |
|       |               |         | immediately, such as a corrupted system   |
|       |               |         | database.                                 |
+-------+---------------+---------+-------------------------------------------+
| 2     | Critical      | crit    | Critical conditions - e.g. hard drive     |
|       |               |         | errors.                                   |
+-------+---------------+---------+-------------------------------------------+
| 3     | Error         | err     | Error conditions                          |
+-------+---------------+---------+-------------------------------------------+
| 4     | Warning       | warning | Warning conditions                        |
+-------+---------------+---------+-------------------------------------------+
| 5     | Notice        | notice  | Normal but significant conditions -       |
|       |               |         | conditions that are not error conditions, |
|       |               |         | but that may require special handling.    |
+-------+---------------+---------+-------------------------------------------+
| 6     | Informational | info    | Informational messages                    |
+-------+---------------+---------+-------------------------------------------+
| 7     | Debug         | debug   | Debug-level messages - Messages that      |
|       |               |         | contain information normally of use only  |
|       |               |         | when debugging a program.                 |
+-------+---------------+---------+-------------------------------------------+


Display Logs
============

.. opcmd:: show log [all | authorization | cluster | conntrack-sync | ...]

Display log files of given category on the console. Use tab completion to get
a list of available categories. Thos categories could be: all, authorization,
cluster, conntrack-sync, dhcp, directory, dns, file, firewall, https, image
lldp, nat, openvpn, snmp, tail, vpn, vrrp

If no option is specified, this defaults to `all`.

.. opcmd:: show log image <name> [all | authorization | directory | file <file name> | tail <lines>]

Log messages from a specified image can be displayed on the console. Details of
allowed parameters:

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

When no options/parameters are used, the contents of the main syslog file are
displayed.

.. note:: Use ``show log | srip-private`` if you want to hide private data when sharing your logs.
