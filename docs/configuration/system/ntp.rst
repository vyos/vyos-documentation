.. _ntp:

###
NTP
###

:abbr:`NTP (Network Time Protocol`) is a networking protocol for clock
synchronization between computer systems over packet-switched, variable-latency
data networks. In operation since before 1985, NTP is one of the oldest Internet
protocols in current use.

NTP is intended to synchronize all participating computers to within a few
milliseconds of :abbr:`UTC (Coordinated Universal Time)`. It uses the
intersection algorithm, a modified version of Marzullo's algorithm, to select
accurate time servers and is designed to mitigate the effects of variable
network latency. NTP can usually maintain time to within tens of milliseconds
over the public Internet, and can achieve better than one millisecond accuracy
in local area networks under ideal conditions. Asymmetric routes and network
congestion can cause errors of 100 ms or more.

The protocol is usually described in terms of a client-server model, but can as
easily be used in peer-to-peer relationships where both peers consider the other
to be a potential time source. Implementations send and receive timestamps using
:abbr:`UDP (User Datagram Protocol)` on port number 123.

NTP supplies a warning of any impending leap second adjustment, but no
information about local time zones or daylight saving time is transmitted.

The current protocol is version 4 (NTPv4), which is a proposed standard as
documented in :rfc:`5905`. It is backward compatible with version 3, specified
in :rfc:`1305`.

Configuration
=============

.. cfgcmd:: set system ntp server <address>

   Configure one or more servers for synchronisation. Server name can be either
   an IP address or :abbr:`FQDN (Fully Qualified Domain Name)`.

   There are 3 default NTP server set. You are able to change them.

   * ``0.pool.ntp.org``
   * ``1.pool.ntp.org``
   * ``2.pool.ntp.org``

.. cfgcmd:: set system ntp server <address> <noselect | pool | preempt | prefer>

   Configure one or more attributes to the given NTP server.

   * ``noselect`` marks the server as unused, except for display purposes. The
     server is discarded by the selection algorithm.

   * ``pool`` mobilizes persistent client mode association with a number of
     remote servers.

   * ``preempt`` a preemptable association is expendable.

   * ``prefer`` marks the server as preferred. All other things being equal,
     this host will be chosen for synchronization among a set of correctly
     operating hosts.

.. cfgcmd:: set system ntp listen-address <address>

   NTP process will only listen on the specified IP address. You must specify
   the `<address>` and optionally the permitted clients. Multiple listen
   addresses can be configured.

.. cfgcmd:: set system ntp allow-clients address <address>

   List of networks or client addresses permitted to contact this NTP server.

   Multiple networks can be configured.

.. cfgcmd:: set system ntp vrf <name>

  Specify name of the :abbr:`VRF (Virtual Routing and Forwarding)` instance.
