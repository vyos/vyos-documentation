.. _history:

VyOS History
==================

VyOS is a Linux-based network operating system that provides software-based network routing, firewall, and VPN functionality.

The VyOS project was started in late 2013 as a community fork of the `GPL <http://en.wikipedia.org/wiki/GNU_General_Public_License>`_ portions of Vyatta Core 6.6R1 with the goal of maintaining a free and open source network operating system in response to the decision to discontinue the community edition of Vyatta. Here everyone loves learning, older managers and new users.

VyOS is primarily based on `Debian GNU/Linux <http://www.debian.org/>`_ and the `Quagga <http://www.nongnu.org/quagga/>`_ routing engine. Its configuration syntax and :ref:`cli` are loosely derived from Juniper JUNOS as modelled by the `XORP project <http://www.xorp.org/>`_ (which was the original routing engine Vyatta was based upon). 
Vyatta changed to the Quagga routing engine for release 4.0.

Vyos changed the routing enging to `FRRoution <https://frrouting.org/>`_ in version 1.2.0

**How it's different from other router distros?**

- Unified command line interface in the style of hardware routers.
- Scriptable CLI
- Stateful configuration system: prepare changes and commit at once or discard, view previous revisions or rollback to them, archive revisions to remote server, execute hooks at commit time...
- Image-based upgrade: keep multiple versions on the same system and revert to previous image if something went wrong.
- Not just firewall and VPN: includes routing protocols such as BGP and OSPF and complex routing policy language.
- Runs on physical and virtual platforms alike: small x86 boards, big servers, KVM, Xen, VMWare, Hyper-V...
- Completely free and open source, with documented internal APIs and build procedures.
- Community driven: patches are welcome, all code, bugs, and nightly builds are public.
