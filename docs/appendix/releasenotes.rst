.. _releasenotes:

########
Appendix
########

*************
Release notes
*************

1.2 (Crux)
==========

1.2.3
-----

1.2.3 is a maintenance and feature backport release made in September 2019.

New features
^^^^^^^^^^^^

* HTTP API
* "set service dns forwarding allow-from <IPv4 net|IPv6 net>" option for limiting queries to specific client networks (T1524)
* Functions for checking if a commit is in progress (T1503)
* "set system contig-mangement commit-archive source-address" option (T1543)
* Intel NIC drivers now support receive side scaling and multiqueue (T1554)

Resolved issues
^^^^^^^^^^^^^^^

* OSPF max-metric values over 100 no longer causes commit errors (T1209)
* Fixes issue with DNS forwarding not performing recursive lookups on domain specific forwarders (T1333)
* Special characters in VRRP passwords are handled correctly (T1362)
* BGP weight is applied properly (T1377)
* Fixed permission for log files (T1420)
* Wireguard interfaces now support /31 addresses (T1425)
* Wireguard correctly handles firewall marks (T1428)
* DHCPv6 static mappings now work correctly (T1439)
* Flood ping commands now works correctly (T1450)
* Op mode "show firewall" commands now support counters longer than 8 digits (T1460)
* Fixed priority inversion in VTI commands (T1465)
* Fixed remote-as check in the BGP route-reflector-client option (T1468)
* It's now possible to re-create VRRP groups with RFC compatibility mode enabled (T1472)
* Fixed a typo in DHCPv6 server help strings  (T1527)
* Unnumbered BGP peers now support VLAN interfaces (T1529)
* Fixed "set system syslog global archive file" command (T1530)
* Multiple fixes in cluster configuration scripts (T1531)
* Fixed missing help text for "service dns" (T1537)
* Fixed input validation in DHCPv6 relay options (T1541)
* It's now possible to create a QinQ interface and a firewall assigned to it in one commit (T1551)
* URL filtering now uses correct rule database path and works again (T1559)
* "show log vpn ipsec" command works again (T1579)
* "show arp interface <intf>" command works again (T1576)
* Fixed regression in L2TP/IPsec server (T1605)
* Netflow/sFlow captures IPv6 traffic correctly (T1613)
* "renew dhcpv6" command now works from op mode (T1616)
* BGP remove-private-as option iBGP vs eBGP check works correctly now (T1642)
* Multiple improvements in name servers and hosts configuration handling (T1540, T1360, T1264, T1623)

Internals
^^^^^^^^^

/etc/resolv.conf and /etc/hosts files are now managed by the vyos-hostsd service that listens on a ZMQ socket for update messages.

1.2.2
-----

1.2.2 is a maintenance release made in July 2019.

New features
^^^^^^^^^^^^

* Options for per-interface MSS clamping.
* BGP extended next-hop capability
* Relaxed BGP multipath option
* Internal and external options for "remote-as" (accept any AS as long as it's the same to this router or different, respectively)
* "Unnumbered" (interface-based) BGP peers
* BGP no-prepend option
* Additive BGP community option
* OSPFv3 network type option
* Custom arguments for VRRP scripts
* A script for querying values from config files

Resolved issues
^^^^^^^^^^^^^^^

* Linux kernel 4.19.54, including a fix for the TCP SACK vulnerability
* VRRP health-check scripts now can use arguments (T1371)
* DNS server addresses coming from a DHCP server are now correctly propagated to resolv.conf (T1497)
* Domain-specific name servers in DNS forwarding are now used for recursive queries (T1469)
* “run show dhcpv6 server leases” now display leases correctly (T1433)
* Deleting “firewall options” node no longer causes errors (T1461)
* Correct hostname is sent to remote syslog again (T1458)
* Board serial number from DMI is correctly displayed in “show version” (T1438)
* Multiple corrections in remote syslog config (T1358, T1355, T1294)
* Fixed missing newline in /etc/hosts (T1255)
* “system domain-name” is correctly included in /etc/resolv.conf (T1174)
* Fixed priority inversion in “interfaces vti vtiX ip” settings (T1465)
* Fixed errors when installing with RAID1 on UEFI machines (T1446)
* Fixed an error on disabling an interfaces that has no address (T1387)
* Fixed deleting VLAN interface with non-default MTU (T1367)
* vyos.config return_effective_values() function now correctly returns a list rather than a string (T1505)

1.2.1
-----

VyOS 1.2.1 is a maintenance release made in April 2019.

Resolved issues
^^^^^^^^^^^^^^^

* Package updates: kernel 4.19.32, open-vm-tools 10.3, latest Intel NIC drivers.
* The kernel now includes drivers for various USB serial adapters, which allows people to add a serial console to a machine without onboard RS232, or connect to something else from the router (`T1326 <https://phabricator.vyos.net/T1326>`_).
* The collection of network card firmware is now much more extensive.
* VRRP now correctly uses a virtual rather than physical MAC addresses in the RFC-compliant mode (`T1271 <https://phabricator.vyos.net/T1271>`_).
* DHCP WPAD URL option works correctly again (`T1330 <https://phabricator.vyos.net/T1330>`_)
* Many to many NAT rules now can use source/destination and translation networks of non-matching size (`T1312 <https://phabricator.vyos.net/T1312>`_). If 1:1 network bits translation is desired, it’s now user’s responsibility to check if prefix length matches.
* IPv6 network prefix translation is fixed (`T1290 <https://phabricator.vyos.net/T1290>`_).
* Non-alphanumeric characters such as “>” can now be safely used in PPPoE passwords (`T1308 <https://phabricator.vyos.net/T1308>`_).
* “show | commands” no longer fails when a config section ends with a leaf node such as “timezone” in “show system | commands” (`T1305 <https://phabricator.vyos.net/T1305>`_).
* “show | commands” correctly works in config mode now (`T1235 <https://phabricator.vyos.net/T1235>`_).
* VTI is now compatible with the DHCP-interface IPsec option (`T1298 <https://phabricator.vyos.net/T1298>`_).
* “show dhcp server statistics” command was broken in latest Crux (`T1277 <https://phabricator.vyos.net/T1277>`_).
* An issue with TFTP server refusing to listen on addresses other than loopback was fixed (`T1261 <https://phabricator.vyos.net/T1261>`_).
* Template issue that might cause UDP broadcast relay fail to start is fixed (`T1224 <https://phabricator.vyos.net/T1224>`_).
* VXLAN value validation is improved (`T1067 <https://phabricator.vyos.net/T1067>`_).
* Blank hostnames in DHCP updates no longer can crash DNS forwarding (`T1211 <https://phabricator.vyos.net/T1211>`_).
* Correct configuration is now generated for DHCPv6 relays with more than one upstream interface (`T1322 <https://phabricator.vyos.net/T1322>`_).
* “relay-agents-packets” option works correctly now (`T1234 <https://phabricator.vyos.net/T1234>`_).
* Dynamic DNS data is now cleaned on configuration change (`T1231 <https://phabricator.vyos.net/T1231>`_).
* Remote Syslog can now use a fully qualified domain name (`T1282 <https://phabricator.vyos.net/T1282>`_).
* ACPI power off works again (`T1279 <https://phabricator.vyos.net/T1279>`_).
* Negation in WAN load balancing rules works again (`T1247 <https://phabricator.vyos.net/T1247>`_).
* FRR’s staticd now starts on boot correctly (`T1218 <https://phabricator.vyos.net/T1218>`_).
* The installer now correctly detects SD card devices (`T1296 <https://phabricator.vyos.net/T1296>`_).
* Wireguard peers can be disabled now (`T1225 <https://phabricator.vyos.net/T1225>`_).
* The issue with wireguard interfaces impossible to delete is fixed (`T1217 <https://phabricator.vyos.net/T1217>`_).
* Unintended IPv6 access is fixed in SNMP configuration (`T1160 <https://phabricator.vyos.net/T1160>`_).
* It’s now possible to exclude hosts from the transparent web proxy (`T1060 <https://phabricator.vyos.net/T1060>`_).
* An issue with rules impossible to delete from the zone-based firewall is fixed (`T484 <https://phabricator.vyos.net/T484>`_).

Earlier releases
================

See `the wiki <https://wiki.vyos.net/wiki/1.2.0/release_notes>`_.
