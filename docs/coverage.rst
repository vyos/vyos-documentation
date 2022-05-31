########
Coverage
########

Overview over all commands, which are documented in the
``.. cfgcmd::`` or ``.. opcmd::`` Directives.

The build process take all xml definition files
from `vyos-1x <https://github.com/vyos/vyos-1x>`_  and a periodical export of
all VyOS commands and extract each leaf command or executable command.
After this the commands are compare and shown in
the following two tables. The script compare only the fixed part of a command.
All varables or values will be erase and then compare:

for example there are these two commands:

  * documentation: ``interfaces ethernet <interface> address
    <address | dhcp | dhcpv6>``
  * xml: ``interfaces ethernet <ethernet> address <address>``
  * VyOS: ``interfaces ethernet <text> address <value>``

Now the script earse all in between ``<`` and ``>`` and simply compare
the strings.

**There are 3 kind of problems:**   

``Not documented yet``

  * A XML command are not found in ``.. cfgcmd::`` or ``.. opcmd::`` Commands
  * The command should be documented

``Nothing found in XML Definitions``

  * ``.. cfgcmd::`` or ``.. opcmd::`` Command are not found in a XML command
  * Maybe the command where changed in the XML Definition, the feature is
    not anymore in VyOS, or there is a typo

``Nothing found in VyOS``

  * ``.. cfgcmd::`` or ``.. opcmd::`` Command are not found in a VyOS command
  * Maybe the command where changed, the feature is
    not anymore in VyOS, or there is a typo


Configuration Commands
======================

.. cfgcmdlist::
    :show-coverage:


Operational Commands
====================

.. opcmdlist::
    :show-coverage: