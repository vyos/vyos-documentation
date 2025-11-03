.. _upgrade_recovery:


##############################
Recovery after Failed Upgrades
##############################

This section explains **VyOS’s upgrade recovery**, which restores the system to the last working version after a failed upgrade. It covers the following points:

* :ref:`Configuration:  <configuration>` How to enable upgrade recovery
* :ref:`How it Works: <how_it_works>` Overview of the recovery process
* :ref:`Cancelling Recovery: <cancelling_recovery>` Overview of the recovery process
 


.. _configuration:

*************
Configuration
*************
.. warning:: Upgrade recovery is disabled by default. To use it, **enable it first**.

To enable upgrade recovery, run the following command:

.. cfgcmd::

   set system option reboot-on-upgrade-failure [timeout <min>]

* ``timeout <min>:`` The time in minutes (from 5 to 30) you have to cancel upgrade recovery. See :ref:`Cancelling Recovery <cancelling_recovery>`.
 
.. _how_it_works:

************
How it Works
************
After a VyOS upgrade, the system monitors the boot process. Upon detecting a boot failure, VyOS initiates a revert to the last working version and displays the following warning:

.. code-block:: none

   Booting failed, reverting to previous image
   Automatic reboot in xx minutes
   Use "reboot cancel" to cancel

If no action is taken, the reboot happens automatically after the configured timeout. Upon successful recovery and reboot, the following message appears: 
 
.. code-block:: none

   WARNING: Image update to "VyOS 1.5.xxxx" failed
   Please check the logs:
   /usr/lib/live/mount/persistence/boot/NAME/rw/var/log
   Message is cleared on next reboot!
     
.. _cancelling_recovery:

*******************
Cancelling Recovery
*******************
Upon detecting a boot failure, you have the predefined timeout to cancel upgrade recovery. This is useful if you want to troubleshoot the faulty VyOS version on your own.

To cancel upgrade recovery, run the following command:

.. code-block:: none

   reboot cancel