This is a playground for a new VyOS documentation starting for VyOS 1.2 (Crux) release.

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

Using our [Dockerfile](docker/Dockerfile) you can create your own Docker container
that is used to build a VyOS documentation.

### Setup

```bash
$ docker build -t vyos-docu docker
```

### Build

Linux
```bash
$ docker run --rm -it -v "$(pwd)":/vyos -w /vyos/docs -e GOSU_UID=$(id -u) -e GOSU_GID=$(id -g) vyos-docu make html
```

## Docker Web

Using our [Dockerfile](docker-web/Dockerfile) you can create a variant of the above 
Docker container that will clone the latest VyOS documentation, make the HTML files, 
and provide a web front end via nginx.  The user can browse to http://x.x.x.x:80800 
where x.x.x.x = the IP address of the VM that the container was built on.  

### Setup

Change directory to 'docker-web' and build the image; give it a tag for easy reference.

```bash
$ cd docker-web
$ docker image build --tag local:vyos-docu-web .
```

### Build

Run the container detached and expose TCP 8080 for Web access.

```bash
$ docker container run -d --name vyos-docu-web -p 8080:80 local:vyos-docu-web
```

### Accessing

Assuming IP connectivity exists; launch a Web browse and navigate to http://x.x.x.x:8080. 
At this point you should see the VyOS Documentation page.

### Modifying 

If you have a fork of the Vyos-Documentation repository commit and push changes to your 
forked repo.  You can then access the shell of the container, delete the current repo clone, 
clone your updates into the tmp directory and re-run the make command, set permissions, and 
restart nginx. 

```bash
docker exec -i -t vyos-docu-web bash
rm -rf vyos-documentation/
git clone <YOUR REPO URL>
cd /tmp/vyos-documentation/docs && make html
chmod o+x /tmp/ /tmp/vyos-documentation/ /tmp/vyos-documentation/docs/ \
    /tmp/vyos-documentation/docs/_build/ /tmp/vyos-documentation/docs/_build/html/
/etc/init.d/nginx restart
```

After your restart nginx your container will exit and it will need to be restarted:

```bash
docker container restart vyos-docu-web
```

You can now browse and view your changes at http://x.x.x.x:8080.

**Note: Tested on VirtualBox VM running Ubuntu Server 18.04.2 LTS
