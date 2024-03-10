.. _debugging:

#########
Debugging
#########

There are two flags available to aid in debugging configuration scripts.
Since configuration loading issues will manifest during boot, the flags are
passed as kernel boot parameters.

ISO image build
===============

When having trouble compiling your own ISO image or debugging Jenkins issues
you can follow the steps at :ref:`iso_build_issues`.

System Startup
==============

The system startup can be debugged (like loading in the configuration
file from ``/config/config.boot``. This can be achieve by extending the
Kernel command-line in the bootloader.

Kernel
------

* ``vyos-debug`` - Adding the parameter to the linux boot line will produce
  timing results for the execution of scripts during commit. If one is seeing
  an unexpected delay during manual or boot commit, this may be useful in
  identifying bottlenecks. The internal flag is ``VYOS_DEBUG``, and is found
  in vyatta-cfg_. Output is directed to ``/var/log/vyatta/cfg-stdout.log``.

* ``vyos-config-debug`` - During development, coding errors can lead to a
  commit failure on boot, possibly resulting in a failed initialization of the
  CLI. In this circumstance, the kernel boot parameter ``vyos-config-debug``
  will ensure access to the system as user ``vyos``, and will log a Python
  stack trace to the file ``/tmp/boot-config-trace``.
  File ``boot-config-trace`` will generate only if config loaded with a failure
  status.

Live System
===========

A number of flags can be set up to change the behaviour of VyOS at runtime.
These flags can be toggled using either environment variables or creating
files.

For each feature, a file called ``vyos.feature.debug`` can be created to
toggle the feature on. If a parameter is required it can be placed inside
the file as its first line.

The file can be placed in ``/tmp`` for one time debugging (as the file
will be removed on reboot) or placed in '/config' to stay permanently.

For example, ``/tmp/vyos.ifconfig.debug`` can be created to enable
interface debugging.

It is also possible to set up the debugging using environment variables.
In that case, the name will be (in uppercase) VYOS_FEATURE_DEBUG.

For example running, ``export VYOS_IFCONFIG_DEBUG=""`` on your vbash,
will have the same effect as ``touch /tmp/vyos.ifconfig.debug``.

* ``ifconfig`` - Once set, all commands used, and their responses received
  from the OS, will be presented on the screen for inspection.

* ``command`` - Once set, all commands used, and their responses received
  from the OS, will be presented on the screen for inspection.

* ``developer`` - Should a command fail, instead of printing a message to the
  user explaining how to report issues, the python interpreter will start a
  PBD post-mortem session to allow the developer to debug the issue. As the
  debugger will wait from input from the developer, it has the capacity to
  prevent a router to boot and therefore should only be permanently set up
  on production if you are ready to see the OS fail to boot.

* ``log`` - In some rare cases, it may be useful to see what the OS is doing,
  including during boot. This option sends all commands used by VyOS to a
  file. The default file is ``/tmp/full-log`` but it can be changed.

.. note:: In order to retrieve the debug output on the command-line you need to
  disable ``vyos-configd`` in addition. This can be run either one-time by
  calling ``sudo systemctl stop vyos-configd`` or make this reboot-safe by
  calling ``sudo systemctl disable vyos-configd``.

FRR
---

Recent versions use the ``vyos.frr`` framework. The Python class is located
inside our ``vyos-1x:python/vyos/frr.py``. It comes with an embedded debugging/
(print style) debugger as vyos.ifconfig does.

To enable debugging just run: ``$ touch /tmp/vyos.frr.debug``

Debugging Python Code with PDB
------------------------------

Sometimes it might be useful to debug Python code interactively on the live
system rather than a IDE. This can be achieved using pdb.

Let us assume you want to debug a Python script that is called by an op-mode
command. After you found the script by looking up the op-mode-defitions you
can edit the script in the live system using e.g. vi:
``vi /usr/libexec/vyos/op_mode/show_xyz.py``

Insert the following statement right before the section where you want to
investigate a problem (e.g. a statement you see in a backtrace):
``import pdb; pdb.set_trace()``
Optionally you can surrounded this statement by an ``if`` which only triggers
under the condition you are interested in.

Once you run ``show xyz`` and your condition is triggered you should be dropped
into the python debugger:


.. code-block:: none

   > /usr/libexec/vyos/op_mode/show_nat_translations.py(109)process()
   -> rule_type = rule.get('type', '')
   (Pdb)

You can type ``help`` to get an overview of the available commands, and
``help command`` to get more information on each command.

Useful commands are:

* examine variables using ``pp(var)``
* continue execution using ``cont``
* get a backtrace using ``bt``

Config Migration Scripts
------------------------

When writing a new configuration migrator it may happen that you see an error
when you try to invoke it manually on a development system. This error will
look like:

.. code-block:: none

  vyos@vyos:~$ /opt/vyatta/etc/config-migrate/migrate/ssh/0-to-1 /tmp/config.boot
  Traceback (most recent call last):
    File "/opt/vyatta/etc/config-migrate/migrate/ssh/0-to-1", line 31, in <module>
      config = ConfigTree(config_file)
    File "/usr/lib/python3/dist-packages/vyos/configtree.py", line 134, in __init__
      raise ValueError("Failed to parse config: {0}".format(msg))
  ValueError: Failed to parse config: Syntax error on line 240, character 1: Invalid syntax.

The reason is that the configuration migration backend is rewritten and uses
a new form of "magic string" which is applied on demand when real config
migration is run on boot. When running individual migrators for testing,
you need to convert the "magic string" on your own by:

.. code-block:: none

  vyos@vyos:~$ /usr/libexec/vyos/run-config-migration.py --virtual --set-vintage vyos /tmp/config.boot

Configuration Error on System Boot
----------------------------------

Being brave and running the latest rolling releases will sometimes trigger
bugs due to corner cases we missed in our design. Those bugs should be filed
via Phabricator_ but you can help us to narrow down the issue. Login to your
VyOS system and change into configuration mode by typing ``configure``. Now
re-load your boot configuration by simply typing ``load`` followed by return.

You should now see a Python backtrace which will help us to handle the issue,
please attach it to the Phabricator_ task.

Boot Timing
-----------

During the migration and extensive rewrite of functionality from Perl into
Python a significant increase in the overall system boottime was noticed. The
system boot time can be analysed and a graph can be generated in the end which
shows in detail who called whom during the system startup phase.

This is done by utilizing the ``systemd-bootchart`` package which is now
installed by default on the VyOS 1.3 (equuleus) branch. The configuration is
also versioned so we get comparable results. ``systemd-bootchart`` is configured
using this file: bootchart.conf_

To enable boot time graphing change the Kernel commandline and add the following
string: ``init=/usr/lib/systemd/systemd-bootchart``

This can also be done permanently by changing ``/boot/grub/grub.cfg``.

Priorities
==========

VyOS CLI is all about priorities. Every CLI node has a corresponding
``node.def`` file and possibly an attached script that is executed when the
node is present. Nodes can have a priority, and on system bootup - or any
other ``commit`` to the config all scripts are executed from lowest to highest
priority. This is good as this gives a deterministic behavior.

To debug issues in priorities or to see what's going on in the background
you can use the ``/opt/vyatta/sbin/priority.pl`` script which lists to you
the execution order of the scripts.

.. stop_vyoslinter

.. _vyatta-cfg: https://github.com/vyos/vyatta-cfg
.. _bootchart.conf: https://github.com/vyos/vyos-build/blob/current/data/live-build-config/includes.chroot/etc/systemd/bootchart.conf
.. include:: /_include/common-references.txt

.. start_vyoslinter
