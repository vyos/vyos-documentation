# BGP - Large Community List

VyOS provides policies commands exclusively for BGP traffic filtering and
manipulation: **large-community-list** is one of them.

## Configuration

### policy large-community-list

<div class="cfgcmd">

set policy large-community-list \<text\>

Create large-community-list policy identified by name \<text\>.

</div>

<div class="cfgcmd">

set policy large-community-list \<text\> description \<text\>

Set description for large-community-list policy.

</div>

<div class="cfgcmd">

set policy large-community-list \<text\> rule \<1-65535\> action
\<permit|deny\>

Set action to take on entries matching this rule.

</div>

<div class="cfgcmd">

set policy large-community-list \<text\> rule \<1-65535\> description
\<text\>

Set description for rule.

</div>

<div class="cfgcmd">

set policy large-community-list \<text\> rule \<1-65535\> regex
\<aa:nn:nn\>

Regular expression to match against a large community list.

</div>
