.. _vlan-interface:

VLAN (802.1q)
-------------

IEEE 802.1q, often referred to as Dot1q, is the networking standard that
supports virtual LANs (VLANs) on an IEEE 802.3 Ethernet network. The
standard defines a system of VLAN tagging for Ethernet frames and the
accompanying procedures to be used by bridges and switches in handling
such frames. The standard also contains provisions for a quality-of-service
prioritization scheme commonly known as IEEE 802.1p and defines the Generic
Attribute Registration Protocol.

Portions of the network which are VLAN-aware (i.e., IEEE 802.1q conformant)
can include VLAN tags. When a frame enters the VLAN-aware portion of the
network, a tag is added to represent the VLAN membership. Each frame must
be distinguishable as being within exactly one VLAN. A frame in the
VLAN-aware portion of the network that does not contain a VLAN tag is
assumed to be flowing on the native VLAN.

The standard was developed by IEEE 802.1, a working group of the IEEE 802
standards committee, and continues to be actively revised. One of the
notable revisions is 802.1Q-2014 which incorporated IEEE 802.1aq (Shortest
Path Bridging) and much of the IEEE 802.1d standard.

802.1a VLAN interfaces are represented as virtual sub-interfaces in VyOS. The
term used for this is ``vif``. Configuration of a tagged sub-interface is
accomplished using the configuration command:
``set interfaces ethernet <name> vif <vlan-id>``

To assign a vif 100 using the VLAN 100 tag to physical interface eth1 use:

.. code-block:: none

  set interfaces ethernet eth1 vif 100 description 'VLAN 100'
  set interfaces ethernet eth1 vif 100 address '192.168.100.1/24'
  set interfaces ethernet eth1 vif 100 address '2001:db8:100::1/64'

Resulting in:

.. code-block:: none

  ethernet eth1 {
      address 192.168.100.1/24
      address 2001:db8:100::1/64
      description INSIDE
      duplex auto
      hw-id 00:53:29:44:3b:19
      smp_affinity auto
      speed auto
      vif 100 {
          address 192.168.100.1/24
          description "VLAN 100"
      }
  }

VLAN interfaces are shown as `<name>.<vlan-id>`, e.g. `eth1.100`:

.. code-block:: none

  vyos@vyos:~$ show interfaces
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  eth0             172.16.51.129/24                  u/u  OUTSIDE
  eth1             192.168.0.1/24                    u/u  INSIDE
  eth1.100         192.168.100.1/24                  u/u  VLAN 100
  lo               127.0.0.1/8                       u/u
                   ::1/128
