:lastproofread: 2024-03-03

.. _terraformvSphere:

Deploying VyOS in the vSphere infrastructure
============================================

With the help of Terraform, you can quickly deploy VyOS-based infrastructure in the vSphere.
Also we will make provisioning using Ansible.

In this case, we'll create the necessary files for Terraform and Ansible next using Terraform we'll create a single instance on the vSphere cloud and make provisioning using Ansible.

Preparation steps for deploying VyOS on vSphere 
-----------------------------------------------

How to create a single instance and install your configuration using Terraform+Ansible+vSphere 
Step by step:


vSphere


  1 Collect all data in to file "terraform.tfvars" and create resources for example "terraform"


Terraform


  1 Create an UNIX or Windows instance

  2 Download and install Terraform

  3 Create the folder for example /root/vsphereterraform

.. code-block:: none

 mkdir /root/vsphereterraform
 

  4 Copy all files into your Terraform project "/root/vsphereterraform" (vyos.tf, var.tf, terraform.tfvars,version.tf), more detailed see `Structure of files Terrafom for vSphere`_

  5 Type the commands :

.. code-block:: none

   cd /<your folder> 
   terraform init


Ansible


  1 Create an UNIX instance whenever you want (local, cloud, and so on)

  2 Download and install Ansible

  3 Create the folder for example /root/vsphereterraform/

  4 Copy all files into your Ansible project "/root/vsphereterraform/" (ansible.cfg, instance.yml,"all"), more detailed see `Structure of files Ansible for vSphere`_


Start 


Type the commands on your Terrafom instance:
   
.. code-block:: none

   cd /<your folder>
   terraform plan  
   terraform apply  
   yes


After executing all the commands you will have your VyOS instance on the vSphere with your configuration, it's a very convenient desition.
If you need to delete the instance please type the command:

.. code-block:: none

   terraform destroy

   
Structure of files Terrafom for vSphere
---------------------------------------

.. code-block:: none

 .
 ├── vyos.tf				# The main script
 ├── versions.tf			# File for the changing version of Terraform.
 ├── var.tf					# File for the changing version of Terraform.
 └── terraform.tfvars		# The value of all variables (passwords, login, ip adresses and so on)


File contents of Terrafom for vSphere
-------------------------------------

vyos.tf

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
  
  # Deployment of VM from Remote OVF
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
  
  # IP of vSphere instance copied to a file ip.txt in local system
  
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

var.tf

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


Structure of files Ansible for vSphere
--------------------------------------

.. code-block:: none

 .
 ├── group_vars
     └── all
 ├── ansible.cfg
 └── instance.yml


File contents of Ansible for vSphere
------------------------------------

ansible.cfg

.. code-block:: none

  [defaults]
  inventory = /root/vsphere/ip.txt
  host_key_checking= False
  remote_user=vyos


instance.yml

.. code-block:: none

  ##############################################################################
  # About tasks:
  # "Wait 300 seconds, but only start checking after 60 seconds" - try to make ssh connection every 60 seconds until 300 seconds
  # "Configure general settings for the VyOS hosts group" - make provisioning into vSphere VyOS node
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
            - set system name-server 8.8.8.8
          save:
            true


group_vars/all

.. code-block:: none

  ansible_connection: ansible.netcommon.network_cli
  ansible_network_os: vyos.vyos.vyos
  
  # user and password gets from terraform variables "admin_username" and "admin_password"
  ansible_user: vyos
  # get from vyos.tf "vapp"
  ansible_ssh_pass: 12345678


Sourse files for vSphere from GIT
---------------------------------

All files about the article can be found here_

.. _here: https://github.com/vyos/vyos-automation/tree/main/TerraformCloud/Vsphere_terraform_ansible_single_vyos_instance-main

