\##########
VyOS High Availability (HA) Deployment on Azure
\##########

This document describes how to deploy VyOS in a High Availability (HA) configuration on Azure using Terraform and Azure Route Server to provide sub-second failover.

# Why Use HA on Azure?

This module provides a robust, repeatable foundation for building **resilient network architectures** in Azure. By combining VyOS routing features with Terraform and Azure-native services, it enables:

- Rapid deployment of cloud edge routers.
- Full control over BGP route advertisement and filtering.
- Realistic HA and disaster recovery simulations.
- Seamless integration with hybrid or multi-cloud infrastructure.

The architecture includes:

- Two VyOS routers in a Transit VNet, configured with BGP.
- Azure Route Server for dynamic route distribution.
- Site-to-Site VPN connections to a simulated on-premises VyOS router.
- An Ubuntu VM for connectivity and routing validation.
- A Data VNet for testing and diagnostics.

# Key Features

- **High Availability**: Dual VyOS routers for redundancy and failover.
- **Dynamic Routing**: BGP-based routing via Azure Route Server.
- **Hybrid Connectivity**: Site-to-Site VPN integration with a simulated on-prem VyOS.
- **Testing Environment**: Includes Ubuntu VM for verification and diagnostics.
- **Modular & Flexible**: Easily configurable via variables.

# HA Architecture Diagram

<figure>
<img src="/_static/images/cloud-azure-ha-architecture.webp" alt="VyOS HA topology diagram" />
</figure>

This deployment architecture simulates a real-world enterprise network scenario for testing and validation purposes.

# Terraform Automation

To streamline and standardize the process, we developed a Terraform project that automates the deployment of VyOS in High Availability (HA) mode on Azure.

This Terraform project automates the deployment of:

- Two VyOS instances in HA mode.
- Azure Route Server.
- A Transit VNet and a Data VNet containing a test Ubuntu VM for connectivity validation.

# Prerequisites

Ensure you have:

- Active Azure subscription:

``` none
az account set --subscription "<subscription ID or name>"
```

- Azure CLI installed:

  <https://learn.microsoft.com/en-us/cli/azure/install-azure-cli>

- Logged in with Azure credentials:

``` none
az version
az login
```

- Azure Resource Group (RG) created:

``` none
az group create --name demoResourceGroup --location westus
az group list
az group show --name demoResourceGroup
```

- Terraform installed:

  <https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli>

- SSH key generated:

``` none
ssh-keygen -t rsa -b 4096 -f keys/vyos_custom_key.pem
chmod 400 keys/vyos_custom_key.pem
```

# Usage

All variables are defined in `variables.tf`. Adjust them to match your environment.

Terraform Workflow:

``` none
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

On completion, run:

``` none
terraform output
```

This displays the management IP and connectivity test results.

To clean up:

``` none
terraform destroy
```

# Management

SSH into VyOS:

``` none
ssh adminuser@<vyos_public_ip> -i keys/vyos_custom_key.pem
```

# GitHub Repository

You can clone or download the Terraform project and use them in your environment:

<https://github.com/vyos/vyos-automation/tree/main/Terraform/Azure/azure-ha-deployment-with-configs>
