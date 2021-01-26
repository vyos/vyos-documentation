1.2.5
=====

1.2.5 is a maintenance release made in April 2020.

Resolved issues
---------------

* :vytask:`T1020` OSPF Stops distributing default route after a while
* :vytask:`T1228` pppoe default-route force option not working (Rel 1.2.0-rc11)
* :vytask:`T1301` bgp peer-groups don't work when "no-ipv4-unicast" is enabled.
* :vytask:`T1341` Adding rate-limiter for pppoe server users
* :vytask:`T1376` Incorrect DHCP lease counting
* :vytask:`T1392` Large firewall rulesets cause the system to lose configuration
  and crash at startup
* :vytask:`T1416` 2 dhcp server run in failover mode can't sync hostname with
  each other
* :vytask:`T1452` accel-pppoe - add vendor option to shaper
* :vytask:`T1490` BGP configuration (is lost|not applied) when updating
  1.1.8 -> 1.2.1
* :vytask:`T1780` Adding ipsec ike closeaction
* :vytask:`T1803` Unbind NTP while it's not requested...
* :vytask:`T1821` "authentication mode radius" has no effect for PPPoE server
* :vytask:`T1827` Increase default gc_thresh
* :vytask:`T1828` Missing completion helper for "set system syslog host
  192.0.2.1 facility all protocol"
* :vytask:`T1832` radvd adding feature DNSSL branch.example.com example.com to
  existing package
* :vytask:`T1837` PPPoE unrecognized option 'replacedefaultroute'
* :vytask:`T1851` wireguard - changing the pubkey on an existing peer seems to
  destroy the running config.
* :vytask:`T1858` l2tp: Delete depricated outside-nexthop and add gateway-address
* :vytask:`T1864` Lower IPSec DPD timeout lower limit from 10s -> 2s
* :vytask:`T1879` Extend Dynamic DNS XML definition value help strings and
  validators
* :vytask:`T1881` Execute permissions are removed from custom SNMP scripts at
  commit time
* :vytask:`T1884` Keeping VRRP transition-script native behaviour and adding
  stop-script
* :vytask:`T1891` Router announcements broken on boot
* :vytask:`T1900` Enable SNMP for VRRP.
* :vytask:`T1902` Add redistribute non main table in bgp
* :vytask:`T1909` Incorrect behaviour of static routes with overlapping networks
* :vytask:`T1913` "system ipv6 blacklist" command has no effect
* :vytask:`T1914` IPv6 multipath hash policy does not apply
* :vytask:`T1917` Update WireGuard to Debian release 0.0.20191219-1
* :vytask:`T1934` Change default hostname when deploy from OVA without params.
* :vytask:`T1935` NIC identification and usage problem in Hyper-V environments
* :vytask:`T1936` pppoe-server CLI control features
* :vytask:`T1964` SNMP Script-extensions allows names with spaces, but commit
  fails
* :vytask:`T1967` BGP parameter "enforce-first-as" does not work anymore
* :vytask:`T1970` Correct adding interfaces on boot
* :vytask:`T1971` Missing modules in initrd.img for PXE boot
* :vytask:`T1998` Update FRR to 7.3
* :vytask:`T2001` Error when router reboot
* :vytask:`T2032` Monitor bandwidth bits
* :vytask:`T2059` Set source-validation on bond vif don't work
* :vytask:`T2066` PPPoE interface can be created multiple times - last wins
* :vytask:`T2069` PPPoE-client does not works with service-name option
* :vytask:`T2077` ISO build from crux branch is failing
* :vytask:`T2079` Update Linux Kernel to v4.19.106
* :vytask:`T2087` Add maxfail 0 option to pppoe configuration.
* :vytask:`T2100` BGP route adverisement wih checks rib
* :vytask:`T2120` "reset vpn ipsec-peer" doesn't work with named peers
* :vytask:`T2197` Cant add vif-s interface into a bridge
* :vytask:`T2228` WireGuard does not allow ports < 1024 to be used
* :vytask:`T2252` HTTP API add system image can return '504 Gateway Time-out'
* :vytask:`T2272` Set system flow-accounting disable-imt has syntax error
* :vytask:`T2276` PPPoE server vulnerability