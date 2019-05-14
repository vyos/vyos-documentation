.. _clustering:

Clustering
==========

VyOS supports multicast clustering.

In the example below SSH is clustered between two nodes.

.. code-block:: sh

  cluster {
      dead-interval 20000
      group cluster {
          auto-failback false
          primary vyos
          secondary vyos2
          service ssh
          service 192.168.0.123/24/eth0
      }
      interface eth0
      keepalive-interval 5000
      monitor-dead-interval 20000
      pre-shared-secret S3cr#t
  }

.. note::
  Please follow the process of the cluster function here. https://phabricator.vyos.net/T985