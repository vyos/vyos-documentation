.. _coding_guidelines:

Python Coding Guidelines
========================

The switch to the Python programming language for new code is not merely a change
of the language, but a chance to rethink and improve the programming approach.

Let's face it: VyOS is full of spaghetti code where logic for reading the VyOS
config, generating daemon configs, and restarting processes is all mixed up.

Python (or any other language, for that matter) does not provide automatic protection
from bad design, so we need to also devise design guidelines and follow them to
keep the system extensible and maintainable.

Configuration script structure and behaviour
--------------------------------------------

.. code-block:: python

  import sys

  from vyos.config import Config
  from vyos.util import ConfigError

  def get_config():
      vc = Config()
      # Convert the VyOS config to an abstract internal representation
      config = ...
      return config

  def verify(config):
      # Verify that configuration is valid
      if invalid:
          raise ConfigError("Descriptive message")
      return True

  def generate(config):
      # Generate daemon configs
      pass

  def apply(config):
      # Apply the generated configs to the live system
      pass

  try:
      config = get_config()
      verify(config)
  except ConfigError as e:
      print(e)
      sys.exit(1)

The **get_config()** function must convert the VyOS config to an abstract internal
representation. No other function is allowed to call ``vyos.config.Config`` object
methods directly. The rationale for it is that when config reads are mixed with
other logic, it's very hard to change the config syntax since you need to weed
out every occurrence of the old syntax. If syntax-specific code is confined to a
single function, the rest of the code can be left untouched as long as the
internal representation remains compatible.

Another advantage is testability of the code. Mocking the entire config subsystem
is hard, while constructing an internal representation by hand is way simpler.

The **verify()** function takes an internal representation of the config and checks
if it's valid, otherwise it must raise ``VyOSError`` with an error message that
describes the problem and possibly suggests how to fix it. It must not make any
changes to the system. The rationale for it is again testability and, in the
future when the config backend is ready and every script is rewritten in this
fashion, ability to execute commit dry run ("commit test" like in JunOS) and abort
commit before making any changes to the system if an error is found in any component.

The **generate()** function generates config files for system components.

The **apply()** function applies the generated configuration to the live system.
It should use non-disruptive reload whenever possible. It may execute disruptive
operations such as daemon process restart if a particular component does not
support non-disruptive reload, or when the expected service degradation is minimal
(for example, in case of auxiliary services such as LLDPd). In case of high impact
services such as VPN daemon and routing protocols, when non-disruptive reload is
supported for some but not all types of configuration changes, scripts authors
should make effort to determine if a configuration change can be done in a
non-disruptive way and only resort to disruptive restart if it cannot be avoided.

Unless absolutely necessary, configuration scripts should not modify the active
configuration of system components directly. Whenever at all possible, scripts
should generate a configuration file or files that can be applied with a single
command such as reloading a service through systemd init. Inserting statements
one by one is particularly discouraged, for example, when configuring netfilter
rules, saving them to a file and loading it with iptables-restore should always
be preferred to executing iptables directly.

The **apply()** and **generate()** functions may ``raise ConfigError`` if, for
example, the daemon failed to start with the updated config. It shouldn't be a
substitute for proper config checking in the **verify()** function. All reasonable
effort should be made to verify that generated configuration is valid and will
be accepted by the daemon, including, when necessary, cross-checks with other
VyOS configuration subtrees.

Exceptions, including ``VyOSError`` (which is raised by ``vyos.config.Config`` on
improper config operations, such as trying to use ``list_nodes()`` on a non-tag
node) should not be silenced or caught and re-raised as config error. Sure this
will not look pretty on user's screen, but it will make way better bug reports,
and help users (and most VyOS users are IT professionals) do their own debugging
as well.

Coding guidelines
-----------------

Language
********

Python 3 **shall** be used. How long can we keep Python 2 alive anyway?

No considerations for Python 2 compatibility **should** be taken.

Formatting
**********

Tabs **shall not** be used. Every indentation level should be 4 spaces.

Text generation
***************

Template processor **should** be used for generating config files. Built-in
string formatting **may** be used for simple line-oriented formats where every
line is self-contained, such as iptables rules. Template processor **must** be
used for structured, multi-line formats such as those used by ISC DHCPd.

The default template processor for VyOS code is jinja2.

Code policy
-----------

When modifying the source code, remember these rules of the legacy elimination
campaign:

 * No new features in Perl
 * No old style command definitions
 * No code incompatible with Python3

.. _process: https://blog.vyos.io/vyos-development-digest-10
.. _vyos-1x: https://github.com/vyos/vyos-1x/blob/current/schema/
.. _VyConf: https://github.com/vyos/vyconf/blob/master/data/schemata

