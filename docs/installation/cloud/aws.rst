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
   root device will be ``/dev/xvda``. You can skip this step.

.. figure:: /_static/images/cloud-aws-05.png

6. Configure Security Group. It's recommended that you configure SSH access
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

Amazon CloudWatch Agent Usage
-----------------------------

To use Amazon CloudWatch Agent, configure it within the Amazon SSM Parameter
Store. If you don't have a configuration yet, do
:ref:`configuration_creation`.

1. Create an :abbr:`IAM (Identity and Access Management)` role for the
   :abbr:`EC2 (Elastic Compute Cloud)` instance to access CloudWatch service,
   and name it CloudWatchAgentServerRole. The role should contain two default
   policies: ``CloudWatchAgentServerPolicy`` and
   ``AmazonSSMManagedInstanceCore``.

2. Attach the created role to your VyOS :abbr:`EC2 (Elastic Compute Cloud)`
   instance.

3. Ensure that amazon-cloudwatch-agent package is installed. 

  .. code-block:: none

    $ sudo apt list --installed | grep amazon-cloudwatch-agent

  .. note:: The amazon-cloudwatch-agent package is normally included in
     VyOS 1.3.3+ and 1.4+

4. Retrieve an existing CloudWatch Agent configuration from the
   :abbr:`SSM (Systems Manager)` Parameter Store.

  .. code-block:: none

    $ sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:<your-configuration-name>

  This step also enables systemd service and runs it.

  .. note:: The VyOS platform-specific scripts feature is under development.
     Thus, this step should be repeated manually after changing system image
     (:doc:`/installation/update`)

.. _configuration_creation:

CloudWatch SSM Configuration creation
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Creating the Amazon Cloudwatch Agent Configuration in Amazon
:abbr:`SSM (Systems Manager)` Parameter Store.

1. Create an :abbr:`IAM (Identity and Access Management)` role for your
   :abbr:`EC2 (Elastic Compute Cloud)` instance to access the CloudWatch
   service. Name it CloudWatchAgentAdminRole. The role should contain at two
   default policies: ``CloudWatchAgentAdminPolicy`` and
   ``AmazonSSMManagedInstanceCore``.

  .. note:: CloudWatchAgentServerRole is too permissive and should be used for
     single configuration creation and deployment. That's why after completion
     of step #3 highly recommended to replace instance
     CloudWatchAgentAdminRole role with CloudWatchAgentServerRole.

2. Run Cloudwatch configuration wizard.

  .. code-block:: none

    $ sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

3. When prompted, answer "yes" to the question "Do you want to store the
   config in the SSM parameter store?".

AWS Gateway Load Balancer
--------------------------

VyOS supports the AWS Gateway Load Balancer (GWLB) tunnel handler (``gwlbtun``),
which enables VyOS to act as an inspection or processing target for GWLB. GWLB
uses Geneve encapsulation with custom metadata to deliver traffic to VyOS for
packet filtering, shaping, deep packet inspection, NAT, or other traffic
manipulation functions. The tunnel handler automatically creates Linux tunnel
interfaces (``gwi-*`` for ingress and ``gwo-*`` for egress) per endpoint,
allowing you to use standard Linux utilities like iptables, tc, and netfilter
to implement your inspection or processing logic. This enables VyOS to serve as
a centralized appliance for traffic inspection in your AWS infrastructure,
supporting both single-endpoint (1-arm) and multi-endpoint (2-arm) deployment
modes.

.. stop_vyoslinter
For more information about integrating with AWS Gateway Load Balancer, see
the following article from AWS:
`How to integrate Linux instances with AWS Gateway Load Balancer <https://aws.amazon.com/blogs/networking-and-content-delivery/how-to-integrate-linux-instances-with-aws-gateway-load-balancer/>`__.

.. start_vyoslinter
Configuration Example
^^^^^^^^^^^^^^^^^^^^^

Configure the AWS GWLB service with the following commands:

.. code-block:: none

  set service aws glb script on-create '/config/scripts/glb-create.sh'
  set service aws glb script on-destroy '/config/scripts/glb-destroy.sh'
  set service aws glb status format 'simple'
  set service aws glb status port '8282'
  set service aws glb threads tunnel '4'
  set service aws glb threads tunnel-affinity '1-2'
  set service aws glb threads udp '4'
  set service aws glb threads udp-affinity '0-3'

.. stop_vyoslinter
References
----------
- https://console.aws.amazon.com/
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-iam-roles-for-cloudwatch-agent.html
- https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Agent-on-EC2-Instance-fleet.html
- https://aws.amazon.com/blogs/networking-and-content-delivery/how-to-integrate-linux-instances-with-aws-gateway-load-balancer/

.. start_vyoslinter
