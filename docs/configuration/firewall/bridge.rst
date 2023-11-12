:lastproofread: 2023-11-08

.. _firewall-configuration:

#############################
Bridge Firewall Configuration
#############################

.. note:: **Documentation under development**

********
Overview
********

In this section there's useful information of all firewall configuration that
can be done regarding bridge, and appropiate op-mode commands.
Configuration commands covered in this section:

.. cfgcmd:: set firewall bridge ...

From main structure defined in :doc:`Firewall Overview</configuration/firewall/index>`
in this section you can find detailed information only for the next part
of the general structure:

.. code-block:: none

   - set firewall
       * bridge
            - forward
               + filter
            - name
               + custom_name

Traffic which is received by the router on an interface which is member of a
bridge is processed on the **Bridge Layer**. A simplified packet flow diagram
for this layer is shown next:

.. figure:: /_static/images/firewall-bridge-packet-flow.png

For traffic that needs to be forwared internally by the bridge, base chain is
is **forward**, and it's base command for filtering is ``set firewall bridge
forward filter ...``
