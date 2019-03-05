.. _interfaces-vti:

Tunnel Interfaces (vti)
-----------------------

Set Virtual Tunnel interface

.. code-block:: sh

  set interfaces vti vti0 address 192.168.2.249/30
  set interfaces vti vti0 address 2001:db8:2::249/64

Results in:

.. code-block:: sh

  vyos@vyos# show interfaces vti
  vti vti0 {
      address 192.168.2.249/30
      address 2001:db8:2::249/64
      description "Description"
  }
