# Task Scheduler

The task scheduler allows you to execute tasks on a given schedule. It makes
use of UNIX [cron](https://en.wikipedia.org/wiki/Cron).

<div class="note">

<div class="title">

Note

</div>

All scripts excecuted this way are executed as root user - this may
be dangerous. Together with `command-scripting` this can be used for
automating (re-)configuration.

</div>

<div class="cfgcmd">

set system task-scheduler task \<task\> interval \<interval\>

Specify the time interval when <span class="title-ref">\<task\></span> should be executed. The interval
is specified as number with one of the following suffixes:

- `none` - Execution interval in minutes
- `m` - Execution interval in minutes
- `h` - Execution interval in hours
- `d` - Execution interval in days

<div class="note">

<div class="title">

Note

</div>

If suffix is omitted, minutes are implied.

</div>

</div>

<div class="cfgcmd">

set system task-scheduler task \<task\> crontab-spec \<spec\>

Set execution time in common [cron](https://en.wikipedia.org/wiki/Cron) time format. A cron <span class="title-ref">\<spec\></span> of
`30 */6 * * *` would execute the <span class="title-ref">\<task\></span> at minute 30 past every 6th hour.

</div>

<div class="cfgcmd">

set system task-scheduler task \<task\> executable path \<path\>

Specify absolute <span class="title-ref">\<path\></span> to script which will be run when <span class="title-ref">\<task\></span> is
executed.

</div>

<div class="cfgcmd">

set system task-scheduler task \<task\> executable arguments \<args\>

Arguments which will be passed to the executable.

</div>
