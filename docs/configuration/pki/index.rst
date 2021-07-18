lastproofread: 1970-01-01

.. include:: /_include/need_improvement.txt

###
PKI
###

VyOS 1.4 changed the way in how encrytions keys/certificates are stored on the
running system. In the pre VyOS 1.4 era, certificates got stored under /config
ans every service referenced a file. That made copying a running configuration
from system A to system B a bit harder, as you had to copy the files and their
permissions by hand.

VyOS 1.4 comes with a new approach where the keys are stored on the CLI and are
simply referenced by their name.

Don't be afraid that you need to re-do your configuration. Key transformation is
handled, as always, by our migration scripts, so this will be a smooth transition
for you!
