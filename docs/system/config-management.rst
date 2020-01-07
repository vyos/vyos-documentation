.. _config-management:

########################
Configuration Management
########################

VyOS comes with an integrated versioning system for the system configuration.
The configurations are versioned locally for rollback but they can also be
stored on a remote host for archiving/backup reasons.

.. cfgcmd:: set system config-management commit-revisions <number>

   Change the number of commit revisions to `<number>`, the default setting for
   this value is to store 20 revisions locally.

.. cfgcmd:: set system config-management commit-archive location <url>

   If you want to save all config changes to a remote destination. Set the
   commit-archive location. Every time a commit is successfully the
   ``config.boot`` file will be copied to the defined destination(s). The
   filename used on the remote host used will be:
   ``config.boot-hostname.YYYYMMDD_HHMMSS``

   Destinations will be configured as any of the below :abbr:`URI (Uniform
   Resource Identifier)`

   * ``scp://<user>:<passwd>@<host>/<dir>``
   * ``sftp://<user>:<passwd>@<host>/<dir>``
   * ``ftp://<user>:<passwd>@<host>/<dir>``
   * ``tftp://<host>/<dir>``

.. note:: The number of revisions don't effect the commit-archive.