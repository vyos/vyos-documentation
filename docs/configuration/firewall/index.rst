:lastproofread: 2023-11-23

########
Firewall
########

As VyOS is based on Linux it leverages its firewall. The Netfilter project
created iptables and its successor nftables for the Linux kernel to
work directly on packet data flows. This now extends the concept of 
zone-based security to allow for manipulating the data at multiple stages once 
accepted by the network interface and the driver before being handed off to 
the destination (e.g., a web server OR another device).

A simplified traffic flow diagram, based on Netfilter packet flow, is shown 
next, in order to have a full view and understanding of how packets are 
processed, and what possible paths traffic can take.

.. figure:: /_static/images/firewall-gral-packet-flow.png

The main points regarding this packet flow and terminology used in VyOS 
firewall are covered below:

   * **Bridge Port?**: choose appropriate path based on whether interface 
     where the packet was received is part of a bridge, or not.

If the interface where the packet was received isn't part of a bridge, then 
packet is processed at the **IP Layer**:

   * **Prerouting**: All packets that are received by the router
     are processed in this stage, regardless of the destination of the packet.
     Starting from vyos-1.5-rolling-202406120020, a new section was added to
     firewall configuration. There are several actions that can be done in this
     stage, and currently these actions are also defined in different parts in
     VyOS configuration. Order is important, and relevant configuration that
     acts in this stage are:

      * **Firewall prerouting**: rules defined under ``set firewall [ipv4 |
        ipv6] prerouting raw...``. All rules defined in this section are
        processed before connection tracking subsystem.

      * **Conntrack Ignore**: rules defined under ``set system conntrack ignore
        [ipv4 | ipv6] ...``. Starting from vyos-1.5-rolling-202406120020,
        configuration done in this section can be done in ``firewall [ipv4 |
        ipv6] prerouting ...``. For compatibility reasons, this feature is
        still present, but it will be removed in the future.

      * **Policy Route**: rules defined under ``set policy [route | route6]
        ...``.

      * **Destination NAT**: rules defined under ``set [nat | nat66]
        destination...``.

   * **Destination is the router?**: choose appropriate path based on
     destination IP address. Transit forward continues to **forward**,
     while traffic that destination IP address is configured on the router
     continues to **input**.

   * **Input**: stage where traffic destined for the router itself can be
     filtered and controlled. This is where all rules for securing the router
     should take place. This includes ipv4 and ipv6 filtering rules, defined
     in:

     * ``set firewall ipv4 input filter ...``.

     * ``set firewall ipv6 input filter ...``.

   * **Forward**: stage where transit traffic can be filtered and controlled.
     This includes ipv4 and ipv6 filtering rules, defined in:

     * ``set firewall ipv4 forward filter ...``.

     * ``set firewall ipv6 forward filter ...``.

   * **Output**: stage where traffic that originates from the router itself
     can be filtered and controlled. Bear in mind that this traffic can be a
     new connection originated by a internal process running on VyOS router,
     such as NTP, or a response to traffic received externally through
     **input** (for example response to an ssh login attempt to the router).
     This includes ipv4 and ipv6 rules, and two different sections are present:

     * **Output Prerouting**: ``set firewall [ipv4 | ipv6] output filter ...``.
       As described in **Prerouting**, rules defined in this section are
       processed before connection tracking subsystem.

     * **Output Filter**: ``set firewall [ipv4 | ipv6] output filter ...``.

   * **Postrouting**: as in **Prerouting**, several actions defined in
     different parts of VyOS configuration are performed in this
     stage. This includes:

     * **Source NAT**: rules defined under ``set [nat | nat66]
       destination...``.

If the interface where the packet was received is part of a bridge, then 
the packet is processed at the **Bridge Layer**, which contains a basic setup for
bridge filtering:

   * **Forward (Bridge)**: stage where traffic that is trespassing through the
     bridge is filtered and controlled:

     * ``set firewall bridge forward filter ...``.

The main structure of the VyOS firewall CLI is shown next:

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
               + raw
            - prerouting
               + raw
            - name
               + custom_name
       * ipv6
            - forward
               + filter
            - input
               + filter
            - output
               + filter
               + raw
            - prerouting
               + raw
            - ipv6-name
               + custom_name
       * zone
            - custom_zone_name
               + ...

Please, refer to appropriate section for more information about firewall
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

.. note:: **For more information**
   of Netfilter hooks and Linux networking packet flows can be
   found in `Netfilter-Hooks
   <https://wiki.nftables.org/wiki-nftables/index.php/Netfilter_hooks>`_


Zone-based firewall
^^^^^^^^^^^^^^^^^^^
.. toctree::
   :maxdepth: 1
   :includehidden:

   zone

With zone-based firewalls a new concept was implemented, in addition to the
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
