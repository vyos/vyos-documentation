.. _cloud-init:

###############
VyOS cloud-init
###############

Cloud instances of VyOS are initialized using the industry-standard cloud-init. 
Via cloud-init, users can execute shell commands and configure the router.

The initialization is guided by a set of instructions--known as user 
data--provided by the user at launch time. VyOS implements a user-data
format called cloud-config.

Major cloud providers offer a means of providing user-data at the time
of instance launch. Typically the user includes user-data as plain
text and the cloud provider's platform base64 encodes the user-data
before injecting it into the instance. 


************************
cloud-config file format
************************


A cloud-config document is written in YAML. The file must begin
with "#cloud-config". The key used to designate a VyOS configuration
is "vyos_config_commands". What follows is VyOS configuration using
the "set-style" syntax.

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

***************
Troubleshooting
***************

If you encounter problems, verify that the cloud-config document contains
valid YAML. Online resources such as https://yamlvalidator.com/ provide
a simple tool for validating YAML.

cloud-init logs to /var/log/cloud-init.log. This file can be helpful in
determining why the configuration varies from what you expect.

