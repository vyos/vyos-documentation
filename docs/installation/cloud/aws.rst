##########
Amazon AWS
##########

Deploy VM
---------

Deploy VyOS on Amazon :abbr:`AWS (Amazon Web Services)`

1. Click to ``Instances`` and ``Launch Instance``

.. figure:: /_static/images/cloud-aws-01.png

2. On the marketplace search "VyOS"

.. figure:: /_static/images/cloud-aws-02.png

3. Choose the instance type. Minimum recommendation start from ``m3.medium``

.. figure:: /_static/images/cloud-aws-03.png

4. Configure instance for your requirements. Select number of
   instances / network / subnet

.. figure:: /_static/images/cloud-aws-04.png

5. Additional storage. You can remove additional storage ``/dev/sdb``. First
   root device will be ``/dev/xvda``. You can skeep this step.

.. figure:: /_static/images/cloud-aws-05.png

6. Configure Security Group. It's recommended that you configure ssh access
   only from certain address sources. Or permit any (by default).

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