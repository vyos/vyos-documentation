.. _troubleshooting:

Appendix A - Troubleshooting
============================

Sometimes things break or don't work as expected. This section describes
several troubleshooting tools provided by VyOS that can help when something
goes wrong.

Basic Connectivity Verification
-------------------------------

Verifying connectivity can be done with the familiar `ping` and `traceroute`
commands. The options for each are shown (the options for each command were
displayed using the built-in help as described in the :ref:`cli`
section and are omitted from the output here):

.. code-block:: sh

  vyos@vyos:~$ ping
  Possible completions:
    <hostname>    Send Internet Control Message Protocol (ICMP) echo request
    <x.x.x.x>
    <h:h:h:h:h:h:h:h>

Several options are available when more extensive troubleshooting is needed:

.. code-block:: sh

  vyos@vyos:~$ ping 8.8.8.8
  Possible completions:
    <Enter>       Execute the current command
    adaptive      Ping options
    allow-broadcast
    audible
    bypass-route
    count
    deadline
    flood
    interface
    interval
    mark
    no-loopback
    numeric
    pattern
    quiet
    record-route
    size
    timestamp
    tos
    ttl
    verbose

.. code-block:: sh

  vyos@vyos:~$ traceroute
  Possible completions:
    <hostname>    Track network path to specified node
    <x.x.x.x>
    <h:h:h:h:h:h:h:h>
    ipv4          Track network path to <hostname|IPv4 address>
    ipv6          Track network path to <hostname|IPv6 address>

However, another tool, mtr_, is available which combines ping and traceroute
into a single tool. An example of its output is shown:

.. code-block:: sh

  vyos@vyos:~$ mtr 10.62.212.12

                             My traceroute  [v0.85]
  vyos (0.0.0.0)
  Keys:  Help   Display mode   Restart statistics   Order of fields   quit
                                    Packets               Pings
  Host                            Loss%   Snt   Last   Avg  Best  Wrst StDev
  1. 10.11.110.4                   0.0%    34    0.5   0.5   0.4   0.8   0.1
  2. 10.62.255.184                 0.0%    34    1.1   1.0   0.9   1.4   0.1
  3. 10.62.255.71                  0.0%    34    1.4   1.4   1.3   2.0   0.1
  4. 10.62.212.12                  0.0%    34    1.6   1.6   1.6   1.7   0.0

.. note:: The output of ``mtr`` consumes the screen and will replace your
   command prompt.

Several options are available for changing the display output. Press `h` to
invoke the built in help system. To quit, just press `q` and you'll be returned
to the VyOS command prompt.

Monitoring Network Interfaces
-----------------------------

It's possible to monitor network traffic, either at the flow level or protocol
level. This can be useful when troubleshooting a variety of protocols and
configurations. The following interface types can be monitored:

.. code-block:: sh

  vyos@vyos:~$ monitor interfaces
  Possible completions:
    <Enter>       Execute the current command
    bonding       Monitor a bonding interface
    bridge        Monitor a bridge interface
    ethernet      Monitor a ethernet interface
    loopback      Monitor a loopback interface
    openvpn       Monitor an openvpn interface
    pppoe         Monitor pppoe interface
    pseudo-ethernet
                  Monitor a pseudo-ethernet interface
    tunnel        Monitor a tunnel interface
    vrrp          Monitor a vrrp interface
    vti           Monitor a vti interface
    wireless      Monitor wireless interface

To monitor traffic flows, issue the :code:`monitor interfaces <type> <name> flow`
command, replacing `<type>` and `<name>` with your desired interface type and
name, respectively. Output looks like the following:

.. code-block:: sh

                     12.5Kb              25.0Kb              37.5Kb              50.0Kb        62.5Kb
  ????????????????????????????????????????????????????????????????????????????????????????????????????
  10.11.111.255                        => 10.11.110.37                            0b      0b      0b
                                      <=                                       624b    749b    749b
  10.11.110.29                         => 10.62.200.11                            0b    198b    198b
                                      <=                                         0b    356b    356b
  255.255.255.255                      => 10.11.110.47                            0b      0b      0b
                                      <=                                       724b    145b    145b
  10.11.111.255                        => 10.11.110.47                            0b      0b      0b
                                      <=                                       724b    145b    145b
  10.11.111.255                        => 10.11.110.255                           0b      0b      0b
                                      <=                                       680b    136b    136b
  ????????????????????????????????????????????????????????????????????????????????????????????????????
  TX:             cumm:  26.7KB   peak:   40.6Kb                      rates:   23.2Kb  21.4Kb  21.4Kb
  RX:                    67.5KB           63.6Kb                               54.6Kb  54.0Kb  54.0Kb
  TOTAL:                 94.2KB            104Kb                               77.8Kb  75.4Kb  75.4Kb

Several options are available for changing the display output. Press `h` to
invoke the built in help system. To quit, just press `q` and you'll be returned
to the VyOS command prompt.

To monitor interface traffic, issue the :code:`monitor interfaces <type> <name>
traffic` command, replacing `<type>` and `<name>` with your desired interface
type and name, respectively. This command invokes the familiar tshark_ utility
and the following options are available:

.. code-block:: sh

  vyos@vyos:~$ monitor interfaces ethernet eth0 traffic
  Possible completions:
    <Enter>       Execute the current command
    detail        Monitor detailed traffic for the specified ethernet interface
    filter        Monitor filtered traffic for the specified ethernet interface
    save          Save monitored traffic to a file
    unlimited     Monitor traffic for the specified ethernet interface

To quit monitoring, press `Ctrl-c` and you'll be returned to the VyOS command
prompt. The `detail` keyword provides verbose output of the traffic seen on
the monitored interface. The `filter` keyword accepts valid `PCAP filter
expressions`_, enclosed in single or double quotes (e.g. "port 25" or "port 161
and udp"). The `save` keyword allows you to save the traffic dump to a file.
The `unlimited` keyword is used to specify that an unlimited number of packets
can be captured (by default, 1,000 packets are captured and you're returned to
the VyOS command prompt).

.. _mtr: http://www.bitwizard.nl/mtr/
.. _tshark: https://www.wireshark.org/docs/man-pages/tshark.html
.. _`PCAP filter expressions`: http://www.tcpdump.org/manpages/pcap-filter.7.html
