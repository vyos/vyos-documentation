:lastproofread: 2023-03-26

.. _examples-nmp:

###########
NMP example
###########

Consider how to quickly set up NMP and VyOS for monitoring.
NMP is multi-vendor network monitoring from 'SolarWinds' built to scale and expand with the needs of your network. 

Configuration 'VyOS'
====================

First prepare our VyOS router for connection to NMP. We have to set up the SNMP protocol and connectivity between the router and NMP.

.. code-block:: none

	set interfaces ethernet eth0 address 'dhcp'
	set system name-server '8.8.8.8'
	set service snmp community router authorization 'test'
	set service snmp community router network '0.0.0.0/0'


Configuration 'NMP'
====================

Next, you just  should follow the pictures:

.. image:: /_static/images/nmp1.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram
   
.. image:: /_static/images/nmp2.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram
   
.. image:: /_static/images/nmp3.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram
   
.. image:: /_static/images/nmp4.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram

.. image:: /_static/images/nmp5.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram

.. image:: /_static/images/nmp6.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram

.. image:: /_static/images/nmp7.png
   :width: 80%
   :align: center
   :alt: Network Topology Diagram
   
  
In the end, you'll get a powerful instrument for monitoring the VyOS systems.