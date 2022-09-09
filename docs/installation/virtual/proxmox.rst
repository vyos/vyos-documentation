.. _proxmox:

******************
Running on Proxmox
******************

Proxmox is an open-source platform for virtualization. Please visit
https://vyos.io to see how to get a qcow2 image that can be imported
into Proxmox.

Deploy VyOS from CLI with qcow2 image
=====================================

1. Copy the qcow2 image to a temporary directory on the Proxmox server.
2. The commands below assume that virtual machine ID 200 is unused and that the user wants the disk stored in a storage pool called `local-lvm`.

.. code-block:: none

  $ qm create 200 --name vyos2 --memory 2048 --net0 virtio,bridge=vmbr0
  $ qm importdisk 200 /path/to/image/vyos-1.2.8-proxmox-2G.qcow2 local-lvm
  $ qm set 200 --virtio0 local-lvm:vm-200-disk-0
  $ qm set 200 --boot order=virtio0 

3. Optionally, the user can attach a CDROM with an ISO as a cloud-init data source. The below command assumes the ISO has been uploaded to the `local` storage pool with the name `seed.iso`.

.. code-block:: none

  $ qm set 200 --ide2 media=cdrom,file=local:iso/seed.iso

4. Start the virtual machine in the proxmox GUI or CLI using ``qm start 200``.



Deploy VyOS from CLI with rolling release ISO
=============================================

1. Download the rolling release iso from https://vyos.net/get/nightly-builds/. Non-subscribers can always get the LTS release by building it from source. Instructions can be found in the :ref:`build` section of this manual. VyOS source code repository is available https://github.com/vyos/vyos-build.
2. Prepare VM for installation from ISO media. The commands below assume that your iso is available in a storage pool 'local', that you want it to have a VM ID '200' and want to create a new disk on storage pool 'local-lvm' of size 15GB.

.. code-block:: none

  qm create 200 --name vyos --memory 2048 --net0 virtio,bridge=vmbr0 --ide2 media=cdrom,file=local:iso/live-image-amd64.hybrid.iso --virtio0 local-lvm:15

3. Start the VM using the command ``qm start 200`` or using the start button located in the proxmox GUI.
4. Using the proxmox webGUI, open the virtual console for your newly created vm. Login username/password is ``vyos/vyos``.
5. Once booted into the live system, type ``install image`` into the command line and follow the prompts to install VyOS to the virtual drive. 
6. After installation has completed, remove the installation iso using the GUI or ``qm set 200 --ide2 none``.
7. Reboot the virtual machine using the GUI or ``qm reboot 200``.





Visit https://www.proxmox.com/en/ for more information about the download
and installation of this hypervisor.

