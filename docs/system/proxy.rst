.. _proxy:

System Proxy
============

Some IT environments require the use of a proxy to connect to the Internet.
The ``system proxy`` option sets the configuration for a proxy, and if necessary, supports `basic auth`_.  

This example sets a proxy for all connections initiated by VyOS, including HTTP, HTTPS, and FTP (anonymous ftp).

.. code-block:: console

  set system proxy url http://10.100.100.1
  set system proxy port 8080

  # If a username and password are required
  set system proxy username vyosuser 
  set system proxy password vyosuser-password

That enables the update of a system image if the VyOS system operates behind a proxy.

.. code-block:: console

  vyos@vyos:~$ add system image https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
  Trying to fetch ISO file from https://downloads.vyos.io/rolling/current/amd64/vyos-rolling-latest.iso
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  1  413M    1 4479k    0     0   995k      0  0:07:04  0:00:04  0:07:00  995k



.. _`basic auth`: https://tools.ietf.org/html/rfc7617
