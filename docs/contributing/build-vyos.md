---
lastproofread: '2026-09-30'
---

(build)=

# Build VyOS

## Prerequisites

The supported build environment is the `vyos/vyos-build` container. It manages
the required dependencies for you. The image builder can check for missing
host dependencies, but use the container for the expected dependency versions
and system setup. See {ref}`build_docker` for the build instructions.

:::{note}
Starting with VyOS 1.4, only source code and Debian package
repositories of the rolling release (the `rolling` branch) are publicly
available.

The source code and pre-built Debian package repositories of LTS releases
are only available to subscription holders (customers and active community
members with contributors subscriptions).

The following includes the build process for VyOS rolling release.
:::

This will guide you through the process of building a VyOS ISO using [Docker].
This process has been tested on clean installs of Debian Bookworm.

(build_native)=

### Native Build

The image builder can check a host for missing dependencies, but building
directly on the host is not the supported path. Use the container described in
{ref}`build_docker` for a reproducible build environment.

(build_docker)=

### Docker

Installing [Docker] and prerequisites:

:::{hint}
Docker versions are updated frequently. The following examples may
become outdated.
:::

```none
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

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
:::

#### Build Container

The container can be built by hand or by fetching the pre-built one from
DockerHub. It is recommended to use the pre-built containers from the
[VyOS DockerHub organisation](https://hub.docker.com/u/vyos). The container
is built from Docker packages automatically after every commit to the
``vyos-build`` repository (this process may take 2-3 hours).

:::{note}
If you use the pre-built container, it will be automatically
downloaded from DockerHub if it is not found on your local machine when
you build the ISO.
:::

##### Dockerhub

To manually download the container from DockerHub, run:

```none
$ docker pull vyos/vyos-build:rolling  # For VyOS rolling release
```


##### Build from source

The container can also be built directly from source:

```none
$ git clone -b rolling --single-branch https://github.com/vyos/vyos-build

$ cd vyos-build
$ docker build -t vyos/vyos-build:rolling docker
```

:::{note}
VyOS switched to Debian Bookworm (12) in the `rolling` branch.
Due to software version updates, it is recommended to use the official
Docker Hub image to build VyOS ISO.
:::

#### Tips and Tricks

You can create Bash aliases to easily launch the latest container per release
train (`rolling`). Add the following to your `.bash_aliases` file:

```none
alias vybld='docker pull vyos/vyos-build:rolling && docker run --rm -it \
    -v "$(pwd)":/vyos \
    -v "$HOME/.gitconfig":/etc/gitconfig \
    -v "$HOME/.bash_aliases":/home/vyos_bld/.bash_aliases \
    -v "$HOME/.bashrc":/home/vyos_bld/.bashrc \
    -w /vyos --privileged --sysctl net.ipv6.conf.lo.disable_ipv6=0 \
    -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) \
    vyos/vyos-build:rolling bash'
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

(build-iso)=

## Build ISO

Now that you understand the prerequisites, you can build a VyOS ISO from source.
First, fetch the latest source code from GitHub:

```none
$ git clone -b rolling --single-branch https://github.com/vyos/vyos-build
```

Now you can begin a fresh VyOS ISO build. Change to the `vyos-build`
directory and run:

```none
$ cd vyos-build
$ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:rolling bash
```

Start the build:

```none
vyos_bld@8153428c7e1f:/vyos$ sudo make clean
vyos_bld@8153428c7e1f:/vyos$ sudo ./build-vyos-image --architecture amd64 --build-by "j.randomhacker@vyos.io" generic
```

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
vyos_bld ece068908a5b:/vyos [rolling] # sudo chroot build/chroot /bin/bash
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

(build_custom_packages)=

### Linux Kernel

The kernel version and flavor used for an ISO build are configured in
`data/defaults.toml` in the `vyos-build` repository. Check that file in the
branch you are building instead of relying on a version copied into this guide.

For rolling builds, the kernel and its out-of-tree modules use the package
build files under [`scripts/package-build/linux-kernel/`][rolling-kernel-build].
That directory contains `package.toml`, `build.py`, kernel configuration
fragments, and helper scripts for packages such as Accel-PPP, Intel NIC drivers,
QAT, and firmware. The package manifest records source revisions for the kernel
modules, while the build process obtains the kernel version and flavor from
`data/defaults.toml`.

For Sagitta 1.4 builds, use the archived `sagitta-public-unmaintained` branch
and its older [`packages/linux-kernel/` workflow][sagitta-kernel-build]. Follow
the instructions from the same `vyos-build` branch as the image you are
building; do not mix the rolling and Sagitta workflows. The rolling package
build no longer uses the Sagitta `packages/linux-kernel/Jenkinsfile` workflow.
Kernel packages and out-of-tree modules must match the kernel version and flavor
used by the image build.

% stop_vyoslinter
[rolling-kernel-build]: https://github.com/vyos/vyos-build/tree/rolling/scripts/package-build/linux-kernel
[sagitta-kernel-build]: https://github.com/vyos/vyos-build/tree/sagitta-public-unmaintained/packages/linux-kernel
% start_vyoslinter

### Packages

If you are brave enough to build your own ISO image with any modified package
from VyOS's GitHub organisation, this is the place for you.

Any modified package may be an altered version (e.g., `vyos-1x`) that you
want to test before filing a pull request on GitHub.

Building an ISO with a customized package is the same as building a regular
ISO image. Place your modified `*.deb` package inside the `packages` folder
within `vyos-build`. The build process will automatically use your custom
package during the ISO build.

### Troubleshooting

Debian APT does not provide verbose error messages. If your ISO build fails and
you suspect an APT dependencies or installation issue, you can apply this patch
to increase APT verbosity during the ISO build.

% stop_vyoslinter

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

% start_vyoslinter

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
# For VyOS 1.3 (equuleus, rolling)
$ docker run --rm -it --privileged -v $(pwd):/vyos -w /vyos vyos/vyos-build:rolling bash

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
