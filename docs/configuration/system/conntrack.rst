###################
Connection tracking
###################

Modules
-------

.. code-block:: none

    conntrack {
        modules {
            ftp
            h323
            nfs
            pptp
            sip
            sqlnet
            tftp
        }
    }

Enables ``conntrack`` modules. All modules are now disabled by default, while they
used to be enabled in previous versions. Enabling the modules ensures backwards
compatibility — keeping the previous behavior.

In most cases they can be disabled by removing the block of configuration.

.. code-block:: none

    delete system conntrack modules

For some scenarios it is in fact recommended, like in this example:
:ref:`example-high-availability`.
