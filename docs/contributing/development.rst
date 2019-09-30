.. _development:

Development
===========

The source code is hosted on GitHub under VyOS organization `github.com/vyos`_

The code is split into modules. VyOS is composed of multiple individual packages,
some of them are periodically synced with upstream, so keeping the whole source
under a single repository would be very inconvenient and slow. There is now an
ongoing effort to consolidate all VyOS-specific framework/config packages into vyos-1x package,
but the basic structure is going to stay the same, just with fewer packages.

The repository that contains the ISO build script is `vyos-build`_. The README will
guide you to use the this top level repository.

.. _github.com/vyos: https://github.com/vyos
.. _vyos-build: https://github.com/vyos/vyos-build

Submit a patch
--------------

Patches are always welcome.
You should follow some procedures and guidelines though.

Before you make a patch
^^^^^^^^^^^^^^^^^^^^^^^
In a big system, such as VyOS, that is comprised of multiple components, it's impossible to keep track of all the changes and bugs/feature requests in one's head. We use a `bugtracker`_ for it ("issue tracker" would be a better term, but this one stuck).

This information is used in two ways:
  * Keep track of the progress (what we've already done in this branch and what we still need to do).
  * Prepare release notes.

To make this approach work, every change must be associated with a bug number and component.
If there is no bug/enhancement request for the changes you are going to make, you must create a `bugtracker`_ entry first.
Once there is a `bugtracker`_ entry about it, you should reference in your commit message, as in:

.. code-block:: sh

  [vyos build] T1327: add serial console (115200,8n1) to ISO kernel command-line
  [vyos config] T1397: Rewrite the config merge script

If there is no reference to an item in our `bugtracker`_ the pull request will be rejected.

Patch limits:
  * If there is a bug that has multiple tasks than it is ok to reference multiple items in a commit and pull request.
  * Multiple bugs can not be fixed in one patch if they have no reference to each other.
  * We only accept bugfixes in packages other than vyos-1x.
  * No new functionality should use old style templates and perl/shell code, use python.

.. _bugtracker: https://phabricator.vyos.net

How to make a patch
^^^^^^^^^^^^^^^^^^^
We only accept patches in git format, because traditional UNIX patch is only good if the code it's going to be applied to doesn't change. If the code changes, merge will fail and the patch will need manual editing, even if there are no real conflicting changes.

Git keeps more information and uses more sophisticated merge algorithms, which makes a fake conflict a rare occurrence. For the same reason you should always make a patch against the latest current branch.

You can make a pull request on `github.com/vyos`_. 

.. _github.com/vyos: https://github.com/vyos

Find the package
^^^^^^^^^^^^^^^^
Suppose you want to make a change in the webproxy script.

You can find its package with "dpkg -S":

.. code-block:: sh

  # dpkg -S /opt/vyatta/sbin/vyatta-update-webproxy.pl 
  vyatta-webproxy: /opt/vyatta/sbin/vyatta-update-webproxy.pl

This means it's in `vyatta-webproxy`_ package.

.. _vyatta-webproxy: https://github.com/vyos/vyatta-webproxy

Make a patch using a fork
^^^^^^^^^^^^^^^^^^^^^^^^^
Fork the repository in github and make a clone.

.. code-block:: sh

  git clone https://github.com/<user>/vyatta-webproxy.git

Set your name and email in the git config:

.. code-block:: sh

  git config user.name "J. Random Hacker"
  git config user.email "jrhacker@example.net"

Make your changes and save them. Then do the following for all changes files:

.. code-block:: sh

  git add myfile

  # Or, for a whole dir:
  git add somedir/*

Commit the changes:

.. code-block:: sh

  git commit

Please use meaningful commit descriptions and don't forget to reference the bug number there!
Now submit the patch, push and make a pull request.

Make a patch to mail or attach to an item
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
clone the repository.

.. code-block:: sh

  git clone https://github.com/vyos/vyatta-webproxy.git

Set your name and email in the git config:

.. code-block:: sh

  git config user.name "J. Random Hacker"
  git config user.email "jrhacker@example.net"

Make your changes and save them. Then do the following for all changes files:

.. code-block:: sh

  git add myfile

  # Or, for a whole dir:
  git add somedir/*

Commit the changes:

.. code-block:: sh

  git commit

Please use meaningful commit descriptions and don't forget to reference the bug number there!
Export the patch and send it to maintainers@vyos.net or attach to the bug. 

.. code-block:: sh

  git format-patch

  # Or, for multiple commits, suppose you made two:
  git format-patch -2

Make a patch using a feature branch (maintainers only)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
checkout the current branch and make sure it is up to date.

.. code-block:: sh

  git clone https://github.com/vyos/vyatta-webproxy.git
  git checkout current
  git pull origin current

Set your name and email in the git config:

.. code-block:: sh

  git config user.name "J. Random Hacker"
  git config user.email "jrhacker@example.net"

Create the feature branch:

.. code-block:: sh

  git checkout -b <feature branch name>

Make your changes and save them. Then do the following for all changes files:

.. code-block:: sh

  git add myfile

  # Or, for a whole dir:
  git add somedir/*

Commit the changes:

.. code-block:: sh

  git commit

Please use meaningful commit descriptions and don't forget to reference the bug number there!

Rebase on the current repo if needed and push your branch

.. code-block:: sh

  git checkout current
  git pull origin current
  git checkout <feature branch name>
  git rebase current
  git push -u origin <feature branch name>

Now you create a pull request.
