.. _release-notes:

#############
Release Notes
#############

******************
Version 1.2 - Crux
******************

1.2.6-S1
========

1.2.6-S1 is a security release release made in September 2020.

Resolved issues
---------------

VyOS 1.2.6 release was found to be suspectible to CVE-2020-10995. It's a low-
impact vulnerability in the PowerDNS recursor that allows an attacker to cause
performance degradation via a specially crafted authoritative DNS server reply.

* :vytask:`2899` remote syslog server migration error on update

1.2.6
=====

1.2.6 is a maintenance release made in September 2020.

Resolved issues
---------------

* :vytask:`103` DHCP server prepends shared network name to hostnames
* :vytask:`125` Missing PPPoE interfaces in l2tp configuration
* :vytask:`1194` cronjob is being setup even if not saved
* :vytask:`1205` module pcspkr missing
* :vytask:`1219` Redundant active-active configuration, asymmetric routing and
  conntrack-sync cache
* :vytask:`1220` Show transceiver information from plugin modules, e.g SFP+,
  QSFP
* :vytask:`1221` BGP - Default route injection is not processed by the specific
  route-map
* :vytask:`1241` Remove of policy route throws CLI error
* :vytask:`1291` Under certain conditions the VTI will stay forever down
* :vytask:`1463` Missing command `show ip bgp scan` appears in command
  completion
* :vytask:`1575` `show snmp mib ifmib` crashes with IndexError
* :vytask:`1699` Default net.ipv6.route.max_size 32768 is too low
* :vytask:`1729` PIM (Protocol Independent Multicast) implementation
* :vytask:`1901` Semicolon in values is interpreted as a part of the shell
  command by validators
* :vytask:`1934` Change default hostname when deploy from OVA without params.
* :vytask:`1938` syslog doesn't start automatically
* :vytask:`1949` Multihop IPv6 BFD is unconfigurable
* :vytask:`1953` DDNS service name validation rejects valid service names
* :vytask:`1956` PPPoE server: support PADO-delay
* :vytask:`1973` Allow route-map to match on BGP local preference value
* :vytask:`1974` Allow route-map to set administrative distance
* :vytask:`1982` Increase rotation for atop.acct
* :vytask:`1983` Expose route-map when BGP routes are programmed in to FIB
* :vytask:`1985` pppoe: Enable ipv6 modules without configured ipv6 pools
* :vytask:`2000` strongSwan does not install routes to table 220 in certain
  cases
* :vytask:`2021` OSPFv3 doesn't support decimal area syntax
* :vytask:`2062` Wrong dhcp-server static route subnet bytes
* :vytask:`2091` swanctl.conf file is not generated properly is more than one
  IPsec profile is used
* :vytask:`2131` Improve syslog remote host CLI definition
* :vytask:`2224` Update Linux Kernel to v4.19.114
* :vytask:`2286` IPoE server vulnerability
* :vytask:`2303` Unable to delete the image version that came from OVA
* :vytask:`2305` Add release name to "show version" command
* :vytask:`2311` Statically configured name servers may not take precedence
  over ones from DHCP
* :vytask:`2327` Unable to create syslog server entry with different port
* :vytask:`2332` Backport node option for a syslog server
* :vytask:`2342` Bridge l2tpv3 + ethX errors
* :vytask:`2344` PPPoE server client static IP assignment silently fails
* :vytask:`2385` salt-minion: improve completion helpers
* :vytask:`2389` BGP community-list unknown command
* :vytask:`2398` op-mode "dhcp client leases interface" completion helper
  misses interfaces
* :vytask:`2402` Live ISO should warn when configuring that changes won't
  persist
* :vytask:`2443` NHRP: Add debugging information to syslog
* :vytask:`2448` `monitor protocol bgp` subcommands fail with 'command
  incomplete'
* :vytask:`2458` Update FRR to 7.3.1
* :vytask:`2476` Bond member description change leads to network outage
* :vytask:`2478` login radius: use NAS-IP-Address if defined source address
* :vytask:`2482` Update PowerDNS recursor to 4.3.1 for CVE-2020-10995
* :vytask:`2517` vyos-container: link_filter: No such file or directory
* :vytask:`2526` Wake-On-Lan CLI implementation
* :vytask:`2528` "update dns dynamic" throws FileNotFoundError excepton
* :vytask:`2536` "show log dns forwarding" still refers to dnsmasq
* :vytask:`2538` Update Intel NIC drivers to recent release (preparation for
  Kernel >=5.4)
* :vytask:`2545` Show physical device offloading capabilities for specified
  ethernet interface
* :vytask:`2563` Wrong interface binding for Dell VEP 1445
* :vytask:`2605` SNMP service is not disabled by default
* :vytask:`2625` Provide generic Library for package builds
* :vytask:`2686` FRR: BGP: large-community configuration is not applied
  properly after upgrading FRR to 7.3.x series
* :vytask:`2701` `vpn ipsec pfs enable` doesn't work with IKE groups
* :vytask:`2728` Protocol option ignored for IPSec peers in transport mode
* :vytask:`2734` WireGuard: fwmark CLI definition is inconsistent
* :vytask:`2757` "show system image version" contains additional new-line
  character breaking output
* :vytask:`2797` Update Linux Kernel to v4.19.139
* :vytask:`2822` Update Linux Kernel to v4.19.141
* :vytask:`2829` PPPoE server: mppe setting is implemented as node instead of
  leafNode
* :vytask:`2831` Update Linux Kernel to v4.19.142
* :vytask:`2852` rename dynamic dns interface breaks ddclient.cache permissions
* :vytask:`2853` Intel QAT acceleration does not work

1.2.5
=====

1.2.5 is a maintenance release made in April 2020.

Resolved issues
---------------

* :vytask:`1020` OSPF Stops distributing default route after a while
* :vytask:`1228` pppoe default-route force option not working (Rel 1.2.0-rc11)
* :vytask:`1301` bgp peer-groups don't work when "no-ipv4-unicast" is enabled.
* :vytask:`1341` Adding rate-limiter for pppoe server users
* :vytask:`1376` Incorrect DHCP lease counting
* :vytask:`1392` Large firewall rulesets cause the system to lose configuration
  and crash at startup
* :vytask:`1416` 2 dhcp server run in failover mode can't sync hostname with
  each other
* :vytask:`1452` accel-pppoe - add vendor option to shaper
* :vytask:`1490` BGP configuration (is lost|not applied) when updating 1.1.8 ->
  1.2.1
* :vytask:`1780` Adding ipsec ike closeaction
* :vytask:`1803` Unbind NTP while it's not requested...
* :vytask:`1821` "authentication mode radius" has no effect for PPPoE server
* :vytask:`1827` Increase default gc_thresh
* :vytask:`1828` Missing completion helper for "set system syslog host
  192.0.2.1 facility all protocol"
* :vytask:`1832` radvd adding feature DNSSL branch.example.com example.com to
  existing package
* :vytask:`1837` PPPoE unrecognized option 'replacedefaultroute'
* :vytask:`1851` wireguard - changing the pubkey on an existing peer seems to
  destroy the running config.
* :vytask:`1858` l2tp: Delete depricated outside-nexthop and add gateway-address
* :vytask:`1864` Lower IPSec DPD timeout lower limit from 10s -> 2s
* :vytask:`1879` Extend Dynamic DNS XML definition value help strings and
  validators
* :vytask:`1881` Execute permissions are removed from custom SNMP scripts at
  commit time
* :vytask:`1884` Keeping VRRP transition-script native behaviour and adding
  stop-script
* :vytask:`1891` Router announcements broken on boot
* :vytask:`1900` Enable SNMP for VRRP.
* :vytask:`1902` Add redistribute non main table in bgp
* :vytask:`1909` Incorrect behaviour of static routes with overlapping networks
* :vytask:`1913` "system ipv6 blacklist" command has no effect
* :vytask:`1914` IPv6 multipath hash policy does not apply
* :vytask:`1917` Update WireGuard to Debian release 0.0.20191219-1
* :vytask:`1934` Change default hostname when deploy from OVA without params.
* :vytask:`1935` NIC identification and usage problem in Hyper-V environments
* :vytask:`1936` pppoe-server CLI control features
* :vytask:`1964` SNMP Script-extensions allows names with spaces, but commit
  fails
* :vytask:`1967` BGP parameter "enforce-first-as" does not work anymore
* :vytask:`1970` Correct adding interfaces on boot
* :vytask:`1971` Missing modules in initrd.img for PXE boot
* :vytask:`1998` Update FRR to 7.3
* :vytask:`2001` Error when router reboot
* :vytask:`2032` Monitor bandwidth bits
* :vytask:`2059` Set source-validation on bond vif don't work
* :vytask:`2066` PPPoE interface can be created multiple times - last wins
* :vytask:`2069` PPPoE-client does not works with service-name option
* :vytask:`2077` ISO build from crux branch is failing
* :vytask:`2079` Update Linux Kernel to v4.19.106
* :vytask:`2087` Add maxfail 0 option to pppoe configuration.
* :vytask:`2100` BGP route adverisement wih checks rib
* :vytask:`2120` "reset vpn ipsec-peer" doesn't work with named peers
* :vytask:`2197` Cant add vif-s interface into a bridge
* :vytask:`2228` WireGuard does not allow ports < 1024 to be used
* :vytask:`2252` HTTP API add system image can return '504 Gateway Time-out'
* :vytask:`2272` Set system flow-accounting disable-imt has syntax error
* :vytask:`2276` PPPoE server vulnerability


1.2.4
=====

1.2.4 is a maintenance release made in December 2019.

Resolved issues
---------------

* :vytask:`T258` Can not configure wan load-balancing on vyos-1.2
* :vytask:`T818` SNMP v3 - remove required engineid from user node
* :vytask:`T1030` Upgrade ddclient from 3.8.2 to 3.9.0 (support Cloudflare
  API v4)
* :vytask:`T1183` BFD Support via FRR
* :vytask:`T1299` Allow SNMPd to be extended with custom scripts
* :vytask:`T1351` accel-pppoe adding CIDR based IP pool option
* :vytask:`T1391` In route-map set community additive
* :vytask:`T1394` syslog systemd and host_name.py race condition
* :vytask:`T1401` Copying files with the FTP protocol fails if the password
  contains special characters
* :vytask:`T1421` OpenVPN client push-route stopped working, needs added quotes
  to fix
* :vytask:`T1430` Add options for custom DHCP client-id and hostname
* :vytask:`T1447` Python subprocess called without import in host_name.py
* :vytask:`T1470` improve output of "show dhcpv6 server leases"
* :vytask:`T1485` Enable 'AdvIntervalOpt' option in for radvd.conf
* :vytask:`T1496` Separate rolling release and LTS kernel builds
* :vytask:`T1560` "set load-balancing wan rule 0" causes segfault and prevents
  load balancing from starting
* :vytask:`T1568` strip-private command improvement for additional masking of
  IPv6 and MAC address
* :vytask:`T1578` completion offers "show table", but show table does not exist
* :vytask:`T1593` Support ip6gre
* :vytask:`T1597` /usr/sbin/rsyslogd after deleting "system syslog"
* :vytask:`T1638` vyos-hostsd not setting system domain name
* :vytask:`T1678` hostfile-update missing line feed
* :vytask:`T1694` NTPd: Do not listen on all interfaces by default
* :vytask:`T1701` Delete domain-name and domain-search won't work
* :vytask:`T1705` High CPU usage by bgpd when snmp is active
* :vytask:`T1707` DHCP static mapping and exclude address not working
* :vytask:`T1708` Update Rolling Release Kernel to 4.19.76
* :vytask:`T1709` Update WireGuard to 0.0.20190913
* :vytask:`T1716` Update Intel NIC drivers to recent versions
* :vytask:`T1726` Update Linux Firmware binaries to a more recent version
  2019-03-14 -> 2019-10-07
* :vytask:`T1728` Update Linux Kernel to 4.19.79
* :vytask:`T1737` SNMP tab completion missing
* :vytask:`T1738` Copy SNMP configuration from node to node raises exception
* :vytask:`T1740` Broken OSPFv2 virtual-link authentication
* :vytask:`T1742` NHRP unable to commit.
* :vytask:`T1745` dhcp-server commit fails with "DHCP range stop address x must
  be greater or equal to the range start address y!" when static mapping has
  same IP as range stop
* :vytask:`T1749` numeric validator doesn't support multiple ranges
* :vytask:`T1769` Remove complex SNMPv3 Transport Security Model (TSM)
* :vytask:`T1772` <regex> constraints in XML are partially broken
* :vytask:`T1778` Kilobits/Megabits difference in configuration Vyos/FRR
* :vytask:`T1780` Adding ipsec ike closeaction
* :vytask:`T1786` disable-dhcp-nameservers is missed in current host_name.py
  implementation
* :vytask:`T1788` Intel QAT (QuickAssist Technology ) implementation
* :vytask:`T1792` Update WireGuard to Debian release 0.0.20191012-1
* :vytask:`T1800` Update Linux Kernel to v4.19.84
* :vytask:`T1809` Wireless: SSID scan does not work in AP mode
* :vytask:`T1811` Upgrade from 1.1.8: Config file migration failed: module=l2tp
* :vytask:`T1812` DHCP: hostnames of clients not resolving after update v1.2.3
  -> 1.2-rolling
* :vytask:`T1819` Reboot kills SNMPv3 configuration
* :vytask:`T1822` Priority inversion wireless interface dhcpv6
* :vytask:`T1825` Improve DHCP configuration error message
* :vytask:`T1836` import-conf-mode-commands in vyos-1x/scripts fails to create
  an XML
* :vytask:`T1839` LLDP shows "VyOS unknown" instead of "VyOS"
* :vytask:`T1841` PPP ipv6-up.d direcotry missing
* :vytask:`T1893` igmp-proxy: Do not allow adding unknown interface
* :vytask:`T1903` Implementation udev predefined interface naming
* :vytask:`T1904` update eth1 and eth2 link files for the vep4600


1.2.3
=====

1.2.3 is a maintenance and feature backport release made in September 2019.

New features
------------

* HTTP API
* :vytask:`T1524` "set service dns forwarding allow-from <IPv4 net|IPv6 net>"
  option for limiting queries to specific client networks
* :vytask:`T1503` Functions for checking if a commit is in progress
* :vytask:`T1543` "set system contig-mangement commit-archive source-address"
  option
* :vytask:`T1554` Intel NIC drivers now support receive side scaling and
  multiqueue

Resolved issues
---------------

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
---------

``/etc/resolv.conf`` and ``/etc/hosts`` files are now managed by the
*vyos-hostsd* service that listens on a ZMQ socket for update messages.

1.2.2
=====

1.2.2 is a maintenance release made in July 2019.

New features
------------

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
---------------

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
=====

VyOS 1.2.1 is a maintenance release made in April 2019.

Resolved issues
---------------

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

Release notes for legacy versions (1.1.x, 1.0.x) can be found in the
`archived wiki <https://web.archive.org/web/20200212180711/https://wiki.vyos.net/wiki/Category:Release_notes>`_.
