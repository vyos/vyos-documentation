.. _flow-accounting:

###############
Flow Accounting
###############

NetFlow is a feature that was introduced on Cisco routers around 1996 that
provides the ability to collect IP network traffic as it enters or exits an
interface. By analyzing the data provided by NetFlow, a network administrator
can determine things such as the source and destination of traffic, class of
service, and the causes of congestion. A typical flow monitoring setup (using
NetFlow) consists of three main components:

* **exporter**: aggregates packets into flows and exports flow records towards
  one or more flow collectors
* **collector**: responsible for reception, storage and pre-processing of flow
  data received from a flow exporter
* **application**: analyzes received flow data in the context of intrusion
  detection or traffic profiling, for example

For connectionless protocols as like ICMP and UDP, a flow is considered complete
once no more packets for this flow appear after configurable timeout.

NetFlow is usually enabled on a per-interface basis to limit load on the router
components involved in NetFlow, or to limit the amount of NetFlow records
exported.

Configururation
===============

In order for flow accounting information to be collected and displayed for an
interface, the interface must be configured for flow accounting.

.. cfgcmd:: set system flow-accounting interface '<interface>'

   Configure and enable collection of flow information for the interface
   identified by `<interface>`.

   You can configure multiple interfaces which whould participate in flow
   accounting.

Flow Export
-----------

In addition to displaying flow accounting information locally, one can also
exported them to a collection server.

.. cfgcmd:: set system flow-accounting netflow version '<version>'

   There are multiple versions available for the NetFlo data. The `<version>`
   used in the exported flow data can be configured here. The following
   versions are supported:

   * **5** - Most common version, but restricted to IPv4 flows only
   * **9** - NetFlow version 9 (default)
   * **10** - :abbr:`IPFIX (IP Flow Information Export)` as per :rfc:`3917`

.. cfgcmd:: set system flow-accounting netflow server '<address>'

   Configure address of NetFlow collector. NetFlow server at `<address>` can
   be both listening on an IPv4 or IPv6 address.

.. cfgcmd:: set system flow-accounting netflow source-ip '<address>'

   IPv4 or IPv6 source address of NetFlow packets

.. cfgcmd:: set system flow-accounting netflow engine-id '<id>'

   NetFlow engine-id which will appear in NetFlow data. The range is 0 to 255.

.. cfgcmd:: set system flow-accounting netflow sampling-rate '<rate>'

   Use this command to configure the  sampling rate for flow accounting. The
   system samples one in every `<rate>` packets, where `<rate>` is the value
   configured for the sampling-rate option. The advantage of sampling every n
   packets, where n > 1, allows you to decrease the amount of processing
   resources required for flow accounting. The disadvantage of not sampling
   every packet is that the statistics produced are estimates of actual data
   flows.

   Per default every packet is sampled (that is, the sampling rate is 1).

.. cfgcmd:: set system flow-accounting netflow timeout expiry interval '<interval>'

   Specifies the interval at which Netflow data will be sent to a collector. As
   per default, Netflow data will be sent every 60 seconds.


Example:
--------

NetFlow v5 example:

.. code-block:: none

  set system flow-accounting netflow engine-id 100
  set system flow-accounting netflow version 5
  set system flow-accounting netflow server 192.168.2.10 port 2055

Operation
=========

Once flow accounting is configured on an interfaces it provides the ability to
display captured network traffic information for all configured interfaces.

.. opcmd:: show flow-accounting interface '<interface>'

   Show flow accounting information for given `<interface>`.

   .. code-block:: none

     vyos@vyos:~$ show flow-accounting interface eth0
     flow-accounting for [eth0]
     Src Addr      Dst Addr     Sport Dport Proto  Packets     Bytes  Flows
     0.0.0.0       192.0.2.50   811   811     udp     7733    591576      0
     0.0.0.0       192.0.2.50   811   811     udp     7669    586558      1
     192.0.2.200   192.0.2.51   56188 22      tcp      586     36504      1
     192.0.2.99    192.0.2.51   61636 161     udp       46      6313      4
     192.0.2.99    192.0.2.51   61638 161     udp       42      5364      9
     192.0.2.99    192.0.2.51   61640 161     udp       42      5111      3
     192.0.2.200   192.0.2.51   54702 22      tcp       86      4432      1
     192.0.2.99    192.0.2.51   62509 161     udp       24      3540      1
     192.0.2.99    192.0.2.51   0     0      icmp       49      2989      8
     192.0.2.99    192.0.2.51   54667 161     udp       18      2658      1
     192.0.2.99    192.0.2.51   54996 161     udp       18      2622      1
     192.0.2.99    192.0.2.51   63708 161     udp       18      2622      1
     192.0.2.99    192.0.2.51   62111 161     udp       18      2622      1
     192.0.2.99    192.0.2.51   61646 161     udp       16      1977      4
     192.0.2.99    192.0.2.51   56038 161     udp       10      1256      1
     192.0.2.99    192.0.2.51   55570 161     udp        6      1146      1
     192.0.2.99    192.0.2.51   54599 161     udp        6      1134      1
     192.0.2.99    192.0.2.51   56304 161     udp        8      1029      1


.. opcmd:: show flow-accounting interface '<interface>' host '<address>'

   Show flow accounting information for given `<interface>` for a specific host
   only.

   .. code-block:: none

     vyos@vyos:~$ show flow-accounting interface eth0 host 192.0.2.200
     flow-accounting for [eth0]
     Src Addr      Dst Addr     Sport Dport Proto  Packets     Bytes  Flows
     192.0.2.200   192.0.2.51   56188 22      tcp      586     36504      1
     192.0.2.200   192.0.2.51   54702 22      tcp       86      4432      1
