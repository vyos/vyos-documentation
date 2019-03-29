.. _contributing_index:


Bug Reports and Feature Requests
================================

For Bug Reports and Feature Requests please take a look at Phabricator here:

https://phabricator.vyos.net


Bug Report
----------

| To create a Bugreport use the quick link in the left side under the specific project.
| Please think about the next points:

 * provide as much information as you can
 * which version you use
 * what is to do to reproduce the bug


Feature Request
---------------

To send a Feature Request please search in Phabricator if there is already a Feature Request. You can enhance it or if you don't find one create a new one by use the quick link in the left side under the specific project.


Develoment
==========

The source code is hosted on github under VyOS organization: `github.com/vyos`_

The code is split into git submodules. Submodules is a mechanism for keeping subprojects in separate git repos while being able to access them from the main project.

VyOS is composed of multiple individual packages, some of them are periodically synced with upstream, so keeping the whole source under a single repository would be very inconvenient and slow. There is now an ongoing effort to consolidate all VyOS-specific packages into vyos-1x package, but the basic structure is going to stay the same, just with fewer submodules.

The repository that contains the ISO build scripts and links to all submodules is vyos-build_. The README will guide you to use the this toplevel repository.


VyOS CLI
========

The bash completion in VyOS is defined in *templates*. Templates are text files stored in a directory tree, where directory names define command names, and template files define command behaviour.
Befor VyOS 1.2.x this files were created by hand. After a complex redesing process_ the new style template are in XML.

| XML interface definitions for VyOS come with a RelaxNG schema and are located here vyos-1x_
| This schema is a slightly modified schema from VyConf_ alias VyOS 2.0
| So VyOS 1.2.x interface definitions will be reusable in Nextgen VyOS Versions with very minimal changes.

The great thing about schemas is not only that people can know the complete grammar for certain, but also that it can be automatically verified.
The scripts/build-command-templates script that converts the XML definitions to old style templates also verifies them against the schema, so a bad definition will cause the package build to fail.
I do agree that the format is verbose, but there is no other format now that would allow this. Besides, a specialized XML editor can alleviate the issue with verbosity. 

Example XML File
----------------


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

Configuration mode command definitions
--------------------------------------

Command definitions are purely declarative, and cannot contain any logic. All logic for generating config files for target applications, restarting services and so on is implemented in configuration scripts instead.

Command syntax guidelines
*************************

Use of numbers
^^^^^^^^^^^^^^

Use of numbers in command names **should** be avoided unless a number is a part of a protocol name or similar. Thus, "protocols ospfv3" is perfectly fine, but something like "server-1" is questionable at best.


Help string guidelines
**********************

To ensure uniform look and feel, and improve readability, we should follow a set of guidelines consistently.

Capitalization and punctuation
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The first word of every help string **must** be capitalized. There **must not** be a period at the end of help strings. Rationale: this seems to be the unwritten standard in network device CLIs, and a good aesthetic compromise.

Examples:

 * Good: "Frobnication algorithm"
 * Bad: "frobnication algorithm"
 * Bad: "Frobnication algorithm."
 * Horrible: "frobnication algorithm."

Use of abbreviations and acronyms
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Abbreviations and acronyms **must** be capitalized.

Examples:

 * Good: "TCP connection timeout"
 * Bad: "tcp connection timeout"
 * Horrible: "Tcp connectin timeout"
 
Acronyms also **must** be capitalized to visually distinguish them from normal words:

Examples:

 * Good: RADIUS (as in remote authentication for dial-in user services)
 * Bad: radius (unless it's about the distance between a center of a circle and any of its points)

Some abbreviations are traditionally written in mixed case. Generally, if it contains words "over" or "version", the letter **should** be lowercase. If there's an accepted spelling (especially if defined by an RFC or another standard), it **must** be followed.

Examples:

 * Good: PPPoE, IPsec
 * Bad: PPPOE, IPSEC
 * Bad: pppoe, ipsec

Use of verbs
^^^^^^^^^^^^

Verbs **should** be avoided. If a verb can be omitted, omit it.

Examples:

 * Good: "TCP connection timeout"
 * Bad: "Set TCP connection timeout"

If a verb is essential, keep it. For example, in the help text of "set system ipv6 disable-forwarding", "Disable IPv6 forwarding on all interfaces" is a perfectly justified wording.

Prefer infinitives
^^^^^^^^^^^^^^^^^^

Verbs, when they are necessary, **should** be in their infinitive form.

Examples:

 * Good: "Disable IPv6 forwarding"
 * Bad: "Disables IPv6 forwarding"


Mapping from the old node.def style to the new XML definitions
--------------------------------------------------------------


.. list-table::
   :widths: 25 25 50
   :header-rows: 1

   * - Old concept/syntax
     - New syntax
     - Notes
   * - mynode/node.def
     - <node name="mynode"> </node>
     - Leaf nodes (nodes with values) use <leafNode> tag instead
   * - mynode/node.tag , tag:
     - <tagNode name="mynode> </node>
     - 
   * - help: My node
     - <properties> <help>My node</help>
     -
   * - val_help: <format>; some string
     - <properties> <valueHelp> <format> format </format> <description> some string </description>
     - Do not add angle brackets around the format, they will be inserted automatically
   * - syntax:expression: pattern
     - <properties> <constraint> <regex> ... 
     - <constraintErrorMessage> will be displayed on failure
   * - syntax:expression: $VAR(@) in "foo", "bar", "baz"
     - None
     - Use regex
   * - syntax:expression: exec ...
     - <properties> <constraint> <validator> <name ="foo" argument="bar"> 
     - "${vyos_libexecdir}/validators/foo bar $VAR(@)" will be executed, <constraintErrorMessage> will be displayed on failure
   * - syntax:expression: (arithmetic expression)
     - None
     - External arithmetic validator may be added if there's demand, complex validation is better left to commit-time scripts
   * - priority: 999
     - <properties> <priority>999</priority>
     - Please leave a comment explaining why the priority was chosen (e.g. "after interfaces are configured")
   * - multi:
     - <properties> <multi/>
     - Only applicable to leaf nodes
   * - allowed: echo foo bar
     - <properties> <completionHelp> <list> foo bar </list>
     -
   * - allowed: cli-shell-api listNodes vpn ipsec esp-group
     - <properties> <completionHelp> <path> vpn ipsec esp-group </path> ...
     -
   * - allowed: /path/to/script
     - <properties> <completionHelp> <script> /path/to/script </script> ...
     -
   * - default:
     - None
     - Move default values to scripts
   * - commit:expression:
     - None
     - All commit time checks should be in the verify() function of the script
   * - begin:/create:/delete:
     - None
     - All logic should be in the scripts

Python coding guidelines
========================

The switch to the Python programming language for new code is not merely a change of the language, but a chance to rethink and improve the programming approach.

Let's face it: VyOS is full of spaghetti code where logic for reading the VyOS config, generating daemon configs, and restarting processes is all mixed up.
Python (or any other language, for that matter) does not provide automatic protection from bad design, so we need to also devise design guidelines and follow them to keep the system extensible and maintainable.

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

The **get_config()** function must convert the VyOS config to an abstract internal representation. No other function is allowed to call vyos.config.Config object methods directly. The rationale for it is that when config reads are mixed with other logic, it's very hard to change the config syntax since you need to weed out every occurence of the old syntax. If syntax-specific code is confined to a single function, the rest of the code can be left untouched as long as the internal representation remains compatible.

Another advantage is testability of the code. Mocking the entire config subsystem is hard, while constructing an internal representation by hand is way simpler.

The **verify()** function takes an internal representation of the config and checks if it's valid, otherwise it must raise VyOSError with an error message that describes the problem and possibly suggests how to fix it. It must not make any changes to the system. The rationale for it is again testability and, in the future when the config backend is ready and every script is rewritten in this fashion, ability to execute commit dry run ("commit test" like in JunOS) and abort commit before making any changes to the system if an error is found in any component.

The **generate()** function generates config files for system components.

The **apply()** function applies the generated configuration to the live system. It should use non-disruptive reload whenever possible. It may execute disruptive operations such as daemon process restart if a particular component does not support non-disruptive reload, or when the expected service degradation is minimal (for example, in case of auxillary services such as LLDPd). In case of high impact services such as VPN daemon and routing protocols, when non-disruptive reload is supported for some but not all types of configuration changes, scripts authors should make effort to determine if a configuration change can be done in a non-disruptive way and only resort to disruptive restart if it cannot be avoided.

Unless absolutely necessary, configuration scripts should not modify the active configuration of system components directly. Whenever at all possible, scripts should generate a configuration file or files that can be applied with a single command such as reloading a service through systemd/SysV init. Inserting statements one by one is particularly discouraged, for example, when configuring netfilter rules, saving them to a file and loading it with iptables-restore should always be preferred to executing iptables directly.

The **apply()** and **generate()** functions may raise ConfigError if, for example, the daemon failed to start with the updated config. It shouldn't be a substitute for proper config checking in the **verify()** function. All reasonable effort should be made to verify that generated configuration is valid and will be accepted by the daemon, including, when necessary, cross-checks with other VyOS configuration subtrees.

Exceptions, including VyOSError (which is raised by vyos.config.Config on improper config operations, such as trying to use **list_nodes()** on a non-tag node) should not be silenced or caught and re-raised as config error. Sure this will not look pretty on user's screen, but it will make way better bug reports, and help users (and most VyOS users are IT professionals) do their own debugging as well.

Coding guidelines
-----------------

Language
********

| Python 3 **shall** be used. How long can we keep Python 2 alive anyway?
| No considerations for Python 2 compatibility **should** be taken.

Formatting
**********

Tabs **shall not** be used. Every indentation level should be 4 spaces.

Text generation
***************

| Template processor **should** be used for generating config files. Built-in string formatting **may** be used for simple line-oriented formats where every line is self-contained, such as iptables rules. Template processor **must** be used for structured, multi-line formats such as those used by ISC DHCPd.
| The default template processor for VyOS code is jinja2.

Code policy
-----------

When modifying the source code, remember these rules of the legacy elimination campaign:

 * No new features in Perl
 * No old style command definitions
 * No code incompatible with Python3


.. _github.com/vyos: https://github.com/vyos
.. _vyos-build: https://github.com/vyos/vyos-build
.. _process: https://blog.vyos.io/vyos-development-digest-10
.. _vyos-1x: https://github.com/vyos/vyos-1x/blob/current/schema/
.. _VyConf: https://github.com/vyos/vyconf/blob/master/data/schemata