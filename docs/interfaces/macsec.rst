.. _macsec-interface:

######
MACsec
######

MACsec is an IEEE standard (IEEE 802.1AE) for MAC security, introduced in 2006.
It defines a way to establish a protocol independent connection between two
hosts with data confidentiality, authenticity and/or integrity, using
GCM-AES-128. MACsec operates on the Ethernet layer and as such is a layer 2
protocol, which means it's designed to secure traffic within a layer 2 network,
including DHCP or ARP requests. It does not compete with other security
solutions such as IPsec (layer 3) or TLS (layer 4), as all those solutions are
used for their own specific use cases.

Configuration
#############

.. cfgcmd:: set interfaces macsec <interface> security cipher [gcm-aes-128]

  Select cipher suite used for cryptographic operations. This setting is
  mandatory.

  .. note:: gcm-aes-256 support planned once iproute2 package is updated to
     version >=5.2.

.. cfgcmd:: set interfaces macsec <interface> security encrypt

  MACsec only provides authentication by default, encryption is optional. This
  command will enable encryption for all outgoing packets.

.. cfgcmd:: set interfaces macsec <interface> source-interface <physical-source>

  A physical interface is required to connect this MACsec instance to. Traffic
  leaving this interfac will now be authenticated/encrypted.


Key Management
--------------

:abbr:`MKA (MACsec Key Agreement protocol)` is used to synchronize keys between
individual peers.

.. cfgcmd:: set interfaces macsec <interface> security mka cak <key>

  IEEE 802.1X/MACsec pre-shared key mode. This allows to configure MACsec with
  a pre-shared key using a (CAK,CKN) pair.

.. cfgcmd:: set interfaces macsec <interface> security mka ckn <key>

  CAK Name

.. cfgcmd:: set interfaces macsec <interface> security mka priority <priority>

  The peer with lower priority will become the key server and start
  distributing SAKs.

Replay protection
-----------------

.. cfgcmd:: set interfaces macsec <interface> security replay-window <window>

  IEEE 802.1X/MACsec replay protection window. This determines a window in which
  replay is tolerated, to allow receipt of frames that have been misordered by
  the network.

  - ``0``: No replay window, strict check
  - ``1-4294967295``: Number of packets that could be misordered

Operation
=========

.. opcmd:: run generate macsec mka-cak

  Generate :abbr:`MKA (MACsec Key Agreement protocol)` CAK key

  .. code-block:: none

    vyos@vyos:~$ generate macsec mka-cak
    20693b6e08bfa482703a563898c9e3ad


.. opcmd:: run generate macsec mka-ckn

  Generate :abbr:`MKA (MACsec Key Agreement protocol)` CAK key

  .. code-block:: none

    vyos@vyos:~$ generate macsec mka-ckn
    88737efef314ee319b2cbf30210a5f164957d884672c143aefdc0f5f6bc49eb2

.. opcmd:: show interfaces macsec

  List all MACsec interfaces

  .. code-block:: none

    vyos@vyos:~$ show interfaces macsec
    17: macsec1: protect on validate strict sc off sa off encrypt on send_sci on end_station off scb off replay off
        cipher suite: GCM-AES-128, using ICV length 16
        TXSC: 005056bfefaa0001 on SA 0
    20: macsec0: protect on validate strict sc off sa off encrypt off send_sci on end_station off scb off replay off
        cipher suite: GCM-AES-128, using ICV length 16
        TXSC: 005056bfefaa0001 on SA 0

.. opcmd:: show interfaces macsec <interface>

  Show specific MACsec interface information

  .. code-block:: none

    vyos@vyos:~$ show interfaces macsec macsec1
    17: macsec1: protect on validate strict sc off sa off encrypt on send_sci on end_station off scb off replay off
        cipher suite: GCM-AES-128, using ICV length 16
        TXSC: 005056bfefaa0001 on SA 0

Examples
========

* Two routers connected both via eth1 through an untrusted switch
* R1 has 192.0.2.1/24 & 2001:db8::1/64
* R2 has 192.0.2.2/24 & 2001:db8::2/64

**R1**

.. code-block:: none

  set interfaces macsec macsec1 address '192.0.2.1/24'
  set interfaces macsec macsec1 address '2001:db8::1/64'
  set interfaces macsec macsec1 security cipher 'gcm-aes-128'
  set interfaces macsec macsec1 security encrypt
  set interfaces macsec macsec1 security mka cak '232e44b7fda6f8e2d88a07bf78a7aff4'
  set interfaces macsec macsec1 security mka ckn '40916f4b23e3d548ad27eedd2d10c6f98c2d21684699647d63d41b500dfe8836'
  set interfaces macsec macsec1 source-interface 'eth1'

**R2**

.. code-block:: none

  set interfaces macsec macsec1 address '192.0.2.2/24'
  set interfaces macsec macsec1 address '2001:db8::2/64'
  set interfaces macsec macsec1 security cipher 'gcm-aes-128'
  set interfaces macsec macsec1 security encrypt
  set interfaces macsec macsec1 security mka cak '232e44b7fda6f8e2d88a07bf78a7aff4'
  set interfaces macsec macsec1 security mka ckn '40916f4b23e3d548ad27eedd2d10c6f98c2d21684699647d63d41b500dfe8836'
  set interfaces macsec macsec1 source-interface 'eth1'

Pinging (IPv6) the other host and intercepting the traffic in ``eth1`` will
show you the content is encrypted.

.. code-block:: none

  17:35:44.586668 00:50:56:bf:ef:aa > 00:50:56:b3:ad:d6, ethertype Unknown (0x88e5), length 150:
          0x0000:  2c00 0000 000a 0050 56bf efaa 0001 d9fb  ,......PV.......
          0x0010:  920a 8b8d 68ed 9609 29dd e767 25a4 4466  ....h...)..g%.Df
          0x0020:  5293 487b 9990 8517 3b15 22c7 ea5c ac83  R.H{....;."..\..
          0x0030:  4c6e 13cf 0743 f917 2c4e 694e 87d1 0f09  Ln...C..,NiN....
          0x0040:  0f77 5d53 ed75 cfe1 54df 0e5a c766 93cb  .w]S.u..T..Z.f..
          0x0050:  c4f2 6e23 f200 6dfe 3216 c858 dcaa a73b  ..n#..m.2..X...;
          0x0060:  4dd1 9358 d9e4 ed0e 072f 1acc 31c4 f669  M..X...../..1..i
          0x0070:  e93a 9f38 8a62 17c6 2857 6ac5 ec11 8b0e  .:.8.b..(Wj.....
          0x0080:  6b30 92a5 7ccc 720b                      k0..|.r.

Disabling the encryption on the link by removing ``security encrypt`` will show
the unencrypted but authenticated content.

.. code-block:: none

  17:37:00.746155 00:50:56:bf:ef:aa > 00:50:56:b3:ad:d6, ethertype Unknown (0x88e5), length 150:
          0x0000:  2000 0000 0009 0050 56bf efaa 0001 86dd  .......PV.......
          0x0010:  6009 86f3 0040 3a40 2001 0db8 0000 0000  `....@:@........
          0x0020:  0000 0000 0000 0001 2001 0db8 0000 0000  ................
          0x0030:  0000 0000 0000 0002 8100 d977 0f30 0003  ...........w.0..
          0x0040:  1ca0 c65e 0000 0000 8d93 0b00 0000 0000  ...^............
          0x0050:  1011 1213 1415 1617 1819 1a1b 1c1d 1e1f  ................
          0x0060:  2021 2223 2425 2627 2829 2a2b 2c2d 2e2f  .!"#$%&'()*+,-./
          0x0070:  3031 3233 3435 3637 87d5 eed3 3a39 d52b  01234567....:9.+
          0x0080:  a282 c842 5254 ef28                      ...BRT.(

