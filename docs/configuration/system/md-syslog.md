# Syslog

Per default VyOSs has minimal syslog logging enabled which is stored and
rotated locally. Errors will be always logged to a local file, which includes
<span class="title-ref">local7</span> error messages, emergency messages will be sent to the console, too.

To configure syslog, you need to switch into configuration mode.

## Logging

Syslog supports logging to multiple targets, those targets could be a plain
file on your VyOS installation itself, a serial console or a remote syslog
server which is reached via `IP (Internet Protocol)` UDP/TCP.

### Console

<div class="cfgcmd">

set system syslog console facility \<keyword\> level \<keyword\>

Log syslog messages to `/dev/console`, for an explanation on
`syslog_facilities` keywords and `syslog_severity_level` keywords
see tables below.

</div>

### Custom File

<div class="cfgcmd">

set system syslog file \<filename\> facility \<keyword\> level \<keyword\>

Log syslog messages to file specified via <span class="title-ref">\<filename\></span>, for an explanation on
`syslog_facilities` keywords and `syslog_severity_level` keywords
see tables below.

</div>

<div class="cfgcmd">

set system syslog file \<filename\> archive size \<size\>

Syslog will write <span class="title-ref">\<size\></span> kilobytes into the file specified by <span class="title-ref">\<filename\></span>.
After this limit has been reached, the custom file is "rotated" by logrotate
and a new custom file is created.

</div>

<div class="cfgcmd">

set system syslog file \<filename\> archive file \<number\>

Syslog uses logrotate to rotate logiles after a number of gives bytes.
We keep as many as <span class="title-ref">\<number\></span> rotated file before they are deleted on the
system.

</div>

### Remote Host

Logging to a remote host leaves the local logging configuration intact, it
can be configured in parallel to a custom file or console logging. You can log
to multiple hosts at the same time, using either TCP or UDP. The default is
sending the messages via port 514/UDP.

<div class="cfgcmd">

set system syslog host \<address\> facility \<keyword\> level \<keyword\>

Log syslog messages to remote host specified by <span class="title-ref">\<address\></span>. The address
can be specified by either FQDN or IP address. For an explanation on
`syslog_facilities` keywords and `syslog_severity_level`
keywords see tables below.

</div>

<div class="cfgcmd">

set system syslog host \<address\> facility \<keyword\> protocol
\<udp|tcp\>

Configure protocol used for communication to remote syslog host. This can be
either UDP or TCP.

</div>

<div class="cfgcmd">

set system syslog vrf \<name\>

Specify name of the `VRF (Virtual Routing and Forwarding)` instance.

</div>

#### `TLS (Transport Layer Security)`-encrypted remote logging

VyOS supports `TLS (Transport Layer Security)`-encrypted remote logging
over TCP to ensure secure transmission of syslog data to remote syslog servers.

**Prerequisites**: Before configuring `TLS (Transport Layer 
Security)`-encrypted remote logging, ensure you have:

- A valid remote syslog server address.

- Valid `CA (Certificate Authority)` and client certificates uploaded
  to the local `PKI (Public Key Infrastructure)` storage.

- The **remote syslog transport protocol** is set to **TCP**:

  ``` none
  set system syslog remote <address> protocol tcp
  ```

<div class="note">

<div class="title">

Note

</div>

`TLS (Transport Layer Security)`-encrypted remote logging is
**not supported** over **UDP**.

</div>

<div class="cfgcmd">

set system syslog remote \<address\> tls

Enable TLS-encrypted remote logging.

</div>

<div class="cfgcmd">

set system syslog remote \<address\> tls ca-certificate \<ca_name\>

**Configure the** `CA (Certificate Authority)` **certificate.**

The syslog client uses the `CA (Certificate Authority)` certificate to
verify the identity of the remote syslog server.

The `CA (Certificate Authority)` certificate is required for **all**
authentication modes except `anon`.

</div>

<div class="cfgcmd">

set system syslog remote \<address\> tls certificate \<cert_name\>

**Configure the client certificate.**

The remote syslog server uses the client certificate to verify the identity
of the syslog client.

The client certificate is required if the remote syslog server enforces
client certificate verification.

</div>

<div class="cfgcmd">

set system syslog remote \<address\> tls auth-mode \<anon | fingerprint
| certvalid | name\>

**Configure the authentication mode.**

The authentication mode defines how the syslog client verifies the syslog
server's identity.

The following authentication modes are available:

- `anon` **(default)**: Allows encrypted connections without verifying the syslog
  server's identity. This mode is **not recommended**, as it is vulnerable to
  `MITM (Man-in-the-Middle)` attacks.

- `fingerprint`: Verifies the server’s certificate fingerprint against the
  value preconfigured with:

  ``` none
  set system syslog remote <address> tls permitted-peer <peer>
  ```

- `certvalid`: Verifies the server certificate is signed by a trusted
  `CA (Certificate Authority)`, skipping `CN (Common Name)` check.

- `name`: Verifies that:

  - The server’s certificate is signed by a trusted `CA (Certificate 
    Authority)`.
  - The `CN (Common Name)` in the certificate matches the value
    preconfigured with:

  ``` none
  set system syslog remote <address> tls permitted-peer <peer>
  ```

  This is a **recommended** secure mode for production environments.

</div>

<div class="cfgcmd">

set system syslog remote \<address\> tls permitted-peer \<peer\>

**Configure the peer certificate identifiers.**

The certificate identifier format depends on the authentication mode:

- `fingerprint`: Enter the expected certificate fingerprints (SHA-1 or
  SHA-256).
- `name`: Enter the expected certificate `CNs (Common Names)`.

For `anon` and `certvalid` authentication modes, certificate identifiers
are not required.

</div>

#### Examples:

``` none
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
  `PKI system </configuration/pki/index>`.

### Local User Account

<div class="cfgcmd">

set system syslog user \<username\> facility \<keyword\> level \<keyword\>

If logging to a local user account is configured, all defined log messages
are display on the console if the local user is logged in, if the user is not
logged in, no messages are being displayed. For an explanation on
`syslog_facilities` keywords and `syslog_severity_level` keywords
see tables below.

</div>

## Facilities

List of facilities used by syslog. Most facilities names are self explanatory.
Facilities local0 - local7 common usage is f.e. as network logs facilities for
nodes and network equipment. Generally it depends on the situation how to
classify logs and put them to facilities. See facilities more as a tool rather
than a directive to follow.

Facilities can be adjusted to meet the needs of the user:

<table style="width:99%;">
<colgroup>
<col style="width: 14%" />
<col style="width: 14%" />
<col style="width: 69%" />
</colgroup>
<thead>
<tr>
<th>Facility
Code</th>
<th>Keyword</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td></td>
<td>all</td>
<td>All facilities</td>
</tr>
<tr>
<td>0</td>
<td>kern</td>
<td>Kernel messages</td>
</tr>
<tr>
<td>1</td>
<td>user</td>
<td>User-level messages</td>
</tr>
<tr>
<td>2</td>
<td>mail</td>
<td>Mail system</td>
</tr>
<tr>
<td>3</td>
<td>daemon</td>
<td>System daemons</td>
</tr>
<tr>
<td>4</td>
<td>auth</td>
<td>Security/authentication messages</td>
</tr>
<tr>
<td>5</td>
<td>syslog</td>
<td>Messages generated internally by syslogd</td>
</tr>
<tr>
<td>6</td>
<td>lpr</td>
<td>Line printer subsystem</td>
</tr>
<tr>
<td>7</td>
<td>news</td>
<td>Network news subsystem</td>
</tr>
<tr>
<td>8</td>
<td>uucp</td>
<td>UUCP subsystem</td>
</tr>
<tr>
<td>9</td>
<td>cron</td>
<td>Clock daemon</td>
</tr>
<tr>
<td>10</td>
<td>security</td>
<td>Security/authentication messages</td>
</tr>
<tr>
<td>11</td>
<td>ftp</td>
<td>FTP daemon</td>
</tr>
<tr>
<td>12</td>
<td>ntp</td>
<td>NTP subsystem</td>
</tr>
<tr>
<td>13</td>
<td>logaudit</td>
<td>Log audit</td>
</tr>
<tr>
<td>14</td>
<td>logalert</td>
<td>Log alert</td>
</tr>
<tr>
<td>15</td>
<td>clock</td>
<td>clock daemon (note 2)</td>
</tr>
<tr>
<td>16</td>
<td>local0</td>
<td>local use 0 (local0)</td>
</tr>
<tr>
<td>17</td>
<td>local1</td>
<td>local use 1 (local1)</td>
</tr>
<tr>
<td>18</td>
<td>local2</td>
<td>local use 2 (local2)</td>
</tr>
<tr>
<td>19</td>
<td>local3</td>
<td>local use 3 (local3)</td>
</tr>
<tr>
<td>20</td>
<td>local4</td>
<td>local use 4 (local4)</td>
</tr>
<tr>
<td>21</td>
<td>local5</td>
<td>local use 5 (local5)</td>
</tr>
<tr>
<td>22</td>
<td>local6</td>
<td><blockquote>
<p>use 6 (local6)</p>
</blockquote></td>
</tr>
<tr>
<td>23</td>
<td>local7</td>
<td>local use 7 (local7)</td>
</tr>
</tbody>
</table>

## Severity Level

<table style="width:98%;">
<colgroup>
<col style="width: 10%" />
<col style="width: 20%" />
<col style="width: 12%" />
<col style="width: 55%" />
</colgroup>
<thead>
<tr>
<th>Value</th>
<th>Severity</th>
<th>Keyword</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td></td>
<td></td>
<td>all</td>
<td>Log everything</td>
</tr>
<tr>
<td>0</td>
<td>Emergency</td>
<td>emerg</td>
<td>System is unusable - a panic condition</td>
</tr>
<tr>
<td>1</td>
<td>Alert</td>
<td>alert</td>
<td>Action must be taken immediately - A
condition that should be corrected
immediately, such as a corrupted system
database.</td>
</tr>
<tr>
<td>2</td>
<td>Critical</td>
<td>crit</td>
<td>Critical conditions - e.g. hard drive
errors.</td>
</tr>
<tr>
<td>3</td>
<td>Error</td>
<td>err</td>
<td>Error conditions</td>
</tr>
<tr>
<td>4</td>
<td>Warning</td>
<td>warning</td>
<td>Warning conditions</td>
</tr>
<tr>
<td>5</td>
<td>Notice</td>
<td>notice</td>
<td>Normal but significant conditions -
conditions that are not error conditions,
but that may require special handling.</td>
</tr>
<tr>
<td>6</td>
<td>Informational</td>
<td>info</td>
<td>Informational messages</td>
</tr>
<tr>
<td>7</td>
<td>Debug</td>
<td>debug</td>
<td>Debug-level messages - Messages that
contain information normally of use only
when debugging a program.</td>
</tr>
</tbody>
</table>

## Display Logs

<div class="opcmd">

show log \[all | authorization | cluster | conntrack-sync | ...\]

Display log files of given category on the console. Use tab completion to get
a list of available categories. Thos categories could be: all, authorization,
cluster, conntrack-sync, dhcp, directory, dns, file, firewall, https, image
lldp, nat, openvpn, snmp, tail, vpn, vrrp

</div>

If no option is specified, this defaults to <span class="title-ref">all</span>.

<div class="opcmd">

show log image \<name\>
\[all | authorization | directory | file \<file name\> | tail \<lines\>\]

Log messages from a specified image can be displayed on the console. Details
of allowed parameters:

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<tbody>
<tr>
<td>all</td>
<td>Display contents of all master log files of the specified image</td>
</tr>
<tr>
<td>authorization</td>
<td>Display all authorization attempts of the specified image</td>
</tr>
<tr>
<td>directory</td>
<td>Display list of all user-defined log files of the specified image</td>
</tr>
<tr>
<td>file &lt;file name&gt;</td>
<td>Display contents of a specified user-defined log file of the specified
image</td>
</tr>
<tr>
<td>tail</td>
<td>Display last lines of the system log of the specified image</td>
</tr>
<tr>
<td>&lt;lines&gt;</td>
<td>Number of lines to be displayed, default 10</td>
</tr>
</tbody>
</table>

</div>

When no options/parameters are used, the contents of the main syslog file are
displayed.

<div class="hint">

<div class="title">

Hint

</div>

Use `show log | strip-private` if you want to hide private data
when sharing your logs.

</div>

## Delete Logs

<div class="opcmd">

delete log file \<text\>

</div>

Deletes the specified user-defined file \<text\> in the /var/log/user directory

Note that deleting the log file does not stop the system from logging events.
If you use this command while the system is logging events, old log events
will be deleted, but events after the delete operation will be recorded in
the new file. To delete the file altogether, first delete logging to the
file using system syslog `custom-file` command, and then delete the file.
