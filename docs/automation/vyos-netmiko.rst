:lastproofread: 2023-01-16

.. _vyos-netmiko:

Netmiko
=======

VyOS supports configuration via netmiko_.
It requires to install ``python3-netmiko`` module.

Example
-------

.. code-block:: none

  #!/usr/bin/env python3

  from netmiko import ConnectHandler

  vyos_router = {
    "device_type": "vyos",
    "host": "192.0.2.1",
    "username": "vyos",
    "password": "vyospass",
    "port": 22,
    }

  net_connect = ConnectHandler(**vyos_router)

  config_commands = [
                     'set interfaces ethernet eth0 description WAN',
                     'set interfaces ethernet eth1 description LAN',
                    ]

  # set configuration
  output = net_connect.send_config_set(config_commands, exit_config_mode=False)
  print(output)

  # commit configuration
  output = net_connect.commit()
  print(output)

  # op-mode commands
  output = net_connect.send_command("run show interfaces")
  print(output)

Output

.. code-block:: none

  $ ./vyos-netmiko.py
  configure
  set interfaces ethernet eth0 description WAN
  [edit]
  vyos@r4-1.3# set interfaces ethernet eth1 description LAN
  [edit]
  vyos@r4-1.3# 
  commit
  [edit]
  vyos@r4-1.3# 
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             203.0.113.1/24                    u/u  WAN
  eth1             192.0.2.1/30                      u/u  LAN
  eth2             -                                 u/u  
  lo               127.0.0.1/8                       u/u  
                   ::1/128                                
  vtun10           10.10.0.1/24                      u/u  
  [edit]

.. _netmiko: https://github.com/ktbyers/netmiko
