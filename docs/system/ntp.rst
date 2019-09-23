.. _ntp:

NTP
===

there are 3 default NTP server set. You are able to change them.

.. code-block:: sh

  set system ntp server 0.pool.ntp.org
  set system ntp server 1.pool.ntp.org
  set system ntp server 2.pool.ntp.org

To set up VyOS as an NTP responder, you must specify the listen address and optionally the permitted clients.

.. code-block:: sh

  set system ntp listen-address 192.168.199.1
  set system ntp allow-clients address 192.168.199.0/24
