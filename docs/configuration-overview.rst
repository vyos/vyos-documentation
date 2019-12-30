.. _configuration-overview:

######################
Configuration Overview
######################

VyOS makes use of a unified configuration file for the entire systems
configuration: ``/config/config.boot``. This allows easy template creation,
backup, and replication of system configuration. A sytem can thus also be
easily cloned by simply copying the required configuration files.

Terminology
===========

A VyOS system has three major types of configurations:

* **Active/Running** configuration is the system configuration that is loaded
  and currently active (used by VyOS). Any change in the configuration will
  have to be committed to belong to the active/running configuration.

* **Working** - is the configuration which is currently being modified in
  configuration mode. Changes made to the working configuration do not go into
  effect until the changes are committed with the :cfgcmd:`commit` command. At
  which time the working configuration will become the active or running
  configuration.

* **Saved** - is a configuration saved to a file using the :cfgcmd:`save`
  command. It allows you to keep safe a configuration for future uses. There
  can be multiple configuration files. The default or "boot" configuration is
  saved and loaded from the file ``/config/config.boot``.

Work the Config
===============

.. opcmd:: show configuration

   View the current active configuration, also known as the running
   configuration.

   .. code-block:: none

     vyos@vyos:~$ show configuration
     interfaces {
         ethernet eth0 {
             address dhcp
             hw-id 00:53:00:00:aa:01
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

By default, the configuration is displayed in a hierarchy like the above
example, this is only one of the possible ways to display the configuration.
When the configuration is generated and the device is configured, changes are
added through a collection of :cfgcmd:`set` and :cfgcmd:`delete` commands.

.. opcmd:: show configuration commands

   Get a collection of all the set commands required which led to this
   running configuration.

   .. code-block:: none

     vyos@vyos:~$ show configuration commands
     set interfaces ethernet eth0 address 'dhcp'
     set interfaces ethernet eth0 hw-id '00:53:dd:44:3b:0f'
     set interfaces loopback 'lo'
     set service ssh port '22'
     set system config-management commit-revisions '20'
     set system console device ttyS0 speed '9600'
     set system login user vyos authentication encrypted-password '$6$Vt68...QzF0'
     set system login user vyos level 'admin'
     set system ntp server '0.pool.ntp.org'
     set system ntp server '1.pool.ntp.org'
     set system ntp server '2.pool.ntp.org'
     set system syslog global facility all level 'notice'
     set system syslog global facility protocols level 'debug'

Both these commands should be executed when in operational mode, they do not
work directly in configuration mode. The is a special way on how to
:ref:`run_opmode_from_config_mode`.

Navigating
==========

When entering the configuration mode you are navigating inside the tree
structure exported in the overview above, to enter configuration mode enter
the command :opcmd:`configure` when in operational mode.

.. code-block:: none

  vyos@vyos$ configure
  [edit]
  vyos@vyos#

All commands executed here are relative to the configuration level you have
entered. You can do everything from the top level, but commands will be quite
lengthy when manually typing them.

The current hierarchy level can be changed by the :cfgcmd:`edit` command.

.. code-block:: none

  [edit]
  vyos@vyos# edit interfaces ethernet eth0

  [edit interfaces ethernet eth0]
  vyos@vyos#

You are now in a sublevel relative to ``interfaces ethernet eth0``, all
commands executed from this point on are relative to this sublevel. Use either
the :cfgcmd:`top` or :cfgcmd:`exit` command to go back to the top of the
hierarchy. You can also use the :cfgcmd:`up` command to move only one level up
at a time.

The :cfgcmd:`show` command within configuration mode will show the working
configuration indicating line changes with ``+`` for additions, ``>`` for
replacements and ``-`` for deletions.

.. note:: When going into configuration mode, prompt changes from
   ``$`` to ``#``.

**Example:**

.. code-block:: none

 vyos@vyos:~$ configure
 [edit]
 vyos@vyos# show interfaces
  ethernet eth0 {
      description MY_OLD_DESCRIPTION
      disable
      hw-id 00:53:dd:44:3b:03
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
      hw-id 00:53:dd:44:3b:03
  }
  loopback lo {
  }

It is also possible to display all `set` commands within configuration mode
using :cfgcmd:`show | commands`

.. code-block:: none

  vyos@vyos# show interfaces ethernet eth0 | commands
  set address dhcp
  set hw-id 00:53:ad:44:3b:03

These commands are also relative to the level you are inside and only relevant
configuration blocks will be displayed when entering a sub-level.

.. code-block:: none

  [edit interfaces ethernet eth0]
  vyos@vyos# show
   address dhcp
   hw-id 00:53:ad:44:3b:03

Exiting from the configuration mode is done via the :cfgcmd:`exit` command from
the top level, executing :cfgcmd:`exit` from within a sub-level takes you back
to the top level.

.. code-block:: none

  [edit interfaces ethernet eth0]
  vyos@vyos# exit
  [edit]
  vyos@vyos# exit
  Warning: configuration changes have not been saved.

Managing
========

The configuration is managed by the use of :cfgcmd:`set` and :cfgcmd:`delete`
commands from within configuration mode. Configuration commands are flattened
from the tree into 'one-liner' commands shown in :opcmd:`show configuration
commands` from operation mode.

Commands are relative to the level where they are executed and all redundant
information from the current level is removed from the command entered.

.. code-block:: none

  [edit]
  vyos@vyos# set interface ethernet eth0 address 192.0.2.100/24

  [edit interfaces ethernet eth0]
  vyos@vyos# set address 203.0.113.6/24

These two commands above are essentially the same, just executed from different
levels in the hierarchy.

.. cfgcmd:: delete

   To delete a configuration entry use the :cfgcmd:`delete` command, this also
   deletes all sub-levels under the current level you've specified in the
   :cfgcmd:`delete` command. Deleting an entry will also result in the element
   reverting back to its default value if one exists.

   .. code-block:: none

     [edit interfaces ethernet eth0]
     vyos@vyos# delete address 192.0.2.100/24

.. cfgcmd:: commit

  Any change you do on the configuration, will not take effect until committed
  using the :cfgcmd:`commit` command in configuration mode.

  .. code-block:: none

    vyos@vyos# commit
    [edit]
    vyos@vyos# exit
    Warning: configuration changes have not been saved.
    vyos@vyos:~$

.. cfgcmd:: save

   In order to preserve configuration changes upon reboot, the configuration
   must also be saved once applied. This is done using the :cfgcmd:`save`
   command in configuration mode.

   .. code-block:: none

     vyos@vyos# save
     Saving configuration to '/config/config.boot'...
     Done

   .. code-block:: none

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

.. cfgcmd:: exit [discard]

   Configuration mode can not be exited while uncommitted changes exist. To
   exit configuration mode without applying changes, the :cfgcmd:`exit discard`
   command must be used.

   All changes in the working config will thus be lost.

   .. code-block:: none

     vyos@vyos# exit
     Cannot exit: configuration modified.
     Use 'exit discard' to discard the changes and exit.
     [edit]
     vyos@vyos# exit discard

.. _run_opmode_from_config_mode:

Access opmode from config mode
==============================

When inside configuration mode you are not directly able to execute operational
commands.

.. cfgcmd:: run

  Access to these commands are possible through the use of the ``run [command]``
  command. From this command you will have access to everything accessible from
  operational mode.

  Command completion and syntax help with ``?`` and ``[tab]`` will also work.

  .. code-block:: none

    [edit]
    vyos@vyos# run show interfaces
    Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
    Interface        IP Address                        S/L  Description
    ---------        ----------                        ---  -----------
    eth0             0.0.0.0/0                         u/u

Config Archive
==============

VyOS automatically maintains backups of every previous configurations which
has been comitted to the system.

Local Archive
-------------

Revisions are stored on disk. You can view, compare and rollback them to any
previous revisions if something goes wrong.

.. opcmd:: show system commit

   View all existing revisions on the local system.

   .. code-block:: none

     vyos@vyos:~$ show system commit
     0   2015-03-30 08:53:03 by vyos via cli
     1   2015-03-30 08:52:20 by vyos via cli
     2   2015-03-26 21:26:01 by root via boot-config-loader
     3   2015-03-26 20:43:18 by root via boot-config-loader
     4   2015-03-25 11:06:14 by root via boot-config-loader
     5   2015-03-25 01:04:28 by root via boot-config-loader
     6   2015-03-25 00:16:47 by vyos via cli
     7   2015-03-24 23:43:45 by root via boot-config-loader

.. cfgcmd:: compare <saved | N> <M>

   Compare difference in configuration revisions.

   .. code-block:: none

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

   Revisions can be compared with :cfgcmd:`compare N M` command, where N and M
   are revision numbers. The output will describe how the configuration N is
   when compared to YM indicating with a plus sign (``+``) the additional parts
   N has when compared to M, and indicating with a minus sign (``-``) the
   lacking parts N misses when compared to Y.

   .. code-block:: none

     vyos@vyos# compare 0 6
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

.. cfgcmd:: set system config-management commit-revisions <N>

   You can specify the number of revisions stored on disk. N can be in the
   range of 0 - 65535. When the number of revisions exceeds the configured
   value, the oldest revision is removed.

Rollback Changes
----------------

You can rollback configuration changes using the rollback command. This will
apply the selected revision and trigger a system reboot.

.. cfgcmd:: rollback <N>

   Rollback to revision N (currently requires reboot)

   .. code-block:: none

     vyos@vyos# compare 1
     [edit system]
     >host-name vyos-1
     [edit]

     vyos@vyos# rollback 1
     Proceed with reboot? [confirm][y]
     Broadcast message from root@vyos-1 (pts/0) (Tue Dec 17 21:07:45 2013):
     The system is going down for reboot NOW!

Remote Archive
--------------

VyOS can upload the configuration to a remote location after each call to
:cfgcmd:`commit`. TFTP, FTP, and SFTP servers are supported.

.. cfgcmd set system config-management commit-archive location <URI>

   Specify remote location of commit archive.

   * scp://<user>:<passwd>@<host>/<dir>
   * sftp://<user>:<passwd>@<host>/<dir>
   * ftp://<user>:<passwd>@<host>/<dir>
   * tftp://<host>/<dir>

Restore Default
===============

In the case you want to completely delete your configuration and restore the
default one, you can enter the following command in configuration mode:

.. code-block:: none

  load /opt/vyatta/etc/config.boot.default

You will be asked if you want to continue. If you accept, you will have to use
 :cfgcmd:`commit` if you want to make the changes active.

Then you may want to :cfgcmd:`save` in order to delete the saved configuration
too.

.. note:: If you are remotely connected, you will lose your connection. You may
   want to copy first the config, edit it to ensure connectivity, and load the
   edited config.
