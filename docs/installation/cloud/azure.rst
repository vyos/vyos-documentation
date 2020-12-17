#####
Azure
#####

Deploy VM
---------

Deploy VyOS on Azure.

1. Go to the Azure services and Click to **Add new Virtual machine**

2. Choose vm name, resource group, region and click **Browse all public and
   private images**

.. figure:: /_static/images/cloud-azure-01.png

3. On the marketplace search ``VyOS`` and choose the appropriate subscription

.. figure:: /_static/images/cloud-azure-02.png

4. Generate new SSH key pair or use existing.

.. figure:: /_static/images/cloud-azure-03.png

5. Define network, subnet, Public IP. Or it will be created by default.

.. figure:: /_static/images/cloud-azure-04.png

6. Click ``Review + create``. After a few seconds your deployment will be complete

.. figure:: /_static/images/cloud-azure-05.png

7. Click to your new vm and find out your Public IP address.

.. figure:: /_static/images/cloud-azure-06.png

8. Connect to the instance by SSH key.

  .. code-block:: none

    ssh -i ~/.ssh/vyos_azure vyos@203.0.113.3
    vyos@vyos-doc-r1:~$

Add interface
-------------

If instance was deployed with one **eth0** ``WAN`` interface and want to add
new one. To add new interface an example **eth1** ``LAN`` you need shutdown the
instance. Attach the interface in the Azure portal and then start the instance.

.. note:: Azure does not allow you attach interface when the instance in the
   **Running** state.

Absorbing Routes
----------------

If using as a router, you will want your LAN interface to absorb some or all of the traffic from your VNET by using a route table applied to the subnet.

1. Create a route table and browse to **Configuration**

2. Add one or more routes for networks you want to pass through the VyOS VM. Next hop type **Virtual Appliance** with the **Next Hop Address** of the VyOS ``LAN`` interface.

.. note:: If you want to create a new default route for VMs on the subnet, use **Address Prefix** ``0.0.0.0/0`` Also note that if you want to use this as a typical edge device, you'll want masquerade NAT for the ``WAN`` interface.

Serial Console
--------------

Azure has a way to access the serial console of a VM, but this needs to be configured on the VyOS. It's there by default, but keep it in mind if you are replacing config.boot and rebooting: ``set system console device ttyS0 speed '9600'``

References
----------
https://azure.microsoft.com
