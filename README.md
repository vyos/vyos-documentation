Starting with VyOS 1.2 (`crux`) documentation is being migrated from the old wiki
to ReadTheDocs. Documentation can be accessed via the following URL:

* https://docs.vyos.io

# Build

[![Documentation Status](https://readthedocs.org/projects/vyos/badge/?version=latest)](https://docs.vyos.io/en/latest/?badge=latest)

## Native

To build the manual, run the following commands inside the `docs` folder:

* `make html` for an HTML manual
* `make latexpdf` for a LaTeX rendered PDF

Required Debian Packages:
* `latexmk`
* `texlive-latex-recommended`
* `texlive-fonts-recommended`
* `texlive-latex-extra`
* `sphinx`

### sphinx
Debian requires some extra steps for
installing `sphinx`, `sphinx-autobuild` and `sphinx-rtd-theme` packages:

First ensure that Python 2 & Python 3 are installed and Python 3 is the default:
```bash
python --version
```

Alternatively, to make Python the default, revise the following line to
point at the relevant 3.x version of the binary on your system:

```bash
sudo update-alternatives --install /usr/bin/python python /usr/bin/python3 0
```

Then install the sphinx group of packages:
```bash
sudo apt-get install python3-sphinx
```

Although almost everything uses Python 3, in order to install this specific
package, make sure that pip points at the Python 2 version of the package manager:

```bash
python --version
```

Then run:

```bash
sudo pip install sphinx-rtd-theme
```


Do the following to build the HTML and start a webserver:
* Run `make livehtml` inside the `docs` folder

Then, to view the live output:
* Browse to http://localhost:8000
Note: The changes you save to the sources are represented in the live HTML output
automatically (and almost instantly) without the need to rebuild or refresh manually.

## Docker

Using our [Dockerfile](docker/Dockerfile) you can create your own Docker container
that is used to build a VyOS documentation.

## Setup

You can either build the container on your own or directly fetch it prebuilt
from Dockerhub. If you want to build it for yourself, use the following command.

```bash
$ docker build -t vyos/vyos-documentation docker
```

### Building documentation

If the `vyos/vyos-documentation` container could not be found locally it will be
automatically fetched from Dockerhub.

```bash
$ docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs \
  -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos/vyos-documentation make html

# sphinx autobuild
$ docker run --rm -it -p 8000:8000 -v "$(pwd)":/vyos -w /vyos/docs -e \
  GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos/vyos-documentation make livehtml
```

### Test the docs

Discuss in this Phabricator task: [T1731](https://phabricator.vyos.net/T1731)

To test all files run:

```bash
$ docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs \
  -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos/vyos-documentation vale .
```

to test a specific file (e.g. `clustering.rst`)

```bash
$ docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs -e GOSU_UID=$(id -u) \
  -e GOSU_GID=$(id -g) vyos/vyos-documentation vale clustering.rst
```
