.. _lldp:

####
LLDP
####

:abbr:`LLDP (Link Layer Discovery Protocol)` is a vendor-neutral link layer
protocol in the Internet Protocol Suite used by network devices for advertising
their identity, capabilities, and neighbors on an IEEE 802 local area network,
principally wired Ethernet. The protocol is formally referred to by the IEEE
as Station and Media Access Control Connectivity Discovery specified in IEEE
802.1AB and IEEE 802.3-2012 section 6 clause 79.

LLDP performs functions similar to several proprietary protocols, such as
:abbr:`CDP (Cisco Discovery Protocol)`, :abbr:`FDP (Foundry Discovery Protocol)`,
:abbr:`NDP (Nortel Discovery Protocol)` and :abbr:`LLTD (Link Layer Topology
Discovery)`.

Information gathered with LLDP is stored in the device as a :abbr:`MIB
(Management Information Database)` and can be queried with :abbr:`SNMP (Simple
Network Management Protocol)` as specified in :rfc:`2922`. The topology of an
LLDP-enabled network can be discovered by crawling the hosts and querying this
database. Information that may be retrieved include:

* System Name and Description
* Port name and description
* VLAN name
* IP management address
* System capabilities (switching, routing, etc.)
* MAC/PHY information
* MDI power
* Link aggregation

Configuration
=============

.. cfgcmd:: set service lldp

   Enable LLDP service

.. cfgcmd:: set service lldp management-address <address>

   Define IPv4/IPv6 management address transmitted via LLDP. Multiple addresses
   can be defined. Only addresses connected to the system will be transmitted.

.. cfgcmd:: set service lldp interface <interface>

   Enable transmission of LLDP information on given `<interface>`. You can also
   say ``all`` here so LLDP is turned on on every interface.

.. cfgcmd:: set service lldp interface <interface> disable

   Disable transmit of LLDP frames on given `<interface>`. Useful to exclude
   certain interfaces from LLDP when ``all`` have been enabled.

.. cfgcmd:: set service lldp snmp enable

   Enable SNMP queries of the LLDP database

.. cfgcmd:: set service lldp legacy-protocols <cdp|edp|fdp|sonmp>

   Enable given legacy protocol on this LLDP instance. Legacy protocols include:

   * ``cdp`` - Listen for CDP for Cisco routers/switches
   * ``edp`` - Listen for EDP for Extreme routers/switches
   * ``fdp`` - Listen for FDP for Foundry routers/switches
   * ``sonmp`` - Listen for SONMP for Nortel routers/switches

Operation
=========

.. opcmd:: show lldp neighbors

   Displays information about all neighbors discovered via LLDP.

.. code-block:: none

  vyos@vyos:~# show lldp neighbors
  Capability Codes: R - Router, B - Bridge, W - Wlan r - Repeater, S - Station
                    D - Docsis, T - Telephone, O - Other

  Device ID                 Local  Proto  Cap   Platform             Port ID
  ---------                 -----  -----  ---   --------             -------
  Switch0815                eth0   LLDP   B     Cisco IOS Software,  Gi0/4

.. opcmd:: show lldp neighbors detail

   Get detailed information about LLDP neighbors.

.. code-block:: none

  vyos@vyos:~# show lldp neighbors detail
  -------------------------------------------------------------------------------
  LLDP neighbors:
  -------------------------------------------------------------------------------
  Interface:    eth0, via: LLDP, RID: 1, Time: 12 days, xxxx:xxxx:40
    Chassis:
      ChassisID:    mac 00:50:40:20:03:00
      SysName:      Switch0815
      SysDescr:     Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M), Version 15.0(2)SE11, RELEASE SOFTWARE (fc3)
                    Technical Support: http://www.cisco.com/techsupport
                    Copyright (c) 1986-2017 by Cisco Systems, Inc.
                    Compiled Sat 19-Aug-17 09:34 by prod_rel_team
      MgmtIP:       192.0.2.201
      Capability:   Bridge, on
    Port:
      PortID:       ifname Gi0/4
      PortDescr:    GigabitEthernet0/4
      TTL:          120
      PMD autoneg:  supported: yes, enabled: yes
        Adv:          10Base-T, HD: yes, FD: yes
        Adv:          100Base-TX, HD: yes, FD: yes
        Adv:          1000Base-T, HD: no, FD: yes
        MAU oper type: 1000BaseTFD - Four-pair Category 5 UTP, full duplex mode
    VLAN:         1, pvid: yes
    LLDP-MED:
      Device Type:  Network Connectivity Device
      Capability:   Capabilities, yes
      Capability:   Policy, yes
      Capability:   Location, yes
      Capability:   Inventory, yes
      LLDP-MED Network Policy for: Voice, Defined: no
        Priority:     Best effort
        PCP:          0
        DSCP Value:   0
      LLDP-MED Network Policy for: Voice Signaling, Defined: no
        Priority:     Best effort
        PCP:          0
        DSCP Value:   0
      Inventory:
        Hardware Revision: WS-C2960G-8TC-L (PowerPC405):C0
        Software Revision: 15.0(2)SE11
        Manufacturer: Cisco Systems, Inc.
        Model:        WS-C2960G-8TC-L

.. opcmd:: show lldp neighbors interface <interface>

   Show LLDP neighbors connected via interface `<interface>`.

.. opcmd:: show log lldp

   Used for troubleshooting.
