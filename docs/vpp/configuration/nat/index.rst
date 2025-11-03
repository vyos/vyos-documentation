:lastproofread: 2025-09-04

.. _vpp_config_nat_index:

.. include:: /_include/need_improvement.txt


#####################
VPP NAT Configuration
#####################

.. toctree::
   :maxdepth: 1
   :includehidden:

   cgnat
   nat44

VPP Dataplane in VyOS supports two types of NAT:

NAT44
=====

This type is a classical NAT implementation where you can configure static and
dynamic NAT rules. It supports both source and destination NAT - while the configuration may looks a bit unusual in comparison to traditional NAT implementations.

CGNAT
=====

CGNAT is a special type of NAT44, which is highly useful for use cases where you have multiple local customers with a limited number of public IP addresses, and want to share public IP address space fairly between them. It uses a combination of IP address and port number to distinguish between different customers.

This type of NAT is often used by ISPs to provide internet access to their customers.

It supports only source NAT.
