Bridging
--------

Interfaces in VyOS can be bridged together to provide software switching of
Layer-2 traffic.

A bridge is created when a bridge interface is defined. In the example below
we will be creating a bridge for VLAN 100 and assigning a VIF to the bridge.

.. code-block:: sh

  set interfaces bridge 'br100'
  set interfaces ethernet eth1 vif 100 
  set interfaces bridge br100 member interface eth1.100
    
Interfaces assigned to a bridge-group do not have address configuration. An IP
address can be assigned to the bridge interface itself, however, like any
normal interface.

.. code-block:: sh

  set interfaces bridge br100 address '192.168.100.1/24'
  set interfaces bridge br100 address '2001:db8:100::1/64'

Example Result:

.. code-block:: sh

  bridge br100 {
      address 192.168.100.1/24
      address 2001:db8:100::1/64
  }
  [...]
  ethernet eth1 {
  [...]
      vif 100 {
      }
  }

In addition to normal IP interface configuration, bridge interfaces support
Spanning-Tree Protocol. STP is disabled by default.

.. note:: Please use caution when introducing spanning-tree protocol on a
   network as it may result in topology changes.

To enable spanning-tree use the
`set interfaces bridge <name> stp true` command:

.. code-block:: sh

  set interfaces bridge br100 stp true

STP `priority`, `forwarding-delay`, `hello-time`, and `max-age` can be
configured for the bridge-group. The MAC aging time can also be configured
using the `aging` directive.

For member interfaces, the bridge-group `priority` and `cost` can be
configured.

The `show bridge` operational command can be used to display configured
bridges:

.. code-block:: sh

  vyos@vyos:~$ show bridge
  bridge name     bridge id               STP enabled     interfaces
  br100           0000.000c29443b19       yes             eth1.100

If spanning-tree is enabled, the `show bridge <name> spanning-tree` command
can be used to show STP configuration:

.. code-block:: sh

  vyos@vyos:~$ show bridge br100 spanning-tree
  br100
   bridge id              0000.000c29443b19
   designated root        0000.000c29443b19
   root port                 0                    path cost                  0
   max age                  20.00                 bridge max age            20.00
   hello time                2.00                 bridge hello time          2.00
   forward delay            15.00                 bridge forward delay      15.00
   ageing time             300.00
   hello timer               0.47                 tcn timer                  0.00
   topology change timer     0.00                 gc timer                  64.63
   flags

  eth1.100 (1)
   port id                8001                    state                forwarding
   designated root        0000.000c29443b19       path cost                  4
   designated bridge      0000.000c29443b19       message age timer          0.00
   designated port        8001                    forward delay timer        0.00
   designated cost           0                    hold timer                 0.00
   flags

The MAC address-table for a bridge can be displayed using the
`show bridge <name> macs` command:

.. code-block:: sh

  vyos@vyos:~$ show bridge br100 macs
  port no mac addr                is local?       ageing timer
    1     00:0c:29:44:3b:19       yes                0.00
