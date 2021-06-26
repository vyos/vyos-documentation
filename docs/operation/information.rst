.. _information:

***********
Information
***********

VyOS features a rich set of operational level commands to retrieve arbitrary
information about your running system.

########
Hardware
########

.. _hardware_usb:

USB
===

In the past serial interface have been defined as ttySx and ttyUSBx where x was
an instance number of the serial interface. It was discovered that from system
boot to system boot the mapping of USB based serial interfaces will differ,
depending which driver was loaded first by the operating system. This will
become rather painful if you not only have serial interfaces for a console
server connected but in addition also a serial backed :ref:`wwan-interface`.

To overcome this issue and the fact that in almost 50% of all cheap USB to
serial converters there is no serial number programmed, the USB to serial
interface is now directly identified by the USB root bridge and bus it connects
to. This somehow mimics the new network interface definitions we see in recend
Linux distributions.

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

  Retrieve a list and description of all connected USB serial devices. The
  device name displayed, e.g. `usb0b2.4p1.0` can be directly used when accessing
  the serial console as console-server device.

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

.. _information_version:

########
Version
########

.. opcmd:: show version

  Return the current running VyOS version and build information. This includes
  also the name of the release train which is ``crux`` on VyOS 1.2, ``equuleus``
  on VyOS 1.3 and ``sagitta`` on VyOS 1.4.

  .. code-block:: none

    vyos@vyos:~$ show version

    Version:          VyOS 1.3.0-rc4
    Release Train:    equuleus

    Built by:         Sentrium S.L.
    Built on:         Mon 19 Apr 2021 08:28 UTC
    Build UUID:       8d9996d2-511e-4dea-be4f-cd4515c404f3
    Build Commit ID:  2aac286ccfe594

    Architecture:     x86_64
    Boot via:         installed image
    System type:      VMware guest

    Hardware vendor:  VMware, Inc.
    Hardware model:   VMware Virtual Platform
    Hardware S/N:     VMware-42 33 79 fe 73 64 2d 62-d5 62 ab 99 5a 3e d9 6d
    Hardware UUID:    fe793342-6473-622d-d562-ab995a3ed96d

    Copyright:        VyOS maintainers and contributors

.. opcmd:: show version kernel

  Return version number of the Linux Kernel used in this release.

  .. code-block:: none

    vyos@vyos:~$ show version kernel
    5.4.128-amd64-vyos

.. opcmd:: show version frr

  Return version number of FRR (Free Range Routing - https://frrouting.org/)
  used in this release. This is the routing control plane and a successor to GNU
  Zebra and Quagga.

    .. code-block:: none

      vyos@vyos:~$ show version frr
      FRRouting 7.5.1-20210625-00-gf07d935a2 (vyos).
      Copyright 1996-2005 Kunihiro Ishiguro, et al.

