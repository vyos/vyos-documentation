---
lastproofread: '2024-04-09'
---

(examples-ansible)=

# Ansible example

## Setting up Ansible on a server running the Debian operating system.

In this example, we will set up a simple use of Ansible to configure
multiple VyOS routers.
We have four pre-configured routers with this configuration:

Using the general schema for example:

```{image} /_static/images/ansible.webp
:align: center
:alt: Network Topology Diagram
:width: 80%
```

We have four pre-configured routers with this configuration:

```none
set interfaces ethernet eth0 address dhcp
set service ssh
commit
save
```

- vyos7 - 192.0.2.105
- vyos8 - 192.0.2.106
- vyos9 - 192.0.2.107
- vyos10 - 192.0.2.108

## Install Ansible:

```none
# apt-get install ansible
Do you want to continue? [Y/n] y
```


## Install Paramiko:

```none
#apt-get install -y python3-paramiko
```


## Check the version:

```none
# ansible --version
ansible 2.10.8
config file = None
configured module search path = ['/root/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
ansible python module location = /usr/lib/python3/dist-packages/ansible
executable location = /usr/bin/ansible
python version = 3.9.2 (default, Feb 28 2021, 17:03:44) [GCC 10.2.1 20210110]
```


## Basic configuration of ansible.cfg:

```none
# nano /root/ansible.cfg
[defaults]
host_key_checking = no
```


## Add all the VyOS hosts:

```none
# nano /root/hosts
[vyos_hosts]
vyos7 ansible_ssh_host=192.0.2.105
vyos8 ansible_ssh_host=192.0.2.106
vyos9 ansible_ssh_host=192.0.2.107
vyos10 ansible_ssh_host=192.0.2.108
```


## Add general variables:

```none
# mkdir /root/group_vars/
# nano /root/group_vars/vyos_hosts
ansible_python_interpreter: /usr/bin/python3
ansible_network_os: vyos
ansible_connection: network_cli
ansible_user: vyos
ansible_ssh_pass: vyos
```


## Add a simple playbook with the tasks for each router:

```none
# nano /root/main.yml

---
- hosts: vyos_hosts
  gather_facts: 'no'
  tasks:
    - name: Configure general settings for the vyos hosts group
      vyos_config:
        lines:
        - set system name-server 192.0.2.1
        - set interfaces ethernet eth0 description '#WAN#'
        - set interfaces ethernet eth1 description '#LAN#'
        - set interfaces ethernet eth2 disable
        - set interfaces ethernet eth3 disable
        - set system host-name {{ inventory_hostname }}
        save: true
```


## Start the playbook:

```none
ansible-playbook -i hosts main.yml
PLAY [vyos_hosts] **************************************************************

TASK [Configure general settings for the vyos hosts group] *********************
ok: [vyos9]
ok: [vyos10]
ok: [vyos7]
ok: [vyos8]

PLAY RECAP *********************************************************************
vyos10                     : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vyos7                      : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vyos8                      : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vyos9                      : ok=2    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```


## Check the result on the vyos10 router:

```none
vyos@vyos10:~$ show interfaces
Codes: S - State, L - Link, u - Up, D - Down, A - Admin Down
Interface        IP Address                        S/L  Description
---------        ----------                        ---  -----------
eth0             192.0.2.108/24                    u/u  WAN
eth1             -                                 u/u  LAN
eth2             -                                 A/D
eth3             -                                 A/D
lo               127.0.0.1/8                       u/u
                ::1/128

vyos@vyos10:~$ sh configuration commands | grep 192.0.2.1
set system name-server '192.0.2.1'
```


## The simple way without configuration of the hostname (one task for all routers):

```none
# nano /root/hosts_v2
[vyos_hosts_group]
vyos7 ansible_ssh_host=192.0.2.105
vyos8 ansible_ssh_host=192.0.2.106
vyos9 ansible_ssh_host=192.0.2.107
vyos10 ansible_ssh_host=192.0.2.108
[vyos_hosts_group:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_user=vyos
ansible_ssh_pass=vyos
ansible_network_os=vyos
ansible_connection=network_cli

# nano /root/main_v2.yml
---
- hosts: vyos_hosts_group
  connection: network_cli
  gather_facts: 'no'
  tasks:
    - name: Configure remote vyos_hosts_group
      vyos_config:
        lines:
        - set system name-server 192.0.2.1
        - set interfaces ethernet eth0 description WAN
        - set interfaces ethernet eth1 description LAN
        - set interfaces ethernet eth2 disable
        - set interfaces ethernet eth3 disable
        save: true
```

```none
# ansible-playbook -i hosts_v2 main_v2.yml

PLAY [vyos_hosts_group] ********************************************************

TASK [Configure remote vyos_hosts_group] ***************************************
ok: [vyos8]
ok: [vyos7]
ok: [vyos9]
ok: [vyos10]

PLAY RECAP *********************************************************************
vyos10                     : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vyos7                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vyos8                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
vyos9                      : ok=1    changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

## Example for backup of the device configuration

```none
---
# Playbook: Backup VyOS router configuration
- name: BackUp lab router's config
  hosts: all

  tasks:
  # Gather device facts before backing up
  - name: Collect facts
    vyos.vyos.vyos_facts:
      gather_subset: all

  # Create a per-host backup folder on the Ansible control node
  - name: Create backup dir
    file:
      path: "/home/debian/ansible_quickstart/inventory/backup/{{ inventory_hostname }}"
      state: directory
      recurse: yes
    delegate_to: localhost

  # Save a timestamped copy of the running config to the control node
  - name: Backup
    vyos.vyos.vyos_config:
      backup: yes
      backup_options:
        dir_path: "/home/debian/ansible_quickstart/inventory/backup/{{ inventory_hostname }}"
```

## Example for upgrading devices

```none
---
# Playbook: Upgrade VyOS system image
- name: Testing all the modules
  hosts: all
  gather_facts: false
  tasks:

    # List currently installed system images on the device
    - name: Grab system images
      vyos.vyos.vyos_command:
        commands:
          - command: "show system image"
      register: system_images
      vars:
        ansible_command_timeout: 60
        ansible_connection: ansible.netcommon.network_cli

    # Remove any leftover mount/install directory from a previous attempt
    - name: Clean up stale VyOS image install dirs
      vyos.vyos.vyos_command:
        commands:
          - command: |
              TERM=dumb && \
              umount /mnt/installation/iso_src 2>/dev/null || true
              rm -rf /mnt/installation/iso_src
      vars:
        ansible_command_timeout: 30

    # Download the new VyOS ISO directly onto the device (requires internet access)
    - name: Download VyOS image install dirs
      vyos.vyos.vyos_command:
        commands:
          - command: |
              cd /tmp && \
              wget https://releases.io/downloads/1.5.0/vyos-1.5.0-kvm-amd64.qcow2
      vars:
        ansible_command_timeout: 300

    # Install the downloaded image; "yes ''" auto-answers any interactive prompts
    - name: Install the downloaded VyOS image (non-interactive)
      vyos.vyos.vyos_command:
        commands:
          - "yes '' | add system image /tmp/vyos-1.5.0-kvm-amd64.iso"
      register: install_result
```
