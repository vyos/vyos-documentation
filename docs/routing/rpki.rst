.. _rpki:

####
RPKI
####

:abbr:`RPKI (Resource Public Key Infrastructure)` is a framework :abbr:`PKI
(Public Key Infastucrure)` designed to secure the Internet routing
infrastructure. It associate a BGP route announcement with the correct
originating :abbr:`ASN (Autonomus System Number)` and check its validity.

RPKI is described in :rfc:`6480`. This is a separate server. You can find more
details at RIPE-NNC_.

Imported prefixes during the validation may have values: valid, invalid and
not found.

* The valid state means that prefix and ASN that originated it match the
  :abbr:`ROA (Route Origination Authorizations)` base.
* Invalid means that prefix/prefix length and ASN that originated it doesn't
  match with ROA.
* Notfound means that prefix not found in ROA.

We can build route-maps for import, based on these states. Simple RPKI
configuration, where 'routinator' - RPKI cache server with ip '192.0.2.1'.

.. code-block:: none

  set protocols rpki cache routinator address '192.0.2.1'
  set protocols rpki cache routinator port '3323'

Example route-map for import. We can set local-preference logic based on states.
Also we may not import prefixes with the state 'invalid'.

.. code-block:: none

  set policy route-map ROUTES-IN rule 10 action 'permit'
  set policy route-map ROUTES-IN rule 10 match rpki 'valid'
  set policy route-map ROUTES-IN rule 10 set local-preference '300'
  set policy route-map ROUTES-IN rule 20 action 'permit'
  set policy route-map ROUTES-IN rule 20 match rpki 'notfound'
  set policy route-map ROUTES-IN rule 20 set local-preference '125'
  set policy route-map ROUTES-IN rule 30 action 'deny'
  set policy route-map ROUTES-IN rule 30 match rpki 'invalid'

.. _RIPE-NNC: https://github.com/RIPE-NCC/rpki-validator-3/wiki
