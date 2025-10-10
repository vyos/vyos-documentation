.. _development:

###########
Development
###########

All VyOS source code is hosted on GitHub under the VyOS organization which can
be found here: https://github.com/vyos

Our code is split into several modules. VyOS is composed of multiple individual
packages, some of them are forks of upstream packages and are periodically
synced with upstream, so keeping the whole source under a single repository
would be very inconvenient and slow. There is now an ongoing effort to
consolidate all VyOS-specific framework/config packages into vyos-1x package,
but the basic structure is going to stay the same, just with fewer and fewer
packages while the base code is rewritten from Perl/BASH into Python using and
XML based interface definition for the CLI.

The repository that contains all the ISO build scripts is:
https://github.com/vyos/vyos-build

The README.md file will guide you to use the this top level repository.

Submit a Patch
==============

.. warning::

  Please read and sign the :doc:`Contributor License Agreement<cla>` before
  submitting any patches.

Patches are always more than welcome. To have a clean and easy to maintain
repository we have some guidelines when working with Git. A clean repository
eases the automatic generation of a changelog file.

A good approach for writing commit messages is actually to have a look at the
file(s) history by invoking ``git log path/to/file.txt``.

.. _prepare_commit:

Prepare patch/commit
--------------------

In a big system, such as VyOS, that is comprised of multiple components, it's
impossible to keep track of all the changes and bugs/feature requests in one's
head. We use a bugtracker known as Phabricator_ for it ("issue tracker" would
be a better term, but this one stuck).

The information is used in three ways:

* Keep track of the progress (what we've already done in this branch and what
  we still need to do).

* Prepare release notes for upcoming releases

* Help future maintainers of VyOS (it could be you!) to find out why certain
  things have been changed in the codebase or why certain features have been
  added

To make this approach work, every change must be associated with a task number
(prefixed with **T**) and a component. If there is no bug report/feature request
for the changes you are going to make, you have to create a Phabricator_ task
first. Once there is an entry in Phabricator_, you should reference its id in
your commit message, as shown below:

* ``ddclient: T1030: auto create runtime directories``
* ``Jenkins: add current Git commit ID to build description``

If there is no Phabricator_ reference in the commits of your pull request, we
have to ask you to amend the commit message. Otherwise we will have to reject
it.

Writing good commit messages
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The format should be and is inspired by: https://git-scm.com/book/ch5-2.html
It is also worth reading https://chris.beams.io/posts/git-commit/

* A single, short, summary of the commit (recommended 50 characters or less,
  not exceeding 80 characters) containing a prefix of the changed component
  and the corresponding Phabricator_ reference e.g. ``snmp: T1111:`` or
  ``ethernet: T2222:`` - multiple components could be concatenated as in
  ``snmp: ethernet: T3333``

* In some contexts, the first line is treated as the subject of an email and
  the rest of the text as the body. The blank line separating the summary from
  the body is critical (unless you omit the body entirely); tools like rebase
  can get confused if you run the two together.

* Followed by a message which describes all the details like:

  * What/why/how something has been changed, makes everyone's life easier when
    working with `git bisect`

  * All text of the commit message should be wrapped at 72 characters if
    possible which makes reading commit logs easier with ``git log`` on a
    standard terminal (which happens to be 80x25)

  * If applicable a reference to a previous commit should be made linking
    those commits nicely when browsing the history: ``After commit abcd12ef
    ("snmp: this is a headline") a Python import statement is missing,
    throwing the following exception: ABCDEF``

* Always use the ``-x`` option to the ``git cherry-pick`` command when back or
  forward porting an individual commit. This automatically appends the line:
  ``(cherry picked from commit <ID>)`` to the original authors commit message
  making it easier when bisecting problems.

* Every change set must be consistent (self containing)! Do not fix multiple
  bugs in a single commit. If you already worked on multiple fixes in the same
  file use `git add --patch` to only add the parts related to the one issue
  into your upcoming commit.

Limits:

* We only accept bugfixes in packages other than https://github.com/vyos/vyos-1x
  as no new functionality should use the old style templates (``node.def`` and
  Perl/BASH code. Use the new style XML/Python interface instead.

Please submit your patches using the well-known GitHub pull-request against our
repositories found in the VyOS GitHub organisation at https://github.com/vyos


Determinine source package
--------------------------

Suppose you want to make a change in a file but yet you do not know
which of the VyOS packages ship this file. You can determine the VyOS
package name in question by using Debian's ``dpkg -S`` command of your running
VyOS installation.


Fork Repository and submit Patch
--------------------------------

Forking the repository and submitting a GitHub pull-request is the preferred
way of submitting your changes to VyOS. You can fork any VyOS repository to your
very own GitHub account by just appending ``/fork`` to any repository's URL on
GitHub. To e.g. fork the ``vyos-1x`` repository, open the following URL in your
favourite browser: https://github.com/vyos/vyos-1x/fork

You then can proceed with cloning your fork or add a new remote to your local
repository:

* Clone: ``git clone https://github.com/<user>/vyos-1x.git``

* Fork: ``git remote add myfork https://github.com/<user>/vyos-1x.git``

In order to record you as the author of the fix please identify yourself to Git
by setting up your name and email. This can be done local for this one and only
repository ``git config`` or globally using ``git config --global``.

.. code-block:: none

  git config --global user.name "J. Random Hacker"
  git config --global user.email "jrhacker@example.net"

Make your changes and save them. Do the following for all changes files to
record them in your created Git commit:

* Add file to Git index using ``git add myfile``, or for a whole directory:
  ``git add somedir/*``

* Commit the changes by calling ``git commit``. Please use a meaningful commit
  headline (read above) and don't forget to reference the Phabricator_ ID.

* Submit the patch ``git push`` and create the GitHub pull-request.


Attach patch to Phorge task
--------------------------------

Follow the above steps on how to "Fork repository to submit a Patch". Instead
of uploading "pushing" your changes to GitHub you can export the patches/
commits and send it to maintainers@vyos.net or attach it directly to the bug
(preferred over email)

* Export last commit to patch file: ``git format-patch`` or export the last two
  commits into its appropriate patch files: ``git format-patch -2``


Coding Guidelines
=================

Like any other project we have some small guidelines about our source code, too.
The rules we have are not there to punish you - the rules are in place to help
us all. By having a consistent coding style it becomes very easy for new
and also longtime contributors to navigate through the sources and all the
implied logic of any one source file..


Formatting
----------

* Python: Tabs **shall not** be used. Every indentation level should be 4 spaces
* XML: Tabs **shall not** be used. Every indentation level should be 2 spaces

.. note:: There are extensions to e.g. VIM (xmllint) which will help you to get
   your indention levels correct. Add to following to your .vimrc file:
   ``au FileType xml setlocal equalprg=xmllint\ --format\ --recover\ -\
   2>/dev/null`` now you can call the linter using ``gg=G`` in command mode.


Text generation
^^^^^^^^^^^^^^^

Template processor **should** be used for generating config files. Built-in
string formatting **may** be used for simple line-oriented formats where every
line is self-contained, such as iptables rules. Template processor **must** be
used for structured, multi-line formats such as those used by ISC DHCPd.

The default template processor for VyOS code is Jinja2_.


Configuration Script Structure and Behaviour
--------------------------------------------

Your configuration script or operation mode script which is also written in
Python3 should have a line break on 80 characters. This seems to be a bit odd
nowadays but as some people also work remotely or program using vi(m) this is
a fair good standard which I hope we can rely on.

In addition this also helps when browsing the GitHub codebase on a mobile
device if you happen to be a crazy scientist.

.. code-block:: python

  #!/usr/bin/env python3
  #
  # Copyright (C) 2020 VyOS maintainers and contributors
  #
  # This program is free software; you can redistribute it and/or modify
  # it under the terms of the GNU General Public License version 2 or later as
  # published by the Free Software Foundation.
  #
  # This program is distributed in the hope that it will be useful,
  # but WITHOUT ANY WARRANTY; without even the implied warranty of
  # MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  # GNU General Public License for more details.
  #
  # You should have received a copy of the GNU General Public License
  # along with this program.  If not, see <http://www.gnu.org/licenses/>.

  import sys

  from vyos.config import Config
  from vyos import ConfigError

  def get_config(config=None):
      if config:
          conf = config
      else:
          conf = Config()

      # Base path to CLI nodes
      base = ['...', '...']
      # Convert the VyOS config to an abstract internal representation
      config_data = conf.get_config_dict(base, key_mangling=('-', '_'), get_first_key=True)
      return config_data

  def verify(config):
      # Verify that configuration is valid
      if invalid:
          raise ConfigError("Descriptive message")

  def generate(config):
      # Generate daemon configs
      pass

  def apply(config):
      # Apply the generated configs to the live system
      pass

  try:
      c = get_config()
      verify(c)
      generate(c)
      apply(c)
  except ConfigError as e:
      print(e)
      sys.exit(1)

The ``get_config()`` function must convert the VyOS config to an abstract,
internal representation. No other function is allowed to call the ``vyos.config.
Config`` object method directly. The rationale for it is that when config reads
are mixed with other logic, it's very hard to change the config syntax since
you need to weed out every occurrence of the old syntax. If syntax-specific
code is confined to a single function, the rest of the code can be left
untouched as long as the internal representation remains compatible.

Another advantage is testability of the code. Mocking the entire config
subsystem is hard, while constructing an internal representation by hand is
way simpler.

The ``verify()`` function takes your internal representation of the config and
checks if it's valid, otherwise it must raise ``ConfigError`` with an error
message that describes the problem and possibly suggests how to fix it. It must
not make any changes to the system. The rationale for it is again testability
and, in the future when the config backend is ready and every script is
rewritten in this fashion, ability to execute commit dry run ("commit test"
like in JunOS) and abort commit before making any changes to the system if an
error is found in any component.

The ``generate()`` function generates config files for system components.

The ``apply()`` function applies the generated configuration to the live
system. It should use non-disruptive reload whenever possible. It may execute
disruptive operations such as daemon process restart if a particular component
does not support non-disruptive reload, or when the expected service degradation
is minimal (for example, in case of auxiliary services such as LLDPd). In case
of high impact services such as VPN daemon and routing protocols, when non-
disruptive reload is supported for some but not all types of configuration
changes, scripts authors should make effort to determine if a configuration
change can be done in a non-disruptive way and only resort to disruptive restart
if it cannot be avoided.

Unless absolutely necessary, configuration scripts should not modify the active
configuration of system components directly. Whenever at all possible, scripts
should generate a configuration file or files that can be applied with a single
command such as reloading a service through systemd init. Inserting statements
one by one is particularly discouraged, for example, when configuring netfilter
rules, saving them to a file and loading it with iptables-restore should always
be preferred to executing iptables directly.

The ``apply()`` and ``generate()`` functions may ``raise ConfigError`` if, for
example, the daemon failed to start with the updated config. It shouldn't be a
substitute for proper config checking in the ``verify()`` function. All
reasonable effort should be made to verify that generated configuration is
valid and will be accepted by the daemon, including, when necessary, cross-
checks with other VyOS configuration subtrees.

Exceptions, including ``VyOSError`` (which is raised by ``vyos.config.Config``
on improper config operations, such as trying to use ``list_nodes()`` on a
non-tag node) should not be silenced or caught and re-raised as config error.
Sure this will not look pretty on user's screen, but it will make way better
bug reports, and help users (and most VyOS users are IT professionals) do their
own debugging as well.

For easy orientation we suggest you take a look on the ``ntp.py`` or
``interfaces-bonding.py`` (for tag nodes) implementation. Both files can be
found in the vyos-1x_ repository.

Other considerations: vyos-configd
----------------------------------

All scripts now run under the config daemon and must conform to the
following:

1. The signature and initial four lines of ``get_config(...)`` `must` be as
   above.

2. Each of ``get_config``, ``verify``, ``apply``, ``generate`` `must`
   appear, with signatures as above, even if they are a no-op.

3. Instantiations of ``Config`` other than that in ``get_config`` `must not`
   appear.

4. The legacy function ``my_set`` `must not` appear: modifications of the
   active config `should not` appear in new code (if absolutely necessary,
   alternative mechanisms may be used).

XML (used for CLI definitions)
==============================

The bash (or better vbash) completion in VyOS is defined in *templates*.
Templates are text files (called ``node.def``) stored in a directory tree. The
directory names define the command names, and template files define the command
behaviour. Before VyOS 1.2 (crux) this files were created by hand. After a
complex redesign process_ the new style template are automatically generated
from a XML input file.

XML interface definitions for VyOS come with a RelaxNG schema and are located
in the vyos-1x_ module. This schema is a slightly modified schema from VyConf_
alias VyOS 2.0 So VyOS 1.2.x interface definitions will be reusable in Nextgen
VyOS Versions with very minimal changes.

The great thing about schemas is not only that people can know the complete
grammar for certain, but also that it can be automatically verified. The
`scripts/build-command-templates` script that converts the XML definitions to
old style templates also verifies them against the schema, so a bad definition
will cause the package build to fail. I do agree that the format is verbose, but
there is no other format now that would allow this. Besides, a specialized XML
editor can alleviate the issue with verbosity.

Example:

.. code-block:: xml

  <?xml version="1.0"?>
  <!-- Cron configuration -->
  <interfaceDefinition>
    <node name="system">
      <children>
        <node name="task-scheduler">
          <properties>
            <help>Task scheduler settings</help>
          </properties>
          <children>
            <tagNode name="task" owner="${vyos_conf_scripts_dir}/task_scheduler.py">
              <properties>
                <help>Scheduled task</help>
                <valueHelp>
                  <format>&lt;string&gt;</format>
                  <description>Task name</description>
                </valueHelp>
                <priority>999</priority>
              </properties>
              <children>
                <leafNode name="crontab-spec">
                  <properties>
                    <help>UNIX crontab time specification string</help>
                  </properties>
                </leafNode>
                <leafNode name="interval">
                  <properties>
                    <help>Execution interval</help>
                    <valueHelp>
                      <format>&lt;minutes&gt;</format>
                      <description>Execution interval in minutes</description>
                    </valueHelp>
                    <valueHelp>
                      <format>&lt;minutes&gt;m</format>
                      <description>Execution interval in minutes</description>
                    </valueHelp>
                    <valueHelp>
                      <format>&lt;hours&gt;h</format>
                      <description>Execution interval in hours</description>
                    </valueHelp>
                    <valueHelp>
                      <format>&lt;days&gt;d</format>
                      <description>Execution interval in days</description>
                    </valueHelp>
                    <constraint>
                      <regex>[1-9]([0-9]*)([mhd]{0,1})</regex>
                    </constraint>
                  </properties>
                </leafNode>
                <node name="executable">
                  <properties>
                    <help>Executable path and arguments</help>
                  </properties>
                  <children>
                    <leafNode name="path">
                      <properties>
                        <help>Path to executable</help>
                      </properties>
                    </leafNode>
                    <leafNode name="arguments">
                      <properties>
                        <help>Arguments passed to the executable</help>
                      </properties>
                    </leafNode>
                  </children>
                </node>
              </children>
            </tagNode>
          </children>
        </node>
      </children>
    </node>
  </interfaceDefinition>

Command definitions are purely declarative, and cannot contain any logic. All
logic for generating config files for target applications, restarting services
and so on is implemented in configuration scripts instead.

GNU Preprocessor
----------------

XML interface definition files use the `xml.in` file extension which was
implemented in :vytask:`T1843`. XML interface definitions tend to have a lot of
duplicated code in areas such as:

* VIF (incl. VIF-S/VIF-C)
* Address
* Description
* Enabled/Disabled

Instead of supplying all those XML nodes multiple times there are now include
files with predefined features. Brief overview:

* `IPv4, IPv6 and DHCP(v6)`_ address assignment
* `IPv4, IPv6`_ address assignment
* `VLAN (VIF)`_ definition
* `MAC address`_ assignment

All interface definition XML input files (.in suffix) will be sent to the GCC
preprocess and the output is stored in the `build/interface-definitions`
folder. The previously mentioned `scripts/build-command-templates` script
operates on the `build/interface-definitions` folder to generate all required
CLI nodes.

.. code-block:: none

  $ make interface_definitions
  install -d -m 0755 build/interface-definitions
  install -d -m 0755 build/op-mode-definitions
  Generating build/interface-definitions/intel_qat.xml from interface-definitions/intel_qat.xml.in
  Generating build/interface-definitions/interfaces-bonding.xml from interface-definitions/interfaces-bonding.xml.in
  Generating build/interface-definitions/cron.xml from interface-definitions/cron.xml.in
  Generating build/interface-definitions/pppoe-server.xml from interface-definitions/pppoe-server.xml.in
  Generating build/interface-definitions/mdns-repeater.xml from interface-definitions/mdns-repeater.xml.in
  Generating build/interface-definitions/tftp-server.xml from interface-definitions/tftp-server.xml.in
  [...]


Guidelines
----------

Use of numbers
^^^^^^^^^^^^^^^

Use of numbers in command names **should** be avoided unless a number is a
part of a protocol name or similar. Thus, ``protocols ospfv3`` is perfectly
fine, but something like ``server-1`` is questionable at best.

Help String
^^^^^^^^^^^

To ensure uniform look and feel, and improve readability, we should follow a
set of guidelines consistently.

Capitalization and punctuation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The first word of every help string **must** be capitalized. There **must not**
be a period at the end of help strings.

Rationale: this seems to be the unwritten standard in network device CLIs, and
a good aesthetic compromise.

Examples:

* Good: "Frobnication algorithm"
* Bad: "frobnication algorithm"
* Bad: "Frobnication algorithm."
* Horrible: "frobnication algorithm."

Use of abbreviations and acronyms
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Abbreviations and acronyms **must** be capitalized.

Examples:

* Good: "TCP connection timeout"
* Bad: "tcp connection timeout"
* Horrible: "Tcp connection timeout"

Acronyms also **must** be capitalized to visually distinguish them from normal
words:

Examples:

* Good: RADIUS (as in remote authentication for dial-in user services)
* Bad: radius (unless it's about the distance between a center of a circle and
  any of its points)

Some abbreviations are traditionally written in mixed case. Generally, if it
contains words "over" or "version", the letter **should** be lowercase. If
there's an accepted spelling (especially if defined by an RFC or another
standard), it **must** be followed.

Examples:

* Good: PPPoE, IPsec
* Bad: PPPOE, IPSEC
* Bad: pppoe, ipsec

Use of verbs
~~~~~~~~~~~~

Verbs **should** be avoided. If a verb can be omitted, omit it.

Examples:

* Good: "TCP connection timeout"
* Bad: "Set TCP connection timeout"

If a verb is essential, keep it. For example, in the help text of ``set system
ipv6 disable-forwarding``, "Disable IPv6 forwarding on all interfaces" is a
perfectly justified wording.

Prefer infinitives
~~~~~~~~~~~~~~~~~~

Verbs, when they are necessary, **should** be in their infinitive form.

Examples:

* Good: "Disable IPv6 forwarding"
* Bad: "Disables IPv6 forwarding"


C++ Backend Code
================

The CLI parser used in VyOS is a mix of bash, bash-completion helper and the
C++ backend library [vyatta-cfg](https://github.com/vyos/vyatta-cfg). This
section is a reference of common CLI commands and the respective entry point
in the C/C++ code.

* ``set``

  - https://github.com/vyos/vyatta-cfg/blob/0f42786a0b3/src/cstore/cstore.cpp#L352
  - https://github.com/vyos/vyatta-cfg/blob/0f42786a0b3/src/cstore/cstore.cpp#L2549


* ``commit``

  - https://github.com/vyos/vyatta-cfg/blob/0f42786a0b3/src/commit/commit-algorithm.cpp#L1252

.. include:: /_include/common-references.txt

.. start_vyoslinter
