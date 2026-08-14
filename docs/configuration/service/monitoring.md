---
myst:
  html_meta:
    description: |
      VyOS exports metrics to external monitoring systems through the
      Telegraf collector agent and through standalone Prometheus
      exporters. Telegraf writes the collected data to Azure Data
      Explorer, a Prometheus client endpoint, Splunk, or InfluxDB, and
      forwards the VyOS system log to Loki.
    keywords: monitoring, telegraf, prometheus, node exporter, frr exporter
---

(monitoring)=

# Monitoring

VyOS supports exporting metrics to external monitoring systems through
the [Telegraf][telegraf] collector agent and through standalone
Prometheus exporters. Telegraf can also forward system logs to Loki,
Grafana Labs' log aggregation system.

## Telegraf

Telegraf collects host and system metrics every 15 seconds through a
predefined set of input plugins, covering CPU, memory, disk and disk
I/O, network and network statistics, processes, kernel and interrupt
counters, systemd unit state, conntrack, per-interface link statistics,
and time synchronization. It also receives the VyOS system log through
its syslog input plugin.

The collected data is written to output plugins. Each plugin delivers it
to a different backend in that backend's format and protocol:

- Azure Data Explorer: Writes metrics to an Azure Data Explorer cluster.
- Prometheus client: Exposes metrics on a `/metrics` HTTP endpoint that
  a Prometheus server periodically pulls.
- Splunk: Sends metrics to the Splunk HTTP Event Collector.
- InfluxDB: Writes metrics to a bucket on an InfluxDB v2 server.
- Loki: Sends the VyOS system log to a Grafana Loki server.

## Configuration

### General options

<!--
NOTE: `source` is intentionally left commented out. It appears in the
CLI with tab-completion but its value is never consumed. Verified on a
live system.

```{cfgcmd} set service monitoring telegraf source \<source\>

**Select which categories of metrics the service collects.**

Repeat the command to select multiple categories. Available categories
are `all`, `hardware-utilization` (CPU, disk, memory), `logs`,
`network` (net, netstat, nftables), `system` (system, processes,
interrupts), and `telegraf` (the collector's own internal statistics).

The default is `all`.
```

Example:

```none
set service monitoring telegraf source hardware-utilization
set service monitoring telegraf source network
```
-->

```{cfgcmd} set service monitoring telegraf vrf \<name\>

**Run the Telegraf service in the specified
{abbr}`VRF (Virtual Routing and Forwarding)` instance.**

The VRF must already be configured under `set vrf name <name>`.
```

Example:

```none
set service monitoring telegraf vrf mgmt
```

### Azure Data Explorer

A configuration for this plugin is committable only when
`authentication client-id`, `authentication client-secret`,
`authentication tenant-id`, `database`, and `url` are all configured.

`client-id`, `client-secret`, and `tenant-id` are credentials
associated with a single application registration in Microsoft Entra ID
(Azure AD), Microsoft's cloud identity service. Telegraf presents these
credentials to Entra ID to obtain an access token, then uses that token
to authorize its writes to the Azure Data Explorer cluster, Microsoft's
cloud analytics database. Create the application registration and
obtain these values from the Azure portal.

```{cfgcmd} set service monitoring telegraf azure-data-explorer authentication client-id \<client-id\>

**Configure the client ID of the Telegraf application registration.**
```

Example:

```none
set service monitoring telegraf azure-data-explorer authentication client-id a0b1c2d3-e4f5-0123-4567-89abcdef0123
```

```{cfgcmd} set service monitoring telegraf azure-data-explorer authentication client-secret \<client-secret\>

**Configure the client secret of the Telegraf application
registration.**
```

Example:

```none
set service monitoring telegraf azure-data-explorer authentication client-secret MY-CLIENT-SECRET
```

```{cfgcmd} set service monitoring telegraf azure-data-explorer authentication tenant-id \<tenant-id\>

**Configure the tenant ID of the Telegraf application registration.**
```

Example:

```none
set service monitoring telegraf azure-data-explorer authentication tenant-id 1-22-333-4444-55555
```

```{cfgcmd} set service monitoring telegraf azure-data-explorer database \<name\>

**Configure the cloud-hosted database into which Telegraf writes
metrics.**

The database must already exist. Telegraf does not create it.
```

Example:

```none
set service monitoring telegraf azure-data-explorer database vyos-metrics
```

```{cfgcmd} set service monitoring telegraf azure-data-explorer group-metrics \<single-table | table-per-metric\>

**Configure how Telegraf groups metrics into tables in the configured
database:**

- `single-table`: All metrics are written to the single table
  configured with `table`. If `single-table` is chosen, `table` becomes
  required.
- `table-per-metric`: Metrics are grouped by metric name, and each
  group is written to its own table.

The default is `table-per-metric`.
```

Example:

```none
set service monitoring telegraf azure-data-explorer group-metrics single-table
```

```{cfgcmd} set service monitoring telegraf azure-data-explorer table \<name\>

**Configure the destination table for Telegraf metrics when
`group-metrics` is set to `single-table`.**

When `group-metrics` is set to `table-per-metric`, this setting has no
effect.
```

Example:

```none
set service monitoring telegraf azure-data-explorer table vyos
```

```{cfgcmd} set service monitoring telegraf azure-data-explorer url \<url\>

**Configure the endpoint URL of the Azure Data Explorer cluster.**
```

Example:

```none
set service monitoring telegraf azure-data-explorer url https://vyos-cluster.westeurope.kusto.windows.net
```

### Prometheus client

The Prometheus client plugin is the Telegraf output plugin for exposing
metrics to Prometheus. For standalone Prometheus exporters, see the
{ref}`Prometheus <prometheus-exporters>` section.

```{cfgcmd} set service monitoring telegraf prometheus-client

**Enable the Prometheus client output plugin.**
```

Example:

```none
set service monitoring telegraf prometheus-client
```

```{cfgcmd} set service monitoring telegraf prometheus-client allow-from \<prefix\>

**Restrict access to the metrics endpoint to clients whose source
address is within the specified IPv4 or IPv6 prefix.**

Repeat the command to allow multiple prefixes.

When unset, the endpoint accepts queries from any IP address.
```

Example:

```none
set service monitoring telegraf prometheus-client allow-from 192.0.2.0/24
set service monitoring telegraf prometheus-client allow-from 2001:db8::/32
```

```{cfgcmd} set service monitoring telegraf prometheus-client authentication username \<username\>

**Configure the username for HTTP Basic authentication on the metrics
endpoint.**
```

Example:

```none
set service monitoring telegraf prometheus-client authentication username prometheus
```

```{cfgcmd} set service monitoring telegraf prometheus-client authentication password \<password\>

**Configure the password for HTTP Basic authentication on the metrics
endpoint.**

HTTP Basic authentication is enabled only when both `username` and
`password` are configured.
```

Example:

```none
set service monitoring telegraf prometheus-client authentication password mysecurepassword
```

```{cfgcmd} set service monitoring telegraf prometheus-client listen-address \<address\>

**Configure a local IP address on which the Prometheus client plugin
accepts incoming connections.**

When unset, the plugin accepts incoming connections on all local IP
addresses.
```

Example:

```none
set service monitoring telegraf prometheus-client listen-address 192.0.2.1
```

```{cfgcmd} set service monitoring telegraf prometheus-client metric-version \<1-2\>

**Configure the metric mapping version used to translate Telegraf
metrics to the Prometheus format.**

The default is 2.
```

Example:

```none
set service monitoring telegraf prometheus-client metric-version 1
```

```{cfgcmd} set service monitoring telegraf prometheus-client port \<1-65535\>

**Configure the TCP port on which the Prometheus client plugin accepts
incoming connections.**

The default is 9273.
```

Example:

```none
set service monitoring telegraf prometheus-client port 9274
```

After enabling the plugin, the metrics endpoint can be queried with
`curl`:

```none
vyos@r14:~$ curl --silent localhost:9273/metrics | egrep -v "#" | grep cpu_usage_system
cpu_usage_system{cpu="cpu-total",host="r14"} 0.20040080160320556
cpu_usage_system{cpu="cpu0",host="r14"} 0.17182130584191915
cpu_usage_system{cpu="cpu1",host="r14"} 0.22896393817971655
```

### Splunk

A configuration for this plugin is committable only when
`authentication token` and `url` are configured.

```{cfgcmd} set service monitoring telegraf splunk authentication insecure

**Disable TLS certificate chain and host name verification for
connections to the Splunk HTTP Event Collector.**
```

Example:

```none
set service monitoring telegraf splunk authentication insecure
```

```{cfgcmd} set service monitoring telegraf splunk authentication token \<token\>

**Configure the token used to authorize requests to the Splunk HTTP
Event Collector.**
```

Example:

```none
set service monitoring telegraf splunk authentication token xxxxf5b8-xxxx-452a-xxxx-43828911xxxx
```

```{cfgcmd} set service monitoring telegraf splunk url \<url\>

**Configure the URL of the Splunk HTTP Event Collector endpoint.**
```

Example:

```none
set service monitoring telegraf splunk url 'https://192.0.2.10:8088/services/collector'
```

### InfluxDB

A configuration for this plugin is committable only when
`authentication organization`, `authentication token`, and `url` are
configured.

```{cfgcmd} set service monitoring telegraf influxdb authentication organization \<organization\>

**Configure the name of the organization that owns the bucket on the
remote InfluxDB server.**
```

Example:

```none
set service monitoring telegraf influxdb authentication organization vyos
```

```{cfgcmd} set service monitoring telegraf influxdb authentication token \<token\>

**Configure the API token used to authenticate to the remote InfluxDB
v2 server.**

The token must be in the standard InfluxDB v2 format: 88 characters
ending with `==`.
```

Example:

```none
set service monitoring telegraf influxdb authentication token 'ZAml9Uy5wrhA...=='
```

```{cfgcmd} set service monitoring telegraf influxdb bucket \<bucket\>

**Configure the name of the InfluxDB v2 bucket that receives metrics.**

The default is `main`.
```

Example:

```none
set service monitoring telegraf influxdb bucket bucket_vyos
```

```{cfgcmd} set service monitoring telegraf influxdb port \<1-65535\>

**Configure the TCP port of the remote InfluxDB v2 server.**

The default is 8086.
```

Example:

```none
set service monitoring telegraf influxdb port 8087
```

```{cfgcmd} set service monitoring telegraf influxdb url \<url\>

**Configure the URL of the remote InfluxDB v2 server.**

VyOS appends the configured port to this URL, so specify the URL
without a port number.
```

Example:

```none
set service monitoring telegraf influxdb url 'http://r1.influxdb2.local'
```

#### Example

The following example configures Telegraf to write metrics to an
InfluxDB v2 server at `r1.influxdb2.local` on port 8087, storing them
in the `bucket_vyos` bucket of the `vyos` organization, authenticating
to the InfluxDB v2 server with the configured API token.

```none
set service monitoring telegraf influxdb authentication organization 'vyos'
set service monitoring telegraf influxdb authentication token 'ZAml9Uy5wrhA...=='
set service monitoring telegraf influxdb bucket 'bucket_vyos'
set service monitoring telegraf influxdb port '8087'
set service monitoring telegraf influxdb url 'http://r1.influxdb2.local'
```

### Loki

A configuration for this plugin is committable only when `url` is
configured.

```{cfgcmd} set service monitoring telegraf loki port \<1-65535\>

**Configure the TCP port of the remote Loki server.**

The default is 3100.
```

Example:

```none
set service monitoring telegraf loki port 3101
```

```{cfgcmd} set service monitoring telegraf loki url \<url\>

**Configure the URL of the remote Loki server.**

VyOS appends the configured port to the host part of this URL. If the
URL contains a path, the path is used as the endpoint of the Loki write
API.
```

Example:

```none
set service monitoring telegraf loki url 'http://192.0.2.20'
```

```{cfgcmd} set service monitoring telegraf loki authentication username \<username\>

**Configure the username for HTTP basic authentication to the Loki
server.**
```

Example:

```none
set service monitoring telegraf loki authentication username loki
```

```{cfgcmd} set service monitoring telegraf loki authentication password \<password\>

**Configure the password for HTTP basic authentication to the Loki
server.**

If either `username` or `password` is configured, both are required.
Otherwise, the commit fails.
```

Example:

```none
set service monitoring telegraf loki authentication password mysecurepassword
```

```{cfgcmd} set service monitoring telegraf loki metric-name-label \<label\>

**Configure the label used to identify log streams from the VyOS system
log in Loki.**

The default is `__name`.
```

Example:

```none
set service monitoring telegraf loki metric-name-label syslog
```

(prometheus-exporters)=

## Prometheus

In addition to the Telegraf `prometheus-client` output plugin, VyOS can
run the following standalone Prometheus exporters:

- Node Exporter
- FRR Exporter
- Blackbox Exporter

### Node Exporter

Prometheus [node_exporter] exposes hardware and operating system
metrics such as CPU, memory, disk I/O, filesystem usage, and network
interface statistics.

```{cfgcmd} set service monitoring prometheus node-exporter listen-address \<address\>

**Configure a local IP address on which Node Exporter accepts incoming
connections.**

Repeat the command to configure multiple addresses.

When unset, Node Exporter accepts incoming connections on all local IP
addresses.
```

Example:

```none
set service monitoring prometheus node-exporter listen-address 192.0.2.1
```

```{cfgcmd} set service monitoring prometheus node-exporter port \<1-65535\>

**Configure the TCP port on which Node Exporter accepts incoming
connections.**

The default is 9100.
```

Example:

```none
set service monitoring prometheus node-exporter port 9101
```

```{cfgcmd} set service monitoring prometheus node-exporter vrf \<name\>

**Run Node Exporter in the specified VRF instance.**

The VRF must already be configured under `set vrf name <name>`.
```

Example:

```none
set service monitoring prometheus node-exporter vrf mgmt
```

```{cfgcmd} set service monitoring prometheus node-exporter collectors textfile

**Enable the Node Exporter textfile collector, which exports custom
metrics from files placed in `/run/node_exporter/collector`.**
```

Example:

```none
set service monitoring prometheus node-exporter collectors textfile
```

### FRR Exporter

The Prometheus frr_exporter exposes routing protocol metrics from
FRRouting (FRR). By default, the exporter collects metrics for BGP
(IPv4 and IPv6), OSPF, BFD, and the routing table. Use the options
below to enable additional metric collection or add extra labels to the
exported data.

```{cfgcmd} set service monitoring prometheus frr-exporter listen-address \<address\>

**Configure a local IP address on which FRR Exporter accepts incoming
connections.**

Repeat the command to configure multiple addresses.

When unset, FRR Exporter accepts incoming connections on all local IP
addresses.
```

Example:

```none
set service monitoring prometheus frr-exporter listen-address 192.0.2.1
```

```{cfgcmd} set service monitoring prometheus frr-exporter port \<1-65535\>

**Configure the TCP port on which FRR Exporter accepts incoming
connections.**

The default is 9342.
```

Example:

```none
set service monitoring prometheus frr-exporter port 9343
```

```{cfgcmd} set service monitoring prometheus frr-exporter vrf \<name\>

**Run FRR Exporter in the specified VRF instance.**

The VRF must already be configured under `set vrf name <name>`.
```

Example:

```none
set service monitoring prometheus frr-exporter vrf mgmt
```

#### BGP collector options

```{cfgcmd} set service monitoring prometheus frr-exporter collector bgp accept-filtered-prefixes

**Export the counts of accepted and filtered prefixes per BGP peer.**
```

Example:

```none
set service monitoring prometheus frr-exporter collector bgp accept-filtered-prefixes
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector bgp advertised-prefixes

**Export the count of prefixes advertised to each BGP peer.**
```

Example:

```none
set service monitoring prometheus frr-exporter collector bgp advertised-prefixes
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector bgp peer-description \<json | plain-text\>

**Add the BGP peer description as a label on that peer's metrics:**

- `json`: Parses the peer description as a JSON object and extracts the
  value of the `desc` key to use as the label.
- `plain-text`: Uses the unparsed peer description string as the label.

When unset, the peer description is not added as a label.
```

Example:

```none
set service monitoring prometheus frr-exporter collector bgp peer-description plain-text
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector bgp peer-group

**Add the peer group name of a BGP peer as a label on that peer's
metrics.**
```

Example:

```none
set service monitoring prometheus frr-exporter collector bgp peer-group
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector bgp peer-hostname

**Add the hostname of a BGP peer as a label on that peer's metrics.**
```

Example:

```none
set service monitoring prometheus frr-exporter collector bgp peer-hostname
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector bgp peer-type

**Export the number of established BGP peers per type.**

The type is read from the `type` key of the JSON-formatted peer
description.
```

Example:

```none
set service monitoring prometheus frr-exporter collector bgp peer-type
```

#### Other collector options

```{cfgcmd} set service monitoring prometheus frr-exporter collector bgp-l2-vpn

**Export BGP L2VPN EVPN metrics.**
```

Example:

```none
set service monitoring prometheus frr-exporter collector bgp-l2-vpn
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector pim

**Export {abbr}`PIM (Protocol Independent Multicast)` metrics.**
```

Example:

```none
set service monitoring prometheus frr-exporter collector pim
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector ospf-instance \<1-65535\>

**Export metrics for the OSPF instance with the given ID.**

Repeat the command to export metrics for multiple OSPF instances.
```

Example:

```none
set service monitoring prometheus frr-exporter collector ospf-instance 100
set service monitoring prometheus frr-exporter collector ospf-instance 200
```

```{cfgcmd} set service monitoring prometheus frr-exporter collector detailed-routes

**Export a route count for each route type.**
```

Example:

```none
set service monitoring prometheus frr-exporter collector detailed-routes
```

### Blackbox Exporter

Prometheus [blackbox_exporter] probes network endpoints and exposes the
probe results as metrics. VyOS supports the DNS and ICMP probes.

```{cfgcmd} set service monitoring prometheus blackbox-exporter listen-address \<address\>

**Configure a local IP address on which Blackbox Exporter accepts
incoming connections.**

Repeat the command to configure multiple addresses.

When unset, Blackbox Exporter accepts incoming connections on all local
IP addresses.
```

Example:

```none
set service monitoring prometheus blackbox-exporter listen-address 192.0.2.1
```

```{cfgcmd} set service monitoring prometheus blackbox-exporter port \<1-65535\>

**Configure the TCP port on which Blackbox Exporter accepts incoming
connections.**

The default is 9115.
```

Example:

```none
set service monitoring prometheus blackbox-exporter port 9116
```

```{cfgcmd} set service monitoring prometheus blackbox-exporter vrf \<name\>

**Run Blackbox Exporter in the specified VRF instance.**

The VRF must already be configured under `set vrf name <name>`.
```

Example:

```none
set service monitoring prometheus blackbox-exporter vrf mgmt
```

#### Blackbox Exporter modules

Blackbox Exporter probes are organized into named modules. A module
defines a probe type and its settings. Configure a DNS or ICMP module
with the commands below.

```{cfgcmd} set service monitoring prometheus blackbox-exporter modules dns name \<name\> query-name \<fqdn\>

**Configure the domain name that the specified DNS module queries.**

This setting is mandatory for every DNS module. Otherwise, the commit
fails.
```

Example:

```none
set service monitoring prometheus blackbox-exporter modules dns name my-dns-module query-name example.com
```

```{cfgcmd} set service monitoring prometheus blackbox-exporter modules dns name \<name\> query-type \<type\>

**Configure the DNS record type that the specified DNS module queries,
for example `A` or `AAAA`.**

The default is `ANY`.
```

Example:

```none
set service monitoring prometheus blackbox-exporter modules dns name my-dns-module query-type AAAA
```

The following options apply to both DNS and ICMP modules.

```{cfgcmd} set service monitoring prometheus blackbox-exporter modules \<dns | icmp\> name \<name\> preferred-ip-protocol \<ipv4 | ipv6\>

**Configure which IP protocol the module prefers when probing the
target.**

When unset, IPv6 is preferred.
```

Example:

```none
set service monitoring prometheus blackbox-exporter modules dns name my-dns-module preferred-ip-protocol ipv4
```

```{cfgcmd} set service monitoring prometheus blackbox-exporter modules \<dns | icmp\> name \<name\> ip-protocol-fallback

**Allow the module to fall back to the other IP protocol if the
preferred one is not usable.**

When unset, fallback is disabled.
```

Example:

```none
set service monitoring prometheus blackbox-exporter modules icmp name my-icmp-module ip-protocol-fallback
```

```{cfgcmd} set service monitoring prometheus blackbox-exporter modules \<dns | icmp\> name \<name\> timeout \<1-60\>

**Configure how long a single probe may run before it times out, in
seconds.**

The default is 5.
```

Example:

```none
set service monitoring prometheus blackbox-exporter modules dns name my-dns-module timeout 10
```

## Examples

### DNS module

The following example defines a DNS module named `dns4` that looks up
the `A` record for `vyos.io`, using IPv4 to reach the DNS server.

```none
set service monitoring prometheus blackbox-exporter modules dns name dns4 preferred-ip-protocol ipv4
set service monitoring prometheus blackbox-exporter modules dns name dns4 query-name vyos.io
set service monitoring prometheus blackbox-exporter modules dns name dns4 query-type A
```

### ICMP module

The following example defines an ICMP module named `ping6` that pings a
target over IPv6, falls back to IPv4 if IPv6 is not usable, and times
out after 3 seconds.

```none
set service monitoring prometheus blackbox-exporter modules icmp name ping6 preferred-ip-protocol ipv6
set service monitoring prometheus blackbox-exporter modules icmp name ping6 ip-protocol-fallback
set service monitoring prometheus blackbox-exporter modules icmp name ping6 timeout 3
```

[azure-data-explorer]: <https://github.com/influxdata/telegraf/tree/master/plugins/outputs/azure_data_explorer>
[blackbox_exporter]: <https://github.com/prometheus/blackbox_exporter>
[frr_exporter]: <https://github.com/tynany/frr_exporter>
[influxdb]: <https://github.com/influxdata/telegraf/tree/master/plugins/outputs/influxdb_v2>
[loki]: <https://github.com/influxdata/telegraf/tree/master/plugins/outputs/loki>
[node_exporter]: <https://github.com/prometheus/node_exporter>
[prometheus-client]: <https://github.com/influxdata/telegraf/tree/master/plugins/outputs/prometheus_client>
[splunk]: <https://www.splunk.com/en_us/blog/it/splunk-metrics-via-telegraf.html>
[telegraf]: <https://github.com/influxdata/telegraf>
