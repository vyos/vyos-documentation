---
lastproofread: '2026-09-30'
---

(terraformaz)=

# Deploy VyOS on Microsoft Azure with Terraform

VyOS publishes Terraform examples for deploying VyOS routers on Microsoft
Azure. The examples in [vyos-automation] use different
topologies, including site-to-site BGP, WireGuard VPN, and high availability.
Choose the example that matches your use case and review its resources and
variables before deploying it.

## Prerequisites

- An Azure subscription with permission to create the resources used by the
  selected example.
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
  and [Terraform](https://developer.hashicorp.com/terraform/install).
- An SSH key pair for accessing the VyOS instance. Follow the selected
  example's instructions for the key path and administrator username.

Sign in to Azure and select the subscription in which you want to deploy:

```sh
az login
az account set --subscription "<subscription ID or name>"
```

The AzureRM provider can use the Azure CLI session for authentication. See
[AzureRM provider authentication] for its configuration requirements. The
examples may also require a subscription ID or other values in their provider
configuration; set those values as described by the selected example. Do not
commit credentials, private keys, or Terraform state files to the repository.

## Choose and run an example

The [vyos-automation] Azure Terraform examples contain the Terraform
configuration, variables, and deployment-specific instructions. Clone the
repository, change to the directory for the example you selected, and follow
its README:

```sh
git clone https://github.com/vyos/vyos-automation.git
cd vyos-automation/Terraform/Azure/<example-directory>
terraform init
terraform fmt -check
terraform validate
terraform plan
```

Review the plan, including the Azure resources and any associated costs. If it
matches your intent, apply it:

```sh
terraform apply
```

Use the outputs and connection details documented by that example to access
and verify the deployed VyOS instance. When you no longer need the deployment,
review the proposed changes and remove its resources with:

```sh
terraform destroy
```

The examples are maintained in `vyos-automation`; their variables and
instructions may change. The Azure portal deployment guide is available in
the [VyOS Azure installation documentation].

% stop_vyoslinter
[vyos-automation]: https://github.com/vyos/vyos-automation/tree/production/Terraform/Azure
[VyOS Azure installation documentation]: https://docs.vyos.io/en/rolling/installation/cloud/azure.html
[AzureRM provider authentication]: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/guides/azure_cli
% start_vyoslinter
