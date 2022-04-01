.. _index:

###############
VyOS User Guide
###############

.. panels::
   :container: container-lg pb-3
   :column: col-lg-4 col-md-4 col-sm-6 col-xs-12 p-2
   
   Get / Build VyOS
   ^^^^^^^^^^^^^^^^
   Quickly :ref:`Build<contributing/build-vyos:build vyos>` your own Image or take a look at how to :ref:`download<installation/install:download>` a free or supported version.
   ---

   Install VyOS
   ^^^^^^^^^^^^
   Read about how to install VyOS on :ref:`Bare Metall<installation/install:installation>` or in a
   :ref:`Virtual Environment<installation/virtual/index:running vyos in virtual environments>` and
   how to use an image with the usual :ref:`cloud<installation/cloud/index:running VyOS in Cloud Environments>` providers 
   ---

   Configuration and Operation
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^
   Use the :ref:`Quickstart Guide<quick-start:Quick Start>`, to have a fast overview. Or go deeper and
   set up :ref:`advanced routing<configuration/protocols/index:protocols>`,
   :ref:`VRFs<configuration/vrf/index:vrf>`, or
   :ref:`VPNs<configuration/vpn/index:vpn>` for example.
   ---

   Automate
   ^^^^^^^^
   Integrate VyOS in your automation Workflow with 
   :ref:`Ansible<vyos-ansible>`,
   have your own :ref:`local scripts<command-scripting>`, or configure VyOS with the :ref:`HTTPS-API<vyosapi>`.
   ---

   Examples
   ^^^^^^^^
   Get some inspiration from the :ref:`Configuration Blueprints<configexamples/index:Configuration Blueprints>`
   to build your infrastructure.
   ---

   Contribute and Community
   ^^^^^^^^^^^^^^^^^^^^^^^^
   | There are many ways to contribute to the project.
   | Add missing parts or improve the :ref:`Documentation<documentation:Write Documentation>`.
   | Discuss in `Slack <https://slack.vyos.io/>`_ or the `Forum <https://forum.vyos.io>`_.
   | Or you can pick up a `Task <https://phabricator.vyos.net/>`_ and fix the :ref:`code<contributing/development:development>`.


.. toctree::
   :hidden:
   :maxdepth: 1

   introducing/about
   introducing/history
   changelog/index


.. toctree::
   :maxdepth: 2
   :hidden:
   :caption: First Steps

   installation/index
   quick-start
   cli

.. toctree::
   :maxdepth: 2
   :hidden:
   :caption: Adminguide


   configuration/index
   operation/index
   automation/index
   troubleshooting/index
   configexamples/index


.. toctree::
   :maxdepth: 2
   :hidden:
   :caption: Development

   contributing/build-vyos
   contributing/development
   contributing/issues-features
   contributing/upstream-packages
   contributing/debugging
   contributing/testing


.. toctree::
   :maxdepth: 2
   :hidden:
   :caption: Misc

   documentation
   coverage
   copyright
