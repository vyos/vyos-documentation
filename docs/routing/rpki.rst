.. _rpki:

####
RPKI
####

:abbr:`RPKI (Resource Public Key Infrastructure)` is a framework :abbr:`PKI
(Public Key Infrastructure)` designed to secure the Internet routing
infrastructure. It associates BGP route announcements with the correct
originating :abbr:`ASN (Autonomus System Number)` which BGP routers can then
use to check each route against the corresponding :abbr:`ROA (Route Origin
Authorisation)` for validity. RPKI is described in :rfc:`6480`.

A BGP-speaking router like VyOS can retrieve ROA information from RPKI
"Relying Party software" (often just called an "RPKI server" or "RPKI
validator") by using :abbr:`RTR (RPKI to Router)` protocol. There are several
open source implementations to choose from, such as NLNetLabs' Routinator_
(written in Rust), Cloudflare's GoRTR_ and OctoRPKI_ (written in Go), and
RIPE NCC's RPKI Validator_ (written in Java). The RTR protocol is described
in :rfc:`8210`.

First you will need to deploy an RPKI validator for your routers to use. The
RIPE NCC helpfully provide `some instructions`_ to get you started with
several different options.  Once your server is running you can start
validating announcements.

Imported prefixes during the validation may have values:

  valid
    The prefix and ASN that originated it match a signed ROA. These are
    probably trustworthy route announcements.

  invalid
    The prefix or prefix length and ASN that originated it doesn't
    match any existing ROA. This could be the result of a prefix hijack, or
    merely a misconfiguration, but should probably be treated as
    untrustworthy route announcements.

  notfound
    No ROA exists which covers that prefix. Unfortunately this is the case
    for about 80% of the IPv4 prefixes which were announced to the :abbr:`DFZ
    (default-free zone)` at the start of 2020 (see more detail in
    NLnet Labs' `RPKI analytics`_).

.. note::
  If you are responsible for the global addresses assigned to your
  network, please make sure that your prefixes have ROAs associated with them
  to avoid being `notfound` by RPKI. For most ASNs this will involve
  publishing ROAs via your :abbr:`RIR (Regional Internet Registry)` (RIPE
  NCC, APNIC, ARIN, LACNIC or AFRINIC), and is something you are encouraged
  to do whenever you plan to announce addresses into the DFZ.

  Particularly large networks may wish to run their own RPKI certificate
  authority and publication server instead of publishing ROAs via their RIR.
  This is a subject far beyond the scope of VyOS' documentation. Consider
  reading about Krill_ if this is a rabbit hole you need or especially want
  to dive down.

We can build route-maps for import based on these states. Here is a simple
RPKI configuration, where `routinator` is the RPKI-validating "cache"
server with ip `192.0.2.1`:

.. code-block:: none

  set protocols rpki cache routinator address '192.0.2.1'
  set protocols rpki cache routinator port '3323'

Here is an example route-map to apply to routes learned at import. In this
filter we reject prefixes with the state `invalid`, and set a higher
`local-preference` if the prefix is RPKI `valid` rather than merely
`notfound`.

.. code-block:: none

  set policy route-map ROUTES-IN rule 10 action 'permit'
  set policy route-map ROUTES-IN rule 10 match rpki 'valid'
  set policy route-map ROUTES-IN rule 10 set local-preference '300'
  set policy route-map ROUTES-IN rule 20 action 'permit'
  set policy route-map ROUTES-IN rule 20 match rpki 'notfound'
  set policy route-map ROUTES-IN rule 20 set local-preference '125'
  set policy route-map ROUTES-IN rule 30 action 'deny'
  set policy route-map ROUTES-IN rule 30 match rpki 'invalid'

.. _Routinator: https://www.nlnetlabs.nl/projects/rpki/routinator/
.. _GoRTR: https://github.com/cloudflare/gortr
.. _OctoRPKI: https://github.com/cloudflare/cfrpki#octorpki
.. _Validator: https://www.ripe.net/manage-ips-and-asns/resource-management/certification/tools-and-resources
.. _some instructions: https://labs.ripe.net/Members/tashi_phuntsho_3/how-to-install-an-rpki-validator
.. _Krill: https://www.nlnetlabs.nl/projects/rpki/krill/
.. _RPKI analytics: https://www.nlnetlabs.nl/projects/rpki/rpki-analytics/
