##################
Local Route Policy
##################

Policies for local traffic are defined in this section.

*************
Configuration
*************

Local Route
===========

.. cfgcmd:: set policy local-route rule <1-32765> set table <1-200|main>

   Set routing table to forward packet to.

.. cfgcmd:: set policy local-route rule <1-32765> source <x.x.x.x|x.x.x.x/x>

   Set source address or prefix to match.
