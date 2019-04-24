# Must be run with --privileged flag
# Recommended to run the container with a volume mapped
# in order to easy exprort images built to "external" world
FROM debian:stretch
LABEL authors="VyOS Maintainers <maintainers@vyos.io>"

ENV DEBIAN_FRONTEND noninteractive

# Standard shell should be bash not dash
RUN echo "dash dash/sh boolean false" | debconf-set-selections && \
    dpkg-reconfigure dash

RUN apt-get update && apt-get install -y \
    vim \
    git \
    mc \
    make \
    python3-sphinx \
    python3-pip \
    python-sphinx-rtd-theme \
    latexmk \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    sudo \
    gosu

RUN pip3 install sphinx-autobuild

# Cleanup
RUN rm -rf /var/lib/apt/lists/*

EXPOSE 8000

# Allow password-less 'sudo' for all users in group 'sudo'
RUN sed "s/^%sudo.*/%sudo\tALL=(ALL) NOPASSWD:ALL/g" -i /etc/sudoers && \
    chmod a+s /usr/sbin/useradd /usr/sbin/groupadd /usr/sbin/gosu /usr/sbin/usermod

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

