:lastproofread: 2025-09-04

.. _vpp_config_dataplane_l2learn:

.. include:: /_include/need_improvement.txt

#########################
VPP L2LEARN Configuration
#########################

When VPP dataplane is connected to a L2 domain, it needs to learn MAC addresses of devices connected to the domain. And the amount of MAC addresses that can be learned is limited by default.

The limit can be configured using the following command:

.. cfgcmd:: set vpp settings l2learn limit <value>

This parameter configures the maximum number of MAC addresses that can be learned in the L2 domain. If you have a large number of devices, you may need to increase this limit to ensure all MAC addresses can be learned.

Potential Issues and Troubleshooting
====================================

Improper L2LEARN configuration can lead to various issues, including:

- Inability to learn all MAC addresses in the L2 domain if the limit is set too low
- Increased packet loss or latency for devices that are not learned
- Overall instability of the dataplane when handling L2 traffic

Consider increasing the L2LEARN limit if you experience issues with MAC address learning or if you have a large number of devices in the L2 domain.
