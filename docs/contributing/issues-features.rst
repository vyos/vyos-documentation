:lastproofread: 2025-12-08

.. _issues_features:

#######################
Issues/Feature requests
#######################

.. _bug_report:

Bug Report/Issue
================

Issues and bugs occur in every software project, and VyOS is no exception.

Report all issues to the developers so they know what is not working correctly.
Without this feedback, developers may assume a broken feature works properly.

I have found a bug, what should I do?
-------------------------------------

When you believe you have found a bug, verify it first to ensure it is genuine.

* Consult the documentation_ to ensure that you have configured your system
  correctly
* Get community support via Slack_ or our Forum_

Ensure the problem is reproducible
----------------------------------

Include the following information when reporting a bug:

* A sequence of configuration commands or a complete configuration file needed
  to recreate the bug. Avoid partial configs: a sequence of commands is easy to
  paste, a complete config is easy to load, but a partial config is neither.
  This limitation should improve once we implement a "merge from the CLI" feature.
* Describe the expected behavior and how it differs from what you observe. Include
  command outputs or traffic dumps, but explain briefly why they are wrong and
  what the correct behavior should be.
* A sequence of actions that trigger the bug. While not always possible, this
  helps developers and community members confirm the issue and verify fixes.
* If it is a regression, specify a VyOS version where the feature worked correctly.
  If you can identify the exact version that broke it, that is helpful. Any
  working version is acceptable.

If you are uncertain whether the behavior is a bug or what the correct behavior
is, or if you lack a reliable reproducing procedure, post on the forum or ask in
chat first. If you have a subscription, create a support ticket. The team and
community can help identify the issue, work around it, and create an actionable
bug report.

Report a Bug
------------

To open a bug report or feature request, create an account on VyOS Phabricator_.
On the left side of the specific project (VyOS 1.2, VyOS 1.3, or VyOS 1.4),
you will find links for opening bug reports and feature requests.

* Provide as much information as you can.
* Specify which VyOS version you are using: ``run show version``
* Explain how to reproduce the bug.

.. _feature_request:

Feature Requests
================

Have an idea to improve VyOS or need a feature that would benefit all users?
Before submitting a feature request, search Phabricator_ to check if a request
already exists. You can enhance an existing request or create a new one using
the quick link on the left side of the specific project.

Create a task before starting work on a feature, even if it is a tiny feature.
We use the task tracker to generate release notes, so all work must be reflected
there.

Include at least the following information:

* Provide a detailed description of the feature: what it is, how it works, and
  how you would use it. Maintainers may not be familiar with every feature of
  every protocol and tool. Community contributors looking for work also
  appreciate detailed information that helps them implement and test the
  feature.
* Include proposed CLI syntax if the feature requires new commands. Provide both
  configuration and operational mode commands if both are needed.

Consider including the following information:

* Is the feature already supported by the underlying component
  (FreeRangeRouting, nftables, Kea, etc.)?
* How would you configure it manually with that component?
* Are there limitations (hardware support, resource usage)?
* Are there any adverse or non-obvious interactions with other features? Should
  it be mutually exclusive with anything?

You do not need to provide all this information, but if you can, it simplifies
developers' work considerably. Research these questions when possible.

Task auto-closing
=================

A special task status exists for when all work by maintainers and contributors
is complete: "Needs reporter action".

We assign this status to:

* Feature requests that do not include required information and need clarification.
* Bug reports that lack reproducing procedures.
* Tasks that are implemented and tested by the implementation author,
  but require testing in the real-world environment that only the reporter can replicate
  (e.g., hardware we do not have, specific network conditions...).

When a task is set to "Needs reporter action", the following happens:

* If no response arrives within two weeks, the task bot adds a comment
  ("Any news?") to remind the reporter.
* If there is still no response after two more weeks, the task closes automatically.

We do not auto-close tasks with any other status and do not close tasks due to
lack of maintainer activity.

.. _documentation: https://docs.vyos.io
.. _Slack: https://slack.vyos.io
.. _Forum: https://forum.vyos.io

.. include:: /_include/common-references.txt
