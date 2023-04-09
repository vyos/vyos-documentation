.. _index:

###############
 VyOS 用户手册
###############

.. panels::
   :container: container-lg pb-3
   :column: col-lg-4 col-md-4 col-sm-6 col-xs-12 p-2
   
    获取 / 创建 VyOS
   ^^^^^^^^^^^^^^^^
   快速 :ref:`构建<contributing/build-vyos:build vyos>` 您自己的映像或查看如何 :ref:`下载<installation/install:download>` 免费或受支持的版本。
   ---

    安装  VyOS
   ^^^^^^^^^^^^
   阅读有关如何在 :ref:`裸机<installation/install:installation>` 中 或 
   :ref:`虚拟环境<installation/virtual/index:running vyos in virtual environments>` 或 
   :ref:`云<installation/cloud/index:running VyOS in Cloud Environments>` 中安装使用提供商的 VyOS 映像
   ---

    配置与操作
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^
   使用 :ref:`快速入门指南<quick-start:Quick Start>` , 快速部署。 或者通过‘示例’深入了解 
   :ref:`路由协议<configuration/protocols/index:protocols>` , 
   :ref:`VRFs<configuration/vrf/index:vrf>` , 或 
   :ref:`VPNs<configuration/vpn/index:vpn>` 的高级设置与使用。
   ---

    自动化
   ^^^^^^^^
   使用 :ref:`Ansible<vyos-ansible>` , 将 VyOS 集成到您的自动化工作流中，
   拥有您自己的 :ref:`本地脚本<command-scripting>` , 或使用 :ref:`HTTPS-API<vyosapi>` 配置 VyOS。
   ---

    示例
   ^^^^^^^^
   从 :ref:`配置蓝图<configexamples/index:Configuration Blueprints>` 中获得一些灵感来构建您的基础架构。
   ---

    社区与贡献
   ^^^^^^^^^^^^^^^^^^^^^^^^
   | There are many ways to contribute to the project.
   | Add missing parts or improve the :ref:`Documentation<documentation:Write Documentation>`.
   | Discuss in `Slack <https://slack.vyos.io/>`_ or the `Forum <https://forum.vyos.io>`_.
   | Or you can pick up a `Task <https://vyos.dev/>`_ and fix the :ref:`code<contributing/development:development>`.


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
