.. _configuration-overview:

Configuration Overview
======================

VyOS makes use of a unified configuration file for all system configuration:
`config.boot`. This allows for easy template creation, backup, and replication
of system configuration.

The current active configuration -aka running configuration- can be viewed using the show configuration command.

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

By default the configuration is displayed in a hierarchy like the example above,
this is only one of the possible ways to display the configuration.

When the configuration is generated and the device is configured, changes are added through a collection of `set` and `delete` commands. You can see that collection of commands by entering `show configuration commands`, which is another way of seeing the running configuration.


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

Both these commands should be executed when in operational mode, they do not work in configuration mode.


Configuration terminology
-------------------------

A VyOS system has three major types of configurations:

Active or running configuration
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
The active or running configuration is the system configuration that is loaded and currently being used by VyOS. Any change in the configuration will have to be committed to belong to the active/running configuration.

Working configuration
^^^^^^^^^^^^^^^^^^^^^
The working configuration is the configuration which is currently being modified in configuration mode. Changes made to the working configuration do not go into effect until the changes are committed with the `commit` command. At which time the working configuration will become the active or running configuration.

Saved configuration
^^^^^^^^^^^^^^^^^^^
A saved configuration is a configuration saved to a file using the `save` command. It allows you to keep safe a configuration for future uses. There can be multiple configuration files. The default or "boot" configuration is saved and loaded from the file config.boot.


Navigating in Configuration Mode
---------------------------------
When entering the configuration mode you are navigating inside the tree structure exported in the overview above,
to enter configuration mode enter the command `configure` when in operational mode

.. code-block:: sh

  vyos@vyos$ configure
  [edit]
  vyos@vyos#

.. note:: When going into configuration mode, prompt changes from *$* to *#*. To exit configuration mode, type `exit`.

All commands executed here are relative to the configuration level you have entered. You can do everything from the top level, but commands will be quite lengthy when manually typing them.

To change the current hierarchy level use the command: `edit`

.. code-block:: sh

  [edit]
  vyos@vyos# edit interfaces ethernet eth0

  [edit interfaces ethernet eth0]
  vyos@vyos#

You are now in a sublevel relative to `interfaces ethernet eth0`,
all commands executed from this point on are relative to this sublevel.
Use either the `top` or `exit` command to go back to the top of the hierarchy. You can also use the `up` command to move only one level up at a time.

The `show` command within configuration mode will show the working configuration
indicating line changes with `+` for additions, `>` for replacements and `-` for deletions.


.. code-block:: sh

 vyos@vyos:~$ configure
 [edit]
 vyos@vyos# show interfaces
  ethernet eth0 {
      description MY_OLD_DESCRIPTION
      disable
      hw-id 52:54:00:0e:82:d9
  }
  loopback lo {
  }
 [edit]
 vyos@vyos# set interfaces ethernet eth0 address dhcp
 [edit]
 vyos@vyos# set interfaces ethernet eth0 description MY_NEW_DESCRIPTION
 [edit]
 vyos@vyos# delete interfaces ethernet eth0 disable
 [edit]
 vyos@vyos# show interfaces
  ethernet eth0 {
 +    address dhcp
 >    description MY_NEW_DESCRIPTION
 -    disable
      hw-id 52:54:00:0e:82:d9
  }
  loopback lo {
  }
 [edit]
 vyos@vyos#

It is also possible to display all `set` commands within configuration mode using `show | commands`

.. code-block:: sh

  vyos@vyos# show interfaces ethernet eth0 | commands
  set address dhcp
  set hw-id 00:0c:29:44:3b:0f

These commands are also relative to the level you are inside and only relevant configuration blocks will be displayed when entering a sub-level.

.. code-block:: sh

  [edit interfaces ethernet eth0]
  vyos@vyos# show
   address dhcp
   hw-id 00:0c:29:44:3b:0f

Exiting from the configuration mode is done via the `exit` command from the top level, executing `exit` from within a sub-level takes you back to the top level.

.. code-block:: sh

  [edit interfaces ethernet eth0]
  vyos@vyos# exit
  [edit]
  vyos@vyos# exit
  Warning: configuration changes have not been saved.
  vyos@vyos:~$



Managing the configuration
--------------------------

The configuration is managed by the use of `set` and `delete` commands from within configuration mode.
Configuration commands are flattened from the tree into 'one-liner' commands shown in `show configuration commands` from operation mode.

These commands are also relative to the level where they are executed and all redundant information from the current level is removed from the command entered.

.. code-block:: sh

  [edit]
  vyos@vyos# set interface ethernet eth0 address 203.0.113.6/24

  [edit interfaces ethernet eth0]
  vyos@vyos# set address 203.0.113.6/24

These two commands above are essentially the same, just executed from different levels in the hierarchy.

To delete a configuration entry use the `delete` command, this also deletes all sub-levels under the current level you've specified in the `delete` command.
Deleting an entry will also result in the element reverting back to its default value if one exists.

.. code-block:: sh

  [edit interfaces ethernet eth0]
  vyos@vyos#  delete address 203.0.113.6/24

Any change you do on the configuration, will not take effect until committed using the `commit` command in configuration mode.

.. code-block:: sh

  vyos@vyos# commit
  [edit]
  vyos@vyos# exit
  Warning: configuration changes have not been saved.
  vyos@vyos:~$

In order to preserve configuration changes upon reboot, the configuration must
also be saved once applied. This is done using the `save` command in
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

When inside configuration mode you are not directly able to execute operational commands.

Access to these commands are possible through the use of the `run [command]` command.
From this command you will have access to everything accessible from operational mode.

Command completion and syntax help with `?` and `[tab]` will also work.

.. code-block:: sh

  [edit]
  vyos@vyos# run show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             0.0.0.0/0                         u/u


Configuration archive
---------------------

VyOS automatically maintains backups of previous configurations.

Local archive and revisions
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Revisions are stored on disk. You can view them, compare them, and rollback to previous revisions if anything goes wrong.

To view existing revisions, use `show system commit` operational mode command.

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

To compare configuration revisions in configuration mode, use the compare command:

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

Comparing Revisions
"""""""""""""""""""

You can compare revisions with `compare X Y` command, where X and Y are revision numbers. The output will describe how the configuration X is when compared to Y, indicating with a plus sign (**+**) the additional parts X has when compared to y, and indicating with a minus sign (**-**) the lacking parts x misses when compared to y.

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

Rolling Back Changes
""""""""""""""""""""

You can rollback configuration using the rollback command.  This 
command will apply the selected revision and trigger a system reboot.

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

Configuring the archive size
""""""""""""""""""""""""""""

You can specify the number of revisions stored on disk with `set system config-management commit-revisions X`, where X is a number between 0 and 65535. When the number of revisions exceeds that number, the oldest revision is removed.

Remote archive
^^^^^^^^^^^^^^

VyOS can copy the config to a remote location after each commit. TFTP, FTP, and SFTP servers are supported.


You can specify the location with: 

* `set system config-management commit-archive location URL` 

For example, `set system config-management commit-archive location tftp://10.0.0.1/vyos`.

You can specify the location with `set system config-management commit-archive location URL` command, e.g. `set system config-management commit-archive location tftp://10.0.0.1/vyos`.

Wipe config and restore default
-------------------------------

In the case you want to completely delete your configuration and restore the default one, you can enter the following command in configuration mode:

.. code-block:: sh

  load /opt/vyatta/etc/config.boot.default


You will be asked if you want to continue. If you accept, you will have to use `commit` if you want to make the changes active.

Then you  may want to `save` in order to delete the saved configuration too.

.. note:: If you are remotely connected, you will lose your connection. You may want to copy first the config, edit it to ensure connectivity, and load the edited config.
