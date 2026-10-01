---
lastproofread: '2026-09-30'
---

(terraformvSphere)=

# Deploy VyOS on VMware vSphere with Terraform and Ansible

Terraform can deploy a VyOS virtual machine from an OVF or OVA on VMware
vSphere. Ansible can then connect to the deployed router and apply its
configuration. This guide uses vCenter because the vSphere Terraform provider
requires vCenter for OVF/OVA deployment.

The examples assume that:

- You have a vCenter account with permission to deploy virtual machines.
- The OVF/OVA is reachable from the machine running Terraform.
- The vSphere network provides the guest with an address Terraform can read.
- The machine running Ansible can reach the VyOS management address over SSH.
- You know the login credentials configured for the selected VyOS image.

The Terraform provider's `default_ip_address` depends on VMware Tools or
`open-vm-tools` reporting guest networking information. If the image does not
report an address, use the address assigned by your DHCP server or configured
through your image's supported customization mechanism.

## Prepare the deployment

Install Terraform and Ansible on a Linux, macOS, or Windows control machine.
Install the VyOS Ansible collection and its network connection dependency:

```shell
ansible-galaxy collection install vyos.vyos ansible.netcommon
```

Create a project directory with these files:

```text
.
├── main.tf
├── variables.tf
├── terraform.tfvars
├── inventory.yml
├── ansible.cfg
└── configure.yml
```

Use your environment's vCenter names and the OVF network names from the
appliance descriptor. The values shown below are examples; names and network
mapping keys must match your vSphere inventory and OVF/OVA.

## Terraform configuration

`main.tf`:

```terraform
terraform {
  required_providers {
    vsphere = {
      source  = "hashicorp/vsphere"
      version = "~> 2.12"
    }
  }
}

provider "vsphere" {
  user                 = var.vsphere_user
  password             = var.vsphere_password
  vsphere_server       = var.vsphere_server
  allow_unverified_ssl = false
}

data "vsphere_datacenter" "dc" {
  name = var.datacenter
}

data "vsphere_datastore" "datastore" {
  name          = var.datastore
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_compute_cluster" "cluster" {
  name          = var.cluster
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_network" "network" {
  name          = var.network
  datacenter_id = data.vsphere_datacenter.dc.id
}

resource "vsphere_virtual_machine" "vyos" {
  name             = var.vm_name
  datacenter_id    = data.vsphere_datacenter.dc.id
  datastore_id     = data.vsphere_datastore.datastore.id
  resource_pool_id = data.vsphere_compute_cluster.cluster.resource_pool_id

  network_interface {
    network_id = data.vsphere_network.network.id
  }

  wait_for_guest_net_timeout = 5

  ovf_deploy {
    remote_ovf_url       = var.ovf_url
    disk_provisioning    = "thin"
    ip_protocol          = "IPv4"
    ip_allocation_policy = "dhcpPolicy"
    ovf_network_map = {
      "Network 1" = data.vsphere_network.network.id
    }
  }
}

output "vyos_ip_address" {
  description = "Guest IP reported by VMware Tools, when available"
  value       = vsphere_virtual_machine.vyos.default_ip_address
}
```

Set `"Network 1"` to the network identifier declared by the OVF descriptor.
If the appliance declares multiple networks, map each one to the intended
vSphere network. The `network_interface` block also supplies the virtual NIC
configuration expected by the Terraform provider. The cluster's root resource
pool lets vSphere place the VM on an available host.

`variables.tf`:

```terraform
variable "vsphere_server" {
  description = "vCenter server name or address"
  type        = string
}

variable "vsphere_user" {
  description = "vCenter username"
  type        = string
}

variable "vsphere_password" {
  description = "vCenter password"
  type        = string
  sensitive   = true
}

variable "datacenter" {
  description = "vSphere datacenter name"
  type        = string
}

variable "cluster" {
  description = "vSphere compute cluster name"
  type        = string
}

variable "datastore" {
  description = "Datastore for the VM disks"
  type        = string
}

variable "network" {
  description = "vSphere network to map to the OVF network"
  type        = string
}

variable "vm_name" {
  description = "Name for the deployed VyOS VM"
  type        = string
}

variable "ovf_url" {
  description = "URL of the OVF or OVA appliance"
  type        = string
}
```

`terraform.tfvars` contains environment-specific values. Do not commit this
file if it contains credentials; add it to `.gitignore` or use environment
variables or a secrets manager instead. The `sensitive` variable setting
redacts a value from normal CLI output, but Terraform still stores it in state.
Restrict access to the state file and use a protected remote backend for shared
workflows.

```terraform
vsphere_server   = "vcenter.example.net"
vsphere_user     = "terraform-user@vsphere.local"
vsphere_password = "replace-with-a-secret"
datacenter       = "Datacenter"
cluster          = "Cluster"
datastore        = "Datastore"
network          = "VM Network"
vm_name          = "vyos-router"
ovf_url          = "https://example.net/path/to/vyos.ova"
```

Initialize Terraform, review the proposed changes, and apply them:

```shell
terraform init
terraform plan
terraform apply
```

Terraform prompts for confirmation before creating the VM. Type `yes` at the
prompt only after reviewing the plan. To remove the VM later, run
`terraform destroy` and review its plan before confirming.

## Configure VyOS with Ansible

Run Ansible from a machine that can reach the deployed router. Do not use a
Terraform provisioner to log in to a separate Ansible host: Terraform should
manage the VM, while Ansible should run from its own control node.

`inventory.yml`:

```yaml
all:
  children:
    vyos:
      hosts:
        router:
          ansible_host: 192.0.2.10
      vars:
        ansible_connection: ansible.netcommon.network_cli
        ansible_network_os: vyos.vyos.vyos
        ansible_user: vyos
        # Supply the password securely, for example with Ansible Vault.
        ansible_password: "{{ vault_vyos_password }}"
```

Replace `192.0.2.10` with the deployed VM's reachable address. The inventory
uses a placeholder vault variable; define `vault_vyos_password` in an encrypted
`group_vars/vyos/vault.yml` file and load it using Ansible Vault, or use another
approved secrets method. Do not store plaintext passwords in source control.

`ansible.cfg`:

```ini
[defaults]
inventory = inventory.yml
host_key_checking = True
```

`configure.yml`:

```yaml
---
- name: Configure VyOS routers
  hosts: vyos
  gather_facts: false

  tasks:
    - name: Wait for VyOS to accept SSH connections
      ansible.builtin.wait_for:
        host: "{{ ansible_host }}"
        port: 22
        state: started
        timeout: 300
      delegate_to: localhost

    - name: Set the system name server
      vyos.vyos.vyos_config:
        lines:
          - set system name-server 192.0.2.1
        save: true
```

Replace the example configuration command with commands appropriate to your
network. `vyos.vyos.vyos_config` uses `lines` for `set` or `delete` commands and
`save: true` saves changes after they are committed. The collection uses the
`ansible.netcommon.network_cli` connection plugin.

Run the playbook after Terraform has deployed the VM and you have set the
inventory address and Ansible credentials:

```shell
ansible-playbook configure.yml
```

For a quick way to inspect the Terraform output, run
`terraform output vyos_ip_address` and copy the returned address into
`inventory.yml`. If Terraform returns an empty value, confirm that the guest
obtains an address and that VMware Tools reports it to vCenter.

## Further information

% stop_vyoslinter
- [Terraform vSphere provider: virtual machine resource](https://registry.terraform.io/providers/hashicorp/vsphere/latest/docs/resources/virtual_machine)
- [Terraform vSphere provider: compute cluster data source](https://registry.terraform.io/providers/hashicorp/vsphere/latest/docs/data-sources/compute_cluster)
- [Ansible inventory guide](https://docs.ansible.com/projects/ansible/latest/inventory_guide/intro_inventory.html)
- [VyOS `vyos_config` Ansible module](https://docs.ansible.com/projects/ansible/latest/collections/vyos/vyos/vyos_config_module.html)
- [vyos-automation examples](https://github.com/vyos/vyos-automation/tree/main/TerraformCloud/Vsphere_terraform_ansible_single_vyos_instance-main)
% start_vyoslinter
