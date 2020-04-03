.. _quick-start:

###########
Quick Start
###########

This chapter will guide you on how to get up to speed using your new VyOS
system. It will show you a very basic configuration example that will provide
a :ref:`nat` gateway for a device with two network interfaces (`eth0` and
`eth1`).

.. _quick-start-configuration-mode:

Configuration Mode
##################

.. code-block:: none

  vyos@vyos$ configure
  vyos@vyos#

Commit and Save
################

After every configuration change you need to apply the changes by using the

.. code-block:: none

  commit

Once your configuration works as expected you can save it permanently.

.. code-block:: none

  save

Interface Configuration
#######################

* Your outside/WAN interface will be `eth0`, it receives it's interface address
  be means of DHCP.
* Your internal/LAN interface is `eth1`. It uses a fixed IP address of
  `192.168.0.1/24`.

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


Configure DHCP/DNS Servers
##########################

* Provide DHCP service on your internal/LAN network where VyOS will act
  as the default gateway and DNS server.
* Client IP addresses are assigned from the range ``192.168.0.9 -
  192.168.0.254``
* DHCP leases will hold for one day (86400 seconds)
* VyOS will server as full DNS recursor - no need to bother the Google or
  Cloudflare DNS servers (good for privacy)
* Only clients from your internal/LAN network can use the DNS resolver

.. code-block:: none

  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 default-router '192.168.0.1'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 dns-server '192.168.0.1'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 domain-name 'internal-network'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 lease '86400'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 range 0 start 192.168.0.9
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 range 0 stop '192.168.0.254'

  set service dns forwarding cache-size '0'
  set service dns forwarding listen-address '192.168.0.1'
  set service dns forwarding allow-from '192.168.0.0/24'


NAT
###

* Configure :ref:`source-nat` for our internal/LAN network

.. code-block:: none

  set nat source rule 100 outbound-interface 'eth0'
  set nat source rule 100 source address '192.168.0.0/24'
  set nat source rule 100 translation address masquerade


Firewall
########

Add a set of firewall policies for our outside/WAN interface.

This configuration creates a proper stateful firewall that blocks all traffic
which was not initiated from the internal/LAN side first.

.. code-block:: none

  set firewall name OUTSIDE-IN default-action 'drop'
  set firewall name OUTSIDE-IN rule 10 action 'accept'
  set firewall name OUTSIDE-IN rule 10 state established 'enable'
  set firewall name OUTSIDE-IN rule 10 state related 'enable'

  set firewall name OUTSIDE-LOCAL default-action 'drop'
  set firewall name OUTSIDE-LOCAL rule 10 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 10 state established 'enable'
  set firewall name OUTSIDE-LOCAL rule 10 state related 'enable'
  set firewall name OUTSIDE-LOCAL rule 20 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 20 icmp type-name 'echo-request'
  set firewall name OUTSIDE-LOCAL rule 20 protocol 'icmp'
  set firewall name OUTSIDE-LOCAL rule 20 state new 'enable'

If you wanted to enable SSH access to your firewall from the outside/WAN
interface, you could create some additional rules to allow that kind of traffic.

These rules allow SSH traffic and rate limit it to 4 requests per minute. This
blocks brute-forcing attempts:

.. code-block:: none

  set firewall name OUTSIDE-LOCAL rule 30 action 'drop'
  set firewall name OUTSIDE-LOCAL rule 30 destination port '22'
  set firewall name OUTSIDE-LOCAL rule 30 protocol 'tcp'
  set firewall name OUTSIDE-LOCAL rule 30 recent count '4'
  set firewall name OUTSIDE-LOCAL rule 30 recent time '60'
  set firewall name OUTSIDE-LOCAL rule 30 state new 'enable'

  set firewall name OUTSIDE-LOCAL rule 31 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 31 destination port '22'
  set firewall name OUTSIDE-LOCAL rule 31 protocol 'tcp'
  set firewall name OUTSIDE-LOCAL rule 31 state new 'enable'

Apply the firewall policies:

.. code-block:: none

  set interfaces ethernet eth0 firewall in name 'OUTSIDE-IN'
  set interfaces ethernet eth0 firewall local name 'OUTSIDE-LOCAL'

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

Especially if you are allowing SSH remote access from the outside/WAN interface,
there are a few additional configuration steps that should be taken.

Replace the default `vyos` system user:

.. code-block:: none

  set system login user myvyosuser authentication plaintext-password mysecurepassword

Set up :ref:`ssh_key_based_authentication`:

.. code-block:: none

  set system login user myvyosuser authentication public-keys myusername@mydesktop type ssh-rsa
  set system login user myvyosuser authentication public-keys myusername@mydesktop key contents_of_id_rsa.pub

Finally, try and SSH into the VyOS install as your new user. Once you have
confirmed that your new user can access your router without a password, delete
the original ``vyos`` user and probably disable password authentication for
:ref:`ssh` at all:

.. code-block:: none

  delete system login user vyos
  set service ssh disable-password-authentication

