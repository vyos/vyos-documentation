.. _cloud-init: 
 
################################ 
Configuring Vyos with cloud-init 
################################ 

Vyos uses cloud-init to configure itself automatically in cloud environments.

There is a Meta-Data module `cc_vyos.py` that takes care of the cloud-specific configuration.

Additional module `cc_vyos_userdata.py` introduces a new parameter `vyos_config_commands` into User-Data (`#cloud-config`). This parameter should be a list of VyOS configuration commands that will be applied during deployment. This module will run last.

Commands requirements:
 - one command per line
 - if command ending by value, it must be inside single quotes: `set some option 'value'`, `delete some option 'value'`
 - a single-quote symbol is not allowed inside command or value
The commands list produced by the `show configuration commands` command on a VyOS router should comply with all the requirements, so it is easy to get a proper commands list by copying it from another router.

Usage example (User-Data content):
```
#cloud-config
vyos_config_commands:
  - set system host-name 'demo123'
  - set system ntp server 1.pool.ntp.org
  - set system ntp server 2.pool.ntp.org
  - delete interfaces ethernet eth2 address
  - set interfaces ethernet eth2 address '192.0.2.1/24'
```


References
----------

.. stop_vyoslinter

https://github.com/vyos/vyos-cloud-init/commit/1607eec32641ad93ea211e447336b3366c28de06

.. start_vyoslinter
