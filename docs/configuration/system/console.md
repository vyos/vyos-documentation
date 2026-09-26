---
myst:
  html_meta:
    description: |
      A serial console provides text-based access to the router's command
      line over a serial device, useful for diagnostics, upgrades, and other
      situations where SSH access is unavailable.
    keywords: serial console, text-based interface, serial device, baud rate
---

(serial-console)=

# Serial console

A serial console is a text-based interface that provides access to the
router's command line via a serial device.

For routine local access, a serial console offers no advantage over a
directly attached keyboard and screen. Serial consoles are much slower,
taking up to a second to fill an 80-column by 24-line screen, and
generally only support non-proportional
{abbr}`ASCII (American Standard Code for Information Interchange)` text,
with limited support for languages other than English.

There are some scenarios where serial consoles are useful. Remote
systems are usually administered over {ref}`ssh`, but sometimes console
access is the only way to diagnose and correct software failures. Certain
system upgrades may also require console access.

## Configuration

```{cfgcmd} set system console device \<device\>

**Enable a serial console on the specified device.**

`<device>` is the device name, in one of the following formats:

- `ttySN`: Standard serial device.
- `ttyAMAN`: ARM serial device.
- `usbNbXpY`: {abbr}`USB (Universal Serial Bus)`-to-serial converter,
  addressed by its bus path.
- `hvcN`: Xen console.

`N` is a number in all formats. In `usbNbXpY`, `X` and `Y` are the bus
and port parts of the converter's USB path and can contain dot-separated
numbers.

A USB serial converter must be connected upon commit. Otherwise, the
commit fails.
```

Example:

```none
set system console device ttyS0
```

```{cfgcmd} set system console device \<device\> kernel

**Output kernel messages to the specified device.**

By default, the router sends them to `tty0`.

The specified device must be a `ttyS` or `ttyAMA` device, and only one
device can receive kernel messages. Otherwise, the commit fails.
```

```{note}
If you install the router from a serial console, the installer sets this
option automatically on the device used during installation, usually
`ttyS0` or `ttyAMA0`.
```

Example:

```none
set system console device ttyS0 kernel
```

```{cfgcmd} set system console device \<device\> speed \<1200 | 2400 | 4800 | 9600 | 19200 | 38400 | 57600 | 115200\>

**Configure the console baud rate.**

The default is `115200`, except for `hvcN` (Xen) consoles, which default
to `38400`.
```

```{note}
Many USB-to-serial converters lack hardware flow control. Without it, a
converter may silently drop data at high baud rates. If you cannot
connect at a high rate, set the speed to `9600`.
```

Example:

```none
set system console device ttyS0 speed 115200
```

```{cfgcmd} set system console powersave

**Enable screen-blank power saving on the local VGA console.**

When enabled, the local console blanks the screen after 15 minutes of
inactivity and powers down the monitor after 60 minutes. This does not
affect serial consoles or SSH sessions.
```

Example:

```none
set system console powersave
```