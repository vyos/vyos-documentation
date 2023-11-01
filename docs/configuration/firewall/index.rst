:lastproofread: 2023-11-01

########
Firewall
########

.. attention:: 
   Starting from VyOS 1.4-rolling-202308040557, a new firewall structure
   can be found on all vyos installations.

Netfilter based
^^^^^^^^^^^^^^^
.. toctree::
   :maxdepth: 1
   :includehidden:

   general

With VyOS being based on top of Linux and its kernel, the Netfilter project created
the iptables and now the successor nftables for the Linux kernel to work directly
on the data flows. This now extends the concept of zone-based security to allow
for manipulating the data at multiple stages once accepted by the network interface
and the driver before being handed off to the destination (e.g. a web server OR
another device).

To configure VyOS with the new :doc:`firewall configuration </configuration/firewall/general>`

The only stages VyOS will process as part of the firewall configuration is the 
`forward` (F4 stage), `input` (L4 stage), and `output` (L5 stage). All the other
stages and steps are for reference and cant be manipulated through VyOS.

In this example image, a simplifed traffic flow is shown to help provide context
to the terms of `forward`, `input`, and `output` for the new firewall CLI format.

.. figure:: /_static/images/firewall-netfilter.png

.. note:: **For more information**
   of Netfilter hooks and Linux networking packet flows can be
   found in `Netfilter-Hooks
   <https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks>`_

Legacy Firewall
^^^^^^^^^^^^^^^
.. toctree::
   :maxdepth: 1
   :includehidden:

   general-legacy

Traditionally firewalls weere configured with the concept of data going in and
out of an interface. The router just listened to the data flowing through and
responding as required if it was directed at the router itself.

To configure VyOS with the :doc:`legacy firewall configuration </configuration/firewall/general-legacy>`

As the example image below shows, the device was configured with rules blocking
inbound or outbound traffic on each interface.

.. figure:: /_static/images/firewall-traditional.png

Zone-based firewall
^^^^^^^^^^^^^^^^^^^
.. toctree::
   :maxdepth: 1
   :includehidden:

   zone

With zone-based firewalls a new concept was implemented, in addtion to the standard
in and out traffic flows, a local flow was added. This local was for traffic
originating and destined to the router itself. Which means additional rules were 
required to secure the firewall itself from the network, in addition to the existing
inbound and outbound rules from the traditional concept above.

To configure VyOS with the :doc:`zone-based firewall configuration </configuration/firewall/zone>`

As the example image below shows, the device now needs rules to allow/block traffic
to or from the services running on the device that have open connections on that
interface.

.. figure:: /_static/images/firewall-zonebased.png
