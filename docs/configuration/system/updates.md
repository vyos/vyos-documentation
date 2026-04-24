# Updates

VyOS supports online checking for updates

## Configuration

<div class="cfgcmd">

set system update-check auto-check

Configure auto-checking for new images

</div>

<div class="cfgcmd">

set system update-check url \<url\>

Configure a URL that contains information about images.

</div>

## Example

``` none
set system update-check auto-check
set system update-check url 'https://raw.githubusercontent.com/vyos/vyos-rolling-nightly-builds/main/version.json'
```

Check:

``` none
vyos@r4:~$ show system updates 
Current version: 1.5-rolling-202312220023

Update available: 1.5-rolling-202312250024
Update URL: https://github.com/vyos/vyos-rolling-nightly-builds/releases/download/1.5-rolling-202312250024/1.5-rolling-202312250024-amd64.iso
vyos@r4:~$
```
