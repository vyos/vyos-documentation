# BGP - Extended Community List

VyOS provides policies commands exclusively for BGP traffic filtering and
manipulation: **extcommunity-list** is one of them.

## Configuration

### policy extcommunity-list

```{eval-rst}
.. cfgcmd:: set policy extcommunity-list <text>

   Creat extcommunity-list policy identified by name <text>.
```

```{eval-rst}
.. cfgcmd:: set policy extcommunity-list <text> description <text>

   Set description for extcommunity-list policy.
```

```{eval-rst}
.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> action
   <permit|deny>

   Set action to take on entries matching this rule.
```

```{eval-rst}
.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> description
   <text>

   Set description for rule.
```

```{eval-rst}
.. cfgcmd:: set policy extcommunity-list <text> rule <1-65535> regex <text>

   Regular expression to match against an extended community list, where text
   could be:

   * <aa:nn:nn>: Extended community list regular expression.
   * <rt aa:nn:nn>: Route Target regular expression.
   * <soo aa:nn:nn>: Site of Origin regular expression.
```
