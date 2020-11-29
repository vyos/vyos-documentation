.. _releasenotes:

Release notes
#############

1.2 (Crux)
==========

1.2.6-S1
--------

1.2.6-S1 is a security release release made in September 2020.

Resolved issues
^^^^^^^^^^^^^^^

VyOS 1.2.6 release was found to be suspectible to CVE-2020-10995. It's a low-
impact vulnerability in the PowerDNS recursor that allows an attacker to cause
performance degradation via a specially crafted authoritative DNS server reply.

* `2899 <https://phabricator.vyos.net/T2899>`_ remote syslog server migration error on update

1.2.6
-----

1.2.6 is a maintenance release made in September 2019.

Resolved issues
^^^^^^^^^^^^^^^

* `103 <https://phabricator.vyos.net/T103>`_ DHCP server prepends shared network name to hostnames
* `125 <https://phabricator.vyos.net/T125>`_ Missing PPPoE interfaces in l2tp configuration
* `1194 <https://phabricator.vyos.net/T1194>`_ cronjob is being setup even if not saved
* `1205 <https://phabricator.vyos.net/T1205>`_ module pcspkr missing
* `1219 <https://phabricator.vyos.net/T1219>`_ Redundant active-active configuration, asymmetric routing and conntrack-sync cache
* `1220 <https://phabricator.vyos.net/T1220>`_ Show transceiver information from plugin modules, e.g SFP+, QSFP
* `1221 <https://phabricator.vyos.net/T1221>`_ BGP - Default route injection is not processed by the specific route-map
* `1241 <https://phabricator.vyos.net/T1241>`_ Remove of policy route throws CLI error
* `1291 <https://phabricator.vyos.net/T1291>`_ Under certain conditions the VTI will stay forever down
* `1463 <https://phabricator.vyos.net/T1463>`_ Missing command `show ip bgp scan` appears in command completion
* `1575 <https://phabricator.vyos.net/T1575>`_ `show snmp mib ifmib` crashes with IndexError
* `1699 <https://phabricator.vyos.net/T1699>`_ Default net.ipv6.route.max_size 32768 is too low
* `1729 <https://phabricator.vyos.net/T1729>`_ PIM (Protocol Independent Multicast) implementation
* `1901 <https://phabricator.vyos.net/T1901>`_ Semicolon in values is interpreted as a part of the shell command by validators
* `1934 <https://phabricator.vyos.net/T1934>`_ Change default hostname when deploy from OVA without params.
* `1938 <https://phabricator.vyos.net/T1938>`_ syslog doesn't start automatically
* `1949 <https://phabricator.vyos.net/T1949>`_ Multihop IPv6 BFD is unconfigurable
* `1953 <https://phabricator.vyos.net/T1953>`_ DDNS service name validation rejects valid service names
* `1956 <https://phabricator.vyos.net/T1956>`_ PPPoE server: support PADO-delay
* `1973 <https://phabricator.vyos.net/T1973>`_ Allow route-map to match on BGP local preference value
* `1974 <https://phabricator.vyos.net/T1974>`_ Allow route-map to set administrative distance
* `1982 <https://phabricator.vyos.net/T1982>`_ Increase rotation for atop.acct
* `1983 <https://phabricator.vyos.net/T1983>`_ Expose route-map when BGP routes are programmed in to FIB
* `1985 <https://phabricator.vyos.net/T1985>`_ pppoe: Enable ipv6 modules without configured ipv6 pools
* `2000 <https://phabricator.vyos.net/T2000>`_ strongSwan does not install routes to table 220 in certain cases
* `2021 <https://phabricator.vyos.net/T2021>`_ OSPFv3 doesn't support decimal area syntax
* `2062 <https://phabricator.vyos.net/T2062>`_ Wrong dhcp-server static route subnet bytes
* `2091 <https://phabricator.vyos.net/T2091>`_ swanctl.conf file is not generated properly is more than one IPsec profile is used
* `2131 <https://phabricator.vyos.net/T2131>`_ Improve syslog remote host CLI definition
* `2224 <https://phabricator.vyos.net/T2224>`_ Update Linux Kernel to v4.19.114
* `2286 <https://phabricator.vyos.net/T2286>`_ IPoE server vulnerability
* `2303 <https://phabricator.vyos.net/T2303>`_ Unable to delete the image version that came from OVA
* `2305 <https://phabricator.vyos.net/T2305>`_ Add release name to "show version" command
* `2311 <https://phabricator.vyos.net/T2311>`_ Statically configured name servers may not take precedence over ones from DHCP
* `2327 <https://phabricator.vyos.net/T2327>`_ Unable to create syslog server entry with different port
* `2332 <https://phabricator.vyos.net/T2332>`_ Backport node option for a syslog server
* `2342 <https://phabricator.vyos.net/T2342>`_ Bridge l2tpv3 + ethX errors
* `2344 <https://phabricator.vyos.net/T2344>`_ PPPoE server client static IP assignment silently fails
* `2385 <https://phabricator.vyos.net/T2385>`_ salt-minion: improve completion helpers
* `2389 <https://phabricator.vyos.net/T2389>`_ BGP community-list unknown command
* `2398 <https://phabricator.vyos.net/T2398>`_ op-mode "dhcp client leases interface" completion helper misses interfaces
* `2402 <https://phabricator.vyos.net/T2402>`_ Live ISO should warn when configuring that changes won't persist
* `2443 <https://phabricator.vyos.net/T2443>`_ NHRP: Add debugging information to syslog
* `2448 <https://phabricator.vyos.net/T2448>`_ `monitor protocol bgp` subcommands fail with 'command incomplete'
* `2458 <https://phabricator.vyos.net/T2458>`_ Update FRR to 7.3.1
* `2476 <https://phabricator.vyos.net/T2476>`_ Bond member description change leads to network outage
* `2478 <https://phabricator.vyos.net/T2478>`_ login radius: use NAS-IP-Address if defined source address
* `2482 <https://phabricator.vyos.net/T2482>`_ Update PowerDNS recursor to 4.3.1 for CVE-2020-10995
* `2517 <https://phabricator.vyos.net/T2517>`_ vyos-container: link_filter: No such file or directory
* `2526 <https://phabricator.vyos.net/T2526>`_ Wake-On-Lan CLI implementation
* `2528 <https://phabricator.vyos.net/T2528>`_ "update dns dynamic" throws FileNotFoundError excepton
* `2536 <https://phabricator.vyos.net/T2536>`_ "show log dns forwarding" still refers to dnsmasq
* `2538 <https://phabricator.vyos.net/T2538>`_ Update Intel NIC drivers to recent release (preparation for Kernel >=5.4)
* `2545 <https://phabricator.vyos.net/T2545>`_ Show physical device offloading capabilities for specified ethernet interface
* `2563 <https://phabricator.vyos.net/T2563>`_ Wrong interface binding for Dell VEP 1445
* `2605 <https://phabricator.vyos.net/T2605>`_ SNMP service is not disabled by default
* `2625 <https://phabricator.vyos.net/T2625>`_ Provide generic Library for package builds
* `2686 <https://phabricator.vyos.net/T2686>`_ FRR: BGP: large-community configuration is not applied properly after upgrading FRR to 7.3.x series
* `2701 <https://phabricator.vyos.net/T2701>`_ `vpn ipsec pfs enable` doesn't work with IKE groups
* `2728 <https://phabricator.vyos.net/T2728>`_ Protocol option ignored for IPSec peers in transport mode
* `2734 <https://phabricator.vyos.net/T2734>`_ WireGuard: fwmark CLI definition is inconsistent
* `2757 <https://phabricator.vyos.net/T2757>`_ "show system image version" contains additional new-line character breaking output
* `2797 <https://phabricator.vyos.net/T2797>`_ Update Linux Kernel to v4.19.139
* `2822 <https://phabricator.vyos.net/T2822>`_ Update Linux Kernel to v4.19.141
* `2829 <https://phabricator.vyos.net/T2829>`_ PPPoE server: mppe setting is implemented as node instead of leafNode
* `2831 <https://phabricator.vyos.net/T2831>`_ Update Linux Kernel to v4.19.142
* `2852 <https://phabricator.vyos.net/T2852>`_ rename dynamic dns interface breaks ddclient.cache permissions
* `2853 <https://phabricator.vyos.net/T2853>`_ Intel QAT acceleration does not work


1.2.5
-----

1.2.5 is a maintenance release made in April 2019.

Resolved issues
^^^^^^^^^^^^^^^

* `1020 <https://phabricator.vyos.net/T1020>`_ OSPF Stops distributing default route after a while
* `1228 <https://phabricator.vyos.net/T1228>`_ pppoe default-route force option not working (Rel 1.2.0-rc11)
* `1301 <https://phabricator.vyos.net/T1301>`_ bgp peer-groups don't work when "no-ipv4-unicast" is enabled.
* `1341 <https://phabricator.vyos.net/T1341>`_ Adding rate-limiter for pppoe server users
* `1376 <https://phabricator.vyos.net/T1376>`_ Incorrect DHCP lease counting
* `1392 <https://phabricator.vyos.net/T1392>`_ Large firewall rulesets cause the system to lose configuration and crash at startup
* `1416 <https://phabricator.vyos.net/T1416>`_ 2 dhcp server run in failover mode can't sync hostname with each other
* `1452 <https://phabricator.vyos.net/T1452>`_ accel-pppoe - add vendor option to shaper
* `1490 <https://phabricator.vyos.net/T1490>`_ BGP configuration (is lost|not applied) when updating 1.1.8 -> 1.2.1
* `1780 <https://phabricator.vyos.net/T1780>`_ Adding ipsec ike closeaction
* `1803 <https://phabricator.vyos.net/T1803>`_ Unbind NTP while it's not requested...
* `1821 <https://phabricator.vyos.net/T1821>`_ "authentication mode radius" has no effect for PPPoE server
* `1827 <https://phabricator.vyos.net/T1827>`_ Increase default gc_thresh
* `1828 <https://phabricator.vyos.net/T1828>`_ Missing completion helper for "set system syslog host 192.0.2.1 facility all protocol"
* `1832 <https://phabricator.vyos.net/T1832>`_ radvd adding feature DNSSL branch.example.com example.com to existing package
* `1837 <https://phabricator.vyos.net/T1837>`_ PPPoE unrecognized option 'replacedefaultroute'
* `1851 <https://phabricator.vyos.net/T1851>`_ wireguard - changing the pubkey on an existing peer seems to destroy the running config.
* `1858 <https://phabricator.vyos.net/T1858>`_ l2tp: Delete depricated outside-nexthop and add gateway-address
* `1864 <https://phabricator.vyos.net/T1864>`_ Lower IPSec DPD timeout lower limit from 10s -> 2s
* `1879 <https://phabricator.vyos.net/T1879>`_ Extend Dynamic DNS XML definition value help strings and validators
* `1881 <https://phabricator.vyos.net/T1881>`_ Execute permissions are removed from custom SNMP scripts at commit time
* `1884 <https://phabricator.vyos.net/T1884>`_ Keeping VRRP transition-script native behaviour and adding stop-script
* `1891 <https://phabricator.vyos.net/T1891>`_ Router announcements broken on boot
* `1900 <https://phabricator.vyos.net/T1900>`_ Enable SNMP for VRRP.
* `1902 <https://phabricator.vyos.net/T1902>`_ Add redistribute non main table in bgp
* `1909 <https://phabricator.vyos.net/T1909>`_ Incorrect behaviour of static routes with overlapping networks
* `1913 <https://phabricator.vyos.net/T1913>`_ "system ipv6 blacklist" command has no effect
* `1914 <https://phabricator.vyos.net/T1914>`_ IPv6 multipath hash policy does not apply
* `1917 <https://phabricator.vyos.net/T1917>`_ Update WireGuard to Debian release 0.0.20191219-1
* `1934 <https://phabricator.vyos.net/T1934>`_ Change default hostname when deploy from OVA without params.
* `1935 <https://phabricator.vyos.net/T1935>`_ NIC identification and usage problem in Hyper-V environments
* `1936 <https://phabricator.vyos.net/T1936>`_ pppoe-server CLI control features
* `1964 <https://phabricator.vyos.net/T1964>`_ SNMP Script-extensions allows names with spaces, but commit fails
* `1967 <https://phabricator.vyos.net/T1967>`_ BGP parameter "enforce-first-as" does not work anymore
* `1970 <https://phabricator.vyos.net/T1970>`_ Correct adding interfaces on boot
* `1971 <https://phabricator.vyos.net/T1971>`_ Missing modules in initrd.img for PXE boot
* `1998 <https://phabricator.vyos.net/T1998>`_ Update FRR to 7.3
* `2001 <https://phabricator.vyos.net/T2001>`_ Error when router reboot
* `2032 <https://phabricator.vyos.net/T2032>`_ Monitor bandwidth bits
* `2059 <https://phabricator.vyos.net/T2059>`_ Set source-validation on bond vif don't work
* `2066 <https://phabricator.vyos.net/T2066>`_ PPPoE interface can be created multiple times - last wins
* `2069 <https://phabricator.vyos.net/T2069>`_ PPPoE-client does not works with service-name option
* `2077 <https://phabricator.vyos.net/T2077>`_ ISO build from crux branch is failing
* `2079 <https://phabricator.vyos.net/T2079>`_ Update Linux Kernel to v4.19.106
* `2087 <https://phabricator.vyos.net/T2087>`_ Add maxfail 0 option to pppoe configuration.
* `2100 <https://phabricator.vyos.net/T2100>`_ BGP route adverisement wih checks rib
* `2120 <https://phabricator.vyos.net/T2120>`_ "reset vpn ipsec-peer" doesn't work with named peers
* `2197 <https://phabricator.vyos.net/T2197>`_ Cant add vif-s interface into a bridge
* `2228 <https://phabricator.vyos.net/T2228>`_ WireGuard does not allow ports < 1024 to be used
* `2252 <https://phabricator.vyos.net/T2252>`_ HTTP API add system image can return '504 Gateway Time-out'
* `2272 <https://phabricator.vyos.net/T2272>`_ Set system flow-accounting disable-imt has syntax error
* `2276 <https://phabricator.vyos.net/T2276>`_ PPPoE server vulnerability


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
* `T1836 <https://phabricator.vyos.net/T1836>`_ import-conf-mode-commands in vyos-1x/scripts fails to create an xml
* `T1839 <https://phabricator.vyos.net/T1839>`_ LLDP shows "VyOS unknown" instead of "VyOS"
* `T1841 <https://phabricator.vyos.net/T1841>`_ PPP ipv6-up.d direcotry missing
* `T1893 <https://phabricator.vyos.net/T1893>`_ igmp-proxy: Do not allow adding unknown interface
* `T1904 <https://phabricator.vyos.net/T1904>`_ update eth1 and eth2 link files for the vep4600


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
