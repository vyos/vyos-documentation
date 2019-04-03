.. _commandscripting:


Command scripting
=================

VyOS supports executing configuration and operational commands non-interactively from shell scripts.

To include VyOS-specific functions and aliases you need to ``source /opt/vyatta/etc/functions/script-template`` files at the top of your script.

.. code-block:: sh

  #!/bin/vbash
  source /opt/vyatta/etc/functions/script-template

  exit

Run configuration commands
--------------------------

Configuration commands are executed just like from a normal config session.

For example, if you want to disable a BGP peer on VRRP transition to backup:

.. code-block:: sh

  #!/bin/vbash
  source /opt/vyatta/etc/functions/script-template

  configure

  set protocols bgp 65536 neighbor 192.168.2.1 shutdown

  commit

  exit


Run operational commands
------------------------

Unlike a normal configuration sessions, all operational commands must be prepended with ``run``, even if you haven't created a session with configure.

.. code-block:: sh

  #!/bin/vbash
  source /opt/vyatta/etc/functions/script-template

  run show interfaces

  exit