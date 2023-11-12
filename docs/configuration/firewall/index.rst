:lastproofread: 2023-11-08

########
Firewall
########

.. attention:: 
   Starting from VyOS 1.4-rolling-202308040557, a new firewall structure
   can be found on all vyos installations.

***************
Netfilter based
***************

With VyOS being based on top of Linux and its kernel, the Netfilter project
created the iptables and now the successor nftables for the Linux kernel to
work directly on the data flows. This now extends the concept of zone-based
security to allow for manipulating the data at multiple stages once accepted
by the network interface and the driver before being handed off to the
destination (e.g. a web server OR another device).

A simplified traffic flow, based on Netfilter packet flow, is shown next, in
order to have a full view and understanding of how packets are processed, and
what possible paths can take.

.. figure:: /_static/images/firewall-gral-packet-flow.png

Main notes regarding this packet flow and terminology used in VyOS firewall:

   * **Bridge Port?**: choose appropiate path based on if interface were the
     packet was received is part of a bridge, or not.

If interface were the packet was received isn't part of a bridge, then packet
is processed at the **IP Layer**:

   * **Prerouting**: several actions can be done in this stage, and currently
     these actions are defined in different parts in vyos configuration. Order
     is important, and all these actions are performed before any actions
     define under ``firewall`` section. Relevant configuration that acts in
     this stage are:

      * **Conntrack Ignore**: rules defined under ``set system conntrack ignore
        [ipv4 | ipv6] ...``.

      * **Policy Route**: rules defined under ``set policy [route | route6]
        ...``.

      * **Destination NAT**: rules defined under ``set [nat | nat66]
        destination...``.

   * **Destination is the router?**: choose appropiate path based on
     destination IP address. Transit forward continunes to **forward**,
     while traffic that destination IP address is configured on the router
     continues to **input**.

   * **Input**: stage where traffic destinated to the router itself can be
     filtered and controlled. This is where all rules for securing the router
     should take place. This includes ipv4 and ipv6 filtering rules, defined
     in:

     * ``set firewall ipv4 input filter ...``.

     * ``set firewall ipv6 input filter ...``.

   * **Forward**: stage where transit traffic can be filtered and controlled.
     This includes ipv4 and ipv6 filtering rules, defined in:

     * ``set firewall ipv4 forward filter ...``.

     * ``set firewall ipv6 forward filter ...``.

   * **Output**: stage where traffic that is originated by the router itself
     can be filtered and controlled. Bare in mind that this traffic can be a
     new connection originted by a internal process running on VyOS router,
     such as NTP, or can be a response to traffic received externaly through
     **inputt** (for example response to an ssh login attempt to the router).
     This includes ipv4 and ipv6 filtering rules, defined in:

     * ``set firewall ipv4 input filter ...``.

     * ``set firewall ipv6 output filter ...``.

   * **Postrouting**: as in **Prerouting**, several actions defined in
     different parts of VyOS configuration are performed in this
     stage. This includes:

     * **Source NAT**: rules defined under ``set [nat | nat66]
       destination...``.

If interface were the packet was received is part of a bridge, then packet
is processed at the **Bridge Layer**, which contains a ver basic setup where
for bridge filtering:

   * **Forward (Bridge)**: stage where traffic that is trasspasing through the
     bridge is filtered and controlled:

     * ``set firewall bridge forward filter ...``.

Main structure VyOS firewall cli is shown next:

.. code-block:: none

   - set firewall
       * bridge
            - forward
               + filter
       * flowtable
            - custom_flow_table
               + ...
       * global-options
            + all-ping
            + broadcast-ping
            + ...
       * group
            - address-group
            - ipv6-address-group
            - network-group
            - ipv6-network-group
            - interface-group
            - mac-group
            - port-group
            - domain-group
       * ipv4
            - forward
               + filter
            - input
               + filter
            - output
               + filter
            - name
               + custom_name
       * ipv6
            - forward
               + filter
            - input
               + filter
            - output
               + filter
            - ipv6-name
               + custom_name
       * zone
            - custom_zone_name
               + ...

Please, refer to appropiate section for more information about firewall
configuration:

.. toctree::
   :maxdepth: 1
   :includehidden:

   global-options
   groups
   bridge
   ipv4
   ipv6
   flowtables
   zone

.. note:: **For more information**
   of Netfilter hooks and Linux networking packet flows can be
   found in `Netfilter-Hooks
   <https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks>`_

***************
Legacy Firewall
***************

.. toctree::
   :maxdepth: 1
   :includehidden:

   general-legacy

Traditionally firewalls weere configured with the concept of data going in and
out of an interface. The router just listened to the data flowing through and
responding as required if it was directed at the router itself.

To configure VyOS with the
:doc:`legacy firewall configuration </configuration/firewall/general-legacy>`

As the example image below shows, the device was configured with rules blocking
inbound or outbound traffic on each interface.

.. figure:: /_static/images/firewall-traditional.png

Zone-based firewall
^^^^^^^^^^^^^^^^^^^
.. toctree::
   :maxdepth: 1
   :includehidden:

   zone

With zone-based firewalls a new concept was implemented, in addtion to the
standard in and out traffic flows, a local flow was added. This local was for
traffic originating and destined to the router itself. Which means additional
rules were required to secure the firewall itself from the network, in
addition to the existing inbound and outbound rules from the traditional
concept above.

To configure VyOS with the
:doc:`zone-based firewall configuration </configuration/firewall/zone>`

As the example image below shows, the device now needs rules to allow/block
traffic to or from the services running on the device that have open
connections on that interface.

.. figure:: /_static/images/firewall-zonebased.png
