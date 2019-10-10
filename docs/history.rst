.. _history:

VyOS History
==================

VyOS is a Linux-based network operating system that provides software-based
network routing, firewall, and VPN functionality.

The VyOS project was started in late 2013 as a community fork of the
`GPL <http://en.wikipedia.org/wiki/GNU_General_Public_License>`_ portions of
Vyatta Core 6.6R1 with the goal of maintaining a free and open source network
operating system in response to the decision to discontinue the community
edition of Vyatta. Here everyone loves learning, older managers and new users.

VyOS is primarily based on `Debian GNU/Linux <http://www.debian.org/>`_ and the
`Quagga <http://www.nongnu.org/quagga/>`_ routing engine. Its configuration
syntax and :ref:`cli` are loosely derived from Juniper JUNOS as modelled by the
`XORP project <http://www.xorp.org/>`_, which was the original routing engine for
Vyatta.

In the 4.0 release of Vyatta, the routing engine was changed to Quagga.

As of version 1.2.0, VyOS now uses `FRRouting <https://frrouting.org/>`_ as
the routing engine.

**How it's different from other router distributions and platforms?**

- More than just a firewall and VPN, VyOS includes extended routing capabilities like OSPFv2, OSPFv3, BGP,
  VRRP, and extensive route policy mapping and filtering.   
- Unified command line interface in the style of hardware routers.
- Scriptable CLI.
- Stateful configuration system: prepare changes and commit at once or discard,
  view previous revisions or rollback to them, archive revisions to remote
  server and execute hooks at commit time.
- Image-based upgrade: keep multiple versions on the same system and revert to
  previous image if a problem arises.
- Multiple VPN capabilities: OpenVPN, IPSec, Wireguard (in 1.2.0+), DPMVPN, and more.
- IPv4 and IPv6 support.
- Runs on physical and virtual platforms alike: small x86 boards, big servers,
  KVM, Xen, VMWare, Hyper-V, and more. 
- Completely free and open source, with documented internal APIs and build
  procedures.
- Community driven. Patches are welcome and all code, bugs, and nightly builds are
  public.

