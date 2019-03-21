.. _commandtree_operationmode:

Operational mode
----------------

Operational mode allows for commands to perform operational system tasks and view system and service status.
After this is the first view after the login.
Please see :ref:`cli` for navigation in the CLI


.. code-block:: sh


  vyos@vyos:~$ [tab]
  Possible completions:
    add               Add an object to a service
    clear             Clear system information
    clone             Clone an object
    configure         Enter configure mode
    connect           Establish a connection
    copy              Copy an object
    delete            Delete an object
    disconnect        Take down a connection
    force             Force an operation
    format            Format a device
    generate          Generate an object
    install           Install a new system
    monitor           Monitor system information
    ping              Send IPv4 or IPv6 ICMP (Internet Control Message Protocol) echo requests
    poweroff          Poweroff the system
    reboot            Reboot the system
    release           Release specified variable
    rename            Rename an object
    renew             Renew specified variable
    reset             Reset a service
    restart           Restart a service
    set               Set operational options
    show              Show system information
    telnet            Telnet to a node
    traceroute        Track network path to node
    update            Update data for a service


Add
^^^

.. code-block:: sh

 raid         Add a RAID set element
 system       Add an item to a system facility

Clear
^^^^^

.. code-block:: sh

  console            Clear screen
  firewall           Clear firewall statistics
  flow-accounting    Clear flow accounting
  interfaces         Clear interface information
  ip                 Clear Internet Protocol (IP) statistics or status
  ipv6               Clear Internet Protocol (IPv6) statistics or status
  nat                Clear network address translation (NAT) tables
  policy             Clear policy statistics


Clone
^^^^^
The ``clone`` command allows you to clone a configuration from a system image to another one, or from the running config to another system image.
To clone the running config to a system image:

.. code-block:: sh

  clone system config <system-image> from running

To clone from system image A to system image B:

.. code-block:: sh

  clone system config <system-image-B> from <system-image-A>


Configure
^^^^^^^^^

The ``configure`` command allows you to enter configuration mode.

.. code-block:: sh

  vyos@vyos:~$ configure
  [edit]
  vyos@vyos#


Connect
^^^^^^^

The ``connect`` command allows you to bring up a connection oriented interface, like a pppoe interface.

.. code-block:: sh

  connect interface <interface>

Copy
^^^^

The ``copy`` command allows you to copy a file to your running config or over images.

It can look like this example:

.. code-block:: sh

  vyos@vyos:~$  copy file [tab]
  Possible completions:
    http://<user>:<passwd>@<host>/<file>
                  Copy files from specified source
    scp://<user>:<passwd>@<host>/<file>
    ftp://<user>:<passwd>@<host>/<file>
    tftp://<host>/<file>
    1.2.0://config/
    1.2.0-rolling+201902251818://config/
    1.2.0-rolling+201902201040://config/
    1.2.0-rolling+201902080337://config/
    1.2.0-H4://config/
    running://config/


To copy from file A to file B:

.. code-block:: sh

  copy <file A> to <file B>


Delete
^^^^^^

.. code-block:: sh

  conntrack     Delete Conntrack entries
  file          Delete files in a particular image
  log           Delete a log file
  raid          Remove a RAID set element
  system        Delete system objects


Disconnect
^^^^^^^^^^

The ``disconnect`` command allows you to take down a connection oriented interface, like a pppoe interface.

.. code-block:: sh

  disconnect interface <interface>

Force
^^^^^

.. code-block:: sh

  arp           Send gratuitous ARP request or reply
  cluster       Force a cluster state transition


Format
^^^^^^

The ``format`` command allows you to format a disk the same way as another one.

.. code-block:: sh

  format disk <target> like <source>

Generate
^^^^^^^^

.. code-block:: sh

  openvpn       OpenVPN key generation tool
  ssh-server-key
                Regenerate the host SSH keys and restart the SSH server
  tech-support  Generate tech-support archive
  vpn           VPN key generation utility
  wireguard     wireguard key generation utility

Install
^^^^^^^

The ``install`` command allows you to install the system image on the disk.

.. code-block:: sh

  install image


Monitor
^^^^^^^

``monitor`` can be used to continually view what is happening on the router.

.. code-block:: sh

  bandwidth     Monitor interface bandwidth in real time
  bandwidth-test
                Initiate or wait for bandwidth test
  cluster       Monitor clustering service
  command       Monitor an operational mode command (refreshes every 2 seconds)
  conntrack-sync
                Monitor conntrack-sync
  content-inspection
                Monitor Content-Inspection
  dhcp          Monitor Dynamic Host Control Protocol (DHCP)
  dns           Monitor a Domain Name Service (DNS) daemon
  firewall      Monitor Firewall
  https         Monitor the Secure Hypertext Transfer Protocol (HTTPS) service
  lldp          Monitor Link Layer Discovery Protocol (LLDP) daemon
  log           Monitor last lines of messages file
  nat           Monitor network address translation (NAT)
  openvpn       Monitor OpenVPN
  protocol      Monitor routing protocols
  snmp          Monitor Simple Network Management Protocol (SNMP) daemon
  stop-all      Stop all current background monitoring processes
  traceroute    Monitor the path to a destination in realtime
  traffic       Monitor traffic dumps
  vpn           Monitor VPN
  vrrp          Monitor Virtual Router Redundancy Protocol (VRRP)
  webproxy      Monitor Webproxy service


Ping
^^^^

The ``ping`` command allows you to send an ICMP-EchoRequest packet and display the ICMP-EchoReply received.

.. code-block:: sh

  <hostname>    Send Internet Control Message Protocol (ICMP) echo request
  <x.x.x.x>
  <h:h:h:h:h:h:h:h>


Poweroff
^^^^^^^^

The ``poweroff`` command allows you to properly shut down the VyOS instance. Without any modifier, the command is executed immediately.

.. code-block:: sh

  <Enter>       Execute the current command
  at            Poweroff at a specific time
  cancel        Cancel a pending poweroff
  in            Poweroff in X minutes
  now           Poweroff the system without confirmation

Reboot
^^^^^^
The ``reboot`` command allows you to properly restart the VyOS instance. Without any modifier, the command is executed immediately.

.. code-block:: sh

  <Enter>       Execute the current command
  at            Poweroff at a specific time
  cancel        Cancel a pending poweroff
  in            Poweroff in X minutes
  now           Poweroff the system without confirmation

Release
^^^^^^^

The ``release`` command allows you to release a DHCP or DHCPv6 lease.

.. code-block:: sh

  vyos@vyos:~$ release dhcp interface <int>
  vyos@vyos:~$ release dhcpv6 interface <int>


Rename
^^^^^^

The ``rename`` command allows you to rename a system image.

.. code-block:: sh

 rename system image <currentname> <newname>


Renew
^^^^^

The ``renew`` command allows you to renew a DHCP or DHCPv6 lease.

.. code-block:: sh

  vyos@vyos:~$ renew dhcp interface <int>
  vyos@vyos:~$ renew dhcpv6 interface <int>

Reset
^^^^^

.. code-block:: sh

  conntrack     Reset all currently tracked connections
  conntrack-sync
                Reset connection syncing parameters
  dns           Reset a DNS service state
  firewall      reset a firewall group
  ip            Reset Internet Protocol (IP) parameters
  ipv6          Reset Internet Protocol version 6 (IPv6) parameters
  nhrp          Clear/Purge NHRP entries
  openvpn       Reset OpenVPN
  terminal      Reset terminal
  vpn           Reset Virtual Private Network (VPN) information

Restart
^^^^^^^

.. code-block:: sh

  cluster       Restart cluster node
  conntrack-sync
                Restart connection tracking synchronization service
  dhcp          Restart DHCP processes
  dhcpv6        Restart DHCPv6 processes
  dns           Restart a DNS service
  flow-accounting
                Restart flow-accounting service
  https         Restart https server
  vpn           Restart IPsec VPN
  vrrp          Restart the VRRP (Virtual Router Redundancy Protocol) process
  wan-load-balance
                Restart WAN load balancing
  webproxy      Restart webproxy service

Set
^^^

.. code-block:: sh

  <OPTION>      Bash builtin set command
  console       Control console behaviors
  date          Set system date and time
  system        Set system operational parameters
  terminal      Control terminal behaviors

Show
^^^^

.. code-block:: sh

  arp           Show Address Resolution Protocol (ARP) information
  bridge        Show bridging information
  cluster       Show clustering information
  configuration Show available saved configurations
  conntrack     Show conntrack entries in the conntrack table
  conntrack-sync
                Show connection syncing information
  date          Show system time and date
  dhcp          Show DHCP (Dynamic Host Configuration Protocol) information
  dhcpv6        Show DHCPv6 (IPv6 Dynamic Host Configuration Protocol) information
  disk          Show status of disk device
  dns           Show DNS information
  file          Show files for a particular image
  firewall      Show firewall information
  flow-accounting
                Show flow accounting statistics
  hardware      Show system hardware details
  history       show command history
  host          Show host information
  incoming      Show ethernet input-policy information
  interfaces    Show network interface information
  ip            Show IPv4 routing information
  ipv6          Show IPv6 routing information
  license       Show VyOS license information
  lldp          Show lldp
  log           Show contents of current master log file
  login         Show current login credentials
  monitoring    Show currently monitored services
  nat           Show Network Address Translation (NAT) information
  nhrp          Show NHRP info
  ntp           Show peer status of NTP daemon
  openvpn       Show OpenVPN information
  policy        Show policy information
  poweroff      Show scheduled poweroff
  pppoe-server  show pppoe-server status
  queueing      Show ethernet queueing information
  raid          Show statis of RAID set
  reboot        Show scheduled reboot
  remote-config Show remote side config
  route-map     Show route-map information
  snmp          Show status of SNMP on localhost
  system        Show system information
  system-integrity
                checks the integrity of the system
  table         Show routing table
  tech-support  Show consolidated tech-support report (private information removed)
  users         Show user information
  version       Show system version information
  vpn           Show Virtual Private Network (VPN) information
  vrrp          Show VRRP (Virtual Router Redundancy Protocol) information
  wan-load-balance
                Show Wide Area Network (WAN) load-balancing information
  webproxy      Show webproxy information
  wireguard     Show wireguard properties
  zone-policy   Show summary of zone policy for a specific zone

Telnet
^^^^^^
In the past the ``telnet`` command allowed you to connect remotely to another device using the telnet protocol.
Telnet is unencrypted and should not use anymore. But its nice to test if an TCP Port to a host is open.


.. code-block:: sh

  vyos@vyos:~$ telnet 192.168.1.3 443
  Trying 192.168.1.3...
  telnet: Unable to connect to remote host: Network is unreachable

  vyos@vyos:~$ telnet 192.168.1.4 443
  Trying 192.168.1.4...
  Connected to 192.168.1.4.
  Escape character is '^]'.

Traceroute
^^^^^^^^^^

The ``traceroute`` command allows you to trace the path taken to a particular device.

.. code-block:: sh

  <hostname>    Track network path to specified node
  <x.x.x.x>
  <h:h:h:h:h:h:h:h>
  ipv4          Track network path to <hostname|IPv4 address>
  ipv6          Track network path to <hostname|IPv6 address>


Update
^^^^^^

.. code-block:: sh

  dns           Update DNS information
  webproxy      Update webproxy