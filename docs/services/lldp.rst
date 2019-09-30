LLDP
----

The Link Layer Discovery Protocol (LLDP) is a vendor-neutral
link layer protocol in the Internet Protocol Suite used by network devices for
advertising their identity, capabilities, and neighbors on an IEEE 802 local
area network, principally wired Ethernet.[1] The protocol is formally referred
to by the IEEE as Station and Media Access Control Connectivity Discovery
specified in IEEE 802.1AB and IEEE 802.3-2012 section 6 clause 79.

LLDP performs functions similar to several proprietary protocols, such as
`Cisco Discovery Protocol`_, `Foundry Discovery Protocol`_,
Nortel Discovery Protocol and Link Layer Topology Discovery.

Information gathered
^^^^^^^^^^^^^^^^^^^^

Information gathered with LLDP is stored in the device as a management
information database (MIB_) and can be queried with the Simple Network
Management Protocol (SNMP_) as specified in RFC 2922. The topology of an
LLDP-enabled network can be discovered by crawling the hosts and querying this
database. Information that may be retrieved include:

* System name and description
* Port name and description
* VLAN name
* IP management address
* System capabilities (switching, routing, etc.)
* MAC/PHY information
* MDI power
* Link aggregation

Configuration
^^^^^^^^^^^^^

* Enable service with:

  :code:`set service lldp`

Options
*******

* Configure a Define management-address:

  :code:`set service lldp management-address <x.x.x.x>`

* Define listening interfaces

  :code:`set service lldp interface <all|interface name>`

* LLDPd also implements an SNMP subagent. To Enable SNMP queries of the LLDP
  database:

  :code:`set service lldp snmp enable`

* Enable optional/other protocols

  :code:`set service lldp legacy-protocols cdp`

  Supported legacy protocols:

 * ``cdp`` - Listen for CDP for Cisco routers/switches
 * ``edp`` - Listen for EDP for Extreme routers/switches
 * ``fdp`` - Listen for FDP for Foundry routers/switches
 * ``sonmp`` - Listen for SONMP for Nortel routers/switches


Display neighbors
^^^^^^^^^^^^^^^^^

* Display with:

``show lldp neighbors``

Exemple:

.. code-block:: sh

  vyos@vyos:~# show lldp neighbors
  Capability Codes: R - Router, B - Bridge, W - Wlan r - Repeater, S - Station
                   D - Docsis, T - Telephone, O - Other
  Device ID                 Local  Proto  Cap   Platform             Port ID
  ---------                 -----  -----  ---   --------             -------
  swA309                    eth0   LLDP   ?     Cisco IOS Software,  GigE0/33


* Options:

 * ``detail`` - Show lldp neighbors detail
 * ``interface`` - Show LLDP for specified interface

Troubleshooting
^^^^^^^^^^^^^^^

Use operational command ``show log lldp`` to display logs.

.. include:: references.rst
