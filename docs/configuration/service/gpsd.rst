.. _gpsd:

####
gpsd
####

:abbr:`gpsd (Global Positioning System Daemon)` is a service daemon that
monitors one or more GPSes or AIS receivers attached to a host computer through
serial or USB ports, making all data on the location/course/velocity of the
sensors available to be queried on a TCP port of the host computer.

With gpsd, multiple location-aware client applications can share access to
supported sensors without contention or loss of data. Also, gpsd responds to
queries with a format that is substantially easier to parse than the NMEA 0183
emitted by most GPSes.

The gpsd protocol is built on top of JSON, JavaScript Object Notation, as
specified in :rfc:`7159`: The JavaScript Object Notation (JSON) Data Interchange
Format.

The rest of this documentation focuses on how to configure gpsd within VyOS.
For more information about the detailed inner workings of gpsd, please refer to
the project documentation here: https://gpsd.gitlab.io/gpsd/

Configuration
=============

.. cfgcmd:: set service gpsd source <source>

   Configure one or more sources for gpsd to read from. gpsd supports multiple
   protocols both filesystem and network based. At least one source must be
   defined for a configuration to be valid. If any other options are set without
   there being a valid source then the configuration will fail to commit.

   There are seven supported protocols

   * ``/dev/device`` - Physical file on the filesystem, usually a device like a serial port
   * ``tcp://<host>:<port>`` - Read from a TCP socket
   * ``udp://<host>:<port>`` - Read from a UDP socket
   * ``ntrip://<host>:<port>`` - Read from an NTRIP server
   * ``dgpsip://<host>:<port>`` - Read from an DGPSIP server
   * ``gpsd://<host>:<port>`` - Read from another gpsd server
   * ``nmea2000://<host>:<port>`` - Read from an NMEA2000 CAN bus

   Example: ``set service gpsd source /dev/ttyS0``

.. cfgcmd:: set service gpsd bad-time

   Use GPS time even with no current fix. Some GPSs have battery powered Real
   Time Clocks (RTCs) built in, making them a valid time source even before a
   fix is acquired. This can be useful on a Raspberry Pi, or other device that
   has no battery powered RTC, and thus has no valid time at startup. Use with
   caution.

   Example: ``set service gpsd bad-time`` - Note that no true/false is needed
   here. The existence/absence of the configuration node is used to set/unset
   this option

   This VyOS option is the same as passing ``-r`` or ``--badtime`` to the gpsd
   command.

.. cfgcmd:: set service gpsd debug <level>

   Set debug level, the higher the level the more debugging information is
   generated. Default is 0. At debug levels 2 and above, gpsd reports
   incoming sentence and actions to syslog. This can generate a lot of log
   messages. Use with caution, especially on production systems.

   Example: ``set service gpsd debug 2``

   If set, must be an integer between 0 and 5 inclusive. This VyOS option is the
   same as passing ``-D <level>`` or ``--debug <level>`` to the gpsd command.

.. cfgcmd:: set service gpsd disable

   Leaves all other config in place but disables the service when configuration
   is committed. Useful for debugging/testing.

.. cfgcmd:: set service gpsd disable-usb-auto

   The usb-auto setting controls whether gpsd automatically reacts to USB GPS
   devices being plugged in or removed while the system is running. When
   enabled, the system monitors USB device events and will dynamically add newly
   connected GPS receivers to gpsd, and remove them again when they are
   unplugged. This allows gpsd to start using a GPS device immediately after it
   is connected, without requiring a service restart or manual configuration
   changes.

   When disabled, gpsd only uses the GPS devices that are explicitly configured
   in the :cfgcmd:`set service gpsd source <source>` section. USB GPS devices
   must already be present when gpsd starts, or gpsd must be manually
   reconfigured after plugging in a device. Unplugging a GPS device will not
   automatically update gpsd’s device list, which can leave gpsd attempting to
   access a device that no longer exists.

   Enabling usb-auto is recommended for systems where GPS hardware may be
   connected, disconnected, or replaced during normal operation (for example,
   removable USB GPS dongles, mobile or field-deployed systems, or environments
   where hardware maintenance occurs without rebooting).

   Disabling usb-auto is recommended on systems with fixed, permanently
   installed GPS hardware or in tightly controlled environments where
   predictable, static configuration is desired. In these cases, disabling
   automatic hotplug handling can simplify troubleshooting and ensure that gpsd
   only interacts with explicitly defined devices.

   This feature defaults to enabled as this is the behaviour of the Debian
   distribution that VyOS is based on. If this is not desired then the
   disable-usb-auto flag should be set

   Example: ``set service gpsd disable-usb-auto``

.. cfgcmd:: set service gpsd framing <framing>

   Fix the framing to the GNSS device. The framing parameter is of the form:
   [78][ENO][012]. Most GNSS are 8N1. Some Trimble default to 8O1. The default
   is to search for the correct framing.

   Example: ``set service gpsd framing 8E1``

   This VyOS option is the same as passing ``-f <framing>`` or
   ``--framing <framing>`` to the gpsd command.

.. cfgcmd:: set service gpsd listen-any

   This flag causes gpsd to listen on all addresses (INADDR_ANY) rather than
   just the loop back (INADDR_LOOPBACK) address. For the sake of privacy and
   security, gpsd information is private by default to the local machine until
   the user makes an effort to expose this to the world.

   If you use this option, consider adding protections in your firewall as
   necessary

   Example: ``set service gpsd listen-any`` - Note that no true/false is needed
   here. The existence/absence of the configuration node is used to set/unset
   this option

   This VyOS option is the same as passing ``-G`` or ``--listenany`` to the gpsd
   command. It also opens up the systemctl ports to the INADDR_ANY interface.

.. cfgcmd:: set service gpsd no-wait

   Don’t wait for a client to connect before polling whatever GPS is associated
   with it. Some RS232 GPSes wait in a standby mode (drawing less power) when
   the host machine is not asserting DTR, and some cellphone and handheld
   embedded GPSes have similar behaviors. Accordingly, waiting for a watch
   request to open the device may save battery power. (This capability is rare
   in consumer-grade devices). You should use this option if you plan to use
   gpsd to provide reference clock information to ntpd or chronyd. This option
   will also enable clients to see data from the receiver sooner on connection.

   Example: ``set service gpsd no-wait`` - Note that no true/false is needed
   here. The existence/absence of the configuration node is used to set/unset
   this option

   This VyOS option is the same as passing ``-n`` or ``--nowait`` to the gpsd
   command.

.. cfgcmd:: set service gpsd port <port>

   Set TCP/IP port on which to listen for gpsd clients (default is 2947 if not
   set).

   Example: ``set service gpsd port 2947``

   This VyOS option is the same as passing ``-S <port>`` or ``--port <port>``
   to the gpsd command. NB: This single configuration node is used for both gpsd
   and systemctl automatically in VyOS; it does not have to be set twice.

.. cfgcmd:: set service gpsd read-only

   Broken-device-safety mode, otherwise known as read-only mode. A few Bluetooth
   and USB receivers lock up or become totally inaccessible when probed or
   reconfigured; see the hardware compatibility list on the GPSD project website
   for details. This switch prevents gpsd from writing to a receiver. This means
   that gpsd cannot configure the receiver for optimal performance, but it also
   means that gpsd cannot break the receiver.

   Example: ``set service gpsd read-only`` - Note that no true/false is needed
   here. The existence/absence of the configuration node is used to set/unset
   this option

   This VyOS option is the same as passing ``-b`` or ``--readonly`` to the gpsd
   command.

.. cfgcmd:: set service gpsd speed <speed>

   Fix the serial port speed to the GNSS device. Allowed speeds are: 4800, 9600,
   19200, 38400, 57600, 115200, 230400, 460800 and 921600. The default is to
   autobaud. Note that some devices with integrated USB ignore port speed.

   Example: ``set service gpsd speed 115200``

   This VyOS option is the same as passing ``-s <speed>`` or ``--speed <speed>``
   to the gpsd command.

Operation Mode
===============

.. opcmd:: show gpsd status

   Shows the status of the gpsd service. This is a symlink to
   ``systemctl status gpsd.service``

.. opcmd:: show gpsd location

   Connects to gpsd and gets the current location from a TPV message. If no
   message is received within 3 seconds then ``No location available`` is
   returned. If the gpsd node has not been configured then the message
   ``gpsd service is not enabled`` is returned.

   Example Output:
.. code-block:: none

   Latitude:  23.4821
   Longitude: -39.7468
