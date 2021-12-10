.. _docker:

***************************
Running in Docker Container
***************************

Docker is an open-source project for deploying applications as standardized
units called containers. Deploying VyOS in a container provides a simple and
lightweight mechanism for both testing and packet routing for container
workloads.

IPv6 Support for docker
=======================

VyOS requires an IPv6-enabled docker network. Currently linux distributions
do not enable docker IPv6 support by default. You can enable IPv6 support in
two ways.

Method 1: Create a docker network with IPv6 support 
---------------------------------------------------

Here is a example using the macvlan driver.

.. code-block:: none

  docker network create --ipv6 -d macvlan -o parent=eth0 --subnet 2001:db8::/64 --subnet 192.0.2.0/24 mynet

Method 2: Add IPv6 support to the docker daemon 
-----------------------------------------------

Edit /etc/docker/daemon.json to set the ``ipv6`` key to ``true`` and to specify
the ``fixed-cidr-v6`` to your desired IPv6 subnet.

.. code-block:: none

  {
    "ipv6": true,
    "fixed-cidr-v6": "2001:db8::/64"
  }

Reload the docker configuration.

.. code-block:: none

  $ sudo systemctl reload docker


Deploy container from ISO
=========================

Download the ISO on which you want to base the container. In this example, 
the name of the ISO is ``vyos-1.4-rolling-202111281249-amd64.iso``. If you
created a custom IPv6-enabled network, the ``docker run`` command below
will require that this network be included as the ``--net`` parameter to
``docker run``.

.. code-block:: none

  $ mkdir vyos && cd vyos
  $ cp ~/vyos-1.4-rolling-202111281249-amd64.iso .
  $ mkdir rootfs
  $ sudo mount -o loop vyos-1.4-rolling-202111281249-amd64.iso rootfs
  $ sudo apt-get install -y squashfs-tools
  $ mkdir unsquashfs
  $ sudo unsquashfs -f -d unsquashfs/ rootfs/live/filesystem.squashfs
  $ sudo tar -C unsquashfs -c . | docker import - vyos:1.4-rolling-202111281249
  $ sudo umount rootfs
  $ cd ..
  $ sudo rm -rf vyos
  $ docker run -d --rm --name vyos --privileged -v /lib/modules:/lib/modules \
  > vyos:1.4-rolling-202111281249 /sbin/init
  $ docker exec -ti vyos su - vyos

You can execute ``docker stop vyos`` when you are finished with the container.
