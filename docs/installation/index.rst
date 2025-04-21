#################################
Installation and Image Management
#################################

.. note:: This is most likely only relevant for virtual installations:

   When installing VyOS ensure that the MAC address selected for your NICs is
   not a locally administered MAC address. Locally administered addresses are
   distinguished from universally administered addresses by setting (assigning
   the value of 1 to) the second-least-significant bit of the first octet of
   the address:

   Example: ``02:00:00:00:00:01``, where the second-least-significant bit
   (``02`` in hex) is set to ``1``.

.. toctree::
   :maxdepth: 2
   :caption: Content

   install
   virtual/index
   cloud/index
   bare-metal
   update
   image
   secure-boot
