# BGP - AS Path Policy

VyOS provides policies commands exclusively for BGP traffic filtering and
manipulation: **as-path-list** is one of them.

## Configuration

### policy as-path-list

```{cfgcmd} set policy as-path-list \<text\>

Create as-path-policy identified by name `<text>`.
```
```{cfgcmd} set policy as-path-list \<text\> description \<text\>

Set description for as-path-list policy.
```
```{cfgcmd} set policy as-path-list \<text\> rule \<1-65535\> action \<permit|deny\>

Set action to take on entries matching this rule.
```
```{cfgcmd} set policy as-path-list \<text\> rule \<1-65535\> description \<text\>

Set description for rule.
```
```{cfgcmd} set policy as-path-list \<text\> rule \<1-65535\> regex \<text\>

Regular expression to match against an AS path.
```

FRR applies a POSIX extended
regular expression to the AS path represented as text. Patterns can match a
substring of the path; use `^` and `$` to anchor a match at the beginning or
end of the path.

Common operators include:

| Pattern | Meaning |
| --- | --- |
| `.` | Any single character. |
| `*` | Zero or more occurrences of the preceding character or group. |
| `+` | One or more occurrences of the preceding character or group. |
| `?` | Zero or one occurrence of the preceding character or group. |
| `[0-9]` | Any one digit from 0 through 9. |
| `(...)` | Group expressions. |
| `\|` | Alternation between expressions. |
| `^` / `$` | Beginning / end of the path text. |

The underscore (`_`) is a special AS-path boundary marker. It matches the
beginning or end of the path, a space, a comma, or an AS set or confederation
delimiter (`{`, `}`, `(`, or `)`). Use it to match an AS number as a complete
path element rather than as part of a longer number. For example:

| Expression | Matches |
| --- | --- |
| `_64512_` | AS 64512 as a complete path element anywhere in the path. |
| `^64512_` | A path that starts with AS 64512. |
| `_6449[0-9]_` | A complete path element from AS 64490 through AS 64499. |

These are regular-expression patterns, not ASN range notation: `[0-9]` matches
one digit, and a range such as `64490-64499` is not expanded automatically.
For the full syntax and additional examples, see the
[FRR BGP manual](https://docs.frrouting.org/en/latest/bgp.html).
