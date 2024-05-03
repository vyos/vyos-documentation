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

You should include the following information:

* A sequence of configuration commands or a complete configuration file
  required to recreate a setup where the bug occurs.
  Please avoid partial configs: a sequence of commands is easy to paste into the console,
  a complete config is easy to load in a VM, but a partial config is neither!
  At least not until we implement a "merge from the CLI"
  feature that allows pasting config file chunks into a session.
* The behavior you expect and how it's different from the behavior you observe.
  Don't just include command outputs or traffic dumps —
  try to explain at least briefly why they are wrong and what they should be.
* A sequence of actions that triggers the bug.
  We understand that it's not always possible, but it makes developer's job a lot easier
  and also allows any community member to independently confirm
  that the bug still exists or if it's already fixed.
* If it's a regression, tell us a VyOS version where the feature still worked correctly.
  It's perfect if you can tell exactly which version broke it,
  but we understand that it's not always easy or feasible — any working version is acceptable.

If you aren't certain what the correct behavior is and if what you see is really a bug,
or if you don't have a reproducing procedure that reliably triggers it,
please create a post on the forum or ask in the chat first —
or, if you have a subscription, create a support ticket.
Our team and community members can help you identify the bug and work around it,
then create an actionable and testable bug report.

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

Feature Requests
================

You have an idea of how to make VyOS better or you are in need of a specific
feature which all users of VyOS would benefit from? To send a feature request
please search Phabricator_ to check if there is already a request pending. You can
enhance it or if you don't find one, create a new one by use the quick link in
the left side under the specific project.

You must create a task before you start working on a feature.
Yes, even if it's a tiny feature — we use the task tracker to generate release notes,
so it's essential that everything is reflected there.

You must include at least the following:

* A reasonably detailed description of the feature: what it is, how it's supposed to work,
  and how you'd use it.
  The maintainers aren't familiar with every feature of every protocol and tool,
  and community contributors who are looking for tasks to work on will also
  appreciate more information that helps them implement and test a feature.
* Proposed CLI syntax, if the feature requires new commands.
  Please include both configuration and operational mode commands, if both are required.

You should include the following information:

* Is the feature supported by the underlying component
  (FreeRangeRouting, nftables, Kea...) already?
* How you'd configure it by hand there?
* Are there any limitations (hardware support, resource usage)?
* Are there any adverse or non-obvious interactions with other features?
  Should it be mutually exclusive with anything?

It's fine if you cannot provide some of that information, but if you can,
it makes the work of developers considerably simpler,
so try to do the research to answer those questions.

Task auto-closing
=================

There is a special status for tasks
where all work on the side of maintainers and contributors is complete:
"Needs reporter action".

We assign that status to:

* Feature requests that do not include required information and need clarification.
* Bug reports that lack reproducing procedures.
* Tasks that are implemented and tested by the implementation author,
  but require testing in the real-world environment that only the reporter can replicate
  (e.g., hardware we do not have, specific network conditions...).

This is what will happen when a task is set to "Needs reporter action":

* If there is no response from the reporter within two weeks,
  the task bot will add a comment ("Any news?") to remind the reporter to reply.
* If there is no response after further two weeks, the task will be automatically closed.

We will not auto-close tasks with any other status
and will not close tasks for the lack of maintainer activity!

.. _documentation: https://docs.vyos.io
.. _Slack: https://slack.vyos.io
.. _Forum: https://forum.vyos.io

.. include:: /_include/common-references.txt
