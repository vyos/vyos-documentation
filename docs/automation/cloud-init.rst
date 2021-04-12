.. _cloud-init:

###############
VyOS cloud-init
###############

Cloud instances of VyOS are initialized using the industry-standard cloud-init. 
Via cloud-init, the system performs tasks such as injecting SSH keys and
configuring the network. In addition, the user can supply a custom
configuration at the time of instance launch.

**************
Config Sources
**************

VyOS support three type of config sources.

.. stop_vyoslinter

* Metadata - Metadata is sourced by the cloud platform or hypervisor. In some clouds, there is implemented as an HTTP endpoint at http://169.254.169.254.

* Network configuration - Ths config source informs the system about the network.

* User-data - User-data is specified by the user. This config source offers the most flexibility and will be the focus of this documentation.

.. start_vyoslinter


*********
User-data
*********

Major cloud providers offer a means of providing user-data at the time
of instance launch. Typically the user includes user-data as plain
text and the cloud provider's platform base64 encodes the user-data
before injecting it into the instance. 

VyOS implements a user-data format called cloud-config.


************************
cloud-config file format
************************


A cloud-config document is written in YAML. The file must begin
with "#cloud-config". The key used to designate a VyOS configuration
is "vyos_config_commands". What follows is VyOS configuration using
the "set-style" syntax. Both "set" and "delete" commands are supported.

Commands requirements:

* one command per line
* if command ends in a value, it must be inside single quotes
* a single-quote symbol is not allowed inside command or value


The commands list produced by the `show configuration commands` command on a
VyOS router should comply with all the requirements, so it is easy to get a 
proper commands list by copying it from another router.

The configuration specified in the cloud-config document is merged with
the default configuration and saved to /config/config.boot.

Here is an example cloud-config.

.. code-block:: yaml

   #cloud-config
   vyos_config_commands:
     - set system host-name 'vyos-prod-ashburn'
     - set system ntp server 1.pool.ntp.org
     - set system ntp server 2.pool.ntp.org
     - delete interfaces ethernet eth1 address 'dhcp'
     - set interfaces ethernet eth1 address '172.31.7.247/20'
     - set protocols static route '172.31.0.0/16' next-hop '100.64.16.1'

*************************
System Defaults/Fallbacks
*************************

These are the VyOS defaults and fallbacks.

* SSH is configured on port 22
* vyos/vyos credentials if no others specified by data source
* DHCP on first Ethernet interface if no network configuration is provided


All of these can be overridden using configuration in user-data.


***************
Troubleshooting
***************

If you encounter problems, verify that the cloud-config document contains
valid YAML. Online resources such as https://yamlvalidator.com/ provide
a simple tool for validating YAML.

cloud-init logs to /var/log/cloud-init.log. This file can be helpful in
determining why the configuration varies from what you expect.

