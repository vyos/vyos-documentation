:lastproofread: 2026-02-02

.. _proxmox:

******************
Running on Proxmox
******************

Proxmox is an open-source platform for virtualization.

Deploy VyOS from CLI with qcow2 image
=====================================

1. Download the ``.qcow2`` image from https://support.vyos.io/. 
   Official ``.qcow2`` images are available from the support portal 
   for users with a valid subscription.

2. Copy the ``.qcow2`` image to a temporary directory on the Proxmox server.

3. The commands assume virtual machine ID `200` is unused and you want
   the disk stored in a storage pool named `local-lvm`.


    .. code-block:: none

      $ qm create 200 --name vyos --memory 4096 --net0 virtio,bridge=vmbr0
      $ qm importdisk 200 /var/lib/vz/images/vyos-<version>-proxmox-amd64.qcow2 local-lvm
      $ qm set 200 --virtio0 local-lvm:vm-200-disk-0
      $ qm set 200 --boot order=virtio0 


4. When using a ``.qcow2`` image, default login credentials are not included.
   A user account must be defined using Cloud-Init before the first boot. 
   Without this configuration, login access is not possible.
   
   Attach a Cloud-Init data source to the VM (e.g, using 
   `local-lvm` storage):

    .. code-block:: none

      $ qm set 200 --ide2 local-lvm:cloudinit


   For a complete Cloud-init configuration example in Proxmox,
   refer to 

5. Start the virtual machine using the Proxmox GUI or run ``qm start 200``.



Deploy VyOS from CLI with rolling release ISO
=============================================

1. Download the rolling release ISO from
   https://vyos.net/get/nightly-builds/.
2. Prepare the VM for ISO installation.
   The commands below assume that the ISO image is available in the
   `local` storage, a VM ID `200` is unused, and a 15GB disk will be
   created on storage pool `local-lvm`.

.. code-block:: none

  qm create 200 --name vyos --memory 4096 \
  --net0 virtio,bridge=vmbr0 \
  --scsihw virtio-scsi-pci \
  --scsi0 local-lvm:15 \
  --ide2 local:iso/vyos-<version>.iso,media=cdrom \
  --boot order=ide2

3. Start the VM using ``qm start 200`` or using the start button in the
   Proxmox GUI.
4. Open the virtual console for your VM using the Proxmox web GUI.
   Login username and password are both ``vyos``.
5. Once booted into the live system, type ``install image`` and follow
   the prompts to install VyOS to the virtual drive. 
6. After installation completes, remove the installation ISO using the
   GUI or run ``qm set 200 --ide2 none``, then set the boot device with ``qm set 200 --boot order=scsi0``.
7. Reboot the virtual machine using the GUI or run ``qm reboot 200``.





For more information about downloading and installing Proxmox, visit
https://www.proxmox.com/en/.

