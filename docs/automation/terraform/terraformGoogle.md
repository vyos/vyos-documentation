---
lastproofread: '2026-09-30'
---

(terraformgoogle)=

# Deploy VyOS on Google Cloud with Terraform and Ansible

Terraform can create a Google Cloud Compute Engine instance from a VyOS
Marketplace image. Ansible can then configure the running VyOS router over SSH.
This guide shows a single-instance example; adapt its network and firewall rules
to your deployment before applying it.

## Prerequisites

- A Google Cloud project with billing enabled and the Compute Engine API
  enabled.
- Permissions to create Compute Engine instances and VPC firewall rules.
- Terraform and the Google Cloud CLI installed on the Terraform control machine.
- Ansible installed on a Linux, macOS, or WSL control machine. Install the
  required collections with:

  ```shell
  ansible-galaxy collection install vyos.vyos ansible.netcommon
  ```

- A VyOS image in Google Cloud Marketplace and its full image reference. Select
  the current image in Marketplace and use its image project and image name;
  do not copy an old versioned image name from an example.
- An SSH key pair for accessing the router. The public key comment must begin
  with `vyos@`, as described in the [VyOS GCP deployment guide]. Never put the
  private key in this project or in Terraform configuration.

This example uses Google Application Default Credentials (ADC) for Terraform.
On a workstation, authenticate with:

```shell
gcloud auth application-default login
```

In an automated environment, use the platform's workload identity or an
appropriately scoped service account. Avoid downloading long-lived service
account keys when another authentication method is available.

## Create the Terraform configuration

Create a project directory with `main.tf`, `variables.tf`, and
`terraform.tfvars`. Keep the Terraform state file private; it can contain
sensitive values and infrastructure details.

### `main.tf`

```terraform
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_compute_instance" "vyos" {
  name           = var.instance_name
  machine_type   = var.machine_type
  zone           = var.zone
  can_ip_forward = true
  tags           = ["vyos-router"]

  boot_disk {
    initialize_params {
      image = var.image
    }
  }

  network_interface {
    network = var.network

    access_config {}
  }

  metadata = {
    enable-oslogin = "FALSE"
    ssh-keys       = "vyos:${trimspace(file(var.ssh_public_key_file))}"
  }
}

resource "google_compute_firewall" "ssh" {
  name    = "${var.instance_name}-ssh"
  network = var.network

  direction     = "INGRESS"
  source_ranges = [var.admin_source_range]
  target_tags   = ["vyos-router"]

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
}

output "public_ip_address" {
  description = "External IPv4 address assigned to the VyOS instance"
  value       = google_compute_instance.vyos.network_interface[0].access_config[0].nat_ip
}
```

`can_ip_forward` allows the VM to forward packets with source or destination
addresses other than its own, as required when the instance acts as a router.
The instance and firewall share the `vyos-router` network tag so the SSH rule
applies to this instance. The rule only allows SSH from the administrator
address range you provide; do not replace it with `0.0.0.0/0` for a public
router.

The `ssh-keys` metadata value uses the public key only. The explicit
`enable-oslogin` setting selects metadata-based SSH keys for this example. If
an organization policy requires OS Login, follow that policy and verify the
selected VyOS image supports the required access method.

The firewall rule only permits management SSH. Add separate firewall rules
for the traffic your router must handle, with source ranges and protocols
limited to your deployment. For example, IPsec may require ESP in addition to
UDP ports 500 and 4500; allowing those UDP ports alone does not permit ESP.

### `variables.tf`

```terraform
variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Region containing the selected zone"
  type        = string
}

variable "zone" {
  description = "Compute Engine zone"
  type        = string
}

variable "network" {
  description = "VPC network name or self-link"
  type        = string
}

variable "image" {
  description = "Full image reference for the selected VyOS Marketplace image"
  type        = string
}

variable "instance_name" {
  description = "Name of the VyOS instance"
  type        = string
  default     = "vyos-router"
}

variable "machine_type" {
  description = "Compute Engine machine type"
  type        = string
  default     = "n2-highcpu-4"
}

variable "admin_source_range" {
  description = "Administrator IPv4 address or CIDR allowed to connect over SSH"
  type        = string
}

variable "ssh_public_key_file" {
  description = "Path to the public SSH key for the VyOS user"
  type        = string
}
```

### `terraform.tfvars`

Set these values for your project. Replace the example documentation address
with the administrator's real public IPv4 address and `/32` mask before using
the configuration. Use the image reference supplied by the current Marketplace
listing.

```terraform
project_id          = "your-project-id"
region              = "us-west1"
zone                = "us-west1-a"
network             = "default"
image               = "projects/IMAGE_PROJECT/global/images/IMAGE_NAME"
admin_source_range  = "198.51.100.10/32"
ssh_public_key_file = pathexpand("~/.ssh/vyos_gcp.pub")
```

The `198.51.100.10/32` value is reserved for documentation and will not allow
real access. Replace it before applying. Add `terraform.tfvars`, `.terraform/`,
and Terraform state files to `.gitignore` when the directory is versioned.

Initialize, format, validate, inspect the plan, and apply the configuration:

```shell
terraform init
terraform fmt -check
terraform validate
terraform plan
terraform apply
```

Review the plan and confirm the apply when prompted. The external address is
available with:

```shell
terraform output -raw public_ip_address
```

## Configure the router with Ansible

Ansible's network connection plugin uses the router's SSH interface; it does
not run on the Google Cloud VM. Add the VyOS public address from the Terraform
output to an inventory file named `inventory.yml`:

```yaml
all:
  hosts:
    vyos:
      ansible_host: 203.0.113.20
      ansible_user: vyos
      ansible_connection: ansible.netcommon.network_cli
      ansible_network_os: vyos.vyos.vyos
      ansible_ssh_private_key_file: ~/.ssh/vyos_gcp
```

Replace `203.0.113.20` with the `public_ip_address` Terraform output. Ensure
the control machine can reach that address on TCP port 22 and has the matching
private key available.

Create `configure.yml` with the configuration changes to apply:

```yaml
---
- name: Configure the VyOS router
  hosts: vyos
  gather_facts: false

  tasks:
    - name: Set the router host name
      vyos.vyos.vyos_config:
        lines:
          - set system host-name vyos-gcp

    - name: Save the configuration
      vyos.vyos.vyos_command:
        commands:
          - save
```

Run the playbook from the project directory:

```shell
ansible-playbook -i inventory.yml configure.yml
```

The `vyos.vyos.vyos_config` module uses the `ansible.netcommon.network_cli`
connection. Configuration commands are committed by the module; the separate
`save` command writes the committed configuration to the boot configuration.

## Destroy the instance

When the instance is no longer needed, remove the resources managed by this
configuration:

```shell
terraform destroy
```

Review the resources in the plan and confirm the destroy when prompted. Back up
any router configuration you need before deleting the instance.

## References

- [VyOS GCP deployment guide]
- [Google Cloud Compute Engine instances]
- [Google Cloud network tags and firewall rules]
- [Terraform Google provider: compute instance]
- [Terraform Google provider: compute firewall]
- [Terraform and Google Cloud authentication]
- [Ansible VyOS platform options]
- [Ansible VyOS configuration module]
- [vyos-automation Google Cloud Terraform example]

% stop_vyoslinter
[VyOS GCP deployment guide]:
  https://docs.vyos.io/en/rolling/installation/cloud/gcp.html
[Google Cloud Compute Engine instances]:
  https://docs.cloud.google.com/compute/docs/instances
[Google Cloud network tags and firewall rules]:
  https://docs.cloud.google.com/compute/docs/tag-resources
[Terraform Google provider: compute instance]:
  https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_instance
[Terraform Google provider: compute firewall]:
  https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_firewall
[Terraform and Google Cloud authentication]:
  https://developer.hashicorp.com/terraform/tutorials/gcp-get-started/google-cloud-platform-build
[Ansible VyOS platform options]:
  https://docs.ansible.com/projects/ansible/latest/network/user_guide/platform_vyos.html
[Ansible VyOS configuration module]:
  https://docs.ansible.com/projects/ansible/latest/collections/vyos/vyos/vyos_config_module.html
[vyos-automation Google Cloud Terraform example]:
  https://github.com/vyos/vyos-automation/tree/production/TerraformCloud/Google_terraform_ansible_single_vyos_instance-main
% start_vyoslinter
