:lastproofread: 2024-03-03

.. _terraformAZ:

Deploying VyOS in the Azure cloud
=================================

With the help of Terraform, you can quickly deploy VyOS-based infrastructure in the Azure cloud. If necessary, the infrastructure can be removed using terraform.
Also we will make provisioning using Ansible.

In this case, we'll create the necessary files for Terraform and Ansible next using Terraform we'll create a single instance on the Azure cloud and make provisioning using Ansible.

Preparation steps for deploying VyOS on Azure 
---------------------------------------------

How to create a single instance and install your configuration using Terraform+Ansible+Azure 
Step by step:

Azure

  1 Create an account with Azure

Terraform


  1 Create an UNIX or Windows instance

  2 Download and install Terraform

  3 Create the folder for example /root/azvyos/

.. code-block:: none

 mkdir /root/azvyos

  4 Copy all files into your Terraform project "/root/azvyos" (vyos.tf, var.tf, terraform.tfvars), more detailed see `Structure of files Terrafom for Azure`_

  5 Login with Azure  using the command 

.. code-block:: none

   az login

2.6 Type the commands :

.. code-block:: none

   cd /<your folder> 
   terraform init

Ansible


  1 Create an UNIX instance whenever you want (local, cloud, and so on)

  2 Download and install Ansible

  3 Create the folder for example /root/az/

  4 Copy all files into your Ansible project "/root/az/" (ansible.cfg, instance.yml,"all"), more detailed see `Structure of files Ansible for Azure`_


Start 


Type the commands on your Terrafom instance:
   
.. code-block:: none

   cd /<your folder>
   terraform plan  
   terraform apply  
   yes

After executing all the commands you will have your VyOS instance on the Azure cloud with your configuration, it's a very convenient desition.
If you need to delete the instance please type the command:

.. code-block:: none

   terraform destroy
   
Structure of files Terrafom for Azure
-------------------------------------

.. code-block:: none

 .
 ├── vyos.tf				# The main script
 ├── var.tf					# File for the changing version of Terraform.
 └── terraform.tfvars		# The value of all variables (passwords, login, ip adresses and so on)

File contents of Terrafom for Azure
-----------------------------------

vyos.tf

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


var.tf

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

terraform.tfvars

.. code-block:: none

  password  = ""   # password for Ansible SSH
  host      = ""   # IP of my Ansible


Structure of files Ansible for Azure
------------------------------------

.. code-block:: none

 .
 ├── group_vars
     └── all
 ├── ansible.cfg
 └── instance.yml


File contents of Ansible for Azure
----------------------------------

ansible.cfg

.. code-block:: none

  [defaults]
  inventory = /root/az/ip.txt
  host_key_checking= False
  remote_user=vyos


instance.yml


.. code-block:: none

  ##############################################################################
  # About tasks:
  # "Wait 300 seconds, but only start checking after 60 seconds" - try to make ssh connection every 60 seconds until 300 seconds
  # "Configure general settings for the VyOS hosts group" - make provisioning into Azure VyOS node
  # You have to add all necessary cammans of VyOS under the block "lines:"
  ##############################################################################


  - name: integration of terraform and ansible
    hosts: all
    gather_facts: 'no'
  
    tasks:
  
      - name: "Wait 300 seconds, but only start checking after 60 seconds"
        wait_for_connection:
          delay: 60
          timeout: 300
  
      - name: "Configure general settings for the VyOS hosts group"
        vyos_config:
          lines:
            - set system name-server xxx.xxx.xxx.xxx
          save:
            true


group_vars/all

.. code-block:: none

  ansible_connection: ansible.netcommon.network_cli
  ansible_network_os: vyos.vyos.vyos
  
  # user and password gets from terraform variables "admin_username" and "admin_password" in the file /root/azvyos/var.tf
  ansible_user: vyos
  ansible_ssh_pass: Vyos0!

Sourse files for Azure from GIT
-------------------------------

All files about the article can be found here_

.. _here: https://github.com/vyos/vyos-automation/tree/main/TerraformCloud/Azure_terraform_ansible_single_vyos_instance-main


