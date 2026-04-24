# Salt-Minion

[SaltStack](https://saltproject.io/) is Python-based, open-source
software for event-driven IT automation, remote task execution, and
configuration management. Supporting the "infrastructure as code"
approach to data center system and network deployment and management,
configuration automation, SecOps orchestration, vulnerability remediation,
and hybrid cloud control.

## Requirements

To use the Salt-Minion, a running Salt-Master is required. You can find more
in the [Salt Poject Documentaion](https://docs.saltproject.io/en/latest/contents.html)

## Configuration

<div class="cfgcmd">

set service salt-minion hash \<type\>

The hash type used when discovering file on master server (default: sha256)

</div>

<div class="cfgcmd">

set service salt-minion id \<id\>

Explicitly declare ID for this minion to use (default: hostname)

</div>

<div class="cfgcmd">

set service salt-minion interval \<1-1440\>

Interval in minutes between updates (default: 60)

</div>

<div class="cfgcmd">

set service salt-minion master \<hostname | IP\>

The hostname or IP address of the master

</div>

<div class="cfgcmd">

set service salt-minion master-key \<key\>

URL with signature of master for auth reply verification

</div>

Please take a look in the Automation section to find some usefull
Examples.
