.. _release-notes:

#############
Release Notes
#############

1.2 (Crux)
==========

1.2.4
-----

1.2.4 is a maintenance release made in December 2019.

Resolved issues
^^^^^^^^^^^^^^^

* `T258 <https://phabricator.vyos.net/T258>`_ Can not configure wan load-balancing on vyos-1.2
* `T818 <https://phabricator.vyos.net/T818>`_ SNMP v3 - remove required engineid from user node
* `T1030 <https://phabricator.vyos.net/T1030>`_ Upgrade ddclient from 3.8.2 to 3.9.0 (support Cloudflare API v4)
* `T1183 <https://phabricator.vyos.net/T1183>`_ BFD Support via FRR
* `T1299 <https://phabricator.vyos.net/T1299>`_ Allow SNMPd to be extended with custom scripts
* `T1351 <https://phabricator.vyos.net/T1351>`_ accel-pppoe adding CIDR based IP pool option
* `T1391 <https://phabricator.vyos.net/T1391>`_ In route-map set community additive
* `T1394 <https://phabricator.vyos.net/T1394>`_ syslog systemd and host_name.py race condition
* `T1401 <https://phabricator.vyos.net/T1401>`_ Copying files with the FTP protocol fails if the password contains special characters
* `T1421 <https://phabricator.vyos.net/T1421>`_ OpenVPN client push-route stopped working, needs added quotes to fix
* `T1430 <https://phabricator.vyos.net/T1430>`_ Add options for custom DHCP client-id and hostname
* `T1447 <https://phabricator.vyos.net/T1447>`_ Python subprocess called without import in host_name.py
* `T1470 <https://phabricator.vyos.net/T1470>`_ improve output of "show dhcpv6 server leases"
* `T1485 <https://phabricator.vyos.net/T1485>`_ Enable 'AdvIntervalOpt' option in for radvd.conf
* `T1496 <https://phabricator.vyos.net/T1496>`_ Separate rolling release and LTS kernel builds
* `T1560 <https://phabricator.vyos.net/T1560>`_ "set load-balancing wan rule 0" causes segfault and prevents load balancing from starting
* `T1568 <https://phabricator.vyos.net/T1568>`_ strip-private command improvement for additional masking of IPv6 and MAC address
* `T1578 <https://phabricator.vyos.net/T1578>`_ completion offers "show table", but show table does not exist
* `T1593 <https://phabricator.vyos.net/T1593>`_ Support ip6gre
* `T1597 <https://phabricator.vyos.net/T1597>`_ /usr/sbin/rsyslogd after deleting "system syslog"
* `T1638 <https://phabricator.vyos.net/T1638>`_ vyos-hostsd not setting system domain name 
* `T1678 <https://phabricator.vyos.net/T1678>`_ hostfile-update missing line feed
* `T1694 <https://phabricator.vyos.net/T1694>`_ NTPd: Do not listen on all interfaces by default
* `T1701 <https://phabricator.vyos.net/T1701>`_ Delete domain-name and domain-search won't work
* `T1705 <https://phabricator.vyos.net/T1705>`_ High CPU usage by bgpd when snmp is active
* `T1707 <https://phabricator.vyos.net/T1707>`_ DHCP static mapping and exclude address not working
* `T1708 <https://phabricator.vyos.net/T1708>`_ Update Rolling Release Kernel to 4.19.76
* `T1709 <https://phabricator.vyos.net/T1709>`_ Update WireGuard to 0.0.20190913
* `T1716 <https://phabricator.vyos.net/T1716>`_ Update Intel NIC drivers to recent versions
* `T1726 <https://phabricator.vyos.net/T1726>`_ Update Linux Firmware binaries to a more recent version 2019-03-14 -> 2019-10-07
* `T1728 <https://phabricator.vyos.net/T1728>`_ Update Linux Kernel to 4.19.79
* `T1737 <https://phabricator.vyos.net/T1737>`_ SNMP tab completion missing
* `T1738 <https://phabricator.vyos.net/T1738>`_ Copy SNMP configuration from node to node raises exception
* `T1740 <https://phabricator.vyos.net/T1740>`_ Broken OSPFv2 virtual-link authentication
* `T1742 <https://phabricator.vyos.net/T1742>`_ NHRP unable to commit.
* `T1745 <https://phabricator.vyos.net/T1745>`_ dhcp-server commit fails with "DHCP range stop address x must be greater or equal to the range start address y!" when static mapping has same IP as range stop
* `T1749 <https://phabricator.vyos.net/T1749>`_ numeric validator doesn't support multiple ranges
* `T1769 <https://phabricator.vyos.net/T1769>`_ Remove complex SNMPv3 Transport Security Model (TSM)
* `T1772 <https://phabricator.vyos.net/T1772>`_ <regex> constraints in XML are partially broken
* `T1778 <https://phabricator.vyos.net/T1778>`_ Kilobits/Megabits difference in configuration Vyos/FRR
* `T1780 <https://phabricator.vyos.net/T1780>`_ Adding ipsec ike closeaction
* `T1786 <https://phabricator.vyos.net/T1786>`_ disable-dhcp-nameservers is missed in current host_name.py implementation
* `T1788 <https://phabricator.vyos.net/T1788>`_ Intel QAT (QuickAssist Technology ) implementation
* `T1792 <https://phabricator.vyos.net/T1792>`_ Update WireGuard to Debian release 0.0.20191012-1
* `T1800 <https://phabricator.vyos.net/T1800>`_ Update Linux Kernel to v4.19.84
* `T1809 <https://phabricator.vyos.net/T1809>`_ Wireless: SSID scan does not work in AP mode
* `T1811 <https://phabricator.vyos.net/T1811>`_ Upgrade from 1.1.8: Config file migration failed: module=l2tp
* `T1812 <https://phabricator.vyos.net/T1812>`_ DHCP: hostnames of clients not resolving after update v1.2.3 -> 1.2-rolling 
* `T1819 <https://phabricator.vyos.net/T1819>`_ Reboot kills SNMPv3 configuration
* `T1822 <https://phabricator.vyos.net/T1822>`_ Priority inversion wireless interface dhcpv6
* `T1825 <https://phabricator.vyos.net/T1825>`_ Improve DHCP configuration error message
* `T1836 <https://phabricator.vyos.net/T1836>`_ import-conf-mode-commands in vyos-1x/scripts fails to create an xml
* `T1839 <https://phabricator.vyos.net/T1839>`_ LLDP shows "VyOS unknown" instead of "VyOS"
* `T1841 <https://phabricator.vyos.net/T1841>`_ PPP ipv6-up.d direcotry missing
* `T1893 <https://phabricator.vyos.net/T1893>`_ igmp-proxy: Do not allow adding unknown interface
* `T1903 <https://phabricator.vyos.net/T1903>`_ Implementation udev predefined interface naming
* `T1904 <https://phabricator.vyos.net/T1904>`_ update eth1 and eth2 link files for the vep4600


1.2.3
-----

1.2.3 is a maintenance and feature backport release made in September 2019.

New features
^^^^^^^^^^^^

* HTTP API
* :vytask:`T1524` "set service dns forwarding allow-from <IPv4 net|IPv6 net>"
  option for limiting queries to specific client networks
* :vytask:`T1503` Functions for checking if a commit is in progress
* :vytask:`T1543` "set system contig-mangement commit-archive source-address"
  option
* :vytask:`T1554` Intel NIC drivers now support receive side scaling and
  multiqueue

Resolved issues
^^^^^^^^^^^^^^^

* :vytask:`T1209` OSPF max-metric values over 100 no longer causes commit
  errors
* :vytask:`T1333` Fixes issue with DNS forwarding not performing recursive
  lookups on domain specific forwarders
* :vytask:`T1362` Special characters in VRRP passwords are handled correctly
* :vytask:`T1377` BGP weight is applied properly
* :vytask:`T1420` Fixed permission for log files
* :vytask:`T1425` Wireguard interfaces now support /31 addresses
* :vytask:`T1428` Wireguard correctly handles firewall marks
* :vytask:`T1439` DHCPv6 static mappings now work correctly
* :vytask:`T1450` Flood ping commands now works correctly
* :vytask:`T1460` Op mode "show firewall" commands now support counters longer
  than 8 digits (T1460)
* :vytask:`T1465` Fixed priority inversion in VTI commands
* :vytask:`T1468` Fixed remote-as check in the BGP route-reflector-client option
* :vytask:`T1472` It's now possible to re-create VRRP groups with RFC
  compatibility mode enabled
* :vytask:`T1527` Fixed a typo in DHCPv6 server help strings
* :vytask:`T1529` Unnumbered BGP peers now support VLAN interfaces
* :vytask:`T1530` Fixed "set system syslog global archive file" command
* :vytask:`T1531` Multiple fixes in cluster configuration scripts
* :vytask:`T1537` Fixed missing help text for "service dns"
* :vytask:`T1541` Fixed input validation in DHCPv6 relay options
* :vytask:`T1551` It's now possible to create a QinQ interface and a firewall
  assigned to it in one commit
* :vytask:`T1559` URL filtering now uses correct rule database path and works
  again
* :vytask:`T1579` "show log vpn ipsec" command works again
* :vytask:`T1576` "show arp interface <intf>" command works again
* :vytask:`T1605` Fixed regression in L2TP/IPsec server
* :vytask:`T1613` Netflow/sFlow captures IPv6 traffic correctly
* :vytask:`T1616` "renew dhcpv6" command now works from op mode
* :vytask:`T1642` BGP remove-private-as option iBGP vs eBGP check works
  correctly now
* :vytask:`T1540`, :vytask:`T1360`, :vytask:`T1264`, :vytask:`T1623` Multiple
  improvements in name servers and hosts configuration handling

Internals
^^^^^^^^^

``/etc/resolv.conf`` and ``/etc/hosts`` files are now managed by the
*vyos-hostsd* service that listens on a ZMQ socket for update messages.

1.2.2
-----

1.2.2 is a maintenance release made in July 2019.

New features
^^^^^^^^^^^^

* Options for per-interface MSS clamping.
* BGP extended next-hop capability
* Relaxed BGP multipath option
* Internal and external options for "remote-as" (accept any AS as long as it's
  the same to this router or different, respectively)
* "Unnumbered" (interface-based) BGP peers
* BGP no-prepend option
* Additive BGP community option
* OSPFv3 network type option
* Custom arguments for VRRP scripts
* A script for querying values from config files

Resolved issues
^^^^^^^^^^^^^^^

* Linux kernel 4.19.54, including a fix for the TCP SACK vulnerability
* :vytask:`T1371` VRRP health-check scripts now can use arguments
* :vytask:`T1497` DNS server addresses coming from a DHCP server are now
  correctly propagated to resolv.conf
* :vytask:`T1469` Domain-specific name servers in DNS forwarding are now used
  for recursive queries
* :vytask:`T1433` ``run show dhcpv6 server leases`` now display leases correctly
* :vytask:`T1461` Deleting ``firewall options`` node no longer causes errors
* :vytask:`T1458` Correct hostname is sent to remote syslog again
* :vytask:`T1438` Board serial number from DMI is correctly displayed in
  ``show version``
* :vytask:`T1358`, :vytask:`T1355`, :vytask:`T1294` Multiple corrections in
  remote syslog config
* :vytask:`T1255` Fixed missing newline in ``/etc/hosts``
* :vytask:`T1174` ``system domain-name`` is correctly included in
  ``/etc/resolv.conf``
* :vytask:`T1465` Fixed priority inversion in ``interfaces vti vtiX ip``
  settings
* :vytask:`T1446` Fixed errors when installing with RAID1 on UEFI machines
* :vytask:`T1387` Fixed an error on disabling an interfaces that has no address
* :vytask:`T1367` Fixed deleting VLAN interface with non-default MTU
* :vytask:`T1505` vyos.config ``return_effective_values()`` function now
  correctly returns a list rather than a string

1.2.1
-----

VyOS 1.2.1 is a maintenance release made in April 2019.

Resolved issues
^^^^^^^^^^^^^^^

* Package updates: kernel 4.19.32, open-vm-tools 10.3, latest Intel NIC drivers
* :vytask:`T1326` The kernel now includes drivers for various USB serial
  adapters, which allows people to add a serial console to a machine without
  onboard RS232, or connect to something else from the router
* The collection of network card firmware is now much more extensive
* :vytask:`T1271` VRRP now correctly uses a virtual rather than physical MAC
  addresses in the RFC-compliant mode
* :vytask:`T1330` DHCP WPAD URL option works correctly again
* :vytask:`T1312` Many to many NAT rules now can use source/destination and
  translation networks of non-matching size. If 1:1 network bits translation is
  desired, it's now users responsibility to check if prefix length matches.
* :vytask:`T1290` IPv6 network prefix translation is fixed
* :vytask:`T1308` Non-alphanumeric characters such as ``>`` can now be safely
  used in PPPoE passwords
* :vytask:`T1305` ``show | commands`` no longer fails when a config section ends
  with a leaf node such as ``timezone`` in ``show system | commands``
* :vytask:`T1235` ``show | commands`` correctly works in config mode now
* :vytask:`T1298` VTI is now compatible with the DHCP-interface IPsec option
* :vytask:`T1277` ``show dhcp server statistics`` command was broken in latest
  Crux
* :vytask:`T1261` An issue with TFTP server refusing to listen on addresses
  other than loopback was fixed
* :vytask:`T1224` Template issue that might cause UDP broadcast relay fail to
  start is fixed
* :vytask:`T1067` VXLAN value validation is improved
* :vytask:`T1211` Blank hostnames in DHCP updates no longer can crash DNS
  forwarding
* :vytask:`T1322` Correct configuration is now generated for DHCPv6 relays with
  more than one upstream interface
* :vytask:`T1234` ``relay-agents-packets`` option works correctly now
* :vytask:`T1231` Dynamic DNS data is now cleaned on configuration change
* :vytask:`T1282` Remote Syslog can now use a fully qualified domain name
* :vytask:`T1279` ACPI power off works again
* :vytask:`T1247` Negation in WAN load balancing rules works again
* :vytask:`T1218` FRR staticd now starts on boot correctly
* :vytask:`T1296` The installer now correctly detects SD card devices
* :vytask:`T1225` Wireguard peers can be disabled now
* :vytask:`T1217` The issue with Wireguard interfaces impossible to delete
  is fixed
* :vytask:`T1160` Unintended IPv6 access is fixed in SNMP configuration
* :vytask:`T1060` It's now possible to exclude hosts from the transparent
  web proxy
* :vytask:`T484` An issue with rules impossible to delete from the zone-based
  firewall is fixed

Earlier releases
================

See `the wiki <https://wiki.vyos.net/wiki/1.2.0/release_notes>`_.
