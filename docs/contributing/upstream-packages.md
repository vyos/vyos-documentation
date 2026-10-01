---
lastproofread: '2026-09-30'
---

(upstream-packages)=

# Upstream Packages

VyOS images use packages from Debian repositories and packages built by the
VyOS project. If you only need to build an ISO, see {ref}`build` instead.
This page describes the package build scripts in the
[`vyos-build` repository][package-build].

## Build a package

Run package builds inside the `vyos-build` container. See {ref}`build_docker`
for setup instructions. In the container, change to the package's build
directory and run its `build.py` entry point:

```console
cd /vyos/scripts/package-build/frr
./build.py
```

Each package directory contains a `package.toml` manifest and a `build.py`
link to the common build script in `scripts/package-build/`. The script reads
the manifest in the current directory. By default, it processes every
`[[packages]]` entry in that file. It also accepts `--config` to select a
different manifest and `--patch-dir` to select a different patch directory.

For each package entry, the script clones the configured source repository if
the checkout does not already exist, checks out the configured `commit_id`,
runs the optional pre-build hook, applies patches when enabled, and runs the
configured build command. It can also prepare Debian packaging metadata when
`prepare_package` is enabled. The script installs declared build dependencies
using APT, so package builds can install packages in the build container.

## Package manifest

Each manifest contains one or more `[[packages]]` tables. Common fields are:

- `name`: Source checkout directory and package entry name.
- `scm_url`: Git URL of the source repository.
- `commit_id`: Git branch, tag, or commit to check out.
- `build_cmd`: Optional shell command to build the package. If omitted, the
  script uses its default `dpkg-buildpackage` command.
- `pre_build_hook`: Optional shell command or script run from the source
  checkout before patches and the build.
- `apply_patches`: Whether to apply patches from the configured patch
  directory. Defaults to `true`.
- `prepare_package`: Whether to write `install_data` to the source package's
  `debian/install` file before building. Defaults to `false`.
- `install_data`: Contents written to `debian/install` when
  `prepare_package` is enabled.

An optional `[dependencies]` table can list Debian packages to install before
building:

```toml
[[packages]]
name = "example-package"
commit_id = "v1.2.3"
scm_url = "https://example.com/example-package.git"
# Add build_cmd only when the default dpkg-buildpackage command is not suitable.

[dependencies]
packages = ["build-essential", "pkg-config"]
```

Use the package's existing manifest as the reference for its build command,
dependencies, and patch layout. In particular, do not assume that all package
builds use the same Debian build command.

## Build artifacts

The package source checkout and source tarball are kept in the package's
directory under `scripts/package-build/`. Generated `.deb` files are copied
to the parent `scripts/package-build/` directory. The script removes its
temporary build-dependency packages after the build.

[package-build]: https://github.com/vyos/vyos-build/tree/rolling
