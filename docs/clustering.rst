.. _clustering:

Clustering
==========

The cluster feature allows 2 vyos routers to share IP addresses and various services.

VyOS supports multicast clustering.

.. note::
  Please follow the process of the cluster function here. https://phabricator.vyos.net/T985


General cluster configuration
-----------------------------

In the general cluster configuration the network interfaces used for monitoring and negotiation of the cluster health is defined.
Additionally, the communication interval settings, multicast group (for sending/receiving heartbeat messages), and pre-shared secret used in this monitoring is defined.

.. code-block:: sh

  vyos@vyos# set cluster
  Possible completions:
    dead-interval            Interval after which a node is considered dead after missing heartbeats (milliseconds)
  +> group                   Name of resource group for clustering [REQUIRED]
  +  interface               Interface(s) for sending/receiving heartbeat packets [REQUIRED]
    keepalive-interval       Time interval between heartbeat packets (milliseconds)
    mcast-group              Multicast group for sending/receiving heartbeat packets
    monitor-dead-interval    Interval after which a monitor node is considered dead (milliseconds)
    pre-shared-secret        Pre-shared secret for authentication between cluster nodes [REQUIRED]

Cluster group configuration
---------------------------

For the cluster group configuration, the group name must be defined before the groups configuration can be set (See Example below).
After the group name is defined, the specific service to be clustered between primary and secondary nodes is configured.

.. code-block:: sh

  vyos@vyos# set cluster group GROUPNAME
  Possible completions:
    auto-failback        Fail back to primary node if it recovers from failure
  +  monitor             IP address(es) for monitoring connectivity
    primary              Host name of the primary node [REQUIRED]
  +  secondary           Host name(s) of the secondary node(s) [REQUIRED]
  +  service             IP address(es) or service name(s) in this resource group [REQUIRED]

Review cluster status
---------------------

.. code-block:: sh

  vyos@vyos:~$ show cluster status


Example
-------

In the example below SSH is clustered between two nodes.

.. code-block:: sh

  cluster {
      dead-interval 20000
      group cluster {
          auto-failback false
          primary node1
          secondary node2
          service ssh
          service 192.168.0.123/24/eth0
      }
      interface eth0
      keepalive-interval 5000
      monitor-dead-interval 20000
      pre-shared-secret S3cr#t
  }