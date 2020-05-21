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

.. cfgcmd:: set interfaces macsec <interface> security key cak <key>

  IEEE 802.1X/MACsec pre-shared key mode. This allows to configure MACsec with
  a pre-shared key using a (CAK,CKN) pair.

.. cfgcmd:: set interfaces macsec <interface> security key ckn <key>

  CAK Name

Operation
=========

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

