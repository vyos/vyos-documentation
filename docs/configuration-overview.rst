.. _configuration-overview:

Configuration Overview
======================

VyOS makes use of a unified configuration file for all system configuration:
`config.boot`. This allows for easy template creation, backup, and replication
of system configuration.

The current configuration can be viewed using the show configuration command.

.. code-block:: sh

  vyos@vyos:~$ show configuration
  interfaces {
      ethernet eth0 {
          address dhcp
          hw-id 00:0c:29:44:3b:0f
      }
      loopback lo {
      }
  }
  service {
      ssh {
          port 22
      }
  }
  system {
      config-management {
          commit-revisions 20
      }
      console {
          device ttyS0 {
              speed 9600
          }
      }
      login {
          user vyos {
              authentication {
                  encrypted-password ****************
              }
              level admin
          }
      }
      ntp {
          server 0.pool.ntp.org {
          }
          server 1.pool.ntp.org {
          }
          server 2.pool.ntp.org {
          }
      }
      syslog {
          global {
              facility all {
                  level notice
              }
              facility protocols {
                  level debug
              }
          }
      }
  }
  vyos@vyos:~$

By default the configuration is display'ed in a hierarchy like the example above, 
this is only one of the possible ways to display the configuration.

When the configuration is generated and the device is configured, these changes are added 
with a corresponding set of `set` and `delete` commands, as for this you could also display
the current configuration using these `set` commands using the `show configuration commands` command.

.. code-block:: sh

  vyos@vyos:~$ show configuration commands
  set interfaces ethernet eth0 address 'dhcp'
  set interfaces ethernet eth0 hw-id '00:0c:29:44:3b:0f'
  set interfaces loopback 'lo'
  set service ssh port '22'
  set system config-management commit-revisions '20'
  set system console device ttyS0 speed '9600'
  set system login user vyos authentication encrypted-password '<removed>'
  set system login user vyos level 'admin'
  set system ntp server '0.pool.ntp.org'
  set system ntp server '1.pool.ntp.org'
  set system ntp server '2.pool.ntp.org'
  set system syslog global facility all level 'notice'
  set system syslog global facility protocols level 'debug'
  vyos@vyos:~$

Both these commands are for beeing executed when in operational mode, these commands does not work within the configuration mode.

Navigating in Configuration Mode 
---------------------------------
When entering the configuration mode you are navigating inside the tree structure exported in the overview above,
to enter configuration mode enter the command `configure` when in operational mode

.. code-block:: sh

  vyos@vyos$ configure
  [edit]
  cyos@vyos# 

.. note:: Prompt changes from `$` to `#`. To exit configuration mode, type `exit`.

All commands executed here is relative to the configuration level you have entered, everything is possible to do from the top level
but commands will be quite lengthy when manually typing them.

To change the current hierarchy level use the command: `edit`

.. code-block:: sh
  
  [edit]
  vyos@vyos# edit interfaces ethernet eth0 

  [edit interfaces ethernet eth0]
  vyos@vyos# 

You are now in a sublevel relative to `interfaces ethernet eth0`, 
all commands executed from this point on are relative to this sublevel.
to exit back to the top of the hierarchy use the `top` command or the `exit` command.
This brings you back to the top of the hierarchy.


The show command within configuration mode will show the current configuration
indicating line changes with a + for additions and a - for deletions.

.. code-block:: sh

  vyos@vyos:~$ configure
  [edit]
  vyos@vyos# show interfaces
    ethernet eth0 {
        address dhcp
        hw-id 00:0c:29:44:3b:0f
    }
    loopback lo {
    }
  [edit]
  vyos@vyos# set interfaces ethernet eth0 description 'OUTSIDE'
  [edit]
  vyos@vyos# show interfaces
   ethernet eth0 {
       address dhcp
  +    description OUTSIDE
       hw-id 00:0c:29:44:3b:0f
   }
   loopback lo {
   }
  [edit]
  vyos@vyos#

it is also possible to display all `set` commands within configuration mode using `show | commands`

.. code-block:: sh

  vyos@vyos# show interfaces iethernet eth0 | commands
  set address dhcp
  set hw-id 00:0c:29:44:3b:0f

these command is also relative to the level you are inside and only relevant configuration blocks will be displayed when entering a sub-level

.. code-block:: sh

  [edit interfaces ethernet eth0]
  vyos@vyos# show
   address dhcp
   hw-id 00:0c:29:44:3b:0f

exiting from the configuration mode is done via the `exit` command from the top level, executing `exit` from within a sub-level takes you back to the top level.

.. code-block:: sh

  [edit interfaces ethernet eth0]
  vyos@vyos# exit
  [edit]
  vyos@vyos# exit
  Warning: configuration changes have not been saved.
  vyos@vyos:~$




Managing the configuration
--------------------------

The configuration is managed by the use of `set` and `delete` commands from within configuration mode
Configuration commands are flattend from the tree into 'one-liner' commands shown in `show configuration commands` from operation mode

these commands are also relative to the level where they are executed and all redundant information from the current level is removed from the command entered

.. code-block:: sh

  [edit]
  vyos@vyos# set interface ethernet eth0 address 1.2.3.4/24

  [edit interfaces ethernet eth0]
  vyos@vyos# set address 1.2.3.4/24

These two commands are essential the same, just executed from different levels in the hierarchy  

To delete a configuration entry use the `delete` command, this also deletes all sub-levels under the current level you've specified in the `delete` command.
Deleting a entry could also mean to reset it back to its default value if the element is mandatory, in each case it will be removed from the configuration file

.. code-block:: sh

  [edit interfaces ethernet eth0]
  vyos@vyos#  delete address 1.2.3.4/24

Configuration changes made do not take effect until committed using the commit
command in configuration mode.

.. code-block:: sh

  vyos@vyos# commit
  [edit]
  vyos@vyos# exit
  Warning: configuration changes have not been saved.
  vyos@vyos:~$

In order to preserve configuration changes upon reboot, the configuration must
also be saved once applied. This is done using the save command in
configuration mode.

.. code-block:: sh

  vyos@vyos# save
  Saving configuration to '/config/config.boot'...
  Done
  [edit]
  vyos@vyos#

 
Configuration mode can not be exited while uncommitted changes exist. To exit
configuration mode without applying changes, the exit discard command can be
used.

.. code-block:: sh

  vyos@vyos# exit
  Cannot exit: configuration modified.
  Use 'exit discard' to discard the changes and exit.
  [edit]
  vyos@vyos# exit discard
  exit
  vyos@vyos:~$

VyOS also maintains backups of previous configurations. To compare
configuration revisions in configuration mode, use the compare command:

.. code-block:: sh

  vyos@vyos# compare [tab]
  Possible completions:
    <Enter>	Compare working & active configurations
    saved		Compare working & saved configurations
    <N>		Compare working with revision N
    <N> <M>	Compare revision N with M
    Revisions:
      0	   2013-12-17 20:01:37 root by boot-config-loader
      1	   2013-12-13 15:59:31 root by boot-config-loader
      2	   2013-12-12 21:56:22 vyos by cli
      3	   2013-12-12 21:55:11 vyos by cli
      4	   2013-12-12 21:27:54 vyos by cli
      5	   2013-12-12 21:23:29 vyos by cli
      6	   2013-12-12 21:13:59 root by boot-config-loader
      7	   2013-12-12 16:25:19 vyos by cli
      8	   2013-12-12 15:44:36 vyos by cli
      9	   2013-12-12 15:42:07 root by boot-config-loader
      10   2013-12-12 15:42:06 root by init

  [edit]
  vyos@vyos#

You can rollback configuration using the rollback command, however this
command will currently trigger a system reboot.

.. code-block:: sh

  vyos@vyos# compare 1
  [edit system]
  >host-name vyos-1
  [edit]
  vyos@vyos# rollback 1
  Proceed with reboot? [confirm][y]
  Broadcast message from root@vyos-1 (pts/0) (Tue Dec 17 21:07:45 2013):
  The system is going down for reboot NOW!
  [edit]
  vyos@vyos#

VyOS also supports saving and loading configuration remotely using SCP, FTP,
or TFTP.

.. code-block:: sh

  vyos@vyos# save [tab]
  Possible completions:
    <Enter>       Save to system config file
    <file>        Save to file on local machine
    scp://<user>:<passwd>@<host>/<file> Save to file on remote machine
    ftp://<user>:<passwd>@<host>/<file> Save to file on remote machine
    tftp://<host>/<file>      Save to file on remote machine
  vyos@vyos# save tftp://192.168.0.100/vyos-test.config.boot
  Saving configuration to 'tftp://192.168.0.100/vyos-test.config.boot'...
  ######################################################################## 100.0%
  Done

Operational info from config mode
---------------------------------

When inside configuration mode you are not directly able to execute operational commands,
access to these commands are possible trough the use of the `run [command]` command.
from this command you will have access to everything accessable from operational mode,
Command completeion and syntax help with `?` and `[tab]` wil also work.

.. code-block:: sh
  
  [edit]
  vyos@vyos# run show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             0.0.0.0/0                         u/u  


Configuration archive
---------------------

VyOS has built-in config archiving and versionin that renders tools like rancid largely unnecessary.

This feature was available in Vyatta Core since 6.3

Local archive and revisions
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Revisions are stored on disk, you can view them, compare them, and rollback to previous revisions if anything goes wrong.
To view existing revisions, use "show system commit" operational mode command.

.. code-block:: sh

  vyos@vyos-test-2# run show system commit 
  0   2015-03-30 08:53:03 by vyos via cli
  1   2015-03-30 08:52:20 by vyos via cli
  2   2015-03-26 21:26:01 by root via boot-config-loader
  3   2015-03-26 20:43:18 by root via boot-config-loader
  4   2015-03-25 11:06:14 by root via boot-config-loader
  5   2015-03-25 01:04:28 by root via boot-config-loader
  6   2015-03-25 00:16:47 by vyos via cli
  7   2015-03-24 23:43:45 by root via boot-config-loader

You can compare revisions with "compare X Y" command where X and Y are revision numbers.

.. code-block:: sh

  vyos@vyos-test-2# compare 0 6
  [edit interfaces]
  +dummy dum1 {
  +    address 10.189.0.1/31
  +}
  [edit interfaces ethernet eth0]
  +vif 99 {
  +    address 10.199.0.1/31
  +}
  -vif 900 {
  -    address 192.0.2.4/24
  -}

You can rollback to a previous revision with "rollback X", where X is a revision number. Your system will reboot and load the config from the archive.

Configuring the archive size
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
You can specify the number of revisions stored on disk with "set system config-management commit-revisions X", where X is a number between 0 and 65535. When the number of revisions exceeds that number, the oldest revision is removed.

Remote archive
~~~~~~~~~~~~~~
VyOS can copy the config to a remote location after each commit. TFTP, FTP, and SFTP servers are supported.

You can specify the location with "set system config-management commit-archive location URL" command, e.g. "set system config-management commit-archive location tftp://10.0.0.1/vyos".
