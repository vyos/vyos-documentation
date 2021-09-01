.. _proxmox:

******************
Running on Proxmox
******************

Proxmox is an open-source platform for virtualization. Users with a support
subscription can download a qcow2 image that can be imported into Proxmox.

Deploy VyOS from CLI
====================


Copy the qcow2 image to a temporary directory on the Proxmox server.

The commands below assume that virtual machine ID 200 is unused and that
the user wants the disk stored in a storage pool called `local-lvm`.

.. code-block:: none

  $ qm create 200 --name vyos2 --memory 2048 --net0 virtio,bridge=vmbr0
  $ qm importdisk 200 vyos-1.2.8-proxmox-2G.qcow2 local-lvm
  $ qm set 200 --virtio0 local-lvm:vm-200-disk-0
  $ qm set 200 --boot order=virtio0 

Optionally, the user can attach a CDROM with an ISO as a cloud-init data
source. The below command assumes the ISO has been uploaded to the
`local` storage pool with the name `seed.iso`.

.. code-block:: none

  $ qm set 101 --ide2 media=cdrom,file=local:iso/seed.iso

Start the virtual machine in the proxmox GUI or CLI using ``qm start 200``.

Visit https://www.proxmox.com/en/ for more information about the download
and installation of this hypervisor.

