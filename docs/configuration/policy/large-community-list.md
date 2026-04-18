# BGP - Large Community List

VyOS provides policies commands exclusively for BGP traffic filtering and
manipulation: **large-community-list** is one of them.

## Configuration

### policy large-community-list

```{eval-rst}
.. cfgcmd:: set policy large-community-list <text>

   Create large-community-list policy identified by name <text>.
```

```{eval-rst}
.. cfgcmd:: set policy large-community-list <text> description <text>

   Set description for large-community-list policy.
```

```{eval-rst}
.. cfgcmd:: set policy large-community-list <text> rule <1-65535> action
   <permit|deny>

   Set action to take on entries matching this rule.
```

```{eval-rst}
.. cfgcmd:: set policy large-community-list <text> rule <1-65535> description
   <text>

   Set description for rule.
```

```{eval-rst}
.. cfgcmd:: set policy large-community-list <text> rule <1-65535> regex
   <aa:nn:nn>

   Regular expression to match against a large community list.
```
