.. _config-management:

Config Management
-----------------


The following changes the number of commit revisions. In the default settings, 20 revisions are stored locally.

.. code-block:: console

  set system config-management commit-revisions 50


| If you want to save all config changes to a remote destination. Set the commit-archive location. Every time a commit is successfully the config.boot file will be copied to the defined destinations.


.. code-block:: console

  set system config-management commit-archive location 'tftp://10.0.0.2'

.. note:: the number of revisions don't effect the commit-archive:

A commit look now like this:

.. code-block:: console

    vyos@vyos-R1# commit
    Archiving config...
    tftp://10.0.0.2  OK
    [edit]
    vyos@vyos-R1# 

The filename has this format: config.boot-hostname.YYYYMMDD_HHMMSS