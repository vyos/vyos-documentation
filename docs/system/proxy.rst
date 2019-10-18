.. _proxy:

System Proxy
============

Some IT environments require the use of a proxy to connect to the Internet.
The option allowes to set a HTTP proxy and if necessary, supports `basic auth`_.  

The code example below sets a proxy for all HTTP, HTTPS and FTP (anonymous ftp) connections, initiated by vyos. 

.. code-block:: sh

  set system proxy url http://10.100.100.1
  set system proxy port 8080

That enables the update of a system image if the vyos system operates behind a proxy.

.. code-block:: sh

  vyos@vyos:~$ add system image https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
  Trying to fetch ISO file from https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  1  413M    1 4479k    0     0   995k      0  0:07:04  0:00:04  0:07:00  995k



.. _`basic auth`: https://tools.ietf.org/html/rfc7617
