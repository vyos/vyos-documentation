# Web variant of original Dockerfile

FROM debian:stretch
LABEL authors="VyOS Maintainers <maintainers@vyos.io>"

ENV DEBIAN_FRONTEND noninteractive

# Added nginx, procps, nano for web front end and troubleshooting
RUN apt-get update && apt-get upgrade -y && apt-get install -y \
    git \
    sudo \
    nano \
    nginx \
    procps \
    net-tools \
    mc \
    make \
    python3-sphinx \
    python-sphinx-rtd-theme \
    latexmk \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra

# Setup nginx to serve content from tmp directory
RUN touch /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/sites-enabled/default
WORKDIR ./tmp

# Clone main repository, make html files, set folder permissions for viewing
RUN git clone https://github.com/vyos/vyos-documentation.git \
    && cd /tmp/vyos-documentation/docs && make html \
    && sudo chmod o+x /tmp/ /tmp/vyos-documentation/ /tmp/vyos-documentation/docs/ \
    /tmp/vyos-documentation/docs/_build/ /tmp/vyos-documentation/docs/_build/html/

# Restart nginx with new settings, expose 80, and keep it from exiting
RUN /etc/init.d/nginx restart
EXPOSE 80/tcp
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]