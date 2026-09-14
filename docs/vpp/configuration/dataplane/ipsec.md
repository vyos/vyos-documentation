---
lastproofread: '2026-02-23'
---

(vpp-config-dataplane-ipsec)=

```{include} /_include/need_improvement.txt
```


# VPP IPsec Configuration

VPP supports IPsec (Internet Protocol Security) offloading from the
kernel, which speeds up cryptographic operations by leveraging VPP's
high-performance packet processing capabilities.

IPsec does not require any specific configuration on VPP side. If both
sources and destinations of the IPsec traffic are reachable via VPP
interfaces, VPP will automatically offload the IPsec processing from
the kernel. IPsec tunnels are configured in the VPN configuration
section, see {ref}`ipsec_general`.

## IPsec Configuration Parameters

### enable IPsec acceleration

When VPP is used for offloading IPsec, it creates a virtual interface to
connect to peers. The interface type is always 'ipsec', which is used for
IPsec tunnels.

```{cfgcmd} set vpp settings ipsec-acceleration
```

Enabling this option allows VPP to handle IPsec traffic more efficiently by
offloading processing from the kernel.

## Potential Issues and Troubleshooting

Improper IPsec configuration can lead to various issues, including:

- Failure to offload IPsec tunnels to VPP
- IPsec states or SAs are not synchronized between kernel and VPP
