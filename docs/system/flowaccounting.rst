.. _flow-accounting:

NetFlow is a feature that was introduced on Cisco routers around 1996 that
provides the ability to collect IP network traffic as it enters or exits an
interface. By analyzing the data provided by NetFlow, a network administrator
can determine things such as the source and destination of traffic, class of
service, and the causes of congestion. A typical flow monitoring setup (using
NetFlow) consists of three main components:

- Flow exporter: aggregates packets into flows and exports flow records towards
  one or more flow collectors

- Flow collector: responsible for reception, storage and pre-processing of flow
  data received from a flow exporter

- Analysis application: analyzes received flow data in the context of intrusion
  detection or traffic profiling, for example

For connectionless protocols as like ICMP and UDP, a flow is considered complete
once no more packets for this flow appear after configurable timeout.

NetFlow is usually enabled on a per-interface basis to limit load on the router
components involved in NetFlow, or to limit the amount of NetFlow records
exported.

VyOS supports flow accounting through NetFlow (version 5, 9 and 10) or sFlow.

Flow Accounting
---------------

In order for flow accounting information to be collected and displayed for an
interface, the interface must be configured for flow accounting. The following
example shows how to configure ``eth0`` and ``bond3`` for flow accounting.

.. code-block:: sh

  set system flow-accounting interface eth0
  set system flow-accounting interface bond3


NetFlow is a protocol originating from Cisco Systems. It works on level3.
VyOS supports version 5, 9 and 10 (IPFIX - IP Flow Information Export)

NetFlow v5 example:

.. code-block:: sh

  set system flow-accounting netflow engine-id 100
  set system flow-accounting netflow version 5
  set system flow-accounting netflow server 192.168.2.10 port 2055

Displaying Flow Accounting Information
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Once flow accounting is configured on an interfaces it provides the ability to
display captured network traffic information for all configured interfaces.

The following op-mode command shows flow accounting for eth0.

.. code-block:: sh

  vyos@vyos:~$ show flow-accounting interface eth0
  flow-accounting for [eth0]
  Src Addr        Dst Addr        Sport Dport Proto    Packets      Bytes   Flows
  0.0.0.0         192.0.2.50      811   811     udp       7733     591576       0
  0.0.0.0         192.0.2.50      811   811     udp       7669     586558       1
  192.0.2.200     192.0.2.51      56188 22      tcp        586      36504       1
  192.0.2.99      192.0.2.51      61636 161     udp         46       6313       4
  192.0.2.99      192.0.2.51      61638 161     udp         42       5364       9
  192.0.2.99      192.0.2.51      61640 161     udp         42       5111       3
  192.0.2.200     192.0.2.51      54702 22      tcp         86       4432       1
  192.0.2.99      192.0.2.51      62509 161     udp         24       3540       1
  192.0.2.99      192.0.2.51      0     0      icmp         49       2989       8
  192.0.2.99      192.0.2.51      54667 161     udp         18       2658       1
  192.0.2.99      192.0.2.51      54996 161     udp         18       2622       1
  192.0.2.99      192.0.2.51      63708 161     udp         18       2622       1
  192.0.2.99      192.0.2.51      62111 161     udp         18       2622       1
  192.0.2.99      192.0.2.51      61646 161     udp         16       1977       4
  192.0.2.99      192.0.2.51      56038 161     udp         10       1256       1
  192.0.2.99      192.0.2.51      55570 161     udp          6       1146       1
  192.0.2.99      192.0.2.51      54599 161     udp          6       1134       1
  192.0.2.99      192.0.2.51      56304 161     udp          8       1029       1

