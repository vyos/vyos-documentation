.. _vyos_api:

VyOS API Classes
================


Interface Config
----------------

This class contains the code to configure a network interfaces.
Exceptions are being send to stdout if the debug flag is set within the environment, via ``export DEBUG=1``.
It shows exception for executed commands and parses andd displays the exception output in a structured form.
Value errors are always displayed, regardless of the presence of the ``DEBUG`` variable.


Example how the ``DEBUG`` variable can be used.
  .. code-block:: sh

    #!/usr/bin/python3

    from vyos.interfaceconfig import Interface

    a = Interface("wg01", "fnord")
    print (a.set_link_state("up"))


  .. code-block:: sh

    root@vyos:/home/vyos# ./example_script.py
    RTNETLINK answers: Operation not supported

    export DEBUG=1
    root@vyos:/home/vyos# ./example_script.py

    Exception raised:
    command: ['ip link add dev wg01 type fnord']
    error code: 2
    subprocess output: RTNETLINK answers: Operation not supported


Interface(interfacename, type=None)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
The interfacename is mandatory, if it is a virtual interface such as a wireguard interface or vlan, veth etc., the type can be assigned and the device is being created if it is a valid device.

existing device:
  .. code-block:: sh

    #!/usr/bin/python3

    from vyos.interfaceconfig import Interface

    interface_instance = Interface("eth2")

non-existing device which needs to be created:
  .. code-block:: sh

    #!/usr/bin/python3

    from vyos.interfaceconfig import Interface

    interface_instance = Interface("wg01", "wireguard")

If a device creation has been successful, the return code is ``0`` otherwise ``None``.


set_alias(alias=None)
^^^^^^^^^^^^^^^^^^^^^
An interfaces ifalias variable is empty by default, but the variable is used for example by snmp. The parameter is optional and if not set, the default behavior is to use the interfacename of the instance, if set it uses the name set in the parameter.

.. code-block:: sh

  #!/usr/bin/python3

  from vyos.interfaceconfig import Interface

  interface_instance = Interface("eth2")
  interface_instance.set_alias()


.. code-block:: sh

  4: eth2: <BROADCAST,MULTICAST> mtu 1500 qdisc pfifo_fast state DOWN mode DEFAULT group default qlen 1000
    link/ether 08:00:27:70:9c:a3 brd ff:ff:ff:ff:ff:ff
    alias eth2

get_alias()
^^^^^^^^^^^
Reads the ifalias variable directly from the /sys/class/net/<interface>/ifalias and can be used to determine in a config a new value and what value is set in in the system.

del_alias()
^^^^^^^^^^^
Removes any content from the ifalias variable.

set_link_state(state="up")
^^^^^^^^^^^^^^^^^^^^^^^^^^
Sets an interface state either to adminitrativly up or down, regardless of the real connection status. If called without parameter, the default function is up, valid parameters are ``up`` or ``down``.


.. code-block:: sh

  ip link show dev eth2
  4: eth2: <BROADCAST,MULTICAST> mtu 1500 qdisc pfifo_fast state DOWN mode DEFAULT group default qlen 1000


.. code-block:: sh

  #!/usr/bin/python3

  from vyos.interfaceconfig import Interface

  interface_instance = Interface("eth2")
  interface_instance.set_link_state()
  

.. code-block:: sh

  ip link show dev eth2
  4: eth2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP mode DEFAULT group default qlen 1000

get_link_state()
^^^^^^^^^^^^^^^^
Returns the link status of an interface which can be either ``up``, ``down`` or ``unknown``. The link status ``unknown`` is often visible on uninitialized wireguard interfaces, once traffic was successfully sent and received it will change to state ``up``. However, it is not recommended to assume that wireguard is correctly configured by the interface status, since multiple peers can be configured on a single interface and if only 1 out of 10 is working, the interface status will shown as ``up``.


remove_interface()
^^^^^^^^^^^^^^^^^^
Removes an interface from the system, given as parameter of the objects instance.  

set_macaddr(mac)
^^^^^^^^^^^^^^^^
Sets the mac address on a network interface.

get_macaddr()
^^^^^^^^^^^^^
Returns the mac address of a network interface.

set_mtu(mtu=None)
^^^^^^^^^^^^^^^^^
Sets the MTU on a network interface.

get_mtu(self)
^^^^^^^^^^^^^
Returns the MTU of a network interface.


add_ipv4_addr(ipaddr=[]):
^^^^^^^^^^^^^^^^^^^^^^^^^
Adds IPv4 addresses given as parameter.

.. code-block:: sh

  #!/usr/bin/python3

  from vyos.interfaceconfig import Interface

  ips = ['10.100.100.1/24', '10.100.100.2/24', '10.100.100.3/24']
  interface_instance = Interface("eth2")
  interface_instance.add_ipv4_addr(ips)

.. code-block:: sh

   ip -4 -br addr sh dev eth2 
   eth2             UP             10.100.100.1/24 10.100.100.2/24 10.100.100.3/24


del_ipv4_addr(ipaddr=[])
^^^^^^^^^^^^^^^^^^^^^^^^
Removes the IPs given in the parameter ``ipaddr``.

def get_ipv4_addr()
^^^^^^^^^^^^^^^^^^^
Returns a list of all IPv4 addresses of an interface.


.. code-block:: sh

  #!/usr/bin/python3

  from vyos.interfaceconfig import Interface

  interface_instance = Interface("eth2")
  ips = interface_instance.get_ipv4_addr()
  print(ips)

.. code-block:: sh

  ['10.100.100.1', '10.100.100.2', '10.100.100.3']


set_dhcpv4()
^^^^^^^^^^^^
Starts dhclient and sends DHCPREQUEST messages on the interface.

del_dhcpv4()
^^^^^^^^^^^^
Stops dhclient on the interface.

get_dhcpv4()
^^^^^^^^^^^^
Returns the pid of the dhclient process, if none is runing `False` is being returned and the message ``no dhcp client running on interface <interface>`` displayed on stdout.

add_ipv6_addr(ipaddr=[])
^^^^^^^^^^^^^^^^^^^^^^^^
Adds IPv6 addresses given as parameter.

.. code-block:: sh

  #!/usr/bin/python3

  from vyos.interfaceconfig import Interface

  ips = ['2001:db8:dead::1/64', '2001:db8:beaf::1/64', '2001:db8:cafe::1/64']
  interface_instance = Interface("eth2")
  interface_instance.add_ipv6_addr(ips)

.. code-block:: sh

  ip -6 -br addr sh dev eth2
  eth2 UP 2001:db8:cafe::1/64 2001:db8:beaf::1/64 2001:db8:dead::1/64 fe80::a00:27ff:fe70:9ca3/64

del_ipv6_addr(ipaddr=[])
^^^^^^^^^^^^^^^^^^^^^^^^
Removes the IPv6 addresses given via the paramater ``ipaddr``.

get_ipv6_addr()
^^^^^^^^^^^^^^^
Returns all IPv6 addresse set on the interface.

.. code-block:: sh

  #!/usr/bin/python3

  from vyos.interfaceconfig import Interface

  interface_instance = Interface("eth2")
  ips = interface_instance.get_ipv6_addr()
  print(ips)

.. code-block:: sh

  ['2001:db8:cafe::1', '2001:db8:beaf::1', '2001:db8:dead::1', 'fe80::a00:27ff:fe70:9ca3']


set_dhcpv6()
^^^^^^^^^^^^
It enables stateful IPv6 deployments on the given interface. The interface will stop to listen to route annoncements (RA's) and requests that parameter via dhcpv6.
DHCPv4 and DHCPv6 can be configured simultaniously on the interface.

.. code-block:: sh

  #!/usr/bin/python3

  from vyos.interfaceconfig import Interface

  interface_instance = Interface("eth2")
  interface_instance.set_dhcpv4()
  interface_instance.set_dhcpv6()

del_dhcpv6()
^^^^^^^^^^^^
Stops dhclient and starts listen and acceptiing RA's again.

get_dhcpv6()
^^^^^^^^^^^^
Returns the pid of the running dhclient process or None if it doesn't exist.

