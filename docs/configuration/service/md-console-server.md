# Console Server

Starting of with VyOS 1.3 (equuleus) we added support for running VyOS as an
Out-of-Band Management device which provides remote access by means of SSH to
directly attached serial interfaces.

Serial interfaces can be any interface which is directly connected to the CPU
or chipset (mostly known as a ttyS interface in Linux) or any other USB to
serial converter (Prolific PL2303 or FTDI FT232/FT4232 based chips).

If you happened to use a Cisco NM-16A - Sixteen Port Async Network Module or
NM-32A - Thirty-two Port Async Network Module - this is your VyOS replacement.

For USB port information please refor to: `hardware_usb`.

## Configuration

Between computers, the most common configuration used was "8N1": eight bit
characters, with one start bit, one stop bit, and no parity bit. Thus 10 Baud
times are used to send a single character, and so dividing the signalling
bit-rate by ten results in the overall transmission speed in characters per
second. This is also the default setting if none of those options are defined.

<div class="cfgcmd">

set service console-server device \<device\> data-bits \[7 | 8\]

Configure either seven or eight data bits. This defaults to eight data
bits if left unconfigured.

</div>

<div class="cfgcmd">

set service console-server device \<device\> description \<string\>

A user friendly description identifying the connected peripheral.

</div>

<div class="cfgcmd">

set service console-server device \<device\> alias \<string\>

A user friendly alias for this connection. Can be used instead of the
device name when connecting.

</div>

<div class="cfgcmd">

set service console-server device \<device\> parity \[even | odd | none\]

Set the parity option for the console. If unset this will default to none.

</div>

<div class="cfgcmd">

set service console-server device \<device\> stop-bits \[1 | 2\]

Configure either one or two stop bits. This defaults to one stop bits if
left unconfigured.

</div>

<div class="cfgcmd">

set service console-server device \<device\> speed
\[ 300 | 1200 | 2400 | 4800 | 9600 | 19200 | 38400 | 57600 | 115200 \]

<div class="note">

<div class="title">

Note

</div>

USB to serial converters will handle most of their work in software
so you should be carefull with the selected baudrate as some times they
can't cope with the expected speed.

</div>

</div>

### Remote Access

Each individual configured console-server device can be directly exposed to
the outside world. A user can directly connect via SSH to the configured
port.

<div class="cfgcmd">

set service console-server device \<device\> ssh port \<port\>

Accept SSH connections for the given <span class="title-ref">\<device\></span> on TCP port <span class="title-ref">\<port\></span>.
After successful authentication the user will be directly dropped to
the connected serial device.

<div class="hint">

<div class="title">

Hint

</div>

Multiple users can connect to the same serial device but only
one is allowed to write to the console port.

</div>

</div>

## Operation

<div class="opcmd">

show console-server ports

Show configured serial ports and their respective interface configuration.

``` none
vyos@vyos:~$ show console-server ports
 usb0b2.4p1.0             on /dev/serial/by-bus/usb0b2.4p1.0@ at   9600n
```

</div>

<div class="opcmd">

show console-server user

Show currently connected users.

``` none
vyos@vyos:~$ show console-server user
 usb0b2.4p1.0               up   vyos@localhost
```

</div>

<div class="opcmd">

connect console \<device\>

Locally connect to serial port identified by <span class="title-ref">\<device\></span>.

``` none
vyos@vyos-r1:~$ connect console usb0b2.4p1.0
[Enter `^Ec?' for help]
[-- MOTD -- VyOS Console Server]

vyos-r2 login:
```

<div class="hint">

<div class="title">

Hint

</div>

Multiple users can connect to the same serial device but only
one is allowed to write to the console port.

</div>

<div class="hint">

<div class="title">

Hint

</div>

The sequence `^Ec?` translates to: `Ctrl+E c ?`. To quit
the session use: `Ctrl+E c .`

</div>

<div class="hint">

<div class="title">

Hint

</div>

If `alias` is set, it can be used instead of the device when
connecting.

</div>

</div>

<div class="opcmd">

show log console-server

Show the console server log.

</div>
