.. _development:

Development
===========

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


Submit a patch
--------------

Patches are always more then welcome. To have a clean and easy to maintain
repository we have some guidelines when working with Git. A clean repository
eases the automatic generation of a changelog file.

A good approach for writing commit messages is actually to have a look at the
file(s) history by invoking ``git log path/to/file.txt``.


Preparding patch/commit
^^^^^^^^^^^^^^^^^^^^^^^

In a big system, such as VyOS, that is comprised of multiple components, it's
impossible to keep track of all the changes and bugs/feature requests in one's
head. We use a bugtracker known as Phabricator_ for it ("issue tracker" would
be a better term, but this one stuck).

The information is used in two ways:

* Keep track of the progress (what we've already done in this branch and what
  we still need to do).

* Prepare release notes for upcoming releases

To make this approach work, every change must be associated with a bug number
(prefixed with **T**) and a component. If there is no bug report/feature request
for the changes you are going to make, you have to create a Phabricator_ task
first. Once there is an entry in Phabricator_, you should reference its id in
your commit message, as shown below:

* ``ddclient: T1030: auto create runtime directories``
* ``Jenkins: add current Git commit ID to build description``

If there is no Phabricator_ reference in the commits of your pull request, we
have to ask you to ammend the commit message. Otherwise we will have to reject
it.

In general, use an editor to create your commit messages rather than passing
them on the command line. The format should be and is inspired by this blog
post: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html

* A single, short, summary of the commit (recommended 70 characters or less,
  but not exceeding 80 characters)

  * Add a prefix of the changed component to your commit headline, e.g. ``snmp:
    T1111:`` or ``ethernet: T2222:``. If multiple components are touched by this
    commit, you can use multiple prefixes, e.g.: ``snmp: ethernet:``

* Followed by a blank line (this is mandatory - else Git will treat the whole
  commit message as the headline only)

* Followed by a message which describes all the details like:

  * What/why/how something has been changed, makes everyones life easier when
    working with `git bisect`

  * All text of the commit message should be wrapped at 72 characters if
    possible which makes reading commit logs easier with ``git log`` on a
	standard terminal (which happens to be 80x25)

  * If applicable a reference to a previous commit should be made linking
    those commits nicely when browsing the history: ``After commit abcd12ef
	("snmp: this is a headline") a Python import statement is missing,
	throwing the follwoing exception: ABCDEF``

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
  Perl/BASH code. Use the new stlye XML/Python interface instead.

Please submit your patches using the well-known GitHub pull-request against our
repositories found in the VyOS GitHub organisation at https://github.com/vyos


Determining package for a fix
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Suppose you want to make a change in the webproxy script but yet you do not know
which of the many VyOS packages ship this file. You can determine the VyOS
package name in question by using Debians ``dpkg -S`` command of your running
VyOS installation.

.. code-block:: sh

  vyos@vyos:~ dpkg -S /opt/vyatta/sbin/vyatta-update-webproxy.pl
  vyatta-webproxy: /opt/vyatta/sbin/vyatta-update-webproxy.pl

This means the file in question (``/opt/vyatta/sbin/vyatta-update-webproxy.pl``)
is located in the ``vyatta-webproxy`` package which can be found here:
https://github.com/vyos/vyatta-webproxy


Fork repository to submit a Patch
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Forking the repository and submitting a GitHub pull-request is the preferred
way of submitting your changes to VyOS. You can fork any VyOS repository to your
very own GitHub account by just appending ``/fork`` to any repositories URL on
GitHub. To e.g. fork the ``vyos-1x`` repository, open the following URL in your
favourite browser: https://github.com/vyos/vyos-1x/fork

You then can proceed with cloning your fork or add a new remote to your local
repository:

* Clone: ``git clone https://github.com/<user>/vyos-1x.git``

* Fork: ``git remote add myfork https://github.com/<user>/vyos-1x.git``

In order to record you as the author of the fix please indentify yourself to Git
by setting up your name and email. This can be done local for this one and only
repository ``git config`` or globally using ``git config --global``.

.. code-block:: sh

  git config --global user.name "J. Random Hacker"
  git config --global user.email "jrhacker@example.net"

Make your changes and save them. Do the following for all changes files to
record them in your created Git commit:

* Add file to Git index using ``git add myfile``, or for a whole directory:
  ``git add somedir/*``

* Commit the changes by calling ``git commit``. Please use a meaningful commit
  headline (read above) and don't forget to reference the Phabricator_ ID.

* Submit the patch ``git push`` and create the GitHub pull-request.


Attach patch to Phabricator task
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Follow the above steps on how to "Fork repository to submit a Patch". Instead
of uploading "pushing" your changes to GitHub you can export the patches/
commits and send it to maintainers@vyos.net or attach it directly to the bug
(preferred over email)

* Export last commit to patch file: ``git format-patch`` or export the last two
  commits into its appropriate patch files: ``git format-patch -2``

.. _Phabricator: https://phabricator.vyos.net