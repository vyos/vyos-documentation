# BGP - Community List

VyOS provides policies commands exclusively for BGP traffic filtering and
manipulation: **community-list** is one of them.

## Configuration

### policy community-list

```{eval-rst}
.. cfgcmd:: set policy community-list <text>

   Creat community-list policy identified by name <text>.
```

```{eval-rst}
.. cfgcmd:: set policy community-list <text> description <text>

   Set description for community-list policy.
```

```{eval-rst}
.. cfgcmd:: set policy community-list <text> rule <1-65535> action
   <permit|deny>

   Set action to take on entries matching this rule.
```

```{eval-rst}
.. cfgcmd:: set policy community-list <text> rule <1-65535> description <text>

   Set description for rule.
```

```{eval-rst}
.. cfgcmd:: set policy community-list <text> rule <1-65535> regex
   <aa:nn|local-AS|no-advertise|no-export|internet|additive>

   Regular expression to match against a community-list.
```
