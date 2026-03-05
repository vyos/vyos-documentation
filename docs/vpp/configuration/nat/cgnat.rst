:lastproofread: 2025-09-04

.. _vpp_config_nat_cgnat:

.. include:: /_include/need_improvement.txt

#######################
VPP CGNAT Configuration
#######################

The Carrier-grade NAT (CGNAT) is a special type of NAT mainly targeted for
usage by Internet Service Providers (ISPs) to manage the limited pool of
public IP addresses. It solves two main problems:

* allows to fairly share a limited number of public IP addresses between
   multiple customers, ensuring they all have access to the internet and cannot
   interfere with each other.
* allows to track and log the usage of public IP addresses by different
   customers, which is often a regulatory requirement.

The CGNAT configuration is a straightforward process. It involves defining the
inside and outside interfaces and creating the necessary rules to manage the
translation of private IP addresses to public IP addresses.

.. warning::

   **Enabling CGNAT** on an interface (both inside and outside) **disables
   normal routing** on these interfaces, **also as an management access** to
   VyOS router itself.

   Ensure you have an alternative management path to the router before applying
   CGNAT configuration! If router-local traffic (for example SSH or DNS) must
   remain reachable on a CGNAT interface, configure appropriate CGNAT exclude
   rules.

Interface Configuration
-----------------------

First, you need to define the inside and outside interfaces. The inside
interface is connected to the private network, while the outside interface is
connected to the public network.

.. cfgcmd::

   set vpp nat cgnat interface inside <inside-interface>

.. cfgcmd::

   set vpp nat cgnat interface outside <outside-interface>

This is a mandatory step, as the CGNAT needs to know on which interfaces it
needs to apply rules and operate.

NAT Rules Configuration
-----------------------

Next, you need to create the NAT rules.

.. cfgcmd::

   set vpp nat cgnat rule <rule-number> description <description>

Allows you to describe the rule for easier identification.

.. cfgcmd::

   set vpp nat cgnat rule <rule-number> inside-prefix <inside-prefix>

Sets the inside prefix (private IP range) that will be translated.

.. cfgcmd::

   set vpp nat cgnat rule <rule-number> outside-prefix <outside-prefix>

Sets the outside prefix (public IP range) that will be used for translation.

Exclude Rules Configuration
---------------------------

CGNAT exclude rules are implemented as DET44 identity mappings. Matching
traffic is excluded from CGNAT translation and keeps its original
address/port tuple.

.. cfgcmd::

   set vpp nat cgnat exclude rule <rule-number> description <description>

Adds a description (stored as VPP identity-mapping tag) for easier
identification.

.. cfgcmd::

   set vpp nat cgnat exclude rule <rule-number> local-address <local-address>

Sets the local IPv4 address that should be excluded from translation. This
option is mandatory for each exclude rule.

.. cfgcmd::

   set vpp nat cgnat exclude rule <rule-number> protocol <tcp|udp|icmp|all>

Matches a specific protocol. Default is ``all``.

.. cfgcmd::

   set vpp nat cgnat exclude rule <rule-number> local-port <1-65535>

Matches a specific local port (or ICMP identifier in case of ICMP protocol).

.. important::

   Exclude-rule validation rules:

   * ``local-address`` must be specified.
    * ``protocol`` and ``local-port`` must either both be specified or both be
       omitted.
    * Duplicate identity mappings are not allowed (same local-address,
       protocol, local-port tuple).

.. note::

   A common use case for exclude rules is preserving management-plane access to
   the router itself (for example SSH) and local-originated services (for
   example DNS queries) when CGNAT is enabled.

.. important::

   **Memory Requirements**
   
   CGNAT memory usage scales with the number of internal customers.

   **Each 256 customers** (equivalent to a /24 subnet) requires approximately
   **4 MB of main heap memory**. This memory is used for maintaining
   customer-to-port mappings and session state information.

   Ensure your VPP main heap size is configured appropriately based on your
   expected customer count. See :ref:`VPP Memory Configuration
   <vpp_config_dataplane_memory>` for details on adjusting main heap size.

Session Limitations
-------------------

CGNAT has built-in session limitations to ensure fair resource allocation:

**Each customer (internal IP address) is limited to a maximum of 1000
simultaneous sessions**, even if more than 1000 ports are allocated to that
customer. This limitation applies to all types of sessions (TCP, UDP, ICMP).

Timeouts Configuration
----------------------

In some cases, you might want to adjust the timers for the NAT sessions. This
can help to optimize the address space usage by controlling how long a session
remains active, and how long it occupies an IP address and port combination.

This setting can be adjusted for different protocols individually:

.. code-block::

    set vpp nat cgnat timeout icmp <timeout-value>
    set vpp nat cgnat timeout tcp-established <timeout-value>
    set vpp nat cgnat timeout tcp-transitory <timeout-value>
    set vpp nat cgnat timeout udp <timeout-value>

Example Configuration
---------------------

Here is an example configuration for a CGNAT setup, assuming:

* Inside interface: ``eth2``
* Outside interface: ``eth1``
* Inside prefix: ``100.64.0.0/16``
* Outside prefix: ``203.0.113.0/24``

.. code-block::

   set vpp nat cgnat interface inside eth2
   set vpp nat cgnat interface outside eth1
   set vpp nat cgnat rule 1 description "CGNAT Rule 1"
   set vpp nat cgnat rule 1 inside-prefix 100.64.0.0/16
   set vpp nat cgnat rule 1 outside-prefix 203.0.113.0/24
   set vpp nat cgnat exclude rule 10 description "Bypass management host"
   set vpp nat cgnat exclude rule 10 local-address 100.64.0.10
   set vpp nat cgnat exclude rule 20 description "Bypass subscriber DNS"
   set vpp nat cgnat exclude rule 20 local-address 100.64.0.20
   set vpp nat cgnat exclude rule 20 protocol udp
   set vpp nat cgnat exclude rule 20 local-port 53

Operational Commands
====================

Once the CGNAT is configured, you can use the following commands to monitor
its status and operation:

.. opcmd::

   show vpp nat cgnat interfaces

Displays the configured inside and outside interfaces.

.. code-block::

    vyos@vyos:~$ show vpp nat cgnat interfaces 
    CGNAT interfaces:
      eth2 in
      eth1 out

.. opcmd::

    show vpp nat cgnat sessions

Displays the active NAT sessions. Be aware that this command can produce a
large amount of output if there are many active sessions.

.. opcmd::

   show vpp nat cgnat mappings

Displays the current NAT mappings, including inside and outside address
prefixes.

.. code-block::

    vyos@vyos:~$ show vpp nat cgnat mappings 
    Inside         Outside           Sharing ratio    Ports per host    Sessions
    -------------  --------------  ---------------  ----------------  ----------
    100.64.0.0/16  203.0.113.0/24              256               252           0

.. opcmd::

   show vpp nat cgnat exclude-rules

Displays configured CGNAT exclude rules (identity mappings).

.. code-block::

    vyos@vyos:~$ show vpp nat cgnat exclude-rules
    Address      Protocol    Port    VRF  Description
    -----------  ----------  ------  -----  ---------------------
    100.64.0.10  all         any       0    Bypass management host
    100.64.0.20  udp         53        0    Bypass subscriber DNS


Potential Issues and Troubleshooting
====================================

Configuration is failed to apply with error similar to:

.. code-block::
    
   vpp_papi.vpp_papi.VPPIOError: [Errno 2] VPP API client: read failed

CGNAT utilizes main heap memory and if you are trying to configure big
prefixes or a large number of NAT sessions, you may run into memory allocation
issues. Try to :ref:`increase the main heap size in VPP configuration
<vpp_config_dataplane_memory>`.

SSH/DNS Reachability After Enabling CGNAT
-----------------------------------------

If SSH access to the router (or local-originated DNS queries) stops working
after enabling CGNAT, traffic may be dropped by DET44 when it does not match a
translation mapping.

In this case, add an exclude rule for the router local address that must
bypass CGNAT translation.

.. code-block::

   set vpp nat cgnat exclude rule 100 local-address <router-ip>

Then verify:

.. code-block::

   show vpp nat cgnat exclude-rules
