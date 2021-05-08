#####################
Google Cloud Platform
#####################

Deploy VM
---------

To deploy VyOS on GCP (Google Cloud Platform)

1. Generate SSH key pair type **ssh-rsa** from the host that will connect to
   VyOS.

  Example:

  .. code-block:: none

    ssh-keygen -t rsa -f ~/.ssh/vyos_gcp -C "vyos@mypc"


.. note:: In name "vyos@mypc" The first value must be "**vyos**". Because
   default user is vyos and google api uses this option.


2. Open GCP console and navigate to the menu **Metadata**. Choose
   **SSH Keys** and click ``edit``.

.. figure:: /_static/images/cloud-gcp-01.png


Click **Add item** and paste your public ssh key. Click ``Save``.

.. figure:: /_static/images/cloud-gcp-02.png


2. On marketplace search "VyOS"

3. Change Deployment name/Zone/Machine type and click ``Deploy``

.. figure:: /_static/images/cloud-gcp-03.png

4. After few seconds click to ``instance``

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
