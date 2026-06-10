# VyOS Deployment on Google Cloud Platform

This guide provides step-by-step instructions for deploying a VyOS instance with two NICs and the required resources on Google Cloud Platform (GCP).

## Prerequisites

Before proceeding, ensure the following:

- A GCP account with billing enabled.
- Permissions to deploy Marketplace images.
- Access to enable APIs and create resources (e.g., Compute Engine Admin, Network Admin).
- An SSH key pair for VyOS instance access.
- GA Google Cloud Project.

## Deployment Steps

### Step 1: Add SSH Key

1. If you don’t already have SSH keys, generate an SSH key pair of type `ssh-rsa` on your local machine:

> Example:
>
> ```none
> ssh-keygen -t rsa -f ~/.ssh/vyos_gcp -C "vyos@mypc"
> ```

:::{note}
In the comment `vyos@mypc`, the username must start with vyos.
This is because the default user in the VyOS image is `vyos`, and the Google Cloud API uses this value for SSH access.
:::

2. Open GCP console and navigate to the **Compute Engine** > **Metadata** > **SSH Keys**. Choose
   **SSH Keys**.

:::{figure} /_static/images/cloud-gcp-01.webp
:::

3. Click **edit** and **Add item**.
4. Paste your public ssh key and **Save**.

:::{figure} /_static/images/cloud-gcp-02.webp
:::

For more information, please visit the official Google Cloud documentation:

<https://cloud.google.com/compute/docs/connect/add-ssh-keys>

<https://cloud.google.com/compute/docs/connect/create-ssh-keys>

### Step 2: Create a Service Account (If You Don't Have One)

1. In the Google Cloud console **IAM & Admin > Service Accounts**.
2. Select select a project.

:::{figure} /_static/images/cloud-gcp-proj.png
:::

3. Click **Create Service Account**:

   - Name: e.g., `vyos-test`
   - Service account ID: e.g., `vyos-test`
   - Description: e.g., `VyOS Test Service Account`

4. Click **Done**.

:::{figure} /_static/images/cloud-gcp-svc.png
:::

For more information, please visit the official Google Cloud documentation:

<https://cloud.google.com/iam/docs/service-accounts-create>

<https://cloud.google.com/iam/docs/service-account-overview>

### Step 3: Create VPC Networks and Subnets

1. In the Google Cloud console **VPC Network > VPC Networks** <https://console.cloud.google.com/networking/networks/list>
2. Select select a project.

:::{figure} /_static/images/cloud-gcp-proj.png
:::

3. Click **Create VPC Network**.

   **Public VPC**:

   - Name: e.g., `vyos-public-vpc`
   - Subnet creation mode: `Custom`
   - Subnet name: e.g., `vyos-public-subnet`
   - Region: e.g., `europe-west1`
   - IP range: e.g., `10.0.1.0/24`
   - Leave all other settings at default, then click **Create**.

:::{figure} /_static/images/cloud-gcp-vpc-01.png
:::

:::{figure} /_static/images/cloud-gcp-vpc-02.png
**Private VPC**:

- Name: `vyos-private-vpc`
- Subnet creation mode: `Custom`
- Subnet name: `vyos-private-subnet`
- Region: e.g., `europe-west1`
- IP range: `10.0.11.0/24`
- Leave all other settings at default, then click **Create**.
:::

:::{figure} /_static/images/cloud-gcp-vpc-03.png
:::

:::{figure} /_static/images/cloud-gcp-vpc-04.png
:::

4. Add firewall rules to allow specific network traffic from the Internet if needed. By default, all incoming traffic from outside the network is blocked. Typically, a VyOS deployment from the GCP Marketplace configures this automatically, ensuring that SSH access is enabled after deployment.

:::{figure} /_static/images/cloud-gcp-vpc-05.png
:::

:::{figure} /_static/images/cloud-gcp-vpc-06.png
:::

:::{figure} /_static/images/cloud-gcp-vpc-07.png
:::

For more information, please visit the official Google Cloud documentation:

<https://cloud.google.com/vpc/docs/create-modify-vpc-networks>

### Step 4: Deploy VyOS instance from Marketplace

1. Go to the Google Cloud Marketplace page in the Google Cloud console <https://console.cloud.google.com/marketplace>
2. Choose the project where you want to deploy the VyOS instance.

:::{figure} /_static/images/cloud-gcp-proj.png
:::

3. In the search bar, type `vyos` to find the VyOS image in the Marketplace.

:::{figure} /_static/images/cloud-gcp-market-01.png
:::

:::{figure} /_static/images/cloud-gcp-market-02.png
:::

4. On the next page, review details such as support, pricing, and other details.

:::{figure} /_static/images/cloud-gcp-market-03.png
:::

5. Click the `GET STARTED` button to start deployment process.

:::{figure} /_static/images/cloud-gcp-market-04.png
:::

:::{figure} /_static/images/cloud-gcp-market-05.png
:::

6. General settings.

   - Deployment name: e.g., `vyos-test-vm`
   - Select a Service Account: Select the service account created earlier.
   - Image: Select VyOS image for deployment.
   - Zone: e.g., `europe-west1-b`
   - Machine type: Choose based on performance and resource needs.

:::{figure} /_static/images/cloud-gcp-vm-01.png
:::

:::{figure} /_static/images/cloud-gcp-vm-02.png
:::

7. Configure the network interfaces.

   **Public Network interface:**

   Edit the first (default) network interface and select following settings:

   > - Network: `vyos-public-vpc`
   > - Subnetwork: `vyos-public-subnet`
   > - External IP: `Ephemeral`
   > - Private Network interface:

   **Private Network Interface:**

   Click **ADD A NETWORK INTERFACE** button to create a second (private) interface, and select following settings:

   > - Network: `vyos-private-vpc`
   > - Subnetwork: `vyos-private-subnet`
   > - External IP: `None`

:::{figure} /_static/images/cloud-gcp-vm-03.png
:::

8. Deployment automation.

   - You can use `cloud-init` `User Data` to automatically inject specific configuration commands into the VyOS instance during deployment.
   - Example:

> ```none
> #cloud-config
> vyos_config_commands:
>    - set system host-name 'VyOS-for-GCP'
>    - set system login banner pre-login 'Welcome to the VyOS for on GCP'
>    - set interfaces ethernet eth0 description 'WAN'
>    - set interfaces ethernet eth1 description 'LAN'
>    - set interfaces ethernet eth1 address 'dhcp'
>    - set interfaces ethernet eth1 dhcp-options no-default-route
> ```

For more information, please visit the documentation:

<https://docs.vyos.io/en/stable/automation/cloud-init.html#module-vyos-userdata>

:::{figure} /_static/images/cloud-gcp-vm-09.png
:::

9. Click `Deploy` button.

:::{figure} /_static/images/cloud-gcp-vm-06.png
:::

:::{figure} /_static/images/cloud-gcp-vm-07.png
:::

### Connect to the VyOS instance

To connect to the VyOS instance, use the SSH key that was generated in the first step.

To retrieve the public IP address, go to the **Google Cloud Console** and navigate to: **Compute Engine** > **VM instances** <https://console.cloud.google.com/compute/instances?project=vyos-images>

:::{figure} /_static/images/cloud-gcp-vm-08.png
:::

Example:

> ```none
> ssh vyos@35.233.97.132 -i .ssh/vyos_gcp
>
> The authenticity of host '35.233.97.132 (35.233.97.132)' can't be established.
> ED25519 key fingerprint is SHA256:KCsCnwCGhwX2ba5RcPUAO3ZUSNzS4sXIkujFoScCd0g.
> This key is not known by any other names
> Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
> Warning: Permanently added '35.233.97.132' (ED25519) to the list of known hosts.
> Welcome to the VyOS for on GCP
> Welcome to VyOS!
>
>    ┌── ┐
>    . VyOS 1.4.2
>    └ ──┘  sagitta
>
> * Documentation:  https://docs.vyos.io/en/sagitta
> * Project news:   https://blog.vyos.io
> * Bug reports:    https://vyos.dev
>
> You can change this banner using "set system login banner post-login" command.
>
> VyOS is a free software distribution that includes multiple components,
> you can check individual component licenses under /usr/share/doc/*/copyright
> vyos@VyOS-for-GCP:~$
> ```
