---
lastproofread: '2026-07-09'
---

(examples-gcp-ha-vpn-bgp)=

# Route-Based Site-to-Site VPN to Google Cloud HA VPN

This guide shows an example of a redundant route-based IKEv2 site-to-site
VPN from two VyOS edge peers to Google Cloud HA VPN. The tunnels use VTI
interfaces and BGP over link-local `/30` address ranges for dynamic routing.

## Prerequisites

- A Google Cloud HA VPN gateway with tunnels on both gateway interfaces.
- A Cloud Router with BGP enabled.
- An external VPN gateway resource in Google Cloud with two interfaces,
  where each interface represents one VyOS edge peer.
- Manual BGP IPv4 next-hop addresses from unique `/30` ranges inside
  `169.254.0.0/16`.
- Firewall policy that permits UDP 500, UDP 4500, and ESP from the two
  HA VPN public IP addresses to the VyOS edge peers.

## Example

```{eval-rst}
+---------------------------------------+------------------------------+
| WAN interface                         | eth0                         |
+---------------------------------------+------------------------------+
| Cloud prefix advertised by Google     | 10.70.0.0/20                 |
+---------------------------------------+------------------------------+
| Edge prefix advertised by VyOS        | 10.80.0.0/24                 |
+---------------------------------------+------------------------------+
| VyOS edge 1 public IP                 | 198.51.100.10                |
+---------------------------------------+------------------------------+
| VyOS edge 2 public IP                 | 198.51.100.11                |
+---------------------------------------+------------------------------+
| Google Cloud HA VPN interface 0 IP    | 203.0.113.10                 |
+---------------------------------------+------------------------------+
| Google Cloud HA VPN interface 1 IP    | 203.0.113.11                 |
+---------------------------------------+------------------------------+
| Tunnel 0 VyOS BGP IP                  | 169.254.10.1/30              |
+---------------------------------------+------------------------------+
| Tunnel 0 Google Cloud BGP IP          | 169.254.10.2/30              |
+---------------------------------------+------------------------------+
| Tunnel 1 VyOS BGP IP                  | 169.254.10.5/30              |
+---------------------------------------+------------------------------+
| Tunnel 1 Google Cloud BGP IP          | 169.254.10.6/30              |
+---------------------------------------+------------------------------+
| VyOS ASN                              | 65010                        |
+---------------------------------------+------------------------------+
| Google Cloud ASN                      | 64514                        |
+---------------------------------------+------------------------------+
| Tunnel 0 pre-shared key               | example-gcp-ha-vpn-psk-0     |
+---------------------------------------+------------------------------+
| Tunnel 1 pre-shared key               | example-gcp-ha-vpn-psk-1     |
+---------------------------------------+------------------------------+
```

Use unique, high-entropy pre-shared keys in production. This example assumes
that each VyOS public IP address is configured directly on the WAN interface.
If a VyOS edge peer is behind one-to-one NAT, use the interface address for
`local-address` and keep `authentication local-id` set to the public IP
registered in Google Cloud.

Both VyOS edge peers must be able to route the edge prefix they advertise.
If only one peer can reach `10.80.0.0/24`, advertise a different prefix or
adjust the export policy for the other peer.

## Google Cloud configuration

On the Google Cloud side, create an HA VPN gateway, a Cloud Router, an
external VPN gateway resource that represents the two VyOS edge peers, and
two VPN tunnels:

- This example follows the topology for two separate peer VPN gateways,
  each with one interface and one public IP address.
- In Google Cloud, model those two peer gateways as one external VPN gateway
  resource with two interfaces.
- Tunnel 0 connects HA VPN interface 0 to VyOS edge 1.
- Tunnel 1 connects HA VPN interface 1 to VyOS edge 2.
- The Cloud Router interface for tunnel 0 uses `169.254.10.2/30` and peers
  with `169.254.10.1`.
- The Cloud Router interface for tunnel 1 uses `169.254.10.6/30` and peers
  with `169.254.10.5`.
- Both Cloud Router BGP peers use peer ASN `65010`.
- Advertise `10.70.0.0/20` from Google Cloud.

## VyOS edge 1 configuration

- Configure IKE and ESP settings supported by Google Cloud:

```none
set vpn ipsec esp-group GCP-ESP lifetime '10800'
set vpn ipsec esp-group GCP-ESP mode 'tunnel'
set vpn ipsec esp-group GCP-ESP pfs 'dh-group14'
set vpn ipsec esp-group GCP-ESP proposal 10 encryption 'aes256'
set vpn ipsec esp-group GCP-ESP proposal 10 hash 'sha256'

set vpn ipsec ike-group GCP-IKE dead-peer-detection action 'restart'
set vpn ipsec ike-group GCP-IKE dead-peer-detection interval '30'
set vpn ipsec ike-group GCP-IKE key-exchange 'ikev2'
set vpn ipsec ike-group GCP-IKE lifetime '36000'
set vpn ipsec ike-group GCP-IKE proposal 10 dh-group '14'
set vpn ipsec ike-group GCP-IKE proposal 10 encryption 'aes256'
set vpn ipsec ike-group GCP-IKE proposal 10 hash 'sha256'
set vpn ipsec ike-group GCP-IKE proposal 10 prf 'prfsha256'
```

- Enable IPsec on the WAN interface:

```none
set vpn ipsec interface 'eth0'
```

- Disable IPsec route autoinstall because routing is handled by VTI and BGP:

```none
set vpn ipsec options disable-route-autoinstall
```

- Configure the VTI:

```none
set interfaces vti vti10 address '169.254.10.1/30'
set interfaces vti vti10 description 'Google Cloud HA VPN tunnel 0'
set interfaces vti vti10 ip adjust-mss '1350'
```

- Configure the VPN tunnel:

```none
set vpn ipsec authentication psk gcp-ha-vpn-0 id '198.51.100.10'
set vpn ipsec authentication psk gcp-ha-vpn-0 id '203.0.113.10'
set vpn ipsec authentication psk gcp-ha-vpn-0 secret 'example-gcp-ha-vpn-psk-0'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 authentication local-id '198.51.100.10'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 authentication mode 'pre-shared-secret'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 authentication remote-id '203.0.113.10'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 connection-type 'initiate'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 description 'Google Cloud HA VPN tunnel 0'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 ike-group 'GCP-IKE'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 local-address '198.51.100.10'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 remote-address '203.0.113.10'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 vti bind 'vti10'
set vpn ipsec site-to-site peer gcp-ha-vpn-0 vti esp-group 'GCP-ESP'
```

- Add an interface route to reach the Google Cloud BGP peer:

```none
set protocols static route 169.254.10.2/32 interface vti10
```

- Configure BGP routing policy and the BGP session:

```none
set policy prefix-list GCP-IN rule 10 action 'permit'
set policy prefix-list GCP-IN rule 10 prefix '10.70.0.0/20'
set policy prefix-list GCP-OUT rule 10 action 'permit'
set policy prefix-list GCP-OUT rule 10 prefix '10.80.0.0/24'

set policy route-map GCP-IN rule 10 action 'permit'
set policy route-map GCP-IN rule 10 match ip address prefix-list 'GCP-IN'
set policy route-map GCP-IN rule 20 action 'deny'
set policy route-map GCP-OUT rule 10 action 'permit'
set policy route-map GCP-OUT rule 10 match ip address prefix-list 'GCP-OUT'
set policy route-map GCP-OUT rule 20 action 'deny'

set protocols bgp system-as '65010'
set protocols bgp parameters router-id '10.80.0.11'
set protocols bgp address-family ipv4-unicast network '10.80.0.0/24'
set protocols bgp neighbor 169.254.10.2 remote-as '64514'
set protocols bgp neighbor 169.254.10.2 address-family ipv4-unicast route-map import 'GCP-IN'
set protocols bgp neighbor 169.254.10.2 address-family ipv4-unicast route-map export 'GCP-OUT'
set protocols bgp neighbor 169.254.10.2 address-family ipv4-unicast soft-reconfiguration 'inbound'
set protocols bgp neighbor 169.254.10.2 timers holdtime '30'
set protocols bgp neighbor 169.254.10.2 timers keepalive '10'
set protocols bgp neighbor 169.254.10.2 disable-connected-check
```

## VyOS edge 2 configuration

- Configure IKE and ESP settings supported by Google Cloud:

```none
set vpn ipsec esp-group GCP-ESP lifetime '10800'
set vpn ipsec esp-group GCP-ESP mode 'tunnel'
set vpn ipsec esp-group GCP-ESP pfs 'dh-group14'
set vpn ipsec esp-group GCP-ESP proposal 10 encryption 'aes256'
set vpn ipsec esp-group GCP-ESP proposal 10 hash 'sha256'

set vpn ipsec ike-group GCP-IKE dead-peer-detection action 'restart'
set vpn ipsec ike-group GCP-IKE dead-peer-detection interval '30'
set vpn ipsec ike-group GCP-IKE key-exchange 'ikev2'
set vpn ipsec ike-group GCP-IKE lifetime '36000'
set vpn ipsec ike-group GCP-IKE proposal 10 dh-group '14'
set vpn ipsec ike-group GCP-IKE proposal 10 encryption 'aes256'
set vpn ipsec ike-group GCP-IKE proposal 10 hash 'sha256'
set vpn ipsec ike-group GCP-IKE proposal 10 prf 'prfsha256'
```

- Enable IPsec on the WAN interface:

```none
set vpn ipsec interface 'eth0'
```

- Disable IPsec route autoinstall because routing is handled by VTI and BGP:

```none
set vpn ipsec options disable-route-autoinstall
```

- Configure the VTI:

```none
set interfaces vti vti11 address '169.254.10.5/30'
set interfaces vti vti11 description 'Google Cloud HA VPN tunnel 1'
set interfaces vti vti11 ip adjust-mss '1350'
```

- Configure the VPN tunnel:

```none
set vpn ipsec authentication psk gcp-ha-vpn-1 id '198.51.100.11'
set vpn ipsec authentication psk gcp-ha-vpn-1 id '203.0.113.11'
set vpn ipsec authentication psk gcp-ha-vpn-1 secret 'example-gcp-ha-vpn-psk-1'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 authentication local-id '198.51.100.11'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 authentication mode 'pre-shared-secret'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 authentication remote-id '203.0.113.11'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 connection-type 'initiate'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 description 'Google Cloud HA VPN tunnel 1'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 ike-group 'GCP-IKE'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 local-address '198.51.100.11'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 remote-address '203.0.113.11'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 vti bind 'vti11'
set vpn ipsec site-to-site peer gcp-ha-vpn-1 vti esp-group 'GCP-ESP'
```

- Add an interface route to reach the Google Cloud BGP peer:

```none
set protocols static route 169.254.10.6/32 interface vti11
```

- Configure BGP routing policy and the BGP session:

```none
set policy prefix-list GCP-IN rule 10 action 'permit'
set policy prefix-list GCP-IN rule 10 prefix '10.70.0.0/20'
set policy prefix-list GCP-OUT rule 10 action 'permit'
set policy prefix-list GCP-OUT rule 10 prefix '10.80.0.0/24'

set policy route-map GCP-IN rule 10 action 'permit'
set policy route-map GCP-IN rule 10 match ip address prefix-list 'GCP-IN'
set policy route-map GCP-IN rule 20 action 'deny'
set policy route-map GCP-OUT rule 10 action 'permit'
set policy route-map GCP-OUT rule 10 match ip address prefix-list 'GCP-OUT'
set policy route-map GCP-OUT rule 20 action 'deny'

set protocols bgp system-as '65010'
set protocols bgp parameters router-id '10.80.0.12'
set protocols bgp address-family ipv4-unicast network '10.80.0.0/24'
set protocols bgp neighbor 169.254.10.6 remote-as '64514'
set protocols bgp neighbor 169.254.10.6 address-family ipv4-unicast route-map import 'GCP-IN'
set protocols bgp neighbor 169.254.10.6 address-family ipv4-unicast route-map export 'GCP-OUT'
set protocols bgp neighbor 169.254.10.6 address-family ipv4-unicast soft-reconfiguration 'inbound'
set protocols bgp neighbor 169.254.10.6 timers holdtime '30'
set protocols bgp neighbor 169.254.10.6 timers keepalive '10'
set protocols bgp neighbor 169.254.10.6 disable-connected-check
```

## Monitoring

Use the following commands to verify the IPsec and BGP state on each VyOS
edge peer:

```none
show vpn ike sa
show vpn ipsec sa
show ip bgp summary
show ip route bgp
```

## References

% stop_vyoslinter

- [Google Cloud: create an HA VPN gateway to a peer VPN gateway]
- [Google Cloud: HA VPN topologies]
- [Google Cloud: supported IKE ciphers]

[Google Cloud: create an HA VPN gateway to a peer VPN gateway]: https://docs.cloud.google.com/network-connectivity/docs/vpn/how-to/creating-ha-vpn
[Google Cloud: HA VPN topologies]: https://docs.cloud.google.com/network-connectivity/docs/vpn/concepts/topologies
[Google Cloud: supported IKE ciphers]: https://docs.cloud.google.com/network-connectivity/docs/vpn/concepts/supported-ike-ciphers

% start_vyoslinter
