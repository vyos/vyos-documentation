.. _quick-start:

###########
Quick Start
###########

This chapter will guide you on how to get up to speed quickly using your new
VyOS system. It will show you a very basic configuration example that will
provide a :ref:`nat` gateway for a device with two network interfaces
(`eth0` and `eth1`).

.. _quick-start-configuration-mode:

Configuration Mode
##################

By default, VyOS is in operational mode, and the command prompt displays a `$`.
To configure VyOS, you will need to enter configuration mode, resulting in the
command prompt displaying a `#`, as demonstrated below:

.. code-block:: none

  vyos@vyos$ configure
  vyos@vyos#

Commit and Save
################

After every configuration change, you need to apply the changes by using the
following command:

.. code-block:: none

  commit

Once your configuration works as expected, you can save it permanently by using
the following command:

.. code-block:: none

  save

Interface Configuration
#######################

* Your outside/WAN interface will be `eth0`. It will receive its interface
  address via DHCP.
* Your internal/LAN interface will be `eth1`. It will use a static IP address
  of `192.168.0.1/24`.

After switching to :ref:`quick-start-configuration-mode` issue the following
commands:

.. code-block:: none

  set interfaces ethernet eth0 address dhcp
  set interfaces ethernet eth0 description 'OUTSIDE'
  set interfaces ethernet eth1 address '192.168.0.1/24'
  set interfaces ethernet eth1 description 'INSIDE'


SSH Management
##############

After switching to :ref:`quick-start-configuration-mode` issue the following
commands, and your system will listen on every interface for incoming SSH
connections. You might want to check the :ref:`ssh` chapter on how to listen
on specific addresses only.

.. code-block:: none

  set service ssh port '22'


.. _dhcp-dns-quick-start:

DHCP/DNS quick-start
####################

The following settings will configure DHCP and DNS services on
your internal/LAN network, where VyOS will act as the default gateway and
DNS server.

* The default gateway and DNS recursor address will be `192.168.0.1/24`
* The address range `192.168.0.2/24 - 192.168.0.8/24` will be reserved for
  static assignments
* DHCP clients will be assigned IP addresses within the range of
  `192.168.0.9 - 192.168.0.254` and have a domain name of `internal-network`
* DHCP leases will hold for one day (86400 seconds)
* VyOS will serve as a full DNS recursor, replacing the need to utilize Google,
  Cloudflare, or other public DNS servers (which is good for privacy)
* Only hosts from your internal/LAN network can use the DNS recursor

.. code-block:: none

  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 default-router '192.168.0.1'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 name-server '192.168.0.1'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 domain-name 'vyos.net'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 lease '86400'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 range 0 start '192.168.0.9'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 range 0 stop '192.168.0.254'

  set service dns forwarding cache-size '0'
  set service dns forwarding listen-address '192.168.0.1'
  set service dns forwarding allow-from '192.168.0.0/24'


NAT
###

The following settings will configure :ref:`source-nat` rules for our
internal/LAN network, allowing hosts to communicate through the outside/WAN
network via IP masquerade.

.. code-block:: none

  set nat source rule 100 outbound-interface 'eth0'
  set nat source rule 100 source address '192.168.0.0/24'
  set nat source rule 100 translation address masquerade

Firewall
########

.. note:: Starting from VyOS 1.4-rolling-202308040557, a new firewall structure can be
   found on all vyos instalations. Documentation for most of the new firewall CLI
   can be found in the :ref:`firewall` chapter. The legacy firewall is still available
   for versions before 1.4-rolling-202308040557 and can be found in the
   :ref:`firewall-legacy` chapter. The examples in this section use the
   new configuration.

Configure Firewall Groups
-------------------------

To make firewall configuration easier, we can create groups of interfaces,
networks, addresses, ports, and domains that describe different parts of
our network. We can then use them for filtering within our firewall rulesets,
allowing for more concise and readable configuration.

In this case, we will create two interface groups—a `WAN` group for our
interfaces connected to the public internet and a `LAN` group for the interfaces
connected to our internal network. Additionally, we will create a network group,
`NET-INSIDE-v4`, that contains our internal subnet.

.. code-block:: none

  set firewall group interface-group WAN interface eth0
  set firewall group interface-group LAN interface eth1
  set firewall group network-group NET-INSIDE-v4 network '192.168.0.0/24'

Stateful Packet Filtering
-------------------------

Using the new firewall structure, we can create a common chain for stateful
connection filtering of multiple interfaces (or multiple netfilter hooks on one
interface). Those individual chains can then jump to the common chain for
stateful connection filtering, returning to the original chain for further
rule processing if no action is taken on the packet:

.. code-block:: none

  # Create a new chain for stateful connection filtering that
  # will return to the original chain if no action is taken
  set firewall ipv4 name CONN_FILTER default-action 'return'

  # Allow established and related traffic
  set firewall ipv4 name CONN_FILTER rule 10 action 'accept'
  set firewall ipv4 name CONN_FILTER rule 10 state established 'enable'
  set firewall ipv4 name CONN_FILTER rule 10 state related 'enable'

  # Drop invalid traffic
  set firewall ipv4 name CONN_FILTER rule 20 action 'drop'
  set firewall ipv4 name CONN_FILTER rule 20 state invalid 'enable'

Then, we can jump to the common chain from both the `forward` and `input` hooks
as the first filtering rule in the respective chains:

.. code-block:: none

  # Add a filter for the `forward` hook that sends all packets to CONN_FILTER
  set firewall ipv4 forward filter rule 10 action 'jump'
  set firewall ipv4 forward filter rule 10 jump-target CONN_FILTER

  # Add a filter for the `input` hook that sends all packets to that same chain
  set firewall ipv4 input filter rule 10 action 'jump'
  set firewall ipv4 input filter rule 10 jump-target CONN_FILTER

Alternatively, you can take the more traditional approach of creating rules on
each hook's chain for stateful connection filtering:

.. code-block:: none

  set firewall ipv4 forward filter rule 5 action 'accept'
  set firewall ipv4 forward filter rule 5 state established 'enable'
  set firewall ipv4 forward filter rule 5 state related 'enable'
  set firewall ipv4 forward filter rule 10 action 'drop'
  set firewall ipv4 forward filter rule 10 state invalid 'enable'

  set firewall ipv4 input filter rule 5 action 'accept'
  set firewall ipv4 input filter rule 5 state established 'enable'
  set firewall ipv4 input filter rule 5 state related 'enable'
  set firewall ipv4 input filter rule 10 action 'drop'
  set firewall ipv4 input filter rule 10 state invalid 'enable'

Block Incoming Traffic
----------------------

Now that we have configured stateful connection filtering to allow traffic from
established and related connections, we can block all other incoming traffic
addressed to our local network.

Create a new chain (`OUTSIDE-IN`) which will drop all traffic that is not
explicity allowed at some point in the chain. Then, we can jump to that chain
from the `forward` hook when traffic is coming from the `WAN` interface group
and is addressed to our local network.

.. code-block:: none

  set firewall ipv4 name OUTSIDE-IN default-action 'drop'

  set firewall ipv4 forward filter rule 100 action jump
  set firewall ipv4 forward filter rule 100 jump-target OUTSIDE-IN
  set firewall ipv4 forward filter rule 100 inbound-interface interface-group WAN
  set firewall ipv4 forward filter rule 100 destination group network-group NET-INSIDE-v4

We should also block all traffic destinated to the router itself that isn't
explicitly allowed at some point in the chain for the `input` hook. As
we've already configured stateful packet filtering above, we only need to
set the default action to `drop`:

.. code-block:: none

  set firewall ipv4 input filter default-action 'drop'

Configure Management Access
---------------------------

We can now configure access to the router itself, allowing SSH
access from the inside/LAN network and rate limiting SSH access from the
outside/WAN network.

First, create a new dedicated chain (`VyOS_MANAGEMENT`) for management
access, which returns to the parent chain if no action is taken. Add a rule
to accept traffic from the `LAN` interface group:

.. code-block:: none

  set firewall ipv4 name VyOS_MANAGEMENT default-action 'return'

Configure a rule on the `input` hook filter to jump to the `VyOS_MANAGEMENT`
chain when new connections are addressed to port 22 (SSH) on the router itself:

.. code-block:: none

  set firewall ipv4 input filter rule 20 action jump
  set firewall ipv4 input filter rule 20 jump-target VyOS_MANAGEMENT
  set firewall ipv4 input filter rule 20 destination port 22
  set firewall ipv4 input filter rule 20 protocol tcp

Finally, configure the `VyOS_MANAGEMENT` chain to accept connection from the
`LAN` interface group while limiting requests coming from the `WAN` interface
group to 4 per minute:

.. code-block:: none

  set firewall ipv4 name VyOS_MANAGEMENT rule 15 action 'accept'
  set firewall ipv4 name VyOS_MANAGEMENT rule 15 inbound-interface interface-group 'LAN'

  set firewall ipv4 name VyOS_MANAGEMENT rule 20 action 'drop'
  set firewall ipv4 name VyOS_MANAGEMENT rule 20 recent count 4
  set firewall ipv4 name VyOS_MANAGEMENT rule 20 recent time minute
  set firewall ipv4 name VyOS_MANAGEMENT rule 20 state new enable
  set firewall ipv4 name VyOS_MANAGEMENT rule 20 inbound-interface interface-group 'WAN'

  set firewall ipv4 name VyOS_MANAGEMENT rule 21 action 'accept'
  set firewall ipv4 name VyOS_MANAGEMENT rule 21 state new enable
  set firewall ipv4 name VyOS_MANAGEMENT rule 21 inbound-interface interface-group 'WAN'

Allow Access to Services
------------------------

We can now configure access to the services running on this router, allowing
all connections coming from localhost:

.. code-block:: none

  set firewall ipv4 input filter rule 30 action 'accept'
  set firewall ipv4 input filter rule 30 source address 127.0.0.0/8

Finally, we can allow access to the DNS recursor we configured earlier,
accepting traffic bound for port 53 from all hosts on the `NET-INSIDE-v4`
network:

.. code-block:: none

  set firewall ipv4 input filter rule 40 action 'accept'
  set firewall ipv4 input filter rule 40 destination port '53'
  set firewall ipv4 input filter rule 40 protocol 'tcp_udp'
  set firewall ipv4 input filter rule 40 source group network-group NET-INSIDE-v4

Commit changes, save the configuration, and exit configuration mode:

.. code-block:: none

  vyos@vyos# commit
  vyos@vyos# save
  Saving configuration to '/config/config.boot'...
  Done
  vyos@vyos# exit
  vyos@vyos$

Hardening
#########

Especially if you are allowing SSH remote access from the outside/WAN
interface, there are a few additional configuration steps that should be taken.

Replace the default `vyos` system user:

.. code-block:: none

  set system login user myvyosuser authentication plaintext-password mysecurepassword

Set up :ref:`ssh_key_based_authentication`:

.. code-block:: none

  set system login user myvyosuser authentication public-keys myusername@mydesktop type ssh-rsa
  set system login user myvyosuser authentication public-keys myusername@mydesktop key contents_of_id_rsa.pub

Finally, try and SSH into the VyOS install as your new user. Once you have
confirmed that your new user can access your router without a password, delete
the original ``vyos`` user and completely disable password authentication for
:ref:`ssh`:

.. code-block:: none

  delete system login user vyos
  set service ssh disable-password-authentication

As above, commit your changes, save the configuration, and exit
configuration mode:

.. code-block:: none

  vyos@vyos# commit
  vyos@vyos# save
  Saving configuration to '/config/config.boot'...
  Done
  vyos@vyos# exit
  vyos@vyos$

You now should have a simple yet secure and functioning router to experiment
with further. Enjoy!
