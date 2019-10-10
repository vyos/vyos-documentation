.. _firewall:

Firewall
========

VyOS makes use of Linux `netfilter <http://netfilter.org/>`_ for packet filtering.

The firewall supports the creation of groups for ports, addresses, and networks
(implemented using netfilter ipset) and the option of interface or zone based
firewall policy.

**Important note on usage of terms:** The firewall makes use of the terms
`in`, `out`, and `local` for firewall policy. Users experienced with netfilter
often confuse `in` to be a reference to the `INPUT` chain, and `out` the
`OUTPUT` chain from netfilter. This is not the case. These instead indicate the
use of the `FORWARD` chain and either the input or output interface. The
`INPUT` chain, which is used for local traffic to the OS, is a reference to
as `local` with respect to its input interface.

Zone-based Firewall Policy
--------------------------

As an alternative to applying policy to an interface directly, a zone-based
firewall can be created to simplify configuration when multiple interfaces
belong to the same security zone. Instead of applying to rulesets to interfaces
they are applied to source zone-destination zone pairs.

An example to zone-based firewalls can be found here: :ref:`examples-zone-policy`.

Groups
------

Firewall groups represent collections of IP addresses, networks, or ports. Once
created, a group can be referenced by firewall rules as either a source or
destination. Members can be added or removed from a group without changes to
or the need to reload individual firewall rules.

.. note:: Groups can also be referenced by NAT configuration.

While **network groups** accept IP networks in CIDR notation, specific IP addresses
can be added as a 32-bit prefix. If you foresee the need to add a mix of
addresses and networks, the network group is recommended.

Here is an example of a network group for the IP networks that make up the
internal network:

.. code-block:: sh

  set firewall group network-group NET-INSIDE network 192.168.0.0/24
  set firewall group network-group NET-INSIDE network 192.168.1.0/24

Groups need to have unique names. Even though some contain IPv4 addresses and others contain IPv6 addresses, they still need to have unique names, so you may want to append "-v4" or "-v6" to your group names.

.. code-block:: sh

  set firewall group network-group NET-INSIDE-v4 network 192.168.1.0/24
  set firewall group ipv6-network-group NET-INSIDE-v6 network 2001:db8::/64


A **port group** represents only port numbers, not the protocol. Port groups can
be referenced for either TCP or UDP. It is recommended that TCP and UDP groups
are created separately to avoid accidentally filtering unnecessary ports.
Ranges of ports can be specified by using `-`.

Here is an example of a port group a server:

.. code-block:: sh

  set firewall group port-group PORT-TCP-SERVER1 port 80
  set firewall group port-group PORT-TCP-SERVER1 port 443
  set firewall group port-group PORT-TCP-SERVER1 port 5000-5010

Rule-Sets
---------

A rule-set is a named collection of firewall rules that can be applied to an
interface or zone. Each rule is numbered, has an action to apply if the rule
is matched, and the ability to specify the criteria to match.

Example of a rule-set to filter traffic to the internal network:

.. code-block:: sh

  set firewall name INSIDE-OUT default-action drop
  set firewall name INSIDE-OUT rule 1010 action accept
  set firewall name INSIDE-OUT rule 1010 state established enable
  set firewall name INSIDE-OUT rule 1010 state related enable
  set firewall name INSIDE-OUT rule 1020 action drop
  set firewall name INSIDE-OUT rule 1020 state invalid enable

Applying a Rule-Set to an Interface
-----------------------------------

Once a rule-set is created, it can be applied to an interface.

.. note:: Only one rule-set can be applied to each interface for `in`, `out`,
   or `local` traffic for each protocol (IPv4 and IPv6).

.. code-block:: sh

  set interfaces ethernet eth1 firewall out name INSIDE-OUT

Applying a Rule-Set to a Zone
-----------------------------

A named rule-set can also be applied to a zone relationship (note, zones must
first be created):

.. code-block:: sh

  set zone-policy zone INSIDE from OUTSIDE firewall name INSIDE-OUT

How VyOS replies when being pinged
----------------------------------

By default, when VyOS receives an ICMP echo request packet destined for itself, it will answer with an ICMP echo reply, unless you avoid it through its firewall.

With the firewall you can set rules to accept, drop or reject ICMP in, out or local traffic. You can also use the general **firewall all-ping** command. This command affects only to LOCAL (packets destined for your VyOS system), not to IN or OUT traffic.

.. note:: **firewall all-ping** affects only to LOCAL and it always behaves in the most restrictive way

.. code-block:: sh

  set firewall all-ping enable

When the command above is set, VyOS will answer every ICMP echo request addressed to itself, but that will only happen if no other rule is applied droping or rejecting local echo requests. In case of conflict, VyOS will not answer ICMP echo requests.

.. code-block:: sh

  set firewall all-ping disable

When the comand above is set, VyOS will answer no ICMP echo request addressed to itself at all, no matter where it comes from or whether more specific rules are being applied to accept them.

Example Partial Config
----------------------

.. code-block:: sh

  firewall {
     all-ping enable
     broadcast-ping disable
     config-trap disable
     group {
         network-group BAD-NETWORKS {
             network 198.51.100.0/24
             network 203.0.113.0/24
         }
         network-group GOOD-NETWORKS {
             network 192.0.2.0/24
         }
         port-group BAD-PORTS {
             port 65535
         }
     }
     name FROM-INTERNET {
         default-action accept
         description "From the Internet"
         rule 10 {
             action accept
             description "Authorized Networks"
             protocol all
             source {
                 group {
                     network-group GOOD-NETWORKS
                 }
             }
         }
         rule 11 {
             action drop
             description "Bad Networks"
             protocol all
             source {
                 group {
                     network-group BAD-NETWORKS
                 }
             }
         }
         rule 30 {
             action drop
             description "BAD PORTS"
             destination {
                 group {
                     port-group BAD-PORTS
                 }
             }
             log enable
             protocol all
         }
     }
  }
  interfaces {
     ethernet eth1 {
         address dhcp
         description OUTSIDE
         duplex auto
         firewall {
             in {
                 name FROM-INTERNET
             }
         }
     }
  }
