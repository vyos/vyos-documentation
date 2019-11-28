.. _bond-interface:

Bond
----

You can combine (aggregate) 2 or more physical interfaces into a single
logical one. It's called bonding, or LAG, or ether-channel, or port-channel.

Create interface bondX, where X is just a number:

.. code-block:: none

  set interfaces bonding bond0 description 'my-sw1 int 23 and 24'

You are able to choose a hash policy:

.. code-block:: none

  vyos@vyos# set interfaces bonding bond0 hash-policy
  Possible completions:
    layer2       use MAC addresses to generate the hash (802.3ad)
    layer2+3     combine MAC address and IP address to make hash
    layer3+4     combine IP address and port to make hash

For example:

.. code-block:: none

  set interfaces bonding bond0 hash-policy 'layer2'

You may want to set IEEE 802.3ad Dynamic link aggregation (802.3ad) AKA LACP
(don't forget to setup it on the other end of these links):

.. code-block:: none

 set interfaces bonding bond0 mode '802.3ad'

or some other modes:

.. code-block:: none

  vyos@vyos# set interfaces bonding bond0 mode
  Possible completions:
    802.3ad      IEEE 802.3ad Dynamic link aggregation (Default)
    active-backup
                 Fault tolerant: only one slave in the bond is active
    broadcast    Fault tolerant: transmits everything on all slave interfaces
    round-robin  Load balance: transmit packets in sequential order
    transmit-load-balance
                 Load balance: adapts based on transmit load and speed
    adaptive-load-balance
                 Load balance: adapts based on transmit and receive plus ARP
    xor-hash     Load balance: distribute based on MAC address

Now bond some physical interfaces into bond0:

.. code-block:: none

  set interfaces bonding bond0 member interface eth0
  set interfaces bonding bond0 member interface eth1

After a commit you may treat bond0 as almost a physical interface (you can't
change its` duplex, for example) and assign IPs or VIFs on it.

You may check the result:

.. code-block:: none

  vyos@vyos# run sh interfaces bonding
  Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
  Interface        IP Address                        S/L  Description
  ---------        ----------                        ---  -----------
  bond0            -                                 u/u  my-sw1 int 23 and 24
  bond0.10         192.168.0.1/24                    u/u  office-net
  bond0.100        10.10.10.1/24                     u/u  management-net
