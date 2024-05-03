:lastproofread: 2022-06-10

#########
Container
#########

The VyOS container implementation is based on `Podman<https://podman.io/>` as
a deamonless container engine.

*************
Configuration
*************

.. cfgcmd:: set container name <name> image

    Sets the image name in the hub registry

    .. code-block:: none

      set container name mysql-server image mysql:8.0

    If a registry is not specified, Docker.io will be used as the container
    registry unless an alternative registry is specified using
    **set container registry <name>** or the registry is included in the image name

    .. code-block:: none

      set container name mysql-server image quay.io/mysql:8.0

.. cfgcmd:: set container name <name> allow-host-networks

    Allow host networking in a container. The network stack of the container is
    not isolated from the host and will use the host IP.

    The following commands translate to "--net host" when the container
    is created

    .. note:: **allow-host-networks** cannot be used with **network**

.. cfgcmd:: set container name <name> network <networkname>

    Attaches user-defined network to a container.
    Only one network must be specified and must already exist.

.. cfgcmd:: set container name <name> network <networkname> address <address>

    Optionally set a specific static IPv4 or IPv6 address for the container.
    This address must be within the named network prefix.

    .. note:: The first IP in the container network is reserved by the engine and cannot be used

.. cfgcmd:: set container name <name> description <text>

    Set a container description

.. cfgcmd:: set container name <name> environment <key> value <value>

    Add custom environment variables.
    Multiple environment variables are allowed.
    The following commands translate to "-e key=value" when the container
    is created.

    .. code-block:: none

        set container name mysql-server environment MYSQL_DATABASE value 'zabbix'
        set container name mysql-server environment MYSQL_USER value 'zabbix'
        set container name mysql-server environment MYSQL_PASSWORD value 'zabbix_pwd'
        set container name mysql-server environment MYSQL_ROOT_PASSWORD value 'root_pwd'

.. cfgcmd:: set container name <name> port <portname> source <portnumber>
.. cfgcmd:: set container name <name> port <portname> destination <portnumber>
.. cfgcmd:: set container name <name> port <portname> protocol <tcp | udp>

    Publish a port for the container.

    .. code-block:: none

        set container name zabbix-web-nginx-mysql port http source 80
        set container name zabbix-web-nginx-mysql port http destination 8080
        set container name zabbix-web-nginx-mysql port http protocol tcp

.. cfgcmd:: set container name <name> volume <volumename> source <path>
.. cfgcmd:: set container name <name> volume <volumename> destination <path>

    Mount a volume into the container

    .. code-block:: none

        set container name coredns volume 'corefile' source /config/coredns/Corefile
        set container name coredns volume 'corefile' destination /etc/Corefile

.. cfgcmd:: set container name <name> volume <volumename> mode <ro | rw>

    Volume is either mounted as rw (read-write - default) or ro (read-only)

.. cfgcmd:: set container name <name> uid <number>
.. cfgcmd:: set container name <name> gid <number>

    Set the User ID or Group ID of the container

.. cfgcmd:: set container name <name> restart [no | on-failure | always]

   Set the restart behavior of the container.

   - **no**: Do not restart containers on exit
   - **on-failure**: Restart containers when they exit with a non-zero exit code, retrying indefinitely (default)
   - **always**: Restart containers when they exit, regardless of status, retrying indefinitely

.. cfgcmd:: set container name <name> memory <MB>

   Constrain the memory available to the container.

   Default is 512 MB. Use 0 MB for unlimited memory.

.. cfgcmd:: set container name <name> device <devicename> source <path>
.. cfgcmd:: set container name <name> device <devicename> destination <path>

   Add a host device to the container.

.. cfgcmd:: set container name <name> capability <text>

   Set container capabilities or permissions.

   - **net-admin**: Network operations (interface, firewall, routing tables)
   - **net-bind-service**: Bind a socket to privileged ports (port numbers less than 1024)
   - **net-raw**: Permission to create raw network sockets
   - **setpcap**: Capability sets (from bounded or inherited set)
   - **sys-admin**: Administation operations (quotactl, mount, sethostname, setdomainame)
   - **sys-time**: Permission to set system clock

.. cfgcmd:: set container name <name> disable

   Disable a container.

Container Networks
==================

.. cfgcmd:: set container network <name>

    Creates a named container network

.. cfgcmd:: set container network <name> description

    A brief description what this network is all about.

.. cfgcmd:: set container network <name> prefix <ipv4|ipv6>

    Define IPv4 or IPv6 prefix for a given network name. Only one IPv4 and
    one IPv6 prefix can be used per network name.

.. cfgcmd:: set container network <name> vrf <nme>

    Bind container network to a given VRF instance.

Container Registry
==================

.. cfgcmd:: set container registry <name>

    Adds registry to list of unqualified-search-registries. By default, for any
    image that does not include the registry in the image name, VyOS will use
    docker.io and quay.io as the container registry.

.. cfgcmd:: set container registry <name> disable

    Disable a given container registry

.. cfgcmd:: set container registry <name> authentication username
.. cfgcmd:: set container registry <name> authentication password

    Some container registries require credentials to be used.

    Credentials can be defined here and will only be used when adding a
    container image to the system.


******************
Operation Commands
******************

.. opcmd:: add container image <containername>

    Pull a new image for container

.. opcmd:: show container

    Show the list of all active containers.

.. opcmd:: show container image

    Show the local container images.

.. opcmd:: show container log <containername>

    Show logs from a given container

.. opcmd:: show container network

    Show a list available container networks

.. opcmd:: restart container <containername>

    Restart a given container

.. opcmd:: update container image <containername>

    Update container image

.. opcmd:: delete container image [image id|all]

    Delete a particular container image based on it's image ID.
    You can also delete all container images at once.

*********************
Example Configuration
*********************

    For the sake of demonstration, `example #1 in the official documentation
    <https://www.zabbix.com/documentation/current/manual/installation/containers>`_
    to the declarative VyOS CLI syntax.

    .. code-block:: none

        set container network zabbix prefix 172.20.0.0/16
        set container network zabbix description 'Network for Zabbix component containers'

        set container name mysql-server image mysql:8.0
        set container name mysql-server network zabbix

        set container name mysql-server environment 'MYSQL_DATABASE' value 'zabbix'
        set container name mysql-server environment 'MYSQL_USER' value 'zabbix'
        set container name mysql-server environment 'MYSQL_PASSWORD' value 'zabbix_pwd'
        set container name mysql-server environment 'MYSQL_ROOT_PASSWORD' value 'root_pwd'

        set container name zabbix-java-gateway image zabbix/zabbix-java-gateway:alpine-5.2-latest
        set container name zabbix-java-gateway network zabbix

        set container name zabbix-server-mysql image zabbix/zabbix-server-mysql:alpine-5.2-latest
        set container name zabbix-server-mysql network zabbix

        set container name zabbix-server-mysql environment 'DB_SERVER_HOST' value 'mysql-server'
        set container name zabbix-server-mysql environment 'MYSQL_DATABASE' value 'zabbix'
        set container name zabbix-server-mysql environment 'MYSQL_USER' value 'zabbix'
        set container name zabbix-server-mysql environment 'MYSQL_PASSWORD' value 'zabbix_pwd'
        set container name zabbix-server-mysql environment 'MYSQL_ROOT_PASSWORD' value 'root_pwd'
        set container name zabbix-server-mysql environment 'ZBX_JAVAGATEWAY' value 'zabbix-java-gateway'

        set container name zabbix-server-mysql port zabbix source 10051
        set container name zabbix-server-mysql port zabbix destination 10051

        set container name zabbix-web-nginx-mysql image zabbix/zabbix-web-nginx-mysql:alpine-5.2-latest
        set container name zabbix-web-nginx-mysql network zabbix

        set container name zabbix-web-nginx-mysql environment 'MYSQL_DATABASE' value 'zabbix'
        set container name zabbix-web-nginx-mysql environment 'ZBX_SERVER_HOST' value 'zabbix-server-mysql'
        set container name zabbix-web-nginx-mysql environment 'DB_SERVER_HOST' value 'mysql-server'
        set container name zabbix-web-nginx-mysql environment 'MYSQL_USER' value 'zabbix'
        set container name zabbix-web-nginx-mysql environment 'MYSQL_PASSWORD' value 'zabbix_pwd'
        set container name zabbix-web-nginx-mysql environment 'MYSQL_ROOT_PASSWORD' value 'root_pwd'

        set container name zabbix-web-nginx-mysql port http source 80
        set container name zabbix-web-nginx-mysql port http destination 8080
