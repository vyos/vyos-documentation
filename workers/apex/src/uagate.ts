export interface UaPolicy {
  allow: string[];
  log: string[];
  block: string[];
}

export type UaVerdict = "allow" | "block" | "log";

/**
 * The LONGEST entry in `list` occurring in the (already-lowercased) UA, lowercased, or null.
 * Longest rather than first-hit so the containment test in uaVerdict() compares against the
 * most specific entry a multi-token UA matched, not an arbitrary earlier one.
 */
function bestMatch(lowerUa: string, list: string[]): string | null {
  return list.reduce<string | null>((best, entry) => {
    const needle = entry.toLowerCase();
    if (!lowerUa.includes(needle)) return best;
    return best === null || needle.length > best.length ? needle : best;
  }, null);
}

export function uaVerdict(ua: string, policy: UaPolicy): UaVerdict {
  const lowerUa = ua.toLowerCase();
  // Explicit blocks take precedence — a request-controlled UA string that spoofs an
  // allow-listed substring (e.g. "Googlebot EvilScraper") must not be able to bypass a
  // block entry just by also matching the allow list.
  if (bestMatch(lowerUa, policy.block) !== null) return "block";

  const allow = bestMatch(lowerUa, policy.allow);
  const log = bestMatch(lowerUa, policy.log);

  // A log match WINS over a competing allow match. `log` is a telemetry verdict, not a
  // denial (the request is still served either way), so the cost of resolving a contest
  // the wrong way is asymmetric: choosing `allow` loses the ua-log event permanently,
  // while choosing `log` costs one log line. A UA presenting BOTH an allow token and a
  // log token (e.g. "GPTBot/1.0 DuckDuckBot") is exactly the shape worth recording.
  if (log === null) return "allow"; // includes the fail-open default for unknown UAs

  // ...unless the matched allow entry STRICTLY CONTAINS the matched log entry, which is
  // how the policy expresses a deliberate more-specific allow exception carved out of a
  // broader log entry. This is the mirror image of the Applebot case that the log-wins
  // rule above handles: Apple ships "Applebot" (search, allow) and "Applebot-Extended"
  // (AI training, log), where the LOG entry is the longer, more specific one — no
  // containment, so log wins and the AI crawler is recorded like every other one. Were a
  // vendor to ship the opposite shape (log "Foo", allow "Foo-Search"), the allow entry
  // contains the log entry and the more specific allow wins. Equality is not containment:
  // an entry listed in BOTH lists is a policy authoring error, and `log` is the safe
  // resolution. No entry pair in the shipped ua-policy.json currently takes this branch —
  // it exists so the two directions of the vendor-variant pattern stay expressible, since
  // the shipped policy already depends on one of them.
  if (allow !== null && allow !== log && allow.includes(log)) return "allow";

  return "log";
}
