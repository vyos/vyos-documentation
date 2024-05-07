###########
1.4 Sagitta
###########

..
   Please don't add anything by hand.
   This file is managed by the script:
   _ext/releasenotes.py


2024-04-25
==========

* :vytask:`T6263` ``(bug): Multicast: Could not commit multicast config with multicast join group using source-address``
* :vytask:`T5833` ``(bug): Not all AFIs compatible with VRF``


2024-04-24
==========

* :vytask:`T6255` ``(bug): Static table description should not contain white-space``
* :vytask:`T6226` ``(feature): add HAPROXY `tcp-request content accept` related block to load-balancing reverse proxy config``
* :vytask:`T6109` ``(bug): remote syslog do not get all the logs``
* :vytask:`T6217` ``(feature): VRRP contrack-sync script change name of the logger``
* :vytask:`T6244` ``(feature): Spacing of "Show System Uptime" hard to parse``


2024-04-23
==========

* :vytask:`T6260` ``(bug): image-tools: remove failed image directory if 'No space left on device' error``
* :vytask:`T6261` ``(default): Typo in op_mode connect_disconnect print statement for check_ppp_running``
* :vytask:`T6237` ``(feature): IPSec remote access VPN: ability to set EAP ID of clients``


2024-04-22
==========

* :vytask:`T5996` ``(bug): unescape backslashes for config save, compare commands``
* :vytask:`T6103` ``(bug): DHCP-server bootfile-name double slash syntax weird behaviour``
* :vytask:`T6080` ``(default): Default NTP server settings``
* :vytask:`T5986` ``(bug): Container: Error on commit when environment variable value contains \n line break``


2024-04-21
==========

* :vytask:`T6191` ``(bug): Policy Route TCP-MSS Behavior Different from 1.3.x``
* :vytask:`T5535` ``(feature): disable-directed-broadcast should be moved to firewall global-options``


2024-04-20
==========

* :vytask:`T6252` ``(bug): gre tunnel - doesn't allow configure jumbo frame more than 8024``


2024-04-19
==========

* :vytask:`T6221` ``(bug): Enabling VRF breaks connectivity``
* :vytask:`T6035` ``(bug): QoS policy shaper queue-type random-detect requires  limit avpkt``
* :vytask:`T6246` ``(feature): Enable basic haproxy http-check configuration options``
* :vytask:`T6242` ``(feature): Loadbalancer reverse-proxy: SSL backend skip CA certificate verification``


2024-04-17
==========

* :vytask:`T6168` ``(bug): add system image does not set default boot to current console type in compatibility mode``
* :vytask:`T6243` ``(bug): Update vyos-http-api-tools for package idna security advisory``
* :vytask:`T6154` ``(enhancment): Installer should ask for password twice``
* :vytask:`T5966` ``(default): Adjust dynamic dns configuration address subpath to be more intuitive and other op-mode adjustments``
* :vytask:`T5723` ``(default): mdns repeater: Always reload systemd daemon before applying changes``
* :vytask:`T5722` ``(bug): Failing to add route in failover if gateway not in the same interface network``
* :vytask:`T5612` ``(default): Miscellaneous improvements and fixes for dynamic DNS configuration``
* :vytask:`T5574` ``(default): Support per-service cache management for dynamic dns providers``
* :vytask:`T5360` ``(bug): ddclient generating abuse``


2024-04-15
==========

* :vytask:`T6100` ``(bug): NAT config migration error in 1.4.0-epa1 if invalid address/network defined in 1.3.6 version``
* :vytask:`T5734` ``(bug): OpenVPN server dh-params that are not in PKI error``


2024-04-14
==========

* :vytask:`T6210` ``(feature): Add container ability to configure capability sys-nice``


2024-04-13
==========

* :vytask:`T6173` ``(bug): Build Causes Errors When "--version" Contains Slashes ("/")``
* :vytask:`T2518` ``(feature): Support NAT for ipv6(NPT)``
* :vytask:`T6238` ``(default): vyos-build Check pull request title requires the python script``
* :vytask:`T6235` ``(default): Git check PR status: conflicts and resolution``


2024-04-12
==========

* :vytask:`T5872` ``(default): ipsec remote access VPN: support dhcp-interface``
* :vytask:`T6216` ``(bug): Upgrade error from 1.3 to 1.4 - Firewall using character '+'``
* :vytask:`T6214` ``(bug): Error when using some constraints``
* :vytask:`T6213` ``(bug): Firewall group constraints``
* :vytask:`T6148` ``(bug): Reset vpn ipsec command breaks tunnel and does not reset SAs that are down``
* :vytask:`T1487` ``(default): DNS (pdns_recursor) stats logs not saved to disk``
* :vytask:`T6222` ``(bug): VRRP rfc3768-compatibility not working correctly when resulting interface name is over 15 characters``
* :vytask:`T6218` ``(bug): Container network interface in VRF fails to generate IPv6 link-local address``
* :vytask:`T5959` ``(default): Streamline dns forwarding service``
* :vytask:`T5846` ``(default): Refactor and simplify DUID definition in conf-mode``
* :vytask:`T5631` ``(feature): Ability to export the current configuration in JSON format``
* :vytask:`T5615` ``(default): Narrow down spurious name conflict with mdns``
* :vytask:`T5530` ``(default): Add LFA to IS-IS``
* :vytask:`T5195` ``(default): Break up the vyos.util module``
* :vytask:`T5124` ``(bug): Python3 deprecation distutils.version import LooseVersion``
* :vytask:`T1871` ``(feature): add MTU option when configure limiter traffic-policy``
* :vytask:`T874` ``(feature): Support for Two Factor Authentication for CLI access via Google Authenticator/OTP``
* :vytask:`T6204` ``(default): Remove shebang lines from Python modules``
* :vytask:`T6166` ``(bug): Tech support generation error for custom output location``
* :vytask:`T6062` ``(feature): container: add support for image manipulation based on tag name``
* :vytask:`T5877` ``(default): Reduce unnecessary nesting in system domain-search path and improve smoketest``
* :vytask:`T5871` ``(default): ipsec remote access VPN: specify "cacerts" to disambiguate mulitple remote access configurations``
* :vytask:`T5870` ``(default): ipsec remote access VPN: add x509 ("pubkey") authentication``
* :vytask:`T5772` ``(default): Require HTTPS API server configurations to include at least one key if key-based auth is used``
* :vytask:`T5447` ``(feature): Allow static MACsec keys with peers``
* :vytask:`T4221` ``(default): Add a template filter for converting scalars to single-item lists``
* :vytask:`T3766` ``(feature): containers: Expanding options for networking and building containers``


2024-04-11
==========

* :vytask:`T4516` ``(feature): Rewrite system image manipulation tools in Python``
* :vytask:`T4548` ``(feature): GRUB loader configuration rework``
* :vytask:`T3774` ``(bug): atop logs are not limited in size``
* :vytask:`T3574` ``(default): Add constraintGroup for combining validators with logical AND``
* :vytask:`T3474` ``(default): Revisit storing syntax version of interface definitions in XML file``
* :vytask:`T160` ``(feature): Support NAT64``
* :vytask:`T6228` ``(bug): Cleanup of not existing units``


2024-04-10
==========

* :vytask:`T6207` ``(bug): image-tools: restore ability to copy config.boot.default on image install``
* :vytask:`T5750` ``(bug): Upgrade from 1.3.4 to 1.4 Rolling fails QoS``
* :vytask:`T5858` ``(bug): Show conntrack statistics formatting is all over the place``
* :vytask:`T4734` ``(feature): Feature Request: openvpn: add OTP 2FA support``


2024-04-09
==========

* :vytask:`T3409` ``(feature): Add back TCP-MSS Clamp to PMTU``
* :vytask:`T6121` ``(feature): Extend service config-sync for sections  vpn, policy, vrf``


2024-04-08
==========

* :vytask:`T6197` ``(bug): IPoE-server interface client-subnet looks broken or works with the wrong logic``
* :vytask:`T6196` ``(bug): Route-map and summary-only do not work in BGP aggregation at the same time``
* :vytask:`T6068` ``(feature): dhcp server: allow switching between load-balanced and hotspare mode``


2024-04-07
==========

* :vytask:`T6205` ``(bug): ipoe: error in migration script logic while renaming mac-address to mac node``
* :vytask:`T6039` ``(bug): cloud-init DNS search-domain causes configuration migration/validation error``
* :vytask:`T5862` ``(bug): Default MTU is not acceptable in some environments``
* :vytask:`T6208` ``(feature): container: rename "cap-add" CLI node to "capability"``
* :vytask:`T6188` ``(feature): Add Firewall Rule Description to "show firewall" commands``
* :vytask:`T1244` ``(default): Support for StartupResync in conntrackd``


2024-04-06
==========

* :vytask:`T6203` ``(enhancment): Remove obsoleted xml lib``
* :vytask:`T6202` ``(bug): Multi-Protocol BGP is broken by 6PE patch in upstream FRR 9.1``


2024-04-05
==========

* :vytask:`T6089` ``(bug): [1.3.6->1.4.0-epa1 Migration] "ospf passive-interface default" incorrectly added``
* :vytask:`T2590` ``(bug): DHCPv6 not updating nameservers and search domains since replacing isc-dhcp-client with WIDE dhcp6c``
* :vytask:`T6199` ``(feature): spring cleaning - drop unused Python imports``


2024-04-04
==========

* :vytask:`T6119` ``(default): Use a compliant TOML parser``
* :vytask:`T6171` ``(feature): dhcp server fail-over - Rename fail-over node``
* :vytask:`T6115` ``(bug): Build from Git tags fail``
* :vytask:`T5122` ``(feature): Move "archive-areas" to defaults.toml to support "non-free-firmware" repository``
* :vytask:`T5121` ``(bug): Incorrect "architecture" config loaded``
* :vytask:`T4951` ``(default): Add an op mode exception for cases when operations fail due to insufficient system resources``
* :vytask:`T4883` ``(default): Add a description field for routing tables``
* :vytask:`T4796` ``(bug): build-vyos-image ignores multiple options``
* :vytask:`T4795` ``(feature): Cleanup custom python validators``
* :vytask:`T4761` ``(default): Add a generic URL validator``
* :vytask:`T3843` ``(bug): l2tp configuration not cleared after delete``
* :vytask:`T3681` ``(default): The VMware Tools resume script did not run successfully in this virtual machine.``
* :vytask:`T1991` ``(feature): Rework time services``
* :vytask:`T5711` ``(default): Put the version data file inside the ISO image``
* :vytask:`T5672` ``(default): Remove the old-style command definition importer``
* :vytask:`T5639` ``(default): Group vyos-1x dependencies by their VyOS components and specify their purpose``
* :vytask:`T5638` ``(default): Add support for requiring numeric values to be ranges rather than single numbers``
* :vytask:`T5634` ``(default): Remove support for Blowfish and DES from OpenVPN``
* :vytask:`T5605` ``(default): Do not generate keysize option in OpenVPN configs``
* :vytask:`T5582` ``(default): Add a command to force NTP sync``
* :vytask:`T5449` ``(default): Add options for TCP MSS probing``
* :vytask:`T4440` ``(default): Add OCI compliant image labels to vyos-build and vyos containers``
* :vytask:`T671` ``(enhancment): Identify and remove dead code``
* :vytask:`T5109` ``(feature): Improve OCaml XML validator``
* :vytask:`T1449` ``(feature): Add opportunity to include custom default configs (few) at building``


2024-04-03
==========

* :vytask:`T6198` ``(feature): configverify: add common helper for PKI certificate validation``
* :vytask:`T6192` ``(feature): Multi VRF support for SSH``


2024-04-02
==========

* :vytask:`T6167` ``(bug): VNI not set on VRF after reboot``
* :vytask:`T6151` ``(default): BGP VRF - Route-leaking not work when the next-hop is a recursive route.``
* :vytask:`T6033` ``(bug): hsflowd fails to start when using a tunnel interface``


2024-04-01
==========

* :vytask:`T6195` ``(feature): dropbear: package upgrade 2022.83-1 -> 2022.83-1+deb12u1``
* :vytask:`T6193` ``(bug): dhcp-client: invalid warning "is not a DHCP interface but uses DHCP name-server option" for VLAN interfaces``
* :vytask:`T6178` ``(bug): Reverse-proxy should check that certificate exists during commit``


2024-03-31
==========

* :vytask:`T6186` ``(bug): Fix regression in 'set system image default-boot'``
* :vytask:`T5832` ``(feature): Keepalived: Allow using the 'dev' statement on excluded-addresses``


2024-03-28
==========

* :vytask:`T6147` ``(bug): Conntrack not working as expected with global state-policy``
* :vytask:`T6175` ``(bug): op-mode: "renew dhcp interface <name>" does not check if it's an actual DHCP interface``


2024-03-26
==========

* :vytask:`T6066` ``(bug): Setting same network in different ospf area will raise exception``


2024-03-25
==========

* :vytask:`T6145` ``(bug): Service config-sync does not rely on priorities but must``


2024-03-24
==========

* :vytask:`T6161` ``(feature): Output container images as JSON``
* :vytask:`T6165` ``(bug): grub: vyos-grub-update failed to start on "slow" systems``
* :vytask:`T6085` ``(bug): VTI interfaces are in UP state by default``
* :vytask:`T6152` ``(bug): Kernel panic for ZimaBoard 232``


2024-03-23
==========

* :vytask:`T6160` ``(bug): isis: NameError: name 'process' is not defined``
* :vytask:`T6131` ``(bug): Disabling openvpn interface(s) causes OSPF to fail to load on reboot``
* :vytask:`T4022` ``(feature): Add package nat-rtsp-dkms``


2024-03-22
==========

* :vytask:`T6136` ``(bug): Configuring a dynamic address group, config script did not check whether the group was created``
* :vytask:`T6130` ``(bug): [1.3.6->1.4.0-epa2 Migration] BGP "set community" missing``
* :vytask:`T6090` ``(bug): [1.3.6->1.4.0-epa1 Migration] policy route fails due tcp flag case sensitivity``
* :vytask:`T6155` ``(default): ixgbe: failed to initialize because an unsupported SFP+ module type was detected.``
* :vytask:`T6125` ``(feature): Support 802.1ad (0x88a8) vlan filtering for bridge``
* :vytask:`T5624` ``(default): Remove /etc/debian_version from the image``


2024-03-21
==========

* :vytask:`T6143` ``(feature): Increase configuration timeout range for service config-sync``


2024-03-20
==========

* :vytask:`T6133` ``(feature): Add domain-name to commit-archive``
* :vytask:`T6129` ``(feature): bgp: add route-map option "as-path exclude all"``


2024-03-19
==========

* :vytask:`T6127` ``(bug): Ability to view logs for rules with Offload not functional``
* :vytask:`T6138` ``(bug): Conntrack table op-mode fails with flowtable offload entries``


2024-03-15
==========

* :vytask:`T6118` ``(feature): radvd: RFC8781: add nat64prefix support``


2024-03-12
==========

* :vytask:`T6020` ``(bug): VRRP health-check script is not applied correctly in keepalived.conf``
* :vytask:`T5646` ``(bug): QoS policy limiter broken if class without match``
* :vytask:`T2433` ``(feature): Improve CLI value validator performance``
* :vytask:`T1436` ``(bug): Config entries with default values do not correctly show as changed``


2024-03-11
==========

* :vytask:`T6098` ``(bug): Description doesnt seem to allow for non international characters``
* :vytask:`T6070` ``(bug): bnx2x NIC causes a commit error due to incorrect implementation of EEE status reading``
* :vytask:`T2998` ``(bug): SNMP v3 oid "exclude" option doesn't work``
* :vytask:`T6107` ``(bug): Nginx does not allow big config queries for configure endpoint API``
* :vytask:`T6096` ``(bug): Config commits are not synced properly because 00vyos-sync is deleted by vyos-router``
* :vytask:`T6093` ``(bug): Incorrect dhcp-options vendor-class-id regex``
* :vytask:`T6083` ``(feature): ethtool: move string parsing to JSON parsing``
* :vytask:`T6069` ``(bug): HTTP API segfault during concurrent configuration requests``
* :vytask:`T6057` ``(feature): Add ability to disable syslog for conntrackd``
* :vytask:`T5504` ``(feature): Keepalived VRRP ability to set more than one peer-address``
* :vytask:`T5717` ``(feature): ospfv3 - add  allow to set metric-type to ospf redistribution while frr docs says its possible.``
* :vytask:`T6071` ``(bug): firewall: CLI description limit of 256 characters cause config upgrade issues``


2024-03-08
==========

* :vytask:`T6086` ``(bug): NAT does not work with network-groups``
* :vytask:`T6094` ``(bug): Destination Nat not Making Firewall Rules``
* :vytask:`T6061` ``(bug): connection-status nat destination firewall filter not working in 1.4.0-epa1``
* :vytask:`T6075` ``(bug): Applying firewall rules with a non-existent interface group``


2024-03-07
==========

* :vytask:`T6104` ``(bug): Regression in commit-archive for non-interactive configuration``
* :vytask:`T6084` ``(bug): OpenNHRP DMVPN configuration file clean after reboot if we have any IPSec configuration``
* :vytask:`T5348` ``(bug): Service config-sync can freeze the secondary router if it has commit-archive location``
* :vytask:`T6073` ``(bug): Conntrack/NAT not being disabled when VRFs are defined``
* :vytask:`T6095` ``(default): Tab completion for "set interfaces wireless wlan0 country-code" incorrect country "uk"``


2024-03-06
==========

* :vytask:`T6079` ``(bug): dhcp: migration fails for duplicate static-mapping``


2024-03-05
==========

* :vytask:`T5903` ``(bug): NHRP don´t start on reboot from version 1.5-rolling-202401010026``
* :vytask:`T2447` ``(feature): Additional Boot Argument Configuration to limit CPU C-States``


2024-03-04
==========

* :vytask:`T6054` ``(bug): load-balancing wan - doesn't configure a list of ports``
* :vytask:`T6087` ``(feature): ospfv3: add support to redistribute IS-IS routes``


2024-03-02
==========

* :vytask:`T6081` ``(bug): QoS policy shaper target and interval wrong calcuations``


2024-02-29
==========

* :vytask:`T6078` ``(feature): Update ethtool to 6.6``
* :vytask:`T6077` ``(feature): banner: implement ASCII contest winner default logo``
* :vytask:`T6074` ``(feature): container: do not allow deleting images which have a container running``


2024-02-28
==========

* :vytask:`T6055` ``(bug): PKI error: "failed to install x value" when executed the command from conf mode``
* :vytask:`T4270` ``(bug): dns forwarding - When "ignore-hosts-file" is unset, local hostname of router resolves to 127.0.1.1``


2024-02-27
==========

* :vytask:`T6065` ``(bug): Duplicate lines in build-vyos-image script cause sagitta build to fail``
* :vytask:`T5080` ``(bug): Conntrack enabled by default``


2024-02-26
==========

* :vytask:`T6064` ``(bug): Can not build VyOS if repository it not cloned to a branch``
* :vytask:`T5754` ``(default): Update to StrongSwan 5.9.11``


2024-02-25
==========

* :vytask:`T6060` ``(feature): op-mode: container: support removing all container images at once``


2024-02-24
==========

* :vytask:`T5909` ``(bug): Container registry with authentication prevents config load (section container) after reboot``


2024-02-23
==========

* :vytask:`T5376` ``(bug): Conntrack FTP helper does not work properly``
* :vytask:`T970` ``(feature): Hostname Support in NAT and Firewall Rules``
* :vytask:`T4940` ``(feature): Interface debugging``


2024-02-22
==========

* :vytask:`T6048` ``(bug): Exception in event handler script``
* :vytask:`T3902` ``(bug): Firewall does not load on boot, address-group not found, even though it exists``


2024-02-21
==========

* :vytask:`T6050` ``(bug): Wrong scripting commands descriptions in accel-ppp services``


2024-02-19
==========

* :vytask:`T5971` ``(default): Create the same view of ppp section  for all accel-ppp services``
* :vytask:`T6029` ``(default): Rewrite Accel-PPP services to an identical feature set``
* :vytask:`T3722` ``(bug): op-mode IPSec show vpn ike sa always shows L-TIME 0``


2024-02-18
==========

* :vytask:`T6043` ``(bug): VxLAN and bridge error bug``
* :vytask:`T6041` ``(bug): image-tools: install fails from PXE boot into live iso due to restrictive logic``


2024-02-17
==========

* :vytask:`T5972` ``(feature): login: add possibility to disable individual local user accounts``


2024-02-16
==========

* :vytask:`T6009` ``(bug): Firewall - Time not working properly when not using UTC``
* :vytask:`T6005` ``(bug): Error on adding a wireguard interface to OSPFv3``
* :vytask:`T2113` ``(bug): OpenVPN Options error: you cannot use --verify-x509-name with --compat-names or --no-name-remapping``
* :vytask:`T6019` ``(feature): Bump nftables and libnftnl version``
* :vytask:`T3471` ``(bug): DHCP hook is not able to detect all running DHCP instances``
* :vytask:`T6015` ``(default): "journalctl_charon" file does not contain data in the generated "ipsec debug-archive" file``
* :vytask:`T6001` ``(default): Add option to enable resolve-via-default``
* :vytask:`T5965` ``(bug): WWAN modems using raw-ip do not work with dhclient/dhcp6c``
* :vytask:`T5418` ``(bug): PPPoE-Server Client IP pool Subnet``
* :vytask:`T5245` ``(bug): Wireless interfaces do not get IPv6 link-local address assigned``


2024-02-15
==========

* :vytask:`T5977` ``(bug): nftables: Operation not supported when using match-ipsec in outbound firewall``
* :vytask:`T2612` ``(bug): HTTPS API, changing API key fails but goes through``
* :vytask:`T5989` ``(bug): IP subnets not usable in UPnP ACLs``
* :vytask:`T5890` ``(default): OTP key generation is broken``
* :vytask:`T5719` ``(default): mdns repeater: Add op-mode commands``
* :vytask:`T4839` ``(feature): Dynamic Firewall groups``
* :vytask:`T4801` ``(feature): Support for building AWS-ready ISO``
* :vytask:`T3993` ``(enhancment): Extend HTTP API GraphQL support``
* :vytask:`T3991` ``(bug): PKI operational command return traceback``
* :vytask:`T3780` ``(bug): VTI not being brought down when tunnel is down``
* :vytask:`T3001` ``(feature): Disable spectre mitigation patches from CLI``
* :vytask:`T562` ``(feature): PDNS: Add support for authoritative dns server``
* :vytask:`T71` ``(feature): Add virtual IP and route installation policy options for IPsec``
* :vytask:`T5496` ``(default): `show firewall` error``
* :vytask:`T4038` ``(default): Rewrite `vyatta-image-tools.pl` in Python``
* :vytask:`T4997` ``(default): Add DHCP client user hooks dir``
* :vytask:`T775` ``(feature): Config Sync between two VyOS routers``
* :vytask:`T381` ``(feature): config nodes for EasyRSA CAs``
* :vytask:`T118` ``(feature): Native Zabbix Support``


2024-02-14
==========

* :vytask:`T6034` ``(feature): rpki: move file based SSH keys for authentication to PKI subsystem``
* :vytask:`T5981` ``(bug): IPsec site-to-site migrated PKI ca certificates are created with an '@'``
* :vytask:`T5930` ``(bug): vrf - route-leak not work using route-target both command.``
* :vytask:`T5709` ``(bug): IPoE-server fails if next pool mentioned but not defined``
* :vytask:`T4119` ``(bug): Issue with l2tp remote-access ipv6 configuration``
* :vytask:`T2044` ``(bug): RPKI doesn't boot properly``
* :vytask:`T6032` ``(feature): bgp: add EVPN MAC-VRF Site-of-Origin support``
* :vytask:`T5960` ``(default): Rewriting authentication section in accel-ppp services``


2024-02-13
==========

* :vytask:`T5928` ``(bug): Configuration fails to load on boot if offloading has VLAN interfaces defined``
* :vytask:`T5482` ``(bug): Chrony NTP Server Fails To Sync Time``
* :vytask:`T5064` ``(bug): Value validation for domain-groups seems to be broken``


2024-02-12
==========

* :vytask:`T6010` ``(bug): Support setting multiple values in BGP path-attribute``
* :vytask:`T6004` ``(bug): RPKI is not configured``
* :vytask:`T5952` ``(default): DHCP allow same MAC Address on same subnet``
* :vytask:`T5849` ``(feature): Add SRv6 route commands``


2024-02-10
==========

* :vytask:`T6023` ``(bug): rpki: add support for CLI knobs expire-interval and retry-interval``
* :vytask:`T1090` ``(default): Webproxy overhaul``


2024-02-09
==========

* :vytask:`T6028` ``(bug): QoS policy shaper wrong class_id_max and default_minor_id``
* :vytask:`T6026` ``(bug): QoS hide attempts to delete qdisc from devices``
* :vytask:`T5788` ``(feature): frr: update to 9.1 release``
* :vytask:`T5703` ``(bug): QoS config on pppoe interface resets back to fq_codel after tunnel reboots``
* :vytask:`T5685` ``(feature): Keepalived VRRP prefix is not necessary for the virtual address``


2024-02-08
==========

* :vytask:`T6014` ``(feature): Bump keepalived version``
* :vytask:`T5910` ``(bug): Grub problem(?) Serial Console no longer working``
* :vytask:`T6021` ``(bug): QoS r2q wrong calculation``


2024-02-07
==========

* :vytask:`T6017` ``(bug): Update vyos-http-api-tools for security advisory``
* :vytask:`T6016` ``(bug): Resolve intermittent failures in cleanup function after failed image install``
* :vytask:`T6024` ``(feature): bgp: add additional missing FRR features``
* :vytask:`T6011` ``(feature): rpki: known-hosts-file is no longer supported by FRR CLI - remove VyOS CLI node``
* :vytask:`T5998` ``(feature): replay_window setting under vpn in config``


2024-02-06
==========

* :vytask:`T6018` ``(default): smoketest: updating http-api framework requires a pause before test``
* :vytask:`T5921` ``(bug): Trying to commit an OpenConnect configuration without any local users results in an exception``
* :vytask:`T5687` ``(feature): Implement ECS settings for PowerDNS recursor``


2024-02-05
==========

* :vytask:`T5974` ``(bug): QoS policy shaper is currently miscalculating bandwidth and ceil values for the default class``
* :vytask:`T5865` ``(feature): Rewrite ipv6 pool section to ipv6 named pools in Accel-ppp services``


2024-02-02
==========

* :vytask:`T5739` ``(bug): Password recovery does not work if public keys are configured``
* :vytask:`T5955` ``(feature): Rootless containers/set uid/gid for container``
* :vytask:`T5941` ``(bug): [1.3.5 -> 1.4.0-RC1 Migration] Orphaned Configuration Nodes Cause Issues``
* :vytask:`T6003` ``(feature): Add 'show rpki as-number' and 'show rpki prefix'``
* :vytask:`T5848` ``(feature): Add triple-isolate flow isolation option to CAKE QoS policy``


2024-02-01
==========

* :vytask:`T5995` ``(bug): Kernel NIC-drivers for Huawei NICs are not properly enabled``
* :vytask:`T5978` ``(bug): ethernet: hw-tc-offload does not actually get enabled on the NIC``
* :vytask:`T5979` ``(enhancment): Add configurable kernel boot parameters``
* :vytask:`T5973` ``(bug): vrf: RTNETLINK answers: File exists``
* :vytask:`T5967` ``(bug): Multi-hop BFD connections can't be established; please add minimum-ttl option.``
* :vytask:`T5619` ``(default): Update the Intel ixgbe driver due to issues with Intel X533``


2024-01-31
==========

* :vytask:`T6000` ``(bug): [1.3.x -> 1.5.x] migrating threw exception in /opt/vyatta/etc/config-migrate/migrate/https/5-to-6, performed workaround``
* :vytask:`T5999` ``(bug): load-balancing reverse-proxy can't configure root as a redirect``


2024-01-30
==========

* :vytask:`T5980` ``(feature): Add image-tools support for configurable kernel boot options``


2024-01-29
==========

* :vytask:`T5988` ``(bug): image-tools: a check of valid image name is missing from 'add image'``
* :vytask:`T5994` ``(bug): Fix typo in 'remote' module preventing 'add system image' via ftp``


2024-01-26
==========

* :vytask:`T5957` ``(bug): Firewall fails to delete inbound-interface name``
* :vytask:`T5779` ``(bug): custom conntrack timeout rule not applicable``
* :vytask:`T5984` ``(feature): Add user util numactl``


2024-01-25
==========

* :vytask:`T5983` ``(bug): image-tools: minor regression in pruning version files in compatibility mode``
* :vytask:`T5927` ``(bug): QoS policy shaper-hfsc class does not have a `bandwidth` node but requires one in the check``
* :vytask:`T5834` ``(bug): Rename 'enable-default-log' to 'default-log'``


2024-01-22
==========

* :vytask:`T5968` ``(feature): hsflowd: add VRF support``
* :vytask:`T5975` ``(bug): GraphQL expects script otp.py that does not exists in 1.4``
* :vytask:`T5961` ``(bug): QoS policy shaper vif with ceiling fails on commit``
* :vytask:`T5958` ``(bug): QoS policy shaper-hfsc is not implemented``
* :vytask:`T5160` ``(feature): Firewall refactor``
* :vytask:`T5969` ``(feature): op-mode: list multicast group membership``


2024-01-21
==========

* :vytask:`T5799` ``(bug): vyos unbootable after 1.4-rolling-202308240020 to 1.5-rolling-202312010026 upgrade``
* :vytask:`T5787` ``(bug): dhcp-server allows duplicate static-mapping for the same IP address``
* :vytask:`T5692` ``(enhancment): NTP leap smear``
* :vytask:`T5954` ``(feature): Enable nvme_hwmon and drivetemp in KERNEL``


2024-01-20
==========

* :vytask:`T5915` ``(bug): Firewall zone - Re add op-mode commands``
* :vytask:`T5805` ``(bug): Missed per-interface statistic in telegraf``
* :vytask:`T5724` ``(feature): About dhcp client hooks``
* :vytask:`T5577` ``(bug): Optimize PAM configs for RADIUS/TACACS+``
* :vytask:`T5550` ``(bug): Source validation on interface does not work properly``
* :vytask:`T5267` ``(bug): Another corruption on upgrade``
* :vytask:`T5239` ``(bug): frr 'hostname' missing or incorrect, and domain-name missing totally``
* :vytask:`T5219` ``(bug): ddclient: Cloudflare doesn't require login``
* :vytask:`T5217` ``(feature): Add firewall SYNPROXY``
* :vytask:`T5203` ``(feature): load-balancing wan add systemd unit instead of old vyatta-wanloadbalance.init``
* :vytask:`T5199` ``(bug): Salt-minion cannot connect to server in python 3.10 and up``
* :vytask:`T5138` ``(feature): Add patch to accel-ppp build  L2TP LNS use Calling-Number as RADIUS Calling-Station-ID``
* :vytask:`T5054` ``(bug): ipsec: "show vpn ipsec remote-access" does not list active connections``
* :vytask:`T5053` ``(bug): Vyatta-cfg Post-Removal Hook Tries to Disable Deleted Service``
* :vytask:`T5035` ``(feature): Add more actions to policy route rule``
* :vytask:`T4990` ``(bug): Commit results may not be properly saved if power is cut immediately after a successful commit``
* :vytask:`T4988` ``(default): Expose time and size conversion functions as Jinja2 filters``
* :vytask:`T4986` ``(feature): Ability to filter traffic originating from the router itself via firewall``
* :vytask:`T4963` ``(default): vyos.ethtool: improve/fix driver name detection``
* :vytask:`T4935` ``(bug): ospfv3: "not-advertise" and "advertise" conflict``
* :vytask:`T4897` ``(bug): Setting 'source-address' or `source-interface` on existing vxlan interface doesn't work``
* :vytask:`T4888` ``(default): Rewrite the conntrack sync script using vyos.opmode``
* :vytask:`T4863` ``(feature): need an option for route policy to apply to dynamic interfaces l2tp*/ipoe*/pppoe* (for TCP MSS setting)``
* :vytask:`T4817` ``(feature): Please add support for RFC 9234``
* :vytask:`T4765` ``(default): Normalize field names in op mode JSON outputs``
* :vytask:`T4751` ``(enhancment): Feature Request: system login: 2FA OTP key generator in VyOS CLI``
* :vytask:`T4726` ``(default): Add completion and validation for the accel-ppp RADIUS vendor option``
* :vytask:`T4722` ``(default): Improve abbreviation/acronym consistency``
* :vytask:`T4172` ``(feature): Patch ndppd to not read route table if there are no auto prefixes``
* :vytask:`T4085` ``(feature): Rewrite L2TP/PPTP/SSTP/PPPoE services to get_config_dict``
* :vytask:`T4031` ``(feature): Ability to configure DMVPN in vrf``
* :vytask:`T4030` ``(bug): SR-IOV and interface renaming bug``
* :vytask:`T4014` ``(feature): Add “command” and “arg” configuration options for containers``
* :vytask:`T3965` ``(default): arm: Extend configure scripts to allow for arm builds``
* :vytask:`T3813` ``(bug): Some custom sysctl parameters can't be applied bug``
* :vytask:`T3778` ``(bug): Abnormal network communication and settings``
* :vytask:`T3591` ``(bug): OpenVPN with/without VRF not working (NordVPN)``
* :vytask:`T3372` ``(feature): Support public HTTPS repos in live-build``
* :vytask:`T5963` ``(bug): QoS policy shaper rate calculations could be wrong for some ethernet devices``
* :vytask:`T5962` ``(feature): QoS policy set default speed to 100mbit or 1gbit instead of 10mbit``
* :vytask:`T5697` ``(bug): event-handler keep failing``
* :vytask:`T4779` ``(default): Make raw op mode command outputs use bytes for data amount values``


2024-01-19
==========

* :vytask:`T5897` ``(bug): VyOS with Cloud-init and VRF stucks at reboot/shutdown process``
* :vytask:`T5554` ``(bug): Disable sudo for PAM RADIUS``
* :vytask:`T4754` ``(default): Improvement: system login: show configured 2FA OTP key``
* :vytask:`T5857` ``(bug): show interfaces wireless info``
* :vytask:`T5841` ``(default): Remove old ssh-session-cleanup.service``
* :vytask:`T5543` ``(bug): Fix source address handling in static joins``
* :vytask:`T5884` ``(default): Minor description fix (op-mode: generate wireguard)``
* :vytask:`T5781` ``(default): Add ability to add additional minisign keys``


2024-01-18
==========

* :vytask:`T5863` ``(bug): Failure to Load Config on Recent 1.5 Versions``
* :vytask:`T4638` ``(bug): Deleting a parent interface does not delete its underlying VLAN interfaces``
* :vytask:`T5953` ``(default): Rename 'close_action' value from `hold` to `trap` in IPSEC IKE``
* :vytask:`T905` ``(bug): The command show remote-config does not work for remote-platform openvpn``


2024-01-17
==========

* :vytask:`T5923` ``(bug): Config mode system_console.py is not aware of revised GRUB file structure``
* :vytask:`T4658` ``(feature): Rename DPD action `hold` to `trap```
* :vytask:`T5932` ``(bug): 1.4-rolling-202304120317 to 1.4.0-rc1: dynamic dns migration fail``


2024-01-16
==========

* :vytask:`T5951` ``(bug): [1.4.0-RC2] show hardware dmi Operational Mode Command Broken``
* :vytask:`T5937` ``(bug): [1.3.5 -> 1.4.0-RC1 Migration] IPv6 BGP Neighbor Peer Groups Missing / Not Migrated``
* :vytask:`T5889` ``(bug): Migration NAT 5-to-6 bug``
* :vytask:`T5859` ``(bug): Invalid format of pool range in accel-ppp services``
* :vytask:`T5842` ``(feature): Rewrite PPTP service to get_config_dict``
* :vytask:`T5801` ``(feature): Rewrite L2TP service to get_config_dict``
* :vytask:`T5688` ``(default): Create the same view of pool configuration for all accel-ppp services``


2024-01-15
==========

* :vytask:`T5944` ``(bug): "reboot in 1" not working``
* :vytask:`T5936` ``(bug): [1.3.5 -> 1.4.0-RC1 Migration] OSPF Passive Interface Configuration Not Working Correctly``
* :vytask:`T5247` ``(bug): the bug of the command "show interfaces system"``
* :vytask:`T5901` ``(bug): Cloud-init and DHCP exit hook errors``
* :vytask:`T4856` ``(bug): DHCP-client exit hook for IPsec is incorrect``
* :vytask:`T2556` ``(bug): "show interfaces vrrp" does not return any interface``


2024-01-14
==========

* :vytask:`T4428` ``(feature): Update ddclient to newer version``


2024-01-12
==========

* :vytask:`T5925` ``(feature): Containers change systemd KillMode``
* :vytask:`T5920` ``(bug): Quick Start documentation contains error``
* :vytask:`T5919` ``(bug): Firewall - opmode for ipv6``
* :vytask:`T5306` ``(default): bgp config migration failed with v6only option configured with peer-group``
* :vytask:`T3429` ``(bug): Hyper-V integration services not working on VyOS 1.4 (sagitta/current)``


2024-01-11
==========

* :vytask:`T5896` ``(bug): Config Error on Boot with Podman and Firewall``
* :vytask:`T5532` ``(bug): After add system image the boot stuck and works again after the second reboot``
* :vytask:`T5512` ``(bug): build linux-firmware script cannot expand asterisks if firmware name is a glob string``
* :vytask:`T5379` ``(bug): show system updates doesnt seem to be working``
* :vytask:`T5275` ``(default): Add op mode commands for exporting certificates to PEM files with correct headers``
* :vytask:`T5274` ``(default): Add a deprecation warning for OpenVPN site-to-site with pre-shared secret``
* :vytask:`T5262` ``(default): Warn the user about unsaved config on reboot/shutdown attempts``
* :vytask:`T5257` ``(feature): Cannont assign netflow source ip to ip in non default VRF``
* :vytask:`T5026` ``(feature): Python3 modules crypt and spwd are deprecated``
* :vytask:`T5814` ``(bug): VyOS 1.3 to 1.4 LTS Firewall ruleset migration script breaks configuration``
* :vytask:`T4610` ``(bug): Firewall with 20K entries cannot load after reboot``
* :vytask:`T3191` ``(bug): PAM RADIUS freezing when accounting does not configured on RADIUS server``
* :vytask:`T5917` ``(feature): Restore annotations of (running)/(default boot) in select image list``
* :vytask:`T5916` ``(default): Added segment routing check for index size and SRGB size``
* :vytask:`T5913` ``(feature): Allow for Peer-Groups in ipv4-labeled-unicast SAFI``


2024-01-10
==========

* :vytask:`T5918` ``(bug): Verification problem for `set vpn ipsec interface```
* :vytask:`T5911` ``(bug): pki: service update ignored if certificate name contains a hyphen (-)``
* :vytask:`T5886` ``(feature): Add support for ACME protocol (LetsEncrypt)``
* :vytask:`T5766` ``(bug): http: rewrite conf-mode script to get_config_dict()``
* :vytask:`T5144` ``(default): Modernize dynamic dns operation``
* :vytask:`T4689` ``(feature): Support RFS(Receive Flow Steering)``
* :vytask:`T4659` ``(feature): Use vtysh to display bridge and some interface parameter information``
* :vytask:`T4646` ``(bug): USB serial output console does not work``
* :vytask:`T4577` ``(bug): WWAN commit failed which simple config``
* :vytask:`T4502` ``(feature): Consider implementing (NAT/other) flow table offload``
* :vytask:`T4446` ``(default): Unified CLI for displaying neithbors (ARP, IP, and NDP)``
* :vytask:`T4427` ``(default): Remove the vyos-utils package list from vyos-build``
* :vytask:`T4300` ``(feature): Extend list of supported interfaces for Cloud-init Network Configuration``
* :vytask:`T4250` ``(bug): Organize logrotate settings to avoid duplicates``
* :vytask:`T4236` ``(feature): Generate ovpn openvpn client configuration files``
* :vytask:`T4222` ``(feature): Support for TWAMP as round-trip metric``
* :vytask:`T3833` ``(bug): Cloud-init not finding data source in OpenStack``
* :vytask:`T5902` ``(bug): http: remove virtual-host configuration in webserver``
* :vytask:`T3499` ``(bug): Podman is not compatible with nat rules``
* :vytask:`T3430` ``(bug): Cloud-init failing with “Unable to render networking” on VyOS 1.3``
* :vytask:`T3011` ``(bug): router becomes unreachable for few minutes when vti interfaces goes down``
* :vytask:`T5791` ``(default): Update dynamic dns configuration path to be consistent with other areas of VyOS``
* :vytask:`T5708` ``(default): Additional dynamic dns improvements to align with ddclient 3.11.1 release``
* :vytask:`T5573` ``(bug): Fix ddclient cache entries``
* :vytask:`T5012` ``(feature): Control network configuration from Cloud-Init config``
* :vytask:`T3116` ``(feature): Support back-end L4 level load balancing``
* :vytask:`T5614` ``(default): Add conntrack helper matching on firewall``
* :vytask:`T4782` ``(enhancment): Allow multiple CA certificates (on e.g. EAPoL)``
* :vytask:`T2199` ``(default): Rewrite firewall in new XML/Python style``


2024-01-09
==========

* :vytask:`T5898` ``(bug): Replace partprobe with partx due to unable to install VyOS``
* :vytask:`T5838` ``(feature): Add Infiniband kernel modules``
* :vytask:`T5785` ``(bug): API output of show container image broken``
* :vytask:`T5410` ``(feature): Improve `utils.convert.convert_data()` to process all stdtypes``
* :vytask:`T5269` ``(default): OpenVPN non-TLS site-to-site mode deprecation``
* :vytask:`T5249` ``(feature): Add rollback-soft feature to rollback without a reboot``
* :vytask:`T4944` ``(default): Prevent op mode functions from returning bare literals in raw output``
* :vytask:`T4910` ``(default): Rewrite the remote access VPN op mode in the new style``
* :vytask:`T4470` ``(feature): Rewrite load-balancing wan to XML/Python``
* :vytask:`T3763` ``(bug): wireguard checks if port already binding``
* :vytask:`T3489` ``(bug): NUMA has been disabled for the past few years and no-one has noticed``
* :vytask:`T3476` ``(feature): Update availability check``
* :vytask:`T2845` ``(bug): BGP conf_mode unable to delete configuration with peer-group``
* :vytask:`T2844` ``(bug): BGP conf_mode errors disable-send-community``
* :vytask:`T2755` ``(default): Requirements for partial interface setup``
* :vytask:`T2721` ``(enhancment): Set FQ-CoDel as the default queueing mechanism for every class in Shaper``
* :vytask:`T2511` ``(feature): Migrate vyatta-op-quagga to new XML format``
* :vytask:`T2302` ``(default): Convert configuration scripts from executables to modules and use a script runner``
* :vytask:`T2281` ``(feature): DHCP and Static IPs on Same Interface``
* :vytask:`T2216` ``(default): Containerized third-party applications for VyOS``
* :vytask:`T2171` ``(feature): Unify creation and manipulation of interfaces``
* :vytask:`T1759` ``(feature): Replacing Vyatta::Interface perl``
* :vytask:`T2408` ``(enhancment): DHCP Relay upstream and downstream interfaces``
* :vytask:`T1297` ``(feature): Add GARP settings to VRRP/keepalived``


2024-01-08
==========

* :vytask:`T5888` ``(bug): Firewall upgrade fails because of icmpv6``
* :vytask:`T5844` ``(bug): HTTPS API doesn't start without configured keys even when GraphQL authentication type is set to token``
* :vytask:`T5664` ``(bug): 1.4 user has no permissions?``
* :vytask:`T5215` ``(default): Add a built-in ICMP health check for VRRP groups``
* :vytask:`T5045` ``(bug): BFD is not starting after upgrade to 1.4-rolling-202302150317``
* :vytask:`T4193` ``(default): Add support for transparent firewall``
* :vytask:`T3754` ``(default): Make config scripts more testable``
* :vytask:`T3663` ``(default): Use inotify file watching where applicable``
* :vytask:`T3480` ``(bug): Does not possible to change console baud-rate``
* :vytask:`T2897` ``(default): Remove cluster command``
* :vytask:`T5904` ``(feature): op-mode: add "show ipv6 route vrf <name> <prefix>" command``


2024-01-07
==========

* :vytask:`T5891` ``(bug): OpenVPN IPv6 config issue with 1.4-rc1``
* :vytask:`T5887` ``(feature): Upgrade Linux Kernel to 6.6.y (2023 LTS edition)``


2024-01-06
==========

* :vytask:`T3670` ``(feature): Option to disable HTTP port 80 redirect``


2024-01-05
==========

* :vytask:`T3642` ``(feature): PKI configuration``
* :vytask:`T5894` ``(feature): Extend get_config_dict() with additional parameter with_pki that defaults to False``


2024-01-04
==========

* :vytask:`T4072` ``(feature): Feature Request: Firewall on bridge interfaces``
* :vytask:`T3459` ``(default): Inform the user when unable to install outdated image``


2024-01-03
==========

* :vytask:`T5880` ``(bug): verify_source_interface should not allow dynamic interfaces like ppp, l2tp, ipoe or sstpc client interfaces``
* :vytask:`T5879` ``(bug): tunnel: sourceing from dynamic pppoe0 interface will fail on reboots``
* :vytask:`T4500` ``(bug): Missing firewall logs``


2024-01-02
==========

* :vytask:`T5885` ``(default): image-tools: relax restriction on image-name length from 32 to 64``


2024-01-01
==========

* :vytask:`T5883` ``(bug): Preserve file ownership in /config subdirs on add system image``
* :vytask:`T5474` ``(feature): Establish common file name pattern for XML conf mode commands``


2023-12-30
==========

* :vytask:`T5875` ``(bug): login: removing and re-adding a user keeps the home directory but UID will change, thus SSH keys no longer work``
* :vytask:`T5653` ``(feature): Command to display fingerprint``


2023-12-29
==========

* :vytask:`T5829` ``(bug): Can't Add IPv6 Address to Containers``
* :vytask:`T5852` ``(bug): Reboots fail with eapol WAN interface``
* :vytask:`T5869` ``(bug): vyos.template.first_host_address() does not honor RFC4291 section 2.6.1``


2023-12-28
==========

* :vytask:`T4163` ``(feature): [BMP-BGP]  Routing monitoring  feature``
* :vytask:`T5867` ``(feature): Upgrade podman to Debian Trixie version 4.7.x``
* :vytask:`T5866` ``(feature): Add op-mode command to restart IPv6 RA daemon``
* :vytask:`T5861` ``(bug): Flavor build system fails with third-party packages``
* :vytask:`T5854` ``(feature): Extend override-default script to allow embedded defaultValue settings``
* :vytask:`T5792` ``(default): Upgrade ddclient 3.11.2 release``


2023-12-25
==========

* :vytask:`T5855` ``(feature): Migrate "set service lldp snmp enable" -> `set service lldp snmp"``
* :vytask:`T5837` ``(bug): vyos.configdict.node_changed does not return keys per adding``
* :vytask:`T5856` ``(bug): SNMP service removal fails``


2023-12-24
==========

* :vytask:`T5853` ``(default): Typo interfaces-virtual-ethernet.xml.in``


2023-12-22
==========

* :vytask:`T5804` ``(bug): SNAT "any" interface error``
* :vytask:`T4760` ``(bug): VyOS does not support running multiple instances of DHCPv6 clients``


2023-12-21
==========

* :vytask:`T5778` ``(bug): The show dhcp server leases operation mode command does not work as expected``
* :vytask:`T5775` ``(default): Migrated Firewall Global State Policy ineffective on latest firewall zone config``
* :vytask:`T5637` ``(bug): Firewall default-action log``
* :vytask:`T5796` ``(bug): Openconnect - HTTPS  security headers are missing``
* :vytask:`T3580` ``(feature): Refactoring firewall ipv6 rule icmpv6``
* :vytask:`T2898` ``(feature): Support NDP proxy``
* :vytask:`T2229` ``(feature): PPPOE Default Queue type selection``


2023-12-20
==========

* :vytask:`T5823` ``(feature): Protocol BGP add default values for config dictionary``
* :vytask:`T5798` ``(enhancment): reverse-proxy load-balancing service should support multiple certificates for frontend``


2023-12-19
==========

* :vytask:`T5828` ``(default): Fix GRUB installation on arm64``


2023-12-18
==========

* :vytask:`T5751` ``(feature): Adjust new image tools for non-interactive use``
* :vytask:`T5831` ``(feature): show system image should reverse order by addition date``
* :vytask:`T5825` ``(bug): image-tools: restore authentication on 'add system image'``
* :vytask:`T5821` ``(bug): image-tools: restore vrf-aware 'add system image'``
* :vytask:`T5819` ``(bug): Don't echo password on install image``
* :vytask:`T5806` ``(bug): Clear old raid data on new install image``
* :vytask:`T5789` ``(bug): image-tools should copy ssh host keys on image update``
* :vytask:`T5758` ``(default): Restore scanning configs when live installing``


2023-12-15
==========

* :vytask:`T5824` ``(bug): busybox cannot connect some websites from initramfs``
* :vytask:`T5803` ``(default): git/github: Adjust configuration for safe and baseline defaults``


2023-12-14
==========

* :vytask:`T5773` ``(bug): Unable to load config via HTTP``
* :vytask:`T5816` ``(bug): BGP Large Community List Validation Broken``
* :vytask:`T5812` ``(bug): rollback check max revision number does not work``
* :vytask:`T5749` ``(feature): Show MAC address VRF and MTU by default for "show interfaces"``
* :vytask:`T5774` ``(bug): commit-archive to FTP server broken after update (VyOS 1.5-rolling)``
* :vytask:`T5826` ``(default): Add dmicode as an explicit dependency``
* :vytask:`T5793` ``(default): mdns-repeater: Cleanup avahi-daemon configuration in /etc``


2023-12-13
==========

* :vytask:`T591` ``(feature): Support SRv6``


2023-12-12
==========

* :vytask:`T4704` ``(feature): Allow to set metric  (MED) to rtt with rtt,+rtt or -rtt``
* :vytask:`T5815` ``(enhancment): Add load_config module``
* :vytask:`T5413` ``(default): Deny the opportunity to use one public/private key pair on both wireguard peers.``


2023-12-11
==========

* :vytask:`T5741` ``(bug): WAN Load Balancing failover route tables aren't created``


2023-12-10
==========

* :vytask:`T5658` ``(default): Add VRF support for mtr``


2023-12-09
==========

* :vytask:`T5808` ``(bug): op-mode: ipv6 ospfv3 graceful-restart description contains incorrect info``
* :vytask:`T5802` ``(bug): ping (ip or hostname) interface <tab> produces error``
* :vytask:`T5747` ``(feature): op-mode add MAC VRF and MTU for show interfaces summary``
* :vytask:`T3983` ``(bug): show pki certificate Doesnt show x509 certificates``


2023-12-08
==========

* :vytask:`T5782` ``(enhancment): Use a single config mode script for https and http-api``
* :vytask:`T5768` ``(enhancment): Remove auxiliary http-api.conf for simplification of http-api config mode script``
* :vytask:`T5809` ``(default): Enable GRUB support for gzip compressed kernels``


2023-12-04
==========

* :vytask:`T5769` ``(bug): VTI tunnels lose their v6 Link Local addresses when set down/up``


2023-12-03
==========

* :vytask:`T5753` ``(feature): Add VXLAN vnifilter support``
* :vytask:`T5759` ``(feature): Change VXLAN default MTU to 1500 bytes``


2023-11-30
==========

* :vytask:`T4601` ``(bug): dhcp : relay agent IP address issue.``


2023-11-28
==========

* :vytask:`T4276` ``(bug): IPsec peers dh-group negotiation issue with pfs enabled and multiple proposals configured with IKEv1``


2023-11-27
==========

* :vytask:`T5763` ``(bug): Fix imprecise check for remote file name in vyos-load-config.py``
* :vytask:`T5783` ``(feature): frr: smoketests must notice any daemon crash``


2023-11-26
==========

* :vytask:`T5760` ``(feature): DHCP client custom dhcp-options``
* :vytask:`T2405` ``(feature): archive to GIT or other platform``


2023-11-25
==========

* :vytask:`T5655` ``(bug): commit-archive: Ctrl+C should not eror out with stack trace, signal should be cought``
* :vytask:`T4946` ``(default): Rewrite "add system image" in the new op-mode``
* :vytask:`T4454` ``(default): `install-image` should check free storage``


2023-11-24
==========

* :vytask:`T5776` ``(feature): Enable VFIO support``
* :vytask:`T5402` ``(bug): VRRP router with rfc3768-compatibility sends multiple ARP replies``
* :vytask:`T3895` ``(default): VYOS firewall rules do not adhere to time schedule unless placed in UTC mode.``


2023-11-23
==========

* :vytask:`T4891` ``(bug): BFD flapping loop``
* :vytask:`T4867` ``(bug): "show bgp neighbors ... advertised-routes" and some other commands fail for IPv4 neighbors``


2023-11-22
==========

* :vytask:`T5767` ``(feature): Add reboot and poweroff the system via API``
* :vytask:`T5729` ``(bug): Firewall, nat and policy route - Switch to valueless``
* :vytask:`T5681` ``(feature): Interface match - Simplified and unified cli``
* :vytask:`T4877` ``(bug): Need verification in using import vrf and import vpn, export vpn commands``
* :vytask:`T4021` ``(bug): Long commit time on bridge interface with 1-4094 allowed VLAN tags``
* :vytask:`T5338` ``(feature): Add 'mpls bgp forwarding' feature``
* :vytask:`T3818` ``(bug): BGP export route-map only works after bgpd restart``
* :vytask:`T5590` ``(default): Firewall "log enable" logs every packet``
* :vytask:`T5426` ``(default): Add exceptions in vici functions calls``


2023-11-21
==========

* :vytask:`T5762` ``(bug): http: api: smoketests fail as they can not establish IPv6 connection to uvicorn backend server``


2023-11-20
==========

* :vytask:`T2816` ``(default): Rewrite IPsec scripts with the new XML/Python approach``


2023-11-18
==========

* :vytask:`T1354` ``(feature): Add support for VLAN-Aware bridges``


2023-11-16
==========

* :vytask:`T5726` ``(bug): HTTPS API image cannot be updated``
* :vytask:`T5738` ``(feature): Extend XML building blocks``
* :vytask:`T5736` ``(feature): igmp: migrate "protocols igmp" to "protocols pim"``
* :vytask:`T5733` ``(feature): pim(6): rewrite FRR PIM daemon configuration to get_config_dict() and add missing IGMP features``
* :vytask:`T5689` ``(default): FRR 9.0.1 in VyOS current segfaults on show rpki prefix $prefix``
* :vytask:`T5595` ``(feature): Multicast - PIM  bfd feature enable``
* :vytask:`T3638` ``(bug): Passwords With Dollar Sign Set Incorrectly``


2023-11-15
==========

* :vytask:`T5695` ``(feature): Build FRR with LUA scripts --enable-scripting option``
* :vytask:`T5665` ``(bug): radius user not working``
* :vytask:`T5728` ``(bug): Improve compatibility between OpenVPN on VyOS 1.5 and OpenVPN Connect Client``
* :vytask:`T5732` ``(bug): generate firewall rule-resequence drops geoip country-code from output``
* :vytask:`T5661` ``(enhancment): Add show show ssh dynamic-protection attacker and show log ssh dynamic-protection``
* :vytask:`T1276` ``(bug): dhcp relay + VLAN fails``


2023-11-13
==========

* :vytask:`T5698` ``(feature): EVPN ESI Multihoming``
* :vytask:`T5563` ``(bug): container: Container environment variable cannot be set``
* :vytask:`T5706` ``(bug): Systemd-udevd high CPU utilization for multiple dynamic ppp/l2tp/ipoe interfaces``


2023-11-10
==========

* :vytask:`T5727` ``(bug): validator: Use native URL validator instead of regex-based validator``


2023-11-08
==========

* :vytask:`T5720` ``(bug): PPPoE-server adding new interface does not work``
* :vytask:`T5716` ``(bug): PPPoE-server shaper template bug down-limiter option does not rely on fwmark``
* :vytask:`T5702` ``(feature): Add ability to set include_ifmib_iface_prefix and ifmib_max_num_ifaces  for SNMP``
* :vytask:`T5648` ``(bug): ldpd neighbour template errors``
* :vytask:`T5564` ``(bug): Both show firewall group and show firewall summary fails``
* :vytask:`T5559` ``(feature): Selective proxy-arp/proxy-ndp when doing SNAT/DNAT``
* :vytask:`T5541` ``(bug): Zone-Based Firewalling in VyOS Sagitta 1.4``
* :vytask:`T5513` ``(bug): Anomalies in show firewall command after refactoring``
* :vytask:`T4864` ``(bug): `show firewall` command errors``


2023-11-07
==========

* :vytask:`T5586` ``(feature): Disable by default SNMP for Keepalived VRRP``


2023-11-06
==========

* :vytask:`T5705` ``(bug): rsyslog - Not working when using facility=all``
* :vytask:`T5704` ``(feature): PPPoE-server add max-starting option``
* :vytask:`T5707` ``(bug): Wireguard peer public key update leaves redundant peers and breaks connectivity``
* :vytask:`T4269` ``(feature): node.def generator should automatically add default values``


2023-11-05
==========

* :vytask:`T4020` ``(feature): Add ability to control FRR daemons options``


2023-11-03
==========

* :vytask:`T5700` ``(bug): Monitoring telegraf deprecated plugins inputs outputs``
* :vytask:`T5018` ``(bug): Redirect to IFB removed after change in qos policy``


2023-11-02
==========

* :vytask:`T5701` ``(feature): Update telegraf package``


2023-11-01
==========

* :vytask:`T5690` ``(bug): Change to definition of environment variable 'vyos_rootfs_dir' is incorrect``


2023-10-31
==========

* :vytask:`T5699` ``(feature): vxlan: migrate "external" CLI know to "parameters external"``
* :vytask:`T5668` ``(feature): Disable VXLAN bridge learning and enable neigh_suppress when using EVPN``


2023-10-27
==========

* :vytask:`T5652` ``(bug): Config migrate to image upgrade does not properly generate home directory``
* :vytask:`T4057` ``(bug): Commit time for deleting sflow configuration ~1.5 min``


2023-10-26
==========

* :vytask:`T5683` ``(bug): reverse-proxy pki filenames mismatch``
* :vytask:`T4903` ``(bug): conntrack ignore does not suppotr IPv6 addresses``
* :vytask:`T4309` ``(feature): Support network/address-groups and  ipv6-network/ipv6-address-groups in conntrack ignore``
* :vytask:`T5606` ``(feature): IPSec VPN: Allow multiple CAs certificates``
* :vytask:`T5650` ``(default): Progressbars suffer from staircasing effect``
* :vytask:`T5568` ``(default): Install image from live ISO always defaults boot to KVM entry``
* :vytask:`T3509` ``(default): No BCP38 for IPv6 on VyOS``


2023-10-23
==========

* :vytask:`T5299` ``(bug): QoS shaper ceiling does not work``
* :vytask:`T5667` ``(feature): BGP label-unicast - enable ecmp``
* :vytask:`T5337` ``(bug): MPLS/BGP: Route leak does not happen from the VPNv4 table to specific vrf``


2023-10-22
==========

* :vytask:`T5254` ``(bug): Modification of any interface setting sets MTU back to default when MTU has been inherited from a bond``
* :vytask:`T5671` ``(feature): vxlan: change port to IANA assigned default port``


2023-10-21
==========

* :vytask:`T5670` ``(bug): bridge: missing member interface validator``
* :vytask:`T5617` ``(feature): Add an option to exclude single values to the numeric validator``
* :vytask:`T5414` ``(bug): dhcp-server does not allow valid bootfile-names``
* :vytask:`T5261` ``(feature): Add AWS gateway load-balanceing tunnel handler (gwlbtun)``
* :vytask:`T5260` ``(bug): Python3 module crypt is deprecated``
* :vytask:`T5191` ``(default): Replace underscores with hyphens in command-line options generated by vyos.opmode``
* :vytask:`T5172` ``(default): Set Python3 version dependency for vyos-1x to 3.10``
* :vytask:`T4956` ``(default): 'show hardware cpu' issue on arm64``
* :vytask:`T4837` ``(default): Expose "show ip route summary" in the op mode API``
* :vytask:`T4770` ``(feature): Rewrite OpenVPN op-mode to vyos.opmode format``
* :vytask:`T4657` ``(bug): op-mode scripts with type hints in `return` do not work``
* :vytask:`T4604` ``(bug): bgpd eats huge amount of memory (about 500Megs a day)``
* :vytask:`T4432` ``(default): Display load average normalized according to the number of CPU cores``
* :vytask:`T4416` ``(default): Convert 'traceroute' operation to the new syntax and expand available options using python``
* :vytask:`T4402` ``(bug): OpenVPN client-ip-pool option is broken``
* :vytask:`T3433` ``(default): A review of the use of racist language in VyOS``
* :vytask:`T2719` ``(feature): Standardized op mode script structure``


2023-10-20
==========

* :vytask:`T5233` ``(bug): Op-mode flow-accounting netflow with disable-imt errors``
* :vytask:`T5232` ``(bug): Flow-accounting uacctd.service cannot restart correctly``


2023-10-19
==========

* :vytask:`T4913` ``(default): Rewrite the wireless op mode in the new style``


2023-10-18
==========

* :vytask:`T5642` ``(bug): op cmd: generate tech-support archive: does not work``
* :vytask:`T5521` ``(bug): Home owner directory changed to vyos for the user after reboot``


2023-10-17
==========

* :vytask:`T5662` ``(bug): Fix indexing error in configdep script organization``
* :vytask:`T5235` ``(bug): SSH keys with special characters cannot be applied via Cloud-init``


2023-10-16
==========

* :vytask:`T5165` ``(feature): Policy local-route ability set protocol and port``


2023-10-14
==========

* :vytask:`T5629` ``(bug): Policy local-route bug after migration to destination node address``


2023-10-13
==========

* :vytask:`T5227` ``(feature): mDNS reflector should allow additional domains to browse and allow filtering services``
* :vytask:`T5166` ``(feature): Remove local minisign package from build repo for 1.4``
* :vytask:`T5118` ``(bug): Cleanup vestigial ntp completion script``
* :vytask:`T5115` ``(default): Support custom port for name servers for forwarding zones``
* :vytask:`T5113` ``(default): PDNS: Support custom port for DNS forwarders``
* :vytask:`T5112` ``(feature): Enable support for Network Time Security (NTS) for chrony``
* :vytask:`T5143` ``(enhancment): Apply constraint on powerdns forward-zones configuration``


2023-10-12
==========

* :vytask:`T5649` ``(bug): vyos-1x should generate XML cache after building command templates for less cryptic error on typo``


2023-10-10
==========

* :vytask:`T5489` ``(feature): Change to BBR as TCP congestion control, or at least make it an config option``
* :vytask:`T5479` ``(bug): Helper leftovers found in nftables (firewall) even with all helpers disabled``
* :vytask:`T5436` ``(bug): vyos-preconfig-bootup.script is missing``
* :vytask:`T5014` ``(feature): Destination NAT - Add Load Balancing capabilities``


2023-10-08
==========

* :vytask:`T5630` ``(feature): pppoe: allow to specify MRU in addition to already configurable MTU``


2023-10-06
==========

* :vytask:`T5096` ``(feature): Change 'accept' firewall rule action from 'return' to 'accept'``
* :vytask:`T5576` ``(feature): Add bgp remove-private-as all option``
* :vytask:`T3506` ``(default): Migrate loadkey command to op-mode``


2023-10-05
==========

* :vytask:`T4320` ``(default): Remove legacy version files in vyatta-cfg-system/cfg-version``


2023-10-04
==========

* :vytask:`T5632` ``(feature): Add jq package to parse JSON files``
* :vytask:`T3655` ``(bug): NAT  Problem with VRF``
* :vytask:`T5585` ``(bug): Fix file access mode for dynamic dns configuration``


2023-10-03
==========

* :vytask:`T5618` ``(bug): Flow-accounting crushes when IMT is enabled``
* :vytask:`T5561` ``(feature): NAT - Inbound or outbound interface should not be mandatory``
* :vytask:`T5553` ``(feature): Firewall - Add action continue``
* :vytask:`T5250` ``(bug): Firewall - show firewall group``
* :vytask:`T4383` ``(bug): Flow Accounting returns permission error and fails to start``
* :vytask:`T5626` ``(feature): Only select required Kernel CGROUP controllers``
* :vytask:`T5628` ``(feature): op-mode: login: DeprecationWarning: 'spwd'``


2023-10-01
==========

* :vytask:`T936` ``(feature): Reimplementation of tech-support diagnostic file generation``


2023-09-30
==========

* :vytask:`T5048` ``(bug): QoS doesn't work correctly root task``
* :vytask:`T4989` ``(bug): QoS Policy Limiter - classes for marked traffic do not work``


2023-09-28
==========

* :vytask:`T5596` ``(feature): bgp: add new features from FRR 9``
* :vytask:`T5412` ``(feature): Add support for extending config-mode dependencies in supplemental package``


2023-09-26
==========

* :vytask:`T5480` ``(bug): Ability to disable SNMP for VRRP keepalived service``


2023-09-25
==========

* :vytask:`T5533` ``(bug): Keepalived VRRP IPv6 group enters in FAULT state``


2023-09-24
==========

* :vytask:`T5511` ``(feature): Cleanup of unused directories (and files) in order to shrink image-size``


2023-09-23
==========

* :vytask:`T5518` ``(default): Add MLD protocol support``


2023-09-22
==========

* :vytask:`T5602` ``(feature): For reverse-proxy type of load-balancing feature, support "backup" option in backends configuration``
* :vytask:`T5609` ``(enhancment): Add util to get drive device name from id``
* :vytask:`T5608` ``(enhancment): Rewrite add/delete raid member to Python and remove from vyatta-op``
* :vytask:`T5607` ``(bug): Adjust RAID smoketest for non-deterministic SCSI device probing``


2023-09-20
==========

* :vytask:`T5588` ``(bug): Add kernel conntrack_bridge module``
* :vytask:`T5271` ``(default): Add support for peer-fingerprint to OpenVPN``
* :vytask:`T5241` ``(feature): Support veth interfaces to working with netns``
* :vytask:`T5238` ``(default): interface virtual-etherne - error when it doesn't use a peer``
* :vytask:`T5592` ``(feature): salt: upgrade minion to 3005.2``


2023-09-19
==========

* :vytask:`T5597` ``(feature): isis: add new features from FRR 9.``
* :vytask:`T4284` ``(feature): QoS: rewrite to XML and Python``


2023-09-18
==========

* :vytask:`T5419` ``(feature): Software/Hardware fastpath with nftables flowtable``


2023-09-15
==========

* :vytask:`T5581` ``(feature): Add "show ip nht" op-mode command (IPv4 nexthop tracking table)``


2023-09-11
==========

* :vytask:`T5567` ``(bug): vyos-1x: webproxy: maximum-object-size allowed ranges not in sync with Equuleus``
* :vytask:`T5551` ``(bug): Missing check for boot_configuration_complete raises error in vyos-save-config.py``
* :vytask:`T5353` ``(bug): config-mgmt: normalize archive updates and commit log entries``
* :vytask:`T3424` ``(default): PPPoE IA-PD doesn't work in VRF``
* :vytask:`T2773` ``(feature): EIGRP support for VRF``


2023-09-10
==========

* :vytask:`T5565` ``(bug): Builds as vyos-999-timestamp instead of vyos-1.4-rolling-timestamp``
* :vytask:`T5555` ``(bug): Fix timezone migrator (system 13-to-14)``
* :vytask:`T5529` ``(bug): Missing symbolic link in linux-firmware package.``


2023-09-09
==========

* :vytask:`T5540` ``(bug): vyos-1x: Wrong VHT configuration for WiFi 802.11ac``
* :vytask:`T5423` ``(bug): ipsec: no output for op-cmd "show vpn ike secrets"``
* :vytask:`T3700` ``(feature): Support VLAN tunnel mapping of VLAN aware bridges``


2023-09-08
==========

* :vytask:`T5502` ``(bug): Firewall - wrong parser for inbound and/or outbound interface``
* :vytask:`T5460` ``(feature): Firewall - remove config-trap``
* :vytask:`T5450` ``(feature): Firewall interface group - Allow inverted matcher``
* :vytask:`T4426` ``(default): Add arpwatch to the image``
* :vytask:`T4356` ``(bug): DHCP v6 client only supports single interface configuration``


2023-09-07
==========

* :vytask:`T5510` ``(feature): Shrink imagesize and improve read performance by changing mksquashfs syntax``


2023-09-06
==========

* :vytask:`T5542` ``(bug): ipoe-server: external-dhcp(dhcp-relay) not woking / not implemented``
* :vytask:`T5548` ``(bug): HAProxy renders timeouts incorrectly``
* :vytask:`T5544` ``(feature): Allow CAP_SYS_MODULE to be set on containers``


2023-09-05
==========

* :vytask:`T5524` ``(feature): Add config directory to liveCD``
* :vytask:`T5519` ``(bug): Function `call` sometimes hangs``
* :vytask:`T5508` ``(bug): Configuration Migration Fails to New Netfilter Firewall Syntax``
* :vytask:`T5495` ``(feature): Enable snmp module also for frr/ldpd``
* :vytask:`T2958` ``(bug): DHCP server doesn't work from a live CD``
* :vytask:`T5428` ``(bug): dhcp: client renewal fails when running inside VRF``


2023-09-04
==========

* :vytask:`T5536` ``(bug): show dhcp client leases caues No module named 'vyos.validate'``
* :vytask:`T5506` ``(bug): Container bridge interfaces do not have a link-local address``


2023-09-03
==========

* :vytask:`T5538` ``(bug): Change order within variable lb_config_tmpl to fit order of manpage and fix some typos``
* :vytask:`T4612` ``(feature): Support arbitrary netmasks in firewall rules``


2023-08-31
==========

* :vytask:`T5190` ``(feature): Cloud-Init cannot fetch Meta-data on machines where the main Ethernet interface is not eth0``
* :vytask:`T4895` ``(bug): Tag nodes are overwritten when configured by Cloud-Init from User-Data``
* :vytask:`T4776` ``(bug): NVME storage is not detected properly during installation``
* :vytask:`T5531` ``(feature): Containers add label option``
* :vytask:`T5525` ``(default): Change dev.packages.vyos.net repo to rolling-packages.vyos.net vyos-build:current uses``


2023-08-30
==========

* :vytask:`T4933` ``(default): Malformed lines cause vyos.util.colon_separated_to_dict fail with a nondescript error``
* :vytask:`T4790` ``(bug): RADIUS login does not work if sum of timeouts more than 50s``
* :vytask:`T4113` ``(bug): Incorrect GRUB configuration parsing``
* :vytask:`T5520` ``(bug): Likely source of corruption on system update exposed by change in coreutils for Bookworm``
* :vytask:`T4151` ``(feature): IPV6 local PBR Support``
* :vytask:`T4485` ``(default): OpenVPN: Allow multiple CAs certificates``


2023-08-29
==========

* :vytask:`T3940` ``(bug): DHCP client does not remove IP address when stopped by the 02-vyos-stopdhclient hook``
* :vytask:`T3713` ``(default): Create a meta-package for user utilities``
* :vytask:`T3339` ``(bug): Cloud-Init domain search setting not applied``
* :vytask:`T3577` ``(bug): Generating vpn x509 key pair fails with command not found``


2023-08-28
==========

* :vytask:`T4745` ``(bug): CLI TAB issue with values with '-' at the beginning in conf mode``
* :vytask:`T5472` ``(bug): NAT redirect should not require port``


2023-08-27
==========

* :vytask:`T4759` ``(bug): domain-group on policy route not working``
* :vytask:`T1097` ``(feature): Make firewall groups work everywhere that's appropropriate``


2023-08-26
==========

* :vytask:`T5039` ``(bug): Can't add new local user``
* :vytask:`T5023` ``(bug): PKI commit fails to update dependents``
* :vytask:`T4512` ``(feature): enable-default-log on zone-policy``
* :vytask:`T5003` ``(default): Upgrade base system to Debian 12 "Bookworm"``


2023-08-25
==========

* :vytask:`T5468` ``(feature): Remove unused manpages to free up space``
* :vytask:`T5463` ``(feature): Containers allow publish  IPv6  address port``
* :vytask:`T4412` ``(bug): commit archive: reboot not working with sftp``
* :vytask:`T3702` ``(feature): Policy: Allow routing by fwmark``
* :vytask:`T3536` ``(default): Unable to list all available routes``


2023-08-24
==========

* :vytask:`T5448` ``(feature): Add service zabbix-agent``
* :vytask:`T5006` ``(bug): Http api segfault with concurrent requests``
* :vytask:`T5505` ``(feature): system: zebra route-map is not removed from FRR``
* :vytask:`T5305` ``(bug): REST API configure operation should not be defined as async``
* :vytask:`T4292` ``(feature): Rewrite vyatta-save-config.pl to Python``


2023-08-23
==========

* :vytask:`T5478` ``(bug): Cannot configure resolver-cache options for firewall``
* :vytask:`T5466` ``(feature): L3VPN - label allocation mode``
* :vytask:`T5453` ``(bug): Fix nat66 - broken after load-balance was introduced in nat``
* :vytask:`T5446` ``(bug): bgp: validity check for bestpath med option``
* :vytask:`T5500` ``(feature): Minor fixes to configtree render``
* :vytask:`T5469` ``(default): Incorrect dependency set in the openvpn-dco package when building VyOS for arm64``
* :vytask:`T5387` ``(feature): dhcp6c: add a no release option``
* :vytask:`T5491` ``(feature): Hostapd - AP-Mode - allow white-/blacklisting of Clients``
* :vytask:`T4889` ``(default): Add nftables NAT REDIRECT [to localhost] to CLI``


2023-08-22
==========

* :vytask:`T5407` ``(bug): Static routes pointed to container networks fail to persist after reboot``


2023-08-20
==========

* :vytask:`T5470` ``(bug): wlan: can not disable interface if SSID is not configured``


2023-08-18
==========

* :vytask:`T5488` ``(bug): System conntrack ignore does not take any effect``


2023-08-17
==========

* :vytask:`T4202` ``(bug): NFT: Zone policies fail to apply when "l2tp+" is in the interface list``
* :vytask:`T5409` ``(feature): Add 'set interfaces wireguard wgX threaded'``
* :vytask:`T5476` ``(feature): netplug: replace Perl helper scripts with a Python equivalent``
* :vytask:`T5223` ``(bug): tunnel key doesn't clear``
* :vytask:`T5490` ``(feature): login: add missing regex for home direcotry and radius server key``


2023-08-16
==========

* :vytask:`T5483` ``(bug): Residual dhcp-server test file causing zabbix-agent smoketest to fail``


2023-08-15
==========

* :vytask:`T5293` ``(feature): Support for Floating Rules (Global Firewall-Rules that are automatically applied before all other Zone Rules)``
* :vytask:`T5273` ``(default): Add op mode commands for displaying certificate details and fingerprints``
* :vytask:`T5270` ``(default): Make OpenVPN `tls dh-params` optional``


2023-08-14
==========

* :vytask:`T5477` ``(bug): op-mode pki.py should use Config for defaults``
* :vytask:`T5461` ``(feature): Improve rootfs directory variable``
* :vytask:`T5457` ``(feature): Add environmental variable pointing to current rootfs directory``
* :vytask:`T5440` ``(bug): Restore pre/postconfig scripts if user deleted them``


2023-08-12
==========

* :vytask:`T5467` ``(bug): ospf(v3): removing an interface from the OSPF process does not clear FRR configuration``


2023-08-11
==========

* :vytask:`T5465` ``(feature): adjust-mss: config migration fails if applied to a VLAN or Q-in-Q interface``
* :vytask:`T2665` ``(bug): vyos.xml.defaults for tag nodes``
* :vytask:`T5434` ``(enhancment): Replace remaining calls of vyos.xml library``
* :vytask:`T5319` ``(enhancment): Remove remaining workarounds for incorrect defaults``
* :vytask:`T5464` ``(feature): ipv6: add support for per-interface dad (duplicate address detection) setting``


2023-08-10
==========

* :vytask:`T5416` ``(bug): Ignoring "ipsec match-none" for firewall``
* :vytask:`T5329` ``(bug): Wireguard interface as GRE tunnel source causes configuration error on boot``


2023-08-09
==========

* :vytask:`T5452` ``(bug): Uncaught error in generate_cache during vyos-1x build``
* :vytask:`T5443` ``(enhancment): Add merge_defaults as Config method``
* :vytask:`T5435` ``(enhancment): Expose utility function for default values at path``


2023-08-07
==========

* :vytask:`T5406` ``(bug): "update webproxy blacklists" fails when vrf is being configured``
* :vytask:`T5302` ``(bug): QoS class with multiple matches generates one filter rule but expects several rules``
* :vytask:`T5266` ``(bug): QoS- HTB error when match with  a dscp parameter for queue-type 'priority'``
* :vytask:`T5071` ``(bug): QOS-Rewrite: DSCP match missing``


2023-08-06
==========

* :vytask:`T5420` ``(feature): nftables - upgrade to latest 1.0.8``
* :vytask:`T5445` ``(feature): dyndns: add possibility to specify update interval (timeout)``


2023-08-05
==========

* :vytask:`T5291` ``(bug): vyatta-cfg-cmd-wrapper missing ${vyos_libexec_dir} variable``
* :vytask:`T5290` ``(bug): Failing commits for SR-IOV interfaces using ixgbevf driver due to change speed/duplex settings``
* :vytask:`T5439` ``(bug): Upgrade to FRR version 9.0 added new daemons which must be adjusted``


2023-08-04
==========

* :vytask:`T5427` ``(bug): Change migration script len arguments checking``


2023-08-03
==========

* :vytask:`T5301` ``(bug): NTP: chrony only allows one bind address``
* :vytask:`T5154` ``(bug): Chrony - multiple listen addresses``


2023-08-02
==========

* :vytask:`T5374` ``(feature): Ability to set 24-hour time format``
* :vytask:`T5350` ``(bug): Confusing warning message when committing VRRP config``
* :vytask:`T5430` ``(bug): bridge: vxlan interfaces are not listed as bridgable in completion helpers``
* :vytask:`T5429` ``(bug): vxlan: source-interface is not honored and throws config error``
* :vytask:`T5415` ``(feature): Upgrade FRR to version 9.0``
* :vytask:`T5422` ``(feature): Support LXD Agent``


2023-08-01
==========

* :vytask:`T5399` ``(bug): "show ntp" fails when vrf is being configured``
* :vytask:`T5346` ``(bug): MPLS sysctl not persistent for L2TP interfaces``
* :vytask:`T5343` ``(feature): BGP peer group VPNv4 & VPNv6 Address Family Support``
* :vytask:`T5339` ``(feature): Geneve interface - option to use IPv4 as inner protocol``
* :vytask:`T5335` ``(bug): ISIS: error when loading config from file``


2023-07-31
==========

* :vytask:`T5421` ``(feature): Add arg to completion helper 'list_interfaces' to filter out vlan subinterfaces``


2023-07-29
==========

* :vytask:`T5403` ``(feature): Add support for extending xml cache``


2023-07-28
==========

* :vytask:`T4602` ``(bug): DHCP `ping-check` enabled by default``
* :vytask:`T5411` ``(feature): Remove old background monitoring implementation``
* :vytask:`T5317` ``(enhancment): configtree: remove mutable references``
* :vytask:`T5316` ``(enhancment): configtree: use a single pass of the diff algorithm``


2023-07-27
==========

* :vytask:`T5368` ``(feature): FastNetmon service ids ddos-protection add support sflow mode``


2023-07-26
==========

* :vytask:`T5398` ``(bug): FRR mangles container network interface names``
* :vytask:`T5365` ``(bug): Container systemd units require authentication``
* :vytask:`T4974` ``(feature): OpenVPN- Data Channel Offload(DCO)``


2023-07-25
==========

* :vytask:`T5377` ``(feature): ospf: add graceful restart FRR feature (RFC 3623)``


2023-07-21
==========

* :vytask:`T5373` ``(bug): LLDP seems to be running even if its disabled on all interfaces``
* :vytask:`T5328` ``(default): bgp: Incorrect warning showed for address-family configured with neighbor as interface``
* :vytask:`T5363` ``(bug): Bash history file does not exists after reboot and ony other file in home directory``
* :vytask:`T5385` ``(bug): reference_tree: catch parse error on non-transcluded files``
* :vytask:`T5361` ``(bug): "monitor log" behaves like "show log"``


2023-07-20
==========

* :vytask:`T5362` ``(bug): `set high-availability vrrp global-parameters version 3` seems to have no effect``
* :vytask:`T5355` ``(bug): IPSec: OP cmd : "show vpn ike sa" does not show output``
* :vytask:`T5330` ``(enhancment): Keep track of source of config dict value when merging defaults``
* :vytask:`T4497` ``(feature): ping cannot force ipv4 or ipv6``
* :vytask:`T4288` ``(bug): IPsec tunnel will break when ESP timeout``


2023-07-19
==========

* :vytask:`T5340` ``(bug): SNMP and VRF``
* :vytask:`T5059` ``(feature): add 'disable' option to DHCP relay config``


2023-07-17
==========

* :vytask:`T2051` ``(bug): Throughput anomalies``


2023-07-16
==========

* :vytask:`T141` ``(feature): TACACS+ Support``


2023-07-15
==========

* :vytask:`T5341` ``(feature): Improve CLI for high-availability virtual-server to work with multiple ports``


2023-07-14
==========

* :vytask:`T5358` ``(bug): 99-ipsec-dhclient-hook prevents DHCP stateless routes from being installed in VRF table``
* :vytask:`T4376` ``(bug): DNAT with multiwan and policy routing, incoming connections only work on primary interface``
* :vytask:`T305` ``(default): loadbalancing does not work with one pppoe connection and another connection of either dhcp or static``


2023-07-13
==========

* :vytask:`T4713` ``(bug): vyos@vyos:~$ show nat destination rules | doesn't work``
* :vytask:`T2315` ``(feature): Ability to have right address-family for BGP peers.``


2023-07-12
==========

* :vytask:`T5347` ``(bug): Compare commit revision bug``
* :vytask:`T5161` ``(default): BFD Static Route Monitoring``
* :vytask:`T5105` ``(bug): DHCP Server - Wrong error message``
* :vytask:`T4927` ``(bug): Need to change restart to reload-or-restart in Webproxy module``
* :vytask:`T3835` ``(bug): vyos router 1.2.7 snmp Dos bug``
* :vytask:`T5352` ``(default): Fix missing dependency for netavark``
* :vytask:`T4959` ``(feature): Add container registry authentication config for containers``


2023-07-11
==========

* :vytask:`T5314` ``(bug): QOS Default classes are not configured with correct qdisc``
* :vytask:`T4862` ``(bug): webproxy domain-block does not work``
* :vytask:`T4844` ``(bug): Incorrect permissions of the safeguard DB directory``
* :vytask:`T4815` ``(bug): Fix various name server config issues``
* :vytask:`T4810` ``(bug): Op-mode show/monitor log pppoe interface does not show any logs``
* :vytask:`T4758` ``(feature): Rewrite show dhcp server to vyos.opmode format``
* :vytask:`T4262` ``(bug): install image doesn't respect chosen root partition size``
* :vytask:`T3810` ``(bug): webproxy squidguard rules don't work properly after rewriting to python.``
* :vytask:`T1928` ``(bug): Is the 'Welcome to VyOS' message when using SSH an information leak?``
* :vytask:`T1877` ``(default): Feature Request: Allow NAT to use network and address groups``
* :vytask:`T4813` ``(feature): L3VPN over GRE Tunnels``
* :vytask:`T4943` ``(bug): Radius SSH login displays "permission denied" on 1.4 rolling release``
* :vytask:`T4542` ``(default): route-map: "match prefix-len" incorrect behavior``
* :vytask:`T4392` ``(default): Multiline login banner text reports error on commit``


2023-07-10
==========

* :vytask:`T5345` ``(bug): Error incorrectly raised in revised multi_to_list when tag node value name == tag node name``
* :vytask:`T3578` ``(bug): Prefix-List(6) update cause empty prefix-list(6)``
* :vytask:`T762` ``(feature): Include rulseset in firewall``


2023-07-06
==========

* :vytask:`T5336` ``(feature): Add Swedish keyboard-layout``


2023-07-04
==========

* :vytask:`T5333` ``(bug): Policy base routing PBR generetes incorrect rules with name POSTROUTING``
* :vytask:`T5081` ``(feature): ISIS and OSPF syncronization with IGP-LDP sync``


2023-07-03
==========

* :vytask:`T5295` ``(bug): QoS shaper incorrect rate limit the traffic``
* :vytask:`T5334` ``(feature): ospf: add support for External Route Summarisation Type-5 and Type-7``


2023-07-02
==========

* :vytask:`T5332` ``(bug): Show policy route not working when no interface is configured``


2023-07-01
==========

* :vytask:`T5304` ``(feature): Containers add bind-propagation option rshared``
* :vytask:`T5296` ``(bug): QoS class cannot calculate correctly the default bandwidth auto``
* :vytask:`T5210` ``(bug): IPSec cosmetic bug for Warning vti inrerface``
* :vytask:`T5277` ``(bug): Dhcpv6-relay does not start on boot``


2023-06-30
==========

* :vytask:`T5315` ``(feature): vrrp: add support for version 3``
* :vytask:`T5283` ``(bug): IPoE server assigns network address``
* :vytask:`T5313` ``(bug): UDP broadcast relay - missing verify() that relay interfaces have an IP address assigned``


2023-06-29
==========

* :vytask:`T5320` ``(enhancment): Add warning when entering config mode after a boot configuration error``


2023-06-28
==========

* :vytask:`T1237` ``(feature): Static Route Path Monitoring, failover``


2023-06-26
==========

* :vytask:`T5159` ``(bug): DHCPv6-server leases op-command shows warning message even if configured``


2023-06-25
==========

* :vytask:`T5240` ``(bug): Service router-advert failed to start radvd with more then 3 name-servers``
* :vytask:`T5312` ``(bug): Nonescaped special character in help text``


2023-06-24
==========

* :vytask:`T5303` ``(bug): Rsyslog.service is not working``
* :vytask:`T5298` ``(bug): Add RFKILL support into kernel.``
* :vytask:`T5308` ``(enhancment): Remove workarounds for incorrect defaults in get_interface_dict``
* :vytask:`T5228` ``(enhancment): Simplify get_config_dict and add argument with_defaults``
* :vytask:`T5310` ``(bug): Need some help troubleshooting NIC detection.``


2023-06-22
==========

* :vytask:`T5297` ``(default): Utility function to check if config under node has been changed between revisions``


2023-06-20
==========

* :vytask:`T5300` ``(bug): verification of port availability can return false negative on boot``
* :vytask:`T5248` ``(feature): Ability to load config via API in JSON format``


2023-06-19
==========

* :vytask:`T5281` ``(feature): Add kernel options for vhost-net``
* :vytask:`T5072` ``(default): QOS-Rewrite: protocol name used literally``
* :vytask:`T4969` ``(bug): QoS Policy - Unable to set class match mark number``


2023-06-18
==========

* :vytask:`T5256` ``(bug): QoS expects protocol number but not protocol name``


2023-06-13
==========

* :vytask:`T5258` ``(bug): git Actions use ubuntu-22.04 instead of deprecated ubuntu-18.04 for PR conflicts checker``
* :vytask:`T5222` ``(feature): Add load-balancing reverse-proxy based on haproxy``
* :vytask:`T5213` ``(feature): Accel-ppp sending accounting interim updates acct-interim-interval option``
* :vytask:`T5171` ``(feature): Use XML for conf-mode "load-balancing wan" instead of legacy templates``


2023-06-12
==========

* :vytask:`T5282` ``(bug): Poweroff now does not work``
* :vytask:`T5264` ``(feature): Add Mellanox Technologies firmware flash module mlxfw to kernel``
* :vytask:`T5286` ``(feature): Remove XDP support``


2023-06-10
==========

* :vytask:`T5231` ``(feature): Add op-mode for load-balancing reverse-proxy``


2023-06-09
==========

* :vytask:`T5253` ``(bug): MPLS config removed at boot when wireguard interfaces present``


2023-06-05
==========

* :vytask:`T5259` ``(bug): Openconnect cannot pass migration 1-to-2``


2023-06-02
==========

* :vytask:`T5252` ``(bug): Route distinguisher and route targets changing upon adding interface to new VRF``
* :vytask:`T5251` ``(bug): Uncaught errors for functions delete/delete_value in Python module configtree.py``


2023-06-01
==========

* :vytask:`T5127` ``(bug): VPNv4/VPNv6 routes are not reinstalled following link flap``


2023-05-28
==========

* :vytask:`T5244` ``(feature): dropbear: update to 2022.83``
* :vytask:`T5242` ``(feature): interfaces: smoketest: automatically detect "capabilities"``
* :vytask:`T5234` ``(feature): Add bash identifier for given VRF instance``


2023-05-25
==========

* :vytask:`T5237` ``(feature): interfaces virtual-ethernet  - Extend capabilitys of Vlans/QinQ``
* :vytask:`T4686` ``(feature): Provides support for veth``


2023-05-24
==========

* :vytask:`T4605` ``(feature): Firewall change default table names``
* :vytask:`T4550` ``(feature): router-advert: Add deprecate-prefix & decrement-lifetimes options``


2023-05-23
==========

* :vytask:`T4916` ``(feature): Rewrite IPsec authentication``


2023-05-22
==========

* :vytask:`T5214` ``(bug): PPPoE-server incorrect warning if a named pool is defined``
* :vytask:`T4977` ``(feature): Babel routing protocol support``


2023-05-21
==========

* :vytask:`T4733` ``(default): Feature Request: dhcp server: add VRF support``
* :vytask:`T5218` ``(enhancment): Revise vyos xml lib for bug fixes and extensions``


2023-05-17
==========

* :vytask:`T5226` ``(default): Deduplicate and standardize validators and constraints for hostname and IP address``
* :vytask:`T5225` ``(bug): BGP allowas-in unusable``
* :vytask:`T5208` ``(bug): Failed to start nvmf-autoconnect.service during the boot``


2023-05-16
==========

* :vytask:`T5194` ``(default): Add reference tree to vyos1x-config``


2023-05-15
==========

* :vytask:`T3896` ``(feature): Extend ocserv support to allow for per-group configs``


2023-05-12
==========

* :vytask:`T2778` ``(feature): Migrate "system syslog" to get_config_dict() to support new features``
* :vytask:`T2769` ``(feature): Add VRF support for syslog``


2023-05-10
==========

* :vytask:`T5209` ``(bug): dhclient load-balancing exit hook 04-dhcp-wanlb returned non-zero exit status``
* :vytask:`T5065` ``(bug): Mixing `destination port xxx` and `destination group port-group yyy` in firewall rules doesn't work, but can be commited``
* :vytask:`T5060` ``(feature): add a VRRP 'maintenance mode'``


2023-05-09
==========

* :vytask:`T5202` ``(bug): After removal load-balancing a pid remained which used in dhclient-exit-hooks``


2023-05-06
==========

* :vytask:`T5206` ``(bug): ethtool.py:Ethtool.__init__ has always true conditional due to typo``


2023-05-05
==========

* :vytask:`T5082` ``(feature): container: switch to netavark network stack``


2023-05-04
==========

* :vytask:`T5193` ``(feature): Ability to specify NS records to specify NS servers for subdomains``
* :vytask:`T3891` ``(bug): X550-T2/Possibly other X550/X540 cards no link on VyOS``
* :vytask:`T5010` ``(bug): bgp: EVPN route-target not honored``
* :vytask:`T5196` ``(feature): wwan: op-mode should inform user if there is no WWAN interface``


2023-05-03
==========

* :vytask:`T5163` ``(feature): Policy route-map add match source-protocol``


2023-05-02
==========

* :vytask:`T5042` ``(bug): Command 'show vpn ipsec remote-access' does not work``


2023-04-27
==========

* :vytask:`T5185` ``(bug): Static IPv6 route with blackhole fails``
* :vytask:`T5175` ``(bug): http-api: error in MultiPart parser for FastAPI version >= 0.91.0``
* :vytask:`T5183` ``(bug): IPv6 route6 problem``
* :vytask:`T5181` ``(bug): Wrong dependencies or priorities for zebra vni vrf interfaces and bgpd``
* :vytask:`T5128` ``(feature): Policy route - Allow wildcard interfaces``
* :vytask:`T5055` ``(feature): Firewall - Add packet type matcher (pkttype)``
* :vytask:`T5050` ``(feature): Firewall - Add options for logging packets``
* :vytask:`T5037` ``(feature): Firewall - Add queue action``
* :vytask:`T5176` ``(bug): http-api: update vyos-http-api-tools for FastAPI security vulnerability``
* :vytask:`T5174` ``(bug): vrf: ensure no duplicate VNIs can be created``
* :vytask:`T5123` ``(default): Display route originator in show ospf table command``


2023-04-25
==========

* :vytask:`T5179` ``(bug): multi nodes defined in XML are not properly represented as list in get_config_dict()``


2023-04-17
==========

* :vytask:`T5052` ``(bug): Error displaying dhcpv6 prefix delegation leases``
* :vytask:`T5150` ``(feature): Rework CLI definitions to apply route-maps between routing daemons and zebra/kernel``
* :vytask:`T3734` ``(bug): Move EVPN VRF up in FRR config``


2023-04-13
==========

* :vytask:`T5152` ``(bug): Telegraf agent hostname isn't qualified``
* :vytask:`T4727` ``(feature): Add RADIUS rate limit support to PPTP server``
* :vytask:`T4939` ``(bug): VRRP command  no-preempt not work as expected``
* :vytask:`T4791` ``(default): Consistent normalization of 'raw' output of op-mode scripts for CLI and API``
* :vytask:`T3608` ``(default): Standardize warnings from configure scripts``


2023-04-11
==========

* :vytask:`T4924` ``(bug): Systemctl strongswan.service for some reason is not disabled``
* :vytask:`T4197` ``(bug): Vyos arm64-latest build issue with telegraf pkg``
* :vytask:`T4051` ``(bug): Connected routes strange / not working``


2023-04-10
==========

* :vytask:`T5151` ``(bug): EAP-TLS TLSv1.0/1.1 regression after T5003``
* :vytask:`T5148` ``(bug): OpenVPN cannot start due to could not load plugin shared object /openvpn-otp.so``
* :vytask:`T5110` ``(bug): Show frr op-mode vtysh_pam: Failed in account validation``
* :vytask:`T5078` ``(feature): VyOS BGP does not support 'show bgp neighbors $NB filtered-routes'``
* :vytask:`T5070` ``(feature): show bgp nexthop unavailable in VRF``
* :vytask:`T5061` ``(bug): All containers restart on config change``


2023-04-07
==========

* :vytask:`T5149` ``(bug): op-mode openvpn should not raise error in case interface is disabled``


2023-04-06
==========

* :vytask:`T5147` ``(bug): Can't Commit with Container Network``
* :vytask:`T5142` ``(feature): One of the requirements is to use a system auditing tool to monitor and log all security-relevant events.``
* :vytask:`T5125` ``(feature): Add op-mode commands for hsflowd based sflow``


2023-04-05
==========

* :vytask:`T5145` ``(feature): Add maxsyslogins  maximum number of all logins on system``
* :vytask:`T5135` ``(default): Rewrite opennhrp script using vyos.ipsec library``
* :vytask:`T4975` ``(bug): CLI does not work after cutting off the power or reset``
* :vytask:`T5136` ``(bug): Possible config corruption on upgrade``


2023-04-04
==========

* :vytask:`T5141` ``(feature): Add numbers for dhclient-exit-hooks.d to enforce script order execution``
* :vytask:`T5093` ``(bug): Command 'reset vpn ipsec-profile' doesn't work``
* :vytask:`T4362` ``(bug): Wan Load Balancing - Can't create routing tables``


2023-04-03
==========

* :vytask:`T5139` ``(feature): IKE life-time should start from 0 for disable rekey``
* :vytask:`T4173` ``(bug): Wan Load Balancing - Error on firewall NAT rules``


2023-04-02
==========

* :vytask:`T5134` ``(feature): Try if netavark networks can be moved to a VRF instance``


2023-04-01
==========

* :vytask:`T5047` ``(bug): Recreate only a specific container``
* :vytask:`T5132` ``(default): Operational command "show isis vrf  XXX route | neighbord" aren't working``


2023-03-31
==========

* :vytask:`T5129` ``(feature): Add AWS build flavour``
* :vytask:`T5126` ``(feature): http-api: add 'allow-client' to restrict IP address of client connections``


2023-03-30
==========

* :vytask:`T5130` ``(bug): op-mode: drop remaining reference to obsoleted 'show_interfaces.py'``
* :vytask:`T4866` ``(feature): Rewrite show_interfaces to standardized form``
* :vytask:`T366` ``(bug): SNMP Query for BGP Tunnels Returns IPv4 Tunnels Only``


2023-03-29
==========

* :vytask:`T5100` ``(feature): Update FRR to 8.5``
* :vytask:`T5094` ``(bug): FRR systemd logs unknow key LimitNOFILESoft``
* :vytask:`T5085` ``(bug): ospfv3 route-map not applied in FRR configuration``
* :vytask:`T5056` ``(bug): IPoE server vlan-mon is not working``
* :vytask:`T5033` ``(bug): generate-public-key command fails for address with multiple public keys like GitHub``
* :vytask:`T4876` ``(bug): mpls - LSP broken on FRR 8.4.1``
* :vytask:`T5097` ``(bug): the operational command "show interfaces ethernet ethx" doesn't reflect a call to 'clear counters'``
* :vytask:`T5089` ``(enhancment): Add unit test of config_diff``
* :vytask:`T5088` ``(enhancment): Add lexicographical-numeric compare function for vytree/configtree``
* :vytask:`T5087` ``(enhancment): Add support for lexical ordering of nodes in config_tree``
* :vytask:`T4885` ``(feature): Rewrite 'clear interfaces counters' from Perl to Python``
* :vytask:`T4846` ``(bug): L3VPN- network command doesn't install direct connected  prefix``


2023-03-28
==========

* :vytask:`T5043` ``(feature): Need to create reset command for IKEv2 remote-access vpn connections``


2023-03-27
==========

* :vytask:`T5099` ``(feature): IPoE server add option 'next-pool' for named ip pools``
* :vytask:`T5106` ``(feature): Extend generation of API client requests to configsession native functions and composite requests``
* :vytask:`T5104` ``(bug): DHCP default route issues with static routes in VRFs``
* :vytask:`T5079` ``(feature): xml: schema extension to support defaultValues on tagNodes``
* :vytask:`T5114` ``(feature): bgp: implement new CLI commands introduced in FRR 8.5``


2023-03-23
==========

* :vytask:`T5108` ``(feature): Get rate limit for L2TP/PPTP/SSTP/IPoE in raw format``
* :vytask:`T5086` ``(feature): Integrate hsflowd for sflow accounting``
* :vytask:`T5107` ``(bug): Raise error in op-mode dns.py instead of calling exit``


2023-03-22
==========

* :vytask:`T5068` ``(feature): Generate op-mode API client requests along with schema generation``


2023-03-21
==========

* :vytask:`T5098` ``(feature): PPPoE client holdoff configuration``
* :vytask:`T3694` ``(bug): Static routes not installed into kernel nor frr``
* :vytask:`T5102` ``(feature): ospf: "redistribute babel" is always set``


2023-03-20
==========

* :vytask:`T5057` ``(bug): IPoE server incorrect interface regex``
* :vytask:`T5095` ``(feature): Return list instead of dict for 'raw' output of op-mode openvpn``


2023-03-19
==========

* :vytask:`T4925` ``(feature): Need to add the possibility to configure Pseudo-Random Functions (PRF) in IKEv2``


2023-03-17
==========

* :vytask:`T5092` ``(bug): IPoE-server named pool must not rely on the authentication type``
* :vytask:`T5091` ``(bug): IPoE server with RADIUS authentication does not verify radius configuration``


2023-03-16
==========

* :vytask:`T5073` ``(bug): IPoE-server interface option failed to parse``
* :vytask:`T5063` ``(bug): IPoE-server ethX vlan must not be used with client-subnet``
* :vytask:`T5058` ``(feature): Extend template filter range_to_regex``
* :vytask:`T3083` ``(feature): Add feature event-handler``
* :vytask:`T2516` ``(bug): vyos-container: cannot configure ethernet interface``


2023-03-13
==========

* :vytask:`T5074` ``(bug): Show IPSEC SA failed if remote access IKEv2 vpn is used.``
* :vytask:`T4973` ``(bug): show dhcp server leases error for lease time 4294967295``


2023-03-11
==========

* :vytask:`T5076` ``(feature): CI/CD: Docker container is bloated by legacy and conflicting dependencies``


2023-03-09
==========

* :vytask:`T5066` ``(bug): Different GRE tunnel but same tunnel keys error``
* :vytask:`T4952` ``(feature): Improve interface completion helper CLI experience``


2023-03-08
==========

* :vytask:`T4381` ``(default): OpenVPN: Add "Tunnel IP" column in "show openvpn server" operational command``
* :vytask:`T4872` ``(bug): Op-mode show openvpn misses a case when parsing for tunnel IP``


2023-03-07
==========

* :vytask:`T2838` ``(bug): Ethernet device names changing, multiple hw-id being added``
* :vytask:`T5051` ``(feature): Use Literal types to provide op-mode CLI choices and API enums``
* :vytask:`T4900` ``(default): Cache intermediary results of get_config_diff in Config instance``


2023-03-05
==========

* :vytask:`T5040` ``(default): Generate API GraphQL schema on installation, rather than dynamically``


2023-03-03
==========

* :vytask:`T4625` ``(enhancment): Update ocserv to current revision (1.1.6)``


2023-03-02
==========

* :vytask:`T4967` ``(feature): Ability to set hostname for the container``


2023-03-01
==========

* :vytask:`T5015` ``(bug): Invalid format character error at hfsc class settings help text``


2023-02-28
==========

* :vytask:`T5029` ``(feature): Nginx change default root directory and fix regex``
* :vytask:`T5025` ``(bug): Time-zone validation failed``
* :vytask:`T4955` ``(bug): Openconnect radiusclient.conf generating with extra authserver``
* :vytask:`T4843` ``(feature): Command-line arguments in container config``
* :vytask:`T4219` ``(feature): support incoming-interface (iif) in local PBR``
* :vytask:`T3903` ``(bug): Containers: after command "reboot" the host system will reboot after 1.5 minutes``


2023-02-27
==========

* :vytask:`T5028` ``(feature): Add package exfatprogs to VyOS``
* :vytask:`T4985` ``(bug): reset vpn ipsec-peer command with peer name does not work``


2023-02-26
==========

* :vytask:`T4979` ``(feature): Add API request 'show_user_info' for UI``


2023-02-25
==========

* :vytask:`T5008` ``(bug): MACsec CKN of 32 chars is not allowed in CLI, but works fine``
* :vytask:`T5007` ``(bug): Interface multicast setting is invalid``
* :vytask:`T5027` ``(bug): OpenVPN options and site-to-site cannot pass smoketest``
* :vytask:`T4978` ``(bug): KeyError: 'memory' container_config['memory'] on upgrading to 1.4-rolling-202302041536``
* :vytask:`T5034` ``(bug): Migrate multicast CLI node to valueLess``
* :vytask:`T4948` ``(feature): pppoe: add CLI option to allow definition of host-uniq flag``


2023-02-24
==========

* :vytask:`T5030` ``(bug): HTTPS-API delete key without id error``


2023-02-23
==========

* :vytask:`T5013` ``(feature): Extend accelppp.py op-mode to get subnet start stop info from config``
* :vytask:`T5002` ``(feature): Add uk (United Kingdom) keymap``


2023-02-22
==========

* :vytask:`T5024` ``(bug): check-qemu-install VM is not shutdown the first time``
* :vytask:`T5011` ``(bug): Some interface drivers don't support min_mtu and max_mtu and verify_mtu check should be skipped``


2023-02-21
==========

* :vytask:`T5021` ``(bug): IPsec SA is closed before negotiating a new one or it is negotiated on every second if big life-time is set in swanctl.conf``
* :vytask:`T5020` ``(feature): Extend openvpn.py op-mode to get a list of configured clients``


2023-02-20
==========

* :vytask:`T5005` ``(feature): Skip user authentication for PPPoE Server with noauth option``


2023-02-16
==========

* :vytask:`T4971` ``(feature): Radius attribute "Framed-Pool" for PPPoE``


2023-02-15
==========

* :vytask:`T4991` ``(bug): Restore path level information to compare output``


2023-02-14
==========

* :vytask:`T4968` ``(bug): VPN IPsec check dpd and close action for empty values``
* :vytask:`T1993` ``(feature): Extended pppoe rate-limiter``


2023-02-13
==========

* :vytask:`T4905` ``(feature): Convert show nhrp tunnel to tabulate format``
* :vytask:`T4153` ``(bug): Monitor bandwidth-test initiate not working``


2023-02-12
==========

* :vytask:`T4998` ``(bug): pppoe username validation too restrictive (regression)``


2023-02-11
==========

* :vytask:`T2603` ``(feature): pppoe-server: reduce min MTU``


2023-02-10
==========

* :vytask:`T4857` ``(feature): SNMP - Implement FRR SNMP recommendations``
* :vytask:`T4995` ``(feature): pppoe, wwan and sstp-client - rename user -> username on authentication``


2023-02-07
==========

* :vytask:`T4980` ``(bug): chrony not listening as a server``
* :vytask:`T4868` ``(bug): L2TP  ppp-options ipv6 does not work without ipv6 pool but should``
* :vytask:`T4117` ``(bug): Does not possible to configure PoD/CoA for L2TP vpn``


2023-02-01
==========

* :vytask:`T4970` ``(default): pin OCaml pcre package to avoid JIT support``


2023-01-31
==========

* :vytask:`T4964` ``(bug): FRR bgp address-family l2vpn-evpn route-target export/import not working``
* :vytask:`T4780` ``(feature): Firewall - Add interface group``
* :vytask:`T4157` ``(default): Add jinja2 to pip test requirements``


2023-01-30
==========

* :vytask:`T4958` ``(feature): Add OpenConnect RADIUS Accounting support``
* :vytask:`T4954` ``(bug): DNS cannot be configured via Network-Config v1 received from ConfigDrive / Cloud-Init``
* :vytask:`T4118` ``(default): IPsec syntax overhaul``


2023-01-29
==========

* :vytask:`T4965` ``(default): empty description in firewall group causes configuration error on migration``


2023-01-28
==========

* :vytask:`T4961` ``(bug): Uncaught configtree error allows ntp migration 1-to-2 to fail silentlly on config.boot.default``


2023-01-27
==========

* :vytask:`T4960` ``(bug): Bugs in `cc_vyos.py` code (Cloud-Init)``


2023-01-26
==========

* :vytask:`T4886` ``(feature): Firewall and Policy - Add connection mark``
* :vytask:`T4957` ``(bug): config-mgmt should not attempt to archive config at boot``
* :vytask:`T4962` ``(bug): Fix typo in regex in vyos.config_mgmt compare function``
* :vytask:`T4912` ``(default): Rewrite the IGMP op mode in the new style``


2023-01-25
==========

* :vytask:`T4941` ``(bug): Accel-ppp IPoE incompatibility with kernel 6.1``


2023-01-24
==========

* :vytask:`T4947` ``(feature): Support mounting container volumes as ro or rw``


2023-01-23
==========

* :vytask:`T4798` ``(default): Migrate the file-exists validator away from Python``
* :vytask:`T4683` ``(enhancment): Add kitty-terminfo package to build``
* :vytask:`T4953` ``(bug): Remove convert_kwargs_to_snake_case decorator in dynamic generation of GraphQL resolvers``
* :vytask:`T4875` ``(default): Replace Python validator 'interface-name' to avoid Python startup cost``
* :vytask:`T4664` ``(bug): Add validation to reject whitespace in tag node value names``


2023-01-22
==========

* :vytask:`T4906` ``(bug): ipsec connections shows only one connection as up``


2023-01-21
==========

* :vytask:`T4799` ``(bug): PowerDNS >= 4.7 does not get reloaded by vyos-hostsd``
* :vytask:`T4878` ``(bug): Any interface bonding changes cause interface flapping``
* :vytask:`T4387` ``(default): Create additional smoketests for multiwan PBR & load-balanced configurations``


2023-01-20
==========

* :vytask:`T4551` ``(bug): IPsec rekeying collisions bug``
* :vytask:`T4942` ``(feature): Rewrite vyatta-config-mgmt to Python/XML``


2023-01-17
==========

* :vytask:`T4938` ``(bug): Interface input ifb does not work``
* :vytask:`T4902` ``(bug): snmpd: exclude container storage from monitoring``
* :vytask:`T4140` ``(bug): Lack of SNMP IANA mibs``


2023-01-15
==========

* :vytask:`T4832` ``(feature): dhcp: Add IPv6-only dhcp option support (RFC 8925)``
* :vytask:`T4937` ``(feature): ocserv: upgrade package to version 1.1.6``
* :vytask:`T4918` ``(bug): Odd show interface behavior``
* :vytask:`T3008` ``(feature): Migrate from ntpd to chronyd``


2023-01-13
==========

* :vytask:`T4911` ``(default): Rewrite the LLDP op mode in the new format``
* :vytask:`T4928` ``(feature): Upgrade Linux Kernel to 6.1.y (2022 LTS edition)``


2023-01-12
==========

* :vytask:`T4934` ``(bug): ospf: Fix inter-area route summarization``
* :vytask:`T4929` ``(feature): Update Intel QAT drivers to 4.20.0-00001``


2023-01-10
==========

* :vytask:`T4880` ``(feature): Expose 'add/delete container image' in HTTP-API``


2023-01-09
==========

* :vytask:`T4922` ``(feature): Add ssh-client source-interface CLI option``
* :vytask:`T4524` ``(bug): Squid webproxy not working properly``


2023-01-08
==========

* :vytask:`T4920` ``(bug): ospf: Fix `passive-interface default` option``


2023-01-07
==========

* :vytask:`T4884` ``(bug): Missing a community6 in snmpd config``


2023-01-05
==========

* :vytask:`T4904` ``(feature): Allow multiple ports for high-availability virtual-server``
* :vytask:`T4789` ``(feature): Ability to get L2TP/PPTP/SSTP sessions info in a machine readable format``
* :vytask:`T3937` ``(default): Rewrite "show system memory" in Python to make it usable as a library function``


2023-01-04
==========

* :vytask:`T4848` ``(bug): Minor bug in OpenConnect server with default route``
* :vytask:`T4656` ``(feature): Support the listen-host config field of openconnect server``


2023-01-03
==========

* :vytask:`T4907` ``(bug): nat source translations couldn't show metrics``


2023-01-02
==========

* :vytask:`T4893` ``(feature): l2tp add ppp-options IPv6 interface identifier``
* :vytask:`T4717` ``(feature): Connect to console server by name``
* :vytask:`T725` ``(feature): Cake and FQ-PIE``


2022-12-31
==========

* :vytask:`T4898` ``(feature): Add mtu config option for dummy interfaces``


2022-12-30
==========

* :vytask:`T4834` ``(bug): Limit container network name to 15 characters``
* :vytask:`T4901` ``(bug): Update Podman to v4.3.1``
* :vytask:`T4899` ``(bug): Podman systemd services not being installed correctly``


2022-12-28
==========

* :vytask:`T4593` ``(feature): Upgrade strongswan to 5.9.8``


2022-12-26
==========

* :vytask:`T4511` ``(bug): IPv6 DNS lookup``
* :vytask:`T4809` ``(feature): radvd: Allow use of AdvRASrcAddress``


2022-12-25
==========

* :vytask:`T3579` ``(feature): Rewrite vyatta-conntrack in new XML and Python flavour``


2022-12-24
==========

* :vytask:`T4890` ``(bug): show conntrack table ipv4 fail``
* :vytask:`T4879` ``(bug): IPSec migration failed with missing remote-id``
* :vytask:`T4870` ``(feature): Containers switch to using overlay driver for podman storage``


2022-12-23
==========

* :vytask:`T4792` ``(feature): Add SSTP VPN client``


2022-12-21
==========

* :vytask:`T4887` ``(bug): Schema generation from op-mode functions should set default 'false' on boolean arguments``


2022-12-18
==========

* :vytask:`T4882` ``(bug): Missing ICMPv6 type names in firewall configuration``


2022-12-15
==========

* :vytask:`T4671` ``(bug): linux-firmware package is missing symlinks defined in WHENCE file``


2022-12-14
==========

* :vytask:`T4881` ``(bug): Return opmode.Error on openconnect.py show_sessions``


2022-12-12
==========

* :vytask:`T4861` ``(feature): Openconnect restart on adding users - Aborts all active connections``


2022-12-09
==========

* :vytask:`T4865` ``(bug): container impossible to generate local image from a file if it requires install some pkgs``


2022-12-05
==========

* :vytask:`T4860` ``(bug): Openconnect server incorrect unconfigured check``
* :vytask:`T4804` ``(bug): PPPoE server incorrect unconfigured check``
* :vytask:`T4854` ``(feature): BGP-route reflector allows to apply route-maps``


2022-12-04
==========

* :vytask:`T4825` ``(feature): interfaces veth/veth-pairs -standalone used``
* :vytask:`T4805` ``(bug): PPPoE server does not restart service if pool was changed``


2022-12-02
==========

* :vytask:`T4830` ``(bug): nat66 - Error in port translation rules``
* :vytask:`T4859` ``(bug): Correct calling of config mode script dependencies from http-api.py``
* :vytask:`T4820` ``(enhancment): Support for inter-config-mode script dependencies``
* :vytask:`T4858` ``(bug): L3VPN- Route Distinguisher notations``
* :vytask:`T1024` ``(feature): Policy Based Routing by DSCP``


2022-12-01
==========

* :vytask:`T4841` ``(feature): add fan control``
* :vytask:`T4847` ``(bug): Correct calling of config mode script dependencies from pki.py``


2022-11-29
==========

* :vytask:`T4842` ``(bug): Routing config broken if mpls config exists``
* :vytask:`T4845` ``(default): Add smoketest to detect cycles in config-mode script dependency calls``


2022-11-27
==========

* :vytask:`T4739` ``(feature): ISIS and OSPF segment routing being refactored``


2022-11-24
==========

* :vytask:`T4794` ``(bug): show firewall name <name> - Can't use .items() on a list``
* :vytask:`T4714` ``(feature): Delete unused ipset from the filecaps``
* :vytask:`T3541` ``(bug): Route Map large community set additive is missing``


2022-11-23
==========

* :vytask:`T4836` ``(feature): Kernel: enable new features like switchdev, ESP in TCP and HSR``
* :vytask:`T4835` ``(bug): SNMPD configuration incorrect for IPv6``
* :vytask:`T4819` ``(feature): Allow printing Warning messages in multiple lines with \n``
* :vytask:`T4807` ``(feature): Need to fix traceroute help completion``
* :vytask:`T4660` ``(feature): Reorganize route map set community CLI``
* :vytask:`T4526` ``(bug): keepalived-fifo.py unable to load config``
* :vytask:`T4793` ``(feature): Create warning message about disable-route-autoinstall when ipsec vti is used``
* :vytask:`T4492` ``(bug): Incorrect list of neighbors in help for "show bgp vrf VRF neighbors"``
* :vytask:`T4496` ``(feature): ping vrf help does not list VRFs``


2022-11-22
==========

* :vytask:`T4823` ``(bug): swanctl.conf is broken when ipsec site-to-site peer set.``
* :vytask:`T4706` ``(bug): NAT and NAT66 issues``
* :vytask:`T4670` ``(feature): policy route - Update matching criteria``


2022-11-21
==========

* :vytask:`T4812` ``(feature): IPsec ability to show all configured connections``
* :vytask:`T4829` ``(default): Tunnel argument to 'reset_peer' in ipsec.py should have type hint Optional``


2022-11-20
==========

* :vytask:`T4827` ``(bug): route-map issues , not load configuration FRR``


2022-11-19
==========

* :vytask:`T4826` ``(bug): Wrong key type is used for SSH SK public keys``
* :vytask:`T4720` ``(feature): Ability to configure SSH HostKeyAlgorithms``
* :vytask:`T4828` ``(default): Raise appropriate op-mode errors in ipsec.py 'reset_peer'``


2022-11-18
==========

* :vytask:`T4821` ``(bug): Correct calling of config mode script dependencies from firewall.py``


2022-11-17
==========

* :vytask:`T4750` ``(feature): Support of higher level SSH keys (sk-ssh-ed25519)``


2022-11-15
==========

* :vytask:`T4808` ``(feature): Add details of configtree operations to migration log``


2022-11-12
==========

* :vytask:`T4814` ``(bug): Regression in bundled powerdns version``


2022-11-09
==========

* :vytask:`T4800` ``(bug): undefined var includes_chroot_dir in build-vyos-image``


2022-11-08
==========

* :vytask:`T4771` ``(feature): Rewrite protocol BGP op-mode to vyos.opmode format``
* :vytask:`T4806` ``(default): Update FRR to 8.4 in 1.4 version``


2022-11-06
==========

* :vytask:`T4803` ``(bug): The header 'Authorization' needs to be explictly allowed in http-api CORS middleware``


2022-11-05
==========

* :vytask:`T4802` ``(feature): Ability to define per container shared-memory size``


2022-11-01
==========

* :vytask:`T4764` ``(bug): NAT tables vyos_nat  and vyos_static_nat not deleting after deleting nat``
* :vytask:`T4177` ``(bug): Strip-private doesn't work for service monitoring``


2022-10-31
==========

* :vytask:`T4786` ``(feature): Add package python3-pyhumps``
* :vytask:`T1875` ``(feature): Add the ability to use network address as BGP neighbor (bgp listen range)``
* :vytask:`T4785` ``(feature): snmp: Allow !, @, * and # in community name``
* :vytask:`T4787` ``(feature): ipsec: add support for road-warrior/remote-access RADIUS timeout``


2022-10-29
==========

* :vytask:`T4783` ``(default): Add support for stunnel``
* :vytask:`T4784` ``(feature): Add description node for static route/route6 tagNodes``


2022-10-28
==========

* :vytask:`T4291` ``(default): Consolidate component version read/write functions``


2022-10-27
==========

* :vytask:`T4763` ``(feature): Change XML for Show nat destination statistics``
* :vytask:`T4762` ``(bug): Show nat rules with empty rules incorrect error``
* :vytask:`T4778` ``(bug): Raise error UnconfiguredSubsystem if op-mode ipsec.py fails initialization``


2022-10-26
==========

* :vytask:`T4773` ``(default): Add camel_case to snake_case conversion utility``


2022-10-25
==========

* :vytask:`T4574` ``(default): Add token based authentication to GraphQL API``


2022-10-24
==========

* :vytask:`T4772` ``(default): Return list of dicts in 'raw' output of route.py instead of dict with redundant information``


2022-10-23
==========

* :vytask:`T3723` ``(bug): op-mode IPSec show vpn ipsec sa output with underscores``


2022-10-21
==========

* :vytask:`T4768` ``(default): Change name of api child node from 'gql' to 'graphql'``


2022-10-18
==========

* :vytask:`T4684` ``(feature): Rewrite show ip route by protocol to vyos.opmode format``
* :vytask:`T4533` ``(bug): Radius clients don’t  have simple permissions``
* :vytask:`T4753` ``(enhancment): Extend automatic generation of schema to query SystemStatus``


2022-10-17
==========

* :vytask:`T4725` ``(bug): Unable to reset vpn IPsec peer``


2022-10-14
==========

* :vytask:`T4672` ``(bug): RADIUS server disable does not work``
* :vytask:`T4749` ``(enhancment): Use config_dict for conf_mode http-api.py``


2022-10-13
==========

* :vytask:`T4746` ``(bug): Monitoring nft. table vyos_filter by default does not exist but telegraf checks this table``
* :vytask:`T4744` ``(bug): BGP directly connected neighbors don't compatible with ebgp-multihop``
* :vytask:`T4716` ``(feature): SSH ability to configure RekeyLimit``
* :vytask:`T4343` ``(default): Expose powerdns network-timeout for service dns forwarding``
* :vytask:`T4312` ``(bug): Telegraf configuration doesn't accept IPs for URL``
* :vytask:`T4274` ``(default): Extend OpenConnect RADIUS Timeout to Permit 2FA Entry``


2022-10-12
==========

* :vytask:`T4747` ``(bug): Monitoring influxdb template input exec plugin does not work``
* :vytask:`T4740` ``(bug): Show conntrack table ipv6 fail``
* :vytask:`T4730` ``(bug): Conntrack-sync error - listen-address is not the correct type in config as it should be``


2022-10-11
==========

* :vytask:`T4742` ``(bug): Autocomplete in policy route rule x set table / does not show the tables created in the static protocols``
* :vytask:`T4741` ``(bug): set firewall zone Local local-zone failed``
* :vytask:`T4680` ``(bug): Telegraf prometheus-client listen-address invalid format``


2022-10-10
==========

* :vytask:`T538` ``(feature): Support for network mapping in NAT``


2022-10-09
==========

* :vytask:`T4738` ``(enhancment): Extend automatic generation of schema definition files to native configsession functions; use single resolver/directive``


2022-10-08
==========

* :vytask:`T4707` ``(feature): Enable OSPF segment routing``


2022-10-07
==========

* :vytask:`T4736` ``(bug): Error on JSON output of API query ShowConfig``


2022-10-04
==========

* :vytask:`T4708` ``(bug): 'show nat destination rules' throwing an error``
* :vytask:`T4700` ``(feature): Firewall - Add interface match criteria``
* :vytask:`T4699` ``(feature): Firewall - Add jump action - Add return action``
* :vytask:`T4651` ``(feature): Firewall - Add options to match packet size``
* :vytask:`T4702` ``(bug): Wireguard peers configuration is not synchronized with CLI``
* :vytask:`T4685` ``(bug): Interface does not exist on boot when used as inbound-interface for local policy route``
* :vytask:`T4652` ``(feature): Upgrade PowerDNS recursor to 4.7 series``
* :vytask:`T4582` ``(default): Router-advert: Preferred lifetime cannot equal valid lifetime in PIOs``


2022-09-29
==========

* :vytask:`T4715` ``(feature): Auto logout user after a period of inactivity``
* :vytask:`T4697` ``(bug): policy route: Generating ConfigError failes when tcp flag is missing on set tcp-mss rule commit``


2022-09-27
==========

* :vytask:`T4711` ``(feature): Ability to terminate user TTY and PTS sessions``
* :vytask:`T4557` ``(feature): fastnetmon: allow configure limits per protocol (tcp, udp, icmp)``


2022-09-21
==========

* :vytask:`T4678` ``(feature): Rewrite service ipoe-server to get_config_dict``
* :vytask:`T4703` ``(feature): accel-ppp: combine vlan-id and vlan-range into single CLI node``


2022-09-20
==========

* :vytask:`T4693` ``(bug): ISIS segment routing was broken...``


2022-09-17
==========

* :vytask:`T4666` ``(bug): EAP-TLS no longer allows TLSv1.0 after T4537, T4584``
* :vytask:`T4665` ``(bug): Keepalived cannot use same VRID for VRRPv2 and VRRPv3``


2022-09-16
==========

* :vytask:`T4698` ``(enhancment): Drop validator name="range" and replace it with numeric``
* :vytask:`T4695` ``(feature): Add 'es' and 'jp106' keymap option keyboard-layout``
* :vytask:`T4669` ``(enhancment): Extend numeric.ml for inversion of values and range values``


2022-09-15
==========

* :vytask:`T4679` ``(bug): OpenVPN site-to-site incorrect check for IPv6 local and remote address``
* :vytask:`T4691` ``(feature): Upgrade Linux Kernel to latest 5.15.y train``
* :vytask:`T4630` ``(bug): Prevent attempts to use the same interface as a source interface for pseudo-ethernet and MACsec at the same time``
* :vytask:`T4696` ``(default): Extend bgp parameters for bgp bestpath peer-type multipath-relax``


2022-09-12
==========

* :vytask:`T4617` ``(feature): VRF specification is needed for telegraf prometheus-client listen-address <address>``
* :vytask:`T4690` ``(bug): Update GraphQL resolver for 'SystemStatus' following changes to 'show_uptime' op-mode script``
* :vytask:`T4647` ``(feature): Add Google Virtual NIC (gVNIC) support``
* :vytask:`T4170` ``(feature): Rename "policy ipv6-route" -> "policy route6"``


2022-09-09
==========

* :vytask:`T4682` ``(feature): Rewrite 'show system storage' in standardized format``
* :vytask:`T4681` ``(feature): Complete standardization of show_uptime.py``


2022-09-06
==========

* :vytask:`T4640` ``(enhancment): Integrate op-mode exception hierarchy into API``
* :vytask:`T4597` ``(bug): Check bind port before assign service HTTPS API and openconnect``
* :vytask:`T4674` ``(bug): API should show op-mode error message, if present``
* :vytask:`T4673` ``(bug): op-mode bridge.py should raise error on show_fdb for nonexistent bridge interface``


2022-09-05
==========

* :vytask:`T4668` ``(bug): Adding/removing members from bond doesn't work/results in incorrect interface state``
* :vytask:`T4663` ``(bug): Interface pseudo-ethernet does not change mode``
* :vytask:`T4655` ``(bug): Firewall in 1.4 sets the default action 'accept' instead of 'drop'``
* :vytask:`T4628` ``(bug): ConfigTree() throws ValueError() if tagNode contains whitespaces``


2022-09-01
==========

* :vytask:`T4606` ``(bug): monitor nat destination translation shows missing script``
* :vytask:`T4435` ``(bug): Policy route and firewall - error when using undefined group``
* :vytask:`T4147` ``(bug): New Firewall Implementation - proposed changes on group implementation``


2022-08-31
==========

* :vytask:`T4650` ``(feature): Rewire show nat translation to vyos.opmode format``
* :vytask:`T4644` ``(bug): Check bind port before assign vpn sstp``
* :vytask:`T4643` ``(bug): Smoketest exclude either sstp or openconnect from pki-misc default listen port``
* :vytask:`T4569` ``(feature): Rewrite show bridge to new format``
* :vytask:`T4547` ``(bug): Show vpn ipsec sa show unexpected prefix 'B' in packets``
* :vytask:`T4367` ``(bug): NAT - Config tmp file not available``


2022-08-29
==========

* :vytask:`T4645` ``(bug): show nat source statistics lack argument --family``
* :vytask:`T4634` ``(bug): Bgp neighbor disable-connected-check does not work``
* :vytask:`T4631` ``(feature): Add port and protocol to nat66``
* :vytask:`T4623` ``(feature): Add show conntrack statistics``
* :vytask:`T4595` ``(bug): DPD interval and timeout do not work in DMVPN``
* :vytask:`T4594` ``(feature): Rewrite op-mode IPsec to vyos.opmode format``
* :vytask:`T4508` ``(bug): Problem with values of the same environment in different event handlers``
* :vytask:`T4653` ``(bug): Interface offload options are not applied correctly``
* :vytask:`T4546` ``(bug): Does not connect Cisco spoke to VyOS hub.``
* :vytask:`T4061` ``(default): Add util function to check for completion of boot config``
* :vytask:`T4654` ``(bug): RPKI cache incorrect description``
* :vytask:`T4572` ``(bug): Add an option to force interface MTU to the value received from DHCP``


2022-08-26
==========

* :vytask:`T4642` ``(bug): proxy: hyphen not allowed in proxy URL``


2022-08-25
==========

* :vytask:`T4626` ``(bug): Error showing nat66 source and destination``
* :vytask:`T4622` ``(feature): Firewall allow drop packets by TCP MSS size``


2022-08-24
==========

* :vytask:`T4641` ``(bug): prefix-list allows ipv6 prefix as input``
* :vytask:`T4633` ``(feature): Change keepalived to v2.2.7``


2022-08-23
==========

* :vytask:`T4618` ``(bug): Traffic policy not set on virtual interfaces``
* :vytask:`T4538` ``(bug): Macsec does not work correctly when the interface status changes.``


2022-08-22
==========

* :vytask:`T4089` ``(bug): Show nat destination rules shows ip address instead of interface 'any'``
* :vytask:`T4632` ``(bug): VLAN-aware bridge not working``
* :vytask:`T4637` ``(feature): Upgrade to podman 4.2.0``


2022-08-20
==========

* :vytask:`T4596` ``(bug): "show openconnect-server sessions" command does not work in the openconnect module``


2022-08-19
==========

* :vytask:`T4620` ``(bug): UPnP does not work due to  incorrect template``
* :vytask:`T4619` ``(bug): Static arp is not set if another entry is present``
* :vytask:`T4611` ``(bug): UPnP rule IP should be a prefix instead of an address``
* :vytask:`T4614` ``(feature): OpenConnect split-dns directive``


2022-08-18
==========

* :vytask:`T4613` ``(bug): UPnP configuration without listen option fail``
* :vytask:`T4570` ``(bug): Exception when trying to set up VXLAN over Wireguard``


2022-08-17
==========

* :vytask:`T4598` ``(feature): nat66  - Add exclude options``
* :vytask:`T4480` ``(default): add an ability to configure squid acl safe ports and acl ssl safe ports``


2022-08-16
==========

* :vytask:`T4592` ``(bug): macsec: can not create two interfaces using the same source-interface``
* :vytask:`T4584` ``(bug): hostap: create custom package build``
* :vytask:`T4413` ``(default): Add an API endpoint with basic system stats``
* :vytask:`T4537` ``(bug): MACsec not working with cipher gcm-aes-256``


2022-08-15
==========

* :vytask:`T4609` ``(bug): Unable to Restart Container VyOS 1.4``
* :vytask:`T4565` ``(bug): vlan aware bridge not working with - Kernel: T3318: update Linux Kernel to v5.4.205 #249``
* :vytask:`T3988` ``(default): Feature Request: IPsec Multiple local/remote prefix for the tunnel``
* :vytask:`T2763` ``(feature): New SNMP resource request - SNMP over TCP``


2022-08-14
==========

* :vytask:`T4579` ``(bug): bridge: can not delete member interface CLI option when VLAN is enabled``
* :vytask:`T4421` ``(default): Add support for floating point numbers in the numeric validator``
* :vytask:`T3507` ``(bug): Bond with mode LACP show u/u in show interfaces even if peer is not configured``


2022-08-12
==========

* :vytask:`T4603` ``(feature): Need a config option to specify NAS-IP-Address for vpn l2tp``


2022-08-10
==========

* :vytask:`T4408` ``(feature): Add sshguard to protect against brut-forces``


2022-08-08
==========

* :vytask:`T4586` ``(feature): Add to NAT66: SNAT destination address and DNAT source address.``


2022-08-04
==========

* :vytask:`T4257` ``(feature): Discussion on changing BGP autonomous system number syntax``


2022-08-02
==========

* :vytask:`T4585` ``(feature): Rewrite op-mode containers to vyos.opmode``
* :vytask:`T4515` ``(default): Reduce telegraf binary size``


2022-08-01
==========

* :vytask:`T4581` ``(bug): 'show system cpu' not working``
* :vytask:`T4578` ``(feature): Rewrite show dns forwarding statistics to new format``


2022-07-31
==========

* :vytask:`T4580` ``(bug): Handle the case of op-mode file names with hyphens in GraphQL schema/resolver generation``


2022-07-30
==========

* :vytask:`T4575` ``(feature): vyos.utill add new wrapper "rc_cmd" to get the return code and output``
* :vytask:`T4562` ``(feature): Rewrite show vrf to new format``
* :vytask:`T4545` ``(feature): Rewrite show nat source rules``
* :vytask:`T4543` ``(bug): Show source nat statistics shows incorrect interface``
* :vytask:`T4503` ``(default): Prevent op mode scripts from restarting services if there's a commit in progress``
* :vytask:`T4411` ``(feature): Add migration for service monitoring telegraf influxdb``


2022-07-29
==========

* :vytask:`T4554` ``(enhancment): Implement GraphQL resolvers for standardized op-mode scripts``
* :vytask:`T4518` ``(feature): Add XML for CLI conf mode load-balancing wan``
* :vytask:`T4544` ``(enhancment): Generate schema definitions from standardized op-mode scripts``


2022-07-28
==========

* :vytask:`T4531` ``(bug): NAT op-mode errors with exclude rules``
* :vytask:`T3435` ``(bug): NAT rules show corruption``


2022-07-27
==========

* :vytask:`T4571` ``(bug): Sflow with vrf configured does not use vrf to validate agent-address IP from vrf-configured interfaces``
* :vytask:`T4552` ``(bug): Unable to reset IPsec IPv6 peer``


2022-07-26
==========

* :vytask:`T4568` ``(bug): show vpn debug peer doesn't work``
* :vytask:`T4556` ``(feature): fastnetmon: Allow configure white_list_path and populate with hosts/networks that should be ignored.``
* :vytask:`T4495` ``(feature): Combine BGP reset op commands``


2022-07-25
==========

* :vytask:`T4567` ``(default): Merge experimental branch of GraphQL development``
* :vytask:`T4560` ``(bug): VRF and BGP neighbor local-as error``
* :vytask:`T4493` ``(bug): Incorrect help for "show bgp neighbors"``
* :vytask:`T1233` ``(bug): ipsec vpn sa showing down``


2022-07-22
==========

* :vytask:`T4145` ``(bug): Conntrack table not showing after firewall rewriting``


2022-07-21
==========

* :vytask:`T4555` ``(feature): fastnetmon: add IPv6 support``
* :vytask:`T4553` ``(default): Allow to set ban time on ddos-protection configuration``


2022-07-20
==========

* :vytask:`T4056` ``(bug): Traffic policy not set in live configuration``


2022-07-18
==========

* :vytask:`T4523` ``(feature): OP-mode Extend conntrack output to get marks, zones and directions``
* :vytask:`T4228` ``(bug): bond: OS error thrown when two bonds use the same member``
* :vytask:`T4539` ``(feature): qat: update Intel QuickAssist release version 1.7.L.4.16.0-00017``
* :vytask:`T4534` ``(bug): bond: bridge: error out if member interface is assigned to a VRF instance``
* :vytask:`T4525` ``(bug): Delete interface from VRF and add it to bonding error``
* :vytask:`T4522` ``(feature): bond: add ability to specify mii monitor interval via CLI``
* :vytask:`T4535` ``(feature): FRR: upgrade to stable/8.3 version``
* :vytask:`T4521` ``(bug): bond: ARP monitor interval is not configured despite set via CLI``
* :vytask:`T4540` ``(feature): firmware: update to Linux release 20220708``


2022-07-17
==========

* :vytask:`T4028` ``(bug): FRR 8.1 routes not being applied to routing table after reboot if an interface has 2 ip addresses``


2022-07-15
==========

* :vytask:`T4494` ``(bug): Cannot reset BGP peer within VRF``
* :vytask:`T4536` ``(feature): FRR: move to systemd for daemon control``


2022-07-14
==========

* :vytask:`T4491` ``(bug): Use empty string for internal name of root node of config_tree``


2022-07-13
==========

* :vytask:`T1375` ``(feature): Add clear  dhcp server  lease function``


2022-07-12
==========

* :vytask:`T4527` ``(bug): Prevent to create VRF name default``
* :vytask:`T4084` ``(default): Dehardcode the default login banner``
* :vytask:`T3948` ``(feature): IPSec VPN:  Add a new option "none" for the connection-type``
* :vytask:`T235` ``(feature): Ability to configure manual IP Rules``


2022-07-10
==========

* :vytask:`T3836` ``(bug): Setting a default IPv6 route while getting IPv4 gateway via DHCP removes the IPv4 gateway``


2022-07-09
==========

* :vytask:`T4507` ``(feature): IPoE-server add multiplier option for shaper``
* :vytask:`T4499` ``(bug): NAT source translation not showing a single output``
* :vytask:`T4468` ``(bug): web-proxy source group cannot start with a number bug``
* :vytask:`T4373` ``(feature): PPPoE-server add multiplier option for shaper``
* :vytask:`T3353` ``(bug): PPPoE server wrong vlan-range generating config``
* :vytask:`T3648` ``(bug): op-mode: nat rules broken``
* :vytask:`T4517` ``(feature): ip: Add options to enable directed broadcast forwarding``


2022-07-07
==========

* :vytask:`T4456` ``(bug): NTP client in VRF tries to bind to interfaces outside VRF, logs many messages``
* :vytask:`T4509` ``(feature): Feature Request: DNS64``


2022-07-06
==========

* :vytask:`T4513` ``(bug): Webproxy monitor commands do not work``
* :vytask:`T4299` ``(feature): Firewall - GeoIP filtering``


2022-07-05
==========

* :vytask:`T4378` ``(bug): Unable to submit wildcard ("*.example.com") A or AAAA records in dns forwarder``
* :vytask:`T2683` ``(default): no dual stack in system static-host-mapping host-name``
* :vytask:`T478` ``(feature): Firewall address group (multi and nesting)``


2022-07-04
==========

* :vytask:`T4501` ``(bug): Syslog-identifier does not work in event handler``
* :vytask:`T3600` ``(bug): DHCP Interface static route breaks PBR``
* :vytask:`T4498` ``(feature): bridge: Add option to enable/disable IGMP/MLD snooping``


2022-07-01
==========

* :vytask:`T2455` ``(bug): No support for the IPv6 VTI``
* :vytask:`T4490` ``(feature): BGP- warning message that AFI/SAFI is needed to establish the neighborship``
* :vytask:`T4489` ``(bug): MPLS sysctl not persistent for tunnel interfaces``


2022-06-29
==========

* :vytask:`T4477` ``(feature): router-advert: support RDNSS lifetime option``


2022-06-28
==========

* :vytask:`T4486` ``(bug): Container can't be deleted``
* :vytask:`T4473` ``(bug): Use container network without network declaration error``
* :vytask:`T4458` ``(feature): Firewall - add support for matching ip ttl in firewall rules``
* :vytask:`T3907` ``(feature): Firewall - Set log levels``


2022-06-27
==========

* :vytask:`T4484` ``(default): Firewall op-mode summary doesn't correctly handle address group containing ranges``


2022-06-25
==========

* :vytask:`T4482` ``(bug): dhcp: toggle of "dhcp-options no-default-route" has no effect``
* :vytask:`T4483` ``(feature): Upgrade fastnetmon to v1.2.2 community edition``


2022-06-22
==========

* :vytask:`T1748` ``(feature): vbash: beautify tab completion output/line breaks``


2022-06-20
==========

* :vytask:`T1856` ``(feature): Support configuring IPSec SA bytes``


2022-06-18
==========

* :vytask:`T4467` ``(bug): Validator Does Not Accept Signed Numbers``


2022-06-17
==========

* :vytask:`T4209` ``(bug): Firewall incorrect handler for recent count and time``


2022-06-16
==========

* :vytask:`T4352` ``(bug): wan-load balance - priority traffic rule doesn't work``


2022-06-15
==========

* :vytask:`T4450` ``(feature): Route-map - Extend options for ip|ipv6 address match``
* :vytask:`T4449` ``(feature): Route-map - Extend options for ip next-hop match``
* :vytask:`T990` ``(feature): Make DNAT/SNAT a valid state in firewall rules.``


2022-06-12
==========

* :vytask:`T4420` ``(feature): Feature Request: ocserv: show configured 2FA OTP key``
* :vytask:`T4380` ``(default): Feature Request: ocserv: 2FA OTP key generator in VyOS CLI``


2022-06-10
==========

* :vytask:`T4365` ``(bug): NAT - Error on setting up tables``
* :vytask:`T4465` ``(feature): node.def generation misses whitespace on multiple use of <path>``


2022-06-09
==========

* :vytask:`T4444` ``(default): sstp: Feature request. Port number changing support``
* :vytask:`T2580` ``(feature): Support for ip pools for ippoe``


2022-06-08
==========

* :vytask:`T4447` ``(bug): DHCPv6 prefix delegation `sla-id` limited to 128``


2022-05-31
==========

* :vytask:`T4212` ``(default): PermissionError when generating/installing server Certificate (generate pki certificate sign ...)``
* :vytask:`T4199` ``(bug): Commit failed when setting icmpv6 type any``
* :vytask:`T4148` ``(bug): Firewall - Error messages not that clear as it were in old firewall``
* :vytask:`T3659` ``(bug): Configuration won't accept IPv6 addresses for site-to-site VPN tunnel prefixes/traffic selectors``


2022-05-30
==========

* :vytask:`T4315` ``(feature): Telegraf - Output to prometheus``


2022-05-29
==========

* :vytask:`T2473` ``(feature): Xml for EIGRP [conf_mode]``


2022-05-28
==========

* :vytask:`T4448` ``(feature): rip: add support for explicit version selection``


2022-05-26
==========

* :vytask:`T4442` ``(feature): HTTP API add action "reset"``


2022-05-25
==========

* :vytask:`T4410` ``(feature): Telegraf - Output to Splunk``
* :vytask:`T4382` ``(bug): Replacing legacy loadFile exposes missing steps in migration scripts and other errors``


2022-05-21
==========

* :vytask:`T4437` ``(bug): flow-accounting: support IPv6 flow collectors``


2022-05-20
==========

* :vytask:`T4418` ``(feature): Telegraf - output Plugin azure-data-explorer``


2022-05-19
==========

* :vytask:`T4434` ``(bug): DMVPN: cisco-authentication password length is 8 characters``
* :vytask:`T3938` ``(default): Rewrite the uptime script in Python to allow using it as a library``
* :vytask:`T4334` ``(default): Make the config lexer reentrant``


2022-05-17
==========

* :vytask:`T4424` ``(bug): policy local-route6 shows ipv4 format``


2022-05-16
==========

* :vytask:`T4377` ``(default): generate tech-support archive includes previous archives``


2022-05-12
==========

* :vytask:`T4417` ``(bug): VRRP doesn't start with conntrack-sync``
* :vytask:`T4100` ``(feature): Firewall increase maximum number of rules``


2022-05-11
==========

* :vytask:`T4405` ``(bug): DHCP client sometimes ignores `no-default-route` option of an interface``


2022-05-10
==========

* :vytask:`T4156` ``(default): Adding DHCP Option 13 (bootfile-size)``
* :vytask:`T1972` ``(feature): Allow setting interface name for virtual_ipaddress in VRRP VRID``


2022-05-07
==========

* :vytask:`T4361` ``(bug): `vyos.config.exists()` does not work for nodes with multiple values``
* :vytask:`T4354` ``(bug): Slave interfaces fall out from bonding during configuration change``
* :vytask:`T4419` ``(feature): vrf: support to disable IP forwarding within a given VRF``


2022-05-06
==========

* :vytask:`T4385` ``(bug): bgp: peer-group member cannot override remote-as of peer-group``


2022-05-05
==========

* :vytask:`T4414` ``(feature): Add route-map "as-path prepend last-as x" option``


2022-05-03
==========

* :vytask:`T4395` ``(feature): Extend show vpn debug``


2022-05-01
==========

* :vytask:`T4369` ``(bug): OpenVPN: daemon not restarted on changes to "openvpn-option" CLI node``
* :vytask:`T4363` ``(bug): salt-minion: default mine_interval option is not set``
* :vytask:`T4353` ``(feature): Add Jinja2 linter to vyos-1x build process``


2022-04-29
==========

* :vytask:`T4388` ``(bug): dhcp-server: missing constraint on tftp-server-name option``
* :vytask:`T4366` ``(bug): geneve: interface is removed on changes to e.g. description``


2022-04-28
==========

* :vytask:`T4400` ``(bug): Container OP mode has delete where show and update should be``


2022-04-27
==========

* :vytask:`T4398` ``(bug): IPSec site-to-site generates unexpected passthrough option``
* :vytask:`T4397` ``(feature): arp: migrate static ARP entry configuration to get_config_dict() and make it VRF aware``
* :vytask:`T4357` ``(feature): Allow free-form setting of DHCPv6 server options``


2022-04-26
==========

* :vytask:`T4210` ``(bug): NAT source/destination negated ports throws an error``
* :vytask:`T4235` ``(default): Add config tree diff algorithm``


2022-04-25
==========

* :vytask:`T4390` ``(feature): op-mode: extend "show log" and "monitor log" with additional daemons/subsystems to read journalctl logs``
* :vytask:`T4391` ``(bug): PPPoE: IPv6 not working after system boot``


2022-04-24
==========

* :vytask:`T4342` ``(bug): "show ip ospf neighbor address x.x.x.x"  gives "unknown command" error``


2022-04-23
==========

* :vytask:`T4386` ``(default): Applying limiter on traffic-policy "in" fails, incorrectly reports mirror or redirect policy in use``


2022-04-22
==========

* :vytask:`T4389` ``(feature): dhcp: add vendor option support for Ubiquity Unifi controller``


2022-04-21
==========

* :vytask:`T4384` ``(feature): pppoe: replace default-route CLI option with common CLI nodes already present for DHCP``


2022-04-20
==========

* :vytask:`T4345` ``(bug): New firewall code does not accept "rate/time interval" syntax used in old config``
* :vytask:`T4231` ``(feature): Feature Request: ocserv: 2FA (password+OTP) support in Openconnect``


2022-04-19
==========

* :vytask:`T4379` ``(bug): PPPoE: default-route lost after applying additional static routes``
* :vytask:`T4344` ``(bug): DHCP statistics not matching, conf-mode generates incorrect pool name with dash``
* :vytask:`T4268` ``(bug): Elevated LA while using VyOS monitoring feature``


2022-04-18
==========

* :vytask:`T4351` ``(bug): Openvpn conf-mode "openvpn-option" is not respected``
* :vytask:`T4278` ``(default): vyos-vm-images: fix vagrant libvirt box``
* :vytask:`T4368` ``(bug): bgp: AS specified for local as is the same as the remote as and this is not allowed.``
* :vytask:`T4370` ``(feature): vxlan: geneve: support configuration of df bit option``


2022-04-15
==========

* :vytask:`T4327` ``(default): Ethernet interface configuration fails on Hyper-V due to speed/duplex/autoneg ethtool command error``
* :vytask:`T4364` ``(feature): salt-minion: Upgrade to 3004 and migrate to get_config_dict()``


2022-04-13
==========

* :vytask:`T4333` ``(feature): Jinja2: add plugin to test if a variable is defined and not none to reduce template complexity``


2022-04-08
==========

* :vytask:`T4331` ``(bug): IPv6 link local addresses are not configured when an interface is in a VRF``
* :vytask:`T4347` ``(default): Return complete and consistent error codes from HTTP API``
* :vytask:`T4339` ``(bug): wwan: tab-completion results in "No such file or directory" if there is no WWAN interface``
* :vytask:`T4338` ``(bug): wwan: changing interface description should not trigger reconnect``
* :vytask:`T4324` ``(bug): wwan: check alive script should only be run via cron if a wwan interface is configured at all``


2022-04-07
==========

* :vytask:`T4330` ``(bug): MTU settings cannot be applied when IPv6 is disabled``
* :vytask:`T4346` ``(feature): Deprecate "system ipv6 disable" option to disable address family within OS kernel``
* :vytask:`T4319` ``(bug): The command "set system ipv6 disable" doesn't work as expected.``
* :vytask:`T4341` ``(feature): login: disable user-account prior to deletion and wait until deletion is complete``
* :vytask:`T4336` ``(feature): isis: add support for MD5 authentication password on a circuit``


2022-04-06
==========

* :vytask:`T4308` ``(feature): Op-comm "Show log frr"  to view specific protocol logs``


2022-04-04
==========

* :vytask:`T4329` ``(bug): Bgp policy route-map bug with set several extcommunity rt``


2022-04-02
==========

* :vytask:`T4335` ``(bug): open-vmdk fails to build under gcc-10.+``


2022-04-01
==========

* :vytask:`T4332` ``(bug): bgp: deterministic-med cannot be disabled while addpath-tx-bestpath-per-AS is in use``


2022-03-31
==========

* :vytask:`T4326` ``(feature): Add bgp option no-suppress-duplicates``
* :vytask:`T4323` ``(default): ospf6d crashes on latest vyos nightly``


2022-03-29
==========

* :vytask:`T3686` ``(bug): Bridging OpenVPN tap with no local-address breaks``
* :vytask:`T3635` ``(default): Add ability to use mDNS repeater with VRRP``


2022-03-26
==========

* :vytask:`T4321` ``(default): Allow BGP neighbors between different VIFs on the same VyOS``


2022-03-24
==========

* :vytask:`T4301` ``(bug): The "arp-monitor" option in bonding interface settings does not work``
* :vytask:`T4294` ``(bug): Adding a new openvpn-option does not restart the OpenVPN process``
* :vytask:`T4290` ``(bug): BGP source-interface fails to commit``
* :vytask:`T4230` ``(bug): OpenVPN server configuration deleted after reboot when using a VRRP virtual-address``


2022-03-23
==========

* :vytask:`T4314` ``(bug): Latest 1.4 Rolling release config migration error``


2022-03-21
==========

* :vytask:`T4304` ``(feature): [OSPF]import/export filter inter-area prefix``


2022-03-20
==========

* :vytask:`T4298` ``(default): vyos-vm-images: fix ansible group name and remove obsolete empty command``


2022-03-18
==========

* :vytask:`T4286` ``(bug): Fix for firewall ipv6 name address validator``


2022-03-15
==========

* :vytask:`T4302` ``(feature): FRRouting upgrade to release 8.2.2``
* :vytask:`T4293` ``(default): Add "set ip-next-hop unchanged" in route-map``


2022-03-14
==========

* :vytask:`T4275` ``(default): Incorrect val_help for local/remote prefix in ipsec vpn``


2022-03-12
==========

* :vytask:`T4296` ``(bug): Interface config injected by Cloud-Init may interfere with VyOS native``
* :vytask:`T4265` ``(feature): Add op-mode for bgp flowspec state and routes``


2022-03-11
==========

* :vytask:`T4297` ``(bug): Interface configuration saving fails for ice/iavf based interfaces because they can't change speed/duplex settings``


2022-03-09
==========

* :vytask:`T3981` ``(feature): VRF support for flow-accounting``


2022-03-05
==========

* :vytask:`T4259` ``(bug): The conntrackd daemon can be started wrongly``


2022-03-03
==========

* :vytask:`T4283` ``(feature): Add support to "reject" routes - emit an ICMP unreachable when matched``


2022-03-01
==========

* :vytask:`T4277` ``(feature): flow-accounting: support sending flow-data via VRF interface``


2022-02-28
==========

* :vytask:`T4273` ``(bug): ssh: Upgrade from 1.2.X to 1.3.0 breaks config``
* :vytask:`T4115` ``(bug): reboot in <x> not working as expected``
* :vytask:`T3656` ``(bug): IPSec 1.4 : "show vpn ike sa" does not show the correct default ike version``


2022-02-26
==========

* :vytask:`T4272` ``(feature): lldp: migrate Python script to use get_config_dict()``


2022-02-24
==========

* :vytask:`T4267` ``(bug): Error - Missing required "ip key" parameter``


2022-02-23
==========

* :vytask:`T4194` ``(bug): prefix-list no check for duplicate entries``
* :vytask:`T4264` ``(bug): vxlan: interface is destroyed and rebuild on description change``
* :vytask:`T4263` ``(bug): vyos.util.leaf_node_changed() dos not honor valueLess nodes``


2022-02-21
==========

* :vytask:`T4120` ``(feature): [VXLAN] add ability to set multiple unicast-remotes``


2022-02-20
==========

* :vytask:`T4254` ``(feature): VPN IPSec charon add options cisco_flexvpn and install_virtual_ip_on``
* :vytask:`T4249` ``(feature): Add support for device mapping in containers``
* :vytask:`T3617` ``(bug): IPSec 1.4 generate invalid configuration``
* :vytask:`T4261` ``(feature): MACsec: add DHCP client support``
* :vytask:`T4203` ``(bug): Reconfigure DHCP client interface causes brief outages``


2022-02-19
==========

* :vytask:`T4258` ``(bug): [DHCP-SERVER]  error parameter on Failover``


2022-02-17
==========

* :vytask:`T4255` ``(bug): Unexpected print of dict bridge on delete``
* :vytask:`T4240` ``(bug): Cannot add wlan0 to bridge via configure``
* :vytask:`T4154` ``(bug): Error add second gre tunnel with the same source interface``


2022-02-16
==========

* :vytask:`T4237` ``(bug): Conntrack-sync error - error adding listen-address command``


2022-02-15
==========

* :vytask:`T4160` ``(bug): Firewall - Error in rules that matches everything except something``
* :vytask:`T3006` ``(bug): Accel-PPP & vlan-mon config get invalid VLAN``
* :vytask:`T3494` ``(bug): DHCPv6 leases traceback when PD using``
* :vytask:`T1292` ``(bug): Issues while deleting all rules from a firewall``


2022-02-13
==========

* :vytask:`T4242` ``(bug): ethernet speed/duplex can never be switched back to auto/auto``
* :vytask:`T4191` ``(bug): Lost access to host after VRF re-creating``


2022-02-11
==========

* :vytask:`T3872` ``(feature): Add configurable telegraf monitoring service``


2022-02-08
==========

* :vytask:`T4227` ``(bug): Typo in help completion of hello-time option of bridge interface``


2022-02-07
==========

* :vytask:`T4233` ``(bug): ssh: sync regex for allow/deny usernames to "system login"``


2022-02-06
==========

* :vytask:`T4223` ``(bug): policy route cannot have several entries with the same table``
* :vytask:`T4216` ``(bug): Firewall: can't use negated groups in firewall rules``
* :vytask:`T4178` ``(bug): policy based routing tcp flags issue``
* :vytask:`T4164` ``(bug): PBR: network groups (as well as address and port groups) don't resolve in `nftables_policy.conf```
* :vytask:`T3970` ``(feature): Add support for op-mode PKI direct install into an active config session``
* :vytask:`T3828` ``(bug): ipsec: Subtle change in "pfs enable" behavior from equuleus -> sagitta``


2022-02-05
==========

* :vytask:`T4226` ``(bug): VRRP transition-script does not work for groups name which contains -(minus) sign``


2022-02-04
==========

* :vytask:`T4196` ``(bug): DHCP server client-prefix-length parameter results in non-functional leases``


2022-02-03
==========

* :vytask:`T4218` ``(bug): firewall: rule name is not allowed to start with a number``
* :vytask:`T3643` ``(bug): show vpn ipsec sa doesn't show tunnels in "down" state``


2022-02-01
==========

* :vytask:`T4224` ``(bug): Ethernet interfaces configured for DHCP not working on latest rolling snapshot (vyos-1.4-rolling-202201291849-amd64.iso)``
* :vytask:`T4225` ``(bug): Performance degration with latest rolling release``
* :vytask:`T4220` ``(bug): Commit broke dhclient 78b247b724f74bdabab0706aaa7f5b00e5809bc1``
* :vytask:`T4138` ``(bug): NAT configuration allows to set incorrect port range and invalid port``


2022-01-28
==========

* :vytask:`T4184` ``(bug): NTP allow-clients address doesn't work it allows to use ntp server for all addresses``
* :vytask:`T4217` ``(bug): firewall: port-group requires protocol to be set - but not in VyOS 1.3``


2022-01-27
==========

* :vytask:`T4213` ``(default): ipv6 policy routing not working anymore``
* :vytask:`T4188` ``(bug): Firewall does not correctly handle conntracking``
* :vytask:`T3762` ``(feature): Support network and address groups for policy ipv6-route``
* :vytask:`T3560` ``(feature): Ability to create groups of MAC addresses``
* :vytask:`T3495` ``(feature): Modernising port/protocol definitions``


2022-01-25
==========

* :vytask:`T4205` ``(feature): Disable Debian Version in SSH (DebianBanner->no)``
* :vytask:`T4131` ``(bug): Show firewall group incorrect format members``


2022-01-24
==========

* :vytask:`T4204` ``(feature): Update Accel-PPP to a newer revision``
* :vytask:`T1795` ``(default): Commit rollback by timeout``


2022-01-23
==========

* :vytask:`T4186` ``(bug): Firewall icmp type - Offered options not supported``
* :vytask:`T4181` ``(bug): Firewall ipv6-network-group - incorrect description on helper``


2022-01-21
==========

* :vytask:`T4200` ``(bug): Assigning ipv6-name to interface is not generating nftables rules``
* :vytask:`T4144` ``(bug): Firewall address-group - Improve error messages``
* :vytask:`T4137` ``(bug): Firewall group configuration allows to set incorrect port range and invalid port``
* :vytask:`T4133` ``(bug): Firewall network group error with zone-based firewall rules``


2022-01-20
==========

* :vytask:`T4171` ``(bug): Interface config migration error on 1.2.8 -> 1.4 upgrade``


2022-01-19
==========

* :vytask:`T4195` ``(feature): [OSPF-ECMP]enable set maximun-path``


2022-01-18
==========

* :vytask:`T4159` ``(bug): Empty firewall group (address, network & port) generates invalid nftables config, commit fails``
* :vytask:`T4155` ``(bug): PBR: `set table main` fails in `firewall.py` with newer rolling releases``
* :vytask:`T3873` ``(feature): Zone based Firewall - Filter traffic in same zone``
* :vytask:`T3286` ``(feature): Switch the firewall from iptables to nftables``
* :vytask:`T292` ``(feature): [ZBF] Allow filtering intra zone traffic``


2022-01-17
==========

* :vytask:`T3164` ``(bug): console-server ssh does not work with RADIUS PAM auth``


2022-01-15
==========

* :vytask:`T4183` ``(feature): IPv6 link-local address not accepted as wireguard peer``
* :vytask:`T4150` ``(bug): VRRP with conntrack-sync does not work``
* :vytask:`T4110` ``(feature): [IPV6-SSH/DNS}  enable IPv6 link local adresses as listen-address %eth0``


2022-01-14
==========

* :vytask:`T4182` ``(bug): Show vrrp if vrrp not configured bug``
* :vytask:`T4179` ``(feature): Add op-mode CLI for show high-availability virtual-server``


2022-01-13
==========

* :vytask:`T4175` ``(bug): BGP configuration failed``
* :vytask:`T4109` ``(feature): Extend high-availability/keepalived for support virtual-server lb``


2022-01-12
==========

* :vytask:`T4174` ``(bug): Validation fails when entering port range with upper port 65535``
* :vytask:`T4162` ``(bug): VPN ipsec ike-group - Incorrect value help for ikev2-reauth``
* :vytask:`T4161` ``(bug): Policy route-map - Incorrect value help for local preference``
* :vytask:`T4152` ``(bug): NHRP shortcut-target holding-time does not work``


2022-01-11
==========

* :vytask:`T4149` ``(bug): [Firewall-IPV6] Error delete Fw rules on VIF/INT``
* :vytask:`T3950` ``(bug): CLI backtrace on update if DNS not defined``
* :vytask:`T4166` ``(bug): Debug output missing when frr.py called under vyos-configd``


2022-01-10
==========

* :vytask:`T3299` ``(bug): Allow the web proxy service to listen on all IP addresses``
* :vytask:`T3115` ``(feature): Add support for firewall on L3 VIF bridge interface``


2022-01-09
==========

* :vytask:`T4142` ``(bug): Input ifbX interfaces not displayed in op-mode``
* :vytask:`T3914` ``(bug): VRRP rfc3768-compatibility doesn't work with unicast peers``


2022-01-08
==========

* :vytask:`T4116` ``(bug): Webproxy/Squid not working with IPv6 listen-address``


2022-01-07
==========

* :vytask:`T3924` ``(bug): VRRP stops working with VRF``


2022-01-06
==========

* :vytask:`T4135` ``(bug): Declare zone policy firewall without local zone errors``
* :vytask:`T4130` ``(bug): Firewall state policy errors chain``
* :vytask:`T4141` ``(bug): Set high-availability vrrp sync-group without members error``


2022-01-04
==========

* :vytask:`T4134` ``(bug): Incorrect firewall protocol completion help uppercase and duplicates``
* :vytask:`T4132` ``(bug): Impossible to show a specific firewall group``


2022-01-03
==========

* :vytask:`T4126` ``(feature): Ability to set priority to site to site IPSec vpn tunnels``
* :vytask:`T4052` ``(bug): Validator return traceback on VRRP configuration with the script path not in config dir``
* :vytask:`T4128` ``(bug): keepalived: Upgrade package to add VRF support``


2021-12-31
==========

* :vytask:`T4081` ``(bug): VRRP health-check script stops working when setting up a sync group``


2021-12-30
==========

* :vytask:`T4124` ``(feature): snmp: migrate to get_config_dict()``


2021-12-29
==========

* :vytask:`T4111` ``(bug): IPSec generates wrong configuration colons for IPv6 peers``
* :vytask:`T4023` ``(feature): Add grepcidr or similar functionality``
* :vytask:`T4086` ``(default): system login banner is not removed on deletion.``


2021-12-28
==========

* :vytask:`T3380` ``(bug): "show vpn ike sa" does not display IPv6 peers``


2021-12-27
==========

* :vytask:`T3979` ``(bug): vyos-hostd unable to hostfile-update``
* :vytask:`T2566` ``(bug): sstp not able to run tunnels ipv6 only``
* :vytask:`T4093` ``(bug): SNMPv3 snmpd.conf generation bug``
* :vytask:`T2764` ``(enhancment): Increase maximum number of NAT rules``


2021-12-26
==========

* :vytask:`T4104` ``(bug): RAID1: "add raid md0 member sda1" does not restore boot sector``
* :vytask:`T4108` ``(default): OSPFv3: add support for auto-cost parameter``
* :vytask:`T4107` ``(default): OSPFv3: add support for "default-information originate"``


2021-12-25
==========

* :vytask:`T4101` ``(bug): commit-archive: Use of uninitialized value $source_address in concatenation``
* :vytask:`T4099` ``(feature): flow-accounting: sync "source-ip" and "source-address" between netflow and sflow ion CLI``
* :vytask:`T4097` ``(feature): flow-accounting: migrate implementation to get_config_dict()``
* :vytask:`T4105` ``(feature): flow-accounting: drop "sflow agent-address auto"``
* :vytask:`T4106` ``(feature): flow-accounting: support specification of capture packet lenght``
* :vytask:`T4102` ``(feature): OSPFv3: add support for NSSA area-type``
* :vytask:`T4055` ``(feature): Add VRF support for HTTP(S) API service``


2021-12-24
==========

* :vytask:`T3854` ``(bug): Missing op-mode commands for conntrack-sync``


2021-12-23
==========

* :vytask:`T3354` ``(default): Convert strip-private script from Perl to Python``


2021-12-22
==========

* :vytask:`T3678` ``(bug): VyOS 1.4: Invalid error message while deleting ipsec vpn configuration``
* :vytask:`T3356` ``(feature): Script for remote file transfers``


2021-12-21
==========

* :vytask:`T4083` ``(bug): Cluster heartbeat doesn't start b.c lack of directory /run/heartbeat/``
* :vytask:`T4070` ``(bug): NATv4 : inbound-interface type "any" is missing.``
* :vytask:`T4053` ``(bug): VRRP impossible to set scripts out of the /config directory``
* :vytask:`T3931` ``(bug): SSTP doesn't work after rewriting to PKI``


2021-12-20
==========

* :vytask:`T4088` ``(default): Fix typo in login banner``


2021-12-19
==========

* :vytask:`T3912` ``(default): Use a more informative default post-login banner``


2021-12-17
==========

* :vytask:`T4059` ``(bug): VRRP sync-group transition script does not persist after reboot``


2021-12-16
==========

* :vytask:`T4046` ``(feature): Sflow - Add Source address parameter``
* :vytask:`T3556` ``(bug): Commit-archive via scp causes 100% CPU on boot``
* :vytask:`T4076` ``(enhancment): Allow setting CORS options in HTTP API``
* :vytask:`T4037` ``(default): HTTP transfers do not follow redirects``
* :vytask:`T4029` ``(default): Broken SFTP uploads``


2021-12-15
==========

* :vytask:`T4077` ``(bug): op-mode: bfd: drop "show protocols bfd" in favour of "show bfd"``
* :vytask:`T4073` ``(bug): "show protocols bfd peer <>" shows incorrect peer information.``


2021-12-14
==========

* :vytask:`T4071` ``(feature): Allow HTTP API to bind to unix domain socket``


2021-12-12
==========

* :vytask:`T4069` ``(feature): BGP: add additional available parameters to VyOS CLI``
* :vytask:`T4036` ``(bug): VXLAN incorrect raiseError if set multicast network instead of singe address``


2021-12-10
==========

* :vytask:`T4068` ``(feature): Python: ConfigError should insert line breaks into the error message``


2021-12-09
==========

* :vytask:`T4033` ``(bug): VRRP - Error security when setting scripts``
* :vytask:`T4064` ``(bug): IP address for vif is not removed from the system when deleted in configuration``
* :vytask:`T4060` ``(enhancment): Extend configquery for use before boot configuration is complete``
* :vytask:`T4058` ``(bug): BFD: add BGP and OSPF "bfd profile" support``
* :vytask:`T4054` ``(bug): BFD profiles configuration incorrect behavior.``


2021-12-07
==========

* :vytask:`T4041` ``(servicerequest): "transition-script" doesn't work on "sync-group"``


2021-12-06
==========

* :vytask:`T4012` ``(feature): Add VRF support for TFTP``


2021-12-04
==========

* :vytask:`T4049` ``(feature): support command-style output with compare command``
* :vytask:`T4047` ``(bug): Wrong regex validation in XML definitions``
* :vytask:`T4042` ``(bug): BGP L2VPN / EVPN and RD type 0 set``
* :vytask:`T4048` ``(bug): BGP: L2VPN/EVPN and individual RD and RT settings for each VNI``
* :vytask:`T4045` ``(bug): Unable to "format disk <new> like <old>"``
* :vytask:`T4044` ``(feature): BFD: add vrf support``
* :vytask:`T4043` ``(feature): BFD: add support for passive mode``


2021-12-02
==========

* :vytask:`T4035` ``(bug): Geneve interfaces aren't displayed by operational mode commands``


2021-12-01
==========

* :vytask:`T3695` ``(bug): OpenConnect reports commit success when ocserv fails to start due to SSL cert/key file issues``


2021-11-30
==========

* :vytask:`T4010` ``(bug): DMVPN generates incorrect configuration life_time for swanctl.conf``
* :vytask:`T3725` ``(feature): show configuration in json format``


2021-11-29
==========

* :vytask:`T3946` ``(enhancment): Automatically resize the root partition if the drive has extra space``


2021-11-28
==========

* :vytask:`T3999` ``(bug): show lldp neighbor Traceback error``
* :vytask:`T3928` ``(feature): Add OSPFv3 VRF support``


2021-11-27
==========

* :vytask:`T3755` ``(feature): ospf: adjust to new FRR 8 syntax where "no passive-interface " moved to interface section``
* :vytask:`T3753` ``(feature): frr: upgrade to stable/8.1 release train``


2021-11-26
==========

* :vytask:`T3978` ``(bug): containers add network without declaring prefix raise ConfigError``


2021-11-25
==========

* :vytask:`T4006` ``(default): Add additional Linux capabilities to container configuration``
* :vytask:`T3986` ``(bug): Incorrect description for vpn ipsec site-to-site authentication and connection``


2021-11-24
==========

* :vytask:`T4015` ``(feature): Update Accel-PPP to a newer revision``
* :vytask:`T3865` ``(bug): loadkey command help text missing escape sequence``
* :vytask:`T1083` ``(feature): Implement persistent/random address and port mapping options for NAT rules``


2021-11-23
==========

* :vytask:`T3990` ``(bug): WATCHFRR: crashlog and per-thread log buffering unavailable (due to files left behind in /var/tmp/frr/ after reboot)``


2021-11-20
==========

* :vytask:`T3998` ``(bug): route-target completion incorrect description``


2021-11-19
==========

* :vytask:`T4003` ``(bug): API for "show interfaces ethernet" does not include the interface description``
* :vytask:`T4011` ``(bug): ethernet: deleting interface should place interface in admin down state``


2021-11-18
==========

* :vytask:`T3612` ``(bug): IPoE Server address pool issues.``
* :vytask:`T3995` ``(feature): OpenVPN: do not stop/start service on configuration change``
* :vytask:`T4008` ``(feature): dhcp: change client retry interval form 300 -> 60 seconds``
* :vytask:`T3795` ``(bug): WWAN: issues with non connected interface / no signal``
* :vytask:`T3510` ``(bug): RADIUS usersname is not shown on CLI``


2021-11-17
==========

* :vytask:`T3350` ``(bug): OpenVPN config file generation broken``
* :vytask:`T3996` ``(bug): SNMP service error in log``


2021-11-15
==========

* :vytask:`T3994` ``(bug): VRF: unable to delete vrf when name contains numbers, hyphen or underscore``
* :vytask:`T3960` ``(bug): FRR Misconfig when using multiple VRF VNI``
* :vytask:`T3724` ``(feature): Allow setting host-name in l2tp section of accel-ppp``
* :vytask:`T645` ``(feature): Allow multiple prefixes in ipsec tunnel``


2021-11-10
==========

* :vytask:`T3966` ``(default): OpenVPN fix the smoketests``
* :vytask:`T3834` ``(default): [OPENVPN] Support for Two Factor Authentication totp.``
* :vytask:`T3982` ``(bug): DHCP server commit fails if static-mapping contains + or .``


2021-11-09
==========

* :vytask:`T3962` ``(bug): Image cannot be built without open-vm-tools``


2021-11-07
==========

* :vytask:`T3626` ``(bug): Configuring and disabling DHCP Server``


2021-11-06
==========

* :vytask:`T3514` ``(bug): NIC flap at any interface change``


2021-11-05
==========

* :vytask:`T3972` ``(bug): Removing vif-c interface raises KeyError``


2021-11-04
==========

* :vytask:`T3969` ``(bug): Container incorrect raiseError format if network doesn't exist``
* :vytask:`T3662` ``(bug): Container configuration upgrade destroys system``
* :vytask:`T3964` ``(bug): SSTP: local-user static-ip CLI node accepts invalid IPv4 addresses``


2021-11-03
==========

* :vytask:`T3952` ``(default): Add sh bgp ipv4/ipv6 vpn command``
* :vytask:`T3610` ``(bug): DHCP-Server creation for not primary IP address fails``


2021-11-01
==========

* :vytask:`T3958` ``(default): OpenVPN breaks the smoketests``
* :vytask:`T3956` ``(bug): GRE tunnel - unable to move from source-interface to source-address, commit error``


2021-10-31
==========

* :vytask:`T3945` ``(feature): Add route-map for bgp aggregate-address``
* :vytask:`T3954` ``(bug): FTDI cable makes VyOS sagitta latest hang, /dev/serial unpopulated, config system error``
* :vytask:`T3943` ``(bug): "netflow source-ip" prevents image upgrades if IP address does not exist locally``


2021-10-29
==========

* :vytask:`T3942` ``(feature): Generate IPSec debug archive from op-mode``


2021-10-28
==========

* :vytask:`T3951` ``(bug): After resetting vti ipsec tunnel old child SA still active``
* :vytask:`T3941` ``(bug): "show vpn ipsec sa" shows established time of parent SA not child SA's``
* :vytask:`T3916` ``(feature): Add additional Linux capabilities to container configuration``


2021-10-27
==========

* :vytask:`T3944` ``(bug): VRRP fails over when adding new group to master``


2021-10-22
==========

* :vytask:`T3897` ``(feature): Dynamic DNS doesn't work with IPv6 addresses``
* :vytask:`T3832` ``(feature): Allow to set DHCP client-id in hexadecimal format``
* :vytask:`T3188` ``(bug): Tunnel local-ip to dhcp-interface Change Fails to Update``
* :vytask:`T3917` ``(default): Use Avahi as mDNS repeater for IPv6 support``


2021-10-21
==========

* :vytask:`T3926` ``(bug): strip-private does not sanitize "cisco-authentication" from NHRP configuration``
* :vytask:`T3925` ``(feature): Tunnel: dhcp-interface not implemented - use source-interface instead``
* :vytask:`T3923` ``(feature): Kernel: Enable TLS/IPSec offload support for Mellanox ConnectX NICs``
* :vytask:`T3927` ``(feature): Kernel: Enable kernel support for HW offload of the TLS protocol``


2021-10-20
==========

* :vytask:`T3918` ``(bug): DHCPv6 prefix delegation incorrect verify error``
* :vytask:`T3921` ``(bug): tunnel: KeyError when using dhcp-interface``


2021-10-19
==========

* :vytask:`T3396` ``(bug): syslog can't be configured with an ipv6 literal destination in 1.2.x``


2021-10-18
==========

* :vytask:`T3002` ``(default): VRRP change on IPSec interface causes packet routing issues``


2021-10-17
==========

* :vytask:`T3786` ``(bug): GRE tunnel source address 0.0.0.0 error``
* :vytask:`T3217` ``(default): Save FRR configuration on each commit``
* :vytask:`T3381` ``(bug): Change GRE tunnel failed``
* :vytask:`T3254` ``(bug): Dynamic DNS status shows incorrect last update time``
* :vytask:`T1243` ``(bug): BGP local-as accept wrong values``
* :vytask:`T697` ``(bug): Clean up and sanitize package dependencies``
* :vytask:`T578` ``(feature): Support Linux Container``


2021-10-16
==========

* :vytask:`T3879` ``(bug): GPG key verification fails when upgrading from a 1.3 beta version``


2021-10-15
==========

* :vytask:`T3748` ``(bug): Container deletion bug``
* :vytask:`T3693` ``(feature): ISIS Route redistribution ipv6 support missing``
* :vytask:`T3676` ``(feature): Container option to add Linux capabilities``
* :vytask:`T3613` ``(feature): Selectors for route-based IPsec tunnel (vti)``
* :vytask:`T3692` ``(bug): VyOS build failing due to  repo.saltstack.com``
* :vytask:`T3673` ``(feature): BGP large-community del operation missing``


2021-10-14
==========

* :vytask:`T3811` ``(bug): NAT (op_mode): NAT op_mode command fails.``
* :vytask:`T3801` ``(feature): containers: do not use podman CLI to create container networks``


2021-10-13
==========

* :vytask:`T3904` ``(bug): NTP pool associations silently fail``
* :vytask:`T3277` ``(feature): DNS Forwarding - reverse zones``


2021-10-12
==========

* :vytask:`T3216` ``(bug): Removal of restricted-shell broke configure mode for RADIUS users``
* :vytask:`T3881` ``(bug): Wrong description for container section restart``
* :vytask:`T3868` ``(bug): Regex and/or wildcard not accepted with large-community-list``
* :vytask:`T3701` ``(bug): ipoe server fails to start when configuring radius dynamic-author on ipoe``


2021-10-10
==========

* :vytask:`T3750` ``(bug): pdns-recursor 4.4 issue with dont-query and private DNS servers``
* :vytask:`T3885` ``(default): dhcpv6-pd: randomly generated DUID is not persisted``
* :vytask:`T3899` ``(enhancment): Add support for hd44780 LCD displays``


2021-10-09
==========

* :vytask:`T3894` ``(bug): Tunnel Commit Failed if system does not have `eth0```


2021-10-08
==========

* :vytask:`T3893` ``(bug): MGRE Tunnel commit crash If sit tunnel available``


2021-10-05
==========

* :vytask:`T3741` ``(feature): [BGP] default no-ipv4-unicast - by default``


2021-10-04
==========

* :vytask:`T3888` ``(bug): Incorrect warning when poweroff command executed from configure mode.``
* :vytask:`T3890` ``(feature): dhcp(v6): provide op-mode commands to retrieve both server and client logfiles``
* :vytask:`T3889` ``(feature): Migrate to journalctl when reading daemon logs``


2021-10-03
==========

* :vytask:`T3880` ``(bug): EFI boot shows error on display``


2021-10-02
==========

* :vytask:`T3882` ``(feature): Upgrade PowerDNs recursor to 4.5 series``
* :vytask:`T3883` ``(bug): VRF - Delette vrf config on interface``


2021-09-30
==========

* :vytask:`T3874` ``(bug): D-Link Ethernet Interface not working.``
* :vytask:`T3869` ``(default): Rewrite vyatta_net_name/vyatta_interface_rescan in Python``


2021-09-28
==========

* :vytask:`T3853` ``(default): nat66 rules gets deleted on reboot in 1.4-rolling-202109240217``


2021-09-27
==========

* :vytask:`T3863` ``(default): nat66: commit fails/hangs on non existing interface``


2021-09-26
==========

* :vytask:`T3860` ``(bug): Error on pppoe, tunnel and wireguard interfaces for IPv6 EUI64 addresses``
* :vytask:`T3857` ``(feature): reboot: send wall message to all users for information``
* :vytask:`T3867` ``(bug): vxlan: multicast group address is not validated``
* :vytask:`T3859` ``(bug): Add "log-adjacency-changes" to ospfv3 process``
* :vytask:`T3826` ``(bug): PKI: op-mode - do input validation when listing certificates``


2021-09-25
==========

* :vytask:`T3657` ``(default): BGP neighbors ipv6 not able to establish with IPv6 link-local addresses``


2021-09-23
==========

* :vytask:`T3850` ``(bug): Dots are no longer allowed in SSH public key names``


2021-09-21
==========

* :vytask:`T3847` ``(feature): keepalived/vrrp: migrate to get_config_dict() - cleanup``


2021-09-20
==========

* :vytask:`T3823` ``(bug): strip-private does not filter public IPv6 addresses``


2021-09-19
==========

* :vytask:`T3841` ``(feature): dhcp-server: add ping-check option to CLI``
* :vytask:`T2738` ``(bug): Modifying configuration in the "interfaces" section from VRRP transition scripts causes configuration lockup and high CPU utilization``
* :vytask:`T3840` ``(feature): dns forwarding: Cache size should allow values > 10k``
* :vytask:`T3672` ``(bug): DHCP-FO with multiple subnets results in invalid/non-functioning dhcpd.conf configuration file output``


2021-09-18
==========

* :vytask:`T3831` ``(bug): External traffic stops routing when IPSEC tunnel comes up with interface vti0``
* :vytask:`T1968` ``(default): Allow multiple static routes in dhcp-server``
* :vytask:`T3838` ``(feature): dhcp-server - sync cli for name-servers to other subsystems``
* :vytask:`T3839` ``(feature): dhcp-server: Allow configuration of a DNS server and domain name on the shared-network level``


2021-09-17
==========

* :vytask:`T3830` ``(bug): ipsec: remote-id no longer included in IKE AUTH if not explicitly specified``


2021-09-11
==========

* :vytask:`T3402` ``(feature): Add VyOS programming library for operational level commands``


2021-09-10
==========

* :vytask:`T3802` ``(bug): Commit fails if ethernet interface doesn't support flow control``
* :vytask:`T3819` ``(bug): Upgrade Salt Stack 3002.3 -> 3003 release train``
* :vytask:`T915` ``(feature): MPLS Support``


2021-09-09
==========

* :vytask:`T3812` ``(bug): Vyos and frr route-map config out of sync``
* :vytask:`T3814` ``(bug): wireguard: commit error showing incorrect peer name from the configured name``
* :vytask:`T3805` ``(bug): OpenVPN insufficient privileges for rtnetlink when closing TUN/TAP interface``
* :vytask:`T3815` ``(bug): pki : the file command 'generate pki wireguard key-pair file' is not working``


2021-09-07
==========

* :vytask:`T1894` ``(bug): FRR config not loaded after daemons segfault or restart``
* :vytask:`T3807` ``(bug): Op Command "show interfaces wireguard"  does not show the output``


2021-09-06
==========

* :vytask:`T3806` ``(bug): Don't set link local ipv6 address if MTU less then 1280``
* :vytask:`T3803` ``(default): Add source-address option to the ping CLI``
* :vytask:`T3431` ``(bug): Show version all bug``
* :vytask:`T2920` ``(bug): Commit crash when adding the second mGRE tunnel with the same key``


2021-09-05
==========

* :vytask:`T3804` ``(feature): cli: Migrate and merge "system name-servers-dhcp" into "system name-server"``


2021-09-04
==========

* :vytask:`T3619` ``(bug): Performance Degradation 1.2 --> 1.3 | High ksoftirqd CPU usage``


2021-09-03
==========

* :vytask:`T3788` ``(bug): Keys are not allowed with ipip and sit tunnels``
* :vytask:`T3634` ``(feature): Add op command option for ping for do not fragment bit to be set``
* :vytask:`T3798` ``(feature): bgp: add support for "neighbor <X> local-as replace-as" option``


2021-09-02
==========

* :vytask:`T3792` ``(bug): login: A hypen present in a username from "system login user" is replaced by an underscore``
* :vytask:`T3790` ``(bug): Does not possible to configure PPTP static ip-address to users``
* :vytask:`T2947` ``(bug): Nat translation many-many with prefix does not map 1-1.``


2021-08-31
==========

* :vytask:`T3789` ``(feature): Add custom validator for base64 encoded CLI data``
* :vytask:`T3782` ``(default): Ingress Shaping with IFB No Longer Functional with 1.3``


2021-08-30
==========

* :vytask:`T3768` ``(default): Remove early syntaxVersion implementation``
* :vytask:`T2941` ``(default): Using a non-ASCII character in the description field causes UnicodeDecodeError in configsource.py``
* :vytask:`T3787` ``(bug): Remove deprecated UDP fragmentation offloading option``


2021-08-29
==========

* :vytask:`T3708` ``(bug): isisd and gre-bridge commit error``
* :vytask:`T3783` ``(bug): "set protocols isis spf-delay-ietf" is not working``
* :vytask:`T2750` ``(default): Use m4 as a template processor``


2021-08-28
==========

* :vytask:`T3743` ``(bug): l2tp doesn't work after reboot if outside-address not 0.0.0.0``


2021-08-27
==========

* :vytask:`T3182` ``(bug): Main blocker Task for FRR 7.4/7.5 series update``
* :vytask:`T3568` ``(feature): Add XML for firewall conf-mode``
* :vytask:`T2108` ``(default): Use minisign/signify instead of GPG for release signing``


2021-08-26
==========

* :vytask:`T3776` ``(default): Rename FRR daemon restart op-mode commands``
* :vytask:`T3739` ``(feature): policy: route-map: add EVPN match support``


2021-08-25
==========

* :vytask:`T3773` ``(bug): Delete the "show system integrity" command (to prepare for a re-implementation)``
* :vytask:`T3775` ``(bug): Typo in generated Strongswan VPN-config``


2021-08-24
==========

* :vytask:`T3772` ``(bug): VRRP virtual interfaces are not shown in show interfaces``


2021-08-23
==========

* :vytask:`T3769` ``(feature): Containers: Network Bridging``


2021-08-22
==========

* :vytask:`T3090` ``(feature): Move 'adjust-mss' firewall options to the interface section.``
* :vytask:`T3765` ``(default): container: additional op-mode commands``


2021-08-20
==========

* :vytask:`T1950` ``(default): Store VyOS configuration syntax version data in JSON file``


2021-08-19
==========

* :vytask:`T3751` ``(bug): pki generate ca add new line after passphrase``
* :vytask:`T3764` ``(bug): Unconfigurable IKE and ESP lifetime``
* :vytask:`T3234` ``(bug): multi_to_list fails in certain cases, with root cause an element redundancy in XML interface-definitions``
* :vytask:`T3732` ``(feature): override-default helper should support adding defaultValues to default less nodes``
* :vytask:`T3759` ``(default): [L3VPN] VPNv4/VPNv6 add commands``


2021-08-18
==========

* :vytask:`T3752` ``(bug): generate pki certificate file xxx doesn't touch file``


2021-08-16
==========

* :vytask:`T3738` ``(default): openvpn fails if server and authentication are configured``
* :vytask:`T1594` ``(bug): l2tpv3 error on IPv6 local-ip``


2021-08-15
==========

* :vytask:`T3756` ``(default): VyOS generates invalid QR code for wireguard clients``
* :vytask:`T3757` ``(default): OSPF: add support to configure the area at an interface level``


2021-08-14
==========

* :vytask:`T3745` ``(feature): op-mode IPSec show vpn ipse sa sorting``


2021-08-13
==========

* :vytask:`T3749` ``(bug): V4/V6 Counters in network container validation aren't being reset``
* :vytask:`T3728` ``(bug): FRR not respect configured RD and RT for L3VNI``
* :vytask:`T3727` ``(bug): VPN IPsec ESP proposal and ESP presented in config missmatch``
* :vytask:`T3740` ``(bug): HTTPs API breaks when the address is IPv6``


2021-08-12
==========

* :vytask:`T3731` ``(bug): verify_accel_ppp_base_service return wrong config error for SSP``
* :vytask:`T3405` ``(feature): PPPoE server unit-cache``
* :vytask:`T2432` ``(default): dhcpd: Can't create new lease file: Permission denied``
* :vytask:`T3746` ``(feature): Inform users logging into the system about a pending reboot``
* :vytask:`T3744` ``(default): Dns forwarding statistics formatting missing a new line``


2021-08-11
==========

* :vytask:`T3709` ``(feature): Snmp: Allow enable MIDs/OIDs ipCidrRouteTable``


2021-08-09
==========

* :vytask:`T3720` ``(bug): IPSec set vti secondary address cause interface disable``


2021-08-08
==========

* :vytask:`T3705` ``(bug): IPSec: VTI interface does not honor default-esp-group``
* :vytask:`T2027` ``(bug): get_config_dict is failing when the configuration section is empty/missing``


2021-08-05
==========

* :vytask:`T3719` ``(bug): Restart vpn shows some missed files``


2021-08-04
==========

* :vytask:`T3704` ``(feature): Add ability to interact with Areca RAID adapers``
* :vytask:`T3718` ``(bug): VPN IPsec IKE group by default not use DH-group 2``


2021-08-02
==========

* :vytask:`T3601` ``(default): Error in ssh keys for vmware cloud-init if ssh keys is left empty.``


2021-08-01
==========

* :vytask:`T3707` ``(bug): Ping incorrect ip host checks``


2021-07-31
==========

* :vytask:`T3716` ``(feature): Linux kernel parameters ignore_routes_with_link_down- ignore disconnected routing connections``


2021-07-30
==========

* :vytask:`T1176` ``(default): FRR - BGP replicating routes``
* :vytask:`T1210` ``(feature): About IKEv2 IPSec VPN remote access``


2021-07-23
==========

* :vytask:`T3699` ``(bug): login: verify selected "system login user" name is not already used by the base system.``
* :vytask:`T3698` ``(default): Support bridge monitoring``


2021-07-13
==========

* :vytask:`T3679` ``(default): Point the unexpected exception message link to the new rolling release location``


2021-07-11
==========

* :vytask:`T3665` ``(bug): Missing VRF support for VxLAN but already documented``


2021-07-10
==========

* :vytask:`T3636` ``(feature): SSTP / L2TP ipv6 support broken``


2021-07-09
==========

* :vytask:`T3667` ``(bug): brctl is damaged``


2021-07-06
==========

* :vytask:`T3660` ``(feature): Conntrack-Sync configuration command to specify destination udp port for peer``


2021-07-03
==========

* :vytask:`T57` ``(enhancment): Make it possible to disable the entire IPsec peer``


2021-07-01
==========

* :vytask:`T3658` ``(feature): Add support for dhcpdv6 fixed-prefix6``
* :vytask:`T2035` ``(bug): Executing vyos-smoketest multiple times makes ssh test fail on execution``


2021-06-29
==========

* :vytask:`T3593` ``(bug): PPPoE server called-sid format does not work``
* :vytask:`T1441` ``(feature): Add support for IPSec XFRM interfaces``


2021-06-25
==========

* :vytask:`T3641` ``(feature): Upgrade base system from Debian Buster -> Debian Bullseye``
* :vytask:`T3649` ``(feature): Add bonding additional hash-policy``


2021-06-23
==========

* :vytask:`T3647` ``(feature): Bullseye: gcc defaults to passing --as-needed to linker``


2021-06-22
==========

* :vytask:`T3629` ``(bug): IPoE server shifting address in the range``
* :vytask:`T3645` ``(feature): Bullseye: ethtool changed output for ring-buffer information``


2021-06-21
==========

* :vytask:`T3563` ``(default): commit-archive breaks with IPv6 source addresses``


2021-06-20
==========

* :vytask:`T3637` ``(bug): vrf: bind-to-all didn't work properly``
* :vytask:`T3639` ``(default): GCC preprocessor clobbers C comments``


2021-06-19
==========

* :vytask:`T3633` ``(feature): Add LRO offload for interface ethernet``


2021-06-18
==========

* :vytask:`T3599` ``(default): Migrate NHRP to XML/Python``


2021-06-17
==========

* :vytask:`T3624` ``(feature): BGP: add support for extended community bandwidth definition``


2021-06-16
==========

* :vytask:`T3623` ``(default): Fix for dummy interface option in the operational command "clear interfaces dummy"``
* :vytask:`T3630` ``(feature): op-mode: add "show version kernel" command``


2021-06-13
==========

* :vytask:`T3620` ``(feature): Rename WWAN interface from wirelessmodem to wwan to use QMI interface``
* :vytask:`T2173` ``(feature): Add the ability to use VRF on VTI interfaces``
* :vytask:`T3622` ``(feature): WWAN: add support for APN authentication``
* :vytask:`T3606` ``(bug): SNMP unknown notification OID``
* :vytask:`T3621` ``(bug): PPPoE interface does not validate if password is supplied when username is set``


2021-06-12
==========

* :vytask:`T3611` ``(bug): WWAN interface (MC7710) no longer works on Kernel 5.10``
* :vytask:`T1534` ``(bug): IPSec w/ IKEv2 Invalid local-address "any"``
* :vytask:`T3616` ``(bug): Update to FastAPI causes regression in vyos-http-api-server``


2021-06-11
==========

* :vytask:`T3614` ``(bug): Container network name with hyphen fail``


2021-06-10
==========

* :vytask:`T3250` ``(bug): PPPoE server:  wrong local usernames``
* :vytask:`T3138` ``(bug): ddclient improperly updated when apply rfc2136 config``
* :vytask:`T2645` ``(default): Editing route-map action requires adding a new rule``


2021-06-08
==========

* :vytask:`T3605` ``(default): Allow to set prefer-global for ipv6-next-hop``
* :vytask:`T3607` ``(feature): [route-map] set ipv6 next-hop prefer-global``
* :vytask:`T3289` ``(bug): No description for node "service" conf-mode``


2021-06-07
==========

* :vytask:`T3461` ``(bug): OpenConnect Server redundancy check``
* :vytask:`T3455` ``(bug): system users can not be added in "edit"``
* :vytask:`T3588` ``(default): IPSec: migrate no longer available options from CLI which are now hardcoded/enabled in strongSwan``


2021-06-06
==========

* :vytask:`T842` ``(feature): Adopt VyOS CLI to latest StrongSwan options and deprecated Keywords``


2021-06-04
==========

* :vytask:`T3595` ``(default): Cannot create new VTI interface``
* :vytask:`T3592` ``(feature): Set default TTL 64 for tunnels``


2021-06-03
==========

* :vytask:`T3384` ``(feature): Support UDP bandwidth testing``


2021-06-02
==========

* :vytask:`T3233` ``(bug): Interface redirect to dum0``


2021-06-01
==========

* :vytask:`T3585` ``(default): Fix NHRP module for updated interfaces tunnel syntax``
* :vytask:`T3594` ``(bug): Disable by default service strongswan-starter``


2021-05-30
==========

* :vytask:`T3518` ``(bug): Warning messages when using SCP commit-archive``
* :vytask:`T3093` ``(default): Add xml for vpn ipsec``
* :vytask:`T1866` ``(bug): Commit archive over SFTP doesn't work with non-standard ports``
* :vytask:`T3590` ``(feature): bgp: add option for limiting maximum number of prefixes to be sent to a peer``
* :vytask:`T3589` ``(feature): op-mode: support clearing out logfiles from CLI``
* :vytask:`T2641` ``(feature): Rewrite vpn ipsec OP commands in new style XML syntax``
* :vytask:`T3351` ``(feature): Installer checking MD5 checksums on the ISO image``


2021-05-29
==========

* :vytask:`T1944` ``(bug): FRR: Invalid route in BGP causes update storm, memory leak, and failure of Zebra``
* :vytask:`T1888` ``(feature): Update to StrongSwan 5.9.1``


2021-05-27
==========

* :vytask:`T3561` ``(feature): router-advert: support advertising specific routes``
* :vytask:`T2669` ``(bug): DHCP-server overlapping ranges.``


2021-05-26
==========

* :vytask:`T3540` ``(bug): Keepalived memory utilisation issue when constantly getting its state in JSON format``


2021-05-24
==========

* :vytask:`T3575` ``(bug): pseudo-ethernet: must check source-interface MTU``
* :vytask:`T3571` ``(bug): Broken Show Tab Complete``
* :vytask:`T3555` ``(bug): GRE TAP tunnel does not silent fragment packets / kernel fix available``
* :vytask:`T3576` ``(bug): ISIS does not support IPV6``


2021-05-23
==========

* :vytask:`T3570` ``(default): Prevent setting of a larger MTU on child interfaces``
* :vytask:`T3573` ``(bug): as-path-prepend Description Invalid``
* :vytask:`T3572` ``(feature): Basic Drive Diagnostic Tools``


2021-05-22
==========

* :vytask:`T3564` ``(default): Multiple BGP Confederation Peers Not Allowed``


2021-05-21
==========

* :vytask:`T3551` ``(bug): QoS control failure of VLAN sub interface``


2021-05-20
==========

* :vytask:`T3554` ``(feature): Add area-type stub for ospfv3``
* :vytask:`T3565` ``(feature): sysctl: rewrite in XML and Python and drop from vyatta-cfg-system``


2021-05-19
==========

* :vytask:`T3562` ``(feature): Update Accel-PPP to a newer revision``
* :vytask:`T3559` ``(feature): Add restart op-command for OpenConnect Server``


2021-05-18
==========

* :vytask:`T3525` ``(default): VMWare resume script syntax errors``


2021-05-15
==========

* :vytask:`T3549` ``(bug): DHCPv6 "service dhcpv6-server global-parameters name-server" is not correctly exported to dhcpdv6.conf when multiple name-server entries are present``
* :vytask:`T3532` ``(bug): Not possible to change ethertype after interface creation``
* :vytask:`T3550` ``(bug): Router-advert completion typo``
* :vytask:`T3547` ``(feature): conntrackd: remove deprecated config options``
* :vytask:`T3535` ``(feature): Rewrite vyatta-conntrack-sync in new XML and Python flavor``


2021-05-14
==========

* :vytask:`T3346` ``(bug): nat 4-to-5 migration script fails when a 'source' or 'destination' node exists but there are no rules``
* :vytask:`T3248` ``(default): Deal with VRRP mode-force command that exists in 1.2 but not in 1.3``
* :vytask:`T3426` ``(default): add support for script arguments to vyos-configd``


2021-05-13
==========

* :vytask:`T3539` ``(bug): Typo in RPKI interface definition``
* :vytask:`T439` ``(feature): local PBR support``
* :vytask:`T3544` ``(feature): DHCP server should validate configuration before applying it``
* :vytask:`T3543` ``(feature): Support for setting lacp_rate on LACP bonded interfaces``


2021-05-12
==========

* :vytask:`T3302` ``(default): Make vyos-configd relay stdout from scripts to the user's console``
* :vytask:`T3542` ``(bug): udev net.rules not installed in image since may 2nd``


2021-05-10
==========

* :vytask:`T3374` ``(bug): IPv6 GRE Tunnel issues``


2021-05-09
==========

* :vytask:`T3530` ``(bug): BGP peer-group can't contain a hyphen``


2021-05-06
==========

* :vytask:`T3523` ``(bug): VRF BGP daemon route-map command missing``
* :vytask:`T3519` ``(bug): Cannot add / assign L2TPv3 to vrf``


2021-05-05
==========

* :vytask:`T3520` ``(bug): Cannot add tunnel interface to isis within vrf``
* :vytask:`T3335` ``(bug): Some OSPFv3 show commands do not work``


2021-05-04
==========

* :vytask:`T3504` ``(feature): BGP Per Peer Graceful Restart``


2021-05-02
==========

* :vytask:`T3511` ``(bug): Update libnss-mapuser and libpam-radius packages from CUMULUS Linux``


2021-05-01
==========

* :vytask:`T3379` ``(feature): Add global-parameters name-server  for dhcpv6-server``
* :vytask:`T3491` ``(default): Change Kernel HZ to 1000``


2021-04-29
==========

* :vytask:`T3503` ``(bug): "route-reflector-client" fails when "remote-as" is "internal"``
* :vytask:`T3502` ``(bug): "system ip multipath layer4-hashing" doesn't work``


2021-04-28
==========

* :vytask:`T3473` ``(bug): IPSec op-mode show sa error``


2021-04-27
==========

* :vytask:`T2946` ``(bug): Calling 'stty_size' causes show interfaces API to fail``


2021-04-25
==========

* :vytask:`T3490` ``(bug): priority inversion on PBR "policy route" create, breaks default route from dhcp (live iso)``
* :vytask:`T3468` ``(bug): Tunnel interfaces aren't suggested as being available for bridging (regression)``
* :vytask:`T3497` ``(bug): Prefix list with rule containing only action is not detected as error during parse``
* :vytask:`T3492` ``(bug): BGP Configuration Migration failed (badly!) from rolling 202102240218 to rolling 202104221210``
* :vytask:`T1802` ``(feature): Wireguard QR code in cli for mobile devices``


2021-04-24
==========

* :vytask:`T3472` ``(bug): commit-confirm script not found``
* :vytask:`T3439` ``(bug): Commit-archive location not working for scp``


2021-04-23
==========

* :vytask:`T3395` ``(bug): WAN load-balancing fails with nexthop dhcp``
* :vytask:`T3290` ``(bug): Disabling GRE conntrack module fails``


2021-04-20
==========

* :vytask:`T3488` ``(bug): Specifying an invalid "interface address" like dhcph leads to commit error``


2021-04-18
==========

* :vytask:`T3481` ``(default): Exclude tag node values from key mangling``
* :vytask:`T3475` ``(bug): XML dictionary cache unable to process syntaxVersion elements``


2021-04-17
==========

* :vytask:`T3470` ``(bug): as-override isn't applied to frr``


2021-04-15
==========

* :vytask:`T3386` ``(bug): PPPoE-server don't start with local authentication``
* :vytask:`T3190` ``(feature): Unable to subtract value from local-preference in route-map``


2021-04-14
==========

* :vytask:`T3398` ``(bug): Can't commit``
* :vytask:`T3055` ``(bug): op-mode incorrect naming for ipsec policy-based tunnels``


2021-04-13
==========

* :vytask:`T3436` ``(feature): Refactoring ospf op-mode for support vrf``
* :vytask:`T3434` ``(feature): Refactoring bgp op-mode for support vrf``


2021-04-12
==========

* :vytask:`T3454` ``(enhancment): dhclient reject option``
* :vytask:`T3328` ``(bug): Bgp not possible to delete bgp route-map``


2021-04-10
==========

* :vytask:`T3460` ``(bug): bgp, Configuration FRR failed while commiting code``


2021-04-09
==========

* :vytask:`T3464` ``(bug): OSPF: route-map names containing a hypen are not "found"``


2021-04-08
==========

* :vytask:`T3462` ``(default): show ipv6 bgp -- missing``
* :vytask:`T3463` ``(bug): Prevent IPv4 Route exchange with IPv6 neighbors``


2021-04-05
==========

* :vytask:`T3438` ``(bug): VRF: removing vif which belongs to a vrf, will delete the entire vrf from the operating system``
* :vytask:`T3418` ``(bug): BGP: system wide known interface can not be used as neighbor``


2021-04-04
==========

* :vytask:`T3457` ``(feature): Output the "monitor log" command in a colorful way``


2021-03-31
==========

* :vytask:`T3445` ``(bug): vyos-1x build include not all nodes``


2021-03-30
==========

* :vytask:`T3448` ``(bug): Loading vyos on a system without xdp installed fails``


2021-03-29
==========

* :vytask:`T3415` ``(feature): bridge: add support for isolated interfaces (private-vlan)``
* :vytask:`T1711` ``(feature): BGP - migrate from tagNode to node (remove ASN from tagNode)``


2021-03-28
==========

* :vytask:`T3440` ``(bug): HTTP API: give uvicorn time to initialize before restarting Nginx proxy``


2021-03-27
==========

* :vytask:`T3423` ``(bug): Cannot create ipv4 static route for default gateway in vrf``


2021-03-26
==========

* :vytask:`T3412` ``(default): HTTP API: move to FastAPI as web framework``
* :vytask:`T2397` ``(feature): HTTP API: export OpenAPI definition``


2021-03-24
==========

* :vytask:`T3419` ``(bug): show interfaces | strip-private fails``


2021-03-22
==========

* :vytask:`T3284` ``(bug): merge/load fail silently if unable to resolve host``


2021-03-21
==========

* :vytask:`T3417` ``(default): ISIS: provide per VRF instance support``
* :vytask:`T3416` ``(bug): NTP: when running inside a VRF op-mode commands do not work``


2021-03-20
==========

* :vytask:`T3392` ``(bug): vrrp over dhcp default route bug (unexpected vrf)``
* :vytask:`T3373` ``(feature): Upgrade to SaltStack version 3002.5``
* :vytask:`T3329` ``(default): "system conntrack ignore" rules can no longer be created due to an iptables syntax change``
* :vytask:`T3300` ``(feature): Add DHCP default route distance``
* :vytask:`T3306` ``(feature): Extend set route-map aggregator as to 4 Bytes``


2021-03-18
==========

* :vytask:`T3411` ``(default): Extend the redirect_stdout context manager in vyos-configd to redirect stdout from subprocesses``
* :vytask:`T3271` ``(bug): qemu-kvm grub issue``


2021-03-17
==========

* :vytask:`T3413` ``(bug): Configuring invalid IPv6 EUI64 address results in "OSError: illegal IP address string passed to inet_pton"``


2021-03-14
==========

* :vytask:`T3345` ``(default): BGP: add per VRF instance support``
* :vytask:`T3344` ``(default): Per VRF dynamic routing support``
* :vytask:`T3325` ``(bug): Bgp listen-range wrong commit message``
* :vytask:`T1513` ``(default): Move OSPF and RIP interface configuration under protocols``


2021-03-13
==========

* :vytask:`T3406` ``(bug): tunnel: interface no longer supports specifying encaplimit none - or migrator is missing``
* :vytask:`T3407` ``(bug): console-server: do not allow to spawn a console-server session on serial port used by "system console"``


2021-03-11
==========

* :vytask:`T3305` ``(bug): Ingress qdisc does not work anymore in 1.3-rolling-202101 snapshot``
* :vytask:`T2927` ``(bug): isc-dhcpd release and expiry events never execute``


2021-03-09
==========

* :vytask:`T3382` ``(bug): Error creating Console Server``


2021-03-08
==========

* :vytask:`T3387` ``(bug): Command "Monitor vpn ipsec"  is not working``


2021-03-07
==========

* :vytask:`T3388` ``(bug): show interfaces doesn't display pppoeX``
* :vytask:`T3211` ``(feature): ability to redistribute ISIS into other routing protocols``


2021-03-04
==========

* :vytask:`T3377` ``(bug): show interfaces throws error``


2021-03-02
==========

* :vytask:`T3375` ``(bug): Interface becomes up at boot even when disabled``


2021-02-28
==========

* :vytask:`T3370` ``(bug): dhcp: Invalid domain name "private"``
* :vytask:`T3369` ``(feature): VXLAN: add IPv6 underlay support``
* :vytask:`T3363` ``(bug): VyOS-Build interactive prompt when using Podman``
* :vytask:`T3320` ``(bug): Bgp neighbor peer-group without peer-group fail``


2021-02-27
==========

* :vytask:`T3365` ``(bug): Bgp neighbor interface ordering for remote-as``
* :vytask:`T3225` ``(bug): Adding a BGP neighbor with an address on a local interface throws a vyos.frr.CommitError: Configuration FRR failed while committing code: ''``
* :vytask:`T3368` ``(feature): macsec: add support for gcm-aes-256 cipher``
* :vytask:`T3173` ``(feature): Need 'nopmtudisc' option for tunnel interface``


2021-02-26
==========

* :vytask:`T3324` ``(bug): Bgp space in the password``
* :vytask:`T3357` ``(default): HTTP-API redirect from http correct https port``
* :vytask:`T3323` ``(bug): Bgp ttl-security and ebgp-multihop fail``


2021-02-24
==========

* :vytask:`T3303` ``(feature): Change welcome message on boot``


2021-02-22
==========

* :vytask:`T3322` ``(bug): Bgp neighbor timers not applyed to FRR config``
* :vytask:`T3327` ``(bug): OSPFv3: Cannot add dummy interface``


2021-02-21
==========

* :vytask:`T3331` ``(bug): Bgp unsuppress-map should be as "value leafNode"``
* :vytask:`T3330` ``(bug): Bgp capability orf prefix-list fail``
* :vytask:`T3163` ``(feature): ethernet ring-buffer can be set with an invalid value``


2021-02-19
==========

* :vytask:`T3326` ``(bug): OSPFv3: Cannot add L2TPv3 interface``
* :vytask:`T3332` ``(bug): BGP unnumbered - UnboundLocalError: local variable 'peer_group' referenced before assignment``


2021-02-18
==========

* :vytask:`T3259` ``(default): many dnat rules makes the vyos http api crash, even showConfig op timeouts``


2021-02-17
==========

* :vytask:`T3312` ``(feature): SolarFlare NICs support``


2021-02-16
==========

* :vytask:`T3313` ``(bug): ospfv3 interface missing options``
* :vytask:`T3318` ``(feature): Update Linux Kernel to v5.4.208 / 5.10.142``


2021-02-15
==========

* :vytask:`T3311` ``(bug): BGP Error: Remote AS must be set for neighbor or peer-group``


2021-02-14
==========

* :vytask:`T2848` ``(feature): bgp-add-path configuration options``


2021-02-12
==========

* :vytask:`T3301` ``(bug): Wrong format and valueHelp for policy as-path-list regex``


2021-02-11
==========

* :vytask:`T3281` ``(default): Rewrite protocol RIPng [conf-mode] to new XML/Python style``
* :vytask:`T3282` ``(default): Add XML for [conf-mode] RIPng``
* :vytask:`T3279` ``(default): Rewrite protocol STATIC [op-mode] to new XML/Python style``
* :vytask:`T3297` ``(bug): Optimize irrelevant error stack hints``


2021-02-08
==========

* :vytask:`T3295` ``(feature): Update Linux Kernel to v5.4.96 / 5.10.14``


2021-02-05
==========

* :vytask:`T3030` ``(feature): Support ERSPAN Tunnel Protocol``


2021-02-04
==========

* :vytask:`T3283` ``(feature): Support for IPv4 neigh tables``
* :vytask:`T3280` ``(default): Add XML for [conf-mode] STATIC``


2021-02-03
==========

* :vytask:`T3278` ``(feature): Add XML for "protocols vrf" [conf-mode]``
* :vytask:`T3239` ``(default): XML: override 'defaultValue' for mtu of certain interfaces; remove workarounds``
* :vytask:`T2910` ``(feature): XML: generator should support override of variables``


2021-02-02
==========

* :vytask:`T3018` ``(bug): Unclear behaviour when configuring vif and vif-s interfaces``
* :vytask:`T3255` ``(default): Rewrite protocol RPKI to new XML/Python style``
* :vytask:`T3263` ``(feature): OSPF Hello subsecond timer``


2021-01-31
==========

* :vytask:`T3276` ``(feature): Update Linux Kernel to v5.4.94 / 5.10.12``


2021-01-30
==========

* :vytask:`T3240` ``(feature): Support per-interface DHCPv6 DUIDs``
* :vytask:`T3273` ``(default): PPPoE static default-routes deleted on interface down when not added by interface up``


2021-01-29
==========

* :vytask:`T3261` ``(bug): Does not possible to disable pppoe client interface.``
* :vytask:`T3272` ``(default): OSPF: interface config is not removed``


2021-01-27
==========

* :vytask:`T3257` ``(feature): tcpdump supporting complete protocol``
* :vytask:`T3244` ``(default): Rewrite protocol OSPFv3 to new XML/Python style``


2021-01-26
==========

* :vytask:`T3251` ``(bug): PPPoE client trying to authorize with the wrong username``
* :vytask:`T3256` ``(default): Add XML for protocol RPKI [conf-mode]``


2021-01-25
==========

* :vytask:`T3249` ``(feature): Support operation mode forwarding table output``


2021-01-24
==========

* :vytask:`T3227` ``(bug): Latest releases don't work with RPKI (crash)``
* :vytask:`T3230` ``(bug): RPKI can't be deleted``
* :vytask:`T3221` ``(bug): FRR config``
* :vytask:`T3245` ``(default): Add XML for protocol ospfv3 [conf-mode]``


2021-01-23
==========

* :vytask:`T3236` ``(default): Add XML for [conf-mode] OSPF``


2021-01-17
==========

* :vytask:`T3222` ``(bug): Typo in BGP dampening description``
* :vytask:`T3226` ``(bug): Repair bridge smoke test damage``


2021-01-16
==========

* :vytask:`T3215` ``(bug): Operational command "show ipv6 route" is broken``
* :vytask:`T3157` ``(bug): salt-minion fails to start due to permission error accessing /root/.salt/minion.log``
* :vytask:`T3137` ``(feature): Let VLAN aware bridge approach the behavior of professional equipment``


2021-01-15
==========

* :vytask:`T3210` ``(feature): ISIS three-way-handshake``
* :vytask:`T3184` ``(feature): Add correct desctiptions for BGP neighbors``


2021-01-14
==========

* :vytask:`T3213` ``(bug): show interface command python error``


2021-01-12
==========

* :vytask:`T3205` ``(bug): Does not possible to configure tunnel mode gre-bridge``


2020-12-20
==========

* :vytask:`T3132` ``(feature): Enable egress flow accounting``


2020-11-29
==========

* :vytask:`T2297` ``(feature): NTP add support for pool configuration``
