# BGP - AS Path Policy

VyOS provides policies commands exclusively for BGP traffic filtering and
manipulation: **as-path-list** is one of them.

## Configuration

### policy as-path-list

```{eval-rst}
.. cfgcmd:: set policy as-path-list <text>

   Create as-path-policy identified by name <text>.
```

```{eval-rst}
.. cfgcmd:: set policy as-path-list <text> description <text>

   Set description for as-path-list policy.
```

```{eval-rst}
.. cfgcmd:: set policy as-path-list <text> rule <1-65535> action <permit|deny>

   Set action to take on entries matching this rule.
```

```{eval-rst}
.. cfgcmd:: set policy as-path-list <text> rule <1-65535> description <text>

   Set description for rule.
```

```{eval-rst}
.. cfgcmd:: set policy as-path-list <text> rule <1-65535> regex <text>

   Regular expression to match against an AS path. For example "64501 64502".
```
