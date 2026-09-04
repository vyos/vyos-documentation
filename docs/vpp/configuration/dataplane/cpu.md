---
lastproofread: '2026-02-23'
---

(vpp-config-dataplane-cpu)=

```{include} /_include/need_improvement.txt
```


# VPP Dataplane CPU Configuration

VPP can utilize multiple CPU cores for better packet processing
performance. Proper CPU configuration is essential for optimal
throughput and low latency.

VPP CPU assignment is handled automatically. You specify how many CPU
cores VPP may use, and the system distributes them between the main
thread and worker threads.

:::{important}
Review the system configuration settings page before changing CPU
settings: {doc}`system`.
:::

If you don't configure CPU settings, VPP uses a single core for the
main thread and doesn't create worker threads.

## CPU Configuration Parameters

### `cpu-cores`

This parameter defines the total number of CPU cores allocated to VPP.

```{cfgcmd} set vpp settings resource-allocation cpu-cores \<core-number\>
```

:::{important}
`cpu-cores` requires at least the same number of CPUs to be isolated from the
kernel scheduler with `set system option kernel cpu isolate-cpus`. VPP takes
its main core and its worker cores from the isolated set, and the commit is
rejected when fewer CPUs are isolated than requested:

```none
Not enough isolated CPU cores available: 2 requested, but only 0 isolated.
To isolate CPUs please use command
"set system option kernel cpu isolate-cpus ..." save and reboot!
```

This applies even when `cpu-cores` is left at its default of `1`. VPP always
takes its main core from the isolated set, so at least one CPU has to be
isolated before the dataplane can be enabled at all.

CPU isolation is a kernel option, so it has to be committed, saved and applied
with a reboot **before** VPP is configured — the two cannot be set in the same
commit. See {ref}`Optimal Configuration Example <vpp-config-setup-order>`.
:::

The system automatically assigns cores using the following rules:

> - The first two CPU cores are always reserved for the operating system and
>   other services.
> - The main VPP thread is assigned to the first available core after the
>   reserved ones.
> - The remaining allocated cores are used for worker threads.

For example:

> - If cpu-cores is set to 1, VPP runs only a main thread.
>
> - If cpu-cores is set to 4, VPP uses:
>
>   > - 1 core for the main thread
>   > - 3 cores for worker threads

Choose a value based on available hardware resources and expected
traffic load. Too few cores may limit performance, while too many can
negatively impact other system services.

## Potential Issues and Troubleshooting

Improper CPU configuration can lead to issues such as:

- VPP underperformance when not enough cores are assigned, or kernel
  underperformance when too many cores are assigned to VPP.
- Resource conflicts with other processes and services.

Indicators of such issues are:

- VPP or kernel forwarding performance is lower than expected
- Degraded performance of system components or services, such as DNS,
  DHCP, and dynamic routing
