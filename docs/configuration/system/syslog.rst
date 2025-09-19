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

Global Settings
---------------

.. cfgcmd:: set system syslog marker interval <number>

   Interval (in seconds) for sending mark messages to the syslog input to
   indicate that the logging system is functioning.

   This defaults to 1200 seconds.

.. cfgcmd:: set system syslog marker disable

   Disable periodic injection of mark messages.

.. cfgcmd:: set system syslog preserve-fqdn

   If set, the domain part of the hostname is always sent, even within the same
   domain as the receiving system.

.. cfgcmd:: set system syslog source-address <address>

   Source IP address used to initiate connection when sending log data to a
   remote host.

Local Logging
-------------

Enable logging to a local target (``/var/log/messages``) on the system.

.. cfgcmd:: system rsyslog local facility <keyword> level <keyword>

   Filter syslog messages based on facility and level.

.. _syslog_console:

Console
-------

.. cfgcmd:: set system syslog console facility <keyword> level <keyword>

   Log syslog messages to ``/dev/console``, for an explanation on
   :ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords
   see tables below.

.. _syslog_remote:

Remote Host
-----------

Logging to a remote host leaves the local logging configuration intact, it
can be configured in parallel to a custom file or console logging. You can log
to multiple hosts at the same time, using either TCP or UDP. The default is
sending the messages via port 514/UDP.

.. cfgcmd:: set system syslog remote <address> facility <keyword> level <keyword>

   Log syslog messages to remote host specified by `<address>`. The address
   can be specified by either FQDN or IP address. For an explanation on
   :ref:`syslog_facilities` keywords and :ref:`syslog_severity_level`
   keywords see tables below.

.. cfgcmd:: set system syslog remote <address> protocol <udp|tcp>

   Configure protocol used for communication to remote syslog host. This can be
   either UDP or TCP.

.. cfgcmd:: set system syslog remote <address> port <port>

   Configure the TCP or UDP port to connect to on the remote syslog host.
   By default, the standard port 514 is used.

.. cfgcmd:: set system syslog remote <address> format include-timezone

   Send syslog messages in the :rfc:`5424` format, rather than the
   default :rfc:`3164` (BSD syslog) format.

   .. note::
      The :rfc:`5424` format utilises an :rfc:`3339` / ISO 8601 formatted
      timestamp, including the system timezone.

      Examples of the two syslog message formats:

      :rfc:`3164` format: <34>Oct 11 22:14:15 mymachine su: 'su root' failed for lonvick on /dev/pts/8

      :rfc:`5424` format: <34>1 2003-10-11T22:14:15.003-07:00 mymachine.example.com su - ID47 - BOM'su root' failed for lonvick on /dev/pts/8

.. cfgcmd:: set system syslog remote <address> format octet-counted

   Allows for the transmission of multi-line messages, without them being split
   across separate syslog messages. This only applies for the TCP protocol
   (this setting is ignored for UDP protocol). Ensure the receiving system is
   compatible before enabling this.

.. cfgcmd:: set system syslog remote <address> vrf <name>

   Specify name of the :abbr:`VRF (Virtual Routing and Forwarding)` instance
   used when forwarding logs to remote syslog server.

.. cfgcmd:: set system syslog remote <address> source-address <address>

   Define IPv4 or IPv6 source address used when forwarding logs to remote
   syslog server.

TLS Options
^^^^^^^^^^^

When ``set system syslog remote <address> protocol tcp`` is selected,
an additional ``tls`` sub-node can be used to enable encryption and
configure certificate handling. TLS is not supported over UDP and
if you attempt to enable TLS while using UDP, the system will issue a warning.

.. cfgcmd:: set system syslog remote <address> tls enable

   Enable TLS for this remote syslog destination.

.. cfgcmd:: set system syslog remote <address> tls ca-certificate <ca_name>

   Reference to a :abbr:`CA (Certification Authority)` certificate stored
   in the :abbr:`PKI (Public Key Infrastructure)` subsystem.
   Used to validate the certificate chain of the remote syslog server.
   Required when the authentication mode is anything other than ``anon``.

.. cfgcmd:: set system syslog remote <address> tls certificate <cert_name>

   Reference to a client certificate stored in the PKI subsystem.
   Required when the server enforces client certificate authentication.

.. cfgcmd:: set system syslog remote <address> tls auth-mode <anon|fingerprint|certvalid|name>

   Defines the peer authentication mode:

   * **anon** - allow encrypted connection without verifying peer identity
     (not recommended, vulnerable to :abbr:`MITM (Man-in-the-Middle)`).
   * **fingerprint** - verify the peer certificate against an explicitly
     configured fingerprint list (set with ``permitted-peers``).
   * **certvalid** - validate that the peer presents a certificate signed by
     a trusted CA, but do not check the certificate subject name
     (:abbr:`CN (Common Name)`).
   * **name** - validate that the peer presents a certificate signed by a
     trusted CA and that the certificate’s CN matches the value configured in
     ``permitted-peers``. This is the recommended secure mode for production.

   .. note:: The default value for the authentication mode is ``anon``.

.. cfgcmd:: set system syslog remote <address> tls permitted-peers <peer_list>

   Comma-separated list of permitted peers or certificate’s subject names (CN).

   * In ``fingerprint`` authentication mode: provide one or more peer
     certificate fingerprints (SHA1 or SHA256).
   * In ``name`` authentication mode: explicit list of certificate’s CN to enforce.
   * Ignored in ``anon`` and ``certvalid``.

Examples:
^^^^^^^^^

.. code-block:: none

   # Example of 'anon' authentication mode
   set system syslog remote 10.10.2.3 facility all level debug
   set system syslog remote 10.10.2.3 port 6514
   set system syslog remote 10.10.2.3 protocol tcp
   set system syslog remote 10.10.2.3 tls enable

   # Example of 'certvalid' authentication mode
   set system syslog remote elk.example.com facility all level debug
   set system syslog remote elk.example.com port 6514
   set system syslog remote elk.example.com protocol tcp
   set system syslog remote elk.example.com tls enable
   set system syslog remote elk.example.com tls ca-certificate my-ca
   set system syslog remote elk.example.com tls auth-mode certvalid

   # Example of 'fingerprint' authentication mode
   set system syslog remote syslog.example.com facility all level debug
   set system syslog remote syslog.example.com port 6514
   set system syslog remote syslog.example.com protocol tcp
   set system syslog remote syslog.example.com tls enable
   set system syslog remote syslog.example.com tls ca-certificate my-ca
   set system syslog remote syslog.example.com tls auth-mode fingerprint
   set system syslog remote syslog.example.com tls permitted-peers 'SHA1:10:C4:26:...,SHA256:7B:4B:10:...'

   # Example of 'name' authentication mode
   set system syslog remote graylog.example.com facility all level debug
   set system syslog remote graylog.example.com port 6514
   set system syslog remote graylog.example.com protocol tcp
   set system syslog remote graylog.example.com tls enable
   set system syslog remote graylog.example.com tls ca-certificate my-ca
   set system syslog remote graylog.example.com tls certificate syslog-client
   set system syslog remote graylog.example.com tls auth-mode name
   set system syslog remote graylog.example.com tls permitted-peers 'graylog.example.com'

Security Notes
^^^^^^^^^^^^^^

* Always prefer ``auth-mode name`` for secure deployments, as it ensures
  both CA trust and server hostname validation.
* ``anon`` mode should only be used for testing, because it does not
  authenticate the server.
* Ensure private keys are stored and managed exclusively in the
  :doc:`PKI system </configuration/pki/index>`.

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
| 22       | local6   | local use 6 (local6)                               |
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
   a list of available categories. Those categories could be: all, authorization,
   cluster, conntrack-sync, dhcp, directory, dns, file, firewall, https, image
   lldp, nat, openvpn, snmp, tail, vpn, vrrp

If no option is specified, this defaults to `all`.

.. opcmd:: show log image <name>
   [all | authorization | directory | file <file name> | tail <lines>]

   Log messages from a specified image can be displayed on the console. Details
   of allowed parameters:

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
        - Display contents of a specified user-defined log file of the specified
          image
      * - tail
        - Display last lines of the system log of the specified image
      * - <lines>
        - Number of lines to be displayed, default 10

When no options/parameters are used, the contents of the main syslog file are
displayed.

.. hint:: Use ``show log | strip-private`` if you want to hide private data
   when sharing your logs.
