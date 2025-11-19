.. _history:

#######
History
#######

In the beginning...
===================

There was a network operating system based on Debian GNU/Linux, called 
Vyatta. [*]_ Introduced in 2006, it served as a great free-software alternative 
to Cisco IOS and Juniper JUNOS. Vyatta came in two editions: Vyatta Core 
(formerly known as Vyatta Community Edition), which was free software, and 
Vyatta Subscription Edition, which included proprietary features and was 
available only to paying customers.

Brocade Communications Systems acquired Vyatta in 2012. Shortly after, Brocade
renamed Vyatta Subscription Edition to Brocade vRouter, discontinued Vyatta 
Core, and shut down the community forum without notice. The bug tracker and Git 
repositories were closed the following year.

By the time Brocade acquired Vyatta, the development of Vyatta Core had 
already stagnated. The focus had shifted to Vyatta Subscription Edition, 
where core components were replaced with proprietary software. As a result, 
Vyatta Core received fewer new features, and some of those added faced issues.

In 2013, shortly after Vyatta Core was discontinued, the community forked its 
final version (6.6R1) to create the VyOS project. To fund its development, VyOS 
maintainers established `Sentrium SL <https://blog.vyos.io/sentrium-what-sentrium>`_ 
in 2014, offering support, consulting services, and prebuilt long-term support 
images. The company was later reorganized under the VyOS brand.

Broadcom acquired Brocade in 2016 and sold Vyatta to AT&T in 2017, which in 
turn sold it to Ciena in 2021.


Major releases
==============
VyOS originally named its major versions after elements by atomic number. 
Beginning with version 1.2, this naming scheme was changed. It now uses the 
Latin names of constellations recognized by the International Astronomical 
Union (`IAU
<https://en.wikipedia.org/wiki/IAU_designated_constellations_by_area>`_), 
ordered by their solid angle area, beginning with the smallest.

Hydrogen (1.0)
--------------

Released just in time for the holidays on 22 December 2013, Hydrogen was
the first major VyOS release. It fixed features that were broken in
Vyatta Core 6.6, such as IPv4 BGP peer groups and DHCPv6 relay, and
introduced command scripting, a task scheduler, and web proxy LDAP
authentication.

Helium (1.1)
------------
Helium, released on 9 October 2014, marked the first anniversary of the 
VyOS Project. The release introduced an event handler, L2TPv3 support, 
802.1ad (QinQ), and IGMP proxy, as well as experimental support for VXLAN 
and DMVPN. Notably, DMVPN remained non-functional in Vyatta Core due to its 
reliance on a proprietary NHRP implementation.


Crux (1.2)
----------
Crux (the Southern Cross) was released on 28 January 2019 as the 
first major VyOS release. The underlying Debian base was upgraded 
from Squeeze (6) to Jessie (8).

Crux introduced many new features, some of the most noteworthy are: 
an mDNS repeater, a broadcast relay, a high-performance PPPoE server, 
an HFSC scheduler, and support for Wireguard, unicast VRRP, RPKI for BGP, 
and fully 802.1ad-compliant QinQ ethertype. The telnet server and support 
for P2P filtering were removed.

Crux was the first VyOS release to feature a modular image build system.
CLI definitions were written using modern, verifiable XML templates. 
Python APIs were introduced for command scripting and
configuration migration. The introduction of new Perl and shell code was
prohibited, and the process of rewriting legacy Perl code in pure Python 
began with Crux.

Crux reached the end of support in 2023.

Equuleus (1.3)
--------------

Equuleus (the Pony) was a long-term support version released 
on 21 December 2021, just in time for the winter holidays.

Equuleus brought many long-awaited features, most notably an SSTP VPN 
server, an IPoE server, an OpenConnect VPN server, and a serial console 
server. It also introduced reworked support for WWAN interfaces, support 
for GENEVE and MACSec interfaces, VRF, IS-IS routing, and preliminary support 
for MPLS and LDP.

Equuleus reached the end of support in 2025.

Sagitta (1.4)
-------------

Sagitta (the Arrow), released in 2024, is currently a supported LTS release.

Circinus (1.5)
--------------

Circinus (the Compass) is the codename for the upcoming development
branch. VyOS 1.5 Circinus has not been released yet.

A note on copyright
===================

Unlike Vyatta, VyOS has never had proprietary code and never will.
The only proprietary material in VyOS is non-code assets, such as
graphics and the trademark "VyOS". [*]_ This means you can build your
own long-term support images, since the entire toolchain is free software, 
and even distribute them, provided you rename them and remove any 
proprietary assets before building. 

Note that we do not provide support for images distributed by a third party. 
See the
`artwork license <https://github.com/vyos/vyos-build/blob/current/LICENSE.artwork>`_
and the end-user license agreement at ``/usr/share/vyos/EULA`` in
any pre-built image for more information.


.. [*] From the Sanskrit adjective "Vyātta" (व्यात्त), meaning opened.
.. [*] This is similar to how Linus Torvalds owns the Linux trademark.
