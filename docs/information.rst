.. _information:

***********
Information
***********

VyOS features a rich set of operational level commands to retrieve arbitrary
infomration about your running system.

########
Hardware
########

.. _hardware_usb:

USB
===

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

.. opcmd:: show hardware usb

  Retrieve a tree like representation of all connected USB devices.

  .. note:: If a device is unplugged and re-plugged it will receive a new
    Port, Dev, If identification.

  .. code-block:: none

    vyos@vyos:~$ show hardware usb
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


.. opcmd:: show hardware usb serial

  Retrieve a list and description of all connected USB serial devices. The device name
  displayed, e.g. `usb0b2.4p1.0` can be directly used when accessing the serial console
  as console-server device.

  .. code-block:: none

    vyos@vyos$ show hardware usb serial
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

