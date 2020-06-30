.. _vyos-on-clouds:

Running on Clouds
#################

Amazon AWS
**********

Deploy VM
---------

Deploy VyOS on Amazon :abbr:`AWS (Amazon Web Services)`

1. Click to ``Instances`` and ``Launch Instance``

.. figure:: /_static/images/cloud-aws-01.png

2. On the marketplace search "VyOS"

.. figure:: /_static/images/cloud-aws-02.png

3. Choose the instance type. Minimum recommendation start from ``m3.medium``

.. figure:: /_static/images/cloud-aws-03.png

4. Configure instance for your requirements. Select number of instances / network / subnet

.. figure:: /_static/images/cloud-aws-04.png

5. Additional storage. You can remove additional storage ``/dev/sdb``. First root device will be ``/dev/xvda``. You can skeep this step.

.. figure:: /_static/images/cloud-aws-05.png

6. Configure Security Group. It's recommended that you configure ssh access only from certain address sources. Or permit any (by default).

.. figure:: /_static/images/cloud-aws-06.png

7. Select SSH key pair and click ``Launch Instances``

.. figure:: /_static/images/cloud-aws-07.png

8. Find out your public IP address.

.. figure:: /_static/images/cloud-aws-08.png

9. Connect to the instance by SSH key.

  .. code-block:: none

    ssh -i ~/.ssh/amazon.pem vyos@203.0.113.3
    vyos@ip-192-0-2-10:~$




References
----------
https://console.aws.amazon.com/

Azure
*****

Deploy VM
---------

Deploy VyOS on Azure.

1. Go to the Azure services and Click to **Add new Virtual machine**

2. Choose vm name, resource group, region and click **Browse all public and private images**

.. figure:: /_static/images/cloud-azure-01.png

3. On the marketplace search ``VyOS``

.. figure:: /_static/images/cloud-azure-02.png

4. Generate new SSH key pair or use existing.

.. figure:: /_static/images/cloud-azure-03.png

5. Define network, subnet, Public IP. Or it will be created by default.

.. figure:: /_static/images/cloud-azure-04.png

6. Click ``Review + create``. After fiew second your deployment will be complete

.. figure:: /_static/images/cloud-azure-05.png

7. Click to your new vm and find out your Public IP address.

.. figure:: /_static/images/cloud-azure-06.png

8. Connect to the instance by SSH key.

  .. code-block:: none

    ssh -i ~/.ssh/vyos_azure vyos@203.0.113.3
    vyos@vyos-doc-r1:~$


References
----------
https://azure.microsoft.com

Google Cloud Platform
*********************

Deploy VM
---------

To deploy VyOS on GCP (Google Cloud Platform)

1. Generate SSH key pair type **ssh-rsa** from the host that will connect to VyOS.

  Example:

  .. code-block:: none

    ssh-keygen -t rsa -f ~/.ssh/vyos_gcp -C "vyos@mypc"


.. NOTE:: In name "vyos@mypc" The first value must be "**vyos**". Because default user is vyos and google api uses this option.


2. Open GCP console and navigate to the menu **Metadata**. Choose **SSH Keys** and click ``edit``.

.. figure:: /_static/images/cloud-gcp-01.png


Click **Add item** and paste your public ssh key. Click ``Save``.

.. figure:: /_static/images/cloud-gcp-02.png


2. On marketplace search "VyOS"

3. Change Deployment name/Zone/Machine type and click ``Deploy``

.. figure:: /_static/images/cloud-gcp-03.png

4. After fiew seconds click to ``instance``

.. figure:: /_static/images/cloud-gcp-04.png

5. Find out your external IP address

.. figure:: /_static/images/cloud-gcp-05.png

6. Connect to the instance. SSH key was generated in the first step.

  .. code-block:: none

    ssh -i ~/.ssh/vyos_gcp vyos@203.0.113.3
    vyos@vyos-r1-vm:~$

References
----------
https://console.cloud.google.com/

Oracle
*****************

References
----------
https://www.oracle.com/cloud/
