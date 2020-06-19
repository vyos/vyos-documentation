.. _console_server:

##############
Console Server
##############

Starting of with VyOS 1.3 (equuleus) we added support for running VyOS as an
Out-of-Band Management device which provides remote access by means of SSH to
directly attached serial interfaces.

Serial interfaces can be any interface which is directly connected to the CPU
or chipset (mostly known as a ttyS interface in Linux) or any other USB to
serial converter (Prolific PL2303 or FTDI FT232/FT4232 based chips).

If you happened to use a Cisco NM-16A - Sixteen Port Async Network Module or
NM-32A - Thirty-two Port Async Network Module - this is your VyOS replacement.

Setup
=====

In the past serial interface have been defined as ttySx and ttyUSBx where x was
an instance number of the serial interface. It was discovered that from system
boot to system boot the mapping of USB based serial interfaces will differ,
depending which driver was loaded first by the operating system. This will become
rather painful if you not only have serial interfaces for a console server
connected but in addition also a serial backed :ref:`wwan-interface`.

To overcome this issue and the fact that in almost 50% of all cheap USB to serial
converters there is no serial number programmed, the USB to serial interface is
now directly identified by the USB root bridge and bus it connects to. This
somehow mimics the new network interface definitions we see in recend Linux
distributions.

For additional details you can refer to https://phabricator.vyos.net/T2490.

.. opcmd:: show system usb

  Retrieve a tree like representation of all connected USB devices.

  .. note:: If a device is unplugged and re-plugged it will receive a new
    Port, Dev, If identification.

  .. code-block:: none

    vyos@vyos:~$ show system usb
    /:  Bus 03.Port 1: Dev 1, Class=root_hub, Driver=ehci-pci/2p, 480M
        |__ Port 1: Dev 2, If 0, Class=Hub, Driver=hub/4p, 480M
            |__ Port 3: Dev 4, If 0, Class=Vendor Specific Class, Driver=qcserial, 480M
            |__ Port 3: Dev 4, If 2, Class=Vendor Specific Class, Driver=qcserial, 480M
            |__ Port 3: Dev 4, If 3, Class=Vendor Specific Class, Driver=qcserial, 480M
            |__ Port 3: Dev 4, If 8, Class=Vendor Specific Class, Driver=qmi_wwan, 480M
    /:  Bus 02.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 5000M
    /:  Bus 01.Port 1: Dev 1, Class=root_hub, Driver=xhci_hcd/2p, 480M
        |__ Port 1: Dev 2, If 0, Class=Vendor Specific Class, Driver=pl2303, 12M
        |__ Port 2: Dev 3, If 0, Class=Hub, Driver=hub/4p, 480M
            |__ Port 4: Dev 5, If 2, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
            |__ Port 4: Dev 5, If 0, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
            |__ Port 4: Dev 5, If 3, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
            |__ Port 4: Dev 5, If 1, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
            |__ Port 3: Dev 4, If 0, Class=Hub, Driver=hub/4p, 480M
                |__ Port 3: Dev 6, If 0, Class=Hub, Driver=hub/4p, 480M
                    |__ Port 4: Dev 8, If 2, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
                    |__ Port 4: Dev 8, If 0, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
                    |__ Port 4: Dev 8, If 3, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
                    |__ Port 4: Dev 8, If 1, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
                |__ Port 4: Dev 7, If 3, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
                |__ Port 4: Dev 7, If 1, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
                |__ Port 4: Dev 7, If 2, Class=Vendor Specific Class, Driver=ftdi_sio, 480M
                |__ Port 4: Dev 7, If 0, Class=Vendor Specific Class, Driver=ftdi_sio, 480M


.. opcmd:: show system usb

  Retrieve a list and description of all connected USB serial devices. The device name
  displayed, e.g. `usb0b2.4p1.0` can be directly used when accessing the serial console
  as console-server device.

  .. code-block:: none

    vyos@vyos$ show system usb serial
    Device           Model               Vendor
    ------           ------              ------
    usb0b1.3p1.0     MC7710              Sierra Wireless, Inc.
    usb0b1.3p1.2     MC7710              Sierra Wireless, Inc.
    usb0b1.3p1.3     MC7710              Sierra Wireless, Inc.
    usb0b1p1.0       USB-Serial_Controller_D Prolific Technology, Inc.
    usb0b2.3.3.4p1.0 Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.3.3.4p1.1 Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.3.3.4p1.2 Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.3.3.4p1.3 Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.3.4p1.0   Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.3.4p1.1   Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.3.4p1.2   Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.3.4p1.3   Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.4p1.0     Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.4p1.1     Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.4p1.2     Quad_RS232-HS       Future Technology Devices International, Ltd
    usb0b2.4p1.3     Quad_RS232-HS       Future Technology Devices International, Ltd


Configuration
=============

Between computers, the most common configuration used was "8N1": eight bit
characters, with one start bit, one stop bit, and no parity bit. Thus 10 Baud
times are used to send a single character, and so dividing the signalling
bit-rate by ten results in the overall transmission speed in characters per
second. This is also the default setting if none of those options are defined.

.. cfgcmd:: set service console-server <device> data-bits [7 | 8]

  Configure either seven or eight data bits. This defaults to eight data
  bits if left unconfigured.

.. cfgcmd:: set service console-server <device> description <string>

  A user friendly description identifying the connected peripheral.

.. cfgcmd:: set service console-server <device> parity [even | odd | none]

  Set the parity option for the console. If unset this will default to none.

.. cfgcmd:: set service console-server <device> stop-bits [1 | 2]

  Configure either one or two stop bits. This defaults to one stop bits if
  left unconfigured.

.. cfgcmd:: set service console-server <device> speed [ 300 | 1200 | 2400 | 4800 | 9600 | 19200 | 38400 | 57600 | 115200 ]

  .. note:: USB to serial converters will handle most of their work in software
     so you should be carefull with the selected baudrate as some times they
     can't cope with the expected speed.

Remote Access
-------------

Each individual configured console-server device can be directly exposed to
the outside world. A user can directly connect via SSH to the configured
port.

.. cfgcmd:: set service console-server <device> ssh port <port>

  Accept SSH connections for the given `<device>` on TCP port `<port>`.
  After successfull authentication the user will be directly dropped to
  the connected serial device.

  .. hint:: Multiple users can connect to the same serial device but only
     one is allowed to write to the console port.

Operation
=========

.. opcmd:: show console-server ports

  Show configured serial ports and their respective interface configuration.

  .. code-block:: none

    vyos@vyos:~$ show console-server ports
     usb0b2.4p1.0             on /dev/serial/by-bus/usb0b2.4p1.0@ at   9600n

.. opcmd:: show console-server user

  Show currently connected users.

  .. code-block::

    vyos@vyos:~$ show console-server user
     usb0b2.4p1.0               up   vyos@localhost


.. opcmd:: connect console-server <device>

  Locally connect to serial port identified by `<device>`.

  .. code-block:: none

    vyos@vyos-r1:~$ connect console-server usb0b2.4p1.0
    [Enter `^Ec?' for help]
    [-- MOTD -- VyOS Console Server]

    vyos-r2 login:

  .. hint:: Multiple users can connect to the same serial device but only
     one is allowed to write to the console port.

  .. hint:: The sequence ``^Ec?`` translates to: ``Ctrl+E c ?``. To quit
     the session use: ``Ctrl+E c .``
