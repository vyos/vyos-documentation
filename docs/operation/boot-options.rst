.. _boot-options:


############
Boot Options
############

.. warning:: This function may be highly disruptive.
   It may cause major service interruption, so make sure you really
   need it and verify your input carefully.



VyOS has several kernel command line options to modify the normal boot
process. 
To add an option, select the desired image in GRUB menu at load
time, press **e**, edit the first line, and press **Ctrl-x** to boot when
ready.

.. image:: /_static/images/boot-options.png
   :width: 80%
   :align: center


Specify custom config file
==========================

Tells the system to use specified file instead of ``/config/config.boot``.
If specified file does not exist or is not readable, fall back to
default config. No additional verification is performed, so make sure
you specify a valid config file.

.. code-block:: none

   vyos-config=/path/to/file

To load the *factory default* config, use:

.. code-block:: none

   vyos-config=/opt/vyatta/etc/config.boot.default


Disable specific boot process steps
===================================

These options disable some boot steps. Make sure you understand the
:ref:`boot process <boot-steps>` well before using them!

.. glossary::

    no-vyos-migrate
      Do not perform config migration.

    no-vyos-firewall
      Do not initialize default firewall chains, renders any firewall
      configuration unusable.

