.. _config-sync:

###########
Config Sync
###########

Configuration synchronization (config sync) is a feature of VyOS that 
permits synchronization of the configuration of one VyOS router to 
another in a network. 

The main benefit to configuration synchronization is that it eliminates having  
to manually replicate configuration changes made on the primary router to the  
secondary (replica) router.

The writing of the configuration to the secondary router is performed through 
the VyOS HTTP API. The user can specify which portion(s) of the configuration will 
be synchronized and the mode to use - whether to replace or add. 

To prevent issues with divergent configurations between the pair of routers, 
synchronization is strictly unidirectional from primary to replica. Both 
routers should be online and run the same version of VyOS.

Configuration
-------------

.. cfgcmd:: set service config-sync section secondary 
   <address|key|timeout|port>

   Specify the address, API key, timeout and port of the secondary router. 
   You need to enable and configure the HTTP API service on the secondary 
   router for config sync to operate.
   
.. cfgcmd:: set service config-sync section <section>

   Specify the section of the configuration to synchronize. If more than one 
   section is to be synchronized, repeat the command to add additional 
   sections as required.

.. cfgcmd:: set service config-sync mode <load|set>

   Two options are available for `mode`: either `load` and replace or `set`
   the configuration section.

.. code-block:: none

    Supported options for <section> include:
        firewall
        interfaces <interface>
        nat
        nat66
        pki
        policy
        protocols <protocol>
        qos <interface|policy>
        service <service>
        system <conntrack| 
        flow-accounting|option|sflow|static-host-mapping|sysctl|time-zone>
        vpn
        vrf

Example
-------
* Synchronize the time-zone and OSPF configuration from Router A to Router B
* The address Router B is 10.0.20.112 and the port used is 8443

Configure the HTTP API service on Router B

.. code-block:: none

    set service https api graphql authentication expiration '31536000'
    set service https api graphql authentication type 'token'
    set service https api graphql introspection
    set service https api keys id KID key 'foo'
    set service https listen-address '10.0.20.112'
    set service https port '8443'

Configure the config-sync service on Router A

.. code-block:: none

    set service config-sync mode 'load'
    set service config-sync secondary address '10.0.20.112'
    set service config-sync secondary port '8443'
    set service config-sync secondary key 'foo'
    set service config-sync section protocols 'ospf'
    set service config-sync section system 'time-zone'

Make config-sync relevant changes to Router A's configuration

.. code-block:: none

   vyos@vyos-A# set system time-zone 'America/Los_Angeles'
   vyos@vyos-A# commit
   INFO:vyos_config_sync:Config synchronization: Mode=load, 
   Secondary=10.0.20.112
   vyos@vyos-A# save

   vyos@vyos-A# set protocols ospf area 0 network '10.0.48.0/30'
   vyos@vyos-A# commit
   INFO:vyos_config_sync:Config synchronization: Mode=load, 
   Secondary=10.0.20.112
   yos@vyos-A# save

Verify configuration changes have been replicated to Router B

.. code-block:: none

   vyos@vyos-B:~$ show configuration commands | match time-zone
   set system time-zone 'America/Los_Angeles'
   vyos@vyos-B:~$ show configuration commands | match ospf
   set protocols ospf area 0 network '10.0.48.0/30'
   vyos@vyos-B:~$ 

Known issues
------------
Configuration resynchronization. With the current implementation of `service 
config-sync`, the secondary node must be online.
