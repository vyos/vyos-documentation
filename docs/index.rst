.. _index:

VyOS User Guide
===============

VyOS is an open source network operating system based on Debian GNU/Linux.

VyOS provides a free routing platform that competes directly with other
commercially available solutions from well known network providers. Because
VyOS is run on standard amd64, i586 and ARM systems, it is able to be used
as a router and firewall platform for cloud deployments.

#####
About
#####

We use multiple live versions of our manual hosted thankfully by
https://readthedocs.org. We will provide one version of the manual for every
VyOS major version starting with VyOS 1.2 which will receive Long-term support
(LTS).

The manual version is selected/specified by it's Git branch name. You can
switch between versions of the documentation by selecting the appropriate
branch on the bottom left corner.

############
Introduction
############

.. _introduction:
.. toctree::
   :maxdepth: 2

   history
   install
   cli
   quick-start
   configuration-overview
   interfaces/index
   routing/index
   firewall
   nat
   vpn/index
   qos
   services/index
   system/index
   high-availability
   load-balancing
   image-mgmt
   commandscripting
.. modules


########
Appendix
########

.. _appendix:
.. toctree::
   :maxdepth: 2

   appendix/releasenotes
   appendix/troubleshooting
   appendix/examples/index
   appendix/commandtree/index
   appendix/vyos-on-vmware
   appendix/vyos-on-gns3
   appendix/vyos-on-baremetal
   appendix/migrate-from-vyatta


############
Contributing
############

.. _contributing:
.. toctree::
   :maxdepth: 2

   contributing/issues_features
   contributing/development
   contributing/documentation
   contributing/vyos_cli
   contributing/coding_guidelines
   contributing/upstream-packages
   contributing/build-vyos


################
Copyright Notice
################

Copyright (C) 2018-2019 VyOS maintainers and contributors

Permission is granted to make and distribute verbatim copies of this manual
provided the copyright notice and this permission notice are preserved on all
copies.

Permission is granted to copy and distribute modified versions of this manual
under the conditions for verbatim copying, provided that the entire resulting
derived work is distributed under the terms of a permission notice identical
to this one.

Permission is granted to copy and distribute translations of this manual into
another language, under the above conditions for modified versions, except that
this permission notice may be stated in a translation approved by the VyOS
maintainers.
