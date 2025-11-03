:lastproofread: 2025-09-04

.. _vpp_limitations:

.. include:: /_include/need_improvement.txt

#########################
VPP Dataplane Limitations
#########################


While VPP Dataplane offers significant performance advantages, there are some limitations and considerations to be aware of.

* **Feature Parity**

  Not all features available in the Linux kernel dataplane are supported in VPP. Some networking features, specific protocols, or services may not be available.

  VPP supports various interface types that have parity with kernel, but their capabilities may differ.

* **NIC and Drivers Compatibility**

  Some NICs may work with DPDK drivers but not with XDP, or vice versa.

* **Data Path Limitations**

  If a feature exists only in kernel dataplane, traffic using that feature will not be able to traverse VPP interfaces. Examples of such features are:

  - Firewall
  - QoS

  When traffic uses pure VPP path, it simply never reaches the kernel where such features are implemented. Therefore, you need to carefully plan how traffic flows through VyOS router to ensure that it can reach expected features.

  VPP has native replacements for some of these features, for example VPP native ACLs can satisfy basic firewalling needs. 