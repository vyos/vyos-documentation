1.2.4
=====

1.2.4 is a maintenance release made in December 2019.

Resolved issues
---------------

* :vytask:`T258` Can not configure wan load-balancing on vyos-1.2
* :vytask:`T818` SNMP v3 - remove required engineid from user node
* :vytask:`T1030` Upgrade ddclient from 3.8.2 to 3.9.
  (support Cloudflare API v4)
* :vytask:`T1183` BFD Support via FRR
* :vytask:`T1299` Allow SNMPd to be extended with custom scripts
* :vytask:`T1351` accel-pppoe adding CIDR based IP pool option
* :vytask:`T1391` In route-map set community additive
* :vytask:`T1394` syslog systemd and host_name.py race condition
* :vytask:`T1401` Copying files with the FTP protocol fails if the passwor
  contains special characters
* :vytask:`T1421` OpenVPN client push-route stopped working, needs added quotes
  to fix
* :vytask:`T1430` Add options for custom DHCP client-id and hostname
* :vytask:`T1447` Python subprocess called without import in host_name.py
* :vytask:`T1470` improve output of "show dhcpv6 server leases"
* :vytask:`T1485` Enable 'AdvIntervalOpt' option in for radvd.conf
* :vytask:`T1496` Separate rolling release and LTS kernel builds
* :vytask:`T1560` "set load-balancing wan rule 0" causes segfault and prevent
  load balancing from starting
* :vytask:`T1568` strip-private command improvement for additional masking o
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
* :vytask:`T1726` Update Linux Firmware binaries to a more recen
  version 2019-03-14 -> 2019-10-07
* :vytask:`T1728` Update Linux Kernel to 4.19.79
* :vytask:`T1737` SNMP tab completion missing
* :vytask:`T1738` Copy SNMP configuration from node to node raises exception
* :vytask:`T1740` Broken OSPFv2 virtual-link authentication
* :vytask:`T1742` NHRP unable to commit.
* :vytask:`T1745` dhcp-server commit fails with "DHCP range stop address 
  must be greater or equal to the range start address y!" when static mapping
  has same IP as range stop
* :vytask:`T1749` numeric validator doesn't support multiple ranges
* :vytask:`T1769` Remove complex SNMPv3 Transport Security Model (TSM)
* :vytask:`T1772` <regex> constraints in XML are partially broken
* :vytask:`T1778` Kilobits/Megabits difference in configuration Vyos/FRR
* :vytask:`T1780` Adding ipsec ike closeaction
* :vytask:`T1786` disable-dhcp-nameservers is missed in current host_name.p
  implementation
* :vytask:`T1788` Intel QAT (QuickAssist Technology ) implementation
* :vytask:`T1792` Update WireGuard to Debian release 0.0.20191012-1
* :vytask:`T1800` Update Linux Kernel to v4.19.84
* :vytask:`T1809` Wireless: SSID scan does not work in AP mode
* :vytask:`T1811` Upgrade from 1.1.8: Config file migratio
  failed: module=l2tp
* :vytask:`T1812` DHCP: hostnames of clients not resolving afte
  update v1.2.3 -> 1.2-rolling
* :vytask:`T1819` Reboot kills SNMPv3 configuration
* :vytask:`T1822` Priority inversion wireless interface dhcpv6
* :vytask:`T1825` Improve DHCP configuration error message
* :vytask:`T1836` import-conf-mode-commands in vyos-1x/scripts fails
  to create an xml
* :vytask:`T1839` LLDP shows "VyOS unknown" instead of "VyOS"
* :vytask:`T1841` PPP ipv6-up.d direcotry missing
* :vytask:`T1893` igmp-proxy: Do not allow adding unknown interface
* :vytask:`T1903` Implementation udev predefined interface naming
* :vytask:`T1904` update eth1 and eth2 link files for the vep4600