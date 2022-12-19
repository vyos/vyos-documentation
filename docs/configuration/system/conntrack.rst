###################
Connection tracking
###################

VyOS can be configured to track connections using the connection
tracking subsystem. Connection tracking becomes operational once either
stateful firewall or NAT is configured.

Conntrack Table
---------------

.. cfgcmd:: set system conntrack table-size <1-50000000>
    :defaultvalue:

    The connection tracking table contains one entry for each connection being
    tracked by the system.

.. cfgcmd:: set system conntrack expect-table-size <1-50000000>
    :defaultvalue:

    The connection tracking expect table contains one entry for each expected
    connection related to an existing connection. These are generally used by
    “connection tracking helper” modules such as FTP.
    The default size of the expect table is 2048 entries.

.. cfgcmd:: set system conntrack hash-size <1-50000000>
    :defaultvalue:

    Set the size of the hash table. The connection tracking hash table makes
    searching the connection tracking table faster. The hash table uses
    “buckets” to record entries in the connection tracking table.


Modules
-------

Enables ``conntrack`` modules. All modules are enable by default.

.. cfgcmd:: set system conntrack modules ftp
.. cfgcmd:: set system conntrack modules h323
.. cfgcmd:: set system conntrack modules nfs
.. cfgcmd:: set system conntrack modules pptp
.. cfgcmd:: set system conntrack modules sip
.. cfgcmd:: set system conntrack modules sqlnet
.. cfgcmd:: set system conntrack modules tftp

Use ``delete system conntrack modules`` to deactive all modules.
Or, for example ftp, ``delete system conntrack modules ftp``.


Define Connection Timeouts
--------------------------

VyOS supports setting timeouts for connections according to the
connection type. You can set timeout values for generic connections, for ICMP
connections, UDP connections, or for TCP connections in a number of different
states.

.. cfgcmd:: set system conntrack timeout icmp <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout other <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp close <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp close-wait <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp established <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp fin-wait <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp last-ack <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp syn-recv <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp syn-sent <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout tcp time-wait <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout udp other <1-21474836>
    :defaultvalue:
.. cfgcmd:: set system conntrack timeout udp stream <1-21474836>
    :defaultvalue:

    Set the timeout in secounds for a protocol or state.


You can also define custom timeout values to apply to a specific subset of
connections, based on a packet and flow selector. To do this, you need to
create a rule defining the packet and flow selector.

.. cfgcmd:: set system conntrack timeout custom rule <1-999999>
   description <test>
.. cfgcmd:: set system conntrack timeout custom rule <1-999999>
   destination address <ip-address>
.. cfgcmd:: set system conntrack timeout custom rule <1-999999>
   destination port <value>
.. cfgcmd:: set system conntrack timeout custom rule <1-999999>
   inbound-interface <interface>
.. cfgcmd:: set system conntrack timeout custom rule <1-999999>
   source address <ip-address>
.. cfgcmd:: set system conntrack timeout custom rule <1-999999>
   source port <value>
.. cfgcmd:: set system conntrack timeout custom rule <1-999999>
   protocol <protocol>

    Configure customized timeout rules for selective connection tracking.

Conntrack Ignore
----------------

Customized ignore rules, based on a packet and flow selector, can be
configured in VyOS. To do this, you can configure as much rules as
needed using next commands:

.. cfgcmd:: set system conntrack ignore rule <1-999999>
   description <text>
.. cfgcmd:: set system conntrack ignore rule <1-999999>
   destination address <ip-address>
.. cfgcmd:: set system conntrack ignore rule <1-999999>
   destination port <port>
.. cfgcmd:: set system conntrack ignore rule <1-999999>
   inbound-interface <interface>
.. cfgcmd:: set system conntrack ignore rule <1-999999>
   protocol <protocol>
.. cfgcmd:: set system conntrack ignore rule <1-999999>
   source address <ip-address>
.. cfgcmd:: set system conntrack ignore rule <1-999999>
   source port <port>

    Configure customized ignore rules for selective connection tracking.
