.. _system-display:

##############
System Display
##############

The system display options are for users running VyOS on hardware that features
an LCD screen. This is typically a small display built in a 1U rack-mountable
appliance. These displays can be used to show runtime data like network traffic
and CPU load histogram.

The first step is to identify the LCD screen model. This step is required.

.. cfgcmd:: set system display model <device>

Available models are: (see completion helper for the most up-to-date list):

   * ``EZIO`` - Display model for Portwell, Caswell appliances with built-in EZIO-100 or EZIO-300 LCD
   * ``SDEC`` - Display model for Lanner, Watchguard, Nexcom NSA appliances with built-in SDEC LCD

   .. note:: This model is to be understood as a macro type, to be expanded over
      time as needed.

The next step is to select what screen(s) to show on the system display.

.. cfgcmd:: set system display show <category>

Screens are grouped in the following categories:

   * ``host`` - For all host-related screens, like CPU and memory
   * ``network`` - For network traffic
   * ``clock`` - For a choice of several clock formats

.. cfgcmd:: set system display show host <screen>

The host category offers the following options:

   * ``cpu`` - Detailed CPU usage
   * ``cpu-all`` - CPU usage overview (one line per CPU)
   * ``cpu-hist`` - CPU usage histogram
   * ``disk`` - File systems fill level
   * ``load-hist`` - Load histogram
   * ``memory`` - Memory and swap usage
   * ``proc`` - Top processes by size
   * ``uptime`` - System uptime

.. cfgcmd:: set system display show network <interface> alias <name>

The network category allows the selection of the network interface for which
to show traffic. A list of available interfaces is available by pressing tab.
An alias like WAN or LAN can also be entered if needed.

The units of network traffic can be chosen with the following command:

.. cfgcmd:: set system display show network units <unit>

The unit options are:

   * ``bps`` - Bits per second
   * ``Bps`` - Bytes per second
   * ``pps`` - packets per second

.. cfgcmd:: set system display show clock <type>

The clock category offers the following options:

   * ``big`` - Multi-line clock
   * ``mini`` - Minimal clock
   * ``date-time`` - Clock with Date and Time

The following optional commands may help configure the screen to your liking.

.. cfgcmd:: set system display show title <text>

This will set the title text on the display screens

.. cfgcmd:: set system display hello <text>
.. cfgcmd:: set system display bye <text>

This will set the welcome and final text on the screen as the system display
starts and stops.

.. cfgcmd:: set system display duration <s>

This will set the time (in seconds) to hold each screen on the system display.

.. cfgcmd:: set system display config

The config option allows the entire system display configuration to be
enabled or disabled without having to delete and re-create the configuration.
