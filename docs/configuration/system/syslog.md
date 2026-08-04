(syslog)=

# Syslog

Per default VyOSs has minimal syslog logging enabled which is stored and
rotated locally. Errors will be always logged to a local file, which includes
`local7` error messages, emergency messages will be sent to the console, too.

To configure syslog, you need to switch into configuration mode.

## Logging

Syslog supports logging to multiple targets, those targets could be a plain
file on your VyOS installation itself, a serial console or a remote syslog
server which is reached via {abbr}`IP (Internet Protocol)` UDP/TCP.

### Console

```{eval-rst}
.. cfgcmd:: set system syslog console facility <keyword> level <keyword>

   Log syslog messages to ``/dev/console``, for an explanation on
   :ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords
   see tables below.
```

(custom-file)=

### Custom File

```{eval-rst}
.. cfgcmd:: set system syslog file <filename> facility <keyword> level <keyword>

   Log syslog messages to file specified via `<filename>`, for an explanation on
   :ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords
   see tables below.
```

```{eval-rst}
.. cfgcmd:: set system syslog file <filename> archive size <size>

   Syslog will write `<size>` kilobytes into the file specified by `<filename>`.
   After this limit has been reached, the custom file is "rotated" by logrotate
   and a new custom file is created.
```

```{eval-rst}
.. cfgcmd:: set system syslog file <filename> archive file <number>

   Syslog uses logrotate to rotate logiles after a number of gives bytes.
   We keep as many as `<number>` rotated file before they are deleted on the
   system.

```

### Remote Host

Logging to a remote host leaves the local logging configuration intact, it
can be configured in parallel to a custom file or console logging. You can log
to multiple hosts at the same time, using either TCP or UDP. The default is
sending the messages via port 514/UDP.

```{eval-rst}
.. cfgcmd:: set system syslog host <address> facility <keyword> level <keyword>

   Log syslog messages to remote host specified by `<address>`. The address
   can be specified by either FQDN or IP address. For an explanation on
   :ref:`syslog_facilities` keywords and :ref:`syslog_severity_level`
   keywords see tables below.

```

```{eval-rst}
.. cfgcmd:: set system syslog host <address> facility <keyword> protocol
   <udp|tcp>

   Configure protocol used for communication to remote syslog host. This can be
   either UDP or TCP.

```

```{eval-rst}
.. cfgcmd:: set system syslog vrf <name>

  Specify name of the :abbr:`VRF (Virtual Routing and Forwarding)` instance.
```

#### {abbr}`TLS (Transport Layer Security)`-encrypted remote logging

VyOS supports {abbr}`TLS (Transport Layer Security)`-encrypted remote logging
over TCP to ensure secure transmission of syslog data to remote syslog servers.

**Prerequisites**: Before configuring
{abbr}`TLS (Transport Layer Security)`-encrypted remote logging,
ensure you have:

- A valid remote syslog server address.

- Valid {abbr}`CA (Certificate Authority)` and client certificates uploaded
  to the local {abbr}`PKI (Public Key Infrastructure)` storage.

- The **remote syslog transport protocol** is set to **TCP**:

  ```none
  set system syslog remote <address> protocol tcp
  ```

:::{note}
{abbr}`TLS (Transport Layer Security)`-encrypted remote logging is
**not supported** over **UDP**.
:::

```{eval-rst}
.. cfgcmd:: set system syslog remote <address> tls

   Enable TLS-encrypted remote logging.
```

```{eval-rst}
.. cfgcmd:: set system syslog remote <address> tls ca-certificate <ca_name>

   **Configure the** :abbr:`CA (Certificate Authority)` **certificate.**

   The syslog client uses the :abbr:`CA (Certificate Authority)` certificate to
   verify the identity of the remote syslog server.

   The :abbr:`CA (Certificate Authority)` certificate is required for **all**
   authentication modes except ``anon``.
```

```{eval-rst}
.. cfgcmd:: set system syslog remote <address> tls certificate <cert_name>

   **Configure the client certificate.**

   The remote syslog server uses the client certificate to verify the identity
   of the syslog client.

   The client certificate is required if the remote syslog server enforces
   client certificate verification.
```

```{eval-rst}
.. cfgcmd:: set system syslog remote <address> tls auth-mode <anon | fingerprint
   | certvalid | name>

   **Configure the authentication mode.**

   The authentication mode defines how the syslog client verifies the syslog
   server's identity.

   The following authentication modes are available:

   * ``anon`` **(default)**: Allows encrypted connections without verifying the syslog
     server's identity. This mode is **not recommended**, as it is vulnerable to
     :abbr:`MITM (Man-in-the-Middle)` attacks.
   * ``fingerprint``: Verifies the server’s certificate fingerprint against the
     value preconfigured with:

     .. code-block:: none

        set system syslog remote <address> tls permitted-peer <peer>

   * ``certvalid``: Verifies the server certificate is signed by a trusted
     :abbr:`CA (Certificate Authority)`, skipping :abbr:`CN (Common Name)` check.
   * ``name``: Verifies that:

     * The server’s certificate is signed by a trusted
       :abbr:`CA (Certificate Authority)`.
     * The :abbr:`CN (Common Name)` in the certificate matches the value
       preconfigured with:

     .. code-block:: none

        set system syslog remote <address> tls permitted-peer <peer>

     This is a **recommended** secure mode for production environments.
```

```{eval-rst}
.. cfgcmd:: set system syslog remote <address> tls permitted-peer <peer>

   **Configure the peer certificate identifiers.**

   The certificate identifier format depends on the authentication mode:

   * ``fingerprint``: Enter the expected certificate fingerprints (SHA-1 or
     SHA-256).
   * ``name``: Enter the expected certificate :abbr:`CNs (Common Names)`.

   For ``anon`` and ``certvalid`` authentication modes, certificate identifiers
   are not required.
```

#### Examples:

```none
# Example of 'anon' authentication mode
set system syslog host 10.10.2.3 facility all level debug
set system syslog host 10.10.2.3 port 6514
set system syslog host 10.10.2.3 protocol tcp
set system syslog host 10.10.2.3 tls auth-mode anon
# or just use 'set system syslog host 10.10.2.3 tls'

# Example of 'certvalid' authentication mode
set system syslog host elk.example.com facility all level debug
set system syslog host elk.example.com port 6514
set system syslog host elk.example.com protocol tcp
set system syslog host elk.example.com tls ca-certificate my-ca
set system syslog host elk.example.com tls auth-mode certvalid

# Example of 'fingerprint' authentication mode
set system syslog host syslog.example.com facility all level debug
set system syslog host syslog.example.com port 6514
set system syslog host syslog.example.com protocol tcp
set system syslog host syslog.example.com tls ca-certificate my-ca
set system syslog host syslog.example.com tls auth-mode fingerprint
set system syslog host syslog.example.com tls permitted-peer 'SHA1:10:C4:26:...'

# Example of 'name' authentication mode
set system syslog host graylog.example.com facility all level debug
set system syslog host graylog.example.com port 6514
set system syslog host graylog.example.com protocol tcp
set system syslog host graylog.example.com tls ca-certificate my-ca
set system syslog host graylog.example.com tls certificate syslog-client
set system syslog host graylog.example.com tls auth-mode name
set system syslog host graylog.example.com tls permitted-peer 'graylog.example.com'
```

#### Security Notes

- Always prefer `auth-mode name` for secure deployments, as it ensures
  both CA trust and server hostname validation.
- `anon` mode should only be used for testing, because it does not
  authenticate the server.
- Ensure private keys are stored and managed exclusively in the
  {doc}`PKI system </configuration/pki/index>`.

### Local User Account

```{eval-rst}
.. cfgcmd:: set system syslog user <username> facility <keyword> level <keyword>

   If logging to a local user account is configured, all defined log messages
   are display on the console if the local user is logged in, if the user is not
   logged in, no messages are being displayed. For an explanation on
   :ref:`syslog_facilities` keywords and :ref:`syslog_severity_level` keywords
   see tables below.
```

(syslog_facilities)=

## Facilities

List of facilities used by syslog. Most facilities names are self explanatory.
Facilities local0 - local7 common usage is f.e. as network logs facilities for
nodes and network equipment. Generally it depends on the situation how to
classify logs and put them to facilities. See facilities more as a tool rather
than a directive to follow.

Facilities can be adjusted to meet the needs of the user:

| Facility Code | Keyword  | Description                              |
| ------------- | -------- | ---------------------------------------- |
|               | all      | All facilities                           |
| 0             | kern     | Kernel messages                          |
| 1             | user     | User-level messages                      |
| 2             | mail     | Mail system                              |
| 3             | daemon   | System daemons                           |
| 4             | auth     | Security/authentication messages         |
| 5             | syslog   | Messages generated internally by syslogd |
| 6             | lpr      | Line printer subsystem                   |
| 7             | news     | Network news subsystem                   |
| 8             | uucp     | UUCP subsystem                           |
| 9             | cron     | Clock daemon                             |
| 10            | security | Security/authentication messages         |
| 11            | ftp      | FTP daemon                               |
| 12            | ntp      | NTP subsystem                            |
| 13            | logaudit | Log audit                                |
| 14            | logalert | Log alert                                |
| 15            | clock    | clock daemon (note 2)                    |
| 16            | local0   | local use 0 (local0)                     |
| 17            | local1   | local use 1 (local1)                     |
| 18            | local2   | local use 2 (local2)                     |
| 19            | local3   | local use 3 (local3)                     |
| 20            | local4   | local use 4 (local4)                     |
| 21            | local5   | local use 5 (local5)                     |
| 22            | local6   | use 6 (local6)                           |
| 23            | local7   | local use 7 (local7)                     |

(syslog_severity_level)=

## Severity Level

| Value | Severity      | Keyword | Description                                                                                                               |
| ----- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
|       |               | all     | Log everything                                                                                                            |
| 0     | Emergency     | emerg   | System is unusable - a panic condition                                                                                    |
| 1     | Alert         | alert   | Action must be taken immediately - A condition that should be corrected immediately, such as a corrupted system database. |
| 2     | Critical      | crit    | Critical conditions - e.g. hard drive errors.                                                                             |
| 3     | Error         | err     | Error conditions                                                                                                          |
| 4     | Warning       | warning | Warning conditions                                                                                                        |
| 5     | Notice        | notice  | Normal but significant conditions - conditions that are not error conditions, but that may require special handling.      |
| 6     | Informational | info    | Informational messages                                                                                                    |
| 7     | Debug         | debug   | Debug-level messages - Messages that contain information normally of use only when debugging a program.                   |

## Display Logs

```{eval-rst}
.. opcmd:: show log [all | authorization | cluster | conntrack-sync | ...]

   Display log files of given category on the console. Use tab completion to get
   a list of available categories. Thos categories could be: all, authorization,
   cluster, conntrack-sync, dhcp, directory, dns, file, firewall, https, image
   lldp, nat, openvpn, snmp, tail, vpn, vrrp
```

If no option is specified, this defaults to `all`.

```{eval-rst}
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
```

When no options/parameters are used, the contents of the main syslog file are
displayed.

:::{hint}
Use `show log | strip-private` if you want to hide private data
when sharing your logs.
:::

## Delete Logs

```{eval-rst}
.. opcmd:: delete log file <text>
```

Deletes the specified user-defined file \<text> in the /var/log/user directory

Note that deleting the log file does not stop the system from logging events.
If you use this command while the system is logging events, old log events
will be deleted, but events after the delete operation will be recorded in
the new file. To delete the file altogether, first delete logging to the
file using system syslog {ref}`custom-file` command, and then delete the file.
