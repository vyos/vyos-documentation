# TFTP Server

`TFTP (Trivial File Transfer Protocol)` is a simple, lockstep file
transfer protocol which allows a client to get a file from or put a file onto
a remote host. One of its primary uses is in the early stages of nodes booting
from a local area network. TFTP has been used for this application because it
is very simple to implement.

## Configuration

<div class="cfgcmd">

set service tftp-server directory \<directory\>

Enable TFTP service by specifying the <span class="title-ref">\<directory\></span> which will be used to serve
files.

</div>

<div class="hint">

<div class="title">

Hint

</div>

Choose your `directory` location carefully or you will loose the
content on image upgrades. Any directory under `/config` is save at this
will be migrated.

</div>

<div class="cfgcmd">

set service tftp-server listen-address \<address\>

Configure the IPv4 or IPv6 listen address of the TFTP server. Multiple IPv4 and
IPv6 addresses can be given. There will be one TFTP server instances listening
on each IP address.

</div>

<div class="cfgcmd">

set service tftp-server listen-address \<address\> vrf \<name\>

</div>

Additional option to run TFTP server in the `VRF (Virtual Routing and Forwarding)` context

<div class="note">

<div class="title">

Note

</div>

Configuring a listen-address is essential for the service to work.

</div>

<div class="cfgcmd">

set service tftp-server allow-upload

Optional, if you want to enable uploads, else TFTP server will act as a
read-only server.

</div>

### Example

Provide TFTP server listening on both IPv4 and IPv6 addresses `192.0.2.1` and
`2001:db8::1` serving the content from `/config/tftpboot`. Uploading via
TFTP to this server is disabled.

The resulting configuration will look like:

``` none
vyos@vyos# show service
 tftp-server {
    directory /config/tftpboot
    listen-address 2001:db8::1
    listen-address 192.0.2.1
 }
```

### Verification

Client:

``` none
vyos@RTR2:~$ tftp -p -l /config/config.boot -r backup 192.0.2.1
backup1             100% |******************************|   723  0:00:00 ETA 
```

Server:

``` none
vyos@RTR1# ls -ltr /config/tftpboot/
total 1
-rw-rw-rw- 1 tftp tftp  1995 May 19 16:02 backup
```
