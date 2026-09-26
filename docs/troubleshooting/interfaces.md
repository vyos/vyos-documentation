# Interface Names

Interface names no longer follow the MAC address of a network card. A name is
bound to the slot the hardware sits in, so the situations which used to rename
interfaces do not any more:

- Migrating a VM to a different host, where the hypervisor hands out new MAC
  addresses, keeps the interface names.
- Cloning a VM, for example in GNS3, keeps the interface names.
- Replacing a failed network card with a new one in the same slot keeps the
  name and the configuration of that interface.

An interface whose card is removed keeps its name reserved, so a card added
later can never take over the name — and with it the addresses — of the
interface which went away.

See {ref}`interface-naming` for how names are assigned, and for the procedure
to rename an interface.

If an interface really is missing after a reboot, check which names were
resolved for this boot:

```none
cat /run/vyos-net-name-resolve.json
```

An interface listed under `missing` has a name reserved in the mapping file,
but its hardware did not appear. That points at the card, its driver or the
slot it is plugged into, rather than at the naming.
