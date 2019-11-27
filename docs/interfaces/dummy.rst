.. _dummy-interface:

Dummy
-----

Dummy interfaces are much like the loopback interface, except you can have
as many as you want. Dummy interfaces can be used as interfaces that always
stay up (in the same fashion to loopbacks in Cisco IOS), or for testing
purposes.

Configuration commands:

.. code-block:: console

  vyos@vyos# set interfaces dummy dum0
  Possible completions:
  +  address      IP address
     description  Interface description
     disable      Disable interface
   > ip           IPv4 routing parameters
   > ipv6         IPv6 routing parameters
     redirect     Incoming packet redirection destination
   > traffic-policy
                  Traffic-policy for interface

