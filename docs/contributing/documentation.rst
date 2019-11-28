.. _documentation:

Documentation
=============

As most software projects we also have a lack in documentation. We encourage
every VyOS user to help us improve our documentation. This will not only be
benefical four you (when reading something up) but also for the whole world.

If you are willing to contribute to our documentation this is the definate
guid how to do so.

.. note:: In contrast to submitting code patches there is no requirement that
   you open up a Phabricator_ task prior to submitting a Pull-Request to the
   documentation.

Git Workflow
------------


Updates to our documentation should be delivered by a GitHub pull-request. In
order to create a pull-request you need to fork our documentation code first.
This requires you already have a GitHub account.

* Fork the project on GitHub https://github.com/vyos/vyos-documentation/fork

* Clone fork to local machine

* Change to your new local directory ``vyos-documentation``

* Create new branch for your work, use a descriptive name of your work:
  ``$ git checkout -b fix-vxlan-typo``

* Make all your changes - please keep out commit rules in mind
  (:ref:`prepare_commit`). This mainly applies to a proper commit message
  describing your change. Please check the documentation if you aren't familiar
  with Sphinx-doc_ or reStructuredText_.


* Check your changes by locally building the documentation ``$ make html``
  Sphinx will build the html files in the ``docs/_build`` folder

* Add modified files to Git index ``$ git add path/to/filname`` or add all
  unstaged files ``$ git add .``

* Commit your changes ``$ git commit -m "vxlan: rework CLI syntax"``

* Push your commits to your GitHub project: ``$ git push -u origin
  fix-vxlan-typo``

* Submit pull-request. In GitHub visit the main repository and you should
  see a banner suggesting to make a pull request. Fill out the form and
  describe what you do.

* Once pull resquests have been approved, you may want to locally update
  your forked repository too. First you'll have to add the remote upstream
  repository. ``$ git remote add upstream
  https://github.com/vyos/vyos-documentation.git``

  Check your configured remote repositories:

  .. code-block:: none

    $ git remote -v
    origin    https://github.com/YOUR_USERNAME/vyos-documentation.git (fetch)
    origin    https://github.com/YOUR_USERNAME/vyos.documentation.git (push)
    upstream  https://github.com/vyos/vyos-documentation.git (fetch)
    upstream  https://github.com/vyos/vyos-documentation.git (push)

  Your remote repo on Github is called Origin, while the original repo you
  have forked is called Upstream. Now you can locally update your forked repo.

  .. code-block:: none

    $ git fetch upstream
    $ git checkout master
    $ git merge upstream/master

  If you want to update your fork on GitHub, too use the following:
  ``$ git push origin master``


Style Guide
-----------

Sections
^^^^^^^^

We use the following syntax for Headlines.

.. code-block:: none

  #####
  Parts
  #####

  ********
  Chapters
  ********

  Sections
  ========

  Subsections
  -----------

  Subsubsections
  ^^^^^^^^^^^^^^

  Paragraphs
  """"""""""

Address space
^^^^^^^^^^^^^

Note the following RFCs (:rfc:`5737`, :rfc:`3849`, :rfc:`5389` and
:rfc:`7042`), which describe the reserved public IP addresses and autonomous
system numbers for the documentation:

  * ``192.0.2.0/24``
  * ``198.51.100.0/24``
  * ``203.0.113.0/24``
  * ``2001:db8::/32``
  * 16bit ASN: ``64496 - 64511``
  * 32bit ASN: ``65536 - 65551``
  * Unicast MAC Addresses: ``00-53-00`` to ``00-53-FF``
  * Multicast MAC-Addresses: ``90-10-00`` to ``90-10-FF``

Please don't use other public address space.


Specific Sphinx-doc Markup
^^^^^^^^^^^^^^^^^^^^^^^^^^

When documenting CLI commands use the ``.. cfgcmd::`` directive for
the configuration mode and the ``.. opcmd::`` directive for operational mode
commands.
Under the command a short exlaination should be provide.

Example:

.. code-block:: none

  .. opcmd:: show protocols static arp

  Display all known ARP table entries spanning accross all interfaces

.. _Sphinx-doc: https://www.sphinx-doc.org
.. _reStructuredText: http://www.sphinx-doc.org/en/master/usage/restructuredtext/index.html
.. _Phabricator: https://phabricator.vyos.net
