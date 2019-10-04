.. _vyosonbaremetal:

Running on Bare Metal
#####################

Intel Atom C3000
****************

I opted to get one of the new Intel Atom C3000 CPUs to spawn VyOS on it.
Running VyOS on an UEFI only device is supported as of VyOS release 1.2.

Shopping Cart
-------------

* 1x Supermicro CSE-505-203B (19" 1U chassis, inkl. 200W PSU)
* 1x Supermicro MCP-260-00085-0B (I/O Shield for A2SDi-2C-HLN4F)
* 1x Supermicro A2SDi-2C-HLN4F (Intel Atom C3338, 2C/2T, 4MB cache, Quad LAN with
  Intel C3000 SoC 1GbE)
* 1x Crucial CT4G4DFS824A (4GB DDR4 RAM 2400 MT/s, PC4-19200)
* 1x SanDisk Ultra Fit 32GB (USB-A 3.0 SDCZ43-032G-G46 mass storage for OS)
* 1x Supermicro MCP-320-81302-0B (optional FAN tray)

Optional (10GE)
---------------
If you wan't to get additional ethernet ports or even 10GE connectivity
the following optional parts will be required:

* 1x Supermicro RSC-RR1U-E8 (Riser Card)
* 1x Supermicro MCP-120-00063-0N (Riser Card Bracket)

Latest VyOS rolling releases boot without any problem on this board. You also
receive a nice IPMI interface realized with an ASPEED AST2400 BMC (no information
about `OpenBMC <https://www.openbmc.org/>`_ so far on this motherboard).

Pictures
--------

.. figure:: /_static/images/1u_vyos_back.jpg
   :scale: 25 %
   :alt: CSE-505-203B Back

.. figure:: /_static/images/1u_vyos_front.jpg
   :scale: 25 %
   :alt: CSE-505-203B Front

.. figure:: /_static/images/1u_vyos_front_open_1.jpg
   :scale: 25 %
   :alt: CSE-505-203B Open 1

.. figure:: /_static/images/1u_vyos_front_open_2.jpg
   :scale: 25 %
   :alt: CSE-505-203B Open 2

.. figure:: /_static/images/1u_vyos_front_open_3.jpg
   :scale: 25 %
   :alt: CSE-505-203B Open 3

.. figure:: /_static/images/1u_vyos_front_10ge_open_1.jpg
   :scale: 25 %
   :alt: CSE-505-203B w/ 10GE Open 1

.. figure:: /_static/images/1u_vyos_front_10ge_open_2.jpg
   :scale: 25 %
   :alt: CSE-505-203B w/ 10GE Open 2

.. figure:: /_static/images/1u_vyos_front_10ge_open_3.jpg
   :scale: 25 %
   :alt: CSE-505-203B w/ 10GE Open 3

.. figure:: /_static/images/1u_vyos_front_10ge_open_4.jpg
   :scale: 25 %
   :alt: CSE-505-203B w/ 10GE Open


PC Engines APU4
***************

As this platform seems to be quiet common in terms of noise, cost, power and
performance it makes sense to write a small installation manual.

This guide was developed using an APU4C4 board with the following specs:

* AMD Embedded G series GX-412TC, 1 GHz quad Jaguar core with 64 bit and AES-NI
  support, 32K data + 32K instruction cache per core, shared 2MB L2 cache.
* 4 GB DDR3-1333 DRAM, with optional ECC support
* About 6 to 10W of 12V DC power depending on CPU load
* 2 miniPCI express (one with SIM socket for 3G modem).
* 4 Gigabit Ethernet channels using Intel i211AT NICs

The board can be powered via 12V from the front or via a 5V onboard connector.

Shopping Cart
-------------

* 1x apu4c4 = 4 i211AT LAN / AMD GX-412TC CPU / 4 GB DRAM / dual SIM
* 1x Kingston SUV500MS/120G
* 1x VARIA Group Item 326745 19" dual rack rack for APU4
* 1x Compex WLE900VX (Optional mini PCIe WiFi module)

The 19" enclosure can accomodate up to two APU4 boards - there is a single and
dual front cover.

.. note:: Compex WLE900VX is only supported in mPCIe slot 1.

VyOS 1.2 (crux)
---------------

Depending on the VyOS versions you intend to install there is a difference in
the serial port settings (T1327_).

Create a bootable USB pendrive using e.g. Rufus_ on a Windows machine.

Connect serial port to a PC through null modem cable (RXD / TXD crossed over).
Set terminal emulator to 115200 8N1.

.. code-block:: sh

  PC Engines apu4
  coreboot build 20171130
  BIOS version v4.6.4
  4080 MB ECC DRAM
  SeaBIOS (version rel-1.11.0.1-0-g90da88d)

  Press F10 key now for boot menu:

  Select boot device:

  1. ata0-0: KINGSTON SUV500MS120G ATA-11 Hard-Disk (111 GiBytes)
  2. USB MSC Drive Generic Flash Disk 8.07
  3. Payload [memtest]
  4. Payload [setup]

Now boot from the ``USB MSC Drive Generic Flash Disk 8.07`` media by pressing
``2``, the VyOS boot menu will appear, just wait 10 seconds or press ``Enter``
to continue.

.. code-block:: sh

  lqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqk
  x                      VyOS - Boot Menu                      x
  tqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqu
  x Live (amd64-vyos)                                          x
  x Live (amd64-vyos failsafe)                                 x
  x                                                            x
  mqqqqqqPress ENAutomatic boot in 10 seconds...nu entryqqqqqqqj

The image will be loaded and the last lines you will get will be:

.. code-block:: sh

  Loading /live/vmlinuz... ok
  Loading /live/initrd.img...

The Kernel will now spin up using a different console setting. Set terminal
emulator to 9600 8N1 and after a while your console will show:

.. code-block:: sh

  Loading /live/vmlinuz... ok
  Loading /live/initrd.img...
  Welcome to VyOS - vyos ttyS0

  vyos login:

You can now proceed with a regular image installation as described in
:ref:`installation`.

As the APU board itself still used a serial setting of 115200 8N1 it is strongly
recommended that you change the VyOS serial interface settings after your first
successful boot.

Use the following command to adjust the :ref:`serial-console` settings:

.. code-block:: sh

  set system console device ttyS0 speed 115200

.. note:: Once you ``commit`` the above changes access to the serial interface
   is lost until you set your terminal emulator to 115200 8N1 again.

.. code-block:: sh

  vyos@vyos# show system console
   device ttyS0 {
     speed 115200
   }

VyOS 1.2 (rolling)
------------------

Installing the rolling release on an APU2 board does not require any change
on the serial console from your host side as T1327_ was successfully
implemented.

Simply proceed with a regular image installation as described in :ref:`installation`.

Pictures
--------

.. note:: Both device types operate without any moving parts and emit zero noise.

Rack Mount
^^^^^^^^^^

.. figure:: /_static/images/apu4c4_rack_1.jpg
   :scale: 25 %
   :alt: APU4C4 rack closed

.. figure:: /_static/images/apu4c4_rack_2.jpg
   :scale: 25 %
   :alt: APU4C4 rack front

.. figure:: /_static/images/apu4c4_rack_3.jpg
   :scale: 25 %
   :alt: APU4C4 rack module #1

.. figure:: /_static/images/apu4c4_rack_4.jpg
   :scale: 25 %
   :alt: APU4C4 rack module #2

.. figure:: /_static/images/apu4c4_rack_5.jpg
   :scale: 25 %
   :alt: APU4C4 rack module #3 with PSU


Desktop
^^^^^^^

.. figure:: /_static/images/apu4c4_desk_1.jpg
   :scale: 25 %
   :alt: APU4C4 desktop closed

.. figure:: /_static/images/apu4c4_desk_2.jpg
   :scale: 25 %
   :alt: APU4C4 desktop closed

.. figure:: /_static/images/apu4c4_desk_3.jpg
   :scale: 25 %
   :alt: APU4C4 desktop back

.. figure:: /_static/images/apu4c4_desk_4.jpg
   :scale: 25 %
   :alt: APU4C4 desktop back

.. _Rufus: https://rufus.ie/
.. _T1327: https://phabricator.vyos.net/T1327


Qotom Q355G4
************

The install on this Q355G4 box is pretty much plug and play. The port numbering
the OS does might differ from the labels on the outside, but the UEFI firmware
has a port blink test built in with MAC adresses so you can very quickly identify
which is which. MAC labels are on the inside as well, and this test can be done
from VyOS or plain Linux too. Default settings in the UEFI will make it boot,
but depending on your installation wishes (i.e. storage type, boot type, console
type) you might want to adjust them. This Qotom company seems to be the real
OEM/ODM for many other relabelling companies like Protectli.

Hardware
--------

There are a number of other options, but they all seem to be close to Intel
reference designs, with added features like more serial ports, more network
interfaces and the likes. Because they don't deviate too much from standard
designs all the hardware is well-supported by mainline. It accepts one LPDDR3
SO-DIMM, but chances are that if you need more than that, you'll also want
something even beefier than an i5. There are options for antenna holes, and SIM
slots, so you could in theory add an LTE/Cell modem (not tested so far).

The chassis is a U-shaped alu extrusion with removable I/O plates and removable
bottom plate. Cooling is completely passive with a heatsink on the SoC with
internal and external fins, a flat interface surface, thermal pad on top of that,
which then directly attaches to the chassis, which has fins as well. It comes
with mounting hardware and rubber feet, so you could place it like a desktop
model or mount it on a VESA mount, or even wall mount it with the provided
mounting plate. The closing plate doubles as internal 2.5" mounting place for
an HDD or SSD, and comes supplied with a small SATA cable and SATA power cable.

Power supply is a 12VDC barrel jack, and included switching power supply, which
is why SATA power regulation is on-board. Internally it has a NUC-board-style
on-board 12V input header as well, the molex locking style.

There are WDT options and auto-boot on power enable, which is great for remote
setups. Firmware is reasonably secure (no backdoors found, BootGuard is enabled
in enforcement mode, which is good but also means no coreboot option), yet has
most options available to configure (so it's not locked out like most firmwares
are).

An external RS232 serial port is available, internally a GPIO header as well.
It does have Realtek based audio on board for some reason, but you can disable
that. Booting works on both USB2 and USB3 ports. Switching between serial BIOS
mode and HDMI BIOS mode depends on what is connected at startup; it goes into
serial mode if you disconnect HDMI and plug in serial, in all other cases it's
HDMI mode.

Partaker i5
***********

.. figure:: ../_static/images/600px-Partaker-i5.jpg

I believe this is actually the same hardware as the Protectli. I purchased it
from `Amazon <https://www.amazon.com/gp/product/B073F9GHKL/>`_ in June 2018.
It came pre-loaded with pfSense.

`Manufacturer product page <http://www.inctel.com.cn/product/detail/338.html>`_.

Installation
------------

* Write VyOS ISO to USB drive of some sort
* Plug in VGA, power, USB keyboard, and USB drive
* Press "SW" button on the front (this is the power button; I don't know what
  "SW" is supposed to mean).
* Begin rapidly pressing delete on the keyboard. The boot prompt is very quick,
  but with a few tries you should be able to get into the BIOS.
* Chipset > South Bridge > USB Configuration: set XHCI to Disabled and USB 2.0
  (EHCI) to Enabled. Without doing this, the USB drive won't boot.
* Boot to the VyOS installer and install as usual.

Warning the interface labels on my device are backwards; the left-most "LAN4"
port is eth0 and the right-most "LAN1" port is eth3.

Acrosser AND-J190N1
*******************

.. figure:: ../_static/images/480px-Acrosser_ANDJ190N1_Front.jpg

.. figure:: ../_static/images/480px-Acrosser_ANDJ190N1_Back.jpg

11/22/2016. This microbox network appliance was build to create OpenVPN bridges.
It can saturate a 100Mbps link.

It is a small (serial console only) PC with 6 Gb LAN
http://www.acrosser.com/upload/AND-J190_J180N1-2.pdf

You may have to add your own RAM and HDD/SSD. There is no VGA connector. But
Acrosser provides a DB25 adapter for the VGA header on the motherboard (not used).

BIOS Settings:
--------------

First thing you want to do is getting a more user friendly console to configure
BIOS. Default VT100 brings a lot of issues. Configure VT100+ instead.

For practical issues change speed from 115200 to 9600. 9600 is the default speed
at which both linux kernel and VyOS will reconfigure the serial port when loading.

Connect to serial (115200bps). Power on the appliance and press Del in the console
when requested to enter BIOS settings.

Advanced > Serial Port Console Redirection > Console Redirection Settings:

* Terminal Type : VT100+
* Bits per second : 9600

Save, reboot and change serial speed to 9600 on your client.

Some options have to be changed for VyOS to boot correctly. With XHCI enabled
the installer can’t access the USB key. Enable EHCI instead.

Reboot into BIOS, Chipset > South Bridge > USB Configuration:

* Disable XHCI
* Enable USB 2.0 (EHCI) Support

Install VyOS:
-------------

Create a VyOS bootable USB key. I used the 64-bit ISO (VyOS 1.1.7) and `LinuxLive
USB Creator <http://www.linuxliveusb.com/>`_.

I'm not sure if it helps the process but I changed default option to live-serial
(line “default xxxx”) on the USB key under syslinux/syslinux.cfg.

I connected the key to one black USB port on the back and powered on. The first
VyOS screen has some readability issues. Press :kbd:`Enter` to continue.

Then VyOS should boot and you can perform the ``install image``
