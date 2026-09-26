(examples-vxlan-gbp)=

# VXLAN-GBP with receive-side firewall policy

This example uses VXLAN Group Policy (GBP) to carry a classification from
one router to another. Router A marks user traffic with policy ID 50000.
Router B matches that ID after decapsulation and selects a local firewall
policy that permits ICMP and TCP port 80 and drops other new traffic.

See {ref}`vxlan-interface` for the GBP command, packet-mark layout, socket
compatibility requirements, and external-mode limitations.

## Requirements and topology

This example uses two VyOS routers and two Linux hosts. VXLAN-GBP support
was added to VyOS rolling in {vytask}`T9319`, so both routers need a build
that includes the `gbp` command.

The configurations below assume unused `eth0` and `eth1` interfaces and
no existing firewall or zone policy. They cover only the forwarding
policy for this example; add management access and perimeter rules to
suit your deployment.

```text
USER                     Router A           Router B                  APP
192.0.2.10 --- eth1 192.0.2.1                    203.0.113.1 eth1 --- 203.0.113.10
                         eth0 198.51.100.1 --- 198.51.100.2 eth0
                         vxlan100 .1  ======= .2 vxlan100
                                10.100.0.0/30, VNI 100
```

| Link | Router A | Router B |
| --- | --- | --- |
| Underlay (`eth0`) | `198.51.100.1/30` | `198.51.100.2/30` |
| Overlay (`vxlan100`) | `10.100.0.1/30` | `10.100.0.2/30` |
| Attached LAN (`eth1`) | `192.0.2.1/24` | `203.0.113.1/24` |

Configure USER as `192.0.2.10/24` with gateway `192.0.2.1`, and APP as
`203.0.113.10/24` with gateway `203.0.113.1`. Allow ICMP and TCP ports 80
and 8080 in APP's host firewall for the tests below. The routers use a
1500-byte IPv4 underlay and a 1450-byte overlay MTU.

This is routed VXLAN: no bridge, EVPN, or `parameters external` is used.
The two underlay addresses must be reachable, and UDP port 4789 must be
allowed between the VTEPs. The policy ID is not authenticated; keep this
underlay restricted to trusted peers.

## Router A: classify user traffic

In configuration mode:

```none
set interfaces ethernet eth0 address '198.51.100.1/30'
set interfaces ethernet eth1 address '192.0.2.1/24'
set interfaces vxlan vxlan100 source-address '198.51.100.1'
set interfaces vxlan vxlan100 remote '198.51.100.2'
set interfaces vxlan vxlan100 port '4789'
set interfaces vxlan vxlan100 vni '100'
set interfaces vxlan vxlan100 address '10.100.0.1/30'
set interfaces vxlan vxlan100 mtu '1450'
set interfaces vxlan vxlan100 gbp
set protocols static route 203.0.113.0/24 next-hop '10.100.0.2'

set firewall ipv4 prerouting raw rule 100 action 'accept'
set firewall ipv4 prerouting raw rule 100 inbound-interface name 'eth1'
set firewall ipv4 prerouting raw rule 100 source address '192.0.2.0/24'
set firewall ipv4 prerouting raw rule 100 set mark '50000'

set firewall ipv4 forward filter default-action 'drop'
set firewall ipv4 forward filter rule 10 action 'accept'
set firewall ipv4 forward filter rule 10 state 'established'
set firewall ipv4 forward filter rule 10 state 'related'
set firewall ipv4 forward filter rule 20 action 'drop'
set firewall ipv4 forward filter rule 20 state 'invalid'
set firewall ipv4 forward filter rule 100 action 'accept'
set firewall ipv4 forward filter rule 100 inbound-interface name 'eth1'
set firewall ipv4 forward filter rule 100 outbound-interface name 'vxlan100'
set firewall ipv4 forward filter rule 100 source address '192.0.2.0/24'
set firewall ipv4 forward filter rule 100 destination address '203.0.113.0/24'
commit
save
```

The ingress rule sets the packet mark before encapsulation. The value
50000 fits in the GBP policy ID field and leaves the D and A flag bits
clear. Router A permits new USER-to-APP traffic so router B can enforce
the service policy. Return traffic is accepted by connection state.

## Router B: enforce the received policy

In configuration mode:

```none
set interfaces ethernet eth0 address '198.51.100.2/30'
set interfaces ethernet eth1 address '203.0.113.1/24'
set interfaces vxlan vxlan100 source-address '198.51.100.2'
set interfaces vxlan vxlan100 remote '198.51.100.1'
set interfaces vxlan vxlan100 port '4789'
set interfaces vxlan vxlan100 vni '100'
set interfaces vxlan vxlan100 address '10.100.0.2/30'
set interfaces vxlan vxlan100 mtu '1450'
set interfaces vxlan vxlan100 gbp
set protocols static route 192.0.2.0/24 next-hop '10.100.0.1'

set firewall ipv4 name USER_TO_APP default-action 'drop'
set firewall ipv4 name USER_TO_APP rule 10 action 'accept'
set firewall ipv4 name USER_TO_APP rule 10 protocol 'icmp'
set firewall ipv4 name USER_TO_APP rule 20 action 'accept'
set firewall ipv4 name USER_TO_APP rule 20 protocol 'tcp'
set firewall ipv4 name USER_TO_APP rule 20 destination port '80'

set firewall ipv4 forward filter default-action 'drop'
set firewall ipv4 forward filter rule 10 action 'accept'
set firewall ipv4 forward filter rule 10 state 'established'
set firewall ipv4 forward filter rule 10 state 'related'
set firewall ipv4 forward filter rule 20 action 'drop'
set firewall ipv4 forward filter rule 20 state 'invalid'
set firewall ipv4 forward filter rule 100 action 'jump'
set firewall ipv4 forward filter rule 100 jump-target 'USER_TO_APP'
set firewall ipv4 forward filter rule 100 inbound-interface name 'vxlan100'
set firewall ipv4 forward filter rule 100 outbound-interface name 'eth1'
set firewall ipv4 forward filter rule 100 source address '192.0.2.0/24'
set firewall ipv4 forward filter rule 100 destination address '203.0.113.0/24'
set firewall ipv4 forward filter rule 100 mark '50000'
commit
save
```

New overlay traffic with mark 50000 enters `USER_TO_APP`. An unknown
policy ID misses the jump rule and reaches the forward chain's default
drop. Other new APP-to-USER sessions are also dropped. Replies to
permitted sessions use the established/related rule; router B does not
need to assign a reverse-direction label for those replies.

The exact mark match assumes the D and A bits are clear. Do not restore
connection marks or overwrite packet marks before this match unless the
rules preserve the GBP information needed by the policy.

## Verify the configuration

The following checks confirm that the tunnel is up, that the policy ID is
carried on the wire, and that router B enforces the policy.

### Interface and wire state

From operational mode on each router:

```none
sudo ip -d link show dev vxlan100
```

Confirm that the interface is up and reports `gbp`, VNI 100, and
`dstport 4789`. On router B, capture incoming underlay traffic while
running the USER tests:

```none
sudo tcpdump -ni eth0 -s 0 -w /tmp/vxlan-gbp.pcap 'udp port 4789'
```

Stop the capture with Ctrl-C after the tests. Inspect the file with a
GBP-aware packet decoder. For USER traffic, expect VNI 100 and policy
ID 50000 (`0xc350`), with the D and A bits clear. The `gbp` flag on the
interface only confirms the local setting; the capture shows that the
policy ID is carried.

### Allowed and denied services

On APP, start two temporary HTTP servers in separate terminals from an
empty directory, so the test does not expose existing files:

```bash
sudo python3 -m http.server 80 --bind 203.0.113.10
python3 -m http.server 8080 --bind 203.0.113.10
```

Confirm locally on APP that both servers respond. Then run on USER:

```bash
ping -c 3 203.0.113.10
curl --noproxy '*' --connect-timeout 3 http://203.0.113.10/
curl --noproxy '*' --connect-timeout 3 http://203.0.113.10:8080/
```

Expect ping and TCP/80 to succeed and TCP/8080 to time out. Compare
router B's firewall counters before and after each test, using
operational mode:

```none
show firewall ipv4 forward filter
show firewall ipv4 name USER_TO_APP
```

The mark-selection rule and the corresponding ICMP or TCP/80 rule
should count new permitted traffic. Denied TCP/8080 traffic should
reach the named policy's default drop. If TCP/8080 times out but no
counter changes, the traffic did not reach the policy; check the
underlay and routing first.

### Unknown policy ID

Temporarily change router A's mark in configuration mode:

```none
set firewall ipv4 prerouting raw rule 100 set mark '50001'
commit
```

On USER, test a new connection using an unused source port:

```bash
curl --noproxy '*' --local-port 41001 --connect-timeout 3 http://203.0.113.10/
```

Expect a timeout and a packet capture showing policy ID 50001. Router
B's mark-50000 jump rule should not count the new connection. Use a new
connection for this test; replies on an existing connection still match
the established/related rule.

Restore router A's configuration:

```none
set firewall ipv4 prerouting raw rule 100 set mark '50000'
commit
save
```

Repeat TCP/80 with a different unused source port and confirm success.
Stop the temporary servers when finished.

### Persistence and troubleshooting

After restoring and saving the configuration, reboot each router and
repeat the interface, capture, and service checks to confirm that the
configuration is restored at boot. Restart APP's temporary servers if
needed for the service checks.

If tests fail, check underlay reachability, UDP port and VNI agreement,
GBP on both peers, static routes, host gateways, and MTUs. Check for
rules that overwrite marks, and distinguish new flows from established
connections. A shared-port commit error requires compatible GBP socket
settings or a different port; see {ref}`vxlan-interface`.

Adding or removing GBP recreates the interface and interrupts traffic.
Schedule such changes accordingly. This example does not cover external
metadata forwarding, hardware offload, or third-party VTEPs.
