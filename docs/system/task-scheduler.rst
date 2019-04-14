.. _task-scheduler:


Task scheduler
--------------

| Task scheduler — allows scheduled task execution. Note that scripts excecuted this way are executed as root user - this may be dangerous.
| Together with :ref:`commandscripting` this can be used for automating configuration.

.. code-block:: sh

  system
      task-scheduler
          task <name>
              cron-spec <UNIX cron time spec>
              executable
                  arguments <arguments string>
                  path <path to executable>
              interval
                  <int32>[mhd]

Interval
********

You are able to set the time as an time interval.

.. code-block:: sh

  set system task-scheduler task <name> interval <value><suffix>

Sets the task to execute every N minutes, hours, or days. Suffixes:

 * m — minutes
 * h — hours
 * d — days

If suffix is omitted, minutes are implied.

Or set the execution time in common cron time.

.. code-block:: sh

  set system task-scheduler task TEST crontab-spec "* * * 1 *"

Example
*******

.. code-block:: sh

  system
      task-scheduler
          task mytask
              interval 2h
              executable
                  path /config/scripts/mytask
                  arguments "arg1 arg2 arg3"
          task anothertask
              cron-spec "* * * 1 *"
              executable
                  path /config/scripts/anothertask