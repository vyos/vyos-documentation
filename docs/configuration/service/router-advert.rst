.. _router-advert:

#####################
Router Advertisements
#####################

:abbr:`RAs (Router advertisements)` are described in :rfc:`4861#section-4.6.2`.
They are part of what is known as :abbr:`SLAAC (Stateless Address
Autoconfiguration)`.


Supported interface types:

    * bonding
    * bridge
    * ethernet
    * l2tpv3
    * openvpn
    * pseudo-ethernet
    * tunnel
    * vxlan
    * wireguard
    * wireless
    * wirelessmodem


Enabling Advertisments
~~~~~~~~~~~~~~~~~~~~~~~

.. cfgcmd:: set service router-advert interface <interface> ....

.. stop_vyoslinter

.. csv-table:: 
   :header: "Field", "VyOS Option", "Description"
   :widths: 10, 10, 20

   "Cur Hop Limit", "hop-limit", "Hop count field of the outgoing RA packets"
   """Managed address configuration"" flag", "managed-flag", "Tell hosts to use the administered stateful protocol (i.e. DHCP) for autoconfiguration"
   """Other configuration"" flag", "other-config-flag", "Tell hosts to use the administered (stateful) protocol (i.e. DHCP) for autoconfiguration of other (non-address) information"
   "MTU","link-mtu","Link MTU value placed in RAs, exluded in RAs if unset"
   "Router Lifetime","default-lifetime","Lifetime associated with the default router in units of seconds"
   "Reachable Time","reachable-time","Time, in milliseconds, that a node assumes a neighbor is reachable after having received a reachability confirmation"
   "Retransmit Timer","retrans-timer","Time in milliseconds between retransmitted Neighbor Solicitation messages"
   "Default Router Preference","default-preference","Preference associated with the default router"
   "Interval", "interval", "Min and max intervals between unsolicited multicast RAs"
   "DNSSL", "dnssl", "DNS search list to advertise"
   "Name Server", "name-server", "Advertise DNS server per https://tools.ietf.org/html/rfc6106"

.. start_vyoslinter


Advertising a Prefix
''''''''''''''''''''

.. cfgcmd:: set service router-advert interface <interface> prefix 2001:DB8::/32

.. stop_vyoslinter

.. csv-table::
    :header: "VyOS Field", "Description"
    :widths: 10,30

    "decrement-lifetime", "Lifetime is decremented by the number of seconds since the last RA - use in conjunction with a DHCPv6-PD prefix"
    "deprecate-prefix", "Upon shutdown, this option will deprecate the prefix by announcing it in the shutdown RA"
    "no-autonomous-flag","Prefix can not be used for stateless address auto-configuration"
    "no-on-link-flag","Prefix can not be used for on-link determination"
    "preferred-lifetime","Time in seconds that the prefix will remain preferred (default 4 hours)"
    "valid-lifetime","Time in seconds that the prefix will remain valid (default: 30 days)"

.. start_vyoslinter

Disabling Advertisements
~~~~~~~~~~~~~~~~~~~~~~~~

To disable advertisements without deleting the configuration:

.. cfgcmd:: set service router-advert interface <interface> no-send-advert

Example Configuration
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: none

     interface eth0.2 {
        default-preference high
        hop-limit 64
        interval {
            max 600
        }
        name-server 2001:db8::1
        name-server 2001:db8::2
        other-config-flag
        prefix 2001:db8:beef:2::/64 {
            valid-lifetime 2592000
        }
        reachable-time 0
        retrans-timer 0
     }
