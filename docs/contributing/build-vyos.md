---
lastproofread: '2026-11-07'
---

(build)=

# Build VyOS

There are different ways you can build VyOS. Building using a
{ref}`build_docker`
container is the easiest way because all dependencies are managed for you.
Alternatively, you can set up your own build machine and run a
{ref}`build_native` build.

This will guide you through the process of building a VyOS ISO using [Docker].
This process has been tested on clean installs of Debian Bookworm.

:::{note}
Starting with VyOS 1.4, only source code and Debian package
repositories of the rolling release (the `rolling` branch) are publicly
available.

The source code and pre-built Debian package repositories of LTS releases
are only available to subscription holders (customers and active community
members with contributors subscriptions).

The following describes the build process for VyOS 1.5 (circinus).
:::

## Prerequisites

### Get the Source Code

Both the Docker and the native build use the `vyos-build` [repository].
Fetch the latest source code from GitHub:

```none
$ git clone -b circinus --single-branch https://github.com/vyos/vyos-build
```

On macOS, clone the sources inside the build container instead, see the
note in {ref}`build_docker`.

(build_docker)=

### Docker

Install Docker Engine on your build host by following the official
[Docker installation guide for Debian][docker]. It is kept up to date
with the current Docker packages and repository setup.

To use Docker without `sudo`, add your current non-root user to the `docker`
group: `sudo usermod -aG docker yourusername`.

:::{hint}
Adding a user to the `docker` group grants privileges equivalent to
`root`. It is recommended to remove the non-root user from the `docker`
group after building the VyOS ISO. See also [Docker as non-root].
:::

:::{note}
The build process must run on a local file system. Building on SMB or
NFS shares will cause the container to fail. VirtualBox shared folders are
also not supported because block device operations are not implemented.

On macOS, do not bind mount a directory from your home folder into the
container. Use a Docker volume instead and clone the sources inside the
container directly into the volume:

```none
$ docker volume create vyos-build
$ docker run --rm -it --privileged -v vyos-build:/vyos -w /vyos vyos/vyos-build:circinus bash
vyos_bld@8153428c7e1f:/vyos$ git clone -b circinus --single-branch https://github.com/vyos/vyos-build .
```

This gives the same `/vyos` layout as a bind mount. Skip the host-side
`cd vyos-build` and `docker run` steps in {ref}`build-iso` and run the
build commands in this container.

macOS file systems (APFS, HFS+) are case-insensitive by default. The Linux
kernel source tree contains files whose names differ only in case (e.g.
`xt_CONNMARK.h` and `xt_connmark.h`). On such a file system one file
overwrites the other and the kernel build fails or produces broken
binaries. A Docker volume lives on the Linux file system of the Docker VM
and is case-sensitive. If you must use a host directory, put it on a
case-sensitive APFS volume.
:::

#### Build Container

The container can be built by hand or by fetching the pre-built one from
DockerHub. It is recommended to use the pre-built containers from the
[VyOS DockerHub organisation](https://hub.docker.com/u/vyos). The container
is built from Docker packages automatically after every commit to the
`vyos-build` repository (this process may take 2-3 hours).

:::{note}
If you use the pre-built container, it will be automatically
downloaded from DockerHub if it is not found on your local machine when
you build the ISO.
:::

##### Dockerhub

To manually download the container from DockerHub, run:

```none
$ docker pull vyos/vyos-build:circinus  # For VyOS 1.5 (circinus)
```

##### Build from source

The container can also be built directly from source. Run the following
inside your `vyos-build` checkout:

```none
$ docker build -t vyos/vyos-build:circinus docker
```

:::{note}
VyOS 1.5 (circinus) is based on Debian Bookworm (12).
Due to software version updates, it is recommended to use the official
Docker Hub image to build VyOS ISO.
:::

#### Tips and Tricks

You can create Bash aliases to easily launch the latest container per release
train (`circinus`). Add the following to your `.bash_aliases` file:

```none
alias vybld='docker pull vyos/vyos-build:circinus && docker run --rm -it \
    -v "$(pwd)":/vyos \
    -v "$HOME/.gitconfig":/etc/gitconfig \
    -v "$HOME/.bash_aliases":/home/vyos_bld/.bash_aliases \
    -v "$HOME/.bashrc":/home/vyos_bld/.bashrc \
    -w /vyos --privileged --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
    -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
    vyos/vyos-build:circinus bash'
```

Now you have a new alias `vybld` that launches development containers in
your current working directory.

:::{note}
Some VyOS packages (namely vyos-1x) come with build-time tests which
verify some of the internal library calls that they work as expected. Those
tests are carried out through the Python Unittest module. If you want to
build the `vyos-1x` package (which is our main development package) you
need to start your Docker container using the following argument:
`--sysctl net.ipv6.conf.lo.disable_ipv6=0`, otherwise those tests will
fail.
:::

(build_native)=

### Native Build

To build VyOS natively, you need a properly configured build host with
Debian Bookworm installed.

For required packages, refer to the `docker/Dockerfile` file in the
[repository]. The `./build-vyos-image` script will also warn you if any
dependencies are missing.

Once the build host is prepared, run the build commands from {ref}`build-iso`
directly on the host instead of inside the container.

(build-iso)=

## Build ISO

Now that you understand the prerequisites, you can build a VyOS ISO from source.
Change to the `vyos-build` directory you cloned earlier and launch the build
container:

```none
$ cd vyos-build
$ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:circinus bash
```

Start the build:

```none
vyos_bld@8153428c7e1f:/vyos$ sudo make clean
vyos_bld@8153428c7e1f:/vyos$ sudo ./build-vyos-image --architecture amd64 --build-by "j.randomhacker@vyos.io" generic
```

For a {ref}`build_native` build, run the same two commands directly on your
build host.

When the build is successful, find the resulting ISO in the `build` directory
as `live-image-[architecture].hybrid.iso`.

(build-source)=

(customize)=

### Customize

You can customize the ISO with the following configure options. Generate the
full and current list with `./build-vyos-image --help`:

```none
$ vyos_bld@8153428c7e1f:/vyos$ sudo ./build-vyos-image --help
  I: Checking if packages required for VyOS image build are installed
  usage: build-vyos-image [-h] [--architecture ARCHITECTURE]
  [--build-by BUILD_BY] [--debian-mirror DEBIAN_MIRROR]
  [--debian-security-mirror DEBIAN_SECURITY_MIRROR]
  [--pbuilder-debian-mirror PBUILDER_DEBIAN_MIRROR]
  [--vyos-mirror VYOS_MIRROR] [--build-type BUILD_TYPE]
  [--version VERSION] [--build-comment BUILD_COMMENT] [--debug] [--dry-run]
  [--custom-apt-entry CUSTOM_APT_ENTRY] [--custom-apt-key CUSTOM_APT_KEY]
  [--custom-package CUSTOM_PACKAGE]
      [build_flavor]

  positional arguments:
  build_flavor          Build flavor

  optional arguments:
  -h, --help            show this help message and exit
  --architecture ARCHITECTURE
                          Image target architecture (amd64 or arm64)
  --build-by BUILD_BY   Builder identifier (e.g. jrandomhacker@example.net)
  --debian-mirror DEBIAN_MIRROR
                          Debian repository mirror
  --debian-security-mirror DEBIAN_SECURITY_MIRROR
                          Debian security updates mirror
  --pbuilder-debian-mirror PBUILDER_DEBIAN_MIRROR
                          Debian repository mirror for pbuilder env bootstrap
  --vyos-mirror VYOS_MIRROR
                          VyOS package mirror
  --build-type BUILD_TYPE
                          Build type, release or development
  --version VERSION     Version number (release builds only)
  --build-comment BUILD_COMMENT
                          Optional build comment
  --debug               Enable debug output
  --dry-run             Check build configuration and exit
  --custom-apt-entry CUSTOM_APT_ENTRY
                          Custom APT entry
  --custom-apt-key CUSTOM_APT_KEY
                          Custom APT key file
  --custom-package CUSTOM_PACKAGE
                          Custom package to install from repositories
```

(build_custom_packages)=

### Custom Packages

If you are brave enough to build your own ISO image with any modified package
from VyOS's GitHub organisation, this is the place for you.

Any modified package may be an altered version (e.g., `vyos-1x`) that you
want to test before filing a pull request on GitHub.

Building an ISO with a customized package is the same as building a regular
ISO image. Place your modified `*.deb` package inside the `packages` folder
within `vyos-build`. The build process will automatically use your custom
package during the ISO build.

### Linux Kernel

The Linux kernel used by VyOS is heavily tied to the ISO build process. The
file `data/defaults.toml` defines the kernel version (`kernel_version`) and
the `kernel_flavor`, which represents the kernel's LOCALVERSION. Together they
form the kernel release string of the system:

```none
vyos@vyos:~$ uname -r
6.6.160-vyos
```

In addition to the kernel itself, VyOS ships firmware and out-of-tree kernel
modules that must be built against the exact same kernel:

- Linux firmware (`vyos-linux-firmware`)
- Accel-PPP
- Intel NIC drivers (igb, ixgbe, ixgbevf, i40e, ice, iavf)
- Intel QAT
- OpenVPN Data Channel Offload (DCO)
- Realtek NIC drivers (r8126, r8152)
- Jool, ipt-netflow and the RTSP NAT helper

Each of those modules holds a dependency on the kernel version and if you are
lucky enough to receive an ISO build error which sounds like:

```none
I: Create initramfs if it does not exist.
Extra argument '6.6.160-vyos'
...
E: config/hooks/live/17-gen_initramfs.chroot failed (exit non-zero). You should check for errors.
```

The most obvious reasons could be:

- `vyos-build` repo is outdated, please `git pull` to update to the latest
  release kernel version from us.
- You have your own custom kernel `*.deb` packages in the `packages` folder but
  neglected to build all required out-of-tree modules listed above.

#### Building The Kernel

All kernel related build scripts live in
`vyos-build/scripts/package-build/linux-kernel`. The package list, the
pinned versions of all out-of-tree modules and the required build
dependencies are defined in `package.toml` in the same directory.

Use the `build.py` wrapper to build the kernel. It performs all required
steps in one go:

1. Installs the Debian build dependencies listed in `package.toml`.
2. Downloads the kernel source for `kernel_version` from kernel.org and
   verifies its signature, unless a `linux` source directory already exists.
3. Calls `build-kernel.sh`, which applies the patches from the `patches`
   folder, generates the kernel configuration and builds the Debian
   packages.
4. Builds the firmware package and all out-of-tree modules from
   `package.toml` against the freshly built kernel.

Run it from within the build container:

```none
$ cd /vyos/scripts/package-build/linux-kernel
$ ./build.py
```

:::{note}
Building the kernel will take some time depending on the speed and
quantity of your CPU/cores and disk speed. Expect 20 minutes
(or even longer) on lower end hardware.
:::

To build only selected packages, pass their names as listed in
`package.toml`. The kernel must be built first, as all other packages
depend on it:

```none
$ ./build.py --packages linux-kernel linux-firmware igb ixgbe
```

To only install the build dependencies, run `./build.py --install-dependencies`.

:::{note}
`build-kernel.sh` only builds the kernel itself. It does not install
dependencies or build firmware and out-of-tree modules. Always prefer
`build.py`.

`build-kernel.sh` runs `git reset --hard` and `git clean -fdx` in the
`linux` directory. Copy any local modifications out of that directory
before you start a build.
:::

When complete, you will find all generated `*.deb` files in the
`linux-kernel` directory.

:::{warning}
`build.py` does not abort if a single package fails to build. It prints
`Failed to build package <name>` and continues with the next one. Check the
output for such messages before you copy the packages.

`*.deb` files from earlier runs are not removed. When you rebuild the kernel,
delete the old packages first, so you do not mix modules built against
different kernel versions.
:::

Copy the packages to the `vyos-build/packages` folder, where the ISO build
will use them automatically:

```none
$ cp *.deb ../../../packages/
```

##### Firmware

If you upgrade your kernel or include new drivers you may need new firmware.
`build.py` builds the `vyos-linux-firmware` package from the
`linux-firmware` repository at the version pinned in `package.toml`:

```none
$ ./build.py --packages linux-firmware
```

The firmware blobs are selected automatically from the network drivers of
the kernel built in the previous step, so build the kernel first.

### Troubleshooting

(iso_build_issues)=

#### ISO Build Issues

There are (rare) situations where building an ISO image is not possible at all
due to a broken package feed in the background. APT is not very good at
reporting the root cause of the issue. Your ISO build will likely fail with a
more or less similar looking error message:

```none
The following packages have unmet dependencies:
 vyos-1x : Depends: accel-ppp but it is not installable
E: Unable to correct problems, you have held broken packages.
...
make: *** [Makefile:30: iso] Error 1
```

To debug the build process and gain additional information of what could be the
root cause, you need to use `chroot` to change into the build directory. This is
explained in the following step by step procedure:

```none
vyos_bld ece068908a5b:/vyos [circinus] # sudo chroot build/chroot /bin/bash
```

We now need to mount some required, volatile filesystems

```none
(live)root@ece068908a5b:/# mount -t proc none /proc
(live)root@ece068908a5b:/# mount -t sysfs none /sys
(live)root@ece068908a5b:/# mount -t devtmpfs none /dev
```

We now are free to run any command we would like to use for debugging, e.g.
re-installing the failed package after updating the repository.

```none
(live)root@ece068908a5b:/# apt-get update; apt-get install vyos-1x
...
The following packages have unmet dependencies:
 vyos-1x : Depends: accel-ppp but it is not installable
E: Unable to correct problems, you have held broken packages.
```

Now it's time to fix the package mirror and rerun the last step until the
package installation succeeds again!

#### APT Verbosity

Debian APT does not provide verbose error messages. If your ISO build fails and
you suspect an APT dependencies or installation issue, you can apply this patch
to increase APT verbosity during the ISO build.

```diff
diff --git i/scripts/live-build-config w/scripts/live-build-config
index 1b3b454..3696e4e 100755
--- i/scripts/live-build-config
+++ w/scripts/live-build-config
@@ -57,7 +57,8 @@ lb config noauto \
         --firmware-binary false \
         --updates true \
         --security true \
-        --apt-options "--yes -oAcquire::Check-Valid-Until=false" \
+        --apt-options "--yes -oAcquire::Check-Valid-Until=false -oDebug::BuildDeps=true -oDebug::pkgDepCache::AutoInstall=true \
+                             -oDebug::pkgDepCache::Marker=true -oDebug::pkgProblemResolver=true -oDebug::Acquire::gpgv=true" \
         --apt-indices false
         "${@}"
 """
```

(build-packages)=

## Packages

VyOS comes with specific packages that cannot be found in any
Debian mirror. These packages are located in the [VyOS GitHub project] in
source format and can easily be compiled into custom
Debian (`*.deb`) packages.

The easiest way to compile your package is with the {ref}`build_docker`
container mentioned earlier, as it includes all required dependencies for all
VyOS related packages.

Assuming you want to build the `vyos-1x` package and modify it for your needs,
first clone the repository from GitHub:

```none
$ git clone --recurse-submodules https://github.com/vyos/vyos-1x
```


### Build

Launch the Docker container and build the package:

```none
# For VyOS 1.5 (circinus)
$ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:circinus bash

# Change to source directory
$ cd vyos-1x

# Build DEB
$ dpkg-buildpackage -uc -us -tc -b
```

After a minute or two, the generated DEB packages are located next to the
`vyos-1x` source directory:

```none
# ls -al ../vyos-1x*.deb
-rw-r--r-- 1 vyos_bld vyos_bld 567420 Aug  3 12:01 ../vyos-1x_1.3dev0-1847-gb6dcb0a8_all.deb
-rw-r--r-- 1 vyos_bld vyos_bld   3808 Aug  3 12:01 ../vyos-1x-vmware_1.3dev0-1847-gb6dcb0a8_amd64.deb
```


### Install

To test your newly created package, you can SCP it to a running VyOS instance
and install the new `*.deb` package to replace the current one.

Install the package using the following commands:

```none
vyos@vyos:~$ dpkg --install /tmp/vyos-1x_<version>_all.deb
```

You can also place the generated `*.deb` in your ISO build environment to
include it in a custom ISO. See {ref}`build_custom_packages` for more
information.

:::{warning}
Any packages in the `packages` directory will be added to the
ISO during the build, replacing upstream packages. Delete both the source
directories and built DEB packages if you want to build an ISO from purely
upstream packages.
:::

[docker]: https://docs.docker.com/engine/install/debian/
[docker as non-root]: https://docs.docker.com/engine/install/linux-postinstall
[repository]: https://github.com/vyos/vyos-build
[vyos dockerhub organisation]: https://hub.docker.com/u/vyos
[vyos github project]: https://github.com/vyos
