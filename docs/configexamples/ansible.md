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


## The simple way without configuring the hostname (one task for all routers):

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

## Backups with the vyos.blueprints collection

Regular configuration backups of many routers are a common task. Instead of
writing the playbook yourself, you can use the ready-made, tested roles of the
[vyos.blueprints](https://github.com/vyos/vyos.blueprints) collection. They
work with the inventory and variables created above.

```{note}
vyos.blueprints and the vyos.vyos collection it builds on need **ansible-core
2.16 or newer**. The Ansible packages of older Debian releases are too old;
install a current version with pip, for example in a virtual environment,
together with `ansible-pylibssh`, the SSH library Ansible uses for network
devices:

    python3 -m venv /root/ansible-venv
    . /root/ansible-venv/bin/activate
    pip install ansible-core ansible-pylibssh
```

Install the collection on the Ansible control node. Until its first release is
published on Ansible Galaxy, install it from GitHub:

```none
# ansible-galaxy collection install git+https://github.com/vyos/vyos.blueprints.git
```

Back up every router of the inventory with one command, run from `/root`:

```none
# ansible-playbook vyos.blueprints.backup -i hosts
```

For each router, this creates three files with the same timestamp in
`/root/backups/<router>/`:

- `<router>_<timestamp>.cfg`: the configuration as shown by `show
  configuration`; this is the file to restore from
- `<router>_<timestamp>.set`: the same configuration as `set` commands, for
  reading and comparing
- `<router>_<timestamp>.json`: the VyOS version, model and serial number of
  the router

The newest 10 backups per router are kept; older ones are removed. To change
the location or the number of backups kept:

```none
# ansible-playbook vyos.blueprints.backup -i hosts -e backup_root=/srv/vyos-backups -e backup_keep=30
```

To back up only some routers, name a group or a host of the inventory:

```none
# ansible-playbook vyos.blueprints.backup -i hosts -e vyos_backup_hosts=vyos9
```

```{note}
Backups contain password hashes and keys. The files are created readable only
by their owner; keep the backup directory protected as well.
```

## Upgrades with the vyos.blueprints collection

The same collection upgrades routers to a new VyOS image, one router at a
time:

```none
# ansible-playbook vyos.blueprints.upgrade -i hosts \
    -e upgrade_image_url=https://example.com/vyos-1.5.1-generic-amd64.iso \
    -e upgrade_expected_version=1.5.1
```

Replace the URL with the location of your VyOS ISO image, and keep the image's
signature file (`.minisig`) next to it: the signature is checked with the keys
VyOS ships before anything is installed, and the upgrade stops if it is missing
or not valid. To install an image without a signature anyway, add
`-e upgrade_allow_unsigned=true`. Each router downloads the image itself and
needs about 1 GB of free disk space for it.

For each router, one at a time, the playbook:

1. skips the router if it already runs the expected version
2. backs up its configuration, as described above
3. downloads the image and checks its signature
4. installs the new image and makes it the default boot image
5. reboots the router and waits until it is back
6. checks that it runs the new version

If a router fails at any step, the upgrade stops before the next router is
touched, so a bad image never reaches the whole network. Because routers that
are already upgraded are skipped, run the same command again after fixing the
problem.

To upgrade only some routers, add `-e vyos_upgrade_hosts=<group or host>`.

```{note}
Try the upgrade on a lab router, or a single router of the network, before
running it on many: a new VyOS image can change behaviour, and the playbook
upgrades one router after the other.
```

In the next chapter of the example, we'll use Ansible with jinja2
templates and variables.
