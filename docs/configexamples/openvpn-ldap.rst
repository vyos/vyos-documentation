:lastproofread: 2023-01-29

.. _examples-openvvpn-ldap:

#########################
OpenVPN with LDAP example
#########################

Configuration AD and a windows server
=====================================

We aim to configure LDAP authentication between the VYOS router and Windows Server 2019 (role: Active Directory) when our customers connect to our privet network using the OpenVPN client.
Using the general schema for example:

.. image:: /_static/images/mainschema.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram

.. code-block:: none

  VyOS - the main OpenVPN server
  Winserver - windows server with role Active Directory 
  Win10-PC - OpenVPN customer with LDAP authentication

First, we need to configure the AD service and create two accounts. One account for the LDAP adapter built into the VYOS router and a second even account for our test client.

.. image:: /_static/images/ldapone.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram
   
Picture 1 - Adding the AD role

.. image:: /_static/images/ldaptwo.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram
   
Picture 2 - Adding the AD role

Configuration VyOS router
=========================

Make the configuration file for the LDAP plugin.

.. code-block:: none

	vyos@vyos:~$ sudo cat /config/auth/ldap-auth.config
	<LDAP>
	URL ldap://10.217.80.58
	BindDN userldap@corp.vyos.com
	Password YourPass
	Timeout 15
	TLSEnable no
	FollowReferrals no
	</LDAP>
	<Authorization>
	BaseDN "DC=corp,DC=vyos,DC=com"
	SearchFilter "sAMAccountName=%u"
	RequireGroup false
	</Authorization>


**This specific example is for a windows server 2019**:

* URL ldap://10.217.80.58 - The URL of your LDAP server
* BindDN userldap@corp.vyos.com - The BindDN of the users' directory 
* BaseDN "DC=corp,DC=vyos,DC=com" - In the block <Authorization> notice your domain

Make the main config for VyOS like VPN and Authorization server:

.. code-block:: none

	set interfaces ethernet eth0 address 'dhcp'
	set interfaces openvpn vtun10 local-port '1194'
	set interfaces openvpn vtun10 mode 'server'
	set interfaces openvpn vtun10 openvpn-option '--plugin /usr/lib/openvpn/openvpn-auth-ldap.so /config/auth/ldap-auth.config'
	set interfaces openvpn vtun10 persistent-tunnel
	set interfaces openvpn vtun10 protocol 'udp'
	set interfaces openvpn vtun10 server push-route 192.168.0.0/16
	set interfaces openvpn vtun10 server subnet '10.23.1.0/24'
	set interfaces openvpn vtun10 tls ca-cert-file '/config/auth/openvpn/ca.crt'
	set interfaces openvpn vtun10 tls cert-file '/config/auth/openvpn/central.crt'
	set interfaces openvpn vtun10 tls crl-file '/config/auth/openvpn/crl.pem'
	set interfaces openvpn vtun10 tls dh-file '/config/auth/openvpn/dh.pem'
	set interfaces openvpn vtun10 tls key-file '/config/auth/openvpn/central.key'
	set protocols static interface-route 10.23.0.0/20 next-hop-interface vtun10
	set service ssh port '22'

Next, you need to install and configure the configuration file for the windows/Linux OpenVPN client. After connecting to the VPN servers, you will be prompted to go through LDAP authorization.

**To automatically generate the openVPN configuration file for windows clients, you can use this link:**
https://ovpnconfig.com.br/