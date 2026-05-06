\#####################
VyOS Deployment on Google Cloud Platform
\#####################

This guide provides step-by-step instructions for deploying a VyOS instance with two NICs and the required resources on Google Cloud Platform (GCP).

Prerequisites
========

Before proceeding, ensure the following:

- A GCP account with billing enabled.
- Permissions to deploy Marketplace images.
- Access to enable APIs and create resources (e.g., Compute Engine Admin, Network Admin).
- An SSH key pair for VyOS instance access.
- GA Google Cloud Project.

Deployment Steps
========

# Step 1: Add SSH Key

1.  If you don’t already have SSH keys, generate an SSH key pair of type `ssh-rsa` on your local machine:

> Example:
>
> ``` none
> ssh-keygen -t rsa -f ~/.ssh/vyos_gcp -C "vyos@mypc"
> ```

<div class="note">

<div class="title">

Note

</div>

In the comment `vyos@mypc`, the username must start with vyos.
This is because the default user in the VyOS image is `vyos`, and the Google Cloud API uses this value for SSH access.

</div>

2.  Open GCP console and navigate to the **Compute Engine** \> **Metadata** \> **SSH Keys**. Choose
    **SSH Keys**.

<figure>
<img src="/_static/images/cloud-gcp-01.webp" />
</figure>

3.  Click **edit** and **Add item**.
4.  Paste your public ssh key and **Save**.

<figure>
<img src="/_static/images/cloud-gcp-02.webp" />
</figure>

For more information, please visit the official Google Cloud documentation:

<https://cloud.google.com/compute/docs/connect/add-ssh-keys>

<https://cloud.google.com/compute/docs/connect/create-ssh-keys>

Step 2: Create a Service Account (If You Don't Have One)
-------------------------------

1.  In the Google Cloud console **IAM & Admin \> Service Accounts**.
2.  Select select a project.

<figure>
<img src="/_static/images/cloud-gcp-proj.webp" />
</figure>

3.  Click **Create Service Account**:
    - Name: e.g., `vyos-test`
    - Service account ID: e.g., `vyos-test`
    - Description: e.g., `VyOS Test Service Account`
4.  Click **Done**.

<figure>
<img src="/_static/images/cloud-gcp-svc.webp" />
</figure>

For more information, please visit the official Google Cloud documentation:

<https://cloud.google.com/iam/docs/service-accounts-create>

<https://cloud.google.com/iam/docs/service-account-overview>

Step 3: Create VPC Networks and Subnets
-------------------------------

1.  In the Google Cloud console **VPC Network \> VPC Networks** <https://console.cloud.google.com/networking/networks/list>
2.  Select select a project.

<figure>
<img src="/_static/images/cloud-gcp-proj.webp" />
</figure>

3.  Click **Create VPC Network**.

    **Public VPC**:

    - Name: e.g., `vyos-public-vpc`
    - Subnet creation mode: `Custom`
    - Subnet name: e.g., `vyos-public-subnet`
    - Region: e.g., `europe-west1`
    - IP range: e.g., `10.0.1.0/24`
    - Leave all other settings at default, then click **Create**.

<figure>
<img src="/_static/images/cloud-gcp-vpc-01.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-vpc-02.webp" alt="Private VPC:" />
<figcaption><strong>Private VPC</strong>:
<ul>
<li>Name: <code>vyos-private-vpc</code></li>
<li>Subnet creation mode: <code>Custom</code></li>
<li>Subnet name: <code>vyos-private-subnet</code></li>
<li>Region: e.g., <code>europe-west1</code></li>
<li>IP range: <code>10.0.11.0/24</code></li>
<li>Leave all other settings at default, then click <strong>Create</strong>.</li>
</ul></figcaption>
</figure>

<figure>
<img src="/_static/images/cloud-gcp-vpc-03.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-vpc-04.webp" />
</figure>

4.  Add firewall rules to allow specific network traffic from the Internet if needed. By default, all incoming traffic from outside the network is blocked. Typically, a VyOS deployment from the GCP Marketplace configures this automatically, ensuring that SSH access is enabled after deployment.

<figure>
<img src="/_static/images/cloud-gcp-vpc-05.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-vpc-06.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-vpc-07.webp" />
</figure>

For more information, please visit the official Google Cloud documentation:

<https://cloud.google.com/vpc/docs/create-modify-vpc-networks>

Step 4: Deploy VyOS instance from Marketplace
---------

1.  Go to the Google Cloud Marketplace page in the Google Cloud console <https://console.cloud.google.com/marketplace>
2.  Choose the project where you want to deploy the VyOS instance.

<figure>
<img src="/_static/images/cloud-gcp-proj.webp" />
</figure>

3.  In the search bar, type `vyos` to find the VyOS image in the Marketplace.

<figure>
<img src="/_static/images/cloud-gcp-market-01.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-market-02.webp" />
</figure>

4.  On the next page, review details such as support, pricing, and other details.

<figure>
<img src="/_static/images/cloud-gcp-market-03.webp" />
</figure>

5.  Click the `GET STARTED` button to start deployment process.

<figure>
<img src="/_static/images/cloud-gcp-market-04.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-market-05.webp" />
</figure>

6.  General settings.
    - Deployment name: e.g., `vyos-test-vm`
    - Select a Service Account: Select the service account created earlier.
    - Image: Select VyOS image for deployment.
    - Zone: e.g., `europe-west1-b`
    - Machine type: Choose based on performance and resource needs.

<figure>
<img src="/_static/images/cloud-gcp-vm-01.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-vm-02.webp" />
</figure>

7.  Configure the network interfaces.

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

<figure>
<img src="/_static/images/cloud-gcp-vm-03.webp" />
</figure>

8.  Deployment automation.
    - You can use `cloud-init` `User Data` to automatically inject specific configuration commands into the VyOS instance during deployment.
    - Example:

> ``` none
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

<figure>
<img src="/_static/images/cloud-gcp-vm-09.webp" />
</figure>

9.  Click `Deploy` button.

<figure>
<img src="/_static/images/cloud-gcp-vm-06.webp" />
</figure>

<figure>
<img src="/_static/images/cloud-gcp-vm-07.webp" />
</figure>

Connect to the VyOS instance
-----------

To connect to the VyOS instance, use the SSH key that was generated in the first step.

To retrieve the public IP address, go to the **Google Cloud Console** and navigate to: **Compute Engine** \> **VM instances** <https://console.cloud.google.com/compute/instances?project=vyos-images>

<figure>
<img src="/_static/images/cloud-gcp-vm-08.webp" />
</figure>

Example:

> ``` none
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
