.. _libvirt:

***************************
Running on Libvirt Qemu/KVM
***************************

Libvirt is an open-source API, daemon and management tool for managing platform
virtualization. There are several ways to deploy VyOS on libvirt kvm.
Use Virt-manager and native CLI. In an example we will be use use 4 gigabytes
of memory, 2 cores CPU and default network virbr0.

CLI
===

Deploy from ISO
---------------

Create VM name ``vyos_r1``. You must specify the path to the ``ISO`` image,
the disk ``qcow2`` will be created automatically. The ``default`` network is
the virtual network (type Virtio) created by the hypervisor with NAT.

.. code-block:: none

  $ virt-install -n vyos_r1 \
    --ram 4096 \
    --vcpus 2 \
    --cdrom /var/lib/libvirt/images/vyos.iso \
    --os-type linux \
    --os-variant debian10 \
    --network network=default \
    --graphics vnc \
    --hvm \
    --virt-type kvm \
    --disk path=/var/lib/libvirt/images/vyos_r1.qcow2,bus=virtio,size=8 \
    --noautoconsole

Connect to VM  with command ``virsh console vyos_r1``

.. code-block:: none

  $ virsh console vyos_r1

  Connected to domain vyos_r1
  Escape character is ^]

  vyos login: vyos
  Password:

  vyos@vyos:~$ install image

After installation - exit from the console using the key combination
``Ctrl + ]`` and reboot the system.

Deploy from qcow2
-----------------
The convenience of using :abbr:`KVM (Kernel-based Virtual Machine)`
images is that they don't need to be installed.
Download predefined VyOS.qcow2 image for ``KVM``

.. code-block:: none

  curl --url link_to_vyos_kvm.qcow2 --output /var/lib/libvirt/images/vyos_kvm.qcow2

Create VM with ``import`` qcow2 disk option.

.. code-block:: none

  $ virt-install -n vyos_r2 \
     --ram 4096 \
     --vcpus 2 \
     --os-type linux \
     --os-variant debian10 \
     --network network=default \
     --graphics vnc \
     --hvm \
     --virt-type kvm \
     --disk path=/var/lib/libvirt/images/vyos_kvm.qcow2,bus=virtio \
     --import \
     --noautoconsole

Connect to VM  with command ``virsh console vyos_r2``

.. code-block:: none

  $ virsh console vyos_r2

  Connected to domain vyos_r2
  Escape character is ^]

  vyos login: vyos
  Password:

  vyos@vyos:~$

The system is fully operational.

Virt-manager
============
The virt-manager application is a desktop user interface for managing virtual
machines through libvirt. On the linux open
:abbr:`VMM (Virtual Machine Manager)`.

.. _libvirt:virt-manager_iso:

Deploy from ISO
---------------

1. Open :abbr:`VMM (Virtual Machine Manager)` and Create a new
   :abbr:`VM (Virtual Machine)`

2. Choose ``Local install media`` (ISO)

.. figure:: /_static/images/virt-libvirt-01.png

3. Choose path to iso vyos.iso. Operating System can be any Debian based.

.. figure:: /_static/images/virt-libvirt-02.png

4. Choose Memory and CPU

.. figure:: /_static/images/virt-libvirt-03.png

5. Disk size

.. figure:: /_static/images/virt-libvirt-04.png

6. Name of VM and network selection

.. figure:: /_static/images/virt-libvirt-05.png

7. Then you will be taken to the console.

.. figure:: /_static/images/virt-libvirt-06.png

.. _libvirt:virt-manager_qcow2:

Deploy from qcow2
-----------------

Download predefined VyOS.qcow2 image for ``KVM``

.. code-block:: none

  curl --url link_to_vyos_kvm.qcow2 --output /var/lib/libvirt/images/vyos_kvm.qcow2


1. Open :abbr:`VMM (Virtual Machine Manager)` and Create a new
   :abbr:`VM (Virtual Machine)`

2. Choose ``Import existing disk`` image

.. figure:: /_static/images/virt-libvirt-qc-01.png

3. Choose the path to the image ``vyos_kvm.qcow2`` that was previously
   downloaded . Operation System can be any Debian based.

.. figure:: /_static/images/virt-libvirt-qc-02.png

4. Choose Memory and CPU

.. figure:: /_static/images/virt-libvirt-03.png

5. Name of VM and network selection

.. figure:: /_static/images/virt-libvirt-05.png

6. Then you will be taken to the console.

.. figure:: /_static/images/virt-libvirt-qc-03.png



