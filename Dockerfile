# Must be run with --privileged flag
# Recommended to run the container with a volume mapped
# in order to easy exprort images built to "external" world
FROM ubuntu:18.04

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    vim \
    git \
    mc \
    make \
    python3-sphinx \
    python-sphinx-rtd-theme \
    latexmk \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra sudo \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 1000 ubuntu
RUN useradd -d /home/ubuntu -ms /bin/bash -g 1000 -u 1000 ubuntu && \
    echo "ubuntu:ubuntu" | chpasswd && \
    adduser ubuntu sudo

RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER ubuntu
WORKDIR ~
