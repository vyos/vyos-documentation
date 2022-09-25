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
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 range 0 start 192.168.0.9
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
interface, you could create some additional rules to allow that kind of
traffic.

These rules allow SSH traffic and rate limit it to 4 requests per minute. This
blocks brute-forcing attempts:

.. code-block:: none

  set firewall name OUTSIDE-LOCAL rule 30 action 'drop'
  set firewall name OUTSIDE-LOCAL rule 30 destination port '22'
  set firewall name OUTSIDE-LOCAL rule 30 protocol 'tcp'
  set firewall name OUTSIDE-LOCAL rule 30 recent count '4'
  set firewall name OUTSIDE-LOCAL rule 30 recent time 'minute'
  set firewall name OUTSIDE-LOCAL rule 30 state new 'enable'

  set firewall name OUTSIDE-LOCAL rule 31 action 'accept'
  set firewall name OUTSIDE-LOCAL rule 31 destination port '22'
  set firewall name OUTSIDE-LOCAL rule 31 protocol 'tcp'
  set firewall name OUTSIDE-LOCAL rule 31 state new 'enable'

Apply the firewall policies:

.. code-block:: none

  set firewall interface eth0 in name 'OUTSIDE-IN'
  set firewall interface eth0 local name 'OUTSIDE-LOCAL'

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
