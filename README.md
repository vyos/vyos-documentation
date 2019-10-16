This is a playground for a new VyOS documentation starting for VyOS 1.2 (Crux)
release.

# Build

## Native

To build the manual run the following commands inside the `docs` folder:

* `make html` for a HTML manual
* `make latexpdf` for a LaTeX rendered PDF

Required Debian Packages:
* `python-sphinx`
* `python-sphinx-rtd-theme`
* `latexmk`
* `texlive-latex-recommended`
* `texlive-fonts-recommended`
* `texlive-latex-extra`

### sphinx-autobuild
Required extra setup procedure on Debian:
```bash
sudo apt-get install python-pip
sudo pip install sphinx-autobuild
```

To build and run a webeserver, inside the `docs` folder:
* `make livehtml` and browse to http://localhost:8000


## Docker

Using our [Dockerfile](docker/Dockerfile) you create your own Docker container
that is used to build a VyOS documentation.

## Setup

```bash
$ docker build -t vyos-docu docker
```

### Build

Linux
```bash
$ docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos-docu make html

# sphinx autobuild
$ docker run --rm -it -p 8000:8000 -v "$(pwd)":/vyos -w /vyos/docs -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos-docu make livehtml
```

Windows
```powershell
docker run --rm -it -v "$(pwd):/vyos" -w /vyos/docs vyos-docu make html

# sphinx autobuild
docker run --rm -it -p 8000:8000 -v "$(pwd):/vyos" -w /vyos/docs vyos-docu make livehtml
```

### Test the docs

discuss in this Task: [T1731](https://phabricator.vyos.net/T1731)

to test all files:

```bash
$ docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos-docu vale .
```

to test a specific file e.g. clustering.rst
```bash
$ docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos-docu vale clustering.rst
```
