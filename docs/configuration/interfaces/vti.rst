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

More details about the IPsec and VTI issue and option disable-route-autoinstall
https://blog.vyos.io/vyos-1-dot-2-0-development-news-in-july

The root cause of the problem is that for VTI tunnels to work, their traffic 
selectors have to be set to 0.0.0.0/0 for traffic to match the tunnel, even 
though actual routing decision is made according to netfilter marks. Unless 
route insertion is disabled entirely, StrongSWAN thus mistakenly inserts a 
default route through the VTI peer address, which makes all traffic routed 
to nowhere.