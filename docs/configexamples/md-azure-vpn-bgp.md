lastproofread  
2021-06-28

# Route-Based Site-to-Site VPN to Azure (BGP over IKEv2/IPsec)

This guide shows an example of a route-based IKEv2 site-to-site VPN to
Azure using VTI and BGP for dynamic routing updates.

For redundant / active-active configurations see
`examples-azure-vpn-dual-bgp`

## Prerequisites

- A pair of Azure VNet Gateways deployed in active-passive
  configuration with BGP enabled.
- A local network gateway deployed in Azure representing
  the Vyos device, matching the below Vyos settings except for
  address space, which only requires the Vyos private IP, in
  this example 10.10.0.5/32
- A connection resource deployed in Azure linking the
  Azure VNet gateway and the local network gateway representing
  the Vyos device.

## Example

<table style="width:86%;">
<colgroup>
<col style="width: 55%" />
<col style="width: 30%" />
</colgroup>
<tbody>
<tr>
<td>WAN Interface</td>
<td>eth0</td>
</tr>
<tr>
<td>On-premises address space</td>
<td>10.10.0.0/16</td>
</tr>
<tr>
<td>Azure address space</td>
<td><blockquote>
<p>10.0.0.0/16</p>
</blockquote></td>
</tr>
<tr>
<td>Vyos public IP</td>
<td>198.51.100.3</td>
</tr>
<tr>
<td>Vyos private IP</td>
<td>10.10.0.5</td>
</tr>
<tr>
<td>Azure VNet Gateway public IP</td>
<td><blockquote>
<p>203.0.113.2</p>
</blockquote></td>
</tr>
<tr>
<td>Azure VNet Gateway BGP IP</td>
<td><blockquote>
<p>10.0.0.4</p>
</blockquote></td>
</tr>
<tr>
<td>Pre-shared key</td>
<td>ch00s3-4-s3cur3-psk</td>
</tr>
<tr>
<td>Vyos ASN</td>
<td>64499</td>
</tr>
<tr>
<td>Azure ASN</td>
<td>65540</td>
</tr>
</tbody>
</table>

## Vyos configuration

- Configure the IKE and ESP settings to match a subset
  of those supported by Azure:

``` none
set vpn ipsec esp-group AZURE lifetime '3600'
set vpn ipsec esp-group AZURE mode 'tunnel'
set vpn ipsec esp-group AZURE pfs 'dh-group2'
set vpn ipsec esp-group AZURE proposal 1 encryption 'aes256'
set vpn ipsec esp-group AZURE proposal 1 hash 'sha1'

set vpn ipsec ike-group AZURE dead-peer-detection action 'restart'
set vpn ipsec ike-group AZURE dead-peer-detection interval '15'
set vpn ipsec ike-group AZURE dead-peer-detection timeout '30'
set vpn ipsec ike-group AZURE ikev2-reauth
set vpn ipsec ike-group AZURE key-exchange 'ikev2'
set vpn ipsec ike-group AZURE lifetime '28800'
set vpn ipsec ike-group AZURE proposal 1 dh-group '2'
set vpn ipsec ike-group AZURE proposal 1 encryption 'aes256'
set vpn ipsec ike-group AZURE proposal 1 hash 'sha1'
```

- Enable IPsec on eth0

``` none
set vpn ipsec interface 'eth0'
```

- Configure a VTI with a dummy IP address

``` none
set interfaces vti vti1 address '10.10.1.5/32'
set interfaces vti vti1 description 'Azure Tunnel'
```

- Clamp the VTI's MSS to 1350 to avoid PMTU blackholes.

``` none
set interfaces vti vti1 ip adjust-mss 1350
```

- Configure the VPN tunnel

``` none
set vpn ipsec authentication psk azure id '198.51.100.3'
set vpn ipsec authentication psk azure id '203.0.113.2'
set vpn ipsec authentication psk azure secret 'ch00s3-4-s3cur3-psk'
set vpn ipsec site-to-site peer azure authentication local-id '198.51.100.3'
set vpn ipsec site-to-site peer 203.0.113.2 authentication mode 'pre-shared-secret'
set vpn ipsec site-to-site peer 203.0.113.2 authentication remote-id '203.0.113.2'
set vpn ipsec site-to-site peer 203.0.113.2 connection-type 'respond'
set vpn ipsec site-to-site peer 203.0.113.2 description 'AZURE PRIMARY TUNNEL'
set vpn ipsec site-to-site peer 203.0.113.2 ike-group 'AZURE'
set vpn ipsec site-to-site peer 203.0.113.2 ikev2-reauth 'inherit'
set vpn ipsec site-to-site peer 203.0.113.2 local-address '10.10.0.5'
set vpn ipsec site-to-site peer azure remote-address '203.0.113.2'
set vpn ipsec site-to-site peer 203.0.113.2 vti bind 'vti1'
set vpn ipsec site-to-site peer 203.0.113.2 vti esp-group 'AZURE'
```

- **Important**: Add an interface route to reach Azure's BGP listener

``` none
set protocols static route 10.0.0.4/32 interface vti1
```

- Configure your BGP settings

``` none
set protocols bgp system-as 64499
set protocols bgp neighbor 10.0.0.4 remote-as '65540'
set protocols bgp neighbor 10.0.0.4 address-family ipv4-unicast soft-reconfiguration 'inbound'
set protocols bgp neighbor 10.0.0.4 timers holdtime '30'
set protocols bgp neighbor 10.0.0.4 timers keepalive '10'
```

- **Important**: Disable connected check

``` none
set protocols bgp neighbor 10.0.0.4 disable-connected-check
```
