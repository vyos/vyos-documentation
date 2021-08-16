:lastproofread: 2021-06-28

.. _vyos-napalm:

Napalm
======

VyOS supports some napalm_ functions for configuration and op-mode.
It requires more tests.

Install ``napalm-vyos`` module

.. code-block:: none

  apt install python3-pip
  pip3 install napalm
  pip3 install napalm-vyos


Op-mode
-------

.. code-block:: none

  #!/usr/bin/env python3

  import json
  from napalm import get_network_driver

  driver = get_network_driver('vyos')

  vyos_router = driver(
      hostname="192.0.2.1",
      username="vyos",
      password="vyospass",
      optional_args={"port": 22},
  )

  vyos_router.open()
  output = vyos_router.get_facts()
  print(json.dumps(output, indent=4))

  output = vyos_router.get_arp_table()
  print(json.dumps(output, indent=4))

  vyos_router.close()

Output op-mode

.. code-block:: none

  $ ./vyos-napalm.py
  {
      "uptime": 7185,
      "vendor": "VyOS",
      "os_version": "1.3.0-rc5",
      "serial_number": "",
      "model": "Standard PC (Q35 + ICH9, 2009)",
      "hostname": "r4-1.3",
      "fqdn": "vyos.local",
      "interface_list": [
          "eth0",
          "eth1",
          "eth2",
          "lo",
          "vtun10"
      ]
  }
  [
      {
          "interface": "eth1",
          "mac": "52:54:00:b2:38:2c",
          "ip": "192.0.2.2",
          "age": 0.0
      },
      {
          "interface": "eth0",
          "mac": "52:54:00:a2:b9:5b",
          "ip": "203.0.113.11",
          "age": 0.0
      }
  ]

Configuration
-------------

We need 2 files, commands.conf and script itself.

Content of commands.conf

.. code-block:: none

  set service ssh disable-host-validation
  set service ssh port '2222'
  set system name-server '192.0.2.8'
  set system name-server '203.0.113.8'
  set interfaces ethernet eth1 description 'FOO'

Script vyos-napalm.py

.. code-block:: none

  #!/usr/bin/env python3

  from napalm import get_network_driver

  driver = get_network_driver('vyos')

  vyos_router = driver(
      hostname="192.0.2.1",
      username="vyos",
      password="vyospass",
      optional_args={"port": 22},
  )

  vyos_router.open()
  vyos_router.load_merge_candidate(filename='commands.conf')
  diffs = vyos_router.compare_config()

  if bool(diffs) == True:
      print(diffs)
      vyos_router.commit_config()
  else:
      print('No configuration changes to commit')
      vyos_router.discard_config()

  vyos_router.close()

Output

.. code-block:: none

  $./vyos-napalm.py 
  [edit interfaces ethernet eth1]
  +description FOO
  [edit service ssh]
  +disable-host-validation
  +port 2222
  [edit system]
  +name-server 192.0.2.8
  +name-server 203.0.113.8
  [edit]

.. _napalm: https://napalm.readthedocs.io/en/latest/base.html