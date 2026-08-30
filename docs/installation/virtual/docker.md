---
lastproofread: '2026-08-30'
---

(docker)=

# Run VyOS as a container

Docker is an open-source project for deploying applications as standardized
units called containers. Deploying VyOS in a container provides a simple and
lightweight mechanism for both testing and packet routing for container
workloads.

## IPv6 Support for docker

VyOS requires an IPv6-enabled Docker network. Currently Linux distributions
do not enable Docker IPv6 support by default.

You can enable IPv6 support in two ways.

### Method 1: Create a docker network with IPv6 support

Here is a example using the macvlan driver.

```none
docker network create --ipv6 -d macvlan -o parent=eth0 --subnet 2001:db8::/64 --subnet 192.0.2.0/24 mynet
```

### Method 2: Add IPv6 support to the Docker daemon

Edit /etc/docker/daemon.json to set the `ipv6` key to `true` and specify
the `fixed-cidr-v6` to your desired IPv6 subnet.

```none
{
  "ipv6": true,
  "fixed-cidr-v6": "2001:db8::/64"
}
```

Reload the docker configuration.

```none
$ sudo systemctl reload docker
```

## Deploy container from ISO

A VyOS ISO image can be converted into an OCI (Open Container Initiative)
image using the `iso-to-oci` helper script from the
[vyos-build](https://github.com/vyos/vyos-build) repository. The script
extracts the root filesystem from the ISO, removes components which are not
usable inside a container (kernel, firmware, and the corresponding CLI nodes),
and generates a tarball which can be imported by Docker.

The script requires `xorriso`, `squashfs-tools` and `jq` to be installed. All
of them are already present in the vyos-build container.

### Build a container image from a locally built ISO

If you build your own ISO from source (see {ref}`build`), the `oci` make
target converts the ISO which is generated in `build/` in one step:

```none
$ make oci
I: extracting ISO metadata
I: extracting squashfs image
I: extracting squashfs content
I: generate OCI container image vyos-1.4.5-oci-amd64.tar
I: to import the previously generated OCI image to your local images run:

   docker import vyos-1.4.5-oci-amd64.tar vyos:1.4.5 --change 'CMD ["/sbin/init"]'
```

### Build a container image from a downloaded ISO

To use a released or nightly ISO instead, call the script directly and pass
the path to the ISO image:

```none
$ git clone https://github.com/vyos/vyos-build.git
$ ./vyos-build/scripts/iso-to-oci vyos-1.4.5-generic-amd64.iso
```

### Import and run the container

Import the generated tarball as a local image and start the container. If you
created a custom IPv6-enabled network, include it as the `--net` parameter to
`docker run`.

```none
$ docker import vyos-1.4.5-oci-amd64.tar vyos:1.4.5 \
> --change 'CMD ["/sbin/init"]'
$ docker run -d --rm --name vyos --privileged -v /lib/modules:/lib/modules \
> vyos:1.4.5
$ docker exec -ti vyos su - vyos
```

To stop the container, run `docker stop vyos`.

:::{hint}
The very same image can also be used with
[Containerlab](https://containerlab.dev) to build virtual network labs. Refer
to its [VyOS kind](https://containerlab.dev/manual/kinds/vyosnetworks_vyos/)
documentation for the required node settings.
:::
