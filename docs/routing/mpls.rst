.. _mpls:

****
MPLS 
****


Label Distribution Protocol
===========================


.. note:: VyOS' MPLS support is not finished yet, its funcitionality is
   limited. Currently it can only be configured as a P router, that is,
   an LSR in the core of an MPLS network.


The **Multi-Protocol Label Switching** (MPLS) architecture does not
assume a single protocol to create MPLS paths. VyOS supports the Label
Distribution Protocol (LDP) as implemented by FRR, based on `RFC 5036 <https://tools.ietf.org/html/rfc5036.html>`__.

LDT it is an MPLS signaling protocol that distributes labels creating
MPLS paths in a dynamic manner. LDT is not exactly a routing protocol,
as it relies on other routing protocols for forwarding decisions.


.. cfgcmd:: set protocols mpls ldp interface <interface>

   Use this command to enable LDP in the interface you define.


.. cfgcmd:: set protocols mpls ldp router-id <address>

   Use this command to configure the IP address used as the LDP
   router-id of the local device 


In order to allow the exchange of label advertisements required for LDP,
a TCP session should be established between routers. Routers will need
to learn each other's **transport address** in order to establish the
TCP session.

You may want to use the same address for both the LDP router-id and the
discovery transport address, but for VyOS MPLS LDP to work both
parameters must be explicitely set in the configuration.


.. cfgcmd:: set protocols mpls ldp discovery transport-ipv4-address | transport-ipv6-address <address>

   Use this command to set the IPv4 or IPv6 transport-address used by
   LDP.

.. cfgcmd:: set protocols mpls ldp neighbor <address> password <password>

   Use this command to configure authentication for LDP peers. Set the
   IP address of the LDP peer and a password that should be shared in
   order to become neighbors.


Example
-------

.. code-block:: none

   set interfaces dummy dum0 address '2.2.2.2/32'
   set interfaces ethernet eth1 address '10.0.0.2/24'
   set interfaces ethernet eth2 address '10.0.255.1/24'
   set protocols mpls ldp discovery transport-ipv4-address '2.2.2.2'
   set protocols mpls ldp interface 'eth1'
   set protocols mpls ldp interface 'eth2'
   set protocols mpls ldp router-id '2.2.2.2'
   set protocols ospf area 0 network '0.0.0.0/0'
   set protocols ospf parameters router-id '2.2.2.2'


show commands
-------------

When LDP is working, you will be able to see label information in the
outcome of ``show ip route``. Besides that information, there are also
specific *show* commands for LDP: 


.. opcmd:: show mpls ldp binding

   Use this command to see the Label Information Base.


.. opcmd:: show mpls ldp discovery

   Use this command to see Discovery Hello information


.. opcmd:: show mpls ldp interface

   Use this command to see LDP interface information


.. opcmd:: show mpls ldp neighbor

   Uset this command to see LDP neighbor information


.. opcmd:: show mpls ldp neighbor detail

   Uset this command to see detailed LDP neighbor information


