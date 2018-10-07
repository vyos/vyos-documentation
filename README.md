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

## Docker

## Create Container

```bash
$ docker build -t vyos-docu - < Dockerfile
```

### Build Documentation

```bash
$ docker run -v `pwd`:`pwd` -w `pwd`/docs -i -t --rm vyos-docu bash
```

Inside the container you can the build the documentation as stated above
