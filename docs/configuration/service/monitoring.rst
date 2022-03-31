Monitoring
----------

Monitoring functionality with ``telegraf`` and ``InfluxDB 2`` is provided.

Telegraf
========
Telegraf is the open source server agent to help you collect metrics, events
and logs from your routers.

.. cfgcmd:: set service monitoring telegraf authentication organization <organization>

   Authentication organization name

.. cfgcmd:: set service monitoring telegraf authentication token <token>

   Authentication token

.. cfgcmd:: set service monitoring telegraf bucket <bucket>

   Remote ``InfluxDB`` bucket name

.. cfgcmd:: set service monitoring port <port>

   Remote port

.. cfgcmd:: set service monitoring telegraf url <url>

   Remote URL


Example
=======

An example of a configuration that sends ``telegraf`` metrics to remote
``InfluxDB 2``

.. code-block:: none

  set service monitoring telegraf authentication organization 'vyos'
  set service monitoring telegraf authentication token 'ZAml9Uy5wrhA...=='
  set service monitoring telegraf bucket 'bucket_vyos'
  set service monitoring telegraf port '8086'
  set service monitoring telegraf source 'all'
  set service monitoring telegraf url 'http://r1.influxdb2.local'
