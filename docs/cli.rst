.. _cli:

###
CLI
###

The VyOS :abbr:`CLI (Command-Line Interface)` comprises an
operational and a configuration mode.

Operational mode allows for commands to perform operational system tasks and
view system and service status, while configuration mode allows for the
modification of system configuration. The :ref:`cmd-index`
lists available commands and their functions.

The CLI provides a built-in help system. In the CLI the ``?`` key may be used
to display available commands. The ``TAB`` key can be used to auto-complete
commands and will present the help system upon a conflict or unknown value.

For example typing ``sh`` followed by the ``TAB`` key will complete to
``show``. Pressing ``TAB`` a second time will display the possible
sub-commands of the ``show`` command.

.. code-block:: none

  vyos@vyos:~$ s[tab]
  set   show

Example showing possible show commands:

.. code-block:: none

  vyos@vyos:~$ show [tab]
  Possible completions:
    arp           Show Address Resolution Protocol (ARP) information
    bridge        Show bridging information
    cluster       Show clustering information
    configuration Show running configuration
    conntrack     Show conntrack entries in the conntrack table
    conntrack-sync
                  Show connection syncing information
    date          Show system date and time
    dhcp          Show Dynamic Host Configuration Protocol (DHCP) information
    dhcpv6        Show status related to DHCPv6
    disk          Show status of disk device
    dns           Show Domain Name Server (DNS) information
    file          Show files for a particular image
    firewall      Show firewall information
    flow-accounting
                  Show flow accounting statistics
    hardware      Show system hardware details
    history       show command history
    host          Show host information
    incoming      Show ethernet input-policy information
  : q

You can scroll up with the keys ``[Shift]+[PageUp]`` and scroll down with
``[Shift]+[PageDown]``.

When the output of a command results in more lines than can be displayed on the
terminal screen the output is paginated as indicated by a ``:`` prompt.

When viewing in page mode the following commands are available:
 * ``q`` key can be used to cancel output
 * ``space`` will scroll down one page
 * ``b`` will scroll back one page
 * ``return`` will scroll down one line
 * ``up-arrow`` and ``down-arrow`` will scroll up or down one line at a
   time respectively
 * ``left-arrow`` and ``right-arrow`` can be used to scroll left or right
   in the event that the output has lines which exceed the terminal size.

To enter configuration mode use the ``configure`` command:

.. code-block:: none

  vyos@vyos:~$ configure
  [edit]
  vyos@vyos:~#

.. note:: Prompt changes from ``$`` to ``#``. To exit configuration mode,
   type ``exit``.

.. code-block:: none

  vyos@vyos:~# exit
  exit
  vyos@vyos:~$

See the configuration section of this document for more information on
configuration mode.
