.. _issues_features:

#######################
Issues/Feature requests
#######################

.. _bug_report:

Bug Report/Issue
================

Issues or bugs are found in any software project. VyOS is not an exception.

All issues should be reported to the developers. This lets the developers know
what is not working properly. Without this sort of feedback every developer
will believe that everything is working correctly.

I have found a bug, what should I do?
-------------------------------------

When you believe you have found a bug, it is always a good idea to verify the
issue prior to opening a bug request.

* Consult the documentation_ to ensure that you have configured your system
  correctly
* Get community support via Slack_ or our Forum_

Ensure the problem is reproducible
----------------------------------

When you are able to verify that it is actually a bug, spend some time to
document how to reproduce the issue. This documentation can be invaluable.

When you wish to have a developer fix a bug that you found, helping them
reproduce the issue is beneficial to everyone. Be sure to include information
about the hardware you are using, commands that you were running, any other
activities that you may have been doing at the time. This additional
information can be very useful.

* What were you attempting to achieve?
* What was the configuration prior to the change?
* What commands did you use? Use e.g. ``run show configuration commands``

Include output
--------------

The output you get when you find a bug can provide lots of information. If you
get an error message on the screen, copy it exactly. Having the exact message
can provide detail that the developers can use. Like wise if you have any log
messages that also are from the time of the issue, include those. They may
also contain information that is helpful for the development team.

Report a Bug
------------

In order to open up a bug-report/feature request you need to create yourself
an account on VyOS Phabricator_. On the left side of the specific project (VyOS
1.2 or VyOS 1.3) you will find quick-links for opening a bug-report/feature
request.

* Provide as much information as you can
* Which version of VyOS are you using? ``run show version``
* How can we reproduce this Bug?

.. _feature_request:

Feature Request
===============

You have an idea of how to make VyOS better or you are in need of a specific
feature which all users of VyOS would benefit from? To send a feature request
please search Phabricator_ if there is already a request pending. You can
enhance it or if you don't find one, create a new one by use the quick link in
the left side under the specific project.

.. _documentation: https://docs.vyos.io
.. _Slack: https://slack.vyos.io
.. _Forum: https://forum.vyos.io

.. include:: /_include/common-references.txt
