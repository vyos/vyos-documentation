.. _event-handler:

Event Handler
-------------

Event handler allows you to execute scripts when a string that matches a regex appears in a text stream (e.g. log file).

It uses "feeds" (output of commands, or a named pipes) and "policies" that define what to execute if a regex is matched.

.. code-block:: none

  system
  event-handler
      feed <name>
      description <feed description>
      policy <policy name>
      source
          preset
          syslog # Use the syslog logs for feed
          custom
          command <command to execute> # E.g. "tail -f /var/log/somelogfile"
          named-pipe <path to a names pipe>
      policy <policy name>
      description <policy description>
      event <event name>
          description <event description>
          pattern <regex>
          run <command to run>

In this small example a script runs every time a login failed and an interface goes down

.. code-block:: none

  vyos@vyos# show system event-handler
  feed Syslog {
      policy MyPolicy
      source {
          preset syslog
      }
  }
  policy MyPolicy {
      description "Test policy"
      event BadThingsHappened {
          pattern "authentication failure"
          pattern "interface \.* index \d+ .* DOWN.*"
          run /config/scripts/email-to-admin
      }
  }