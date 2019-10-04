.. _quick-start:

Quick Start Guide
=================

Below is a very basic configuration example that will provide a NAT gateway
for a device with two interfaces.

Enter configuration mode:

.. code-block:: sh

  vyos@vyos$ configure
  vyos@vyos#

Configure network interfaces:

.. code-block:: sh

  set interfaces ethernet eth0 address dhcp
  set interfaces ethernet eth0 description 'OUTSIDE'
  set interfaces ethernet eth1 address '192.168.0.1/24'
  set interfaces ethernet eth1 description 'INSIDE'

Enable SSH for remote management:

.. code-block:: sh

  set service ssh port '22'

Configure DHCP Server and DNS
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: sh

  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 default-router '192.168.0.1'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 dns-server '192.168.0.1'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 domain-name 'internal-network'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 lease '86400'
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 range 0 start 192.168.0.9
  set service dhcp-server shared-network-name LAN subnet 192.168.0.0/24 range 0 stop '192.168.0.254'

And a DNS forwarder:

.. code-block:: sh

  set service dns forwarding cache-size '0'
  set service dns forwarding listen-address '192.168.0.1'
  set service dns forwarding name-server '8.8.8.8'
  set service dns forwarding name-server '8.8.4.4'

NAT and Firewall
^^^^^^^^^^^^^^^^

Configure Source NAT for our "Inside" network.

.. code-block:: sh

  set nat source rule 100 outbound-interface 'eth0'
  set nat source rule 100 source address '192.168.0.0/24'
  set nat source rule 100 translation address masquerade

Add a set of firewall policies for our "Outside" interface.  

This configuration creates a proper stateful firewall that blocks all traffic:

.. code-block:: sh

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

If you wanted to enable SSH access to your firewall from the the Internet, you could create some additional rules to allow the traffic.

These rules allow SSH traffic and rate limit it to 4 requests per minute. This blocks brute-forcing attempts:

.. code-block:: sh

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

.. code-block:: sh

  set interfaces ethernet eth0 firewall in name 'OUTSIDE-IN'
  set interfaces ethernet eth0 firewall local name 'OUTSIDE-LOCAL'

Commit changes, save the configuration, and exit configuration mode:

.. code-block:: sh

  vyos@vyos# commit
  vyos@vyos# save
  Saving configuration to '/config/config.boot'...
  Done
  vyos@vyos# exit
  vyos@vyos$

Basic QoS
^^^^^^^^^

The traffic policy subsystem provides an interface to Linux traffic control
(tc_).

One common use of traffic policy is to limit bandwidth for an interface. In
the example below we limit bandwidth for our LAN connection to 200 Mbit download
and out WAN connection to 50 Mbit upload:

.. code-block:: sh

  set traffic-policy shaper WAN-OUT bandwidth '50Mbit'
  set traffic-policy shaper WAN-OUT default bandwidth '50%'
  set traffic-policy shaper WAN-OUT default ceiling '100%'
  set traffic-policy shaper WAN-OUT default queue-type 'fair-queue'
  set traffic-policy shaper LAN-OUT bandwidth '200Mbit'
  set traffic-policy shaper LAN-OUT default bandwidth '50%'
  set traffic-policy shaper LAN-OUT default ceiling '100%'
  set traffic-policy shaper LAN-OUT default queue-type 'fair-queue'

Resulting in the following configuration:

.. code-block:: sh

  traffic-policy {
      shaper WAN-OUT {
          bandwidth 50Mbit
          default {
              bandwidth 50%
              ceiling 100%
              queue-type fair-queue
          }
      }
      shaper LAN-OUT {
          bandwidth 200Mbit
          default {
              bandwidth 50%
              ceiling 100%
              queue-type fair-queue
          }
      }
  }

Once defined, a traffic policy can be applied to each interface using the
interface-level traffic-policy directive:

.. code-block:: sh

  set interfaces ethernet eth0 traffic-policy out 'WAN-OUT'
  set interfaces ethernet eth1 traffic-policy out 'LAN-OUT'

.. note:: A traffic policy can also be defined to match specific traffic
   flows using class statements.

VyOS 1.2 (Crux) also supports HFSC (:code:`set traffic-policy shaper-hfsc`)

See further information in the :ref:`qos` chapter.

Security Hardening
^^^^^^^^^^^^^^^^^^

Especially if you are allowing SSH access from the Internet, there are a few additional configuration steps that should be taken.

Create a user to replace the default `vyos` user:

.. code-block:: sh

  set system login user myvyosuser level admin
  set system login user myvyosuser authentication plaintext-password mysecurepassword

Set up SSH key based authentication.  For example, on Linux you'd want to run `ssh-keygen -t rsa`.  Then the contents of `id_rsa.pub` would be used below:

.. code-block:: sh

  set system login user myvyosuser authentication public-keys myusername@mydesktop type ssh-rsa
  set system login user myvyosuser authentication public-keys myusername@mydesktop key contents_of_id_rsa.pub

Or you can use the `loadkey` command. Commit and save.

Finally, try and ssh into the VyOS install as your new user.  

Once you have confirmed that your new user can access your server, without a password, delete the original `vyos` user and disable password authentication into SSH:

.. code-block:: sh

  delete system login user vyos
  set service ssh disable-password-authentication

Commit and save.



.. _tc: http://en.wikipedia.org/wiki/Tc_(Linux)
