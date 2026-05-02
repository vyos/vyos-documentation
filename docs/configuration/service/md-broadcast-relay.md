# UDP Broadcast Relay

Certain vendors use broadcasts to identify their equipment within one ethernet
segment. Unfortunately if you split your network with multiple VLANs you loose
the ability of identifying your equipment.

This is where "UDP broadcast relay" comes into play! It will forward received
broadcasts to other configured networks.

Every UDP port which will be forward requires one unique ID. Currently we
support 99 IDs!

## Configuration

<div class="cfgcmd">

set service broadcast-relay id \<n\> description \<description\>

A description can be added for each and every unique relay ID. This is
useful to distinguish between multiple different ports/appliactions.

</div>

<div class="cfgcmd">

set service broadcast-relay id \<n\> interface \<interface\>

The interface used to receive and relay individual broadcast packets. If you
want to receive/relay packets on both <span class="title-ref">eth1</span> and <span class="title-ref">eth2</span> both interfaces need
to be added.

</div>

<div class="cfgcmd">

set service broadcast-relay id \<n\> address \<ipv4-address\>

Set the source IP of forwarded packets, otherwise original senders address
is used.

</div>

<div class="cfgcmd">

set service broadcast-relay id \<n\> port \<port\>

The UDP port number used by your apllication. It is mandatory for this kind
of operation.

</div>

<div class="cfgcmd">

set service broadcast-relay id \<n\> disable

Each broadcast relay instance can be individually disabled without deleting
the configured node by using the following command:

</div>

<div class="cfgcmd">

set service broadcast-relay disable

In addition you can also disable the whole service without the need to remove
it from the current configuration.

</div>

<div class="note">

<div class="title">

Note

</div>

You can run the UDP broadcast relay service on multiple routers
connected to a subnet. There is **NO** UDP broadcast relay packet storm!

</div>

## Example

To forward all broadcast packets received on <span class="title-ref">UDP port 1900</span> on <span class="title-ref">eth3</span>, <span class="title-ref">eth4</span>
or <span class="title-ref">eth5</span> to all other interfaces in this configuration.

``` none
set service broadcast-relay id 1 description 'SONOS'
set service broadcast-relay id 1 interface 'eth3'
set service broadcast-relay id 1 interface 'eth4'
set service broadcast-relay id 1 interface 'eth5'
set service broadcast-relay id 1 port '1900'
```
