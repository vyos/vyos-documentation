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