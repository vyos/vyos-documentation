.. _system_option:

######
Option
######

This chapter describe the possibilities of advanced system behavior.

*******
General
*******

.. cfgcmd:: set system option ctrl-alt-delete <ignore | reboot | poweroff>

   Action which will be run once the ctrl-alt-del keystroke is received.

.. cfgcmd:: set system option reboot-on-panic

   Automatically reboot system on kernel panic after 60 seconds.

.. cfgcmd:: set system option startup-beep

    Play an audible beep to the system speaker when system is ready.

***********
HTTP client
***********

.. cfgcmd:: set system option http-client source-address <address>

   Several commands utilize cURL to initiate transfers. Configure the local
   source IPv4/IPv6 address used for all cURL operations.

.. cfgcmd:: set system option http-client source-interface <interface>

   Several commands utilize curl to initiate transfers. Configure the local
   source interface used for all CURL operations.

.. note:: `source-address` and `source-interface` can not be used at the same
   time.

***************
Keyboard Layout
***************

When starting a VyOS live system (the installation CD) the configured keyboard
layout defaults to US. As this might not suite everyones use case you can adjust
the used keyboard layout on the system console.

.. cfgcmd:: set system option keyboard-layout <us | fr | de | fi | no | dk>

  Change system keyboard layout to given language.

  Defaults to ``us``.

  .. note:: Changing the keymap only has an effect on the system console, using
    SSH or Serial remote access to the device is not affected as the keyboard
    layout here corresponds to your access system.

.. _system_options_performance:

***********
Performance
***********

As more and more routers run on Hypervisors, expecially with a :abbr:`NOS
(Network Operating System)` as VyOS, it makes fewer and fewer sense to use
static resource bindings like ``smp-affinity`` as present in VyOS 1.2 and
earlier to pin certain interrupt handlers to specific CPUs.

We now utilize `tuned` for dynamic resource balancing based on profiles.

.. stop_vyoslinter

.. seealso:: https://access.redhat.com/sites/default/files/attachments/201501-perf-brief-low-latency-tuning-rhel7-v2.1.pdf

.. start_vyoslinter

.. cfgcmd:: set system option performance < throughput | latency >

  Configure one of the predefined system performance profiles.

  * ``throughput``: A server profile focused on improving network throughput.
    This profile favors performance over power savings by setting
    ``intel_pstate`` and ``max_perf_pct=100`` and increasing kernel network
    buffer sizes.

    It enables transparent huge pages, and uses cpupower to set the performance
    cpufreq governor. It also sets ``kernel.sched_min_granularity_ns`` to 10 us,
    ``kernel.sched_wakeup_granularity_ns`` to 15 uss, and ``vm.dirty_ratio`` to
    40%.

  * ``latency``: A server profile focused on lowering network latency.
    This profile favors performance over power savings by setting
    ``intel_pstate`` and ``min_perf_pct=100``.

    It disables transparent huge pages, and automatic NUMA balancing. It also
    uses cpupower to set the performance cpufreq governor, and requests a
    cpu_dma_latency value of 1. It also sets busy_read and busy_poll times to
    50 us, and tcp_fastopen to 3.
