# Must be run with --privileged flag
# Recommended to run the container with a volume mapped
# in order to easy exprort images built to "external" world
FROM debian:stretch

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

RUN groupadd -g 1000 debian
RUN useradd -d /home/debian -ms /bin/bash -g 1000 -u 1000 debian && \
    echo "debian:debian" | chpasswd && \
    adduser debian sudo

RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER debian
WORKDIR ~
