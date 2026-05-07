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