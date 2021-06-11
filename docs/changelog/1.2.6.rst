1.2.6-S1
========

1.2.6-S1 is a security release release made in September 2020.

Resolved issues
---------------

VyOS 1.2.6 release was found to be suspectible to CVE-2020-10995. It's a low-
impact vulnerability in the PowerDNS recursor that allows an attacker to cause
performance degradation via a specially crafted authoritative DNS server reply.

* :vytask:`T2899` remote syslog server migration error on update

1.2.6
=====

1.2.6 is a maintenance release made in September 2020.

.. _resovled issues 1.2.6:

Resolved issues
---------------

* :vytask:`T103` DHCP server prepends shared network name to hostnames
* :vytask:`T125` Missing PPPoE interfaces in l2tp configuration
* :vytask:`T1194` cronjob is being setup even if not saved
* :vytask:`T1205` module pcspkr missing
* :vytask:`T1219` Redundant active-active configuration, asymmetric routing and
  conntrack-sync cache
* :vytask:`T1220` Show transceiver information from plugin modules, e.g SFP+,
  QSFP
* :vytask:`T1221` BGP - Default route injection is not processed by the specific
  route-map
* :vytask:`T1241` Remove of policy route throws CLI error
* :vytask:`T1291` Under certain conditions the VTI will stay forever down
* :vytask:`T1463` Missing command `show ip bgp scan` appears in command
  completion
* :vytask:`T1575` `show snmp mib ifmib` crashes with IndexError
* :vytask:`T1699` Default net.ipv6.route.max_size 32768 is too low
* :vytask:`T1729` PIM (Protocol Independent Multicast) implementation
* :vytask:`T1901` Semicolon in values is interpreted as a part of the shell
  command by validators
* :vytask:`T1934` Change default hostname when deploy from OVA without params.
* :vytask:`T1938` syslog doesn't start automatically
* :vytask:`T1949` Multihop IPv6 BFD is unconfigurable
* :vytask:`T1953` DDNS service name validation rejects valid service names
* :vytask:`T1956` PPPoE server: support PADO-delay
* :vytask:`T1973` Allow route-map to match on BGP local preference value
* :vytask:`T1974` Allow route-map to set administrative distance
* :vytask:`T1982` Increase rotation for atop.acct
* :vytask:`T1983` Expose route-map when BGP routes are programmed in to FIB
* :vytask:`T1985` pppoe: Enable ipv6 modules without configured ipv6 pools
* :vytask:`T2000` strongSwan does not install routes to table 220 in certain
  cases
* :vytask:`T2021` OSPFv3 doesn't support decimal area syntax
* :vytask:`T2062` Wrong dhcp-server static route subnet bytes
* :vytask:`T2091` swanctl.conf file is not generated properly is more than one
  IPsec profile is used
* :vytask:`T2131` Improve syslog remote host CLI definition
* :vytask:`T2224` Update Linux Kernel to v4.19.114
* :vytask:`T2286` IPoE server vulnerability
* :vytask:`T2303` Unable to delete the image version that came from OVA
* :vytask:`T2305` Add release name to "show version" command
* :vytask:`T2311` Statically configured name servers may not take precedence
  over ones from DHCP
* :vytask:`T2327` Unable to create syslog server entry with different port
* :vytask:`T2332` Backport node option for a syslog server
* :vytask:`T2342` Bridge l2tpv3 + ethX errors
* :vytask:`T2344` PPPoE server client static IP assignment silently fails
* :vytask:`T2385` salt-minion: improve completion helpers
* :vytask:`T2389` BGP community-list unknown command
* :vytask:`T2398` op-mode "dhcp client leases interface" completion helper
  misses interfaces
* :vytask:`T2402` Live ISO should warn when configuring that changes won't
  persist
* :vytask:`T2443` NHRP: Add debugging information to syslog
* :vytask:`T2448` `monitor protocol bgp` subcommands fail with 'command
  incomplete'
* :vytask:`T2458` Update FRR to 7.3.1
* :vytask:`T2476` Bond member description change leads to network outage
* :vytask:`T2478` login radius: use NAS-IP-Address if defined source address
* :vytask:`T2482` Update PowerDNS recursor to 4.3.1 for CVE-2020-10995
* :vytask:`T2517` vyos-container: link_filter: No such file or directory
* :vytask:`T2526` Wake-On-Lan CLI implementation
* :vytask:`T2528` "update dns dynamic" throws FileNotFoundError excepton
* :vytask:`T2536` "show log dns forwarding" still refers to dnsmasq
* :vytask:`T2538` Update Intel NIC drivers to recent release (preparation for
  Kernel >=5.4)
* :vytask:`T2545` Show physical device offloading capabilities for specified
  ethernet interface
* :vytask:`T2563` Wrong interface binding for Dell VEP 1445
* :vytask:`T2605` SNMP service is not disabled by default
* :vytask:`T2625` Provide generic Library for package builds
* :vytask:`T2686` FRR: BGP: large-community configuration is not applied
  properly after upgrading FRR to 7.3.x series
* :vytask:`T2701` `vpn ipsec pfs enable` doesn't work with IKE groups
* :vytask:`T2728` Protocol option ignored for IPSec peers in transport mode
* :vytask:`T2734` WireGuard: fwmark CLI definition is inconsistent
* :vytask:`T2757` "show system image version" contains additional new-line
  character breaking output
* :vytask:`T2797` Update Linux Kernel to v4.19.139
* :vytask:`T2822` Update Linux Kernel to v4.19.141
* :vytask:`T2829` PPPoE server: mppe setting is implemented as node instead of
  leafNode
* :vytask:`T2831` Update Linux Kernel to v4.19.142
* :vytask:`T2852` rename dynamic dns interface breaks ddclient.cache permissions
* :vytask:`T2853` Intel QAT acceleration does not work