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
about [OpenBMC](https://www.openbmc.org/)) so far on this motherboard.

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


PC Engines APU
**************

As this platform seems to be quiet common in terms of noise, cost, power and
performance it makes sense to write a small installation manual.

This guide was developed using an APU4C4 board with the following specs:

* AMD Embedded G series GX-412TC, 1 GHz quad Jaguar core with 64 bit and AES-NI
  support, 32K data + 32K instruction cache per core, shared 2MB L2 cache.
* 4 GB DDR3-1333 DRAM, with optional ECC support
* About 6 to 10W of 12V DC power depending on CPU load
* 2 miniPCI express (one with SIM socket for 3G modem).
* 4 Gigabit Ethernet channels using Intel i211AT NICs

VyOS 1.2 (crux)
---------------

Depending on the VyOS versions you intend to install there is a difference in
the serial port settings (see https://phabricator.vyos.net/T1327).

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

.. _Rufus: https://rufus.ie/
