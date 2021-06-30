.. _vyosonvmware:

Running on VMware ESXi
######################

ESXi 5.5 or later
*****************

.ova files are available for supporting users, and a VyOS can also be stood up
using a generic Linux instance, and attaching the bootable ISO file and
installing from the ISO using the normal process around `install image`.

.. NOTE:: There have been previous documented issues with GRE/IPSEC tunneling
   using the E1000 adapter on the VyOS guest, and use of the VMXNET3 has been
   advised.

Memory Contention Considerations
--------------------------------
When the underlying ESXi host is approaching ~92% memory utilisation it will
start the balloon process in  a 'soft' state to start reclaiming memory from
guest operating systems. This causes an artificial pressure using the vmmemctl
driver on memory usage on the virtual guest. As VyOS by default does not have
a swap file, this vmmemctl pressure is unable to force processes to move in
memory data to the paging file, and blindly consumes memory forcing the
virtual guest into a low memory state with no way to escape. The balloon
can expand to 65% of guest allocated memory, so a VyOS guest running >35% of
memory usage, can encounter an out of memory situation, and trigger the kernel
oom_kill process. At this point a weighted lottery favouring memory hungry
processes will be run with the unlucky winner being terminated by the kernel.

It is advised that VyOS routers are configured in a resource group with
adequate memory reservations so that ballooning is not inflicted on
virtual VyOS guests.





References
----------

.. stop_vyoslinter

https://muralidba.blogspot.com/2018/03/how-does-linux-out-of-memory-oom-killer.html

.. start_vyoslinter
