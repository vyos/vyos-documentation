QoS and Traffic Policy
======================

The traffic policy subsystem provides an interface to Linux traffic control.

One common use of traffic policy is to limit bandwidth for an interface. In
the example below we limit bandwidth for our LAN connection to 200 Mbit
download and out WAN connection to 50 Mbit upload:

.. code-block:: sh

  set traffic-policy shaper WAN-OUT bandwidth '50Mbit'
  set traffic-policy shaper WAN-OUT default bandwidth '50%'
  set traffic-policy shaper WAN-OUT default ceiling '100%'
  set traffic-policy shaper WAN-OUT default queue-type 'fair-queue'

  set traffic-policy shaper LAN-OUT bandwidth '200Mbit'
  set traffic-policy shaper LAN-OUT default bandwidth '50%'
  set traffic-policy shaper LAN-OUT default ceiling '100%'
  set traffic-policy shaper LAN-OUT default queue-type 'fair-queue'

Resulting in the following configuration:

.. code-block:: sh

  traffic-policy {
      shaper WAN-OUT {
          bandwidth 50Mbit
          default {
              bandwidth 50%
              ceiling 100%
              queue-type fair-queue
          }
      }
      shaper LAN-OUT {
          bandwidth 200Mbit
          default {
              bandwidth 50%
              ceiling 100%
              queue-type fair-queue
          }
      }
  }

Once defined, a traffic policy can be applied to each interface using the
interface-level `traffic-policy` directive:

.. code-block:: sh

  set interfaces ethernet eth0 traffic-policy out 'WAN-OUT'
  set interfaces ethernet eth1 traffic-policy out 'LAN-OUT'

Note that a traffic policy can also be defined to match specific traffic flows
using class statements.

VyOS 1.2 (Crux) also supports HFSC_:

.. code-block:: sh

 set traffic-policy shaper-hfsc

See further information on the QoS_ page.

.. _HFSC: https://en.wikipedia.org/wiki/Hierarchical_fair-service_curve
.. _QoS: https://wiki.vyos.net/wiki/QoS
