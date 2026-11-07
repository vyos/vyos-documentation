#!/usr/bin/env bash
# resolve_vyos_xml.sh -- curl + a small loop, no Python, no git clone.
# Usage: ./resolve_vyos_xml.sh vpn_ipsec [branch]
set -euo pipefail
name="${1:?usage: resolve_vyos_xml.sh <definition-name> [branch]}"
branch="${2:-rolling}"
base="https://raw.githubusercontent.com/vyos/vyos-1x/${branch}/interface-definitions"
content="$(curl -fsSL "${base}/${name}.xml.in")"
while grep -qE '^[[:space:]]*#include <.+>[[:space:]]*$' <<< "$content"; do
  content="$(
    while IFS= read -r line || [[ -n "$line" ]]; do
      if [[ "$line" =~ ^[[:space:]]*#include\ \<(.+)\>[[:space:]]*$ ]]; then
        curl -fsSL "${base}/${BASH_REMATCH[1]}"
      else
        printf '%s\n' "$line"
      fi
    done <<< "$content"
  )"
done
printf '%s\n' "$content"
