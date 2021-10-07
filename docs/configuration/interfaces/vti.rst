.. _vti-interface:

##############################
VTI - Virtual Tunnel Interface
##############################

Set Virtual Tunnel Interface

.. code-block:: none

  set interfaces vti vti0 address 192.168.2.249/30
  set interfaces vti vti0 address 2001:db8:2::249/64

Results in:

.. code-block:: none

  vyos@vyos# show interfaces vti
  vti vti0 {
      address 192.168.2.249/30
      address 2001:db8:2::249/64
      description "Description"
  }

.. warning:: When using site-to-site IPsec with VTI interfaces,
   be sure to disable route autoinstall

.. code-block:: none
  
  set vpn ipsec options disable-route-autoinstall