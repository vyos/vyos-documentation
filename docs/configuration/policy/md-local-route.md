# Local Route Policy

Policies for local traffic are defined in this section.

## Configuration

### Local Route IPv4

```{eval-rst}
.. cfgcmd:: set policy local-route rule <1-32765> set table <1-200|main>

   Set routing table to forward packet to.
```

```{eval-rst}
.. cfgcmd:: set policy local-route rule <1-32765> source <x.x.x.x|x.x.x.x/x>

   Set source address or prefix to match.
```

```{eval-rst}
.. cfgcmd:: set policy local-route rule <1-32765> destination <x.x.x.x|x.x.x.x/x>

   Set destination address or prefix to match.
```

```{eval-rst}
.. cfgcmd:: set policy local-route rule <1-32765> inbound-interface <interface>

   Set inbound interface to match.
```

### Local Route IPv6

```{eval-rst}
.. cfgcmd:: set policy local-route6 rule <1-32765> set table <1-200|main>

   Set routing table to forward packet to.
```

```{eval-rst}
.. cfgcmd:: set policy local-route6 rule <1-32765> source <h:h:h:h:h:h:h:h | h:h:h:h:h:h:h:h/x>

   Set source address or prefix to match.
```

```{eval-rst}
.. cfgcmd:: set policy local-route6 rule <1-32765> destination <h:h:h:h:h:h:h:h | h:h:h:h:h:h:h:h/x>

   Set destination address or prefix to match.
```

```{eval-rst}
.. cfgcmd:: set policy local-route6 rule <1-32765> inbound-interface <interface>

   Set inbound interface to match.
```
