:lastproofread: 2023-11-08

.. _firewall-flowtables-configuration:

#################################
Flowtables Firewall Configuration
#################################

.. note:: **Documentation under development**

********
Overview
********

In this section there's useful information of all firewall configuration that
can be done regarding flowtables

.. cfgcmd:: set firewall flowtables ...

From main structure defined in :doc:`Firewall Overview</configuration/firewall/index>`
in this section you can find detailed information only for the next part
of the general structure:

.. code-block:: none

   - set firewall
       * flowtable
            - custom_flow_table
               + ...


Flowtables  allows you to define a fastpath through the flowtable datapath.
The flowtable supports for the layer 3 IPv4 and IPv6 and the layer 4 TCP
and UDP protocols.

.. figure:: /_static/images/firewall-flowtable-packet-flow.png

Once the first packet of the flow successfully goes through the IP forwarding
path (black circles path), from the second packet on, you might decide to
offload the flow to the flowtable through your ruleset. The flowtable
infrastructure provides a rule action that allows you to specify when to add
a flow to the flowtable (On forward filtering, red circle number 6)

A packet that finds a matching entry in the flowtable (flowtable hit) is
transmitted to the output netdevice, hence, packets bypass the classic IP
forwarding path and uses the **Fast Path** (orange circles path). The visible
effect is that you do not see these packets from any of the Netfilter
hooks coming after ingress. In case that there is no matching entry in the
flowtable (flowtable miss), the packet follows the classic IP forwarding path.

.. note:: **Flowtable Reference:**
   https://docs.kernel.org/networking/nf_flowtable.html
