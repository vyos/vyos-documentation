.. _macsec-interface:

######
MACsec
######

MACsec is an IEEE standard (IEEE 802.1AE) for MAC security, introduced in 2006.
It defines a way to establish a protocol independent connection between two
hosts with data confidentiality, authenticity and/or integrity, using
GCM-AES-128. MACsec operates on the Ethernet layer and as such is a layer 2
protocol, which means it's designed to secure traffic within a layer 2 network,
including DHCP or ARP requests. It does not compete with other security
solutions such as IPsec (layer 3) or TLS (layer 4), as all those solutions are
used for their own specific use cases.


Configuration
#############

Operation
=========


