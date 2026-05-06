# Prefix List Policy

Prefix lists provides the most powerful prefix based filtering mechanism. In
addition to access-list functionality, ip prefix-list has prefix length range
specification.

If no ip prefix list is specified, it acts as permit. If ip prefix list is
defined, and no match is found, default deny is applied.

Prefix filtering can be done using prefix-list and prefix-list6.

## Configuration

### Prefix Lists

```{eval-rst}
.. cfgcmd:: set policy prefix-list <text>

   This command creates the new prefix-list policy, identified by <text>.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list <text> description <text>

   Set description for the prefix-list policy.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list <text> rule <1-65535> action <permit|deny>

   This command creates a new rule in the prefix-list and defines an action.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list <text> rule <1-65535> description <text>

   Set description for rule in the prefix-list.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list <text> rule <1-65535> prefix <x.x.x.x/x>

   Prefix to match against.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list <text> rule <1-65535> ge <0-32>

   Netmask greater than length.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list <text> rule <1-65535> le <0-32>

   Netmask less than length
```

### Example: Prefix Lists

This example creates an IPv4 prefix-list named PL4-EXAMPLE-NAME, defines 3
rules each with 1 prefix, and matches le (less than/equal to) /32.

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 10 action 'permit'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 10 le '32'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 10 prefix '192.0.2.0/24'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 20 action 'permit'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 20 le '32'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 20 prefix '198.51.100.0/24'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 30 action 'permit'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 30 le '32'
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list PL4-EXAMPLE-NAME rule 30 prefix '203.0.113.0/24'
```

### IPv6 Prefix Lists

```{eval-rst}
.. cfgcmd:: set policy prefix-list6 <text>

   This command creates the new IPv6 prefix-list policy, identified by <text>.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list6 <text> description <text>

   Set description for the IPv6 prefix-list policy.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> action <permit|deny>

   This command creates a new rule in the IPv6 prefix-list and defines an
   action.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> description <text>

   Set description for rule in IPv6 prefix-list.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> prefix
   <h:h:h:h:h:h:h:h/x>

   IPv6 prefix.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> ge <0-128>

   Netmask greater than length.
```

```{eval-rst}
.. cfgcmd:: set policy prefix-list6 <text> rule <1-65535> le <0-128>

   Netmask less than length
```
