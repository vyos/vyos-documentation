# Router Advertisements

`RAs (Router advertisements)` are described in `4861#section-4.6.2`.
They are part of what is known as `SLAAC (Stateless Address
Autoconfiguration)`.

Supported interface types:

> - bonding
> - bridge
> - ethernet
> - geneve
> - l2tpv3
> - openvpn
> - pseudo-ethernet
> - tunnel
> - vxlan
> - wireguard
> - wireless
> - wwan

## Configuration

<div class="cfgcmd">

set service router-advert interface \<interface\> ...

</div>

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 25%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr>
<th>Field</th>
<th>VyOS Option</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>Cur Hop Limit</td>
<td>hop-limit</td>
<td>Hop count field of the outgoing RA packets</td>
</tr>
<tr>
<td>"Managed address configuration" flag</td>
<td>managed-flag</td>
<td>Tell hosts to use the administered stateful protocol (i.e. DHCP) for autoconfiguration</td>
</tr>
<tr>
<td>"Other configuration" flag</td>
<td>other-config-flag</td>
<td>Tell hosts to use the administered (stateful) protocol (i.e. DHCP) for autoconfiguration of other (non-address) information</td>
</tr>
<tr>
<td>MTU</td>
<td>link-mtu</td>
<td>Link MTU value placed in RAs, exluded in RAs if unset</td>
</tr>
<tr>
<td>Router Lifetime</td>
<td>default-lifetime</td>
<td>Lifetime associated with the default router in units of seconds</td>
</tr>
<tr>
<td>Reachable Time</td>
<td>reachable-time</td>
<td>Time, in milliseconds, that a node assumes a neighbor is reachable after having received a reachability confirmation</td>
</tr>
<tr>
<td>Retransmit Timer</td>
<td>retrans-timer</td>
<td>Time in milliseconds between retransmitted Neighbor Solicitation messages</td>
</tr>
<tr>
<td>Default Router Preference</td>
<td>default-preference</td>
<td>Preference associated with the default router</td>
</tr>
<tr>
<td>Interval</td>
<td>interval</td>
<td>Min and max intervals between unsolicited multicast RAs</td>
</tr>
<tr>
<td>DNSSL</td>
<td>dnssl</td>
<td>DNS search list to advertise</td>
</tr>
<tr>
<td>Name Server</td>
<td>name-server</td>
<td>Advertise DNS server per <a href="https://tools.ietf.org/html/rfc6106">https://tools.ietf.org/html/rfc6106</a></td>
</tr>
</tbody>
</table>

### Advertising a Prefix

<div class="cfgcmd">

set service router-advert interface \<interface\> prefix \<prefix/mask\>

<div class="note">

<div class="title">

Note

</div>

You can also opt for using <span class="title-ref">::/64</span> as prefix for your `RAs (Router
Advertisements)`. This will take the IPv6 GUA prefix assigned to the interface,
which comes in handy when using DHCPv6-PD.

</div>

</div>

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr>
<th>VyOS Field</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>decrement-lifetime</td>
<td>Lifetime is decremented by the number of seconds since the last RA - use in conjunction with a DHCPv6-PD prefix</td>
</tr>
<tr>
<td>deprecate-prefix</td>
<td>Upon shutdown, this option will deprecate the prefix by announcing it in the shutdown RA</td>
</tr>
<tr>
<td>no-autonomous-flag</td>
<td>Prefix can not be used for stateless address auto-configuration</td>
</tr>
<tr>
<td>no-on-link-flag</td>
<td>Prefix can not be used for on-link determination</td>
</tr>
<tr>
<td>preferred-lifetime</td>
<td>Time in seconds that the prefix will remain preferred (default 4 hours)</td>
</tr>
<tr>
<td>valid-lifetime</td>
<td>Time in seconds that the prefix will remain valid (default: 30 days)</td>
</tr>
</tbody>
</table>

### Advertising a NAT64 Prefix

<div class="cfgcmd">

set service router-advert interface \<interface\> nat64prefix \<prefix/mask\>

Enable PREF64 option as outlined in `8781`.

NAT64 prefix mask must be one of: /32, /40, /48, /56, /64 or 96.

<div class="note">

<div class="title">

Note

</div>

The well known NAT64 prefix is `64:ff9b::/96`

</div>

</div>

<table>
<colgroup>
<col style="width: 25%" />
<col style="width: 75%" />
</colgroup>
<thead>
<tr>
<th>VyOS Field</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>valid-lifetime</td>
<td>Time in seconds that the prefix will remain valid (default: 65528 seconds)</td>
</tr>
</tbody>
</table>

### Disabling Advertisements

To disable advertisements without deleting the configuration:

<div class="cfgcmd">

set service router-advert interface \<interface\> no-send-advert

If set, the router will no longer send periodic router advertisements and
will not respond to router solicitations.

</div>

<div class="cfgcmd">

set service router-advert interface \<interface\> no-send-interval

Advertisement Interval Option (specified by Mobile IPv6) is always included in
Router Advertisements unless this option is set.

</div>

## Example

Your LAN connected on eth0 uses prefix `2001:db8:beef:2::/64` with the router
beeing `2001:db8:beef:2::1`

``` none
set interfaces ethernet eth0 address 2001:db8:beef:2::1/64

set service router-advert interface eth0 default-preference 'high'
set service router-advert interface eth0 name-server '2001:db8::1'
set service router-advert interface eth0 name-server '2001:db8::2'
set service router-advert interface eth0 other-config-flag
set service router-advert interface eth0 prefix 2001:db8:beef:2::/64
```
