---
lastproofread: '2026-10-01'
---

# Container

VyOS uses [Podman](https://podman.io/), a daemonless container engine, to
manage containers.

## Configuration

```{cfgcmd} set container name \<name\> image

Set the image name from a container registry.

:::{code-block} none
set container name mysql-server image mysql:8.0
:::

If an image name does not include a registry, VyOS searches the configured
unqualified registries. By default, these are `docker.io` and `quay.io`. Use
`set container registry <name>` to configure the search list, or include the
registry in the image name.

:::{code-block} none
set container name mysql-server image quay.io/mysql:8.0
:::
```

```{cfgcmd} set container name \<name\> entrypoint \<entrypoint\>

Override the default entrypoint from the image for a container.
```

```{cfgcmd} set container name \<name\> command \<command\>

Override the default command from the image for a container.
```

```{cfgcmd} set container name \<name\> arguments \<arguments\>

Set the arguments passed to the container command.
```

```{cfgcmd} set container name \<name\> host-name \<hostname\>

Set the container host name.
```

```{cfgcmd} set container name \<name\> allow-host-pid

The container and host share the same process namespace.
This means that processes running on the host are visible inside the
container, and processes inside the container are visible on the host.

This sets `--pid host` when Podman creates the container.
```

```{cfgcmd} set container name \<name\> allow-host-cgroups

Share the host's cgroup namespace with the container.
```

```{cfgcmd} set container name \<name\> privileged

Enable Podman's privileged mode, which grants the container broad access to
host devices and capabilities.
```

```{cfgcmd} set container name \<name\> allow-host-networks

Use the host network namespace for the container. Its network stack is not
isolated from the host.

This sets `--net host` when Podman creates the container.

:::{note}
**allow-host-networks** cannot be used with **network**
:::
```

```{cfgcmd} set container name \<name\> network \<networkname\>

Attach a user-defined network to the container. The network must already
exist, and only one network can be specified.
```

```{cfgcmd} set container name \<name\> network \<networkname\> address \<address\>

Optionally assign a static IPv4 or IPv6 address to the container. The address
must be within the prefix configured for the named network.

:::{note}
The first usable IP address in the network prefix is reserved for the
container engine.
:::
```

```{cfgcmd} set container name \<name\> network \<networkname\> mac \<address | auto\>

Set the container's MAC address on this network. By default, VyOS generates
an address automatically; specify a MAC address to override it.
```

```{cfgcmd} set container name \<name\> name-server \<address\>

Optionally set a custom name server.
If a container network is used with DNS enabled,
this setting will not have any effect.
```

```{cfgcmd} set container name \<name\> description \<text\>

Set a description for the container.
```

```{cfgcmd} set container name \<name\> environment \<key\> value \<value\>

Add custom environment variables.
Multiple environment variables are allowed.
The following commands translate to "-e key=value" when the container
is created.

:::{code-block} none
set container name mysql-server environment MYSQL_DATABASE value 'zabbix'
set container name mysql-server environment MYSQL_USER value 'zabbix'
set container name mysql-server environment MYSQL_PASSWORD value 'zabbix_pwd'
set container name mysql-server environment MYSQL_ROOT_PASSWORD value 'root_pwd'
:::
```

```{cfgcmd} set container name \<name\> port \<portname\> source \<portnumber\>
```
```{cfgcmd} set container name \<name\> port \<portname\> destination \<portnumber\>
```
```{cfgcmd} set container name \<name\> port \<portname\> protocol \<tcp | udp\>

Publish a container port on the host.
- **source**: Port on the host.
- **destination**: Port in the container.
- **listen-address**: Optional host IP address on which to publish the port.

:::{code-block} none
set container name zabbix-web-nginx-mysql port http source 80
set container name zabbix-web-nginx-mysql port http destination 8080
set container name zabbix-web-nginx-mysql port http protocol tcp
:::

:::{note}
Port publishing works with user-defined bridge networks. It cannot be used
with host networking; containers using MACVLAN networking are reached through
their network addresses. You can use destination NAT with a static container
address when you need to forward traffic to a MACVLAN container.
:::
```

```{cfgcmd} set container name \<name\> volume \<volumename\> source \<path\>
```
```{cfgcmd} set container name \<name\> volume \<volumename\> destination \<path\>

Mount a volume into the container.
- **source**: Path on the host. Use a path under `/config` to preserve the
  data during upgrades.
- **destination**: Path inside the container.

:::{code-block} none
set container name coredns volume 'corefile' source /config/coredns/Corefile
set container name coredns volume 'corefile' destination /etc/Corefile
:::
```

```{cfgcmd} set container name \<name\> volume \<volumename\> mode \<ro | rw\>

Mount the volume read-write (`rw`, the default) or read-only (`ro`).
```

```{cfgcmd} set container name \<name\> volume \<volumename\> propagation \<mode\>

Set bind-mount propagation. Supported modes are `shared`, `slave`, `private`,
`rshared`, `rslave`, and `rprivate` (the default).
```

```{cfgcmd} set container name \<name\> tmpfs \<tmpfsname\> destination \<path\>

Mount a tmpfs *(ramdisk)* filesystem to the given path within the container.
```

```{cfgcmd} set container name \<name\> tmpfs \<tmpfsname\> size \<MB\>

Set the tmpfs size in MB. The maximum is 65,535 MB or 50% of the system's
total memory, whichever is smaller.
```

```{cfgcmd} set container name \<name\> uid \<number\>
```
```{cfgcmd} set container name \<name\> gid \<number\>

Set the user ID and, optionally, the group ID used to run the container.
```

```{cfgcmd} set container name \<name\> restart [no | on-failure | always]

Set the container restart policy.
- **no**: Do not restart the container on exit.
- **on-failure**: Restart containers when they exit with a non-zero
  exit code, retrying indefinitely (default).
- **always**: Restart containers when they exit, regardless of status,
  retrying indefinitely.
```

```{cfgcmd} set container name \<name\> cpu-quota \<num\>

This specifies the number of CPU resources the container can use.

Default is 0 for unlimited.
For example, 1.25 limits the container to use up to 1.25 cores
worth of CPU time.
This can be a decimal number with up to three decimal places.

The command translates to "--cpus=\<num\>" when the container is created.
```

```{cfgcmd} set container name \<name\> memory \<MB\>

Constrain the memory available to the container.

Default is 512 MB. Use 0 MB for unlimited memory.
```

```{cfgcmd} set container name \<name\> shared-memory \<MB\>

Set the size of the container's `/dev/shm` in MB. The default is 64 MB; use
0 for unlimited size. The maximum is 8,192 MB.
```

```{cfgcmd} set container name \<name\> stop-timeout \<seconds\>

Set how long Podman waits for the container to stop before sending a kill
signal. The default is 10 seconds; the accepted range is 1 to 60 seconds.
```

```{cfgcmd} set container name \<name\> device \<devicename\> source \<path\>
```
```{cfgcmd} set container name \<name\> device \<devicename\> destination \<path\>

Add a host device to the container.
- **source**: Device on the router.
- **destination**: Device inside the container.
```

```{cfgcmd} set container name \<name\> capability \<text\>

Grant a Linux capability to the container. Available capabilities are:
- **net-admin**: Network operations (interfaces, firewalls, and routing tables).
- **net-bind-service**: Bind a socket to privileged ports
  (port numbers less than 1024).
- **net-raw**: Permission to create raw network sockets.
- **chown**: Permission to set file UIDs and GIDs.
- **mknod**: Permission to create special files.
- **setpcap**: Capability sets (from bounded or inherited set).
- **sys-admin**: Administration operations (quotactl, mount, sethostname,
  setdomainname).
- **sys-module**: Load, unload, and delete kernel modules.
- **sys-nice**: Permission to set the process nice value.
- **sys-rawio**: Permission to perform raw I/O operations.
- **sys-time**: Permission to set the system clock.
```

```{cfgcmd} set container name \<name\> sysctl parameter \<parameter\> value \<value\>

Set container sysctl values.

Supported parameters include:
- Kernel parameters: `kernel.msgmax`, `kernel.msgmnb`, `kernel.msgmni`,
  `kernel.sem`, `kernel.shmall`, `kernel.shmmax`, `kernel.shmmni`, and
  `kernel.shm_rmid_forced`.
- Parameters beginning with `fs.mqueue.*`.
- Parameters beginning with `net.*` when a user-defined network is used.
```

```{cfgcmd} set container name \<name\> label \<label\> value \<value\>

Add metadata label for this container.
```

```{cfgcmd} set container name \<name\> disable

Disable a container.
```

### Container Health checks

By default, no health checks are run, even when defined by the image.

```{cfgcmd} set container name \<name\> health-check

Run the health check defined in the image, if one is present.
```

```{cfgcmd} set container name \<name\> health-check command \<command\>

Override the default health check command from the image for a container.
```

```{cfgcmd} set container name \<name\> health-check interval \<interval\>

Override the default health-check interval, in seconds. For example: `60`.
```

```{cfgcmd} set container name \<name\> health-check timeout \<timeout\>

Override the default health-check timeout, in seconds. For example: `10`.
```

```{cfgcmd} set container name \<name\> health-check retry \<retries\>

Set the number of health-check retries before the container is considered
unhealthy. For example: `1`.
```

### Container Networks

:::{note}
If you use **Global State Policies** in your
{ref}`quick-start:firewall` with container networks, you need
an exception for ARP traffic on bridge interfaces.
Otherwise, ARP will fail and the container will not be reachable.

```{cfgcmd} set firewall global-options apply-to-bridged-traffic accept-invalid ethernet-type 'arp'
```
:::

```{cfgcmd} set container network \<name\>

Creates a named container network
```

```{cfgcmd} set container network \<name\> description

Set a brief description of the network.
```

```{cfgcmd} set container network \<name\> prefix \<ipv4|ipv6\>

Define IPv4 and/or IPv6 prefix for a given network name.
Both IPv4 and IPv6 can be used in parallel.
```

```{cfgcmd} set container network \<name\> gateway \<address\>

Optionally set an IPv4 or IPv6 gateway for the network. A gateway requires a
prefix of the same address family.
```

```{cfgcmd} set container network \<name\> mtu \<number\>

Configure the {abbr}`MTU (Maximum Transmission Unit)` for the network, in
bytes.
```

```{cfgcmd} set container network \<name\> no-name-server

Disable the Domain Name System (DNS) plugin for this network.
```

```{cfgcmd} set container network \<name\> vrf \<name\>

Bind container network to a given VRF instance.

MACVLAN networks cannot be assigned directly to a VRF.
```

```{cfgcmd} set container network \<name\> type bridge

Use a Linux bridge network (the default).
```

```{cfgcmd} set container network \<name\> type macvlan mode \<mode\>

Create a MACVLAN network. Set the mode to `bridge`, `private`, or `vepa` and
specify its parent interface with `set container network <name> type macvlan
parent <interface>`.

- **bridge**: Containers act as separate hosts on the parent network.
- **private**: Isolate containers from the host and each other.
- **vepa**: Send container traffic through the parent switch for forwarding.
```

```{cfgcmd} set container network \<name\> type macvlan parent \<interface\>

Set the parent Ethernet, bonding, or bridge interface for the MACVLAN network.
```

### Container Registry

```{cfgcmd} set container registry \<name\>

Add a registry to the list of unqualified search registries. By default,
VyOS searches `docker.io` and `quay.io` for image names that do not include a
registry.
```

```{cfgcmd} set container registry \<name\> disable

Disable a container registry.
```

```{cfgcmd} set container registry \<name\> authentication username
```
```{cfgcmd} set container registry \<name\> authentication password

Some container registries require credentials to be used.

Credentials can be defined here and will only be used when adding a
container image to the system.
```

```{cfgcmd} set container registry \<name\> insecure

Allow registry access over unencrypted HTTP or TLS connections with
untrusted certificates.
```

```{cfgcmd} set container registry \<name\> mirror address \<address\>
```
```{cfgcmd} set container registry \<name\> mirror host-name \<host-name\>
```
```{cfgcmd} set container registry \<name\> mirror port \<port\>
```
```{cfgcmd} set container registry \<name\> mirror path \<path\>
```
Configure a registry mirror using ``host-name|address[:port][/path]``.

For example, if `docker.io` uses a mirror at `192.0.2.1:8080`, the image name
can remain `docker.io/some/repo`:

:::{code-block} none
set container registry docker.io mirror address 192.0.2.1
set container registry docker.io mirror port 8080
set container registry docker.io insecure
:::

If `192.0.2.1:8080` is the registry itself, include its address and port in
the image name, for example `192.0.2.1:8080/some/repo`.

:::{code-block} none
set container registry 192.0.2.1:8080 insecure
:::

### Log Configuration

```{cfgcmd} set container name \<name\> log-driver [k8s-file | journald | none]

Set the default log driver for containers.

- **k8s-file**: Log to a plain text file in Kubernetes-style format.
- **journald**: Log to the system journal (default).
- **none**: Disable logging for the container.
```

## Operation Commands

```{opcmd} add container image \<containername\>

Pull a new container image.
```

```{opcmd} show container

Show all containers, including inactive containers.
```

```{opcmd} show container image

Show the local container images.
```

```{opcmd} show container log \<containername\>

Show the logs for a container.
```

```{opcmd} show container network

Show the available container networks.
```

```{opcmd} restart container \<containername\>

Restart a container.
```

```{opcmd} update container image \<containername\>

Update a container image.
```

```{opcmd} delete container image \<image id|all\> [force]

Delete a container image by its ID, name, or tag. You can also delete all
container images at once.

The `force` option removes stopped containers that use the image before
removing it. An image used by a running container cannot be deleted.
```

## Example Configurations

% stop_vyoslinter
The [official Zabbix container documentation](https://www.zabbix.com/documentation/7.4/en/manual/installation/containers)
provides the basis for this example, adapted to the VyOS CLI syntax.
% start_vyoslinter

```none
set container network zabbix prefix 172.20.0.0/16
set container network zabbix description 'Network for Zabbix component containers'

set container name mysql-server image mysql:8.0
set container name mysql-server network zabbix address 172.20.0.10

set container name mysql-server environment 'MYSQL_DATABASE' value 'zabbix'
set container name mysql-server environment 'MYSQL_USER' value 'zabbix'
set container name mysql-server environment 'MYSQL_PASSWORD' value 'zabbix_pwd'
set container name mysql-server environment 'MYSQL_ROOT_PASSWORD' value 'root_pwd'

set container name zabbix-java-gateway image zabbix/zabbix-java-gateway:alpine-7.4-latest
set container name zabbix-java-gateway network zabbix address 172.20.0.11

set container name zabbix-server-mysql image zabbix/zabbix-server-mysql:alpine-7.4-latest
set container name zabbix-server-mysql network zabbix address 172.20.0.12

set container name zabbix-server-mysql environment 'DB_SERVER_HOST' value 'mysql-server'
set container name zabbix-server-mysql environment 'MYSQL_DATABASE' value 'zabbix'
set container name zabbix-server-mysql environment 'MYSQL_USER' value 'zabbix'
set container name zabbix-server-mysql environment 'MYSQL_PASSWORD' value 'zabbix_pwd'
set container name zabbix-server-mysql environment 'MYSQL_ROOT_PASSWORD' value 'root_pwd'
set container name zabbix-server-mysql environment 'ZBX_JAVAGATEWAY' value 'zabbix-java-gateway'

set nat destination rule 100 destination port 10051
set nat destination rule 100 protocol tcp
set nat destination rule 100 translation address 172.20.0.12

set container name zabbix-web-nginx-mysql image zabbix/zabbix-web-nginx-mysql:alpine-7.4-latest
set container name zabbix-web-nginx-mysql network zabbix address 172.20.0.13

set container name zabbix-web-nginx-mysql environment 'MYSQL_DATABASE' value 'zabbix'
set container name zabbix-web-nginx-mysql environment 'ZBX_SERVER_HOST' value 'zabbix-server-mysql'
set container name zabbix-web-nginx-mysql environment 'DB_SERVER_HOST' value 'mysql-server'
set container name zabbix-web-nginx-mysql environment 'MYSQL_USER' value 'zabbix'
set container name zabbix-web-nginx-mysql environment 'MYSQL_PASSWORD' value 'zabbix_pwd'
set container name zabbix-web-nginx-mysql environment 'MYSQL_ROOT_PASSWORD' value 'root_pwd'

set nat destination rule 101 destination port 80
set nat destination rule 101 protocol tcp
set nat destination rule 101 translation address 172.20.0.13
set nat destination rule 101 translation port 8080
```

