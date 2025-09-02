##########
VyOS Deployment on AWS and Azure for Secure Cloud-to-Cloud Connectivity
##########

This document provides step-by-step guidance for deploying VyOS routers on both AWS and Azure. 
It describes how to establish secure inter-cloud connectivity using IPsec tunnels with BGP, 
automated through Terraform. Example workloads (Amazon Linux EC2 on AWS and Ubuntu VM on Azure) 
are also deployed for connectivity validation.

Why Cloud-to-Cloud Connectivity?
--------------------------------

Cloud-to-cloud connectivity is needed in modern multi-cloud environments for several reasons:

- **Inter-Cloud Connectivity**

  Enable secure and reliable communication between workloads in different clouds  
  (for example, AWS applications connecting to Azure-hosted identity services).

- **Cloud-to-Cloud Migration**

  During migration projects, workloads may temporarily run in both clouds.  
  Direct tunnels ensure smooth transition and synchronization.

- **Testing and Validation**

  Labs and proof-of-concepts often simulate multi-cloud architectures.  
  A VyOS-based tunnel lets teams test routing, encryption, and failover before production rollout.

Architecture
------------

The architecture consists of VyOS routers deployed in both AWS and Azure, connected via secure IPsec tunnels.  
BGP is used for dynamic routing between the clouds, allowing for seamless communication.

.. figure:: /_static/images/cloud-aws-to-azure.png
   :alt: VyOS Cloud-to-Cloud topology diagram

Terraform Automation
--------------------

To streamline and standardize the deployment process, a set of **Terraform projects** has been developed.  
These projects automate the provisioning of **VyOS instances** and the required networking resources across **AWS** and **Azure**.

In addition to deploying VyOS, these projects also provision an **Amazon Linux EC2 instance** on AWS and an **Ubuntu VM** on Azure.  
These serve as test endpoints to validate connectivity between the cloud environments.

Prerequisites
-------------

AWS Environment
^^^^^^^^^^^^^^^

- Active AWS account with permissions for EC2, VPC, Transit Gateway, Route Server, and IAM (for keypair and role management).

Local Environment:

- AWS CLI installed: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

- Terraform installed: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli

Set AWS credentials in your shell:

.. code-block:: none

   export AWS_ACCESS_KEY_ID="<AWS_ACCESS_KEY_ID>"
   export AWS_SECRET_ACCESS_KEY="<AWS_SECRET_ACCESS_KEY>"
   export AWS_SESSION_TOKEN="<AWS_SESSION_TOKEN>"
   export AWS_DEFAULT_REGION="<AWS_REGION>"  # e.g., us-east-1

Obtain VyOS AMI ID and Owner ID:

Subscribe to VyOS via AWS Marketplace. Then run:

.. code-block:: none

   aws ec2 describe-images \
     --owners aws-marketplace \
     --filters "Name=product-code,Values=8wqdkv3u2b9sa0y73xob2yl90" \
     --query 'Images[*].[ImageId,OwnerId,Name]' \
     --output table

Alternatively, set the ``vyos_ami_id`` variable directly in ``variables.tf``.

Generate an SSH keypair (or use the included demo key):

.. code-block:: none

   ssh-keygen -b 2048 -t rsa -m PEM -f keys/vyos_custom_key.pem
   chmod 400 keys/vyos_custom_key.pem

Azure Environment
^^^^^^^^^^^^^^^^^

- Active Azure subscription:

.. code-block:: none

   az account set --subscription "<subscription ID or name>"

- Azure CLI installed:

  https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

- Logged in with Azure credentials:

.. code-block:: none

   az version
   az login

- Azure Resource Group (RG) created:

.. code-block:: none

   az group create --name demoResourceGroup --location westus
   az group list
   az group show --name demoResourceGroup

- Terraform installed:

  https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli

- SSH key generated:

.. code-block:: none

   ssh-keygen -t rsa -b 4096 -f keys/id_rsa
   chmod 400 keys/id_rsa

Usage
-----

AWS
^^^

All variables needed for customization are defined in ``variables.tf``.  
Adjust them according to your requirements, such as EC2 instance type and networking configurations.  

Before deployment, ensure you check ``aws_region``, ``availability_zone``, and update ``vyos_ami_id`` as necessary.

Azure
^^^^^

All variables needed for customization are defined in ``variables.tf``.  
Adjust them according to your requirements, such as VM size and networking configurations.  

Before deployment, ensure you check ``azure_region``, ``availability_zone``, and update ``subscription_id`` and ``resource_group_name`` as necessary.

Terraform Workflow
^^^^^^^^^^^^^^^^^^

.. code-block:: none

   terraform init
   terraform fmt
   terraform validate
   terraform plan
   terraform apply

On completion, run:

.. code-block:: none

   terraform output

This displays the public IP addresses of the VyOS instances.

To clean up:

.. code-block:: none

   terraform destroy

Management
----------

SSH into VyOS:

.. code-block:: none

   ssh vyos@<vyos_public_ip> -i keys/vyos_custom_key.pem

GitHub Repository
-----------------

You can clone or download the Terraform projects and use them in your environment:

https://github.com/vyos/vyos-automation/tree/main/Terraform/Cloud-to-Cloud
