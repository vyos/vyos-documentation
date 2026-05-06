# Monitoring

## Azure-data-explorer

Telegraf output plugin [azure-data-explorer](https://github.com/influxdata/telegraf/tree/master/plugins/outputs/azure_data_explorer)

<div class="cfgcmd">

set service monitoring telegraf azure-data-explorer authentication client-id \<client-id\>

Authentication application client-id.

</div>

<div class="cfgcmd">

set service monitoring telegraf azure-data-explorer authentication client-secret \<client-secret\>

Authentication application client-secret.

</div>

<div class="cfgcmd">

set service monitoring telegraf azure-data-explorer authentication tenant-id \<tenant-id\>

Authentication application tenant-id

</div>

<div class="cfgcmd">

set service monitoring telegraf azure-data-explorer database \<name\>

Remote database name.

</div>

<div class="cfgcmd">

set service monitoring telegraf azure-data-explorer group-metrics \<single-table | table-per-metric\>

Type of metrics grouping when push to Azure Data Explorer. The default is
`table-per-metric`.

</div>

<div class="cfgcmd">

set service monitoring telegraf azure-data-explorer table \<name\>

Name of the single table Only if set group-metrics single-table.

</div>

<div class="cfgcmd">

set service monitoring telegraf azure-data-explorer url \<url\>

Remote URL.

</div>

## Prometheus-client

Telegraf output plugin [prometheus-client](https://github.com/influxdata/telegraf/tree/master/plugins/outputs/prometheus_client)

<div class="cfgcmd">

set service monitoring telegraf prometheus-client

Output plugin Prometheus client

</div>

<div class="cfgcmd">

set service monitoring telegraf prometheus-client allow-from \<prefix\>

Networks allowed to query this server

</div>

<div class="cfgcmd">

set service monitoring telegraf prometheus-client authentication username \<username\>

HTTP basic authentication username

</div>

<div class="cfgcmd">

set service monitoring telegraf prometheus-client authentication password \<password\>

HTTP basic authentication username

</div>

<div class="cfgcmd">

set service monitoring telegraf prometheus-client listen-address \<address\>

Local IP addresses to listen on

</div>

<div class="cfgcmd">

set service monitoring telegraf prometheus-client metric-version \<1 | 2\>

Metris version, the default is `2`

</div>

<div class="cfgcmd">

set service monitoring telegraf prometheus-client port \<port\>

Port number used by connection, default is `9273`

</div>

Example:

``` none
set service monitoring telegraf prometheus-client
```

``` none
vyos@r14:~$ curl --silent localhost:9273/metrics | egrep -v "#" |  grep cpu_usage_system
cpu_usage_system{cpu="cpu-total",host="r14"} 0.20040080160320556
cpu_usage_system{cpu="cpu0",host="r14"} 0.17182130584191915
cpu_usage_system{cpu="cpu1",host="r14"} 0.22896393817971655
```

## Splunk

Telegraf output plugin [splunk](https://www.splunk.com/en_us/blog/it/splunk-metrics-via-telegraf.html). HTTP Event Collector.

<div class="cfgcmd">

set service monitoring telegraf splunk authentication insecure

Use TLS but skip host validation

</div>

<div class="cfgcmd">

set service monitoring telegraf splunk authentication token \<token\>

Authorization token

</div>

<div class="cfgcmd">

set service monitoring telegraf splunk authentication url \<url\>

Remote URL to Splunk collector

</div>

Example:

``` none
set service monitoring telegraf splunk authentication insecure
set service monitoring telegraf splunk authentication token 'xxxxf5b8-xxxx-452a-xxxx-43828911xxxx'
set service monitoring telegraf splunk url 'https://192.0.2.10:8088/services/collector'
```

## Telegraf

Monitoring functionality with `telegraf` and `InfluxDB 2` is provided.
Telegraf is the open source server agent to help you collect metrics, events
and logs from your routers.

<div class="cfgcmd">

set service monitoring telegraf influxdb authentication organization \<organization\>

Authentication organization name

</div>

<div class="cfgcmd">

set service monitoring telegraf influxdb authentication token \<token\>

Authentication token

</div>

<div class="cfgcmd">

set service monitoring telegraf bucket \<bucket\>

Remote `InfluxDB` bucket name

</div>

<div class="cfgcmd">

set service monitoring telegraf influxdb port \<port\>

Remote port

</div>

<div class="cfgcmd">

set service monitoring telegraf influxdb url \<url\>

Remote URL

</div>

## Example

An example of a configuration that sends `telegraf` metrics to remote
`InfluxDB 2`

``` none
set service monitoring telegraf influxdb authentication organization 'vyos'
set service monitoring telegraf influxdb authentication token 'ZAml9Uy5wrhA...=='
set service monitoring telegraf influxdb bucket 'bucket_vyos'
set service monitoring telegraf influxdb port '8086'
set service monitoring telegraf influxdb url 'http://r1.influxdb2.local'
```
