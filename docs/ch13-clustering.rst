Clustering
==========

VyOS supports multicast and unicast clustering. Multicast is default and to
use the unicast method you can add the peer directive to the interface with
the ip of the other cluster member.

In the example below SSH is clustered between two nodes with the unicast
method.

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
      interface eth0 {
          peer 192.168.0.121
      }
      keepalive-interval 5000
      monitor-dead-interval 20000
      pre-shared-secret S3cr#t
  }
