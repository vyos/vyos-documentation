---
lastproofread: '2026-09-30'
---

(vpp-dconfig-index)=

```{include} /_include/need_improvement.txt
```

# VPP Configuration

VPP configuration in VyOS is organized into dataplane settings, VPP
interfaces, and features that run on the VPP dataplane.

The core dataplane settings and internal VPP interfaces are documented here:

```{toctree}
:includehidden: true
:maxdepth: 1

dataplane/index
interfaces/index
```

The following features can also be configured on the VPP dataplane:

```{toctree}
:includehidden: true
:maxdepth: 1

acl
ipfix
ipsec
nat/index
sflow
```

## VPP initialization

When a configuration commit changes VPP settings or interfaces, VyOS
validates the VPP requirements and prepares the startup configuration. If
validation succeeds, VyOS restarts the VPP service and applies the
configuration. The interface setup process includes these steps:

1. VyOS checks system resources, interface availability, and supported NIC
   requirements. A failed check rejects the VPP portion of the commit; other
   configuration changes may still apply.
2. VyOS restarts the VPP service with the generated startup configuration.
3. VyOS adds configured interfaces to VPP using the selected driver.
4. For interfaces integrated with Linux, VPP's Linux Control Plane (LCP)
   plugin creates matching interfaces in the Linux kernel.
5. VyOS synchronizes routes between the kernel and VPP and reruns dependent
   configuration so kernel-based services can use the Linux interfaces.
