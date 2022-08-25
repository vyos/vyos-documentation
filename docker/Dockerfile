# Must be run with --privileged flag
# Recommended to run the container with a volume mapped
# in order to easy exprort images built to "external" world
FROM debian:11
LABEL authors="VyOS Maintainers <maintainers@vyos.io>"

ENV DEBIAN_FRONTEND noninteractive

# Standard shell should be bash not dash
RUN echo "dash dash/sh boolean false" | debconf-set-selections && \
    dpkg-reconfigure dash

RUN apt-get update && apt-get install -y \
    vim \
    nano \
    git \
    mc \
    make \
    python3-pip \
    latexmk \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    sudo \
    gosu \
    graphviz \
    curl \
    dos2unix



RUN pip3 install Sphinx
RUN pip3 install sphinx-rtd-theme
RUN pip3 install sphinx-autobuild
RUN pip3 install sphinx-notfound-page
RUN pip3 install lxml
RUN pip3 install myst-parser
RUN pip3 install sphinx-panels


# Cleanup
RUN rm -rf /var/lib/apt/lists/*

EXPOSE 8000

# Allow password-less 'sudo' for all users in group 'sudo'
RUN sed "s/^%sudo.*/%sudo\tALL=(ALL) NOPASSWD:ALL/g" -i /etc/sudoers && \
    chmod a+s /usr/sbin/useradd /usr/sbin/groupadd /usr/sbin/gosu /usr/sbin/usermod


COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# we need to convert the entrypoint with appropriate line endings, else
# there will be an error:
#     standard_init_linux.go:175: exec user process caused
#     "no such file or directory"
RUN dos2unix /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
