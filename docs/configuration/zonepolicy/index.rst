
###########
Zone Policy
###########


.. toctree::
   :maxdepth: 1
   :includehidden:

In zone-based policy, interfaces are assigned to zones, and inspection policy is applied to traffic moving between the zones and acted on according to firewall rules. 
A Zone is a group of interfaces that have similar functions or features. It establishes the security borders of a network. 
A zone defines a boundary where traffic is subjected to policy restrictions as it crosses to another region of a network.

Key Points:

* A zone must be configured before an interface is assigned to it and an interface can be assigned to only a single zone.
* All traffic to and from an interface within a zone is permitted.
* All traffic between zones is affected by existing policies
* Traffic cannot flow between zone member interface and any interface that is not a zone member. 
* You need 2 separate firewalls to define traffic: one for each direction.

Example: LAN Network is given SSH access to VyOS box.

Firewall rules:

.. code-block:: none

  set firewall name lan-local default-action 'drop'
  set firewall name lan-local rule 1 action 'accept'
  set firewall name lan-local rule 1 state established 'enable'
  set firewall name lan-local rule 1 state related 'enable'
  set firewall name lan-local rule 2 action 'drop'
  set firewall name lan-local rule 2 state invalid 'enable'
  set firewall name lan-local rule 2 log enable
  set firewall name lan-local rule 100 action 'accept'
  set firewall name lan-local rule 100 destination port '22'
  set firewall name lan-local rule 100 log 'enable'
  set firewall name lan-local rule 100 protocol 'tcp'
  set firewall name local-lan default-action 'drop'
  set firewall name local-lan rule 1 action 'accept'
  set firewall name local-lan rule 1 state established 'enable'
  set firewall name local-lan rule 1 state related 'enable'
  set firewall name local-lan rule 2 action 'drop'
  set firewall name local-lan rule 2 state invalid 'enable'
  set firewall name local-lan rule 2 log enable
  set firewall name local-lan rule 100 action 'accept'
  set firewall name local-lan rule 100 destination address '192.168.0.0/24'
  set firewall name local-lan rule 100 log 'enable'
  set firewall name local-lan rule 100 protocol 'tcp'
  
Zone-policy Config: 

.. code-block:: none
 
  set zone-policy zone lan default-action 'drop'
  set zone-policy zone lan description 'Local Area Network'
  set zone-policy zone lan interface 'eth2'
  set zone-policy zone lan from local firewall name 'lan-local'
  set zone-policy zone local default-action 'drop'
  set zone-policy zone local description 'system-defined zone'
  set zone-policy zone local from lan firewall name 'local-lan'
  set zone-policy zone local local-zone

A detailed zone-based policy example is written in the Configuration-Blueprints_ section.

.. stop_vyoslinter

.. _Configuration-Blueprints: https://docs.vyos.io/en/latest/configexamples/zone-policy.html

.. start_vyoslinter
