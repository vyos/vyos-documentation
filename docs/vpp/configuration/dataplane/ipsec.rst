:lastproofread: 2025-09-04

.. _vpp_config_dataplane_ipsec:

.. include:: /_include/need_improvement.txt

#######################
VPP IPsec Configuration
#######################

VPP supports IPsec (Internet Protocol Security) offloading from kernel, allowing to speed-up cryptographic operations by leveraging VPP's high-performance packet processing capabilities.

IPSec does not require any specific configuration on VPP side. If both source and destinations of the IPsec traffic are reachable via VPP interfaces, VPP will automatically offload the IPsec processing from kernel. IPSec tunnels are configured in the VPN configuration section, see :ref:`ipsec_general`.

IPSec Configuration Parameters
==============================

interface-type
^^^^^^^^^^^^^^

When VPP is used for offloading IPsec, it creates a virtual interface of a specific type to connect to a peer. The type of the interface can be configured using the following command:

.. cfgcmd:: set vpp settings ipsec interface-type <interface-type>

The available interface types are:

- ``ipsec``: This is the default interface type used for IPsec tunnels.
- ``ipip``: This interface type encapsulates IPsec traffic within IP-in-IP packets.

Select the interface type based on peers settings. In most cases, you need to use the ``ipsec`` type.

netlink
^^^^^^^

VPP uses netlink to receive IPSec event messages from the kernel. Proper settings of the following parameters are crucial for ensuring that VPP can process all such messages:

.. cfgcmd:: set vpp settings ipsec netlink batch-delay-ms <milliseconds>

This parameter specifies the delay in milliseconds between processing batch netlink messages.

.. cfgcmd:: set vpp settings ipsec netlink batch-size <number>

This parameter specifies the maximum number of netlink messages to process in a single batch.

.. cfgcmd:: set vpp settings ipsec netlink rx-buffer-size <number>

This parameter specifies the size of the receive buffer for netlink socket. If you expect to offload a lot of IPsec tunnels or get frequent and intensive rekeying, you may need to increase this value.

Potential Issues and Troubleshooting
====================================

Improper IPsec configuration can lead to various issues, including:

- Failure to offload IPsec tunnels to VPP
- Lost IPsec event messages due to insufficient netlink buffer size or batch settings
- IPSec states or SAs are not synchronized between kernel and VPP
