\##########
VyOS Deployment on AWS
\##########

This manual provides detailed step-by-step instructions for deploying a VyOS instance and required resources (VPC, ENIs, Subnets, Security Groups) on AWS.

Prerequisites
========

1\. AWS Account
-----------
Ensure you have an AWS account with administrative access.

2\. IAM Permissions
-----------

To deploy VyOS and related resources, the user must have the following permissions:

- `ec2:` for managing EC2, ENIs, and EIPs.
- `vpc:` for creating VPCs, subnets, and route tables.
- `iam:` for attaching roles.

3\. SSH Key Pair
-----------

You can use Amazon EC2 to create your key pairs, or you can use a third-party tool to create your key pairs and then import them to Amazon EC2.
Amazon EC2 supports:

- `2048-bit SSH-2 RSA keys` for Linux and Windows instances.
- `ED25519 keys` for Linux instances (not supported for Windows).

When you create a key pair using Amazon EC2:

- The `public key` is stored in Amazon EC2.
- You store the `private key` securely on your local machine.

Steps to Create a Key Pair Using Amazon EC2
^^^^^^^^^^^^^^

- Open the Amazon EC2 console <https://console.aws.amazon.com/ec2/>.
- In the navigation pane, under `Network & Security`, choose `Key Pairs`.

<figure>
<img src="/_static/images/cloud-aws-keypair-01.png" />
</figure>

- Choose `Create key pair` and select `AWS region` at the top right corner of the windows where you plan to deploy the VyOS instance.

<figure>
<img src="/_static/images/cloud-aws-keypair-02.png" />
</figure>

\- Configure Key Pair:
""""""""""

> - **Name**: Enter a descriptive name for the key pair, e.g., `vyos-keypair`.
>
> > <div class="note">
> >
> > <div class="title">
> >
> > Note
> >
> > </div>
> >
> > The key name can include up to 255 ASCII characters. It cannot include leading or trailing spaces.
> >
> > </div>
>
> - **Select Key Pair Type**:
>   - For **Linux instances**: Choose either **RSA** or **ED25519**.
>
>   - For **Windows instances**: Choose **RSA**.
>
>     <div class="note">
>
>     <div class="title">
>
>     Note
>
>     </div>
>
>     ED25519 keys are not supported for Windows instances.
>
>     </div>
> - **Private Key File Format**:
>   - **PEM**: Choose this format if using OpenSSH or other SSH clients (e.g., on Linux/macOS).
>   - **PPK**: Choose this format if using PuTTY on Windows.

- **Optional**: Add tags to the key pair. Choose **Add tag** and provide the **key** and **value** for each tag.

- Choose **Create key pair**.

- The private key file will automatically download to your browser.  
  - The file name will match the name you provided (e.g., <span class="title-ref">vyos-keypair.pem</span>), with the extension determined by the format you chose.

<figure>
<img src="/_static/images/cloud-aws-keypair-03.png" />
</figure>

<figure>
<img src="/_static/images/cloud-aws-keypair-04.png" alt="Important Notes" />
<figcaption aria-hidden="true"><strong>Important Notes</strong></figcaption>
</figure>

- **Save the private key file securely**:  
  This is your **only chance** to download the private key. If you lose it, you cannot connect to your instance.

- If you are using SSH on a **macOS or Linux computer**, set the correct permissions for the private key file:

``` none
chmod 400 vyos-keypair.pem
```

If permissions are not set to **400**, you will encounter an **"Unprotected private key file"** error when attempting to connect to the instance.

> **Example Usage for SSH**

``` none
ssh -i vyos-keypair.pem vyos@<Public/Elastic IP>
```

For more information, please visit the official AWS documentation:

<https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html#having-ec2-create-your-key-pair>

4\. VyOS Subscription
-----------
- Go to the AWS Marketplace <https://aws.amazon.com/marketplace> and search for **VyOS**.
- Subscribe to the VyOS AMI.

For more information, please visit:

<https://aws.amazon.com/marketplace/seller-profile?id=7636d180-1710-48bc-acd6-d323c4a0429f>

Create required resources
========

Certain resources need to be created in the AWS infrastructure before creating a VyOS instance, such as a VPC, Subnets, Elastic IPs, Route Tables, Security Groups, and others.

Step 1: Create Virtual Private Cloud (VPC) and Subnets
-----------

1\. Create a VPC
^^^^^^^^^^^^^^

To create a VPC for your AWS environment:

- Go to the **Amazon VPC Console** at <https://console.aws.amazon.com/vpc/>.
- In the navigation pane, choose **Your VPCs**.
- Choose **Create VPC**.

<figure>
<img src="/_static/images/cloud-aws-vpc-01.png" />
</figure>

- **Configure VPC Settings**:  
  - **Name tag - optional**: Enter a descriptive name for your VPC, e.g., `VyOS-VPC`.
  - **IPv4 CIDR Block**: Enter `10.0.0.0/16`.

- Choose **Create VPC**.

<figure>
<img src="/_static/images/cloud-aws-vpc-02.png" />
</figure>

<figure>
<img src="/_static/images/cloud-aws-vpc-03.png" />
</figure>

For more information, please visit the AWS documentation:

<https://docs.aws.amazon.com/vpc/latest/userguide/create-vpc.html>

2\. Create Subnets
^^^^^^^^^^^^^^

Subnets allow you to divide your VPC into smaller IP spaces. Follow these steps to create subnets for both **public** and **private** networks:

- Go to the **Amazon VPC Console** at <https://console.aws.amazon.com/vpc/>.
- In the navigation pane, choose **Subnets**.
- Choose **Create Subnet**.

<figure>
<img src="/_static/images/cloud-aws-subnet-01.png" />
</figure>

\- Configure Subnet Settings:
""""""""""

> - **Public Subnet**:
>   - **VPC**: Select `VyOS-VPC`.
>   - **Name Tag**: `VyOS-Public-Subnet`.
>   - **IPv4 CIDR Block**: `10.0.1.0/24`.
>   - **Availability Zone**: Select an AZ, e.g., `us-east-1a`.
> - **Private Subnet**:
>   - **VPC**: Select `VyOS-VPC`.
>   - **Name Tag**: `VyOS-Private-Subnet`.
>   - **IPv4 CIDR Block**: `10.0.2.0/24`.
>   - **Availability Zone**: Select an AZ, e.g., `us-east-1a`.

- Choose **Create Subnet**.

<figure>
<img src="/_static/images/cloud-aws-subnet-02.png" />
</figure>

<figure>
<img src="/_static/images/cloud-aws-subnet-03.png" />
</figure>

For additional information, please visit the AWS documentation:

<https://docs.aws.amazon.com/vpc/latest/userguide/create-subnets.html>

For additional details about IP addressing for your VPC and subnets, refer to the AWS documentation:

<https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ip-addressing.html>

Step 2: Create and Configure Security Groups
-----------

1\. Create Public Security Group
^^^^^^^^^^^^^^

The **Public Security Group** is used for **outbound connectivity**. All external resources, systems, or networks will connect via this security group.

- Open the **Amazon EC2 Console** at <https://console.aws.amazon.com/ec2/>.
- In the navigation pane, choose **Security Groups**.
- Choose **Create Security Group**.

<figure>
<img src="/_static/images/cloud-aws-sg-01.png" />
</figure>

- **Configure the Security Group**:

  > - **Name**: `VyOS-Public-SG`.
  > - **Description**: "Public security group for outbound connectivity"
  > - **VPC**: Select the VPC in which your VyOS instance resides.

\- Inbound Rules:
""""""""""

> - **SSH**: Port `22`, Source `0.0.0.0/0` (Restrict to your IP for security).
> - **ICMP**: Allow for ping testing purposes.
> - **IPSec**: Allow port `500` (UDP) for ISAKMP (Phase 1 negotiation).
> - **NAT Traversal**: Allow port `4500` (UDP) for NAT-T support in IPsec.
> - **WireGuard**: Allow port `51820` (UDP).
> - **OpenVPN**: Allow port `1194` (UDP or TCP).

<figure>
<img src="/_static/images/cloud-aws-sg-02.png" />
</figure>

- (Optional) Add tags to identify the security group:  
  - **Key**: <span class="title-ref">Name</span>, **Value**: <span class="title-ref">VyOS-Public-SG</span>.

- Choose **Create Security Group**.

<figure>
<img src="/_static/images/cloud-aws-sg-03.png" />
</figure>

2\. Create Private Security Group
^^^^^^^^^^^^^^

The **Private Security Group** is used for **internal connectivity** from internal or VPC-based resources.

- Open the **Amazon EC2 Console**.
- In the navigation pane, choose **Security Groups**.
- Choose **Create Security Group**.

\- Configure the Security Group:
""""""""""

> - **Name**: `VyOS-Private-SG`.
> - **Description**: "Private security group for internal connectivity"
> - **VPC**: Select the VPC in which your VyOS instance resides.

\- Inbound Rules:
""""""""""

> - Allow **All Traffic** (`0.0.0.0/0`) for internal connectivity between resources, VPCs, and other trusted networks.

<figure>
<img src="/_static/images/cloud-aws-sg-04.png" />
</figure>

- (Optional) Add tags to identify the security group:  
  - **Key**: `Name`, **Value**: `VyOS-Private-SG`.

- Choose **Create Security Group**.

<figure>
<img src="/_static/images/cloud-aws-sg-05.png" />
</figure>

For detailed instructions on creating a security group, refer to the official AWS documentation:

<https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/creating-security-group.html>

For more information, refer to the official AWS documentation:

<https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-network-security.html>

Step 3: Create ENIs (Elastic Network Interfaces)
-----------

Network Interfaces (ENIs) are essential for connecting instances to subnets and managing network traffic. Follow the steps below to create **Public** and **Private** ENIs.

- Open the **Amazon EC2 Console** at <https://console.aws.amazon.com/ec2/>.
- In the navigation pane, choose **Network Interfaces**.
- Choose **Create Network Interface**.
- **Configure Network Interface Settings**:

# Public ENI

> - **Name**: `VyOS-Public-ENI`.
> - **Description**: "Network Interface for Public Subnet."
> - **Subnet**: Select the `VyOS-Public-Subnet` you created earlier.
> - **Private IPv4 Address**: Choose **Auto-assign** to let AWS pick an IP address from the subnet.
> - **Security Group**: Select the `VyOS-Public-SG`.
>
> \- (Optional) Add tags to identify the ENIs:  
> **Key**: `Name`, **Value**: `VyOS-Public-ENI`.
>
> - Choose **Create Network Interface**.
>
> <figure>
> <img src="/_static/images/cloud-aws-eni-01.png" />
> </figure>

Private ENI
""""""""""
- **Name**: `VyOS-Private-ENI`.

> - **Description**: "Network Interface for Private Subnet."
> - **Subnet**: Select the `VyOS-Private-Subnet` you created earlier.
> - **Private IPv4 Address**: Choose **Auto-assign** to let AWS pick an IP address from the subnet.
> - **Security Group**: Select the `VyOS-Private-SG`.
>
> \- (Optional) Add tags to identify the ENIs:  
> **Key**: `Name`, **Value**: `VyOS-Private-ENI`.
>
> - Choose **Create Network Interface**.
>
> <figure>
> <img src="/_static/images/cloud-aws-eni-02.png" />
> </figure>

Step 4: Configure Internet Gateway
-----------

An **Internet Gateway** allows communication between your VPC and the internet. Follow the steps below to create and attach an Internet Gateway to your VPC.

1\. Create an Internet Gateway
^^^^^^^^^^^^^^

- Open the **Amazon VPC Console** at <https://console.aws.amazon.com/vpc/>.

- In the navigation pane, choose **Internet Gateways**.

- Choose **Create Internet Gateway**.

- **Configure Internet Gateway**:  
  - (Optional) **Name**: Enter a descriptive name, e.g., `VyOS-IGW`.

- (Optional) Add a tag to identify the Internet Gateway:  
  - **Key**: `Name`, **Value**: `VyOS-IGW`.

- Choose **Create Internet Gateway**.

<figure>
<img src="/_static/images/cloud-aws-igw-01.png" />
</figure>

2\. Attach the Internet Gateway to Your VPC
^^^^^^^^^^^^^^

To enable your VPC to access the internet, attach the Internet Gateway to your VPC:

- After creating the Internet Gateway, select it from the **Internet Gateways** list.

- Choose **Actions \> Attach to VPC**.

- Select the VPC where you want to attach the Internet Gateway:  
  - Choose <span class="title-ref">VyOS-VPC</span> (the VPC you created earlier).

- Choose **Attach Internet Gateway**.

<figure>
<img src="/_static/images/cloud-aws-igw-02.png" />
</figure>

For more details, refer to the official AWS documentation:

<https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html>.

Step 5: Configure Route Tables
-----------

Route tables define the paths for network traffic within your VPC. In this step, we will configure **Public** and **Private** route tables to control traffic flow for their respective subnets.

1\. Create and Configure the Public Route Table
^^^^^^^^^^^^^^

- **Go to the Route Tables Section:**  
  - Open the **Amazon VPC Console** at <https://console.aws.amazon.com/vpc/>.
  - In the left navigation pane, choose **Route Tables**.

- **Create a New Route Table:**

  > - In the **Route Tables** section, choose **Create Route Table**.
  > - Configure the route table:
  >   - **Name**: `Public RT`.
  >   - **VPC**: Select the `VyOS-VPC`.
  >   - Click **Create Route Table**.
  >
  > <figure>
  > <img src="/_static/images/cloud-aws-route-01.png" />
  > </figure>

- **Add a Route to the Internet Gateway:**

  > - Go to the **Routes** tab and click **Edit Routes**.
  > - Click **Add Route** and enter:
  >   - **Destination**: `0.0.0.0/0` (Default route to all IPs).
  >   - **Target**: Select the **Internet Gateway** (`VyOS-IGW`) you created earlier.
  >   - Click **Save Routes**.
  >
  > <figure>
  > <img src="/_static/images/cloud-aws-route-02.png" />
  > </figure>

- **Associate the Public Subnet:**

  > - Go to the **Subnet Associations** tab and click **Edit Subnet Associations**.
  > - Select the **Public Subnet** (`VyOS-Public-Subnet`).
  > - Click **Save associations**.
  >
  > <figure>
  > <img src="/_static/images/cloud-aws-route-03.png" />
  > </figure>

Step 6: Allocate and Attach Elastic IP (EIP)
-----------

An **Elastic IP (EIP)** is a static, public IPv4 address designed for dynamic cloud computing. Elastic IP addresses can help maintain consistent connectivity to instances, even if they are stopped, rebooted, or replaced.

- Elastic IP addresses are **public IPv4 addresses** and are reachable from the internet.
- They can be quickly remapped to different instances or network interfaces within your AWS account to mask failures.

For more details, refer to the official AWS documentation:

<https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html>.

Steps to Allocate and Attach Elastic IP
^^^^^^^^^^^^^^

1\. Allocate Elastic IP
""""""""""

- Open the **Amazon EC2 Console** at <https://console.aws.amazon.com/ec2/>.

- In the navigation pane, choose **Elastic IPs**.

- Choose **Allocate Elastic IP address**.

- **Elastic IP address settings**:  
  - For **Public IPv4 address pool**, select **Amazon's pool of IPv4 addresses**.

- (Optional) Add a tag:  
  - **Key**: `Name`, **Value**: `VyOS-EIP`.

- Choose **Allocate**.

<figure>
<img src="/_static/images/cloud-aws-eip-01.png" />
</figure>

2\. Attach Elastic IP to Public ENI
""""""""""

- Go to **EC2 \> Elastic IPs**.

- Select the **Elastic IP** you just allocated.

- Choose **Actions \> Associate Elastic IP address**.

- **Configure Association**:

  > - **Resource type**: Choose **Network Interface**.
  > - **Network Interface**: Select the **VyOS-Public-ENI** created earlier.
  > - **Private IPv4 Address**: Ensure it is correctly selected.

- (Optional) Select **Allow the Elastic IP address to be reassociated** if the EIP is already associated with another resource.

- Choose **Associate**.

<figure>
<img src="/_static/images/cloud-aws-eip-02.png" />
</figure>

**Why Use Elastic IP?**

- **Consistency**: The EIP remains static, even if the instance stops or is replaced.
- **Failover**: If an instance fails, you can remap the EIP to a new instance to restore services quickly.
- **DNS Integration**: You can point your domain to the Elastic IP for consistent public access.

For additional details, refer to the AWS documentation:

<https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/working-with-eips.html>

Launch VyOS Instance
========

Follow the detailed instructions below to launch a VyOS instance in your AWS environment with two ENIs (Public and Private).

- Open the **Amazon EC2 Console** at <https://console.aws.amazon.com/ec2/>.

- In the EC2 dashboard, choose **Launch Instance**.

- **Configure Instance Details**:

  > - **Name and Tags**:
  >
  >   - Under **Name and tags**, enter a descriptive name for your instance, e.g., `VyOS-Instance`.
  >
  >   <figure>
  >   <img src="/_static/images/cloud-aws-vyos-01.png" />
  >   </figure>
  >
  > - **Application and OS Images (AMI)**:
  >
  >   - Choose **Browse more AMIs**.
  >   - Go to the **AWS Marketplace** tab and search for **VyOS**.
  >   - Choose the VyOS AMI that matches your requirements and click **Select**.
  >
  >   <figure>
  >   <img src="/_static/images/cloud-aws-vyos-02.png" />
  >   </figure>
  >
  >   <figure>
  >   <img src="/_static/images/cloud-aws-vyos-03.png" />
  >   </figure>
  >
  > - **Instance Type**:
  >
  >   - Select the instance type that fits your workload. For example:
  >     - `c5n.large` (or larger recommended for VyOS).
  >
  >   > <figure>
  >   > <img src="/_static/images/cloud-aws-vyos-04.png" />
  >   > </figure>
  >
  > - **Key pair (login)**:
  >
  >   - For **Key pair name**, select the key pair you created earlier (`vyos-keypair`).
  >   - If you do not have a key pair, create a new one and download the private key file.
  >
  >   <figure>
  >   <img src="/_static/images/cloud-aws-vyos-05.png" />
  >   </figure>
  >
  > - **Network Settings**:
  >
  >   - **VPC**: Select `VyOS-VPC`.
  >   - **Subnet**: Select the **Public Subnet** (`VyOS-Public-Subnet`).
  >   - **Auto-assign Public IP**: **Disable**.
  >   - **Firewall (security groups)**: Select the **Select existing security group**.
  >   - **Common security groups**: Live empty (Do not select any security groups).
  >
  >   <figure>
  >   <img src="/_static/images/cloud-aws-vyos-09.png" />
  >   </figure>
  >
  > - **Advanced network configuration**
  >
  >   > - **Network interface 1** select `VyOS-Public-ENI`
  >   >
  >   > <figure>
  >   > <img src="/_static/images/cloud-aws-vyos-07.png" />
  >   > </figure>
  >   >
  >   > - Click to the **Add network interface** button
  >   > - **Network interface 2** select `VyOS-Private-ENI`
  >   >
  >   > <figure>
  >   > <img src="/_static/images/cloud-aws-vyos-08.png" />
  >   > </figure>
  >   >
  >   > - In **Subnet** deselect subnet
  >   >
  >   > <figure>
  >   > <img src="/_static/images/cloud-aws-vyos-10.png" />
  >   > </figure>

- Review the instance configuration in the **Summary** panel and choose **Launch Instance**.

- Wait until the instance status changes to **Running**.

<figure>
<img src="/_static/images/cloud-aws-vyos-11.png" />
</figure>

Connect to the VyOS instance
-----------

> You can only connect to the VyOS instance via **SSH** protocol. Use the default username **vyos**, **Elastic IP** and **SSH Key Pair** to connect to the VyOS instance via SSH:
>
> ``` none
> ssh -i vyos-keypair.pem vyos@35.152.131.62
> ```

Deployment of VyOS Instance and Required Resources via CloudFormation Template
========

These CloudFormation templates automate the deployment of a VyOS instance on AWS, configuring essential components such as:

- VPC
- Public and private subnets
- Internet Gateway
- Route Tables
- Elastic IPs
- Security Groups

You can download or clone these templates from the GitHub repository and use them in your environment:

<https://github.com/vyos/vyos-automation/tree/main/CloudFormation>

Deployment of VyOS Instance and Required Resources via Terraform
========

These Terraform projects automate the deployment of a VyOS instance on AWS, configuring essential components such as:

- VPC
- Public and private subnets
- Internet Gateway
- Route Tables
- Elastic IPs
- Security Groups

You can download or clone these templates from the GitHub repository and use them in your environment:

<https://github.com/vyos/vyos-automation/tree/main/Terraform/AWS/>

## Amazon CloudWatch Agent Usage

To use Amazon CloudWatch Agent, configure it within the Amazon SSM Parameter Store. If you don't have a configuration yet, do `configuration_creation`.

1.  Create an `IAM (Identity and Access Management)` role for the `EC2 (Elastic Compute Cloud)` instance to access CloudWatch service, and name it CloudWatchAgentServerRole. The role should contain two default policies: CloudWatchAgentServerPolicy and AmazonSSMManagedInstanceCore.
2.  Attach the created role to your VyOS `EC2 (Elastic Compute Cloud)` instance.
3.  Ensure that amazon-cloudwatch-agent package is installed.

> ``` none
> $ sudo apt list --installed | grep amazon-cloudwatch-agent
> ```
>
> <div class="note">
>
> <div class="title">
>
> Note
>
> </div>
>
> The amazon-cloudwatch-agent package is normally included in VyOS 1.3.3+ and 1.4+
>
> </div>

3.  Retrieve an existing CloudWatch Agent configuration from the `SSM (Systems Manager)` Parameter Store.

> ``` none
> $ sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:<your-configuration-name>
> ```
>
> This step also enables systemd service and runs it.
>
> <div class="note">
>
> <div class="title">
>
> Note
>
> </div>
>
> The VyOS platform-specific scripts feature is under development. Thus, this step should be repeated manually after changing system image (`/installation/update`)
>
> </div>

### CloudWatch SSM Configuration creation

Creating the Amazon Cloudwatch Agent Configuration in Amazon `SSM (Systems Manager)` Parameter Store.

1.  Create an `IAM (Identity and Access Management)` role for your `EC2 (Elastic Compute Cloud)` instance to access the CloudWatch service. Name it CloudWatchAgentAdminRole. The role should contain at two default policies: CloudWatchAgentAdminPolicy and AmazonSSMManagedInstanceCore.

> <div class="note">
>
> <div class="title">
>
> Note
>
> </div>
>
> CloudWatchAgentServerRole is too permissive and should be used for single configuration creation and deployment. That's why after completion of step \#3 highly recommended to replace instance CloudWatchAgentAdminRole role with CloudWatchAgentServerRole.
>
> </div>

2.  Run Cloudwatch configuration wizard.

> ``` none
> $ sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
> ```

3.  When prompted, answer "yes" to the question "Do you want to store the config in the SSM parameter store?".

## References

- <https://console.aws.amazon.com/>
- <https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/create-iam-roles-for-cloudwatch-agent.html>
- <https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Agent-on-EC2-Instance-fleet.html>
