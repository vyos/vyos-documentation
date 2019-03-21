.. _dummy-interface:

Dummy Interfaces
----------------

Dummy interfaces — much like the loopback, except you can have as many as you want.
Dummy interfaces can be used as interfaces that always stay up (in the same fashion to loopbacks in IOS), or for testing purposes.

Configuration commands:

.. code-block:: sh

    interfaces
        dummy <dum[0-999]>
        + address           IP address
        description         Description
        disable             Disable interface
        > ip                IPv4 routing parameters
        > ipv6              IPv6 routing parameters
        redirect            Incoming packet redirection destination
        > traffic-policy    Traffic-policy for interface