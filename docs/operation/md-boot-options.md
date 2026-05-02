# Boot Options

<div class="warning">

<div class="title">

Warning

</div>

This function may be highly disruptive.
It may cause major service interruption, so make sure you really
need it and verify your input carefully.

</div>

VyOS has several kernel command line options to modify the normal boot
process.
To add an option, select the desired image in GRUB menu at load
time, press **e**, edit the first line, and press **Ctrl-x** to boot when
ready.

<img src="/_static/images/boot-options.webp" class="align-center" style="width:80.0%" alt="image" />

## Specify custom config file

Tells the system to use specified file instead of `/config/config.boot`.
If specified file does not exist or is not readable, fall back to
default config. No additional verification is performed, so make sure
you specify a valid config file.

``` none
vyos-config=/path/to/file
```

To load the *factory default* config, use:

``` none
vyos-config=/opt/vyatta/etc/config.boot.default
```

## Disable specific boot process steps

These options disable some boot steps. Make sure you understand the
`boot process <boot-steps>` well before using them!

<div class="glossary">

no-vyos-migrate  
Do not perform config migration.

no-vyos-firewall  
Do not initialize default firewall chains, renders any firewall
configuration unusable.

</div>
