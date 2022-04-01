.. _index:

###############
VyOS User Guide
###############

.. panels::
   :container: container-lg pb-3
   :column: col-lg-4 col-md-4 col-sm-6 col-xs-12 p-2
   
   Get / Build VyOS
   ^^^^^^^^^^^^^^^^
   Quickly :ref:`Build<build>` your own Image or take a look at how to :ref:`download<download>` a free or supported version.
   ---

   Install VyOS
   ^^^^^^^^^^^^
   Read about how to install VyOS on :ref:`Bare Metall<installation>` or in a
   :ref:`Virtual Environment<virtual_env>` and
   how to use an image with the usual :ref:`cloud<cloud_env>` providers 
   ---

   Configuration and Operation
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^
   Use the :ref:`Quickstart Guide<quick-start>`, to have a fast overview. Or go deeper and
   set up :ref:`advanced routing<protocols>`,
   :ref:`VRFs<vrf>`, or
   :ref:`VPNs<vpn>` for example.
   ---

   Automate
   ^^^^^^^^
   Integrate VyOS in your automation Workflow with 
   :ref:`Ansible<vyos-ansible>`,
   have your own :ref:`local scripts<command-scripting>`, or configure VyOS with the :ref:`HTTPS-API<vyosapi>`.
   ---

   Examples
   ^^^^^^^^
   Get some inspiration from the :ref:`Configuration Blueprints<examples>`
   to build your infrastructure.
   ---

   Contribute and Community
   ^^^^^^^^^^^^^^^^^^^^^^^^
   | There are many ways to contribute to the project.
   | Add missing parts or improve the :ref:`Documentation<documentation>`.
   | Discuss in `Slack <https://slack.vyos.io/>`_ or the `Forum <https://forum.vyos.io>`_.
   | Or you can pick up a `Task <https://phabricator.vyos.net/>`_ and fix the :ref:`code<development>`.


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

   contributing/index
   debugging
   testing
   documentation
   coverage
   copyright
