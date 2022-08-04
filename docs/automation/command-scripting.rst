:lastproofread: 2021-06-27

.. _command-scripting:

Command Scripting
=================

VyOS supports executing configuration and operational commands non-interactively
from shell scripts.

To include VyOS specific functions and aliases you need to ``source
/opt/vyatta/etc/functions/script-template`` files at the top of your script.

.. code-block:: none

  #!/bin/vbash
  source /opt/vyatta/etc/functions/script-template
  exit

Run configuration commands
--------------------------

Configuration commands are executed just like from a normal config session. For
example, if you want to disable a BGP peer on VRRP transition to backup:

.. code-block:: none

  #!/bin/vbash
  source /opt/vyatta/etc/functions/script-template
  configure
  set protocols bgp system-as 65536
  set protocols bgp neighbor 192.168.2.1 shutdown
  commit
  exit

Run operational commands
------------------------

Unlike a normal configuration session, all operational commands must be
prepended with ``run``, even if you haven't created a session with configure.

.. code-block:: none

  #!/bin/vbash
  source /opt/vyatta/etc/functions/script-template
  run show interfaces
  exit

Run commands remotely
---------------------

Sometimes you simply wan't to execute a bunch of op-mode commands via SSH on
a remote VyOS system.

.. code-block:: none

  ssh 192.0.2.1 'vbash -s' <<EOF
  source /opt/vyatta/etc/functions/script-template
  run show interfaces
  exit
  EOF

Will return:

.. code-block:: none

  Welcome to VyOS
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             192.0.2.1/24                      u/u
  lo               127.0.0.1/8                       u/u
                  ::1/128


Other script languages
----------------------

If you want to script the configs in a language other than bash you can have
your script output commands and then source them in a bash script.

Here is a simple example:

.. code-block:: python

  #!/usr/bin/env python3
  print("delete firewall group address-group somehosts")
  print("set firewall group address-group somehosts address '192.0.2.3'")
  print("set firewall group address-group somehosts address '203.0.113.55'")


.. code-block:: none

  #!/bin/vbash
  source /opt/vyatta/etc/functions/script-template
  configure
  source < /config/scripts/setfirewallgroup.py
  commit


Executing Configuration Scripts
-------------------------------

There is a pitfall when working with configuration scripts. It is tempting to
call configuration scripts with "sudo" (i.e., temporary root permissions),
because that's the common way on most Linux platforms to call system commands.

On VyOS this will cause the following problem: After modifying the configuration
via script like this once, it is not possible to manually modify the config
anymore:

.. code-block:: none

  sudo ./myscript.sh # Modifies config
  configure
  set ... # Any configuration parameter

This will result in the following error message: ``Set failed`` If this happens,
a reboot is required to be able to edit the config manually again.

To avoid these problems, the proper way is to call a script with the
``vyattacfg`` group, e.g., by using the ``sg`` (switch group) command:

.. code-block:: none

  sg vyattacfg -c ./myscript.sh

To make sure that a script is not accidentally called without the ``vyattacfg``
group, the script can be safeguarded like this:

.. code-block:: none

  if [ "$(id -g -n)" != 'vyattacfg' ] ; then
      exec sg vyattacfg -c "/bin/vbash $(readlink -f $0) $@"
  fi

Executing pre-hooks/post-hooks Scripts
--------------------------------------

VyOS has the ability to run custom  scripts before and after each commit

The default directories where your custom Scripts should be located are:

.. code-block:: none

  /config/scripts/commit/pre-hooks.d   - Directory with scripts that run before
                                         each commit.

  /config/scripts/commit/post-hooks.d  - Directory with scripts that run after
                                         each commit.

Scripts are run in alphabetical order. Their names must consist entirely of
ASCII upper- and lower-case letters,ASCII digits, ASCII underscores, and
ASCII minus-hyphens.No other characters are allowed.

.. note:: Custom scripts are not executed with root privileges
   (Use sudo inside if this is necessary).

A simple example is shown below, where the ops command executed in
the post-hook script is "show interfaces".

.. code-block:: none

  vyos@vyos# set interfaces ethernet eth1  address 192.0.2.3/24
  vyos@vyos# commit
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             198.51.100.10/24                  u/u
  eth1             192.0.2.3/24                      u/u
  eth2             -                                 u/u
  eth3             -                                 u/u
  lo               203.0.113.5/24                    u/u

Preconfig on boot
-----------------

The ``/config/scripts/vyos-preconfig-bootup.script`` script is called on boot
before the VyOS configuration during boot process.

Any modifications were done to work around unfixed bugs and implement
enhancements that are not complete in the VyOS system can be placed here.

The default file looks like this:

.. code-block:: none

  #!/bin/sh
  # This script is executed at boot time before VyOS configuration is applied.
  # Any modifications required to work around unfixed bugs or use
  # services not available through the VyOS CLI system can be placed here.


Postconfig on boot
------------------

The ``/config/scripts/vyos-postconfig-bootup.script`` script is called on boot
after the VyOS configuration is fully applied.

Any modifications were done to work around unfixed bugs and implement
enhancements that are not complete in the VyOS system can be placed here.

The default file looks like this:

.. code-block:: none

  #!/bin/sh
  # This script is executed at boot time after VyOS configuration is fully
  # applied. Any modifications required to work around unfixed bugs or use
  # services not available through the VyOS CLI system can be placed here.

.. hint:: For configuration/upgrade management issues, modification of this
   script should be the last option. Always try to find solutions based on CLI
   commands first.
