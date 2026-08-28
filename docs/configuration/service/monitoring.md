# Monitoring

VyOS supports monitoring through Telegraf as well as through Prometheus exporters.

## Telegraf

Telegraf is the open source server agent to help you collect metrics, events
and logs from your routers.

The following Telegraf plugins are configurable to export metrics and logs:
: - Azure Data Explorer
  - Prometheus Client
  - Splunk
  - InfluxDB
  - Loki

### Azure data explorer

Telegraf output plugin [azure-data-explorer].

```{cfgcmd} set service monitoring telegraf azure-data-explorer authentication client-id \<client-id\>

   Authentication application client-id.
```


```{cfgcmd} set service monitoring telegraf azure-data-explorer authentication client-secret \<client-secret\>

Authentication application client-secret.
```


```{cfgcmd} set service monitoring telegraf azure-data-explorer authentication tenant-id \<tenant-id\>

Authentication application tenant-id
```


```{cfgcmd} set service monitoring telegraf azure-data-explorer database \<name\>

Remote database name.
```


```{cfgcmd} set service monitoring telegraf azure-data-explorer group-metrics \<single-table | table-per-metric\>

Type of metrics grouping when push to Azure Data Explorer. The default is
``table-per-metric``.
```


```{cfgcmd} set service monitoring telegraf azure-data-explorer table \<name\>

Name of the single table Only if set group-metrics single-table.
```


```{cfgcmd} set service monitoring telegraf azure-data-explorer url \<url\>

Remote URL.
```

### Prometheus client

Telegraf output plugin [prometheus-client]
This plugin allows export of Telegraf metrics to Prometheus,
for Prometheus native metrics through exporters see section below.

```{cfgcmd} set service monitoring telegraf prometheus-client

   Output plugin Prometheus client
```


```{cfgcmd} set service monitoring telegraf prometheus-client allow-from \<prefix\>

Networks allowed to query this server
```


```{cfgcmd} set service monitoring telegraf prometheus-client authentication username \<username\>

HTTP basic authentication username
```


```{cfgcmd} set service monitoring telegraf prometheus-client authentication password \<password\>

HTTP basic authentication username
```


```{cfgcmd} set service monitoring telegraf prometheus-client listen-address \<address\>

Local IP addresses to listen on
```


```{cfgcmd} set service monitoring telegraf prometheus-client metric-version \<1 | 2\>

Metrics version, the default is ``2``
```


```{cfgcmd} set service monitoring telegraf prometheus-client port \<port\>

Port number used by connection, default is ``9273``
```

Example:

```none
set service monitoring telegraf prometheus-client
```


```none
vyos@r14:~$ curl --silent localhost:9273/metrics | egrep -v "#" |  grep cpu_usage_system
cpu_usage_system{cpu="cpu-total",host="r14"} 0.20040080160320556
cpu_usage_system{cpu="cpu0",host="r14"} 0.17182130584191915
cpu_usage_system{cpu="cpu1",host="r14"} 0.22896393817971655
```

### Splunk


Telegraf output plugin [splunk] HTTP Event Collector.

```{cfgcmd} set service monitoring telegraf splunk authentication insecure

Use TLS but skip host validation
```


```{cfgcmd} set service monitoring telegraf splunk authentication token \<token\>

Authorization token
```


```{cfgcmd} set service monitoring telegraf splunk authentication url \<url\>

Remote URL to Splunk collector
```

Example:

```none
set service monitoring telegraf splunk authentication insecure
set service monitoring telegraf splunk authentication token 'xxxxf5b8-xxxx-452a-xxxx-43828911xxxx'
set service monitoring telegraf splunk url 'https://192.0.2.10:8088/services/collector'
```

### InfluxDB


Telegraf output plugin [influxdb] to write metrics to `InfluxDB` via HTTP.

```{cfgcmd} set service monitoring telegraf influxdb authentication organization \<organization\>

Authentication organization name
```


```{cfgcmd} set service monitoring telegraf influxdb authentication token \<token\>

Authentication token
```


```{cfgcmd} set service monitoring telegraf bucket \<bucket\>

Remote ``InfluxDB`` bucket name
```


```{cfgcmd} set service monitoring telegraf influxdb port \<port\>

Remote port
```


```{cfgcmd} set service monitoring telegraf influxdb url \<url\>

Remote URL
```

Example:

```none
set service monitoring telegraf influxdb authentication organization 'vyos'
set service monitoring telegraf influxdb authentication token 'ZAml9Uy5wrhA...=='
set service monitoring telegraf influxdb bucket 'bucket_vyos'
set service monitoring telegraf influxdb port '8086'
set service monitoring telegraf influxdb url 'http://r1.influxdb2.local'
```

### Loki

Telegraf can be used to send logs to [loki] using tags as labels.

```{cfgcmd} set service monitoring telegraf loki port \<port\>

   Remote Loki port

   Default is 3100
```


```{cfgcmd} set service monitoring telegraf loki url \<url\>

Remote Loki url
```


```{cfgcmd} set service monitoring telegraf loki authentication username \<username\>
```

```{cfgcmd} set service monitoring telegraf loki authentication password \<password\>

HTTP basic authentication.

If either is set both must be set.
```

```{cfgcmd} set service monitoring telegraf loki metric-name-label \<label\>

Label to use for the metric name when sending metrics.

If set to an empty string, the label will not be added.
This is NOT recommended, as it makes it impossible to differentiate
between multiple metrics.
```

## Prometheus


The following Prometheus exporters are configurable to export metrics:
: - Node Exporter
  - FRR Exporter
  - VPP Exporter
  - Blackbox Exporter


### Node Exporter


Prometheus [node_exporter] which provides a wide range of hardware and OS metrics.

```{cfgcmd} set service monitoring prometheus node-exporter listen-address \<address\>

Configure the address node_exporter is listening on.
```

```{cfgcmd} set service monitoring prometheus node-exporter port \<port\>

Configure the port number node_exporter is listening on.
```

```{cfgcmd} set service monitoring prometheus node-exporter vrf \<name\>

Configure name of the {abbr}`VRF (Virtual Routing and Forwarding)` instance.
```

```{cfgcmd} set service monitoring prometheus node-exporter collectors textfile

Configure textfile collector to export custom metrics read from
`/run/node_exporter/collector`
```

### FRR Exporter

Prometheus [frr_exporter] which provides free range routing metrics.

```{cfgcmd} set service monitoring prometheus frr-exporter listen-address \<address\>

Configure the address frr_exporter is listening on.

```

```{cfgcmd} set service monitoring prometheus frr-exporter port \<port\>

Configure the port number frr_exporter is listening on.
```

```{cfgcmd} set service monitoring prometheus frr-exporter vrf \<name\>

Configure name of the {abbr}`VRF (Virtual Routing and Forwarding)` instance.
```

### VPP Exporter

Prometheus [vpp_exporter] is the `vpp_prometheus_export` utility shipped with
upstream {abbr}`VPP (Vector Packet Processing)`. Unlike the other exporters
in this section it is not a standalone project — it is built from the FD.io
VPP source tree. It connects to VPP's shared-memory stats segment via the
socket at `/run/vpp/stats.sock` and re-exposes the selected counters as a
Prometheus `/metrics` HTTP endpoint, using the v2 metric format.

The exporter runs as a systemd service that is bound to the `vpp.service`
unit (`BindsTo` / `PartOf`): it cannot start until VPP is running, restarts
automatically when VPP restarts, and stops when VPP is stopped. It coexists
with `node-exporter`, which scrapes kernel/host metrics independently.

The exporter listens on the IPv6 wildcard address (`::`, accepting v4-mapped
connections) on the configured port — there is no separate `listen-address`
option.

The set of exported counters is controlled by two complementary mechanisms
that are **combined additively** — a counter is exported if its
stats-segment path is matched by any configured group or pattern:

- {cfgcmd}`stat-group` selects an entire top-level namespace in the VPP
  stats segment. Each group corresponds to a fixed `^/<name>` regex.
- {cfgcmd}`stat-pattern` selects a custom subset by regex against the
  stats-segment path.

If neither is configured, VyOS exports a default set covering
`interfaces`, `err`, `buffer-pools`, `sys`, `workers` and `mem` (the
`nodes` group is excluded from the default — see the per-node-counters
note below).

```{cfgcmd} set service monitoring prometheus vpp-exporter port \<port\>

Configure the TCP port that the VPP exporter listens on for Prometheus
scrape requests. Upstream's default is `9482`.
```

```{cfgcmd} set service monitoring prometheus vpp-exporter stat-group \<interfaces | err | buffer-pools | sys | workers | nodes | mem\>

Export an entire predefined VPP stat group. Each group maps to a single
top-level prefix in the stats segment:

| Group          | Maps to regex     |
| -------------- | ----------------- |
| `interfaces`   | `^/interfaces`    |
| `err`          | `^/err`           |
| `buffer-pools` | `^/buffer-pools`  |
| `sys`          | `^/sys`           |
| `workers`      | `^/workers`       |
| `nodes`        | `^/nodes`         |
| `mem`          | `^/mem`           |

The exact set of counters under each prefix is determined by VPP itself
and depends on the running plugins, configured features and (for `nodes`)
on whether per-node counters are enabled. Use VPP's `show statistics`
CLI on the live system to enumerate what is actually published.

This option may be specified multiple times to combine groups.
```

```{cfgcmd} set service monitoring prometheus vpp-exporter stat-pattern \<pattern\>

Export a custom subset of stats by regex match against the VPP
stats-segment path. The pattern must begin with `^/`. Examples:
`^/interfaces` (all interface counters), `^/interfaces/.*/rx` (RX
counters across all interfaces), `^/sys/.*` (all system counters).

This option may be specified multiple times.
```

```{cfgcmd} set service monitoring prometheus vpp-exporter vrf \<name\>

Run the exporter inside the named {abbr}`VRF (Virtual Routing and Forwarding)`
instance, so that scrape traffic is routed via the VRF's routing table.
The service is started under `ip vrf exec <name>`.
```

If `nodes` stats are selected via `stat-group nodes` or via a
`stat-pattern` matching `^/nodes`, enable per-node counters in VPP —
without this, VPP does not maintain node-level counters and the scrape
will return empty values for that namespace:

```{cfgcmd} set vpp settings resource-allocation memory stats per-node-counters
```

Example — export buffer-pool and system counters plus per-interface RX
stats on port `9482`:

```none
set service monitoring prometheus vpp-exporter port 9482
set service monitoring prometheus vpp-exporter stat-group buffer-pools
set service monitoring prometheus vpp-exporter stat-group sys
set service monitoring prometheus vpp-exporter stat-pattern '^/interfaces/.*/rx'
```

### Blackbox Exporter

Prometheus [blackbox_exporter] which allows probing of endpoints over
HTTP, HTTPS, DNS, TCP, ICMP and gRPC .

```{cfgcmd} set service monitoring prometheus blackbox-exporter listen-address \<address\>

Configure the address blackbox_exporter is listening on.
```
```{cfgcmd} set service monitoring prometheus blackbox-exporter port \<port\>

Configure the port number blackbox_exporter is listening on.
```
```{cfgcmd} set service monitoring prometheus blackbox-exporter vrf \<name\>

Configure name of the {abbr}`VRF (Virtual Routing and Forwarding)` instance.
```

#### Configuring modules

Blackbox exporter can be configured with different modules for probing DNS or ICMP.

DNS module example:

```none
set service monitoring prometheus blackbox-exporter modules dns name dns4 preferred-ip-protocol ipv4
set service monitoring prometheus blackbox-exporter modules dns name dns4 query-name vyos.io
set service monitoring prometheus blackbox-exporter modules dns name dns4 query-type A
```

ICMP module example:

```none
set service monitoring prometheus blackbox-exporter modules icmp name ping6 preferred-ip-protocol ipv6
set service monitoring prometheus blackbox-exporter modules icmp name ping6 ip-protocol-fallback
set service monitoring prometheus blackbox-exporter modules icmp name ping6 timeout 3
```

[azure-data-explorer]: <https://github.com/influxdata/telegraf/tree/master/plugins/outputs/azure_data_explorer>
[blackbox_exporter]: <https://github.com/prometheus/blackbox_exporter>
[frr_exporter]: <https://github.com/tynany/frr_exporter>
[influxdb]: <https://github.com/influxdata/telegraf/tree/master/plugins/outputs/influxdb_v2>
[loki]: https://github.com/influxdata/telegraf/tree/master/plugins/outputs/loki
[node_exporter]: <https://github.com/prometheus/node_exporter>
[prometheus-client]: <https://github.com/influxdata/telegraf/tree/master/plugins/outputs/prometheus_client>
[splunk]: <https://www.splunk.com/en_us/blog/it/splunk-metrics-via-telegraf.html>
[vpp_exporter]: <https://github.com/FDio/vpp/blob/master/src/vpp/app/vpp_prometheus_export.c>
