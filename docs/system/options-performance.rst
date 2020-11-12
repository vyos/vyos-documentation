.. _system_options_performance:

###########
Performance
###########

As more and more routers run on Hypervisors, expecially with a :abbr:`NOS
(Network Operating System)` as VyOS, it makes fewer and fewer sense to use
static resource bindings like ``smp-affinity`` as present in VyOS 1.2 and
earlier to pin certain interrupt handlers to specific CPUs.

We now utilize `tuned` for dynamic resource balancing based on profiles.

  .. seealso:: https://access.redhat.com/sites/default/files/attachments/201501-perf-brief-low-latency-tuning-rhel7-v2.1.pdf

Configureation
==============

.. cfgcmd:: set system options performance < throughput | latency >

  Configure one of the predefined system performance profiles.

  * ``throughput``: A server profile focused on improving network throughput.
    This profile favors performance over power savings by setting ``intel_pstate``
    and ``max_perf_pct=100`` and increasing kernel network buffer sizes.

    It enables transparent huge pages, and uses cpupower to set the performance
    cpufreq governor. It also sets ``kernel.sched_min_granularity_ns`` to 10 us,
    ``kernel.sched_wakeup_granularity_ns`` to 15 uss, and ``vm.dirty_ratio`` to
    40%.

  * ``latency``: A server profile focused on lowering network latency.
    This profile favors performance over power savings by setting ``intel_pstate``
    and ``min_perf_pct=100``.

    It disables transparent huge pages, and automatic NUMA balancing. It also
    uses cpupower to set the performance cpufreq governor, and requests a
    cpu_dma_latency value of 1. It also sets busy_read and busy_poll times to
    50 us, and tcp_fastopen to 3.
