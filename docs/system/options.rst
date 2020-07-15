.. _system_options:

#######
Options
#######

This chapter describe the possibilities of advanced system behavior.

General
#######

.. cfgcmd:: set system options beep-if-fully-booted

    Send an audible beep to the system speaker when system is ready.

.. cfgcmd:: set system options ctrl-alt-del-action [ ignore | reboot | poweroff ]

   Action which will be run once the ctrl-alt-del keystroke is received.

.. cfgcmd:: set system options reboot-on-panic

   Automatically teboot system on kernel panic after 60 seconds.

HTTP client
###########

.. cfgcmd:: set system options http-client source-address <address>

   Several commands utilize curl to initiate transfers. Configure the local
   source IPv4/IPv6 address used for all CURL operations.

.. cfgcmd:: set system options http-client source-interface <interface>

   Several commands utilize curl to initiate transfers. Configure the local
   source interface used for all CURL operations.

.. note:: `source-address` and `source-interface` can not be used at the same time.


