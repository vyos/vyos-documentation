.. _commandtree_configmode:

Configuration mode
------------------

.. code-block:: sh

  confirm           Confirm prior commit-confirm
  comment           Add comment to this configuration element
  commit            Commit the current set of changes
  commit-confirm    Commit the current set of changes with 'confirm' required
  compare           Compare configuration revisions
  copy              Copy a configuration element
  delete            Delete a configuration element
  discard           Discard uncommitted changes
  edit              Edit a sub-element
  exit              Exit from this configuration level
  load              Load configuration from a file and replace running configuration
  loadkey           Load user SSH key from a file
  merge             Load configuration from a file and merge running configuration
  rename            Rename a configuration element
  rollback          Rollback to a prior config revision (requires reboot)
  run               Run an operational-mode command
  save              Save configuration to a file
  set               Set the value of a parameter or create a new element
  show              Show the configuration (default values may be suppressed)


Confirm
^^^^^^^

The ``confirm`` command confirms the prior ``commit-confirm``.

Comment
^^^^^^^

The ``comment`` commands allow you to insert a comment above the current configuration section.
The command cannot be used at the top of the configuration hierarchy, only on subsections. Comments needs to be commited, just like other config changes.

To add a comment to a section, while being already at the proper section level:

.. code-block:: sh

  [edit <section>]
  vyos@vyos# comment "Type Comment Here"

To add a comment directly to a section, from the top or a higher section:

.. code-block:: sh

  [edit]
  vyos@vyos# comment <section> "Type Comment Here"

To remove a comment, add a blank comment to overwrite:

.. code-block:: sh

  [edit <section>]
  vyos@vyos# comment ""

Examples
********

To add a comment to the "interfaces" section:

.. code-block:: sh

  [edit]
  vyos@vyos# edit interfaces
  [edit interfaces]
  vyos@vyos# comment "Here is a comment"
  [edit interfaces]
  vyos@vyos# commit

The comment would then appear like this:

.. code-block:: sh

  [edit]
  vyos@vyos# show
   /* Here is a comment */
    interfaces {
        ethernet eth0 {
    [...]


An important thing to note is that since the comment is added on top of the section, it will not appear if the ``show <section>`` command is used. With the above example, the ``show interfaces`` command would return starting after the "interfaces {" line, hiding the comment:

.. code-block:: sh

  [edit]
  vyos@vyos# show interfaces
   ethernet eth0 {
  [...]


To add a comment to the interfaces section from the top:

.. code-block:: sh

  [edit]
  vyos@vyos# comment interfaces "test"


The comment can be added to any node that already exists, even if it's multiple levels lower:

.. code-block:: sh

  [edit]
  vyos@vyos# comment interfaces ethernet eth0 vif 222 address "Far down comment"


Commit
^^^^^^

The ``commit`` command commits the proposed changes to the configuration file.
Every changes done in the configuration session is only applied when the configuration is committed. To view the changes that will be applied, use the show command.
To discard the changes without committing, use the ``discard`` command. The ``commit`` command doesn't save the configuration, you need to manually use the ``save`` command.

The confirm keyword can be added, see ``commit-confirm``. A comment can be entered, it will appear in the commit log.

.. code-block:: sh

  [edit]
  vyos@vyos# commit
  Possible completions:
    <Enter>       Commit working configuration
    comment       Comment for commit log

Commit-confirm
^^^^^^^^^^^^^^

The ``commit-confirm`` command commits the proposed changes to the configuration file and starts a timer.
If the ``confirm`` command is not entered before the timer expiration, the configuration will be rolled back and VyOS will reboot.
The default timer value is 10 minutes, but a custom value can be entered.

.. code-block:: sh

  [edit]
  vyos@vyos# commit-confirm
  Possible completions:
    <Enter>       Commit, rollback/reboot in 10 minutes if no confirm
    <N>           Commit, rollback/reboot in N minutes if no confirm
    comment       Comment for commit log


Compare
^^^^^^^

VyOS maintains backups of previous configurations. To compare configuration revisions in configuration mode, use the compare command:

.. code-block:: sh

  [edit]
  vyos@vyos# compare
  Possible completions:
    <Enter>	Compare working & active configurations
    saved		Compare working & saved configurations
    <N>		Compare working with revision N
    <N> <M>	Compare revision N with M
  
    Revisions:
      0	2019-03-20 20:57:22 root by boot-config-loader
      1	2019-03-15 20:00:04 root by boot-config-loader
      2	2019-03-05 01:58:39 vyos by cli
      3	2019-03-05 01:54:59 vyos by cli
      4	2019-03-05 01:53:08 vyos by cli
      5	2019-03-05 01:52:21 vyos by cli
      6	2019-02-24 21:01:24 root by boot-config-loader
      7	2019-02-21 22:00:12 vyos by cli
      8	2019-02-21 21:56:49 vyos by cli


Copy
^^^^

The ``copy`` command allows you to copy a configuration object.

Copy the configuration entrys from a firewall name WAN rule 1 to rule 2.

.. code-block:: sh

  [edit firewall name WAN]
  vyos@vyos# show
   rule 1 {
       action accept
       source {
           address 10.1.0.0/24
       }
   }
  [edit firewall name WAN]
  vyos@vyos# copy rule 1 to rule 2
  [edit firewall name WAN]
  vyos@vyos# show
   rule 1 {
       action accept
       source {
           address 10.1.0.0/24
       }
   }
  +rule 2 {
  +    action accept
  +    source {
  +        address 10.1.0.0/24
  +    }
  +}

Delete
^^^^^^

The ``delte`` command is to delete a configuration entry.

This Example delete the hole ``service tftp-server`` section.

.. code-block:: sh

  delete service tftp-server

Discard
^^^^^^^

The ``discard`` command removes all pending configuration changes.

.. code-block:: sh

  [edit]
  vyos@vyos# discard
  
    Changes have been discarded

Edit
^^^^

The ``edit`` command allows you to navigate down into the configuration tree.
To get back to an upper level, use the ``up`` command or use the ``top`` command to get back to the upper most level.
The ``[edit]`` text displays where the user is located in the configuration tree.

.. code-block:: sh

  [edit]
  vyos@vyos# edit interfaces
  [edit interfaces]
  vyos@vyos# edit ethernet eth0
  [edit interfaces ethernet eth0]

Exit
^^^^

The ``exit`` command exits the current configuration mode. If the current configuration level isn't the top-most, then the configuration level is put back to the top-most level.
If the configuration level is at the top-most level, then it exits the configuration mode and returns to operational mode.
The ``exit`` command cannot be used if uncommitted changes exists in the configuration file. To exit with uncommitted changes, you either need to use the ``exit discard`` command or you need to commit the changes before exiting.
The ``exit`` command doesn't save the configuration, only the ``save`` command does. A warning will be given when exiting with unsaved changes. Using the ``exit`` command in operational mode will logout the session.


Exiting from a configuration level:


.. code-block:: sh

  [edit interfaces ethernet eth0]
  vyos@vyos# exit
  [edit]
  vyos@vyos#

Exiting from configuration mode:

.. code-block:: sh

  [edit]
  vyos@vyos# exit
  exit
  vyos@vyos:~$

Exiting from operational mode:

.. code-block:: sh

  vyos@vyos:~$ exit
  logout

Error message when trying to exit with uncommitted changes:

.. code-block:: sh

  vyos@vyos# exit
  Cannot exit: configuration modified.
  Use 'exit discard' to discard the changes and exit.
  [edit]
  vyos@vyos#


Warning message when exiting with unsaved changes:

.. code-block:: sh

  [edit]
  vyos@vyos# exit
  Warning: configuration changes have not been saved.
  exit
  vyos@vyos:~$

Load
^^^^

The ``load`` command load a configuration from a local or remote file. You have to be use ``commit`` to make the change active

.. code-block:: sh

  <Enter>				Load from system config file
  <file>				Load from file on local machine
  scp://<user>:<passwd>@<host>/<file>	Load from file on remote machine
  sftp://<user>:<passwd>@<host>/<file>	Load from file on remote machine
  ftp://<user>:<passwd>@<host>/<file>	Load from file on remote machine
  http://<host>/<file>			Load from file on remote machine
  https://<host>/<file>			Load from file on remote machine
  tftp://<host>/<file>			Load from file on remote machine


.. code-block:: sh

  [edit]
  vyos@vyos# load
  Loading configuration from '/config/config.boot'...

  Load complete.  Use 'commit' to make changes active.


Loadkey
^^^^^^^^

Copies the content of a public key to the ~/.ssh/authorized_keys file.

.. code-block:: sh

  loadkey <username> [tab]

  <file>                      Load from file on local machine
  scp://<user>@<host>/<file>  Load from file on remote machine
  sftp://<user>@<host>/<file> Load from file on remote machine
  ftp://<user>@<host>/<file>  Load from file on remote machine
  http://<host>/<file>        Load from file on remote machine
  tftp://<host>/<file>        Load from file on remote machine

Merge
^^^^^

The ``merge`` command merge the config from a local or remote file with the running config.

In the example below exist a ``default-firewall.config`` file with some common firewall rules you saved earlier.

.. code-block:: sh

  [edit]
  vyos@vyos# show firewall
  Configuration under specified path is empty
  [edit]
  vyos@vyos# merge default-firewall.config
  Loading configuration from '/config/default-firewall.config'...

  Merge complete.  Use 'commit' to make changes active.
  [edit]
  vyos@vyos#

  vyos@vyos# show firewall
  +all-ping enable
  +broadcast-ping disable
  +config-trap disable
  +ipv6-receive-redirects disable
  +ipv6-src-route disable
  +ip-src-route disable
  +log-martians enable
  +name WAN {
  +    default-action drop
  +    rule 1 {
  +        action accept
  +        source {
  +            address 10.1.0.0/24
  +        }
  +    }
  +    rule 2 {
  +        action accept
  +        source {
  +            address 10.1.0.0/24
  +        }
  ......


Rename
^^^^^^

The ``rename`` command allows you to rename or move a configuration object.

See here how to move the configuration entrys from vlanid 3 to 2

.. code-block:: sh

  [edit interfaces ethernet eth1]
  vyos@vyos# show
   duplex auto
   hw-id 08:00:27:81:c6:59
   smp-affinity auto
   speed auto
   vif 3 {
       address 10.4.4.4/32
   }
  [edit interfaces ethernet eth1]
  vyos@vyos# rename vif 3 to vif 2
  [edit interfaces ethernet eth1]
  vyos@vyos# show
   duplex auto
   hw-id 08:00:27:81:c6:59
   smp-affinity auto
   speed auto
  +vif 2 {
  +    address 10.4.4.4/32
  +}
  -vif 3 {
  -    address 10.4.4.4/32
  -}
  [edit interfaces ethernet eth1]
  vyos@vyos#


Rollback
^^^^^^^^

You can ``rollback`` configuration using the rollback command, however this command will currently trigger a system reboot.
Use the compare command to verify the configuration you want to rollback to.

.. code-block:: sh

  vyos@vyos# compare 1
  [edit system]
  >host-name vyos-1
  [edit]
  vyos@vyos# rollback 1
  Proceed with reboot? [confirm][y]
  
  Broadcast message from root@vyos-1 (pts/0) (Tue Dec 17 21:07:45 2018):
  
  The system is going down for reboot NOW!
  [edit]
  vyos@vyos#

Run
^^^

The ``run`` command allows you to execute any operational mode commands without exiting the configuration session.

.. code-block:: sh

  [edit]
  vyos@vyos# run show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             10.1.1.1/24                        u/u


Save
^^^^

The ``save`` command saves the current configuration to non-volatile storage. VyOS also supports saving and loading configuration remotely using SCP, FTP, or TFTP.

.. code-block:: sh

  <Enter>				Save to system config file
  <file>				Save to file on local machine
  scp://<user>:<passwd>@<host>/<file>	Save to file on remote machine
  sftp://<user>:<passwd>@<host>/<file>	Save to file on remote machine
  ftp://<user>:<passwd>@<host>/<file>	Save to file on remote machine
  tftp://<host>/<file>			Save to file on remote machine

Set
^^^

The ``set`` command create all configuration entrys

.. code-block:: sh

  [edit]
  vyos@vyos# set protocols static route 0.0.0.0/0 next-hop 192.168.1.1

Show
^^^^

The ``show`` command in the configuration mode displays the configuration and show uncommitted changes.

Show the hole config, the address and description of eth1 is moving to vlan 2 if you commit the changes.

.. code-block:: sh

  [edit]
  vyos@vyos# show
   interfaces {
       dummy dum0 {
           address 10.3.3.3/24
       }
       ethernet eth0 {
           address dhcp
           duplex auto
           hw-id 08:00:27:2b:c0:0b
           smp-affinity auto
           speed auto
       }
       ethernet eth1 {
  -        address 10.1.1.1/32
  -        description "MGMT Interface"
           duplex auto
           hw-id 08:00:27:81:c6:59
           smp-affinity auto
           speed auto
  +        vif 2 {
  +            address 10.1.1.1/32
  +            description "MGMT Interface"
  +        }
       }
       loopback lo {
       }
   }
   service {
       ssh {
           port 22
  ......