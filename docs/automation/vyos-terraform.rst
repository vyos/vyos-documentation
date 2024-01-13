:lastproofread: 2024-01-11

.. _vyos-terraform:

Terraform
=========

VyOS supports develop infrastructia via Terraform and provisioning via ansible.
Need to install ``Terraform``

Structure of files

.. code-block:: none

 .
 ├── main.tf
 ├── version.tf
 ├── variables.tf
 └── terraform.tfvars

Run Terraform
-------------

.. code-block:: none

  #cd /your folder
  #terraform init
  #terraform plan
  #terraform apply
  #yes


Deploying vyos in the AWS cloud
-------------------------------
With the help of terraforms, you can quickly deploy Vyos-based infrastructure in the AWS cloud. If necessary, the infrastructure can be removed using terraform.
Also we will make provisioning using Ansible.

Structure of files Terrafom

.. code-block:: none

 .
 ├── vyos.tf
 └── var.tf
 
File contents
-------------

vyos.tf

.. code-block:: none

  terraform {
   required_providers {
     aws = {
       source  = "hashicorp/aws"
       version = "~> 5.0"
     }
   }
  }
  
  provider "aws" {
   access_key = var.access 
   secret_key = var.secret 
   region = var.region
  }
  
  variable "region" {
   default = "us-east-1"
   description = "AWS Region"
  }
  
  variable "ami" {
   default = "ami-**************"                        # ami image please enter your details  
   description = "Amazon Machine Image ID for VyOS"
  }
  
  variable "type" {
   default = "t2.micro"
   description = "Size of VM"
  }
  
  # my resource for VyOS
  
  resource "aws_instance" "myVyOSec2" {
   ami = var.ami
   key_name = "mykeyname"                                # Please enter your details  
   security_groups = ["my_sg"]                           # Please enter your details  
   instance_type = var.type
   tags = {
     name = "VyOS System"
   }
  }
  
  output "my_IP"{
  value = aws_instance.myVyOSec2.public_ip
  }
  
  
  #IP of aws instance copied to a file ip.txt in local system Terraform
  
  resource "local_file" "ip" {
      content  = aws_instance.myVyOSec2.public_ip
      filename = "ip.txt"
  }
  
  #connecting to the Ansible control node using SSH connection
  
  resource "null_resource" "SSHconnection1" {
  depends_on = [aws_instance.myVyOSec2] 
  connection {
   type     = "ssh"
   user     = "root"
   password = var.password
       host = var.host
  }
  #copying the ip.txt file to the Ansible control node from local system 
   provisioner "file" {
      source      = "ip.txt"
      destination = "/root/aws/ip.txt"                             # The folder of your Ansible project
         }
  }
  
  resource "null_resource" "SSHconnection2" {
  depends_on = [aws_instance.myVyOSec2]  
  connection {
  	type     = "ssh"
  	user     = "root"
  	password = var.password
      	host = var.host
  }
  #command to run Ansible playbook on remote Linux OS
  provisioner "remote-exec" {
      inline = [
  	"cd /root/aws/",
  	"ansible-playbook instance.yml"
  ]
  }
  }


var.tf

.. code-block:: none

  variable "password" {
     description = "pass for Ansible"
     type = string
     sensitive = true
  }
  variable "host"{
     description = "The IP of my Ansible"
  }
  variable "access" {
     description = "my access_key for AWS"
     type = string
     sensitive = true
  }
  variable "secret" {
     description = "my secret_key for AWS"
     type = string
     sensitive = true
  }


Structure of files Ansible

.. code-block:: none

 .
 ├── group_vars
     └── all
 ├── ansible.cfg
 ├── mykey.pem
 └── instance.yml
 
 
File contents
-------------

ansible.cfg

.. code-block:: none

  [defaults]
  inventory = /root/aws/ip.txt
  host_key_checking= False
  private_key_file = /root/aws/mykey.pem
  remote_user=vyos

mykey.pem

.. code-block:: none

  -----BEGIN OPENSSH PRIVATE KEY-----
  
  Copy your key.pem from AWS
  
  -----END OPENSSH PRIVATE KEY-----

instance.yml

.. code-block:: none

  - name: integration of terraform and ansible
    hosts: all
    gather_facts: 'no'
  
    tasks:
  
      - name: "Wait 300 seconds, but only start checking after 60 seconds"
        wait_for_connection:
          delay: 60
          timeout: 300
  
      - name: "Configure general settings for the vyos hosts group"
        vyos_config:
          lines:
            - set system name-server 8.8.8.8
          save:
            true


all

.. code-block:: none

  ansible_connection: ansible.netcommon.network_cli
  ansible_network_os: vyos.vyos.vyos
  ansible_user: vyos

AWS_terraform_ansible_single_vyos_instance
------------------------------------------

How to create a single instance and install your configuration using Terraform+Ansible+AWS 
Step by step:

AWS
---

1.1 Create an account with AWS and get your "access_key", "secret key"

1.2 Create a key pair and download your .pem key

1.3 Create a security group for the new VyOS instance

Terraform
---------

2.1 Create a UNIX or Windows instance

2.2 Download and install Terraform

2.3 Create the folder for example ../awsvyos/

2.4 Copy all files into your Terraform project (vyos.tf, var.tf)
2.4.1 Please type the information into the strings 22, 35, 36 of file "vyos.tf"

2.5 Type the commands :

   #cd /your folder
   
   #terraform init

Ansible
-------

3.1 Create a UNIX instance

3.2 Download and install Ansible

3.3 Create the folder for example /root/aws/

3.4 Copy all files from my folder /Ansible into your Ansible project (ansible.cfg, instance.yml, mykey.pem)

mykey.pem you have to get using step 1.2

Start 
-----

4.1 Type the commands on your Terrafom instance:
   
   #cd /your folder 

   #terraform plan  

   #terraform apply  
   
   #yes

.. image:: /_static/images/aws.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram



Deploying vyos in the Azure cloud
---------------------------------
With the help of terraforms, you can quickly deploy Vyos-based infrastructure in the Azure cloud. If necessary, the infrastructure can be removed using terraform.

Structure of files Terrafom

.. code-block:: none

 .
 ├── main.tf
 └── variables.tf
 
File contents
-------------

main.tf

.. code-block:: none

  ##############################################################################
  # HashiCorp Guide to Using Terraform on Azure
  # This Terraform configuration will create the following:
  # Resource group with a virtual network and subnet
  # An VyOS server without ssh key (only login+password)
  ##############################################################################
  
  # Chouse a provider
  
  provider "azurerm" {
    features {}
  }
  
  # Create a resource group. In Azure every resource belongs to a 
  # resource group. 
  
  resource "azurerm_resource_group" "azure_vyos" {
    name     = "${var.resource_group}"
    location = "${var.location}"
  }
  
  # The next resource is a Virtual Network.
  
  resource "azurerm_virtual_network" "vnet" {
    name                = "${var.virtual_network_name}"
    location            = "${var.location}"
    address_space       = ["${var.address_space}"]
    resource_group_name = "${var.resource_group}"
  }
  
  # Build a subnet to run our VMs in.
  
  resource "azurerm_subnet" "subnet" {
    name                 = "${var.prefix}subnet"
    virtual_network_name = "${azurerm_virtual_network.vnet.name}"
    resource_group_name = "${var.resource_group}"
    address_prefixes       = ["${var.subnet_prefix}"]
  }
  
  ##############################################################################
  # Build an VyOS VM from the Marketplace
  # To finde nessesery image use the command:
  #
  # az vm image list --offer vyos --all
  #
  # Now that we have a network, we'll deploy an VyOS server.
  # An Azure Virtual Machine has several components. In this example we'll build
  # a security group, a network interface, a public ip address, a storage 
  # account and finally the VM itself. Terraform handles all the dependencies 
  # automatically, and each resource is named with user-defined variables.
  ##############################################################################
  
  
  # Security group to allow inbound access on port 22 (ssh)
  
  resource "azurerm_network_security_group" "vyos-sg" {
    name                = "${var.prefix}-sg"
    location            = "${var.location}"
    resource_group_name = "${var.resource_group}"
  
    security_rule {
      name                       = "SSH"
      priority                   = 100
      direction                  = "Inbound"
      access                     = "Allow"
      protocol                   = "Tcp"
      source_port_range          = "*"
      destination_port_range     = "22"
      source_address_prefix      = "${var.source_network}"
      destination_address_prefix = "*"
    }
  }
  
  # A network interface.
  
  resource "azurerm_network_interface" "vyos-nic" {
    name                      = "${var.prefix}vyos-nic"
    location                  = "${var.location}"
    resource_group_name       = "${var.resource_group}"
  
    ip_configuration {
      name                          = "${var.prefix}ipconfig"
      subnet_id                     = "${azurerm_subnet.subnet.id}"
      private_ip_address_allocation = "Dynamic"
      public_ip_address_id          = "${azurerm_public_ip.vyos-pip.id}"
    }
  }
  
  # Add a public IP address.
  
  resource "azurerm_public_ip" "vyos-pip" {
    name                         = "${var.prefix}-ip"
    location                     = "${var.location}"
    resource_group_name          = "${var.resource_group}"
    allocation_method            = "Dynamic"
  }
  
  # Build a virtual machine. This is a standard VyOS instance from Marketplace.
  
  resource "azurerm_virtual_machine" "vyos" {
    name                = "${var.hostname}-vyos"
    location            = "${var.location}"
    resource_group_name = "${var.resource_group}" 
    vm_size             = "${var.vm_size}"
  
    network_interface_ids         = ["${azurerm_network_interface.vyos-nic.id}"]
    delete_os_disk_on_termination = "true"
  
  # To finde an information about the plan use the command:
  # az vm image list --offer vyos --all
  
    plan {
      publisher = "sentriumsl"
      name      = "vyos-1-3"
      product   = "vyos-1-2-lts-on-azure"
    }
  
    storage_image_reference {
      publisher = "${var.image_publisher}"
      offer     = "${var.image_offer}"
      sku       = "${var.image_sku}"
      version   = "${var.image_version}"
    }
  
    storage_os_disk {
      name              = "${var.hostname}-osdisk"
      managed_disk_type = "Standard_LRS"
      caching           = "ReadWrite"
      create_option     = "FromImage"
    }
  
    os_profile {
      computer_name  = "${var.hostname}"
      admin_username = "${var.admin_username}"
      admin_password = "${var.admin_password}"
    }
  
    os_profile_linux_config {
      disable_password_authentication = false
    }
  }
  
  data "azurerm_public_ip" "example" {
    depends_on = ["azurerm_virtual_machine.vyos"]
    name                = "vyos-ip"
    resource_group_name = "${var.resource_group}"
  }
  output "public_ip_address" {
    value = data.azurerm_public_ip.example.ip_address
  }
  
  # IP of AZ instance copied to a file ip.txt in local system
  
  resource "local_file" "ip" {
      content  = data.azurerm_public_ip.example.ip_address
      filename = "ip.txt"
  }
  
  #Connecting to the Ansible control node using SSH connection
  
  resource "null_resource" "nullremote1" {
  depends_on = ["azurerm_virtual_machine.vyos"] 
  connection {
   type     = "ssh"
   user     = "root"
   password = var.password
       host = var.host
  }
  
  # Copying the ip.txt file to the Ansible control node from local system 
  
   provisioner "file" {
      source      = "ip.txt"
      destination = "/root/az/ip.txt"
         }
  }
  
  resource "null_resource" "nullremote2" {
  depends_on = ["azurerm_virtual_machine.vyos"]  
  connection {
  	type     = "ssh"
  	user     = "root"
  	password = var.password
      	host = var.host
  }
  
  # Command to run ansible playbook on remote Linux OS
  
  provisioner "remote-exec" {
      
      inline = [
  	"cd /root/az/",
  	"ansible-playbook instance.yml"
  ]
  }
  }



variables.tf

.. code-block:: none

  ##############################################################################
  # Variables File
  # 
  # Here is where we store the default values for all the variables used in our
  # Terraform code.
  ##############################################################################
  
  variable "resource_group" {
    description = "The name of your Azure Resource Group."
    default     = "my_resource_group"
  }
  
  variable "prefix" {
    description = "This prefix will be included in the name of some resources."
    default     = "vyos"
  }
  
  variable "hostname" {
    description = "Virtual machine hostname. Used for local hostname, DNS, and storage-related names."
    default     = "vyos_terraform"
  }
  
  variable "location" {
    description = "The region where the virtual network is created."
    default     = "centralus"
  }
  
  variable "virtual_network_name" {
    description = "The name for your virtual network."
    default     = "vnet"
  }
  
  variable "address_space" {
    description = "The address space that is used by the virtual network. You can supply more than one address space. Changing this forces a new resource to be created."
    default     = "10.0.0.0/16"
  }
  
  variable "subnet_prefix" {
    description = "The address prefix to use for the subnet."
    default     = "10.0.10.0/24"
  }
  
  variable "storage_account_tier" {
    description = "Defines the storage tier. Valid options are Standard and Premium."
    default     = "Standard"
  }
  
  variable "storage_replication_type" {
    description = "Defines the replication type to use for this storage account. Valid options include LRS, GRS etc."
    default     = "LRS"
  }
  
  # The most chippers size
  
  variable "vm_size" {
    description = "Specifies the size of the virtual machine."
    default     = "Standard_B1s"
  }
  
  variable "image_publisher" {
    description = "Name of the publisher of the image (az vm image list)"
    default     = "sentriumsl"
  }
  
  variable "image_offer" {
    description = "Name of the offer (az vm image list)"
    default     = "vyos-1-2-lts-on-azure"
  }
  
  variable "image_sku" {
    description = "Image SKU to apply (az vm image list)"
    default     = "vyos-1-3"
  }
  
  variable "image_version" {
    description = "Version of the image to apply (az vm image list)"
    default     = "1.3.3"
  }
  
  variable "admin_username" {
    description = "Administrator user name"
    default     = "vyos"
  }
  
  variable "admin_password" {
    description = "Administrator password"
    default     = "Vyos0!"
  }
  
  variable "source_network" {
    description = "Allow access from this network prefix. Defaults to '*'."
    default     = "*"
  }
  
  variable "password" {
     description = "pass for Ansible"
     type = string
     sensitive = true
  }
  variable "host"{
     description = "IP of my Ansible"
  }


Structure of files Ansible

.. code-block:: none

 .
 ├── group_vars
     └── all
 ├── ansible.cfg
 └── instance.yml
 
 
File contents
-------------

ansible.cfg

.. code-block:: none

  [defaults]
  inventory = /root/az/ip.txt
  host_key_checking= False
  remote_user=vyos


instance.yml

.. code-block:: none

  - name: integration of terraform and ansible
    hosts: all
    gather_facts: 'no'
  
    tasks:
  
      - name: "Wait 300 seconds, but only start checking after 60 seconds"
        wait_for_connection:
          delay: 60
          timeout: 300
  
      - name: "Configure general settings for the vyos hosts group"
        vyos_config:
          lines:
            - set system name-server 8.8.8.8
          save:
            true


all

.. code-block:: none

  ansible_connection: ansible.netcommon.network_cli
  ansible_network_os: vyos.vyos.vyos
  
  # user and password gets from terraform variables "admin_username" and "admin_password"
  ansible_user: vyos
  ansible_ssh_pass: Vyos0!


Azure_terraform_ansible_single_vyos_instance
--------------------------------------------

How to create a single instance and install your configuration using Terraform+Ansible+Azure 
Step by step:

Azure
-----

1.1 Create an account with Azure

Terraform
---------

2.1 Create a UNIX or Windows instance

2.2 Download and install Terraform

2.3 Create the folder for example ../azvyos/

2.4 Copy all files from my folder /Terraform into your Terraform project (main.tf, variables.tf)

2.5 Login with Azure  using the command 

  #az login

2.6 Type the commands :

   #cd /your folder
   
   #terraform init

Ansible
-------

3.1 Create a UNIX instance

3.2 Download and install Ansible

3.3 Create the folder for example /root/az/

3.4 Copy all files from my folder /Ansible into your Ansible project (ansible.cfg, instance.yml and /group_vars)

Start 
-----

4.1 Type the commands on your Terrafom instance:
   
   #cd /your folder 

   #terraform plan  

   #terraform apply  
   
   #yes



Deploying vyos in the Vsphere infrastructia
-------------------------------------------
With the help of terraforms, you can quickly deploy Vyos-based infrastructure in the vSphere.

Structure of files Terrafom

.. code-block:: none

 .
 ├── main.tf
 ├── versions.tf
 ├── variables.tf
 └── terraform.tfvars
 
File contents
-------------

main.tf

.. code-block:: none

  provider "vsphere" {
    user           = var.vsphere_user
    password       = var.vsphere_password
    vsphere_server = var.vsphere_server
    allow_unverified_ssl = true
  }
  
  data "vsphere_datacenter" "datacenter" {
    name = var.datacenter
  }
  
  data "vsphere_datastore" "datastore" {
    name          = var.datastore
    datacenter_id = data.vsphere_datacenter.datacenter.id
  }
  
  data "vsphere_compute_cluster" "cluster" {
    name          = var.cluster
    datacenter_id = data.vsphere_datacenter.datacenter.id
  }
  
  data "vsphere_resource_pool" "default" {
    name          = format("%s%s", data.vsphere_compute_cluster.cluster.name, "/Resources/terraform")  # set as you need
    datacenter_id = data.vsphere_datacenter.datacenter.id
  }
  
  data "vsphere_host" "host" {
    name          = var.host
    datacenter_id = data.vsphere_datacenter.datacenter.id
  }
  
  data "vsphere_network" "network" {
    name          = var.network_name
    datacenter_id = data.vsphere_datacenter.datacenter.id
  }
  
  ## Deployment of VM from Remote OVF
  resource "vsphere_virtual_machine" "vmFromRemoteOvf" {
    name                 = var.remotename
    datacenter_id        = data.vsphere_datacenter.datacenter.id
    datastore_id         = data.vsphere_datastore.datastore.id
    host_system_id       = data.vsphere_host.host.id
    resource_pool_id     = data.vsphere_resource_pool.default.id
    network_interface {
      network_id = data.vsphere_network.network.id
    }
    wait_for_guest_net_timeout = 2
    wait_for_guest_ip_timeout  = 2
  
    ovf_deploy {
      allow_unverified_ssl_cert = true
      remote_ovf_url            = var.url_ova
      disk_provisioning         = "thin"
      ip_protocol               = "IPv4"
      ip_allocation_policy = "dhcpPolicy"
      ovf_network_map = {
        "Network 1" = data.vsphere_network.network.id
        "Network 2" = data.vsphere_network.network.id
      }
    }
    vapp {
      properties = {
         "password"          = "12345678",
         "local-hostname"    = "terraform_vyos"
      }
    }
  }
  
  output "ip" {
    description = "default ip address of the deployed VM"
    value       = vsphere_virtual_machine.vmFromRemoteOvf.default_ip_address
  }
  
  # IP of AZ instance copied to a file ip.txt in local system
  
  resource "local_file" "ip" {
      content  = vsphere_virtual_machine.vmFromRemoteOvf.default_ip_address
      filename = "ip.txt"
  }
  
  #Connecting to the Ansible control node using SSH connection
  
  resource "null_resource" "nullremote1" {
  depends_on = ["vsphere_virtual_machine.vmFromRemoteOvf"]
  connection {
   type     = "ssh"
   user     = "root"
   password = var.ansiblepassword
   host = var.ansiblehost
  
  }
  
  # Copying the ip.txt file to the Ansible control node from local system
  
   provisioner "file" {
      source      = "ip.txt"
      destination = "/root/vsphere/ip.txt"
         }
  }
  
  resource "null_resource" "nullremote2" {
  depends_on = ["vsphere_virtual_machine.vmFromRemoteOvf"]
  connection {
          type     = "ssh"
          user     = "root"
          password = var.ansiblepassword
          host = var.ansiblehost
  }
  
  # Command to run ansible playbook on remote Linux OS
  
  provisioner "remote-exec" {
  
      inline = [
          "cd /root/vsphere/",
          "ansible-playbook instance.yml"
  ]
  }
  }


versions.tf

.. code-block:: none

  # Copyright (c) HashiCorp, Inc.
  # SPDX-License-Identifier: MPL-2.0
  
  terraform {
    required_providers {
      vsphere = {
        source  = "hashicorp/vsphere"
        version = "2.4.0"
      }
    }
  }

variables.tf

.. code-block:: none

  # Copyright (c) HashiCorp, Inc.
  # SPDX-License-Identifier: MPL-2.0
  
  variable "vsphere_server" {
    description = "vSphere server"
    type        = string
  }
  
  variable "vsphere_user" {
    description = "vSphere username"
    type        = string
  }
  
  variable "vsphere_password" {
    description = "vSphere password"
    type        = string
    sensitive   = true
  }
  
  variable "datacenter" {
    description = "vSphere data center"
    type        = string
  }
  
  variable "cluster" {
    description = "vSphere cluster"
    type        = string
  }
  
  variable "datastore" {
    description = "vSphere datastore"
    type        = string
  }
  
  variable "network_name" {
    description = "vSphere network name"
    type        = string
  }
  
  variable "host" {
    description = "name if yor host"
    type        = string
  }
  
  variable "remotename" {
    description = "the name of you VM"
    type        = string
  }
  
  variable "url_ova" {
    description = "the URL to .OVA file or cloude store"
    type        = string
  }
  
  variable "ansiblepassword" {
    description = "Ansible password"
    type        = string
  }
  
  variable "ansiblehost" {
    description = "Ansible host name or IP"
    type        = string
  }

terraform.tfvars

.. code-block:: none

  vsphere_user       = ""
  vsphere_password   = ""
  vsphere_server     = ""
  datacenter         = ""
  datastore          = ""
  cluster            = ""
  network_name       = ""
  host               = ""
  url_ova            = ""
  ansiblepassword    = ""
  ansiblehost        = ""
  remotename         = ""

Azure_terraform_ansible_single_vyos_instance
--------------------------------------------

How to create a single instance and install your configuration using Terraform+Ansible+Vsphere 
Step by step:

Vsphere
-------

1.1 Collect all data in to file "terraform.tfvars" and create resources fo example "terraform"

Terraform
---------

2.1 Create a UNIX or Windows instance

2.2 Download and install Terraform

2.3 Create the folder for example ../vsphere/

2.4 Copy all files from my folder /Terraform into your Terraform project

2.5 Type the commands :

   #cd /your folder
   
   #terraform init


Ansible
-------

3.1 Create a UNIX instance

3.2 Download and install Ansible

3.3 Create the folder for example /root/vsphere/

3.4 Copy all files from my folder /Ansible into your Ansible project (ansible.cfg, instance.yml and /group_vars)

Start 
-----

4.1 Type the commands on your Terrafom instance:
   
   #cd /your folder 

   #terraform plan  

   #terraform apply  
   
   #yes

