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

Because configuration changes are made using `set` and `delete` commands, the
commands to generate the active configuration can also be displayed using the
`show configuration commands` command.

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
