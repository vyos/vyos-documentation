.. _vyos_cli:

VyOS CLI
========

The bash completion in VyOS is defined in *templates*. Templates are text files
stored in a directory tree, where directory names define command names, and
template files define command behaviour. Before VyOS 1.2.x this files were created
by hand. After a complex redesign process_ the new style template are in XML.

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

Command definitions are purely declarative, and cannot contain any logic. All
logic for generating config files for target applications, restarting services
and so on is implemented in configuration scripts instead.

Command syntax guidelines
*************************

Use of numbers
^^^^^^^^^^^^^^

Use of numbers in command names **should** be avoided unless a number is a part
of a protocol name or similar. Thus, ``protocols ospfv3`` is perfectly fine, but
something like ``server-1`` is questionable at best.

Help string guidelines
**********************

To ensure uniform look and feel, and improve readability, we should follow a set
of guidelines consistently.

Capitalization and punctuation
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

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
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Abbreviations and acronyms **must** be capitalized.

Examples:

 * Good: "TCP connection timeout"
 * Bad: "tcp connection timeout"
 * Horrible: "Tcp connectin timeout"

Acronyms also **must** be capitalized to visually distinguish them from normal
words:

Examples:

 * Good: RADIUS (as in remote authentication for dial-in user services)
 * Bad: radius (unless it's about the distance between a center of a circle and
   any of its points)

Some abbreviations are traditionally written in mixed case. Generally, if it
contains words "over" or "version", the letter **should** be lowercase. If there's
an accepted spelling (especially if defined by an RFC or another standard), it
**must** be followed.

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

If a verb is essential, keep it. For example, in the help text of `set system ipv6
disable-forwarding`, "Disable IPv6 forwarding on all interfaces" is a perfectly
justified wording.

Prefer infinitives
^^^^^^^^^^^^^^^^^^

Verbs, when they are necessary, **should** be in their infinitive form.

Examples:

 * Good: "Disable IPv6 forwarding"
 * Bad: "Disables IPv6 forwarding"

Mapping old node.def style to new XML definitions
-------------------------------------------------

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
     - <properties> <valueHelp> <format> format </format> <description> some
       string </description>
     - Do not add angle brackets around the format, they will be inserted
       automatically
   * - syntax:expression: pattern
     - <properties> <constraint> <regex> ...
     - <constraintErrorMessage> will be displayed on failure
   * - syntax:expression: $VAR(@) in "foo", "bar", "baz"
     - None
     - Use regex
   * - syntax:expression: exec ...
     - <properties> <constraint> <validator> <name ="foo" argument="bar">
     - "${vyos_libexecdir}/validators/foo bar $VAR(@)" will be executed,
       <constraintErrorMessage> will be displayed on failure
   * - syntax:expression: (arithmetic expression)
     - None
     - External arithmetic validator may be added if there's demand, complex
       validation is better left to commit-time scripts
   * - priority: 999
     - <properties> <priority>999</priority>
     - Please leave a comment explaining why the priority was chosen (e.g. "after
       interfaces are configured")
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

.. _process: https://blog.vyos.io/vyos-development-digest-10
.. _vyos-1x: https://github.com/vyos/vyos-1x/blob/current/schema/
.. _VyConf: https://github.com/vyos/vyconf/blob/master/data/schemata

