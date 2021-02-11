.. _pptp:

PPTP-Server
-----------

The Point-to-Point Tunneling Protocol (PPTP_) has been implemented in VyOS only
for backwards compatibility. PPTP has many well known security issues and you 
should use one of the many other new VPN implementations.

As per default and if not otherwise defined, mschap-v2 is being used for
authentication and mppe 128-bit (stateless) for encryption. If no
gateway-address is set within the configuration, the lowest IP out of the /24
client-ip-pool is being used. For instance, in the example below it would be
192.168.0.1.

server example
^^^^^^^^^^^^^^

.. code-block:: none

  set vpn pptp remote-access authentication local-users username test password 'test'
  set vpn pptp remote-access authentication mode 'local'
  set vpn pptp remote-access client-ip-pool start '192.168.0.10'
  set vpn pptp remote-access client-ip-pool stop '192.168.0.15'
  set vpn pptp remote-access gateway-address '10.100.100.1'
  set vpn pptp remote-access outside-address '10.1.1.120'


client example (debian 9)
^^^^^^^^^^^^^^^^^^^^^^^^^

Install the client software via apt and execute pptpsetup to generate the
configuration.


.. code-block:: none

  apt-get install pptp-linux
  pptpsetup --create TESTTUNNEL --server 10.1.1.120 --username test --password test --encrypt
  pon TESTTUNNEL

The command pon TESTUNNEL establishes the PPTP tunnel to the remote system.


All tunnel sessions can be checked via:

.. code-block:: none

  run sh pptp-server sessions
   ifname | username | calling-sid |      ip      | type | comp | state  |  uptime
  --------+----------+-------------+--------------+------+------+--------+----------
   ppp0   | test     | 10.1.1.99   | 192.168.0.10 | pptp | mppe | active | 00:00:58
