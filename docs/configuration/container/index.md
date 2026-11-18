---
lastproofread: '2024-07-03'
---

# Container

The VyOS container implementation is based on [Podman](https://podman.io/) as
a daemonless container engine.

## Configuration

```{cfgcmd} set container name \<name\> image

Sets the image name in the hub registry

:::{code-block} none
set container name mysql-server image mysql:8.0
:::

If a registry is not specified, Docker.io will be used as the container
registry unless an alternative registry is specified using
`set container registry <name>` or the registry is included
in the image name

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

Set the command arguments for a container.
```

```{cfgcmd} set container name \<name\> host-name \<hostname\>

Set the host name for a container.
```

```{cfgcmd} set container name \<name\> allow-host-pid

The container and the host share the same process namespace.
This means that processes running on the host are visible inside the
container, and processes inside the container are visible on the host.

The command translates to "--pid host" when the container is created.
```

```{cfgcmd} set container name \<name\> allow-host-cgroups

The container and the host share the same cgroup namespace. The
container sees the host's cgroup hierarchy instead of a namespaced view
of its own.

The command translates to "--cgroupns host" when the container is
created.
```

```{cfgcmd} set container name \<name\> allow-host-networks

Allow host networking in a container. The network stack of the container is
not isolated from the host and will use the host IP.

The command translates to "--net host" when the container is created.

:::{note}
**allow-host-networks** cannot be used with **network**
:::
```

```{cfgcmd} set container name \<name\> network \<networkname\>

Attaches a user-defined network to a container.
Only one network must be specified and must already exist.
```

```{cfgcmd} set container name \<name\> network \<networkname\> address \<address\>

Optionally set a specific static IPv4 or IPv6 address for the container.
This address must be within the named network prefix. On a native bridge, it
must not equal the network gateway address.

:::{note}
The first IP in the container network is reserved by the
engine and cannot be used
:::
```

```{cfgcmd} set container name \<name\> network \<networkname\> mac \<address\>

Set a specific {abbr}`MAC (Media Access Control)` address for the
container interface.

Defaults to `auto`, which generates a random address for the container.

:::{code-block} none
set container name coredns network NET01 mac '00:53:00:12:34:56'
:::
```

```{cfgcmd} set container name \<name\> name-server \<address\>

Optionally set a custom name server.
If a container network is used with DNS enabled,
this setting will not have any effect.
```

```{cfgcmd} set container name \<name\> description \<text\>

Set a container description
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

Publish a port for the container.
- **source**: Port on the host
- **destination**: Port on the container

:::{code-block} none
set container name zabbix-web-nginx-mysql port http source 80
set container name zabbix-web-nginx-mysql port http destination 8080
set container name zabbix-web-nginx-mysql port http protocol tcp
:::

:::{note}
Port publishing cannot be used with **network**. For this purpose, a workaround
using destination NAT and static IP assignment for the container is available.
:::
```

```{cfgcmd} set container name \<name\> volume \<volumename\> source \<path\>
```
```{cfgcmd} set container name \<name\> volume \<volumename\> destination \<path\>

Mount a volume into the container.
- **source**: Path on the host, place it inside `/config` to preserve during
upgrades
- **destination**: Path inside the container

:::{code-block} none
set container name coredns volume 'corefile' source /config/coredns/Corefile
set container name coredns volume 'corefile' destination /etc/Corefile
:::
```

```{cfgcmd} set container name \<name\> volume \<volumename\> mode \<ro | rw\>

Volume is either mounted as rw (read-write - default) or ro (read-only)
```

```{cfgcmd} set container name \<name\> volume \<volumename\> propagation \<mode\>

Control how `mount` and `unmount` events propagate between the volume on
the host and the mount inside the container. Default is **rprivate**.

- **shared**: Events propagate in both directions. A mount made below
  the volume on the host shows up inside the container, and one made
  inside the container shows up on the host
- **slave**: Events propagate one way only, from the host into the
  container but not back
- **private**: No events propagate into or out of the mount
- **rshared**, **rslave**, **rprivate**: The same, applied recursively
  to nested mount points as well

:::{note}
The propagation of the host source mount limits what takes effect here:
**shared** requires the source mount to be shared, and **slave**
requires it to be shared or slave. Check it on the host with
`findmnt -o TARGET,PROPAGATION \<directory\>`.
:::
```

```{cfgcmd} set container name \<name\> tmpfs \<tmpfsname\> destination \<path\>

Mount a tmpfs *(ramdisk)* filesystem to the given path within the container.
```

```{cfgcmd} set container name \<name\> tmpfs \<tmpfsname\> size \<MB\>

Size in MB for tmpfs filesystem, maximum size is 64GB or 50% of the
systems total available memory.
```

```{cfgcmd} set container name \<name\> uid \<number\>
```
```{cfgcmd} set container name \<name\> gid \<number\>

Set the User ID or Group ID of the container
```

```{cfgcmd} set container name \<name\> restart [no | on-failure | always]

Set the restart behavior of the container.
- **no**: Do not restart containers on exit
- **on-failure**: Restart containers when they exit with a non-zero
exit code, retrying indefinitely (default)
- **always**: Restart containers when they exit, regardless of status,
retrying indefinitely
```

```{cfgcmd} set container name \<name\> stop-timeout \<seconds\>

Time to wait for the container to shut down on its own before it is
killed.

Valid values are 1 to 60 seconds, the default is 10 seconds.
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

Size of the shared memory mounted at `/dev/shm` inside the container.
Databases and browsers are typical workloads that need more than the
default.

Default is 64 MB, the maximum is 8192 MB. Use 0 MB for unlimited
shared memory.
```

```{cfgcmd} set container name \<name\> device \<devicename\> source \<path\>
```
```{cfgcmd} set container name \<name\> device \<devicename\> destination \<path\>

Add a host device to the container.
- **source**: Device on the router itself
- **destination**: Device inside the container
```

```{cfgcmd} set container name \<name\> capability \<text\>

Set container capabilities or permissions.
- **net-admin**: Network operations (interface, firewall, routing tables)
- **net-bind-service**: Bind a socket to privileged ports
(port numbers less than 1024)
- **net-raw**: Permission to create raw network sockets
- **chown**: Permission to set file UIDs and GIDs
- **mknod**: Permission to create special files
- **setpcap**: Capability sets (from bounded or inherited set)
- **sys-admin**: Administration operations (quotactl, mount, sethostname,
setdomainname)
- **sys-module**: Load, unload and delete kernel modules
- **sys-nice**: Permission to set process nice value
- **sys-rawio**: Permission to perform raw I/O operations
- **sys-time**: Permission to set system clock
```

```{cfgcmd} set container name \<name\> sysctl parameter \<parameter\> value \<value\>

Set container sysctl values.

The subset of possible parameters are:
- Kernel Parameters: kernel.msgmax, kernel.msgmnb, kernel.msgmni, kernel.sem,
kernel.shmall, kernel.shmmax, kernel.shmmni, kernel.shm_rmid_forced
- Parameters beginning with fs.mqueue.*
- Parameters beginning with net.* (only if user-defined network is used)
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

Default health check is run for the container if defined by the image.
```

```{cfgcmd} set container name \<name\> health-check command \<command\>

Override the default health check command from the image for a container.
```

```{cfgcmd} set container name \<name\> health-check interval \<interval\>

Override the default health-check interval. For example: `60`
```

```{cfgcmd} set container name \<name\> health-check timeout \<timeout\>

Override the default health-check timeout. For example: `10`
```

```{cfgcmd} set container name \<name\> health-check retry \<retries\>

Number of health check retries before container is considered unhealthy. For example: `1`
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

A brief description what this network is all about.
```

```{cfgcmd} set container network \<name\> prefix \<ipv4|ipv6\>

Define IPv4 and/or IPv6 prefix for a given network name.
Both IPv4 and IPv6 can be used in parallel with local address allocation.
Do not configure prefixes when using DHCP address allocation.
```

```{cfgcmd} set container network \<name\> ipam \<host-local|dhcp\>

Select how container addresses are allocated. The default, `host-local`, uses
the configured network prefixes and optional per-container addresses.

Use `dhcp` to obtain IPv4 addresses, routes and DNS from a DHCP server reachable
through an existing bridge or MACVLAN parent. Do not configure network prefixes,
gateways or per-container addresses with DHCP. A DHCP server may omit the router
option for a network that does not need a default route.

VyOS starts the DHCP proxy automatically. DHCP containers start asynchronously
so configuration can finish while they wait for a lease, including when VyOS
provides the DHCP server. Check container status to confirm startup succeeded.
Container recreation may obtain a different lease; use DHCP reservations when
an address must remain predictable. This mode does not provide DHCPv6.

For an existing bridge connected to a DHCP server:

:::{code-block} none
set container network lan type bridge interface br10
set container network lan ipam dhcp
set container network lan no-name-server
:::
```

```{cfgcmd} set container network \<name\> type bridge

Attach containers on this network to an internal bridge on the host.
They reach the outside through {abbr}`NAT (Network Address
Translation)`, so they are not directly reachable from the parent
network without port mapping.

This is the default when no network type is configured. With `type bridge`,
the container engine creates its bridge unless an `interface` is specified.
```

```{cfgcmd} set container network \<name\> type bridge interface \<brN\>

Attach containers to an existing bridge configured under `interfaces bridge`.
Specifying the interface selects Netavark unmanaged mode. VyOS manages the
bridge, addresses, routing and firewall policy. The container engine attaches
container interfaces without adding NAT or port-forwarding rules. Routed
traffic keeps its original source address unless a VyOS NAT rule translates
it.

The bridge must be enabled. With local address allocation, it must have the
network gateway addresses with matching subnet masks. If no gateway is
specified, the first address in each prefix is used. With DHCP allocation, the
bridge does not need an IP address; the DHCP server supplies container addresses
and any gateway. The network MTU defaults to 1500 and must match the bridge MTU.

This mode requires `no-name-server`. Engine DNS, published container ports,
MACVLAN and VRFs are unsupported. Each native bridge can be used by only one
container network. Locally allocated prefixes must not overlap other container
networks. `no-name-server` disables the engine DNS plugin; containers using
DHCP can still receive DNS server addresses from their leases.

:::{code-block} none
set interfaces bridge br10 address '10.200.0.1/24'
set interfaces bridge br10 address '2001:db8:10::1/64'
set container network services prefix '10.200.0.0/24'
set container network services prefix '2001:db8:10::/64'
set container network services no-name-server
set container network services type bridge interface br10
:::

Assign `br10` to the appropriate firewall zone, for example with
`set firewall zone SERVICES interface br10` for an existing SERVICES zone.
Configure zone-pair policies, container DNS and any required WAN source NAT
explicitly. Globally routed IPv6 addresses can use native routing. For Internet
egress from ULA addresses, configure NAT66 explicitly.

Changing a container network setting used by Podman recreates the network and
restarts its containers. Description changes and setting or removing an explicit
default without changing its effective value leave the network and containers
running. If network removal fails, the previous network settings are restored
and previously running consumers are restarted; the commit still fails.
Removing the container network preserves the native bridge and its addresses. Remove or move its container-network references before deleting or
disabling the bridge. Device recreation interrupts attached containers; enabled
containers restart automatically when the native bridge returns.

When moving a network to another bridge or back to managed mode in one commit,
remove overlapping addresses from the previous native bridge in that commit
and update its firewall-zone membership. Alternatively, choose a new container
prefix that does not overlap the previous bridge. After removing a container
network, the retained bridge remains independently configured; review its
addresses, routes and firewall-zone membership before reusing the subnet.
```

```{cfgcmd} set container network \<name\> type macvlan parent \<interface\>

Attach this network directly to the given parent interface using the
MACVLAN driver. Containers appear on the parent network with their own
MAC address and are directly reachable, rather than being placed behind
a host bridge and NAT.

The parent interface must already exist. It can be an ethernet, bonding
or bridge interface, optionally a VLAN sub-interface of one.

:::{note}
MACVLAN networks cannot be assigned to a VRF.
:::
```

```{cfgcmd} set container network \<name\> type macvlan mode \<mode\>

- **bridge**: Containers act as separate hosts on the parent network
- **private**: Containers on the same parent interface cannot communicate
  with each other, even if the external switch supports hairpin forwarding
- **vepa**: Containers send all traffic through the parent switch for
  forwarding

Both `parent` and `mode` are required for a MACVLAN network.

:::{code-block} none
set container network NET01 prefix '192.0.2.0/24'
set container network NET01 type macvlan parent 'eth1'
set container network NET01 type macvlan mode 'bridge'
:::
```

```{cfgcmd} set container network \<name\> mtu \<number\>

Configure {abbr}`MTU (Maximum Transmission Unit)` for a given network. It
is the size (in bytes) of the largest ethernet frame sent on this link.
```

```{cfgcmd} set container network \<name\> no-name-server

Disable Domain Name System (DNS) plugin for this network.
```

```{cfgcmd} set container network \<name\> vrf \<name\>

Bind container network to a given VRF instance.
```

### Container Registry

```{cfgcmd} set container registry \<name\>

Adds registry to list of unqualified-search-registries. By default, for any
image that does not include the registry in the image name, VyOS will use
docker.io and quay.io as the container registry.
```

```{cfgcmd} set container registry \<name\> disable

Disable a given container registry
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
Registry mirror, use ``(host-name|address)[:port][/path]``.

If you have mirror http://192.168.1.1:8080 for docker.io, you can use
`docker.io/some/repo` or run `podman pull docker.io/some/repo`.

:::{code-block} none
set container registry docker.io mirror address 192.168.1.1
set container registry docker.io mirror port 8080
set container registry docker.io insecure
:::
If http://192.168.1.1:8080 is your own registry, you can use
`192.168.1.1:8080/some/repo` or run
`podman pull 192.168.1.1:8080/some/repo`.

:::{code-block} none
set container registry 192.168.1.1:8080 insecure
:::

### Log Configuration

```{cfgcmd} set container name \<name\> log-driver [k8s-file | journald | none]

Set the default log driver for containers.

- **k8s-file**: Log to a plain text file in Kubernetes-style format.
- **journald**: Log to the system journal (default)
- **none**: Disable logging for the container
```

## Operation Commands

```{opcmd} add container image \<containername\>

Pull a new image for container
```

```{opcmd} show container

Show the list of all active containers.
```

```{opcmd} show container image

Show the local container images.
```

```{opcmd} show container log \<containername\>

Show logs from a given container
```

```{opcmd} show container network

Show a list of available container networks.
```

```{opcmd} restart container \<containername\>

Restart a given container
```

```{opcmd} update container image \<containername\>

Update container image
```

```{opcmd} delete container image \<image id|all\> [force]

Delete a particular container image based on it's image ID.
You can also delete all container images at once.

You can not delete a container image if it has more then one tag
assigned, this is why there is a `force` option to pass down to
the container image to also remove those images.
```

## Container Storage

Container images and the writable layers of all containers are stored on
the persistence partition below
`/usr/lib/live/mount/persistence/container/storage`. This storage is
shared by all installed VyOS images, so containers survive a system
upgrade.

Podman uses the overlay storage driver. On an installed system, VyOS
uses the in-kernel overlayfs. `fuse-overlayfs`, a userspace
implementation that runs one helper process per container and is
noticeably slower for I/O-heavy workloads such as databases, is used
only if the storage sits on an overlayfs itself, which is the case on a
live-booted system.

Older VyOS releases used `fuse-overlayfs` on every system. Container
storage created by those releases keeps using `fuse-overlayfs` after an
upgrade, because its image layers store file deletions in a format the
in-kernel overlayfs does not understand. Podman detects this
automatically, so no action is required.

To check which implementation is in use, look for `fuse-overlayfs`
processes while containers are running:

:::{code-block} none
vyos@vyos:~$ pgrep -a fuse-overlayfs
:::

No output means the in-kernel overlayfs is used.

### Migrate to In-Kernel Overlayfs

Existing container storage can be moved to the in-kernel overlayfs by
resetting it and pulling all images again.

:::{warning}
Resetting the storage deletes all container images, containers and
volumes managed by Podman. Data in volumes mapped to a host path using
`set container name <name> volume` is not affected. Make sure all images
can be pulled again, or export them first using `podman image save`.
:::

1. Note the images in use:

   :::{code-block} none
   vyos@vyos:~$ show container image
   :::

2. Stop all containers. Repeat for every configured container:

   :::{code-block} none
   vyos@vyos:~$ sudo systemctl stop vyos-container-<name>
   :::

3. Reset the container storage:

   :::{code-block} none
   vyos@vyos:~$ sudo podman system reset --force
   :::

4. Pull every image again:

   :::{code-block} none
   vyos@vyos:~$ add container image <image>
   :::

5. Reboot the system. This recreates the container networks and starts
   all containers on the new storage.

Afterwards, `pgrep -a fuse-overlayfs` should not return any process.

## Example Configurations

% stop_vyoslinter
For the sake of demonstration, [example #1 in the official documentation](https://www.zabbix.com/documentation/current/manual/installation/containers)
is adapted to the declarative VyOS CLI syntax for Zabbix.
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

set container name zabbix-java-gateway image zabbix/zabbix-java-gateway:alpine-5.2-latest
set container name zabbix-java-gateway network zabbix address 172.20.0.11

set container name zabbix-server-mysql image zabbix/zabbix-server-mysql:alpine-5.2-latest
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

set container name zabbix-web-nginx-mysql image zabbix/zabbix-web-nginx-mysql:alpine-5.2-latest
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

