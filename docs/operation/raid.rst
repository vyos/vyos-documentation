.. _raid:

######
RAID-1 
######

A Redundant Array of Independent Disks (RAID) uses two or more hard disk drives 
to improve disk speed, store more data, and/or provide fault tolerance. 
There are several storage schemes possible in a RAID array, each offering a 
different combination of storage, reliability, and/or performance. 
The VyOS system supports a “RAID 1” deployment. RAID 1 allows two or more 
disks to mirror one another to provide system fault tolerance. In a RAID 1 
solution, every sector of one disk is duplicated onto every sector of all 
disks in the array. Provided even one disk in the RAID 1 set is operational, 
the system continues to run, even through disk replacement (provided that the 
hardware supports in-service replacement of drives). 
RAID 1 can be implemented using special hardware or it can be implemented in 
software. The VyOS system supports software RAID 1 on two disks.
The VyOS implementation of RAID 1 allows the following:

* Detection and reporting of disk failure
* The ability to maintain system operation with one failed disk
* The ability to boot the system with one failed disk
* The ability to replace a failed disk and initiate re-mirroring
* The ability to monitor the status of remirroring

.. _raid_instalation:

Installation Implications
=========================

The VyOS systems installation utility provides several options for installing 
to a RAID 1 set. You can: 

* Use the install system to create the RAID 1 set 
* Use the underlying Linux commands to create a RAID 1 set before running the 
  install system command.
* Use a previously-created RAID 1 set.

.. note:: Before a permanent installation, VyOS runs a live installation

Configuration
=============

Single disk, install as normal 
------------------------------

When the VyOS system is installed, it automatically detects the presence of two 
disks not currently part of a RAID array. In these cases, the VyOS 
installation utility automatically offers you the option of configuring RAID 1 
mirroring for the drives, with the following prompt.

.. code-block:: none

   Would you like to configure RAID 1 mirroring on them?

* If you do not want to configure RAID 1 mirroring, enter “No” at the prompt
  and continue with installation in the normal way.

Empty 2+ Disk 
-------------

If VyOS system detect two identical disks that are not currently part of a 
RAID-1 set, the VyOS installation utility automatically offers you the option
of configuring RAID 1 mirroring for the drives, with the following prompt. 

.. code-block:: none

   Would you like to configure RAID 1 mirroring on them? 

1 - To create a new RAID 1 array, enter “Yes” at the prompt. If the system 
detects a filesystem on the partitions being used for RAID 1 it will prompt you 
to indicate whether you want to continue creating the RAID 1 array. 

.. code-block:: none

   Continue creating array?

2 - To overwrite the old filesystem, enter “Yes”. 

3 - The system informs you that all data on both drives will be erased. You are 
prompted to confirm that you want to continue

.. code-block:: none

   Are you sure you want to do this?

4 - Enter “Yes” at the prompt to retain the current VyOS configuration once 
installation is complete. Enter “No” to delete the current VyOS
configuration. 

.. code-block:: none

   Would you like me to save the data on it before I delete it?

5 - Enter “Yes” at the prompt to retain the current VyOS configuration once 
installation is complete. Enter “No” to delete the current VyOS configuration.

6 - Continue with installation in the normal way.


Present RAID-1
--------------

When the VyOS software on a system with a RAID 1 set already configured, 
the installation utility will detect the array and will display the following 
prompt: 

.. code-block:: none

   Would you like to use this one? 

1 - To break apart the current RAID 1 set, enter “No” at the prompt. The 

installation utility detects that there are two identical disks and offers you 
the option of configuring RAID 1 mirroring on them, displaying the following 
prompt: 

.. code-block:: none

   Would you like to configure RAID 1 mirroring on them? 

2 - To decline to set up a new RAID 1 configuration on the disks, enter “No” 
at the prompt. The system prompts you to indicate which partition you would 
like the system installed on. 

.. code-block:: none
   
    Which partition should I install the root on? [sda1]: 

3 - Enter the partition where you would like the system installed. The system 
then prompts you to indicate whether you want to save the old configuration
data. This represents the current VyOS configuration. 

.. code-block:: none

   Would you like me to save the data on it before I delete it? 

4 - Enter “Yes” at the prompt to retain the current VyOS configuration once 
installation is complete. Enter “No” to delete the current VyOS configuration. 

5 - Continue with installation in the normal way.


Detecting and Replacing a Failed RAID 1 Disk
--------------------------------------------

The VyOS system automatically detects a disk failure within a RAID 1 set and 
reports it to the system console. You can verify the failure by issuing the
show raid command.

To replace a bad disk within a RAID 1 set, perform the following steps:

1 - Remove the failed disk from the RAID 1 set by issuing the following 
command:

.. opcmd:: delete raid <RAID‐1‐device> member <disk‐partition>

   where RAID-1-device is the name of the RAID 1 device (for example, md0) and 
   disk-partition is the name of the failed disk partition (for example, sdb2).

2- Physically remove the failed disk from the system. If the drives are not 
hot-swappable, then you must shut down the system before removing the disk.

3 - Replace the failed drive with a drive of the same size or larger.

4 - Format the new disk for RAID 1 by issuing the following command:

.. opcmd:: format disk <disk‐device1> like <disk‐device2>

   where disk-device1 is the replacement disk (for example, sdb) and 
   disk-device2 is the existing healthy disk (for example, sda).

5-Add the replacement disk to the RAID 1 set by issuing the following command:

.. opcmd:: add raid <RAID‐1‐device> member <disk‐partition>

   where RAID-1-device is the name of the RAID 1 device (for example, md0) and 
   disk-partition is the name of the replacement disk partition 
   (for example, sdb2).

Operation
=========

This part introduces how to add a disk partition to a RAID-1 set initiates
mirror synchronization, check and display information.

.. opcmd:: add raid <RAID‐1‐device> member <disk‐partition>
 
   Use this command to add a member disk partition to the RAID 1 set. Adding a 
   disk partition to a RAID 1 set initiates mirror synchronization, where all 
   data on the existing member partition is copied to the new partition.

.. opcmd:: format disk <disk‐device1> like <disk‐device2>

   This command is typically used to prepare a disk to be added to a preexisting
   RAID 1 set (of which disk-device2 is already a member).

.. opcmd:: show raid <RAID‐1‐device>
   
   shows output for show raid md0 as sdb1 is being added to the RAID 1 
   set and is in the process of being resynchronized.

   .. code-block:: none

      vyos@vyos:~$ show raid md0
      /dev/md0:
            Version : 00.90
      Creation Time : Wed Oct 29 09:19:09 2008
         Raid Level : raid1
         Array Size : 1044800 (1020.48 MiB 1069.88 MB)
      Used Dev Size : 1044800 (1020.48 MiB 1069.88 MB)
       Raid Devices : 2
      Total Devices : 2
      Preferred Minor : 0
        Persistence : Superblock is persistent
        Update Time : Wed Oct 29 19:34:23 2008
              State : active, degraded, recovering
      Active Devices : 1
      Working Devices : 2
      Failed Devices : 0
      Spare Devices : 1
      Rebuild Status : 17% complete
               UUID : 981abd77:9f8c8dd8:fdbf4de4:3436c70f
             Events : 0.103
        Number   Major   Minor   RaidDevice State
           0       8        1        0      active sync   /dev/sda1
           2       8       17        1      spare rebuilding   /dev/sdb1

.. opcmd:: show raid <RAID‐1‐device>
   
   Use this command to display the formatting of a hard disk.

   .. code-block:: none

      vyos@vyos:~$ show disk sda format
      Disk /dev/sda: 1073 MB, 1073741824 bytes
      85 heads, 9 sectors/track, 2741 cylinders
      Units = cylinders of 765 * 512 = 391680 bytes
      Disk identifier: 0x000b7179   
       Device Boot      Start         End      Blocks   Id  System
      /dev/sda1               6        2737     1044922+  fd  Linux raid autodetect

      

