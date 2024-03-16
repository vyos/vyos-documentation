:lastproofread: 2024-03-03

.. _terraformvyos:

Terraform for VyOS
==================

VyOS supports development infrastructure via Terraform and provisioning via Ansible.
Terraform allows you to automate the process of deploying instances on many cloud and virtual platforms. 
In this article, we will look at using terraforms to deploy VyOS on platforms - AWS, Azure, and vSphere.
For more details about Terraform please have a look here link_.

Need to install_ Terraform

Structure of files in the standard Terraform project:

.. code-block:: none

 .
 ├── main.tf             # The main script
 ├── version.tf          # File for the changing version of Terraform.
 ├── variables.tf        # The file of all variables in "main.tf"
 └── terraform.tfvars    # The value of all variables (passwords, login, ip adresses and so on)


General commands that we will use for running Terraform scripts


.. code-block:: none

  cd /<your folder>       # go to the Terrafom project
  terraform init          # install all addons and provider (aws az and so on)
  terraform plan          # show what is changing
  terraform apply         # run script
  yes                     # apply running


.. _link: https://developer.hashicorp.com/terraform/intro
.. _install: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli