.. _testing:

#######
Testing
#######

One of the major advantages introduced in VyOS 1.3 is an automated test
framework. When assembling an ISO image multiple things can go wrong badly and
publishing a faulty ISO makes no sense. The user is disappointed by the quality
of the image and the developers get flodded with bug reports over and over
again.

As the VyOS documentation is not only for users but also for the developers -
and we keep no secret documentation - this section describes how the automated
testing works.

Jenkins CI
==========

Our `VyOS CI`_ system is based on Jenkins and builds all our required packages
for VyOS 1.2 to 1.4. In addition to the package build, there is the vyos-build
Job which builds and tests the VyOS ISO image which is published after a
successful test drive.

We differentiate in two independent tests, which are both run in parallel by
two separate QEmu instances which are launched via ``make test`` and ``make
testc`` from within the vyos-build_ repository.

Smoketests
==========

Smoketests executes predefined VyOS CLI commands and checks if the desired
daemon/service configuration is rendert - that is how to put it "short".

When and ISO image is assembled by the `VyOS CI`_, the ``BUILD_SMOKETEST``
parameter is enabled by default, which will extend the ISO configuration line
with the following packages:

.. code-block:: python

  def CUSTOM_PACKAGES = ''
    if (params.BUILD_SMOKETESTS)
      CUSTOM_PACKAGES = '--custom-package vyos-1x-smoketest'

So if you plan to build your own custom ISO image and want to make use of our
smoketests, ensure that you have the `vyos-1x-smoketest` package installed.

The ``make test`` command from the vyos-build_ repository will launch a new
QEmu instance and the ISO image is first installed to the virtual harddisk.

After its first boot into the newly installed system the main Smoketest script
is executed, it can be found here: `/usr/bin/vyos-smoketest`

The script only searches for executable "test-cases" under
``/usr/libexec/vyos/tests/smoke/cli/`` and executes them one by one.

.. note:: As Smoketests will alter the system configuration and you are logged
   in remote you may loose your connection to the system.

Manual Smoketest Run
--------------------

On the other hand - as each test is contain in its own file - one can always
execute a single Smoketest by hand by simply running the Python test scripts.

Example:

.. code-block:: none

  vyos@vyos:~$ /usr/libexec/vyos/tests/smoke/cli/test_protocols_bgp.py
  test_bgp_01_simple (__main__.TestProtocolsBGP) ... ok
  test_bgp_02_neighbors (__main__.TestProtocolsBGP) ... ok
  test_bgp_03_peer_groups (__main__.TestProtocolsBGP) ... ok
  test_bgp_04_afi_ipv4 (__main__.TestProtocolsBGP) ... ok
  test_bgp_05_afi_ipv6 (__main__.TestProtocolsBGP) ... ok
  test_bgp_06_listen_range (__main__.TestProtocolsBGP) ... ok
  test_bgp_07_l2vpn_evpn (__main__.TestProtocolsBGP) ... ok
  test_bgp_08_zebra_route_map (__main__.TestProtocolsBGP) ... ok
  test_bgp_09_distance_and_flowspec (__main__.TestProtocolsBGP) ... ok
  test_bgp_10_vrf_simple (__main__.TestProtocolsBGP) ... ok
  test_bgp_11_confederation (__main__.TestProtocolsBGP) ... ok
  test_bgp_12_v6_link_local (__main__.TestProtocolsBGP) ... ok
  test_bgp_13_solo (__main__.TestProtocolsBGP) ... ok

  ----------------------------------------------------------------------
  Ran 13 tests in 348.191s

  OK

Interface based tests
---------------------

Our smoketests not only test daemons and serives, but also check if what we
configure for an interface works. Thus there is a common base classed named:
``base_interfaces_test.py`` which holds all the common code that an interface
supports and is tested.

Those common tests consists out of:

* Add one or more IP addresses
* DHCP client and DHCPv6 prefix delegation
* MTU size
* IP and IPv6 options
* Port description
* Port disable
* VLANs (QinQ and regular 802.1q)
* ...

.. note:: When you are working on interface configuration and you also want to
   test if the Smoketests pass you would normally loose the remote SSH connection
   to your :abbr:`DUT (Device Under Test)`. To handle this issue, some of the
   interface based tests can be called with an environment variable beforehand
   to limit the number of interfaces used in the test. By default all interface
   e.g. all Ethernet interfaces are used.

.. code-block:: none

  vyos@vyos:~$ TEST_ETH="eth1 eth2" /usr/libexec/vyos/tests/smoke/cli/test_interfaces_bonding.py
  test_add_multiple_ip_addresses (__main__.BondingInterfaceTest) ... ok
  test_add_single_ip_address (__main__.BondingInterfaceTest) ... ok
  test_bonding_hash_policy (__main__.BondingInterfaceTest) ... ok
  test_bonding_lacp_rate (__main__.BondingInterfaceTest) ... ok
  test_bonding_min_links (__main__.BondingInterfaceTest) ... ok
  test_bonding_remove_member (__main__.BondingInterfaceTest) ... ok
  test_dhcpv6_client_options (__main__.BondingInterfaceTest) ... ok
  test_dhcpv6pd_auto_sla_id (__main__.BondingInterfaceTest) ... ok
  test_dhcpv6pd_manual_sla_id (__main__.BondingInterfaceTest) ... ok
  test_interface_description (__main__.BondingInterfaceTest) ... ok
  test_interface_disable (__main__.BondingInterfaceTest) ... ok
  test_interface_ip_options (__main__.BondingInterfaceTest) ... ok
  test_interface_ipv6_options (__main__.BondingInterfaceTest) ... ok
  test_interface_mtu (__main__.BondingInterfaceTest) ... ok
  test_ipv6_link_local_address (__main__.BondingInterfaceTest) ... ok
  test_mtu_1200_no_ipv6_interface (__main__.BondingInterfaceTest) ... ok
  test_span_mirror (__main__.BondingInterfaceTest) ... ok
  test_vif_8021q_interfaces (__main__.BondingInterfaceTest) ... ok
  test_vif_8021q_lower_up_down (__main__.BondingInterfaceTest) ... ok
  test_vif_8021q_mtu_limits (__main__.BondingInterfaceTest) ... ok
  test_vif_8021q_qos_change (__main__.BondingInterfaceTest) ... ok
  test_vif_s_8021ad_vlan_interfaces (__main__.BondingInterfaceTest) ... ok
  test_vif_s_protocol_change (__main__.BondingInterfaceTest) ... ok

  ----------------------------------------------------------------------
  Ran 23 tests in 244.694s

  OK

This will limit the `bond` interface test to only make use of `eth1` and `eth2`
as member ports.

Config Load Tests
=================

The other part of our tests are called "config load tests". The config load tests
will load - one after another - arbitrary configuration files to test if the
configuration migration scripts work as designed and that a given set of
functionality still can be loaded with a fresh VyOS ISO image.

The configurations are all derived from production systems and can not only act
as a testcase but also as reference if one wants to enable a certain feature.
The configurations can be found here:
https://github.com/vyos/vyos-1x/tree/current/smoketest/configs

The entire test is controlled by the main wrapper script ``/usr/bin/vyos-configtest``
which behaves in the same way as the main smoketest script. It scans the folder
for potential configuration files and issues a ``load`` command one after another.

Manual config load test
-----------------------

One is not bound to load all configurations one after another but can also load
individual test configurations on his own.

.. code-block:: none

  vyos@vyos:~$ configure
  load[edit]

  vyos@vyos# load /usr/libexec/vyos/tests/config/ospf-small
  Loading configuration from '/usr/libexec/vyos/tests/config/ospf-small'
  Load complete. Use 'commit' to make changes effective.
  [edit]
  vyos@vyos# compare
  [edit interfaces ethernet eth0]
  -hw-id 00:50:56:bf:c5:6d
  [edit interfaces ethernet eth1]
  +duplex auto
  -hw-id 00:50:56:b3:38:c5
  +speed auto
  [edit interfaces]
  -ethernet eth2 {
  -    hw-id 00:50:56:b3:9c:1d
  -}
  -vti vti1 {
  -    address 192.0.2.1/30
  -}
  ...

  vyos@vyos# commit
  vyos@vyos#

.. note:: Some of the configurations have preconditions which need to be met.
   Those most likely include generation of crypographic keys before the config
   can be applied - you will get a commit error otherwise. If you are interested
   how those preconditions are fulfilled check the vyos-build_ repository and
   the ``scripts/check-qemu-install`` file.

.. include:: /_include/common-references.txt
