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